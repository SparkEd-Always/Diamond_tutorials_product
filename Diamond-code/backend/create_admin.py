#!/usr/bin/env python3
"""
First-time admin account creation script.
Run this once during deployment to create secure admin credentials.
"""
import sys
import getpass
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def create_admin():
    print("=" * 60)
    print("Diamond Tutorial - Admin Account Setup")
    print("=" * 60)
    print()
    
    # Get admin details
    email = input("Admin Email: ").strip()
    if not email or '@' not in email:
        print("❌ Invalid email address")
        sys.exit(1)
    
    username = input("Admin Username: ").strip()
    if not username or len(username) < 3:
        print("❌ Username must be at least 3 characters")
        sys.exit(1)
    
    full_name = input("Admin Full Name: ").strip()
    if not full_name:
        print("❌ Full name is required")
        sys.exit(1)
    
    phone = input("Phone Number (with country code): ").strip()
    
    # Get password with confirmation
    while True:
        password = getpass.getpass("Admin Password (min 8 chars): ")
        if len(password) < 8:
            print("❌ Password must be at least 8 characters")
            continue
        
        confirm = getpass.getpass("Confirm Password: ")
        if password != confirm:
            print("❌ Passwords do not match. Try again.")
            continue
        
        break
    
    # Create admin user
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first()
        
        if existing:
            print(f"❌ User with email '{email}' or username '{username}' already exists")
            sys.exit(1)
        
        # Generate unique ID
        last_admin = db.query(User).filter(User.role == UserRole.ADMIN).order_by(User.id.desc()).first()
        admin_number = (last_admin.id + 1) if last_admin else 1
        unique_id = f"Diamond-ADM-{admin_number:03d}"
        
        # Create admin
        admin = User(
            unique_id=unique_id,
            email=email,
            username=username,
            full_name=full_name,
            phone_number=phone,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin)
        db.commit()
        
        print()
        print("✅ Admin account created successfully!")
        print(f"   Unique ID: {unique_id}")
        print(f"   Email: {email}")
        print(f"   Username: {username}")
        print()
        print("🔐 Keep your credentials secure!")
        print()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
