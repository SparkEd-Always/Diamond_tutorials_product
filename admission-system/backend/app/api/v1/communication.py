"""
Communication API Endpoints
Handles parent-teacher messaging, broadcast messages, and delivery tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User, UserRole
from ...models.communication import Message, MessageDelivery
from ...schemas.communication import (
    MessageCreate, MessageUpdate, MessageResponse,
    MessageDeliveryResponse, DeliveryStatusSummary,
    MessageFilter, MessageListResponse, MessageSummary,
    CommunicationPreferenceResponse, CommunicationPreferenceUpdate,
    EngagementStats
)
from ...services.message_service import MessageService

router = APIRouter()


# ============================================================================
# Message CRUD Endpoints
# ============================================================================

@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create and send a message (broadcast or direct).

    **Permissions:** Teacher, Admin, Principal

    **Request Body:**
    - `message_type`: "broadcast", "direct", or "announcement"
    - `subject`: Message subject (1-500 chars)
    - `body`: Message content
    - `target_role`: (Optional) "parent", "teacher", or "all" for broadcasts
    - `target_class_id`: (Optional) Class ID for class-specific broadcasts
    - `recipient_id`: (Required for direct messages) Recipient user ID

    **Example - Broadcast to Class:**
    ```json
    {
        "message_type": "broadcast",
        "subject": "Today's Homework - Class 3A",
        "body": "Please complete Math workbook pages 42-43...",
        "target_class_id": 5
    }
    ```

    **Example - Direct Message:**
    ```json
    {
        "message_type": "direct",
        "subject": "Re: Your Query",
        "body": "Thank you for your message...",
        "recipient_id": 45
    }
    ```

    **Returns:** Message object with delivery statistics
    """
    # Validate user has permission to send messages
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can send messages"
        )

    # Create and send message
    message_obj = MessageService.create_and_send_message(db, current_user.id, message)

    # Get delivery summary
    delivery_summary = MessageService.get_delivery_summary(db, message_obj.id)

    # Prepare response
    response = MessageResponse.from_orm(message_obj)
    response.sender_name = f"{current_user.email}"  # TODO: Get actual name from user_profile
    response.total_recipients = delivery_summary.total_recipients
    response.delivered_count = delivery_summary.delivered_count
    response.read_count = delivery_summary.read_count

    return response


