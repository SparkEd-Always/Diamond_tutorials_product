from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Union
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_teacher_user, get_current_mobile_user
from app.models.student import Student
from app.models.user import User
from app.models.teacher import Teacher
from app.models.parent import Parent

router = APIRouter()

@router.get("/classes", response_model=List[str])
async def get_classes(
    db: Session = Depends(get_db),
    current_user: Union[User, Teacher, Parent] = Depends(get_current_mobile_user)
):
    """Get distinct classes from students (mobile app: teachers and admins only)"""
    # Query distinct class names from active students
    classes = db.query(Student.class_name).filter(
        Student.is_active == "Active",
        Student.class_name.isnot(None)
    ).distinct().order_by(Student.class_name).all()

    # Return simple list of class names
    return [
        class_name[0]
        for class_name in classes
        if class_name[0]  # Filter out any None values
    ]

@router.get("/", response_model=List[dict])
async def get_students(
    db: Session = Depends(get_db),
    current_user: Union[User, Teacher, Parent] = Depends(get_current_mobile_user)
):
    """Get all students (mobile app: teachers and admins only)"""
    # Return all students for admins and teachers
    students = db.query(Student).filter(Student.is_active == "Active").all()
    return [
        {
            "id": student.id,
            "unique_id": student.unique_id,
            "full_name": student.full_name,
            "class_name": student.class_name,
            "section": student.section,
            "parent_phone": student.parent_phone,
            "parent_name": student.parent_name
        }
        for student in students
    ]

