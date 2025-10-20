"""
Fee Session Model
Groups fee assignments into manageable sessions for bulk assignment and tracking
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ...core.database import Base


class FeeSessionStatus(enum.Enum):
    """Fee Session Status"""
    DRAFT = "draft"              # Session created but not finalized
    ACTIVE = "active"            # Session is active and students can make payments
    CLOSED = "closed"            # Session closed, no more payments accepted
    ARCHIVED = "archived"        # Old session, archived for records


class FeeSession(Base):
    """
    Fee Session Model
    Represents a bulk fee assignment session (e.g., "Q1 2024 Fees", "Annual Fees 2024-25")

    Purpose:
    - Group multiple student fee assignments together
    - Track payment progress for a cohort of students
    - Manage fee collection in organized sessions

    Example:
    - Session Name: "Q1 2024-25 Tuition Fees"
    - Fee Structure: Class 10, Tuition Fee ₹50,000
    - Students: All Class 10 students (80 students)
    - Outstanding: 25 students pending, ₹12,50,000 remaining
    """
    __tablename__ = "fee_sessions"

    id = Column(Integer, primary_key=True, index=True)

    # Session Details
    session_name = Column(String(200), nullable=False, index=True)
    session_description = Column(Text, nullable=True)

    # References
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True)
    fee_structure_id = Column(Integer, ForeignKey("fee_structures.id", ondelete="CASCADE"), nullable=False, index=True)

    # Dates
    start_date = Column(Date, nullable=False)         # When fees become applicable
    due_date = Column(Date, nullable=False)           # Payment deadline

    # Status
    status = Column(SQLEnum(FeeSessionStatus), default=FeeSessionStatus.DRAFT, nullable=False, index=True)

    # Statistics (denormalized for performance - updated via triggers/background jobs)
    total_students = Column(Integer, default=0)       # Total students assigned
    total_amount = Column(Numeric(12, 2), default=0.00)      # Total expected amount
    collected_amount = Column(Numeric(12, 2), default=0.00)  # Total collected
    outstanding_amount = Column(Numeric(12, 2), default=0.00) # Total pending
    students_paid = Column(Integer, default=0)        # Count of students who paid fully
    students_pending = Column(Integer, default=0)     # Count with pending payments

    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
    closed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    remarks = Column(Text, nullable=True)

    # Relationships
    academic_year = relationship("AcademicYear")
    fee_structure = relationship("FeeStructure")
    created_by_user = relationship("User", foreign_keys=[created_by])
    closed_by_user = relationship("User", foreign_keys=[closed_by])
    assignments = relationship("FeeSessionAssignment", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FeeSession {self.session_name} ({self.status.value})>"

    def calculate_collection_percentage(self) -> float:
        """Calculate collection percentage"""
        if not self.total_amount or self.total_amount <= 0:
            return 0.0
        return round((float(self.collected_amount) / float(self.total_amount)) * 100, 2)


class FeeSessionAssignment(Base):
    """
    Fee Session Assignment Model
    Links students to fee sessions with payment tracking

    This bridges the gap between FeeSession and StudentFeeAssignment
    Tracks individual student's payment status within a session
    """
    __tablename__ = "fee_session_assignments"

    id = Column(Integer, primary_key=True, index=True)

    # References
    session_id = Column(Integer, ForeignKey("fee_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    student_fee_assignment_id = Column(Integer, ForeignKey("student_fee_assignments.id", ondelete="CASCADE"), nullable=False, index=True)

    # Amount tracking
    expected_amount = Column(Numeric(10, 2), nullable=False)  # Amount this student needs to pay
    paid_amount = Column(Numeric(10, 2), default=0.00)        # Amount paid so far
    outstanding_amount = Column(Numeric(10, 2), nullable=False) # Remaining amount

    # Payment status
    is_paid = Column(Boolean, default=False, index=True)      # Fully paid or not
    payment_status = Column(String(50), default="pending")    # pending/partial/paid/overdue

    # Dates
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)  # When fully paid
    last_payment_at = Column(DateTime(timezone=True), nullable=True)  # Last partial payment

    # Metadata
    remarks = Column(Text, nullable=True)

    # Relationships
    session = relationship("FeeSession", back_populates="assignments")
    student = relationship("Student")
    student_fee_assignment = relationship("StudentFeeAssignment")

    # Composite unique constraint
    __table_args__ = (
        # One student can only be assigned once per session
        {'sqlite_autoincrement': True}
    )

    def __repr__(self):
        return f"<FeeSessionAssignment Session:{self.session_id} Student:{self.student_id} Status:{self.payment_status}>"

    def update_payment_status(self):
        """Update payment status based on amounts"""
        if self.paid_amount >= self.expected_amount:
            self.payment_status = "paid"
            self.is_paid = True
        elif self.paid_amount > 0:
            self.payment_status = "partial"
        else:
            self.payment_status = "pending"

        self.outstanding_amount = max(0, float(self.expected_amount) - float(self.paid_amount))
