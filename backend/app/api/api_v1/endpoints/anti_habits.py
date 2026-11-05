"""Feature #7: Anti-Habit Tracker endpoints."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.habit import Habit
from app.schemas.anti_habit_schema import AntiHabitCreate, UrgeRequest, UrgeResponse, AntiHabitStats
from app.services.anti_habit_service import log_urge, get_anti_habit_stats

router = APIRouter()


@router.get("/", summary="List all anti-habits")
def list_anti_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all anti-habits for the current user."""
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.habit_type == "anti",
        Habit.is_active == True,
    ).all()
    return [{"id": h.id, "name": h.name, "emoji": h.emoji} for h in habits]


@router.post("/create", summary="Create a new anti-habit")
def create_anti_habit(
    payload: AntiHabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #7: Create a habit to break (negative habit tracking)."""
    habit = Habit(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=payload.name,
        emoji=payload.emoji,
        habit_type="anti",
        is_active=True,
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return {"id": habit.id, "name": habit.name, "emoji": habit.emoji, "message": "Anti-habit created! 🛡️"}


@router.post("/urge", response_model=UrgeResponse)
def log_urge_event(
    payload: UrgeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #7: Log an urge event — resisted (breathing) or slipped."""
    return log_urge(db, current_user.id, payload.habit_id, payload.resisted)


@router.get("/stats/{habit_id}", response_model=AntiHabitStats)
def get_stats(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #7: Get detailed stats for an anti-habit."""
    result = get_anti_habit_stats(db, current_user.id, habit_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
