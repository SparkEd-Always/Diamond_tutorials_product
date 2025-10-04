"""
Unified Mobile Authentication for Teachers and Parents
OTP-based login that auto-detects user type
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import create_access_token
from app.models.parent import Parent
from app.models.teacher import Teacher
from app.models.student import Student
from app.schemas.parent import SendOTPRequest, VerifyOTPRequest
from app.services.otp_service import OTPService

router = APIRouter()


@router.post("/send-otp")
async def send_otp_mobile(
    request: SendOTPRequest,
    db: Session = Depends(get_db)
):
    """
    Send OTP to phone number
    Auto-detects if phone belongs to teacher or parent
    """
    try:
        phone = request.phone_number
        user_type = None

        # Check if teacher (check both phone and phone_number for compatibility)
        teacher = db.query(Teacher).filter(
            (Teacher.phone == phone) | (Teacher.phone_number == phone)
        ).first()
        if teacher:
            user_type = "teacher"

        # Check if parent
        if not user_type:
            student = db.query(Student).filter(Student.parent_phone == phone).first()
            if student:
                user_type = "parent"

        if not user_type:
            raise HTTPException(
                status_code=404,
                detail="Phone number not registered. Please contact school administration."
            )

        # Send OTP
        await OTPService.send_otp(phone, db)

        return {
            "success": True,
            "message": f"OTP sent to {phone}",
            "user_type": user_type,
            "expires_in_minutes": 10
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending OTP: {str(e)}")


@router.post("/verify-otp")
async def verify_otp_mobile(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    """
    Verify OTP and login user
    Returns user type and appropriate token
    """
    try:
        # Verify OTP
        is_valid = await OTPService.verify_otp(request.phone_number, request.otp_code, db)

        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        phone = request.phone_number
        user_type = None
        user_data = None

        # Check if teacher (check both phone and phone_number for compatibility)
        teacher = db.query(Teacher).filter(
            (Teacher.phone == phone) | (Teacher.phone_number == phone)
        ).first()
        if teacher:
            user_type = "teacher"

            # Update teacher record
            teacher.last_login = datetime.utcnow()
            if request.push_token:
                teacher.push_token = request.push_token
            if request.device_type:
                teacher.device_type = request.device_type
            db.commit()

            user_data = {
                "id": teacher.id,
                "unique_id": teacher.unique_id,
                "full_name": teacher.full_name,
                "phone": teacher.phone or teacher.phone_number,
                "email": teacher.email,
                "subjects": teacher.subjects if isinstance(teacher.subjects, list) else [],
                "classes": teacher.classes_assigned if isinstance(teacher.classes_assigned, list) else []
            }

        # Check if parent
        if not user_type:
            student = db.query(Student).filter(Student.parent_phone == phone).first()
            if student:
                user_type = "parent"

                # Get or create parent record
                parent = db.query(Parent).filter(Parent.phone_number == phone).first()
                if not parent:
                    parent = Parent(
                        phone_number=phone,
                        name=student.parent_name,
                        email=student.parent_email,
                        is_active=True
                    )
                    db.add(parent)
                    db.commit()
                    db.refresh(parent)

                # Update parent record
                parent.last_login = datetime.utcnow()
                if request.push_token:
                    parent.push_token = request.push_token
                if request.device_type:
                    parent.device_type = request.device_type
                db.commit()

                # Get all children
                children = db.query(Student).filter(
                    Student.parent_phone == phone,
                    Student.is_active == "Active"
                ).all()

                user_data = {
                    "id": parent.id,
                    "phone_number": parent.phone_number,
                    "name": parent.name,
                    "email": parent.email,
                    "children": [
                        {
                            "id": child.id,
                            "unique_id": child.unique_id,
                            "full_name": child.full_name,
                            "class_name": child.class_name,
                            "section": child.section
                        }
                        for child in children
                    ]
                }

        if not user_type:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate JWT token with user type
        access_token = create_access_token(
            data={"sub": phone, "type": user_type}
        )

        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": user_type,
            "user": user_data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying OTP: {str(e)}")
