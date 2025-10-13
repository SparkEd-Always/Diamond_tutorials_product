# Claude AI Context - Fee Management System
## Journey 2: Fee Collection & Reconciliation

**Last Updated**: October 13, 2025
**Current Phase**: Phase 1 - MVP Development
**Status**: Development in Progress

---

## 🎯 Project Context

### What We're Building
A comprehensive fee collection and reconciliation system for Indian schools that:
- Automates fee management from structure setup to payment reconciliation
- Integrates with existing admission system (Journey 1)
- Reduces manual reconciliation effort by 90%
- Provides real-time financial visibility to all stakeholders
- Ensures 99%+ payment processing accuracy

### Why We're Building It
Indian schools currently face:
- **40-60 hours/month** spent on manual reconciliation
- Limited payment options (mostly cash/cheque)
- Poor visibility into collections and outstanding dues
- Manual tracking of defaulters and reminders
- Compliance challenges (GST, audits)

### Target Users
1. **Finance Administrators** (10-15 per school) - Fee management, reconciliation
2. **Parents/Guardians** (500-5000 per school) - Online fee payment
3. **School Management** (Principal, Vice Principal) - Financial monitoring
4. **Accountants** (External) - Tally integration, GST compliance

---

## 📊 Current Status

### Completed
✅ **Documentation**
- Product Requirements Document (126 pages)
- Implementation Plan (80 pages)
- Project structure created
- Essential documentation files

### In Progress
🔄 **Phase 1: MVP Development (Weeks 1-4)**
- Week 1: Backend foundation & fee structure management
- Week 2: Invoice generation & delivery
- Week 3: Payment gateway integration (Razorpay)
- Week 4: Receipt generation & parent portal

### Next Up
📅 **Phase 2: Automation (Weeks 5-7)**
- Automated reconciliation
- Outstanding tracking & reminders
- Discounts and waivers

---

## 🏗 Technical Architecture

### Technology Stack

**Backend:**
- FastAPI 0.104+ (Python 3.11+)
- SQLAlchemy 2.0 (ORM)
- SQLite (dev) / PostgreSQL 15+ (prod)
- JWT authentication (python-jose + bcrypt)
- Razorpay SDK 1.4.1 (payment gateway)
- Celery + Redis (task queue)
- ReportLab (PDF generation)

**Frontend:**
- React 19 + TypeScript 5.9
- Vite 7.1.9 (build tool)
- Material-UI v7.3 (UI components)
- React Router 7.9 (routing)
- React Hook Form 7.64 (forms)
- Yup 1.7 (validation)
- Axios 1.12 (HTTP client)

**Same tech stack as admission-system for consistency**

### Database Schema (12 New Tables)

**Core Tables:**
1. `fee_types` - Fee categories (Tuition, Exam, Library, Sports, etc.)
2. `fee_structures` - Class-wise fee configuration
3. `student_fee_assignments` - Fees assigned to students
4. `invoices` - Fee invoices
5. `invoice_items` - Invoice line items
6. `payments` - Payment transactions
7. `payment_receipts` - Payment receipts
8. `student_fee_ledger` - Student-wise fee ledger (outstanding balance)
9. `payment_reminders` - Reminder history
10. `reconciliation_logs` - Reconciliation tracking
11. `discount_policies` - Discount rules
12. `waiver_requests` - Waiver approval workflow

### API Endpoints (67+ Total)

**Categories:**
- Fee Management (8 endpoints)
- Invoice Management (7 endpoints)
- Payment Processing (6 endpoints)
- Receipt Management (5 endpoints)
- Reconciliation (6 endpoints)
- Outstanding & Reminders (10 endpoints)
- Discounts & Waivers (9 endpoints)
- Reports & Dashboards (12 endpoints)
- Exports (4 endpoints)

---

## 🎭 User Journeys

### 1. Finance Admin - Fee Structure Setup
**Frequency**: Annual
**Duration**: 20-30 minutes for entire school

**Flow:**
1. Define fee types (Tuition, Exam, Library, Sports, Transport, etc.)
2. Configure class-wise fee structures (Pre-KG to Class 12)
3. Set up discount policies (sibling, early payment, merit)
4. Bulk assign fees to all enrolled students
5. Generate and send invoices to all parents

