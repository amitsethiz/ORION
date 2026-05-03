"""
Repository pattern for session and message persistence.
Abstract interfaces allow future migration from SQLite to Postgres/ChromaDB
by swapping the concrete implementation without touching any callers.
"""

from abc import ABC, abstractmethod
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from models.db_models import Session, Message
from datetime import datetime
import uuid


# ── Abstract interfaces ────────────────────────────────────────────────────────

class ISessionRepository(ABC):
    @abstractmethod
    async def create(self, name: str = "New Session") -> Session: ...

    @abstractmethod
    async def get(self, session_id: str) -> Optional[Session]: ...

    @abstractmethod
    async def list_all(self) -> list[Session]: ...

    @abstractmethod
    async def delete(self, session_id: str) -> bool: ...

    @abstractmethod
    async def rename(self, session_id: str, name: str) -> Optional[Session]: ...


class IMessageRepository(ABC):
    @abstractmethod
    async def add(self, session_id: str, role: str, content: str,
                  provider: Optional[str] = None, tier: Optional[int] = None) -> Message: ...

    @abstractmethod
    async def get_history(self, session_id: str, limit: int = 50) -> list[Message]: ...

    @abstractmethod
    async def delete_session_messages(self, session_id: str) -> int: ...


# ── SQLite / SQLAlchemy implementations ───────────────────────────────────────

class SQLiteSessionRepository(ISessionRepository):
    def __init__(self, db: AsyncSession):
        self._db = db

    async def create(self, name: str = "New Session") -> Session:
        return await self.create_with_id(str(uuid.uuid4()), name)

    async def create_with_id(self, session_id: str, name: str = "New Session") -> Session:
        now = datetime.utcnow()
        session = Session(id=session_id, name=name, created_at=now, updated_at=now)
        self._db.add(session)
        await self._db.commit()
        await self._db.refresh(session)
        return session

    async def get(self, session_id: str) -> Optional[Session]:
        result = await self._db.execute(select(Session).where(Session.id == session_id))
        return result.scalar_one_or_none()

    async def list_all(self) -> list[Session]:
        result = await self._db.execute(
            select(Session).order_by(Session.updated_at.desc())
        )
        return list(result.scalars().all())

    async def delete(self, session_id: str) -> bool:
        result = await self._db.execute(delete(Session).where(Session.id == session_id))
        await self._db.commit()
        return result.rowcount > 0

    async def rename(self, session_id: str, name: str) -> Optional[Session]:
        session = await self.get(session_id)
        if not session:
            return None
        session.name = name
        session.updated_at = datetime.utcnow()
        await self._db.commit()
        await self._db.refresh(session)
        return session


class SQLiteMessageRepository(IMessageRepository):
    def __init__(self, db: AsyncSession):
        self._db = db

    async def add(self, session_id: str, role: str, content: str,
                  provider: Optional[str] = None, tier: Optional[int] = None) -> Message:
        msg = Message(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role=role,
            content=content,
            timestamp=datetime.utcnow(),
            provider=provider,
            tier=tier,
        )
        self._db.add(msg)
        session = await self._db.get(Session, session_id)
        if session:
            session.updated_at = datetime.utcnow()
        await self._db.commit()
        await self._db.refresh(msg)
        return msg

    async def get_history(self, session_id: str, limit: int = 50) -> list[Message]:
        result = await self._db.execute(
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.timestamp.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def delete_session_messages(self, session_id: str) -> int:
        result = await self._db.execute(
            delete(Message).where(Message.session_id == session_id)
        )
        await self._db.commit()
        return result.rowcount


# ── FastAPI dependency helpers ─────────────────────────────────────────────────

from services.memory.database import get_db
from fastapi import Depends


async def get_session_repo(db: AsyncSession = Depends(get_db)) -> ISessionRepository:
    return SQLiteSessionRepository(db)


async def get_message_repo(db: AsyncSession = Depends(get_db)) -> IMessageRepository:
    return SQLiteMessageRepository(db)
