import httpx
import json
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.whatsapp_chat import WhatsAppChat, ChatType
from app.models.student import Student
from app.models.communication import Communication
from app.models.attendance import Attendance
from datetime import datetime

class WhatsAppService:
    def __init__(self):
        self.base_url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}"
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.access_token = settings.WHATSAPP_ACCESS_TOKEN

    def _get_headers(self) -> Dict[str, str]:
        """Get headers for WhatsApp API requests"""
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    def _get_or_create_individual_chat(self, phone_number: str, student_name: str, student_unique_id: str, db: Session) -> WhatsAppChat:
        """Get or create individual chat session for daily attendance updates"""
        chat = db.query(WhatsAppChat).filter(
            WhatsAppChat.phone_number == phone_number,
            WhatsAppChat.chat_type == ChatType.INDIVIDUAL,
            WhatsAppChat.student_unique_id == student_unique_id
        ).first()

        if not chat:
            chat = WhatsAppChat(
                phone_number=phone_number,
                chat_type=ChatType.INDIVIDUAL,
                chat_id=f"individual_{phone_number}_{student_unique_id}",
                student_name=student_name,
                student_unique_id=student_unique_id,
                is_active=True
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)

        return chat

    def _get_or_create_announcement_chat(self, phone_number: str, parent_name: str, db: Session) -> WhatsAppChat:
        """Get or create announcement chat session for mass communications"""
        chat = db.query(WhatsAppChat).filter(
            WhatsAppChat.phone_number == phone_number,
            WhatsAppChat.chat_type == ChatType.ANNOUNCEMENT
        ).first()

        if not chat:
            chat = WhatsAppChat(
                phone_number=phone_number,
                chat_type=ChatType.ANNOUNCEMENT,
                chat_id=f"announcement_{phone_number}",
                parent_name=parent_name,
                is_active=True
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)

        return chat

    async def send_individual_attendance_message(
        self,
        attendance_record: Attendance,
        student: Student,
        db: Session
    ) -> bool:
        """Send individual attendance update to parent via WhatsApp"""
        try:
            # Get or create individual chat session
            chat = self._get_or_create_individual_chat(
                phone_number=student.parent_phone,
                student_name=student.full_name,
                student_unique_id=student.unique_id,
                db=db
            )

            # Format attendance message
            status_emoji = "✅" if attendance_record.status.value == "present" else "❌"
            message_text = f"""📚 AVM Tutorial - Daily Update

🎓 Student: {student.full_name} ({student.unique_id})
📅 Date: {attendance_record.date.strftime('%d %b %Y')}
{status_emoji} Attendance: {attendance_record.status.value.title()}"""

            if attendance_record.remarks:
                message_text += f"\n📝 Remarks: {attendance_record.remarks}"

            message_text += "\n\n💬 Reply to this chat for any queries."

            # Send message via WhatsApp API
            url = f"{self.base_url}/{self.phone_number_id}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "to": student.parent_phone,
                "type": "text",
                "text": {
                    "body": message_text
                }
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=self._get_headers(),
                    json=payload
                )

            if response.status_code == 200:
                # Update chat and communication records
                chat.last_message_sent = datetime.utcnow()
                chat.messages_sent_count += 1

                # Create communication record
                communication = Communication(
                    sender_id=1,  # System/Admin user
                    student_id=student.id,
                    message=message_text,
                    message_type="WHATSAPP",
                    whatsapp_chat_id=chat.chat_id,
                    whatsapp_chat_type="individual",
                    recipient_phone_numbers=[student.parent_phone],
                    is_sent=True,
                    sent_at=datetime.utcnow(),
                    delivery_status="sent"
                )

                db.add(communication)
                db.commit()

                return True
            else:
                print(f"WhatsApp API error: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            print(f"Error sending WhatsApp message: {str(e)}")
            return False

    async def send_mass_communication(
        self,
        title: str,
        message: str,
        phone_numbers: List[str],
        parent_names: List[str],
        db: Session
    ) -> Dict[str, int]:
        """Send mass communication via WhatsApp (announcements)"""
        results = {"sent": 0, "failed": 0}

        for i, phone_number in enumerate(phone_numbers):
            try:
                parent_name = parent_names[i] if i < len(parent_names) else "Parent"

                # Get or create announcement chat session
                chat = self._get_or_create_announcement_chat(
                    phone_number=phone_number,
                    parent_name=parent_name,
                    db=db
                )

                # Format announcement message
                message_text = f"""📢 AVM Tutorial - Announcements

🏫 {title}

{message}

For any queries, please contact the school."""

                # Send message via WhatsApp API
                url = f"{self.base_url}/{self.phone_number_id}/messages"
                payload = {
                    "messaging_product": "whatsapp",
                    "to": phone_number,
                    "type": "text",
                    "text": {
                        "body": message_text
                    }
                }

                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        url,
                        headers=self._get_headers(),
                        json=payload
                    )

                if response.status_code == 200:
                    # Update chat record
                    chat.last_message_sent = datetime.utcnow()
                    chat.messages_sent_count += 1

                    # Create communication record
                    communication = Communication(
                        sender_id=1,  # System/Admin user
                        subject=title,
                        message=message_text,
                        message_type="WHATSAPP",
                        whatsapp_chat_id=chat.chat_id,
                        whatsapp_chat_type="announcement",
                        recipient_phone_numbers=[phone_number],
                        is_bulk=True,
                        is_sent=True,
                        sent_at=datetime.utcnow(),
                        delivery_status="sent"
                    )

                    db.add(communication)
                    results["sent"] += 1
                else:
                    results["failed"] += 1

            except Exception as e:
                print(f"Error sending WhatsApp message to {phone_number}: {str(e)}")
                results["failed"] += 1

        db.commit()
        return results

    async def verify_webhook(self, mode: str, token: str, challenge: str) -> Optional[str]:
        """Verify WhatsApp webhook"""
        if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
            return challenge
        return None

    async def handle_webhook(self, data: dict, db: Session) -> bool:
        """Handle incoming WhatsApp webhook data"""
        try:
            # Process incoming messages, delivery receipts, etc.
            # This will be implemented based on webhook payload structure
            return True
        except Exception as e:
            print(f"Error handling WhatsApp webhook: {str(e)}")
            return False

    async def send_teacher_credentials(
        self,
        teacher_name: str,
        teacher_email: str,
        username: str,
        password: str,
        phone_number: str
    ) -> bool:
        """Send teacher login credentials via WhatsApp"""
        try:
            # Format teacher credentials message
            message_text = f"""🎓 AVM Tutorial - Teacher Account Created

👤 Name: {teacher_name}
📧 Email: {teacher_email}
🔑 Username: {username}
🔐 Password: {password}

🌐 Login at: http://localhost:3000

⚠️ Please change your password after first login.

For any assistance, please contact the admin."""

            # Send message via WhatsApp API
            url = f"{self.base_url}/{self.phone_number_id}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "text",
                "text": {
                    "body": message_text
                }
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=self._get_headers(),
                    json=payload
                )

            if response.status_code == 200:
                print(f"✅ Credentials sent to {teacher_name} at {phone_number}")
                return True
            else:
                print(f"❌ WhatsApp API error: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            print(f"❌ Error sending teacher credentials: {str(e)}")
            return False