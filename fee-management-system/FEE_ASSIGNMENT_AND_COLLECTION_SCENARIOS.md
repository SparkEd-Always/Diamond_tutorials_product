# **Fee Assignment & Collection - Complete Scenario Analysis**

## **📚 Research Overview**

Based on the Journey 2 PRD and Indian school practices, I've identified **8 major contexts** where fees are assigned and collected, each with unique business rules and workflows.

---

## **🎯 SCENARIO 1: New Academic Year - Bulk Fee Assignment**

### **Context**
- **When**: Beginning of academic year (April/May for CBSE, June for ICSE)
- **Who**: Finance Admin
- **Volume**: 500-2000 students (all continuing students)
- **Frequency**: Once per year

### **How It Works**

**Step 1: Fee Structure Setup** (Done in March)
```
Admin creates fee structures for each class:
- Class Pre-KG: ₹50,000/year (Tuition: ₹40k, Exam: ₹5k, Library: ₹3k, Sports: ₹2k)
- Class 1-5: ₹60,000/year
- Class 6-8: ₹72,000/year
- Class 9-10: ₹85,000/year
- Class 11-12 (Science): ₹1,10,000/year
```

**Step 2: Bulk Assignment** (First week of April)
```
Admin: "Assign Fees" → "Bulk Assignment"
- Select Academic Year: 2025-26
- Select Target: "All Students"
- System fetches: 1,250 students
- Auto-assigns fees based on student.class_id → fee_structure.class_id
```

**Step 3: Automatic Discount Application**
```
System automatically applies:
1. Sibling Discount:
   - Student A (Class 8) + Student B (Class 3) from same family
   - Student B gets 10% off tuition: ₹60,000 → ₹54,000

2. Merit Scholarship:
   - Student C (Class 10, prev year 92% marks)
   - Gets 50% off tuition: ₹85,000 → ₹42,500 + other fees

3. Early Payment Discount (optional):
   - If paid before April 30: 5% off total
```

**Step 4: Invoice Generation**
```
System generates 1,250 invoices in 2-3 minutes:
- Invoice number: FC/2025-26/000001 to FC/2025-26/001250
- Each invoice has 3 installments (terms):
  - Term 1 (April-July): Due July 15
  - Term 2 (Aug-Nov): Due Nov 15
  - Term 3 (Dec-March): Due March 15
```

**Step 5: Multi-channel Notification**
```
All 1,250 parents receive:
- Email: PDF invoice attached
- SMS: "Term 1 fee invoice (₹20,000) due July 15. Pay now: [link]"
- App notification: "New fee invoice available"
- WhatsApp (optional): Invoice summary + payment link
```

### **Database Operations**
```sql
-- 1. Bulk insert into student_fee_assignments
INSERT INTO student_fee_assignments (student_id, fee_structure_id, academic_year_id, ...)
SELECT s.id, fs.id, ay.id, ...
FROM students s
JOIN fee_structures fs ON s.class_id = fs.class_id
WHERE ay.year_name = '2025-26' AND s.status = 'active';

-- 2. Apply discounts
UPDATE student_fee_assignments
SET discount_amount = (SELECT calculate_sibling_discount(student_id))
WHERE student_id IN (SELECT student_id FROM sibling_groups);

-- 3. Generate invoices
INSERT INTO invoices (invoice_number, student_id, total_amount, due_date, ...)
SELECT generate_invoice_number(), sfa.student_id, sfa.total_amount, '2025-07-15', ...
FROM student_fee_assignments sfa;
```

---

## **🎯 SCENARIO 2: Mid-Session Admission (Pro-rated Fees)**

### **Context**
- **When**: Student joins in middle of academic year
- **Who**: Finance Admin (triggered by admission system)
- **Volume**: 50-100 students per year
- **Frequency**: Throughout the year

### **How It Works**

**Case Study**: Rohan joins Class 7 on October 1, 2025

