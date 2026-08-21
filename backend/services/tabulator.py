"""Instant-runoff (RCV) tabulation with correct termination, plus final
standings and a sankey (round-by-round flow) view for the results UI.

Termination (the important part): a ballot counts toward its first *continuing*
candidate each round; a ballot with no continuing candidate is **exhausted**.
Majority is measured against continuing (non-exhausted) ballots, never the
original count — with truncated rankings ballots exhaust, so an absolute
majority of the whole electorate may be unreachable and assuming it exists would
loop forever. A candidate clinches exactly when their votes exceed the sum of all
other continuing candidates' (votes can only transfer among non-leaders), which
is algebraically 2*leader > continuing_total and may fire in any round. We also
stop at a sole remaining candidate or when every ballot is exhausted.
"""

from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from flask import Blueprint, jsonify

EXHAUSTED = "__exhausted__"


def tabulate(ballots: List[List[str]], candidates: List[str]) -> Dict[str, Any]:
    """Run IRV. `ballots` is a list of ranked candidate-id lists; `candidates`
    is every declared candidate (zero-vote ones are batch-eliminated first)."""
    declared = list(dict.fromkeys(candidates))
    continuing = list(declared)
    rounds: List[Dict[str, Any]] = []
    holders_per_round: List[List[Optional[str]]] = []
    prev_tallies: Dict[str, int] = {}
    winner = None
    winner_by = None

    while True:
        tallies = {c: 0 for c in continuing}
        holders: List[Optional[str]] = []
        exhausted = 0
        for ranked in ballots:
            choice = next((c for c in ranked if c in tallies), None)
            holders.append(choice)
            if choice is None:
                exhausted += 1
            else:
                tallies[choice] += 1
        holders_per_round.append(holders)

        continuing_total = sum(tallies.values())
        leader = max(continuing, key=lambda c: (tallies[c], -continuing.index(c)))
        record = {
            "round": len(rounds) + 1,
            "tallies": dict(tallies),
            "exhausted": exhausted,
            "eliminated": [],
            "leader": leader,
        }

        if len(continuing) == 1:
            winner, winner_by = continuing[0], "sole"
            rounds.append(record)
            break
        if continuing_total == 0:
            winner, winner_by = None, "exhausted"
            rounds.append(record)
            break
        if tallies[leader] * 2 > continuing_total:  # majority of continuing == clinch
            winner, winner_by = leader, "majority"
            rounds.append(record)
            break

        min_votes = min(tallies.values())
        if min_votes == 0:
            losers = [c for c in continuing if tallies[c] == 0]  # batch zero-vote
        else:
            tied = [c for c in continuing if tallies[c] == min_votes]
            tied.sort(key=lambda c: (prev_tallies.get(c, 0), continuing.index(c)))
            losers = [tied[0]]

        if len(losers) >= len(continuing):  # defensive: never eliminate everyone
            winner, winner_by = (
                (leader, "tie") if tallies[leader] > 0 else (None, "exhausted")
            )
            rounds.append(record)
            break

        record["eliminated"] = list(losers)
        rounds.append(record)
        continuing = [c for c in continuing if c not in set(losers)]
        prev_tallies = tallies

    standings = _standings(declared, winner, rounds)

    # Per-candidate choice-position tallies: how many ballots ranked the
    # candidate 1st, 2nd, 3rd, ... (independent of the IRV rounds). Attached to
    # each standing alongside its final IRV count (`votes`).
    max_depth = max((len(b) for b in ballots), default=0)
    rank_counts = {c: [0] * max_depth for c in declared}
    for ranked in ballots:
        for position, cand in enumerate(ranked):
            counts = rank_counts.get(cand)
            if counts is not None:
                counts[position] += 1
    for s in standings:
        s["rank_tallies"] = rank_counts.get(s["candidate"], [])

    return {
        "winner": winner,
        "winner_by": winner_by,
        "rounds": rounds,
        "candidates": declared,
        "standings": standings,
        "sankey": _sankey(holders_per_round),
    }