@router.get("/messages", response_model=List[MessageSummary])
async def list_messages(
    message_type: Optional[str] = Query(None, description="Filter by message type"),
    date_from: Optional[str] = Query(None, description="Start date (ISO format)"),
    date_to: Optional[str] = Query(None, description="End date (ISO format)"),
    search: Optional[str] = Query(None, description="Search in subject/body"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List messages for the current user.

    **For Teachers/Admins:** Returns messages sent by them

    **For Parents:** Returns messages received by them

    **Query Parameters:**
    - `message_type`: Filter by type (broadcast, direct, announcement)
    - `date_from`: Filter messages from this date
    - `date_to`: Filter messages until this date
    - `search`: Search in subject and body
    - `page`: Page number (default: 1)
    - `page_size`: Items per page (default: 20, max: 100)

    **Returns:** List of message summaries
    """
    # Build filter object
    from datetime import datetime
    filters = MessageFilter(
        message_type=message_type,
        date_from=datetime.fromisoformat(date_from) if date_from else None,
        date_to=datetime.fromisoformat(date_to) if date_to else None,
        search_query=search,
        page=page,
        page_size=page_size
    )

    # Determine if user is sender or recipient
    is_sender = current_user.role in [UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN]

    # Get messages
    messages = MessageService.get_messages_for_user(
        db,
        current_user.id,
        filters,
        is_sender=is_sender
    )

    # Convert to summary format
    summaries = []
    for msg in messages:
        summary = MessageSummary.from_orm(msg)
        summary.sender_name = msg.sender.email  # TODO: Get actual name

        if is_sender:
            # For senders, include delivery stats
            delivery_stats = MessageService.get_delivery_summary(db, msg.id)
            summary.total_recipients = delivery_stats.total_recipients
            summary.read_count = delivery_stats.read_count
        else:
            # For recipients, include read status
            delivery = (
                db.query(MessageDelivery)
                .filter(
                    MessageDelivery.message_id == msg.id,
                    MessageDelivery.recipient_id == current_user.id
                )
                .first()
            )
            if delivery:
                summary.is_read = (delivery.status == "read")
                summary.read_at = delivery.read_at

        summaries.append(summary)

    return summaries


@router.get("/messages/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific message by ID.

    **Permissions:**
    - Sender can view their sent messages
    - Recipients can view messages sent to them

    **Path Parameters:**
    - `message_id`: Message ID

    **Returns:** Full message details with delivery statistics
    """
    # Get message (includes authorization check)
    message = MessageService.get_message_by_id(db, message_id, current_user.id)

    # Get delivery summary
    delivery_summary = MessageService.get_delivery_summary(db, message_id)

    # Prepare response
    response = MessageResponse.from_orm(message)
    response.sender_name = message.sender.email  # TODO: Get actual name
    response.total_recipients = delivery_summary.total_recipients
    response.delivered_count = delivery_summary.delivered_count
    response.read_count = delivery_summary.read_count

    if message.target_class:
        response.target_class_name = message.target_class.class_name

    return response


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a draft message (soft delete).

    **Permissions:** Only the sender can delete their own messages

    **Note:** Only draft messages (not yet sent) can be deleted

    **Path Parameters:**
    - `message_id`: Message ID to delete

    **Returns:** 204 No Content on success
    """
    MessageService.delete_message(db, message_id, current_user.id)
    return None


# ============================================================================
# Message Delivery & Read Receipt Endpoints
# ============================================================================

@router.put("/messages/{message_id}/read", response_model=MessageDeliveryResponse)
async def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a message as read.

    **Permissions:** Only the recipient can mark a message as read

    **Path Parameters:**
    - `message_id`: Message ID

    **Returns:** Updated delivery record with read timestamp
    """
    delivery = MessageService.mark_as_read(db, message_id, current_user.id)

    response = MessageDeliveryResponse.from_orm(delivery)
    response.recipient_name = current_user.email  # TODO: Get actual name

    return response


@router.get("/messages/{message_id}/delivery-status", response_model=List[MessageDeliveryResponse])
async def get_delivery_status(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get delivery status for all recipients of a message.

    **Permissions:** Only the sender can view delivery status

    **Path Parameters:**
    - `message_id`: Message ID

    **Returns:** List of delivery records for each recipient with read timestamps

    **Use Case:** Teachers can see which parents have read their broadcast messages
    """
    deliveries = MessageService.get_delivery_status(db, message_id, current_user.id)

    responses = []
    for delivery in deliveries:
        response = MessageDeliveryResponse.from_orm(delivery)
        response.recipient_name = delivery.recipient.email  # TODO: Get actual name
        responses.append(response)

    return responses


@router.get("/messages/{message_id}/delivery-summary", response_model=DeliveryStatusSummary)
async def get_delivery_summary(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get delivery statistics summary for a message.

    **Permissions:** Message sender or admin

    **Path Parameters:**
    - `message_id`: Message ID

    **Returns:** Delivery statistics (total, delivered, read, failed counts and percentages)
    """
    # Verify user has access (sender or admin)
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message.sender_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")

    return MessageService.get_delivery_summary(db, message_id)


# ============================================================================
# Communication Preferences Endpoints
# ============================================================================

@router.get("/preferences", response_model=CommunicationPreferenceResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's communication preferences.

    **Returns:** User's notification and language preferences
    """
    preferences = MessageService.get_user_preferences(db, current_user.id)
    return CommunicationPreferenceResponse.from_orm(preferences)


@router.put("/preferences", response_model=CommunicationPreferenceResponse)
async def update_preferences(
    preferences: CommunicationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update communication preferences.

    **Request Body:**
    - `app_notifications_enabled`: Enable in-app notifications (default: true)
    - `email_notifications_enabled`: Enable email notifications (Phase 2, default: false)
    - `sms_notifications_enabled`: Enable SMS notifications (Phase 2, default: false)
    - `preferred_language`: Language code (e.g., 'en', 'hi', 'ta') (Phase 2)
    - `daily_digest_enabled`: Receive daily summary email (Phase 2)
    - `instant_notifications`: Receive real-time notifications (default: true)

    **Example:**
    ```json
    {
        "app_notifications_enabled": true,
        "preferred_language": "hi",
        "instant_notifications": true
    }
    ```

    **Returns:** Updated preferences
    """
    updated_prefs = MessageService.update_preferences(
        db,
        current_user.id,
        preferences.dict(exclude_unset=True)
    )

    return CommunicationPreferenceResponse.from_orm(updated_prefs)


# ============================================================================
# Statistics & Analytics Endpoints (Admin Only)
# ============================================================================

@router.get("/stats/engagement", response_model=EngagementStats)
async def get_engagement_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get overall communication engagement statistics.

    **Permissions:** Admin or Principal only

    **Returns:**
    - Total messages sent
    - Messages sent today
    - Total recipients reached
    - Average read rate (percentage)
    - Breakdown by message type (broadcast, direct, announcement)
    - Recent activity (last 7 days, last 30 days)

    **Use Case:** Admin dashboard to monitor communication effectiveness
    """
    # Check admin permission
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return MessageService.get_engagement_stats(db)


@router.get("/stats/my-stats")
async def get_my_message_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get message statistics for the current user.

    **For Teachers:** Shows their message sending statistics

    **For Parents:** Shows their message reading statistics

    **Returns:** User-specific statistics
    """
    # TODO: Implement user-specific stats
    # This will be useful for teacher dashboards
    return {
        "message": "User-specific stats coming soon",
        "user_id": current_user.id
    }


# ============================================================================
# Unread Count Endpoint (For Notifications Badge)
# ============================================================================

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread messages for the current user.

    **Use Case:** Display unread badge count in navigation bar

    **Returns:**
    ```json
    {
        "unread_count": 5
    }
    ```
    """
    from ...models.communication import DeliveryStatus

    unread_count = (
        db.query(MessageDelivery)
        .join(Message, Message.id == MessageDelivery.message_id)
        .filter(MessageDelivery.recipient_id == current_user.id)
        .filter(MessageDelivery.status != DeliveryStatus.READ)
        .filter(Message.is_deleted == False)
        .count()
    )

    return {"unread_count": unread_count}


# ============================================================================
# Health Check
# ============================================================================

@router.get("/health")
async def health_check():
    """
    Health check endpoint for communication service.

    **Returns:** Service status
    """
    return {
        "status": "healthy",
        "service": "communication",
        "version": "1.0.0",
        "features": {
            "broadcast_messaging": True,
            "direct_messaging": True,
            "delivery_tracking": True,
            "read_receipts": True,
            "real_time_chat": False,  # Phase 2
            "translation": False,      # Phase 2
            "sms_notifications": False,  # Phase 2
            "email_notifications": False  # Phase 2
        }
    }
