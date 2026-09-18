from fastapi import APIRouter, HTTPException
from services.ml_service import forecast_next_day, model_status

router = APIRouter(tags=["ML Prediction"])


@router.get("/model/status")
def get_model_status():
    return model_status()


@router.get("/prediction/next-day")
def get_next_day_prediction():
    try:
        return forecast_next_day()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")
