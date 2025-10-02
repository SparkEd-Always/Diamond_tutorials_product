from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_teacher_user
from app.models.user import User
from app.models.communication import Communication

router = APIRouter()

@router.post("/send-whatsapp")
async def send_whatsapp_message(
    message_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Send WhatsApp message (admin only)"""
    return {"message": "WhatsApp messaging endpoint - to be implemented"}

@router.post("/send-bulk")
async def send_bulk_message(
    message_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Send bulk message to multiple recipients"""
    return {"message": "Bulk messaging endpoint - to be implemented"}

@router.get("/history", response_model=List[dict])
async def get_communication_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Get communication history"""
    communications = db.query(Communication).order_by(Communication.created_at.desc()).all()
    return [
        {
            "id": comm.id,
            "subject": comm.subject,
            "message": comm.message,
            "message_type": comm.message_type,
            "sent_at": comm.sent_at.isoformat() if comm.sent_at else None,
            "delivery_status": comm.delivery_status,
            "recipient": comm.bulk_group_name if comm.is_bulk else "Individual",
            "sender": comm.sender.full_name if comm.sender else "Unknown"
        }
        for comm in communications
    ]