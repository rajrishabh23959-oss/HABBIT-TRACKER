"""
Anti-Habit Service — Feature #7: Track negative habits and urges.
Key principle: Slips do NOT reset streaks — compassionate tracking.
"""
import uuid
from datetime import date, datetime, timezone
from typing import Dict
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.models.habit import Habit
from app.models.urge_log import UrgeLog
from app.models.habit_log import HabitLog


def log_urge(db: Session, user_id: str, habit_id: str, resisted: bool) -> Dict:
    """
    Log an urge event. If resisted=True, the user completed breathing.
    If resisted=False, user slipped — but streak is NOT reset.
    """
    today = date.today()

    # Count today's slips
    slips_today = db.query(UrgeLog).filter(
        and_(
            UrgeLog.habit_id == habit_id,
            UrgeLog.user_id == user_id,
            func.date(UrgeLog.timestamp) == today,
            UrgeLog.resisted == False,
        )
    ).count()

    if not resisted:
        slips_today += 1  # this new slip

    # Create urge log entry
    urge = UrgeLog(
        id=str(uuid.uuid4()),
        habit_id=habit_id,
        user_id=user_id,
        resisted=resisted,
        slip_count_today=slips_today,
    )
    db.add(urge)
    db.commit()

    if resisted:
        message = "💪 Shandaar! Aapne craving ko resist kiya! Ek point aapke liye!"
    elif slips_today == 1:
        message = "😔 Koi baat nahi — ek slip se sab kuch khatam nahi hota. Kal fresh start! Streak bani hui hai! ✨"
    else:
        message = f"Aaj {slips_today} slips hue. Yaad rakhein: progress, perfection nahi. Kal try karein! 🌱"

    return {
        "habit_id": habit_id,
        "resisted": resisted,
        "slip_count_today": slips_today,
        "message": message,
        "show_breathing": not resisted,  # show breathing animation if they slipped
    }


def get_anti_habit_stats(db: Session, user_id: str, habit_id: str) -> Dict:
    """Get comprehensive stats for an anti-habit."""
    habit = db.query(Habit).filter(
        Habit.id == habit_id, Habit.user_id == user_id
    ).first()

    if not habit:
        return {"error": "Habit not found"}

    all_urges = db.query(UrgeLog).filter(
        UrgeLog.habit_id == habit_id,
        UrgeLog.user_id == user_id,
    ).all()

    total_urges = len(all_urges)
    total_resisted = sum(1 for u in all_urges if u.resisted)
    total_slips = total_urges - total_resisted
    resistance_rate = round(total_resisted / max(total_urges, 1), 2)

    # Calculate no-slip streak (days without any slip)
    today = date.today()
    current_streak = 0
    check_date = today

    while True:
        slips_on_day = db.query(UrgeLog).filter(
            and_(
                UrgeLog.habit_id == habit_id,
                UrgeLog.user_id == user_id,
                func.date(UrgeLog.timestamp) == check_date,
                UrgeLog.resisted == False,
            )
        ).count()
        if slips_on_day > 0:
            break
        current_streak += 1
        from datetime import timedelta
        check_date = check_date - timedelta(days=1)
        if current_streak > 365:
            break

    today_slips = db.query(UrgeLog).filter(
        and_(
            UrgeLog.habit_id == habit_id,
            UrgeLog.user_id == user_id,
            func.date(UrgeLog.timestamp) == today,
            UrgeLog.resisted == False,
        )
    ).count()

    return {
        "habit_id": habit_id,
        "name": habit.name,
        "emoji": habit.emoji,
        "total_urges": total_urges,
        "total_resisted": total_resisted,
        "total_slips": total_slips,
        "resistance_rate": resistance_rate,
        "current_streak": current_streak,
        "today_slips": today_slips,
    }
