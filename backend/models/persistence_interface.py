from typing import Dict, Any


class PersistenceInterface:
    """Abstract base class defining the interface for persistence implementations."""

    def save(self, data: Dict[str, Any], model_type: str) -> bool:
        raise NotImplementedError("save method must be implemented by subclasses")

    def load(self, model_type: str, record_id: str) -> Dict[str, Any]:
        raise NotImplementedError("load method must be implemented by subclasses")

    def load_all(self, model_type: str) -> "list[Dict[str, Any]]":
        raise NotImplementedError("load_all method must be implemented by subclasses")

    def delete(self, model_type: str, identifier: str) -> bool:
        raise NotImplementedError("delete method must be implemented by subclasses")

    def exists(self, model_type: str, identifier: str) -> bool:
        raise NotImplementedError("exists method must be implemented by subclasses")
