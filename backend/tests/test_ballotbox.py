from backend.services.ballotbox import brewery_ranking, flavor_ranking
from backend.services.resources import Resources

PII_KEYS = {"firstname", "lastname", "email", "mobile", "phone"}


def _beers_by_brewery(resources):
    grouped = {}
    for beer_id, slug in resources.beer_brewery_map.items():
        grouped.setdefault(slug, []).append(beer_id)
    return grouped


def test_brewery_ranking_dedups_to_highest_rank():
    r = Resources()
    grouped = _beers_by_brewery(r)
    multi_slug = next(s for s, beers in grouped.items() if len(beers) >= 2)
    a, b = grouped[multi_slug][:2]
    other = next(bid for bid, s in r.beer_brewery_map.items() if s != multi_slug)
    other_slug = r.beer_brewery_map[other]

    # a and b are the same brewery; ranking keeps that brewery at its first (a) rank.
    assert brewery_ranking([a, other, b], r) == [multi_slug, other_slug]


def test_flavor_ranking_orders_by_rank():
    r = Resources()
    assert flavor_ranking({"Sour": 2, "Hoppy": 1}, r) == ["hoppy", "sour"]
    assert flavor_ranking({}, r) == []


def test_cast_persists_anonymous_ballot(client, app):
    app.polls.open()
    beers = list(app.resources.beer_brewery_map.keys())
    res = client.post(
        "/api/ballot",
        json={"ballot": [beers[0], beers[5]], "flavorRanks": {"Hoppy": 1, "Sour": 2}},
    )
    assert res.status_code == 200
    body = res.get_json()
    assert body["ballotId"] and body["receipt"]

    ballots = app.election_store.load_all("ballot")
    assert len(ballots) == 1
    stored = ballots[0]
    assert "favorite-brewery" in stored["cast_data"]
    assert stored["cast_data"]["favorite-flavor"] == ["hoppy", "sour"]
    # No PII ever lands in the ballot-box.
    assert not (PII_KEYS & set(stored.keys()))


def test_empty_ballot_rejected(client, app):
    app.polls.open()
    res = client.post("/api/ballot", json={"ballot": [], "flavorRanks": {}})
    assert res.status_code == 400
