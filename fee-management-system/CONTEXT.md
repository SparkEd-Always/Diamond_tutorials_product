# Development Context
## Fee Management System - Resume Development Quickly

**Last Updated**: October 13, 2025
**Purpose**: Quick context loading for resuming development after a break

---

## 🎯 What is This Project?

**Fee Management System** - A comprehensive digital platform for Indian schools to manage fee collection, payment processing, and reconciliation.

### Key Goal
Replace manual fee management (40-60 hours/month reconciliation) with **90% automated system** (< 30 min/week).

---

## 📍 Current Status (As of October 13, 2025)

### ✅ What's Done
1. **Project Structure**: 37 files created (backend + frontend + docs)
2. **Backend Skeleton**: FastAPI app with database, auth, config ready
3. **Frontend Skeleton**: React 19 + TypeScript + Material-UI v7 ready
4. **Documentation**: 206 pages (PRD + Implementation Plan + Setup guides)
5. **Configuration**: All .env templates, requirements.txt, package.json ready

### 🔄 What's In Progress
- Nothing currently (ready to start Phase 1, Week 1)

### ⏳ What's Next
**Phase 1, Week 1: Backend Foundation & Fee Structure Management**
- Create fee models (FeeType, FeeStructure, StudentFeeAssignment)
- Create fee API endpoints (8 endpoints)
- Create admin UI for fee management
- Test with dummy data

---

## 🗂 Project Structure Quick Reference

```
fee-management-system/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py        ✅ Entry point
│   │   ├── core/          ✅ Config, database, security
│   │   ├── models/        📁 Database models (TODO)
│   │   ├── schemas/       📁 Pydantic schemas (TODO)
│   │   ├── api/v1/        📁 API endpoints (TODO)
│   │   ├── services/      📁 Business logic (TODO)
│   │   ├── utils/         📁 PDF, SMS, Email (TODO)
│   │   └── tasks/         📁 Celery tasks (TODO)
│   ├── requirements.txt   ✅ Dependencies
│   └── .env.example       ✅ Config template
│
├── frontend/web-app/      # React frontend
│   ├── src/
│   │   ├── App.tsx        ✅ Main app
│   │   ├── components/    📁 React components (TODO)
│   │   ├── pages/         📁 Page components (TODO)
│   │   └── services/      📁 API services (TODO)
│   ├── package.json       ✅ Dependencies
│   └── .env.example       ✅ Config template
│
├── docs/                  ✅ Documentation
├── README.md              ✅ Project overview
├── CLAUDE.md              ✅ AI context
├── QUICKSTART.md          ✅ Setup guide
└── TODO.md                ✅ Development checklist
```

---

## 🚀 Quick Start (Resume Development)

### 1. Start Backend (2 minutes)
```bash
cd d:\Projects\sparked\fee-management-system\backend
venv\Scripts\activate
python -m app.main
```
✅ Backend: http://localhost:8000
✅ API Docs: http://localhost:8000/docs

### 2. Start Frontend (2 minutes)
```bash
cd d:\Projects\sparked\fee-management-system\frontend\web-app
npm run dev
```
✅ Frontend: http://localhost:5173

---

## 💡 Key Concepts

### User Roles
- **Parent**: Pay fees, view invoices, download receipts
- **Finance Admin**: Manage fees, reconcile payments, track outstanding
- **Principal**: Monitor collections, approve waivers
- **Accountant**: Export to Tally, GST reports

### Fee Lifecycle
```
Fee Structure Setup → Fee Assignment → Invoice Generation →
Payment Processing → Receipt Generation → Reconciliation
```

### Payment Flow
```
Parent clicks "Pay Now" →
Razorpay modal opens →
Parent completes payment →
Razorpay webhook →
System verifies →
Invoice marked PAID →
Receipt generated →
Email + SMS sent
```

### Core Features (Phase 1)
1. **Fee Structure Management**: Define fee types, class-wise amounts
2. **Invoice Generation**: Auto-generate invoices with PDF
3. **Payment Gateway**: Razorpay integration (UPI, Cards, Net Banking)
4. **Receipt Generation**: Auto-generate digital receipts
5. **Parent Portal**: View fees, pay online, download receipts

---

## 🛠 Technology Stack

### Backend
- **FastAPI 0.104+** - Modern Python web framework
- **SQLAlchemy 2.0** - ORM for database
- **SQLite** (dev) / **PostgreSQL** (prod)
- **JWT** - Authentication (python-jose + bcrypt)
- **Razorpay SDK 1.4.1** - Payment gateway
- **Celery + Redis** - Background tasks
- **ReportLab** - PDF generation

### Frontend
- **React 19** - UI library
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7.1.9** - Build tool
- **Material-UI v7.3** - UI components
- **React Hook Form 7.64** - Form handling
- **Yup 1.7** - Validation
- **Axios 1.12** - HTTP client

