"""
Student Fee Ledger Model
Tracks outstanding balance for each student
"""
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ...core.database import Base


class StudentFeeLedger(Base):
    """
    Student Fee Ledger Model
    Real-time outstanding balance tracking per student

    This table maintains a running balance for each student:
    - Total fees assigned
    - Total paid
    - Outstanding balance
    - Aging buckets (0-30, 30-60, 60-90, 90+ days overdue)

    Updated automatically when:
    - Fee assignment created
    - Invoice generated
    - Payment received
    - Refund processed
    """
    __tablename__ = "student_fee_ledger"

    id = Column(Integer, primary_key=True, index=True)

    # References
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)

    # Financial summary
    total_fees_assigned = Column(Numeric(12, 2), default=0.00)    # Total fees for the year
    total_invoiced = Column(Numeric(12, 2), default=0.00)         # Total invoiced amount
    total_paid = Column(Numeric(12, 2), default=0.00)             # Total amount paid
    total_outstanding = Column(Numeric(12, 2), default=0.00, index=True)  # Current outstanding
    total_refunded = Column(Numeric(12, 2), default=0.00)         # Total refunded
    total_waived = Column(Numeric(12, 2), default=0.00)           # Total waived
    total_discounts = Column(Numeric(12, 2), default=0.00)        # Total discounts

    # Overdue analysis (aging buckets)
    overdue_0_30_days = Column(Numeric(12, 2), default=0.00)      # 0-30 days overdue
    overdue_30_60_days = Column(Numeric(12, 2), default=0.00)     # 30-60 days overdue
    overdue_60_90_days = Column(Numeric(12, 2), default=0.00)     # 60-90 days overdue
    overdue_90_plus_days = Column(Numeric(12, 2), default=0.00)   # 90+ days overdue

    # Late fees
    total_late_fees = Column(Numeric(12, 2), default=0.00)        # Total late fees charged
    late_fees_paid = Column(Numeric(12, 2), default=0.00)         # Late fees paid
    late_fees_outstanding = Column(Numeric(12, 2), default=0.00)  # Late fees outstanding

    # Payment tracking
    last_payment_date = Column(DateTime(timezone=True), nullable=True)
    last_payment_amount = Column(Numeric(12, 2), default=0.00)
    payment_count = Column(Integer, default=0)

    # Invoice tracking
    invoice_count = Column(Integer, default=0)
    pending_invoice_count = Column(Integer, default=0)
    paid_invoice_count = Column(Integer, default=0)
    overdue_invoice_count = Column(Integer, default=0)

    # Status flags
    has_outstanding = Column(Boolean, default=False, index=True)
    has_overdue = Column(Boolean, default=False, index=True)
    is_defaulter = Column(Boolean, default=False, index=True)     # 90+ days overdue

    # Metadata
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(Text)

    # Relationships
    student = relationship("Student")
    academic_year = relationship("AcademicYear")

    def __repr__(self):
        return f"<StudentFeeLedger Student:{self.student_id} Outstanding:{self.total_outstanding}>"

    def update_outstanding_status(self):
        """Update status flags based on amounts"""
        self.has_outstanding = self.total_outstanding > 0
        self.has_overdue = (
            self.overdue_0_30_days > 0 or
            self.overdue_30_60_days > 0 or
            self.overdue_60_90_days > 0 or
            self.overdue_90_plus_days > 0
        )
        self.is_defaulter = self.overdue_90_plus_days > 0

    def record_payment(self, amount: float):
        """Record a payment received"""
        self.total_paid += amount
        self.total_outstanding = self.total_invoiced - self.total_paid
        self.last_payment_amount = amount
        self.last_payment_date = func.now()
        self.payment_count += 1
        self.update_outstanding_status()

    def record_invoice(self, amount: float):
        """Record a new invoice generated"""
        self.total_invoiced += amount
        self.total_outstanding = self.total_invoiced - self.total_paid
        self.invoice_count += 1
        self.pending_invoice_count += 1
        self.update_outstanding_status()

    def record_refund(self, amount: float):
        """Record a refund processed"""
        self.total_refunded += amount
        self.total_paid -= amount
        self.total_outstanding = self.total_invoiced - self.total_paid
        self.update_outstanding_status()

    def apply_discount(self, amount: float):
        """Apply a discount"""
        self.total_discounts += amount
        self.total_fees_assigned -= amount
        self.update_outstanding_status()

    def apply_waiver(self, amount: float):
        """Apply a waiver"""
        self.total_waived += amount
        self.total_fees_assigned -= amount
        self.update_outstanding_status()
