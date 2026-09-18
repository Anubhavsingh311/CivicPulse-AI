# CivicPulse Backend

FastAPI + Supabase + the team's trained complaint prediction model.

## Important model detail

The supplied `complaint_prediction_model.pkl` is a **daily complaint-volume forecasting model**, not a complaint-text category classifier.

The notebook saved:
```python
{"model": linear_lag_model, "features": features}
```

The backend therefore exposes:
- `GET /api/prediction/next-day` for next-day complaint-volume prediction.
- It does not pretend that the forecasting model can classify a new complaint.

## 1. Setup

macOS/Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows:
```powershell
python -m venv .venv
.venv\Scripts\activate
```

Install:
```bash
pip install -r requirements.txt
```

Create `.env` from `.env.example` and add the Supabase URL and anon public key.

## 2. Run

```bash
uvicorn main:app --reload
```

Swagger:
```text
http://127.0.0.1:8000/docs
```

## 3. APIs

```text
GET  /api/health
GET  /api/dashboard
GET  /api/incidents
POST /api/incident
GET  /api/model/status
GET  /api/prediction/next-day
```

## 4. Supabase

The dashboard endpoint calls the PostgreSQL RPC:
```text
get_dashboard_data
```

The `main_data` table should contain the dataset columns:
```text
incident_id
timestamp
category
locality
latitude
longitude
text
status
```

## 5. Render

Create a Render Web Service from this backend directory.

Build:
```text
pip install -r requirements.txt
```

Start:
```text
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Add these Render environment variables:
```text
SUPABASE_URL
SUPABASE_ANON_KEY
FRONTEND_URL
```

Do not put the anon key directly into frontend JavaScript or commit `.env`.


## Hardcoded public Supabase key

This build has the Supabase project URL and **public anon key** hardcoded in
`database/supabase_client.py`, as requested. The anon key is not a secret;
access is controlled by Supabase Row Level Security (RLS).

Never hardcode or commit a Supabase `service_role`/secret key.
