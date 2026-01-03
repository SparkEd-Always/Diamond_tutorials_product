from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.teacher_attendance import TeacherAttendance, TeacherAttendanceStatus
from app.models.teacher import Teacher
from app.models.user import User
from app.services.activity_service import ActivityService

router = APIRouter()


@router.post("/mark")
async def mark_teacher_attendance(
    attendance_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Mark attendance for teachers (admin only)"""
    try:
        # Validate required fields
        required_fields = ['teacher_records', 'date']
        for field in required_fields:
            if field not in attendance_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )

        attendance_date_str = attendance_data['date']
        teacher_records = attendance_data['teacher_records']

        # Convert date string to date object
        if isinstance(attendance_date_str, str):
            attendance_date = datetime.strptime(attendance_date_str, '%Y-%m-%d').date()
        else:
            attendance_date = attendance_date_str

        created_records = []

        for record in teacher_records:
            # Validate teacher record fields
            if 'teacher_id' not in record or 'status' not in record:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Each teacher record must have teacher_id and status"
                )

            # Check if teacher exists
            teacher = db.query(Teacher).filter(Teacher.id == record['teacher_id']).first()
            if not teacher:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Teacher with ID {record['teacher_id']} not found"
                )

            # Check if attendance already marked for this teacher on this date
            existing_attendance = db.query(TeacherAttendance).filter(
                TeacherAttendance.teacher_id == record['teacher_id'],
                TeacherAttendance.date == attendance_date
            ).first()

            if existing_attendance:
                # Check if attendance is locked
                if existing_attendance.is_locked:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Attendance for {teacher.full_name} on {attendance_date} is locked and cannot be modified"
                    )

                # Update existing record
                existing_attendance.status = TeacherAttendanceStatus(record['status'])
                existing_attendance.remarks = record.get('remarks', '')
                existing_attendance.marked_by_admin_id = current_user.id
                existing_attendance.updated_at = datetime.now()

                # Update check-in/check-out times if provided
                if 'check_in_time' in record and record['check_in_time']:
                    existing_attendance.check_in_time = datetime.fromisoformat(record['check_in_time'])
                if 'check_out_time' in record and record['check_out_time']:
                    existing_attendance.check_out_time = datetime.fromisoformat(record['check_out_time'])

                db.commit()
                db.refresh(existing_attendance)
                created_records.append(existing_attendance)
            else:
                # Parse check-in and check-out times if provided
                check_in_time = None
                check_out_time = None
                if 'check_in_time' in record and record['check_in_time']:
                    check_in_time = datetime.fromisoformat(record['check_in_time'])
                if 'check_out_time' in record and record['check_out_time']:
                    check_out_time = datetime.fromisoformat(record['check_out_time'])

                # Create new attendance record
                new_attendance = TeacherAttendance(
                    teacher_id=record['teacher_id'],
                    date=attendance_date,
                    status=TeacherAttendanceStatus(record['status']),
                    remarks=record.get('remarks', ''),
                    check_in_time=check_in_time,
                    check_out_time=check_out_time,
                    marked_by_admin_id=current_user.id
                )

                db.add(new_attendance)
                db.commit()
                db.refresh(new_attendance)
                created_records.append(new_attendance)

        # Log activity
        try:
            ActivityService.log_activity(
                db=db,
                user_id=current_user.id,
                user_name=current_user.full_name,
                action_type="teacher_attendance_marked",
                description=f"{current_user.full_name} marked attendance for {len(created_records)} teachers",
                entity_type="teacher_attendance",
                entity_id=None,
                metadata={
                    "date": attendance_date.strftime('%Y-%m-%d'),
                    "teacher_count": len(created_records)
                }
            )
        except Exception as e:
            print(f"Error logging activity: {str(e)}")

        return {
            "message": f"Teacher attendance marked successfully for {len(created_records)} teachers",
            "records_created": len(created_records),
            "date": attendance_date.strftime('%Y-%m-%d'),
            "status": "success"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value: {str(e)}"
        )
    except Exception as e:
        import traceback
        print(f"Exception in mark_teacher_attendance: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking teacher attendance: {str(e)}"
        )


@router.get("/date/{attendance_date}")
async def get_teacher_attendance_by_date(
    attendance_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get teacher attendance for a specific date (admin only)"""

    # Get all teachers
    teachers = db.query(Teacher).filter(Teacher.is_active == "Active").all()

    if not teachers:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active teachers found"
        )

    # Get attendance records for the specified date
    attendance_records = db.query(TeacherAttendance).filter(
        TeacherAttendance.date == attendance_date
    ).all()

    # Create a dict for quick lookup
    attendance_dict = {record.teacher_id: record for record in attendance_records}

    # Prepare response with all teachers and their attendance status
    result = []
    for teacher in teachers:
        attendance_record = attendance_dict.get(teacher.id)
        result.append({
            "teacher_id": teacher.id,
            "teacher_name": teacher.full_name,
            "teacher_unique_id": teacher.unique_id,
            "email": teacher.email,
            "phone_number": teacher.phone_number,
            "date": attendance_date,
            "status": attendance_record.status.value if attendance_record else "not_marked",
            "check_in_time": attendance_record.check_in_time.isoformat() if attendance_record and attendance_record.check_in_time else None,
            "check_out_time": attendance_record.check_out_time.isoformat() if attendance_record and attendance_record.check_out_time else None,
            "remarks": attendance_record.remarks if attendance_record else "",
            "marked_at": attendance_record.marked_at.isoformat() if attendance_record else None,
            "is_locked": attendance_record.is_locked if attendance_record else False,
            "locked_at": attendance_record.locked_at.isoformat() if attendance_record and attendance_record.locked_at else None
        })

    return {
        "date": attendance_date,
        "total_teachers": len(teachers),
        "marked_attendance": len(attendance_records),
        "pending_count": len(teachers) - len(attendance_records),
        "teachers": result
    }


