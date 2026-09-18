import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.dashboard import router as dashboard_router
from routes.incidents import router as incidents_router
from routes.prediction import router as prediction_router
from database.supabase_client import supabase

app = FastAPI(
    title="CivicPulse API",
    version="1.0.0",
    description="Backend API for CivicPulse civic incident intelligence."
)

frontend_url = os.getenv("FRONTEND_URL", "*")
origins = ["*"] if frontend_url == "*" else [frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "service": "CivicPulse API"}


@app.get("/api/health")
def health():
    try:
        supabase.table("main_data").select("incident_id").limit(1).execute()
        return {"status": "ok", "supabase": "connected"}
    except Exception as exc:
        return {"status": "error", "supabase": "unavailable", "detail": str(exc)}
