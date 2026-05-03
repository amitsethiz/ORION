import litellm
from typing import AsyncGenerator, Optional
import logging
from core.config import settings

logger = logging.getLogger(__name__)
litellm.set_verbose = False

ORION_SYSTEM_PROMPT = """You are O.R.I.O.N. — Omnipresent Responsive Intelligent Operative Network.
You are an advanced AI assistant with a calm, precise, and confident persona inspired by sci-fi AI systems.
Be helpful, insightful, and direct. When uncertain, acknowledge it. Never break character."""


def _model_string(provider: str, model: str) -> str:
    """Map provider+model to LiteLLM model string."""
    mapping = {
        "ollama": f"ollama/{model}",
        "openrouter": f"openrouter/{model}",
        "google": f"gemini/{model}",
        "anthropic": model,
        "openai": model,
    }
    return mapping.get(provider, model)


def _tier_kwargs(tier: int) -> dict:
    """Build LiteLLM kwargs for a given fallback tier."""
    cfgs = {
        1: (settings.llm_tier1_provider, settings.llm_tier1_model,
            settings.llm_tier1_api_key or "ollama", settings.llm_tier1_base_url),
        2: (settings.llm_tier2_provider, settings.llm_tier2_model,
            settings.llm_tier2_api_key, None),
        3: (settings.llm_tier3_provider, settings.llm_tier3_model,
            settings.llm_tier3_api_key, None),
    }
    provider, model, api_key, base_url = cfgs[tier]
    kwargs: dict = {
        "model": _model_string(provider, model),
        "stream": True,
        "_tier_meta": {"tier": tier, "provider": provider, "model": model},
    }
    if api_key:
        kwargs["api_key"] = api_key
    if base_url and provider == "ollama":
        kwargs["base_url"] = base_url
    return kwargs


RETRYABLE = (
    litellm.RateLimitError,
    litellm.ServiceUnavailableError,
    litellm.APIConnectionError,
    litellm.Timeout,
)


async def stream_chat(
    messages: list[dict],
    system_prompt: str = ORION_SYSTEM_PROMPT,
) -> AsyncGenerator[dict, None]:
    """
    Stream a chat completion with automatic 3-tier fallback.
    Yields typed event dicts: tier | token | fallback | done | error
    """
    full_messages = [{"role": "system", "content": system_prompt}] + messages

    last_error: Optional[Exception] = None

    for tier_num in (1, 2, 3):
        kwargs = _tier_kwargs(tier_num)
        meta = kwargs.pop("_tier_meta")

        yield {
            "type": "tier",
            "tier": meta["tier"],
            "provider": meta["provider"],
            "model": meta["model"],
        }
        logger.info(f"LLM tier {tier_num}: {kwargs['model']}")

        try:
            response = await litellm.acompletion(**kwargs, messages=full_messages)
            async for chunk in response:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield {"type": "token", "content": delta.content}

            yield {"type": "done", "tier": tier_num}
            return

        except RETRYABLE as exc:
            last_error = exc
            logger.warning(f"Tier {tier_num} retryable error ({type(exc).__name__}), falling back")
            if tier_num < 3:
                yield {"type": "fallback", "from_tier": tier_num, "reason": type(exc).__name__}
        except Exception as exc:
            last_error = exc
            logger.error(f"Tier {tier_num} unexpected error: {exc}")
            if tier_num < 3:
                yield {"type": "fallback", "from_tier": tier_num, "reason": str(exc)[:120]}

    yield {"type": "error", "message": f"All LLM tiers exhausted. Last: {last_error}"}
