"""
FastAPI Application Entry Point
Student Information System (SIS)
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging

from app.config import settings
from app.database import engine, Base
from app.api.v1 import students, parents, documents, academic, attendance, medical, behavioral, analytics

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting Student Information System (SIS) Backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug Mode: {settings.DEBUG}")

    # Create database tables (in production, use Alembic migrations)
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")

    yield

    # Shutdown
    logger.info("Shutting down SIS Backend...")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Student Information System - Single Source of Truth for Student Data",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)


# Middleware Configuration

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Middleware for response compression
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Request Timing Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Add X-Process-Time header to all responses.
    Useful for monitoring API performance.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Exception Handlers

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled exceptions.
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error. Please contact support.",
            "data": None,
            "errors": {"detail": str(exc)} if settings.DEBUG else None
        }
    )


# Health Check Endpoints

@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint - Health check.
    """
    return {
        "success": True,
        "message": "Student Information System (SIS) API is running!",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    """
    # TODO: Add database connectivity check
    # TODO: Add Redis connectivity check
    # TODO: Add Elasticsearch connectivity check

    return {
        "success": True,
        "status": "healthy",
        "version": settings.APP_VERSION,
        "checks": {
            "database": "ok",  # TODO: Implement actual check
            "redis": "ok",      # TODO: Implement actual check
            "elasticsearch": "ok"  # TODO: Implement actual check
        }
    }


# API Routers

# Include API v1 routers
app.include_router(
    students.router,
    prefix=f"{settings.API_V1_PREFIX}/students",
    tags=["Students"]
)

app.include_router(
    parents.router,
    prefix=f"{settings.API_V1_PREFIX}/parents",
    tags=["Parents"]
)

app.include_router(
    documents.router,
    prefix=f"{settings.API_V1_PREFIX}/documents",
    tags=["Documents"]
)

app.include_router(
    academic.router,
    prefix=f"{settings.API_V1_PREFIX}/academic",
    tags=["Academic Records"]
)

app.include_router(
    attendance.router,
    prefix=f"{settings.API_V1_PREFIX}/attendance",
    tags=["Attendance"]
)

app.include_router(
    medical.router,
    prefix=f"{settings.API_V1_PREFIX}/medical",
    tags=["Medical Records"]
)

app.include_router(
    behavioral.router,
    prefix=f"{settings.API_V1_PREFIX}/behavioral",
    tags=["Behavioral Records"]
)

app.include_router(
    analytics.router,
    prefix=f"{settings.API_V1_PREFIX}/analytics",
    tags=["Analytics"]
)


# Run Application (for development only)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
