from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, func
from app.db.database import Base


class UrgeLog(Base):
    """Feature #7: Anti-Habit — tracks each time a user presses the urge button."""
    __tablename__ = "urge_logs"

    id = Column(String, primary_key=True, index=True)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    resisted = Column(Boolean, default=True)  # True = resisted (breathed), False = slip
    slip_count_today = Column(Integer, default=0)
