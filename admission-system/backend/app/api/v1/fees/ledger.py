"""
Student Ledger API Endpoints
Handles student financial ledger operations - the single source of truth for student finances
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from ....core.database import get_db
from ....core.security import get_current_user
from ....models.fees.ledger_transaction import StudentLedgerTransaction, LedgerEntryType
from ....models.student import Student
from ....models.academic import AcademicYear
from ....models.user import User
from ....schemas.fees.ledger_transaction import (
    ManualLedgerEntryCreate,
    LedgerTransactionResponse,
    LedgerTimelineItem,
    LedgerSummary,
    ReversalRequest,
    StudentLedgerDetail,
)
from ....services.ledger_service import LedgerService

router = APIRouter()


@router.get("/student/{student_id}", response_model=StudentLedgerDetail)
def get_student_ledger_timeline(
    student_id: int,
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    entry_type: Optional[str] = Query(None, description="Filter by entry type"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get student's complete financial ledger timeline with transactions

    Returns:
    - Student details
    - Ledger summary (total debits, credits, balance)
    - Timeline of transactions (paginated)
    """
    # Verify student exists
    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
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

    # Get summary (before pagination)
    summary_query = db.query(
        func.sum(StudentLedgerTransaction.debit_amount).label('total_debits'),
        func.sum(StudentLedgerTransaction.credit_amount).label('total_credits'),
        func.count(StudentLedgerTransaction.id).label('transaction_count')
    ).filter(StudentLedgerTransaction.student_id == student_id)

    if academic_year_id:
        summary_query = summary_query.filter(StudentLedgerTransaction.academic_year_id == academic_year_id)

    summary_result = summary_query.first()

    total_debits = Decimal(summary_result.total_debits or 0)
    total_credits = Decimal(summary_result.total_credits or 0)
    current_balance = total_debits - total_credits
    transaction_count = summary_result.transaction_count or 0

    # Get timeline (paginated, most recent first)
    transactions = query.order_by(
        desc(StudentLedgerTransaction.transaction_date),
        desc(StudentLedgerTransaction.id)
    ).offset(skip).limit(limit).all()

    # Build timeline items
    timeline = []
    for txn in transactions:
        timeline.append(LedgerTimelineItem(
            id=txn.id,
            transaction_number=txn.transaction_number,
            transaction_date=txn.transaction_date,
            entry_type=txn.entry_type,
            description=txn.description,
            debit_amount=txn.debit_amount,
            credit_amount=txn.credit_amount,
            balance=txn.balance,
            payment_method=txn.payment_method,
            is_reversed=txn.is_reversed,
            created_at=txn.created_at
        ))

    # Build response
    return StudentLedgerDetail(
        student_id=student.id,
        student_name=f"{student.first_name} {student.last_name}",
        admission_number=student.admission_number,
        roll_number=student.roll_number,
        summary=LedgerSummary(
            total_debits=total_debits,
            total_credits=total_credits,
            current_balance=current_balance,
            transaction_count=transaction_count
        ),
        timeline=timeline,
        total_transactions=transaction_count,
        page_size=limit,
        page_number=(skip // limit) + 1 if limit > 0 else 1
    )


@router.get("/student/{student_id}/summary", response_model=LedgerSummary)
def get_student_ledger_summary(
    student_id: int,
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get student's ledger summary (total debits, credits, balance)
    Lightweight endpoint for dashboard display
    """
    # Verify student exists
    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Get summary using service
    summary = LedgerService.get_ledger_summary(student_id, academic_year_id, db)

    return LedgerSummary(
        total_debits=summary['total_debits'],
        total_credits=summary['total_credits'],
        current_balance=summary['current_balance'],
        transaction_count=summary['transaction_count']
    )


@router.post("/manual-entry", response_model=LedgerTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_manual_ledger_entry(
    entry_data: ManualLedgerEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create manual ledger entry (for offline payments, adjustments, etc.)

    Only admins can create manual entries.
    Used for: cash payments, bank transfers, waivers, adjustments
    """
    # Verify student exists
    student = db.query(Student).filter(Student.id == entry_data.student_id).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Verify academic year exists
    academic_year = db.query(AcademicYear).filter(
        AcademicYear.id == entry_data.academic_year_id
    ).first()

    if not academic_year:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic year not found"
        )

    # Determine if this is a debit (fee) or credit (payment)
    if entry_data.entry_type in [
        LedgerEntryType.PAYMENT_ONLINE.value,
        LedgerEntryType.PAYMENT_CASH.value,
        LedgerEntryType.PAYMENT_CHEQUE.value,
        LedgerEntryType.PAYMENT_BANK_TRANSFER.value,
        LedgerEntryType.PAYMENT_UPI.value,
        LedgerEntryType.REFUND.value,
        LedgerEntryType.WAIVER.value
    ]:
        # This is a credit (reduces balance)
        transaction = LedgerService.create_payment_entry(
            student_id=entry_data.student_id,
            academic_year_id=entry_data.academic_year_id,
            amount=entry_data.amount,
            description=entry_data.description or f"Manual {entry_data.entry_type} entry",
            payment_method=entry_data.payment_method,
            payment_reference=entry_data.payment_reference,
            entry_type=entry_data.entry_type,
            transaction_date=entry_data.transaction_date,
            created_by=current_user.id,
            db=db
        )
    elif entry_data.entry_type in [
        LedgerEntryType.FEE_SESSION.value,
        LedgerEntryType.FEE_ADHOC.value,
        LedgerEntryType.FINE.value,
        LedgerEntryType.LATE_FEE.value
    ]:
        # This is a debit (increases balance)
        transaction = LedgerService.create_fee_assignment_entry(
            student_id=entry_data.student_id,
            academic_year_id=entry_data.academic_year_id,
            amount=entry_data.amount,
            description=entry_data.description or f"Manual {entry_data.entry_type} entry",
            entry_type=entry_data.entry_type,
            transaction_date=entry_data.transaction_date,
            created_by=current_user.id,
            db=db
        )
    elif entry_data.entry_type in [
        LedgerEntryType.ADJUSTMENT_DEBIT.value,
        LedgerEntryType.ADJUSTMENT_CREDIT.value
    ]:
        # This is an adjustment
        adjustment_type = entry_data.entry_type.replace("adjustment_", "")
        transaction = LedgerService.create_adjustment_entry(
            student_id=entry_data.student_id,
            academic_year_id=entry_data.academic_year_id,
            amount=entry_data.amount,
            adjustment_type=adjustment_type,
            reason=entry_data.description or "Manual adjustment",
            transaction_date=entry_data.transaction_date,
            created_by=current_user.id,
            db=db
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported entry type: {entry_data.entry_type}"
        )

    return LedgerTransactionResponse.model_validate(transaction)


@router.post("/reversal", response_model=LedgerTransactionResponse, status_code=status.HTTP_201_CREATED)
def reverse_transaction(
    reversal_data: ReversalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reverse a ledger transaction (create opposite entry)

    Used for: correcting mistakes, canceling fees, reversing payments
    Does NOT delete original transaction (maintains audit trail)
    """
    # Get original transaction
    original_txn = db.query(StudentLedgerTransaction).filter(
        StudentLedgerTransaction.id == reversal_data.transaction_id
    ).first()

    if not original_txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    # Check if already reversed
    if original_txn.is_reversed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction has already been reversed"
        )

    # Check if transaction is locked
    if original_txn.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction is locked and cannot be reversed"
        )

    # Get current balance
    current_balance = LedgerService.get_current_balance(
        original_txn.student_id,
        original_txn.academic_year_id,
        db
    )

    # Generate reversal transaction number
    reversal_txn_number = f"REV-{original_txn.transaction_number}"

    # Create reversal entry (flip debit/credit)
    reversal_txn = StudentLedgerTransaction(
        transaction_number=reversal_txn_number,
        transaction_date=datetime.utcnow(),
        student_id=original_txn.student_id,
        academic_year_id=original_txn.academic_year_id,
        entry_type=f"{original_txn.entry_type}_REVERSAL",
        description=f"REVERSAL: {reversal_data.reason or original_txn.description}",
        # Flip debit and credit
        debit_amount=original_txn.credit_amount,
        credit_amount=original_txn.debit_amount,
        balance=current_balance + original_txn.credit_amount - original_txn.debit_amount,
        payment_method=original_txn.payment_method,
        payment_reference=original_txn.payment_reference,
        reference_type=original_txn.reference_type,
        reference_id=original_txn.reference_id,
        fee_session_id=original_txn.fee_session_id,
        adhoc_fee_id=original_txn.adhoc_fee_id,
        payment_id=original_txn.payment_id,
        reverses_transaction_id=original_txn.id,
        created_by=current_user.id,
        remarks=reversal_data.reason
    )

    db.add(reversal_txn)
    db.flush()

    # Mark original transaction as reversed
    original_txn.is_reversed = True
    original_txn.reversal_transaction_id = reversal_txn.id

    db.commit()
    db.refresh(reversal_txn)

    return LedgerTransactionResponse.model_validate(reversal_txn)


@router.get("/transaction/{transaction_id}", response_model=LedgerTransactionResponse)
def get_transaction_details(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific transaction
    """
    transaction = db.query(StudentLedgerTransaction).filter(
        StudentLedgerTransaction.id == transaction_id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return LedgerTransactionResponse.model_validate(transaction)


@router.get("/stats")
def get_ledger_statistics(
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall ledger statistics (admin dashboard)

    Returns:
    - Total transactions
    - Total debits (fees assigned)
    - Total credits (payments received)
    - Net outstanding balance
    - Transaction breakdown by type
    """
    query = db.query(StudentLedgerTransaction)

    if academic_year_id:
        query = query.filter(StudentLedgerTransaction.academic_year_id == academic_year_id)

    # Overall stats
    stats_query = db.query(
        func.count(StudentLedgerTransaction.id).label('total_transactions'),
        func.sum(StudentLedgerTransaction.debit_amount).label('total_debits'),
        func.sum(StudentLedgerTransaction.credit_amount).label('total_credits')
    )

    if academic_year_id:
        stats_query = stats_query.filter(StudentLedgerTransaction.academic_year_id == academic_year_id)

    stats = stats_query.first()

    total_transactions = stats.total_transactions or 0
    total_debits = Decimal(stats.total_debits or 0)
    total_credits = Decimal(stats.total_credits or 0)
    net_outstanding = total_debits - total_credits

    # Breakdown by entry type
    breakdown_query = db.query(
        StudentLedgerTransaction.entry_type,
        func.count(StudentLedgerTransaction.id).label('count'),
        func.sum(StudentLedgerTransaction.debit_amount).label('debit_total'),
        func.sum(StudentLedgerTransaction.credit_amount).label('credit_total')
    )

    if academic_year_id:
        breakdown_query = breakdown_query.filter(StudentLedgerTransaction.academic_year_id == academic_year_id)

    breakdown_query = breakdown_query.group_by(StudentLedgerTransaction.entry_type)
    breakdown_results = breakdown_query.all()

    breakdown = []
    for result in breakdown_results:
        breakdown.append({
            'entry_type': result.entry_type,
            'count': result.count,
            'debit_total': float(result.debit_total or 0),
            'credit_total': float(result.credit_total or 0)
        })

    return {
        'total_transactions': total_transactions,
        'total_debits': float(total_debits),
        'total_credits': float(total_credits),
        'net_outstanding': float(net_outstanding),
        'breakdown_by_type': breakdown
    }


@router.get("/export/{student_id}")
def export_student_ledger(
    student_id: int,
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    format: str = Query("pdf", description="Export format (pdf, csv, excel)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export student ledger as PDF/CSV/Excel

    TODO: Implement PDF generation using ReportLab or WeasyPrint
    TODO: Implement CSV export
    TODO: Implement Excel export using openpyxl
    """
    # Verify student exists
    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # For now, return a placeholder response
    # This endpoint will be implemented in a later phase
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Export functionality will be implemented in Phase 3"
    )


@router.get("/search")
def search_transactions(
    query: str = Query(..., min_length=2, description="Search query"),
    academic_year_id: Optional[int] = Query(None, description="Filter by academic year"),
    entry_type: Optional[str] = Query(None, description="Filter by entry type"),
    min_amount: Optional[Decimal] = Query(None, description="Minimum amount"),
    max_amount: Optional[Decimal] = Query(None, description="Maximum amount"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search transactions by description, transaction number, or student name
    """
    # Build base query
    search_query = db.query(
        StudentLedgerTransaction,
        Student
    ).join(
        Student, StudentLedgerTransaction.student_id == Student.id
    )

    # Search filter
    search_term = f"%{query}%"
    search_query = search_query.filter(
        or_(
            StudentLedgerTransaction.description.ilike(search_term),
            StudentLedgerTransaction.transaction_number.ilike(search_term),
            Student.first_name.ilike(search_term),
            Student.last_name.ilike(search_term),
            (Student.first_name + ' ' + Student.last_name).ilike(search_term)
        )
    )

    # Apply filters
    if academic_year_id:
        search_query = search_query.filter(StudentLedgerTransaction.academic_year_id == academic_year_id)

    if entry_type:
        search_query = search_query.filter(StudentLedgerTransaction.entry_type == entry_type)

    if min_amount is not None:
        search_query = search_query.filter(
            or_(
                StudentLedgerTransaction.debit_amount >= min_amount,
                StudentLedgerTransaction.credit_amount >= min_amount
            )
        )

    if max_amount is not None:
        search_query = search_query.filter(
            or_(
                StudentLedgerTransaction.debit_amount <= max_amount,
                StudentLedgerTransaction.credit_amount <= max_amount
            )
        )

    if start_date:
        search_query = search_query.filter(StudentLedgerTransaction.transaction_date >= start_date)

    if end_date:
        search_query = search_query.filter(StudentLedgerTransaction.transaction_date <= end_date)

    # Order by most recent first
    search_query = search_query.order_by(
        desc(StudentLedgerTransaction.transaction_date),
        desc(StudentLedgerTransaction.id)
    )

    # Count total results
    total_count = search_query.count()

    # Paginate
    results = search_query.offset(skip).limit(limit).all()

    # Build response
    transactions = []
    for txn, student in results:
        transactions.append({
            'id': txn.id,
            'transaction_number': txn.transaction_number,
            'transaction_date': txn.transaction_date,
            'student_id': student.id,
            'student_name': f"{student.first_name} {student.last_name}",
            'admission_number': student.admission_number,
            'entry_type': txn.entry_type,
            'description': txn.description,
            'debit_amount': float(txn.debit_amount),
            'credit_amount': float(txn.credit_amount),
            'balance': float(txn.balance),
            'payment_method': txn.payment_method,
            'is_reversed': txn.is_reversed
        })

    return {
        'total_count': total_count,
        'page_size': limit,
        'page_number': (skip // limit) + 1 if limit > 0 else 1,
        'transactions': transactions
    }
