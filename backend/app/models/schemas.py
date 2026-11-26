"""Pydantic v2 schemas for AeroShield AI."""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator
import re
import html


def sanitize_text(v: str) -> str:
    """Sanitize string inputs against HTML tags, script injection, and control chars."""
    if not isinstance(v, str):
        return v
    # Remove HTML tags
    cleaned = re.sub(r"<[^>]*?>", "", v)
    # Unescape HTML entities safely
    cleaned = html.unescape(cleaned)
    # Strip null bytes and non-printable control characters (except common whitespace)
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", cleaned)
    return cleaned.strip()


# ============================================================================
# Air Quality Schemas
# ============================================================================

class LocationQuery(BaseModel):
    """Query parameters for location-based air quality."""
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")
    city_name: Optional[str] = Field(None, max_length=100, description="Optional city name")

    @field_validator("city_name")
    @classmethod
    def sanitize_city(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return sanitize_text(v)
        return v


class HotspotInfo(BaseModel):
    """Known winter smog hotspot metadata."""
    id: str
    city: str
    country: str
    latitude: float
    longitude: float
    smog_driver: str
    inversion_phenomenon: str
    typical_winter_aqi: int
    peak_inversion_months: List[str]


class PollutantBreakdown(BaseModel):
    """Detailed airborne pollutant concentrations in ug/m3 (or ppm)."""
    pm2_5: float = Field(..., ge=0.0, description="PM2.5 in ug/m3")
    pm10: float = Field(..., ge=0.0, description="PM10 in ug/m3")
    no2: Optional[float] = Field(None, ge=0.0, description="NO2 in ug/m3")
    so2: Optional[float] = Field(None, ge=0.0, description="SO2 in ug/m3")
    co: Optional[float] = Field(None, ge=0.0, description="CO in ug/m3")
    o3: Optional[float] = Field(None, ge=0.0, description="O3 in ug/m3")


class InversionMetrics(BaseModel):
    """Atmospheric inversion layer and boundary layer metrics."""
    boundary_layer_height_m: float = Field(..., description="Planetary Boundary Layer Height in meters")
    inversion_strength_index: float = Field(..., ge=0.0, le=100.0, description="Inversion trap strength index 0-100")
    inversion_type: Literal["radiation", "subsidence", "valley_cold_pool", "neutral"]
    surface_temp_c: float
    lapse_rate_c_per_km: float = Field(..., description="Thermal lapse rate (dT/dz) in °C/km")
    wind_speed_kmh: float = Field(..., ge=0.0)
    golden_ventilation_window: Optional[Dict[str, str]] = Field(
        None, description="Start and end time of peak thermal boundary lift (e.g. {'start': '13:00', 'end': '15:30'})"
    )
    ventilation_safety_status: Literal["safe", "caution", "hazardous"]
    scientific_summary: str


class HourlyForecastItem(BaseModel):
    """Hourly AQI and inversion forecast."""
    time: str
    aqi: int
    pm2_5: float
    boundary_layer_m: float
    inversion_trapped: bool
    is_golden_window: bool
    recommendation: str


class AirQualityResponse(BaseModel):
    """Complete air quality snapshot with inversion physics."""
    city: str
    country: str
    latitude: float
    longitude: float
    aqi: int
    aqi_category: Literal["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous"]
    primary_pollutant: str
    pollutants: PollutantBreakdown
    inversion: InversionMetrics
    hourly_forecast: List[HourlyForecastItem]
    health_advice: str
    data_source: str
    timestamp: str


# ============================================================================
# Routine Planner Schemas
# ============================================================================

PersonaType = Literal[
    "child",
    "asthmatic",
    "elderly",
    "commuter",
    "outdoor_worker",
    "athlete",
    "general_adult",
]

ActivityIntensity = Literal["sedentary", "light", "moderate", "vigorous"]
LocationEnvironment = Literal["indoor_filtered", "indoor_unfiltered", "outdoor", "transit_car", "transit_public"]


class PlannedActivity(BaseModel):
    """User-provided activity input."""
    time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="HH:MM format")
    activity_name: str = Field(..., max_length=150)
    environment: LocationEnvironment
    duration_minutes: int = Field(..., ge=5, le=720)
    intensity: ActivityIntensity = "light"

    @field_validator("activity_name")
    @classmethod
    def sanitize_act(cls, v: str) -> str:
        return sanitize_text(v)


