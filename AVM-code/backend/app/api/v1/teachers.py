from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.teacher import Teacher
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_teachers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all teachers (admin only)"""
    teachers = db.query(Teacher).filter(Teacher.is_active == "Active").all()
    return [
        {
            "id": teacher.id,
            "unique_id": teacher.unique_id,
            "first_name": teacher.first_name,
            "last_name": teacher.last_name,
            "full_name": teacher.full_name,
            "email": teacher.email,
            "phone_number": teacher.phone_number,
            "subjects": teacher.subjects,
            "classes_assigned": teacher.classes_assigned,
            "qualification": teacher.qualification,
            "experience_years": teacher.experience_years,
            "address": teacher.address,
            "emergency_contact": teacher.emergency_contact
        }
        for teacher in teachers
    ]

@router.get("/{teacher_id}")
async def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get teacher by ID"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.post("/")
async def create_teacher(
    teacher_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new teacher (admin only)"""
    try:
        # Generate unique_id
        last_teacher = db.query(Teacher).order_by(Teacher.id.desc()).first()
        next_id = (last_teacher.id + 1) if last_teacher else 1
        unique_id = f"AVM-TCH-{next_id:03d}"

        teacher = Teacher(
            unique_id=unique_id,
            first_name=teacher_data['first_name'],
            last_name=teacher_data['last_name'],
            full_name=teacher_data['full_name'],
            email=teacher_data.get('email'),  # Optional field
            phone_number=teacher_data['phone_number'],
            subjects=teacher_data.get('subjects', []),
            classes_assigned=teacher_data.get('classes_assigned', []),
            qualification=teacher_data.get('qualification', ''),
            experience_years=teacher_data.get('experience_years', 0),
            address=teacher_data.get('address', ''),
            emergency_contact=teacher_data.get('emergency_contact', ''),
            is_active='Active'
        )
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
        return teacher
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{teacher_id}")
async def update_teacher(
    teacher_id: int,
    teacher_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update teacher (admin only)"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    try:
        # Update fields
        if 'first_name' in teacher_data:
            teacher.first_name = teacher_data['first_name']
        if 'last_name' in teacher_data:
            teacher.last_name = teacher_data['last_name']
        if 'full_name' in teacher_data:
            teacher.full_name = teacher_data['full_name']
        if 'email' in teacher_data:
            teacher.email = teacher_data['email']
        if 'phone_number' in teacher_data:
            teacher.phone_number = teacher_data['phone_number']
        if 'subjects' in teacher_data:
            teacher.subjects = teacher_data['subjects']
        if 'classes_assigned' in teacher_data:
            teacher.classes_assigned = teacher_data['classes_assigned']
        if 'qualification' in teacher_data:
            teacher.qualification = teacher_data['qualification']
        if 'experience_years' in teacher_data:
            teacher.experience_years = teacher_data['experience_years']
        if 'address' in teacher_data:
            teacher.address = teacher_data['address']
        if 'emergency_contact' in teacher_data:
            teacher.emergency_contact = teacher_data['emergency_contact']

        db.commit()
        db.refresh(teacher)
        return teacher
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/clear-all")
async def clear_all_teachers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Clear all teacher data and user accounts (admin only) - USE WITH CAUTION"""
    from app.models.user import User, UserRole

    teacher_count = db.query(Teacher).count()
    user_count = db.query(User).filter(User.role == UserRole.TEACHER).count()

    # Delete all teacher user accounts
    db.query(User).filter(User.role == UserRole.TEACHER).delete()

    # Delete all teachers
    db.query(Teacher).delete()

    db.commit()
    return {
        "message": f"Cleared all {teacher_count} teachers and {user_count} teacher user accounts from database",
        "deleted_teachers": teacher_count,
        "deleted_users": user_count
    }

@router.post("/delete-multiple")
async def delete_multiple_teachers(
    teacher_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete multiple teachers and their user accounts (admin only)"""
    from app.models.attendance import Attendance
    from app.models.communication import Communication
    from app.models.user import User, UserRole

    try:
        deleted_count = 0
        total_attendance = 0
        total_communications = 0

        for teacher_id in teacher_ids:
            teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
            if teacher:
                # Delete attendance records
                att_count = db.query(Attendance).filter(Attendance.teacher_id == teacher_id).count()
                db.query(Attendance).filter(Attendance.teacher_id == teacher_id).delete(synchronize_session=False)
                total_attendance += att_count

                # Delete communications sent by this teacher
                comm_count = db.query(Communication).filter(Communication.sender_id == teacher_id).count()
                db.query(Communication).filter(Communication.sender_id == teacher_id).delete(synchronize_session=False)
                total_communications += comm_count

                # Also delete associated user account
                user = db.query(User).filter(User.email == teacher.email, User.role == UserRole.TEACHER).first()
                if user:
                    db.delete(user)

                db.delete(teacher)
                deleted_count += 1

        db.commit()
        return {
            "message": f"Deleted {deleted_count} teachers successfully",
            "deleted_count": deleted_count,
            "attendance_records_deleted": total_attendance,
            "communications_deleted": total_communications
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete teachers: {str(e)}")

@router.delete("/{teacher_id}")
async def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete teacher and associated user account (admin only)"""
    from app.models.attendance import Attendance
    from app.models.communication import Communication
    from app.models.user import User, UserRole

    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    try:
        # Delete all attendance records marked by this teacher
        attendance_count = db.query(Attendance).filter(Attendance.teacher_id == teacher_id).count()
        db.query(Attendance).filter(Attendance.teacher_id == teacher_id).delete(synchronize_session=False)

        # Delete all communications sent by this teacher
        # First need to find the user ID for the teacher
        user = db.query(User).filter(User.email == teacher.email, User.role == UserRole.TEACHER).first()
        comm_count = 0
        if user:
            comm_count = db.query(Communication).filter(Communication.sender_id == user.id).count()
            db.query(Communication).filter(Communication.sender_id == user.id).delete(synchronize_session=False)
            # Delete user account
            db.delete(user)

        # Delete teacher
        db.delete(teacher)
        db.commit()

        return {
            "message": f"Teacher {teacher.full_name} deleted successfully",
            "attendance_records_deleted": attendance_count,
            "communications_deleted": comm_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete teacher: {str(e)}")
