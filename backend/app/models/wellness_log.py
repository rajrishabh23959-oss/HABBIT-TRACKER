from sqlalchemy import Column, String, Date, Float, ForeignKey, Index
from app.db.database import Base


class WellnessLog(Base):
    __tablename__ = "wellness_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    mood = Column(Float, nullable=True)       # 1-10
    sleep_hours = Column(Float, nullable=True)  # e.g. 7.5

    # H5: Composite index for fast wellness queries
    __table_args__ = (
        Index("ix_wellness_logs_user_date", "user_id", "log_date"),
    )
