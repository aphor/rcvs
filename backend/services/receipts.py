"""Receipt service: stores voter PII and their questions/comments for follow-up,
in a store separate from the ballot-box. It never sees or references vote content
or a ballot id, so identity can't be joined to votes.
"""

from uuid import uuid4

from flask import Blueprint, request, jsonify

from backend.models import Receipt
from backend.services.polls import CLOSED, OPEN

# A receipt that did not accompany a vote, because voting had not started or
# had already finished, is recorded as such.
_RECEIPT_TYPE = {OPEN: "vote", CLOSED: "after_close"}

# The registration form's contact fields, all optional.
_CONTACT_FIELDS = ("firstname", "lastname", "mobile", "phone", "email")


def client_ip() -> str:
    """The address our own proxy saw the request come from.

    lighttpd appends its view of the peer to any X-Forwarded-For the visitor
    sent, so the rightmost entry is the only one a visitor cannot forge.
    """
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded.strip():
        return forwarded.split(",")[-1].strip()
    return request.remote_addr or ""


def create_blueprint(store, polls) -> Blueprint:
    bp = Blueprint("receipts", __name__)

    @bp.route("/api/receipt", methods=["POST"])
    def submit():
        body = request.get_json(force=True, silent=True) or {}
        user = body.get("user") or {}
        feedback = body.get("feedback") or {}

        contact = {f: str(user.get(f) or "").strip() for f in _CONTACT_FIELDS}
        # Every contact field is optional. With none of them filled in there is
        # nothing to follow up on, so stand the requesting address in for a name
        # rather than filing an entirely blank receipt.
        if not any(contact.values()):
            contact["firstname"] = client_ip()

        receipt = Receipt(
            id=str(uuid4()),
            firstname=contact["firstname"],
            lastname=contact["lastname"],
            mobile=contact["mobile"],
            phone=contact["phone"],
            email=contact["email"],
            comments=feedback.get("text", ""),
            contact_me=bool(feedback.get("contactMe", False)),
            receipt_type=_RECEIPT_TYPE.get(polls.status(), "before_open"),
        )
        store.save(receipt.to_dict(), "receipt")
        return jsonify({"receiptId": receipt.id})

    return bp
