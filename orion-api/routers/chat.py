from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from utils.connection_manager import manager
from services.llm.router import stream_chat
from services.memory.database import AsyncSessionLocal
from services.memory.repository import SQLiteSessionRepository, SQLiteMessageRepository
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/chat/{session_id}")
async def chat_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    logger.info(f"Chat session started: {session_id}")

    # Ensure session row exists in DB
    async with AsyncSessionLocal() as db:
        session_repo = SQLiteSessionRepository(db)
        if not await session_repo.get(session_id):
            await session_repo.create_with_id(session_id)

    try:
        while True:
            raw = await websocket.receive_text()
            payload = json.loads(raw)
            msg_type = payload.get("type", "message")

            if msg_type == "ping":
                await manager.send_json(session_id, {"type": "pong"})
                continue

            if msg_type == "load_history":
                # Client requests previous messages for this session
                async with AsyncSessionLocal() as db:
                    msg_repo = SQLiteMessageRepository(db)
                    history = await msg_repo.get_history(
                        session_id, limit=50
                    )
                await manager.send_json(session_id, {
                    "type": "history",
                    "messages": [m.to_dict() for m in history],
                })
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
                system_prompt = payload.get("system_prompt") or None

                # Persist user message
                async with AsyncSessionLocal() as db:
                    await SQLiteMessageRepository(db).add(session_id, "user", user_content)

                # Stream LLM response
                full_response = ""
                active_provider = None
                active_tier = None

                async for event in stream_chat(messages, system_prompt):
                    await manager.send_json(session_id, event)
                    if event["type"] == "token":
                        full_response += event.get("content", "")
                    elif event["type"] == "tier":
                        active_provider = event.get("provider")
                        active_tier = event.get("tier")

                # Persist assistant response
                if full_response:
                    async with AsyncSessionLocal() as db:
                        await SQLiteMessageRepository(db).add(
                            session_id, "assistant", full_response,
                            provider=active_provider, tier=active_tier,
                        )

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
