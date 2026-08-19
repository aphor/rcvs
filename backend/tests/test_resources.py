from backend.services.resources import Resources, BREWERY_CONTEST, FLAVOR_CONTEST


def test_resource_consistency():
    r = Resources()
    assert set(r.contest_ids()) == {BREWERY_CONTEST, FLAVOR_CONTEST}

    flavors = r.candidate_ids(FLAVOR_CONTEST)
    assert len(flavors) == 6
    assert flavors == [f.lower() for f in ["Hoppy", "Malty", "Fruity", "Sour", "Crisp", "Exotic"]]

    breweries = r.candidate_ids(BREWERY_CONTEST)
    # Every distinct brewery in the beer map is a candidate, and vice versa.
    assert set(breweries) == set(r.beer_brewery_map.values())
    assert len(breweries) == len(set(breweries))


def test_seed_persists_election_definition(app):
    store = app.election_store
    assert store.load("election", "opmr-2026")["id"] == "opmr-2026"
    assert len(store.load_all("contest")) == 2

    r = app.resources
    expected = len(r.candidate_ids(BREWERY_CONTEST)) + len(r.candidate_ids(FLAVOR_CONTEST))
    assert len(store.load_all("candidate")) == expected
