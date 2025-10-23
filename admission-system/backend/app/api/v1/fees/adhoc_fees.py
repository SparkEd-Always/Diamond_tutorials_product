"""
Adhoc Fee Assignments API Endpoints
Handles individual/ad-hoc fee assignments (lost items, fines, special fees)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from ....core.database import get_db
from ....core.security import get_current_user
from ....models.fees.adhoc_fee import AdhocFeeAssignment
from ....models.student import Student
from ....models.academic import Class
from ....models.user import User
from ....schemas.fees.adhoc_fee import (
    AdhocFeeCreate,
    AdhocFeeSingleCreate,
    AdhocFeeUpdate,
    AdhocFeeResponse,
    AdhocFeeListResponse,
    AdhocFeeDetailResponse,
    AdhocFeeSummary,
)
from ....services.ledger_service import LedgerService
from ....models.fees.ledger_transaction import LedgerEntryType
from ....models.academic import AcademicYear

router = APIRouter()


@router.post("/", response_model=List[AdhocFeeResponse], status_code=status.HTTP_201_CREATED)
def create_adhoc_fee_assignments(
    adhoc_fee_data: AdhocFeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create adhoc fee assignments for multiple students

    Steps:
    1. Validate all student IDs exist
    2. Create AdhocFeeAssignment record for each student
    3. Return list of created assignments

    Use Case: Assign same fee (e.g., "Olympiad Exam Fee ₹1200") to multiple students
    """
    # Validate students exist
    students = db.query(Student).filter(
        Student.id.in_(adhoc_fee_data.student_ids),
        Student.is_active == True
    ).all()

    if len(students) != len(adhoc_fee_data.student_ids):
        found_ids = {s.id for s in students}
        missing_ids = set(adhoc_fee_data.student_ids) - found_ids
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Some student IDs are invalid or inactive: {missing_ids}"
        )

    # Create adhoc fee assignment for each student
    created_assignments = []

    # Get current academic year (or let admin specify)
    current_academic_year = db.query(AcademicYear).filter(
        AcademicYear.is_current == True
    ).first()

    for student in students:
        adhoc_fee = AdhocFeeAssignment(
            fee_name=adhoc_fee_data.fee_name,
            description=adhoc_fee_data.description,
            amount=adhoc_fee_data.amount,
            assigned_date=adhoc_fee_data.assigned_date,
            due_date=adhoc_fee_data.due_date,
            student_id=student.id,
            paid_amount=Decimal('0.00'),
            outstanding_amount=adhoc_fee_data.amount,
            payment_status='pending',
            is_paid=False,
            assigned_by=current_user.id,
            remarks=adhoc_fee_data.remarks,
            is_active=True,
        )

        db.add(adhoc_fee)
        db.flush()  # Get the ID

        # Create ledger entry for this adhoc fee
        if current_academic_year:
            try:
                ledger_entry = LedgerService.create_fee_assignment_entry(
                    student_id=student.id,
                    academic_year_id=current_academic_year.id,
                    amount=adhoc_fee_data.amount,
                    description=f"{adhoc_fee_data.fee_name} - Adhoc Fee",
                    entry_type=LedgerEntryType.ADHOC_FEE.value,
                    adhoc_fee_id=adhoc_fee.id,
                    transaction_date=adhoc_fee_data.assigned_date,
                    created_by=current_user.id,
                    db=db
                )
            except Exception as e:
                # Log error but don't fail the adhoc fee creation
                print(f"Warning: Failed to create ledger entry for student {student.id}: {str(e)}")

        # Build response with student info
        response = AdhocFeeResponse.model_validate(adhoc_fee)
        response.student_name = f"{student.first_name} {student.last_name}"
        response.student_admission_number = student.admission_number
        response.assigned_by_name = f"{current_user.first_name} {current_user.last_name}"

        created_assignments.append(response)

    db.commit()

    return created_assignments


