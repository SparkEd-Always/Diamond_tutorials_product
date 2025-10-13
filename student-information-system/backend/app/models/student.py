"""
Student Model
Core student profile information
"""

from sqlalchemy import Column, String, Date, Integer, Enum as SQLAlchemyEnum, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


class GenderEnum(str, enum.Enum):
    """Gender enumeration"""
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class CasteCategoryEnum(str, enum.Enum):
    """Caste category enumeration"""
    GENERAL = "General"
    OBC = "OBC"
    SC = "SC"
    ST = "ST"
    OTHER = "Other"


class StudentStatusEnum(str, enum.Enum):
    """Student status enumeration"""
    ACTIVE = "Active"
    ALUMNI = "Alumni"
    TRANSFERRED = "Transferred"
    EXPELLED = "Expelled"
    WITHDRAWN = "Withdrawn"


class Student(Base):
    """
    Student model representing core student profile information.

    This is the central model for the Student Information System,
    containing all essential student data and serving as the single
    source of truth for student information.
    """
    __tablename__ = "students"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Basic Information
    admission_number = Column(String(50), unique=True, nullable=False, index=True)
    roll_number = Column(String(20), nullable=True)
    first_name = Column(String(100), nullable=False, index=True)
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=False, index=True)

    # Personal Information
    date_of_birth = Column(Date, nullable=False)
    gender = Column(SQLAlchemyEnum(GenderEnum), nullable=False)
    blood_group = Column(String(10), nullable=True)
    nationality = Column(String(50), default="Indian")
    religion = Column(String(50), nullable=True)
    caste_category = Column(SQLAlchemyEnum(CasteCategoryEnum), nullable=True)

    # Government IDs
    aadhar_number = Column(String(12), unique=True, nullable=True)

    # Photo
    photo_url = Column(String(500), nullable=True)

    # Academic Information
    current_class_id = Column(UUID(as_uuid=True), nullable=True)  # FK to classes table
    current_section_id = Column(UUID(as_uuid=True), nullable=True)  # FK to sections table
    house_id = Column(UUID(as_uuid=True), nullable=True)  # FK to houses table
    admission_date = Column(Date, nullable=False)

    # Status
    student_status = Column(
        SQLAlchemyEnum(StudentStatusEnum),
        nullable=False,
        default=StudentStatusEnum.ACTIVE,
        index=True
    )

    # Profile Completeness
    profile_completeness_percentage = Column(
        Integer,
        default=0,
        nullable=False
    )

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)  # Soft delete

    # Audit Fields
    created_by = Column(UUID(as_uuid=True), nullable=True)  # FK to users table
    updated_by = Column(UUID(as_uuid=True), nullable=True)  # FK to users table

    # Relationships (will be defined when other models are created)
    # parents = relationship("StudentParentRelationship", back_populates="student")
    # academic_records = relationship("AcademicRecord", back_populates="student")
    # attendance_records = relationship("AttendanceRecord", back_populates="student")

    def __repr__(self):
        return f"<Student(id={self.id}, admission_number={self.admission_number}, name={self.first_name} {self.last_name})>"

    @property
    def full_name(self) -> str:
        """Get full name of the student"""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

    @property
    def is_active(self) -> bool:
        """Check if student is currently active"""
        return self.student_status == StudentStatusEnum.ACTIVE and self.deleted_at is None

    def calculate_age(self) -> int:
        """Calculate current age of the student"""
        today = datetime.utcnow().date()
        age = today.year - self.date_of_birth.year
        if today.month < self.date_of_birth.month or \
           (today.month == self.date_of_birth.month and today.day < self.date_of_birth.day):
            age -= 1
        return age


# Indexes
# Additional composite indexes for common queries
from sqlalchemy import Index

# Index for searching by name
Index('idx_student_name', Student.first_name, Student.last_name)

# Index for active students
Index('idx_student_active', Student.deleted_at, postgresql_where=(Student.deleted_at.is_(None)))

# Index for class and section queries
Index('idx_student_class_section', Student.current_class_id, Student.current_section_id)