def _standings(declared: List[str], winner, rounds) -> List[Dict[str, Any]]:
    """Final placement: winner first, then non-winners by how late they were
    eliminated (survivors count as latest), breaking ties by final votes."""
    last_votes: Dict[str, int] = {}
    elim_round: Dict[str, int] = {}
    for rec in rounds:
        for cand, votes in rec["tallies"].items():
            last_votes[cand] = votes
        for cand in rec["eliminated"]:
            elim_round[cand] = rec["round"]

    never_eliminated = len(rounds) + 1
    non_winners = [c for c in declared if c != winner]
    non_winners.sort(
        key=lambda c: (elim_round.get(c, never_eliminated), last_votes.get(c, 0)),
        reverse=True,
    )
    order = ([winner] if winner else []) + non_winners
    return [
        {"candidate": c, "votes": last_votes.get(c, 0), "place": i + 1}
        for i, c in enumerate(order)
    ]


def _sankey(holders_per_round: List[List[Optional[str]]]) -> Dict[str, Any]:
    """Nodes = (round, candidate|exhausted) sized by votes; links = ballot flows
    between consecutive rounds (candidates staying, eliminated votes splitting to
    recipients or exhausting)."""
    num_rounds = len(holders_per_round)

    node_value: Dict[tuple, int] = {}
    for r, holders in enumerate(holders_per_round):
        for h in holders:
            key = (r, h if h is not None else EXHAUSTED)
            node_value[key] = node_value.get(key, 0) + 1

    link_value: Dict[tuple, int] = {}
    for r in range(num_rounds - 1):
        cur, nxt = holders_per_round[r], holders_per_round[r + 1]
        for i in range(len(cur)):
            a = cur[i] if cur[i] is not None else EXHAUSTED
            b = nxt[i] if nxt[i] is not None else EXHAUSTED
            link_value[(r, a, b)] = link_value.get((r, a, b), 0) + 1

    nodes = [
        {
            "id": f"{r}:{h}",
            "round": r,
            "candidate": None if h == EXHAUSTED else h,
            "exhausted": h == EXHAUSTED,
            "value": v,
        }
        for (r, h), v in sorted(node_value.items())
    ]
    links = [
        {"source": f"{r}:{a}", "target": f"{r + 1}:{b}", "value": v}
        for (r, a, b), v in link_value.items()
        if v > 0
    ]
    return {"num_rounds": num_rounds, "nodes": nodes, "links": links}


def results_for(store, resources, contest_id) -> Dict[str, Any]:
    """Tabulate one contest from the ballots currently in the store, enriched
    with display names. Shared by the results route and the cycle archive."""
    ballots = []
    for row in store.load_all("ballot"):
        ranked = (row.get("cast_data") or {}).get(contest_id)
        if ranked:
            ballots.append(ranked)

    result = tabulate(ballots, resources.candidate_ids(contest_id))

    name = lambda cid: resources.candidate_name(contest_id, cid)
    for s in result["standings"]:
        s["name"] = name(s["candidate"])
    for n in result["sankey"]["nodes"]:
        n["label"] = "Exhausted" if n["exhausted"] else name(n["candidate"])
    result["contest_id"] = contest_id
    result["ballots_counted"] = len(ballots)
    result["winner_name"] = name(result["winner"]) if result["winner"] else None
    return result


def create_results_blueprint(store, resources, polls) -> Blueprint:
    bp = Blueprint("results", __name__)

    @bp.route("/api/contests", methods=["GET"])
    def contests():
        out = []
        for cid in resources.contest_ids():
            meta = next((c for c in resources.contests if c["id"] == cid), {})
            out.append({"id": cid, "name": meta.get("name", cid), "description": meta.get("description", "")})
        return jsonify(out)

    @bp.route("/api/polls/status", methods=["GET"])
    def poll_status():
        # server_time lets clients run countdowns off our clock, not the device's.
        return jsonify(
            {
                "status": polls.status(),
                "open": polls.is_open(),
                "closed": polls.is_closed(),
                "server_time": datetime.now(timezone.utc).isoformat(),
                **polls.scheduled(),
            }
        )

    @bp.route("/api/results/<contest_id>", methods=["GET"])
    def results(contest_id):
        if not polls.is_closed():
            return (
                jsonify(
                    {
                        "error": "polls_not_closed",
                        "message": "Polls have not yet closed! Please try again later.",
                    }
                ),
                403,
            )
        if contest_id not in resources.contest_ids():
            return jsonify({"error": f"unknown contest: {contest_id}"}), 404

        return jsonify(results_for(store, resources, contest_id))

    return bp
