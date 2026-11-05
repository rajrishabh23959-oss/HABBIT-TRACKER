from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.wellness_schema import WellnessLogRequest
from app.services.wellness_service import log_wellness

router = APIRouter()


@router.post("/log")
def log_wellness_endpoint(
    payload: WellnessLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return log_wellness(
        db, current_user.id,
        payload.day, payload.month, payload.year,
        payload.mood, payload.sleep_hours,
    )
