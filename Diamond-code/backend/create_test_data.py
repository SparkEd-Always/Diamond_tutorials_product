#!/usr/bin/env python3
"""Create minimal test data: 1 admin, 1 teacher, 1 student with parent"""

import sys
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import bcrypt

# Add app directory to path
sys.path.insert(0, '/Users/koustubskulkarni/AVM/product/AVM-code/backend')

from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.parent import Parent

# Database setup
DATABASE_URL = "sqlite:///avm_tutorial.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

print("Creating test data...")

try:
    # 1. Create Admin User
    admin_user = User(
        unique_id="Diamond-ADM-001",
        full_name="Admin User",
        email="admin@avm.com",
        username="admin",
        hashed_password=hash_password("admin123"),
        role="admin",
        is_active=True,
        created_at=datetime.now()
    )
    db.add(admin_user)
    print("✅ Admin created: admin / admin123")

    # 2. Create Teacher
    teacher = Teacher(
        unique_id="Diamond-TCH-001",
        first_name="Rajesh",
        last_name="Kumar",
        full_name="Rajesh Kumar",
        email="rajesh@avm.com",
        phone="+919380668711",
        phone_number="+919380668711",
        subjects=["Mathematics"],
        classes_assigned=["Class 8", "Class 9"],
        is_active="Active",
        created_at=datetime.now()
    )
    db.add(teacher)
    print("✅ Teacher created: Rajesh Kumar (+919380668711)")

    # 3. Create Student with Parent
    student = Student(
        unique_id="Diamond-STU-001",
        first_name="Priya",
        last_name="Sharma",
        full_name="Priya Sharma",
        class_name="Class 8",
        section="A",
        roll_number="001",
        date_of_birth=datetime(2012, 5, 15).date(),
        gender="Female",
        parent_name="Suresh Sharma",
        parent_phone="+919986660025",
        parent_email="suresh@email.com",
        address="123 Main Street, Bangalore",
        is_active="Active",
        admission_date=datetime.now().date(),
        created_at=datetime.now()
    )
    db.add(student)
    print("✅ Student created: Priya Sharma (Diamond-STU-001)")

    # 4. Create Parent record
    parent = Parent(
        phone_number="+919986660025",
        name="Suresh Sharma",
        email="suresh@email.com",
        created_at=datetime.now()
    )
    db.add(parent)
    print("✅ Parent created: Suresh Sharma (+919986660025)")

    # Commit all changes
    db.commit()
    print("\n" + "="*50)
    print("✅ TEST DATA CREATED SUCCESSFULLY!")
    print("="*50)
    print("\n📋 Test Credentials:")
    print("   Admin Web Login: admin / admin123")
    print("   Teacher Mobile: +919380668711 (OTP from backend console)")
    print("   Parent Mobile: +919986660025 (OTP from backend console)")
    print("\n👤 Test Users:")
    print("   Admin: Admin User (Diamond-ADM-001)")
    print("   Teacher: Rajesh Kumar (Diamond-TCH-001)")
    print("   Student: Priya Sharma (Diamond-STU-001)")
    print("   Parent: Suresh Sharma")
    print("\n" + "="*50)

except Exception as e:
    db.rollback()
    print(f"❌ Error creating test data: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
