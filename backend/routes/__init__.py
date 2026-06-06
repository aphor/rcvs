"""Routes package for RCVS application."""

from flask import Blueprint

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return {'message': 'RCVS - Ranked Choice Voting System API'}