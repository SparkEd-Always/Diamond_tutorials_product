# Module Development Guide
## Sparked EdTech ERP + SIS + LMS - Systematic Module Development Process

**Created**: October 13, 2025
**Last Updated**: October 13, 2025
**Purpose**: Step-by-step guide for developing new modules following the same process

---

## 🎯 Overview

This guide provides a systematic approach to developing new modules for the Sparked EdTech platform, following the proven process used for:
- ✅ **Journey 1**: Admission System (COMPLETED - Production Ready)
- ✅ **Journey 2**: Fee Collection & Reconciliation (SETUP COMPLETE - Ready for Development)

---

## 📋 Module Development Checklist

Use this checklist for each new module:

- [ ] **Step 1**: Identify module from business requirements
- [ ] **Step 2**: Research module requirements (admin_tasks.docx + web research)
- [ ] **Step 3**: Generate comprehensive PRD (Product Requirements Document)
- [ ] **Step 4**: Create implementation plan (10-week timeline)
- [ ] **Step 5**: Create project structure (similar to admission-system)
- [ ] **Step 6**: Create essential documentation files
- [ ] **Step 7**: Set up backend skeleton (FastAPI)
- [ ] **Step 8**: Set up frontend skeleton (React 19 + TypeScript + Material-UI v7)
- [ ] **Step 9**: Begin Phase 1 development
- [ ] **Step 10**: Test, iterate, and launch

---

## 📁 Available Modules (From admin_tasks.docx)

### 1. Financials ✅
- [x] **Fee Collection & Reconciliation** - Journey 2 (SETUP COMPLETE)
- [ ] **Payroll & Staff Salaries** - Journey 3 (TODO)
- [ ] **Vendor Payments** - Journey 4 (TODO)
- [ ] **Budgeting & Financial Planning** - Journey 5 (TODO)
- [ ] **Audits & Compliance** - Journey 6 (TODO)
- [ ] **Fundraising, Donations & Endowments** - Journey 7 (TODO)

### 2. Academics (Student Lifecycle) ✅
- [x] **Admissions & Enrollment** - Journey 1 (COMPLETED)
- [ ] **Student Records Management** - Journey 8 (TODO)
- [ ] **Timetable & Scheduling** - Journey 9 (TODO)
- [ ] **Exam & Assessment Management** - Journey 10 (TODO)
- [ ] **Report Card Generation** - Journey 11 (TODO)
- [ ] **Parent-Teacher Communication** - Journey 12 (TODO)

### 3. Operations (School Infrastructure & Logistics)
- [ ] **Transport & Route Management** - Journey 13 (TODO)
- [ ] **Hostel, Canteen, Library Management** - Journey 14 (TODO)
- [ ] **Classroom & Lab Scheduling** - Journey 15 (TODO)
- [ ] **Facility Maintenance** - Journey 16 (TODO)
- [ ] **Safety, Health & Security** - Journey 17 (TODO)

### 4. Human Resources (Staff & Teacher Management)
- [ ] **Recruitment & Onboarding** - Journey 18 (TODO)
- [ ] **Leave Management** - Journey 19 (TODO)
- [ ] **Payroll Integration** - Journey 20 (TODO)
- [ ] **Professional Development** - Journey 21 (TODO)
- [ ] **Teacher Appraisal & Performance** - Journey 22 (TODO)

### 5. Communication & Community Engagement
- [ ] **Notices & Announcements** - Journey 23 (TODO)
- [ ] **Parent Communication** - Journey 24 (TODO)
- [ ] **Alumni Engagement** - Journey 25 (TODO)
- [ ] **Community Outreach & CSR** - Journey 26 (TODO)
- [ ] **Emergency Communication** - Journey 27 (TODO)

### 6. Compliance & Governance
- [ ] **Education Board Compliance** - Journey 28 (TODO)
- [ ] **Government Reporting** - Journey 29 (TODO)
- [ ] **Policy Enforcement** - Journey 30 (TODO)
- [ ] **Accreditation & Quality Audits** - Journey 31 (TODO)

