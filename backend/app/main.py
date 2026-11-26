"""AeroShield AI - Enterprise FastAPI Application.

Winter Smog & Urban Air Pollution Assistant backend.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from backend.app.config import settings
from backend.app.routers.health import router as health_router
from backend.app.routers.aqi import router as aqi_router
from backend.app.routers.routines import router as routines_router
from backend.app.routers.hacks import router as hacks_router
from backend.app.routers.vision import router as vision_router
from backend.app.routers.impact import router as impact_router

# =============================================================================
# Rate Limiting
# =============================================================================
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
)


# =============================================================================
# Security Headers Middleware
# =============================================================================
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforce enterprise security headers across all HTTP responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


# =============================================================================
# Application Factory
# =============================================================================
def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Enterprise API for AeroShield AI — Winter Smog & Urban Air Pollution Assistant. "
            "Features real-time atmospheric boundary layer & inversion modeling, Gemini GenAI Routine Planner, "
            "DIY IAQ Hacks Advisor, Multimodal Vision Inspector, and exact PM2.5 Lung Dose calculations."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # Attach limiter state
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Custom exception handlers
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Validation Error",
                "details": exc.errors(),
                "body": str(exc.body) if hasattr(exc, "body") else None,
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred. Please contact system administrator.",
            },
        )

    # Security & CORS Middlewares
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Include Routers
    app.include_router(health_router)
    app.include_router(aqi_router)
    app.include_router(routines_router)
    app.include_router(hacks_router)
    app.include_router(vision_router)
    app.include_router(impact_router)

    @app.get("/", tags=["Root"])
    async def root():
        """Root entrypoint with API discovery links."""
        return {
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "operational",
            "documentation": "/docs",
            "endpoints": {
                "health": "/api/health",
                "air_quality": "/api/aqi/current",
                "hotspots": "/api/aqi/hotspots",
                "inversion": "/api/aqi/inversion",
                "routines": "/api/routines/generate",
                "iaq_hacks": "/api/hacks/iaq-advisor",
                "vision": "/api/vision/inspect",
                "impact": "/api/impact/calculate-dose",
            },
        }

    return app


app = create_app()
