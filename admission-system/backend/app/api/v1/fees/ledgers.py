"""
Student Ledgers API Routes

Endpoints for viewing student fee ledgers and outstanding balances
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from typing import List, Optional
from datetime import datetime
from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User
from ....models.fees import StudentFeeLedger
from ....models.fees.ledger_transaction import StudentLedgerTransaction, LedgerEntryType
from ....models.student import Student, StudentStatus
from ....models.academic import AcademicYear
from ....schemas.fees import StudentFeeLedgerResponse, StudentFeeLedgerSummary
from ....schemas.fees.ledger_transaction import (
    LedgerTransactionResponse,
    LedgerTransactionCreate,
    LedgerTransactionListResponse,
    ManualEntryCreate,
    ReversalRequest
)
from ....services.ledger_service import LedgerService

router = APIRouter()


@router.get("/{student_id}", response_model=StudentFeeLedgerResponse)
async def get_student_ledger(
    student_id: int,
    academic_year_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get student fee ledger with complete details
    """
    query = db.query(StudentFeeLedger).filter(StudentFeeLedger.student_id == student_id)

    if academic_year_id:
        query = query.filter(StudentFeeLedger.academic_year_id == academic_year_id)

    ledger = query.first()

    if not ledger:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ledger for student ID {student_id} not found"
        )

    return ledger