**Step 1: Admission Confirmed**
```
Admission System → Fee System API
Event: "Student Enrolled"
Data: {
  student_id: 2351,
  class_id: 7,
  admission_date: "2025-10-01",
  academic_year: "2025-26"
}
```

**Step 2: Calculate Pro-rated Fee**
```
Standard Class 7 fee: ₹72,000/year

Academic year: April 1, 2025 - March 31, 2026 (12 months)
Remaining months: Oct-Nov-Dec-Jan-Feb-Mar = 6 months

Pro-rated calculation:
- Total annual fee: ₹72,000
- Fee per month: ₹72,000 / 12 = ₹6,000
- Remaining 6 months: ₹6,000 × 6 = ₹36,000

Final fee: ₹36,000 (50% of annual fee)
```

**Step 3: Fee Breakup**
```
Tuition (50% of ₹60k): ₹30,000
Exam (50% of ₹5k): ₹2,500
Library (one-time, full): ₹3,000
Sports (one-time, full): ₹4,000
------------------------
Total: ₹39,500
```

**Step 4: Fee Assignment**
```
Admin reviews:
- Student: Rohan Kumar (Admission #2351)
- Class: 7-A
- Joined: Oct 1, 2025
- Standard fee: ₹72,000
- Pro-rated fee: ₹39,500 ✓
- Reason: "Mid-session admission (6 months remaining)"

Admin confirms → Invoice generated
```

**Step 5: Payment Schedule**
```
Single payment (no installments for mid-session):
- Invoice: FC/2025-26/001251
- Amount: ₹39,500
- Due date: Oct 15, 2025 (15 days grace)
```

### **Business Rules**
```
Pro-ration Logic:
1. Recurring fees (Tuition, Exam): Pro-rated by months
2. One-time fees (Admission, Library, Annual Day): Full amount
3. Optional fees (Transport, Hostel): Pro-rated by months remaining
4. Minimum charge: At least 25% of annual fee (even if joining in March)
```

---

## **🎯 SCENARIO 3: Online Payment (UPI/Card/Net Banking)**

### **Context**
- **When**: Parent pays via payment gateway
- **Who**: Parent (self-service)
- **Volume**: 80-90% of total payments
- **Frequency**: 3 times/year per student (per term)

### **How It Works**

**Step 1: Parent Login & View Invoice**
```
Parent: Rajesh Kumar
Children: 2 (Class 3 & Class 7)
Outstanding invoices:
- Son (Class 3): ₹20,000 (Term 1, Due: July 15)
- Daughter (Class 7): ₹24,000 (Term 1, Due: July 15)
```

**Step 2: Consolidated Payment**
```
Parent selects both invoices:
- Child 1 (Class 3): ₹20,000
- Child 2 (Class 7): ₹24,000
- Subtotal: ₹44,000
- Early payment discount (5%): -₹2,200
- GST (18% on some fees): Already included
- Total: ₹41,800

Payment method: UPI (Google Pay)
```

**Step 3: Payment Gateway Flow**
```
1. Frontend → Backend API:
   POST /api/v1/payments/initiate
   {
     "invoice_ids": [5678, 5679],
     "amount": 41800,
     "payment_method": "UPI"
   }

2. Backend → Razorpay:
   POST https://api.razorpay.com/v1/orders
   {
     "amount": 4180000, // paise
     "currency": "INR",
     "receipt": "FC_2025_5678_5679",
     "notes": {
       "student_ids": "2351,2352",
       "invoice_ids": "5678,5679"
     }
   }

3. Razorpay Response:
   {
     "id": "order_Kj8d93jKs72j",
     "amount": 4180000,
     "currency": "INR",
     "status": "created"
   }

4. Frontend → Razorpay Checkout:
   Parent scans QR code with Google Pay
   Enters UPI PIN → Payment processing

5. Razorpay → Backend Webhook:
   POST /api/v1/payments/webhook
   {
     "event": "payment.captured",
     "payload": {
       "payment": {
         "id": "pay_Kj8d93jKs72j",
         "amount": 4180000,
         "status": "captured",
         "method": "upi",
         "vpa": "rajesh@paytm"
       }
     }
   }
```

