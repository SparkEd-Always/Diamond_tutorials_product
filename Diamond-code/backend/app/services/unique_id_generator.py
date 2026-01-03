from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.teacher import Teacher

class UniqueIdGenerator:
    @staticmethod
    def generate_student_id(db: Session) -> str:
        """Generate unique ID for student: Diamond-STU-001, Diamond-STU-002, etc."""
        last_student = db.query(Student).order_by(Student.id.desc()).first()
        if last_student and last_student.unique_id:
            # Extract number from last ID (Diamond-STU-001 -> 001)
            last_number = int(last_student.unique_id.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1

        return f"Diamond-STU-{new_number:03d}"

    @staticmethod
    def generate_teacher_id(db: Session) -> str:
        """Generate unique ID for teacher: Diamond-TCH-001, Diamond-TCH-002, etc."""
        last_teacher = db.query(Teacher).order_by(Teacher.id.desc()).first()
        if last_teacher and last_teacher.unique_id:
            last_number = int(last_teacher.unique_id.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1

        return f"Diamond-TCH-{new_number:03d}"

    @staticmethod
    def generate_admin_id(db: Session) -> str:
        """Generate unique ID for admin: Diamond-ADM-001, Diamond-ADM-002, etc."""
        last_admin = db.query(User).filter(User.role == UserRole.ADMIN).order_by(User.id.desc()).first()
        if last_admin and last_admin.unique_id:
            last_number = int(last_admin.unique_id.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1

        return f"Diamond-ADM-{new_number:03d}"

    @staticmethod
    def generate_user_id(role: UserRole, db: Session) -> str:
        """Generate unique ID based on user role"""
        if role == UserRole.ADMIN:
            return UniqueIdGenerator.generate_admin_id(db)
        elif role == UserRole.TEACHER:
            return UniqueIdGenerator.generate_teacher_id(db)
        elif role == UserRole.STUDENT:
            return UniqueIdGenerator.generate_student_id(db)
        elif role == UserRole.PARENT:
            # Parent IDs are based on student ID they're associated with
            return f"Diamond-PAR-{db.query(User).filter(User.role == UserRole.PARENT).count() + 1:03d}"
        else:
            raise ValueError(f"Invalid role: {role}")