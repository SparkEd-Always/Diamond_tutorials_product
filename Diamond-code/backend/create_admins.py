"""
Create Admin Users Script
Run this after deploying to production to create initial admin accounts.

Usage:
    python create_admins.py
"""

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def create_admin_users():
    db = SessionLocal()

    try:
        # Check if admins already exist
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            print("⚠️  Admin users already exist. Skipping creation.")
            print(f"Found existing admin: {existing_admin.username}")
            return

        # Admin 1
        admin1 = User(
            unique_id="AVM-ADM-001",
            username="admin1",
            email="admin1@avmtutorials.com",
            phone_number="+919380668711",
            full_name="Admin One",
            hashed_password=get_password_hash("TemporaryPassword123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )

        # Admin 2
        admin2 = User(
            unique_id="AVM-ADM-002",
            username="admin2",
            email="admin2@avmtutorials.com",
            phone_number="+919380668712",
            full_name="Admin Two",
            hashed_password=get_password_hash("TemporaryPassword123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )

        db.add(admin1)
        db.add(admin2)
        db.commit()

        print("✅ Admin users created successfully!")
        print("\n📋 Admin Credentials:")
        print("-" * 50)
        print(f"Admin 1:")
        print(f"  Username: admin1")
        print(f"  Password: TemporaryPassword123")
        print(f"  Email: admin1@avmtutorials.com")
        print(f"  Phone: +919380668711")
        print()
        print(f"Admin 2:")
        print(f"  Username: admin2")
        print(f"  Password: TemporaryPassword123")
        print(f"  Email: admin2@avmtutorials.com")
        print(f"  Phone: +919380668712")
        print("-" * 50)
        print("\n⚠️  IMPORTANT: Change passwords immediately after first login!")
        print("   Use the 'Change Password' feature on the login page.")

    except Exception as e:
        print(f"❌ Error creating admin users: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_users()