### 2. Parent - Online Payment (UPI)
**Frequency**: 3 times/year (per term)
**Duration**: 2-3 minutes

**Flow:**
1. Receive invoice via Email + SMS
2. Login to parent portal
3. View invoice details
4. Click "Pay Now"
5. Select payment method (UPI)
6. Scan QR code with Google Pay/PhonePe
7. Confirm payment
8. Receive instant receipt via SMS + Email

### 3. Finance Admin - Payment Reconciliation
**Frequency**: Daily
**Duration**: 5-10 minutes (automated)

**Flow:**
1. System auto-reconciles payments every 15 minutes
2. Admin reviews reconciliation dashboard
3. Identifies unmatched transactions (< 1%)
4. Manually matches edge cases if needed
5. Generates reconciliation report

### 4. Finance Admin - Outstanding Tracking
**Frequency**: Daily monitoring, Weekly follow-up
**Duration**: 15-20 minutes daily

**Flow:**
1. Monitor outstanding dashboard (aging analysis)
2. System sends automated reminders (pre-due, on-due, post-due)
3. Review defaulters (60+ days overdue)
4. Make manual follow-up calls
5. Offer installment plan if needed

### 5. Principal - Financial Monitoring
**Frequency**: Daily dashboard view, Weekly reports
**Duration**: 10-15 minutes daily

**Flow:**
1. Open dashboard on iPad
2. View collection summary (today, MTD, total)
3. Review outstanding overview (aging buckets)
4. Approve pending waiver requests
5. Review weekly collection report

---

## 🔑 Key Features

### 1. Fee Structure Management
- Create unlimited fee types
- Class-wise fee configuration
- Installment support (monthly, quarterly, annual)
- Late fee penalty rules (2% per month after grace period)
- Copy from previous year (with adjustments)

### 2. Invoice Generation
- Auto-generate invoices upon fee assignment
- Bulk generation (500 invoices in < 2 minutes)
- PDF with school branding, QR code for UPI
- GST calculation (18%)
- Pro-rated fees for mid-session admissions
- Multi-channel delivery (Email + SMS + App)

### 3. Payment Gateway Integration
- Razorpay (primary) + PayU (backup)
- Payment methods: UPI, Cards, Net Banking, Wallets
- Webhook verification (HMAC-SHA256)
- Instant receipt generation (< 30 seconds)
- Partial payment support
- Refund workflow

### 4. Automated Reconciliation
- Auto-reconcile every 15 minutes
- 99%+ automatic matching accuracy
- Bank statement upload and auto-matching
- Unmatched transaction identification
- Manual matching for edge cases
- Complete audit trail

### 5. Outstanding Tracking
- Real-time outstanding balance per student
- Aging analysis (0-15, 15-30, 30-60, 60+ days)
- Automated reminders (pre-due, on-due, post-due)
- Late fee auto-calculation and application
- Defaulter list with contact details

### 6. Discounts & Waivers
- Automatic discounts (sibling, early payment, merit)
- Waiver request workflow (Parent → Admin → Principal)
- Discount history tracking
- One-time and recurring discounts

### 7. Financial Dashboards
- Finance Admin: Collections, outstanding, reconciliation
- Principal: Executive summary, trends, approvals
- Parent: Fee overview, payment history
- Real-time data (< 1 minute lag)

### 8. Reports & Analytics
- Daily collection report
- Outstanding report
- Defaulter report
- Class-wise report
- Payment method breakdown
- Reconciliation report
- GST report (GSTR-1, GSTR-3B)
- Audit trail report
- Export to Excel/PDF/CSV

### 9. Tally Integration
- Export to Tally XML format
- Voucher entries for all payments
- Ledger balances
- One-click import into Tally Prime

### 10. GST Compliance
- 18% GST on all fee transactions
- GST invoice generation
- GSTR-1 report (JSON format)
- GSTR-3B summary
- GSTIN validation

---

## 🔐 Security & Compliance

