"""Tests for Multimodal Vision Inspector."""

import pytest
import io
from fastapi.testclient import TestClient


def test_vision_inspect_base64_endpoint(client: TestClient, sample_test_image_b64: str):
    """Verify POST /api/vision/inspect returns structured seal and leakage analysis."""
    payload = {
        "image_base64": sample_test_image_b64,
        "inspection_type": "diy_purifier",
        "fan_speed_setting": "high",
        "filter_brand_merv": "MERV 13",
        "user_notes": "4-filter CR box with cardboard shroud taped to top fan.",
    }
    response = client.post("/api/vision/inspect", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "leakage_risk_score" in data
    assert 0 <= data["leakage_risk_score"] <= 100
    assert "seal_integrity_rating" in data
    assert len(data["detected_components"]) > 0
    assert "cadr_estimate_cfm" in data
    assert "corrective_actions" in data


def test_vision_upload_inspect_endpoint(client: TestClient):
    """Verify POST /api/vision/upload-inspect handles multipart image upload."""
    from PIL import Image
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color="white")
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test_purifier.jpg", buf, "image/jpeg")}
    data = {"inspection_type": "diy_purifier", "user_notes": "Testing upload inspect"}

    response = client.post("/api/vision/upload-inspect", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert "seal_integrity_rating" in res_data
    assert "detected_components" in res_data
