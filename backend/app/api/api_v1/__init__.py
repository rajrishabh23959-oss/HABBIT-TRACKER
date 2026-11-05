from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, habits, wellness, mood, anti_habits, social, kindness, chat, ai_engine

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(habits.router, prefix="/habits", tags=["Habits"])
api_router.include_router(wellness.router, prefix="/wellness", tags=["Wellness"])
api_router.include_router(mood.router, prefix="/mood", tags=["Mood & Stacking"])
api_router.include_router(anti_habits.router, prefix="/anti-habits", tags=["Anti-Habits"])
api_router.include_router(social.router, prefix="/social", tags=["Social"])
api_router.include_router(kindness.router, prefix="/kindness", tags=["Kindness"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
api_router.include_router(ai_engine.router, prefix="/ai", tags=["AI Engine"])
