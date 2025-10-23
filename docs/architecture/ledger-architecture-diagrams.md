# Ledger-Centric Architecture - Visual Diagrams

This document contains various diagrams explaining the ledger-centric architecture and surrounding features implemented in the ABC International School system.

---

## 1. System Architecture Overview (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ABC INTERNATIONAL SCHOOL - ERP SYSTEM                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│                    React 19 + TypeScript + Material-UI v7                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Admission   │  │     Fee      │  │ Communication│  │   Student    │   │
│  │   Portal     │  │  Management  │  │    Portal    │  │ Information  │   │
│  │  (11 pages)  │  │  (17 pages)  │  │  (4 pages)   │  │  (3 pages)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │                  │            │
└─────────┼─────────────────┼──────────────────┼──────────────────┼────────────┘
          │                 │                  │                  │
          └─────────────────┴──────────────────┴──────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                               │
│                           FastAPI REST API (v1)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /api/v1/admissions    /api/v1/fees         /api/v1/communication          │
│  /api/v1/academic      /api/v1/ledger       /api/v1/students               │
│  /api/v1/auth          /api/v1/payments     /api/v1/documents              │
│                                                                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS LOGIC LAYER                               │
│                          Service Layer (Python)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ Admission       │  │ Fee Management  │  │ Ledger Service  │            │
│  │ Service         │  │ Service         │  │ (CORE)          │            │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
│           │                    │                     │                      │
│           └────────────────────┴─────────────────────┘                      │
│                                │                                            │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA PERSISTENCE LAYER                            │
│                          SQLite (Development)                               │
│                      PostgreSQL (Production - Planned)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ admission.db │  │   sis.db     │  │              │  │              │   │
│  │              │  │              │  │  Future DBs  │  │  Future DBs  │   │
│  │ 19 tables    │  │  5 tables    │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  Key Tables:                                                                │
│  • students                    • student_ledgers (CORE)                    │
│  • applications                • ledger_transactions (AUDIT TRAIL)         │
│  • fee_types                   • payment_allocations (JUNCTION)            │
│  • fee_structures              • fee_sessions                              │
│  • payments                    • adhoc_fee_assignments                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Ledger-Centric Architecture - Core Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEDGER-CENTRIC ARCHITECTURE (CORE)                        │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────────┐
                              │   STUDENT LEDGER     │
                              │ (Single Source of    │
                              │      Truth)          │
                              │                      │
                              │  • total_billed      │
                              │  • total_paid        │
                              │  • total_outstanding │
                              │  • total_adjusted    │
                              │  • is_defaulter      │
                              └──────────┬───────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
         ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
         │    LEDGER       │  │   PAYMENT       │  │  FEE SOURCES   │
         │  TRANSACTIONS   │  │  ALLOCATIONS    │  │                │
         │                 │  │                 │  │ • Fee Sessions │
         │ (Audit Trail)   │  │  (Junction)     │  │ • Adhoc Fees   │
         │                 │  │                 │  │                │
         │ • fee_charge    │  │ • payment_id    │  │                │
         │ • payment       │  │ • fee_type      │  │                │
         │ • adjustment    │  │ • fee_id        │  │                │
         │ • refund        │  │ • amount        │  │                │
         │ • waiver        │  │                 │  │                │
         └─────────────────┘  └─────────────────┘  └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW ILLUSTRATION                              │
└─────────────────────────────────────────────────────────────────────────────┘

Fee Assignment                    Payment Received                Manual Adjustment
      │                                  │                              │
      ▼                                  ▼                              ▼
┌──────────────┐               ┌──────────────┐                ┌──────────────┐
│ Fee Session  │               │   Payment    │                │  Waiver/     │
│   or         │               │   Record     │                │  Refund      │
│ Adhoc Fee    │               │              │                │              │
└──────┬───────┘               └──────┬───────┘                └──────┬───────┘
       │                              │                               │
       ├──────────────────────────────┼───────────────────────────────┤
       │                              │                               │
       ▼                              ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LEDGER TRANSACTION CREATED                            │
