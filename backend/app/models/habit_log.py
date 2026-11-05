from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey, Index
from app.db.database import Base


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(String, primary_key=True, index=True)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)

    # H5: Composite indexes for fast dashboard and toggle queries
    __table_args__ = (
        Index("ix_habit_logs_user_date", "user_id", "log_date"),
        Index("ix_habit_logs_habit_user", "habit_id", "user_id"),
    )
