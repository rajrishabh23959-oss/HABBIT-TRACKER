from pydantic import BaseModel
from typing import Dict, Optional


class HabitBase(BaseModel):
    name: str
    emoji: str = "✅"
    frequency: str = "daily"


class HabitCreate(HabitBase):
    pass


class HabitResponse(BaseModel):
    id: str
    name: str
    emoji: str
    frequency: str
    logs: Dict[str, bool] = {}  # "1": True, "2": False ...

    class Config:
        from_attributes = True


class ToggleRequest(BaseModel):
    habit_id: str
    day: int
    month: int
    year: int


class ToggleResponse(BaseModel):
    habit_id: str
    day: int
    completed: bool
    xp_earned: int
    new_total_xp: int
    new_level: int
