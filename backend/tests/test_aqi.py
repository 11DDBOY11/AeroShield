"""Tests for Air Quality Engine, Inversion Physics, and Hotspots."""

import pytest
from fastapi.testclient import TestClient
from backend.app.services.aqi_service import pm25_to_us_aqi, KNOWN_HOTSPOTS
from backend.app.services.math_engine import calculate_inversion_strength


def test_pm25_to_us_aqi_breakpoints():
    """Verify standard EPA US AQI breakpoints."""
    assert pm25_to_us_aqi(0.0) == 0
    assert 0 <= pm25_to_us_aqi(12.0) <= 50
    assert 51 <= pm25_to_us_aqi(35.4) <= 100
    assert 101 <= pm25_to_us_aqi(55.4) <= 150
    assert 151 <= pm25_to_us_aqi(150.4) <= 200
    assert 201 <= pm25_to_us_aqi(250.4) <= 300
    assert 301 <= pm25_to_us_aqi(350.4) <= 400
    assert pm25_to_us_aqi(500.4) >= 500


def test_inversion_strength_math():
    """Verify Inversion Strength Index calculations."""
    # Strong inversion: shallow boundary layer, stagnant wind, positive lapse rate
    isi_strong, status_strong, lapse_strong = calculate_inversion_strength(
        surface_temp_c=10.0,
        temp_at_boundary_c=14.0,
        boundary_layer_height_m=180.0,
        wind_speed_kmh=1.5,
    )
    assert isi_strong >= 75.0
    assert status_strong == "hazardous"
    assert lapse_strong > 0  # Inversion present

    # Normal well-mixed atmosphere: deep boundary layer, breezy, negative lapse rate
    isi_clean, status_clean, lapse_clean = calculate_inversion_strength(
        surface_temp_c=25.0,
        temp_at_boundary_c=18.0,
        boundary_layer_height_m=1400.0,
        wind_speed_kmh=18.0,
    )
    assert isi_clean < 40.0
    assert status_clean == "safe"
    assert lapse_clean < 0


def test_list_hotspots_endpoint(client: TestClient):
    """Verify GET /api/aqi/hotspots returns all required winter smog hubs."""
    response = client.get("/api/aqi/hotspots")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4

    cities = [h["city"] for h in data]
    assert any("Delhi" in c for c in cities)
    assert any("Lahore" in c for c in cities)
    assert any("Beijing" in c for c in cities)
    assert any("Salt Lake" in c for c in cities)

    for hotspot in data:
        assert "inversion_phenomenon" in hotspot
        assert "typical_winter_aqi" in hotspot
        assert len(hotspot["peak_inversion_months"]) > 0


def test_get_hotspot_details_endpoint(client: TestClient):
    """Verify GET /api/aqi/hotspots/{id} handles valid and invalid IDs."""
    # Valid
    res_valid = client.get("/api/aqi/hotspots/delhi")
    assert res_valid.status_code == 200
    assert res_valid.json()["city"] == "Delhi NCR"

    # Invalid
    res_invalid = client.get("/api/aqi/hotspots/non_existent_city_xyz")
    assert res_invalid.status_code == 404


def test_current_air_quality_endpoint(client: TestClient):
    """Verify GET /api/aqi/current returns full air quality and inversion payload."""
    response = client.get("/api/aqi/current?latitude=28.6139&longitude=77.2090&city=Delhi")
    assert response.status_code == 200
    data = response.json()

    assert "aqi" in data
    assert "aqi_category" in data
    assert "pollutants" in data
    assert "pm2_5" in data["pollutants"]
    assert "pm10" in data["pollutants"]
    assert "inversion" in data
    assert "boundary_layer_height_m" in data["inversion"]
    assert "inversion_strength_index" in data["inversion"]
    assert "golden_ventilation_window" in data["inversion"]
    assert len(data["hourly_forecast"]) == 24


def test_inversion_telemetry_endpoint(client: TestClient):
    """Verify GET /api/aqi/inversion returns specialized inversion telemetry."""
    response = client.get("/api/aqi/inversion?latitude=31.5204&longitude=74.3587")
    assert response.status_code == 200
    data = response.json()
    assert "boundary_layer_height_m" in data
    assert "inversion_strength_index" in data
    assert "ventilation_safety_status" in data
