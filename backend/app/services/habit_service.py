import uuid
import calendar
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.wellness_log import WellnessLog
from app.models.user import User
from app.core.security import get_password_hash, verify_password


MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

DEFAULT_HABITS = [
    {"name": "Wake up at 05:00", "emoji": "⏰"},
    {"name": "Gym", "emoji": "💪"},
    {"name": "Reading / Learning", "emoji": "📖"},
    {"name": "Day Planning", "emoji": "🗓️"},
    {"name": "No Gooning", "emoji": "🚫"},
    {"name": "No Alcohol", "emoji": "🍺"},
    {"name": "Social Media Detox", "emoji": "📵"},
    {"name": "Cold Shower", "emoji": "🚿"},
    {"name": "Meditation", "emoji": "🧘"},
    {"name": "Stretching", "emoji": "🤸"},
]


def get_or_create_user(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def seed_default_habits(db: Session, user_id: str):
    """Seed default habits for a new user."""
    for i, h in enumerate(DEFAULT_HABITS):
        habit = Habit(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=h["name"],
            emoji=h["emoji"],
            order_index=i,
        )
        db.add(habit)
    db.commit()


def get_dashboard(db: Session, user_id: str, month: int, year: int) -> dict:
    total_days = calendar.monthrange(year, month)[1]
    habits = db.query(Habit).filter(
        Habit.user_id == user_id, Habit.is_active == True
    ).order_by(Habit.order_index).all()

    # Build logs dict
    start_date = date(year, month, 1)
    end_date = date(year, month, total_days)

    all_logs = db.query(HabitLog).filter(
        and_(
            HabitLog.user_id == user_id,
            HabitLog.log_date >= start_date,
            HabitLog.log_date <= end_date,
        )
    ).all()

    log_map = {}
    for log in all_logs:
        log_map[(log.habit_id, log.log_date.day)] = log.completed

    habits_data = []
    daily_totals = {d: 0 for d in range(1, total_days + 1)}
    total_goal = len(habits) * total_days
    total_completed = 0

    for habit in habits:
        logs = {}
        for day in range(1, total_days + 1):
            completed = log_map.get((habit.id, day), False)
            logs[str(day)] = completed
            if completed:
                daily_totals[day] += 1
                total_completed += 1
        habits_data.append({
            "id": habit.id,
            "name": habit.name,
            "emoji": habit.emoji,
            "logs": logs,
        })

    # Daily progress percentage
    n_habits = max(len(habits), 1)
    daily_progress = [round(daily_totals[d] / n_habits, 2) for d in range(1, total_days + 1)]

    # Wellness
    wellness_logs = db.query(WellnessLog).filter(
        and_(
            WellnessLog.user_id == user_id,
            WellnessLog.log_date >= start_date,
            WellnessLog.log_date <= end_date,
        )
    ).all()
    mood_map = {}
    sleep_map = {}
    for wl in wellness_logs:
        mood_map[str(wl.log_date.day)] = wl.mood
        sleep_map[str(wl.log_date.day)] = wl.sleep_hours

    return {
        "month": MONTH_NAMES[month],
        "year": year,
        "total_days": total_days,
        "habits": habits_data,
        "wellness": {"mood": mood_map, "sleep": sleep_map},
        "daily_progress": daily_progress,
        "overall_stats": {
            "goal": total_goal,
            "completed": total_completed,
            "left": total_goal - total_completed,
            "completion_percentage": round(total_completed / max(total_goal, 1) * 100, 1),
        },
    }


def toggle_habit_log(db: Session, user_id: str, habit_id: str, day: int, month: int, year: int) -> dict:
    # Verify the habit exists and belongs to this user
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()
    if not habit:
        return None  # Signal to endpoint that habit was not found

    log_date = date(year, month, day)
    existing = db.query(HabitLog).filter(
        and_(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == user_id,
            HabitLog.log_date == log_date,
        )
    ).first()

    if existing:
        existing.completed = not existing.completed
        completed = existing.completed
    else:
        log = HabitLog(
            id=str(uuid.uuid4()),
            habit_id=habit_id,
            user_id=user_id,
            log_date=log_date,
            completed=True,
        )
        db.add(log)
        completed = True

    db.commit()

    # XP update
    user = db.query(User).filter(User.id == user_id).first()
    xp_earned = 10 if completed else -5
    user.xp = max(0, user.xp + xp_earned)
    user.level = user.xp // 500 + 1

    # Feature #3: Update plant health and streak
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if habit:
        if completed:
            # Water the plant — increase health and streak
            habit.plant_streak = habit.plant_streak + 1 if habit.plant_streak is not None else 1
            habit.plant_health = min(100, (habit.plant_health or 50) + 10)
            # Level up plant every 7 days of streak
            streak = habit.plant_streak
            habit.plant_level = min(4, streak // 7)
        else:
            # Plant dries out — decrease health
            habit.plant_health = max(0, (habit.plant_health or 50) - 20)
            habit.plant_streak = max(0, (habit.plant_streak or 0) - 1)

    db.commit()

    return {
        "habit_id": habit_id,
        "day": day,
        "completed": completed,
        "xp_earned": xp_earned,
        "new_total_xp": user.xp,
        "new_level": user.level,
    }
