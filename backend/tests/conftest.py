"""Pytest configuration, fixtures, and mock factories for AeroShield AI backend tests."""

import pytest
import io
import base64
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """Test client for FastAPI app."""
    return TestClient(app)


@pytest.fixture(scope="session")
def sample_test_image_b64() -> str:
    """Generate a valid base64 test image of a DIY air cleaner."""
    img = Image.new("RGB", (300, 300), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    # Draw fan frame
    draw.rectangle([50, 50, 250, 250], outline="black", width=4, fill=(200, 220, 240))
    # Draw circular shroud
    draw.ellipse([80, 80, 220, 220], outline="darkblue", width=3, fill=(180, 200, 230))
    # Draw tape corners
    draw.rectangle([45, 45, 65, 65], fill="gray")
    draw.rectangle([235, 45, 255, 65], fill="gray")
    draw.rectangle([45, 235, 65, 255], fill="gray")
    draw.rectangle([235, 235, 255, 255], fill="gray")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"
