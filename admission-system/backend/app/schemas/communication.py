"""
Pydantic Schemas for Parent-Teacher Communication System
Request/Response validation for message APIs
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

class MessageTypeEnum(str, Enum):
    """Message type enumeration"""
    BROADCAST = "broadcast"
    DIRECT = "direct"
    ANNOUNCEMENT = "announcement"


class DeliveryStatusEnum(str, Enum):
    """Delivery status enumeration"""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class TargetRoleEnum(str, Enum):
    """Target role enumeration for broadcasts"""
    PARENT = "parent"
    TEACHER = "teacher"
    ALL = "all"


# ============================================================================
# Message Schemas
# ============================================================================

class MessageCreate(BaseModel):
    """
    Schema for creating a new message.
    Used by teachers/admins to send messages to parents.
    """
    message_type: MessageTypeEnum = MessageTypeEnum.DIRECT
    subject: str = Field(..., min_length=1, max_length=500, description="Message subject")
    body: str = Field(..., min_length=1, description="Message body content")

    # Broadcast targeting (optional, required if message_type = broadcast)
    target_role: Optional[TargetRoleEnum] = None
    target_class_id: Optional[int] = None

    # Direct message targeting (optional, required if message_type = direct)
    recipient_id: Optional[int] = Field(None, description="Recipient user ID for direct messages")

    # Scheduling (Phase 1: immediate send only, Phase 2: scheduled)
    scheduled_at: Optional[datetime] = None

    # Attachments (Phase 2: file uploads)
    attachments: Optional[List[Dict[str, Any]]] = None

    @validator('target_class_id')
    def validate_broadcast_target(cls, v, values):
        """Ensure broadcast messages have valid targeting"""
        if values.get('message_type') == MessageTypeEnum.BROADCAST:
            if not v and not values.get('target_role'):
                raise ValueError('Broadcast messages must specify target_class_id or target_role')
        return v

    @validator('recipient_id')
    def validate_direct_recipient(cls, v, values):
        """Ensure direct messages have recipient"""
        if values.get('message_type') == MessageTypeEnum.DIRECT:
            if not v:
                raise ValueError('Direct messages must specify recipient_id')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "message_type": "broadcast",
                "subject": "Today's Homework - Class 3A",
                "body": "Please complete Math workbook pages 42-43 and English essay 'My Pet' (200 words). Submit by tomorrow.",
                "target_role": "parent",
                "target_class_id": 5
            }
        }


class MessageUpdate(BaseModel):
    """
    Schema for updating a draft message.
    Only draft messages can be updated.
    """
    subject: Optional[str] = Field(None, min_length=1, max_length=500)
    body: Optional[str] = Field(None, min_length=1)
    scheduled_at: Optional[datetime] = None


class MessageResponse(BaseModel):
    """
    Schema for message response with delivery statistics.
    Returned when fetching message details.
    """
    id: int
    sender_id: int
    sender_name: Optional[str] = None  # Populated from User relationship

    message_type: str
    subject: str
    body: str

    # Targeting info
    target_role: Optional[str] = None
    target_class_id: Optional[int] = None
    target_class_name: Optional[str] = None  # Populated from Class relationship

    # Attachments
    attachments: Optional[List[Dict[str, Any]]] = None

    # Scheduling & sending
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None

    # Delivery statistics (for broadcast messages)
    total_recipients: Optional[int] = None
    delivered_count: Optional[int] = None
    read_count: Optional[int] = None

    # Soft delete
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "sender_id": 12,
                "sender_name": "Mrs. Neha Patel",
                "message_type": "broadcast",
                "subject": "Today's Homework - Class 3A",
                "body": "Please complete Math workbook pages 42-43...",
                "target_role": "parent",
                "target_class_id": 5,
                "target_class_name": "Class 3-A",
                "sent_at": "2025-10-15T14:30:00",
                "total_recipients": 70,
                "delivered_count": 70,
                "read_count": 52,
                "created_at": "2025-10-15T14:29:00",
                "updated_at": "2025-10-15T14:30:00"
            }
        }


class MessageListResponse(BaseModel):
    """
    Schema for paginated message list.
    """
    total: int
    page: int
    page_size: int
    messages: List[MessageResponse]


class MessageSummary(BaseModel):
    """
    Schema for brief message summary in lists.
    Lighter weight than full MessageResponse.
    """
    id: int
    sender_id: int
    sender_name: Optional[str] = None
    subject: str
    message_type: str
    sent_at: Optional[datetime] = None
    created_at: datetime

    # For recipients: unread status
    is_read: Optional[bool] = None
    read_at: Optional[datetime] = None

    # For senders: delivery stats
    total_recipients: Optional[int] = None
    read_count: Optional[int] = None

    class Config:
        from_attributes = True


# ============================================================================
# Message Delivery Schemas
# ============================================================================

class MessageDeliveryResponse(BaseModel):
    """
    Schema for individual message delivery status.
    Used to track delivery per recipient.
    """
    id: int
    message_id: int
    recipient_id: int
    recipient_name: Optional[str] = None  # Populated from User relationship

    status: DeliveryStatusEnum
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    # Delivery channels
    channel_app: bool = True
    channel_sms: bool = False
    channel_email: bool = False

    # Failure tracking
    failure_reason: Optional[str] = None
    retry_count: int = 0

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "message_id": 1,
                "recipient_id": 45,
                "recipient_name": "Mr. Rajesh Kumar (Parent)",
                "status": "read",
                "delivered_at": "2025-10-15T14:30:05",
                "read_at": "2025-10-15T15:45:12",
                "channel_app": True,
                "created_at": "2025-10-15T14:30:00"
            }
        }


class DeliveryStatusSummary(BaseModel):
    """
    Summary statistics for message delivery.
    """
    message_id: int
    total_recipients: int
    sent_count: int
    delivered_count: int
    read_count: int
    failed_count: int
    delivery_rate: float = Field(..., description="Percentage delivered (0-100)")
    read_rate: float = Field(..., description="Percentage read (0-100)")

    class Config:
        json_schema_extra = {
            "example": {
                "message_id": 1,
                "total_recipients": 70,
                "sent_count": 70,
                "delivered_count": 70,
                "read_count": 52,
                "failed_count": 0,
                "delivery_rate": 100.0,
                "read_rate": 74.3
            }
        }


# ============================================================================
# Communication Preference Schemas
# ============================================================================

class CommunicationPreferenceResponse(BaseModel):
    """
    Schema for user's communication preferences.
    """
    id: int
    user_id: int

    # Channel preferences
    app_notifications_enabled: bool = True
    email_notifications_enabled: bool = False  # Phase 2
    sms_notifications_enabled: bool = False    # Phase 2

    # Language preference (Phase 2)
    preferred_language: str = 'en'

    # Notification frequency
    daily_digest_enabled: bool = False
    instant_notifications: bool = True

    # Do Not Disturb (Phase 2)
    dnd_start_time: Optional[str] = None
    dnd_end_time: Optional[str] = None

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommunicationPreferenceUpdate(BaseModel):
    """
    Schema for updating communication preferences.
    """
    app_notifications_enabled: Optional[bool] = None
    email_notifications_enabled: Optional[bool] = None
    sms_notifications_enabled: Optional[bool] = None
    preferred_language: Optional[str] = None
    daily_digest_enabled: Optional[bool] = None
    instant_notifications: Optional[bool] = None
    dnd_start_time: Optional[str] = Field(None, pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    dnd_end_time: Optional[str] = Field(None, pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')

    class Config:
        json_schema_extra = {
            "example": {
                "app_notifications_enabled": True,
                "email_notifications_enabled": False,
                "preferred_language": "hi",
                "instant_notifications": True
            }
        }


# ============================================================================
# Filter & Search Schemas
# ============================================================================

class MessageFilter(BaseModel):
    """
    Schema for filtering messages.
    """
    message_type: Optional[MessageTypeEnum] = None
    status: Optional[DeliveryStatusEnum] = None  # For recipient's inbox (read/unread)
    sender_id: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search_query: Optional[str] = None  # Search in subject/body
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


# ============================================================================
# Statistics & Analytics Schemas
# ============================================================================

class EngagementStats(BaseModel):
    """
    Schema for engagement statistics (Admin dashboard).
    """
    total_messages_sent: int
    total_messages_today: int
    total_recipients_reached: int
    average_read_rate: float = Field(..., description="Percentage (0-100)")
    average_response_time_minutes: Optional[float] = None

    # Breakdown by message type
    broadcast_count: int
    direct_count: int
    announcement_count: int

    # Recent activity
    messages_last_7_days: int
    messages_last_30_days: int

    class Config:
        json_schema_extra = {
            "example": {
                "total_messages_sent": 245,
                "total_messages_today": 12,
                "total_recipients_reached": 8540,
                "average_read_rate": 78.5,
                "broadcast_count": 180,
                "direct_count": 55,
                "announcement_count": 10,
                "messages_last_7_days": 45,
                "messages_last_30_days": 198
            }
        }


class TeacherMessageStats(BaseModel):
    """
    Schema for individual teacher message statistics.
    """
    teacher_id: int
    teacher_name: str
    total_messages_sent: int
    average_read_rate: float
    last_message_sent_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "teacher_id": 12,
                "teacher_name": "Mrs. Neha Patel",
                "total_messages_sent": 45,
                "average_read_rate": 82.3,
                "last_message_sent_at": "2025-10-15T14:30:00"
            }
        }


# ============================================================================
# Notification Schemas (Phase 2)
# ============================================================================

class InAppNotification(BaseModel):
    """
    Schema for in-app notifications.
    Phase 1: Simple message notifications
    Phase 2: Rich notifications with actions
    """
    id: Optional[int] = None
    user_id: int
    notification_type: str = "message"  # message, announcement, meeting, query
    title: str
    body: str
    action_url: Optional[str] = None  # URL to navigate when clicked
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Bulk Operations Schemas (Future)
# ============================================================================

class BulkMessageCreate(BaseModel):
    """
    Schema for sending bulk messages to specific recipients.
    Phase 2: Advanced targeting
    """
    subject: str = Field(..., min_length=1, max_length=500)
    body: str = Field(..., min_length=1)
    recipient_ids: List[int] = Field(..., min_items=1, max_items=1000)
    scheduled_at: Optional[datetime] = None


class MessageReadRequest(BaseModel):
    """
    Schema for marking message as read.
    """
    message_id: int


# ============================================================================
# Error Response Schema
# ============================================================================

class ErrorResponse(BaseModel):
    """
    Standard error response schema.
    """
    detail: str
    error_code: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Message not found",
                "error_code": "MESSAGE_NOT_FOUND"
            }
        }
