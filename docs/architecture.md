# RCVS - Ranked Choice Voting System Architecture

## Overview

The RCVS system is designed as a mobile-first web application for conducting ranked choice voting elections. It follows a clean architecture approach with separate concerns for the backend API and frontend user interface.

## System Components

### 1. Backend (Python/Flask)
- **Framework**: Flask
- **Database**: SQLite with potential for PostgreSQL/MySQL
- **Authentication**: Flask-Login
- **API Endpoints**: RESTful API for election management, voting, and results

### 2. Frontend (React)
- **Framework**: React with React Router
- **Mobile-First Design**: Responsive layout optimized for mobile devices
- **State Management**: React Context API or Redux (to be determined)
- **UI Components**: Custom-designed components for voting interface

## Data Flow

1. User accesses the mobile web application
2. User authenticates or registers (if required)
3. Application fetches election data from the backend API
4. User casts ranked votes through the UI
5. Votes are submitted to the backend for processing
6. Backend calculates results using ranked choice algorithms
7. Results are returned to the frontend for display

## API Endpoints

### Elections
- `GET /api/elections` - List all elections
- `POST /api/elections` - Create a new election
- `GET /api/elections/{id}` - Get election details
- `PUT /api/elections/{id}` - Update election
- `DELETE /api/elections/{id}` - Delete election

### Candidates
- `GET /api/elections/{election_id}/candidates` - List candidates for an election
- `POST /api/elections/{election_id}/candidates` - Add candidate to election

### Votes
- `POST /api/elections/{election_id}/votes` - Submit a vote for an election

### Results
- `GET /api/elections/{election_id}/results` - Get current election results

## Database Schema (SQLite)

### Elections Table
- `id`: Primary key
- `name`: Election name
- `description`: Election description
- `start_date`: When the election starts
- `end_date`: When the election ends
- `created_at`: Timestamp of creation

### Candidates Table
- `id`: Primary key
- `election_id`: Foreign key to Elections table
- `name`: Candidate name
- `description`: Candidate description

### Voters Table
- `id`: Primary key
- `username`: Unique identifier for voter
- `email`: Voter email (optional)
- `created_at`: Timestamp of creation

### Votes Table
- `id`: Primary key
- `election_id`: Foreign key to Elections table
- `voter_id`: Foreign key to Voters table
- `candidate_id`: Foreign key to Candidates table
- `rank`: Rank order (1 = highest preference)
- `timestamp`: When the vote was cast

## Technology Stack

### Backend
- Python 3.14
- Flask (Web Framework)
- SQLAlchemy (Database ORM)
- Werkzeug (Utility library)

### Frontend
- React 18+
- React Router
- Vite (Build tool)
- Responsive design with mobile-first approach

### Development Tools
- pytest (Testing)
- black (Code formatting)
- flake8 (Linting)

## Deployment Considerations

### Production
- Reverse proxy (nginx or Apache) to handle HTTPS
- Gunicorn or uWSGI for WSGI server
- Database migration strategy (Alembic or similar)

### Mobile UI Considerations
- Responsive design for all screen sizes
- Touch-friendly interface elements
- Fast loading times with optimized assets
- Offline capability where possible