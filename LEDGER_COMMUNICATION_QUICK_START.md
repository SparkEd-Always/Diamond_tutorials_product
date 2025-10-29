# Ledger-Communication Integration Quick Start Guide

## Overview

This guide provides ready-to-use code snippets to quickly integrate the Student Ledger with the Parent Communication System.

**Time to Implement**: 2-3 hours for basic integration

---

## Step 1: Create Financial Notification Service (30 minutes)

**File**: `admission-system/backend/app/services/financial_notification_service.py`

```python
"""
Financial Notification Service
Automatically notifies parents about financial transactions
"""
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
from datetime import datetime

from ..models.fees.ledger_transaction import StudentLedgerTransaction, LedgerEntryType
from ..models.student import Student
from ..models.user import User, UserRole
from ..models.application import Application
from ..models.communication import Message, MessageDelivery, MessageType, DeliveryStatus
from ..schemas.communication import MessageCreate


class FinancialNotificationService:
    """
    Service for sending automated financial notifications to parents
    """

    @staticmethod
    def _get_parent_users(student_id: int, db: Session) -> list[User]:
        """
        Find all parent users for a given student
        Returns list of User objects with role='parent'
        """
        # Get student's application
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student or not student.application_id:
            return []

        # Get application
        application = db.query(Application).filter(
            Application.id == student.application_id
        ).first()

        if not application or not application.user_id:
            return []

        # Get parent user
        parent_user = db.query(User).filter(
            User.id == application.user_id,
            User.role == UserRole.PARENT
        ).first()

        return [parent_user] if parent_user else []

    @staticmethod
    def _send_notification(
        parent_user_id: int,
        subject: str,
        body: str,
        student_id: int,
        transaction_id: Optional[int],
        db: Session
    ) -> Optional[Message]:
        """
        Send a direct notification to a parent
        """
        try:
            # Create message
            message = Message(
                sender_id=1,  # System user (you may want to create a dedicated system user)
                message_type=MessageType.DIRECT,
                subject=subject,
                body=body,
                sent_at=datetime.utcnow()
            )
            db.add(message)
            db.flush()

            # Create delivery record
            delivery = MessageDelivery(
                message_id=message.id,
                recipient_id=parent_user_id,
                status=DeliveryStatus.SENT,
                channel_app=True,
                channel_sms=False,
                channel_email=False
            )
            db.add(delivery)

            # TODO: Log to financial_notification_history table (Phase 2)

            db.commit()
            return message

        except Exception as e:
            db.rollback()
            print(f"Error sending notification: {str(e)}")
            return None

    @staticmethod
    def notify_fee_assigned(
        transaction: StudentLedgerTransaction,
        fee_description: str,
        due_date: Optional[str],
        db: Session
    ):
        """
        Notify parent when a fee is assigned to their student

        Args:
            transaction: The ledger transaction object
            fee_description: Description of the fee (e.g., "Tuition Q1 2024-25")
            due_date: Due date for payment (e.g., "2025-11-15")
            db: Database session
        """
        # Get student
        student = db.query(Student).filter(Student.id == transaction.student_id).first()
        if not student:
            return

        # Get parent users
        parents = FinancialNotificationService._get_parent_users(student.id, db)
        if not parents:
            return

        # Format amounts
        amount_str = f"₹{transaction.debit_amount:,.2f}"
        balance_str = f"₹{transaction.balance:,.2f}"
        due_date_formatted = datetime.fromisoformat(due_date).strftime("%B %d, %Y") if due_date else "Not specified"

        # Create message
        subject = f"New Fee Assigned - {fee_description}"
        body = f"""Dear Parent,

A new fee has been assigned to {student.first_name} {student.last_name}.

Fee Details:
• Description: {fee_description}
• Amount: {amount_str}
• Due Date: {due_date_formatted}
• Current Balance: {balance_str}

Please make the payment before the due date to avoid late fees.

Transaction ID: {transaction.transaction_number}

You can view the complete fee details and make payment through the parent portal.

Thank you.
"""

        # Send to all parent users
        for parent in parents:
            FinancialNotificationService._send_notification(
                parent_user_id=parent.id,
                subject=subject,
                body=body,
                student_id=student.id,
                transaction_id=transaction.id,
                db=db
            )

    @staticmethod
    def notify_payment_received(
        transaction: StudentLedgerTransaction,
        receipt_number: Optional[str],
        db: Session
    ):
        """
        Notify parent when payment is received

        Args:
            transaction: The ledger transaction object
            receipt_number: Receipt number (optional)
            db: Database session
        """
        # Get student
        student = db.query(Student).filter(Student.id == transaction.student_id).first()
        if not student:
            return

        # Get parent users
        parents = FinancialNotificationService._get_parent_users(student.id, db)
        if not parents:
            return

        # Format amounts
        amount_str = f"₹{transaction.credit_amount:,.2f}"
        balance_str = f"₹{transaction.balance:,.2f}"
        payment_method = transaction.payment_method or "Not specified"
        payment_date = transaction.transaction_date.strftime("%B %d, %Y")
        receipt = receipt_number or transaction.transaction_number

        # Create message
        subject = f"Payment Received - {amount_str}"
        body = f"""Dear Parent,

We have successfully received your payment for {student.first_name} {student.last_name}.

Payment Details:
• Amount Paid: {amount_str}
• Payment Method: {payment_method}
• Payment Date: {payment_date}
• Receipt Number: {receipt}
• Remaining Balance: {balance_str}

{"✅ Your account is fully paid!" if transaction.balance == 0 else ""}

Thank you for your payment!

You can download the receipt from the parent portal.
"""

        # Send to all parent users
        for parent in parents:
            FinancialNotificationService._send_notification(
                parent_user_id=parent.id,
                subject=subject,
                body=body,
                student_id=student.id,
                transaction_id=transaction.id,
                db=db
            )

    @staticmethod
    def notify_late_fee_charged(
        transaction: StudentLedgerTransaction,
        reason: str,
        db: Session
    ):
        """
        Notify parent when a late fee is charged

        Args:
            transaction: The ledger transaction object
            reason: Reason for late fee
            db: Database session
        """
        # Get student
        student = db.query(Student).filter(Student.id == transaction.student_id).first()
        if not student:
            return

        # Get parent users
        parents = FinancialNotificationService._get_parent_users(student.id, db)
        if not parents:
            return

        # Format amounts
        late_fee_str = f"₹{transaction.debit_amount:,.2f}"
        balance_str = f"₹{transaction.balance:,.2f}"

        # Create message
        subject = f"⚠️ Late Fee Applied - {late_fee_str}"
        body = f"""Dear Parent,

A late fee has been applied to {student.first_name} {student.last_name}'s account.

Late Fee Details:
• Amount: {late_fee_str}
• Reason: {reason}
• Current Balance: {balance_str}

Please clear the outstanding balance at your earliest convenience to avoid additional late fees.

Transaction ID: {transaction.transaction_number}
"""

        # Send to all parent users
        for parent in parents:
            FinancialNotificationService._send_notification(
                parent_user_id=parent.id,
                subject=subject,
                body=body,
                student_id=student.id,
                transaction_id=transaction.id,
                db=db
            )

    @staticmethod
    def notify_adjustment_applied(
        transaction: StudentLedgerTransaction,
        adjustment_type: str,
        reason: str,
        db: Session
    ):
        """
        Notify parent when an adjustment (discount, waiver, refund) is applied

        Args:
            transaction: The ledger transaction object
            adjustment_type: Type of adjustment (discount, waiver, refund, etc.)
            reason: Reason for adjustment
            db: Database session
        """
        # Get student
        student = db.query(Student).filter(Student.id == transaction.student_id).first()
        if not student:
            return

        # Get parent users
        parents = FinancialNotificationService._get_parent_users(student.id, db)
        if not parents:
            return

        # Format amounts
        amount_str = f"₹{transaction.credit_amount:,.2f}"
        balance_str = f"₹{transaction.balance:,.2f}"

        # Determine emoji and title based on adjustment type
        emoji_map = {
            "discount": "💰",
            "waiver": "✅",
            "scholarship": "🎓",
            "refund": "↩️"
        }
        emoji = emoji_map.get(adjustment_type.lower(), "📝")

        # Create message
        subject = f"{emoji} {adjustment_type.title()} Applied - {amount_str}"
        body = f"""Dear Parent,

Good news! A {adjustment_type} has been applied to {student.first_name} {student.last_name}'s account.

{adjustment_type.title()} Details:
• Type: {adjustment_type.title()}
• Amount: {amount_str}
• Reason: {reason}
• New Balance: {balance_str}

Transaction ID: {transaction.transaction_number}

Thank you.
"""

        # Send to all parent users
        for parent in parents:
            FinancialNotificationService._send_notification(
                parent_user_id=parent.id,
                subject=subject,
                body=body,
                student_id=student.id,
                transaction_id=transaction.id,
                db=db
            )
```

