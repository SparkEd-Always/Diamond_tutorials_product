"""
Application Configuration
Load from environment variables
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App Info
    APP_NAME: str = "Fee Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "sqlite:///./fee_management.db"

    # JWT Authentication
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # Email (SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@school.com"
    SMTP_FROM_NAME: str = "School"

    # SMS (MSG91)
    SMS_PROVIDER: str = "msg91"
    MSG91_AUTH_KEY: str = ""
    MSG91_SENDER_ID: str = "SCHOOL"
    MSG91_ROUTE: str = "4"
    MSG91_DLT_TE_ID: str = ""

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""

    # School Info
    SCHOOL_NAME: str = "ABC School"
    SCHOOL_ADDRESS: str = "123 Main Street, City, State"
    SCHOOL_PHONE: str = "+91-1234567890"
    SCHOOL_EMAIL: str = "info@school.com"
    SCHOOL_WEBSITE: str = "https://www.school.com"
    SCHOOL_LOGO_URL: str = "/static/logo.png"

    # Fee Settings
    DEFAULT_CURRENCY: str = "INR"
    DEFAULT_CURRENCY_SYMBOL: str = "₹"
    GST_PERCENTAGE: float = 18.00
    LATE_FEE_PERCENTAGE: float = 2.00
    LATE_FEE_GRACE_DAYS: int = 7
    LATE_FEE_MAX_PERCENTAGE: float = 10.00

    # Reminder Settings
    REMINDER_PRE_DUE_DAYS: int = 7
    REMINDER_POST_DUE_DAYS: List[int] = [3, 10, 20, 30]
    REMINDER_TIME: str = "10:00"

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "jpg", "jpeg", "png"]

    # PDF Settings
    PDF_FONT_NAME: str = "Helvetica"
    PDF_FONT_SIZE: int = 10
    PDF_PAGE_SIZE: str = "A4"

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Security
    BCRYPT_ROUNDS: int = 12

    # Feature Flags
    ENABLE_WHATSAPP_NOTIFICATIONS: bool = False
    ENABLE_PAYMENT_GATEWAY_BACKUP: bool = False
    ENABLE_TALLY_EXPORT: bool = True
    ENABLE_GST_REPORTS: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
