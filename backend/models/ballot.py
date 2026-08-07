import hashlib
import json
from typing import List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime


class BallotStatus(Enum):
    BLANK = "blank"
    ISSUED = "issued"
    VOTED = "voted"
    COUNTED = "counted"
    SPOILED = "spoiled"


@dataclass
class Ballot:
    id: str
    election_id: str = ""
    contest_ids: List[str] = field(default_factory=list)
    status: BallotStatus = BallotStatus.BLANK
    voted_at: str = ""
    created_at: str = ""
    updated_at: str = ""
    cast_data: Dict[str, List[str]] = field(default_factory=dict)
    is_counted: bool = False
    signature: str = ""

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        if not self.updated_at:
            self.updated_at = self.created_at

    def add_contest(self, contest_id: str) -> None:
        if contest_id not in self.contest_ids:
            self.contest_ids.append(contest_id)

    def remove_contest(self, contest_id: str) -> bool:
        if contest_id in self.contest_ids:
            self.contest_ids.remove(contest_id)
            return True
        return False

    def set_status(self, status: BallotStatus) -> None:
        self.status = status
        self.updated_at = datetime.now().isoformat()
        if status == BallotStatus.VOTED and not self.voted_at:
            self.voted_at = datetime.now().isoformat()

    def cast_vote(self, contest_id: str, choices: List[str]) -> None:
        self.cast_data[contest_id] = choices
        self.set_status(BallotStatus.VOTED)
        payload = f"{self.id}:{json.dumps(self.cast_data, sort_keys=True)}:{self.voted_at}"
        self.signature = hashlib.sha256(payload.encode()).hexdigest()

    def is_valid(self) -> bool:
        return self.status in [BallotStatus.VOTED, BallotStatus.COUNTED]

    def is_blank(self) -> bool:
        return self.status == BallotStatus.BLANK

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "election_id": self.election_id,
            "contest_ids": self.contest_ids,
            "status": self.status.value,
            "voted_at": self.voted_at,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "cast_data": self.cast_data,
            "is_counted": self.is_counted,
            "signature": self.signature,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Ballot':
        status = BallotStatus(data.get("status", "blank"))
        return cls(
            id=data.get("id"),
            election_id=data.get("election_id", ""),
            contest_ids=data.get("contest_ids", []),
            status=status,
            voted_at=data.get("voted_at", ""),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
            cast_data=data.get("cast_data", {}),
            is_counted=data.get("is_counted", False),
            signature=data.get("signature", ""),
        )
