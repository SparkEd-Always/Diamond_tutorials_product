"""
Academic Record Model
Manages student grades, assessments, and academic performance
"""

from sqlalchemy import Column, String, Date, Enum as SQLAlchemyEnum, DateTime, ForeignKey, Numeric, Integer, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


class AssessmentTypeEnum(str, enum.Enum):
    """Assessment type enumeration"""
    UNIT_TEST = "Unit Test"
    MID_TERM = "Mid-term"
    FINAL_EXAM = "Final Exam"
    ASSIGNMENT = "Assignment"
    PROJECT = "Project"
    PRACTICAL = "Practical"
    ORAL = "Oral"
    QUIZ = "Quiz"
    PRESENTATION = "Presentation"


class GradeEnum(str, enum.Enum):
    """Grade enumeration (CBSE/ICSE standard)"""
    A_PLUS = "A+"
    A = "A"
    B_PLUS = "B+"
    B = "B"
    C_PLUS = "C+"
    C = "C"
    D = "D"
    E = "E"
    F = "F"


class AcademicRecord(Base):
    """
    Academic Record model for storing student grades and assessments.

    This model captures all academic performance data including exam scores,
    assignments, projects, and other assessments across different terms and subjects.
    """
    __tablename__ = "academic_records"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign Keys
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    academic_year_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True  # FK to academic_years table
    )
    term_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True  # FK to terms table
    )
    subject_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True  # FK to subjects table
    )

    # Assessment Details
    assessment_type = Column(
        SQLAlchemyEnum(AssessmentTypeEnum),
        nullable=False,
        index=True
    )
    assessment_name = Column(String(200), nullable=False)

    # Marks and Grades
    marks_obtained = Column(Numeric(6, 2), nullable=False)
    max_marks = Column(Numeric(6, 2), nullable=False)
    grade = Column(SQLAlchemyEnum(GradeEnum), nullable=True)
    percentage = Column(Numeric(5, 2), nullable=True)

    # Class Performance
    rank_in_class = Column(Integer, nullable=True)
    rank_in_section = Column(Integer, nullable=True)
    highest_marks_in_class = Column(Numeric(6, 2), nullable=True)
    class_average_marks = Column(Numeric(6, 2), nullable=True)

    # Teacher Feedback
    teacher_remarks = Column(Text, nullable=True)
    teacher_id = Column(UUID(as_uuid=True), nullable=True)  # FK to users/teachers table

    # Exam Details
    exam_date = Column(Date, nullable=True)
    submission_date = Column(Date, nullable=True)

    # Status
    is_absent = Column(Boolean, default=False, nullable=False)
    is_grace_marks_added = Column(Boolean, default=False, nullable=False)
    grace_marks = Column(Numeric(6, 2), default=0, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True, index=True)  # Soft delete

    # Audit Fields
    created_by = Column(UUID(as_uuid=True), nullable=True)
    updated_by = Column(UUID(as_uuid=True), nullable=True)

    # Relationships
    # student = relationship("Student", back_populates="academic_records")

    def __repr__(self):
        return f"<AcademicRecord(id={self.id}, student_id={self.student_id}, assessment={self.assessment_name}, marks={self.marks_obtained}/{self.max_marks})>"

    @property
    def calculated_percentage(self) -> float:
        """Calculate percentage from marks"""
        if self.max_marks and self.max_marks > 0:
            return round((self.marks_obtained / self.max_marks) * 100, 2)
        return 0.0

    @property
    def is_passing(self) -> bool:
        """Check if marks are passing (>= 33% for CBSE/ICSE)"""
        return self.calculated_percentage >= 33.0

    def calculate_grade(self) -> str:
        """
        Calculate grade based on percentage (CBSE grading system).

        CBSE Grading:
        91-100: A+
        81-90: A
        71-80: B+
        61-70: B
        51-60: C+
        41-50: C
        33-40: D
        21-32: E
        0-20: F
        """
        percentage = self.calculated_percentage

        if percentage >= 91:
            return GradeEnum.A_PLUS.value
        elif percentage >= 81:
            return GradeEnum.A.value
        elif percentage >= 71:
            return GradeEnum.B_PLUS.value
        elif percentage >= 61:
            return GradeEnum.B.value
        elif percentage >= 51:
            return GradeEnum.C_PLUS.value
        elif percentage >= 41:
            return GradeEnum.C.value
        elif percentage >= 33:
            return GradeEnum.D.value
        elif percentage >= 21:
            return GradeEnum.E.value
        else:
            return GradeEnum.F.value


# Indexes
from sqlalchemy import Index

# Composite index for student's academic records by year and term
Index(
    'idx_academic_student_year_term',
    AcademicRecord.student_id,
    AcademicRecord.academic_year_id,
    AcademicRecord.term_id
)

# Index for subject-wise queries
Index(
    'idx_academic_subject',
    AcademicRecord.subject_id,
    AcademicRecord.assessment_type
)

# Index for exam date queries
Index('idx_academic_exam_date', AcademicRecord.exam_date)

# Index for active records
Index(
    'idx_academic_active',
    AcademicRecord.deleted_at,
    postgresql_where=(AcademicRecord.deleted_at.is_(None))
)
