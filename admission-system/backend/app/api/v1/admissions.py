from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime
from ...core.database import get_db
from ...core.security import get_current_user, require_role
from ...models.user import User, UserRole
from ...models.student import Student, Parent, StudentParent
from ...models.user_profile import UserProfile, Gender
from ...models.admission import (
    AdmissionApplication,
    ApplicationStatus,
    ApplicationStatusHistory
)
from ...models.academic import AcademicYear, Class
from ...schemas.admission import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationListResponse,
    ApplicationStatusUpdate,
    ApplicationFilter
)

router = APIRouter()

def generate_application_number(db: Session, academic_year_id: int) -> str:
    """Generate unique application number"""
    # Get academic year
    academic_year = db.query(AcademicYear).filter(AcademicYear.id == academic_year_id).first()
    if not academic_year:
        raise HTTPException(status_code=404, detail="Academic year not found")

    # Get year suffix (last 2 digits)
    year_suffix = academic_year.year_name.split('-')[0][-2:]

    # Count existing applications for this year
    count = db.query(AdmissionApplication).filter(
        AdmissionApplication.academic_year_id == academic_year_id
    ).count()

    # Generate application number: APP24001, APP24002, etc.
    app_number = f"APP{year_suffix}{str(count + 1).zfill(4)}"
    return app_number

