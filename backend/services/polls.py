"""Poll state (pending -> open -> closed), persisted in the election store.

Voting is accepted only while OPEN; results are released only once CLOSED.
"""

from datetime import datetime

PENDING = "pending"
OPEN = "open"
CLOSED = "closed"

_POLL_ID = "polls"
_MODEL = "pollstate"


class Polls:
    def __init__(self, store):
        self.store = store

    def status(self) -> str:
        rec = self.store.load(_MODEL, _POLL_ID)
        return rec.get("status", PENDING) if rec else PENDING

    def is_open(self) -> bool:
        return self.status() == OPEN

    def is_closed(self) -> bool:
        return self.status() == CLOSED

    def _set(self, status: str, stamp_key: str) -> None:
        rec = self.store.load(_MODEL, _POLL_ID) or {"id": _POLL_ID}
        rec["id"] = _POLL_ID
        rec["status"] = status
        rec[stamp_key] = datetime.now().isoformat()
        self.store.save(rec, _MODEL)

    def open(self) -> None:
        self._set(OPEN, "opened_at")

    def close(self) -> None:
        self._set(CLOSED, "closed_at")
