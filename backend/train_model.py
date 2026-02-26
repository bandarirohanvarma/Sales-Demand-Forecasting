import pandas as pd
from prophet import Prophet
import joblib

# Load dataset
df = pd.read_csv("train.csv")

# Filter single store + item (simplify)
df = df[(df["store"] == 1) & (df["item"] == 1)]

# Rename columns for Prophet
df = df.rename(columns={"date": "ds", "sales": "y"})

df["ds"] = pd.to_datetime(df["ds"])

# Train Prophet model
model = Prophet()
model.fit(df)

# Save model
joblib.dump(model, "model.pkl")

print("Model trained and saved!")