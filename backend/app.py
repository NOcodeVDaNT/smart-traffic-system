from flask import Flask, jsonify, request
from datetime import datetime
import csv
import os
import joblib
import pandas as pd

app = Flask(__name__)

DATA_FILE = os.path.join("data", "traffic_log.csv")
MODEL_FILE = "model.pkl"

# Load trained ML model
model = joblib.load(MODEL_FILE)

@app.route("/")
def home():
    return "Smart Traffic System Backend is running"

@app.route("/health")
def health():
    return jsonify({
        "status": "OK",
        "message": "Backend server is alive"
    })

@app.route("/traffic", methods=["POST"])
def receive_traffic():
    data = request.json

    # Log data
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    row = [
        timestamp,
        data["north"],
        data["south"],
        data["east"],
        data["west"]
    ]

    with open(DATA_FILE, mode="a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(row)

    # Prepare input for ML
    X = pd.DataFrame([[data["north"], data["south"], data["east"], data["west"]]],
                     columns=["north", "south", "east", "west"])

    prediction = model.predict(X)[0]

    predicted_traffic = {
        "north": int(prediction[0]),
        "south": int(prediction[1]),
        "east": int(prediction[2]),
        "west": int(prediction[3])
    }

    return jsonify({
        "status": "logged",
        "current_traffic": data,
        "predicted_next_traffic": predicted_traffic
    })

if __name__ == "__main__":
    app.run(debug=True)
