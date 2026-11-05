import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    limiter = Limiter(key_func=get_remote_address)
    RATE_LIMIT_AVAILABLE = True
except ImportError:
    RATE_LIMIT_AVAILABLE = False
    limiter = None

from app.db.database import Base, engine
from app.api.api_v1 import api_router

# Import ALL models so SQLAlchemy creates their tables on startup
from app.models import user, habit, habit_log, wellness_log  # noqa: F401
from app.models import urge_log, kindness_log, anonymous_group  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="HabitGame API",
    description="Backend for the HabitGame Mobile Tracker — 10 Features Edition",
    version="2.0.0",
    lifespan=lifespan,
)

# H1: Rate limiting middleware
if RATE_LIMIT_AVAILABLE and limiter:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Feature #11: Secure CORS origins (configurable via env)
origins = [
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:19006",
    "http://localhost:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
    "http://127.0.0.1:19006",
]
# Add production or wildcard domain from environment variable
prod_origin = os.getenv("CORS_ORIGIN", "*")
if prod_origin:
    origins.append(prod_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"status": "ok", "service": "HabitGame API v2.0 — 10 Features Active"}


# H7: Dedicated health check endpoint for Render/deployment platforms
@app.get("/health")
def health():
    return {"status": "ok"}
