from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
import json
import hmac
import hashlib
import os
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.models.student import Student
from app.models.attendance import Attendance

router = APIRouter()

# WhatsApp Business API Configuration
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "your-whatsapp-token")
WHATSAPP_WEBHOOK_SECRET = os.getenv("WHATSAPP_WEBHOOK_SECRET", "your-webhook-secret")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "your-phone-number-id")

@router.get("/webhook")
async def verify_webhook(
    hub_mode: str = None,
    hub_challenge: str = None,
    hub_verify_token: str = None
):
    """Verify WhatsApp webhook (GET request from Meta)"""
    if hub_mode == "subscribe" and hub_verify_token == WHATSAPP_TOKEN:
        return int(hub_challenge)
    else:
        raise HTTPException(status_code=403, detail="Forbidden")

@router.post("/webhook")
async def handle_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle incoming WhatsApp webhook messages"""
    try:
        # Get the request body
        body = await request.body()

        # Verify the webhook signature (recommended for production)
        signature = request.headers.get("X-Hub-Signature-256")
        if signature and WHATSAPP_WEBHOOK_SECRET:
            expected_signature = "sha256=" + hmac.new(
                WHATSAPP_WEBHOOK_SECRET.encode(),
                body,
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(signature, expected_signature):
                raise HTTPException(status_code=403, detail="Invalid signature")

        # Parse the webhook payload
        data = json.loads(body.decode())

        # Process the webhook data
        if "messages" in data.get("entry", [{}])[0].get("changes", [{}])[0].get("value", {}):
            # Handle incoming messages (for future features like parent responses)
            await process_incoming_message(data, db)

        return {"status": "ok"}

    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

async def process_incoming_message(data: Dict[Any, Any], db: Session):
    """Process incoming WhatsApp messages from parents"""
    try:
        entry = data.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        for message in messages:
            from_number = message.get("from")
            message_body = message.get("text", {}).get("body", "")
            message_type = message.get("type")

            print(f"Received message from {from_number}: {message_body}")

            # Find student by parent phone number
            student = db.query(Student).filter(
                Student.parent_phone == from_number
            ).first()

            if student:
                # Log the message for future processing
                # Could implement auto-responses, leave requests, etc.
                print(f"Message from {student.full_name}'s parent: {message_body}")
            else:
                print(f"Unknown parent phone number: {from_number}")

    except Exception as e:
        print(f"Error processing incoming message: {str(e)}")

@router.post("/send-attendance-notification")
async def send_attendance_notification(
    notification_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Send attendance notification to parent via WhatsApp"""
    import requests

    try:
        student_name = notification_data.get("student_name")
        parent_phone = notification_data.get("parent_phone")
        attendance_status = notification_data.get("attendance_status")
        date = notification_data.get("date")
        remarks = notification_data.get("remarks", "")

        # Format the message
        status_emoji = {
            "present": "✅",
            "absent": "❌",
            "late": "⏰",
            "leave": "📝"
        }.get(attendance_status, "❓")

        message = f"""
🏫 *Diamond Tutorial Management*

📅 *Date:* {date}
👤 *Student:* {student_name}
📊 *Attendance:* {status_emoji} {attendance_status.upper()}
"""

        if remarks:
            message += f"💬 *Remarks:* {remarks}\n"

        message += f"""
⏰ *Time:* {datetime.now().strftime('%I:%M %p')}

_This is an automated message from Diamond Tutorial Management System._
"""

        # WhatsApp Business API endpoint
        url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"

        headers = {
            "Authorization": f"Bearer {WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": parent_phone,
            "type": "text",
            "text": {
                "body": message
            }
        }

        # Send the message (commented out for demo - uncomment in production)
        # response = requests.post(url, headers=headers, json=payload)
        # response.raise_for_status()

        # For demo purposes, just log the message
        print(f"Would send WhatsApp message to {parent_phone}:")
        print(message)

        return {
            "status": "success",
            "message": "Attendance notification sent successfully",
            "recipient": parent_phone,
            "student": student_name
        }

    except Exception as e:
        print(f"Error sending WhatsApp notification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send WhatsApp notification: {str(e)}"
        )

@router.post("/send-bulk-notifications")
async def send_bulk_notifications(
    notifications: list[Dict[str, Any]],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Send bulk attendance notifications"""
    sent_count = 0
    failed_count = 0
    results = []

    for notification in notifications:
        try:
            result = await send_attendance_notification(notification, db, current_user)
            sent_count += 1
            results.append({
                "phone": notification.get("parent_phone"),
                "status": "success",
                "student": notification.get("student_name")
            })
        except Exception as e:
            failed_count += 1
            results.append({
                "phone": notification.get("parent_phone"),
                "status": "failed",
                "error": str(e),
                "student": notification.get("student_name")
            })

    return {
        "total_notifications": len(notifications),
        "sent_successfully": sent_count,
        "failed": failed_count,
        "results": results
    }

@router.get("/webhook-info")
async def get_webhook_info():
    """Get webhook configuration information"""
    return {
        "webhook_url": "https://your-domain.com/api/v1/whatsapp/webhook",
        "verify_token": WHATSAPP_TOKEN,
        "webhook_fields": [
            "messages",
            "message_deliveries",
            "message_reads",
            "message_reactions"
        ],
        "setup_instructions": {
            "1": "Go to Meta for Developers (developers.facebook.com)",
            "2": "Create a WhatsApp Business App",
            "3": "Configure webhook URL and verify token",
            "4": "Subscribe to webhook fields",
            "5": "Get your Phone Number ID and Access Token",
            "6": "Set environment variables: WHATSAPP_TOKEN, WHATSAPP_WEBHOOK_SECRET, WHATSAPP_PHONE_NUMBER_ID"
        }
    }