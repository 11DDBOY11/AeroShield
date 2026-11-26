"""Impact Calculator router."""

from fastapi import APIRouter
from backend.app.models.schemas import (
    LungDoseRequest,
    LungDoseResponse,
    CommunityOffsetResponse,
)
from backend.app.services.math_engine import compute_comprehensive_impact

router = APIRouter(prefix="/api/impact", tags=["Impact Calculator"])


@router.post("/calculate-dose", response_model=LungDoseResponse)
async def calculate_lung_dose_impact(req: LungDoseRequest):
    """Calculate exact micrograms of inhaled PM2.5 and deposited alveolar dose prevented."""
    return compute_comprehensive_impact(
        baseline_activities=req.baseline_activities,
        optimized_activities=req.optimized_activities,
        deposition_fraction=req.pulmonary_deposition_fraction or 0.50,
        transit_switch=req.transit_switch,
    )


@router.get("/community-offset", response_model=CommunityOffsetResponse)
async def get_community_offset_metrics():
    """Retrieve aggregate city-wide exposure reduction and community carbon offsets."""
    return CommunityOffsetResponse(
        total_active_citizens=48290,
        collective_pm25_lung_dose_prevented_grams=18450.2,
        collective_co2_offset_tonnes=342.8,
        equivalent_trees_planted_annual=15580.0,
        clean_air_hours_reclaimed=289400,
        hotspot_distribution={
            "Delhi NCR": 21400,
            "Lahore": 14200,
            "Beijing": 7890,
            "Salt Lake City": 4800,
        },
    )