---

## Step 2: Update Ledger Service to Trigger Notifications (15 minutes)

**File**: `admission-system/backend/app/services/ledger_service.py`

Add these lines to your existing methods:

```python
# At the top, add import
from .financial_notification_service import FinancialNotificationService

# In create_fee_assignment_entry() method, after db.flush():
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
    """Create a ledger entry for fee assignment (debit)"""

    # ... existing code ...

    db.add(transaction)
    db.flush()  # Get ID without committing

    # NEW: Send notification to parent
    try:
        # Get fee session details for due date
        due_date = None
        if fee_session_id:
            from ..models.fees import FeeSession
            fee_session = db.query(FeeSession).filter(FeeSession.id == fee_session_id).first()
            if fee_session and fee_session.due_date:
                due_date = fee_session.due_date.isoformat()

        FinancialNotificationService.notify_fee_assigned(
            transaction=transaction,
            fee_description=description,
            due_date=due_date,
            db=db
        )
    except Exception as e:
        # Don't fail transaction if notification fails
        print(f"Warning: Failed to send fee assignment notification: {str(e)}")

    return transaction


# In create_payment_entry() method, after db.flush():
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
    """Create a ledger entry for payment received (credit)"""

    # ... existing code ...

    db.add(transaction)
    db.flush()

    # NEW: Send payment confirmation to parent
    try:
        receipt_number = metadata.get('receipt_number') if metadata else None
        FinancialNotificationService.notify_payment_received(
            transaction=transaction,
            receipt_number=receipt_number,
            db=db
        )
    except Exception as e:
        print(f"Warning: Failed to send payment confirmation: {str(e)}")

    return transaction


# In create_adjustment_entry() method, after db.flush():
def create_adjustment_entry(
    student_id: int,
    academic_year_id: int,
    amount: Decimal,
    adjustment_type: str,
    description: str,
    transaction_date: Optional[datetime] = None,
    created_by: Optional[int] = None,
    remarks: Optional[str] = None,
    db: Session = None
) -> StudentLedgerTransaction:
    """Create a ledger entry for adjustments (discounts, waivers, etc.)"""

    # ... existing code ...

    db.add(transaction)
    db.flush()

    # NEW: Send adjustment notification to parent
    try:
        if adjustment_type in ['discount', 'waiver', 'scholarship', 'refund']:
            FinancialNotificationService.notify_adjustment_applied(
                transaction=transaction,
                adjustment_type=adjustment_type,
                reason=description,
                db=db
            )
    except Exception as e:
        print(f"Warning: Failed to send adjustment notification: {str(e)}")

    return transaction
```

