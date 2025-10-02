from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_teacher_user
from app.models.student import Student
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Get all students (teachers and admins only)"""
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
    deleted_count = 0
    for student_id in student_ids:
        student = db.query(Student).filter(Student.id == student_id).first()
        if student:
            db.delete(student)
            deleted_count += 1

    db.commit()
    return {"message": f"Deleted {deleted_count} students successfully", "deleted_count": deleted_count}

@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete student (admin only)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"message": f"Student {student.full_name} deleted successfully"}