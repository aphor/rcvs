"""Cycle boundaries for the ballot box.

Closing the polls ends a cycle: the cast ballots and the results computed from
them are snapshotted into an `archive` record. Opening starts a fresh cycle: the
ballots are cleared so the new run counts only its own votes.

Both the raw ballots and the tabulated results are kept, so an archived cycle
stays readable even if backend/resources later changes the candidate list.
Receipts are never touched — they are contact records, not votes, and live in a
different store entirely.
"""

from datetime import datetime, timezone
from uuid import uuid4

from backend.services.tabulator import results_for


def archive_cycle(store, resources) -> dict:
    """Snapshot the ballots and results of the cycle that just ended."""
    ballots = store.load_all("ballot")
    record = {
        "id": str(uuid4()),
        "closed_at": datetime.now(timezone.utc).isoformat(),
        "ballots_counted": len(ballots),
        "ballots": ballots,
        "results": {cid: results_for(store, resources, cid) for cid in resources.contest_ids()},
    }
    store.save(record, "archive")
    return record


def clear_ballots(store) -> int:
    """Drop the previous cycle's ballots; returns how many were removed."""
    return store.delete_all("ballot")
