from fastapi import APIRouter
from models.schemas import ProviderConfigRequest
from core.config import settings
import os

router = APIRouter(prefix="/api", tags=["config"])

_runtime_overrides: dict = {}


def _current_config() -> dict:
    return {
        "tier1": {
            "provider": _runtime_overrides.get("llm_tier1_provider", settings.llm_tier1_provider),
            "model":    _runtime_overrides.get("llm_tier1_model",    settings.llm_tier1_model),
            "base_url": _runtime_overrides.get("llm_tier1_base_url", settings.llm_tier1_base_url),
            "has_key":  bool(_runtime_overrides.get("llm_tier1_api_key", settings.llm_tier1_api_key)),
        },
        "tier2": {
            "provider": _runtime_overrides.get("llm_tier2_provider", settings.llm_tier2_provider),
            "model":    _runtime_overrides.get("llm_tier2_model",    settings.llm_tier2_model),
            "has_key":  bool(_runtime_overrides.get("llm_tier2_api_key", settings.llm_tier2_api_key)),
        },
        "tier3": {
            "provider": _runtime_overrides.get("llm_tier3_provider", settings.llm_tier3_provider),
            "model":    _runtime_overrides.get("llm_tier3_model",    settings.llm_tier3_model),
            "has_key":  bool(_runtime_overrides.get("llm_tier3_api_key", settings.llm_tier3_api_key)),
        },
        "tts_engine": settings.tts_engine,
        "stt_engine": settings.stt_engine,
    }


@router.get("/config")
async def get_config():
    return _current_config()


@router.post("/config")
async def update_config(body: ProviderConfigRequest):
    """
    Apply runtime provider overrides without restarting.
    Values are applied to the settings object directly for the running process.
    """
    if body.tier1:
        t = body.tier1
        if t.provider:  settings.llm_tier1_provider = t.provider
        if t.model:     settings.llm_tier1_model = t.model
        if t.base_url:  settings.llm_tier1_base_url = t.base_url
        if t.api_key:   settings.llm_tier1_api_key = t.api_key
    if body.tier2:
        t = body.tier2
        if t.provider:  settings.llm_tier2_provider = t.provider
        if t.model:     settings.llm_tier2_model = t.model
        if t.api_key:   settings.llm_tier2_api_key = t.api_key
    if body.tier3:
        t = body.tier3
        if t.provider:  settings.llm_tier3_provider = t.provider
        if t.model:     settings.llm_tier3_model = t.model
        if t.api_key:   settings.llm_tier3_api_key = t.api_key
    if body.tts_engine:
        settings.tts_engine = body.tts_engine
    if body.stt_engine:
        settings.stt_engine = body.stt_engine

    return {"status": "updated", "config": _current_config()}


@router.get("/sessions")
async def list_sessions():
    # Placeholder — wired to DB in Sprint 3 (SCRUM-38/39)
    return {"sessions": [], "note": "Memory module coming in Sprint 3"}