---

## 📚 Essential Files to Know

### Backend Files
- `backend/app/main.py` - FastAPI entry point
- `backend/app/core/config.py` - Settings from .env
- `backend/app/core/database.py` - SQLAlchemy setup
- `backend/app/core/security.py` - JWT auth
- `backend/.env` - Environment variables (create from .env.example)

### Frontend Files
- `frontend/web-app/src/App.tsx` - Main React component
- `frontend/web-app/src/main.tsx` - Entry point
- `frontend/web-app/vite.config.ts` - Build config
- `frontend/web-app/.env` - Environment variables (create from .env.example)

### Documentation Files
- `README.md` - Project overview, features, setup
- `CLAUDE.md` - Architecture, user journeys, troubleshooting
- `QUICKSTART.md` - 10-minute setup guide
- `TODO.md` - Development checklist (this is your roadmap!)
- `docs/API.md` - API endpoints reference
- `docs/DATABASE_SCHEMA.md` - Database tables overview

---

## 🎯 Next Immediate Steps

### Step 1: Create Fee Models (30 minutes)
File: `backend/app/models/fee.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, Numeric, Date
from app.core.database import Base

class FeeType(Base):
    __tablename__ = "fee_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String)
    is_mandatory = Column(Boolean, default=True)
    # ... (see DATABASE_SCHEMA.md for full schema)

class FeeStructure(Base):
    __tablename__ = "fee_structures"
    # ... (see DATABASE_SCHEMA.md)

class StudentFeeAssignment(Base):
    __tablename__ = "student_fee_assignments"
    # ... (see DATABASE_SCHEMA.md)
```

### Step 2: Create Pydantic Schemas (20 minutes)
File: `backend/app/schemas/fee.py`

```python
from pydantic import BaseModel
from typing import Optional

class FeeTypeCreate(BaseModel):
    name: str
    description: Optional[str]
    is_mandatory: bool = True
    # ...

class FeeTypeResponse(BaseModel):
    id: int
    name: str
    status: str
    # ...

    class Config:
        from_attributes = True
```

### Step 3: Initialize Alembic (10 minutes)
```bash
cd backend
alembic init migrations
# Edit alembic.ini and set sqlalchemy.url
alembic revision --autogenerate -m "Add fee tables"
alembic upgrade head
```

### Step 4: Create API Endpoints (45 minutes)
File: `backend/app/api/v1/fees.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.fee import FeeType
from app.schemas.fee import FeeTypeCreate, FeeTypeResponse

router = APIRouter()

@router.post("/fees/types", response_model=FeeTypeResponse)
def create_fee_type(fee: FeeTypeCreate, db: Session = Depends(get_db)):
    # Implementation
    pass

@router.get("/fees/types", response_model=list[FeeTypeResponse])
def list_fee_types(db: Session = Depends(get_db)):
    # Implementation
    pass
```

### Step 5: Create Admin UI (1 hour)
File: `frontend/web-app/src/pages/admin/FeeTypes.tsx`

```tsx
import { useState, useEffect } from 'react';
import { Container, Typography, Button } from '@mui/material';
// ... Material-UI imports

export default function FeeTypes() {
  const [feeTypes, setFeeTypes] = useState([]);

  // Fetch fee types from API
  // Display in table
  // Add/Edit/Delete functionality

  return (
    <Container maxWidth="xl">
      <Typography variant="h4">Fee Types Management</Typography>
      {/* Table, forms, etc. */}
    </Container>
  );
}
```

---

## 🔍 Important Configuration

### Razorpay Test Keys (Required for Payment)
Get from: https://dashboard.razorpay.com/app/website-app-settings/api-keys

Add to `backend/.env`:
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Add to `frontend/web-app/.env`:
```bash
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

### SMS/Email Configuration (Optional for testing)
For production, configure:
- **MSG91** (SMS): Get auth key from https://msg91.com/
- **SendGrid** (Email): Get API key from https://sendgrid.com/

---

## 🐛 Common Issues & Solutions

### Backend won't start?
```bash
# Check virtual environment is activated
cd backend
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt

# Check .env file exists
cat .env
```

### Frontend won't build?
```bash
# Clear cache and reinstall
cd frontend/web-app
rm -rf node_modules package-lock.json
npm install

