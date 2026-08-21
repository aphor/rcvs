"""Scheduled open/close, and the cycle boundaries they trigger."""

from datetime import datetime, timedelta, timezone

import pytest

PW = {"password": "opensesame"}


def iso(**delta):
    return (datetime.now(timezone.utc) + timedelta(**delta)).isoformat()


def cast(client, app, count=1):
    beers = list(app.resources.beer_brewery_map.keys())
    for i in range(count):
        client.post("/api/ballot", json={"ballot": [beers[i]], "flavorRanks": {}})


# ---- scheduling rules ---------------------------------------------------


def test_schedule_open_must_be_more_than_a_minute_out(client):
    r = client.post("/api/admin/open", json={**PW, "at": iso(seconds=30)})
    assert r.status_code == 400
    assert "1 minute" in r.get_json()["message"]
    assert client.get("/api/polls/status").get_json()["status"] == "pending"


def test_schedule_open_rejected_while_polls_are_open(client):
    client.post("/api/admin/open", json=PW)
    r = client.post("/api/admin/open", json={**PW, "at": iso(hours=1)})
    assert r.status_code == 400
    assert r.get_json()["message"] == "Polls are already open."


def test_schedule_close_rejected_when_neither_open_nor_scheduled(client):
    r = client.post("/api/admin/close", json={**PW, "at": iso(hours=2)})
    assert r.status_code == 400
    assert "neither open nor scheduled" in r.get_json()["message"]


def test_scheduled_close_must_follow_the_open_by_five_minutes(client):
    client.post("/api/admin/open", json={**PW, "at": iso(minutes=30)})
    too_soon = client.post("/api/admin/close", json={**PW, "at": iso(minutes=33)})
    assert too_soon.status_code == 400
    assert "5 minutes" in too_soon.get_json()["message"]

    ok = client.post("/api/admin/close", json={**PW, "at": iso(minutes=36)})
    assert ok.status_code == 200
    assert ok.get_json()["scheduled_close_at"]


def test_both_transitions_can_be_scheduled_together(client):
    client.post("/api/admin/open", json={**PW, "at": iso(minutes=10)})
    body = client.post("/api/admin/close", json={**PW, "at": iso(minutes=90)}).get_json()
    assert body["status"] == "pending"
    assert body["scheduled_open_at"] and body["scheduled_close_at"]


def test_cancel_clears_a_pending_schedule(client):
    client.post("/api/admin/open", json={**PW, "at": iso(minutes=10)})
    body = client.post("/api/admin/cancel", json={**PW, "op": "open"}).get_json()
    assert body["scheduled_open_at"] is None

    again = client.post("/api/admin/cancel", json={**PW, "op": "open"})
    assert again.status_code == 400


def test_scheduling_requires_the_password(client):
    r = client.post("/api/admin/open", json={"password": "wrong", "at": iso(minutes=10)})
    assert r.status_code == 401
    assert client.get("/api/polls/status").get_json()["scheduled_open_at"] is None


# ---- due schedules fire lazily -----------------------------------------


def test_due_open_fires_on_the_next_status_read(client, app):
    # Written straight to the store: the API refuses times this close on purpose.
    app.polls._write({"status": "pending", "scheduled_open_at": iso(seconds=-1)})
    assert client.get("/api/polls/status").get_json()["status"] == "open"
    # The fired schedule is consumed, not left to fire again.
    assert client.get("/api/polls/status").get_json()["scheduled_open_at"] is None


def test_due_close_fires_and_releases_results(client, app):
    client.post("/api/admin/open", json=PW)
    cast(client, app)
    app.polls._write({**app.polls._record(), "scheduled_close_at": iso(seconds=-1)})

    assert client.get("/api/polls/status").get_json()["status"] == "closed"
    assert client.get("/api/results/favorite-brewery").status_code == 200
    assert client.post("/api/ballot", json={"ballot": ["x"], "flavorRanks": {}}).status_code == 403


def test_status_reports_server_time(client):
    stamp = client.get("/api/polls/status").get_json()["server_time"]
    assert (datetime.now(timezone.utc) - datetime.fromisoformat(stamp)).total_seconds() < 5


# ---- cycle boundaries ---------------------------------------------------


def test_closing_archives_the_cycle(client, app):
    client.post("/api/admin/open", json=PW)
    cast(client, app, count=3)
    client.post("/api/admin/close", json=PW)

    archives = app.election_store.load_all("archive")
    assert len(archives) == 1
    snapshot = archives[0]
    assert snapshot["ballots_counted"] == 3
    assert len(snapshot["ballots"]) == 3
    assert snapshot["results"]["favorite-brewery"]["ballots_counted"] == 3
    assert snapshot["closed_at"]


def test_opening_clears_the_previous_cycle_but_keeps_its_archive(client, app):
    client.post("/api/admin/open", json=PW)
    cast(client, app, count=2)
    client.post("/api/admin/close", json=PW)

    # A second cycle starts empty.
    client.post("/api/admin/open", json=PW)
    assert app.election_store.load_all("ballot") == []
    assert len(app.election_store.load_all("archive")) == 1

    cast(client, app, count=1)
    client.post("/api/admin/close", json=PW)
    assert client.get("/api/results/favorite-brewery").get_json()["ballots_counted"] == 1
    assert len(app.election_store.load_all("archive")) == 2


def test_archiving_leaves_receipts_alone(client, app):
    client.post("/api/admin/open", json=PW)
    client.post("/api/receipt", json={"user": {"email": "a@b.c"}, "feedback": {"text": "hi"}})
    client.post("/api/admin/close", json=PW)
    client.post("/api/admin/open", json=PW)

    assert len(app.receipt_store.load_all("receipt")) == 1
