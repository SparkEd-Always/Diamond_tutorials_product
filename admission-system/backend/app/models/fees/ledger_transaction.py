"""
Student Ledger Transaction Model
Immutable, append-only transaction log for student financial history

Based on industry best practices:
- Double-entry bookkeeping principles
- Append-only architecture (no updates/deletes)
- Running balance for performance
- Complete audit trail
- GAAP-compliant structure
"""
from sqlalchemy import Column, BigInteger, Integer, String, Text, Numeric, DateTime, ForeignKey, Boolean, JSON, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from ...core.database import Base


class LedgerEntryType(str, enum.Enum):
    """
    Transaction Types for Student Ledger

    Debit Entries (Charges - Increase Balance Due):
    - Fee assignments, late fees, fines

    Credit Entries (Payments/Adjustments - Decrease Balance Due):
    - Payments, discounts, waivers, refunds
    """
    # CHARGES (Debits - Money Owed by Student)
    FEE_ASSIGNMENT = "fee_assignment"          # Regular fee structure assignment
    ADHOC_FEE = "adhoc_fee"                    # One-time fees (lost items, etc.)
    LATE_FEE = "late_fee"                      # Overdue penalties
    FINE = "fine"                              # Disciplinary fines
    ADJUSTMENT_DEBIT = "adjustment_debit"      # Manual increase in balance

    # PAYMENTS (Credits - Money Received from Student)
    PAYMENT_ONLINE = "payment_online"          # Online payments (UPI, cards, etc.)
    PAYMENT_CASH = "payment_cash"              # Cash at school office
    PAYMENT_CHEQUE = "payment_cheque"          # Cheque payment
    PAYMENT_DD = "payment_dd"                  # Demand draft
    PAYMENT_BANK_TRANSFER = "payment_bank_transfer"  # NEFT/RTGS/IMPS

    # ADJUSTMENTS (Credits - Reductions in Amount Due)
    DISCOUNT = "discount"                      # Discounts applied
    WAIVER = "waiver"                          # Fee waivers
    SCHOLARSHIP = "scholarship"                # Scholarship credits
    REFUND = "refund"                          # Refund to student
    ADJUSTMENT_CREDIT = "adjustment_credit"    # Manual decrease in balance

    # CORRECTIONS
    REVERSAL = "reversal"                      # Reverse a previous transaction


