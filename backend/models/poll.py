"""
Poll model for Ranked Choice Voting system.

This module defines the Poll class which represents a collection
of ballots and manages their voting process.
"""

from typing import List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime


class PollStatus(Enum):
    """Enumeration of possible poll statuses."""
    OPEN = "open"
    CLOSED = "closed"


@dataclass
class Poll:
    """
    Represents a poll in a Ranked Choice Voting system.
    
    A poll is a collection of ballots and manages the voting process
    for a specific time period or location.
    """
    
    # Unique identifier for the poll
    id: str
    
    # Title or name of the poll
    title: str
    
    # Description of the poll
    description: str = ""
    
    # Poll status (open or closed)
    status: PollStatus = PollStatus.OPEN
    
    # List of ballot IDs that belong to this poll
    ballot_ids: List[str] = field(default_factory=list)
    
    # Poll start date/time
    start_date: str = ""
    
    # Poll end date/time
    end_date: str = ""
    
    # Poll creation timestamp
    created_at: str = ""
    
    # Poll modification timestamp
    updated_at: str = ""
    
    # Location information (optional)
    location: str = ""
    
    # Contact information for poll administrators
    contact_info: Dict[str, str] = field(default_factory=dict)
    
    def __post_init__(self):
        """Initialize any computed properties after object creation."""
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        
        if not self.updated_at:
            self.updated_at = self.created_at
    
    def add_ballot(self, ballot_id: str) -> None:
        """Add a ballot to this poll."""
        if ballot_id not in self.ballot_ids:
            self.ballot_ids.append(ballot_id)
    
    def remove_ballot(self, ballot_id: str) -> bool:
        """Remove a ballot from this poll."""
        if ballot_id in self.ballot_ids:
            self.ballot_ids.remove(ballot_id)
            return True
        return False
    
    def is_open(self) -> bool:
        """Check if the poll is currently open for voting."""
        return self.status == PollStatus.OPEN
    
    def close(self) -> None:
        """Close the poll."""
        self.status = PollStatus.CLOSED
        self.updated_at = datetime.now().isoformat()
    
    def open(self) -> None:
        """Open the poll."""
        self.status = PollStatus.OPEN
        self.updated_at = datetime.now().isoformat()
    
    def set_status(self, status: PollStatus) -> None:
        """Set the poll status and update timestamp."""
        self.status = status
        self.updated_at = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert poll object to dictionary representation."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status.value,
            "ballot_ids": self.ballot_ids,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "location": self.location,
            "contact_info": self.contact_info
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Poll':
        """Create a Poll instance from dictionary data."""
        status = PollStatus(data.get("status", "open"))
        
        return cls(
            id=data.get("id"),
            title=data.get("title"),
            description=data.get("description", ""),
            status=status,
            ballot_ids=data.get("ballot_ids", []),
            start_date=data.get("start_date", ""),
            end_date=data.get("end_date", ""),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
            location=data.get("location", ""),
            contact_info=data.get("contact_info", {})
        )