@router.get("/teacher/{teacher_id}")
async def get_teacher_attendance_history(
    teacher_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get attendance history for a specific teacher (admin only)"""

    # Verify teacher exists
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with ID {teacher_id} not found"
        )

    query = db.query(TeacherAttendance).filter(TeacherAttendance.teacher_id == teacher_id)

    if start_date:
        query = query.filter(TeacherAttendance.date >= start_date)
    if end_date:
        query = query.filter(TeacherAttendance.date <= end_date)

    records = query.order_by(TeacherAttendance.date.desc()).all()

    result = []
    for record in records:
        marked_by = db.query(User).filter(User.id == record.marked_by_admin_id).first()
        result.append({
            "id": record.id,
            "date": record.date.isoformat(),
            "status": record.status.value,
            "check_in_time": record.check_in_time.isoformat() if record.check_in_time else None,
            "check_out_time": record.check_out_time.isoformat() if record.check_out_time else None,
            "remarks": record.remarks or "",
            "marked_by": marked_by.full_name if marked_by else "Unknown",
            "marked_at": record.marked_at.isoformat()
        })

    return {
        "teacher_id": teacher_id,
        "teacher_name": teacher.full_name,
        "teacher_unique_id": teacher.unique_id,
        "total_records": len(result),
        "records": result
    }


@router.get("/summary")
async def get_teacher_attendance_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get teacher attendance summary statistics (admin only)"""

    # Default to current month if no dates provided
    if not start_date:
        today = date.today()
        start_date = date(today.year, today.month, 1)
    if not end_date:
        end_date = date.today()

    # Get total active teachers
    total_teachers = db.query(Teacher).filter(Teacher.is_active == "Active").count()

    # Get attendance records in date range
    attendance_query = db.query(TeacherAttendance).filter(
        TeacherAttendance.date >= start_date,
        TeacherAttendance.date <= end_date
    )

    total_records = attendance_query.count()

    # Get status breakdown
    status_breakdown = {}
    for status in ["present", "absent", "half_day", "on_leave"]:
        count = attendance_query.filter(
            TeacherAttendance.status == status
        ).count()
        status_breakdown[status] = count

    # Calculate working days (excluding weekends)
    working_days = 0
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() < 5:  # Monday = 0, Friday = 4
            working_days += 1
        current_date += timedelta(days=1)

    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "working_days": working_days
        },
        "totals": {
            "total_teachers": total_teachers,
            "total_records": total_records
        },
        "status_breakdown": status_breakdown,
        "metrics": {
            "average_daily_attendance": round(status_breakdown.get("present", 0) / max(working_days, 1), 2),
            "attendance_rate": round((status_breakdown.get("present", 0) / max(total_records, 1)) * 100, 2) if total_records > 0 else 0
        }
    }