### Security
- **PCI DSS Compliant**: No card data stored (via payment gateway)
- **JWT Authentication**: Token-based auth with refresh tokens
- **Password Hashing**: bcrypt with salt
- **Webhook Verification**: HMAC-SHA256 signature validation
- **Data Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Role-based Access Control**: Admin, Finance, Principal, Parent roles
- **Audit Trail**: All financial transactions logged (7 years retention)

### Compliance
- **GST Compliance**: 18% GST, invoice generation, GSTR reports
- **Data Privacy**: DPDP Act 2023 (parent consent, right to access/delete)
- **Financial Regulations**: India Companies Act (audit trail, 7 years retention)
- **Education Board**: Fee structure disclosure (RTE Act)

---

## 📈 Success Metrics

### Operational
- 95%+ fee collection within due dates
- 90% reduction in reconciliation effort (< 30 min/week)
- 99%+ payment success rate
- 100% daily reconciliation within 24 hours

### User Experience
- < 3 minutes average payment time
- 90%+ parent satisfaction score
- 80% reduction in admin time (< 4 hours/week)
- < 30 seconds receipt delivery time

### Financial
- 30% reduction in collection cycle time
- 50% increase in late fee recovery
- 50% reduction in bad debts
- < 1.5% payment gateway costs

### Technical
- 99.5% system uptime
- < 500ms API response time (95th percentile)
- < 10 seconds payment processing time
- 1000+ concurrent payments supported

---

## 🚧 Development Guidelines

### Code Structure
- Follow admission-system structure (consistency)
- Services layer for business logic (not in API routes)
- Pydantic schemas for validation
- SQLAlchemy models for database
- Unit tests for all services (>90% coverage)

### API Design
- RESTful endpoints (`/api/v1/...`)
- Consistent naming (kebab-case for routes, snake_case for JSON)
- Pagination for list endpoints (limit, offset)
- Filtering via query params
- Proper HTTP status codes (200, 201, 400, 404, 500)
- Swagger/OpenAPI auto-documentation

### Frontend Design
- Material-UI v7 components (consistency with admission-system)
- Responsive design (desktop + mobile)
- Desktop-first for admin (wider containers: `maxWidth="xl"`)
- Mobile-first for parents
- React Hook Form for forms
- Yup for validation
- Axios for API calls (centralized service layer)

### Database
- SQLAlchemy models with proper relationships
- Alembic migrations (never alter tables directly)
- Indexes on foreign keys and frequently queried fields
- Avoid N+1 queries (use `joinedload`, `selectinload`)
- Transactions for financial operations (ACID compliance)

### Testing
- Unit tests (pytest for backend, Jest for frontend)
- Integration tests (end-to-end user flows)
- Load tests (1000+ concurrent payments)
- Security tests (SQL injection, XSS, CSRF)
- UAT with real users (finance admin, parents)

---

## 🔄 Integration Points

### 1. Admission System (Journey 1)
**Trigger**: Student enrollment confirmed

**Flow:**
1. Admission system calls fee system API (or shared database)
2. Fee system retrieves fee structure for student's class
3. Fees auto-assigned to student
4. Admission fee invoice generated
5. Invoice sent to parent (Email + SMS)

**Data Shared:**
- Student ID, name, class, section
- Parent name, email, phone
- Enrollment date

### 2. Payment Gateway (Razorpay)
**Endpoints:**
- Create order: `POST /v1/orders`
- Verify payment: `POST /v1/payments/{id}/capture`
- Fetch settlement: `GET /v1/settlements`
- Process refund: `POST /v1/payments/{id}/refund`

**Webhook:**
- URL: `https://fees.schoolname.com/api/v1/payments/webhook`
- Signature verification: HMAC-SHA256
- Events: `payment.captured`, `payment.failed`, `refund.processed`

### 3. SMS Gateway (MSG91)
**Endpoints:**
- Send SMS: `POST /api/v5/flow/`
- Check delivery: `GET /api/v5/report/`

**DLT Compliance:**
- Templates registered with DLT
- Template IDs in `.env`

### 4. Email Service (SendGrid)
**Endpoints:**
- Send email: `POST /v3/mail/send`

**Templates:**
- Invoice notification
- Payment success
- Payment reminder
- Receipt delivery

---

## 🐛 Common Issues & Solutions

