"""
Generate Dummy Students for Testing
Creates realistic test student data across different classes
"""
import sys
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.student import Student
from app.models.parent import Parent, StudentParentRelationship
import random

# Indian names for realistic test data
FIRST_NAMES_MALE = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Arnav", "Ayaan", "Krishna",
    "Ishaan", "Shaurya", "Atharv", "Advik", "Pranav", "Reyansh", "Kabir",
    "Dhruv", "Aryan", "Vihaan", "Aadi", "Kartik", "Rudra", "Aarush", "Hrithik",
    "Rishi", "Vedant", "Nirav", "Rohan", "Rahul", "Amit", "Vikas"
]

FIRST_NAMES_FEMALE = [
    "Saanvi", "Aadhya", "Kiara", "Diya", "Pihu", "Ananya", "Aanya", "Ira",
    "Navya", "Myra", "Sara", "Zara", "Anika", "Ishita", "Riya", "Prisha",
    "Avni", "Tara", "Mira", "Kavya", "Aditi", "Naina", "Shreya", "Anushka",
    "Simran", "Tanvi", "Pooja", "Meera", "Sanya", "Divya"
]

LAST_NAMES = [
    "Sharma", "Verma", "Singh", "Kumar", "Patel", "Gupta", "Reddy", "Rao",
    "Nair", "Iyer", "Menon", "Pillai", "Joshi", "Desai", "Shah", "Mehta",
    "Agarwal", "Bansal", "Chopra", "Malhotra", "Kapoor", "Khan", "Ali",
    "Chaudhary", "Yadav", "Pandey", "Mishra", "Tiwari", "Sinha", "Das"
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def generate_phone():
    """Generate Indian phone number"""
    return f"9{random.randint(100000000, 999999999)}"

def generate_email(first_name, last_name):
    """Generate email address"""
    domains = ["gmail.com", "yahoo.com", "outlook.com", "rediffmail.com"]
    return f"{first_name.lower()}.{last_name.lower()}@{random.choice(domains)}"

def calculate_age_from_class(class_id):
    """Calculate appropriate age based on class"""
    # Class 1 = age 6, Class 2 = age 7, etc.
    # Pre-KG = 3, LKG = 4, UKG = 5
    age_map = {
        1: 3,   # Pre-KG
        2: 4,   # LKG
        3: 5,   # UKG
        4: 6,   # Class 1
        5: 7,   # Class 2
        6: 8,   # Class 3
        7: 9,   # Class 4
        8: 10,  # Class 5
        9: 11,  # Class 6
        10: 12, # Class 7
        11: 13, # Class 8
        12: 14, # Class 9
        13: 15, # Class 10
    }
    base_age = age_map.get(class_id, 10)
    # Add some variation (+/- 1 year)
    return base_age + random.choice([-1, 0, 1])

def generate_date_of_birth(age):
    """Generate date of birth based on age"""
    today = date.today()
    birth_year = today.year - age
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)  # Safe for all months
    return date(birth_year, birth_month, birth_day)

def generate_admission_number(index):
    """Generate admission number"""
    year = datetime.now().year
    return f"ADM{year}{index:04d}"

def generate_roll_number(class_id, index_in_class):
    """Generate roll number"""
    return f"R{class_id:02d}{index_in_class:03d}"

