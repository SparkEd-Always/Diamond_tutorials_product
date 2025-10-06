from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/admission_system")

    # Redis (optional for caching)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-secret-key-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "admissions@school.com")

    # SMS Configuration (MSG91 or Twilio)
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "msg91")  # msg91 or twilio
    SMS_API_KEY: Optional[str] = os.getenv("SMS_API_KEY")
    SMS_SENDER_ID: Optional[str] = os.getenv("SMS_SENDER_ID")

    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "5"))
    ALLOWED_EXTENSIONS: str = os.getenv("ALLOWED_EXTENSIONS", "pdf,jpg,jpeg,png")

    # Application
    PROJECT_NAME: str = "Student Admission Management System"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Digital Admission System for Schools - Journey 1"
    API_V1_PREFIX: str = "/api/v1"

    # School Settings
    SCHOOL_NAME: str = os.getenv("SCHOOL_NAME", "ABC International School")
    SCHOOL_CODE: str = os.getenv("SCHOOL_CODE", "ABC")
    CURRENT_ACADEMIC_YEAR: str = os.getenv("CURRENT_ACADEMIC_YEAR", "2024-25")

    # Payment Gateway (Razorpay)
    RAZORPAY_KEY_ID: Optional[str] = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: Optional[str] = os.getenv("RAZORPAY_KEY_SECRET")

    # CORS Settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    class Config:
        env_file = ".env"

settings = Settings()
