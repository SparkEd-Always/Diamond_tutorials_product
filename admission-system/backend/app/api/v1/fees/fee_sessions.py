"""
Fee Sessions API Endpoints
Handles fee session creation, management, and bulk student assignments
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, date

from ....core.database import get_db
from ....core.security import get_current_user
from ....models.fees.fee_session import FeeSession, FeeSessionAssignment, FeeSessionStatus
from ....models.fees.fee_structure import FeeStructure, StudentFeeAssignment
from ....models.student import Student
from ....models.academic import Class, AcademicYear
from ....models.user import User
from ....schemas.fees.fee_session import (
    FeeSessionCreate,
    FeeSessionUpdate,
    FeeSessionResponse,
    FeeSessionListResponse,
    FeeSessionDetailResponse,
    StudentAssignmentDetail,
    StudentFilterCriteria,
    FilteredStudentResponse,
    BulkStudentAssignment,
)
from ....services.ledger_service import LedgerService
from ....models.fees.ledger_transaction import LedgerEntryType

router = APIRouter()


# Helper function to calculate session statistics
def calculate_session_stats(session: FeeSession, db: Session):
    """Recalculate and update session statistics"""
    assignments = db.query(FeeSessionAssignment).filter(
        FeeSessionAssignment.session_id == session.id
    ).all()

    session.total_students = len(assignments)
    session.total_amount = sum(float(a.expected_amount) for a in assignments)
    session.collected_amount = sum(float(a.paid_amount) for a in assignments)
    session.outstanding_amount = sum(float(a.outstanding_amount) for a in assignments)
    session.students_paid = sum(1 for a in assignments if a.is_paid)
    session.students_pending = session.total_students - session.students_paid

    db.commit()


@router.post("/", response_model=FeeSessionResponse, status_code=status.HTTP_201_CREATED)
def create_fee_session(
    session_data: FeeSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new fee session and assign students

    Steps:
    1. Create FeeSession record
    2. For each student, create StudentFeeAssignment
    3. Link students to session via FeeSessionAssignment
    4. Calculate session statistics
    """
    # Validate fee structure exists
    fee_structure = db.query(FeeStructure).filter(
        FeeStructure.id == session_data.fee_structure_id,
        FeeStructure.is_active == True
    ).first()

    if not fee_structure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee structure not found or inactive"
        )

    # Get ALL fee structures for this class and academic year
    all_fee_structures = db.query(FeeStructure).filter(
        FeeStructure.class_id == fee_structure.class_id,
        FeeStructure.academic_year_id == session_data.academic_year_id,
        FeeStructure.is_active == True
    ).all()

    # Calculate total fee amount for this class
    total_fee_amount = sum(float(fs.amount) for fs in all_fee_structures)

    # Validate academic year exists
    academic_year = db.query(AcademicYear).filter(
        AcademicYear.id == session_data.academic_year_id
    ).first()

    if not academic_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found"
        )

    # Validate students exist
    students = db.query(Student).filter(
        Student.id.in_(session_data.student_ids)
    ).all()

    if len(students) != len(session_data.student_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some student IDs are invalid"
        )

    # Create fee session
    new_session = FeeSession(
        session_name=session_data.session_name,
        session_description=session_data.session_description,
        academic_year_id=session_data.academic_year_id,
        fee_structure_id=session_data.fee_structure_id,
        start_date=session_data.start_date,
        due_date=session_data.due_date,
        remarks=session_data.remarks,
        status=FeeSessionStatus.ACTIVE,
        created_by=current_user.id,
    )

    db.add(new_session)
    db.flush()  # Get the session ID

    # Create assignments for each student
    for student in students:
        # Create StudentFeeAssignment for EACH fee structure (all fee types)
        total_expected_amount = 0.0
        first_assignment_id = None

        for fee_struct in all_fee_structures:
            student_fee_assignment = StudentFeeAssignment(
                student_id=student.id,
                fee_structure_id=fee_struct.id,
                custom_due_date=session_data.due_date,
                assigned_by=current_user.id,
                is_active=True
            )
            db.add(student_fee_assignment)
            db.flush()

            # Save first assignment ID for reference
            if first_assignment_id is None:
                first_assignment_id = student_fee_assignment.id

            # Add this fee structure's amount to total
            total_expected_amount += student_fee_assignment.get_final_amount()

        # Create FeeSessionAssignment (link to session) with TOTAL amount
        session_assignment = FeeSessionAssignment(
            session_id=new_session.id,
            student_id=student.id,
            student_fee_assignment_id=first_assignment_id,  # Reference first assignment
            expected_amount=total_expected_amount,  # Total of ALL fee structures
            paid_amount=0.00,
            outstanding_amount=total_expected_amount,
            payment_status="pending",
            is_paid=False
        )
        db.add(session_assignment)
        db.flush()  # Get session_assignment ID

        # Create ledger entry for this fee assignment
        try:
            ledger_entry = LedgerService.create_fee_assignment_entry(
                student_id=student.id,
                academic_year_id=session_data.academic_year_id,
                amount=total_expected_amount,
                description=f"{session_data.session_name} - Fee Assignment",
                entry_type=LedgerEntryType.FEE_ASSIGNMENT.value,
                fee_session_id=new_session.id,
                transaction_date=session_data.start_date,
                created_by=current_user.id,
                db=db
            )
        except Exception as e:
            # Log error but don't fail the fee session creation
            print(f"Warning: Failed to create ledger entry for student {student.id}: {str(e)}")

    db.commit()

    # Calculate session statistics
    calculate_session_stats(new_session, db)

    # Refresh to get updated stats
    db.refresh(new_session)

    # Add collection percentage
    response_data = FeeSessionResponse.model_validate(new_session)
    response_data.collection_percentage = new_session.calculate_collection_percentage()

    return response_data


