"""Password-gated admin endpoints to open and close the polls.

Each operation runs immediately when no time is given, or is scheduled when the
caller supplies one. The scheduling rules themselves live in Polls, so the UI
and the API cannot disagree about what is allowed.
"""

import hmac

from flask import Blueprint, request, jsonify


def create_blueprint(polls, password) -> Blueprint:
    bp = Blueprint("admin", __name__)

    def authorized() -> bool:
        provided = request.headers.get("X-Admin-Password")
        if provided is None:
            provided = (request.get_json(silent=True) or {}).get("password", "")
        return hmac.compare_digest(str(provided), str(password))

    def state():
        """Status plus any pending schedules, the shape every route returns."""
        return {"status": polls.status(), **polls.scheduled()}

    def run(now_fn, schedule_fn):
        if not authorized():
            return jsonify({"error": "unauthorized"}), 401
        at = (request.get_json(silent=True) or {}).get("at")
        try:
            if at:
                schedule_fn(at)
            else:
                now_fn()
        except ValueError as exc:
            return jsonify({"error": "invalid_schedule", "message": str(exc)}), 400
        return jsonify(state())

    @bp.route("/api/admin/open", methods=["POST"])
    def open_polls():
        return run(polls.open, polls.schedule_open)

    @bp.route("/api/admin/close", methods=["POST"])
    def close_polls():
        return run(polls.close, polls.schedule_close)

    @bp.route("/api/admin/cancel", methods=["POST"])
    def cancel_scheduled():
        if not authorized():
            return jsonify({"error": "unauthorized"}), 401
        op = (request.get_json(silent=True) or {}).get("op", "")
        try:
            polls.cancel(op)
        except ValueError as exc:
            return jsonify({"error": "nothing_scheduled", "message": str(exc)}), 400
        return jsonify(state())

    return bp
