from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Targeting
    target_audience = Column(JSON)  # ["all", "parents", "students", "teachers", "class_7", "class_8"]
    target_classes = Column(JSON)  # ["Class 7", "Class 8A"]

    # Publishing
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True))
    scheduled_at = Column(DateTime(timezone=True))  # For scheduled announcements

    # Communication tracking
    sent_via_whatsapp = Column(Boolean, default=False)
    sent_via_email = Column(Boolean, default=False)
    sent_via_sms = Column(Boolean, default=False)

    # Priority and urgency
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    requires_acknowledgment = Column(Boolean, default=False)

    # Attachments
    attachments = Column(JSON)  # File paths/URLs

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    author = relationship("User", foreign_keys=[author_id])

    def __repr__(self):
        return f"<Notice(title={self.title}, author_id={self.author_id}, published={self.is_published})>"