@router.post("/single", response_model=AdhocFeeResponse, status_code=status.HTTP_201_CREATED)
def create_single_adhoc_fee(
    adhoc_fee_data: AdhocFeeSingleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create adhoc fee assignment for a single student

    Use Case: Assign individual fee (e.g., "Lost ID Card ₹500") to one student
    """
    # Validate student exists
    student = db.query(Student).filter(
        Student.id == adhoc_fee_data.student_id,
        Student.is_active == True
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found or inactive"
        )

    # Create adhoc fee assignment
    adhoc_fee = AdhocFeeAssignment(
        fee_name=adhoc_fee_data.fee_name,
        description=adhoc_fee_data.description,
        amount=adhoc_fee_data.amount,
        assigned_date=adhoc_fee_data.assigned_date,
        due_date=adhoc_fee_data.due_date,
        student_id=student.id,
        paid_amount=Decimal('0.00'),
        outstanding_amount=adhoc_fee_data.amount,
        payment_status='pending',
        is_paid=False,
        assigned_by=current_user.id,
        remarks=adhoc_fee_data.remarks,
        is_active=True,
    )

    db.add(adhoc_fee)
    db.flush()  # Get the ID

    # Create ledger entry for this adhoc fee
    current_academic_year = db.query(AcademicYear).filter(
        AcademicYear.is_current == True
    ).first()

    if current_academic_year:
        try:
            ledger_entry = LedgerService.create_fee_assignment_entry(
                student_id=student.id,
                academic_year_id=current_academic_year.id,
                amount=adhoc_fee_data.amount,
                description=f"{adhoc_fee_data.fee_name} - Adhoc Fee",
                entry_type=LedgerEntryType.ADHOC_FEE.value,
                adhoc_fee_id=adhoc_fee.id,
                transaction_date=adhoc_fee_data.assigned_date,
                created_by=current_user.id,
                db=db
            )
        except Exception as e:
            # Log error but don't fail the adhoc fee creation
            print(f"Warning: Failed to create ledger entry for student {student.id}: {str(e)}")

    db.commit()
    db.refresh(adhoc_fee)

    # Build response with student info
    response = AdhocFeeResponse.model_validate(adhoc_fee)
    response.student_name = f"{student.first_name} {student.last_name}"
    response.student_admission_number = student.admission_number
    response.assigned_by_name = f"{current_user.first_name} {current_user.last_name}"

    return response


@router.get("/", response_model=List[AdhocFeeListResponse])
def list_adhoc_fees(
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    is_paid: Optional[bool] = Query(None, description="Filter by paid status"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    search_query: Optional[str] = Query(None, description="Search by fee name or student name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all adhoc fee assignments with optional filters
    """
    query = db.query(
        AdhocFeeAssignment,
        Student
    ).join(
        Student, AdhocFeeAssignment.student_id == Student.id
    )

    # Apply filters
    if payment_status:
        query = query.filter(AdhocFeeAssignment.payment_status == payment_status)

    if student_id:
        query = query.filter(AdhocFeeAssignment.student_id == student_id)

    if is_paid is not None:
        query = query.filter(AdhocFeeAssignment.is_paid == is_paid)

    if is_active is not None:
        query = query.filter(AdhocFeeAssignment.is_active == is_active)

    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(
            or_(
                AdhocFeeAssignment.fee_name.ilike(search_term),
                Student.first_name.ilike(search_term),
                Student.last_name.ilike(search_term),
                (Student.first_name + ' ' + Student.last_name).ilike(search_term)
            )
        )

    # Order by most recent first
    query = query.order_by(AdhocFeeAssignment.assigned_at.desc())

    results = query.offset(skip).limit(limit).all()

    # Build response list
    response_list = []
    for adhoc_fee, student in results:
        response = AdhocFeeListResponse(
            id=adhoc_fee.id,
            fee_name=adhoc_fee.fee_name,
            amount=adhoc_fee.amount,
            assigned_date=adhoc_fee.assigned_date,
            due_date=adhoc_fee.due_date,
            student_id=student.id,
            student_name=f"{student.first_name} {student.last_name}",
            student_admission_number=student.admission_number,
            paid_amount=adhoc_fee.paid_amount,
            outstanding_amount=adhoc_fee.outstanding_amount,
            payment_status=adhoc_fee.payment_status,
            is_paid=adhoc_fee.is_paid,
            assigned_at=adhoc_fee.assigned_at,
        )
        response_list.append(response)

    return response_list


@router.get("/{adhoc_fee_id}", response_model=AdhocFeeDetailResponse)
def get_adhoc_fee_details(
    adhoc_fee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed adhoc fee assignment information
    """
    adhoc_fee = db.query(AdhocFeeAssignment).options(
        joinedload(AdhocFeeAssignment.student),
        joinedload(AdhocFeeAssignment.assigned_by_user)
    ).filter(
        AdhocFeeAssignment.id == adhoc_fee_id,
        AdhocFeeAssignment.is_active == True
    ).first()

    if not adhoc_fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adhoc fee assignment not found"
        )

    # Build detailed response
    student = adhoc_fee.student
    response = AdhocFeeDetailResponse.model_validate(adhoc_fee)
    response.student_name = f"{student.first_name} {student.last_name}"
    response.student_admission_number = student.admission_number
    response.student_roll_number = student.roll_number
    response.assigned_by_name = f"{adhoc_fee.assigned_by_user.first_name} {adhoc_fee.assigned_by_user.last_name}"

    # Get student's class info
    if student.current_class_id:
        class_info = db.query(Class).filter(Class.id == student.current_class_id).first()
        if class_info:
            response.student_class = class_info.class_name

    return response


@router.put("/{adhoc_fee_id}", response_model=AdhocFeeResponse)
def update_adhoc_fee(
    adhoc_fee_id: int,
    adhoc_fee_update: AdhocFeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update adhoc fee assignment details

    Note: Cannot update student_id or payment amounts (use payment endpoints for that)
    """
    adhoc_fee = db.query(AdhocFeeAssignment).filter(
        AdhocFeeAssignment.id == adhoc_fee_id,
        AdhocFeeAssignment.is_active == True
    ).first()

    if not adhoc_fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adhoc fee assignment not found"
        )

    # Prevent updating if already paid
    if adhoc_fee.is_paid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a paid fee assignment"
        )

    # Update fields
    update_data = adhoc_fee_update.model_dump(exclude_unset=True)

    # If amount is being updated, recalculate outstanding
    if 'amount' in update_data:
        new_amount = update_data['amount']
        adhoc_fee.amount = new_amount
        adhoc_fee.outstanding_amount = float(new_amount) - float(adhoc_fee.paid_amount)
        update_data.pop('amount')  # Remove from dict to avoid double-setting

    for field, value in update_data.items():
        setattr(adhoc_fee, field, value)

    db.commit()
    db.refresh(adhoc_fee)

    # Build response with student info
    student = adhoc_fee.student
    response = AdhocFeeResponse.model_validate(adhoc_fee)
    response.student_name = f"{student.first_name} {student.last_name}"
    response.student_admission_number = student.admission_number

    return response