---

## Step 3: Test the Integration (15 minutes)

Create a test script to verify notifications are working:

**File**: `admission-system/backend/test_financial_notifications.py`

```python
"""
Test script for financial notifications
Run: python test_financial_notifications.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.services.ledger_service import LedgerService
from app.models.student import Student
from app.models.user import User
from decimal import Decimal

def test_fee_assignment_notification():
    """Test fee assignment notification"""
    db = SessionLocal()

    try:
        # Find a test student (adjust ID as needed)
        student = db.query(Student).filter(Student.id == 1).first()
        if not student:
            print("❌ No student found with ID 1")
            return

        print(f"✅ Found student: {student.first_name} {student.last_name}")

        # Find academic year (adjust as needed)
        academic_year_id = 1

        # Create a test fee assignment
        transaction = LedgerService.create_fee_assignment_entry(
            student_id=student.id,
            academic_year_id=academic_year_id,
            amount=Decimal('5000.00'),
            description="Test Fee - Annual Sports Fee",
            transaction_date=None,
            created_by=1,
            remarks="Test notification",
            db=db
        )

        print(f"✅ Fee assignment created: {transaction.transaction_number}")
        print(f"✅ Balance: ₹{transaction.balance}")
        print(f"✅ Notification should have been sent to parent!")

        # Check if message was created
        from app.models.communication import Message
        messages = db.query(Message).order_by(Message.id.desc()).limit(1).all()
        if messages:
            msg = messages[0]
            print(f"\n📧 Latest Message:")
            print(f"   Subject: {msg.subject}")
            print(f"   Created: {msg.created_at}")

        db.commit()

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def test_payment_notification():
    """Test payment notification"""
    db = SessionLocal()

    try:
        # Find a test student
        student = db.query(Student).filter(Student.id == 1).first()
        if not student:
            print("❌ No student found with ID 1")
            return

        print(f"✅ Found student: {student.first_name} {student.last_name}")

        # Find academic year
        academic_year_id = 1

        # Create a test payment
        transaction = LedgerService.create_payment_entry(
            student_id=student.id,
            academic_year_id=academic_year_id,
            amount=Decimal('3000.00'),
            description="Test Payment - UPI",
            payment_method="UPI",
            payment_id=None,
            transaction_date=None,
            created_by=1,
            remarks="Test payment notification",
            metadata={"receipt_number": "TEST-RCPT-001"},
            db=db
        )

        print(f"✅ Payment recorded: {transaction.transaction_number}")
        print(f"✅ New Balance: ₹{transaction.balance}")
        print(f"✅ Payment confirmation should have been sent!")

        db.commit()

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Financial Notification Testing")
    print("=" * 60)

    print("\n1. Testing Fee Assignment Notification...")
    print("-" * 60)
    test_fee_assignment_notification()

    print("\n\n2. Testing Payment Notification...")
    print("-" * 60)
    test_payment_notification()

    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)
    print("\nCheck the parent portal to see the notifications.")
```