# Check .env file exists
cat .env
```

### Database migration failed?
```bash
cd backend
# Delete database and recreate
rm fee_management.db
alembic upgrade head
```

### Payment not working?
- Verify Razorpay test keys are correct
- Use ngrok for webhook testing: `ngrok http 8000`
- Update webhook URL in Razorpay dashboard

---

## 📊 Phase 1 Success Criteria

### Week 1 (Fee Management)
- [ ] Fee types created (5+ types)
- [ ] Fee structures configured (3+ classes)
- [ ] Fees assigned to students (bulk operation)

### Week 2 (Invoices)
- [ ] Invoices generated (100+ invoices)
- [ ] PDF downloadable with branding
- [ ] Email + SMS delivery working

### Week 3 (Payments)
- [ ] Online payment working (UPI, Cards)
- [ ] Payment webhook verified
- [ ] Invoice status updated

### Week 4 (Receipts)
- [ ] Receipts auto-generated
- [ ] Parent portal shows fees
- [ ] Payment history accessible

---

## 🎓 Learning Resources

### Quick References
- **FastAPI Docs**: https://fastapi.tiangolo.com/tutorial/
- **SQLAlchemy 2.0**: https://docs.sqlalchemy.org/en/20/orm/quickstart.html
- **React 19**: https://react.dev/learn
- **Material-UI**: https://mui.com/material-ui/getting-started/
- **Razorpay**: https://razorpay.com/docs/payments/

### Project Documentation
- **Journey 2 PRD**: `../docs/product/journey-2-fee-collection-prd.md` (126 pages)
- **Implementation Plan**: `../docs/development/journeys/journey-2-implementation-plan.md` (80 pages)
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
- **API Reference**: `docs/API.md`

---

## 💬 Development Workflow

### Daily Workflow
1. **Pull latest code**: `git pull origin main`
2. **Start servers**: Backend + Frontend
3. **Check TODO.md**: Pick next task
4. **Code**: Implement feature
5. **Test**: Manual + Unit tests
6. **Commit**: `git commit -m "feat: add fee types management"`
7. **Push**: `git push origin feature/fee-types`
8. **Update TODO.md**: Mark task as done

### Git Commit Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `style:` - Formatting

---

## 🎯 Focus Areas

### Week 1 Focus: Database + API
- **Backend heavy**: Models, schemas, endpoints
- **Frontend basic**: Simple UI to test backend
- **Goal**: CRUD operations working for fees

### Week 2 Focus: Invoice Generation
- **Backend**: Invoice logic, PDF generation, notifications
- **Frontend**: Invoice viewing, filtering
- **Goal**: 100+ invoices generated and viewable

### Week 3 Focus: Payment Integration
- **Backend**: Razorpay integration, webhook handling
- **Frontend**: Payment flow, Razorpay modal
- **Goal**: 10+ successful test payments

### Week 4 Focus: Parent Portal
- **Backend**: Receipt generation, dashboard APIs
- **Frontend**: Parent pages, responsive design
- **Goal**: Complete parent journey working

---

## 🚨 Critical Reminders

### Security
- [ ] Never commit .env files (in .gitignore)
- [ ] Always verify webhook signatures (payment security)
- [ ] Use HTTPS in production (SSL certificate)
- [ ] Hash passwords with bcrypt (never plain text)

### Performance
- [ ] Add database indexes (student_id, invoice_number, etc.)
- [ ] Paginate list endpoints (default 20 items)
- [ ] Optimize queries (avoid N+1 queries)
- [ ] Cache dashboard data (Redis)

### Testing
- [ ] Write unit tests for all services
- [ ] Test edge cases (partial payments, failures, etc.)
- [ ] Load test before production (1000+ concurrent users)
- [ ] Test on mobile devices (responsive design)

---

## 📝 Quick Notes

### Database Tables (12 tables)
1. fee_types
2. fee_structures
3. student_fee_assignments
4. invoices
5. invoice_items
6. payments
7. payment_receipts
8. student_fee_ledger
9. payment_reminders
10. reconciliation_logs
11. discount_policies
12. waiver_requests

### API Endpoints (67+ total)
- Fee Management: 8 endpoints
- Invoice Management: 7 endpoints
- Payment Processing: 6 endpoints
- Receipt Management: 5 endpoints
- Reconciliation: 6 endpoints
- Outstanding & Reminders: 10 endpoints
- Discounts & Waivers: 9 endpoints
- Reports & Dashboards: 12 endpoints
- Exports: 4 endpoints

---

## ✅ Before You Start Coding

- [ ] Read this CONTEXT.md file
- [ ] Read TODO.md (Week 1 section)
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Database accessible (SQLite or PostgreSQL)
- [ ] .env files configured
- [ ] IDE ready (VS Code recommended)
- [ ] Git repository initialized

---

## 🎊 You're Ready!

Everything you need to resume development is in this file.

**Start with**: TODO.md → Phase 1 → Week 1 → Backend Tasks

**Need help?** Check:
1. CLAUDE.md (detailed architecture)
2. QUICKSTART.md (troubleshooting)
3. Journey 2 PRD (business requirements)

**Good luck! 🚀**

---

**Last Updated**: October 13, 2025
**Next Review**: After Week 1 completion
**Maintained By**: Development Team