class StudentLedgerTransaction(Base):
    """
    Student Ledger Transaction Model
    Immutable financial transaction log (similar to bank statement)

    Each entry records:
    - What happened (fee charged, payment received, etc.)
    - When it happened
    - How much (debit/credit)
    - Running balance after transaction
    - Reference to source (fee session, payment, etc.)

    Key Features:
    - Append-only (cannot update/delete - only add corrections)
    - Chronological order
    - Running balance maintained
    - Complete audit trail
    - Single source of truth for student finances

    Example Timeline:
    ─────────────────────────────────────────────────────────────
    2024-04-01  Fee Assignment   Tuition Q1      Dr: ₹15,000  Bal: ₹15,000
    2024-04-05  Adhoc Fee        Lost ID Card    Dr: ₹500     Bal: ₹15,500
    2024-04-10  Payment          Online-UPI      Cr: ₹10,000  Bal: ₹5,500
    2024-04-15  Discount         Sibling         Cr: ₹1,500   Bal: ₹4,000
    ─────────────────────────────────────────────────────────────
    """
    __tablename__ = "student_ledger_transactions"

    # Primary Key (BigInteger for high volume)
    id = Column(BigInteger, primary_key=True, index=True)

    # Unique Transaction Identifier
    transaction_number = Column(String(30), unique=True, nullable=False, index=True)
    # Format: TXN/2024-25/000001, TXN/2024-25/000002, etc.

    transaction_date = Column(DateTime(timezone=True), nullable=False, index=True)
    # When this transaction occurred (actual date, not created_at)

    # Student & Academic Context
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year_id = Column(Integer, ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True)

    # Transaction Type
    entry_type = Column(String(30), nullable=False, index=True)
    # Uses LedgerEntryType enum values

    # Financial Amounts (Double-Entry Bookkeeping)
    debit_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    # Increases balance (fees, charges, fines)

    credit_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    # Decreases balance (payments, discounts, refunds)

    # Running Balance (Balance AFTER this transaction)
    balance = Column(Numeric(12, 2), nullable=False, index=True)
    # Calculated as: previous_balance + debit_amount - credit_amount
    # Positive = Amount owed by student
    # Negative = Credit balance (overpayment)

    # References (Polymorphic - What caused this transaction?)
    reference_type = Column(String(30), index=True)
    # Values: 'fee_session', 'adhoc_fee', 'payment', 'manual_entry', etc.

    reference_id = Column(Integer, index=True)
    # ID of the referenced record (fee_session.id, payment.id, etc.)

    # Specific Foreign Keys (for easier joins)
    fee_session_id = Column(Integer, ForeignKey("fee_sessions.id", ondelete="SET NULL"), nullable=True, index=True)
    adhoc_fee_id = Column(Integer, ForeignKey("adhoc_fee_assignments.id", ondelete="SET NULL"), nullable=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)

    # Description & Details
    description = Column(Text, nullable=False)
    # Human-readable description: "Tuition Fee Q1 2024-25", "Cash Payment - Receipt #123"

    remarks = Column(Text, nullable=True)
    # Additional notes, internal comments

    transaction_metadata = Column(JSON, nullable=True)
    # Flexible JSON storage for additional data
    # Example: {"payment_method": "UPI", "transaction_id": "TXN123456789"}

    # Payment Details (for payment entries)
    payment_method = Column(String(50), nullable=True)
    # Payment method: 'cash', 'upi', 'card', 'cheque', 'bank_transfer', etc.

    payment_reference = Column(String(100), nullable=True, index=True)
    # Payment reference number (transaction ID, cheque number, receipt number)

    # Reversal Support (What transaction did this reverse?)
    reverses_transaction_id = Column(BigInteger, ForeignKey("student_ledger_transactions.id"), nullable=True)
    # If this is a reversal entry, link to the original transaction being reversed

    # Audit Trail
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Who created this entry (admin user ID for manual entries)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    # System timestamp when record was created

    # Reversal Support (For Corrections)
    is_reversed = Column(Boolean, default=False, nullable=False, index=True)
    # True if this transaction has been reversed

    reversed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Admin who reversed this transaction

    reversed_at = Column(DateTime(timezone=True), nullable=True)
    # When reversal occurred

    reversal_transaction_id = Column(BigInteger, ForeignKey("student_ledger_transactions.id"), nullable=True)
    # Link to the reversal transaction (opposite debit/credit)

    # Immutability Flag
    is_locked = Column(Boolean, default=True, nullable=False)
    # Prevents accidental modifications (enforced by trigger)

    # Relationships
    student = relationship("Student", foreign_keys=[student_id])
    academic_year = relationship("AcademicYear", foreign_keys=[academic_year_id])
    fee_session = relationship("FeeSession", foreign_keys=[fee_session_id])
    adhoc_fee = relationship("AdhocFeeAssignment", foreign_keys=[adhoc_fee_id])
    payment = relationship("Payment", foreign_keys=[payment_id])
    invoice = relationship("Invoice", foreign_keys=[invoice_id])
    created_by_user = relationship("User", foreign_keys=[created_by])
    reversed_by_user = relationship("User", foreign_keys=[reversed_by])
    reversal_transaction = relationship("StudentLedgerTransaction", foreign_keys=[reversal_transaction_id], remote_side=[id])
    reverses_transaction = relationship("StudentLedgerTransaction", foreign_keys=[reverses_transaction_id], remote_side=[id])

    # Composite Indexes for Performance
    __table_args__ = (
        # Most common query: Get all transactions for a student, ordered by date
        Index('idx_student_date', 'student_id', 'transaction_date'),

        # Filter by student and academic year
        Index('idx_student_year', 'student_id', 'academic_year_id'),

        # Filter by type (e.g., all payments, all fee assignments)
        Index('idx_type_date', 'entry_type', 'transaction_date'),

        # Reference lookups
        Index('idx_reference', 'reference_type', 'reference_id'),
    )

    def __repr__(self):
        return f"<LedgerTxn {self.transaction_number} Student:{self.student_id} {self.entry_type} Dr:{self.debit_amount} Cr:{self.credit_amount} Bal:{self.balance}>"

    @staticmethod
    def generate_transaction_number(academic_year_name: str, db) -> str:
        """
        Generate unique transaction number
        Format: TXN/2024-25/000001
        """
        # Get the last transaction number for this academic year
        last_txn = db.query(StudentLedgerTransaction).filter(
            StudentLedgerTransaction.transaction_number.like(f"TXN/{academic_year_name}/%")
        ).order_by(StudentLedgerTransaction.id.desc()).first()

        if last_txn:
            # Extract sequence number and increment
            last_seq = int(last_txn.transaction_number.split('/')[-1])
            new_seq = last_seq + 1
        else:
            new_seq = 1

        return f"TXN/{academic_year_name}/{str(new_seq).zfill(6)}"

    def is_debit(self) -> bool:
        """Check if this is a debit entry (charge)"""
        return self.debit_amount > 0

    def is_credit(self) -> bool:
        """Check if this is a credit entry (payment/reduction)"""
        return self.credit_amount > 0

    def get_net_amount(self) -> float:
        """Get net effect on balance (positive = debit, negative = credit)"""
        return float(self.debit_amount) - float(self.credit_amount)

    def can_be_reversed(self) -> bool:
        """Check if this transaction can be reversed"""
        return not self.is_reversed and self.is_locked

    def create_reversal(self, reversed_by: int, remarks: str, db) -> 'StudentLedgerTransaction':
        """
        Create a reversal transaction for this entry
        Returns the reversal transaction object
        """
        if not self.can_be_reversed():
            raise ValueError("Transaction cannot be reversed (already reversed or not locked)")

        # Get current student balance
        latest_txn = db.query(StudentLedgerTransaction).filter(
            StudentLedgerTransaction.student_id == self.student_id,
            StudentLedgerTransaction.academic_year_id == self.academic_year_id
        ).order_by(StudentLedgerTransaction.id.desc()).first()

        current_balance = float(latest_txn.balance) if latest_txn else 0.0

        # Create reversal transaction (flip debit/credit)
        from ...models.academic import AcademicYear
        academic_year = db.query(AcademicYear).filter(AcademicYear.id == self.academic_year_id).first()

        reversal = StudentLedgerTransaction(
            transaction_number=StudentLedgerTransaction.generate_transaction_number(academic_year.year_name, db),
            transaction_date=datetime.utcnow(),
            student_id=self.student_id,
            academic_year_id=self.academic_year_id,
            entry_type=LedgerEntryType.REVERSAL,
            debit_amount=self.credit_amount,  # Flip amounts
            credit_amount=self.debit_amount,
            balance=current_balance - self.get_net_amount(),  # Reverse the effect
            reference_type='reversal',
            reference_id=self.id,
            description=f"Reversal of: {self.description}",
            remarks=remarks,
            created_by=reversed_by,
            is_locked=True,
        )

        # Mark original as reversed
        self.is_reversed = True
        self.reversed_by = reversed_by
        self.reversed_at = datetime.utcnow()
        self.reversal_transaction_id = reversal.id

        return reversal
