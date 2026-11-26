"""Security, Sanitization, Headers, and Code Quality tests."""

import pytest
from fastapi.testclient import TestClient


def test_security_headers_present(client: TestClient):
    """Verify enterprise HTTP response security headers."""
    response = client.get("/api/health")
    assert response.status_code == 200

    headers = response.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "max-age=" in headers.get("Strict-Transport-Security", "")


def test_cors_headers(client: TestClient):
    """Verify CORS preflight handling."""
    response = client.options(
        "/api/aqi/hotspots",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers


def test_input_sanitization_xss(client: TestClient):
    """Verify malicious HTML/JavaScript tags are stripped by Pydantic validators."""
    payload = {
        "persona": "general_adult",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "city_name": "<script>alert('xss')</script>Delhi NCR<b>bold</b>",
        "has_hepa_filter": True,
        "has_n95_mask": True,
        "custom_constraints": "<img src=x onerror=alert(1)>Must leave before 9am",
        "planned_activities": [
            {
                "time": "08:00",
                "activity_name": "<svg/onload=alert('attack')>Morning Walk",
                "environment": "outdoor",
                "duration_minutes": 30,
                "intensity": "light",
            }
        ],
    }

    response = client.post("/api/routines/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    # The returned schedule or AI rationale should not contain script or img tags
    res_str = str(data)
    assert "<script>" not in res_str
    assert "<img" not in res_str
    assert "<svg" not in res_str


def test_validation_bounds_rejection(client: TestClient):
    """Verify strict Pydantic v2 bounds rejection with HTTP 422."""
    # Invalid latitude > 90
    res_invalid_lat = client.get("/api/aqi/current?latitude=195.0&longitude=77.0")
    assert res_invalid_lat.status_code == 422

    # Invalid activity duration < 5 minutes
    res_invalid_dur = client.post(
        "/api/routines/generate",
        json={
            "persona": "general_adult",
            "latitude": 28.61,
            "longitude": 77.20,
            "planned_activities": [
                {
                    "time": "08:00",
                    "activity_name": "Too short",
                    "environment": "outdoor",
                    "duration_minutes": 1,  # Must be >= 5
                    "intensity": "light",
                }
            ],
        },
    )
    assert res_invalid_dur.status_code == 422


def test_root_and_health_endpoints(client: TestClient):
    """Verify root discovery and system health check endpoints."""
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "endpoints" in res_root.json()

    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    health_data = res_health.json()
    assert health_data["status"] == "healthy"
    assert health_data["atmospheric_engine"] == "online"
