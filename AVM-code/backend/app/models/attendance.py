from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..core.database import Base

class AttendanceStatus(enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    LEAVE = "leave"

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    remarks = Column(String(200))

    # Draft and submission workflow
    is_draft = Column(Boolean, default=True)
    submitted_for_approval = Column(Boolean, default=False)
    submitted_at = Column(DateTime(timezone=True))

    # Admin approval workflow
    admin_approved = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))

    # WhatsApp integration tracking
    whatsapp_sent = Column(Boolean, default=False)
    whatsapp_sent_at = Column(DateTime(timezone=True))

    marked_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="attendance_records")
    teacher = relationship("Teacher", back_populates="attendance_marked")
    approved_by_user = relationship("User", back_populates="approved_attendance")

    def __repr__(self):
        return f"<Attendance(student_id={self.student_id}, date={self.date}, status={self.status}, approved={self.admin_approved})>"