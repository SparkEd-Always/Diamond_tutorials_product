# TODO - Fee Management System
## Development Checklist

**Last Updated**: October 13, 2025
**Current Phase**: Phase 1 - MVP Development
**Status**: Project Setup Complete ✅

---

## 🎯 Current Status

### ✅ Completed
- [x] Project structure created (37 files)
- [x] Backend skeleton (FastAPI + SQLAlchemy)
- [x] Frontend skeleton (React 19 + TypeScript + Material-UI v7)
- [x] Documentation (README, CLAUDE, QUICKSTART, PRD, Implementation Plan)
- [x] Configuration files (.env.example, requirements.txt, package.json)
- [x] Git repository setup

### 🔄 In Progress
- [ ] None (Ready to start Phase 1)

### ⏳ Next Up
- Phase 1, Week 1: Backend Foundation & Fee Structure Management

---

## 📅 Development Roadmap

### **Phase 1: MVP (Weeks 1-4)**

#### Week 1: Backend Foundation & Fee Structure ⏳ NEXT
**Start Date**: TBD
**Duration**: 5 days

**Backend Tasks**:
- [ ] Create database models (SQLAlchemy):
  - [ ] `models/fee.py` - FeeType model
  - [ ] `models/fee.py` - FeeStructure model
  - [ ] `models/fee.py` - StudentFeeAssignment model
- [ ] Create Pydantic schemas:
  - [ ] `schemas/fee.py` - FeeTypeCreate, FeeTypeResponse
  - [ ] `schemas/fee.py` - FeeStructureCreate, FeeStructureResponse
  - [ ] `schemas/fee.py` - StudentFeeAssignmentCreate
- [ ] Create database migrations:
  - [ ] Initialize Alembic: `alembic init migrations`
  - [ ] Create migration: `alembic revision --autogenerate -m "Add fee tables"`
  - [ ] Run migration: `alembic upgrade head`
- [ ] Implement API endpoints (`api/v1/fees.py`):
  - [ ] POST `/api/v1/fees/types` - Create fee type
  - [ ] GET `/api/v1/fees/types` - List fee types
  - [ ] GET `/api/v1/fees/types/{id}` - Get fee type details
  - [ ] PUT `/api/v1/fees/types/{id}` - Update fee type
  - [ ] DELETE `/api/v1/fees/types/{id}` - Delete fee type
  - [ ] POST `/api/v1/fees/structures` - Create fee structure
  - [ ] GET `/api/v1/fees/structures` - List fee structures
  - [ ] POST `/api/v1/fees/assign` - Assign fees to student
  - [ ] POST `/api/v1/fees/assign/bulk` - Bulk assign fees
- [ ] Implement service layer:
  - [ ] `services/fee_service.py` - Business logic for fee management
- [ ] Write unit tests:
  - [ ] `tests/test_fees.py` - Test all fee endpoints
- [ ] Test with Postman/Thunder Client

**Frontend Tasks**:
- [ ] Create admin portal layout:
  - [ ] `components/common/Sidebar.tsx` - Navigation sidebar
  - [ ] `components/common/Header.tsx` - Top header with user info
  - [ ] `components/common/Layout.tsx` - Main layout wrapper
- [ ] Create fee management pages:
  - [ ] `pages/admin/FeeTypes.tsx` - Fee types management
  - [ ] `pages/admin/FeeStructures.tsx` - Fee structures management
  - [ ] `pages/admin/AssignFees.tsx` - Assign fees (bulk)
- [ ] Create reusable components:
  - [ ] `components/fees/FeeTypeForm.tsx` - Create/Edit fee type
  - [ ] `components/fees/FeeTypeList.tsx` - List of fee types
  - [ ] `components/fees/FeeStructureForm.tsx` - Create/Edit fee structure
  - [ ] `components/fees/FeeStructureList.tsx` - List of fee structures
- [ ] Create API service layer:
  - [ ] `services/api.ts` - Axios configuration
  - [ ] `services/feeService.ts` - Fee API calls
- [ ] Create React contexts:
  - [ ] `contexts/AuthContext.tsx` - Authentication state
- [ ] Integrate with backend API
- [ ] Test all CRUD operations

**Testing**:
- [ ] Create 5 fee types (Tuition, Exam, Library, Sports, Transport)
- [ ] Create fee structures for 3 classes (Class 1, 5, 10)
- [ ] Bulk assign fees to 50 dummy students
- [ ] Verify data in database

**Deliverables**:
- [ ] Fee types managed via admin portal
- [ ] Fee structures configured for all classes
- [ ] Fees assigned to students (bulk operation)

---

