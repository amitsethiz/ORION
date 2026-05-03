from fastapi import APIRouter
from datetime import datetime
from core.config import settings
from utils.connection_manager import manager

router = APIRouter()


@router.get("/health", tags=["health"])
async def health():
    return {
        "status": "ok",
        "app": "O.R.I.O.N.",
        "version": "0.1.0",
        "env": settings.app_env,
        "timestamp": datetime.utcnow().isoformat(),
        "active_connections": manager.active_count,
    }


@router.get("/health/providers", tags=["health"])
async def provider_health():
    from services.llm.health import check_providers
    return await check_providers()
