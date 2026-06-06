# RCVS - Ranked Choice Voting System

A mobile-friendly web application for conducting ranked choice voting elections.

## Project Overview

This project implements a Ranked Choice Voting system with a modern mobile-first web interface. The application allows users to:
- Create and manage voting elections
- Cast ranked votes for candidates
- View real-time election results
- Export election data

## Features

- Mobile-responsive UI
- Real-time election result calculation
- Support for multiple voting methods (single transferable vote, instant runoff, etc.)
- Secure voter authentication
- Election data export capabilities

## Technology Stack

- **Backend**: Python 3.14
- **Frontend**: Modern JavaScript with mobile-first design
- **Database**: SQLite (with potential for PostgreSQL/MySQL support)
- **Framework**: Flask (for API) + React/Vue.js (for UI)

## Getting Started

### Prerequisites

- Python 3.14
- Node.js (for frontend development)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rcvs.git
cd rcvs

# Set up Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
npm install  # or yarn install
```

### Running the Application

```bash
# Start the backend server
python app.py

# Start the frontend development server (in another terminal)
npm run dev  # or yarn dev
```

## Project Structure

```
rcvs/
├── backend/           # Python Flask API
│   ├── app.py
│   ├── models/
│   ├── routes/
│   └── requirements.txt
├── frontend/          # React/Vue.js Mobile UI
│   ├── public/
│   └── src/
├── tests/             # Unit and integration tests
├── docs/              # Documentation
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.