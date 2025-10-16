"""
Students API Router
Handles all student-related endpoints with full implementation
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime
from uuid import UUID
import logging

from app.database import get_db
from app.models.student import Student, StudentStatusEnum, GenderEnum
from app.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentSummary
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# Student CRUD Operations
# ============================================================================

@router.get("/", summary="List all students")
async def list_students(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, admission number, or roll number"),
    class_id: Optional[str] = Query(None, description="Filter by class ID"),
    section_id: Optional[str] = Query(None, description="Filter by section ID"),
    status: Optional[str] = Query(None, description="Filter by student status"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    db: Session = Depends(get_db)
):
    """
    Get list of students with pagination and filters.

    Supports:
    - Full-text search (name, admission number, roll number)
    - Filtering by class, section, status, gender
    - Pagination
    """
    try:
        # Build base query - only active (not soft-deleted) students
        query = db.query(Student).filter(Student.deleted_at == None)

        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Student.first_name.ilike(search_term),
                    Student.middle_name.ilike(search_term),
                    Student.last_name.ilike(search_term),
                    Student.admission_number.ilike(search_term),
                    Student.roll_number.ilike(search_term)
                )
            )

        # Apply class filter
        if class_id:
            try:
                query = query.filter(Student.current_class_id == UUID(class_id))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid class_id format. Must be a valid UUID."
                )

        # Apply section filter
        if section_id:
            try:
                query = query.filter(Student.current_section_id == UUID(section_id))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid section_id format. Must be a valid UUID."
                )

        # Apply status filter
        if status:
            try:
                status_enum = StudentStatusEnum(status)
                query = query.filter(Student.student_status == status_enum)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status. Must be one of: {', '.join([s.value for s in StudentStatusEnum])}"
                )

        # Apply gender filter
        if gender:
            try:
                gender_enum = GenderEnum(gender)
                query = query.filter(Student.gender == gender_enum)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid gender. Must be one of: {', '.join([g.value for g in GenderEnum])}"
                )

        # Get total count before pagination
        total = query.count()

        # Calculate total pages
        total_pages = (total + per_page - 1) // per_page if total > 0 else 0

        # Apply pagination
        offset = (page - 1) * per_page
        students = query.order_by(Student.admission_number).offset(offset).limit(per_page).all()

        # Convert to response format with computed fields
        student_list = []
        for student in students:
            student_dict = {
                "id": student.id,
                "admission_number": student.admission_number,
                "roll_number": student.roll_number,
                "first_name": student.first_name,
                "middle_name": student.middle_name,
                "last_name": student.last_name,
                "date_of_birth": student.date_of_birth,
                "gender": student.gender,
                "blood_group": student.blood_group,
                "nationality": student.nationality,
                "religion": student.religion,
                "caste_category": student.caste_category,
                "aadhar_number": student.aadhar_number,
                "photo_url": student.photo_url,
                "current_class_id": student.current_class_id,
                "current_section_id": student.current_section_id,
                "house_id": student.house_id,
                "admission_date": student.admission_date,
                "student_status": student.student_status,
                "profile_completeness_percentage": student.profile_completeness_percentage,
                "created_at": student.created_at,
                "updated_at": student.updated_at,
                "deleted_at": student.deleted_at,
                "created_by": student.created_by,
                "updated_by": student.updated_by,
                # Computed fields
                "full_name": student.full_name,
                "age": student.calculate_age(),
                "is_active": student.is_active
            }
            student_list.append(student_dict)

        return {
            "success": True,
            "data": {
                "students": student_list,
                "total": total,
                "page": page,
                "per_page": per_page,
                "total_pages": total_pages
            },
            "message": "Students retrieved successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing students: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve students: {str(e)}"
        )


@router.get("/{student_id}", summary="Get student details")
async def get_student(student_id: str, db: Session = Depends(get_db)):
    """
    Get complete student profile by ID.

    Returns all student information including computed fields.
    """
    try:
        # Convert to UUID
        try:
            student_uuid = UUID(student_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid student_id format. Must be a valid UUID."
            )

        # Query student
        student = db.query(Student).filter(
            Student.id == student_uuid,
            Student.deleted_at == None
        ).first()

        if not student:
            raise HTTPException(
                status_code=404,
                detail=f"Student with ID {student_id} not found"
            )

        # Build response with computed fields
        student_data = {
            "id": student.id,
            "admission_number": student.admission_number,
            "roll_number": student.roll_number,
            "first_name": student.first_name,
            "middle_name": student.middle_name,
            "last_name": student.last_name,
            "date_of_birth": student.date_of_birth,
            "gender": student.gender,
            "blood_group": student.blood_group,
            "nationality": student.nationality,
            "religion": student.religion,
            "caste_category": student.caste_category,
            "aadhar_number": student.aadhar_number,
            "photo_url": student.photo_url,
            "current_class_id": student.current_class_id,
            "current_section_id": student.current_section_id,
            "house_id": student.house_id,
            "admission_date": student.admission_date,
            "student_status": student.student_status,
            "profile_completeness_percentage": student.profile_completeness_percentage,
            "created_at": student.created_at,
            "updated_at": student.updated_at,
            "deleted_at": student.deleted_at,
            "created_by": student.created_by,
            "updated_by": student.updated_by,
            # Computed fields
            "full_name": student.full_name,
            "age": student.calculate_age(),
            "is_active": student.is_active
        }

        return {
            "success": True,
            "data": student_data,
            "message": "Student retrieved successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving student {student_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve student: {str(e)}"
        )


@router.post("/", summary="Create new student", status_code=status.HTTP_201_CREATED)
async def create_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    """
    Create a new student profile.

    Validates:
    - Unique admission number
    - Valid data formats
    - Required fields
    """
    try:
        # Check if admission number already exists
        existing = db.query(Student).filter(
            Student.admission_number == student_data.admission_number
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Student with admission number {student_data.admission_number} already exists"
            )

        # Check if aadhar number already exists (if provided)
        if student_data.aadhar_number:
            existing_aadhar = db.query(Student).filter(
                Student.aadhar_number == student_data.aadhar_number
            ).first()

            if existing_aadhar:
                raise HTTPException(
                    status_code=400,
                    detail=f"Student with Aadhaar number {student_data.aadhar_number} already exists"
                )

        # Create new student instance
        new_student = Student(
            admission_number=student_data.admission_number,
            roll_number=student_data.roll_number,
            first_name=student_data.first_name,
            middle_name=student_data.middle_name,
            last_name=student_data.last_name,
            date_of_birth=student_data.date_of_birth,
            gender=student_data.gender,
            blood_group=student_data.blood_group,
            nationality=student_data.nationality,
            religion=student_data.religion,
            caste_category=student_data.caste_category,
            aadhar_number=student_data.aadhar_number,
            photo_url=student_data.photo_url,
            current_class_id=student_data.current_class_id,
            current_section_id=student_data.current_section_id,
            house_id=student_data.house_id,
            admission_date=student_data.admission_date,
            student_status=student_data.student_status,
            profile_completeness_percentage=calculate_profile_completeness(student_data)
        )

        # Add to database
        db.add(new_student)
        db.commit()
        db.refresh(new_student)

        logger.info(f"Created new student: {new_student.admission_number} (ID: {new_student.id})")

        # Build response
        student_response = {
            "id": new_student.id,
            "admission_number": new_student.admission_number,
            "roll_number": new_student.roll_number,
            "first_name": new_student.first_name,
            "middle_name": new_student.middle_name,
            "last_name": new_student.last_name,
            "full_name": new_student.full_name,
            "date_of_birth": new_student.date_of_birth,
            "gender": new_student.gender,
            "student_status": new_student.student_status,
            "profile_completeness_percentage": new_student.profile_completeness_percentage,
            "created_at": new_student.created_at
        }

        return {
            "success": True,
            "data": student_response,
            "message": "Student created successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating student: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create student: {str(e)}"
        )


@router.put("/{student_id}", summary="Update student")
async def update_student(
    student_id: str,
    student_data: StudentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update student profile.

    Supports partial updates - only provided fields will be updated.
    """
    try:
        # Convert to UUID
        try:
            student_uuid = UUID(student_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid student_id format. Must be a valid UUID."
            )

        # Find student
        student = db.query(Student).filter(
            Student.id == student_uuid,
            Student.deleted_at == None
        ).first()

        if not student:
            raise HTTPException(
                status_code=404,
                detail=f"Student with ID {student_id} not found"
            )

        # Update only provided fields
        update_data = student_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(student, field, value)

        # Recalculate profile completeness
        student.profile_completeness_percentage = calculate_profile_completeness_from_model(student)

        # Update timestamp
        student.updated_at = datetime.utcnow()

        # Commit changes
        db.commit()
        db.refresh(student)

        logger.info(f"Updated student: {student.admission_number} (ID: {student.id})")

        # Build response
        student_response = {
            "id": student.id,
            "admission_number": student.admission_number,
            "full_name": student.full_name,
            "student_status": student.student_status,
            "profile_completeness_percentage": student.profile_completeness_percentage,
            "updated_at": student.updated_at
        }

        return {
            "success": True,
            "data": student_response,
            "message": "Student updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating student {student_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update student: {str(e)}"
        )


