from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    content: str
    history: list[ChatMessage] = Field(default_factory=list)
    session_id: Optional[str] = None


class ProviderTierConfig(BaseModel):
    provider: str
    model: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None


class ProviderConfigRequest(BaseModel):
    tier1: Optional[ProviderTierConfig] = None
    tier2: Optional[ProviderTierConfig] = None
    tier3: Optional[ProviderTierConfig] = None
    tts_engine: Optional[str] = None
    stt_engine: Optional[str] = None


class ProviderStatus(BaseModel):
    provider: str
    model: str
    status: Literal["up", "down", "unconfigured"]
    latency_ms: Optional[int] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    env: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StreamEvent(BaseModel):
    type: Literal["tier", "token", "fallback", "done", "error"]
    content: Optional[str] = None
    tier: Optional[int] = None
    model: Optional[str] = None
    provider: Optional[str] = None
    from_tier: Optional[int] = None
    reason: Optional[str] = None
    message: Optional[str] = None
