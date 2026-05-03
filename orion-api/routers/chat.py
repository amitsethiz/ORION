from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from utils.connection_manager import manager
from services.llm.router import stream_chat
import json
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/chat/{session_id}")
async def chat_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    logger.info(f"Chat session started: {session_id}")

    try:
        while True:
            raw = await websocket.receive_text()
            payload = json.loads(raw)

            msg_type = payload.get("type", "message")

            if msg_type == "ping":
                await manager.send_json(session_id, {"type": "pong"})
                continue

            if msg_type == "message":
                user_content = payload.get("content", "").strip()
                if not user_content:
                    continue

                history = [
                    {"role": m["role"], "content": m["content"]}
                    for m in payload.get("history", [])
                ]
                messages = history + [{"role": "user", "content": user_content}]

                system_prompt = payload.get("system_prompt", "")
                async for event in stream_chat(messages, system_prompt or None):
                    await manager.send_json(session_id, event)

    except WebSocketDisconnect:
        manager.disconnect(session_id)
        logger.info(f"Chat session ended: {session_id}")
    except Exception as exc:
        logger.error(f"Chat session error [{session_id}]: {exc}")
        try:
            await manager.send_json(session_id, {"type": "error", "message": str(exc)})
        except Exception:
            pass
        manager.disconnect(session_id)
