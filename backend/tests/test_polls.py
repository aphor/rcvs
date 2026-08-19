def test_default_status_is_pending(client):
    assert client.get("/api/polls/status").get_json()["status"] == "pending"


def test_cast_blocked_until_open(client, app):
    beers = list(app.resources.beer_brewery_map.keys())
    r = client.post("/api/ballot", json={"ballot": [beers[0]], "flavorRanks": {}})
    assert r.status_code == 403
    assert r.get_json()["error"] == "polls_not_open"


def test_results_blocked_until_closed(client):
    r = client.get("/api/results/favorite-brewery")
    assert r.status_code == 403
    body = r.get_json()
    assert body["error"] == "polls_not_closed"
    assert body["message"] == "Polls have not yet closed! Please try again later."


def test_admin_open_close_flow(client, app):
    beers = list(app.resources.beer_brewery_map.keys())

    # open (correct password) -> voting allowed, results still blocked
    assert client.post("/api/admin/open", json={"password": "opensesame"}).status_code == 200
    assert client.get("/api/polls/status").get_json()["open"] is True
    assert client.post("/api/ballot", json={"ballot": [beers[0]], "flavorRanks": {}}).status_code == 200
    assert client.get("/api/results/favorite-brewery").status_code == 403

    # close -> results released, voting blocked
    assert client.post("/api/admin/close", json={"password": "opensesame"}).status_code == 200
    assert client.get("/api/polls/status").get_json()["closed"] is True
    assert client.get("/api/results/favorite-brewery").status_code == 200
    assert client.post("/api/ballot", json={"ballot": [beers[0]], "flavorRanks": {}}).status_code == 403


def test_admin_requires_password(client):
    assert client.post("/api/admin/open", json={"password": "wrong"}).status_code == 401
    assert client.post("/api/admin/open").status_code == 401
    assert client.get("/api/polls/status").get_json()["status"] == "pending"


def test_admin_password_via_header(client):
    r = client.post("/api/admin/open", headers={"X-Admin-Password": "opensesame"})
    assert r.status_code == 200


def test_contests_endpoint(client):
    contests = client.get("/api/contests").get_json()
    ids = {c["id"] for c in contests}
    assert ids == {"favorite-brewery", "favorite-flavor"}
    assert all(c["name"] for c in contests)
