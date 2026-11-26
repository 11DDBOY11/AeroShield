"""Health and status router."""

from fastapi import APIRouter
from datetime import datetime, timezone
from backend.app.config import settings
from backend.app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("")
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "gemini_ai_configured": gemini_service.is_available(),
        "gemini_model": settings.GEMINI_MODEL,
        "atmospheric_engine": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
