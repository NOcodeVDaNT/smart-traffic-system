from flask import Flask, jsonify, request
from datetime import datetime
import csv
import os
import joblib
import pandas as pd
from signal_logic import calculate_green_time
from signal_controller import SignalController

app = Flask(__name__)

DATA_FILE = os.path.join("data", "traffic_log.csv")
MODEL_FILE = "model.pkl"

# Load trained ML model once when server starts
model = joblib.load(MODEL_FILE)

# Initialize signal controller (persistent state machine)
controller = SignalController()


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

    # -----------------------
    # 1️⃣ Log incoming traffic
    # -----------------------
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

    # -----------------------
    # 2️⃣ Prepare ML input
    # -----------------------
    X = pd.DataFrame(
        [[data["north"], data["south"], data["east"], data["west"]]],
        columns=["north", "south", "east", "west"]
    )

    # -----------------------
    # 3️⃣ Predict next traffic
    # -----------------------
    prediction = model.predict(X)[0]

    predicted_traffic = {
        "north": int(prediction[0]),
        "south": int(prediction[1]),
        "east": int(prediction[2]),
        "west": int(prediction[3])
    }

    # -----------------------
    # 4️⃣ Calculate constrained green time
    # -----------------------
    green_time = calculate_green_time(predicted_traffic)

    # -----------------------
    # 5️⃣ Update signal controller
    # -----------------------
    controller.update_green_times(green_time)

    # -----------------------
    # 6️⃣ Return full response
    # -----------------------
    return jsonify({
        "status": "logged",
        "current_traffic": data,
        "predicted_next_traffic": predicted_traffic,
        "green_time_allocation": green_time
    })


@app.route("/signal_status")
def signal_status():
    """
    Returns live signal state:
    - current phase (NS / EW)
    - current state (GREEN / YELLOW / ALL_RED)
    - remaining time
    """
    return jsonify(controller.get_status())


if __name__ == "__main__":
    app.run(debug=True)
