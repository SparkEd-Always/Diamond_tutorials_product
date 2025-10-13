"""
Fee Management System - Main Application
FastAPI Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Import configurations
from app.core.config import settings
from app.core.database import engine, Base

# Import API routers
# from app.api.v1 import fees, invoices, payments, receipts, reconciliation
# from app.api.v1 import outstanding, reminders, discounts, reports, dashboards

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Fee Collection & Reconciliation System for Indian Schools",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Compression Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Fee Management System API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Include API routers (uncomment as you create them)
# app.include_router(fees.router, prefix="/api/v1", tags=["Fees"])
# app.include_router(invoices.router, prefix="/api/v1", tags=["Invoices"])
# app.include_router(payments.router, prefix="/api/v1", tags=["Payments"])
# app.include_router(receipts.router, prefix="/api/v1", tags=["Receipts"])
# app.include_router(reconciliation.router, prefix="/api/v1", tags=["Reconciliation"])
# app.include_router(outstanding.router, prefix="/api/v1", tags=["Outstanding"])
# app.include_router(reminders.router, prefix="/api/v1", tags=["Reminders"])
# app.include_router(discounts.router, prefix="/api/v1", tags=["Discounts"])
# app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
# app.include_router(dashboards.router, prefix="/api/v1", tags=["Dashboards"])


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc) if settings.DEBUG else "An error occurred",
            },
        },
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"📚 API Documentation: http://localhost:8000/docs")
    print(f"🏫 School: {settings.SCHOOL_NAME}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print(f"🛑 {settings.APP_NAME} shutting down...")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (development only)
        log_level="info",
    )
