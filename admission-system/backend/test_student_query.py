"""
Test student query to debug enum issue
"""

from app.core.database import SessionLocal
from app.models.student import Student
from app.models.academic import Class

def test_student_query():
    """Test querying students with enum status"""
    db = SessionLocal()

    try:
        print("Testing student query with enum fix...")

        # Test 1: Query all students
        print("\n1. Querying all students...")
        students = db.query(Student).limit(5).all()
        print(f"Found {len(students)} students")
        for s in students:
            print(f"  ID: {s.id}, Status: {s.status}, Status type: {type(s.status)}")

        # Test 2: Query students with class
        print("\n2. Querying students with class...")
        query = db.query(Student, Class).join(
            Class, Student.current_class_id == Class.id
        ).filter(Student.is_active == True)

        students_with_class = query.limit(5).all()
        print(f"Found {len(students_with_class)} students with class")
        for student, class_info in students_with_class:
            print(f"  Student: {student.first_name} {student.last_name}, Class: {class_info.class_name}, Status: {student.status}")

        # Test 3: Filter by class_id = 4
        print("\n3. Filtering by class_id = 4...")
        query = db.query(Student, Class).join(
            Class, Student.current_class_id == Class.id
        ).filter(Student.is_active == True).filter(Student.current_class_id == 4)

        students_in_class_4 = query.all()
        print(f"Found {len(students_in_class_4)} students in class 4")
        for student, class_info in students_in_class_4:
            print(f"  Student: {student.first_name} {student.last_name}, Status: {student.status}")

        print("\n✓ All tests passed!")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_student_query()
