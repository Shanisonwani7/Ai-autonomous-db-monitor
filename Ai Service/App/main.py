from fastapi import FastAPI

from App.routes.ai import router as ai_router
from App.routes.prediction import router as prediction_router

app = FastAPI(
    title="AI Autonomous Database Monitoring - AI Service",
    version="1.0.0",
)

app.include_router(ai_router)
app.include_router(prediction_router)


@app.get("/health")
def health_check():
    return {
        "success": True,
        "service": "AI Service",
        "status": "healthy",
    }