"""
Application Configuration
Uses pydantic-settings for environment variable management
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    # Application
    APP_NAME: str = "Student Information System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # Database (SQLite for development, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./sis.db"
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"
    ELASTICSEARCH_INDEX_PREFIX: str = "sis_"

    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "sis-documents"
    S3_BUCKET_URL: str = ""

    # Email (SendGrid)
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@sparked.in"
    FROM_NAME: str = "Sparked SIS"

    # SMS (Twilio)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: List[str] = ["pdf", "jpg", "jpeg", "png", "docx"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 100

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100

    # Logging
    LOG_LEVEL: str = "INFO"
    SENTRY_DSN: str = ""

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )


# Create settings instance
settings = Settings()


# Helper functions

def get_database_url() -> str:
    """Get database URL for SQLAlchemy."""
    return settings.DATABASE_URL


def get_redis_url() -> str:
    """Get Redis URL."""
    return settings.REDIS_URL


def is_production() -> bool:
    """Check if running in production environment."""
    return settings.ENVIRONMENT.lower() == "production"


def is_development() -> bool:
    """Check if running in development environment."""
    return settings.ENVIRONMENT.lower() == "development"