**Step 4: System Updates (within 30 seconds)**
```
Database transactions:
1. Create payment record:
   INSERT INTO payments (
     invoice_id, amount, payment_method, transaction_id,
     payment_gateway, status, payment_date
   ) VALUES (5678, 20000, 'UPI', 'pay_Kj8d93jKs72j', 'Razorpay', 'success', NOW());

2. Update invoices:
   UPDATE invoices SET status = 'paid', paid_amount = 20000 WHERE id = 5678;
   UPDATE invoices SET status = 'paid', paid_amount = 24000 WHERE id = 5679;

3. Update student ledgers:
   UPDATE student_fee_ledger
   SET total_paid = total_paid + 20000, total_outstanding = total_outstanding - 20000
   WHERE student_id = 2351;

4. Generate receipt:
   INSERT INTO payment_receipts (receipt_number, payment_id, ...)
   VALUES ('REC/2025-26/005678', 123, ...);
```

**Step 5: Instant Receipt & Notifications**
```
Within 30 seconds:
- SMS: "Payment successful! ₹41,800 paid. Receipt: REC/2025-26/005678. Download: [link]"
- Email: PDF receipt attached (school logo, payment details, tax breakup)
- App notification: "Payment successful ✓"
- WhatsApp: Receipt PDF + "Thank you for your payment!"
```

---

## **🎯 SCENARIO 4: Offline Payment (Cash/Cheque at Counter)**

### **Context**
- **When**: Parent visits school office
- **Who**: Finance Admin records payment
- **Volume**: 10-20% of total payments (declining)
- **Frequency**: Throughout the day (9 AM - 3 PM)

### **How It Works**

**Step 1: Parent Visits Counter**
```
Parent: Mrs. Sharma
Child: Priya Sharma (Class 5-B, Admission #1234)
Brings: ₹24,000 cash
```

**Step 2: Admin Records Payment**
```
Finance Admin workflow:
1. Search student:
   - Enter admission number: 1234 OR
   - Search by name: "Priya Sharma"

2. View outstanding:
   - Term 1 Invoice: FC/2025-26/004567
   - Amount due: ₹24,000
   - Due date: July 15, 2025
   - Status: Unpaid

3. Click "Record Offline Payment"

4. Enter details:
   - Payment method: Cash
   - Amount received: ₹24,000
   - Payment date: July 10, 2025 (auto-filled today)
   - Receipt number: REC/2025-26/005679 (auto-generated)
   - Remarks: "Cash payment received at counter"
   - Denomination breakdown (optional):
     • ₹500 notes: 40 (₹20,000)
     • ₹100 notes: 40 (₹4,000)
```

**Step 3: System Validation**
```
Before confirming:
✓ Amount matches invoice (₹24,000 = ₹24,000)
✓ No duplicate payment already recorded
✓ Payment date not in future
✓ Receipt number unique
```

**Step 4: Receipt Generation**
```
Two options:
1. Print thermal receipt:
   - Print on thermal printer
   - Hand over to parent immediately

2. Digital receipt:
   - Generate PDF
   - Send via SMS: "Payment recorded. Receipt: [link]"
   - Send via Email: PDF attached

3. Both (recommended):
   - Print + Send digital copy
```

**Step 5: Daily Cash Reconciliation**
```
At 3:30 PM (end of day):

Admin: "Cash Collection Report"
System shows:
- Total cash received: ₹2,45,000
- Number of transactions: 10
- List of receipts:
  1. REC/2025-26/005679 - ₹24,000 - Priya Sharma
  2. REC/2025-26/005680 - ₹20,000 - Amit Singh
  ... (8 more)

Admin:
1. Counts physical cash: ₹2,45,000 ✓
2. Fills bank deposit slip
3. Deposits in bank
4. Updates system:
   - "Cash Deposited"
   - Bank receipt number: BNK/456789/2025
   - Deposit date: July 10, 2025
```

