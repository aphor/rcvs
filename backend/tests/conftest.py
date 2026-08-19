import pytest

from backend.app import create_app


@pytest.fixture
def app(tmp_path):
    return create_app(
        ballotbox_db=str(tmp_path / "ballotbox.db"),
        receipts_db=str(tmp_path / "receipts.db"),
    )


@pytest.fixture
def client(app):
    return app.test_client()
