"""Tests for IAQ Hacks Advisor, Corsi-Rosenthal Box specifications, and Ventilation Window."""

import pytest
from fastapi.testclient import TestClient
from backend.app.services.math_engine import calculate_cadr_and_ach


def test_cadr_and_ach_physics():
    """Verify Corsi-Rosenthal box aerodynamic calculations."""
    cadr_with_shroud, ach_with, target = calculate_cadr_and_ach(
        room_volume_m3=45.0,  # ~1600 cu ft
        fan_free_air_cfm=1800.0,
        number_of_filters=4,
        has_cardboard_shroud=True,
        merv_rating=13,
    )

    cadr_no_shroud, ach_without, _ = calculate_cadr_and_ach(
        room_volume_m3=45.0,
        fan_free_air_cfm=1800.0,
        number_of_filters=4,
        has_cardboard_shroud=False,
        merv_rating=13,
    )

    # Shroud boosts CADR by ~38%
    assert cadr_with_shroud > cadr_no_shroud
    assert ach_with > ach_without
    assert ach_with >= 4.0  # Adequate air changes for clean air zone


def test_iaq_advisor_endpoint(client: TestClient):
    """Verify POST /api/hacks/iaq-advisor returns comprehensive DIY instructions."""
    payload = {
        "room_type": "bedroom",
        "room_volume_m3": 50.0,
        "budget_usd": 100.0,
        "current_outdoor_pm25": 280.0,
        "has_existing_purifier": False,
        "has_box_fan": True,
    }
    response = client.post("/api/hacks/iaq-advisor", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "diy_purifier" in data
    assert "Corsi-Rosenthal" in data["diy_purifier"]["name"]
    assert len(data["diy_purifier"]["assembly_steps"]) >= 4
    assert len(data["draft_proofing_hacks"]) >= 2
    assert "golden_window_ventilation" in data
    assert "humidity_management" in data


def test_cr_box_blueprint_endpoint(client: TestClient):
    """Verify GET /api/hacks/corsi-rosenthal-blueprint returns Bill of Materials."""
    response = client.get("/api/hacks/corsi-rosenthal-blueprint")
    assert response.status_code == 200
    data = response.json()
    assert "materials_list" in data
    assert "safety_guidelines" in data
    assert data["estimated_cadr_cfm"] > 250.0


def test_ventilation_window_endpoint(client: TestClient):
    """Verify GET /api/hacks/ventilation-window returns diurnal purge guidance."""
    response = client.get("/api/hacks/ventilation-window?latitude=28.6139&longitude=77.2090")
    assert response.status_code == 200
    data = response.json()
    assert "golden_window" in data
    assert "ventilation_safety_status" in data
