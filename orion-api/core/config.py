from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    # App
    app_env: str = "development"
    app_port: int = 8000
    frontend_url: str = "http://localhost:3000"

    # LLM Tier 1 — Primary
    llm_tier1_provider: str = "ollama"
    llm_tier1_model: str = "llama3"
    llm_tier1_base_url: str = "http://localhost:11434"
    llm_tier1_api_key: Optional[str] = None

    # LLM Tier 2 — First Fallback
    llm_tier2_provider: str = "openrouter"
    llm_tier2_model: str = "mistralai/mistral-7b-instruct"
    llm_tier2_api_key: Optional[str] = None

    # LLM Tier 3 — Final Fallback
    llm_tier3_provider: str = "anthropic"
    llm_tier3_model: str = "claude-haiku-4-5-20251001"
    llm_tier3_api_key: Optional[str] = None

    # Optional extra provider keys
    openai_api_key: Optional[str] = None
    google_api_key: Optional[str] = None

    # TTS
    tts_engine: str = "browser"
    elevenlabs_api_key: Optional[str] = None
    elevenlabs_voice_id: Optional[str] = None

    # STT
    stt_engine: str = "browser"

    # Database
    database_url: str = "sqlite+aiosqlite:///./orion_memory.db"

    # Session
    secret_key: str = "change-me-in-production-use-32-char-random-string"
    session_max_history: int = 50


settings = Settings()
