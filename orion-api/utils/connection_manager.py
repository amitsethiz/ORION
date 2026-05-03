from fastapi import WebSocket
from typing import Dict
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self._connections: Dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[session_id] = websocket
        logger.info(f"WebSocket connected: {session_id} (total: {len(self._connections)})")

    def disconnect(self, session_id: str) -> None:
        self._connections.pop(session_id, None)
        logger.info(f"WebSocket disconnected: {session_id} (total: {len(self._connections)})")

    def is_connected(self, session_id: str) -> bool:
        return session_id in self._connections

    async def send_json(self, session_id: str, data: dict) -> None:
        ws = self._connections.get(session_id)
        if ws:
            await ws.send_text(json.dumps(data, ensure_ascii=False))

    async def broadcast_json(self, data: dict) -> None:
        dead = []
        for sid, ws in self._connections.items():
            try:
                await ws.send_text(json.dumps(data, ensure_ascii=False))
            except Exception:
                dead.append(sid)
        for sid in dead:
            self.disconnect(sid)

    @property
    def active_count(self) -> int:
        return len(self._connections)


manager = ConnectionManager()