│                           (Immutable Record)                                │
│                                                                              │
│  • transaction_type: 'fee_charge' | 'payment' | 'waiver' | 'refund'        │
│  • amount: Positive or Negative                                            │
│  • timestamp: Exact date/time                                              │
│  • created_by: User who initiated                                          │
│  • reference: Link to source (fee/payment)                                 │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STUDENT LEDGER UPDATED                                │
│                                                                              │
│  Fee Charge:    total_billed ↑     outstanding ↑                           │
│  Payment:       total_paid ↑       outstanding ↓                           │
│  Waiver:        total_adjusted ↑   outstanding ↓                           │
│  Refund:        total_paid ↓       outstanding ↑                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Integration Map - How Everything Connects

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE SYSTEM FEATURE MAP                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   ADMISSION      │
│    SYSTEM        │────────┐
│                  │        │
│ • Applications   │        │
│ • Enrollment     │        │
│ • Document Mgmt  │        │
└──────────────────┘        │
                            │
                            ▼
                    ┌──────────────┐
                    │   STUDENT    │◄───────────┐
                    │   RECORD     │            │
                    │              │            │
                    │ • Profile    │            │
                    │ • Class      │            │
                    │ • Academic   │            │
                    └───────┬──────┘            │
                            │                   │
        ┌───────────────────┼───────────────────┼───────────────────┐
        │                   │                   │                   │
        ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│     FEE      │    │    LEDGER    │    │ COMMUNICATION│    │   STUDENT    │
│ MANAGEMENT   │───▶│   (CORE)     │    │    SYSTEM    │    │ INFORMATION  │
│              │    │              │    │              │    │   SYSTEM     │
│ Fee Sessions │    │ Transactions │    │ Messaging    │    │              │
│ Adhoc Fees   │    │ Allocations  │    │ Announcements│    │ Attendance   │
│ Structures   │    │ Outstanding  │    │ Notifications│    │ Academics    │
│ Types        │    │ Defaulters   │    │              │    │ Medical      │
└──────┬───────┘    └──────┬───────┘    └──────────────┘    └──────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌──────────────────────────────────┐
│       PAYMENT SYSTEM             │
│                                  │
│ • Record Payment                 │
│ • Payment Methods                │
│ • Fee Allocation                 │
│ • Receipt Generation             │
│ • Payment History                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│      REPORTING & ANALYTICS       │
│                                  │
│ • Outstanding Reports            │
│ • Collection Trends              │
│ • Defaulter Lists                │
│ • Revenue Analysis               │
│ • Payment Allocation Reports     │
└──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                     CROSS-CUTTING CONCERNS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Authentication & Authorization (JWT)                                       │
│  ├─ Admin Portal (Full Access)                                             │
│  ├─ Parent Portal (Limited Access)                                         │
│  └─ Student Portal (Read-only - Planned)                                   │
│                                                                              │
│  Audit Trail & History                                                      │
│  ├─ Application Status History                                             │
│  ├─ Ledger Transaction History                                             │
│  ├─ Payment History                                                        │
│  └─ Message Delivery Tracking                                              │
│                                                                              │
│  Document Management                                                        │
│  ├─ Application Documents (Birth Cert, Photos)                            │
│  ├─ Student Documents (TC, Medical)                                       │
│  └─ Fee Receipts                                                           │
│                                                                              │
│  Notification System (Planned)                                             │
│  ├─ SMS Notifications (MSG91)                                              │
│  ├─ Email Notifications (SendGrid)                                         │
│  └─ In-app Notifications                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Ledger Transaction Flow - Detailed Sequence Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              FEE ASSIGNMENT TO PAYMENT - SEQUENCE DIAGRAM                    │
└─────────────────────────────────────────────────────────────────────────────┘

