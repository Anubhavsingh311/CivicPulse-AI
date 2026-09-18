from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database.supabase_client import supabase

router = APIRouter(tags=["Incidents"])


class IncidentCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=300)
    description: str = Field(..., min_length=1, max_length=5000)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    user_email: Optional[str] = None


@router.post("/incident")
def create_incident(payload: IncidentCreate):
    """Create a resident complaint in main_data."""
    incident_id = "CP-" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")

    record = {
        "incident_id": incident_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "category": payload.category,
        "locality": payload.location,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "text": payload.description,
        "status": "Open",
    }

    try:
        response = supabase.table("main_data").insert(record).execute()
        return {
            "success": True,
            "tracking_id": incident_id,
            "incident": response.data[0] if response.data else record,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Incident insert failed: {exc}")


@router.get("/incidents")
def get_incidents(limit: int = 50, offset: int = 0):
    limit = max(1, min(limit, 500))
    offset = max(0, offset)

    try:
        response = (
            supabase.table("main_data")
            .select("*")
            .order("timestamp", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return {"data": response.data, "limit": limit, "offset": offset}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Incident fetch failed: {exc}")
