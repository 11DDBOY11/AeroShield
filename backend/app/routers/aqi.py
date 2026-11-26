"""Air Quality & Winter Smog Inversion router."""

from fastapi import APIRouter, Query, HTTPException, Request
from typing import List, Optional
from backend.app.models.schemas import AirQualityResponse, HotspotInfo, InversionMetrics
from backend.app.services.aqi_service import aqi_service

router = APIRouter(prefix="/api/aqi", tags=["Air Quality & Inversion"])


@router.get("/hotspots", response_model=List[HotspotInfo])
async def list_hotspots():
    """List curated global winter smog hotspots with geographic inversion mechanisms."""
    return aqi_service.get_all_hotspots()


@router.get("/hotspots/{hotspot_id}", response_model=HotspotInfo)
async def get_hotspot_details(hotspot_id: str):
    """Get metadata and inversion profile for a specific hotspot."""
    hotspot = aqi_service.get_hotspot_by_id(hotspot_id)
    if not hotspot:
        raise HTTPException(
            status_code=404,
            detail=f"Hotspot '{hotspot_id}' not found. Supported: delhi, lahore, beijing, salt_lake_city",
        )
    return hotspot


@router.get("/current", response_model=AirQualityResponse)
async def get_current_air_quality(
    latitude: float = Query(28.6139, ge=-90.0, le=90.0, description="Latitude"),
    longitude: float = Query(77.2090, ge=-180.0, le=180.0, description="Longitude"),
    city: Optional[str] = Query(None, max_length=100, description="Optional city name"),
):
    """Get real-time air quality snapshot with planetary boundary layer and inversion metrics."""
    return await aqi_service.get_air_quality(latitude, longitude, city)


@router.get("/inversion", response_model=InversionMetrics)
async def get_inversion_telemetry(
    latitude: float = Query(28.6139, ge=-90.0, le=90.0),
    longitude: float = Query(77.2090, ge=-180.0, le=180.0),
    city: Optional[str] = Query(None, max_length=100),
):
    """Get specialized atmospheric inversion metrics and Golden Ventilation Window timing."""
    aq_res = await aqi_service.get_air_quality(latitude, longitude, city)
    return aq_res.inversion
