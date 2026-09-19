# CivicPulse AI

**Civic Intelligence Platform** — A full-stack web application that converts resident complaints into operational intelligence for municipal operations teams.

🌐 **Live Demo:** [https://anubhavsingh311.github.io/CivicPulse-AI/](https://anubhavsingh311.github.io/CivicPulse-AI/)

---

## Overview

CivicPulse AI ingests civic complaints submitted by residents and surfaces patterns — complaint clusters, emerging issues, geographic hotspots, and next-day volume forecasts — so operations teams can act before problems escalate. The platform has two distinct user experiences: a resident-facing request portal and an admin operations dashboard.

**Demo credentials (pre-filled on the login screen):**
- Resident: `user@civic.com` / `user123`
- Admin: `admin@civic.com` / `admin123`

---

## Features

### Resident Portal
- Submit complaints with category, location, description, and optional GPS coordinates
- Track submitted request status (Open, In Progress, Resolved, Escalated)
- Help and guidance documentation for municipal ticket categories

### Admin Operations Dashboard
- **Command Center** — Live complaint volume trends, category breakdowns, interactive ward map with severity pins, and a filterable recent incidents table
- **Emerging Issues** — AI-clustered complaint groups showing surge percentages vs. historical baselines, cluster sizes, and flagged time concentrations
- **Daily Operations Briefing** — Auto-generated synthesized briefing with deterministic evidence backing and prioritized dispatch recommendations
- **Incident Explorer** — Full searchable, filterable, and sortable complaint database with status management and detail drawer
- **Request Desk** — Admin triage view of resident-submitted tickets

### ML Forecasting
- A trained linear lag model (scikit-learn) forecasts next-day complaint volume
- Features: day, month, weekday, week-of-year, open complaint count, category/locality diversity, lag-1, lag-7, and 7-day rolling average
- Exposed via `GET /api/prediction/next-day`

---

## Architecture

```
CivicPulse AI
├── frontend/          # Vanilla JS SPA — deployed to GitHub Pages
│   ├── index.html              # Auth (login / register)
│   ├── admin-command.html      # Command Center
│   ├── admin-emerging.html     # Emerging Issues
│   ├── admin-briefing.html     # Daily Briefing
│   ├── admin-explorer.html     # Incident Explorer
│   ├── admin-requests.html     # Request Desk (admin)
│   ├── user-request.html       # Submit a complaint (resident)
│   ├── user-my-requests.html   # My requests (resident)
│   ├── user-help.html          # Help & docs
│   ├── app.js                  # Main application controller
│   ├── shared.js               # Session management, shared helpers
│   ├── data.js                 # Static mock/seed data
│   └── style.css               # Design system (~38KB)
│
├── backend/           # FastAPI + Supabase — deployable to Render
│   ├── main.py                 # App entry point, CORS config
│   ├── routes/
│   │   ├── dashboard.py        # GET /api/dashboard (Supabase RPC)
│   │   ├── incidents.py        # GET /api/incidents, POST /api/incident
│   │   └── prediction.py       # GET /api/model/status, /api/prediction/next-day
│   ├── services/
│   │   └── ml_service.py       # Model loading, feature engineering, forecasting
│   ├── database/
│   │   └── supabase_client.py  # Supabase client initialisation
│   ├── model/
│   │   └── complaint_prediction_model.pkl  # Trained lag model
│   ├── requirements.txt
│   ├── render.yaml             # One-click Render deploy config
│   └── .env.example
│
└── notebook/
    ├── CivicPulse_notebook.ipynb             # EDA, feature engineering, model training
    └── civicpulse_synthetic_complaints.csv   # Synthetic training dataset (~12K rows)
```

**Frontend** is zero-dependency vanilla JavaScript. **Backend** is FastAPI backed by Supabase (PostgreSQL). The frontend is statically hosted on GitHub Pages; the backend is designed for Render.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS, HTML5, CSS3 (no framework) |
| Backend | Python 3, FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL) |
| ML | scikit-learn, pandas, numpy, joblib |
| Hosting (frontend) | GitHub Pages |
| Hosting (backend) | Render |
| CI/CD | GitHub Actions |

