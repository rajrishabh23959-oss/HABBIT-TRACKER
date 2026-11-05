from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True, index=True)
    hashed_password = Column(String, nullable=False)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Parent & GF (Partner) Phone Numbers for AI Text-to-Audio transcription
    parent_phone = Column(String, nullable=True)
    partner_phone = Column(String, nullable=True)

    # Feature #1: Mood tracking
    current_mood = Column(String, nullable=True)  # energetic | tired | stressed | happy

    # Feature #4: Accountability partner / Ghost Mode
    accountability_partner_contact = Column(String, nullable=True)
    ghost_mode_enabled = Column(Boolean, default=False)

    # Cascade deletes to prevent data bloat
    habits = relationship("Habit", cascade="all, delete-orphan")
    habit_logs = relationship("HabitLog", cascade="all, delete-orphan")
    wellness_logs = relationship("WellnessLog", cascade="all, delete-orphan")
    urge_logs = relationship("UrgeLog", cascade="all, delete-orphan")
    kindness_logs = relationship("KindnessLog", cascade="all, delete-orphan")
    family_messages = relationship("FamilyMessage", cascade="all, delete-orphan")