### 7. Technology & Data Management
- [ ] **ERP/SIS/LMS Administration** - Journey 32 (TODO)
- [ ] **Data Security & Privacy** - Journey 33 (TODO)
- [ ] **Vendor Management** - Journey 34 (TODO)
- [ ] **Analytics Dashboards** - Journey 35 (TODO)

### 8. Event Management
- [ ] **Event Planning** - Journey 36 (TODO)
- [ ] **Comprehensive Event Management** - Journey 37 (TODO)

---

## 🚀 Standard Development Process

### **Phase 0: Research & Planning (1-2 days)**

#### Step 1: Identify Module
- Review `study/admin_tasks.docx` for module details
- Check existing documentation in `docs/requirements/modules/`
- Understand user needs and pain points

#### Step 2: Research Requirements
Commands:
```
1. Read admin_tasks.docx section for the module
2. Check docs/requirements/modules/[module-name].md
3. Perform web research on best practices
4. Understand Indian context (if applicable)
```

#### Step 3: Generate PRD
Create comprehensive Product Requirements Document including:
- Executive Summary
- Product Vision & Goals
- User Personas & Actors (detailed profiles)
- Detailed User Journeys (step-by-step flows)
- Features & Requirements (functional + non-functional)
- Technical Architecture
- Success Metrics
- Risk Assessment
- Release Plan
- Appendices (glossary, templates, FAQs)

**Target**: 100-150 pages of detailed documentation

#### Step 4: Create Implementation Plan
Create detailed development roadmap including:
- Executive Summary
- Project Setup
- Phase-wise Development Plan (10 weeks)
  - Phase 1: MVP (Weeks 1-4)
  - Phase 2: Automation (Weeks 5-7)
  - Phase 3: Advanced Features (Weeks 8-9)
  - Phase 4: Testing & Launch (Week 10)
- Team Structure & Responsibilities
- Technology Stack & Tools
- Database Design
- API Development Plan
- Frontend Development Plan
- Integration Plan
- Testing Strategy
- Deployment Plan
- Risk Management
- Success Criteria & Go-Live Checklist

**Target**: 70-90 pages of implementation details

---

### **Phase 1: Project Setup (2-3 hours)**

#### Step 5: Create Project Structure
```bash
mkdir [module-name]-system
cd [module-name]-system

# Backend structure
mkdir -p backend/app/{core,models,schemas,api/v1,services,utils,tasks,tests,scripts}
mkdir -p backend/migrations/versions

# Frontend structure
mkdir -p frontend/web-app/src/{components,pages,services,contexts,hooks,utils}

# Documentation
mkdir -p docs
mkdir -p docker
```

#### Step 6: Create Essential Documentation
Files to create:
1. **README.md** - Project overview, features, quick start (~15 pages)
2. **CLAUDE.md** - AI context, architecture, user journeys (~25 pages)
3. **QUICKSTART.md** - 10-minute setup guide (~12 pages)
4. **TODO.md** - Development roadmap (~35 pages)
5. **CONTEXT.md** - Resume development context (~20 pages)
6. **PROJECT_STRUCTURE.md** - File tree (~8 pages)
7. **SETUP_SUCCESS.md** - Setup confirmation (~10 pages)
8. **FINAL_SUMMARY.md** - Creation summary (~15 pages)
9. **INDEX.md** - Documentation index (~10 pages)
10. **docs/API.md** - API reference
11. **docs/DATABASE_SCHEMA.md** - Database schema

#### Step 7: Set Up Backend Skeleton
Create files:
- `backend/requirements.txt` - Python dependencies
- `backend/.env.example` - Environment variables template
- `backend/.gitignore` - Git ignore rules
- `backend/app/main.py` - FastAPI entry point
- `backend/app/__init__.py`
- `backend/app/core/__init__.py`
- `backend/app/core/config.py` - Settings from .env
- `backend/app/core/database.py` - SQLAlchemy setup
- `backend/app/core/security.py` - JWT authentication
- All `__init__.py` files for proper package structure

