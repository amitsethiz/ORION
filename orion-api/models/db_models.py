from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime
import uuid


class Base(DeclarativeBase):
    pass


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, default="New Session")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan",
                            order_by="Message.timestamp")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "message_count": len(self.messages) if self.messages else 0,
        }


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)          # user | assistant | system
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    provider = Column(String, nullable=True)
    tier = Column(Integer, nullable=True)

    session = relationship("Session", back_populates="messages")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "provider": self.provider,
            "tier": self.tier,
        }
