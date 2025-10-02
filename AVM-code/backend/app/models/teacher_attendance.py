from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class TeacherAttendanceStatus(str, enum.Enum):
    """Teacher Attendance Status"""
    present = "present"
    absent = "absent"
    half_day = "half_day"
    on_leave = "on_leave"


class TeacherAttendance(Base):
    """Teacher Attendance Model"""
    __tablename__ = "teacher_attendance"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    status = Column(SQLEnum(TeacherAttendanceStatus), nullable=False)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    remarks = Column(Text, nullable=True)

    # Who marked the attendance
    marked_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Timestamps
    marked_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Lock functionality
    is_locked = Column(Boolean, default=False, nullable=False)
    locked_at = Column(DateTime, nullable=True)
    locked_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    teacher = relationship("Teacher", back_populates="attendance_records")
    marked_by = relationship("User", foreign_keys=[marked_by_admin_id])
    locked_by = relationship("User", foreign_keys=[locked_by_admin_id])

    def __repr__(self):
        return f"<TeacherAttendance(teacher_id={self.teacher_id}, date={self.date}, status={self.status})>"
