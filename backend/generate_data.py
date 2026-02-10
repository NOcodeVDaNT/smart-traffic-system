import requests
import random
import time

URL = "http://127.0.0.1:5000/traffic"

for i in range(50):  # generate 50 data points
    data = {
        "north": random.randint(5, 30),
        "south": random.randint(5, 30),
        "east": random.randint(3, 20),
        "west": random.randint(3, 20)
    }

    response = requests.post(URL, json=data)
    print(f"Sent: {data} | Response: {response.status_code}")

    time.sleep(2)  # wait 2 seconds between entries