#### Step 8: Set Up Frontend Skeleton
Create files:
- `frontend/web-app/package.json` - Node dependencies
- `frontend/web-app/.env.example` - Frontend config
- `frontend/web-app/.gitignore`
- `frontend/web-app/tsconfig.json` - TypeScript config
- `frontend/web-app/vite.config.ts` - Vite build config
- `frontend/web-app/index.html`
- `frontend/web-app/src/main.tsx`
- `frontend/web-app/src/App.tsx`
- `frontend/web-app/src/index.css`

---

### **Phase 2: Development (10 weeks)**

Follow the detailed implementation plan created in Step 4.

**Week 1-4**: MVP (Core features)
**Week 5-7**: Automation (Background tasks, integrations)
**Week 8-9**: Advanced Features (Dashboards, reports)
**Week 10**: Testing & Launch

---

## 📝 Template Request Format

When ready to develop a new module, use this format:

```
Hi Claude,

I want to develop the next module for the Sparked EdTech platform.

Module: [MODULE NAME]
Category: [Financials/Academics/Operations/HR/Communication/Compliance/Technology/Events]

Please follow the MODULE_DEVELOPMENT_GUIDE.md process:

1. Check study/admin_tasks.docx for module overview
2. Check docs/requirements/modules/[module-folder]/[module-name].md for existing requirements
3. Perform research on [MODULE NAME] best practices
4. Generate comprehensive PRD (100-150 pages) with detailed user journeys
5. Create implementation plan (70-90 pages) with 10-week timeline
6. Create project structure similar to admission-system
7. Create all essential documentation files (README, CLAUDE, QUICKSTART, TODO, CONTEXT, etc.)
8. Set up backend skeleton (FastAPI + SQLAlchemy)
9. Set up frontend skeleton (React 19 + TypeScript + Material-UI v7)

Technologies to use (same as admission-system and fee-management-system):
- Backend: FastAPI 0.104+ | Python 3.11+ | SQLAlchemy 2.0 | PostgreSQL 15+ | JWT
- Frontend: React 19 | TypeScript 5.9 | Vite 7.1.9 | Material-UI v7.3 | Axios 1.12

Please take all permissions needed to read files, write files, run commands, etc.

Let's build a production-ready system!
```

---

## 🎯 Example: Next Module Development

### Example Request for "Parent-Teacher Communication" Module

```
Hi Claude,

I want to develop the next module for the Sparked EdTech platform.

Module: Parent-Teacher Communication
Category: Communication & Community Engagement

Please follow the MODULE_DEVELOPMENT_GUIDE.md process:

1. Check study/admin_tasks.docx section on "Parent-Teacher Communication"
2. Check docs/requirements/modules/academics/parent-teacher-communication.md
3. Perform research on parent-teacher communication platforms, best practices for Indian schools
4. Generate comprehensive PRD (100-150 pages) with detailed user journeys for:
   - Teachers (creating updates, scheduling meetings)
   - Parents (viewing updates, booking appointments)
   - Admins (monitoring communication, resolving issues)
5. Create implementation plan (70-90 pages) with:
   - Phase 1: Messaging system (Weeks 1-4)
   - Phase 2: Meeting scheduling (Weeks 5-7)
   - Phase 3: Analytics & reports (Weeks 8-9)
   - Phase 4: Testing & launch (Week 10)
6. Create project structure: parent-teacher-communication-system/
7. Create all essential documentation files (9 files)
8. Set up backend skeleton (FastAPI + real-time messaging)
9. Set up frontend skeleton (React 19 + Material-UI v7 + real-time updates)

Technologies to use:
- Backend: FastAPI 0.104+ | Python 3.11+ | SQLAlchemy 2.0 | PostgreSQL 15+ | WebSockets (for real-time)
- Frontend: React 19 | TypeScript 5.9 | Vite 7.1.9 | Material-UI v7.3 | Socket.io-client

Additional features to consider:
- Real-time messaging (WebSockets)
- Push notifications (mobile + web)
- Meeting scheduling with calendar integration
- Student progress reports sharing
- Multi-language support (English + Hindi)
- Offline mode support

Please take all permissions needed to read, write, run commands.

Let's build this module following the proven process from Journey 1 & 2!
```