### Issue: Payment webhook not received
**Cause**: Localhost not accessible to Razorpay
**Solution**: Use ngrok to expose localhost
```bash
ngrok http 8000
# Update webhook URL in Razorpay dashboard to ngrok URL
```

### Issue: Database migration failed
**Cause**: Conflicting migrations or manual table changes
**Solution**:
```bash
# Check current revision
alembic current

# Rollback to previous revision
alembic downgrade -1

# Re-run migration
alembic upgrade head
```

### Issue: Celery tasks not running
**Cause**: Redis not running or wrong connection string
**Solution**:
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Check Celery connection in .env
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Issue: Invoice PDF not generating
**Cause**: Missing fonts or ReportLab not installed
**Solution**:
```bash
pip install reportlab Pillow
# Or use WeasyPrint (alternative)
pip install weasyprint
```

### Issue: Frontend not connecting to backend
**Cause**: CORS not configured or wrong API URL
**Solution**:
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📚 Learning Resources

### FastAPI
- Official Docs: https://fastapi.tiangolo.com/
- Tutorial: https://fastapi.tiangolo.com/tutorial/

### SQLAlchemy 2.0
- Official Docs: https://docs.sqlalchemy.org/en/20/
- ORM Quickstart: https://docs.sqlalchemy.org/en/20/orm/quickstart.html

### React + TypeScript
- React Docs: https://react.dev/
- TypeScript Handbook: https://www.typescriptlang.org/docs/

### Material-UI v7
- Official Docs: https://mui.com/material-ui/
- Components: https://mui.com/material-ui/all-components/

### Razorpay Integration
- Docs: https://razorpay.com/docs/
- Payment Gateway: https://razorpay.com/docs/payments/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/

### Celery
- Official Docs: https://docs.celeryq.dev/en/stable/
- Getting Started: https://docs.celeryq.dev/en/stable/getting-started/

---

## 🎯 Next Steps

### Immediate (This Week)
1. Set up backend project structure
2. Create database models (fee_types, fee_structures)
3. Implement API endpoints for fee management
4. Create admin UI for fee types and structures
5. Test fee structure setup flow

### Short Term (Next 2 Weeks)
1. Invoice generation and PDF creation
2. Email and SMS notification setup
3. Razorpay payment gateway integration
4. Parent portal for fee payment
5. Receipt generation

### Medium Term (Weeks 5-7)
1. Automated reconciliation
2. Outstanding tracking and reminders
3. Discount and waiver workflows
4. Financial dashboards

### Long Term (Weeks 8-10)
1. Advanced reports and analytics
2. Tally integration
3. GST compliance reports
4. Load testing and security testing
5. Production deployment

---

## 📞 Support & Communication

### Development Team
- **Backend Lead**: Python/FastAPI specialist
- **Frontend Lead**: React/TypeScript specialist
- **Full-stack Dev**: Integration and bug fixes
- **QA Engineer**: Testing and quality assurance
- **Product Manager**: Requirements and coordination

### Communication Channels
- **Daily Standup**: 10:00 AM (15 minutes)
- **Weekly Sprint Review**: Friday 4:00 PM
- **Weekly Retrospective**: Friday 5:00 PM
- **Slack**: #fee-management-dev
- **GitHub**: Issues and pull requests

### Documentation Updates
- Update CLAUDE.md when architecture changes
- Update README.md when features are added
- Update API.md when endpoints change
- Update USER_GUIDE.md when UI changes

---

## 🙌 Related Documentation

### Internal
- [README.md](README.md) - Project overview and quick start
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [docs/API.md](docs/API.md) - API documentation
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - Database schema
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) - User manual

### External (Project Root)
- [Journey 2 PRD](../docs/product/journey-2-fee-collection-prd.md) - Product requirements (126 pages)
- [Journey 2 Implementation Plan](../docs/development/journeys/journey-2-implementation-plan.md) - Development plan (80 pages)
- [Journey 1 (Admission System)](../admission-system/) - Integration reference

---

**Last Updated**: October 13, 2025
**Current Sprint**: Week 1 - Backend Foundation & Fee Structure Management
**Next Milestone**: Invoice Generation (Week 2)

*Keep this document updated as the project evolves!*