---

## **🎯 SCENARIO 5: Partial Payment & Installments**

### **Context**
- **When**: Parent cannot pay full amount
- **Who**: Finance Admin approves installment plan
- **Volume**: 10-15% of students (financial hardship)
- **Frequency**: As needed

### **How It Works**

**Case Study**: Parent requests installment for ₹72,000 annual fee

**Step 1: Parent Request**
```
Parent: Via portal or phone call
Message: "Unable to pay ₹72,000 full fee. Request 6-month installment plan."
```

**Step 2: Admin Review**
```
Admin checks:
- Student: Ravi Kumar (Class 8-A)
- Total fee: ₹72,000 (annual)
- Payment history: Always paid on time (good track record)
- Reason: Financial hardship (job loss in family)
```

**Step 3: Create Installment Plan**
```
Admin: "Create Installment Plan"
- Total amount: ₹72,000
- Number of installments: 6
- Installment amount: ₹12,000 each
- Due dates:
  1. April 30: ₹12,000
  2. May 31: ₹12,000
  3. June 30: ₹12,000
  4. July 31: ₹12,000
  5. Aug 31: ₹12,000
  6. Sep 30: ₹12,000
- Late fee waived for first 3 installments (grace period)
```

**Step 4: Principal Approval (Digital)**
```
System sends approval request:
To: Principal (via app notification)
Subject: Installment plan approval request
Details:
- Student: Ravi Kumar (Class 8-A)
- Amount: ₹72,000 in 6 installments
- Reason: Financial hardship
- Recommendation: Approve (good payment history)

Principal: Clicks "Approve" on mobile app
```

**Step 5: System Updates**
```
1. Original invoice (FC/2025-26/003456) marked as "Converted to Installment"
2. Generate 6 new invoices:
   - FC/2025-26/003456-INS-1: ₹12,000 (Due: Apr 30)
   - FC/2025-26/003456-INS-2: ₹12,000 (Due: May 31)
   ... (4 more)
3. Parent receives new payment schedule via SMS/Email
4. System sends reminders for each installment
```

**Step 6: Payment Tracking**
```
Parent pays each installment:
- Installment 1: Paid on Apr 28 ✓
- Installment 2: Paid on May 30 ✓
- Installment 3: Paid on Jul 5 (5 days late) ⚠️
  → Late fee waived (within grace period)
- Installment 4: Pending (due Aug 31)
- System sends reminder on Aug 24 (7 days before)
```

---

## **🎯 SCENARIO 6: Fee Waiver & Scholarship**

### **Context**
- **When**: Student qualifies for financial assistance
- **Who**: Parent requests, Admin processes, Principal approves
- **Volume**: 5-10% of students
- **Frequency**: Annual (academic year start) or as needed

### **How It Works**

**Type 1: Automatic Merit Scholarship**
```
Student: Ananya Patel (Class 10)
Previous year marks: 94% (CBSE Board)

System automatically:
1. Detects marks > 90%
2. Applies 50% tuition waiver
3. Calculates new fee:
   - Standard fee: ₹85,000
   - Tuition: ₹70,000 → ₹35,000 (50% off)
   - Other fees: ₹15,000 (no discount)
   - Final fee: ₹50,000
4. Invoice generated with "Merit Scholarship Applied" note
```

