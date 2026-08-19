"""Receipt service: stores voter PII and their questions/comments for follow-up,
in a store separate from the ballot-box. It never sees or references vote content
or a ballot id, so identity can't be joined to votes.
"""

from uuid import uuid4

from flask import Blueprint, request, jsonify

from backend.models import Receipt


def create_blueprint(store) -> Blueprint:
    bp = Blueprint("receipts", __name__)

    @bp.route("/api/receipt", methods=["POST"])
    def submit():
        body = request.get_json(force=True, silent=True) or {}
        user = body.get("user") or {}
        feedback = body.get("feedback") or {}

        receipt = Receipt(
            id=str(uuid4()),
            firstname=user.get("firstname", ""),
            lastname=user.get("lastname", ""),
            mobile=user.get("mobile", ""),
            phone=user.get("phone", ""),
            email=user.get("email", ""),
            comments=feedback.get("text", ""),
            contact_me=bool(feedback.get("contactMe", False)),
        )
        store.save(receipt.to_dict(), "receipt")
        return jsonify({"receiptId": receipt.id})

    return bp
