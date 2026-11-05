"""Feature #1 & #2: Mood check-in and Habit Stacking endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.habit import Habit
from app.schemas.mood_schema import MoodCheckIn, MoodSuggestionResponse, HabitStackRequest, HabitStackResponse
from app.services.ai_service import get_mood_suggestions, get_habit_stack_suggestion

router = APIRouter()


@router.post("/checkin", response_model=MoodSuggestionResponse)
async def mood_checkin(
    payload: MoodCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #1: Save user mood and return AI-adapted habit suggestions."""
    # Save mood to user profile
    current_user.current_mood = payload.mood.lower()
    db.commit()

    # Get existing habit names for context
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True,
        Habit.habit_type == "positive",
    ).all()
    habit_names = [h.name for h in habits]

    # Get AI suggestions
    result = await get_mood_suggestions(payload.mood, habit_names)
    return result


@router.post("/stack", response_model=HabitStackResponse)
async def habit_stack(
    payload: HabitStackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #2: Save habit stack trigger and get AI suggestion."""
    # If habit_id provided, save the trigger
    if payload.habit_id:
        habit = db.query(Habit).filter(
            Habit.id == payload.habit_id,
            Habit.user_id == current_user.id,
        ).first()
        if habit:
            habit.stack_trigger = payload.trigger
            db.commit()

    # Get existing routine names for AI context
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True,
    ).all()
    routine_names = [h.name for h in habits]

    result = await get_habit_stack_suggestion(payload.new_habit_name, routine_names)
    return {
        "trigger": result.get("best_trigger", payload.trigger),
        "new_habit": payload.new_habit_name,
        "ai_suggestion": result.get("reason", "Yeh combination aapke liye best hai!"),
        "best_triggers": result.get("alternative_triggers", []),
    }
