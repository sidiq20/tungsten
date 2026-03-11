from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
from core.config import settings
from contextlib import asynccontextmanager
from sqlalchemy import text 
from models.base import engine
from core.redis import init_redis, close_redis
import logging 
from api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to neon")
        await init_redis()
        logger.info("Successfully connected to Redis")
    except Exception as e:
        logger.error(f"Failed to connect to neon or Redis: {e}")
        raise e
    yield
    await close_redis()
    await engine.dispose()
    logger.info("Shutting down")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to Tungsten API",
        "docs": f"{settings.API_V1_STR}/docs"
    }

app.include_router(api_router, prefix=settings.API_V1_STR)