**Type 2: Manual Fee Waiver (Financial Hardship)**
```
Student: Rohan Singh (Class 6)
Situation: Single parent, below poverty line

Step 1: Parent submits waiver request:
- Via portal: "Fee Waiver Request" form
- Uploads documents:
  • Income certificate (₹1,50,000/year)
  • Ration card (BPL category)
  • Parent letter explaining situation

Step 2: Finance Admin reviews:
- Documents verified ✓
- Recommends: 75% tuition waiver
- Reason: "Financial hardship - single parent, BPL category"

Step 3: Principal approves:
- Reviews case on mobile app
- Clicks "Approve - 75% waiver"
- Approval recorded in system

Step 4: System updates fee:
- Standard fee: ₹60,000
- Tuition: ₹50,000 → ₹12,500 (75% waiver)
- Other fees: ₹10,000 (no waiver)
- Final fee: ₹22,500
- Waiver amount: ₹37,500
- Reason recorded: "Principal approved - BPL category"

Step 5: Parent notification:
- SMS: "Fee waiver approved! New fee: ₹22,500 (75% off). Thank you."
- Email: Approval letter PDF
```

---

## **🎯 SCENARIO 7: Late Fee & Penalty Application**

### **Context**
- **When**: Payment overdue beyond grace period
- **Who**: System auto-applies, Admin can waive
- **Volume**: 15-20% of students (varying lateness)
- **Frequency**: Daily (automated check)

### **How It Works**

**Late Fee Policy**
```
Grace period: 7 days after due date
Penalty: 2% per month (or part thereof)
Maximum penalty: 10% of fee amount
```

**Case Study**: Payment overdue

**Timeline**
```
July 15: Due date (₹24,000)
July 22: Grace period ends (no penalty yet)
July 23: Day 1 overdue → Late fee starts
Aug 15: Day 24 overdue (1 month late)
```

**Penalty Calculation**
```
Original amount: ₹24,000
Overdue period: 1 month
Late fee: 2% × ₹24,000 = ₹480
New total: ₹24,480
```

**System Actions**
```
Day +7 (July 22 - Last day of grace):
- SMS: "Tomorrow is last day to pay without late fee. Amount: ₹24,000. Pay now: [link]"

Day +8 (July 23 - Late fee starts):
- System updates invoice:
  • Original amount: ₹24,000
  • Late fee: ₹0 (will calculate on payment)
  • Status: "Overdue"
- SMS: "Payment overdue. Please pay ₹24,000 + late fee to avoid further charges."

Day +15 (July 30):
- SMS: "Second reminder: Fee payment overdue. Late fee applicable."
- Email: Formal notice

Day +30 (Aug 15):
- Late fee now: ₹480 (2% for 1 month)
- Total: ₹24,480
- SMS: "Final notice: Please pay ₹24,480 immediately."
- Phone call (manual or automated)
- Principal notified

Day +60 (Sep 15):
- Escalation to management
- May restrict exam participation (as per school policy)
```

**Late Fee Waiver (Discretionary)**
```
Parent: "I was traveling abroad, just returned. Can waive late fee?"

Admin reviews:
- Payment history: Always on time (good track record)
- Late fee: ₹480
- Reason: Valid (travel)

Admin: "Waive Late Fee"
- Requires principal approval for amounts > ₹500
- Principal approves
- Late fee removed: ₹24,480 → ₹24,000
- Parent receives notification: "Late fee waived. Please pay ₹24,000."
```

---

## **🎯 SCENARIO 8: Refund & Adjustment**

### **Context**
- **When**: Student withdraws, overpayment, duplicate payment
- **Who**: Finance Admin processes, Principal approves
- **Volume**: 2-5% of transactions
- **Frequency**: Throughout the year

### **How It Works**

**Case 1: Student Withdrawal (Mid-year)**
```
Student: Kavya Mehta (Class 9)
Paid: ₹85,000 (full year, Term 1+2+3)
Withdrawal date: October 15, 2025

Refund calculation:
- Period attended: April-Oct (6 months)
- Period not attended: Nov-March (6 months)
- Refund eligible: 50% of annual fee = ₹42,500
- Deductions:
  • Admission fee: ₹5,000 (non-refundable)
  • Library damage: ₹2,000
  • Administrative charges: ₹1,500
- Final refund: ₹42,500 - ₹8,500 = ₹34,000
```

