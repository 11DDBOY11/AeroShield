"""Multimodal Vision Inspector router."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import base64
from backend.app.models.schemas import VisionInspectRequest, VisionInspectResponse
from backend.app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/vision", tags=["Multimodal Vision Inspector"])


@router.post("/inspect", response_model=VisionInspectResponse)
async def inspect_room_or_purifier(req: VisionInspectRequest):
    """Inspect DIY purifier build, window seals, or room air circulation via computer vision."""
    return await gemini_service.inspect_vision(req)


@router.post("/upload-inspect", response_model=VisionInspectResponse)
async def upload_and_inspect_image(
    file: UploadFile = File(...),
    inspection_type: str = Form("diy_purifier"),
    user_notes: Optional[str] = Form(None),
):
    """Direct file upload endpoint for room or purifier photo inspection."""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type {file.content_type}. Only JPEG, PNG, or WebP images supported.",
        )

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image exceeds maximum 10MB size limit.")

    b64_str = base64.b64encode(contents).decode("utf-8")
    req = VisionInspectRequest(
        image_base64=f"data:{file.content_type};base64,{b64_str}",
        inspection_type=inspection_type if inspection_type in ["diy_purifier", "window_seals", "room_environment", "filter_condition"] else "diy_purifier",
        user_notes=user_notes,
    )
    return await gemini_service.inspect_vision(req)
