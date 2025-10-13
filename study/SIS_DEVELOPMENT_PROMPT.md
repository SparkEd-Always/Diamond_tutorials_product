# Student Information System (SIS) - Development Prompt

## 🎯 Use this prompt to start SIS development

---

```
Hi Claude,

I want to develop the next module for the Sparked EdTech platform.

Module: Student Information System (SIS)
Category: Academics (Student Lifecycle)

Please follow the MODULE_DEVELOPMENT_GUIDE.md process:

1. Check study/admin_tasks_student_information_system.md for comprehensive module details
2. Check docs/requirements/modules/academics/student-records-management.md for existing requirements
3. Perform research on Student Information Systems, best practices for Indian schools, CBSE/ICSE/State board compliance
4. Generate comprehensive PRD (120-160 pages) with detailed user journeys for:
   - Academic Administrators/Registrars (managing profiles, generating certificates)
   - Teachers (updating grades, attendance, behavioral observations)
   - Class Coordinators (monitoring class-level data, interventions)
   - Parents (viewing student information, tracking progress, updating contacts)
   - Students (viewing personal info, grades, attendance, schedules)
   - Counselors (behavioral records, intervention tracking)
   - School Nurses (medical records, health checkups, immunizations)
5. Create implementation plan (85-105 pages) with 12-week timeline:
   - Phase 1: Core Profile Management (Weeks 1-4)
     * Student profile CRUD operations
     * Family relationships and emergency contacts
     * Document vault and storage
     * Basic search and filtering
   - Phase 2: Academic & Attendance Integration (Weeks 5-7)
     * Academic records tracking
     * Attendance data sync
     * Grade history and transcripts
     * Performance analytics
   - Phase 3: Health, Behavioral & Extracurricular (Weeks 8-9)
     * Medical records management
     * Behavioral and disciplinary tracking
     * Extracurricular activities and achievements
     * Counselor intervention tracking
   - Phase 4: Advanced Features (Weeks 10-11)
     * Certificate generation (transfer, bonafide, character)
     * Parent portal with real-time access
     * Analytics dashboard (performance, at-risk identification)
     * Compliance reports (board, government)
   - Phase 5: Testing & Launch (Week 12)
     * Load testing, security testing
     * User acceptance testing
     * Documentation and training
     * Production deployment
6. Create project structure: student-information-system/
7. Create all essential documentation files (README, CLAUDE, QUICKSTART, TODO, CONTEXT, PROJECT_STRUCTURE, SETUP_SUCCESS, FINAL_SUMMARY, INDEX, API, DATABASE_SCHEMA)
8. Set up backend skeleton (FastAPI + SQLAlchemy + PostgreSQL)
9. Set up frontend skeleton (React 19 + TypeScript + Material-UI v7)

Technologies to use (same as admission-system and fee-management-system):
- Backend: FastAPI 0.104+ | Python 3.11+ | SQLAlchemy 2.0 | PostgreSQL 15+ | JWT
- Frontend: React 19 | TypeScript 5.9 | Vite 7.1.9 | Material-UI v7.3 | Axios 1.12
- Additional:
  * PDF Generation: ReportLab (for certificates, transcripts)
  * Search: Elasticsearch (for fast student search)
  * File Storage: AWS S3 / MinIO (for document vault)
  * Caching: Redis (for frequently accessed profiles)

Key Features to Implement:

### Core Features (Phase 1)
- Comprehensive student profile management
- Family relationships (parents, guardians, siblings)
- Emergency contacts management
- Document vault (photos, certificates, IDs)
- Advanced search and filtering
- Bulk import/export capabilities
- Audit trails for all changes

### Academic Features (Phase 2)
- Academic history tracking (grades, exams, assessments)
- Attendance integration and analytics
- Promotion/retention workflows
- Subject enrollment tracking
- Academic transcript generation
- Performance trends and analytics

### Health & Behavioral Features (Phase 3)
- Medical records and immunization tracking
- Allergy and medication management
- Health checkup records
- Disciplinary incident tracking
- Counselor intervention records
- Behavioral observations
- Awards and recognitions

### Extracurricular Features (Phase 3)
- Club and activity participation
- Sports teams and competitions
- Cultural activities and performances
- Certifications and achievements
- Community service tracking
- Leadership positions

### Advanced Features (Phase 4)
- Automated certificate generation (transfer, bonafide, character)
- Digital signatures and blockchain verification
- Parent portal with real-time access
- Mobile app support
- AI-powered at-risk student identification
- Predictive analytics for performance
- Compliance reports (CBSE, ICSE, State boards, UDISE)
- Multi-language support (English, Hindi)

### Integration Requirements
- Admissions system (auto-create profiles)
- Attendance management (real-time sync)
- Grade management (academic performance)
- Fee management (financial status)
- Transport management (route assignment)
- Library management (book history)
- Health management (medical records)
- Communication system (notifications)
- Education board APIs (enrollment, results)

### Security & Compliance
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- End-to-end encryption
- GDPR, COPPA, Indian Data Protection compliance
- Consent management
- Right to data deletion
- Regular security audits
- Disaster recovery with <4 hour RTO
- 99.9% uptime SLA

### Analytics & Reporting
- Student performance dashboards
- Class/grade comparative analytics
- At-risk student identification (AI-powered)
- Attendance pattern analysis
- Behavioral trend reports
- Demographic reports
- Compliance reports (exportable in govt. formats)
- Custom report builder

### User Experience
- Web dashboard (admin, teachers)
- Parent portal (web + mobile)
- Student portal (age-appropriate)
- Mobile apps (iOS, Android)
- Offline mode with sync
- Push notifications
- Biometric login
- Multi-language support
- WCAG 2.1 AA accessibility

Please take all permissions needed to read, write, run commands.

Let's build a production-ready, comprehensive Student Information System that serves as the single source of truth for all student data!
```