---

## 📊 Module Complexity Estimates

| Module | Complexity | Duration | Pages (PRD) | Pages (Plan) |
|--------|------------|----------|-------------|--------------|
| Fee Collection | High | 10 weeks | 126 | 80 |
| Admissions | High | 10 weeks | ~120 | ~75 |
| Parent Communication | Medium | 8 weeks | ~100 | ~60 |
| Leave Management | Low | 6 weeks | ~80 | ~50 |
| Notices & Announcements | Low | 4 weeks | ~60 | ~40 |
| Transport Management | High | 12 weeks | ~140 | ~90 |
| Exam Management | Very High | 14 weeks | ~160 | ~100 |

---

## 🛠 Technology Stack (Standard for All Modules)

### Backend (Consistent)
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Database**: SQLite (dev) / PostgreSQL 15+ (prod)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic 1.12+
- **Authentication**: JWT (python-jose + bcrypt)
- **Task Queue**: Celery + Redis (when needed)
- **PDF Generation**: ReportLab (when needed)
- **Email**: aiosmtplib / SendGrid
- **SMS**: MSG91 / Twilio (India)

### Frontend (Consistent)
- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7.1.9
- **UI Library**: Material-UI v7.3
- **State Management**: React Context API / Redux Toolkit
- **Form Handling**: React Hook Form 7.64
- **Validation**: Yup 1.7
- **HTTP Client**: Axios 1.12
- **Routing**: React Router 7.9
- **Date Handling**: Day.js 1.11
- **Charts**: Chart.js / Recharts

### Additional (Module-specific)
- **Real-time**: Socket.io / WebSockets (communication modules)
- **File Upload**: Multer / react-dropzone (document modules)
- **Calendar**: FullCalendar (scheduling modules)
- **Maps**: Google Maps API (transport modules)
- **Payments**: Razorpay (financial modules)

---

## 📂 Standard Project Structure

```
[module-name]-system/
├── README.md
├── CLAUDE.md
├── QUICKSTART.md
├── TODO.md
├── CONTEXT.md
├── PROJECT_STRUCTURE.md
├── SETUP_SUCCESS.md
├── FINAL_SUMMARY.md
├── INDEX.md
├── .gitignore
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── api/v1/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── tasks/
│   │   └── tests/
│   ├── migrations/
│   ├── scripts/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/web-app/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── docs/
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
└── docker/
    ├── docker-compose.yml
    ├── Dockerfile.backend
    └── Dockerfile.frontend
```

---

## ✅ Quality Gates

### Gate 1: Requirements Complete (Day 3)
- [ ] PRD generated (100-150 pages)
- [ ] Implementation plan created (70-90 pages)
- [ ] User journeys documented
- [ ] Database schema designed
- [ ] API endpoints listed

### Gate 2: Project Setup Complete (Day 5)
- [ ] Project structure created
- [ ] Documentation files created (9 files)
- [ ] Backend skeleton set up
- [ ] Frontend skeleton set up
- [ ] Both servers can start successfully

### Gate 3: Week 1 Complete
- [ ] Database models created
- [ ] API endpoints implemented
- [ ] Basic UI created
- [ ] CRUD operations working
- [ ] Unit tests written

### Gate 4: Phase 1 Complete (Week 4)
- [ ] All MVP features working
- [ ] User testing completed
- [ ] Bugs fixed (P0, P1)
- [ ] Documentation updated
- [ ] Ready for Phase 2