**Refund Processing**
```
Step 1: Admin creates refund request
- Student: Kavya Mehta
- Amount paid: ₹85,000
- Refund amount: ₹34,000
- Reason: "Student withdrawal - relocation to another city"
- Supporting docs: Transfer certificate, withdrawal application

Step 2: Principal approval
- Reviews refund request
- Verifies calculation
- Approves: ₹34,000 refund

Step 3: Finance processes refund
- Payment method: Bank transfer (NEFT/RTGS)
- Parent bank details: [verified from records]
- Transaction ID: NEFT123456789
- Refund date: Oct 20, 2025

Step 4: System updates
- Create refund record in payments table (negative amount)
- Update student ledger: Paid amount reduced
- Generate refund receipt
- Close student fee account

Step 5: Notification
- SMS: "Refund of ₹34,000 processed. Amount will credit in 1-2 days. Ref: NEFT123456789"
- Email: Refund receipt PDF
```

**Case 2: Overpayment / Duplicate Payment**
```
Parent accidentally paid ₹24,000 twice (same invoice)

System alerts:
- "Duplicate payment detected for Invoice FC/2025-26/005678"
- Admin reviews:
  • Payment 1: July 10, UPI, ₹24,000 (Transaction: pay_ABC)
  • Payment 2: July 11, Net Banking, ₹24,000 (Transaction: pay_XYZ)

Options:
1. Refund extra payment: ₹24,000
2. Adjust to next term fee
3. Credit to account (carry forward)

Parent chooses: "Adjust to Term 2 fee"
- System marks: "Advance payment for Term 2"
- Term 2 invoice generated with ₹0 due
- Parent notification: "Duplicate payment adjusted to Term 2."
```

---

## **📊 Summary: All 8 Scenarios**

| # | Scenario | Frequency | Volume | Automation | Complexity |
|---|----------|-----------|--------|------------|------------|
| **1** | Bulk Assignment (New Year) | Annual | 500-2000 students | 95% | Low |
| **2** | Mid-session Admission | Year-round | 50-100 students | 70% | Medium |
| **3** | Online Payment (UPI/Card) | 3x/year | 80-90% payments | 99% | Low |
| **4** | Offline Payment (Cash) | Daily | 10-20% payments | 40% | Medium |
| **5** | Partial Payment / Installments | As needed | 10-15% students | 60% | High |
| **6** | Fee Waiver / Scholarship | Annual + ad-hoc | 5-10% students | 50% | High |
| **7** | Late Fee & Penalty | Daily check | 15-20% students | 90% | Medium |
| **8** | Refund & Adjustment | Rare | 2-5% transactions | 30% | High |

---

## **🔍 Implementation Gap Analysis**

### **✅ What's Currently Implemented (Fee Management System)**

| Feature | Pages | Functionality | Status |
|---------|-------|---------------|--------|
| **Fee Types Management** | FeeTypesPage.tsx | CRUD for fee categories | ✅ 100% |
| **Fee Structures** | FeeStructuresPage.tsx | View/Edit class-wise fees | ⚠️ 60% |
| **Dashboard Stats** | AdminFeeDashboard.tsx | Outstanding, collections, defaulters | ✅ 100% |
| **Student Ledger** | (Backend exists) | Track per-student balances | ⚠️ 70% |

### **❌ What's Missing (Based on 8 Scenarios)**

| Scenario | Missing Feature | Priority | Impact |
|----------|----------------|----------|---------|
| **Scenario 1** | Bulk Fee Assignment UI | **P0** | Blocks entire workflow |
| **Scenario 2** | Pro-rated fee calculation | **P1** | Manual workaround needed |
| **Scenario 3** | Payment gateway integration | **P0** | No online payments |
| **Scenario 3** | Invoice generation & PDF | **P0** | No invoices sent |
| **Scenario 4** | Offline payment recording UI | **P1** | Finance admin cannot record cash |
| **Scenario 5** | Installment plan creation | **P2** | Manual tracking needed |
| **Scenario 6** | Waiver request workflow | **P2** | Email-based workaround |
| **Scenario 7** | Automatic late fee calculation | **P1** | Manual penalty tracking |
| **Scenario 8** | Refund processing workflow | **P3** | Rare, can be manual |