class RoutineRequest(BaseModel):
    """Request to generate an exposure-minimized routine."""
    persona: PersonaType = "general_adult"
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    city_name: Optional[str] = "Delhi NCR"
    planned_activities: List[PlannedActivity] = Field(..., min_length=1, max_length=24)
    has_hepa_filter: bool = True
    has_n95_mask: bool = True
    custom_constraints: Optional[str] = Field(None, max_length=500)

    @field_validator("city_name")
    @classmethod
    def sanitize_city(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return sanitize_text(v)
        return v

    @field_validator("custom_constraints")
    @classmethod
    def sanitize_constraints(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return sanitize_text(v)
        return v


class ScheduleSlot(BaseModel):
    """Optimized hourly or activity time block."""
    time: str
    original_activity: str
    recommended_activity: str
    environment: LocationEnvironment
    predicted_aqi: int
    exposure_risk: Literal["low", "moderate", "high", "extreme"]
    protective_action: str
    lung_dose_reduction_pct: float


class TransitAlternative(BaseModel):
    """Low-emission, low-exposure commute alternative."""
    original_mode: str
    recommended_mode: str
    route_adaptation: str
    pm25_exposure_reduction_pct: float
    co2_saved_kg: float
    time_difference_minutes: int


class RoutineResponse(BaseModel):
    """Optimized daily schedule response."""
    persona: PersonaType
    location: str
    current_aqi: int
    schedule: List[ScheduleSlot]
    transit_alternatives: List[TransitAlternative]
    total_lung_dose_prevented_ug: float
    total_co2_offset_kg: float
    inversion_lift_advice: str
    ai_rationale: str


# ============================================================================
# IAQ Hacks Schemas
# ============================================================================

class IAQHackRequest(BaseModel):
    """Request for indoor air quality engineering hacks."""
    room_type: Literal["bedroom", "living_room", "home_office", "classroom", "studio"] = "bedroom"
    room_volume_m3: float = Field(..., ge=10.0, le=500.0, description="Volume of room in cubic meters")
    budget_usd: float = Field(..., ge=0.0, le=2000.0)
    current_indoor_pm25: Optional[float] = Field(None, ge=0.0)
    current_outdoor_pm25: float = Field(..., ge=0.0)
    has_existing_purifier: bool = False
    has_box_fan: bool = False


class DIYPurifierModel(BaseModel):
    """DIY Corsi-Rosenthal Box or custom air cleaner specs."""
    name: str
    estimated_cost_usd: float
    estimated_cadr_cfm: float
    filter_type: str
    materials_list: List[str]
    assembly_steps: List[str]
    noise_dba: float
    safety_guidelines: List[str]
    maintenance_interval_days: int


class SealingHack(BaseModel):
    """Draft proofing and leakage isolation hack."""
    name: str
    materials: List[str]
    target_area: Literal["windows", "doors", "electrical_outlets", "ac_vents", "exhaust_fans"]
    cost_usd: float
    infiltration_reduction_pct: float
    instructions: str


class IAQAdvisorResponse(BaseModel):
    """Complete IAQ hacking and engineering guide."""
    room_specs: Dict[str, Any]
    target_ach: float
    estimated_ach_with_diy: float
    cadr_needed_cfm: float
    diy_purifier: DIYPurifierModel
    draft_proofing_hacks: List[SealingHack]
    golden_window_ventilation: Dict[str, Any]
    humidity_management: Dict[str, Any]
    cost_benefit_vs_commercial: Dict[str, Any]


# ============================================================================
# Multimodal Vision Inspector Schemas
# ============================================================================

class VisionInspectRequest(BaseModel):
    """Request for image-based safety, seal, and leakage analysis."""
    image_base64: str = Field(..., description="Base64 encoded JPEG or PNG image")
    inspection_type: Literal["diy_purifier", "window_seals", "room_environment", "filter_condition"] = "diy_purifier"
    fan_speed_setting: Optional[Literal["low", "medium", "high"]] = "medium"
    filter_brand_merv: Optional[str] = Field("MERV 13", max_length=50)
    user_notes: Optional[str] = Field(None, max_length=500)

    @field_validator("user_notes")
    @classmethod
    def sanitize_notes(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return sanitize_text(v)
        return v


class DetectedComponent(BaseModel):
    """Component identified by multimodal vision."""
    name: str
    confidence: float
    status: Literal["optimal", "adequate", "leakage_detected", "safety_hazard", "missing"]
    description: str


class VisionInspectResponse(BaseModel):
    """Multimodal vision analysis result."""
    inspection_type: str
    leakage_risk_score: float = Field(..., ge=0.0, le=100.0, description="0 = sealed perfectly, 100 = critical leak")
    seal_integrity_rating: Literal["Excellent", "Good", "Compromised", "Failed"]
    detected_components: List[DetectedComponent]
    cadr_estimate_cfm: float
    shroud_efficiency_boost_pct: float
    identified_air_bypasses: List[str]
    safety_warnings: List[str]
    corrective_actions: List[str]
    model_used: str


# ============================================================================
# Impact Calculator Schemas
# ============================================================================

MaskType = Literal["none", "cloth", "surgical", "kn95_n95", "papr"]


class ActivityExposureInput(BaseModel):
    """Activity exposure slice for lung dose integration."""
    activity_name: str = Field(..., max_length=100)
    duration_hours: float = Field(..., ge=0.05, le=24.0)
    pm25_concentration_ug_m3: float = Field(..., ge=0.0, le=2000.0)
    activity_level: ActivityIntensity = "light"
    mask: MaskType = "none"
    is_indoor_filtered: bool = False

    @field_validator("activity_name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        return sanitize_text(v)


class TransitSwitchInput(BaseModel):
    """Parameters for low-emission commute switch."""
    distance_km: float = Field(..., ge=0.1, le=500.0)
    original_mode: Literal["gasoline_car", "diesel_suv", "motorcycle", "auto_rickshaw"] = "gasoline_car"
    replacement_mode: Literal["metro_subway", "electric_bus", "bicycle", "walking", "electric_scooter"] = "metro_subway"


class LungDoseRequest(BaseModel):
    """Request to calculate exact mathematical lung dose prevented and emission offset."""
    baseline_activities: List[ActivityExposureInput] = Field(..., min_length=1)
    optimized_activities: List[ActivityExposureInput] = Field(..., min_length=1)
    pulmonary_deposition_fraction: Optional[float] = Field(0.50, ge=0.20, le=0.85)
    transit_switch: Optional[TransitSwitchInput] = None


class ActivityDoseBreakdown(BaseModel):
    """Detailed lung dose for one activity."""
    activity_name: str
    duration_hours: float
    breathing_rate_m3_h: float
    mask_efficiency_pct: float
    pm25_concentration: float
    inhaled_pm25_ug: float
    deposited_lung_dose_ug: float


class LungDoseResponse(BaseModel):
    """Mathematically verified lung dose and emission impact report."""
    baseline_inhaled_ug: float
    baseline_lung_dose_ug: float
    optimized_inhaled_ug: float
    optimized_lung_dose_ug: float
    dose_prevented_ug: float
    dose_reduction_pct: float
    equivalent_cigarettes_avoided: float
    co2_prevented_kg: float
    pm25_emissions_prevented_g: float
    formula_breakdown: str
    baseline_details: List[ActivityDoseBreakdown]
    optimized_details: List[ActivityDoseBreakdown]


class CommunityOffsetResponse(BaseModel):
    """Aggregated community impact metrics."""
    total_active_citizens: int
    collective_pm25_lung_dose_prevented_grams: float
    collective_co2_offset_tonnes: float
    equivalent_trees_planted_annual: float
    clean_air_hours_reclaimed: int
    hotspot_distribution: Dict[str, int]
