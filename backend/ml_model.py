import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Load data
df = pd.read_csv("data/traffic_log.csv")

# Create shifted dataset
X = df[["north", "south", "east", "west"]][:-1]
y = df[["north", "south", "east", "west"]][1:]

# Train model
model = LinearRegression()
model.fit(X, y)

# Save model
joblib.dump(model, "model.pkl")

print("ML model trained and saved as model.pkl")
