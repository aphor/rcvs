from typing import Dict, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Receipt:
    """A voter's identity + free-text feedback, held by the receipt service.

    This is deliberately separate from the anonymous Ballot: it carries PII and
    comments for follow-up, and never references a ballot or any vote content.
    """

    id: str
    firstname: str = ""
    lastname: str = ""
    mobile: str = ""
    phone: str = ""
    email: str = ""
    comments: str = ""
    contact_me: bool = False
    created_at: str = ""

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "mobile": self.mobile,
            "phone": self.phone,
            "email": self.email,
            "comments": self.comments,
            "contact_me": self.contact_me,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Receipt":
        return cls(
            id=data.get("id"),
            firstname=data.get("firstname", ""),
            lastname=data.get("lastname", ""),
            mobile=data.get("mobile", ""),
            phone=data.get("phone", ""),
            email=data.get("email", ""),
            comments=data.get("comments", ""),
            contact_me=data.get("contact_me", False),
            created_at=data.get("created_at", ""),
        )
