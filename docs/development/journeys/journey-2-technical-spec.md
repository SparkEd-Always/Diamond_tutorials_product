# Journey 2: Fee Collection & Financial Management - Technical Specification

## Overview
Complete fee management system from fee structure setup through payment collection, receipt generation, outstanding tracking, and financial reporting. Builds upon Journey 1's admission system to handle enrollment fees and ongoing academic fees.

## User Flow Summary
```
Fee Structure Setup → Fee Assignment → Invoice Generation →
Payment Processing → Receipt Generation → Outstanding Tracking → Financial Reporting
```

## Database Schema Extensions

### New Tables Required
```sql
-- Fee Structure Management
fee_types (id, type_name, description, is_mandatory, is_recurring)
fee_structures (id, academic_year_id, class_id, fee_type_id, amount, due_date)
student_fee_assignments (id, student_id, fee_structure_id, custom_amount, status)

-- Payment Processing
invoices (id, student_id, invoice_number, total_amount, due_date, status)
invoice_items (id, invoice_id, fee_type_id, description, amount, quantity)
payments (id, invoice_id, payment_method, amount, transaction_id, gateway_response)
payment_receipts (id, payment_id, receipt_number, generated_at, file_path)

-- Financial Tracking
outstanding_fees (id, student_id, total_outstanding, last_updated)
payment_reminders (id, student_id, reminder_type, sent_date, next_reminder_date)
financial_accounts (id, account_name, account_type, balance, bank_details)
```

## Extended API Endpoints

### Fee Structure Management
```
POST /api/fees/types → Create fee type
GET  /api/fees/types → List all fee types
PUT  /api/fees/types/:id → Update fee type

POST /api/fees/structures → Create fee structure for class
GET  /api/fees/structures → List fee structures (with filters)
PUT  /api/fees/structures/:id → Update fee structure

POST /api/fees/assign → Assign fees to students
GET  /api/fees/students/:id/assigned → Get student's assigned fees
```

### Invoice Management
```
POST /api/invoices/generate → Generate invoices for students
GET  /api/invoices → List invoices (with filters)
GET  /api/invoices/:id → Get invoice details
PUT  /api/invoices/:id → Update invoice
GET  /api/invoices/:id/pdf → Download invoice PDF

POST /api/invoices/bulk-generate → Generate bulk invoices for class/section
```

### Payment Processing
```
POST /api/payments/initiate → Initiate payment (Razorpay/PayU)
POST /api/payments/verify → Verify payment callback
GET  /api/payments → List payments (with filters)
GET  /api/payments/:id → Get payment details

GET  /api/payments/methods → Get available payment methods
POST /api/payments/offline → Record offline payment (cash/cheque)
```

### Receipt Management
```
GET  /api/receipts/:id → Get receipt details
GET  /api/receipts/:id/pdf → Download receipt PDF
POST /api/receipts/email → Email receipt to parent
POST /api/receipts/regenerate → Regenerate receipt
```

### Financial Reporting
```
GET  /api/reports/outstanding → Outstanding fees report
GET  /api/reports/collection → Fee collection report
GET  /api/reports/daily-collection → Daily collection summary
GET  /api/reports/defaulters → Fee defaulters report
GET  /api/reports/class-wise → Class-wise fee collection
```

## Frontend Components Required

### Admin Fee Management
- **Fee Structure Setup** → Define fees for each class and academic year
- **Bulk Invoice Generation** → Generate invoices for entire class/section
- **Payment Dashboard** → Real-time payment tracking and reconciliation
- **Outstanding Tracker** → Monitor pending payments and defaulters
- **Financial Reports** → Comprehensive financial analytics and insights

### Parent Portal Extensions
- **Fee Details** → View assigned fees and payment schedule
- **Payment Gateway** → Secure online payment processing
- **Invoice History** → Download invoices and receipts
- **Outstanding Summary** → Clear view of pending amounts
- **Payment History** → Complete payment transaction history

### Mobile App Features
- **Push Notifications** → Fee due reminders and payment confirmations
- **Quick Pay** → One-tap payment for outstanding amounts
- **Receipt Viewer** → Mobile-optimized receipt viewing
- **Installment Tracking** → Track installment payment schedules

## Integration Points

### Payment Gateways
```javascript
// Razorpay Integration
- UPI payments with auto-verification
- Card payments (Credit/Debit)
- Net banking for all major banks
- QR code generation for UPI payments
- Auto-receipt generation and SMS

// PayU Integration (Alternative)
- EMI options for large fee amounts
- Wallet payments (Paytm, PhonePe)
- Bank transfer automation
```

