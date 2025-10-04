from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Communication(Base):
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"))  # For individual student messages

    # Message content
    subject = Column(String(200))
    message = Column(Text, nullable=False)
    message_type = Column(String(20))  # WHATSAPP, SMS, EMAIL, PUSH_NOTIFICATION

    # Recipients
    recipient_phone_numbers = Column(JSON)  # Array of phone numbers
    recipient_emails = Column(JSON)  # Array of email addresses
    target_groups = Column(JSON)  # ["parents", "teachers", "class_7"]

    # WhatsApp specific
    whatsapp_chat_id = Column(String(100))
    whatsapp_chat_type = Column(String(20))  # individual, announcement

    # Delivery tracking
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True))
    delivery_status = Column(String(20), default="pending")  # pending, sent, delivered, failed
    delivery_report = Column(JSON)  # Detailed delivery information

    # Bulk messaging
    is_bulk = Column(Boolean, default=False)
    bulk_group_name = Column(String(100))

    # Read receipts and acknowledgments
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    requires_acknowledgment = Column(Boolean, default=False)
    acknowledged_by = Column(JSON)  # Array of user IDs who acknowledged

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_communications")
    student = relationship("Student", back_populates="communications")

    def __repr__(self):
        return f"<Communication(sender_id={self.sender_id}, type={self.message_type}, sent={self.is_sent})>"