Admin           Fee API         Ledger Service      Database        Student Ledger
  │                │                   │                │                 │
  │                │                   │                │                 │
  │ Create Fee     │                   │                │                 │
  │ Session        │                   │                │                 │
  ├───────────────>│                   │                │                 │
  │                │                   │                │                 │
  │                │ Assign to 50      │                │                 │
  │                │ students          │                │                 │
  │                ├──────────────────>│                │                 │
  │                │                   │                │                 │
  │                │                   │ For each       │                 │
  │                │                   │ student:       │                 │
  │                │                   │                │                 │
  │                │                   │ Create Txn     │                 │
  │                │                   │ (fee_charge)   │                 │
  │                │                   ├───────────────>│                 │
  │                │                   │                │                 │
  │                │                   │                │ Update Ledger   │
  │                │                   │                │ total_billed ↑  │
  │                │                   │                ├────────────────>│
  │                │                   │                │                 │
  │                │                   │                │                 │
  │                │ Assignments       │                │                 │
  │                │ Complete          │                │                 │
  │                │<──────────────────┤                │                 │
  │<───────────────┤                   │                │                 │
  │ Success        │                   │                │                 │
  │                │                   │                │                 │
  │                │                   │                │                 │

─────────────────── TIME PASSES - PARENT MAKES PAYMENT ────────────────────────

Parent         Payment API      Ledger Service      Database        Student Ledger
  │                │                   │                │                 │
  │ Record         │                   │                │                 │
  │ Payment        │                   │                │                 │
  │ ₹30,000        │                   │                │                 │
  ├───────────────>│                   │                │                 │
  │                │                   │                │                 │
  │                │ Create Payment    │                │                 │
  │                │ Record            │                │                 │
  │                ├──────────────────>│                │                 │
  │                │                   │                │                 │
  │                │                   │ Create Txn     │                 │
  │                │                   │ (payment)      │                 │
  │                │                   ├───────────────>│                 │
  │                │                   │                │                 │
  │                │                   │                │ Update Ledger   │
  │                │                   │                │ total_paid ↑    │
  │                │                   │                │ outstanding ↓   │
  │                │                   │                ├────────────────>│
  │                │                   │                │                 │
  │                │ Allocate to Fees  │                │                 │
  │                │ (optional)        │                │                 │
  │                ├──────────────────>│                │                 │
  │                │                   │                │                 │
  │                │                   │ Create         │                 │
  │                │                   │ PaymentAlloc   │                 │
  │                │                   ├───────────────>│                 │
  │                │                   │                │                 │
  │                │                   │ Update Fee     │                 │
  │                │                   │ paid_amount    │                 │
  │                │                   ├───────────────>│                 │
  │                │                   │                │                 │
  │                │ Payment Complete  │                │                 │
  │                │<──────────────────┤                │                 │
  │<───────────────┤                   │                │                 │
  │ Receipt        │                   │                │                 │
  │ Generated      │                   │                │                 │
