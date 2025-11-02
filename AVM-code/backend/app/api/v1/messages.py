"""
Mobile In-App Messaging API
Handles messages between admin and parents/teachers
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_mobile_user
from app.models.user import User
from app.models.communication import Communication
from app.models.parent import Parent
from app.models.teacher import Teacher
from app.services.fcm_push_notification_service import FCMPushNotificationService

router = APIRouter()


class SendMessageRequest(BaseModel):
    recipient_type: str  # "parent" or "teacher"
    recipient_id: int
    subject: str
    message: str


class MessageResponse(BaseModel):
    id: int
    subject: str
    message: str
    sender_name: str
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.get("/inbox", response_model=List[MessageResponse])
async def get_inbox(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_mobile_user)
):
    """Get inbox messages for logged-in user (parent or teacher)"""
    try:
        # Determine user type - check if it's a Parent or Teacher model instance
        if isinstance(current_user, Parent):
            messages = db.query(Communication).filter(
                and_(
                    Communication.recipient_type == "parent",
                    Communication.recipient_id == current_user.id,
                    Communication.message_type == "IN_APP"
                )
            ).order_by(Communication.created_at.desc()).all()

        elif isinstance(current_user, Teacher):
            messages = db.query(Communication).filter(
                and_(
                    Communication.recipient_type == "teacher",
                    Communication.recipient_id == current_user.id,
                    Communication.message_type == "IN_APP"
                )
            ).order_by(Communication.created_at.desc()).all()
        else:
            # Web admin user - no inbox
            return []

        return [
            MessageResponse(
                id=msg.id,
                subject=msg.subject or "No Subject",
                message=msg.message,
                sender_name=msg.sender.full_name if msg.sender else "Admin",
                is_read=msg.is_read or False,
                created_at=msg.created_at,
                read_at=msg.read_at
            )
            for msg in messages
        ]

    except Exception as e:
        print(f"Error fetching inbox: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")


@router.get("/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_mobile_user)
):
    """Get count of unread messages"""
    try:
        if isinstance(current_user, Parent):
            count = db.query(Communication).filter(
                and_(
                    Communication.recipient_type == "parent",
                    Communication.recipient_id == current_user.id,
                    Communication.message_type == "IN_APP",
                    Communication.is_read == False
                )
            ).count()

        elif isinstance(current_user, Teacher):
            count = db.query(Communication).filter(
                and_(
                    Communication.recipient_type == "teacher",
                    Communication.recipient_id == current_user.id,
                    Communication.message_type == "IN_APP",
                    Communication.is_read == False
                )
            ).count()
        else:
            count = 0

        return {"count": count}

    except Exception as e:
        print(f"Error getting unread count: {str(e)}")
        return {"count": 0}


@router.put("/{message_id}/read")
async def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_mobile_user)
):
    """Mark a message as read"""
    try:
        message = db.query(Communication).filter(Communication.id == message_id).first()

        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        # Verify the message belongs to current user
        if isinstance(current_user, Parent):
            if message.recipient_type != "parent" or message.recipient_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized")
        elif isinstance(current_user, Teacher):
            if message.recipient_type != "teacher" or message.recipient_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized")
        else:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Mark as read
        message.is_read = True
        message.read_at = datetime.utcnow()
        db.commit()

        return {"success": True, "message": "Message marked as read"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error marking message as read: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/send-to-parents")
async def send_to_parents(
    message_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send in-app message to parents (admin only)"""
    try:
        subject = message_data.get("subject")
        message = message_data.get("message")
        recipients = message_data.get("recipients", "all_parents")

        # Get parents based on recipients filter
        parents_query = db.query(Parent).filter(Parent.is_active == True)

        # TODO: Add class-based filtering if needed
        parents = parents_query.all()

        if not parents:
            raise HTTPException(status_code=404, detail="No parents found")

        sent_count = 0
        notification_sent_count = 0
        no_token_count = 0

        print(f"📨 Sending message to {len(parents)} parents...")

        # Create individual message for each parent
        for parent in parents:
            comm = Communication(
                sender_id=current_user.id,
                recipient_id=parent.id,
                recipient_type="parent",
                subject=subject,
                message=message,
                message_type="IN_APP",
                is_sent=True,
                sent_at=datetime.utcnow(),
                delivery_status="delivered"
            )
            db.add(comm)
            sent_count += 1

            # Send FCM push notification if parent has push token
            if parent.push_token:
                parent_name = parent.name or "Unknown"
                print(f"📲 Sending FCM notification to {parent_name} (phone: {parent.phone_number})")
                print(f"   Token: {parent.push_token[:50]}...")
                result = await FCMPushNotificationService.send_message_notification(
                    fcm_token=parent.push_token,
                    sender_name="AVM Tutorial",
                    message_preview=message[:100],
                    message_id=comm.id
                )
                if result.get("status") == "success":
                    notification_sent_count += 1
                print(f"   Result: {result}")
            else:
                parent_name = parent.name or "Unknown"
                no_token_count += 1
                print(f"⚠️  Parent {parent_name} (ID: {parent.id}, phone: {parent.phone_number}) has NO push token")

        db.commit()

        print(f"✅ Message delivery complete:")
        print(f"   - Messages created: {sent_count}")
        print(f"   - FCM notifications sent: {notification_sent_count}")
        print(f"   - Parents without tokens: {no_token_count}")

        return {
            "success": True,
            "sent": sent_count,
            "notifications_sent": notification_sent_count,
            "no_token": no_token_count,
            "message": f"Message sent to {sent_count} parents ({notification_sent_count} push notifications sent)"
        }

    except Exception as e:
        print(f"Error sending message to parents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
