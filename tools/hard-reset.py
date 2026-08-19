#!/usr/bin/env python3
"""Clear ALL election data — use once, after testing, before the real election.

Deletes both SQLite stores (ballotbox.db: election/candidates + cast ballots,
receipts.db: voter PII + comments). The backend re-seeds candidates from
backend/resources on its next start and the poll returns to PENDING, which is
the only way back to pending — Polls has no reset path once opened.

    python tools/hard-reset.py            # show what would be deleted, change nothing
    python tools/hard-reset.py --yes      # actually delete

If the rcvs-backend systemd unit is running it is stopped before deletion and
started again afterwards, so the files are not deleted out from under gunicorn.
"""

import argparse
import json
import os
import shutil
import sqlite3
import subprocess
import sys

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_SERVICE = "rcvs-backend"
_STORES = ("ballotbox.db", "receipts.db")
# SQLite may leave these next to the database in WAL mode.
_SIDECARS = ("-wal", "-shm", "-journal")


def summarize(path):
    """Row counts per table, so the operator sees what is about to be destroyed."""
    if not os.path.exists(path):
        return "absent"
    try:
        con = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
        tables = [r[0] for r in con.execute("select name from sqlite_master where type='table'")]
        counts = {t: con.execute(f'select count(*) from "{t}"').fetchone()[0] for t in tables}
        con.close()
    except sqlite3.Error as exc:
        return f"unreadable ({exc})"
    return ", ".join(f"{t}={n}" for t, n in sorted(counts.items()) if n) or "empty"


def service_active():
    if not shutil.which("systemctl"):
        return False
    return subprocess.run(
        ["systemctl", "is-active", "--quiet", _SERVICE], check=False
    ).returncode == 0


def targets(repo):
    for name in _STORES:
        base = os.path.join(repo, name)
        for path in (base, *(base + s for s in _SIDECARS)):
            if os.path.exists(path):
                yield path


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--yes", action="store_true", help="required; without it this is a dry run")
    ap.add_argument("--repo", default=_ROOT, help="directory holding the .db files (backend WorkingDirectory)")
    ap.add_argument(
        "--no-service",
        action="store_true",
        help="never touch systemd (use when --repo is not the running backend's directory)",
    )
    args = ap.parse_args()

    for name in _STORES:
        print(f"{name}: {summarize(os.path.join(args.repo, name))}")
    doomed = list(targets(args.repo))
    if not doomed:
        print("nothing to delete")
        return 0

    if not args.yes:
        print("\nwould delete:\n  " + "\n  ".join(doomed))
        print("\nre-run with --yes to proceed")
        return 0

    running = service_active() and not args.no_service
    if running:
        print(f"stopping {_SERVICE}")
        subprocess.run(["systemctl", "stop", _SERVICE], check=True)
    for path in doomed:
        os.remove(path)
        print(f"deleted {path}")
    if running:
        print(f"starting {_SERVICE}")
        subprocess.run(["systemctl", "start", _SERVICE], check=True)
        print("poll status is PENDING once the backend finishes re-seeding")
    else:
        print("start the backend to re-seed candidates from backend/resources")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
