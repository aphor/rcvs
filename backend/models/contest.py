from typing import Dict, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Contest:
    id: str
    name: str
    election_id: str
    description: str = ""
    start_date: str = ""
    end_date: str = ""
    created_at: str = ""

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "election_id": self.election_id,
            "description": self.description,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Contest':
        return cls(
            id=data.get("id"),
            name=data.get("name"),
            election_id=data.get("election_id"),
            description=data.get("description", ""),
            start_date=data.get("start_date", ""),
            end_date=data.get("end_date", ""),
            created_at=data.get("created_at", ""),
        )
