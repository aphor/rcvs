from typing import Dict, Any, TypeVar, Callable
from dataclasses import dataclass
from enum import Enum


class PersistenceState(Enum):
    CLEAN = "clean"
    DIRTY = "dirty"


T = TypeVar('T')


@dataclass
class Persistent:
    """
    Proxy decorator for model objects providing CRUD operations and dirty tracking.
    """

    subject: Any
    persistence: Any
    state: PersistenceState = PersistenceState.CLEAN

    def __post_init__(self):
        if not hasattr(self.persistence, 'save') or not hasattr(self.persistence, 'load'):
            raise ValueError("Persistence implementation must have 'save' and 'load' methods")

    def _model_type(self) -> str:
        return self.subject.__class__.__name__.lower()

    def save(self) -> bool:
        try:
            data = self.subject.to_dict()
            self.persistence.save(data, self._model_type())
            self.state = PersistenceState.CLEAN
            return True
        except Exception as e:
            print(f"Error saving object: {e}")
            return False

    def load(self) -> bool:
        try:
            record_id = getattr(self.subject, 'id', None)
            raw_data = self.persistence.load(self._model_type(), record_id)
            if raw_data:
                self.subject = self.subject.__class__.from_dict(raw_data)
                self.state = PersistenceState.CLEAN
                return True
            return False
        except Exception as e:
            print(f"Error loading object: {e}")
            return False

    def mark_dirty(self) -> None:
        self.state = PersistenceState.DIRTY

    def is_clean(self) -> bool:
        return self.state == PersistenceState.CLEAN

    def is_dirty(self) -> bool:
        return self.state == PersistenceState.DIRTY

    def __getattr__(self, name: str):
        try:
            return getattr(self.subject, name)
        except AttributeError:
            raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{name}'")

    def __setattr__(self, name: str, value: Any):
        if name in ['subject', 'persistence', 'state']:
            super().__setattr__(name, value)
        else:
            if hasattr(self.subject, name):
                setattr(self.subject, name, value)
                self.mark_dirty()
            else:
                super().__setattr__(name, value)

    def to_dict(self) -> Dict[str, Any]:
        return self.subject.to_dict()

    @classmethod
    def from_dict(cls, data: Dict[str, Any], persistence: Any, subject_class: Callable) -> 'Persistent':
        subject = subject_class.from_dict(data)
        return cls(subject=subject, persistence=persistence)