Run the test:

```bash
cd admission-system/backend
python test_financial_notifications.py
```

---

## Step 4: Verify in Parent Portal (10 minutes)

1. **Login as Parent**: Go to http://localhost:5173/login
2. **Check Notifications**: Click on the notifications bell icon (🔔)
3. **You should see**:
   - "New Fee Assigned - Test Fee - Annual Sports Fee"
   - "Payment Received - ₹3,000.00"
4. **Click on notifications** to view full details

---

## Step 5: Add Notification Badge to Navigation (30 minutes)

**File**: `admission-system/frontend/web-app/src/pages/ParentDashboard.tsx`

Add unread count badge:

```typescript
import { useEffect, useState } from 'react';
import { Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import api from '../services/api';

// Inside component:
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/communication/unread-count');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  fetchUnreadCount();

  // Poll every 30 seconds for updates
  const interval = setInterval(fetchUnreadCount, 30000);
  return () => clearInterval(interval);
}, []);

// In your navigation bar:
<IconButton
  color="inherit"
  onClick={() => navigate('/parent/messages')}
>
  <Badge badgeContent={unreadCount} color="error">
    <NotificationsIcon />
  </Badge>
</IconButton>
```

---

## Step 6: Create System User for Notifications (10 minutes)

Run this SQL to create a system user for sending notifications:

