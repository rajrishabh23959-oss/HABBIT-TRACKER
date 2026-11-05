from sqlalchemy import Column, String, Float, DateTime, func
from app.db.database import Base


class AnonymousGroupMember(Base):
    """Feature #4: Anonymous groups — stores group membership and progress."""
    __tablename__ = "anonymous_group_members"

    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, index=True, nullable=False)   # UUID for the group
    goal_tag = Column(String, nullable=False)               # e.g. "5AM Club", "No Sugar"
    user_id = Column(String, nullable=False)                # anonymous — NOT a FK on purpose
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    progress_pct = Column(Float, default=0.0)               # 0.0-100.0 — only this is shown to others
