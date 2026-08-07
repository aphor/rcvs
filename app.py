from flask import Flask, jsonify, render_template_string
from flask_cors import CORS
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.models import Contest, Candidate, Election, Ballot, BallotStatus, Voter, Persistent, SqlitePersistence

app = Flask(__name__)
CORS(app)

sample_election = Election(
    id="election-1",
    name="Sample Election",
    description="A sample election containing multiple contests",
)

sample_contests = [
    Contest(
        id="rcv-1",
        name="Sample Ranked Choice Voting Contest",
        election_id="election-1",
        description="A sample contest to demonstrate RCV functionality",
    ),
]

sample_candidates = [
    Candidate(
        id="cand-1",
        contest_id="rcv-1",
        name="Alice Johnson",
        description="Experienced in local government and community organizing",
    ),
    Candidate(
        id="cand-2",
        contest_id="rcv-1",
        name="Bob Smith",
        description="Business leader with focus on economic development",
    ),
    Candidate(
        id="cand-3",
        contest_id="rcv-1",
        name="Charlie Brown",
        description="Advocate for environmental protection and social justice",
    ),
]

sample_ballots = [
    Ballot(
        id="ballot-1",
        election_id="election-1",
        contest_ids=["rcv-1"],
        status=BallotStatus.ISSUED,
    ),
    Ballot(
        id="ballot-2",
        election_id="election-1",
        contest_ids=["rcv-1"],
        status=BallotStatus.VOTED,
        cast_data={"rcv-1": ["Alice Johnson", "Bob Smith", "Charlie Brown"]},
    ),
    Ballot(
        id="ballot-3",
        election_id="election-1",
        contest_ids=["rcv-1"],
        status=BallotStatus.COUNTED,
    ),
]

sample_voters = [
    Voter(id="voter-1", username="alice_v", email="alice@example.com"),
    Voter(id="voter-2", username="bob_v", email="bob@example.com"),
]

# Example of how to use the SqlitePersistence implementation
# sqlite_persistence = SqlitePersistence("rcv_database.db")

@app.route('/')
def index():
    return render_template_string('''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ranked Choice Voting System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
        }
        .ballot {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .choice {
            margin: 5px 0;
            padding: 5px;
            background-color: #ecf0f1;
            border-radius: 3px;
        }
        .vote-button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        .vote-button:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Ranked Choice Voting System</h1>

        <div class="ballot">
            <h2>Ballot 1</h2>
            <div class="choice">1st Choice: Alice Johnson</div>
            <div class="choice">2nd Choice: Bob Smith</div>
            <div class="choice">3rd Choice: Charlie Brown</div>
            <button class="vote-button" onclick="submitVote(1)">Submit Vote</button>
        </div>

        <div class="ballot">
            <h2>Ballot 2</h2>
            <div class="choice">1st Choice: Bob Smith</div>
            <div class="choice">2nd Choice: Alice Johnson</div>
            <div class="choice">3rd Choice: Charlie Brown</div>
            <button class="vote-button" onclick="submitVote(2)">Submit Vote</button>
        </div>

        <div class="ballot">
            <h2>Ballot 3</h2>
            <div class="choice">1st Choice: Charlie Brown</div>
            <div class="choice">2nd Choice: Alice Johnson</div>
            <div class="choice">3rd Choice: Bob Smith</div>
            <button class="vote-button" onclick="submitVote(3)">Submit Vote</button>
        </div>

        <div id="result"></div>
    </div>

    <script>
        function submitVote(ballotId) {
            fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ballot_id: ballotId })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('result').innerHTML =
                    '<h3>Vote Submitted!</h3><p>' + data.message + '</p>';
            })
            .catch(error => { console.error('Error:', error); });
        }
    </script>
</body>
</html>
''')

@app.route('/api/elections')
def get_elections():
    return jsonify(sample_election.to_dict())

@app.route('/api/contests')
def get_contests():
    return jsonify([c.to_dict() for c in sample_contests])

@app.route('/api/candidates')
def get_candidates():
    return jsonify([c.to_dict() for c in sample_candidates])

@app.route('/api/ballots')
def get_ballots():
    return jsonify([b.to_dict() for b in sample_ballots])

@app.route('/api/voters')
def get_voters():
    return jsonify([v.to_dict() for v in sample_voters])

@app.route('/api/vote', methods=['POST'])
def vote():
    return jsonify({"message": "Vote processed successfully"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
