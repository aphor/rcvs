# Epic: Frontend for favorite beer voting site/app mockup

Provide a web UI to provide:

* registration form with nominal user details including firstname, lastname, mobile, phone, and email
* beer picker with a search blank and a beer preview pane that shows "too many choices" until some criteria are added
* beer picker shows a picture and name of beer and brewery for ten or less matching beers when the picker search results are narrowed
* user login session cookie adds to a list of tasted beers which have been chosen by the picker UI
* after at least one beer tasting, a "VOTE" button appears floating at the upper edge of the UI
* clicking the VOTE button hides the beer picker and shows the ballot form
* The ballot form has a floating button on the top edge for "ADD MORE BEERS TO BALLOT" which hides the ballot and shows the picker when clicked
* The ballot will list cards for each picked beer by default in the reverse order they were picked with an up arrow button on the left of a beer to promote its rank, and a down arrow on the right to demote its rank, and an X button to remove the ballot card for each.
* ballot beer cards are draggable if the user device supports drag and drop touchscreen or mouse inputs.
* a "CAST BALLOT" button appears floating on the bottom edge of the ballot.
* a modal dialog popup will force confirmation or cancel choice for removing a beer from the ballot or casting the ballot.
* ballot cast state is saved in the user session cookie, and ballot interaction is disabled and buttons are grayed out, but the "ADD MORE BEERS" button remains active, relabeled "BROWSE BEERS"

## Mock architecture

Built as a **pure client-side mock** on the existing React 18 + react-router + Vite scaffold
(`frontend/`), with no backend changes:

* Beer/brewery data comes from a static fixture (`frontend/src/data/beers.js`); beer images use a
  deterministic placeholder per beer with a local SVG fallback.
* Session, tasted beers, ballot order, and the cast flag are persisted in `localStorage` via
  `frontend/src/lib/session.js`, which **stands in for the login session cookie**.
* App state lives in a React Context store (`frontend/src/context/AppContext.jsx`) that hydrates from
  and persists to the session layer.
* Picker <-> ballot view switching is local UI state within the `/app` route, driven by the floating
  VOTE / ADD-MORE buttons.
* Drag-and-drop uses `@dnd-kit/core` + `@dnd-kit/sortable` (pointer + touch sensors); up/down arrows
  are the always-available baseline reorder.

Real beer data, registration/session endpoints, and ballot-cast persistence are intentionally out of
scope here and tracked in `backlog/03-beer_backend_and_integration.md`.

## Sub-stories

Delivered incrementally; each is independently demoable:

1. [02.1 — Frontend scaffold + mock data + session layer](02.1-frontend_scaffold_and_mock_data.md)
2. [02.2 — Registration form](02.2-registration_form.md)
3. [02.3 — Beer picker](02.3-beer_picker.md)
4. [02.4 — Tasted list + VOTE button](02.4-tasted_list_and_vote_button.md)
5. [02.5 — Ballot ranking + drag/drop](02.5-ballot_ranking_and_dragdrop.md)
6. [02.6 — Cast ballot + confirmation modals](02.6-cast_ballot_and_modals.md)
