from contextlib import asynccontextmanager
import logging
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import chat, health, config_router, vision, sessions
from services.memory.database import init_db

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("orion")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("O.R.I.O.N. API starting — env: %s", settings.app_env)
    await init_db()
    logger.info(
        "LLM tiers: [1] %s/%s  [2] %s/%s  [3] %s/%s",
        settings.llm_tier1_provider, settings.llm_tier1_model,
        settings.llm_tier2_provider, settings.llm_tier2_model,
        settings.llm_tier3_provider, settings.llm_tier3_model,
    )
    yield
    logger.info("O.R.I.O.N. API shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title="O.R.I.O.N. API",
        description="Omnipresent Responsive Intelligent Operative Network — Backend",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.app_env == "development" else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(config_router.router)
    app.include_router(sessions.router)
    app.include_router(vision.router)
    app.include_router(chat.router)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.app_port,
        reload=settings.app_env == "development",
        log_level="info",
    )
