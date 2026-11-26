"""Routine Planner & Low-Emission Transit Optimizer router."""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from backend.app.models.schemas import (
    RoutineRequest,
    RoutineResponse,
    TransitAlternative,
    TransitSwitchInput,
)
from backend.app.services.gemini_service import gemini_service
from backend.app.services.aqi_service import aqi_service
from backend.app.services.math_engine import EMISSION_FACTORS

router = APIRouter(prefix="/api/routines", tags=["Routine Planner"])


@router.post("/generate", response_model=RoutineResponse)
async def generate_optimized_routine(req: RoutineRequest):
    """Generate personalized daily schedule minimizing toxic PM2.5 lung dose and emissions."""
    # Obtain local AQI context
    aq_data = await aqi_service.get_air_quality(
        lat=req.latitude, lon=req.longitude, city_name=req.city_name
    )
    current_aqi = aq_data.aqi

    return await gemini_service.generate_routine(req=req, current_aqi=current_aqi)


@router.post("/transit-alternatives", response_model=List[TransitAlternative])
async def compare_transit_modes(transit: TransitSwitchInput):
    """Compare emissions and exposure differences between commuter transit modes."""
    base_factors = EMISSION_FACTORS.get(transit.original_mode, EMISSION_FACTORS["gasoline_car"])
    repl_factors = EMISSION_FACTORS.get(transit.replacement_mode, EMISSION_FACTORS["metro_subway"])

    co2_saved_kg = max(
        0.0,
        ((base_factors["co2_g_per_km"] - repl_factors["co2_g_per_km"]) * transit.distance_km)
        / 1000.0,
    )

    alt_primary = TransitAlternative(
        original_mode=transit.original_mode.replace("_", " ").title(),
        recommended_mode=transit.replacement_mode.replace("_", " ").title(),
        route_adaptation=(
            "Shifts route away from heavily polluted ring roads into segregated or underground corridors. "
            "Reduces ambient peak street canyon particulate exposure by over 50%."
        ),
        pm25_exposure_reduction_pct=58.0 if "metro" in transit.replacement_mode else 45.0,
        co2_saved_kg=round(co2_saved_kg, 2),
        time_difference_minutes=5 if "metro" in transit.replacement_mode else -8,
    )

    alt_secondary = TransitAlternative(
        original_mode=transit.original_mode.replace("_", " ").title(),
        recommended_mode="Hybrid Transit: Bicycle to Metro Station",
        route_adaptation="Active first/last mile via quiet residential streets avoiding arterial idling congestion.",
        pm25_exposure_reduction_pct=65.0,
        co2_saved_kg=round(co2_saved_kg * 1.05, 2),
        time_difference_minutes=2,
    )

    return [alt_primary, alt_secondary]
