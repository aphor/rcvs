"""Password-gated admin endpoints to open and close the polls."""

import hmac

from flask import Blueprint, request, jsonify


def create_blueprint(polls, password) -> Blueprint:
    bp = Blueprint("admin", __name__)

    def authorized() -> bool:
        provided = request.headers.get("X-Admin-Password")
        if provided is None:
            provided = (request.get_json(silent=True) or {}).get("password", "")
        return hmac.compare_digest(str(provided), str(password))

    @bp.route("/api/admin/open", methods=["POST"])
    def open_polls():
        if not authorized():
            return jsonify({"error": "unauthorized"}), 401
        polls.open()
        return jsonify({"status": polls.status()})

    @bp.route("/api/admin/close", methods=["POST"])
    def close_polls():
        if not authorized():
            return jsonify({"error": "unauthorized"}), 401
        polls.close()
        return jsonify({"status": polls.status()})

    return bp
