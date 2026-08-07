# 03 Beer backend + frontend integration (deferred)

Replace the client-side mock from [Epic 02](../02-favorite_beer_frontend_mock.md) with a real Flask
backend and wire the UI to it. Deferred until the mock UX is validated.

* **Beer data source** — seed real beers (name, brewery, style, abv, image) from a JSON/CSV fixture
  or an external beer API into the existing model layer (`backend/models/*`, `SqlitePersistence`).
  Beers map onto the generic `Candidate` model (or a new `Beer` model) under a beer `Contest`.
* **Registration + session** — `POST /api/register` creating a `Voter` (firstname, lastname, mobile,
  phone, email) and issuing a real session cookie (Flask-Login is already a listed dependency);
  `GET`/`POST` login.
* **Beer search endpoint** — `GET /api/beers?q=` returning filtered beers with image + brewery, so
  the picker's "too many choices"/`<=10` behavior is server-driven.
* **Ballot persistence** — persist the tasted list and the cast ballot per session via the `Ballot`
  model (`cast_vote` records ranked choices and signs them); expose fetch + cast endpoints.
* **Frontend integration** — swap `frontend/src/lib/session.js` and `data/beers.js` for `axios`
  calls; replace the `localStorage` mock cookie with the real session cookie; keep the same
  components/UX.
* Add backend tests for registration, beer search, and ballot casting (`backend/tests/`).
