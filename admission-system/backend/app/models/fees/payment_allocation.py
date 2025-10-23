"""
Payment Allocation Model
Tracks which payments are allocated to which specific fees (fee sessions or adhoc fees)
"""
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ...core.database import Base


class PaymentAllocation(Base):
    """
    Payment Allocation Junction Table

    Tracks the explicit link between a payment and the fee(s) it was allocated to.
    This allows:
    - One payment to be split across multiple fees
    - Multiple payments to pay for one fee
    - Complete audit trail of payment allocation
    - Reallocation if needed

    Example:
    Payment PAY/2024-25/001 (Rs.5000) allocated to:
    - Fee Session #45 (Q1 Tuition): Rs.3000
    - Adhoc Fee #12 (Lost ID): Rs.2000

    Creates two PaymentAllocation records.
    """
    __tablename__ = "payment_allocations"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Payment Reference (Required)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True)

    # Student Reference (Denormalized for quick queries)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)

    # Fee Reference (Either fee_session_id OR adhoc_fee_id, not both)
    fee_type = Column(String(20), nullable=False, index=True)
    # Values: 'fee_session', 'adhoc_fee'

    fee_session_id = Column(Integer, ForeignKey("fee_sessions.id", ondelete="SET NULL"), nullable=True, index=True)
    adhoc_fee_id = Column(Integer, ForeignKey("adhoc_fee_assignments.id", ondelete="SET NULL"), nullable=True, index=True)

    # Allocation Details
    allocated_amount = Column(Numeric(10, 2), nullable=False)
    # The amount from this payment allocated to this specific fee

    fee_description = Column(String(200), nullable=True)
    # Cached description of what this fee was for (e.g., "Q1 Tuition Fee 2024-25")

    allocation_notes = Column(Text, nullable=True)
    # Optional notes about this allocation

    # Audit Trail
    allocated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Admin user who made this allocation

    allocated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # When this allocation was made

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    payment = relationship("Payment", back_populates="allocations")
    student = relationship("Student", foreign_keys=[student_id])
    fee_session = relationship("FeeSession", foreign_keys=[fee_session_id])
    adhoc_fee = relationship("AdhocFeeAssignment", foreign_keys=[adhoc_fee_id])
    allocated_by_user = relationship("User", foreign_keys=[allocated_by])

    def __repr__(self):
        return f"<PaymentAllocation Payment:{self.payment_id} → {self.fee_type}:{self.fee_session_id or self.adhoc_fee_id} Rs.{self.allocated_amount}>"

    @property
    def fee_id(self):
        """Return the actual fee ID (either fee_session_id or adhoc_fee_id)"""
        return self.fee_session_id if self.fee_type == 'fee_session' else self.adhoc_fee_id

    def validate_allocation(self):
        """
        Validate allocation rules:
        1. Must have either fee_session_id OR adhoc_fee_id, not both
        2. allocated_amount must be positive
        3. fee_type must match the provided ID
        """
        if self.fee_session_id and self.adhoc_fee_id:
            raise ValueError("Cannot allocate to both fee_session and adhoc_fee")

        if not self.fee_session_id and not self.adhoc_fee_id:
            raise ValueError("Must allocate to either fee_session or adhoc_fee")

        if self.allocated_amount <= 0:
            raise ValueError("Allocated amount must be positive")

        # Validate fee_type matches the ID
        if self.fee_type == 'fee_session' and not self.fee_session_id:
            raise ValueError("fee_type is 'fee_session' but fee_session_id is null")

        if self.fee_type == 'adhoc_fee' and not self.adhoc_fee_id:
            raise ValueError("fee_type is 'adhoc_fee' but adhoc_fee_id is null")
