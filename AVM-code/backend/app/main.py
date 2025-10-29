from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import settings
from .core.database import engine, Base
from .api.v1 import api_router

# Import all models so they are registered with SQLAlchemy Base
from .models import user, student, teacher, attendance, communication, notice, activity_log

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

@app.post("/create-admins")
async def create_admins():
    """Create two admin users: ADMumesh and ADMmahantesh"""
    from sqlalchemy.orm import sessionmaker
    from .models.user import User, UserRole
    from bcrypt import hashpw, gensalt

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    admins_data = [
        {
            "unique_id": "AVM-ADM-002",
            "username": "ADMumesh",
            "full_name": "Umesh",
            "email": "umesh@avm.com",
            "phone_number": "+91-9008152221",
            "password": "admin1"
        },
        {
            "unique_id": "AVM-ADM-003",
            "username": "ADMmahantesh",
            "full_name": "Mahantesh",
            "email": "mahantesh@avm.com",
            "phone_number": "+91-8197537794",
            "password": "admin2"
        }
    ]

    results = []

    try:
        for admin_data in admins_data:
            # Check if user already exists
            existing = db.query(User).filter(
                (User.username == admin_data["username"]) |
                (User.email == admin_data["email"])
            ).first()

            if existing:
                results.append({
                    "username": admin_data["username"],
                    "status": "already_exists"
                })
                continue

            # Hash password with bcrypt
            hashed_password = hashpw(admin_data["password"].encode('utf-8'), gensalt()).decode('utf-8')

            # Create admin user
            admin = User(
                unique_id=admin_data["unique_id"],
                email=admin_data["email"],
                phone_number=admin_data["phone_number"],
                username=admin_data["username"],
                full_name=admin_data["full_name"],
                hashed_password=hashed_password,
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True
            )

            db.add(admin)
            db.commit()

            results.append({
                "username": admin_data["username"],
                "full_name": admin_data["full_name"],
                "status": "created"
            })

        return {"message": "Done", "results": results}

    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

@app.post("/clear-activity-logs")
async def clear_activity_logs():
    """Clear all records from the activity_logs table"""
    from sqlalchemy.orm import sessionmaker
    from .models.activity_log import ActivityLog

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Count records before deletion
        count_before = db.query(ActivityLog).count()

        # Delete all activity logs
        db.query(ActivityLog).delete()
        db.commit()

        count_after = db.query(ActivityLog).count()

        return {
            "message": "Activity logs cleared successfully",
            "records_deleted": count_before,
            "records_remaining": count_after
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)