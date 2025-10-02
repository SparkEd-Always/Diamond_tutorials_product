#!/usr/bin/env python3
"""
Create test data for AVM Tutorial Management System
This script creates sample users, students, and teachers for testing
"""

import asyncio
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime, date

# Import our models
from app.core.database import Base, engine
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.teacher import Teacher

# Import password hashing from security module
from app.core.security import get_password_hash

def create_test_data():
    """Create test data for the application"""

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        print("🚀 Creating test data for AVM Tutorial Management System...")
        print("=" * 60)

        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  Found {existing_users} existing users. Skipping data creation.")
            print("   Delete the database file to recreate test data.")
            return

        # 1. Create Admin Users
        print("1. Creating Admin Users...")
        admin1 = User(
            unique_id="AVM-ADM-001",
            email="admin@avm.com",
            phone_number="+91-9999900001",
            username="admin",
            full_name="Principal Rajesh Kumar",
            hashed_password=get_password_hash("password123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )

        admin2 = User(
            unique_id="AVM-ADM-002",
            email="admin2@avm.com",
            phone_number="+91-9999900002",
            username="admin2",
            full_name="Vice Principal Sunita Sharma",
            hashed_password=get_password_hash("password123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )

        db.add_all([admin1, admin2])
        print("   ✅ Created 2 admin users")

        # 2. Create Teachers
        print("2. Creating Teachers...")
        teachers_data = [
            {
                "unique_id": "AVM-TCH-001",
                "name": "Mrs. Priya Patel",
                "email": "priya.patel@avm.com",
                "phone": "+91-9888800001",
                "subjects": ["Mathematics", "Science"],
                "classes": ["Class 7A", "Class 8A"]
            },
            {
                "unique_id": "AVM-TCH-002",
                "name": "Mr. Amit Singh",
                "email": "amit.singh@avm.com",
                "phone": "+91-9888800002",
                "subjects": ["English", "Social Studies"],
                "classes": ["Class 7B", "Class 8B"]
            },
            {
                "unique_id": "AVM-TCH-003",
                "name": "Mrs. Kavita Sharma",
                "email": "kavita.sharma@avm.com",
                "phone": "+91-9888800003",
                "subjects": ["Science", "Computer"],
                "classes": ["Class 9A", "Class 10A"]
            },
            {
                "unique_id": "AVM-TCH-004",
                "name": "Mr. Ravi Kumar",
                "email": "ravi.kumar@avm.com",
                "phone": "+91-9888800004",
                "subjects": ["Mathematics", "Physics"],
                "classes": ["Class 9B", "Class 10B"]
            },
            {
                "unique_id": "AVM-TCH-005",
                "name": "Ms. Neha Gupta",
                "email": "neha.gupta@avm.com",
                "phone": "+91-9888800005",
                "subjects": ["Hindi", "Sanskrit"],
                "classes": ["Class 7A", "Class 7B", "Class 8A", "Class 8B"]
            }
        ]

        for teacher_data in teachers_data:
            # Create User record for teacher
            teacher_user = User(
                unique_id=teacher_data["unique_id"],
                email=teacher_data["email"],
                phone_number=teacher_data["phone"],
                username=teacher_data["email"].split("@")[0],
                full_name=teacher_data["name"],
                hashed_password=get_password_hash("password123"),
                role=UserRole.TEACHER,
                is_active=True,
                is_verified=True
            )
            db.add(teacher_user)

            # Create Teacher record
            teacher = Teacher(
                unique_id=teacher_data["unique_id"],
                first_name=teacher_data["name"].split()[1],
                last_name=teacher_data["name"].split()[-1],
                full_name=teacher_data["name"],
                email=teacher_data["email"],
                phone_number=teacher_data["phone"],
                subjects=teacher_data["subjects"],
                classes_assigned=teacher_data["classes"],
                qualification="B.Ed, M.A.",
                experience_years=5,
                joining_date=datetime.now(),
                is_active="Active"
            )
            db.add(teacher)

        print(f"   ✅ Created {len(teachers_data)} teachers")

        # 3. Create Students
        print("3. Creating Students...")
        students_data = [
            # Class 7A Students
            {"name": "Rahul Sharma", "class": "Class 7", "section": "A", "parent": "Mr. Rajesh Sharma", "phone": "+91-9777700001"},
            {"name": "Priya Singh", "class": "Class 7", "section": "A", "parent": "Mrs. Sunita Singh", "phone": "+91-9777700002"},
            {"name": "Arjun Patel", "class": "Class 7", "section": "A", "parent": "Mr. Kiran Patel", "phone": "+91-9777700003"},
            {"name": "Kavya Gupta", "class": "Class 7", "section": "A", "parent": "Mrs. Meera Gupta", "phone": "+91-9777700004"},
            {"name": "Rohan Kumar", "class": "Class 7", "section": "A", "parent": "Mr. Suresh Kumar", "phone": "+91-9777700005"},

            # Class 7B Students
            {"name": "Anita Verma", "class": "Class 7", "section": "B", "parent": "Mrs. Rekha Verma", "phone": "+91-9777700006"},
            {"name": "Vikram Joshi", "class": "Class 7", "section": "B", "parent": "Mr. Prakash Joshi", "phone": "+91-9777700007"},
            {"name": "Sneha Agarwal", "class": "Class 7", "section": "B", "parent": "Mrs. Pooja Agarwal", "phone": "+91-9777700008"},
            {"name": "Karan Malhotra", "class": "Class 7", "section": "B", "parent": "Mr. Vinod Malhotra", "phone": "+91-9777700009"},
            {"name": "Ritu Saxena", "class": "Class 7", "section": "B", "parent": "Mrs. Shilpa Saxena", "phone": "+91-9777700010"},

            # Class 8A Students
            {"name": "Aditya Rao", "class": "Class 8", "section": "A", "parent": "Mr. Mohan Rao", "phone": "+91-9777700011"},
            {"name": "Divya Mishra", "class": "Class 8", "section": "A", "parent": "Mrs. Neeta Mishra", "phone": "+91-9777700012"},
            {"name": "Harsh Tiwari", "class": "Class 8", "section": "A", "parent": "Mr. Ramesh Tiwari", "phone": "+91-9777700013"},
            {"name": "Shruti Pandey", "class": "Class 8", "section": "A", "parent": "Mrs. Kiran Pandey", "phone": "+91-9777700014"},
            {"name": "Nikhil Dubey", "class": "Class 8", "section": "A", "parent": "Mr. Ashok Dubey", "phone": "+91-9777700015"},

            # Class 8B Students
            {"name": "Manisha Chawla", "class": "Class 8", "section": "B", "parent": "Mrs. Seema Chawla", "phone": "+91-9777700016"},
            {"name": "Gaurav Bansal", "class": "Class 8", "section": "B", "parent": "Mr. Raman Bansal", "phone": "+91-9777700017"},
            {"name": "Pooja Kapoor", "class": "Class 8", "section": "B", "parent": "Mrs. Renu Kapoor", "phone": "+91-9777700018"},
            {"name": "Rohit Yadav", "class": "Class 8", "section": "B", "parent": "Mr. Sunil Yadav", "phone": "+91-9777700019"},
            {"name": "Swati Bhargava", "class": "Class 8", "section": "B", "parent": "Mrs. Asha Bhargava", "phone": "+91-9777700020"},

            # Class 9A Students
            {"name": "Akash Mehta", "class": "Class 9", "section": "A", "parent": "Mr. Deepak Mehta", "phone": "+91-9777700021"},
            {"name": "Nisha Goyal", "class": "Class 9", "section": "A", "parent": "Mrs. Sushma Goyal", "phone": "+91-9777700022"},
            {"name": "Vishal Khanna", "class": "Class 9", "section": "A", "parent": "Mr. Ravi Khanna", "phone": "+91-9777700023"},
            {"name": "Preeti Sood", "class": "Class 9", "section": "A", "parent": "Mrs. Kavita Sood", "phone": "+91-9777700024"},
            {"name": "Sachin Arora", "class": "Class 9", "section": "A", "parent": "Mr. Ankit Arora", "phone": "+91-9777700025"},

            # Class 9B Students
            {"name": "Rashmi Jain", "class": "Class 9", "section": "B", "parent": "Mrs. Preeti Jain", "phone": "+91-9777700026"},
            {"name": "Ankit Chauhan", "class": "Class 9", "section": "B", "parent": "Mr. Manoj Chauhan", "phone": "+91-9777700027"},
            {"name": "Deepika Sethi", "class": "Class 9", "section": "B", "parent": "Mrs. Neha Sethi", "phone": "+91-9777700028"},
            {"name": "Rahul Bhatia", "class": "Class 9", "section": "B", "parent": "Mr. Vikash Bhatia", "phone": "+91-9777700029"},
            {"name": "Simran Kohli", "class": "Class 9", "section": "B", "parent": "Mrs. Manjeet Kohli", "phone": "+91-9777700030"},

            # Class 10A Students
            {"name": "Aryan Shah", "class": "Class 10", "section": "A", "parent": "Mr. Hitesh Shah", "phone": "+91-9777700031"},
            {"name": "Komal Aggarwal", "class": "Class 10", "section": "A", "parent": "Mrs. Sunita Aggarwal", "phone": "+91-9777700032"},
            {"name": "Tarun Goel", "class": "Class 10", "section": "A", "parent": "Mr. Rajat Goel", "phone": "+91-9777700033"},
            {"name": "Pallavi Chopra", "class": "Class 10", "section": "A", "parent": "Mrs. Ruchi Chopra", "phone": "+91-9777700034"},
            {"name": "Mukesh Sinha", "class": "Class 10", "section": "A", "parent": "Mr. Anil Sinha", "phone": "+91-9777700035"},

            # Class 10B Students
            {"name": "Anjali Rastogi", "class": "Class 10", "section": "B", "parent": "Mrs. Maya Rastogi", "phone": "+91-9777700036"},
            {"name": "Deepak Mittal", "class": "Class 10", "section": "B", "parent": "Mr. Pawan Mittal", "phone": "+91-9777700037"},
            {"name": "Shikha Oberoi", "class": "Class 10", "section": "B", "parent": "Mrs. Anita Oberoi", "phone": "+91-9777700038"},
            {"name": "Varun Bajaj", "class": "Class 10", "section": "B", "parent": "Mr. Rohit Bajaj", "phone": "+91-9777700039"},
            {"name": "Kirti Wadhwa", "class": "Class 10", "section": "B", "parent": "Mrs. Vandana Wadhwa", "phone": "+91-9777700040"},
        ]

        # Add more students to reach 77 total
        additional_students = []
        for i in range(41, 78):  # 41 to 77 (37 more students)
            class_options = [
                ("Class 7", "A"), ("Class 7", "B"),
                ("Class 8", "A"), ("Class 8", "B"),
                ("Class 9", "A"), ("Class 9", "B"),
                ("Class 10", "A"), ("Class 10", "B")
            ]
            class_name, section = class_options[i % len(class_options)]

            additional_students.append({
                "name": f"Student {i}",
                "class": class_name,
                "section": section,
                "parent": f"Parent {i}",
                "phone": f"+91-9777700{i:03d}"
            })

        students_data.extend(additional_students)

        for i, student_data in enumerate(students_data, 1):
            student = Student(
                unique_id=f"AVM-STU-{i:03d}",
                first_name=student_data["name"].split()[0],
                last_name=student_data["name"].split()[-1],
                full_name=student_data["name"],
                date_of_birth=date(2008, 1, 1),  # Approximate age
                gender="Male" if i % 2 == 1 else "Female",
                class_name=student_data["class"],
                section=student_data["section"],
                roll_number=str(i),
                admission_date=date(2024, 4, 1),
                parent_name=student_data["parent"],
                parent_phone=student_data["phone"],
                parent_email=f"parent{i}@example.com",
                address=f"Address {i}, Delhi",
                emergency_contact=student_data["phone"],
                blood_group="O+" if i % 4 == 0 else "A+",
                is_active="Active"
            )
            db.add(student)

        print(f"   ✅ Created {len(students_data)} students")

        # Commit all changes
        db.commit()

        # Print summary
        print("\n🎉 Test data created successfully!")
        print("=" * 60)
        print("📊 SUMMARY:")
        print(f"   👥 Users: {db.query(User).count()}")
        print(f"   🏫 Admins: {db.query(User).filter(User.role == UserRole.ADMIN).count()}")
        print(f"   👨‍🏫 Teachers: {db.query(Teacher).count()}")
        print(f"   🎓 Students: {db.query(Student).count()}")

        print("\n🔑 LOGIN CREDENTIALS:")
        print("   Admin: admin@avm.com / password123")
        print("   Teacher: priya.patel@avm.com / password123")
        print("   Teacher: amit.singh@avm.com / password123")

        print("\n🌐 READY TO TEST:")
        print("   📱 Mobile App: http://localhost:8081")
        print("   🌐 Web App: http://localhost:3000")
        print("   🔗 API Docs: http://localhost:8000/docs")

        return True

    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_test_data()
    if success:
        print("\n✅ Test data creation completed successfully!")
    else:
        print("\n❌ Test data creation failed!")