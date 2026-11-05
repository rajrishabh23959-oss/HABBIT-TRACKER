"""
Social Service — Feature #4: Ghost Mode & Anonymous Groups.
Ghost Mode: generates playful warning message when habits are missed.
Anonymous Groups: join groups of ≤10 users by goal tag.
"""
import uuid
from datetime import date
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.models.user import User
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.anonymous_group import AnonymousGroupMember


def set_accountability_partner(
    db: Session, user_id: str, contact: str, partner_name: str, enabled: bool
) -> Dict:
    """Feature #4: Set ghost mode accountability partner."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    user.accountability_partner_contact = contact if enabled else None
    user.ghost_mode_enabled = enabled
    db.commit()

    return {
        "success": True,
        "ghost_mode_enabled": enabled,
        "contact": contact if enabled else None,
        "message": f"Ghost mode {'enabled' if enabled else 'disabled'}! Partner: {partner_name}",
    }


def check_and_notify_partner(db: Session, user_id: str) -> Dict:
    """
    Feature #4: Check if user has missed habits today.
    Returns the playful warning message to 'send' to their partner.
    (In-app simulation — shows what would be sent)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.ghost_mode_enabled:
        return {"should_notify": False, "message": "", "missed_habits": []}

    today = date.today()

    # Get active habits
    habits = db.query(Habit).filter(
        Habit.user_id == user_id, Habit.is_active == True, Habit.habit_type == "positive"
    ).all()

    # Check which habits are not completed today
    completed_today = db.query(HabitLog.habit_id).filter(
        and_(
            HabitLog.user_id == user_id,
            HabitLog.log_date == today,
            HabitLog.completed == True,
        )
    ).all()
    completed_ids = {row[0] for row in completed_today}

    missed = [h.name for h in habits if h.id not in completed_ids]

    if not missed:
        return {
            "should_notify": False,
            "message": "Sab habits complete hain! Partner ko notification ki zaroorat nahi. ✅",
            "missed_habits": [],
        }

    user_name = user.name or "User"
    missed_list = ", ".join(missed[:3])
    message = (
        f"🚨 *Ghost Mode Alert!* 🚨\n\n"
        f"Hey! {user_name} ne aaj yeh habits skip ki hain:\n"
        f"❌ {missed_list}\n\n"
        f"Unhe thoda motivation bhejo! 💪\n"
        f"(Auto-sent by HabitGame)"
    )

    return {
        "should_notify": True,
        "message": message,
        "missed_habits": missed,
        "partner_contact": user.accountability_partner_contact,
    }


def join_anonymous_group(db: Session, user_id: str, goal_tag: str, progress_pct: float) -> Dict:
    """
    Feature #4: Join an anonymous group by goal tag.
    Groups have max 10 members. If full, create new group.
    """
    # Check if user already in a group with this tag
    existing = db.query(AnonymousGroupMember).filter(
        AnonymousGroupMember.user_id == user_id,
        AnonymousGroupMember.goal_tag == goal_tag,
    ).first()

    if existing:
        # Update progress
        existing.progress_pct = progress_pct
        db.commit()
        group_id = existing.group_id
    else:
        # Find group with space
        groups = db.query(
            AnonymousGroupMember.group_id,
            func.count(AnonymousGroupMember.id).label("member_count")
        ).filter(
            AnonymousGroupMember.goal_tag == goal_tag
        ).group_by(AnonymousGroupMember.group_id).all()

        group_id = None
        for grp in groups:
            if grp.member_count < 10:
                group_id = grp.group_id
                break

        if not group_id:
            group_id = str(uuid.uuid4())

        member = AnonymousGroupMember(
            id=str(uuid.uuid4()),
            group_id=group_id,
            goal_tag=goal_tag,
            user_id=user_id,
            progress_pct=progress_pct,
        )
        db.add(member)
        db.commit()

    # Return leaderboard
    return get_group_leaderboard(db, group_id, user_id)


def get_group_leaderboard(db: Session, group_id: str, user_id: str) -> Dict:
    """Feature #4: Get anonymous group leaderboard (only progress %, no names)."""
    members = db.query(AnonymousGroupMember).filter(
        AnonymousGroupMember.group_id == group_id
    ).order_by(AnonymousGroupMember.progress_pct.desc()).all()

    if not members:
        return {"error": "Group not found"}

    ranked = [
        {"rank": i + 1, "progress_pct": round(m.progress_pct, 1)}
        for i, m in enumerate(members)
    ]

    your_rank = next(
        (i + 1 for i, m in enumerate(members) if m.user_id == user_id), 0
    )
    your_progress = next(
        (m.progress_pct for m in members if m.user_id == user_id), 0.0
    )

    return {
        "group_id": group_id,
        "goal_tag": members[0].goal_tag if members else "",
        "members": ranked,
        "your_rank": your_rank,
        "your_progress": round(your_progress, 1),
        "total_members": len(members),
    }
