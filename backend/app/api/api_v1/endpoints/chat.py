"""Feature #8: AI Habit Coach Chatbot endpoint."""
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.services.ai_service import get_chat_response

router = APIRouter()


class ChatMessage(BaseModel):
    role: str    # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    missed_habits: List[str]


@router.post("/message", response_model=ChatResponse)
async def chat_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #8: Get AI habit coach response."""
    # Detect habits missed in the last 3 days
    today = date.today()
    missed_habits = []

    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True,
        Habit.habit_type == "positive",
    ).all()

    for habit in habits:
        miss_count = 0
        for days_ago in range(1, 4):
            check_date = today - timedelta(days=days_ago)
            log = db.query(HabitLog).filter(
                HabitLog.habit_id == habit.id,
                HabitLog.user_id == current_user.id,
                HabitLog.log_date == check_date,
                HabitLog.completed == True,
            ).first()
            if not log:
                miss_count += 1
        if miss_count >= 2:
            missed_habits.append(habit.name)

    messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    reply = await get_chat_response(messages, current_user.name, missed_habits)

    return {"reply": reply, "missed_habits": missed_habits}
