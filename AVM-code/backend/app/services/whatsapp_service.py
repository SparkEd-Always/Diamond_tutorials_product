"""
WhatsApp Service using Twilio
Simplified messaging for schools - just need to configure school WhatsApp number
"""
from typing import List, Dict
from sqlalchemy.orm import Session
from twilio.rest import Client
from app.core.config import settings
from app.models.whatsapp_chat import WhatsAppChat, ChatType
from app.models.student import Student
from app.models.communication import Communication
from app.models.attendance import Attendance
from datetime import datetime


class WhatsAppService:
    def __init__(self):
        """Initialize Twilio WhatsApp client"""
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            print("⚠️  WARNING: Twilio credentials not configured. WhatsApp messaging disabled.")
            self.client = None
            return

        self.client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        self.from_number = settings.TWILIO_WHATSAPP_NUMBER or "whatsapp:+14155238886"
        self.school_name = settings.SCHOOL_NAME or "AVM Tutorials"
        self.school_contact = settings.SCHOOL_WHATSAPP_NUMBER or "+919380668711"

    def _format_phone_number(self, phone: str) -> str:
        """Format phone number for WhatsApp (add whatsapp: prefix if needed)"""
        if not phone:
            return ""

        # Remove any existing whatsapp: prefix
        phone = phone.replace("whatsapp:", "").strip()

        # Add + if not present
        if not phone.startswith("+"):
            phone = "+" + phone

        # Add whatsapp: prefix
        return f"whatsapp:{phone}"

    def _get_or_create_individual_chat(
        self, phone_number: str, student_name: str, student_unique_id: str, db: Session
    ) -> WhatsAppChat:
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

    def _get_or_create_announcement_chat(
        self, phone_number: str, parent_name: str, db: Session
    ) -> WhatsAppChat:
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
        """Send individual attendance update to parent via WhatsApp using Twilio"""
        if not self.client:
            print("❌ Twilio client not configured. Cannot send WhatsApp message.")
            return False

        try:
            # Get or create individual chat session
            chat = self._get_or_create_individual_chat(
                phone_number=student.parent_phone,
                student_name=student.full_name,
                student_unique_id=student.unique_id,
                db=db
            )

            # Format attendance message with school branding
            status_emoji = "✅" if attendance_record.status.value == "present" else "❌"
            message_text = f"""📚 {self.school_name} - Daily Update
🏫 Contact: {self.school_contact}

🎓 Student: {student.full_name} ({student.unique_id})
📅 Date: {attendance_record.date.strftime('%d %b %Y')}
{status_emoji} Attendance: {attendance_record.status.value.title()}"""

            if attendance_record.remarks:
                message_text += f"\n📝 Remarks: {attendance_record.remarks}"

            message_text += f"\n\n💬 For queries, contact school at {self.school_contact}"

            # Send message via Twilio WhatsApp
            to_number = self._format_phone_number(student.parent_phone)

            print(f"📤 Sending WhatsApp to {student.parent_phone} ({student.full_name})...")

            message = self.client.messages.create(
                body=message_text,
                from_=self.from_number,
                to=to_number
            )

            if message.sid:
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

                print(f"✅ WhatsApp sent successfully! SID: {message.sid}")
                return True
            else:
                print(f"❌ Failed to send WhatsApp message")
                return False

        except Exception as e:
            print(f"❌ Error sending WhatsApp message: {str(e)}")
            return False

    async def send_mass_communication(
        self,
        title: str,
        message: str,
        phone_numbers: List[str],
        parent_names: List[str],
        db: Session
    ) -> Dict[str, int]:
        """Send mass communication via WhatsApp using Twilio"""
        if not self.client:
            print("❌ Twilio client not configured. Cannot send WhatsApp messages.")
            return {"sent": 0, "failed": len(phone_numbers)}

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

                # Format announcement message with school branding
                message_text = f"""📢 {self.school_name} - Announcement
🏫 Contact: {self.school_contact}

📋 {title}

{message}

💬 For queries, contact us at {self.school_contact}"""

                # Send message via Twilio WhatsApp
                to_number = self._format_phone_number(phone_number)

                print(f"📤 Sending announcement to {phone_number}...")

                twilio_message = self.client.messages.create(
                    body=message_text,
                    from_=self.from_number,
                    to=to_number
                )

                if twilio_message.sid:
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
                    print(f"✅ Sent to {phone_number}")
                else:
                    results["failed"] += 1
                    print(f"❌ Failed to send to {phone_number}")

            except Exception as e:
                print(f"❌ Error sending WhatsApp message to {phone_number}: {str(e)}")
                results["failed"] += 1

        db.commit()
        return results

    async def send_teacher_credentials(
        self,
        teacher_name: str,
        teacher_email: str,
        username: str,
        password: str,
        phone_number: str
    ) -> bool:
        """Send teacher login credentials via WhatsApp using Twilio"""
        if not self.client:
            print("❌ Twilio client not configured. Cannot send WhatsApp message.")
            return False

        try:
            # Format teacher credentials message with school branding
            message_text = f"""🎓 {self.school_name} - Teacher Account
🏫 Contact: {self.school_contact}

👤 Name: {teacher_name}
📧 Email: {teacher_email}
🔑 Username: {username}
🔐 Password: {password}

🌐 Login at: http://localhost:3000

⚠️ Please change your password after first login.

💬 For assistance, contact admin at {self.school_contact}"""

            # Send message via Twilio WhatsApp
            to_number = self._format_phone_number(phone_number)

            print(f"📤 Sending credentials to {teacher_name} at {phone_number}...")

            message = self.client.messages.create(
                body=message_text,
                from_=self.from_number,
                to=to_number
            )

            if message.sid:
                print(f"✅ Credentials sent to {teacher_name} at {phone_number}")
                return True
            else:
                print(f"❌ Failed to send credentials")
                return False

        except Exception as e:
            print(f"❌ Error sending teacher credentials: {str(e)}")
            return False
