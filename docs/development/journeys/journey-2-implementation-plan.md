# Implementation Plan
# Journey 2: Fee Collection & Reconciliation System

**Version**: 1.0
**Last Updated**: October 13, 2025
**Timeline**: 10 Weeks
**Project**: Sparked EdTech ERP + SIS + LMS

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Setup](#project-setup)
3. [Phase-wise Development Plan](#phase-wise-development-plan)
4. [Team Structure & Responsibilities](#team-structure--responsibilities)
5. [Technology Stack & Tools](#technology-stack--tools)
6. [Database Design](#database-design)
7. [API Development Plan](#api-development-plan)
8. [Frontend Development Plan](#frontend-development-plan)
9. [Integration Plan](#integration-plan)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Plan](#deployment-plan)
12. [Risk Management](#risk-management)
13. [Success Criteria & Go-Live Checklist](#success-criteria--go-live-checklist)

---

## 1. Executive Summary

### Project Overview
Develop a comprehensive fee collection and reconciliation system that integrates with the existing admission system (Journey 1) and provides end-to-end fee management capabilities.

### Timeline
- **Total Duration**: 10 weeks
- **Phase 1 (MVP)**: Weeks 1-4
- **Phase 2 (Automation)**: Weeks 5-7
- **Phase 3 (Advanced Features)**: Weeks 8-9
- **Phase 4 (Testing & Launch)**: Week 10

### Team Requirements
- 1 Backend Developer (Python/FastAPI)
- 1 Frontend Developer (React/TypeScript)
- 1 Full-stack Developer (Backend + Frontend)
- 1 QA Engineer (Testing)
- 1 Product Manager / Project Lead

### Key Deliverables
- Fee management system (structure setup, assignment, invoicing)
- Payment gateway integration (Razorpay primary, PayU backup)
- Automated reconciliation system
- Outstanding tracking with automated reminders
- Financial dashboards and reports
- Parent portal for fee payment
- Admin portal for fee management

---

## 2. Project Setup

### 2.1 Directory Structure

Create the following directory structure (similar to admission-system):

```
sparked/
├── fee-management-system/
│   ├── CLAUDE.md                           # Context document
│   ├── README.md                           # Setup instructions
│   ├── QUICKSTART.md                       # Quick start guide
│   ├── .gitignore
│   │
│   ├── backend/
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py                     # FastAPI app entry point
│   │   │   │
│   │   │   ├── core/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── config.py               # Configuration (env vars)
│   │   │   │   ├── database.py             # Database connection
│   │   │   │   ├── security.py             # JWT, password hashing
│   │   │   │   └── payment_gateway.py      # Razorpay/PayU wrapper
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── fee.py                  # Fee types, structures
│   │   │   │   ├── invoice.py              # Invoices, invoice items
│   │   │   │   ├── payment.py              # Payments, receipts
│   │   │   │   ├── ledger.py               # Student fee ledger
│   │   │   │   ├── reminder.py             # Payment reminders
│   │   │   │   ├── reconciliation.py       # Reconciliation logs
│   │   │   │   ├── discount.py             # Discount policies, waivers
│   │   │   │   └── user.py                 # Users (from admission system)
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── fee.py                  # Pydantic schemas
│   │   │   │   ├── invoice.py
│   │   │   │   ├── payment.py
│   │   │   │   ├── ledger.py
│   │   │   │   └── report.py
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── v1/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── auth.py             # Authentication endpoints
│   │   │   │   │   ├── fees.py             # Fee management endpoints
│   │   │   │   │   ├── invoices.py         # Invoice endpoints
│   │   │   │   │   ├── payments.py         # Payment endpoints
│   │   │   │   │   ├── receipts.py         # Receipt endpoints
│   │   │   │   │   ├── reconciliation.py   # Reconciliation endpoints
│   │   │   │   │   ├── outstanding.py      # Outstanding tracking
│   │   │   │   │   ├── reminders.py        # Reminder management
│   │   │   │   │   ├── discounts.py        # Discount/waiver endpoints
│   │   │   │   │   ├── reports.py          # Report endpoints
│   │   │   │   │   └── dashboards.py       # Dashboard endpoints
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── fee_service.py          # Business logic for fees
│   │   │   │   ├── invoice_service.py      # Invoice generation logic
│   │   │   │   ├── payment_service.py      # Payment processing logic
│   │   │   │   ├── reconciliation_service.py # Reconciliation logic
│   │   │   │   ├── reminder_service.py     # Reminder logic
│   │   │   │   ├── notification_service.py # SMS/Email notifications
│   │   │   │   └── report_service.py       # Report generation
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── pdf_generator.py        # Invoice/receipt PDF generation
│   │   │   │   ├── sms_sender.py           # SMS service integration
│   │   │   │   ├── email_sender.py         # Email service integration
│   │   │   │   ├── validators.py           # Custom validators
│   │   │   │   └── helpers.py              # Utility functions
│   │   │   │
│   │   │   └── tasks/
│   │   │       ├── __init__.py
│   │   │       ├── celery_app.py           # Celery configuration
│   │   │       ├── reminder_tasks.py       # Automated reminder tasks
│   │   │       └── reconciliation_tasks.py # Automated reconciliation
│   │   │
│   │   ├── migrations/                      # Alembic migrations
│   │   │   └── versions/
│   │   │
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── test_fees.py
│   │   │   ├── test_invoices.py
│   │   │   ├── test_payments.py
│   │   │   └── test_reconciliation.py
│   │   │
│   │   ├── scripts/
│   │   │   ├── generate_dummy_fees.py      # Generate test data
│   │   │   ├── watch_db.py                 # Monitor database
│   │   │   └── migration_helper.py         # Data migration scripts
│   │   │
│   │   ├── requirements.txt                # Python dependencies
│   │   ├── .env.example                    # Environment variables template
│   │   └── alembic.ini                     # Alembic configuration
│   │
│   ├── frontend/
│   │   ├── web-app/
│   │   │   ├── src/
│   │   │   │   ├── components/
│   │   │   │   │   ├── common/             # Reusable components
│   │   │   │   │   ├── fees/               # Fee management components
│   │   │   │   │   ├── invoices/           # Invoice components
│   │   │   │   │   ├── payments/           # Payment components
│   │   │   │   │   ├── reconciliation/     # Reconciliation components
│   │   │   │   │   ├── outstanding/        # Outstanding tracking
│   │   │   │   │   ├── reports/            # Report components
│   │   │   │   │   └── dashboards/         # Dashboard components
│   │   │   │   │
│   │   │   │   ├── pages/
│   │   │   │   │   ├── parent/             # Parent portal pages
│   │   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   │   ├── Fees.tsx
│   │   │   │   │   │   ├── InvoiceDetails.tsx
│   │   │   │   │   │   ├── Payment.tsx
│   │   │   │   │   │   ├── PaymentHistory.tsx
│   │   │   │   │   │   └── Receipts.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── admin/              # Admin portal pages
│   │   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   │   ├── FeeTypes.tsx
│   │   │   │   │   │   ├── FeeStructures.tsx
│   │   │   │   │   │   ├── AssignFees.tsx
│   │   │   │   │   │   ├── Invoices.tsx
│   │   │   │   │   │   ├── Payments.tsx
│   │   │   │   │   │   ├── OfflinePayment.tsx
│   │   │   │   │   │   ├── Reconciliation.tsx
│   │   │   │   │   │   ├── Outstanding.tsx
│   │   │   │   │   │   ├── Reminders.tsx
│   │   │   │   │   │   ├── Waivers.tsx
│   │   │   │   │   │   └── Reports.tsx
│   │   │   │   │   │
│   │   │   │   │   └── principal/          # Principal portal pages
│   │   │   │   │       ├── Dashboard.tsx
│   │   │   │   │       ├── Collections.tsx
│   │   │   │   │       ├── Outstanding.tsx
│   │   │   │   │       ├── Approvals.tsx
│   │   │   │   │       └── Reports.tsx
│   │   │   │   │
│   │   │   │   ├── services/
│   │   │   │   │   ├── api.ts              # Axios configuration
│   │   │   │   │   ├── feeService.ts       # Fee API calls
│   │   │   │   │   ├── invoiceService.ts   # Invoice API calls
│   │   │   │   │   ├── paymentService.ts   # Payment API calls
│   │   │   │   │   └── reportService.ts    # Report API calls
│   │   │   │   │
│   │   │   │   ├── contexts/
│   │   │   │   │   ├── AuthContext.tsx     # Authentication context
│   │   │   │   │   └── FeeContext.tsx      # Fee management context
│   │   │   │   │
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useFees.ts
│   │   │   │   │   ├── useInvoices.ts
│   │   │   │   │   ├── usePayments.ts
│   │   │   │   │   └── useReports.ts
│   │   │   │   │
│   │   │   │   ├── utils/
│   │   │   │   │   ├── constants.ts
│   │   │   │   │   ├── validators.ts
│   │   │   │   │   └── formatters.ts
│   │   │   │   │
│   │   │   │   ├── App.tsx
│   │   │   │   ├── main.tsx
│   │   │   │   └── index.css
│   │   │   │
│   │   │   ├── public/
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── vite.config.ts
│   │   │   └── .env.example
│   │   │
│   │   └── mobile-app/                     # Future: React Native app
│   │
│   ├── docs/
│   │   ├── API.md                          # API documentation
│   │   ├── DATABASE_SCHEMA.md              # Database schema
│   │   ├── DEPLOYMENT.md                   # Deployment guide
│   │   └── USER_GUIDE.md                   # User manual
│   │
│   └── docker/
│       ├── docker-compose.yml              # Docker compose for local dev
│       ├── Dockerfile.backend              # Backend Dockerfile
│       └── Dockerfile.frontend             # Frontend Dockerfile
```

### 2.2 Initial Setup Commands

```bash
# Create project directory
mkdir fee-management-system
cd fee-management-system

# Backend setup
mkdir -p backend/app/{core,models,schemas,api/v1,services,utils,tasks,tests,scripts}
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic python-jose passlib bcrypt razorpay celery redis aiofiles aiosmtplib python-dotenv
pip freeze > requirements.txt

# Frontend setup
cd ../frontend
npm create vite@latest web-app -- --template react-ts
cd web-app
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-date-pickers axios react-router-dom react-hook-form yup @hookform/resolvers dayjs
npm install -D @types/node

# Initialize git
cd ../../
git init
echo "venv/" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "*.db" >> .gitignore
```

---

## 3. Phase-wise Development Plan

### Phase 1: MVP (Weeks 1-4)

#### Week 1: Backend Foundation & Fee Structure

**Backend Tasks**:
- [ ] Set up FastAPI project structure
- [ ] Configure database connection (SQLAlchemy + SQLite for dev)
- [ ] Create database models:
  - `fee_types` table and model
  - `fee_structures` table and model
  - `student_fee_assignments` table and model
- [ ] Create Pydantic schemas for fee management
- [ ] Implement API endpoints:
  - `POST /api/v1/fees/types` - Create fee type
  - `GET /api/v1/fees/types` - List fee types
  - `POST /api/v1/fees/structures` - Create fee structure
  - `GET /api/v1/fees/structures` - List fee structures
  - `POST /api/v1/fees/assign` - Assign fees to student
  - `POST /api/v1/fees/assign/bulk` - Bulk assign fees
- [ ] Implement fee service layer (business logic)
- [ ] Write unit tests for fee endpoints

**Frontend Tasks**:
- [ ] Set up React + TypeScript + Vite project
- [ ] Configure Material-UI v7
- [ ] Create admin portal layout (sidebar, header, navigation)
- [ ] Implement pages:
  - Fee Types Management page
  - Fee Structures Management page
  - Assign Fees page (with bulk assign)
- [ ] Integrate with backend API (Axios service)

**Deliverables**:
- [ ] Fee types created and managed via admin portal
- [ ] Fee structures configured for all classes (Pre-KG to Class 12)
- [ ] Fees assigned to students (bulk operation)

**Testing**:
- [ ] Create 5 fee types (Tuition, Exam, Library, Sports, Transport)
- [ ] Create fee structures for 3 classes (Class 1, Class 5, Class 10)
- [ ] Bulk assign fees to 50 dummy students

---

#### Week 2: Invoice Generation & Delivery

**Backend Tasks**:
- [ ] Create database models:
  - `invoices` table and model
  - `invoice_items` table and model
- [ ] Create Pydantic schemas for invoices
- [ ] Implement API endpoints:
  - `POST /api/v1/invoices/generate` - Generate invoice
  - `POST /api/v1/invoices/bulk-generate` - Bulk generate invoices
  - `GET /api/v1/invoices` - List invoices (with filters)
  - `GET /api/v1/invoices/{id}` - Get invoice details
  - `GET /api/v1/invoices/{id}/pdf` - Download invoice PDF
- [ ] Implement invoice service layer:
  - Invoice generation logic (from fee assignments)
  - Invoice numbering (FC/YYYY-YY/NNNNNN)
  - GST calculation (18%)
  - Pro-rated fee calculation (for mid-session admissions)
- [ ] Implement PDF generation:
  - Invoice PDF template (ReportLab or WeasyPrint)
  - School logo, branding
  - Fee breakup table
  - QR code for UPI payment
- [ ] Implement notification service:
  - Email sending (SMTP/SendGrid)
  - SMS sending (Twilio/MSG91)
  - Templates for invoice notification
- [ ] Write unit tests for invoice endpoints

**Frontend Tasks**:
- [ ] Implement admin pages:
  - Invoice List page (with filters: date, class, status)
  - Invoice Details page
  - Bulk Invoice Generation page
- [ ] Implement parent pages:
  - Parent Dashboard (fee overview)
  - Fees & Invoices page
  - Invoice Details page (parent view)
- [ ] Integrate invoice PDF download
- [ ] Implement responsive design (desktop + mobile)

**Deliverables**:
- [ ] Invoices generated for all students (bulk operation)
- [ ] Invoice PDF downloadable with proper branding
- [ ] Invoice sent via Email + SMS to parents
- [ ] Parent can view invoice in parent portal

**Testing**:
- [ ] Generate 100 invoices (bulk operation)
- [ ] Verify PDF format and content
- [ ] Test email delivery (check spam folders)
- [ ] Test SMS delivery (verify delivery status)

---

#### Week 3: Payment Gateway Integration

**Backend Tasks**:
- [ ] Integrate Razorpay SDK:
  - Install Razorpay Python SDK
  - Configure API keys (test mode)
  - Implement payment gateway wrapper (`payment_gateway.py`)
- [ ] Create database models:
  - `payments` table and model
  - `payment_receipts` table and model
  - `student_fee_ledger` table and model
- [ ] Create Pydantic schemas for payments
- [ ] Implement API endpoints:
  - `POST /api/v1/payments/initiate` - Initiate payment
  - `POST /api/v1/payments/verify` - Verify payment (webhook)
  - `GET /api/v1/payments` - List payments
  - `GET /api/v1/payments/{id}` - Get payment details
  - `POST /api/v1/payments/offline` - Record offline payment
- [ ] Implement payment service layer:
  - Create Razorpay order
  - Verify webhook signature (HMAC-SHA256)
  - Update invoice status (PAID/PARTIAL)
  - Update student ledger (outstanding balance)
  - Handle payment failures
  - Handle partial payments
- [ ] Implement webhook endpoint:
  - Receive payment confirmation from Razorpay
  - Verify signature (security)
  - Process payment (update invoice, ledger, generate receipt)
- [ ] Write unit tests for payment endpoints

**Frontend Tasks**:
- [ ] Implement parent payment page:
  - Payment summary (invoice details, amount)
  - Consolidated payment (multiple children)
  - Razorpay payment modal integration
  - Payment methods: UPI, Cards, Net Banking
- [ ] Implement payment success page:
  - Payment confirmation
  - Receipt download
  - Redirect to payment history
- [ ] Implement payment failure page:
  - Error message
  - Retry button
- [ ] Implement admin offline payment page:
  - Manual payment recording
  - Cash, Cheque, Bank Transfer options
  - Receipt generation

**Deliverables**:
- [ ] Parents can pay online via Razorpay (UPI, Cards, Net Banking)
- [ ] Payment webhook verified and processed
- [ ] Invoice status updated to PAID
- [ ] Offline payments recorded manually by admin

**Testing**:
- [ ] Test online payment (Razorpay test mode)
- [ ] Test UPI payment
- [ ] Test card payment
- [ ] Test net banking payment
- [ ] Test payment webhook (simulate callback)
- [ ] Test offline payment recording
- [ ] Verify invoice status updates
- [ ] Verify ledger balance updates

---

#### Week 4: Receipt Generation & Parent Portal

**Backend Tasks**:
- [ ] Implement receipt generation:
  - Receipt numbering (REC/YYYY-YY/NNNNNN)
  - Receipt PDF template (similar to invoice)
  - Receipt details (payment method, transaction ID, amount)
- [ ] Implement API endpoints:
  - `GET /api/v1/receipts/{id}` - Get receipt details
  - `GET /api/v1/receipts/{id}/pdf` - Download receipt PDF
  - `POST /api/v1/receipts/{id}/email` - Email receipt
  - `POST /api/v1/receipts/{id}/sms` - SMS receipt link
- [ ] Implement receipt notification:
  - Auto-send receipt via Email + SMS after payment
  - Receipt delivery within 30 seconds
- [ ] Implement parent dashboard API:
  - `GET /api/v1/dashboard/parent` - Parent dashboard data
  - Fee overview (total, paid, outstanding)
  - Recent invoices
  - Recent payments
- [ ] Write unit tests for receipt endpoints

**Frontend Tasks**:
- [ ] Implement parent portal pages:
  - Payment History page (list of all payments)
  - Receipt Details page
  - Receipt download/share
- [ ] Enhance parent dashboard:
  - Fee overview cards (total, paid, outstanding)
  - Quick payment button
  - Recent invoices/payments widgets
- [ ] Implement receipt PDF viewer (in-app)
- [ ] Implement share receipt (WhatsApp, Email)

**Deliverables**:
- [ ] Receipt auto-generated after successful payment
- [ ] Receipt sent via Email + SMS within 30 seconds
- [ ] Parent can download receipt anytime from portal
- [ ] Parent dashboard shows fee overview

**Testing**:
- [ ] Test receipt generation (verify content, format)
- [ ] Test receipt email delivery
- [ ] Test receipt SMS delivery
- [ ] Test receipt download from parent portal
- [ ] Test parent dashboard data accuracy

---

### Phase 2: Automation & Reconciliation (Weeks 5-7)

#### Week 5: Automated Reconciliation

**Backend Tasks**:
- [ ] Create database models:
  - `reconciliation_logs` table and model
- [ ] Implement Razorpay settlement API integration:
  - Fetch settlement data (daily)
  - Parse settlement format
- [ ] Implement reconciliation service:
  - Auto-match transactions (transaction ID, amount, date)
  - Identify matched/pending/failed transactions
  - Calculate reconciliation accuracy
  - Handle edge cases (pending T+1/T+2 settlement)
- [ ] Implement API endpoints:
  - `POST /api/v1/reconciliation/gateway` - Trigger gateway reconciliation
  - `POST /api/v1/reconciliation/bank-statement` - Upload bank statement
  - `GET /api/v1/reconciliation/status` - Get reconciliation status
  - `GET /api/v1/reconciliation/unmatched` - List unmatched transactions
  - `POST /api/v1/reconciliation/manual-match` - Manually match transaction
  - `GET /api/v1/reconciliation/report` - Generate reconciliation report
- [ ] Implement bank statement parser:
  - Support CSV/Excel formats (ICICI, HDFC, SBI)
  - Parse columns (date, amount, reference, description)
  - Auto-match with system payments
- [ ] Implement Celery task for automated reconciliation:
  - Schedule: Every 15 minutes
  - Fetch settlement data
  - Match transactions
  - Update reconciliation status
- [ ] Write unit tests for reconciliation logic

**Frontend Tasks**:
- [ ] Implement admin reconciliation dashboard:
  - Reconciliation summary (matched, pending, failed)
  - Daily/weekly/monthly reconciliation stats
  - Unmatched transactions list
  - Manual matching interface
- [ ] Implement bank statement upload:
  - File upload (CSV/Excel)
  - Progress indicator
  - Match results display
- [ ] Implement reconciliation report page:
  - Date range filter
  - Reconciliation metrics
  - Export to Excel/PDF

**Deliverables**:
- [ ] Automated reconciliation running every 15 minutes
- [ ] 99%+ automatic matching accuracy
- [ ] Bank statement upload and auto-matching
- [ ] Admin can view reconciliation status in real-time
- [ ] Unmatched transactions identified and flagged

**Testing**:
- [ ] Test automated reconciliation (simulate 100 payments)
- [ ] Test bank statement upload (ICICI format)
- [ ] Test matching accuracy (99%+)
- [ ] Test manual matching for edge cases
- [ ] Test reconciliation report generation

---

#### Week 6: Outstanding Tracking & Automated Reminders

**Backend Tasks**:
- [ ] Create database models:
  - `payment_reminders` table and model
- [ ] Implement outstanding service:
  - Calculate real-time outstanding balance
  - Calculate late fees (auto-apply after grace period)
  - Aging analysis (0-15, 15-30, 30-60, 60+ days)
- [ ] Implement API endpoints:
  - `GET /api/v1/outstanding/dashboard` - Outstanding dashboard data
  - `GET /api/v1/outstanding/students` - List students with outstanding
  - `GET /api/v1/outstanding/students/{id}` - Get student outstanding details
  - `GET /api/v1/outstanding/aging` - Get aging analysis
  - `GET /api/v1/outstanding/defaulters` - Get defaulter list
- [ ] Implement reminder service:
  - Reminder templates (SMS, Email)
  - Reminder scheduling logic (pre-due, on-due, post-due)
  - Delivery tracking
- [ ] Implement API endpoints:
  - `POST /api/v1/reminders/send` - Send reminder manually
  - `POST /api/v1/reminders/bulk` - Send bulk reminders
  - `GET /api/v1/reminders/history` - Get reminder history
  - `GET /api/v1/reminders/schedule` - Get reminder schedule config
  - `PUT /api/v1/reminders/schedule` - Update reminder schedule
- [ ] Implement Celery task for automated reminders:
  - Schedule: Daily at 10 AM
  - Identify students with dues (upcoming, overdue)
  - Send reminders (pre-due -7 days, on-due, post-due +3, +10, +20, +30)
  - Track delivery status
- [ ] Implement late fee calculation:
  - Auto-apply after grace period (7 days)
  - 2% per month, max 10%
  - Update invoice and ledger
- [ ] Write unit tests for outstanding and reminder logic

**Frontend Tasks**:
- [ ] Implement admin outstanding dashboard:
  - Outstanding summary cards (total, current, overdue)
  - Aging analysis chart (bar chart)
  - Class-wise outstanding table
  - Defaulter list (with contact details)
- [ ] Implement reminder management page:
  - Send manual reminder (individual student)
  - Send bulk reminders (class, overdue bucket)
  - Reminder history (who received, when, delivered/failed)
  - Configure reminder schedule
- [ ] Implement outstanding details page:
  - Student-wise outstanding breakdown
  - Payment history
  - Reminder history
  - Actions: Send reminder, record payment

**Deliverables**:
- [ ] Real-time outstanding tracked for all students
- [ ] Automated reminders sent daily (pre-due, on-due, post-due)
- [ ] Late fees calculated and applied automatically
- [ ] Admin can view aging analysis and defaulter list
- [ ] Manual reminders can be sent for specific students

**Testing**:
- [ ] Test outstanding calculation accuracy
- [ ] Test late fee calculation (after grace period)
- [ ] Test automated reminders (simulate due dates)
- [ ] Test SMS/Email delivery
- [ ] Test reminder history tracking
- [ ] Test aging analysis (bucket accuracy)

---

#### Week 7: Discounts & Waivers

**Backend Tasks**:
- [ ] Create database models:
  - `discount_policies` table and model
  - `waiver_requests` table and model
- [ ] Implement discount service:
  - Discount calculation logic (%, fixed amount)
  - Auto-apply discounts (sibling, early payment, merit)
  - Eligibility validation
- [ ] Implement API endpoints:
  - `POST /api/v1/discounts/policies` - Create discount policy
  - `GET /api/v1/discounts/policies` - List discount policies
  - `PUT /api/v1/discounts/policies/{id}` - Update discount policy
  - `DELETE /api/v1/discounts/policies/{id}` - Delete discount policy
- [ ] Implement waiver workflow:
  - Parent submits waiver request
  - Finance admin reviews (approve/reject recommendation)
  - Principal approves/rejects final decision
  - System applies waiver to invoice
- [ ] Implement API endpoints:
  - `POST /api/v1/waivers/request` - Submit waiver request
  - `GET /api/v1/waivers/pending` - List pending waivers
  - `GET /api/v1/waivers/{id}` - Get waiver details
  - `PUT /api/v1/waivers/{id}/review` - Review waiver (admin)
  - `PUT /api/v1/waivers/{id}/approve` - Approve/reject waiver (principal)
- [ ] Implement notification for waiver workflow:
  - Parent: Waiver submitted
  - Admin: New waiver request
  - Principal: Waiver ready for approval
  - Parent: Waiver approved/rejected
- [ ] Write unit tests for discount and waiver logic

**Frontend Tasks**:
- [ ] Implement admin discount policy page:
  - Create/edit discount policies
  - Configure eligibility criteria
  - Enable/disable policies
- [ ] Implement admin waiver review page:
  - List pending waivers
  - View waiver details (student, amount, reason, documents)
  - Approve/reject with remarks
- [ ] Implement principal waiver approval page:
  - List pending approvals
  - View admin recommendation
  - Final approve/reject
- [ ] Implement parent waiver request page:
  - Submit waiver request (reason, amount, documents)
  - Track waiver status (pending, approved, rejected)

**Deliverables**:
- [ ] Discount policies configured (sibling, early payment, merit)
- [ ] Discounts auto-applied at invoice generation
- [ ] Waiver workflow operational (request → review → approval)
- [ ] Parent can submit waiver request via portal
- [ ] Principal can approve/reject waivers

**Testing**:
- [ ] Test sibling discount (10% 2nd child, 15% 3rd child)
- [ ] Test early payment discount (5% if paid 7+ days early)
- [ ] Test merit scholarship (50% for 90%+ marks)
- [ ] Test waiver workflow (submit → review → approve)
- [ ] Test waiver rejection workflow
- [ ] Test discount application accuracy

---

### Phase 3: Advanced Features (Weeks 8-9)

#### Week 8: Financial Dashboards & Reports

**Backend Tasks**:
- [ ] Implement dashboard service:
  - Finance admin dashboard data aggregation
  - Principal dashboard data aggregation
  - Parent dashboard data aggregation
- [ ] Implement API endpoints:
  - `GET /api/v1/dashboard/finance-admin` - Finance admin dashboard
  - `GET /api/v1/dashboard/principal` - Principal dashboard
  - `GET /api/v1/dashboard/parent` - Parent dashboard (enhanced)
- [ ] Implement report service:
  - Daily collection report
  - Outstanding report
  - Defaulter report
  - Class-wise report
  - Payment method breakdown
  - Reconciliation report
  - GST report (GSTR-1, GSTR-3B)
  - Audit trail report
- [ ] Implement API endpoints:
  - `GET /api/v1/reports/daily-collection` - Daily collection report
  - `GET /api/v1/reports/outstanding` - Outstanding report
  - `GET /api/v1/reports/defaulters` - Defaulter report
  - `GET /api/v1/reports/class-wise` - Class-wise report
  - `GET /api/v1/reports/payment-method` - Payment method breakdown
  - `GET /api/v1/reports/reconciliation` - Reconciliation report
  - `GET /api/v1/reports/gst` - GST report
  - `GET /api/v1/reports/audit` - Audit trail report
- [ ] Implement report export:
  - Excel export (openpyxl)
  - PDF export (ReportLab)
  - CSV export
- [ ] Write unit tests for dashboard and report endpoints

**Frontend Tasks**:
- [ ] Implement finance admin dashboard:
  - Collection summary cards (today, MTD, total)
  - Outstanding summary (total, overdue)
  - Recent payments widget
  - Pending reconciliation items
  - Quick actions (record payment, send reminder)
- [ ] Implement principal dashboard:
  - Executive summary (collection, outstanding, efficiency)
  - Collection trend chart (last 30 days)
  - Top metrics (payment success rate, average payment time)
  - Pending approvals widget
  - Class-wise collection table
- [ ] Implement reports page:
  - Report selector (dropdown)
  - Date range filter
  - Class/section filter
  - Generate report button
  - Export options (Excel, PDF, CSV)
  - Report preview
- [ ] Implement data visualization:
  - Collection trend line chart (Chart.js or Recharts)
  - Aging analysis bar chart
  - Payment method pie chart
  - Class-wise collection table

**Deliverables**:
- [ ] Finance admin dashboard with real-time data
- [ ] Principal dashboard with visual charts
- [ ] 10+ pre-built financial reports
- [ ] Report export to Excel/PDF/CSV
- [ ] Data visualization for key metrics

**Testing**:
- [ ] Test dashboard data accuracy
- [ ] Test dashboard load time (< 5 seconds)
- [ ] Test report generation (all 10 reports)
- [ ] Test report export (Excel, PDF, CSV)
- [ ] Test data visualization (charts render correctly)

---

#### Week 9: Integrations

**Backend Tasks**:
- [ ] Implement Tally export:
  - Generate Tally XML format
  - Voucher entries for payments
  - Ledger balances
  - Student account mapping
- [ ] Implement API endpoints:
  - `GET /api/v1/exports/tally` - Export to Tally XML
  - `GET /api/v1/exports/busy` - Export to Busy Excel
  - `GET /api/v1/exports/excel` - Export report to Excel
  - `GET /api/v1/exports/pdf` - Export report to PDF
- [ ] Implement GST compliance:
  - GSTR-1 report generation (JSON format)
  - GSTR-3B summary generation
  - GST invoice validation
  - GSTIN validation
- [ ] Implement WhatsApp integration (optional):
  - WhatsApp Business API integration
  - Send invoice via WhatsApp
  - Send receipt via WhatsApp
  - Send reminder via WhatsApp
- [ ] Implement PayU integration (backup gateway):
  - PayU SDK integration
  - Payment initiation
  - Webhook verification
  - Settlement data fetch
- [ ] Write unit tests for integrations

**Frontend Tasks**:
- [ ] Implement accountant portal:
  - Export data to Tally (download XML)
  - Export data to Busy (download Excel)
  - GST reports (GSTR-1, GSTR-3B)
  - Bank reconciliation statement
- [ ] Implement payment gateway selection:
  - Admin can configure primary/backup gateway
  - Auto-switch on failure (circuit breaker)
- [ ] Implement WhatsApp notification option:
  - Admin can enable/disable WhatsApp notifications
  - Parent can opt-in/opt-out

**Deliverables**:
- [ ] Tally export working (XML import successful)
- [ ] GST reports ready (GSTR-1, GSTR-3B)
- [ ] WhatsApp integration (optional, if time permits)
- [ ] PayU integration (backup gateway)

**Testing**:
- [ ] Test Tally XML export (import into Tally Prime)
- [ ] Test GST report generation (validate JSON format)
- [ ] Test WhatsApp notification delivery
- [ ] Test PayU payment flow
- [ ] Test gateway auto-switch (simulate Razorpay failure)

---

### Phase 4: Testing & Launch (Week 10)

#### Week 10: Comprehensive Testing & Production Deployment

**Testing Tasks**:
- [ ] **Unit Testing**:
  - Backend: All endpoints (>90% code coverage)
  - Frontend: Critical components (payment, reconciliation)
- [ ] **Integration Testing**:
  - End-to-end user flows (parent payment, admin reconciliation)
  - Payment gateway integration (Razorpay test mode)
  - SMS/Email delivery
  - PDF generation
- [ ] **Load Testing**:
  - 1000+ concurrent payments (Apache JMeter or Locust)
  - Dashboard load test (5000 students)
  - Report generation load test
  - Database query performance
- [ ] **Security Testing**:
  - Payment webhook signature verification
  - SQL injection prevention
  - XSS prevention
  - CSRF prevention
  - Authentication/authorization
  - Sensitive data encryption
- [ ] **User Acceptance Testing (UAT)**:
  - Finance admin UAT (10+ test scenarios)
  - Principal UAT (5+ test scenarios)
  - Parent UAT (5+ test scenarios)
  - Collect feedback and fix bugs

**Bug Fixing & Optimization**:
- [ ] Fix all P0 (critical) bugs
- [ ] Fix all P1 (high priority) bugs
- [ ] Optimize slow queries (add indexes)
- [ ] Optimize dashboard load time
- [ ] Optimize PDF generation time

**Documentation**:
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] User manual (Finance Admin)
- [ ] User manual (Principal)
- [ ] User manual (Parent)
- [ ] Troubleshooting guide

**Deployment Preparation**:
- [ ] Set up production environment:
  - PostgreSQL database (instead of SQLite)
  - Redis (for Celery task queue)
  - SMTP server (for emails)
  - SMS gateway (production account)
  - Payment gateway (production keys)
- [ ] Configure environment variables (.env)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Set up monitoring (Sentry, Prometheus, Grafana)
- [ ] Set up logging (structured JSON logs)
- [ ] Set up backup strategy (daily database backups)

**User Training**:
- [ ] Conduct finance admin training session (2 hours)
- [ ] Conduct principal training session (1 hour)
- [ ] Prepare parent onboarding materials:
  - Video tutorials (How to pay online)
  - Step-by-step guide (PDF)
  - FAQ document
- [ ] Set up help desk (phone + email support)

**Production Deployment**:
- [ ] Deploy backend (FastAPI + Celery)
- [ ] Deploy frontend (React app)
- [ ] Configure domain and SSL (HTTPS)
- [ ] Run database migrations (Alembic)
- [ ] Load production data (students, fees)
- [ ] Generate and send test invoice (to 5 pilot parents)
- [ ] Monitor system closely (first 24 hours)

**Launch Activities**:
- [ ] Send launch announcement email to all parents
- [ ] Generate and send invoices to all parents
- [ ] Activate automated reminders
- [ ] Monitor payment gateway (real-time dashboard)
- [ ] Respond to parent queries (help desk)
- [ ] Fix issues immediately (hotfix releases)

**Post-Launch Activities (Days 1-7)**:
- [ ] Daily monitoring (collections, errors, parent feedback)
- [ ] Collect parent feedback (in-app ratings, surveys)
- [ ] Track key metrics:
  - Online payment adoption rate
  - Payment success rate
  - Average payment time
  - Parent satisfaction score
- [ ] Weekly review meeting:
  - Review metrics
  - Discuss issues and resolutions
  - Plan improvements

**Deliverables**:
- [ ] Production system live and operational
- [ ] 100+ parents successfully completed online payment
- [ ] Zero critical bugs in production
- [ ] User training completed
- [ ] Documentation complete

---

## 4. Team Structure & Responsibilities

### 4.1 Team Composition

**Backend Developer** (Python/FastAPI):
- Responsible for: Backend API development, database design, payment gateway integration, reconciliation logic
- Time commitment: Full-time (40 hours/week)

**Frontend Developer** (React/TypeScript):
- Responsible for: Frontend UI development, parent portal, admin portal, principal portal, responsive design
- Time commitment: Full-time (40 hours/week)

**Full-stack Developer** (Backend + Frontend):
- Responsible for: Integration between backend and frontend, end-to-end feature development, bug fixes
- Time commitment: Full-time (40 hours/week)

**QA Engineer** (Testing):
- Responsible for: Manual testing, automated testing, load testing, security testing, UAT coordination
- Time commitment: Full-time (40 hours/week, more intensive in Weeks 9-10)

**Product Manager / Project Lead**:
- Responsible for: Project planning, stakeholder communication, requirement clarification, sprint planning, go-live coordination
- Time commitment: Part-time (20 hours/week)

### 4.2 Communication Plan

**Daily Standup** (15 minutes):
- Time: 10:00 AM daily
- Format: What did you do yesterday? What will you do today? Any blockers?

**Weekly Sprint Review** (1 hour):
- Time: Friday 4:00 PM
- Format: Demo completed features, review sprint goals, plan next sprint

**Weekly Retrospective** (30 minutes):
- Time: Friday 5:00 PM
- Format: What went well? What can be improved? Action items

**Communication Channels**:
- Slack/Microsoft Teams: Daily communication
- Jira/Trello: Task tracking
- GitHub: Code repository, pull requests, issues
- Google Drive: Documentation, designs, specs

---

## 5. Technology Stack & Tools

### 5.1 Backend Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | FastAPI | 0.104+ |
| **Language** | Python | 3.11+ |
| **Database** | SQLite (dev), PostgreSQL (prod) | 15+ |
| **ORM** | SQLAlchemy | 2.0+ |
| **Migrations** | Alembic | 1.12+ |
| **Authentication** | JWT (python-jose) | 3.3.0 |
| **Password Hashing** | bcrypt (passlib) | 1.7.4 |
| **Payment Gateway** | Razorpay SDK | 1.4.1 |
| **Task Queue** | Celery | 5.3+ |
| **Message Broker** | Redis | 5.0+ |
| **Email** | aiosmtplib | 3.0+ |
| **SMS** | Twilio/MSG91 | - |
| **PDF Generation** | ReportLab / WeasyPrint | - |
| **Excel** | openpyxl | - |
| **Environment** | python-dotenv | 1.0+ |

### 5.2 Frontend Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 19+ |
| **Language** | TypeScript | 5.9+ |
| **Build Tool** | Vite | 7.1+ |
| **UI Library** | Material-UI | 7.3+ |
| **Styling** | Emotion | 11+ |
| **State Management** | React Context / Redux Toolkit | - |
| **Form Handling** | React Hook Form | 7.64+ |
| **Validation** | Yup | 1.7+ |
| **HTTP Client** | Axios | 1.12+ |
| **Routing** | React Router | 7.9+ |
| **Date Handling** | Day.js | 1.11+ |
| **Charts** | Chart.js / Recharts | - |
| **Icons** | Material Icons | - |

### 5.3 Development Tools

| Category | Tool | Purpose |
|----------|------|---------|
| **IDE** | VS Code | Code editor |
| **API Testing** | Postman / Insomnia | Test API endpoints |
| **Database GUI** | DB Browser for SQLite / pgAdmin | View database |
| **Version Control** | Git + GitHub | Code repository |
| **Task Tracking** | Jira / Trello | Sprint planning |
| **Design** | Figma | UI/UX mockups |
| **Documentation** | Markdown, Swagger | API docs |
| **Monitoring** | Sentry | Error tracking |
| **Logging** | Prometheus + Grafana | Metrics |
| **Load Testing** | Apache JMeter / Locust | Performance testing |

---

## 6. Database Design

### 6.1 Database Schema Overview

**Total Tables**: 12 new tables + existing admission system tables

**Key Tables**:
1. `fee_types` - Fee categories (Tuition, Exam, etc.)
2. `fee_structures` - Class-wise fee configuration
3. `student_fee_assignments` - Fee assigned to students
4. `invoices` - Fee invoices
5. `invoice_items` - Invoice line items
6. `payments` - Payment transactions
7. `payment_receipts` - Payment receipts
8. `student_fee_ledger` - Student-wise fee ledger
9. `payment_reminders` - Reminder history
10. `reconciliation_logs` - Reconciliation tracking
11. `discount_policies` - Discount rules
12. `waiver_requests` - Waiver workflow

### 6.2 Database ERD (Entity Relationship Diagram)

```
students (from admission system)
    ↓ (one-to-many)
student_fee_assignments → fee_structures → fee_types
    ↓ (one-to-many)
invoices
    ↓ (one-to-many)
invoice_items
    ↓ (one-to-many)
payments
    ↓ (one-to-one)
payment_receipts

students
    ↓ (one-to-one)
student_fee_ledger

students
    ↓ (one-to-many)
payment_reminders

students
    ↓ (one-to-many)
waiver_requests
```

### 6.3 Key Indexes

**Performance Optimization**:
- `students.id` (primary key, indexed)
- `invoices.student_id` (indexed)
- `invoices.invoice_number` (unique, indexed)
- `payments.transaction_id` (unique, indexed)
- `payments.invoice_id` (indexed)
- `payment_receipts.receipt_number` (unique, indexed)
- `student_fee_ledger.student_id` (unique, indexed)

---

## 7. API Development Plan

### 7.1 API Design Principles

- **RESTful**: Follow REST principles (GET, POST, PUT, DELETE)
- **Versioned**: `/api/v1/...` for future versioning
- **Consistent**: Consistent naming (kebab-case for routes, snake_case for JSON)
- **Paginated**: List endpoints support pagination (limit, offset)
- **Filtered**: List endpoints support filtering (query params)
- **Documented**: Swagger/OpenAPI auto-generated docs
- **Secured**: JWT authentication for protected endpoints
- **Validated**: Pydantic schema validation for all inputs

### 7.2 API Endpoint Categories

1. **Fee Management** (8 endpoints)
2. **Invoice Management** (7 endpoints)
3. **Payment Processing** (6 endpoints)
4. **Receipt Management** (5 endpoints)
5. **Reconciliation** (6 endpoints)
6. **Outstanding & Reminders** (10 endpoints)
7. **Discounts & Waivers** (9 endpoints)
8. **Reports & Dashboards** (12 endpoints)
9. **Exports** (4 endpoints)

**Total**: 67+ API endpoints

### 7.3 API Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Payment gateway timeout",
    "details": { ... }
  }
}
```

---

## 8. Frontend Development Plan

### 8.1 Component Architecture

**Atomic Design Pattern**:
- **Atoms**: Button, Input, Card, Badge, Icon
- **Molecules**: FormField, SearchBar, PaymentMethodSelector
- **Organisms**: InvoiceCard, PaymentForm, ReconciliationTable
- **Templates**: DashboardLayout, FormLayout, ListLayout
- **Pages**: Dashboard, Fees, Invoices, Payments, etc.

### 8.2 State Management

**Context API** (for simple state):
- AuthContext (user, token, login, logout)
- FeeContext (current fees, refresh)

**Local State** (useState for component state):
- Form inputs
- UI state (loading, errors)

**Server State** (React Query - optional):
- API data caching
- Auto-refetch on window focus
- Optimistic updates

### 8.3 Routing Structure

**Parent Portal**:
- `/parent/dashboard` - Dashboard
- `/parent/fees` - Fees & Invoices
- `/parent/fees/invoice/:id` - Invoice Details
- `/parent/fees/payment` - Payment Page
- `/parent/fees/payment-history` - Payment History
- `/parent/fees/receipts` - Receipts

**Admin Portal**:
- `/admin/dashboard` - Dashboard
- `/admin/fees/types` - Fee Types
- `/admin/fees/structures` - Fee Structures
- `/admin/fees/assign` - Assign Fees
- `/admin/invoices` - Invoice List
- `/admin/invoices/:id` - Invoice Details
- `/admin/payments` - Payment List
- `/admin/payments/offline` - Record Offline Payment
- `/admin/reconciliation` - Reconciliation
- `/admin/outstanding` - Outstanding Tracker
- `/admin/reminders` - Reminders
- `/admin/waivers` - Waivers
- `/admin/reports` - Reports

**Principal Portal**:
- `/principal/dashboard` - Dashboard
- `/principal/collection` - Collection Overview
- `/principal/outstanding` - Outstanding Overview
- `/principal/approvals` - Pending Approvals
- `/principal/reports` - Reports

---

## 9. Integration Plan

### 9.1 Admission System Integration

**Data Sync**:
- When student enrollment confirmed → Trigger fee assignment
- Student data (name, class, parent contact) synced to fee system
- Single database (shared tables) OR API integration

**Implementation Options**:
1. **Shared Database**: Both systems use same database (recommended for MVP)
2. **API Integration**: Admission system calls fee system API after enrollment

**Recommended**: Shared database (simpler, faster, no sync issues)

### 9.2 Payment Gateway Integration

**Razorpay Integration Steps**:
1. Create Razorpay account (test mode)
2. Get API keys (key_id, key_secret)
3. Install Razorpay Python SDK
4. Implement payment flow:
   - Create order (backend)
   - Show Razorpay modal (frontend)
   - Verify payment (webhook)
5. Test with Razorpay test cards

**PayU Integration** (backup gateway):
- Similar flow as Razorpay
- Switch gateway via admin configuration

### 9.3 SMS/Email Integration

**SMS Gateway Options**:
- Twilio (international)
- MSG91 (India)
- Exotel (India)

**Email Service Options**:
- SMTP (school's email server)
- SendGrid (cloud service)
- AWS SES (AWS)

**Recommended**: MSG91 (SMS) + SendGrid (Email) for reliability

### 9.4 Accounting Software Integration

**Tally Integration**:
- Generate Tally XML file
- Manual import into Tally Prime
- Automate with Tally API (if available)

**Zoho Books / QuickBooks**:
- API integration (future enhancement)

---

## 10. Testing Strategy

### 10.1 Testing Levels

**1. Unit Testing**:
- Backend: pytest (all services, models, APIs)
- Frontend: Jest + React Testing Library (critical components)
- Coverage: >90% (backend), >70% (frontend)

**2. Integration Testing**:
- End-to-end API testing (all user flows)
- Payment gateway integration testing
- Database transaction testing

**3. Load Testing**:
- 1000+ concurrent payments
- Dashboard with 5000 students
- Report generation performance
- Tools: Apache JMeter, Locust

**4. Security Testing**:
- SQL injection prevention
- XSS prevention
- CSRF prevention
- Authentication/authorization
- Payment webhook signature verification
- Tools: OWASP ZAP, Burp Suite

**5. User Acceptance Testing (UAT)**:
- Finance admin UAT (10+ scenarios)
- Principal UAT (5+ scenarios)
- Parent UAT (5+ scenarios)
- Collect feedback and iterate

### 10.2 Test Cases (Sample)

**Payment Flow Test Cases**:
1. Parent pays full invoice amount via UPI → Success
2. Parent pays partial amount → Outstanding updated correctly
3. Payment gateway timeout → Payment marked as failed
4. Payment webhook with invalid signature → Rejected
5. Duplicate payment → Second payment marked for refund

**Reconciliation Test Cases**:
1. 100 payments reconciled → 100% matched
2. Bank statement uploaded → Auto-matched with payments
3. Unmatched transaction → Flagged for manual review
4. Manual matching → Admin matches transaction

**Outstanding Test Cases**:
1. Invoice due date passed → Late fee applied after grace period
2. Automated reminder sent 7 days before due date
3. Automated reminder sent on due date
4. Automated reminder sent 3 days after due date
5. Aging analysis shows correct buckets

---

## 11. Deployment Plan

### 11.1 Deployment Architecture

**Development Environment**:
- Local machine (SQLite database)
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

**Production Environment**:
- Cloud server (AWS EC2 / DigitalOcean / Heroku)
- PostgreSQL database (managed service)
- Redis (managed service)
- Domain: `https://fees.schoolname.com`

### 11.2 Deployment Steps

**Backend Deployment**:
1. Set up production server (Ubuntu 22.04)
2. Install Python 3.11+
3. Install PostgreSQL, Redis
4. Clone repository
5. Install dependencies (`pip install -r requirements.txt`)
6. Configure environment variables (`.env`)
7. Run database migrations (`alembic upgrade head`)
8. Start FastAPI server (`uvicorn app.main:app --host 0.0.0.0 --port 8000`)
9. Set up Celery worker (`celery -A app.tasks.celery_app worker`)
10. Set up Celery beat scheduler (`celery -A app.tasks.celery_app beat`)
11. Configure Nginx as reverse proxy
12. Set up SSL certificate (Let's Encrypt)

**Frontend Deployment**:
1. Build React app (`npm run build`)
2. Upload `dist` folder to server
3. Configure Nginx to serve static files
4. Set up HTTPS

**CI/CD Pipeline** (GitHub Actions):
- On push to `main` branch:
  - Run tests (backend + frontend)
  - Build Docker images
  - Deploy to production server
  - Run database migrations
  - Restart services

### 11.3 Monitoring & Logging

**Error Tracking**: Sentry
**Metrics**: Prometheus + Grafana
**Logging**: Structured JSON logs (centralized logging)
**Uptime Monitoring**: UptimeRobot, Pingdom

---

## 12. Risk Management

### 12.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Payment gateway downtime | High | Integrate 2 gateways (primary + backup) |
| Database performance issues | High | Proper indexing, query optimization |
| Security breach | Critical | Regular security audits, PCI DSS compliance |
| SMS/Email delivery failure | Medium | Multi-channel delivery, retry mechanism |

### 12.2 Business Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Low parent adoption | High | User-friendly UI, training, incentives |
| Reconciliation discrepancies | High | Automated reconciliation (99%+), daily checks |
| Staff resistance | Medium | Training, highlight benefits, phased rollout |

### 12.3 Compliance Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| GST non-compliance | High | Automated GST calculation, regular audits |
| Data privacy violation | Critical | Encryption, consent, privacy policy |
| Audit failures | High | Complete audit trail, reconciliation reports |

---

## 13. Success Criteria & Go-Live Checklist

### 13.1 Success Criteria

**Operational Metrics**:
- [ ] 95%+ fee collection within due dates
- [ ] 90% reduction in manual reconciliation effort (< 30 min/week)
- [ ] 99%+ payment success rate
- [ ] 100% daily collections reconciled within 24 hours

**User Experience Metrics**:
- [ ] < 3 minutes average payment completion time
- [ ] 90%+ parent satisfaction score
- [ ] 80% reduction in admin time (< 4 hours/week)
- [ ] < 30 seconds receipt delivery time

**Technical Metrics**:
- [ ] 99.5% system uptime
- [ ] < 500ms API response time (95th percentile)
- [ ] < 10 seconds payment processing time
- [ ] Support 500+ concurrent users

### 13.2 Go-Live Checklist

**Pre-Launch (Week 9)**:
- [ ] All P0 bugs fixed
- [ ] All P1 bugs fixed
- [ ] Load testing passed (1000+ concurrent payments)
- [ ] Security testing passed
- [ ] UAT completed (all user roles)
- [ ] Documentation complete (API, user manual)
- [ ] Production environment ready (database, server, SSL)
- [ ] Payment gateway production keys configured
- [ ] SMS/Email gateway production accounts configured
- [ ] User training completed (finance admin, principal)
- [ ] Parent onboarding materials ready (videos, guides, FAQs)
- [ ] Help desk set up (phone + email support)

**Launch Day (Week 10, Day 1)**:
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Run database migrations
- [ ] Load production data (students, fees)
- [ ] Generate test invoice (to 5 pilot parents)
- [ ] Verify test payment (end-to-end)
- [ ] Send launch announcement email to all parents
- [ ] Generate and send invoices to all parents (bulk)
- [ ] Activate automated reminders
- [ ] Monitor system real-time (dashboard, logs, errors)

**Post-Launch (Days 2-7)**:
- [ ] Daily monitoring (collections, errors, parent feedback)
- [ ] Respond to parent queries (help desk)
- [ ] Fix critical issues (hotfix releases)
- [ ] Collect feedback (in-app ratings, surveys)
- [ ] Track metrics (adoption, satisfaction, operational)
- [ ] Weekly review meeting (team + stakeholders)

**First Month Review (Week 14)**:
- [ ] Review adoption metrics (online payment %, parent satisfaction)
- [ ] Review operational metrics (reconciliation time, outstanding %)
- [ ] Gather feedback (finance admin, principal, parents)
- [ ] Plan improvements (Phase 5 roadmap)
- [ ] Celebrate success! 🎉

---

**End of Implementation Plan**

---

**Document Metadata**:
- **Document Type**: Implementation Plan
- **Journey**: Journey 2 - Fee Collection & Reconciliation
- **Project**: Sparked EdTech ERP + SIS + LMS
- **Version**: 1.0
- **Status**: Ready for Development
- **Created**: October 13, 2025
- **Timeline**: 10 Weeks
- **Next Steps**:
  1. Review implementation plan with development team
  2. Set up project directory structure
  3. Begin Phase 1 (Week 1) - Backend Foundation & Fee Structure
  4. Daily standups and weekly sprint reviews
  5. Track progress against milestones