@router.get("/{student_id}")
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Get student by ID"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/")
async def create_student(
    student_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create new student (admin only)"""
    try:
        # Generate unique_id
        last_student = db.query(Student).order_by(Student.id.desc()).first()
        next_id = (last_student.id + 1) if last_student else 1
        unique_id = f"AVM-STU-{next_id:03d}"

        # Split full_name into first_name and last_name
        full_name = student_data['full_name']
        name_parts = full_name.strip().split(maxsplit=1)
        first_name = name_parts[0] if name_parts else full_name
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        student = Student(
            unique_id=unique_id,
            first_name=first_name,
            last_name=last_name,
            full_name=full_name,
            class_name=student_data['class_name'],
            section=student_data.get('section', 'A'),
            parent_phone=student_data['parent_phone'],
            parent_name=student_data['parent_name'],
            is_active='Active'
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        return student
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{student_id}")
async def update_student(
    student_id: int,
    student_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update student (admin only)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    try:
        # Update fields
        if 'full_name' in student_data:
            student.full_name = student_data['full_name']
        if 'class_name' in student_data:
            student.class_name = student_data['class_name']
        if 'section' in student_data:
            student.section = student_data['section']
        if 'parent_name' in student_data:
            student.parent_name = student_data['parent_name']
        if 'parent_phone' in student_data:
            student.parent_phone = student_data['parent_phone']

        db.commit()
        db.refresh(student)
        return student
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/clear-all")
async def clear_all_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Clear all student data (admin only) - USE WITH CAUTION"""
    count = db.query(Student).count()
    db.query(Student).delete()
    db.commit()
    return {"message": f"Cleared all {count} students from database", "deleted_count": count}

@router.post("/delete-multiple")
async def delete_multiple_students(
    student_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete multiple students (admin only)"""
    from app.models.attendance import Attendance
    from app.models.communication import Communication

    try:
        deleted_count = 0
        total_attendance = 0
        total_communications = 0
        parent_phones_to_check = set()  # Track unique parent phones
        parents_deleted = 0

        for student_id in student_ids:
            student = db.query(Student).filter(Student.id == student_id).first()
            if student:
                # Store parent phone for later cleanup check
                if student.parent_phone:
                    parent_phones_to_check.add(student.parent_phone)

                # Delete related records
                att_count = db.query(Attendance).filter(Attendance.student_id == student_id).count()
                db.query(Attendance).filter(Attendance.student_id == student_id).delete(synchronize_session=False)
                total_attendance += att_count

                comm_count = db.query(Communication).filter(Communication.student_id == student_id).count()
                db.query(Communication).filter(Communication.student_id == student_id).delete(synchronize_session=False)
                total_communications += comm_count

                db.delete(student)
                deleted_count += 1

        db.flush()  # Flush deletions before checking for orphaned parents

        # Check and delete orphaned parents
        for parent_phone in parent_phones_to_check:
            phone_without_prefix = parent_phone.replace('+91', '') if parent_phone.startswith('+91') else parent_phone
            phone_with_prefix = f"+91{phone_without_prefix}" if not parent_phone.startswith('+91') else parent_phone

            # Check if any other active students share this parent's phone
            other_students = db.query(Student).filter(
                or_(
                    Student.parent_phone == parent_phone,
                    Student.parent_phone == phone_with_prefix,
                    Student.parent_phone == phone_without_prefix
                ),
                Student.is_active == "Active"
            ).count()

            # If no other students, delete the parent
            if other_students == 0:
                parent = db.query(Parent).filter(
                    or_(
                        Parent.phone_number == parent_phone,
                        Parent.phone_number == phone_with_prefix,
                        Parent.phone_number == phone_without_prefix
                    )
                ).first()

                if parent:
                    # Delete parent's messages
                    db.query(Communication).filter(
                        Communication.recipient_type == "parent",
                        Communication.recipient_id == parent.id
                    ).delete(synchronize_session=False)

                    db.delete(parent)
                    parents_deleted += 1
                    print(f"✅ Deleted orphaned parent: {parent.name} ({parent.phone_number})")

        db.commit()

        response = {
            "message": f"Deleted {deleted_count} students successfully",
            "deleted_count": deleted_count,
            "attendance_records_deleted": total_attendance,
            "communications_deleted": total_communications,
            "parents_deleted": parents_deleted
        }

        if parents_deleted > 0:
            response["parent_cleanup"] = f"{parents_deleted} orphaned parent(s) removed"

        return response

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete students: {str(e)}")

@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete student (admin only)"""
    from app.models.attendance import Attendance
    from app.models.communication import Communication
    from app.models.parent import Parent

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    try:
        # Store parent phone for cleanup check
        parent_phone = student.parent_phone
        parent_deleted = False

        # Delete all attendance records for this student
        attendance_count = db.query(Attendance).filter(Attendance.student_id == student_id).count()
        db.query(Attendance).filter(Attendance.student_id == student_id).delete(synchronize_session=False)

        # Delete all communications for this student
        comm_count = db.query(Communication).filter(Communication.student_id == student_id).count()
        db.query(Communication).filter(Communication.student_id == student_id).delete(synchronize_session=False)

        # Delete student
        db.delete(student)
        db.flush()  # Flush to ensure student is deleted before checking orphans

        # Check if parent has any other children (normalize phone number)
        if parent_phone:
            phone_without_prefix = parent_phone.replace('+91', '') if parent_phone.startswith('+91') else parent_phone
            phone_with_prefix = f"+91{phone_without_prefix}" if not parent_phone.startswith('+91') else parent_phone

            # Check if any other active students share this parent's phone
            other_students = db.query(Student).filter(
                or_(
                    Student.parent_phone == parent_phone,
                    Student.parent_phone == phone_with_prefix,
                    Student.parent_phone == phone_without_prefix
                ),
                Student.is_active == "Active"
            ).count()

            # If no other students, delete the parent from parent table
            if other_students == 0:
                parent = db.query(Parent).filter(
                    or_(
                        Parent.phone_number == parent_phone,
                        Parent.phone_number == phone_with_prefix,
                        Parent.phone_number == phone_without_prefix
                    )
                ).first()

                if parent:
                    # Also delete parent's messages
                    parent_msg_count = db.query(Communication).filter(
                        Communication.recipient_type == "parent",
                        Communication.recipient_id == parent.id
                    ).count()
                    db.query(Communication).filter(
                        Communication.recipient_type == "parent",
                        Communication.recipient_id == parent.id
                    ).delete(synchronize_session=False)

                    db.delete(parent)
                    parent_deleted = True
                    print(f"✅ Deleted orphaned parent: {parent.name} ({parent.phone_number})")

        db.commit()

        response = {
            "message": f"Student {student.full_name} deleted successfully",
            "attendance_records_deleted": attendance_count,
            "communications_deleted": comm_count,
            "parent_deleted": parent_deleted
        }

        if parent_deleted:
            response["parent_cleanup"] = "Parent had no other children and was removed"

        return response

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete student: {str(e)}")