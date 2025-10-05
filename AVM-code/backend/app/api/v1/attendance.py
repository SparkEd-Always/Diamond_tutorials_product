from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta
from sqlalchemy import text
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_teacher_user
from app.models.attendance import Attendance, AttendanceStatus
from app.models.student import Student
from app.models.user import User
from app.models.teacher import Teacher
from app.services.activity_service import ActivityService

router = APIRouter()


class ApproveAttendanceRequest(BaseModel):
    attendance_ids: List[int]

@router.post("/mark")
async def mark_attendance(
    attendance_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Mark attendance for students (teachers only)"""
    try:
        # Validate required fields
        required_fields = ['student_records', 'date']
        for field in required_fields:
            if field not in attendance_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )

        attendance_date_str = attendance_data['date']
        student_records = attendance_data['student_records']
        is_draft = attendance_data.get('is_draft', False)  # Get draft flag

        # Convert date string to date object
        from datetime import datetime as dt
        if isinstance(attendance_date_str, str):
            attendance_date = dt.strptime(attendance_date_str, '%Y-%m-%d').date()
        else:
            attendance_date = attendance_date_str

        # Get the Teacher record for the logged-in user
        teacher = db.query(Teacher).filter(Teacher.email == current_user.email).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Teacher record not found for user {current_user.email}"
            )

        created_records = []

        for record in student_records:
            # Validate student record fields
            if 'student_id' not in record or 'status' not in record:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Each student record must have student_id and status"
                )

            # Check if student exists
            student = db.query(Student).filter(Student.id == record['student_id']).first()
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Student with ID {record['student_id']} not found"
                )

            # Check if attendance already marked for this student on this date
            existing_attendance = db.query(Attendance).filter(
                Attendance.student_id == record['student_id'],
                Attendance.date == attendance_date
            ).first()

            if existing_attendance:
                # Check if already submitted for approval - prevent editing if locked
                if existing_attendance.submitted_for_approval:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Attendance for {student.full_name} has been submitted for approval and cannot be edited"
                    )

                # Update existing record
                existing_attendance.status = AttendanceStatus(record['status'])
                existing_attendance.remarks = record.get('remarks', '')
                existing_attendance.teacher_id = teacher.id
                existing_attendance.is_draft = is_draft

                # If submitting for approval, set the flags
                if not is_draft:
                    existing_attendance.submitted_for_approval = True
                    existing_attendance.submitted_at = datetime.now()

                db.commit()
                db.refresh(existing_attendance)
                created_records.append(existing_attendance)
            else:
                # Create new attendance record
                new_attendance = Attendance(
                    student_id=record['student_id'],
                    date=attendance_date,
                    status=AttendanceStatus(record['status']),
                    remarks=record.get('remarks', ''),
                    teacher_id=teacher.id,
                    is_draft=is_draft,
                    submitted_for_approval=not is_draft,  # If not draft, then submitted
                    submitted_at=datetime.now() if not is_draft else None,
                    admin_approved=False  # Requires admin approval
                )

                db.add(new_attendance)
                db.commit()
                db.refresh(new_attendance)
                created_records.append(new_attendance)

        # Log activity for submitted attendance (not drafts)
        if not is_draft:
            try:
                ActivityService.log_activity(
                    db=db,
                    user_id=current_user.id,
                    user_name=current_user.full_name,
                    action_type="attendance_marked",
                    description=f"{current_user.full_name} submitted attendance for {len(created_records)} students",
                    entity_type="attendance",
                    entity_id=None,
                    metadata={
                        "date": attendance_date.strftime('%Y-%m-%d'),
                        "student_count": len(created_records)
                    }
                )
            except Exception as e:
                print(f"Error logging activity: {str(e)}")
                # Don't fail attendance submission if activity logging fails

        status_message = "saved as draft" if is_draft else "submitted for approval"
        return {
            "message": f"Attendance {status_message} successfully for {len(created_records)} students",
            "records_created": len(created_records),
            "date": attendance_date.strftime('%Y-%m-%d') if hasattr(attendance_date, 'strftime') else str(attendance_date),
            "status": "draft" if is_draft else "pending_admin_approval"
        }

    except ValueError as e:
        print(f"ValueError in mark_attendance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value: {str(e)}"
        )
    except Exception as e:
        import traceback
        print(f"Exception in mark_attendance: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking attendance: {str(e)}"
        )

@router.get("/pending-approval")
async def get_pending_attendance(
    attendance_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get attendance records pending admin approval (only submitted, not draft)"""
    query = db.query(Attendance).filter(
        Attendance.admin_approved == False,
        Attendance.submitted_for_approval == True  # Only show submitted records
    )

    if attendance_date:
        query = query.filter(Attendance.date == attendance_date)

    pending_records = query.all()

    result = []
    for record in pending_records:
        student = db.query(Student).filter(Student.id == record.student_id).first()
        result.append({
            "id": record.id,
            "student_name": student.full_name if student else "Unknown",
            "student_unique_id": student.unique_id if student else "Unknown",
            "class_name": student.class_name if student else "Unknown",
            "parent_phone": student.parent_phone if student else None,
            "date": record.date,
            "status": record.status.value,
            "remarks": record.remarks,
            "marked_at": record.marked_at,
            "submitted_at": record.submitted_at
        })

    return result

@router.post("/approve")
async def approve_attendance(
    request: ApproveAttendanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Approve attendance records and send push notifications to parents"""
    try:
        attendance_ids = request.attendance_ids
        if not attendance_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No attendance IDs provided"
            )

        # Get attendance records to approve
        attendance_records = db.query(Attendance).filter(
            Attendance.id.in_(attendance_ids)
        ).all()

        if not attendance_records:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No attendance records found with provided IDs"
            )

        approved_count = 0
        whatsapp_queue = []

        for record in attendance_records:
            if record.admin_approved:
                continue  # Skip already approved records

            # Approve the record
            record.admin_approved = True
            record.approved_by_admin_id = current_user.id
            record.approved_at = datetime.now()

            # Get student details for WhatsApp notification
            student = db.query(Student).filter(Student.id == record.student_id).first()
            if student:
                whatsapp_queue.append({
                    "student_name": student.full_name,
                    "student_unique_id": student.unique_id,
                    "parent_phone": student.parent_phone,
                    "parent_name": student.parent_name,
                    "attendance_status": record.status.value,
                    "date": record.date.strftime("%Y-%m-%d"),
                    "remarks": record.remarks
                })

            approved_count += 1

        db.commit()

        # Log activity
        try:
            ActivityService.log_activity(
                db=db,
                user_id=current_user.id,
                user_name=current_user.full_name,
                action_type="attendance_approved",
                description=f"{current_user.full_name} approved {approved_count} attendance records",
                entity_type="attendance",
                entity_id=None,
                metadata={
                    "approved_count": approved_count,
                    "whatsapp_notifications": len(whatsapp_queue)
                }
            )
        except Exception as e:
            print(f"Error logging activity: {str(e)}")
            # Don't fail approval if activity logging fails

        # Send Push Notifications to Parents
        from app.services.push_notification_service import PushNotificationService
        from app.models.parent import Parent

        notification_results = []
        notifications_sent = 0

        try:
            for item in whatsapp_queue:
                parent_phone = item.get("parent_phone")
                if not parent_phone:
                    continue

                # Get parent's push token from database
                parent = db.query(Parent).filter(Parent.phone_number == parent_phone).first()

                if parent and parent.push_token:
                    # Send push notification
                    result = await PushNotificationService.send_attendance_notification(
                        push_token=parent.push_token,
                        student_name=item["student_name"],
                        status=item["attendance_status"],
                        date=item["date"]
                    )

                    if result.get("status") == "success":
                        notifications_sent += 1

                    notification_results.append({
                        "parent_phone": parent_phone,
                        "student": item["student_name"],
                        "result": result.get("status")
                    })
                else:
                    print(f"⚠️ No push token for parent: {parent_phone}")
                    notification_results.append({
                        "parent_phone": parent_phone,
                        "student": item["student_name"],
                        "result": "no_push_token"
                    })

            print(f"✅ Sent {notifications_sent} push notifications out of {len(whatsapp_queue)} records")

        except Exception as e:
            print(f"❌ Error sending push notifications: {str(e)}")
            # Don't fail the attendance approval if notifications fail

        return {
            "message": f"Successfully approved {approved_count} attendance records",
            "approved_count": approved_count,
            "push_notifications_sent": notifications_sent,
            "push_notifications_total": len(whatsapp_queue),
            "notification_results": notification_results[:5],  # Show first 5 for preview
            "status": "approved_and_notifications_sent"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving attendance: {str(e)}"
        )

@router.get("/student/{student_id}")
async def get_student_attendance(
    student_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Get attendance records for a specific student"""
    query = db.query(Attendance).filter(Attendance.student_id == student_id)

    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    records = query.order_by(Attendance.date.desc()).all()
    return records

@router.get("/class/{class_name}")
async def get_class_attendance(
    class_name: str,
    attendance_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Get attendance records for a specific class"""
    # Get all students in the class
    students = db.query(Student).filter(Student.class_name == class_name).all()

    if not students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No students found in class {class_name}"
        )

    # Use today's date if not specified
    if not attendance_date:
        attendance_date = date.today()

    # Get attendance records for the class on the specified date
    student_ids = [student.id for student in students]
    attendance_records = db.query(Attendance).filter(
        Attendance.student_id.in_(student_ids),
        Attendance.date == attendance_date
    ).all()

    # Create a dict for quick lookup
    attendance_dict = {record.student_id: record for record in attendance_records}

    # Prepare response with all students and their attendance status
    result = []
    for student in students:
        attendance_record = attendance_dict.get(student.id)
        result.append({
            "student_id": student.id,
            "student_name": student.full_name,
            "student_unique_id": student.unique_id,
            "class_name": student.class_name,
            "date": attendance_date,
            "status": attendance_record.status.value if attendance_record else "not_marked",
            "remarks": attendance_record.remarks if attendance_record else "",
            "marked_at": attendance_record.marked_at if attendance_record else None,
            "admin_approved": attendance_record.admin_approved if attendance_record else False
        })

    return {
        "class_name": class_name,
        "date": attendance_date,
        "total_students": len(students),
        "marked_attendance": len(attendance_records),
        "pending_count": len(students) - len(attendance_records),
        "students": result
    }

@router.get("/summary")
async def get_attendance_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get attendance summary statistics (admin only)"""
    # Default to current month if no dates provided
    if not start_date:
        today = date.today()
        start_date = date(today.year, today.month, 1)
    if not end_date:
        end_date = date.today()

    # Get total students
    total_students = db.query(Student).count()

    # Get attendance records in date range
    attendance_query = db.query(Attendance).filter(
        Attendance.date >= start_date,
        Attendance.date <= end_date
    )

    total_records = attendance_query.count()
    approved_records = attendance_query.filter(Attendance.admin_approved == True).count()
    pending_records = attendance_query.filter(Attendance.admin_approved == False).count()

    # Get status breakdown
    status_breakdown = {}
    for status in ["present", "absent", "late", "leave"]:
        count = attendance_query.filter(
            Attendance.status == status,
            Attendance.admin_approved == True
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
            "start_date": start_date,
            "end_date": end_date,
            "working_days": working_days
        },
        "totals": {
            "total_students": total_students,
            "total_records": total_records,
            "approved_records": approved_records,
            "pending_approval": pending_records
        },
        "status_breakdown": status_breakdown,
        "metrics": {
            "average_daily_attendance": round(status_breakdown.get("present", 0) / max(working_days, 1), 2),
            "attendance_rate": round((status_breakdown.get("present", 0) / max(total_records, 1)) * 100, 2),
            "approval_rate": round((approved_records / max(total_records, 1)) * 100, 2)
        }
    }


@router.get("/history")
async def get_attendance_history(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    class_name: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get attendance history with student details (admin only)"""
    # Default to last 7 days if no dates provided
    if not start_date:
        start_date = date.today() - timedelta(days=7)
    if not end_date:
        end_date = date.today()

    # Query attendance records with joins (approved or not, since mobile app needs unapproved too)
    query = db.query(Attendance).join(
        Student, Attendance.student_id == Student.id
    ).filter(
        Attendance.date >= start_date,
        Attendance.date <= end_date
    )

    # Add optional filters
    if class_name:
        query = query.filter(Student.class_name == class_name)
    if status:
        query = query.filter(Attendance.status == status)

    attendance_records = query.all()

    result = []
    for record in attendance_records:
        # Get student and teacher info
        student = db.query(Student).filter(Student.id == record.student_id).first()
        teacher = db.query(Teacher).filter(Teacher.id == record.teacher_id).first()
        admin = db.query(User).filter(User.id == record.approved_by).first() if record.approved_by else None

        result.append({
            "id": record.id,
            "student_name": student.full_name if student else "Unknown",
            "student_unique_id": student.unique_id if student else "N/A",
            "class_name": student.class_name if student else "N/A",
            "section": student.section if student else "",
            "date": record.date.isoformat(),
            "status": record.status.value if hasattr(record.status, 'value') else record.status,
            "marked_by": teacher.full_name if teacher else "Unknown",
            "approved_by": admin.full_name if (admin and record.admin_approved) else None,
            "remarks": record.remarks or "",
            "is_approved": record.admin_approved or False
        })

    return result

@router.delete("/clear-all")
async def clear_all_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Clear all attendance data (admin only) - USE WITH CAUTION"""
    count = db.query(Attendance).count()
    db.query(Attendance).delete()
    db.commit()
    return {"message": f"Cleared all {count} attendance records from database", "deleted_count": count}