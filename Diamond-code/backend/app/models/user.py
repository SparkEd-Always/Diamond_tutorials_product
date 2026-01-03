from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..core.database import Base

class UserRole(enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    PARENT = "parent"
    STUDENT = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String(20), unique=True, index=True)  # Diamond-ADM-001, Diamond-TCH-001, etc.
    email = Column(String(100), unique=True, index=True)
    phone_number = Column(String(15), unique=True, index=True)
    username = Column(String(50), unique=True, index=True)
    full_name = Column(String(100))
    hashed_password = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    sent_communications = relationship("Communication", foreign_keys="Communication.sender_id", back_populates="sender")
    approved_attendance = relationship("Attendance", back_populates="approved_by_user")

    def __repr__(self):
        return f"<User(unique_id={self.unique_id}, full_name={self.full_name}, role={self.role})>"