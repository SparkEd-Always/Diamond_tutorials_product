"""
Student Ledger Service
Handles creation and management of ledger transactions

Core Responsibilities:
- Create ledger entries for fee assignments
- Create ledger entries for payments
- Calculate running balances
- Generate transaction numbers
- Enforce immutability
"""
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime
from typing import Optional, List
from ..models.fees.ledger_transaction import StudentLedgerTransaction, LedgerEntryType
from ..models.academic import AcademicYear


class LedgerService:
    """Service for managing student ledger transactions"""

    @staticmethod
    def get_current_balance(student_id: int, academic_year_id: int, db: Session) -> Decimal:
        """
        Get current balance for a student in an academic year
        Returns the balance from the most recent transaction
        """
        latest_txn = db.query(StudentLedgerTransaction).filter(
            StudentLedgerTransaction.student_id == student_id,
            StudentLedgerTransaction.academic_year_id == academic_year_id
        ).order_by(StudentLedgerTransaction.id.desc()).first()

        return Decimal(latest_txn.balance) if latest_txn else Decimal('0.00')

    @staticmethod
    def create_fee_assignment_entry(
        student_id: int,
        academic_year_id: int,
        amount: Decimal,
        description: str,
        fee_session_id: Optional[int] = None,
        adhoc_fee_id: Optional[int] = None,
        transaction_date: Optional[datetime] = None,
        created_by: Optional[int] = None,
        remarks: Optional[str] = None,
        db: Session = None
    ) -> StudentLedgerTransaction:
        """
        Create a ledger entry for fee assignment (debit)

        Args:
            student_id: Student ID
            academic_year_id: Academic year ID
            amount: Fee amount (positive value)
            description: Human-readable description
            fee_session_id: Optional fee session reference
            adhoc_fee_id: Optional adhoc fee reference
            transaction_date: When the fee was assigned (defaults to now)
            created_by: Admin user ID
            remarks: Additional notes
            db: Database session

        Returns:
            Created ledger transaction
        """
        # Get current balance
        current_balance = LedgerService.get_current_balance(student_id, academic_year_id, db)

        # Calculate new balance (fee increases balance owed)
        new_balance = current_balance + Decimal(amount)

        # Get academic year for transaction number
        academic_year = db.query(AcademicYear).filter(AcademicYear.id == academic_year_id).first()

        # Determine entry type and reference
        if adhoc_fee_id:
            entry_type = LedgerEntryType.ADHOC_FEE
            reference_type = 'adhoc_fee'
            reference_id = adhoc_fee_id
        elif fee_session_id:
            entry_type = LedgerEntryType.FEE_ASSIGNMENT
            reference_type = 'fee_session'
            reference_id = fee_session_id
        else:
            entry_type = LedgerEntryType.FEE_ASSIGNMENT
            reference_type = 'manual'
            reference_id = None

        # Create transaction
        transaction = StudentLedgerTransaction(
            transaction_number=StudentLedgerTransaction.generate_transaction_number(academic_year.year_name, db),
            transaction_date=transaction_date or datetime.utcnow(),
            student_id=student_id,
            academic_year_id=academic_year_id,
            entry_type=entry_type,
            debit_amount=Decimal(amount),
            credit_amount=Decimal('0.00'),
            balance=new_balance,
            reference_type=reference_type,
            reference_id=reference_id,
            fee_session_id=fee_session_id,
            adhoc_fee_id=adhoc_fee_id,
            description=description,
            remarks=remarks,
            created_by=created_by,
            is_locked=True,
        )

        db.add(transaction)
        db.flush()  # Get ID without committing

        return transaction

    @staticmethod
    def create_payment_entry(
        student_id: int,
        academic_year_id: int,
        amount: Decimal,
        description: str,
        payment_method: str,
        payment_id: Optional[int] = None,
        transaction_date: Optional[datetime] = None,
        created_by: Optional[int] = None,
        remarks: Optional[str] = None,
        metadata: Optional[dict] = None,
        db: Session = None
    ) -> StudentLedgerTransaction:
        """
        Create a ledger entry for payment received (credit)

        Args:
            student_id: Student ID
            academic_year_id: Academic year ID
            amount: Payment amount (positive value)
            description: Human-readable description
            payment_method: Payment method (cash, online, cheque, etc.)
            payment_id: Optional payment record reference
            transaction_date: When payment was received (defaults to now)
            created_by: Admin user ID (for manual entries)
            remarks: Additional notes
            metadata: Additional payment details (JSON)
            db: Database session

        Returns:
            Created ledger transaction
        """
        # Get current balance
        current_balance = LedgerService.get_current_balance(student_id, academic_year_id, db)

        # Calculate new balance (payment reduces balance owed)
        new_balance = current_balance - Decimal(amount)

        # Get academic year for transaction number
        academic_year = db.query(AcademicYear).filter(AcademicYear.id == academic_year_id).first()

        # Determine entry type based on payment method
        payment_method_lower = payment_method.lower()
        if 'online' in payment_method_lower or 'upi' in payment_method_lower or 'card' in payment_method_lower:
            entry_type = LedgerEntryType.PAYMENT_ONLINE
        elif 'cash' in payment_method_lower:
            entry_type = LedgerEntryType.PAYMENT_CASH
        elif 'cheque' in payment_method_lower or 'check' in payment_method_lower:
            entry_type = LedgerEntryType.PAYMENT_CHEQUE
        elif 'dd' in payment_method_lower or 'demand draft' in payment_method_lower:
            entry_type = LedgerEntryType.PAYMENT_DD
        elif 'bank transfer' in payment_method_lower or 'neft' in payment_method_lower or 'rtgs' in payment_method_lower:
            entry_type = LedgerEntryType.PAYMENT_BANK_TRANSFER
        else:
            entry_type = LedgerEntryType.PAYMENT_CASH  # Default

        # Create transaction
        transaction = StudentLedgerTransaction(
            transaction_number=StudentLedgerTransaction.generate_transaction_number(academic_year.year_name, db),
            transaction_date=transaction_date or datetime.utcnow(),
            student_id=student_id,
            academic_year_id=academic_year_id,
            entry_type=entry_type,
            debit_amount=Decimal('0.00'),
            credit_amount=Decimal(amount),
            balance=new_balance,
            reference_type='payment',
            reference_id=payment_id,
            payment_id=payment_id,
            payment_method=payment_method,
            description=description,
            remarks=remarks,
            transaction_metadata=metadata,
            created_by=created_by,
            is_locked=True,
        )

        db.add(transaction)
        db.flush()

        return transaction

    @staticmethod
    def create_adjustment_entry(
        student_id: int,
        academic_year_id: int,
        amount: Decimal,
        adjustment_type: str,  # 'discount', 'waiver', 'scholarship', 'refund', 'adjustment_credit', 'adjustment_debit'
        description: str,
        transaction_date: Optional[datetime] = None,
        created_by: Optional[int] = None,
        remarks: Optional[str] = None,
        db: Session = None
    ) -> StudentLedgerTransaction:
        """
        Create a ledger entry for adjustments (discounts, waivers, etc.)

        Args:
            student_id: Student ID
            academic_year_id: Academic year ID
            amount: Adjustment amount (positive value)
            adjustment_type: Type of adjustment (discount, waiver, etc.)
            description: Human-readable description
            transaction_date: When adjustment was made (defaults to now)
            created_by: Admin user ID
            remarks: Additional notes
            db: Database session

        Returns:
            Created ledger transaction
        """
        # Get current balance
        current_balance = LedgerService.get_current_balance(student_id, academic_year_id, db)

        # Get academic year for transaction number
        academic_year = db.query(AcademicYear).filter(AcademicYear.id == academic_year_id).first()

        # Determine if this is a debit or credit adjustment
        is_credit_adjustment = adjustment_type in ['discount', 'waiver', 'scholarship', 'refund', 'adjustment_credit']

        if is_credit_adjustment:
            # Credit adjustments reduce balance owed
            debit_amt = Decimal('0.00')
            credit_amt = Decimal(amount)
            new_balance = current_balance - Decimal(amount)
        else:
            # Debit adjustments increase balance owed
            debit_amt = Decimal(amount)
            credit_amt = Decimal('0.00')
            new_balance = current_balance + Decimal(amount)

        # Map adjustment_type to LedgerEntryType
        entry_type_map = {
            'discount': LedgerEntryType.DISCOUNT,
            'waiver': LedgerEntryType.WAIVER,
            'scholarship': LedgerEntryType.SCHOLARSHIP,
            'refund': LedgerEntryType.REFUND,
            'adjustment_credit': LedgerEntryType.ADJUSTMENT_CREDIT,
            'adjustment_debit': LedgerEntryType.ADJUSTMENT_DEBIT,
            'fine': LedgerEntryType.FINE,
            'late_fee': LedgerEntryType.LATE_FEE,
        }

        entry_type = entry_type_map.get(adjustment_type, LedgerEntryType.ADJUSTMENT_CREDIT)

        # Create transaction
        transaction = StudentLedgerTransaction(
            transaction_number=StudentLedgerTransaction.generate_transaction_number(academic_year.year_name, db),
            transaction_date=transaction_date or datetime.utcnow(),
            student_id=student_id,
            academic_year_id=academic_year_id,
            entry_type=entry_type,
            debit_amount=debit_amt,
            credit_amount=credit_amt,
            balance=new_balance,
            reference_type='adjustment',
            reference_id=None,
            description=description,
            remarks=remarks,
            created_by=created_by,
            is_locked=True,
        )

        db.add(transaction)
        db.flush()

        return transaction

    @staticmethod
    def get_student_ledger_timeline(
        student_id: int,
        academic_year_id: Optional[int] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = 0,
        db: Session = None
    ) -> List[StudentLedgerTransaction]:
        """
        Get ledger timeline for a student

        Args:
            student_id: Student ID
            academic_year_id: Optional filter by academic year
            limit: Optional limit results
            offset: Optional offset for pagination
            db: Database session

        Returns:
            List of ledger transactions (chronological order)
        """
        query = db.query(StudentLedgerTransaction).filter(
            StudentLedgerTransaction.student_id == student_id
        )

        if academic_year_id:
            query = query.filter(StudentLedgerTransaction.academic_year_id == academic_year_id)

        query = query.order_by(StudentLedgerTransaction.transaction_date.desc(), StudentLedgerTransaction.id.desc())

        if limit:
            query = query.limit(limit).offset(offset)

        return query.all()

    @staticmethod
    def get_ledger_summary(
        student_id: int,
        academic_year_id: int,
        db: Session
    ) -> dict:
        """
        Get financial summary for a student

        Returns:
            Dict with total debits, credits, balance, transaction count
        """
        transactions = db.query(StudentLedgerTransaction).filter(
            StudentLedgerTransaction.student_id == student_id,
            StudentLedgerTransaction.academic_year_id == academic_year_id
        ).all()

        if not transactions:
            return {
                'total_debits': Decimal('0.00'),
                'total_credits': Decimal('0.00'),
                'current_balance': Decimal('0.00'),
                'transaction_count': 0,
                'first_transaction_date': None,
                'last_transaction_date': None,
            }

        total_debits = sum(t.debit_amount for t in transactions)
        total_credits = sum(t.credit_amount for t in transactions)
        current_balance = transactions[0].balance if transactions else Decimal('0.00')  # Latest balance

        return {
            'total_debits': total_debits,
            'total_credits': total_credits,
            'current_balance': current_balance,
            'transaction_count': len(transactions),
            'first_transaction_date': min(t.transaction_date for t in transactions),
            'last_transaction_date': max(t.transaction_date for t in transactions),
        }
