"""
Create test students with specific parent phone numbers
"""
from app.core.database import SessionLocal
from app.models.student import Student
from datetime import date

def create_students():
    db = SessionLocal()

    # Parent phone numbers
    parent_phones = [
        "+919986660025",
        "+918105198350",
        "+918123001495"
    ]

    students_data = [
        {
            "unique_id": "AVM-STU-001",
            "first_name": "Rahul",
            "last_name": "Sharma",
            "full_name": "Rahul Sharma",
            "class_name": "Class 7",
            "section": "A",
            "roll_number": "7A01",
            "parent_name": "Mr. Sharma",
            "parent_phone": parent_phones[0],
            "parent_email": "sharma@example.com"
        },
        {
            "unique_id": "AVM-STU-002",
            "first_name": "Priya",
            "last_name": "Patel",
            "full_name": "Priya Patel",
            "class_name": "Class 8",
            "section": "B",
            "roll_number": "8B02",
            "parent_name": "Mrs. Patel",
            "parent_phone": parent_phones[1],
            "parent_email": "patel@example.com"
        },
        {
            "unique_id": "AVM-STU-003",
            "first_name": "Arjun",
            "last_name": "Kumar",
            "full_name": "Arjun Kumar",
            "class_name": "Class 9",
            "section": "A",
            "roll_number": "9A03",
            "parent_name": "Mr. Kumar",
            "parent_phone": parent_phones[2],
            "parent_email": "kumar@example.com"
        }
    ]

    # Clear existing students
    db.query(Student).delete()
    db.commit()

    # Create new students
    for data in students_data:
        student = Student(
            unique_id=data["unique_id"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            full_name=data["full_name"],
            date_of_birth=date(2010, 1, 1),
            gender="Male" if data["first_name"] in ["Rahul", "Arjun"] else "Female",
            class_name=data["class_name"],
            section=data["section"],
            roll_number=data["roll_number"],
            admission_date=date.today(),
            parent_name=data["parent_name"],
            parent_phone=data["parent_phone"],
            parent_email=data["parent_email"],
            address="Test Address, Bangalore",
            emergency_contact=data["parent_phone"],
            blood_group="O+",
            is_active="Active"
        )
        db.add(student)

    db.commit()

    # Verify
    students = db.query(Student).all()
    print(f"\n✅ Created {len(students)} students:")
    for s in students:
        print(f"   {s.unique_id} - {s.full_name} - {s.class_name} - Parent: {s.parent_phone}")

    db.close()

if __name__ == "__main__":
    create_students()
