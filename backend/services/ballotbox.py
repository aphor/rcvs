"""Ballot-box service: receives the anonymous rankings from a cast ballot,
normalizes them to candidate ids, records and signs them via the existing
Ballot model, and persists them to the election store. It never sees voter PII.
"""

from uuid import uuid4
from typing import Dict, List

from flask import Blueprint, request, jsonify

from backend.models import Ballot
from backend.services.resources import BREWERY_CONTEST, FLAVOR_CONTEST


def brewery_ranking(ballot_ids: List[str], resources) -> List[str]:
    """Fold a ranked list of beer ids into a ranked list of brewery ids,
    de-duplicating to the highest-ranked beer per brewery."""
    seen = set()
    out = []
    for beer_id in ballot_ids:
        slug = resources.beer_to_brewery(beer_id)
        if slug and slug not in seen:
            seen.add(slug)
            out.append(slug)
    return out


def flavor_ranking(flavor_ranks: Dict[str, int], resources) -> List[str]:
    """Convert the {flavor: rank} grid map into an ordered list of flavor ids."""
    ordered = sorted(flavor_ranks.items(), key=lambda kv: kv[1])
    return [resources.flavor_candidate_id(flavor) for flavor, _ in ordered]


def create_blueprint(store, resources) -> Blueprint:
    bp = Blueprint("ballotbox", __name__)

    @bp.route("/api/ballot", methods=["POST"])
    def cast():
        body = request.get_json(force=True, silent=True) or {}
        brewery = brewery_ranking(body.get("ballot", []) or [], resources)
        flavor = flavor_ranking(body.get("flavorRanks", {}) or {}, resources)

        if not brewery and not flavor:
            return jsonify({"error": "empty ballot"}), 400

        contest_ids = []
        if brewery:
            contest_ids.append(BREWERY_CONTEST)
        if flavor:
            contest_ids.append(FLAVOR_CONTEST)

        ballot = Ballot(
            id=str(uuid4()),
            election_id=resources.election_id(),
            contest_ids=contest_ids,
        )
        if brewery:
            ballot.cast_vote(BREWERY_CONTEST, brewery)
        if flavor:
            ballot.cast_vote(FLAVOR_CONTEST, flavor)

        # Persist the anonymous ballot only — no voter data reaches this store.
        store.save(ballot.to_dict(), "ballot")
        return jsonify({"ballotId": ballot.id, "receipt": ballot.signature})

    return bp
