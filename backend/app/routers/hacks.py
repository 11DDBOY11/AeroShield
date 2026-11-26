"""Indoor Air Quality (IAQ) Hacks & Engineering Advisor router."""

from fastapi import APIRouter, Query
from backend.app.models.schemas import IAQHackRequest, IAQAdvisorResponse, DIYPurifierModel
from backend.app.services.gemini_service import gemini_service
from backend.app.services.aqi_service import aqi_service

router = APIRouter(prefix="/api/hacks", tags=["IAQ Hacks Advisor"])


@router.post("/iaq-advisor", response_model=IAQAdvisorResponse)
async def get_iaq_recommendations(req: IAQHackRequest):
    """Generate engineering blueprint for DIY Corsi-Rosenthal Box, draft proofing, and purge ventilation."""
    return await gemini_service.get_iaq_hacks(req)


@router.get("/corsi-rosenthal-blueprint", response_model=DIYPurifierModel)
async def get_cr_box_blueprint():
    """Retrieve verified open-source engineering blueprint for 4-filter Corsi-Rosenthal Box."""
    dummy_req = IAQHackRequest(
        room_type="bedroom",
        room_volume_m3=45.0,
        budget_usd=80.0,
        current_outdoor_pm25=220.0,
    )
    result = await gemini_service.get_iaq_hacks(dummy_req)
    return result.diy_purifier


@router.get("/ventilation-window")
async def get_ventilation_window(
    latitude: float = Query(28.6139, ge=-90.0, le=90.0),
    longitude: float = Query(77.2090, ge=-180.0, le=180.0),
):
    """Get real-time atmospheric inversion lift window for safe indoor flush ventilation."""
    aq_res = await aqi_service.get_air_quality(latitude, longitude)
    return {
        "city": aq_res.city,
        "golden_window": aq_res.inversion.golden_ventilation_window,
        "boundary_layer_height_m": aq_res.inversion.boundary_layer_height_m,
        "ventilation_safety_status": aq_res.inversion.ventilation_safety_status,
        "instructions": (
            "Open opposing windows for 10-15 minutes during this window to displace indoor CO2 and bio-effluents. "
            "Close and seal windows before nocturnal radiative cooling re-establishes the surface inversion cap."
        ),
    }
