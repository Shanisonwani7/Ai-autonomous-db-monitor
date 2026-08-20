from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from App.services.anomalyDetector import detect_anomalies


router = APIRouter(
    prefix="/anomaly",
    tags=["Anomaly Detection"],
)


class AnomalyRequest(BaseModel):
    database: str
    history: list[dict] = Field(default_factory=list)


@router.post("/analyze")
def analyze_anomaly(request: AnomalyRequest):
    if not request.history:
        raise HTTPException(
            status_code=400,
            detail="Historical monitoring data is required",
        )

    result = detect_anomalies(
        request.history
    )

    return {
        "success": True,
        "database": request.database,
        "anomaly": result,
    }