@router.post("/applications", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new admission application
    Parent can create application for their child
    """
    # Get parent record
    parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parent profile not found. Please complete your profile first."
        )

    # Create student user account
    student_user = User(
        email=f"student_{datetime.now().timestamp()}@temp.com",  # Temporary email
        password_hash="temp_password_hash",
        role=UserRole.STUDENT,
        is_active=True,
        is_verified=False
    )
    db.add(student_user)
    db.flush()

    # Create student profile
    student_profile = UserProfile(
        user_id=student_user.id,
        first_name=application_data.student_details.first_name,
        middle_name=application_data.student_details.middle_name,
        last_name=application_data.student_details.last_name,
        date_of_birth=application_data.student_details.date_of_birth,
        gender=Gender(application_data.student_details.gender),
        address_line1=application_data.address.address_line1,
        address_line2=application_data.address.address_line2,
        city=application_data.address.city,
        state=application_data.address.state,
        postal_code=application_data.address.postal_code,
        country=application_data.address.country
    )
    db.add(student_profile)
    db.flush()

    # Create student record
    student = Student(
        user_id=student_user.id,
        blood_group=application_data.student_details.blood_group,
        medical_conditions=application_data.student_details.medical_conditions,
        previous_school_name=application_data.student_details.previous_school_name,
        previous_school_address=application_data.student_details.previous_school_address,
        transport_required=application_data.student_details.transport_required,
        emergency_contact_name=application_data.emergency_contact_name,
        emergency_contact_phone=application_data.emergency_contact_phone,
        status="applicant"
    )
    db.add(student)
    db.flush()

    # Create student-parent relationship
    student_parent = StudentParent(
        student_id=student.id,
        parent_id=parent.id,
        relationship_type=application_data.parent_details.relationship_type,
        is_primary=True
    )
    db.add(student_parent)

    # Generate application number
    app_number = generate_application_number(db, application_data.academic_year_id)

    # Create admission application
    application = AdmissionApplication(
        application_number=app_number,
        student_id=student.id,
        parent_id=parent.id,
        academic_year_id=application_data.academic_year_id,
        class_applying_id=application_data.class_applying_id,
        application_status=ApplicationStatus.DRAFT,
        source=application_data.source or "online"
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application created successfully",
        "application": {
            "id": application.id,
            "application_number": application.application_number,
            "status": application.application_status.value,
            "created_at": application.created_at
        }
    }

@router.get("/applications", response_model=ApplicationListResponse)
async def list_applications(
    status: Optional[str] = Query(None),
    class_applying_id: Optional[int] = Query(None),
    academic_year_id: Optional[int] = Query(None),
    search_query: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List admission applications
    - Admin can see all applications
    - Parents can see only their applications
    """
    # Base query
    query = db.query(AdmissionApplication)

    # Role-based filtering
    if current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if parent:
            query = query.filter(AdmissionApplication.parent_id == parent.id)
        else:
            return ApplicationListResponse(total=0, page=page, page_size=page_size, applications=[])

    # Apply filters
    if status:
        query = query.filter(AdmissionApplication.application_status == status)
    if class_applying_id:
        query = query.filter(AdmissionApplication.class_applying_id == class_applying_id)
    if academic_year_id:
        query = query.filter(AdmissionApplication.academic_year_id == academic_year_id)

    # Search by application number or student name
    if search_query:
        query = query.join(Student).join(User).join(UserProfile).filter(
            or_(
                AdmissionApplication.application_number.ilike(f"%{search_query}%"),
                UserProfile.first_name.ilike(f"%{search_query}%"),
                UserProfile.last_name.ilike(f"%{search_query}%")
            )
        )

    # Get total count
    total = query.count()

    # Pagination
    applications = query.order_by(AdmissionApplication.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    # Format response
    app_list = []
    for app in applications:
        student_profile = db.query(UserProfile).filter(
            UserProfile.user_id == app.student.user_id
        ).first()
        parent_profile = db.query(UserProfile).filter(
            UserProfile.user_id == app.parent.user_id
        ).first()
        class_info = db.query(Class).filter(Class.id == app.class_applying_id).first()

        app_list.append(ApplicationResponse(
            id=app.id,
            application_number=app.application_number,
            application_status=app.application_status.value,
            submission_date=app.submission_date,
            created_at=app.created_at,
            updated_at=app.updated_at,
            student_name=f"{student_profile.first_name} {student_profile.last_name}" if student_profile else None,
            parent_name=f"{parent_profile.first_name} {parent_profile.last_name}" if parent_profile else None,
            class_name=class_info.class_name if class_info else None
        ))

    return ApplicationListResponse(
        total=total,
        page=page,
        page_size=page_size,
        applications=app_list
    )

@router.get("/applications/{application_id}", response_model=dict)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed application information
    """
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check access permissions
    if current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if not parent or application.parent_id != parent.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Get related data
    student_profile = db.query(UserProfile).filter(
        UserProfile.user_id == application.student.user_id
    ).first()
    parent_profile = db.query(UserProfile).filter(
        UserProfile.user_id == application.parent.user_id
    ).first()
    class_info = db.query(Class).filter(Class.id == application.class_applying_id).first()
    academic_year = db.query(AcademicYear).filter(AcademicYear.id == application.academic_year_id).first()

    # Get status history
    status_history = db.query(ApplicationStatusHistory).filter(
        ApplicationStatusHistory.application_id == application_id
    ).order_by(ApplicationStatusHistory.change_date.desc()).all()

    return {
        "application": {
            "id": application.id,
            "application_number": application.application_number,
            "status": application.application_status.value,
            "submission_date": application.submission_date,
            "review_date": application.review_date,
            "decision_date": application.decision_date,
            "decision_reason": application.decision_reason,
            "source": application.source,
            "remarks": application.remarks,
            "created_at": application.created_at,
            "updated_at": application.updated_at
        },
        "student": {
            "first_name": student_profile.first_name if student_profile else None,
            "last_name": student_profile.last_name if student_profile else None,
            "date_of_birth": student_profile.date_of_birth if student_profile else None,
            "gender": student_profile.gender.value if student_profile and student_profile.gender else None,
            "blood_group": application.student.blood_group,
            "medical_conditions": application.student.medical_conditions,
            "previous_school": application.student.previous_school_name
        },
        "parent": {
            "first_name": parent_profile.first_name if parent_profile else None,
            "last_name": parent_profile.last_name if parent_profile else None,
            "email": application.parent.user.email,
            "phone": application.parent.user.phone,
            "occupation": application.parent.occupation
        },
        "academic": {
            "class_name": class_info.class_name if class_info else None,
            "academic_year": academic_year.year_name if academic_year else None
        },
        "status_history": [
            {
                "previous_status": h.previous_status,
                "new_status": h.new_status,
                "change_date": h.change_date,
                "change_reason": h.change_reason
            } for h in status_history
        ]
    }

@router.put("/applications/{application_id}/submit", response_model=dict)
async def submit_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit application for review
    Changes status from DRAFT to SUBMITTED
    """
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check access
    if current_user.role == UserRole.PARENT:
        parent = db.query(Parent).filter(Parent.user_id == current_user.id).first()
        if not parent or application.parent_id != parent.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Validate can be submitted
    if application.application_status != ApplicationStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot submit application in {application.application_status.value} status"
        )

    # Update status
    old_status = application.application_status.value
    application.application_status = ApplicationStatus.SUBMITTED
    application.submission_date = datetime.now()

    # Add to history
    history = ApplicationStatusHistory(
        application_id=application.id,
        previous_status=old_status,
        new_status=ApplicationStatus.SUBMITTED.value,
        changed_by=current_user.id,
        change_reason="Application submitted by parent"
    )
    db.add(history)
    db.commit()

    return {
        "message": "Application submitted successfully",
        "application_number": application.application_number,
        "status": application.application_status.value
    }

@router.put("/applications/{application_id}/status", response_model=dict)
async def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Update application status (Admin only)
    """
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Update status
    old_status = application.application_status.value
    application.application_status = ApplicationStatus(status_update.status)

    # Update relevant dates
    if status_update.status == "under_review":
        application.review_date = datetime.now()
    elif status_update.status in ["enrolled", "rejected", "waitlisted"]:
        application.decision_date = datetime.now()
        application.decision_reason = status_update.reason

    # Add to history
    history = ApplicationStatusHistory(
        application_id=application.id,
        previous_status=old_status,
        new_status=status_update.status,
        changed_by=current_user.id,
        change_reason=status_update.reason
    )
    db.add(history)
    db.commit()

    return {
        "message": "Application status updated successfully",
        "application_number": application.application_number,
        "status": application.application_status.value
    }

@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: int,
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Delete application (Admin only)
    """
    application = db.query(AdmissionApplication).filter(
        AdmissionApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()

    return None
