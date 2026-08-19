"""Instant-runoff (RCV) tabulation with correct termination.

Design notes on termination — the important part:
  * A ballot counts toward its first *continuing* candidate each round; a ballot
    with no continuing candidate left is **exhausted** and counts toward nobody.
  * Majority is measured against **continuing (non-exhausted) ballots**, never the
    original ballot count. With truncated rankings, ballots exhaust, so an
    absolute majority of the whole electorate may be unreachable — assuming it is
    would loop forever. Using the continuing total is what makes this terminate.
  * A candidate has *clinched* exactly when their votes exceed the sum of all other
    continuing candidates' votes — because votes can only ever transfer among
    non-leader candidates, so that sum bounds what any challenger could reach.
    That condition is algebraically the same as a majority of continuing ballots
    (2*leader > continuing_total), so it is our stop test and it may fire in any
    round (an early clinch), not only at the final two.
  * We also stop when a single candidate remains, or when every ballot is
    exhausted (no winner determinable).
No branch assumes a majority of the original electorate is achievable.

`tabulate` is a pure function; the results blueprint wraps it.
"""

from typing import Dict, List, Any

from flask import Blueprint, jsonify


def tabulate(ballots: List[List[str]], candidates: List[str]) -> Dict[str, Any]:
    """Run IRV. `ballots` is a list of ranked candidate-id lists; `candidates`
    is every declared candidate (zero-vote ones are batch-eliminated first)."""
    continuing = list(dict.fromkeys(candidates))  # de-dupe, keep declared order
    rounds: List[Dict[str, Any]] = []
    prev_tallies: Dict[str, int] = {}
    winner = None
    winner_by = None

    while True:
        tallies = {c: 0 for c in continuing}
        exhausted = 0
        for ranked in ballots:
            choice = next((c for c in ranked if c in tallies), None)
            if choice is None:
                exhausted += 1
            else:
                tallies[choice] += 1

        continuing_total = sum(tallies.values())
        # Leader = most votes; ties broken toward the earlier declared candidate.
        leader = max(continuing, key=lambda c: (tallies[c], -continuing.index(c)))
        record = {
            "round": len(rounds) + 1,
            "tallies": dict(tallies),
            "exhausted": exhausted,
            "eliminated": [],
            "leader": leader,
        }

        # --- termination checks ---
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

        # --- elimination ---
        min_votes = min(tallies.values())
        if min_votes == 0:
            # Batch-eliminate all zero-vote candidates: they hold no ballots to
            # transfer and cannot win. Safe and collapses the early rounds.
            losers = [c for c in continuing if tallies[c] == 0]
        else:
            tied = [c for c in continuing if tallies[c] == min_votes]
            # Break elimination ties by fewest votes in the previous round, then
            # by declared order — fully deterministic.
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
        loser_set = set(losers)
        continuing = [c for c in continuing if c not in loser_set]
        prev_tallies = tallies

    return {
        "winner": winner,
        "winner_by": winner_by,
        "rounds": rounds,
        "candidates": list(dict.fromkeys(candidates)),
    }


def create_results_blueprint(store, resources) -> Blueprint:
    bp = Blueprint("results", __name__)

    @bp.route("/api/results/<contest_id>", methods=["GET"])
    def results(contest_id):
        if contest_id not in resources.contest_ids():
            return jsonify({"error": f"unknown contest: {contest_id}"}), 404

        ballots = []
        for row in store.load_all("ballot"):
            ranked = (row.get("cast_data") or {}).get(contest_id)
            if ranked:
                ballots.append(ranked)

        candidates = resources.candidate_ids(contest_id)
        result = tabulate(ballots, candidates)
        result["contest_id"] = contest_id
        result["ballots_counted"] = len(ballots)
        result["candidate_names"] = {
            cid: resources.candidate_name(contest_id, cid) for cid in candidates
        }
        result["winner_name"] = (
            resources.candidate_name(contest_id, result["winner"]) if result["winner"] else None
        )
        return jsonify(result)

    return bp
