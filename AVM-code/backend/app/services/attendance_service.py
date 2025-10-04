from typing import List, Dict
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.models.attendance import Attendance
from app.models.student import Student
from app.models.user import User
from app.services.whatsapp_service import WhatsAppService

class AttendanceApprovalService:
    def __init__(self):
        self.whatsapp_service = WhatsAppService()

    async def get_pending_attendance_for_approval(
        self,
        db: Session,
        attendance_date: date = None
    ) -> List[Dict]:
        """Get attendance records pending admin approval, grouped by class"""
        query = db.query(Attendance).filter(Attendance.admin_approved == False)

        if attendance_date:
            query = query.filter(Attendance.date == attendance_date)

        pending_records = query.all()

        # Group by class for easier approval
        grouped_records = {}
        for record in pending_records:
            student = db.query(Student).filter(Student.id == record.student_id).first()
            if not student:
                continue

            class_key = f"{student.class_name} {student.section}".strip()
            if class_key not in grouped_records:
                grouped_records[class_key] = []

            grouped_records[class_key].append({
                "attendance_id": record.id,
                "student_id": student.id,
                "student_name": student.full_name,
                "student_unique_id": student.unique_id,
                "parent_phone": student.parent_phone,
                "parent_name": student.parent_name,
                "status": record.status.value,
                "remarks": record.remarks,
                "marked_at": record.marked_at,
                "date": record.date
            })

        return grouped_records

    async def approve_attendance_bulk(
        self,
        attendance_ids: List[int],
        approved_by_user_id: int,
        db: Session,
        send_whatsapp: bool = True
    ) -> Dict[str, int]:
        """Approve multiple attendance records and send WhatsApp messages"""
        results = {"approved": 0, "whatsapp_sent": 0, "whatsapp_failed": 0, "errors": 0}

        for attendance_id in attendance_ids:
            try:
                # Get attendance record
                attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
                if not attendance:
                    results["errors"] += 1
                    continue

                # Approve attendance
                attendance.admin_approved = True
                attendance.approved_by = approved_by_user_id
                attendance.approved_at = datetime.utcnow()
                results["approved"] += 1

                # Send WhatsApp message if enabled
                if send_whatsapp:
                    student = db.query(Student).filter(Student.id == attendance.student_id).first()
                    if student and student.parent_phone:
                        whatsapp_sent = await self.whatsapp_service.send_individual_attendance_message(
                            attendance_record=attendance,
                            student=student,
                            db=db
                        )

                        if whatsapp_sent:
                            attendance.whatsapp_sent = True
                            attendance.whatsapp_sent_at = datetime.utcnow()
                            results["whatsapp_sent"] += 1
                        else:
                            results["whatsapp_failed"] += 1

            except Exception as e:
                print(f"Error approving attendance {attendance_id}: {str(e)}")
                results["errors"] += 1

        db.commit()
        return results

    async def approve_attendance_by_class(
        self,
        class_name: str,
        section: str,
        attendance_date: date,
        approved_by_user_id: int,
        db: Session,
        send_whatsapp: bool = True
    ) -> Dict[str, int]:
        """Approve all attendance records for a specific class and date"""
        # Get all students in the class
        students = db.query(Student).filter(
            Student.class_name == class_name,
            Student.section == section,
            Student.is_active == "Active"
        ).all()

        student_ids = [student.id for student in students]

        # Get all pending attendance records for these students on the date
        attendance_records = db.query(Attendance).filter(
            Attendance.student_id.in_(student_ids),
            Attendance.date == attendance_date,
            Attendance.admin_approved == False
        ).all()

        attendance_ids = [record.id for record in attendance_records]

        # Use bulk approval method
        return await self.approve_attendance_bulk(
            attendance_ids=attendance_ids,
            approved_by_user_id=approved_by_user_id,
            db=db,
            send_whatsapp=send_whatsapp
        )

    async def get_attendance_statistics(
        self,
        db: Session,
        start_date: date = None,
        end_date: date = None
    ) -> Dict:
        """Get attendance statistics for admin dashboard"""
        query = db.query(Attendance)

        if start_date:
            query = query.filter(Attendance.date >= start_date)
        if end_date:
            query = query.filter(Attendance.date <= end_date)

        all_records = query.all()

        stats = {
            "total_records": len(all_records),
            "approved_records": len([r for r in all_records if r.admin_approved]),
            "pending_approval": len([r for r in all_records if not r.admin_approved]),
            "whatsapp_sent": len([r for r in all_records if r.whatsapp_sent]),
            "present_count": len([r for r in all_records if r.status.value == "present"]),
            "absent_count": len([r for r in all_records if r.status.value == "absent"]),
            "late_count": len([r for r in all_records if r.status.value == "late"]),
            "leave_count": len([r for r in all_records if r.status.value == "leave"])
        }

        # Calculate attendance percentage
        if stats["total_records"] > 0:
            stats["attendance_percentage"] = round(
                (stats["present_count"] + stats["late_count"]) / stats["total_records"] * 100, 2
            )
        else:
            stats["attendance_percentage"] = 0

        return stats