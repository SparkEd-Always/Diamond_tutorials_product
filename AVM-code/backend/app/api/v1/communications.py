from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_teacher_user
from app.models.user import User
from app.models.communication import Communication
from app.models.student import Student
from app.services.whatsapp_service import WhatsAppService

router = APIRouter()


class BulkMessageRequest(BaseModel):
    subject: str
    message: str
    recipients: str  # "all_parents" or class name


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
    message_request: BulkMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Send bulk WhatsApp message to multiple recipients"""
    try:
        # Get students based on recipient selection
        query = db.query(Student).filter(Student.is_active == "Active")

        # Filter by class if not "all_parents"
        if message_request.recipients != "all_parents":
            # Convert recipient value back to class name (e.g., "class_7" -> "Class 7")
            class_name = message_request.recipients.replace("_", " ").title()
            query = query.filter(Student.class_name == class_name)

        students = query.all()

        if not students:
            raise HTTPException(status_code=404, detail="No students found for the selected recipients")

        # Extract phone numbers and parent names
        phone_numbers = [student.parent_phone for student in students if student.parent_phone]
        parent_names = [student.parent_name for student in students if student.parent_phone]

        if not phone_numbers:
            raise HTTPException(status_code=400, detail="No valid phone numbers found for the selected recipients")

        # Send WhatsApp messages
        whatsapp_service = WhatsAppService()
        results = await whatsapp_service.send_mass_communication(
            title=message_request.subject,
            message=message_request.message,
            phone_numbers=phone_numbers,
            parent_names=parent_names,
            db=db
        )

        return {
            "success": True,
            "sent": results["sent"],
            "failed": results["failed"],
            "total": len(phone_numbers),
            "message": f"Successfully sent {results['sent']} messages, {results['failed']} failed"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending messages: {str(e)}")

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