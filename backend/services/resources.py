"""Load the election, contests, and candidates from resource files and seed them
into the election store, exposing the lookups the ballot-box and tabulator need.

Resource files live in backend/resources/ and are generated from the frontend
beer fixture (see frontend/scripts/export-resources.mjs) so candidate ids match
the choices shown in the UI.
"""

import json
import os
from typing import Dict, List, Optional

from backend.models import Election, Contest, Candidate

BREWERY_CONTEST = "favorite-brewery"
FLAVOR_CONTEST = "favorite-flavor"

_RESOURCE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "resources")


def _read(name: str, resource_dir: str):
    with open(os.path.join(resource_dir, name), encoding="utf-8") as fh:
        return json.load(fh)


class Resources:
    """In-memory view of the election definition plus id/name lookups."""

    def __init__(self, resource_dir: str = _RESOURCE_DIR):
        self.resource_dir = resource_dir
        self.election: Dict = _read("election.json", resource_dir)
        self.contests: List[Dict] = _read("contests.json", resource_dir)
        self._candidates: List[Dict] = _read("candidates_brewery.json", resource_dir) + _read(
            "candidates_flavor.json", resource_dir
        )
        self.beer_brewery_map: Dict[str, str] = _read("beer_brewery_map.json", resource_dir)

        # contest_id -> { candidate_id -> name }
        self._by_contest: Dict[str, Dict[str, str]] = {}
        for c in self._candidates:
            self._by_contest.setdefault(c["contest_id"], {})[c["id"]] = c["name"]

    # --- seeding -----------------------------------------------------------
    def seed(self, store) -> None:
        """Persist the election, contests, and candidates into an election store."""
        election = Election.from_dict(self.election)
        store.save(election.to_dict(), "election")
        for c in self.contests:
            store.save(Contest.from_dict(c).to_dict(), "contest")
        for c in self._candidates:
            store.save(Candidate.from_dict(c).to_dict(), "candidate")

    # --- lookups -----------------------------------------------------------
    def election_id(self) -> str:
        return self.election["id"]

    def contest_ids(self) -> List[str]:
        return [c["id"] for c in self.contests]

    def candidate_ids(self, contest_id: str) -> List[str]:
        return list(self._by_contest.get(contest_id, {}).keys())

    def candidate_name(self, contest_id: str, candidate_id: str) -> Optional[str]:
        return self._by_contest.get(contest_id, {}).get(candidate_id)

    def beer_to_brewery(self, beer_id: str) -> Optional[str]:
        """Map a beer id to its brewery candidate id (brewerySlug)."""
        return self.beer_brewery_map.get(beer_id)

    def flavor_candidate_id(self, flavor: str) -> str:
        """Map a flavor name (e.g. 'Hoppy') to its candidate id ('hoppy')."""
        return str(flavor).lower()