#### Week 2: Invoice Generation & Delivery
**Start Date**: TBD
**Duration**: 5 days

**Backend Tasks**:
- [ ] Create database models:
  - [ ] `models/invoice.py` - Invoice model
  - [ ] `models/invoice.py` - InvoiceItem model
- [ ] Create Pydantic schemas:
  - [ ] `schemas/invoice.py` - InvoiceCreate, InvoiceResponse
  - [ ] `schemas/invoice.py` - InvoiceItemResponse
- [ ] Create database migration for invoice tables
- [ ] Implement API endpoints (`api/v1/invoices.py`):
  - [ ] POST `/api/v1/invoices/generate` - Generate invoice
  - [ ] POST `/api/v1/invoices/bulk-generate` - Bulk generate
  - [ ] GET `/api/v1/invoices` - List invoices (with filters)
  - [ ] GET `/api/v1/invoices/{id}` - Get invoice details
  - [ ] GET `/api/v1/invoices/{id}/pdf` - Download invoice PDF
  - [ ] PUT `/api/v1/invoices/{id}` - Update invoice
  - [ ] DELETE `/api/v1/invoices/{id}` - Cancel invoice
- [ ] Implement invoice service:
  - [ ] `services/invoice_service.py` - Invoice generation logic
  - [ ] Auto-calculate GST (18%)
  - [ ] Pro-rated fee calculation (mid-session admissions)
  - [ ] Invoice numbering (FC/YYYY-YY/NNNNNN)
- [ ] Implement PDF generation:
  - [ ] `utils/pdf_generator.py` - Invoice PDF template
  - [ ] School logo, branding
  - [ ] Fee breakup table
  - [ ] QR code for UPI payment
- [ ] Implement notification service:
  - [ ] `utils/email_sender.py` - Email sending (SMTP/SendGrid)
  - [ ] `utils/sms_sender.py` - SMS sending (MSG91/Twilio)
  - [ ] Email template for invoice notification
  - [ ] SMS template for invoice notification
- [ ] Write unit tests for invoice endpoints

**Frontend Tasks**:
- [ ] Create admin invoice pages:
  - [ ] `pages/admin/Invoices.tsx` - Invoice list with filters
  - [ ] `pages/admin/InvoiceDetails.tsx` - Invoice details
  - [ ] `pages/admin/BulkInvoiceGeneration.tsx` - Bulk generate
- [ ] Create parent invoice pages:
  - [ ] `pages/parent/Dashboard.tsx` - Fee overview
  - [ ] `pages/parent/Fees.tsx` - All fees and invoices
  - [ ] `pages/parent/InvoiceDetails.tsx` - Invoice details (parent view)
- [ ] Create invoice components:
  - [ ] `components/invoices/InvoiceCard.tsx` - Invoice card
  - [ ] `components/invoices/InvoiceList.tsx` - List of invoices
  - [ ] `components/invoices/InvoiceFilters.tsx` - Filter bar
- [ ] Integrate invoice PDF download
- [ ] Create API service:
  - [ ] `services/invoiceService.ts` - Invoice API calls
- [ ] Implement responsive design (desktop + mobile)

**Testing**:
- [ ] Generate 100 invoices (bulk operation)
- [ ] Verify PDF format and content
- [ ] Test email delivery (check spam folders)
- [ ] Test SMS delivery (verify delivery status)
- [ ] Test invoice viewing in parent portal

**Deliverables**:
- [ ] Invoices generated for all students
- [ ] Invoice PDF downloadable with branding
- [ ] Invoices sent via Email + SMS
- [ ] Parent can view invoices in portal

---

#### Week 3: Payment Gateway Integration
**Start Date**: TBD
**Duration**: 5 days

**Backend Tasks**:
- [ ] Install and configure Razorpay SDK
- [ ] Create payment gateway wrapper:
  - [ ] `core/payment_gateway.py` - Razorpay wrapper class
  - [ ] Create order method
  - [ ] Verify payment method
  - [ ] Webhook signature verification
  - [ ] Refund method
- [ ] Create database models:
  - [ ] `models/payment.py` - Payment model
  - [ ] `models/payment.py` - PaymentReceipt model
  - [ ] `models/ledger.py` - StudentFeeLedger model
- [ ] Create Pydantic schemas:
  - [ ] `schemas/payment.py` - PaymentInitiate, PaymentResponse
  - [ ] `schemas/payment.py` - PaymentReceiptResponse
