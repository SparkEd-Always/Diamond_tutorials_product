"""
Communication Models for Parent-Teacher Messaging System
Supports broadcast messages, direct messaging, and delivery tracking.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base


class MessageType(str, enum.Enum):
    """Types of messages that can be sent"""
    BROADCAST = "broadcast"          # Sent to multiple recipients (class, role, etc.)
    DIRECT = "direct"                # One-to-one message
    ANNOUNCEMENT = "announcement"    # School-wide announcement


class DeliveryStatus(str, enum.Enum):
    """Delivery status for individual message deliveries"""
    SENT = "sent"                    # Message sent to delivery queue
    DELIVERED = "delivered"          # Message delivered to recipient
    READ = "read"                    # Recipient opened and read the message
    FAILED = "failed"                # Delivery failed


class TargetRole(str, enum.Enum):
    """Target recipient roles for broadcast messages"""
    PARENT = "parent"
    TEACHER = "teacher"
    ALL = "all"                      # All users


class Message(Base):
    """
    Main message table storing message metadata and content.
    Supports both broadcast and direct messages.
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    # Sender information
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Message type and targeting
    message_type = Column(SQLEnum(MessageType), default=MessageType.DIRECT, nullable=False, index=True)
    target_role = Column(SQLEnum(TargetRole), nullable=True)  # For broadcast messages
    target_class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)  # For class-specific broadcasts

    # Message content
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)

    # Attachments metadata (stored as JSON for Phase 1, file uploads in Phase 2)
    # Format: [{"filename": "homework.pdf", "url": "/uploads/...", "size": 12345, "type": "application/pdf"}]
    attachments = Column(JSON, nullable=True)

    # Scheduling
    scheduled_at = Column(DateTime(timezone=True), nullable=True)  # For future scheduled messages
    sent_at = Column(DateTime(timezone=True), nullable=True, index=True)  # When message was actually sent

    # Soft delete support
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    target_class = relationship("Class", foreign_keys=[target_class_id])
    deliveries = relationship("MessageDelivery", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message {self.id} - {self.subject[:30]}... by User {self.sender_id}>"


class MessageDelivery(Base):
    """
    Tracks delivery status for each recipient of a message.
    One record per recipient per message.
    """
    __tablename__ = "message_deliveries"

    id = Column(Integer, primary_key=True, index=True)

    # Message and recipient references
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Delivery tracking
    status = Column(SQLEnum(DeliveryStatus), default=DeliveryStatus.SENT, nullable=False, index=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Multi-channel delivery flags (Phase 2: SMS/Email integration)
    channel_app = Column(Boolean, default=True)        # In-app notification
    channel_sms = Column(Boolean, default=False)       # SMS notification (coming soon)
    channel_email = Column(Boolean, default=False)     # Email notification (coming soon)

    # Delivery failure tracking
    failure_reason = Column(Text, nullable=True)       # If status = failed
    retry_count = Column(Integer, default=0)           # Number of retry attempts

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    message = relationship("Message", back_populates="deliveries")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")

    def __repr__(self):
        return f"<MessageDelivery {self.id} - Msg {self.message_id} to User {self.recipient_id} - {self.status}>"


class CommunicationPreference(Base):
    """
    User preferences for receiving communications.
    Controls notification channels and language preferences.
    """
    __tablename__ = "communication_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Notification channel preferences
    app_notifications_enabled = Column(Boolean, default=True)
    email_notifications_enabled = Column(Boolean, default=False)  # Phase 2
    sms_notifications_enabled = Column(Boolean, default=False)    # Phase 2

    # Language preference (Phase 2: Translation support)
    # ISO 639-1 codes: en (English), hi (Hindi), ta (Tamil), te (Telugu), bn (Bengali),
    # mr (Marathi), gu (Gujarati), kn (Kannada), ml (Malayalam), pa (Punjabi), ur (Urdu)
    preferred_language = Column(String(10), default='en')

    # Notification frequency settings
    daily_digest_enabled = Column(Boolean, default=False)         # Daily summary email
    instant_notifications = Column(Boolean, default=True)         # Real-time notifications

    # Do Not Disturb schedule (Phase 2)
    dnd_start_time = Column(String(5), nullable=True)  # Format: "22:00"
    dnd_end_time = Column(String(5), nullable=True)    # Format: "08:00"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="communication_preference", uselist=False)

    def __repr__(self):
        return f"<CommunicationPreference User {self.user_id} - App:{self.app_notifications_enabled}>"


# Phase 2+ Models (Coming Soon) - Commented out for now
# ============================================================================

# class MessageTemplate(Base):
#     """
#     Pre-defined message templates for common communications.
#     E.g., "Daily Homework", "Exam Reminder", "Fee Reminder", "Parent Meeting"
#     """
#     __tablename__ = "message_templates"
#
#     id = Column(Integer, primary_key=True, index=True)
#     template_name = Column(String(100), nullable=False)
#     template_code = Column(String(50), unique=True, nullable=False)
#     category = Column(String(50))  # homework, exam, fee, meeting, announcement
#     subject_template = Column(String(500), nullable=False)
#     body_template = Column(Text, nullable=False)
#     variables = Column(JSON)  # List of template variables: ["student_name", "date", "amount"]
#     is_active = Column(Boolean, default=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())


# class MessageThread(Base):
#     """
#     Groups related messages together for conversation threading.
#     Phase 2: Two-way messaging support
#     """
#     __tablename__ = "message_threads"
#
#     id = Column(Integer, primary_key=True, index=True)
#     subject = Column(String(500), nullable=False)
#     participants = Column(JSON)  # List of user IDs
#     last_message_at = Column(DateTime(timezone=True))
#     is_closed = Column(Boolean, default=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())


# class MeetingSchedule(Base):
#     """
#     Parent-Teacher Meeting (PTM) scheduling system.
#     Phase 3: Meeting scheduling feature
#     """
#     __tablename__ = "meeting_schedules"
#
#     id = Column(Integer, primary_key=True, index=True)
#     teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     parent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
#     meeting_date = Column(DateTime(timezone=True), nullable=False)
#     duration_minutes = Column(Integer, default=15)
#     location = Column(String(255))  # "Classroom 3-A" or "Virtual (Google Meet)"
#     meeting_link = Column(Text)  # For virtual meetings
#     status = Column(String(50), default="scheduled")  # scheduled, completed, cancelled, rescheduled
#     notes = Column(Text)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())


# class QueryTicket(Base):
#     """
#     Query/concern management with escalation workflow.
#     Phase 3: Query management feature
#     """
#     __tablename__ = "query_tickets"
#
#     id = Column(Integer, primary_key=True, index=True)
#     parent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
#     ticket_number = Column(String(20), unique=True, nullable=False)
#     category = Column(String(50))  # academic, behavior, fee, transport, health, other
#     subject = Column(String(500), nullable=False)
#     description = Column(Text, nullable=False)
#     priority = Column(String(20), default="medium")  # low, medium, high, urgent
#     status = Column(String(50), default="open")  # open, in_progress, resolved, escalated, closed
#     assigned_to = Column(Integer, ForeignKey("users.id"))
#     resolved_at = Column(DateTime(timezone=True))
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
