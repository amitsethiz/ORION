"""
Server-side Text-to-Speech adapters.

Default engine: browser — TTS runs in the browser via Web Speech Synthesis API (free, zero latency).
Optional engines:
  - coqui:      pip install TTS  (local neural TTS, free, ~500MB model)
  - elevenlabs: requires ELEVENLABS_API_KEY
  - openai:     requires OPENAI_API_KEY

Activated by setting TTS_ENGINE=<engine> in .env.
"""

from abc import ABC, abstractmethod
from core.config import settings
import logging

logger = logging.getLogger(__name__)


class TTSAdapter(ABC):
    @abstractmethod
    async def synthesize(self, text: str) -> bytes | None:
        """Return audio bytes (mp3/wav) or None if TTS runs client-side."""
        ...

    @property
    def runs_client_side(self) -> bool:
        return False


class BrowserTTSAdapter(TTSAdapter):
    """No-op — TTS runs in the browser via Web Speech Synthesis API."""
    async def synthesize(self, text: str) -> bytes | None:
        return None

    @property
    def runs_client_side(self) -> bool:
        return True


class CoquiTTSAdapter(TTSAdapter):
    """
    Local neural TTS via Coqui TTS.
    Requires: pip install TTS
    Model is auto-downloaded on first use (~500MB).
    """
    def __init__(self):
        try:
            from TTS.api import TTS
            self._tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)
            logger.info("Coqui TTS model loaded")
        except ImportError:
            raise RuntimeError("Coqui TTS not installed. Run: pip install TTS")

    async def synthesize(self, text: str) -> bytes | None:
        import asyncio, io, wave
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._run_sync, text)

    def _run_sync(self, text: str) -> bytes:
        import io
        buf = io.BytesIO()
        self._tts.tts_to_file(text=text, file_path=buf)
        return buf.getvalue()


class ElevenLabsTTSAdapter(TTSAdapter):
    """Cloud TTS via ElevenLabs API."""
    def __init__(self):
        if not settings.elevenlabs_api_key:
            raise RuntimeError("ELEVENLABS_API_KEY not set in .env")
        self._api_key = settings.elevenlabs_api_key
        self._voice_id = settings.elevenlabs_voice_id or "21m00Tcm4TlvDq8ikWAM"

    async def synthesize(self, text: str) -> bytes | None:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{self._voice_id}",
                headers={"xi-api-key": self._api_key, "Content-Type": "application/json"},
                json={"text": text, "model_id": "eleven_monolingual_v1",
                      "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},
            )
            resp.raise_for_status()
            return resp.content


class OpenAITTSAdapter(TTSAdapter):
    """Cloud TTS via OpenAI TTS API."""
    def __init__(self):
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY not set in .env")
        self._api_key = settings.openai_api_key

    async def synthesize(self, text: str) -> bytes | None:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.openai.com/v1/audio/speech",
                headers={"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"},
                json={"model": "tts-1", "input": text, "voice": "nova"},
            )
            resp.raise_for_status()
            return resp.content


_adapters: dict[str, TTSAdapter] = {}


def get_tts_adapter() -> TTSAdapter:
    engine = settings.tts_engine
    if engine not in _adapters:
        adapter_map = {
            "browser":    BrowserTTSAdapter,
            "coqui":      CoquiTTSAdapter,
            "elevenlabs": ElevenLabsTTSAdapter,
            "openai":     OpenAITTSAdapter,
        }
        cls = adapter_map.get(engine, BrowserTTSAdapter)
        _adapters[engine] = cls()
        logger.info(f"TTS adapter initialized: {engine}")
    return _adapters[engine]
