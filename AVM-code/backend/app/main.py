from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import settings
from .core.database import engine, Base
from .api.v1 import api_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "AVM Tutorial Management System API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AVM Tutorial API"}

@app.post("/init-admin")
async def init_admin():
    """Initialize admin user for first-time setup"""
    from sqlalchemy.orm import sessionmaker
    from .models.user import User, UserRole
    # from .core.security import get_password_hash  # Temporarily disabled

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@avm.com").first()
        if existing_admin:
            return {"message": "Admin user already exists", "email": "admin@avm.com"}

        # Create admin user
        admin = User(
            unique_id="AVM-ADM-001",
            email="admin@avm.com",
            phone_number="+91-9999900001",
            username="admin",
            full_name="System Administrator",
            hashed_password="$2b$12$fallback_admin",  # Simple fallback hash
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        return {
            "message": "Admin user created successfully",
            "email": "admin@avm.com",
            "username": "admin",
            "password": "admin"
        }
    except Exception as e:
        db.rollback()
        return {"error": f"Failed to create admin user: {str(e)}"}
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)