from datetime import datetime, timedelta, timezone
from pathlib import Path
import pickle

import pandas as pd

from database.supabase_client import supabase

MODEL_PATH = Path(__file__).resolve().parent.parent / "model" / "complaint_prediction_model.pkl"

_model_bundle = None
_model_error = None


def load_model():
    global _model_bundle, _model_error

    if _model_bundle is not None:
        return _model_bundle

    if not MODEL_PATH.exists():
        _model_error = f"Model file not found: {MODEL_PATH}"
        return None

    try:
        with MODEL_PATH.open("rb") as f:
            _model_bundle = pickle.load(f)
        _model_error = None
        return _model_bundle
    except Exception as exc:
        _model_error = str(exc)
        return None


def model_status():
    bundle = load_model()
    return {
        "loaded": bundle is not None,
        "model_path": str(MODEL_PATH),
        "features": bundle.get("features", []) if isinstance(bundle, dict) else [],
        "error": _model_error,
    }


def _load_training_data():
    """Fetch the columns needed to reproduce the notebook's daily features."""
    rows = []
    start = 0
    page_size = 1000

    while True:
        response = (
            supabase.table("main_data")
            .select("timestamp,status,category,locality")
            .range(start, start + page_size - 1)
            .execute()
        )
        batch = response.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size

    if not rows:
        raise RuntimeError("main_data contains no rows.")

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp"]).copy()
    df["status"] = df["status"].fillna("Unknown").astype(str).str.title()
    df["date"] = df["timestamp"].dt.date

    daily = (
        df.groupby("date")
        .agg(
            total_complaints=("timestamp", "size"),
            open_complaints=("status", lambda s: (s == "Open").sum()),
            categories=("category", "nunique"),
            localities=("locality", "nunique"),
        )
        .reset_index()
    )

    daily["date"] = pd.to_datetime(daily["date"])
    daily = daily.sort_values("date").reset_index(drop=True)

    daily["day"] = daily["date"].dt.day
    daily["month"] = daily["date"].dt.month
    daily["weekday"] = daily["date"].dt.weekday
    daily["week"] = daily["date"].dt.isocalendar().week.astype(int)
    daily["lag_1"] = daily["total_complaints"].shift(1)
    daily["lag_7"] = daily["total_complaints"].shift(7)
    daily["rolling_7"] = daily["total_complaints"].shift(1).rolling(7).mean()

    return daily


def forecast_next_day():
    bundle = load_model()
    if bundle is None:
        raise RuntimeError(_model_error or "Model unavailable.")

    if not isinstance(bundle, dict) or "model" not in bundle or "features" not in bundle:
        raise RuntimeError("The saved model is not in the expected {model, features} format.")

    daily = _load_training_data()

    if len(daily) < 8:
        raise RuntimeError("At least 8 daily records are needed for lag_7 forecasting.")

    latest = daily.iloc[-1]
    next_date = latest["date"] + timedelta(days=1)

    row = pd.DataFrame([{
        "day": next_date.day,
        "month": next_date.month,
        "weekday": next_date.weekday(),
        "week": int(next_date.isocalendar().week),
        "open_complaints": int(latest["open_complaints"]),
        "categories": int(latest["categories"]),
        "localities": int(latest["localities"]),
        "lag_1": float(latest["total_complaints"]),
        "lag_7": float(daily.iloc[-7]["total_complaints"]),
        "rolling_7": float(daily["total_complaints"].shift(1).tail(7).mean()),
    }])

    features = bundle["features"]
    missing = [f for f in features if f not in row.columns]
    if missing:
        raise RuntimeError(f"Missing model features: {missing}")

    prediction = float(bundle["model"].predict(row[features])[0])

    return {
        "date": next_date.date().isoformat(),
        "predicted_complaints": max(0, round(prediction, 2)),
        "model_features": features,
        "based_on_latest_date": latest["date"].date().isoformat(),
    }