- [ ] Create database migration for payment tables
- [ ] Implement API endpoints (`api/v1/payments.py`):
  - [ ] POST `/api/v1/payments/initiate` - Initiate payment
  - [ ] POST `/api/v1/payments/verify` - Verify payment (webhook)
  - [ ] GET `/api/v1/payments` - List payments
  - [ ] GET `/api/v1/payments/{id}` - Get payment details
  - [ ] POST `/api/v1/payments/offline` - Record offline payment
  - [ ] POST `/api/v1/payments/{id}/refund` - Initiate refund
- [ ] Implement payment service:
  - [ ] `services/payment_service.py` - Payment processing logic
  - [ ] Webhook signature verification (HMAC-SHA256)
  - [ ] Update invoice status (PAID/PARTIAL)
  - [ ] Update student ledger (outstanding balance)
  - [ ] Handle payment failures
  - [ ] Handle partial payments
- [ ] Implement webhook endpoint (secure)
- [ ] Write unit tests for payment endpoints

**Frontend Tasks**:
- [ ] Create parent payment page:
  - [ ] `pages/parent/Payment.tsx` - Payment page
  - [ ] Payment summary (invoice details, amount)
  - [ ] Consolidated payment (multiple children)
  - [ ] Razorpay modal integration
  - [ ] Payment methods: UPI, Cards, Net Banking
- [ ] Create payment components:
  - [ ] `components/payments/PaymentSummary.tsx` - Payment summary
  - [ ] `components/payments/PaymentMethods.tsx` - Payment method selector
  - [ ] `components/payments/RazorpayButton.tsx` - Razorpay integration
- [ ] Create payment result pages:
  - [ ] `pages/parent/PaymentSuccess.tsx` - Success page
  - [ ] `pages/parent/PaymentFailure.tsx` - Failure page
- [ ] Create admin offline payment page:
  - [ ] `pages/admin/OfflinePayment.tsx` - Record cash/cheque
- [ ] Create API service:
  - [ ] `services/paymentService.ts` - Payment API calls
- [ ] Integrate Razorpay frontend SDK

**Testing**:
- [ ] Test online payment (Razorpay test mode)
- [ ] Test UPI payment
- [ ] Test card payment
- [ ] Test net banking payment
- [ ] Test payment webhook (use ngrok for local testing)
- [ ] Test offline payment recording
- [ ] Verify invoice status updates
- [ ] Verify ledger balance updates

**Deliverables**:
- [ ] Parents can pay online via Razorpay
- [ ] Payment webhook verified and processed
- [ ] Invoice status updated to PAID
- [ ] Offline payments recorded by admin

---

#### Week 4: Receipt Generation & Parent Portal
**Start Date**: TBD
**Duration**: 5 days

**Backend Tasks**:
- [ ] Implement receipt generation:
  - [ ] Receipt numbering (REC/YYYY-YY/NNNNNN)
  - [ ] Receipt PDF template (similar to invoice)
  - [ ] `utils/pdf_generator.py` - Receipt PDF method
- [ ] Implement API endpoints (`api/v1/receipts.py`):
  - [ ] GET `/api/v1/receipts/{id}` - Get receipt details
  - [ ] GET `/api/v1/receipts/{id}/pdf` - Download receipt PDF
  - [ ] POST `/api/v1/receipts/{id}/email` - Email receipt
  - [ ] POST `/api/v1/receipts/{id}/sms` - SMS receipt link
  - [ ] POST `/api/v1/receipts/regenerate` - Regenerate receipt
- [ ] Implement receipt notification:
  - [ ] Auto-send receipt via Email + SMS after payment
  - [ ] Receipt delivery within 30 seconds
- [ ] Implement parent dashboard API:
  - [ ] GET `/api/v1/dashboard/parent` - Parent dashboard data
  - [ ] Fee overview (total, paid, outstanding)
  - [ ] Recent invoices
  - [ ] Recent payments
- [ ] Write unit tests for receipt endpoints

**Frontend Tasks**:
- [ ] Create parent portal pages:
  - [ ] `pages/parent/PaymentHistory.tsx` - Payment history list
  - [ ] `pages/parent/Receipts.tsx` - All receipts
  - [ ] `pages/parent/ReceiptDetails.tsx` - Receipt details
- [ ] Enhance parent dashboard:
  - [ ] `pages/parent/Dashboard.tsx` - Enhanced dashboard
  - [ ] Fee overview cards (total, paid, outstanding)
  - [ ] Quick payment button
  - [ ] Recent invoices/payments widgets
- [ ] Create receipt components:
  - [ ] `components/receipts/ReceiptCard.tsx` - Receipt card
  - [ ] `components/receipts/ReceiptList.tsx` - List of receipts
- [ ] Implement receipt PDF viewer (in-app)
- [ ] Implement share receipt (WhatsApp, Email)
- [ ] Create API service:
  - [ ] `services/receiptService.ts` - Receipt API calls
