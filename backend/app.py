from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import sqlite3
from datetime import datetime

# -----------------------------
# FastAPI Setup
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Load Model
# -----------------------------
model = joblib.load("model.pkl")

# -----------------------------
# Setup SQLite Database
# -----------------------------
conn = sqlite3.connect("predictions.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT,
    months_selected INTEGER,
    total_sales REAL
)
""")
conn.commit()


@app.get("/")
def home():
    return {"message": "Demand Forecast API running 🚀"}


@app.get("/forecast")
def forecast(months: int = 2):

    future = model.make_future_dataframe(periods=30 * months)
    forecast = model.predict(future)

    result = forecast[["ds", "yhat"]].tail(30 * months)

    total_sales = float(result["yhat"].sum())

    # Save into SQLite
    cursor.execute("""
        INSERT INTO predictions (created_at, months_selected, total_sales)
        VALUES (?, ?, ?)
    """, (datetime.now().isoformat(), months, total_sales))

    conn.commit()

    return result.to_dict(orient="records")


@app.get("/history")
def get_history():
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
    rows = cursor.fetchall()

    history = []
    for row in rows:
        history.append({
            "id": row[0],
            "created_at": row[1],
            "months_selected": row[2],
            "total_sales": row[3]
        })

    return history