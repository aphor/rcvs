"""Shared helpers for the ballot-seeding tools.

Both seeders cast through the public API rather than writing SQLite directly,
so the ballots they create go through the same normalization, folding and
signing path as ballots cast from the UI.
"""

import json
import os
import urllib.error
import urllib.request

DEFAULT_API = os.environ.get("RCVS_API", "http://127.0.0.1:5055")

# Repo root, so the tools work from any working directory.
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_RESOURCES = os.path.join(_ROOT, "backend", "resources")


def load_resources():
    """Return (beer_id -> brewery_slug, [flavor names])."""
    with open(os.path.join(_RESOURCES, "beer_brewery_map.json"), encoding="utf-8") as fh:
        beers = json.load(fh)
    with open(os.path.join(_RESOURCES, "candidates_flavor.json"), encoding="utf-8") as fh:
        flavors = [c["name"] for c in json.load(fh)]
    return beers, flavors


def post(api, path, payload):
    """POST JSON and return the decoded body (or {'error': ...} on failure)."""
    req = urllib.request.Request(
        api + path,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as exc:
        try:
            return json.loads(exc.read())
        except Exception:
            return {"error": f"http {exc.code}"}
    except urllib.error.URLError as exc:
        return {"error": f"unreachable: {exc.reason}"}


def cast_all(api, ballots):
    """Cast each {'ballot': [...], 'flavorRanks': {...}} and report how many stuck."""
    ok = 0
    first_error = None
    for payload in ballots:
        res = post(api, "/api/ballot", payload)
        if res.get("receipt"):
            ok += 1
        elif first_error is None:
            first_error = res
    if first_error:
        print(f"first failure: {first_error}")
        if first_error.get("error") == "polls_not_open":
            print("polls must be OPEN to accept ballots — POST /api/admin/open first")
    print(f"cast {ok}/{len(ballots)} ballots via {api}")
    return ok
