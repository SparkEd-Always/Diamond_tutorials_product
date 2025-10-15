"""
Payment Model
Payment transactions and records
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, Boolean, Enum as SQLEnum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ...core.database import Base


class PaymentMethod(str, enum.Enum):
    """Payment method types"""
    UPI = "upi"                    # PhonePe, Google Pay, Paytm
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    NET_BANKING = "net_banking"
    WALLET = "wallet"              # Digital wallets
    CASH = "cash"                  # Cash payment at school
    CHEQUE = "cheque"              # Cheque payment
    DEMAND_DRAFT = "demand_draft"  # DD payment
    BANK_TRANSFER = "bank_transfer"  # NEFT/RTGS/IMPS
    OTHER = "other"


class PaymentStatus(str, enum.Enum):
    """Payment processing status"""
    INITIATED = "initiated"        # Payment initiated by parent
    PENDING = "pending"            # Awaiting confirmation
    PROCESSING = "processing"      # Being processed by gateway
    SUCCESS = "success"            # Payment successful
    FAILED = "failed"              # Payment failed
    CANCELLED = "cancelled"        # Cancelled by user
    REFUND_INITIATED = "refund_initiated"
    REFUNDED = "refunded"          # Payment refunded
    DISPUTED = "disputed"          # Payment disputed


class Payment(Base):
    """
    Payment Model
    Records all payment transactions (online and offline)

    Payment Number Format: PAY/2024-25/000001
    """
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    # Payment identification
    payment_number = Column(String(30), unique=True, nullable=False, index=True)
    payment_date = Column(DateTime(timezone=True), nullable=False, index=True)

    # References
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("parents.id", ondelete="CASCADE"), nullable=True, index=True)

    # Payment details
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.INITIATED, index=True)

    # Gateway details (for online payments)
    gateway_name = Column(String(50), nullable=True)        # Razorpay, PayU, etc.
    gateway_order_id = Column(String(100), nullable=True, index=True)
    gateway_payment_id = Column(String(100), nullable=True, index=True)
    gateway_signature = Column(String(500), nullable=True)  # For verification
    gateway_response = Column(JSON, nullable=True)          # Full gateway response

    # Transaction details
    transaction_id = Column(String(100), nullable=True, index=True)  # Bank transaction ID
    bank_reference = Column(String(100), nullable=True)
    card_last4 = Column(String(4), nullable=True)           # Last 4 digits of card
    upi_id = Column(String(100), nullable=True)             # UPI ID used

    # Offline payment details (cash/cheque)
    cheque_number = Column(String(20), nullable=True)
    cheque_date = Column(DateTime(timezone=True), nullable=True)
    bank_name = Column(String(100), nullable=True)
    branch_name = Column(String(100), nullable=True)

    # Status tracking
    is_verified = Column(Boolean, default=False)            # Verified by admin
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    # Reconciliation
    is_reconciled = Column(Boolean, default=False, index=True)
    reconciled_at = Column(DateTime(timezone=True), nullable=True)
    reconciled_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Refund details
    is_refunded = Column(Boolean, default=False)
    refund_amount = Column(Numeric(10, 2), default=0.00)
    refund_reason = Column(Text)
    refund_date = Column(DateTime(timezone=True), nullable=True)
    refund_initiated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Failure details
    failure_reason = Column(Text)
    failure_code = Column(String(50))

    # Metadata
    remarks = Column(Text)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # For offline payments
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    invoice = relationship("Invoice", back_populates="payments")
    student = relationship("Student")
    parent = relationship("Parent")
    recorded_by_user = relationship("User", foreign_keys=[recorded_by])
    verified_by_user = relationship("User", foreign_keys=[verified_by])
    reconciled_by_user = relationship("User", foreign_keys=[reconciled_by])
    refund_initiated_by_user = relationship("User", foreign_keys=[refund_initiated_by])
    receipt = relationship("PaymentReceipt", back_populates="payment", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Payment {self.payment_number} Amount:{self.amount} Method:{self.payment_method.value} Status:{self.status.value}>"

    def is_successful(self) -> bool:
        """Check if payment was successful"""
        return self.status == PaymentStatus.SUCCESS

    def is_online_payment(self) -> bool:
        """Check if payment was made online"""
        return self.payment_method in [
            PaymentMethod.UPI,
            PaymentMethod.CREDIT_CARD,
            PaymentMethod.DEBIT_CARD,
            PaymentMethod.NET_BANKING,
            PaymentMethod.WALLET
        ]

    def is_offline_payment(self) -> bool:
        """Check if payment was made offline"""
        return self.payment_method in [
            PaymentMethod.CASH,
            PaymentMethod.CHEQUE,
            PaymentMethod.DEMAND_DRAFT,
            PaymentMethod.BANK_TRANSFER
        ]
