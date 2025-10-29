# Ledger-Communication System Integration Plan

## Executive Summary

This document outlines the integration strategy between the **Student Ledger System** (the heart of all financial transactions) and the **Parent Communication System** to enable automated financial notifications and alerts to parents.

**Goal**: Automatically notify parents about key financial events in real-time while maintaining a complete audit trail.

---

## Current System Architecture

### Student Ledger System (✅ Complete)
- **Purpose**: Single source of truth for all student financial transactions
- **Architecture**: Append-only, immutable transaction log (similar to bank statement)
- **Location**: `admission-system/backend/app/models/fees/ledger_transaction.py`
- **Database**: `student_ledger_transactions` table with 40+ indexes
- **Key Features**:
  - Double-entry bookkeeping (debit/credit)
  - Running balance calculation
  - Complete audit trail
  - 15+ transaction types (fees, payments, adjustments)
  - Reversal support for corrections

### Parent Communication System (✅ Complete)
- **Purpose**: Broadcast and direct messaging to parents
- **Architecture**: Message + MessageDelivery + CommunicationPreference tables
- **Location**: `admission-system/backend/app/models/communication.py`
- **Database**: 3 tables (`messages`, `message_deliveries`, `communication_preferences`)
- **Key Features**:
  - Broadcast to class/all parents
  - Direct one-to-one messaging
  - Delivery tracking & read receipts
  - Multi-channel support (in-app, SMS, email - Phase 2)
  - User preferences & language support

---

## Integration Architecture

### Core Concept: Event-Driven Financial Notifications

Every ledger transaction can trigger automated parent notifications based on configurable rules.

```
┌────────────────────────────────────────────────────────────────┐
│                     LEDGER TRANSACTION                          │
│  (Fee assigned, Payment received, Late fee, etc.)               │
└─────────────────────┬──────────────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Notification Rules   │
           │  Engine (New)         │
           └──────────┬────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  Message Service API    │
         │  (Existing)             │
         └────────┬────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────┐
    │  Parent Communication System     │
    │  (Sends notification to parent)  │
    └──────────────────────────────────┘
```

---

## Implementation Strategy

### Phase 1: Core Integration (2-3 days)

#### 1.1 Create Financial Notification Service

**New File**: `admission-system/backend/app/services/financial_notification_service.py`

**Responsibilities**:
- Listen to ledger transaction events
- Apply notification rules
- Generate appropriate messages
- Send notifications via MessageService

**Key Functions**:
```python
class FinancialNotificationService:
    @staticmethod
    def notify_fee_assigned(transaction: StudentLedgerTransaction, db: Session)

    @staticmethod
    def notify_payment_received(transaction: StudentLedgerTransaction, db: Session)

    @staticmethod
    def notify_overdue_fee(student_id: int, overdue_amount: Decimal, db: Session)

    @staticmethod
    def notify_late_fee_charged(transaction: StudentLedgerTransaction, db: Session)

    @staticmethod
    def notify_refund_processed(transaction: StudentLedgerTransaction, db: Session)

    @staticmethod
    def notify_adjustment_applied(transaction: StudentLedgerTransaction, db: Session)
```

#### 1.2 Create Notification Rules Configuration

**New File**: `admission-system/backend/app/models/fees/notification_rules.py`

**Database Table**: `financial_notification_rules`

```python
class FinancialNotificationRule(Base):
    """
    Configure which financial events trigger parent notifications
    """
    id = Column(Integer, primary_key=True)

    # Rule Details
    rule_name = Column(String(100), nullable=False)
    rule_code = Column(String(50), unique=True, nullable=False)

    # Trigger Configuration
    trigger_event = Column(String(50), nullable=False)  # 'fee_assigned', 'payment_received', etc.
    trigger_conditions = Column(JSON)  # {"min_amount": 1000, "fee_types": ["tuition"]}

    # Message Template
    subject_template = Column(String(500), nullable=False)
    body_template = Column(Text, nullable=False)

    # Notification Settings
    send_immediately = Column(Boolean, default=True)
    send_via_app = Column(Boolean, default=True)
    send_via_sms = Column(Boolean, default=False)  # Phase 2
    send_via_email = Column(Boolean, default=False)  # Phase 2

    # Status
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=5)  # 1=highest, 10=lowest

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### 1.3 Integrate with Ledger Service

**Update**: `admission-system/backend/app/services/ledger_service.py`

Add notification triggers after each transaction creation:

```python
# In create_fee_assignment_entry()
transaction = StudentLedgerTransaction(...)
db.add(transaction)
db.flush()