- [ ] Polish UI/UX (responsive, mobile-friendly)

**Testing**:
- [ ] Test receipt generation (verify content, format)
- [ ] Test receipt email delivery
- [ ] Test receipt SMS delivery
- [ ] Test receipt download from parent portal
- [ ] Test parent dashboard data accuracy
- [ ] Test on mobile devices

**Deliverables**:
- [ ] Receipt auto-generated after payment
- [ ] Receipt sent via Email + SMS within 30 seconds
- [ ] Parent can download receipt anytime
- [ ] Parent dashboard shows fee overview

**Phase 1 Completion Criteria**:
- [ ] All P0 bugs fixed
- [ ] 50+ parents test online payment successfully
- [ ] 95%+ payment success rate
- [ ] < 3 minutes average payment time
- [ ] Documentation updated

---

### **Phase 2: Automation & Reconciliation (Weeks 5-7)**

#### Week 5: Automated Reconciliation ⏳ TODO
**Start Date**: TBD
**Duration**: 5 days

**Tasks**:
- [ ] Create reconciliation models
- [ ] Integrate Razorpay settlement API
- [ ] Implement auto-matching logic (99%+ accuracy)
- [ ] Bank statement upload and parsing
- [ ] Reconciliation dashboard
- [ ] Celery task for automated reconciliation (every 15 min)
- [ ] Unmatched transaction handling
- [ ] Reconciliation reports
- [ ] Unit tests

**Deliverables**:
- [ ] Automated reconciliation running every 15 minutes
- [ ] 99%+ automatic matching accuracy
- [ ] Bank statement upload working
- [ ] Admin can view reconciliation status in real-time

---

#### Week 6: Outstanding Tracking & Reminders ⏳ TODO
**Start Date**: TBD
**Duration**: 5 days

**Tasks**:
- [ ] Create outstanding tracking models
- [ ] Real-time outstanding balance calculation
- [ ] Late fee auto-calculation
- [ ] Aging analysis (0-15, 15-30, 30-60, 60+ days)
- [ ] Reminder service (SMS + Email)
- [ ] Reminder templates
- [ ] Celery task for automated reminders (daily at 10 AM)
- [ ] Outstanding dashboard
- [ ] Defaulter list
- [ ] Unit tests

**Deliverables**:
- [ ] Real-time outstanding tracked for all students
- [ ] Automated reminders sent daily
- [ ] Late fees calculated and applied automatically
- [ ] Admin can view aging analysis and defaulter list

---

#### Week 7: Discounts & Waivers ⏳ TODO
**Start Date**: TBD
**Duration**: 5 days

**Tasks**:
- [ ] Create discount policy models
- [ ] Create waiver request models
- [ ] Implement discount calculation logic
- [ ] Auto-apply discounts (sibling, early payment, merit)
- [ ] Waiver request workflow (Parent → Admin → Principal)
- [ ] Discount/waiver API endpoints
- [ ] Admin discount policy management page
- [ ] Admin waiver review page
- [ ] Principal waiver approval page
- [ ] Parent waiver request page
- [ ] Unit tests

**Deliverables**:
- [ ] Discount policies configured
- [ ] Discounts auto-applied at invoice generation
- [ ] Waiver workflow operational
- [ ] Parent can submit waiver requests
- [ ] Principal can approve/reject waivers

---

### **Phase 3: Advanced Features (Weeks 8-9)**

#### Week 8: Financial Dashboards & Reports ⏳ TODO
**Start Date**: TBD
**Duration**: 5 days

**Tasks**:
- [ ] Finance admin dashboard
- [ ] Principal dashboard
- [ ] Parent dashboard (enhanced)
- [ ] 10+ pre-built reports
- [ ] Report export (Excel/PDF/CSV)
- [ ] Data visualization (Chart.js)
- [ ] Custom report builder
- [ ] Unit tests

**Deliverables**:
- [ ] Real-time dashboards for all user roles
- [ ] 10+ pre-built financial reports
- [ ] Report export working
- [ ] Data visualization

---

#### Week 9: Integrations ⏳ TODO
**Start Date**: TBD
**Duration**: 5 days

**Tasks**:
- [ ] Tally XML export
- [ ] GST reports (GSTR-1, GSTR-3B)
- [ ] WhatsApp integration (optional)
- [ ] PayU integration (backup gateway)
- [ ] Accountant portal
- [ ] Unit tests

**Deliverables**:
- [ ] Tally export working
- [ ] GST reports ready
- [ ] WhatsApp notifications (if time permits)
- [ ] PayU backup gateway

