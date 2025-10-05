from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Database Setup
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite configuration (development)
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL configuration (production)
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis Setup (optional for caching)
redis_client = None
try:
    if hasattr(settings, 'REDIS_URL') and settings.REDIS_URL:
        import redis
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except ImportError:
    # Redis not available
    pass
except Exception:
    # Redis connection failed
    pass

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Redis Dependency (optional)
def get_redis():
    return redis_client
