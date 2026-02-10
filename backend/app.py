from flask import Flask, jsonify, request
from datetime import datetime
import csv
import os

app = Flask(__name__)

DATA_FILE = os.path.join("data", "traffic_log.csv")

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

    return jsonify({
        "status": "logged",
        "data": row
    })

if __name__ == "__main__":
    app.run(debug=True)