### Gate 5: Production Ready (Week 10)
- [ ] All features complete
- [ ] Load testing passed
- [ ] Security testing passed
- [ ] User acceptance testing passed
- [ ] Production deployment successful

---

## 📈 Success Metrics (Track for Each Module)

### Development Metrics
- [ ] On-time delivery (10 weeks)
- [ ] Code coverage: >90% (backend), >70% (frontend)
- [ ] API response time: <500ms
- [ ] Page load time: <3 seconds
- [ ] Zero critical bugs in production

### User Metrics
- [ ] User satisfaction: >90%
- [ ] Adoption rate: >80% within 3 months
- [ ] Support tickets: <1% per user per month
- [ ] Task completion time: Reduced by >50%

### Business Metrics
- [ ] Manual effort reduction: >80%
- [ ] Process time reduction: >60%
- [ ] Error rate reduction: >95%
- [ ] ROI: Positive within 6 months

---

## 🔄 Continuous Improvement

After each module completion:
1. **Retrospective**: What went well? What can improve?
2. **Update Guide**: Update this guide with learnings
3. **Share Knowledge**: Document best practices
4. **Refine Process**: Improve templates and checklist

---

## 📞 Support & Resources

### Documentation Templates
- PRD Template: See Journey 2 PRD structure
- Implementation Plan Template: See Journey 2 Implementation Plan structure
- README Template: See fee-management-system/README.md
- CLAUDE Template: See fee-management-system/CLAUDE.md

### Code Templates
- Backend: See admission-system/backend/ and fee-management-system/backend/
- Frontend: See admission-system/frontend/ and fee-management-system/frontend/

### Reference Implementations
- **Journey 1** (Admission System): Production-ready reference
- **Journey 2** (Fee Management): Setup complete, ready for development

---

## 🎯 Current Status

### Completed Modules
1. ✅ **Journey 1: Admission to Enrollment** - PRODUCTION READY
   - Location: `admission-system/`
   - Status: Fully functional, tested with 17 dummy applications
   - Features: Registration, application, document upload, admin review, status tracking

2. ✅ **Journey 2: Fee Collection & Reconciliation** - SETUP COMPLETE
   - Location: `fee-management-system/`
   - Status: 40 files created, ready for Phase 1 development
   - Documentation: 350+ pages (PRD + Implementation Plan + Setup guides)

### Next Module Recommendations (By Priority)

#### High Priority (Financial Health)
1. **Payroll & Staff Salaries** - Essential for staff satisfaction
2. **Budgeting & Financial Planning** - Essential for school management

#### High Priority (Academic Operations)
3. **Student Records Management** - Foundation for other academic modules
4. **Exam & Assessment Management** - Critical for academic cycle
5. **Timetable & Scheduling** - Daily operations

#### Medium Priority (Communication)
6. **Parent Communication** - Improve parent engagement
7. **Notices & Announcements** - Essential daily communication

#### Medium Priority (Operations)
8. **Transport & Route Management** - If school has transport
9. **Leave Management** - Staff satisfaction

---

## 📝 Quick Command Reference

### Research Module
```bash
# Read admin_tasks.docx section
# Read existing requirements
# Perform web research
```

### Create Module
```bash
# Use template request format (see above)
# Follow 10-step process
# Generate PRD + Implementation Plan
# Create project structure
# Set up documentation
# Set up backend + frontend
```

### Develop Module
```bash
# Start backend: python -m app.main
# Start frontend: npm run dev
# Follow TODO.md week by week
# Test, iterate, launch
```

---

**Last Updated**: October 13, 2025
**Modules Completed**: 2 (Admission, Fee Collection setup)
**Modules Remaining**: 35+
**Next Recommended**: Payroll & Staff Salaries OR Parent Communication

*Follow this guide for systematic, consistent module development!*