---

## Local Setup

### Frontend

The frontend is a static multi-page app with no build step. Serve it from the `frontend/` directory using any static server:

```bash
# Python
cd frontend
python3 -m http.server 5500

# Node (npx)
npx serve frontend
```

Open `http://localhost:5500`.

### Backend

**Prerequisites:** Python 3.10+

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate      # macOS/Linux
.venv\Scripts\activate         # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in your SUPABASE_URL and SUPABASE_ANON_KEY
```

```bash
uvicorn main:app --reload
```

API available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public anon key (safe to expose; protected by RLS) |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `https://anubhavsingh311.github.io`). Set to `*` to allow all. |

**Never commit or hardcode a Supabase `service_role` key.**

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check; verifies Supabase connectivity |
| `GET` | `/api/dashboard` | Full dashboard JSON via Supabase RPC (`get_dashboard_data`) |
| `GET` | `/api/incidents` | Paginated complaint list (`?limit=50&offset=0`) |
| `POST` | `/api/incident` | Create a new resident complaint |
| `GET` | `/api/model/status` | ML model load status and feature list |
| `GET` | `/api/prediction/next-day` | Next-day complaint volume forecast |

### POST `/api/incident` — Request Body

```json
{
  "category": "Water Supply",
  "location": "Sector 12, Block C",
  "description": "No water supply since this morning.",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "user_email": "resident@example.com"
}
```

---

## Database Schema

The `main_data` table in Supabase stores all complaints:

| Column | Type | Notes |
|---|---|---|
| `incident_id` | text | Format: `CP-<timestamp>` |
| `timestamp` | timestamptz | UTC ISO 8601 |
| `category` | text | Complaint category |
| `locality` | text | Ward or sector name |
| `latitude` | float | Optional |
| `longitude` | float | Optional |
| `text` | text | Full complaint description |
| `status` | text | `Open`, `In Progress`, `Resolved`, `Escalated` |

The dashboard endpoint calls the `get_dashboard_data` PostgreSQL RPC function, which should aggregate this table into the summary JSON expected by the frontend.

---

## ML Model

The model (`complaint_prediction_model.pkl`) is a **daily volume forecasting model**, not a text classifier. It predicts how many complaints will be filed the following day based on recent historical patterns.

The saved bundle contains:
```python
{"model": linear_lag_model, "features": [...feature names...]}
```

**Features used for prediction:**

| Feature | Description |
|---|---|
| `day`, `month`, `weekday`, `week` | Calendar features for the target date |
| `open_complaints` | Count of currently open tickets |
| `categories` | Number of distinct active categories |
| `localities` | Number of distinct active localities |
| `lag_1` | Previous day's complaint count |
| `lag_7` | Complaint count 7 days prior |
| `rolling_7` | 7-day rolling average (shifted by 1) |

Requires at least 8 days of data in `main_data` to compute lag features.

---

## Deployment

### Frontend (GitHub Pages)

Deployment is automated via GitHub Actions on every push to `main`. The workflow uploads the `frontend/` directory as a static artifact.

```yaml
# .github/workflows/static.yml — already configured
# Push to main → auto-deploys to GitHub Pages
```

### Backend (Render)

A `render.yaml` is included for one-click deployment:

```
Build command:  pip install -r requirements.txt
Start command:  uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set these environment variables in your Render service dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `FRONTEND_URL`

---

## Notebook

`notebook/CivicPulse_notebook.ipynb` documents the full ML pipeline:

1. EDA on `civicpulse_synthetic_complaints.csv` (~12,000 synthetic complaints across 10 civic categories)
2. Feature engineering — daily aggregations, lag features, rolling averages
3. Model training and evaluation (cross-validation, grid search)
4. Model serialisation with `joblib` → `complaint_prediction_model.pkl`

To run:
```bash
pip install jupyter pandas numpy matplotlib seaborn scikit-learn scipy
jupyter notebook notebook/CivicPulse_notebook.ipynb
```

---

## License

Apache License 2.0 — see [LICENSE](./LICENSE) for details.