```sql
-- Create system user for automated notifications
INSERT INTO users (email, password_hash, role, is_active)
VALUES (
  'system@school.internal',
  '$2b$12$dummy_hash_replace_with_actual',  -- Replace with actual bcrypt hash
  'admin',
  1
);

-- Get the ID (should be 1 if this is first user, adjust as needed)
SELECT id FROM users WHERE email = 'system@school.internal';
```

Update `FinancialNotificationService._send_notification()` to use this user ID:

```python
# Replace:
sender_id=1  # System user

# With:
sender_id=get_system_user_id(db)  # Function to get system user
```

---

## Quick Testing Checklist

After implementation, verify these scenarios:

### Test 1: Fee Assignment
- [ ] Admin creates fee session
- [ ] Fee is assigned to students
- [ ] Parent receives notification
- [ ] Notification shows correct amount and due date
- [ ] Unread badge appears on navigation

### Test 2: Payment
- [ ] Parent makes payment (online or cash)
- [ ] Parent receives payment confirmation
- [ ] Confirmation shows receipt number
- [ ] Balance is updated correctly

### Test 3: Late Fee
- [ ] System applies late fee (manual or automated)
- [ ] Parent receives late fee notification
- [ ] Notification has warning emoji
- [ ] Reason is clearly stated

### Test 4: Discount/Waiver
- [ ] Admin applies discount
- [ ] Parent receives discount notification
- [ ] Notification shows positive message
- [ ] New balance is correct

---

## Common Issues & Solutions

### Issue 1: Parent not found for student
**Solution**: Ensure student has valid `application_id` and application has valid `user_id`

```python
# Check in database:
SELECT s.id, s.first_name, s.application_id, a.user_id
FROM students s
LEFT JOIN applications a ON s.application_id = a.id
WHERE s.id = YOUR_STUDENT_ID;
```

### Issue 2: Notifications not appearing
**Solution**: Check message deliveries table

```python
# Check in database:
SELECT md.*, m.subject, m.created_at
FROM message_deliveries md
JOIN messages m ON md.message_id = m.id
WHERE md.recipient_id = YOUR_PARENT_USER_ID
ORDER BY m.created_at DESC
LIMIT 10;
```

### Issue 3: Duplicate notifications
**Solution**: Ensure you're not committing the database twice. Check that `db.commit()` is only called once per transaction.

---

## Performance Optimization

For production use with thousands of students:

1. **Use Background Jobs**: Move notification sending to background queue (Celery/Redis)

```python
# Instead of sending immediately:
FinancialNotificationService.notify_fee_assigned(...)

# Use task queue:
send_fee_notification.delay(transaction_id=transaction.id)
```

2. **Batch Processing**: Group notifications for same parent

3. **Caching**: Cache parent-student relationships

```python
# Use Redis cache
parent_users = cache.get(f"student_{student_id}_parents")
if not parent_users:
    parent_users = _get_parent_users(student_id, db)
    cache.set(f"student_{student_id}_parents", parent_users, timeout=3600)
```

---

## Next Steps

After basic integration works:

1. **Create notification rules table** for admin configuration
2. **Add notification history tracking** for audit trail
3. **Implement scheduled notifications** (e.g., monthly reminders)
4. **Add SMS/Email channels** (Phase 2)
5. **Build admin notification management UI**

---

## Support

If you encounter issues:

1. Check server logs: `tail -f admission-system/backend/app.log`
2. Check database: Use DB Browser for SQLite
3. Enable debug mode: Set `DEBUG=True` in `.env`

---

**Quick Start Complete!** 🎉

You now have basic financial notifications working. Parents will be automatically notified when:
- ✅ Fees are assigned
- ✅ Payments are received
- ✅ Late fees are charged
- ✅ Adjustments are applied

**Time Invested**: ~2-3 hours
**Value Delivered**: Automated parent communication for all financial events

---

**Document Version**: 1.0
**Last Updated**: October 29, 2025
