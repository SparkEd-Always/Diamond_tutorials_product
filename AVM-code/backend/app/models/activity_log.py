from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Who performed the action
    user_name = Column(String(255), nullable=False)  # Cache username for faster queries
    action_type = Column(String(50), nullable=False)  # e.g., 'attendance_marked', 'message_sent', 'notice_published', 'login'
    description = Column(Text, nullable=False)  # Human-readable description
    entity_type = Column(String(50), nullable=True)  # e.g., 'student', 'teacher', 'attendance', 'notice'
    entity_id = Column(Integer, nullable=True)  # ID of the related entity
    meta_data = Column(Text, nullable=True)  # JSON string for additional data
    viewed_by_user_ids = Column(Text, default='[]', nullable=False)  # JSON array of user IDs who have viewed this activity
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", backref="activities")

    def __repr__(self):
        return f"<ActivityLog(id={self.id}, action={self.action_type}, user={self.user_name})>"
