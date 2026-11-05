"""Feature #9: Random Acts of Kindness endpoint."""
import uuid
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.kindness_log import KindnessLog
from app.schemas.social_schema import KindnessChallenge, KindnessCompleteRequest, KindnessCompleteResponse
from app.services.ai_service import get_daily_kindness_challenge

router = APIRouter()


@router.get("/today", response_model=KindnessChallenge)
async def get_today_challenge(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #9: Get today's random kindness challenge."""
    return await get_daily_kindness_challenge()


@router.post("/complete", response_model=KindnessCompleteResponse)
async def complete_challenge(
    payload: KindnessCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #9: Mark today's kindness challenge as complete."""
    today = date.today()

    # Check if already completed today
    existing = db.query(KindnessLog).filter(
        KindnessLog.user_id == current_user.id,
        KindnessLog.completed_date == today,
    ).first()

    if not existing:
        log = KindnessLog(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            challenge_text=payload.challenge_text,
            completed_date=today,
        )
        db.add(log)
        # Award XP
        current_user.xp += 20
        current_user.level = current_user.xp // 500 + 1
        db.commit()

    # Calculate streak
    from datetime import timedelta
    streak = 0
    check_date = today
    while True:
        count = db.query(KindnessLog).filter(
            KindnessLog.user_id == current_user.id,
            KindnessLog.completed_date == check_date,
        ).count()
        if count == 0:
            break
        streak += 1
        check_date -= timedelta(days=1)
        if streak > 365:
            break

    messages = [
        "Wah! Aapne duniya ko thoda behtar banaya! 🌟",
        "Aapki kindness kisi ke din ko special bana sakti hai! 💝",
        "Ek choti si act of kindness ripples create karti hai! 🌊",
        "Shukriya! Aap ek better world banana chahte hain! 🌍",
    ]
    import random
    msg = random.choice(messages) if not existing else "Aaj ki kindness pehle hi complete ki thi! ✅"

    return {
        "message": msg,
        "streak": streak,
        "xp_earned": 20 if not existing else 0,
    }


@router.get("/streak")
def get_kindness_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the user's current kindness challenge streak."""
    from datetime import timedelta
    today = date.today()
    streak = 0
    check_date = today
    while True:
        count = db.query(KindnessLog).filter(
            KindnessLog.user_id == current_user.id,
            KindnessLog.completed_date == check_date,
        ).count()
        if count == 0:
            break
        streak += 1
        check_date -= timedelta(days=1)
        if streak > 365:
            break
    return {"streak": streak}