```

---

## 5. Database Entity-Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEDGER-CENTRIC DATABASE SCHEMA                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐
│     students       │
│────────────────────│
│ PK  id             │
│     first_name     │◄─────────┐
│     last_name      │          │
│     admission_no   │          │
│     class_id       │          │
└──────────┬─────────┘          │
           │                    │
           │ 1                  │
           │                    │
           │ N                  │
           ▼                    │
┌────────────────────┐          │
│ student_ledgers    │          │
│────────────────────│          │
│ PK  id             │          │
│ FK  student_id     ├──────────┘
│ FK  academic_year  │
│     total_billed   │◄─────────┐
│     total_paid     │          │ Updates from
│     total_outstanding          │ transactions
│     total_adjusted │          │
│     is_defaulter   │          │
│     last_payment_date         │
└──────────┬─────────┘          │
           │ 1                  │
           │                    │
           │ N                  │
           ▼                    │
┌────────────────────┐          │
│ ledger_transactions│──────────┘
│────────────────────│
│ PK  id             │
│ FK  ledger_id      │
│     transaction_type
│     amount         │
│     transaction_date
│     description    │
│     reference_type │
│     reference_id   │
│     created_by     │
│     is_reversed    │
└────────────────────┘


┌────────────────────┐        ┌────────────────────┐
│   fee_sessions     │        │  adhoc_fee_assign  │
│────────────────────│        │────────────────────│
│ PK  id             │        │ PK  id             │
│     session_name   │        │ FK  student_id     │
│ FK  fee_structure_id        │     fee_type       │
│     total_amount   │        │     amount         │
│     due_date       │        │     paid_amount    │
│     status         │        │     payment_status │
└──────────┬─────────┘        └──────────┬─────────┘
           │                             │
           │                             │
           └──────────┬──────────────────┘
                      │
                      │ Referenced by
                      │
                      ▼
           ┌────────────────────┐
           │ payment_allocations│
           │────────────────────│
           │ PK  id             │
           │ FK  payment_id     ├──────────┐
           │ FK  student_id     │          │
           │     fee_type       │          │
           │ FK  fee_session_id │          │
           │ FK  adhoc_fee_id   │          │
           │     allocated_amount          │
           │     fee_description│          │
           └────────────────────┘          │
                                           │
                                           │
                      ┌────────────────────┘
                      │
                      ▼
           ┌────────────────────┐
           │     payments       │
           │────────────────────│
           │ PK  id             │
           │ FK  student_id     │
           │ FK  academic_year_id
           │     amount         │
           │     payment_method │
           │     payment_status │
           │     payment_date   │
           │     transaction_id │
           │     receipt_number │
           └────────────────────┘


┌────────────────────┐
│   fee_types        │
│────────────────────│
│ PK  id             │
│     type_name      │
│     code           │
│     frequency      │
│     is_mandatory   │
│     is_taxable     │
│     tax_rate       │
└──────────┬─────────┘
           │ 1
           │
           │ N
           ▼
┌────────────────────┐
│ fee_structures     │
│────────────────────│
│ PK  id             │
│ FK  fee_type_id    │
│ FK  class_id       │
│ FK  academic_year_id
│     amount         │
│     is_active      │
└────────────────────┘
```

---

## 6. User Journey Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COMPLETE USER JOURNEY MAP                               │
└─────────────────────────────────────────────────────────────────────────────┘

JOURNEY 1: ADMISSION TO ENROLLMENT
═════════════════════════════════════════════════════════════════════════════

Parent                                Admin
  │                                     │
  ├─ Register Account                  │
  │  (Email/Password)                  │
  │                                     │
  ├─ Fill Application Form             │
  │  (5-step wizard)                   │
  │  • Student Info                    │
  │  • Parent Info                     │
  │  • Address                          │
  │  • Academic Background             │
  │  • Review & Submit                 │
  │                                     │
  ├─ Upload Documents                  │
  │  (Birth Cert, Photos, etc.)        │
  │                                     │
  ├─ Submit Application ──────────────> Review Application
  │                                     │
  │                                     ├─ View Details
  │                                     ├─ Check Documents
  │                                     ├─ Schedule Test/Interview
  │                                     │
  ├◄──── Test Scheduled ───────────────┤
  │                                     │
  ├─ Attend Test                       │
  │                                     │
  │                                     ├─ Record Test Scores
  │                                     │
  ├◄──── Interview Scheduled ──────────┤
  │                                     │
  ├─ Attend Interview                  │
  │                                     │
  │                                     ├─ Make Decision
  │                                     │  (Approve/Reject)
  │                                     │
  ├◄──── Admission Approved ───────────┤
  │     (or Rejected)                  │
  │                                     │
  │                                     ├─ Mark as Enrolled
  │                                     │
  ├◄──── Welcome Email ────────────────┤
  │     Student ID Generated           │
  │                                     │
  └─ Student Record Created            └─ Assign to Class


JOURNEY 2: FEE COLLECTION & PAYMENT
═════════════════════════════════════════════════════════════════════════════