---

## 📊 Expected Deliverables

### Documentation (Day 1-2)
1. **PRD** (120-160 pages):
   - Executive Summary
   - Product Vision & Goals
   - User Personas (5 detailed profiles)
   - User Journeys (10+ detailed flows)
   - Features & Requirements (50+ features)
   - Technical Architecture
   - Database Schema (20+ tables)
   - API Endpoints (100+ endpoints)
   - Success Metrics
   - Risk Assessment
   - Release Plan

2. **Implementation Plan** (85-105 pages):
   - Project Setup
   - 12-Week Development Plan
   - Team Structure
   - Technology Stack
   - Database Design
   - API Development Plan (RESTful + GraphQL)
   - Frontend Development Plan
   - Integration Plan (10+ integrations)
   - Testing Strategy
   - Deployment Plan
   - Risk Management
   - Go-Live Checklist

### Project Setup (Day 3)
3. **Project Structure**:
   - student-information-system/
   - Backend skeleton (FastAPI, 30+ files)
   - Frontend skeleton (React 19, 40+ files)
   - Documentation files (11 files)
   - Docker setup
   - CI/CD configuration

4. **Documentation Files**:
   - README.md (~20 pages)
   - CLAUDE.md (~30 pages)
   - QUICKSTART.md (~15 pages)
   - TODO.md (~40 pages)
   - CONTEXT.md (~25 pages)
   - PROJECT_STRUCTURE.md (~10 pages)
   - SETUP_SUCCESS.md (~12 pages)
   - FINAL_SUMMARY.md (~18 pages)
   - INDEX.md (~12 pages)
   - docs/API.md (~30 pages)
   - docs/DATABASE_SCHEMA.md (~20 pages)

### Development (Weeks 1-12)
5. **Phase 1 (Weeks 1-4)**: Core profile management working
6. **Phase 2 (Weeks 5-7)**: Academic & attendance integration complete
7. **Phase 3 (Weeks 8-9)**: Health, behavioral, extracurricular tracking
8. **Phase 4 (Weeks 10-11)**: Advanced features (certificates, analytics)
9. **Phase 5 (Week 12)**: Testing, training, production launch

---

## 🎯 Success Criteria

### Technical
- ✅ 100+ API endpoints operational
- ✅ 20+ database tables with proper relationships
- ✅ API response time <500ms
- ✅ Support 10,000+ student profiles
- ✅ Search completes within 2 seconds
- ✅ Certificate generation within 2 minutes
- ✅ 90%+ test coverage (backend), 70%+ (frontend)

### Business
- ✅ Manual data entry reduced by 80%
- ✅ Certificate generation time reduced by 99%
- ✅ Data accuracy improved to 98%+
- ✅ Parent portal satisfaction >90%
- ✅ Compliance report generation automated 100%

### User Experience
- ✅ Mobile app available (iOS, Android)
- ✅ Offline mode functional
- ✅ Multi-language support (English, Hindi)
- ✅ WCAG 2.1 AA accessible
- ✅ Parent portal 24/7 accessible

---

## 📚 Reference Materials

### Study Materials
- study/admin_tasks_student_information_system.md (THIS FILE - comprehensive requirements)
- docs/requirements/modules/academics/student-records-management.md (existing requirements)
- admission-system/ (reference implementation for project structure)
- fee-management-system/ (reference implementation for documentation)

### Standards & Compliance
- CBSE student data requirements
- ICSE enrollment norms
- State board compliance formats
- UDISE+ reporting standards
- Right to Education (RTE) Act compliance
- Indian Data Protection Bill requirements
- GDPR, COPPA for international students

### Best Practices
- Student Information Systems best practices
- Education data standards (SIF, Ed-Fi)
- FERPA compliance (if applicable)
- Accessibility standards (WCAG 2.1)
- Mobile-first design principles
- Microservices architecture

---

## 🚀 Ready to Start?

Copy the prompt above and paste it to Claude to begin development of the comprehensive Student Information System!

**Estimated Time**:
- Documentation: 2 days
- Project Setup: 1 day
- Development: 12 weeks
- **Total: 12 weeks + 3 days**

**Complexity**: Very High (Most comprehensive module)
**Priority**: Critical (Foundation for all academic operations)
**Dependencies**: Admissions system (for initial data)
**Integrations**: 10+ modules (attendance, grades, fee, transport, library, health, communication, etc.)

---

*Created: October 13, 2025*
*Module: Student Information System (SIS)*
*Category: Academics (Student Lifecycle)*
*Status: Ready for Development*
