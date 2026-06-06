from flask import Flask, jsonify, render_template_string
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Sample data for ranked choice voting
sample_ballots = [
    {
        "id": 1,
        "choices": ["Alice", "Bob", "Charlie"],
        "votes": [1, 2, 3]
    },
    {
        "id": 2,
        "choices": ["Bob", "Alice", "Charlie"],
        "votes": [1, 2, 3]
    },
    {
        "id": 3,
        "choices": ["Charlie", "Alice", "Bob"],
        "votes": [1, 2, 3]
    }
]

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
            <div class="choice">1st Choice: Alice</div>
            <div class="choice">2nd Choice: Bob</div>
            <div class="choice">3rd Choice: Charlie</div>
            <button class="vote-button" onclick="submitVote(1)">Submit Vote</button>
        </div>
        
        <div class="ballot">
            <h2>Ballot 2</h2>
            <div class="choice">1st Choice: Bob</div>
            <div class="choice">2nd Choice: Alice</div>
            <div class="choice">3rd Choice: Charlie</div>
            <button class="vote-button" onclick="submitVote(2)">Submit Vote</button>
        </div>
        
        <div class="ballot">
            <h2>Ballot 3</h2>
            <div class="choice">1st Choice: Charlie</div>
            <div class="choice">2nd Choice: Alice</div>
            <div class="choice">3rd Choice: Bob</div>
            <button class="vote-button" onclick="submitVote(3)">Submit Vote</button>
        </div>
        
        <div id="result"></div>
    </div>

    <script>
        function submitVote(ballotId) {
            fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ballot_id: ballotId
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('result').innerHTML = 
                    '<h3>Vote Submitted!</h3><p>' + data.message + '</p>';
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    </script>
</body>
</html>
''')

@app.route('/api/ballots')
def get_ballots():
    return jsonify(sample_ballots)

@app.route('/api/vote', methods=['POST'])
def vote():
    return jsonify({"message": "Vote processed successfully"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)