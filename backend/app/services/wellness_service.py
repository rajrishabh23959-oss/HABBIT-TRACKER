import uuid
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.wellness_log import WellnessLog


def log_wellness(db: Session, user_id: str, day: int, month: int, year: int,
                 mood: float = None, sleep_hours: float = None):
    log_date = date(year, month, day)
    existing = db.query(WellnessLog).filter(
        and_(
            WellnessLog.user_id == user_id,
            WellnessLog.log_date == log_date,
        )
    ).first()

    if existing:
        if mood is not None:
            existing.mood = mood
        if sleep_hours is not None:
            existing.sleep_hours = sleep_hours
    else:
        record = WellnessLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            log_date=log_date,
            mood=mood,
            sleep_hours=sleep_hours,
        )
        db.add(record)

    db.commit()
    return {"status": "ok"}
