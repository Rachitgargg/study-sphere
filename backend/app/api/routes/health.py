from fastapi import APIRouter
from app.models.schemas import HealthCheck

router = APIRouter()

@router.get("", response_model=HealthCheck)
async def get_health():
    """
    Health check endpoint to verify server status.
    Returns standard healthy status and version.
    """
    return HealthCheck(status="healthy")
