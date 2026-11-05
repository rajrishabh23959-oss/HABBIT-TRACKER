from sqlalchemy import Column, String, Date, ForeignKey, func, DateTime
from app.db.database import Base


class KindnessLog(Base):
    """Feature #9: Random Acts of Kindness — tracks daily challenge completions."""
    __tablename__ = "kindness_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    challenge_text = Column(String, nullable=False)
    completed_date = Column(Date, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
