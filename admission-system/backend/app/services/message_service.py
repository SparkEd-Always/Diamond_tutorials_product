"""
Message Service - Business Logic for Parent-Teacher Communication
Handles message creation, delivery, tracking, and statistics.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status

from ..models.communication import (
    Message, MessageDelivery, CommunicationPreference,
    MessageType, DeliveryStatus, TargetRole
)
from ..models.user import User, UserRole
from ..models.student import Parent, StudentParent
from ..schemas.communication import (
    MessageCreate, MessageUpdate, MessageResponse,
    MessageDeliveryResponse, DeliveryStatusSummary,
    MessageFilter, EngagementStats
)


class MessageService:
    """Service class for message operations"""

    @staticmethod
    def create_and_send_message(
        db: Session,
        sender_id: int,
        message_data: MessageCreate
    ) -> Message:
        """
        Create and send a message (broadcast or direct).
        Automatically creates MessageDelivery records for all recipients.

        Args:
            db: Database session
            sender_id: User ID of the sender (teacher/admin)
            message_data: Message creation data

        Returns:
            Created Message object with delivery stats

        Raises:
            HTTPException: If validation fails or recipients not found
        """
        # Validate sender exists and has permission
        sender = db.query(User).filter(User.id == sender_id).first()
        if not sender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sender not found"
            )

        if sender.role not in [UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers and admins can send messages"
            )

        # Create message record
        message = Message(
            sender_id=sender_id,
            message_type=message_data.message_type,
            subject=message_data.subject,
            body=message_data.body,
            target_role=message_data.target_role,
            target_class_id=message_data.target_class_id,
            attachments=message_data.attachments,
            scheduled_at=message_data.scheduled_at,
            sent_at=datetime.utcnow() if not message_data.scheduled_at else None
        )
        db.add(message)
        db.flush()  # Get message ID

        # Determine recipients based on message type
        recipients = MessageService._get_recipients(db, message_data)

        if not recipients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No recipients found for this message"
            )

        # Create delivery records for each recipient
        deliveries = []
        for recipient_id in recipients:
            delivery = MessageDelivery(
                message_id=message.id,
                recipient_id=recipient_id,
                status=DeliveryStatus.DELIVERED,  # Phase 1: instant delivery
                delivered_at=datetime.utcnow(),
                channel_app=True,
                channel_sms=False,  # Phase 2
                channel_email=False  # Phase 2
            )
            deliveries.append(delivery)

        db.bulk_save_objects(deliveries)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def _get_recipients(db: Session, message_data: MessageCreate) -> List[int]:
        """
        Determine recipient user IDs based on message type and targeting.

        Args:
            db: Database session
            message_data: Message creation data

        Returns:
            List of recipient user IDs
        """
        if message_data.message_type == MessageType.DIRECT:
            # Direct message to specific user
            return [message_data.recipient_id] if message_data.recipient_id else []

        elif message_data.message_type in [MessageType.BROADCAST, MessageType.ANNOUNCEMENT]:
            recipients = []

            # Broadcast to specific class
            if message_data.target_class_id:
                # Get all parents of students who applied to this class
                from ..models.admission import AdmissionApplication
                parents_query = (
                    db.query(User.id)
                    .join(Parent, Parent.user_id == User.id)
                    .join(StudentParent, StudentParent.parent_id == Parent.id)
                    .join(AdmissionApplication, AdmissionApplication.student_id == StudentParent.student_id)
                    .filter(AdmissionApplication.class_applying_id == message_data.target_class_id)
                    .filter(User.is_active == True)
                    .distinct()
                )
                recipients.extend([r[0] for r in parents_query.all()])

            # Broadcast to specific role
            elif message_data.target_role:
                if message_data.target_role == TargetRole.PARENT:
                    # All parents
                    parents_query = (
                        db.query(User.id)
                        .filter(User.role == UserRole.PARENT)
                        .filter(User.is_active == True)
                    )
                    recipients.extend([r[0] for r in parents_query.all()])

                elif message_data.target_role == TargetRole.TEACHER:
                    # All teachers
                    teachers_query = (
                        db.query(User.id)
                        .filter(User.role == UserRole.TEACHER)
                        .filter(User.is_active == True)
                    )
                    recipients.extend([r[0] for r in teachers_query.all()])

                elif message_data.target_role == TargetRole.ALL:
                    # All active users
                    all_users_query = (
                        db.query(User.id)
                        .filter(User.is_active == True)
                    )
                    recipients.extend([r[0] for r in all_users_query.all()])

            return list(set(recipients))  # Remove duplicates

        return []

    @staticmethod
    def get_messages_for_user(
        db: Session,
        user_id: int,
        filters: Optional[MessageFilter] = None,
        is_sender: bool = False
    ) -> List[Message]:
        """
        Get messages for a user (either sent or received).

        Args:
            db: Database session
            user_id: User ID
            filters: Optional filters
            is_sender: If True, get sent messages. If False, get received messages.

        Returns:
            List of Message objects
        """
        query = db.query(Message)

        if is_sender:
            # Get messages sent by this user
            query = query.filter(Message.sender_id == user_id)
        else:
            # Get messages received by this user
            query = (
                query
                .join(MessageDelivery, MessageDelivery.message_id == Message.id)
                .filter(MessageDelivery.recipient_id == user_id)
            )

        # Apply filters
        if filters:
            if filters.message_type:
                query = query.filter(Message.message_type == filters.message_type)

            if filters.date_from:
                query = query.filter(Message.created_at >= filters.date_from)

            if filters.date_to:
                query = query.filter(Message.created_at <= filters.date_to)

            if filters.search_query:
                search = f"%{filters.search_query}%"
                query = query.filter(
                    or_(
                        Message.subject.ilike(search),
                        Message.body.ilike(search)
                    )
                )

        # Exclude deleted messages
        query = query.filter(Message.is_deleted == False)

        # Order by most recent first
        query = query.order_by(desc(Message.created_at))

        # Pagination
        if filters:
            offset = (filters.page - 1) * filters.page_size
            query = query.offset(offset).limit(filters.page_size)

        return query.all()

    @staticmethod
    def get_message_by_id(
        db: Session,
        message_id: int,
        user_id: int
    ) -> Message:
        """
        Get a specific message by ID.
        Validates that user has access to this message.

        Args:
            db: Database session
            message_id: Message ID
            user_id: User ID requesting the message

        Returns:
            Message object

        Raises:
            HTTPException: If message not found or user doesn't have access
        """
        message = db.query(Message).filter(Message.id == message_id).first()

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )

        # Check if user has access to this message
        is_sender = message.sender_id == user_id
        is_recipient = (
            db.query(MessageDelivery)
            .filter(
                MessageDelivery.message_id == message_id,
                MessageDelivery.recipient_id == user_id
            )
            .first() is not None
        )

        if not (is_sender or is_recipient):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this message"
            )

        return message

    @staticmethod
    def mark_as_read(
        db: Session,
        message_id: int,
        user_id: int
    ) -> MessageDelivery:
        """
        Mark a message as read by the recipient.

        Args:
            db: Database session
            message_id: Message ID
            user_id: User ID (recipient)

        Returns:
            Updated MessageDelivery object

        Raises:
            HTTPException: If delivery record not found
        """
        delivery = (
            db.query(MessageDelivery)
            .filter(
                MessageDelivery.message_id == message_id,
                MessageDelivery.recipient_id == user_id
            )
            .first()
        )

        if not delivery:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message delivery record not found"
            )

        # Update to read status
        if delivery.status != DeliveryStatus.READ:
            delivery.status = DeliveryStatus.READ
            delivery.read_at = datetime.utcnow()
            db.commit()
            db.refresh(delivery)

        return delivery

    @staticmethod
    def get_delivery_status(
        db: Session,
        message_id: int,
        sender_id: int
    ) -> List[MessageDelivery]:
        """
        Get delivery status for all recipients of a message.
        Only the sender can view delivery status.

        Args:
            db: Database session
            message_id: Message ID
            sender_id: Sender user ID (for authorization)

        Returns:
            List of MessageDelivery objects

        Raises:
            HTTPException: If message not found or user is not the sender
        """
        message = db.query(Message).filter(Message.id == message_id).first()

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )

        if message.sender_id != sender_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the sender can view delivery status"
            )

        deliveries = (
            db.query(MessageDelivery)
            .options(joinedload(MessageDelivery.recipient))
            .filter(MessageDelivery.message_id == message_id)
            .order_by(MessageDelivery.recipient_id)
            .all()
        )

        return deliveries

    @staticmethod
    def get_delivery_summary(
        db: Session,
        message_id: int
    ) -> DeliveryStatusSummary:
        """
        Get delivery statistics summary for a message.

        Args:
            db: Database session
            message_id: Message ID

        Returns:
            DeliveryStatusSummary object
        """
        # Count deliveries by status
        status_counts = (
            db.query(
                MessageDelivery.status,
                func.count(MessageDelivery.id).label('count')
            )
            .filter(MessageDelivery.message_id == message_id)
            .group_by(MessageDelivery.status)
            .all()
        )

        total = sum(count for _, count in status_counts)
        sent_count = sum(count for status_val, count in status_counts if status_val == DeliveryStatus.SENT)
        delivered_count = sum(count for status_val, count in status_counts if status_val in [DeliveryStatus.DELIVERED, DeliveryStatus.READ])
        read_count = sum(count for status_val, count in status_counts if status_val == DeliveryStatus.READ)
        failed_count = sum(count for status_val, count in status_counts if status_val == DeliveryStatus.FAILED)

        delivery_rate = (delivered_count + read_count) / total * 100 if total > 0 else 0
        read_rate = read_count / total * 100 if total > 0 else 0

        return DeliveryStatusSummary(
            message_id=message_id,
            total_recipients=total,
            sent_count=sent_count,
            delivered_count=delivered_count + read_count,
            read_count=read_count,
            failed_count=failed_count,
            delivery_rate=round(delivery_rate, 2),
            read_rate=round(read_rate, 2)
        )

    @staticmethod
    def delete_message(
        db: Session,
        message_id: int,
        user_id: int
    ) -> bool:
        """
        Soft delete a message (only draft messages can be deleted).

        Args:
            db: Database session
            message_id: Message ID
            user_id: User ID (must be sender)

        Returns:
            True if deleted successfully

        Raises:
            HTTPException: If message not found, not authorized, or already sent
        """
        message = db.query(Message).filter(Message.id == message_id).first()

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )

        if message.sender_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the sender can delete this message"
            )

        if message.sent_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete a message that has already been sent"
            )

        # Soft delete
        message.is_deleted = True
        message.deleted_at = datetime.utcnow()
        db.commit()

        return True

    @staticmethod
    def get_engagement_stats(db: Session) -> EngagementStats:
        """
        Get overall engagement statistics for the communication system.
        Admin/Principal dashboard view.

        Args:
            db: Database session

        Returns:
            EngagementStats object
        """
        from sqlalchemy import Date
        from datetime import timedelta

        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        # Total messages sent
        total_messages = (
            db.query(func.count(Message.id))
            .filter(Message.sent_at.isnot(None))
            .filter(Message.is_deleted == False)
            .scalar() or 0
        )

        # Messages sent today
        messages_today = (
            db.query(func.count(Message.id))
            .filter(Message.sent_at >= today_start)
            .filter(Message.is_deleted == False)
            .scalar() or 0
        )

        # Total recipients reached
        total_recipients = (
            db.query(func.count(MessageDelivery.id))
            .join(Message, Message.id == MessageDelivery.message_id)
            .filter(Message.is_deleted == False)
            .scalar() or 0
        )

        # Average read rate
        total_deliveries = (
            db.query(func.count(MessageDelivery.id))
            .join(Message, Message.id == MessageDelivery.message_id)
            .filter(Message.is_deleted == False)
            .scalar() or 0
        )

        read_deliveries = (
            db.query(func.count(MessageDelivery.id))
            .join(Message, Message.id == MessageDelivery.message_id)
            .filter(MessageDelivery.status == DeliveryStatus.READ)
            .filter(Message.is_deleted == False)
            .scalar() or 0
        )

        average_read_rate = (read_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0

        # Breakdown by message type
        type_counts = (
            db.query(Message.message_type, func.count(Message.id))
            .filter(Message.sent_at.isnot(None))
            .filter(Message.is_deleted == False)
            .group_by(Message.message_type)
            .all()
        )

        broadcast_count = sum(count for msg_type, count in type_counts if msg_type == MessageType.BROADCAST)
        direct_count = sum(count for msg_type, count in type_counts if msg_type == MessageType.DIRECT)
        announcement_count = sum(count for msg_type, count in type_counts if msg_type == MessageType.ANNOUNCEMENT)

        # Messages in last 7 days
        messages_7_days = (
            db.query(func.count(Message.id))
            .filter(Message.sent_at >= seven_days_ago)
            .filter(Message.is_deleted == False)
            .scalar() or 0
        )

        # Messages in last 30 days
        messages_30_days = (
            db.query(func.count(Message.id))
            .filter(Message.sent_at >= thirty_days_ago)
            .filter(Message.is_deleted == False)
            .scalar() or 0
        )

        return EngagementStats(
            total_messages_sent=total_messages,
            total_messages_today=messages_today,
            total_recipients_reached=total_recipients,
            average_read_rate=round(average_read_rate, 2),
            broadcast_count=broadcast_count,
            direct_count=direct_count,
            announcement_count=announcement_count,
            messages_last_7_days=messages_7_days,
            messages_last_30_days=messages_30_days
        )

    @staticmethod
    def get_user_preferences(
        db: Session,
        user_id: int
    ) -> CommunicationPreference:
        """
        Get or create communication preferences for a user.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            CommunicationPreference object
        """
        preferences = (
            db.query(CommunicationPreference)
            .filter(CommunicationPreference.user_id == user_id)
            .first()
        )

        if not preferences:
            # Create default preferences
            preferences = CommunicationPreference(
                user_id=user_id,
                app_notifications_enabled=True,
                email_notifications_enabled=False,
                sms_notifications_enabled=False,
                preferred_language='en',
                instant_notifications=True,
                daily_digest_enabled=False
            )
            db.add(preferences)
            db.commit()
            db.refresh(preferences)

        return preferences

    @staticmethod
    def update_preferences(
        db: Session,
        user_id: int,
        preferences_data: Dict[str, Any]
    ) -> CommunicationPreference:
        """
        Update user's communication preferences.

        Args:
            db: Database session
            user_id: User ID
            preferences_data: Dictionary of preference updates

        Returns:
            Updated CommunicationPreference object
        """
        preferences = MessageService.get_user_preferences(db, user_id)

        # Update fields
        for key, value in preferences_data.items():
            if value is not None and hasattr(preferences, key):
                setattr(preferences, key, value)

        db.commit()
        db.refresh(preferences)

        return preferences
