"""
OTP Service for Parent Authentication
Generates and validates OTPs for phone number login
"""
import random
import logging
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.parent import OTP
from twilio.rest import Client

# Setup logger
logger = logging.getLogger(__name__)


class OTPService:
    @staticmethod
    def generate_otp() -> str:
        """Generate a 6-digit OTP"""
        return str(random.randint(100000, 999999))

    @staticmethod
    async def send_otp_via_twilio(phone_number: str, otp_code: str) -> bool:
        """
        Send OTP via Twilio SMS service
        """
        try:
            # Twilio credentials from environment variables
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

            if not all([account_sid, auth_token, twilio_number]):
                logger.warning("Twilio credentials not set, skipping SMS")
                return False

            # Ensure phone number has country code
            if not phone_number.startswith("+"):
                phone_number = f"+91{phone_number}"

            # Initialize Twilio client
            client = Client(account_sid, auth_token)

            # SMS message
            message_body = f"Your OTP for Sparky login is {otp_code}. Valid for 10 minutes. - AVM Tutorials"

            # Send SMS
            message = client.messages.create(
                body=message_body,
                from_=twilio_number,
                to=phone_number
            )

            if message.sid:
                logger.info(f"✅ OTP sent via Twilio to {phone_number} (SID: {message.sid})")
                return True
            else:
                logger.error(f"❌ Twilio failed to send message")
                return False

        except Exception as e:
            logger.error(f"❌ Twilio error: {str(e)}")
            return False

    @staticmethod
    async def send_otp(phone_number: str, db: Session) -> str:
        """
        Generate and send OTP to phone number
        Tries MSG91 first, falls back to console logging
        """
        # Generate OTP
        otp_code = OTPService.generate_otp()

        # Delete any existing OTPs for this phone number
        db.query(OTP).filter(OTP.phone_number == phone_number).delete()

        # Create new OTP record
        otp_record = OTP(
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=datetime.utcnow() + timedelta(minutes=10),  # OTP valid for 10 minutes
            is_verified=False
        )
        db.add(otp_record)
        db.commit()

        # Try to send via Twilio
        sms_sent = await OTPService.send_otp_via_twilio(phone_number, otp_code)

        # Always log to console (for backup/debugging)
        if sms_sent:
            console_msg = f"📱 OTP sent to {phone_number} via SMS"
        else:
            console_msg = f"🔐 OTP for {phone_number}: {otp_code} (SMS failed, using console)"

        print(console_msg)
        logger.info(console_msg)

        # Log validity
        validity_message = f"⏰ Valid for 10 minutes"
        print(validity_message)
        logger.info(validity_message)

        return otp_code

    @staticmethod
    async def verify_otp(phone_number: str, otp_code: str, db: Session) -> bool:
        """Verify OTP for phone number"""
        otp_record = db.query(OTP).filter(
            OTP.phone_number == phone_number,
            OTP.otp_code == otp_code,
            OTP.is_verified == False,
            OTP.expires_at > datetime.utcnow()
        ).first()

        if otp_record:
            otp_record.is_verified = True
            db.commit()
            verify_msg = f"✅ OTP verified for {phone_number}"
            print(verify_msg)
            logger.info(verify_msg)
            return True

        fail_msg = f"❌ Invalid or expired OTP for {phone_number}"
        print(fail_msg)
        logger.warning(fail_msg)
        return False
