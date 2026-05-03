from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from services.memory.repository import get_session_repo, get_message_repo, ISessionRepository, IMessageRepository

router = APIRouter(prefix="/api", tags=["sessions"])


class CreateSessionRequest(BaseModel):
    name: str = "New Session"


class RenameSessionRequest(BaseModel):
    name: str


@router.get("/sessions")
async def list_sessions(repo: ISessionRepository = Depends(get_session_repo)):
    sessions = await repo.list_all()
    return {"sessions": [s.to_dict() for s in sessions]}


@router.post("/sessions")
async def create_session(
    body: CreateSessionRequest,
    repo: ISessionRepository = Depends(get_session_repo),
):
    session = await repo.create(name=body.name)
    return session.to_dict()


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, repo: ISessionRepository = Depends(get_session_repo)):
    session = await repo.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.to_dict()


@router.patch("/sessions/{session_id}")
async def rename_session(
    session_id: str,
    body: RenameSessionRequest,
    repo: ISessionRepository = Depends(get_session_repo),
):
    session = await repo.rename(session_id, body.name)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.to_dict()


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, repo: ISessionRepository = Depends(get_session_repo)):
    deleted = await repo.delete(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted", "session_id": session_id}


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    limit: int = 50,
    msg_repo: IMessageRepository = Depends(get_message_repo),
):
    messages = await msg_repo.get_history(session_id, limit=limit)
    return {"messages": [m.to_dict() for m in messages]}
