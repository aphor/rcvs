#!/usr/bin/env python3
"""
RCVS - Ranked Choice Voting System
Backend Flask application factory.

Owns two deliberately separate SQLite stores:
  * the election store (ballotbox.db) — election/contests/candidates seeded from
    resources, plus the anonymous cast ballots. Holds NO voter PII.
  * the receipt store (receipts.db) — voter PII + comments only. Holds NO votes.
No identifier is shared between them, so identity can't be joined to votes.
"""

import os

from flask import Flask
from flask_cors import CORS


def create_app(
    ballotbox_db="ballotbox.db",
    receipts_db="receipts.db",
    resource_dir=None,
    admin_password=None,
):
    """Create and configure the Flask application and its two stores."""
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "your-secret-key-here"
    CORS(app)

    from backend.models import SqlitePersistence
    from backend.services.resources import Resources
    from backend.services.polls import Polls
    from backend.services import ballotbox, receipts, tabulator, admin
    from backend.routes import main_bp

    election_store = SqlitePersistence(ballotbox_db)
    receipt_store = SqlitePersistence(receipts_db)

    resources = Resources(resource_dir) if resource_dir else Resources()
    resources.seed(election_store)
    polls = Polls(election_store)
    password = admin_password or os.environ.get("RCVS_ADMIN_PASSWORD", "opensesame")

    app.register_blueprint(main_bp)
    app.register_blueprint(ballotbox.create_blueprint(election_store, resources, polls))
    app.register_blueprint(receipts.create_blueprint(receipt_store))
    app.register_blueprint(tabulator.create_results_blueprint(election_store, resources, polls))
    app.register_blueprint(admin.create_blueprint(polls, password))

    # Exposed for tests / inspection.
    app.election_store = election_store
    app.receipt_store = receipt_store
    app.resources = resources
    app.polls = polls
    return app


if __name__ == "__main__":
    create_app().run(debug=True, host="0.0.0.0", port=5055)
