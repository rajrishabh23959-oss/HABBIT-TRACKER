"""Feature #4: Ghost Mode & Anonymous Group endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.social_schema import (
    AccountabilitySetup, GhostCheckResponse,
    GroupJoinRequest, GroupLeaderboard, KindnessCompleteRequest, KindnessCompleteResponse,
)
from app.services.social_service import (
    set_accountability_partner, check_and_notify_partner,
    join_anonymous_group, get_group_leaderboard,
)

router = APIRouter()


# ── Ghost Mode ──────────────────────────────────────────────────────────────

@router.post("/accountability")
def setup_accountability(
    payload: AccountabilitySetup,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #4: Enable/disable ghost mode with accountability partner."""
    return set_accountability_partner(
        db, current_user.id, payload.contact, payload.partner_name, payload.enabled
    )


@router.get("/ghost-check", response_model=GhostCheckResponse)
def ghost_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #4: Check if partner should be notified (in-app simulation)."""
    return check_and_notify_partner(db, current_user.id)


@router.get("/ghost-status")
def ghost_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current ghost mode status for the user."""
    return {
        "ghost_mode_enabled": current_user.ghost_mode_enabled,
        "partner_contact": current_user.accountability_partner_contact,
    }


# ── Anonymous Groups ────────────────────────────────────────────────────────

@router.post("/groups/join")
def join_group(
    payload: GroupJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #4: Join or update progress in an anonymous group."""
    return join_anonymous_group(db, current_user.id, payload.goal_tag, payload.progress_pct)


@router.get("/groups/{group_id}", response_model=GroupLeaderboard)
def group_leaderboard(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feature #4: View anonymous group progress leaderboard."""
    result = get_group_leaderboard(db, group_id, current_user.id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
