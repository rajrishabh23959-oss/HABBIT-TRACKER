from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from app.db.database import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    emoji = Column(String, default="✅")
    frequency = Column(String, default="daily")  # daily | weekly | custom
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # Feature #7: Anti-habit tracking
    habit_type = Column(String, default="positive")  # positive | anti

    # Feature #2: Habit stacking
    stack_trigger = Column(String, nullable=True)  # e.g. "After morning chai"

    # Feature #3: Virtual Garden
    plant_level = Column(Integer, default=0)   # 0=seed, 1=sprout, 2=plant, 3=tree, 4=blooming
    plant_streak = Column(Integer, default=0)  # consecutive days watered
    plant_health = Column(Integer, default=100)  # 0-100, decreases on misses
