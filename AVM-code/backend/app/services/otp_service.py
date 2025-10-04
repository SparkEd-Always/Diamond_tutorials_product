"""
OTP Service for Parent Authentication
Generates and validates OTPs for phone number login
"""
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.parent import OTP


class OTPService:
    @staticmethod
    def generate_otp() -> str:
        """Generate a 6-digit OTP"""
        return str(random.randint(100000, 999999))

    @staticmethod
    async def send_otp(phone_number: str, db: Session) -> str:
        """
        Generate and send OTP to phone number
        For now, just logs to console. In production, integrate SMS service.
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

        # TODO: In production, send SMS via Twilio/other service
        # For now, just log to console
        print(f"🔐 OTP for {phone_number}: {otp_code}")
        print(f"⏰ Valid for 10 minutes")

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
            print(f"✅ OTP verified for {phone_number}")
            return True

        print(f"❌ Invalid or expired OTP for {phone_number}")
        return False
