"""
Adhoc Fee Assignment Model
For one-time, individual student fee assignments (lost items, fines, special exams, etc.)
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ...core.database import Base


class AdhocFeeAssignment(Base):
    """
    Adhoc Fee Assignment Model
    For individual/ad-hoc fee assignments not tied to regular fee structures

    Use Cases:
    - Lost items (ID card, books, uniforms)
    - Library fines
    - Special exam fees (Olympiad, competitive exams)
    - Damage charges (broken equipment, vandalism)
    - Event fees (costume, materials)
    - Replacement fees (tie, belt, badges)

    Example:
    - Fee Name: "Lost ID Card Replacement"
    - Description: "Replacement charge for lost student ID card"
    - Amount: ₹500
    - Student: Rahul Kumar (Class 10A)
    - Due Date: 2024-11-30
    """
    __tablename__ = "adhoc_fee_assignments"

    id = Column(Integer, primary_key=True, index=True)

    # Fee Details (custom, not from fee_structure)
    fee_name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)

    # Dates
    assigned_date = Column(Date, nullable=False, server_default=func.current_date())
    due_date = Column(Date, nullable=False)

    # Student Reference
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)

    # Payment Tracking
    paid_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    outstanding_amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(50), default="pending", nullable=False, index=True)  # pending/partial/paid/overdue
    is_paid = Column(Boolean, default=False, nullable=False, index=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)  # When fully paid

    # Metadata
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    remarks = Column(Text, nullable=True)

    # Soft delete
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    student = relationship("Student", foreign_keys=[student_id])
    assigned_by_user = relationship("User", foreign_keys=[assigned_by])
    deleted_by_user = relationship("User", foreign_keys=[deleted_by])

    def __repr__(self):
        return f"<AdhocFeeAssignment {self.fee_name} - Student:{self.student_id} - ₹{self.amount}>"

    def update_payment_status(self):
        """Update payment status based on paid amount"""
        if float(self.paid_amount) >= float(self.amount):
            self.payment_status = "paid"
            self.is_paid = True
            self.outstanding_amount = 0.00
        elif float(self.paid_amount) > 0:
            self.payment_status = "partial"
            self.outstanding_amount = float(self.amount) - float(self.paid_amount)
        else:
            self.payment_status = "pending"
            self.outstanding_amount = float(self.amount)

        # Check if overdue
        from datetime import date
        if not self.is_paid and self.due_date < date.today():
            self.payment_status = "overdue"

    def record_payment(self, payment_amount: float):
        """Record a payment against this adhoc fee"""
        from datetime import datetime

        self.paid_amount = float(self.paid_amount) + payment_amount
        self.update_payment_status()

        if self.is_paid:
            self.paid_at = datetime.utcnow()