@router.get("/", response_model=List[FeeSessionListResponse])
def list_fee_sessions(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all fee sessions with optional filters
    """
    query = db.query(FeeSession)

    # Apply filters
    if status_filter:
        query = query.filter(FeeSession.status == status_filter)

    if academic_year_id:
        query = query.filter(FeeSession.academic_year_id == academic_year_id)

    # Order by most recent first
    query = query.order_by(FeeSession.created_at.desc())

    sessions = query.offset(skip).limit(limit).all()

    # Convert to list response with collection percentage
    result = []
    for session in sessions:
        session_data = session.__dict__.copy()
        session_data['collection_percentage'] = session.calculate_collection_percentage()
        session_dict = FeeSessionListResponse.model_validate(session_data)
        result.append(session_dict)

    return result


@router.get("/{session_id}", response_model=FeeSessionDetailResponse)
def get_fee_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed fee session information including student assignments
    """
    session = db.query(FeeSession).options(
        joinedload(FeeSession.academic_year),
        joinedload(FeeSession.fee_structure)
    ).filter(FeeSession.id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee session not found"
        )

    # Get student assignments with details
    assignments = db.query(
        FeeSessionAssignment,
        Student,
        Class
    ).join(
        Student, FeeSessionAssignment.student_id == Student.id
    ).join(
        Class, Student.current_class_id == Class.id
    ).filter(
        FeeSessionAssignment.session_id == session_id
    ).all()

    # Build student assignment details
    student_assignments = []
    for assignment, student, class_info in assignments:
        student_assignments.append(StudentAssignmentDetail(
            student_id=student.id,
            student_name=f"{student.first_name} {student.last_name}",
            admission_number=student.admission_number,
            roll_number=student.roll_number,
            class_name=class_info.class_name,  # Fixed: was class_info.name
            section=None,  # Section info not available in current Student model
            expected_amount=assignment.expected_amount,
            paid_amount=assignment.paid_amount,
            outstanding_amount=assignment.outstanding_amount,
            payment_status=assignment.payment_status,
            is_paid=assignment.is_paid
        ))

    # Build response
    response_data = FeeSessionDetailResponse.model_validate(session)
    response_data.collection_percentage = session.calculate_collection_percentage()
    response_data.student_assignments = student_assignments
    response_data.fee_structure_name = f"{session.fee_structure.fee_type.type_name} - {session.fee_structure.class_info.class_name}"
    response_data.academic_year_name = session.academic_year.year_name

    return response_data


@router.put("/{session_id}", response_model=FeeSessionResponse)
def update_fee_session(
    session_id: int,
    session_update: FeeSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update fee session details
    """
    session = db.query(FeeSession).filter(FeeSession.id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee session not found"
        )

    # Update fields
    update_data = session_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)

    response_data = FeeSessionResponse.model_validate(session)
    response_data.collection_percentage = session.calculate_collection_percentage()

    return response_data


@router.post("/{session_id}/close", response_model=FeeSessionResponse)
def close_fee_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Close a fee session (no more payments accepted)
    """
    session = db.query(FeeSession).filter(FeeSession.id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee session not found"
        )

    if session.status == FeeSessionStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is already closed"
        )

    session.status = FeeSessionStatus.CLOSED
    session.closed_at = datetime.utcnow()
    session.closed_by = current_user.id

    db.commit()
    db.refresh(session)

    response_data = FeeSessionResponse.model_validate(session)
    response_data.collection_percentage = session.calculate_collection_percentage()

    return response_data


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fee_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a fee session (only if in DRAFT status)
    """
    session = db.query(FeeSession).filter(FeeSession.id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee session not found"
        )

    if session.status != FeeSessionStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only DRAFT sessions can be deleted"
        )

    db.delete(session)
    db.commit()

    return None


@router.post("/filter-students", response_model=List[FilteredStudentResponse])
def filter_students_for_session(
    filters: StudentFilterCriteria,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Filter students based on criteria for session creation wizard
    Used in Step 2 of the wizard to show students by class
    """
    query = db.query(Student, Class).join(
        Class, Student.current_class_id == Class.id
    ).filter(Student.is_active == True)

    # Apply class filter
    if filters.class_id:
        query = query.filter(Student.current_class_id == filters.class_id)

    # Apply section filter
    if filters.section:
        query = query.filter(Class.section == filters.section)

    # Apply search query (search by name)
    if filters.search_query:
        search_term = f"%{filters.search_query}%"
        query = query.filter(
            or_(
                Student.first_name.ilike(search_term),
                Student.last_name.ilike(search_term),
                (Student.first_name + ' ' + Student.last_name).ilike(search_term)
            )
        )

    students_with_class = query.all()
    print(students_with_class)
    # Build response
    result = []
    for student, class_info in students_with_class:
        result.append(FilteredStudentResponse(
            id=student.id,
            full_name=f"{student.first_name} {student.last_name}",
            admission_number=student.admission_number,
            roll_number=student.roll_number,
            class_id=class_info.id,
            class_name=class_info.class_name,  # Fixed: was class_info.name
            section=None,  # Section info not available in current Student model
            is_selected=False
        ))

    return result


@router.get("/stats/summary")
def get_fee_sessions_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall fee sessions summary statistics
    """
    total_sessions = db.query(func.count(FeeSession.id)).scalar()
    active_sessions = db.query(func.count(FeeSession.id)).filter(
        FeeSession.status == FeeSessionStatus.ACTIVE
    ).scalar()

    total_expected = db.query(func.sum(FeeSession.total_amount)).scalar() or 0
    total_collected = db.query(func.sum(FeeSession.collected_amount)).scalar() or 0
    total_outstanding = db.query(func.sum(FeeSession.outstanding_amount)).scalar() or 0

    return {
        "total_sessions": total_sessions,
        "active_sessions": active_sessions,
        "total_expected_amount": float(total_expected),
        "total_collected_amount": float(total_collected),
        "total_outstanding_amount": float(total_outstanding),
        "overall_collection_percentage": round((float(total_collected) / float(total_expected) * 100), 2) if total_expected > 0 else 0
    }
