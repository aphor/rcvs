"""Poll state (pending -> open -> closed), persisted in the election store.

Voting is accepted only while OPEN; results are released only once CLOSED.

Transitions can be scheduled ahead of time. There is no background scheduler —
a due transition fires lazily the next time anything reads the status, which is
enough because every client polls the status endpoint and the tabulator and
ballot box both consult it before acting.

Closing ends a cycle and opening starts a fresh one; the on_open / on_close
hooks (wired in create_app) are what clear and archive the ballots, keeping this
module free of any store or resource knowledge beyond its own record.
"""

from datetime import datetime, timedelta, timezone

PENDING = "pending"
OPEN = "open"
CLOSED = "closed"

_POLL_ID = "polls"
_MODEL = "pollstate"

# Guard rails on scheduling, measured from the moment of submission.
MIN_OPEN_LEAD = timedelta(minutes=1)
MIN_OPEN_TO_CLOSE = timedelta(minutes=5)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def parse_time(value) -> datetime:
    """Parse an ISO-8601 instant, tolerating the 'Z' suffix browsers send."""
    if isinstance(value, datetime):
        stamp = value
    else:
        text = str(value or "").strip()
        if not text:
            raise ValueError("A time is required.")
        try:
            stamp = datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError(f"Not a valid time: {value!r}")
    # A time without a zone is read as UTC: every client sends toISOString().
    return stamp if stamp.tzinfo else stamp.replace(tzinfo=timezone.utc)


class Polls:
    def __init__(self, store, on_open=None, on_close=None):
        self.store = store
        self.on_open = on_open
        self.on_close = on_close

    # ---- record access -------------------------------------------------

    def _record(self) -> dict:
        return self.store.load(_MODEL, _POLL_ID) or {"id": _POLL_ID, "status": PENDING}

    def _write(self, rec: dict) -> None:
        rec["id"] = _POLL_ID
        self.store.save(rec, _MODEL)

    # ---- status --------------------------------------------------------

    def status(self) -> str:
        self._apply_due()
        return self._record().get("status", PENDING)

    def is_open(self) -> bool:
        return self.status() == OPEN

    def is_closed(self) -> bool:
        return self.status() == CLOSED

    def scheduled(self) -> dict:
        """Pending schedules, as ISO strings; a fired schedule is cleared."""
        self._apply_due()
        rec = self._record()
        return {
            "scheduled_open_at": rec.get("scheduled_open_at"),
            "scheduled_close_at": rec.get("scheduled_close_at"),
        }

    # ---- transitions ---------------------------------------------------

    def _set(self, rec: dict, status: str, stamp_key: str, now: datetime) -> None:
        rec["status"] = status
        rec[stamp_key] = now.isoformat()
        self._write(rec)

    def open(self) -> None:
        """Open immediately, clearing whatever the previous cycle left behind."""
        now = _utcnow()
        rec = self._record()
        rec.pop("scheduled_open_at", None)
        self._set(rec, OPEN, "opened_at", now)
        if self.on_open:
            self.on_open()

    def close(self) -> None:
        """Close immediately, archiving the cycle that just ended."""
        now = _utcnow()
        rec = self._record()
        rec.pop("scheduled_close_at", None)
        self._set(rec, CLOSED, "closed_at", now)
        if self.on_close:
            self.on_close()

    def _apply_due(self) -> None:
        """Fire any transition whose scheduled time has passed.

        Re-reads the record immediately before acting so a second worker that
        raced to the same conclusion does not archive or clear a second time.
        """
        now = _utcnow()
        rec = self._record()

        due_open = rec.get("scheduled_open_at")
        if due_open and parse_time(due_open) <= now and rec.get("status") != OPEN:
            if (self.store.load(_MODEL, _POLL_ID) or {}).get("scheduled_open_at") == due_open:
                self.open()
                rec = self._record()

        due_close = rec.get("scheduled_close_at")
        if due_close and parse_time(due_close) <= now and rec.get("status") == OPEN:
            if (self.store.load(_MODEL, _POLL_ID) or {}).get("scheduled_close_at") == due_close:
                self.close()

    # ---- scheduling ----------------------------------------------------

    def schedule_open(self, at) -> str:
        """Schedule a future open. Only meaningful while polls are not open."""
        when = parse_time(at)
        now = _utcnow()
        if self.status() == OPEN:
            raise ValueError("Polls are already open.")
        if when - now <= MIN_OPEN_LEAD:
            raise ValueError("A scheduled open must be more than 1 minute from now.")

        rec = self._record()
        close_at = rec.get("scheduled_close_at")
        if close_at and parse_time(close_at) - when < MIN_OPEN_TO_CLOSE:
            raise ValueError(
                "The scheduled close is less than 5 minutes after this open — "
                "cancel or move the close first."
            )
        rec["scheduled_open_at"] = when.isoformat()
        self._write(rec)
        return rec["scheduled_open_at"]

    def schedule_close(self, at) -> str:
        """Schedule a future close, either side of the polls actually opening."""
        when = parse_time(at)
        now = _utcnow()
        status = self.status()
        rec = self._record()
        open_at = rec.get("scheduled_open_at")

        if status != OPEN and not open_at:
            raise ValueError("Polls are neither open nor scheduled to open.")
        if status == CLOSED and not open_at:
            raise ValueError("Polls are already closed.")

        # Five clear minutes of voting, measured from whenever voting starts.
        starts = parse_time(open_at) if open_at else now
        if when - starts < MIN_OPEN_TO_CLOSE:
            raise ValueError("A close must be more than 5 minutes after the polls open.")
        if when <= now:
            raise ValueError("A scheduled close must be in the future.")

        rec["scheduled_close_at"] = when.isoformat()
        self._write(rec)
        return rec["scheduled_close_at"]

    def cancel(self, op: str) -> None:
        """Drop a schedule that has not fired yet."""
        key = {"open": "scheduled_open_at", "close": "scheduled_close_at"}.get(op)
        if not key:
            raise ValueError(f"Nothing to cancel: {op!r}")
        rec = self._record()
        if not rec.get(key):
            raise ValueError(f"No {op} is scheduled.")
        rec.pop(key, None)
        self._write(rec)
