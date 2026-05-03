"""
Server-side Speech-to-Text adapters.

Default engine: browser (no-op — STT runs in the browser via Web Speech API).
Optional engine: whisper_local — requires `pip install faster-whisper` and model download.
Activated by setting STT_ENGINE=whisper_local in .env.
"""

from abc import ABC, abstractmethod
from core.config import settings
import logging
import io

logger = logging.getLogger(__name__)


class STTAdapter(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
        ...


class BrowserSTTAdapter(STTAdapter):
    """No-op — transcription runs in the browser via Web Speech API."""
    async def transcribe(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
        return ""


class WhisperLocalSTTAdapter(STTAdapter):
    """
    Local Whisper transcription via faster-whisper.
    Requires: pip install faster-whisper
    On first use, model is downloaded automatically (~244MB for tiny, ~1.5GB for large-v3).
    Set WHISPER_MODEL_SIZE in .env (default: base).
    """
    def __init__(self):
        try:
            from faster_whisper import WhisperModel
            model_size = getattr(settings, "whisper_model_size", "base")
            self._model = WhisperModel(model_size, device="cpu", compute_type="int8")
            logger.info(f"Whisper model loaded: {model_size}")
        except ImportError:
            raise RuntimeError(
                "faster-whisper not installed. Run: pip install faster-whisper"
            )

    async def transcribe(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._run_sync, audio_bytes)

    def _run_sync(self, audio_bytes: bytes) -> str:
        segments, _ = self._model.transcribe(io.BytesIO(audio_bytes), beam_size=5)
        return " ".join(s.text.strip() for s in segments)


_adapters: dict[str, STTAdapter] = {}


def get_stt_adapter() -> STTAdapter:
    engine = settings.stt_engine
    if engine not in _adapters:
        if engine == "whisper_local":
            _adapters[engine] = WhisperLocalSTTAdapter()
        else:
            _adapters[engine] = BrowserSTTAdapter()
    return _adapters[engine]