---

## **🎯 Recommended Next Steps**

### **Phase 1: Critical Features (P0)**
1. **Bulk Fee Assignment Page**
   - UI for selecting academic year, target students (All/Class/Section)
   - Preview table showing students + assigned fees
   - Automatic discount application
   - Bulk invoice generation

2. **Invoice Generation System**
   - PDF generation with school branding
   - Multi-channel delivery (Email, SMS, App, WhatsApp)
   - Invoice number auto-generation

3. **Payment Gateway Integration**
   - Razorpay integration (UPI, Cards, Net Banking)
   - Webhook handling for payment confirmation
   - Receipt generation

### **Phase 2: Important Features (P1)**
4. **Pro-rated Fee Calculator**
   - Automatic calculation for mid-session admissions
   - Business rules for recurring vs one-time fees
   - Manual override capability

5. **Offline Payment Recording**
   - Search student by admission number/name
   - Record cash/cheque/bank transfer
   - Digital receipt generation
   - Daily cash reconciliation report

6. **Late Fee Automation**
   - Daily automated check for overdue payments
   - Auto-calculate late fees based on policy
   - Waiver approval workflow

### **Phase 3: Advanced Features (P2)**
7. **Installment Plan Management**
   - Create custom installment schedules
   - Principal approval workflow
   - Generate multiple invoices
   - Track installment payments

8. **Fee Waiver Workflow**
   - Parent waiver request portal
   - Document upload
   - Admin review + recommendation
   - Principal approval
   - Automatic fee adjustment

### **Phase 4: Edge Cases (P3)**
9. **Refund Processing**
   - Refund calculation for withdrawals
   - Approval workflow
   - Bank transfer processing
   - Refund receipt generation

---

## **📝 Database Schema Requirements**

### **New Tables Needed**

```sql
-- Installment Plans
CREATE TABLE installment_plans (
  id INT PRIMARY KEY,
  student_id INT,
  original_invoice_id INT,
  total_amount DECIMAL(10,2),
  num_installments INT,
  created_by INT,
  approved_by INT,
  approval_date TIMESTAMP,
  reason TEXT,
  status VARCHAR(20)
);

CREATE TABLE installment_invoices (
  id INT PRIMARY KEY,
  installment_plan_id INT,
  installment_number INT,
  amount DECIMAL(10,2),
  due_date DATE,
  invoice_id INT,
  status VARCHAR(20)
);

-- Fee Waivers
CREATE TABLE waiver_requests (
  id INT PRIMARY KEY,
  student_id INT,
  requested_by INT,
  waiver_amount DECIMAL(10,2),
  waiver_percentage DECIMAL(5,2),
  reason TEXT,
  documents JSON,
  admin_recommendation TEXT,
  principal_decision VARCHAR(20),
  decision_date TIMESTAMP,
  status VARCHAR(20)
);

-- Refunds
CREATE TABLE refund_requests (
  id INT PRIMARY KEY,
  student_id INT,
  payment_id INT,
  refund_amount DECIMAL(10,2),
  reason TEXT,
  deductions JSON,
  approved_by INT,
  approval_date TIMESTAMP,
  transaction_id VARCHAR(100),
  refund_date DATE,
  status VARCHAR(20)
);

-- Pro-rated Fees
CREATE TABLE fee_proration_rules (
  id INT PRIMARY KEY,
  fee_type_id INT,
  is_prorated BOOLEAN,
  minimum_percentage DECIMAL(5,2),
  calculation_method VARCHAR(50)
);
```

---

**Document Created**: October 17, 2025
**Version**: 1.0
**Status**: Research Complete - Ready for Implementation Planning
**Next Steps**: Prioritize and build missing features based on gap analysis
