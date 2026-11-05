from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.habit import Habit
from app.models.wellness_log import WellnessLog
from app.services.ai_service import _init_gemini

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch active habits
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).all()
    habit_names = [h.name for h in habits] if habits else ["None currently tracking"]
    
    # Fetch today's mood and sleep
    today = date.today()
    wellness = db.query(WellnessLog).filter(
        WellnessLog.user_id == current_user.id,
        WellnessLog.log_date == today
    ).first()
    
    mood = wellness.mood if wellness else "Unknown"
    sleep = wellness.sleep_hours if wellness else 0.0

    system_prompt = (
        "You are 'Coach Max', an expert fitness, nutrition, and habit AI coach. "
        "RULES: "
        "1. Diet & Nutrition: If asked about diet, give quick, practical, desi (Indian) food suggestions based on their active goals. "
        "2. How to Perform: If asked 'How to do X?', give step-by-step simple instructions to avoid injury. "
        "3. Motivation: Use Hinglish (Hindi + English) mix for a friendly Indian tone. "
        "4. Personalization: Always look at the provided user context (mood, sleep, habits). Adjust advice accordingly. "
        "5. Formatting: Keep responses under 80 words. Use emojis."
    )

    context = (
        f"The user is currently tracking these habits: {', '.join(habit_names)}. "
        f"Their mood today is: {mood}. Their average sleep is: {sleep} hours. "
        f"User asks: {payload.message}"
    )

    model = _init_gemini()
    if model:
        try:
            full_prompt = system_prompt + "\n\n" + context
            response = model.generate_content(full_prompt)
            return {"response": response.text.strip()}
        except Exception as e:
            return {"response": "Sorry yaar, abhi server thoda busy hai. Baad mein try karein! 💪"}
    
    return {"response": "Gemini API key is missing. Set it up to talk with Coach Max! 🤖"}