---

### **Phase 4: Testing & Launch (Week 10)**

#### Week 10: Testing & Production Deployment ⏳ TODO
**Start Date**: TBD
**Duration**: 7 days

**Tasks**:
- [ ] Unit testing (>90% coverage)
- [ ] Integration testing
- [ ] Load testing (1000+ concurrent payments)
- [ ] Security testing (penetration testing)
- [ ] User acceptance testing (UAT)
- [ ] Bug fixing (P0, P1)
- [ ] Performance optimization
- [ ] Documentation update
- [ ] Production environment setup
- [ ] Database migration (SQLite → PostgreSQL)
- [ ] User training (finance admin, principal)
- [ ] Parent onboarding materials
- [ ] Production deployment
- [ ] Monitoring setup (Sentry, Prometheus)
- [ ] Go-live!

**Deliverables**:
- [ ] All P0, P1 bugs fixed
- [ ] Load tested (1000+ concurrent payments)
- [ ] Security audit passed
- [ ] Production deployed
- [ ] 100+ parents successfully paid online

---

## 🐛 Known Issues

### High Priority (P0)
- None yet

### Medium Priority (P1)
- None yet

### Low Priority (P2)
- None yet

---

## 📝 Notes & Decisions

### Technical Decisions
- **Database**: SQLite for development, PostgreSQL for production
- **Payment Gateway**: Razorpay (primary), PayU (backup)
- **SMS Gateway**: MSG91 (India)
- **Email Service**: SendGrid (cloud) or SMTP
- **PDF Library**: ReportLab (chosen for flexibility)
- **Task Queue**: Celery + Redis

### Design Decisions
- **Desktop-first for admin** (wider containers: `maxWidth="xl"`)
- **Mobile-first for parents** (responsive design)
- **Same tech stack as admission system** (consistency)
- **Material-UI v7** (modern components)

### Business Decisions
- **GST**: 18% on all services (configurable)
- **Late fee**: 2% per month after 7-day grace period
- **Sibling discount**: 10% for 2nd child, 15% for 3rd child
- **Payment methods**: UPI, Cards, Net Banking, Wallets, Offline Cash/Cheque

---

## 🔗 Related Resources

### Documentation
- [README.md](README.md) - Project overview
- [CLAUDE.md](CLAUDE.md) - AI context document
- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- [Journey 2 PRD](../docs/product/journey-2-fee-collection-prd.md) - Product requirements (126 pages)
- [Implementation Plan](../docs/development/journeys/journey-2-implementation-plan.md) - Development plan (80 pages)

### External Resources
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Material-UI: https://mui.com/
- Razorpay: https://razorpay.com/docs/
- Celery: https://docs.celeryq.dev/

---

## ✅ Development Checklist

### Before Starting Development
- [ ] Read README.md
- [ ] Read CLAUDE.md
- [ ] Read QUICKSTART.md
- [ ] Setup backend (Python + virtual environment)
- [ ] Setup frontend (Node.js + npm)
- [ ] Verify both servers running
- [ ] Configure .env files (Razorpay test keys, SMTP, SMS)
- [ ] Understand user journeys (see CLAUDE.md)

### During Development
- [ ] Write unit tests for all new code
- [ ] Update API documentation (docs/API.md)
- [ ] Update database schema docs if tables change
- [ ] Commit frequently with clear messages
- [ ] Create pull requests for review
- [ ] Test on mobile devices

### Before Each Release
- [ ] Run all tests (backend + frontend)
- [ ] Manual testing of all user flows
- [ ] Update CHANGELOG.md
- [ ] Update version numbers
- [ ] Tag release in git

---

## 🎯 Success Metrics (Track Weekly)

### Operational Metrics
- [ ] Payment success rate: ___% (Target: 99%+)
- [ ] Reconciliation accuracy: ___% (Target: 99%+)
- [ ] API response time: ___ms (Target: < 500ms)
- [ ] System uptime: ___% (Target: 99.5%+)

### User Metrics
- [ ] Parent satisfaction: ___% (Target: 90%+)
- [ ] Average payment time: ___ minutes (Target: < 3 min)
- [ ] Online payment adoption: ___% (Target: 85%+)
- [ ] Admin time savings: ___% (Target: 80%+)

### Business Metrics
- [ ] Collection cycle time: ___ days (Target: < 21 days)
- [ ] Outstanding >60 days: ___% (Target: < 1.5%)
- [ ] Bad debts: ___% (Target: < 1%)

---

**Last Updated**: October 13, 2025
**Next Update**: After Week 1 completion
**Maintained By**: Development Team

*Update this file as development progresses!*
