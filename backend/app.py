#!/usr/bin/env python3
"""
RCVS - Ranked Choice Voting System
Backend Flask Application
"""

from flask import Flask
from flask_cors import CORS

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    
    # Enable CORS for all routes
    CORS(app)
    
    # Import and register blueprints
    from backend.routes import main_bp
    
    app.register_blueprint(main_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)