Admin                                 Parent/Student
  │                                     │
  ├─ Configure Fee Types                │
  │  (Tuition, Transport, Exam, etc.)  │
  │                                     │
  ├─ Create Fee Structures             │
  │  (Amount per class/year)           │
  │                                     │
  ├─ Create Fee Session                │
  │  (Assign fees to students)         │
  │                                     │
  │  ┌─────────────────────────────────┐│
  │  │   LEDGER SYSTEM ACTIVATED       ││
  │  │                                 ││
  │  │ • Ledger Transaction Created    ││
  │  │   (type: fee_charge)            ││
  │  │                                 ││
  │  │ • Student Ledger Updated        ││
  │  │   total_billed ↑                ││
  │  │   outstanding ↑                 ││
  │  └─────────────────────────────────┘│
  │                                     │
  ├─ Fee Notification Sent ────────────>│
  │                                     │
  │                                     ├─ View Outstanding Fees
  │                                     │  (Parent Dashboard)
  │                                     │
  │                                     ├─ Make Payment
  │                                     │  (Online/Offline)
  │                                     │
  │◄──── Payment Received ──────────────┤
  │                                     │
  │  ┌─────────────────────────────────┐│
  │  │   LEDGER SYSTEM ACTIVATED       ││
  │  │                                 ││
  │  │ • Payment Record Created        ││
  │  │                                 ││
  │  │ • Ledger Transaction Created    ││
  │  │   (type: payment)               ││
  │  │                                 ││
  │  │ • Payment Allocation Created    ││
  │  │   (links payment to fees)       ││
  │  │                                 ││
  │  │ • Student Ledger Updated        ││
  │  │   total_paid ↑                  ││
  │  │   outstanding ↓                 ││
  │  │                                 ││
  │  │ • Fee Session Updated           ││
  │  │   paid_amount ↑                 ││
  │  └─────────────────────────────────┘│
  │                                     │
  ├─ Generate Receipt ─────────────────>│
  │                                     │
  │                                     ├─ Download Receipt
  │                                     │
  ├─ View Collection Reports           │
  │  • Outstanding Fees                │
  │  • Defaulter List                  │
  │  • Collection Trends               │
  │                                     │


JOURNEY 3: PARENT-TEACHER COMMUNICATION
═════════════════════════════════════════════════════════════════════════════

Teacher/Admin                         Parent
  │                                     │
  ├─ Create Message                    │
  │  • Select Class/Students           │
  │  • Compose Message                 │
  │  • Schedule (optional)             │
  │                                     │
  ├─ Send Message ─────────────────────>│
  │                                     │
  │  ┌─────────────────────────────────┐│
  │  │ Message Delivery Tracked:       ││
  │  │ • sent_at timestamp             ││
  │  │ • delivered_at (when opened)    ││
  │  │ • read_at (when read)           ││
  │  └─────────────────────────────────┘│
  │                                     │
  │                                     ├─ Notification Received
  │                                     │  (Badge count updated)
  │                                     │
  │                                     ├─ Open Message
  │                                     │  (delivered_at recorded)
  │                                     │
  │                                     ├─ Read Message
  │                                     │  (read_at recorded)
  │                                     │
  ├◄──── Read Receipt ─────────────────┤
  │                                     │
  ├─ View Message Statistics           │
  │  • Total Recipients: 45             │
  │  • Delivered: 42                    │
  │  • Read: 38                         │
  │  • Read Rate: 84%                   │
  │                                     │
  ├─ Make Announcement                 │
  │  (All parents)                     │
  │                                     │
  ├─ Broadcast ────────────────────────>│
  │                                     │
  │                                     ├─ View Announcements
  │                                     │
