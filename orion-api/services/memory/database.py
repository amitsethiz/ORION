from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from models.db_models import Base
from core.config import settings
import logging

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialised: %s", settings.database_url)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