@router.delete("/{adhoc_fee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_adhoc_fee(
    adhoc_fee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Soft delete adhoc fee assignment (only if not paid)
    """
    adhoc_fee = db.query(AdhocFeeAssignment).filter(
        AdhocFeeAssignment.id == adhoc_fee_id,
        AdhocFeeAssignment.is_active == True
    ).first()

    if not adhoc_fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adhoc fee assignment not found"
        )

    # Prevent deleting if payment has been made
    if float(adhoc_fee.paid_amount) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a fee with existing payments. Contact admin to handle refunds."
        )

    # Soft delete
    adhoc_fee.is_active = False
    adhoc_fee.deleted_at = datetime.utcnow()
    adhoc_fee.deleted_by = current_user.id

    db.commit()

    return None


@router.get("/student/{student_id}", response_model=List[AdhocFeeListResponse])
def get_student_adhoc_fees(
    student_id: int,
    is_paid: Optional[bool] = Query(None, description="Filter by paid status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all adhoc fees assigned to a specific student
    """
    # Validate student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    query = db.query(AdhocFeeAssignment).filter(
        AdhocFeeAssignment.student_id == student_id,
        AdhocFeeAssignment.is_active == True
    )

    if is_paid is not None:
        query = query.filter(AdhocFeeAssignment.is_paid == is_paid)

    query = query.order_by(AdhocFeeAssignment.due_date.asc())
    adhoc_fees = query.all()

    # Build response list
    response_list = []
    for adhoc_fee in adhoc_fees:
        response = AdhocFeeListResponse(
            id=adhoc_fee.id,
            fee_name=adhoc_fee.fee_name,
            amount=adhoc_fee.amount,
            assigned_date=adhoc_fee.assigned_date,
            due_date=adhoc_fee.due_date,
            student_id=student.id,
            student_name=f"{student.first_name} {student.last_name}",
            student_admission_number=student.admission_number,
            paid_amount=adhoc_fee.paid_amount,
            outstanding_amount=adhoc_fee.outstanding_amount,
            payment_status=adhoc_fee.payment_status,
            is_paid=adhoc_fee.is_paid,
            assigned_at=adhoc_fee.assigned_at,
        )
        response_list.append(response)

    return response_list


@router.get("/stats/summary", response_model=AdhocFeeSummary)
def get_adhoc_fees_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall adhoc fees summary statistics
    """
    # Total adhoc fees
    total_count = db.query(func.count(AdhocFeeAssignment.id)).filter(
        AdhocFeeAssignment.is_active == True
    ).scalar() or 0

    # Amount statistics
    total_assigned = db.query(func.sum(AdhocFeeAssignment.amount)).filter(
        AdhocFeeAssignment.is_active == True
    ).scalar() or Decimal('0.00')

    total_paid = db.query(func.sum(AdhocFeeAssignment.paid_amount)).filter(
        AdhocFeeAssignment.is_active == True
    ).scalar() or Decimal('0.00')

    total_outstanding = db.query(func.sum(AdhocFeeAssignment.outstanding_amount)).filter(
        AdhocFeeAssignment.is_active == True
    ).scalar() or Decimal('0.00')

    # Status counts
    pending_count = db.query(func.count(AdhocFeeAssignment.id)).filter(
        AdhocFeeAssignment.is_active == True,
        AdhocFeeAssignment.payment_status == 'pending'
    ).scalar() or 0

    paid_count = db.query(func.count(AdhocFeeAssignment.id)).filter(
        AdhocFeeAssignment.is_active == True,
        AdhocFeeAssignment.is_paid == True
    ).scalar() or 0

    overdue_count = db.query(func.count(AdhocFeeAssignment.id)).filter(
        AdhocFeeAssignment.is_active == True,
        AdhocFeeAssignment.payment_status == 'overdue'
    ).scalar() or 0

    # Calculate collection percentage
    collection_percentage = 0.0
    if float(total_assigned) > 0:
        collection_percentage = round((float(total_paid) / float(total_assigned)) * 100, 2)

    return AdhocFeeSummary(
        total_adhoc_fees=total_count,
        total_amount_assigned=total_assigned,
        total_amount_paid=total_paid,
        total_outstanding=total_outstanding,
        pending_count=pending_count,
        paid_count=paid_count,
        overdue_count=overdue_count,
        collection_percentage=collection_percentage,
    )
