from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
from core.config import settings
from contextlib import asynccontextmanager
from sqlalchemy import text 
from models.base import engine
from core.redis import init_redis, close_redis
import logging 
from starlette.requests import Request
from starlette.responses import Response

from core.limiter import limiter
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

from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to Tungsten API",
        "docs": f"{settings.API_V1_STR}/docs"
    }

app.include_router(api_router, prefix=settings.API_V1_STR)