# NEW: Trigger notification
if should_notify(transaction):
    FinancialNotificationService.notify_fee_assigned(transaction, db)

return transaction
```

#### 1.4 Create Notification History Tracking

**New Table**: `financial_notification_history`

```python
class FinancialNotificationHistory(Base):
    """
    Track all financial notifications sent to parents
    Links ledger transactions to messages sent
    """
    id = Column(Integer, primary_key=True)

    # Link to ledger transaction
    ledger_transaction_id = Column(BigInteger, ForeignKey("student_ledger_transactions.id"))

    # Link to sent message
    message_id = Column(Integer, ForeignKey("messages.id"))

    # Student & Parent
    student_id = Column(Integer, ForeignKey("students.id"))
    parent_user_id = Column(Integer, ForeignKey("users.id"))

    # Notification Details
    notification_type = Column(String(50))  # 'fee_assigned', 'payment_received', etc.
    amount = Column(Numeric(12, 2))
    balance_after = Column(Numeric(12, 2))

    # Rule that triggered this
    rule_id = Column(Integer, ForeignKey("financial_notification_rules.id"))

    # Status
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    was_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
```

---

### Phase 2: Rich Financial Messages (1-2 days)

#### 2.1 Financial Message Templates

Create pre-configured message templates for common scenarios:

**Templates**:

1. **Fee Assignment Notification**
```
Subject: New Fee Assigned - {fee_description}
Body:
Dear Parent,

A new fee has been assigned to {student_name} ({class_name}).

Fee Details:
- Description: {fee_description}
- Amount: ₹{amount}
- Due Date: {due_date}
- Current Balance: ₹{current_balance}

Please make the payment before the due date to avoid late fees.

Transaction ID: {transaction_number}

View Details: [Link to Fee Dashboard]
```

2. **Payment Confirmation**
```
Subject: Payment Received - ₹{amount}
Body:
Dear Parent,

We have successfully received your payment for {student_name}.

Payment Details:
- Amount Paid: ₹{amount}
- Payment Method: {payment_method}
- Payment Date: {payment_date}
- Receipt Number: {receipt_number}
- Remaining Balance: ₹{remaining_balance}

Thank you for your payment.

Download Receipt: [Link]
```

3. **Overdue Payment Reminder**
```
Subject: Overdue Fee Reminder - Action Required
Body:
Dear Parent,

This is a reminder that there is an overdue payment for {student_name}.

Overdue Details:
- Overdue Amount: ₹{overdue_amount}
- Days Overdue: {days_overdue} days
- Late Fee Applied: ₹{late_fee_amount}
- Total Outstanding: ₹{total_outstanding}

Please clear the outstanding balance at your earliest convenience to avoid additional late fees.

Make Payment: [Link]
```

4. **Refund Processed**
```
Subject: Refund Processed - ₹{amount}
Body:
Dear Parent,

A refund has been processed for {student_name}.

Refund Details:
- Amount: ₹{amount}
- Reason: {refund_reason}
- Refund Date: {refund_date}
- Current Balance: ₹{current_balance}

The refund will be credited to your account within 5-7 business days.
```

5. **Discount/Scholarship Applied**
```
Subject: Discount Applied - ₹{amount}
Body:
Dear Parent,

Good news! A discount has been applied to {student_name}'s account.

Discount Details:
- Type: {discount_type}
- Amount: ₹{amount}
- Reason: {reason}
- New Balance: ₹{new_balance}

Thank you.
```

#### 2.2 Smart Parent Lookup Service

**New Function**: Get parent user IDs from student ID

```python
class ParentLookupService:
    @staticmethod
    def get_parent_users_for_student(student_id: int, db: Session) -> List[User]:
        """
        Find all parent users linked to a student
        Returns list of User objects with role='parent'
        """
        # Join students -> applications -> users
        # Filter by role='parent'
        # Return list of parent User objects
