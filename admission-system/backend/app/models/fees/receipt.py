"""
Payment Receipt Model
Official receipts for payments
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ...core.database import Base


class PaymentReceipt(Base):
    """
    Payment Receipt Model
    Official receipt generated after successful payment

    Receipt Number Format: REC/2024-25/000001
    """
    __tablename__ = "payment_receipts"

    id = Column(Integer, primary_key=True, index=True)

    # Receipt identification
    receipt_number = Column(String(30), unique=True, nullable=False, index=True)
    receipt_date = Column(DateTime(timezone=True), nullable=False, index=True)

    # References
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # PDF storage
    file_path = Column(String(500), nullable=True)        # Path to PDF file
    file_name = Column(String(200), nullable=True)        # Original filename
    file_size_kb = Column(Integer, nullable=True)         # File size in KB

    # Delivery tracking
    sent_via_email = Column(Boolean, default=False)
    email_sent_at = Column(DateTime(timezone=True), nullable=True)
    email_to = Column(String(200), nullable=True)

    sent_via_sms = Column(Boolean, default=False)
    sms_sent_at = Column(DateTime(timezone=True), nullable=True)
    sms_to = Column(String(20), nullable=True)

    downloaded_at = Column(DateTime(timezone=True), nullable=True)
    download_count = Column(Integer, default=0)

    # Re-generation tracking
    is_regenerated = Column(Boolean, default=False)
    regenerated_at = Column(DateTime(timezone=True), nullable=True)
    regenerated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    regeneration_reason = Column(Text)

    # Metadata
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(Text)

    # Relationships
    payment = relationship("Payment", back_populates="receipt")
    generated_by_user = relationship("User", foreign_keys=[generated_by])
    regenerated_by_user = relationship("User", foreign_keys=[regenerated_by])

    def __repr__(self):
        return f"<PaymentReceipt {self.receipt_number} Payment:{self.payment_id}>"

    def increment_download_count(self):
        """Increment download counter"""
        self.download_count += 1
        if not self.downloaded_at:
            self.downloaded_at = func.now()
