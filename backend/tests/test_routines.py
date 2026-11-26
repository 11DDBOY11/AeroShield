"""Tests for Routine Planner and Low-Emission Transit Optimizer."""

import pytest
from fastapi.testclient import TestClient


def test_generate_routine_endpoint(client: TestClient):
    """Verify POST /api/routines/generate optimizes activities and protects sensitive personas."""
    payload = {
        "persona": "child",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "city_name": "Delhi NCR",
        "has_hepa_filter": True,
        "has_n95_mask": True,
        "planned_activities": [
            {
                "time": "07:30",
                "activity_name": "Morning School Run & Outdoor Play",
                "environment": "outdoor",
                "duration_minutes": 60,
                "intensity": "moderate",
            },
            {
                "time": "13:30",
                "activity_name": "Indoor Classroom Study",
                "environment": "indoor_unfiltered",
                "duration_minutes": 180,
                "intensity": "sedentary",
            },
            {
                "time": "18:00",
                "activity_name": "Outdoor Soccer Practice",
                "environment": "outdoor",
                "duration_minutes": 90,
                "intensity": "vigorous",
            },
        ],
    }

    response = client.post("/api/routines/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["persona"] == "child"
    assert len(data["schedule"]) == 3
    assert data["total_lung_dose_prevented_ug"] > 0
    assert len(data["transit_alternatives"]) > 0

    # Morning outdoor play during inversion should be shifted or warned with extreme/high risk
    morning_slot = data["schedule"][0]
    assert morning_slot["time"] == "07:30"
    assert morning_slot["exposure_risk"] in ["high", "extreme"]
    assert morning_slot["lung_dose_reduction_pct"] > 0


def test_transit_alternatives_endpoint(client: TestClient):
    """Verify POST /api/routines/transit-alternatives provides CO2 and exposure savings."""
    payload = {
        "distance_km": 15.0,
        "original_mode": "gasoline_car",
        "replacement_mode": "metro_subway",
    }
    response = client.post("/api/routines/transit-alternatives", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    primary = data[0]
    assert primary["co2_saved_kg"] > 0.0
    assert primary["pm25_exposure_reduction_pct"] > 40.0
