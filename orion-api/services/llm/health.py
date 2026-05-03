import litellm
import time
import asyncio
import logging
from core.config import settings
from services.llm.router import _model_string

logger = logging.getLogger(__name__)


async def _ping(provider: str, model: str, api_key: Optional[str], base_url: Optional[str]) -> dict:
    model_str = _model_string(provider, model)
    kwargs: dict = {
        "model": model_str,
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 1,
    }
    if api_key:
        kwargs["api_key"] = api_key
    if base_url and provider == "ollama":
        kwargs["base_url"] = base_url

    start = time.monotonic()
    try:
        await litellm.acompletion(**kwargs)
        return {
            "status": "up",
            "latency_ms": round((time.monotonic() - start) * 1000),
        }
    except Exception as exc:
        return {"status": "down", "error": str(exc)[:150]}


async def check_providers() -> dict:
    """Check all three configured LLM tiers concurrently."""
    from typing import Optional

    tiers = [
        (1, settings.llm_tier1_provider, settings.llm_tier1_model,
         settings.llm_tier1_api_key, settings.llm_tier1_base_url),
        (2, settings.llm_tier2_provider, settings.llm_tier2_model,
         settings.llm_tier2_api_key, None),
        (3, settings.llm_tier3_provider, settings.llm_tier3_model,
         settings.llm_tier3_api_key, None),
    ]

    results = await asyncio.gather(
        *[_ping(p, m, k, u) for _, p, m, k, u in tiers],
        return_exceptions=True,
    )

    output = {}
    for (tier_num, provider, model, _, _), result in zip(tiers, results):
        if isinstance(result, Exception):
            result = {"status": "down", "error": str(result)[:150]}
        output[f"tier{tier_num}"] = {"provider": provider, "model": model, **result}

    return output
