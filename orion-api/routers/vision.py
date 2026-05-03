from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import litellm
import base64
import logging

from core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["vision"])

VISION_MODELS = {
    "openai":    "gpt-4o",
    "anthropic": "claude-sonnet-4-6",
    "google":    "gemini/gemini-1.5-flash",
    "openrouter": "openrouter/openai/gpt-4o",
}


class VisionRequest(BaseModel):
    image_b64: str                      # base64-encoded image (JPEG/PNG)
    mime_type: str = "image/jpeg"
    prompt: str = "Describe what you see in this image in detail. Be specific and helpful."
    session_id: Optional[str] = None


class VisionResponse(BaseModel):
    analysis: str
    model_used: str
    provider: str


def _pick_vision_provider() -> tuple[str, str, Optional[str]]:
    """Pick first configured provider that supports vision."""
    for tier_num in (1, 2, 3):
        provider = getattr(settings, f"llm_tier{tier_num}_provider")
        api_key   = getattr(settings, f"llm_tier{tier_num}_api_key", None)
        if provider in VISION_MODELS:
            model = VISION_MODELS[provider]
            return provider, model, api_key
    return "openai", "gpt-4o", settings.openai_api_key


@router.post("/vision/analyze", response_model=VisionResponse)
async def analyze_image(req: VisionRequest) -> VisionResponse:
    """Accept a base64 image frame, analyze it with a vision-capable LLM."""
    provider, model, api_key = _pick_vision_provider()
    logger.info(f"Vision analysis: provider={provider} model={model}")

    image_url = f"data:{req.mime_type};base64,{req.image_b64}"

    messages = [{
        "role": "user",
        "content": [
            {"type": "text", "text": req.prompt},
            {"type": "image_url", "image_url": {"url": image_url}},
        ],
    }]

    kwargs: dict = {"model": model, "messages": messages, "max_tokens": 800}
    if api_key:
        kwargs["api_key"] = api_key

    try:
        response = await litellm.acompletion(**kwargs)
        analysis = response.choices[0].message.content or ""
        return VisionResponse(analysis=analysis, model_used=model, provider=provider)
    except Exception as exc:
        logger.error(f"Vision analysis failed: {exc}")
        raise HTTPException(status_code=502, detail=f"Vision LLM error: {exc}")
