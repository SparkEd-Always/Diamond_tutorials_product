from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from ..core.database import Base


class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)  # Primary identifier
    name = Column(String(100))
    email = Column(String(100))

    # Push notification
    push_token = Column(String(255))  # Expo push token for notifications
    device_type = Column(String(20))  # ios, android, web

    # Authentication
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Parent(phone={self.phone_number}, name={self.name})>"


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), index=True, nullable=False)
    otp_code = Column(String(6), nullable=False)
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<OTP(phone={self.phone_number}, verified={self.is_verified})>"