@router.post("/update-remarks")
async def update_teacher_attendance_remarks(
    remarks_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update remarks for a teacher's attendance record (admin only)"""

    # Validate required fields
    if 'teacher_id' not in remarks_data or 'date' not in remarks_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields: teacher_id and date"
        )

    teacher_id = remarks_data['teacher_id']
    attendance_date_str = remarks_data['date']
    remarks = remarks_data.get('remarks', '')

    # Convert date string to date object
    if isinstance(attendance_date_str, str):
        attendance_date = datetime.strptime(attendance_date_str, '%Y-%m-%d').date()
    else:
        attendance_date = attendance_date_str

    # Find the attendance record
    attendance_record = db.query(TeacherAttendance).filter(
        TeacherAttendance.teacher_id == teacher_id,
        TeacherAttendance.date == attendance_date
    ).first()

    if not attendance_record:
        # If no attendance record exists yet, create one with not_marked status
        teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Teacher with ID {teacher_id} not found"
            )

        attendance_record = TeacherAttendance(
            teacher_id=teacher_id,
            date=attendance_date,
            status=TeacherAttendanceStatus.not_marked,
            remarks=remarks,
            marked_by_admin_id=current_user.id
        )
        db.add(attendance_record)
    else:
        # Update existing record's remarks
        attendance_record.remarks = remarks
        attendance_record.updated_at = datetime.now()

    db.commit()
    db.refresh(attendance_record)

    return {
        "message": "Remarks updated successfully",
        "teacher_id": teacher_id,
        "date": attendance_date.strftime('%Y-%m-%d'),
        "remarks": remarks
    }


@router.post("/lock/{attendance_date}")
async def lock_teacher_attendance(
    attendance_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Lock teacher attendance for a specific date to prevent further edits (admin only)"""

    # Get all attendance records for the date
    attendance_records = db.query(TeacherAttendance).filter(
        TeacherAttendance.date == attendance_date
    ).all()

    if not attendance_records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No attendance records found for {attendance_date}"
        )

    # Check if already locked
    already_locked = any(record.is_locked for record in attendance_records)
    if already_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Attendance for {attendance_date} is already locked"
        )

    # Lock all records for this date
    locked_count = 0
    for record in attendance_records:
        record.is_locked = True
        record.locked_at = datetime.now()
        record.locked_by_admin_id = current_user.id
        locked_count += 1

    db.commit()

    # Log activity
    try:
        ActivityService.log_activity(
            db=db,
            user_id=current_user.id,
            user_name=current_user.full_name,
            action_type="teacher_attendance_locked",
            description=f"{current_user.full_name} locked teacher attendance for {attendance_date}",
            entity_type="teacher_attendance",
            entity_id=None,
            metadata={
                "date": attendance_date.strftime('%Y-%m-%d'),
                "locked_records": locked_count
            }
        )
    except Exception as e:
        print(f"Error logging activity: {str(e)}")

    return {
        "message": f"Teacher attendance for {attendance_date} locked successfully",
        "locked_records": locked_count,
        "date": attendance_date.strftime('%Y-%m-%d'),
        "locked_by": current_user.full_name,
        "locked_at": datetime.now().isoformat()
    }


@router.delete("/{attendance_id}")
async def delete_teacher_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a teacher attendance record (admin only)"""

    attendance = db.query(TeacherAttendance).filter(TeacherAttendance.id == attendance_id).first()

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher attendance record with ID {attendance_id} not found"
        )

    # Check if attendance is locked
    if attendance.is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot delete locked attendance record for {attendance.date}"
        )

    db.delete(attendance)
    db.commit()

    return {"message": "Teacher attendance record deleted successfully"}
