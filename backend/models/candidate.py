from typing import Dict, Any
from dataclasses import dataclass


@dataclass
class Candidate:
    id: str
    contest_id: str
    name: str
    description: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "contest_id": self.contest_id,
            "name": self.name,
            "description": self.description,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Candidate':
        return cls(
            id=data.get("id"),
            contest_id=data.get("contest_id"),
            name=data.get("name"),
            description=data.get("description", ""),
        )
