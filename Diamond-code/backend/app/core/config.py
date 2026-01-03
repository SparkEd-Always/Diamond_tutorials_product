from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/tutorial_management")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Twilio Configuration (for WhatsApp and SMS)
    TWILIO_ACCOUNT_SID: Optional[str] = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: Optional[str] = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_NUMBER: Optional[str] = os.getenv("TWILIO_WHATSAPP_NUMBER")  # Format: whatsapp:+14155238886
    TWILIO_PHONE_NUMBER: Optional[str] = os.getenv("TWILIO_PHONE_NUMBER")  # For SMS fallback

    # Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")

    # Application
    PROJECT_NAME: str = "AVM Tutorial Management System"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Tutorial Management System with WhatsApp Integration"

    # School/Organization Settings (default values, can be overridden per school)
    SCHOOL_NAME: str = os.getenv("SCHOOL_NAME", "AVM Tutorials")
    SCHOOL_WHATSAPP_NUMBER: Optional[str] = os.getenv("SCHOOL_WHATSAPP_NUMBER")  # e.g., "+919380668711"

    class Config:
        env_file = ".env"

settings = Settings()