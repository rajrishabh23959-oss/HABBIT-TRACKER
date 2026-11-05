import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.habit import Habit
from app.schemas.habit_schema import ToggleRequest, ToggleResponse
from app.services.habit_service import get_dashboard, toggle_habit_log
from app.services.analytics_service import get_habit_insights

router = APIRouter()


@router.get("/dashboard")
def dashboard(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard(db, current_user.id, month, year)


@router.post("/toggle", response_model=ToggleResponse)
def toggle(
    payload: ToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = toggle_habit_log(
        db, current_user.id, payload.habit_id,
        payload.day, payload.month, payload.year,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return result


@router.get("/analytics/insights")
def analytics_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #6: Return deep habit insights — best day, failure pattern, recommendations."""
    return get_habit_insights(db, current_user.id)


@router.get("/garden")
def get_garden(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #3: Return plant data for all habits (Virtual Garden)."""
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True,
        Habit.habit_type == "positive",
    ).order_by(Habit.order_index).all()

    plants = []
    for h in habits:
        plants.append({
            "id": h.id,
            "name": h.name,
            "emoji": h.emoji,
            "plant_level": h.plant_level,
            "plant_streak": h.plant_streak,
            "plant_health": h.plant_health,
        })
    return {"plants": plants}


@router.post("/create")
def create_habit(
    name: str = Query(...),
    emoji: str = Query("✅"),
    habit_type: str = Query("positive"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new positive or anti habit."""
    habit = Habit(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=name,
        emoji=emoji,
        habit_type=habit_type,
        is_active=True,
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return {"id": habit.id, "name": habit.name, "emoji": habit.emoji}
