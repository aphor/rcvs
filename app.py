#!/usr/bin/env python3
"""Root entrypoint. The real application lives in the backend app factory
(`backend/app.py`); this thin shim keeps `python app.py` and `gunicorn app:app`
working.
"""

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5055)
