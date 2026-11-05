import uuid
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class FamilyMessage(Base):
    __tablename__ = "family_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_type = Column(String, nullable=False)  # "parent" | "gf"
    sender_name = Column(String, nullable=False)  # e.g. "Mom & Dad" or "My GF ❤️"
    sender_phone = Column(String, nullable=True)
    message_text = Column(String, nullable=False)
    audio_transcript = Column(String, nullable=True)
    is_listened = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="family_messages")