```

---

## 7. Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY STACK                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  React 19 (Latest)           TypeScript 5.x           Vite 7.1.9            │
│  Material-UI v7              React Router v6          Axios                │
│  React Hook Form             Date-fns                 MUI X Date Pickers   │
│                                                                              │
│  Pages: 43                   Routes: 45+              Components: 100+     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FastAPI 0.104+              Python 3.10+             SQLAlchemy 2.0        │
│  Pydantic v2                 JWT (python-jose)        Bcrypt 4.0.1         │
│  Uvicorn                     Alembic (migrations)     Python-multipart     │
│                                                                              │
│  APIs: 80+ endpoints         Services: 8              Models: 25+          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATABASE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Development:  SQLite (2 databases - admission.db, sis.db)                 │
│  Production:   PostgreSQL (Planned)                                        │
│                                                                              │
│  Tables: 24                  Indexes: 50+             Relationships: 30+   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PLANNED INTEGRATIONS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Payment Gateway:    Razorpay / PayU / CCAvenue                            │
│  SMS Service:        MSG91 / Twilio                                        │
│  Email Service:      SendGrid / AWS SES                                    │
│  Translation:        MS Translator API                                     │
│  Storage:            AWS S3 / Azure Blob (Document storage)                │
│  Deployment:         Docker + Kubernetes / AWS ECS                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   Users/Parents  │
                              │     Browsers     │
                              └────────┬─────────┘
                                       │
                                       │ HTTPS
                                       ▼
                              ┌──────────────────┐
                              │   CDN / CloudFlare│
                              │  (Static Assets)  │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Load Balancer   │
                              │  (AWS ALB / Nginx)│
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
           ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
           │  Frontend     │  │  Frontend     │  │  Frontend     │
           │  Container 1  │  │  Container 2  │  │  Container 3  │
           │  (React App)  │  │  (React App)  │  │  (React App)  │
           └───────────────┘  └───────────────┘  └───────────────┘
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  API Gateway     │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
           ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
           │  Backend API  │  │  Backend API  │  │  Backend API  │
           │  Container 1  │  │  Container 2  │  │  Container 3  │
           │  (FastAPI)    │  │  (FastAPI)    │  │  (FastAPI)    │
           └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
                   │                  │                  │
                   └──────────────────┼──────────────────┘
                                      │
                                      ▼
                          ┌──────────────────────┐
                          │  PostgreSQL Primary  │
                          │  (Write + Read)      │
                          └──────────┬───────────┘
                                     │
                          ┌──────────┴───────────┐
                          │                      │
                          ▼                      ▼
              ┌──────────────────┐   ┌──────────────────┐
              │  PostgreSQL      │   │  PostgreSQL      │
              │  Read Replica 1  │   │  Read Replica 2  │
              └──────────────────┘   └──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPPORTING SERVICES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│  │  Redis Cache    │   │  Message Queue  │   │  File Storage   │          │
│  │  (Sessions)     │   │  (Celery/RabbitMQ)  │  (AWS S3)       │          │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│                                                                              │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│  │  Email Service  │   │  SMS Service    │   │  Monitoring     │          │
│  │  (SendGrid)     │   │  (MSG91)        │   │  (DataDog)      │          │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram Usage Guide

### Which Diagram to Use When:

1. **System Architecture Overview** - For high-level presentations to stakeholders
2. **Ledger-Centric Core** - For technical team understanding the financial system
3. **Feature Integration Map** - For product roadmap discussions
4. **Transaction Flow** - For debugging payment issues or understanding flow
5. **Database ERD** - For database design reviews and optimization
6. **User Journey Flow** - For UX discussions and training materials
7. **Technology Stack** - For technical hiring and onboarding
8. **Deployment Architecture** - For DevOps planning and scaling discussions

### Creating Visual Diagrams:

These ASCII diagrams can be converted to visual diagrams using:
- **Mermaid.js** - For sequence diagrams and flowcharts
- **PlantUML** - For UML diagrams and ERDs
- **Draw.io / Lucidchart** - For polished presentation diagrams
- **Figma / Excalidraw** - For collaborative design

---

*Last Updated: October 23, 2025*
*Document Version: 1.0*
*Contact: Technical Architecture Team*
