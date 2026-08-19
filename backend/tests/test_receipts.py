def test_receipt_stored_separately_from_votes(client, app):
    res = client.post(
        "/api/receipt",
        json={
            "user": {
                "firstname": "Ada",
                "lastname": "Lovelace",
                "mobile": "555-1",
                "phone": "555-2",
                "email": "ada@example.com",
            },
            "feedback": {"text": "Loved the fest", "contactMe": True},
        },
    )
    assert res.status_code == 200
    assert res.get_json()["receiptId"]

    receipts = app.receipt_store.load_all("receipt")
    assert len(receipts) == 1
    r = receipts[0]
    assert r["email"] == "ada@example.com"
    assert r["comments"] == "Loved the fest"
    assert r["contact_me"] is True

    # Secrecy: the two stores share nothing.
    assert app.receipt_store.load_all("ballot") == []
    assert app.election_store.load_all("receipt") == []


def test_full_cast_keeps_identity_and_votes_apart(client, app):
    app.polls.open()
    beers = list(app.resources.beer_brewery_map.keys())
    client.post("/api/ballot", json={"ballot": [beers[0]], "flavorRanks": {}})
    client.post(
        "/api/receipt",
        json={"user": {"email": "x@y.z"}, "feedback": {"text": "", "contactMe": False}},
    )
    # Ballot-box has a vote but no PII; receipt store has PII but no vote.
    assert len(app.election_store.load_all("ballot")) == 1
    assert app.election_store.load_all("receipt") == []
    assert len(app.receipt_store.load_all("receipt")) == 1
    assert app.receipt_store.load_all("ballot") == []


def test_blank_contact_details_are_imputed_from_the_request_address(client, app):
    """Every field is optional; a receipt with none of them gets the caller's IP."""
    res = client.post(
        "/api/receipt",
        json={"user": {}, "feedback": {"text": "great fest", "contactMe": False}},
    )
    assert res.status_code == 200

    r = app.receipt_store.load_all("receipt")[0]
    assert r["firstname"] == "127.0.0.1"  # test client's remote_addr
    assert r["lastname"] == r["mobile"] == r["phone"] == r["email"] == ""
    assert r["comments"] == "great fest"


def test_imputed_address_comes_from_the_proxy_not_the_client(client, app):
    """lighttpd appends its own view of the peer, so trust the rightmost hop."""
    res = client.post(
        "/api/receipt",
        json={"user": {}, "feedback": {}},
        headers={"X-Forwarded-For": "10.0.0.9, 203.0.113.7"},
    )
    assert res.status_code == 200
    assert app.receipt_store.load_all("receipt")[0]["firstname"] == "203.0.113.7"


def test_any_single_contact_detail_suppresses_imputation(client, app):
    """Whitespace does not count as a detail, but one real field does."""
    client.post("/api/receipt", json={"user": {"mobile": "555-1234", "firstname": "  "}})
    r = app.receipt_store.load_all("receipt")[0]
    assert r["firstname"] == ""
    assert r["mobile"] == "555-1234"