def create_dummy_students(count=50):
    """Create dummy students across all classes"""
    db = SessionLocal()

    try:
        # Get all classes
        classes = db.query(Class).filter(Class.is_active == True).all()

        if not classes:
            print("❌ No classes found! Please create classes first.")
            return

        print(f"📚 Found {len(classes)} classes")
        print(f"🎯 Creating {count} dummy students...\n")

        # Distribute students across classes
        students_per_class = count // len(classes)
        extra_students = count % len(classes)

        admission_counter = 1
        created_count = 0

        for class_idx, cls in enumerate(classes):
            # Calculate how many students for this class
            num_students = students_per_class
            if class_idx < extra_students:
                num_students += 1

            print(f"📝 Creating {num_students} students for {cls.class_name}...")

            for i in range(num_students):
                # Random gender
                gender = random.choice(["male", "female"])
                first_name = random.choice(FIRST_NAMES_MALE if gender == "male" else FIRST_NAMES_FEMALE)
                last_name = random.choice(LAST_NAMES)

                # Calculate age and DOB
                age = calculate_age_from_class(cls.id)
                dob = generate_date_of_birth(age)

                # Admission date (sometime in the current academic year)
                admission_date = date(2024, random.randint(4, 7), random.randint(1, 28))

                # Create student
                student = Student(
                    first_name=first_name,
                    last_name=last_name,
                    date_of_birth=dob,
                    gender=gender,
                    blood_group=random.choice(BLOOD_GROUPS),
                    nationality="Indian",
                    religion=random.choice(["Hindu", "Muslim", "Christian", "Sikh", "Other"]),
                    category=random.choice(["General", "OBC", "SC", "ST"]),

                    # Contact
                    email=generate_email(first_name, last_name),
                    phone=generate_phone(),

                    # Current Address
                    current_address_line1=f"{random.randint(1, 999)} {random.choice(['MG Road', 'Brigade Road', 'Residency Road', 'Cunningham Road', 'Indiranagar'])}",
                    current_city="Bangalore",
                    current_state="Karnataka",
                    current_pincode=f"5600{random.randint(10, 99)}",
                    current_country="India",

                    # Academic
                    current_class_id=cls.id,
                    current_section=random.choice(["A", "B", "C"]) if cls.id > 3 else None,
                    admission_number=generate_admission_number(admission_counter),
                    admission_date=admission_date,
                    roll_number=generate_roll_number(cls.id, i + 1),

                    # Status
                    status="active",
                    is_active=True,

                    # Medical
                    has_allergies=random.choice([True, False]),
                    allergies="Peanuts, Dust" if random.choice([True, False]) else None,
                    has_medical_conditions=random.choice([True, False]),
                    medical_conditions="Asthma" if random.choice([True, False, False]) else None,

                    # Transport
                    transport_required=random.choice([True, False]),

                    # Profile completeness
                    profile_completeness=random.randint(75, 100),
                )

                db.add(student)
                db.flush()  # Get the student ID

                # Create parent/guardian
                parent_first_name = random.choice(FIRST_NAMES_MALE if random.choice([True, False]) else FIRST_NAMES_FEMALE)
                parent_last_name = last_name  # Same surname

                parent = Parent(
                    first_name=parent_first_name,
                    last_name=parent_last_name,
                    email=generate_email(parent_first_name, parent_last_name),
                    phone=generate_phone(),
                    relationship=random.choice(["father", "mother"]),
                    occupation=random.choice(["Engineer", "Doctor", "Teacher", "Business", "Government Service"]),
                    annual_income=Decimal(random.randint(500000, 2000000)),
                    is_primary_contact=True,
                    is_emergency_contact=True,
                    can_pickup_student=True,
                    receive_communications=True,
                )

                db.add(parent)
                db.flush()

                # Link parent to student
                relationship = StudentParentRelationship(
                    student_id=student.id,
                    parent_id=parent.id,
                    relationship_type=parent.relationship,
                    is_primary=True,
                    is_guardian=True,
                    lives_with_student=True,
                )

                db.add(relationship)

                admission_counter += 1
                created_count += 1

            print(f"   ✅ Created {num_students} students for {cls.class_name}")

        # Commit all changes
        db.commit()

        print(f"\n✨ Successfully created {created_count} students with parents!")
        print(f"\n📊 Student Distribution:")

        # Show distribution
        for cls in classes:
            count = db.query(Student).filter(Student.current_class_id == cls.id).count()
            print(f"   {cls.class_name}: {count} students")

        print(f"\n🎉 Database ready for testing!")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Get count from command line or use default
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 50

    print("=" * 60)
    print("🎓 DUMMY STUDENT GENERATOR")
    print("=" * 60)
    print(f"📝 Generating {count} students...\n")

    create_dummy_students(count)