### Banking Integration
```javascript
// Bank APIs for reconciliation
- Automated bank statement processing
- Direct bank account verification
- NEFT/RTGS payment tracking
- Cheque bounce notifications
```

### Communication Integration
```javascript
// SMS/Email for payment events
- Fee due reminders
- Payment confirmations
- Receipt delivery
- Overdue notifications
```

## Business Logic Rules

### Fee Structure Rules
```javascript
// Fee assignment logic
- Annual fees: Split into installments (quarterly/monthly)
- One-time fees: Admission, exam, etc.
- Late payment penalty: 2% per month after due date
- Sibling discount: 10% for second child, 15% for third child
- Merit scholarship: Up to 50% fee waiver for toppers
```

### Payment Processing Rules
```javascript
// Payment allocation priority
1. Oldest outstanding amount first
2. Mandatory fees before optional
3. Principal amount before penalty
4. Previous year dues before current year

// Refund rules
- Withdrawal before academic year: 80% refund
- Withdrawal within first month: 50% refund
- After first month: No refund policy
```

### Outstanding Management
```javascript
// Reminder schedule
- 7 days before due date: Friendly reminder
- On due date: Payment due notification
- 7 days after due date: First overdue notice
- 15 days after: Second notice with penalty
- 30 days after: Final notice and consequences
```

## Financial Security & Compliance

### Payment Security
```javascript
// PCI DSS compliance for card payments
- No card data storage on our servers
- SSL encryption for all payment communications
- Two-factor authentication for large payments
- Fraud detection and prevention
```

### Financial Controls
```javascript
// Internal financial controls
- Dual approval for refunds above ₹10,000
- Daily payment reconciliation mandatory
- Monthly financial audits
- Access logs for all financial operations
```

### Data Protection
```javascript
// Financial data protection
- Encrypt all payment information
- Audit trail for all transactions
- GDPR compliance for data export/deletion
- Secure payment callback handling
```

## Performance Requirements

### Payment Processing
- Payment initiation: < 2 seconds
- Payment verification: < 5 seconds
- Receipt generation: < 3 seconds
- Bulk invoice generation: < 30 seconds for 500 students

### Financial Reporting
- Outstanding report: < 10 seconds for 5000 students
- Daily collection: < 5 seconds
- Monthly reports: < 30 seconds

### Scalability Targets
- Process 1000+ concurrent payments during fee season
- Handle ₹10 crore+ annual fee collection
- Support 10,000+ students across multiple schools

## Integration with Journey 1

### Data Flow from Admission
```javascript
// When student enrollment is confirmed
1. Retrieve fee structure for student's class
2. Auto-assign applicable fees to student
3. Generate initial invoice for admission fees
4. Create payment reminder schedule
5. Update student status to "Fee Pending"
```

### Workflow Integration
```javascript
// Admission to enrollment completion
Admission Approved → Fee Assignment → Invoice Generation →
Payment Processing → Enrollment Confirmation → Student ID Generation
```

## Testing Requirements

### Payment Testing
```javascript
// Payment gateway testing
- Test payments with all supported methods
- Failure scenario handling (network issues, insufficient funds)
- Callback verification and security
- Refund processing and verification
```

### Financial Accuracy
```javascript
// Financial integrity testing
- Amount calculations and tax computations
- Outstanding balance accuracy
- Payment allocation correctness
- Report data consistency
```

### Load Testing
```javascript
// Peak season testing
- 1000+ concurrent payment transactions
- Bulk invoice generation performance
- Database performance under heavy load
- Payment gateway response time under load
```

## Compliance Requirements

### Indian Financial Regulations
```javascript
// GST compliance
- 18% GST on all fee transactions
- GST invoice generation
- Monthly GST return data export
- GSTIN validation for corporate payments
```

### Audit Requirements
```javascript
// Financial audit trail
- Complete transaction history
- User action logs for all financial operations
- Daily/monthly reconciliation reports
- Bank statement matching and discrepancy reports
```

## Success Metrics

### Operational Success
- [ ] 99.5%+ payment success rate
- [ ] < 2% payment failures due to technical issues
- [ ] 95%+ fee collection rate within due dates
- [ ] < 24 hours for payment-to-receipt generation

### User Experience Success
- [ ] < 3 minutes average payment completion time
- [ ] 90%+ parent satisfaction with payment process
- [ ] < 1% support tickets per 100 transactions

### Financial Success
- [ ] ₹0 reconciliation discrepancies
- [ ] 100% audit compliance
- [ ] < 0.1% fraudulent transaction rate

---

*Technical specification for Journey 2: Fee Collection & Financial Management*
*Extends Journey 1: Admission to Enrollment*
*Created for EdTech ERP + SIS + LMS development*
*Last updated: September 27, 2025*