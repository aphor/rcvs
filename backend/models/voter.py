from typing import Dict, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Voter:
    id: str
    username: str
    email: str = ""
    created_at: str = ""

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Voter':
        return cls(
            id=data.get("id"),
            username=data.get("username"),
            email=data.get("email", ""),
            created_at=data.get("created_at", ""),
        )
