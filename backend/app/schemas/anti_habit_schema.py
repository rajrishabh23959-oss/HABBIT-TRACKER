from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AntiHabitCreate(BaseModel):
    name: str
    emoji: str = "🚫"


class UrgeRequest(BaseModel):
    habit_id: str
    resisted: bool = True  # True = completed 60s breathing, False = slipped


class UrgeResponse(BaseModel):
    habit_id: str
    resisted: bool
    slip_count_today: int
    message: str
    show_breathing: bool


class AntiHabitStats(BaseModel):
    habit_id: str
    name: str
    emoji: str
    total_urges: int
    total_resisted: int
    total_slips: int
    resistance_rate: float  # 0.0-1.0
    current_streak: int     # days without a slip
    today_slips: int
