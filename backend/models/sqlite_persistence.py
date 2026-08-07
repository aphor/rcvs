import sqlite3
import json
from typing import Dict, Any, Type
from .persistence_interface import PersistenceInterface
from .contest import Contest
from .candidate import Candidate
from .election import Election
from .ballot import Ballot
from .voter import Voter
from .persistent import Persistent


class SqlitePersistence(PersistenceInterface):
    """
    SQLite persistence implementation that stores model objects as JSON blobs
    in a simple (id, data) schema, one table per model type.
    """

    def __init__(self, db_path: str = "rcv_data.db"):
        self.db_path = db_path
        self.connection = None
        self._ensure_database_initialized()

    def _ensure_database_initialized(self):
        self.connection = sqlite3.connect(self.db_path)
        self.connection.row_factory = sqlite3.Row
        self._create_tables()

    def _get_model_table_name(self, model_class: Type) -> str:
        return model_class.__name__.lower() + "s"

    def _create_tables(self):
        models = [Election, Contest, Candidate, Ballot, Voter]
        for model in models:
            table_name = self._get_model_table_name(model)
            self._create_table(table_name)

    def _create_table(self, table_name: str):
        cursor = self.connection.cursor()
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL
            )
        """)
        self.connection.commit()

    def _table_name_for_type(self, model_type: str) -> str:
        type_map = {
            "election": "elections",
            "contest": "contests",
            "candidate": "candidates",
            "ballot": "ballots",
            "voter": "voters",
        }
        return type_map.get(model_type.lower(), model_type.lower() + "s")

    def save(self, data: Dict[str, Any], model_type: str) -> bool:
        """
        Save data to SQLite database.

        Args:
            data: Dictionary representation of the object to save
            model_type: Name of the model class (e.g. "election", "contest")
        """
        try:
            table_name = self._table_name_for_type(model_type)
            serialized = json.dumps(data)
            record_id = data.get("id")

            cursor = self.connection.cursor()
            cursor.execute(f"SELECT id FROM {table_name} WHERE id = ?", (record_id,))
            if cursor.fetchone():
                cursor.execute(
                    f"UPDATE {table_name} SET data = ? WHERE id = ?",
                    (serialized, record_id),
                )
            else:
                cursor.execute(
                    f"INSERT INTO {table_name} (id, data) VALUES (?, ?)",
                    (record_id, serialized),
                )
            self.connection.commit()
            return True
        except Exception as e:
            print(f"Error saving data to SQLite: {e}")
            return False

    def load(self, model_type: str, record_id: str) -> Dict[str, Any]:
        """
        Load a single record from SQLite by model type and id.

        Args:
            model_type: Name of the model class (e.g. "election")
            record_id: The id of the record to load
        """
        try:
            table_name = self._table_name_for_type(model_type)
            cursor = self.connection.cursor()
            cursor.execute(f"SELECT data FROM {table_name} WHERE id = ?", (record_id,))
            row = cursor.fetchone()
            if row:
                return json.loads(row["data"])
            return {}
        except Exception as e:
            print(f"Error loading data from SQLite: {e}")
            return {}

    def delete(self, model_type: str, identifier: str) -> bool:
        try:
            table_name = self._table_name_for_type(model_type)
            cursor = self.connection.cursor()
            cursor.execute(f"DELETE FROM {table_name} WHERE id = ?", (identifier,))
            self.connection.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting data from SQLite: {e}")
            return False

    def exists(self, model_type: str, identifier: str) -> bool:
        try:
            table_name = self._table_name_for_type(model_type)
            cursor = self.connection.cursor()
            cursor.execute(
                f"SELECT COUNT(*) as count FROM {table_name} WHERE id = ?",
                (identifier,),
            )
            result = cursor.fetchone()
            return result["count"] > 0
        except Exception as e:
            print(f"Error checking existence in SQLite: {e}")
            return False

    def close(self):
        if self.connection:
            self.connection.close()

    def __del__(self):
        self.close()