@router.delete("/{student_id}", summary="Delete student")
async def delete_student(student_id: str, db: Session = Depends(get_db)):
    """
    Soft delete student (mark as inactive).

    Does not physically delete the record, just marks it as deleted.
    """
    try:
        # Convert to UUID
        try:
            student_uuid = UUID(student_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid student_id format. Must be a valid UUID."
            )

        # Find student
        student = db.query(Student).filter(
            Student.id == student_uuid,
            Student.deleted_at == None
        ).first()

        if not student:
            raise HTTPException(
                status_code=404,
                detail=f"Student with ID {student_id} not found"
            )

        # Soft delete
        student.deleted_at = datetime.utcnow()
        student.student_status = StudentStatusEnum.WITHDRAWN

        db.commit()

        logger.info(f"Soft deleted student: {student.admission_number} (ID: {student.id})")

        return {
            "success": True,
            "data": None,
            "message": "Student deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting student {student_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete student: {str(e)}"
        )


# ============================================================================
# Statistics & Analytics
# ============================================================================

@router.get("/stats/overview", summary="Get student statistics")
async def get_student_stats(db: Session = Depends(get_db)):
    """
    Get overall student statistics for dashboard.

    Returns counts by status, gender, and other metrics.
    """
    try:
        # Total students (not deleted)
        total_students = db.query(func.count(Student.id)).filter(
            Student.deleted_at == None
        ).scalar()

        # Active students
        active_students = db.query(func.count(Student.id)).filter(
            Student.deleted_at == None,
            Student.student_status == StudentStatusEnum.ACTIVE
        ).scalar()

        # New admissions this month
        from datetime import datetime, timedelta
        first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_admissions_this_month = db.query(func.count(Student.id)).filter(
            Student.created_at >= first_day_of_month
        ).scalar()

        # Alumni count
        alumni_count = db.query(func.count(Student.id)).filter(
            Student.student_status == StudentStatusEnum.ALUMNI
        ).scalar()

        # Transferred count
        transferred_count = db.query(func.count(Student.id)).filter(
            Student.student_status == StudentStatusEnum.TRANSFERRED
        ).scalar()

        # Gender counts
        male_count = db.query(func.count(Student.id)).filter(
            Student.deleted_at == None,
            Student.gender == GenderEnum.MALE
        ).scalar()

        female_count = db.query(func.count(Student.id)).filter(
            Student.deleted_at == None,
            Student.gender == GenderEnum.FEMALE
        ).scalar()

        other_gender_count = db.query(func.count(Student.id)).filter(
            Student.deleted_at == None,
            Student.gender == GenderEnum.OTHER
        ).scalar()

        # Average profile completeness
        avg_completeness = db.query(func.avg(Student.profile_completeness_percentage)).filter(
            Student.deleted_at == None
        ).scalar() or 0

        stats = {
            "total_students": total_students or 0,
            "active_students": active_students or 0,
            "new_admissions_this_month": new_admissions_this_month or 0,
            "alumni_count": alumni_count or 0,
            "transferred_count": transferred_count or 0,
            "male_count": male_count or 0,
            "female_count": female_count or 0,
            "other_gender_count": other_gender_count or 0,
            "average_profile_completeness": round(float(avg_completeness), 2)
        }

        return {
            "success": True,
            "data": stats,
            "message": "Statistics retrieved successfully"
        }

    except Exception as e:
        logger.error(f"Error retrieving statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )


# ============================================================================
# Helper Functions
# ============================================================================

def calculate_profile_completeness(student_data: StudentCreate) -> int:
    """Calculate profile completeness percentage based on filled fields."""
    total_fields = 20  # Total number of profile fields
    filled_fields = 0

    # Required fields (always filled)
    filled_fields += 5  # admission_number, first_name, last_name, dob, gender

    # Optional fields
    if student_data.roll_number: filled_fields += 1
    if student_data.middle_name: filled_fields += 1
    if student_data.blood_group: filled_fields += 1
    if student_data.nationality: filled_fields += 1
    if student_data.religion: filled_fields += 1
    if student_data.caste_category: filled_fields += 1
    if student_data.aadhar_number: filled_fields += 1
    if student_data.photo_url: filled_fields += 1
    if student_data.current_class_id: filled_fields += 1
    if student_data.current_section_id: filled_fields += 1
    if student_data.house_id: filled_fields += 1

    # Additional fields
    filled_fields += 5  # admission_date, student_status, etc.

    percentage = int((filled_fields / total_fields) * 100)
    return min(percentage, 100)  # Cap at 100%


def calculate_profile_completeness_from_model(student: Student) -> int:
    """Calculate profile completeness from existing student model."""
    total_fields = 20
    filled_fields = 5  # Required fields

    if student.roll_number: filled_fields += 1
    if student.middle_name: filled_fields += 1
    if student.blood_group: filled_fields += 1
    if student.nationality: filled_fields += 1
    if student.religion: filled_fields += 1
    if student.caste_category: filled_fields += 1
    if student.aadhar_number: filled_fields += 1
    if student.photo_url: filled_fields += 1
    if student.current_class_id: filled_fields += 1
    if student.current_section_id: filled_fields += 1
    if student.house_id: filled_fields += 1
    filled_fields += 5

    percentage = int((filled_fields / total_fields) * 100)
    return min(percentage, 100)