```

#### 2.3 Batch Notification Processing

**New API Endpoint**: `/fees/notifications/batch`

For sending bulk notifications (e.g., monthly fee reminders):

```python
@router.post("/notifications/batch")
async def send_batch_financial_notifications(
    notification_type: str,
    filters: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send financial notifications to multiple parents

    Use cases:
    - Monthly fee reminders
    - Overdue payment notices
    - Upcoming due date alerts
    """
```

---

### Phase 3: Advanced Features (3-4 days)

#### 3.1 Scheduled Notifications

**New Table**: `scheduled_financial_notifications`

```python
class ScheduledFinancialNotification(Base):
    """
    Schedule notifications for future dates
    """
    id = Column(Integer, primary_key=True)

    # Schedule Configuration
    notification_type = Column(String(50))
    schedule_type = Column(String(20))  # 'one_time', 'recurring'
    schedule_pattern = Column(JSON)  # {"frequency": "monthly", "day": 1, "time": "09:00"}

    # Filters
    target_filters = Column(JSON)  # {"has_outstanding": true, "min_amount": 500}

    # Message Template
    subject_template = Column(String(500))
    body_template = Column(Text)

    # Status
    is_active = Column(Boolean, default=True)
    next_run_at = Column(DateTime(timezone=True))
    last_run_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**Background Job**: Process scheduled notifications using Celery or APScheduler

#### 3.2 Parent Financial Dashboard

**New Frontend Pages**:

1. **ParentFinancialDashboard.tsx**
   - Current balance overview
   - Recent transactions timeline
   - Upcoming due dates
   - Payment history
   - Outstanding fees breakdown

2. **TransactionHistoryPage.tsx**
   - Filterable transaction list
   - Download statements
   - View receipts

3. **MakePaymentPage.tsx**
   - Online payment integration
   - Payment allocation (which fees to pay)
   - Generate receipt

#### 3.3 Admin Notification Management

**New Frontend Page**: **FinancialNotificationSettingsPage.tsx**

Features:
- Configure notification rules
- Enable/disable specific notifications
- Edit message templates
- View notification history
- Analytics (open rates, click rates)

#### 3.4 Multi-Channel Support (Phase 2+)

Integration with external services:

1. **SMS Notifications** (MSG91 API)
   - Send SMS for high-priority notifications
   - Cost-effective for urgent reminders

2. **Email Notifications** (SendGrid API)
   - Send formatted email receipts
   - Monthly statements via email

3. **WhatsApp Notifications** (Phase 3)
   - WhatsApp Business API integration
   - Rich media support (receipts as images/PDFs)

---

## Database Schema Changes

### New Tables (3 tables)

1. **financial_notification_rules** (12 fields)
2. **financial_notification_history** (12 fields)
3. **scheduled_financial_notifications** (12 fields)

### Foreign Key Relationships

```
student_ledger_transactions
    └─> financial_notification_history
            └─> messages
                    └─> message_deliveries
```

---

## API Endpoints

### New Endpoints (8 endpoints)

1. **POST** `/fees/notifications/rules` - Create notification rule
2. **GET** `/fees/notifications/rules` - List all rules
3. **PUT** `/fees/notifications/rules/{id}` - Update rule
4. **DELETE** `/fees/notifications/rules/{id}` - Delete rule
5. **POST** `/fees/notifications/batch` - Send batch notifications
6. **GET** `/fees/notifications/history` - View notification history
7. **POST** `/fees/notifications/test` - Test notification (admin)
8. **GET** `/fees/notifications/stats` - Notification statistics

---

## Configuration Examples

### Default Notification Rules

```python
DEFAULT_RULES = [
    {
        "rule_code": "fee_assigned",
        "rule_name": "Fee Assignment Notification",
        "trigger_event": "fee_assignment",
        "trigger_conditions": {"min_amount": 0},
        "subject_template": "New Fee Assigned - {{fee_description}}",
        "body_template": "...",
        "send_immediately": True,
        "is_active": True,
        "priority": 5
    },
    {
        "rule_code": "payment_received",
        "rule_name": "Payment Confirmation",
        "trigger_event": "payment_received",
        "trigger_conditions": {"min_amount": 0},
        "subject_template": "Payment Received - ₹{{amount}}",
        "body_template": "...",
        "send_immediately": True,
        "is_active": True,
        "priority": 3
    },
    {
        "rule_code": "overdue_reminder",
        "rule_name": "Overdue Payment Reminder",
        "trigger_event": "overdue_check",
        "trigger_conditions": {"min_days_overdue": 7},
        "subject_template": "Overdue Fee Reminder - Action Required",
        "body_template": "...",
        "send_immediately": False,
        "is_active": True,
        "priority": 1
    },
    {
        "rule_code": "late_fee_charged",
        "rule_name": "Late Fee Notification",
        "trigger_event": "late_fee",
        "trigger_conditions": {},
        "subject_template": "Late Fee Applied - ₹{{amount}}",
        "body_template": "...",
        "send_immediately": True,
        "is_active": True,
        "priority": 2
    }
]
```

---

## Testing Strategy

### Unit Tests
- Test notification rule matching
- Test message template rendering
- Test parent lookup logic

### Integration Tests
- Create ledger transaction → Verify notification sent
- Payment received → Verify confirmation sent
- Late fee applied → Verify alert sent

### End-to-End Tests
1. Admin assigns fee to student
2. Parent receives notification in app
3. Parent clicks "View Details"
4. Parent makes payment
5. Parent receives payment confirmation

---

## Rollout Plan

### Week 1: Foundation
- [ ] Create `FinancialNotificationService`
- [ ] Create `financial_notification_rules` table
- [ ] Integrate with `LedgerService`
- [ ] Basic testing

### Week 2: Message Templates & History
- [ ] Create message templates
- [ ] Create `financial_notification_history` table
- [ ] Implement parent lookup service
- [ ] Create notification API endpoints

### Week 3: Admin Interface
- [ ] Build notification settings page
- [ ] Build notification history viewer
- [ ] Add analytics dashboard
- [ ] User acceptance testing

### Week 4: Advanced Features
- [ ] Scheduled notifications
- [ ] Batch processing
- [ ] Performance optimization
- [ ] Production deployment

---

## Benefits

### For Parents
✅ **Real-time Updates**: Know immediately when fees are due or payments are received
✅ **Transparency**: Complete visibility into financial transactions
✅ **Convenience**: No need to constantly check portal for updates
✅ **Payment Reminders**: Never miss a due date
✅ **Receipt Delivery**: Instant payment confirmations

### For School Admins
✅ **Reduced Inquiries**: Fewer "Did you receive my payment?" calls
✅ **Improved Collection**: Automated reminders increase on-time payments
✅ **Audit Trail**: Complete history of all notifications sent
✅ **Customization**: Configure notifications per school policies
✅ **Analytics**: Track notification effectiveness

### For the System
✅ **Single Source of Truth**: Ledger drives all financial communication
✅ **Consistency**: Same transaction data used everywhere
✅ **Scalability**: Event-driven architecture handles high volume
✅ **Extensibility**: Easy to add new notification types

---

## Security Considerations

1. **Access Control**: Only parent users can see their own student's financial data
2. **Data Privacy**: Don't include sensitive payment details in notifications
3. **Audit Trail**: Log all notification sending activities
4. **Rate Limiting**: Prevent notification spam
5. **Opt-Out Support**: Respect user communication preferences

---

## Performance Optimization

1. **Async Processing**: Send notifications asynchronously (background jobs)
2. **Batch Operations**: Group multiple notifications for same parent
3. **Caching**: Cache parent-student relationships
4. **Database Indexes**: Optimize queries for parent lookup
5. **Message Queuing**: Use Redis/RabbitMQ for high-volume notifications

---

## Monitoring & Alerts

### Metrics to Track
- Notification send success rate
- Average delivery time
- Read rate (% of parents reading notifications)
- Bounce rate (failed deliveries)
- Click-through rate (links in notifications)

### Admin Dashboard Widgets
- Notifications sent today/this week/this month
- Most common notification types
- Parent engagement scores
- Failed notification alerts

---

## Future Enhancements (Phase 3+)

1. **Two-Way Communication**: Parents can reply to financial notifications
2. **Payment Links**: Direct payment links in notifications
3. **Installment Plans**: Automated notifications for installment due dates
4. **Financial Reports**: Monthly/quarterly financial statements via email
5. **Predictive Analytics**: Predict which parents might miss payments
6. **Multi-Language Support**: Notifications in regional languages
7. **Voice Calls**: IVR system for high-priority overdue alerts
8. **Parent App**: Mobile push notifications

---

## Conclusion

This integration transforms the ledger from a passive record-keeping system into an **active communication engine** that keeps parents informed about every financial event in real-time.

The event-driven architecture ensures that:
- ✅ No transaction goes unnotified
- ✅ Parents are always in the loop
- ✅ School admin workload is reduced
- ✅ Payment collection improves
- ✅ Complete audit trail is maintained

**Next Steps**:
1. Review this plan with stakeholders
2. Prioritize features for Phase 1
3. Begin implementation with `FinancialNotificationService`
4. Set up testing environment with dummy transactions

---

**Document Version**: 1.0
**Last Updated**: October 29, 2025
**Author**: Claude (AI Assistant)
**Status**: Proposal - Awaiting Approval
