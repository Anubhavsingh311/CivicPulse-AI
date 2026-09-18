from fastapi import APIRouter, HTTPException
from database.supabase_client import supabase

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard():
    """Return the complete dashboard JSON from the Supabase RPC function."""
    try:
        response = supabase.rpc("get_dashboard_data").execute()
        return response.data
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Dashboard failed: {exc}")
