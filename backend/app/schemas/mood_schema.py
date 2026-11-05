from pydantic import BaseModel
from typing import List, Optional


class MoodCheckIn(BaseModel):
    mood: str  # energetic | tired | stressed | happy


class HabitSuggestion(BaseModel):
    name: str
    emoji: str
    reason: str
    adapted_from: Optional[str] = None  # original habit name if adapted


class MoodSuggestionResponse(BaseModel):
    mood: str
    message: str
    suggestions: List[HabitSuggestion]
    motivational_quote: str


class HabitStackRequest(BaseModel):
    new_habit_name: str
    new_habit_emoji: str = "⭐"
    trigger: str  # "After morning chai", "After waking up", etc.
    habit_id: Optional[str] = None  # link to existing habit


class HabitStackResponse(BaseModel):
    trigger: str
    new_habit: str
    ai_suggestion: str
    best_triggers: List[str]
