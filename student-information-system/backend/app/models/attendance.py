"""
Attendance Record Model
Manages daily student attendance tracking
"""

from sqlalchemy import Column, String, Date, Enum as SQLAlchemyEnum, DateTime, ForeignKey, Boolean, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


class SessionEnum(str, enum.Enum):
    """Session enumeration"""
    FULL_DAY = "Full Day"
    MORNING = "Morning"
    AFTERNOON = "Afternoon"


class AttendanceStatusEnum(str, enum.Enum):
    """Attendance status enumeration"""
    PRESENT = "Present"
    ABSENT = "Absent"
    LATE = "Late"
    HALF_DAY = "Half Day"
    ON_LEAVE = "On Leave"
    SICK_LEAVE = "Sick Leave"
    EXCUSED_ABSENCE = "Excused Absence"


class AttendanceRecord(Base):
    """
    Attendance Record model for tracking daily student attendance.

    This model captures daily attendance data for students, including
    status, session, absence reasons, and approval information.
    """
    __tablename__ = "attendance_records"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Date and Session
    attendance_date = Column(Date, nullable=False, index=True)
    session = Column(
        SQLAlchemyEnum(SessionEnum),
        nullable=False,
        default=SessionEnum.FULL_DAY
    )

    # Class Information (for historical tracking)
    class_id = Column(UUID(as_uuid=True), nullable=True)  # FK to classes table
    section_id = Column(UUID(as_uuid=True), nullable=True)  # FK to sections table

    # Attendance Status
    status = Column(
        SQLAlchemyEnum(AttendanceStatusEnum),
        nullable=False,
        index=True
    )

    # Absence Details
    absence_reason = Column(String(500), nullable=True)
    leave_approved = Column(Boolean, default=False, nullable=False)
    leave_approved_by = Column(UUID(as_uuid=True), nullable=True)  # FK to users table
    leave_approved_at = Column(DateTime, nullable=True)

    # Medical Certificate
    has_medical_certificate = Column(Boolean, default=False, nullable=False)
    medical_certificate_url = Column(String(500), nullable=True)

    # Late Arrival
    arrival_time = Column(DateTime, nullable=True)
    late_minutes = Column(Integer, nullable=True)

    # Marked By
    marked_by = Column(
        UUID(as_uuid=True),
        nullable=False  # FK to users/teachers table
    )
    marked_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Additional Notes
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)  # Soft delete

    # Relationships
    # student = relationship("Student", back_populates="attendance_records")

    def __repr__(self):
        return f"<AttendanceRecord(id={self.id}, student_id={self.student_id}, date={self.attendance_date}, status={self.status})>"

    @property
    def is_present(self) -> bool:
        """Check if student was present"""
        return self.status in [
            AttendanceStatusEnum.PRESENT,
            AttendanceStatusEnum.LATE,
            AttendanceStatusEnum.HALF_DAY
        ]

    @property
    def is_absent(self) -> bool:
        """Check if student was absent"""
        return self.status in [
            AttendanceStatusEnum.ABSENT,
            AttendanceStatusEnum.ON_LEAVE,
            AttendanceStatusEnum.SICK_LEAVE
        ]

    @property
    def is_excused(self) -> bool:
        """Check if absence was excused"""
        return (
            self.status in [
                AttendanceStatusEnum.ON_LEAVE,
                AttendanceStatusEnum.SICK_LEAVE,
                AttendanceStatusEnum.EXCUSED_ABSENCE
            ] and self.leave_approved
        ) or self.has_medical_certificate

    @property
    def attendance_value(self) -> float:
        """
        Get attendance value for calculations.

        Present/Late = 1.0
        Half Day = 0.5
        Absent/Leave = 0.0
        """
        if self.status in [AttendanceStatusEnum.PRESENT, AttendanceStatusEnum.LATE]:
            return 1.0
        elif self.status == AttendanceStatusEnum.HALF_DAY:
            return 0.5
        else:
            return 0.0


# Indexes
from sqlalchemy import Index

# Composite index for student attendance by date
Index(
    'idx_attendance_student_date',
    AttendanceRecord.student_id,
    AttendanceRecord.attendance_date
)

# Unique constraint for student + date + session (prevent duplicates)
Index(
    'idx_attendance_unique',
    AttendanceRecord.student_id,
    AttendanceRecord.attendance_date,
    AttendanceRecord.session,
    unique=True
)

# Index for date range queries
Index('idx_attendance_date', AttendanceRecord.attendance_date)

# Index for status queries
Index('idx_attendance_status', AttendanceRecord.status)

# Index for class and section queries
Index(
    'idx_attendance_class_section',
    AttendanceRecord.class_id,
    AttendanceRecord.section_id,
    AttendanceRecord.attendance_date
)

# Index for active records
Index(
    'idx_attendance_active',
    AttendanceRecord.deleted_at,
    postgresql_where=(AttendanceRecord.deleted_at.is_(None))
)
