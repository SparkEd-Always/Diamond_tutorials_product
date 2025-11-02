"""
Script to add admin users to Railway PostgreSQL database
Run this script to create two admin accounts: ADMumesh and ADMmahantesh
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from bcrypt import hashpw, gensalt

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user import User, UserRole

def add_admin_users():
    """Add two admin users to Railway database"""

    # Get DATABASE_URL from environment variable
    DATABASE_URL = os.getenv("DATABASE_URL")

    if not DATABASE_URL:
        print("❌ DATABASE_URL environment variable not found!")
        print("Please run: railway run python add_admins_railway.py")
        return False

    # Fix Railway DATABASE_URL (postgres:// -> postgresql://)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    print(f"📡 Connecting to Railway database...")

    try:
        # Create engine and session
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()

        # Admin users to create
        admins = [
            {
                "unique_id": "AVM-ADM-002",
                "username": "ADMumesh",
                "full_name": "Umesh",
                "email": "umesh@avm.com",
                "phone_number": "+91-9999900002",
                "password": "admin1"
            },
            {
                "unique_id": "AVM-ADM-003",
                "username": "ADMmahantesh",
                "full_name": "Mahantesh",
                "email": "mahantesh@avm.com",
                "phone_number": "+91-9999900003",
                "password": "admin2"
            }
        ]

        for admin_data in admins:
            # Check if user already exists
            existing = db.query(User).filter(
                (User.username == admin_data["username"]) |
                (User.email == admin_data["email"])
            ).first()

            if existing:
                print(f"⚠️  Admin '{admin_data['username']}' already exists. Skipping...")
                continue

            # Hash password
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
            db.refresh(admin)

            print(f"✅ Created admin: {admin_data['username']} (Full Name: {admin_data['full_name']})")
            print(f"   Email: {admin_data['email']}")
            print(f"   Password: {admin_data['password']}")
            print()

        db.close()
        print("🎉 Admin users created successfully!")
        return True

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Adding Admin Users to Railway Database")
    print("=" * 60)
    print()

    success = add_admin_users()

    if success:
        print()
        print("=" * 60)
        print("Login Credentials:")
        print("=" * 60)
        print("Admin 1:")
        print("  Username: ADMumesh")
        print("  Password: admin1")
        print("  Display Name: Umesh")
        print()
        print("Admin 2:")
        print("  Username: ADMmahantesh")
        print("  Password: admin2")
        print("  Display Name: Mahantesh")
        print("=" * 60)