@router.get("/summary/list", response_model=List[StudentFeeLedgerSummary])
async def list_ledger_summaries(
    academic_year_id: Optional[int] = None,
    has_outstanding: Optional[bool] = None,
    has_overdue: Optional[bool] = None,
    is_defaulter: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List student ledger summaries with filtering
    Only shows ledgers for enrolled students

    **Query Parameters:**
    - `academic_year_id`: Filter by academic year
    - `has_outstanding`: Filter by outstanding balance status
    - `has_overdue`: Filter by overdue payment status
    - `is_defaulter`: Filter by defaulter status (90+ days overdue)
    - `skip`: Number of records to skip (pagination)
    - `limit`: Maximum records to return (max 100)
    """
    # Join StudentFeeLedger with Student table to get names and filter by enrolled status
    query = db.query(
        StudentFeeLedger,
        Student.first_name,
        Student.last_name
    ).join(
        Student,
        StudentFeeLedger.student_id == Student.id
    ).filter(
        Student.status == StudentStatus.ENROLLED
    )

    # Apply filters
    if academic_year_id:
        query = query.filter(StudentFeeLedger.academic_year_id == academic_year_id)

    if has_outstanding is not None:
        query = query.filter(StudentFeeLedger.has_outstanding == has_outstanding)

    if has_overdue is not None:
        query = query.filter(StudentFeeLedger.has_overdue == has_overdue)

    if is_defaulter is not None:
        query = query.filter(StudentFeeLedger.is_defaulter == is_defaulter)

    # Apply pagination
    results = query.offset(skip).limit(limit).all()

    # Convert to response format
    ledger_summaries = []
    for ledger, first_name, last_name in results:
        ledger_dict = ledger.__dict__.copy()
        ledger_dict['first_name'] = first_name
        ledger_dict['last_name'] = last_name
        ledger_summaries.append(StudentFeeLedgerSummary.model_validate(ledger_dict))

    return ledger_summaries


@router.get("/defaulters/list", response_model=List[StudentFeeLedgerSummary])
async def list_defaulters(
    academic_year_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List students with 90+ days overdue payments (defaulters)
    """
    query = db.query(StudentFeeLedger).filter(StudentFeeLedger.is_defaulter == True)

    if academic_year_id:
        query = query.filter(StudentFeeLedger.academic_year_id == academic_year_id)

    # Order by outstanding amount (highest first)
    query = query.order_by(StudentFeeLedger.total_outstanding.desc())

    # Apply pagination
    defaulters = query.offset(skip).limit(limit).all()

    return defaulters


@router.get("/transactions/{student_id}", response_model=LedgerTransactionListResponse)
async def get_student_ledger_transactions(
    student_id: int,
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    entry_type: Optional[str] = Query(None, description="Filter by entry type"),
    start_date: Optional[datetime] = Query(None, description="Filter from date"),
    end_date: Optional[datetime] = Query(None, description="Filter to date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get student ledger transaction timeline (like a bank statement)

    Returns all transactions for a student with filtering options.
    Transactions are ordered by most recent first.
    """
    # Validate student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} not found"
        )

    # Build query
    query = db.query(StudentLedgerTransaction).filter(
        StudentLedgerTransaction.student_id == student_id
    )

    # Apply filters
    if academic_year_id:
        query = query.filter(StudentLedgerTransaction.academic_year_id == academic_year_id)

    if entry_type:
        query = query.filter(StudentLedgerTransaction.entry_type == entry_type)

    if start_date:
        query = query.filter(StudentLedgerTransaction.transaction_date >= start_date)

    if end_date:
        query = query.filter(StudentLedgerTransaction.transaction_date <= end_date)

    # Count total
    total_count = query.count()

    # Order by most recent first
    query = query.order_by(desc(StudentLedgerTransaction.transaction_date), desc(StudentLedgerTransaction.id))

    # Paginate
    transactions = query.offset(skip).limit(limit).all()

    # Build response
    transaction_list = [LedgerTransactionResponse.model_validate(txn) for txn in transactions]

    # Calculate summary
    summary = LedgerService.get_ledger_summary(student_id, academic_year_id, db)

    total_pages = (total_count + limit - 1) // limit

    return LedgerTransactionListResponse(
        transactions=transaction_list,
        total_count=total_count,
        page_number=(skip // limit) + 1,
        page_size=limit,
        total_pages=total_pages,
        current_balance=summary['current_balance'] if summary else 0,
        total_debits=summary['total_debits'] if summary else 0,
        total_credits=summary['total_credits'] if summary else 0
    )


@router.post("/manual-entry", response_model=LedgerTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_manual_ledger_entry(
    entry_data: ManualEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a manual ledger entry (admin only)

    Use cases:
    - Record offline payments
    - Apply discounts/waivers
    - Issue refunds
    - Make manual corrections

    **Note**: This creates a ledger entry but does NOT automatically update
    fee assignments. Use the payment endpoints for automatic fee allocation.
    """
    # Validate student exists
    student = db.query(Student).filter(Student.id == entry_data.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {entry_data.student_id} not found"
        )

    # Validate academic year exists
    academic_year = db.query(AcademicYear).filter(
        AcademicYear.id == entry_data.academic_year_id
    ).first()
    if not academic_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Academic year with ID {entry_data.academic_year_id} not found"
        )

    # Determine which service method to call based on entry type
    try:
        if entry_data.entry_type in [
            LedgerEntryType.DISCOUNT.value,
            LedgerEntryType.WAIVER.value,
            LedgerEntryType.REFUND.value,
            LedgerEntryType.LATE_FEE_REVERSAL.value,
            LedgerEntryType.WRITE_OFF.value
        ]:
            # Credit adjustments
            ledger_entry = LedgerService.create_adjustment_entry(
                student_id=entry_data.student_id,
                academic_year_id=entry_data.academic_year_id,
                amount=entry_data.amount,
                description=entry_data.description,
                adjustment_type=entry_data.entry_type,
                transaction_date=entry_data.transaction_date or datetime.utcnow(),
                created_by=current_user.id,
                remarks=entry_data.remarks,
                db=db
            )
        else:
            # Default to generic entry creation
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported entry type: {entry_data.entry_type}. Use payment endpoints for payment entries."
            )

        db.commit()
        db.refresh(ledger_entry)

        return LedgerTransactionResponse.model_validate(ledger_entry)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ledger entry: {str(e)}"
        )


@router.post("/reversal", response_model=LedgerTransactionResponse, status_code=status.HTTP_201_CREATED)
async def reverse_ledger_transaction(
    reversal_data: ReversalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reverse a ledger transaction (admin only)

    Creates a reversal entry that cancels out the original transaction.
    This maintains the audit trail while correcting errors.

    **Example**: If ₹5000 was debited by mistake, this creates a ₹5000 credit
    that references the original transaction.
    """
    # Validate original transaction exists
    original_txn = db.query(StudentLedgerTransaction).filter(
        StudentLedgerTransaction.id == reversal_data.transaction_id
    ).first()

    if not original_txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {reversal_data.transaction_id} not found"
        )

    # Check if already reversed
    if original_txn.is_reversed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction {reversal_data.transaction_id} has already been reversed"
        )

    # Check if locked
    if original_txn.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction {reversal_data.transaction_id} is locked and cannot be reversed"
        )

    try:
        # Create reversal entry
        reversal_entry = original_txn.create_reversal(
            reversed_by=current_user.id,
            reversal_reason=reversal_data.reason,
            db=db
        )

        db.commit()
        db.refresh(reversal_entry)

        return LedgerTransactionResponse.model_validate(reversal_entry)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reverse transaction: {str(e)}"
        )
