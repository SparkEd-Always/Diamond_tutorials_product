"""
Generate Dummy Enrolled Students for Fee Sessions Testing
Creates students in the admission database for testing fee sessions
"""
import sys
from datetime import date, datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.student import Student
from app.models.academic import Class
import random

# Indian names
FIRST_NAMES_MALE = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Arnav", "Ayaan", "Krishna",
    "Ishaan", "Shaurya", "Atharv", "Advik", "Pranav", "Reyansh", "Kabir",
    "Dhruv", "Aryan", "Vihaan", "Aadi", "Kartik", "Rudra", "Aarush", "Hrithik"
]

FIRST_NAMES_FEMALE = [
    "Saanvi", "Aadhya", "Kiara", "Diya", "Pihu", "Ananya", "Aanya", "Ira",
    "Navya", "Myra", "Sara", "Zara", "Anika", "Ishita", "Riya", "Prisha",
    "Avni", "Tara", "Mira", "Kavya", "Aditi", "Naina", "Shreya", "Anushka"
]

LAST_NAMES = [
    "Sharma", "Verma", "Singh", "Kumar", "Patel", "Gupta", "Reddy", "Rao",
    "Nair", "Iyer", "Menon", "Pillai", "Joshi", "Desai", "Shah", "Mehta",
    "Agarwal", "Bansal", "Chopra", "Malhotra", "Kapoor", "Khan"
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def generate_phone():
    return f"9{random.randint(100000000, 999999999)}"

def generate_admission_number(index):
    year = datetime.now().year
    return f"STU{year}{index:04d}"

def calculate_age_from_class_order(class_order):
    """Calculate age: Pre-KG=3, LKG=4, UKG=5, Class1=6, etc."""
    base_ages = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    if class_order < len(base_ages):
        return base_ages[class_order] + random.choice([0, 1])
    return 10

def generate_date_of_birth(age):
    today = date.today()
    birth_year = today.year - age
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)
    return date(birth_year, birth_month, birth_day)

def create_enrolled_students(count=50):
    """Create enrolled students for fee testing"""
    db = SessionLocal()

    try:
        # Get all classes
        classes = db.query(Class).filter(Class.is_active == True).order_by(Class.class_order).all()

        if not classes:
            print("ERROR: No classes found!")
            return

        print(f"Found {len(classes)} classes")
        print(f"Creating {count} enrolled students...\n")

        # Clear existing students (optional - comment out if you want to keep existing)
        # db.query(Student).delete()
        # print("Cleared existing students\n")

        # Distribute students
        students_per_class = max(1, count // len(classes))

        admission_counter = 1
        created_count = 0

        for cls in classes:
            print(f"Creating {students_per_class} students for {cls.class_name}...")

            for i in range(students_per_class):
                # Random name and gender
                gender = random.choice(["male", "female"])
                names = FIRST_NAMES_MALE if gender == "male" else FIRST_NAMES_FEMALE
                first_name = random.choice(names)
                last_name = random.choice(LAST_NAMES)
                full_name = f"{first_name} {last_name}"

                # Age and DOB
                age = calculate_age_from_class_order(cls.class_order)
                dob = generate_date_of_birth(age)

                # Create student
                student = Student(
                    student_id=f"S{admission_counter:05d}",
                    admission_number=generate_admission_number(admission_counter),
                    first_name=first_name,
                    last_name=last_name,
                    blood_group=random.choice(BLOOD_GROUPS),
                    current_class_id=cls.id,
                    roll_number=f"R{cls.id:02d}{i+1:03d}",
                    status="enrolled",  # Key status for fee sessions
                    is_active=True,

                    # Emergency
                    emergency_contact_name=f"{random.choice(FIRST_NAMES_MALE)} {last_name}",
                    emergency_contact_phone=generate_phone(),

                    # Other
                    transport_required=random.choice([True, False]),
                    medical_conditions=None,
                )

                db.add(student)
                admission_counter += 1
                created_count += 1

            db.commit()
            print(f"   Created {students_per_class} students")

        print(f"\nSuccessfully created {created_count} enrolled students!")
        print(f"\nStudent Distribution:")

        for cls in classes:
            count = db.query(Student).filter(Student.current_class_id == cls.id).count()
            print(f"   {cls.class_name}: {count} students")

        print(f"\nReady for Fee Sessions testing!")

    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 50

    print("=" * 60)
    print("ENROLLED STUDENT GENERATOR")
    print("=" * 60)
    print(f"Generating {count} enrolled students for fee testing...\n")

    create_enrolled_students(count)
