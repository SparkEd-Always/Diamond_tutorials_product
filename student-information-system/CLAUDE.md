# Student Information System (SIS) - Claude AI Project Context

**Version:** 1.0.0
**Date:** October 13, 2025
**Status:** Phase 1 Complete | Phase 2 In Progress
**Project:** Sparked EdTech Platform - Student Information System Module
**Category:** Core Academic Management (Student Lifecycle)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Status](#2-current-status)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [File Structure](#5-file-structure)
6. [Key Components](#6-key-components)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [Development Workflow](#9-development-workflow)
10. [Testing Guidelines](#10-testing-guidelines)
11. [Deployment Process](#11-deployment-process)
12. [Common Tasks](#12-common-tasks)
13. [Troubleshooting](#13-troubleshooting)
14. [Integration Points](#14-integration-points)
15. [Security & Compliance](#15-security--compliance)

---

## 1. Project Overview

### 1.1 What is the Student Information System?

The **Student Information System (SIS)** is the foundational module of the Sparked EdTech platform, serving as the **single source of truth** for all student-related data across the institution. It consolidates student profiles, academic records, attendance, health information, behavioral data, extracurricular activities, and documents into a unified, secure, and accessible platform.

**Core Purpose:**
- Centralized student data management (10,000+ students per school)
- Real-time integration with all school modules (admissions, attendance, grades, finance)
- 360-degree student view (academics, health, behavior, activities)
- Parent portal with mobile apps (iOS & Android)
- AI-powered analytics and at-risk student identification
- Automated certificate generation (TC, bonafide, character certificates)
- Complete compliance with CBSE, ICSE, State boards, and UDISE+

### 1.2 Business Value

**Quantifiable Impact:**
- **80% reduction** in manual data entry time (3 hours → 30 minutes daily)
- **99% reduction** in certificate generation time (2-3 days → 2 minutes)
- **70% reduction** in parent queries through self-service portal
- **95% reduction** in report generation time (4 hours → 10 minutes)
- **98% data accuracy** (up from 60-70% with manual systems)
- **90%+ parent satisfaction** (up from 50-60%)

**Strategic Benefits:**
- Data-driven decision making with performance analytics
- Improved parent engagement and satisfaction
- Simplified accreditation and compliance audits
- Competitive advantage in attracting tech-savvy families
- Foundation for AI-powered educational insights

### 1.3 Target Users

- **Schools:** 2,500+ schools across India (CBSE, ICSE, State boards)
- **Students:** 500-5,000 students per school (10,000+ supported)
- **User Base:** 50,000+ administrators, teachers, parents, students
- **Geographic Coverage:** All 28 Indian states and 8 union territories

### 1.4 Key Features

#### Core Features (Phase 1 - COMPLETED)
- ✅ Comprehensive student profile management
- ✅ Family relationships (parents, guardians, siblings)
- ✅ Emergency contacts management
- ✅ Document vault (photos, certificates, IDs)
- ✅ Advanced search and filtering (Elasticsearch)
- ✅ Bulk import/export capabilities (Excel)
- ✅ Audit trails for all changes
- ✅ Role-based access control (RBAC)

#### Academic Features (Phase 2 - IN PROGRESS)
- Real-time academic records integration
- Attendance synchronization and analytics
- Performance trends and analytics
- Automated transcript generation
- Report card generation
- At-risk student identification (attendance-based)

#### Advanced Features (Phase 3-4 - PLANNED)
- Medical records and immunization tracking
- Behavioral incident tracking
- Extracurricular activities and achievements
- Digital portfolio generation
- Automated certificate generation (TC, bonafide, character)
- Parent portal with real-time access
- Mobile apps (iOS & Android)
- AI-powered at-risk student identification (85%+ accuracy)
- Predictive performance analytics
- Compliance reports (CBSE, ICSE, UDISE+)

---

## 2. Current Status

### 2.1 Development Progress

**Overall Status:** Week 6 of 12-week implementation plan

**Phase 1: Core Profile Management (Weeks 1-4)** ✅ **COMPLETED**
- ✅ Project infrastructure set up (FastAPI + React 19 + PostgreSQL)
- ✅ Database schema implemented (25+ tables)
- ✅ Authentication & authorization (JWT + RBAC)
- ✅ Student profile CRUD operations (backend + frontend)
- ✅ Family relationships and emergency contacts
- ✅ Document vault with upload/download (AWS S3)
- ✅ Advanced search with Elasticsearch
- ✅ Bulk import/export (Excel)
- ✅ 90%+ backend test coverage
- ✅ 70%+ frontend test coverage

**Phase 2: Academic & Attendance Integration (Weeks 5-7)** 🚧 **IN PROGRESS**
- ✅ Week 5 completed: Attendance integration
  - Attendance records table and model
  - Real-time sync endpoint from attendance module
  - Attendance percentage calculations (daily, monthly, term, annual)
  - Attendance alerts (below 75%)
  - Attendance analytics dashboard
- 🚧 Week 6 in progress: Academic records integration
  - Academic records tables (grades, assessments, terms)
  - Grade sync from grade management module
  - Performance trend analysis
  - Class rank and percentile calculations
- ⏳ Week 7 planned: Transcripts & report cards
  - Transcript generation (PDF with ReportLab)
  - Report card generation (board-specific templates)
  - Bulk report card generation

**Phase 3: Health, Behavioral & Extracurricular (Weeks 8-9)** ⏳ **PLANNED**
- Medical records management
- Behavioral incident tracking
- Extracurricular activities tracking
- Digital portfolio generation

**Phase 4: Advanced Features (Weeks 10-11)** ⏳ **PLANNED**
- Certificate generation (TC, bonafide, character)
- Parent portal with mobile apps
- AI/ML analytics and at-risk identification
- Compliance reports

**Phase 5: Testing & Launch (Week 12)** ⏳ **PLANNED**
- Load testing, security testing
- User acceptance testing (UAT)
- Production deployment

### 2.2 What's Working Right Now

**Backend Services (FastAPI):**
- ✅ 100+ API endpoints operational
- ✅ JWT authentication with bcrypt password hashing
- ✅ Role-based access control (admin, teacher, parent, student)
- ✅ PostgreSQL database with SQLAlchemy ORM
- ✅ Redis caching for frequently accessed profiles
- ✅ Elasticsearch for fast student search
- ✅ AWS S3 for document storage
- ✅ Celery + RabbitMQ for async tasks (bulk operations, email/SMS)
- ✅ API response time <500ms (p95)
- ✅ Database: http://localhost:5432 (PostgreSQL)
- ✅ Backend: http://localhost:8000 (FastAPI)
- ✅ API Docs: http://localhost:8000/docs (Swagger UI)

**Frontend Application (React 19):**
- ✅ Material-UI v7 component library
- ✅ Redux Toolkit for state management
- ✅ React Router v7 for navigation
- ✅ React Hook Form for form validation
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Student profile management UI
- ✅ Document upload/download with drag-and-drop
- ✅ Advanced search with filters
- ✅ Bulk import/export wizard
- ✅ Frontend: http://localhost:5173 (Vite dev server)

**Database:**
- ✅ 25+ tables implemented (students, parents, addresses, documents, etc.)
- ✅ Comprehensive indexing for performance
- ✅ Audit logging for all data changes
- ✅ Soft deletes with deleted_at column
- ✅ Database migrations with Alembic
- ✅ Hourly incremental backups
- ✅ Daily full backups

**Testing:**
- ✅ 90%+ backend test coverage (pytest)
- ✅ 70%+ frontend test coverage (Jest + React Testing Library)
- ✅ Integration tests for all API endpoints
- ✅ CI/CD pipeline with GitHub Actions

### 2.3 What's Next

**Immediate Next Steps (Week 6 - Current Week):**
1. Complete academic records integration backend
2. Implement performance analytics (trends, rank, percentile)
3. Create grade display and performance chart frontend components
4. Test academic records sync from grade management module

**Week 7 Tasks:**
1. Implement transcript generation (PDF)
2. Implement report card generation (board-specific)
3. Create transcript and report card viewing UI
4. Add bulk report card generation for entire class
5. Phase 2 testing and bug fixes

**Week 8-12 Tasks:**
- Weeks 8-9: Medical, behavioral, extracurricular tracking
- Weeks 10-11: Certificate generation, parent portal, mobile apps, AI/ML
- Week 12: Load testing, security testing, UAT, production launch

### 2.4 Known Issues

**Current Known Issues:**
- None (all Phase 1 features tested and working)

**Tech Debt:**
- Optimize Elasticsearch indexing for large student datasets (>10,000)
- Add Redis caching for attendance summary queries
- Implement database query optimization for complex reports
- Add frontend error boundary components

**Future Improvements:**
- Real-time notifications with WebSockets
- Progressive Web App (PWA) support for offline access
- GraphQL API for flexible data fetching
- Advanced analytics dashboard with customizable widgets

---

## 3. Technology Stack

### 3.1 Backend Technologies

**Core Framework:**
- **FastAPI 0.104+** - Modern Python web framework with auto-generated API docs
- **Python 3.11+** - Latest Python with improved performance and type hints
- **Uvicorn** - ASGI server for FastAPI

**Database:**
- **PostgreSQL 15+** - Primary database with JSON support and advanced indexing
- **SQLAlchemy 2.0** - ORM for database models and queries
- **Alembic** - Database migration management
- **PgBouncer** - Connection pooling for database performance

**Caching & Search:**
- **Redis 7+** - In-memory cache for sessions, frequently accessed profiles, API responses
- **Elasticsearch 8+** - Full-text search for student names, admission numbers, fuzzy matching

**File Storage:**
- **AWS S3 / MinIO** - Document storage (student photos, certificates, medical records)
- **Boto3** - AWS SDK for S3 operations

**Task Queue:**
- **Celery** - Asynchronous task processing (bulk operations, email/SMS, reports)
- **RabbitMQ** - Message broker for Celery

**Authentication & Security:**
- **JWT (python-jose)** - Stateless authentication with access/refresh tokens
- **Bcrypt (passlib)** - Secure password hashing
- **CORS middleware** - Cross-origin resource sharing configuration

**PDF Generation:**
- **ReportLab** - PDF generation for transcripts, certificates, report cards

**Third-Party Services:**
- **MSG91 / Twilio** - SMS gateway for attendance alerts, OTPs
- **SendGrid / Amazon SES** - Email service for notifications, reports

### 3.2 Frontend Technologies

**Core Framework:**
- **React 19** - Latest React with improved performance and concurrent features
- **TypeScript 5.9** - Type-safe JavaScript for better developer experience
- **Vite 7.1.9** - Fast build tool with hot module replacement

**UI Library:**
- **Material-UI v7.3 (MUI)** - Comprehensive component library with Material Design
- **Emotion** - CSS-in-JS styling (used by MUI)

**State Management:**
- **Redux Toolkit** - Predictable state management with Redux DevTools
- **RTK Query** - Data fetching and caching with Redux

**Form Management:**
- **React Hook Form** - Performance-focused form library with minimal re-renders
- **Yup** - Schema validation for forms

**Routing:**
- **React Router v7** - Declarative routing with nested routes and protected routes

**HTTP Client:**
- **Axios 1.12** - Promise-based HTTP client with interceptors

**Data Visualization:**
- **Chart.js** - Beautiful, responsive charts for analytics
- **Recharts** - React wrapper for charts

**File Upload:**
- **react-dropzone** - Drag-and-drop file upload component

### 3.3 Mobile Technologies (Phase 4)

**Framework:**
- **React Native** - Cross-platform mobile app (iOS + Android)
- **React Native Paper** - Material Design components for React Native

**Push Notifications:**
- **Firebase Cloud Messaging (FCM)** - Push notifications for iOS and Android

### 3.4 Machine Learning (Phase 4)

**ML Framework:**
- **scikit-learn** - At-risk student identification model
- **pandas** - Data preprocessing and feature engineering
- **NumPy** - Numerical computing

**Model Serving:**
- **FastAPI** - Separate ML service for predictions

### 3.5 DevOps Technologies

**Containerization:**
- **Docker** - Containerization for all services
- **Docker Compose** - Multi-container orchestration for local development

**Orchestration:**
- **Kubernetes (K8s)** - Production deployment with auto-scaling

**CI/CD:**
- **GitHub Actions** - Automated testing, builds, deployments

**Monitoring:**
- **Prometheus** - Time-series metrics collection
- **Grafana** - Metric visualization and dashboards
- **ELK Stack** - Centralized logging (Elasticsearch, Logstash, Kibana)
- **Sentry** - Real-time error tracking

**Cloud Provider:**
- **AWS / Azure** - Production infrastructure
  - EC2 / Virtual Machines (compute)
  - RDS / Managed PostgreSQL (database)
  - ElastiCache / Redis Cache (caching)
  - S3 / Blob Storage (file storage)
  - CloudFront / CDN (static assets)
  - CloudWatch / Monitor (monitoring)

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Users                                   │
│    (Admins, Teachers, Parents, Students)                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTPS/TLS 1.3
             │
┌────────────▼────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer                   │
│              (Authentication, Rate Limiting, CORS)               │
└────────────┬────────────────────────┬────────────────────────────┘
             │                        │
    ┌────────▼─────────┐    ┌────────▼──────────┐
    │  Frontend        │    │  Backend          │
    │  (React 19)      │    │  (FastAPI)        │
    │  Port: 5173      │    │  Port: 8000       │
    └──────────────────┘    └────────┬──────────┘
                                     │
                    ┌────────────────┼─────────────────┐
                    │                │                 │
          ┌─────────▼────┐  ┌────────▼────┐  ┌────────▼────────┐
          │ PostgreSQL   │  │   Redis     │  │ Elasticsearch   │
          │ (Primary DB) │  │  (Cache)    │  │   (Search)      │
          │ Port: 5432   │  │ Port: 6379  │  │  Port: 9200     │
          └──────────────┘  └─────────────┘  └─────────────────┘
                    │
          ┌─────────▼────────────┐
          │       AWS S3         │
          │  (Document Storage)  │
          └──────────────────────┘
                    │
          ┌─────────▼────────────┐
          │  Celery + RabbitMQ   │
          │   (Async Tasks)      │
          └──────────────────────┘
```

### 4.2 Service Architecture

**Microservices Approach (Future State):**
- **Student Service** - Core student profile management
- **Academic Service** - Grades, transcripts, report cards
- **Attendance Service** - Attendance tracking and analytics
- **Medical Service** - Health records and immunizations
- **Behavioral Service** - Discipline and counseling records
- **Document Service** - Document vault and certificate generation
- **Analytics Service** - Performance analytics and at-risk identification
- **Notification Service** - Email, SMS, push notifications

**Current Architecture (Monolithic with Modular Design):**
- Single FastAPI application with modular structure
- Easy to split into microservices later
- Clear separation of concerns (models, schemas, services, API routes)

### 4.3 Database Architecture

**PostgreSQL Primary Database:**
- **Students** - Core student profiles
- **Parents/Guardians** - Family relationships
- **Addresses** - Current and permanent addresses
- **Emergency Contacts** - Emergency contact information
- **Documents** - Document metadata (files stored in S3)
- **Academic Records** - Grades, assessments, transcripts
- **Attendance Records** - Daily attendance data
- **Medical Records** - Health information, immunizations
- **Behavioral Records** - Discipline and counseling
- **Activities** - Extracurricular participation
- **Achievements** - Awards and recognitions
- **Certificates** - Generated certificates
- **Audit Logs** - All data changes

**Indexing Strategy:**
- Primary key indexes on all tables (UUID)
- Foreign key indexes for relationships
- Composite indexes for frequently queried combinations (class + section, date ranges)
- Full-text search indexes for names (PostgreSQL tsvector)
- Partial indexes for active records (WHERE deleted_at IS NULL)

**Backup Strategy:**
- Hourly incremental backups (last 24 hours)
- Daily full backups (last 30 days)
- Weekly backups (last 12 weeks)
- Monthly backups (last 12 months)
- Annual backups (retained for 7+ years)

### 4.4 API Architecture

**REST API Design:**
- RESTful principles with HTTP verbs (GET, POST, PUT, DELETE)
- Plural resource names (`/students`, not `/student`)
- Nested resources for relationships (`/students/{id}/parents`)
- Consistent response format (JSON with `success`, `data`, `message`, `errors`)
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

**Versioning:**
- URL-based versioning (`/api/v1/students`)
- Version in all API routes
- Easy to add new versions without breaking existing clients

**Authentication:**
- JWT-based authentication (access token + refresh token)
- Access token: 1 hour expiry
- Refresh token: 7 days expiry
- Authorization header: `Bearer <token>`

**Rate Limiting:**
- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Admin: 500 requests/minute
- Redis-based rate limiting

---

## 5. File Structure

### 5.1 Project Root Structure

```
student-information-system/
├── backend/                       # Backend FastAPI application
├── frontend/                      # Frontend applications
│   ├── web-app/                  # React web application
│   └── mobile-app/               # React Native mobile app (Phase 4)
├── ml-services/                  # ML/AI services (Phase 4)
├── docs/                         # Documentation
├── scripts/                      # Utility scripts
├── kubernetes/                   # K8s manifests
├── .github/workflows/            # CI/CD pipelines
├── docker-compose.yml            # Local development setup
├── README.md                     # Project README
├── CLAUDE.md                     # This file - Project context for Claude
├── QUICKSTART.md                 # Quick start guide
├── TODO.md                       # Development task list
└── INDEX.md                      # Documentation index
```

### 5.2 Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app entry point
│   ├── config.py                 # Configuration management
│   ├── database.py               # Database connection
│   │
│   ├── models/                   # SQLAlchemy models (25+ tables)
│   │   ├── __init__.py
│   │   ├── student.py           # Student model
│   │   ├── parent.py            # Parent/Guardian model
│   │   ├── address.py           # Address model
│   │   ├── emergency_contact.py # Emergency contact model
│   │   ├── document.py          # Document model
│   │   ├── academic_record.py   # Academic record model
│   │   ├── attendance.py        # Attendance model
│   │   ├── medical_record.py    # Medical record model
│   │   ├── behavioral_record.py # Behavioral record model
│   │   ├── activity.py          # Activity model
│   │   ├── achievement.py       # Achievement model
│   │   ├── certificate.py       # Certificate model
│   │   └── audit_log.py         # Audit log model
│   │
│   ├── schemas/                  # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── student.py           # Student schemas
│   │   ├── parent.py            # Parent schemas
│   │   ├── document.py          # Document schemas
│   │   ├── academic.py          # Academic schemas
│   │   ├── attendance.py        # Attendance schemas
│   │   └── ...
│   │
│   ├── api/                      # API routes (100+ endpoints)
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── students.py      # Student CRUD endpoints
│   │   │   ├── parents.py       # Parent endpoints
│   │   │   ├── documents.py     # Document endpoints
│   │   │   ├── academic.py      # Academic records endpoints
│   │   │   ├── attendance.py    # Attendance endpoints
│   │   │   ├── medical.py       # Medical records endpoints
│   │   │   ├── behavioral.py    # Behavioral records endpoints
│   │   │   ├── activities.py    # Activities endpoints
│   │   │   ├── certificates.py  # Certificate generation endpoints
│   │   │   ├── analytics.py     # Analytics endpoints
│   │   │   └── integrations.py  # Integration endpoints
│   │
│   ├── services/                 # Business logic layer
│   │   ├── __init__.py
│   │   ├── student_service.py
│   │   ├── parent_service.py
│   │   ├── document_service.py
│   │   ├── academic_service.py
│   │   ├── attendance_service.py
│   │   ├── certificate_service.py
│   │   ├── analytics_service.py
│   │   └── notification_service.py
│   │
│   ├── utils/                    # Helper functions
│   │   ├── __init__.py
│   │   ├── auth.py              # JWT authentication utilities
│   │   ├── validation.py        # Input validation utilities
│   │   ├── search.py            # Elasticsearch utilities
│   │   ├── cache.py             # Redis caching utilities
│   │   ├── file_upload.py       # S3 file upload utilities
│   │   ├── pdf_generator.py     # PDF generation utilities
│   │   └── date_utils.py        # Date/time utilities
│   │
│   ├── middleware/               # Custom middleware
│   │   ├── __init__.py
│   │   ├── authentication.py    # Auth middleware
│   │   ├── rate_limiting.py     # Rate limiting middleware
│   │   └── logging.py           # Request logging middleware
│   │
│   └── tests/                    # Unit & integration tests
│       ├── __init__.py
│       ├── conftest.py          # Pytest fixtures
│       ├── unit/
│       │   ├── test_models.py
│       │   ├── test_services.py
│       │   └── test_utils.py
│       └── integration/
│           ├── test_student_api.py
│           ├── test_parent_api.py
│           └── test_academic_api.py
│
├── alembic/                      # Database migrations
│   ├── versions/
│   └── env.py
│
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker image for backend
└── .env.example                  # Environment variables template
```

### 5.3 Frontend Structure

```
frontend/web-app/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── common/              # Common components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── student/             # Student-specific components
│   │   │   ├── StudentForm.tsx
│   │   │   ├── StudentCard.tsx
│   │   │   ├── StudentList.tsx
│   │   │   └── StudentDetailView.tsx
│   │   ├── parent/              # Parent components
│   │   │   ├── ParentForm.tsx
│   │   │   └── FamilyTree.tsx
│   │   ├── document/            # Document components
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── DocumentGallery.tsx
│   │   │   └── DocumentViewer.tsx
│   │   ├── academic/            # Academic components
│   │   │   ├── GradeTable.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   └── TranscriptViewer.tsx
│   │   └── analytics/           # Analytics components
│   │       ├── DashboardChart.tsx
│   │       └── AtRiskStudentList.tsx
│   │
│   ├── pages/                    # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── admin/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── StudentListPage.tsx
│   │   │   ├── StudentDetailPage.tsx
│   │   │   ├── StudentCreatePage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── parent/
│   │   │   ├── ParentDashboardPage.tsx
│   │   │   ├── ChildrenListPage.tsx
│   │   │   └── ChildDetailPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── layouts/                  # Layout components
│   │   ├── AdminLayout.tsx
│   │   ├── ParentLayout.tsx
│   │   └── AuthLayout.tsx
│   │
│   ├── store/                    # Redux store
│   │   ├── index.ts             # Store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── studentSlice.ts
│   │   │   ├── parentSlice.ts
│   │   │   ├── academicSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── api/                 # RTK Query API
│   │       ├── studentApi.ts
│   │       ├── parentApi.ts
│   │       └── academicApi.ts
│   │
│   ├── services/                 # API services
│   │   ├── api.ts               # Axios configuration
│   │   ├── studentService.ts
│   │   ├── parentService.ts
│   │   ├── academicService.ts
│   │   └── authService.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useStudents.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── validation.ts
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── constants.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── student.ts
│   │   ├── parent.ts
│   │   ├── academic.ts
│   │   └── api.ts
│   │
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # App entry point
│   └── vite-env.d.ts            # Vite environment types
│
├── package.json                  # Node dependencies
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── .env.example                  # Environment variables template
└── Dockerfile                    # Docker image for frontend
```

---

## 6. Key Components

### 6.1 Backend Components

#### 6.1.1 Main Application (app/main.py)

**Purpose:** FastAPI application entry point with middleware, CORS, and route registration

**Key Features:**
- CORS middleware for cross-origin requests
- Authentication middleware for protected routes
- Rate limiting middleware
- Request logging middleware
- Error handling middleware
- API versioning (v1)
- Swagger UI at `/docs`
- ReDoc at `/redoc`

**Sample Code:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import students, parents, documents, academic

app = FastAPI(
    title="Student Information System API",
    version="1.0.0",
    description="API for SIS module"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(students.router, prefix="/api/v1", tags=["students"])
app.include_router(parents.router, prefix="/api/v1", tags=["parents"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(academic.router, prefix="/api/v1", tags=["academic"])

@app.get("/")
def read_root():
    return {"message": "Student Information System API"}
```

#### 6.1.2 Database Models (app/models/)

**Purpose:** SQLAlchemy ORM models representing database tables

**Key Models:**
- `Student` - Core student profile
- `Parent` - Parent/guardian information
- `Address` - Student addresses (current, permanent)
- `EmergencyContact` - Emergency contact information
- `Document` - Document metadata
- `AcademicRecord` - Grades and assessments
- `AttendanceRecord` - Daily attendance
- `MedicalRecord` - Health information
- `BehavioralRecord` - Discipline records
- `Activity` - Extracurricular activities
- `Achievement` - Awards and recognitions
- `Certificate` - Generated certificates
- `AuditLog` - Audit trail for all changes

**Sample Model (Student):**
```python
from sqlalchemy import Column, String, Date, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admission_number = Column(String(50), unique=True, nullable=False)
    roll_number = Column(String(20))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum('Male', 'Female', 'Other', name='gender_enum'))
    blood_group = Column(String(10))
    photo_url = Column(String(500))
    current_class_id = Column(UUID(as_uuid=True), ForeignKey('classes.id'))
    student_status = Column(String(30), default='Active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
```

#### 6.1.3 Pydantic Schemas (app/schemas/)

**Purpose:** Request/response validation and serialization

**Key Schemas:**
- `StudentCreate` - Request body for creating student
- `StudentUpdate` - Request body for updating student
- `StudentResponse` - Response format for student data
- `StudentList` - Paginated list of students

**Sample Schema:**
```python
from pydantic import BaseModel, EmailStr, validator
from datetime import date
from typing import Optional
from uuid import UUID

class StudentCreate(BaseModel):
    admission_number: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_group: Optional[str] = None

    @validator('gender')
    def validate_gender(cls, v):
        if v not in ['Male', 'Female', 'Other']:
            raise ValueError('Invalid gender')
        return v

class StudentResponse(BaseModel):
    id: UUID
    admission_number: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    photo_url: Optional[str]

    class Config:
        orm_mode = True
```

#### 6.1.4 API Routes (app/api/v1/)

**Purpose:** HTTP endpoint definitions with request handlers

**Key Route Files:**
- `auth.py` - Authentication (login, register, refresh token)
- `students.py` - Student CRUD operations
- `parents.py` - Parent/guardian management
- `documents.py` - Document upload/download
- `academic.py` - Academic records and transcripts
- `attendance.py` - Attendance tracking
- `certificates.py` - Certificate generation

**Sample Route (students.py):**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.student import StudentCreate, StudentResponse
from app.services import student_service
from app.utils.auth import get_current_user

router = APIRouter()

@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new student profile"""
    return student_service.create_student(db, student, current_user.id)

@router.get("/students/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get student details by ID"""
    student = student_service.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
```

#### 6.1.5 Services (app/services/)

**Purpose:** Business logic layer separated from API routes

**Key Services:**
- `student_service.py` - Student business logic
- `parent_service.py` - Parent management logic
- `document_service.py` - Document handling (S3 upload/download)
- `academic_service.py` - Academic records and analytics
- `certificate_service.py` - Certificate generation (PDF)
- `analytics_service.py` - Performance analytics and predictions

**Sample Service:**
```python
from sqlalchemy.orm import Session
from app.models.student import Student
from app.schemas.student import StudentCreate
from app.utils.cache import cache_student
from app.utils.search import index_student

def create_student(db: Session, student: StudentCreate, created_by_id: str):
    """Create a new student profile"""
    db_student = Student(**student.dict(), created_by_id=created_by_id)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    # Cache the student profile
    cache_student(db_student)

    # Index in Elasticsearch
    index_student(db_student)

    return db_student

def get_student_by_id(db: Session, student_id: str):
    """Get student by ID with caching"""
    # Check cache first
    cached = get_cached_student(student_id)
    if cached:
        return cached

    # Query database
    student = db.query(Student).filter(Student.id == student_id).first()

    # Cache for future requests
    if student:
        cache_student(student)

    return student
```

#### 6.1.6 Authentication (app/utils/auth.py)

**Purpose:** JWT token generation, validation, and user authentication

**Key Functions:**
- `create_access_token()` - Generate JWT access token
- `create_refresh_token()` - Generate refresh token
- `verify_token()` - Validate JWT token
- `get_current_user()` - Dependency to get authenticated user
- `hash_password()` - Bcrypt password hashing
- `verify_password()` - Password verification

**Sample Code:**
```python
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
```

### 6.2 Frontend Components

#### 6.2.1 App Component (src/App.tsx)

**Purpose:** Main application component with routing and layout

**Key Features:**
- React Router setup
- Protected routes with authentication check
- Layout components (AdminLayout, ParentLayout, AuthLayout)
- Global error boundary
- Redux Provider

**Sample Code:**
```tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import StudentListPage from './pages/admin/StudentListPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="students" element={<StudentListPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
```

#### 6.2.2 Student Form Component (src/components/student/StudentForm.tsx)

**Purpose:** Reusable student profile form with validation

**Key Features:**
- React Hook Form for form management
- Yup schema validation
- Material-UI components
- Photo upload with preview
- Address fields (current, permanent)
- Submit and cancel actions

**Sample Code:**
```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TextField, Button, Grid } from '@mui/material';

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  date_of_birth: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
}).required();

interface StudentFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function StudentForm({ initialData, onSubmit, onCancel }: StudentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('first_name')}
            label="First Name"
            fullWidth
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('last_name')}
            label="Last Name"
            fullWidth
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
          />
        </Grid>
        {/* More fields... */}
        <Grid item xs={12}>
          <Button type="submit" variant="contained">Submit</Button>
          <Button onClick={onCancel} variant="outlined">Cancel</Button>
        </Grid>
      </Grid>
    </form>
  );
}
```

#### 6.2.3 Student List Component (src/components/student/StudentList.tsx)

**Purpose:** Display paginated list of students with search and filters

**Key Features:**
- Material-UI DataGrid for table display
- Search bar with debounce
- Filters (class, section, status)
- Pagination
- Row actions (view, edit, delete)
- Export to Excel

**Sample Code:**
```tsx
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TextField, Box, Button } from '@mui/material';
import { useDebounce } from '../../hooks/useDebounce';
import { useStudents } from '../../hooks/useStudents';

export default function StudentList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

  const { students, loading, total } = useStudents({
    search: debouncedSearch,
    page,
    perPage: 50
  });

  const columns: GridColDef[] = [
    { field: 'admission_number', headerName: 'Admission No', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'class', headerName: 'Class', width: 100 },
    { field: 'section', headerName: 'Section', width: 100 },
    { field: 'status', headerName: 'Status', width: 100 },
  ];

  return (
    <Box>
      <TextField
        label="Search students"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
      />
      <DataGrid
        rows={students}
        columns={columns}
        loading={loading}
        pageSize={50}
        rowCount={total}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
      />
    </Box>
  );
}
```

#### 6.2.4 Redux Store (src/store/index.ts)

**Purpose:** Centralized state management with Redux Toolkit

**Key Slices:**
- `authSlice` - User authentication state
- `studentSlice` - Student data and filters
- `parentSlice` - Parent data
- `academicSlice` - Academic records
- `uiSlice` - UI state (modals, loading, notifications)

**Sample Store Configuration:**
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import { studentApi } from './api/studentApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    [studentApi.reducerPath]: studentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(studentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 7. Database Schema

### 7.1 Core Tables

#### 7.1.1 Students Table

**Purpose:** Core student profile information

**Columns:**
- `id` (UUID, PK) - Unique student identifier
- `admission_number` (VARCHAR, UNIQUE) - School admission number
- `roll_number` (VARCHAR) - Class roll number
- `first_name` (VARCHAR) - Student first name
- `middle_name` (VARCHAR) - Student middle name
- `last_name` (VARCHAR) - Student last name
- `date_of_birth` (DATE) - Date of birth
- `gender` (ENUM) - Gender (Male, Female, Other)
- `blood_group` (VARCHAR) - Blood group (A+, O-, etc.)
- `nationality` (VARCHAR) - Nationality (default: Indian)
- `religion` (VARCHAR) - Religion
- `caste_category` (ENUM) - Caste category (General, OBC, SC, ST, Other)
- `aadhar_number` (VARCHAR, UNIQUE) - Aadhaar number
- `photo_url` (VARCHAR) - S3 URL for student photo
- `current_class_id` (UUID, FK) - Current class
- `current_section_id` (UUID, FK) - Current section
- `house_id` (UUID, FK) - House allocation
- `admission_date` (DATE) - Date of admission
- `student_status` (ENUM) - Status (Active, Alumni, Transferred, Expelled, Withdrawn)
- `profile_completeness_percentage` (INTEGER) - Profile completion percentage
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp
- `deleted_at` (TIMESTAMP, nullable) - Soft delete timestamp
- `created_by` (UUID, FK) - User who created record
- `updated_by` (UUID, FK) - User who last updated record

**Indexes:**
- Primary key on `id`
- Unique index on `admission_number`
- Index on `current_class_id`, `current_section_id`
- Index on `student_status`
- Composite index on `(first_name, last_name)`
- Full-text search index on names
- Partial index on active records (WHERE `deleted_at` IS NULL)

**Sample SQL:**
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    roll_number VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(10),
    nationality VARCHAR(50) DEFAULT 'Indian',
    religion VARCHAR(50),
    caste_category VARCHAR(20) CHECK (caste_category IN ('General', 'OBC', 'SC', 'ST', 'Other')),
    aadhar_number VARCHAR(12) UNIQUE,
    photo_url VARCHAR(500),
    current_class_id UUID REFERENCES classes(id),
    current_section_id UUID REFERENCES sections(id),
    house_id UUID REFERENCES houses(id),
    admission_date DATE NOT NULL,
    student_status VARCHAR(30) NOT NULL DEFAULT 'Active'
        CHECK (student_status IN ('Active', 'Alumni', 'Transferred', 'Expelled', 'Withdrawn')),
    profile_completeness_percentage INTEGER DEFAULT 0 CHECK (profile_completeness_percentage >= 0 AND profile_completeness_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_students_current_class ON students(current_class_id);
CREATE INDEX idx_students_status ON students(student_status);
CREATE INDEX idx_students_name ON students(first_name, last_name);
CREATE INDEX idx_students_deleted ON students(deleted_at) WHERE deleted_at IS NULL;
```

#### 7.1.2 Parents/Guardians Table

**Purpose:** Parent and guardian information

**Columns:**
- `id` (UUID, PK)
- `title` (VARCHAR) - Title (Mr., Mrs., Ms., Dr.)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `relationship` (ENUM) - Relationship (Father, Mother, Guardian, Other)
- `email` (VARCHAR, UNIQUE)
- `phone_primary` (VARCHAR)
- `phone_secondary` (VARCHAR)
- `occupation` (VARCHAR)
- `employer_name` (VARCHAR)
- `annual_income` (DECIMAL)
- `education_level` (VARCHAR)
- `is_primary_contact` (BOOLEAN)
- `can_pickup_student` (BOOLEAN)
- `created_at`, `updated_at`, `deleted_at`

#### 7.1.3 Student-Parent Relationships Table

**Purpose:** Many-to-many relationship between students and parents

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK → students.id)
- `parent_id` (UUID, FK → parents_guardians.id)
- `relationship_type` (ENUM) - Father, Mother, Guardian, etc.
- `is_custodial_parent` (BOOLEAN)
- `is_emergency_contact` (BOOLEAN)
- `custody_status` (ENUM) - Full, Joint, Non-custodial, Legal Guardian
- `created_at`, `updated_at`

#### 7.1.4 Emergency Contacts Table

**Purpose:** Emergency contact information for students

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `contact_name` (VARCHAR)
- `relationship` (VARCHAR)
- `phone_primary` (VARCHAR)
- `phone_secondary` (VARCHAR)
- `email` (VARCHAR)
- `priority_order` (INTEGER) - 1 (primary), 2 (secondary), etc.
- `can_pickup_student` (BOOLEAN)
- `notes` (TEXT)
- `created_at`, `updated_at`

#### 7.1.5 Addresses Table

**Purpose:** Student residential addresses

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `address_type` (ENUM) - Current, Permanent
- `address_line1` (VARCHAR)
- `address_line2` (VARCHAR)
- `city` (VARCHAR)
- `state` (VARCHAR)
- `country` (VARCHAR) - Default: India
- `postal_code` (VARCHAR)
- `latitude` (DECIMAL)
- `longitude` (DECIMAL)
- `is_primary` (BOOLEAN)
- `created_at`, `updated_at`

#### 7.1.6 Documents Table

**Purpose:** Document metadata (files stored in S3)

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `document_type` (ENUM) - Birth Certificate, Photo, ID Proof, Medical Certificate, etc.
- `document_name` (VARCHAR)
- `file_path` (VARCHAR) - S3 key/path
- `file_size` (INTEGER) - Size in bytes
- `file_mime_type` (VARCHAR)
- `document_category` (VARCHAR) - Personal, Academic, Medical, Legal
- `expiry_date` (DATE) - For documents with expiration
- `uploaded_by` (UUID, FK)
- `created_at`, `updated_at`, `deleted_at`

#### 7.1.7 Academic Records Table

**Purpose:** Student grades, assessments, and academic performance

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `academic_year_id` (UUID, FK)
- `term_id` (UUID, FK) - Term 1, Term 2, Annual
- `subject_id` (UUID, FK)
- `assessment_type` (ENUM) - Unit Test, Mid-term, Final Exam, Assignment, Project
- `assessment_name` (VARCHAR)
- `marks_obtained` (DECIMAL)
- `max_marks` (DECIMAL)
- `grade` (VARCHAR) - A+, A, B+, etc.
- `percentage` (DECIMAL)
- `rank_in_class` (INTEGER)
- `teacher_remarks` (TEXT)
- `exam_date` (DATE)
- `created_at`, `updated_at`

**Indexes:**
- Composite index on `(student_id, academic_year_id, term_id)`
- Index on `subject_id`
- Index on `exam_date`

#### 7.1.8 Attendance Records Table

**Purpose:** Daily student attendance tracking

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `attendance_date` (DATE)
- `class_id` (UUID, FK)
- `section_id` (UUID, FK)
- `session` (ENUM) - Full Day, Morning, Afternoon
- `status` (ENUM) - Present, Absent, Late, Half Day, On Leave
- `absence_reason` (VARCHAR)
- `leave_approved` (BOOLEAN)
- `marked_by` (UUID, FK) - Teacher who marked attendance
- `marked_at` (TIMESTAMP)
- `notes` (TEXT)
- `created_at`, `updated_at`

**Indexes:**
- Composite index on `(student_id, attendance_date)`
- Index on `attendance_date`
- Index on `status`

#### 7.1.9 Medical Records Table

**Purpose:** Student health information and medical history

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `record_type` (ENUM) - Allergy, Chronic Condition, Medication, Immunization, Checkup
- `condition_name` (VARCHAR)
- `description` (TEXT)
- `severity` (ENUM) - Mild, Moderate, Severe, Critical
- `medication_name` (VARCHAR)
- `dosage` (VARCHAR)
- `frequency` (VARCHAR)
- `start_date` (DATE)
- `end_date` (DATE)
- `doctor_name` (VARCHAR)
- `hospital_name` (VARCHAR)
- `notes` (TEXT)
- `created_by` (UUID, FK) - Health staff
- `created_at`, `updated_at`

#### 7.1.10 Behavioral Records Table

**Purpose:** Disciplinary incidents and behavioral observations

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `incident_type` (ENUM) - Discipline Issue, Fight, Bullying, Misconduct, Achievement
- `incident_date` (DATE)
- `description` (TEXT)
- `severity` (ENUM) - Minor, Moderate, Major, Critical
- `action_taken` (TEXT)
- `follow_up_required` (BOOLEAN)
- `parent_notified` (BOOLEAN)
- `parent_meeting_date` (DATE)
- `counselor_involved` (BOOLEAN)
- `resolution_status` (ENUM) - Open, In Progress, Resolved
- `reported_by` (UUID, FK) - Teacher
- `created_at`, `updated_at`

#### 7.1.11 Activities Table

**Purpose:** Extracurricular activities and participation

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `activity_name` (VARCHAR)
- `activity_type` (ENUM) - Sports, Cultural, Academic, Club, Community Service
- `academic_year_id` (UUID, FK)
- `participation_level` (ENUM) - Member, Captain, Leader
- `start_date` (DATE)
- `end_date` (DATE)
- `hours_completed` (DECIMAL) - For community service
- `created_at`, `updated_at`

#### 7.1.12 Achievements Table

**Purpose:** Student awards, recognitions, and achievements

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `achievement_type` (ENUM) - Academic, Sports, Cultural, Leadership, Community Service
- `achievement_name` (VARCHAR)
- `description` (TEXT)
- `level` (ENUM) - School, District, State, National, International
- `rank_position` (VARCHAR) - 1st Place, Gold Medal, etc.
- `achievement_date` (DATE)
- `certificate_url` (VARCHAR) - S3 URL
- `created_at`, `updated_at`

#### 7.1.13 Certificates Table

**Purpose:** Generated certificates (TC, bonafide, character)

**Columns:**
- `id` (UUID, PK)
- `student_id` (UUID, FK)
- `certificate_type` (ENUM) - Transfer Certificate, Bonafide, Character, Conduct
- `certificate_number` (VARCHAR, UNIQUE)
- `issue_date` (DATE)
- `purpose` (VARCHAR) - Reason for certificate
- `file_path` (VARCHAR) - S3 URL for PDF
- `blockchain_hash` (VARCHAR) - Verification hash
- `status` (ENUM) - Draft, Pending Approval, Approved, Issued
- `approved_by` (UUID, FK) - Principal/Admin
- `approved_at` (TIMESTAMP)
- `digital_signature` (TEXT)
- `created_by` (UUID, FK)
- `created_at`, `updated_at`

#### 7.1.14 Audit Logs Table

**Purpose:** Complete audit trail for all data changes

**Columns:**
- `id` (UUID, PK)
- `table_name` (VARCHAR) - Table that was modified
- `record_id` (UUID) - ID of the modified record
- `action` (ENUM) - CREATE, UPDATE, DELETE
- `old_values` (JSONB) - Previous values (for UPDATE/DELETE)
- `new_values` (JSONB) - New values (for CREATE/UPDATE)
- `changed_by` (UUID, FK) - User who made the change
- `changed_at` (TIMESTAMP)
- `ip_address` (VARCHAR)
- `user_agent` (VARCHAR)

### 7.2 Reference Tables

#### Classes, Sections, Houses
- `classes` - Class definitions (Pre-KG, KG, Class 1-12)
- `sections` - Section definitions (A, B, C, etc.)
- `houses` - House system (Red, Blue, Green, Yellow)

#### Academic Structure
- `academic_years` - Academic year definitions (2024-25, 2025-26)
- `terms` - Term definitions (Term 1, Term 2, Annual)
- `subjects` - Subject definitions (Math, Science, English, etc.)

---

## 8. API Endpoints

### 8.1 Authentication Endpoints

**Base URL:** `/api/v1/auth`

- `POST /auth/register` - User registration
  - Request: `{ email, password, name, role }`
  - Response: `{ user, access_token, refresh_token }`

- `POST /auth/login` - User login
  - Request: `{ email, password }`
  - Response: `{ user, access_token, refresh_token }`

- `POST /auth/refresh` - Refresh access token
  - Request: `{ refresh_token }`
  - Response: `{ access_token }`

- `POST /auth/logout` - User logout
  - Request: `{ refresh_token }`
  - Response: `{ message }`

- `POST /auth/forgot-password` - Request password reset
  - Request: `{ email }`
  - Response: `{ message }`

- `POST /auth/reset-password` - Reset password
  - Request: `{ token, new_password }`
  - Response: `{ message }`

### 8.2 Student Endpoints

**Base URL:** `/api/v1/students`

**CRUD Operations:**
- `POST /students` - Create new student
  - Auth: Required (admin, registrar)
  - Request: `StudentCreate` schema
  - Response: `StudentResponse` schema (201 Created)

- `GET /students` - List students with pagination and filters
  - Auth: Required (admin, teacher)
  - Query Params: `page`, `per_page`, `search`, `class_id`, `section_id`, `status`
  - Response: `{ data: StudentResponse[], total: number, page: number, per_page: number }`

- `GET /students/{id}` - Get student details
  - Auth: Required (admin, teacher, parent - own child only)
  - Response: `StudentResponse` with related data (parents, addresses, documents)

- `PUT /students/{id}` - Update student
  - Auth: Required (admin, registrar)
  - Request: `StudentUpdate` schema
  - Response: `StudentResponse`

- `DELETE /students/{id}` - Soft delete student
  - Auth: Required (admin only)
  - Response: `{ message: "Student deleted successfully" }`

**Search & Filter:**
- `GET /students/search` - Advanced search with Elasticsearch
  - Query Params: `q` (search term), `filters` (JSON object)
  - Response: `StudentResponse[]` with relevance scores

**Bulk Operations:**
- `POST /students/bulk-import` - Import students from Excel
  - Auth: Required (admin)
  - Request: Multipart form with Excel file
  - Response: `{ success: number, failed: number, errors: [] }`

- `GET /students/bulk-export` - Export students to Excel
  - Auth: Required (admin, registrar)
  - Query Params: `class_id`, `section_id`, `status`
  - Response: Excel file download

**Promotion & Transfer:**
- `POST /students/bulk-promote` - Promote students to next class
  - Auth: Required (admin)
  - Request: `{ student_ids: [], new_class_id: UUID }`
  - Response: `{ success: number, failed: number }`

- `POST /students/{id}/transfer` - Initiate student transfer
  - Auth: Required (admin)
  - Request: `{ transfer_date: Date, reason: string }`
  - Response: `{ transfer_certificate_id: UUID }`

### 8.3 Parent Endpoints

**Base URL:** `/api/v1/parents`

- `POST /parents` - Create parent/guardian
  - Request: `ParentCreate` schema
  - Response: `ParentResponse`

- `GET /parents/{id}` - Get parent details
  - Response: `ParentResponse` with related students

- `PUT /parents/{id}` - Update parent information
  - Request: `ParentUpdate` schema
  - Response: `ParentResponse`

- `POST /students/{student_id}/parents` - Link parent to student
  - Request: `{ parent_id: UUID, relationship_type: string }`
  - Response: `{ message: "Parent linked successfully" }`

- `DELETE /students/{student_id}/parents/{parent_id}` - Unlink parent
  - Response: `{ message: "Parent unlinked successfully" }`

- `GET /students/{student_id}/parents` - Get all parents for a student
  - Response: `ParentResponse[]`

### 8.4 Document Endpoints

**Base URL:** `/api/v1/documents`

- `POST /students/{student_id}/documents` - Upload document
  - Request: Multipart form with file
  - Response: `{ document_id: UUID, file_url: string }`

- `GET /students/{student_id}/documents` - List student documents
  - Query Params: `document_type`, `category`
  - Response: `DocumentResponse[]`

- `GET /documents/{id}` - Get document metadata
  - Response: `DocumentResponse`

- `GET /documents/{id}/download` - Download document
  - Response: File download (with signed S3 URL)

- `DELETE /documents/{id}` - Delete document
  - Response: `{ message: "Document deleted successfully" }`

### 8.5 Academic Endpoints

**Base URL:** `/api/v1/academic`

**Grade Management:**
- `POST /students/{student_id}/grades` - Add grade record
  - Request: `{ subject_id, term_id, marks_obtained, max_marks, grade }`
  - Response: `GradeResponse`

- `GET /students/{student_id}/grades` - Get student grades
  - Query Params: `academic_year_id`, `term_id`, `subject_id`
  - Response: `GradeResponse[]`

- `GET /students/{student_id}/academic-summary` - Academic performance summary
  - Query Params: `academic_year_id`
  - Response: `{ average_percentage, rank, gpa, subject_wise_summary }`

**Transcripts & Reports:**
- `GET /students/{student_id}/transcript` - Generate academic transcript
  - Response: PDF file download

- `GET /students/{student_id}/report-card` - Generate report card
  - Query Params: `term_id`
  - Response: PDF file download

- `POST /classes/{class_id}/report-cards` - Bulk generate report cards
  - Request: `{ term_id, section_id }`
  - Response: `{ generated_count: number, file_urls: [] }`

**Performance Analytics:**
- `GET /students/{student_id}/performance-trends` - Performance trend analysis
  - Query Params: `from_date`, `to_date`
  - Response: `{ trends: [], predictions: [] }`

- `GET /students/{student_id}/rank` - Class rank and percentile
  - Query Params: `term_id`
  - Response: `{ rank, total_students, percentile }`

### 8.6 Attendance Endpoints

**Base URL:** `/api/v1/attendance`

- `POST /attendance/sync` - Sync attendance records from attendance module
  - Request: `{ date, records: [{ student_id, status, session }] }`
  - Response: `{ synced_count: number }`

- `GET /students/{student_id}/attendance` - Get student attendance
  - Query Params: `from_date`, `to_date`
  - Response: `AttendanceResponse[]`

- `GET /students/{student_id}/attendance/summary` - Attendance summary
  - Query Params: `month`, `term_id`, `year`
  - Response: `{ total_days, present_days, absent_days, percentage }`

- `GET /students/{student_id}/attendance/analytics` - Attendance analytics
  - Response: `{ monthly_trends, attendance_pattern, alerts }`

### 8.7 Medical Endpoints

**Base URL:** `/api/v1/medical`

- `POST /students/{student_id}/medical-records` - Add medical record
  - Request: `{ record_type, condition_name, description, severity, medication_name }`
  - Response: `MedicalRecordResponse`

- `GET /students/{student_id}/medical-records` - Get medical records
  - Query Params: `record_type`
  - Response: `MedicalRecordResponse[]`

- `GET /students/{student_id}/emergency-medical-info` - Get emergency medical info
  - Response: `{ blood_group, allergies, medications, emergency_contacts }`

- `PUT /medical-records/{id}` - Update medical record
  - Request: `MedicalRecordUpdate`
  - Response: `MedicalRecordResponse`

### 8.8 Behavioral Endpoints

**Base URL:** `/api/v1/behavioral`

- `POST /students/{student_id}/incidents` - Report behavioral incident
  - Request: `{ incident_type, incident_date, description, severity, action_taken }`
  - Response: `BehavioralIncidentResponse`

- `GET /students/{student_id}/incidents` - Get behavioral incidents
  - Query Params: `from_date`, `to_date`, `incident_type`
  - Response: `BehavioralIncidentResponse[]`

- `PUT /incidents/{id}` - Update incident (add follow-up)
  - Request: `{ action_taken, resolution_status, parent_notified }`
  - Response: `BehavioralIncidentResponse`

- `POST /students/{student_id}/counseling` - Add counseling session
  - Request: `{ session_date, counselor_id, notes, follow_up_date }`
  - Response: `CounselingSessionResponse`

### 8.9 Activities & Achievements

**Base URL:** `/api/v1/activities`

- `POST /activities` - Create activity
  - Request: `{ activity_name, activity_type, academic_year_id }`
  - Response: `ActivityResponse`

- `POST /students/{student_id}/activities` - Register student for activity
  - Request: `{ activity_id, participation_level }`
  - Response: `{ message: "Student registered for activity" }`

- `GET /students/{student_id}/activities` - Get student activities
  - Response: `StudentActivityResponse[]`

- `POST /students/{student_id}/achievements` - Add achievement
  - Request: `{ achievement_type, achievement_name, level, rank_position }`
  - Response: `AchievementResponse`

- `GET /students/{student_id}/achievements` - Get student achievements
  - Response: `AchievementResponse[]`

- `GET /students/{student_id}/portfolio` - Generate digital portfolio
  - Response: JSON or PDF with all achievements, activities, certificates

### 8.10 Certificate Endpoints

**Base URL:** `/api/v1/certificates`

- `POST /students/{student_id}/certificates/transfer` - Generate transfer certificate
  - Request: `{ purpose, issue_date }`
  - Response: `{ certificate_id, file_url, certificate_number }`

- `POST /students/{student_id}/certificates/bonafide` - Generate bonafide certificate
  - Request: `{ purpose }`
  - Response: `{ certificate_id, file_url }`

- `POST /students/{student_id}/certificates/character` - Generate character certificate
  - Request: `{ purpose }`
  - Response: `{ certificate_id, file_url }`

- `GET /certificates/{id}` - Get certificate details
  - Response: `CertificateResponse`

- `GET /certificates/{id}/download` - Download certificate PDF
  - Response: PDF file download

- `GET /certificates/verify/{certificate_number}` - Verify certificate authenticity
  - Response: `{ valid: boolean, student_name, issue_date, blockchain_hash }`

- `PUT /certificates/{id}/approve` - Approve certificate (admin/principal)
  - Response: `{ message: "Certificate approved" }`

### 8.11 Analytics Endpoints

**Base URL:** `/api/v1/analytics`

- `GET /analytics/at-risk-students` - Get list of at-risk students
  - Query Params: `class_id`, `risk_level`
  - Response: `{ students: [], risk_factors: [] }`

- `POST /analytics/predict-risk` - Predict student risk level (ML model)
  - Request: `{ student_id }`
  - Response: `{ risk_level, probability, factors: [] }`

- `GET /analytics/school-dashboard` - School-wide analytics dashboard
  - Response: `{ total_students, attendance_avg, performance_avg, at_risk_count }`

- `GET /analytics/class-performance` - Class performance comparison
  - Query Params: `academic_year_id`, `term_id`
  - Response: `{ class_wise_data: [] }`

### 8.12 Integration Endpoints

**Base URL:** `/api/v1/integrations`

**Admission System Integration:**
- `POST /integrations/admission/create-student` - Create student from admission
  - Request: `{ admission_id, student, parents, documents, addresses }`
  - Response: `{ student_id, message }`

**Attendance Module Integration:**
- `POST /integrations/attendance/sync` - Sync attendance data
  - Request: `{ date, records: [] }`
  - Response: `{ synced_count, errors: [] }`

**Grade Module Integration:**
- `POST /integrations/grades/sync` - Sync grade data
  - Request: `{ academic_year_id, term_id, records: [] }`
  - Response: `{ synced_count, errors: [] }`

**Fee Module Integration:**
- `GET /integrations/fees/student-status` - Get student fee status
  - Query Params: `student_id`
  - Response: `{ total_fee, paid, due, status }`

---

## 9. Development Workflow

### 9.1 Setting Up Development Environment

**Prerequisites:**
- Python 3.11+ installed
- Node.js 20+ installed
- PostgreSQL 15+ installed
- Redis 7+ installed
- Git installed
- Docker & Docker Compose (optional, but recommended)

**Step 1: Clone Repository**
```bash
git clone https://github.com/sparked/student-information-system.git
cd student-information-system
```

**Step 2: Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials, Redis URL, AWS keys, etc.

# Run database migrations
alembic upgrade head

# Seed database with initial data (classes, sections, etc.)
python scripts/seed_database.py

# Start backend server
python -m app.main
```

Backend will run at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

**Step 3: Frontend Setup**
```bash
cd frontend/web-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with backend API URL (http://localhost:8000)

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

**Step 4: Alternative - Docker Setup**
```bash
# From project root
docker-compose up -d

# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### 9.2 Git Workflow

**Branch Strategy:**
- `main` - Production-ready code (protected)
- `develop` - Integration branch for features (protected)
- `feature/*` - Feature branches (e.g., `feature/student-profile`)
- `bugfix/*` - Bug fix branches
- `release/*` - Release preparation branches

**Workflow:**
1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch and create Pull Request
4. Code review and approval
5. Merge to `develop`
6. Deploy to staging for testing
7. Create release branch for production deployment

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example:**
```
feat(students): add student profile creation endpoint

- Implement POST /api/v1/students endpoint
- Add validation for required fields
- Create student profile in database
- Return created student with 201 status

Closes #123
```

### 9.3 Running Tests

**Backend Tests:**
```bash
cd backend

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/unit/test_models.py

# Run tests matching pattern
pytest -k "test_create"

# Run integration tests only
pytest app/tests/integration/
```

**Frontend Tests:**
```bash
cd frontend/web-app

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test StudentForm.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### 9.4 Database Migrations

**Create New Migration:**
```bash
cd backend

# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add medical_records table"

# Manually create empty migration
alembic revision -m "Add custom index"
```

**Apply Migrations:**
```bash
# Upgrade to latest migration
alembic upgrade head

# Upgrade one version
alembic upgrade +1

# Downgrade one version
alembic downgrade -1

# Show current migration version
alembic current

# Show migration history
alembic history
```

### 9.5 Debugging

**Backend Debugging:**
- Use FastAPI's auto-generated Swagger UI at `/docs` to test endpoints
- Add breakpoints in VS Code with Python debugger
- Use `print()` or `logging` module for debug output
- Check logs in terminal where server is running
- Use Postman/Insomnia for API testing

**Frontend Debugging:**
- Use React Developer Tools browser extension
- Use Redux DevTools for state inspection
- Check browser console for errors
- Use VS Code debugger with Chrome DevTools
- Network tab in DevTools for API call inspection

**Database Debugging:**
```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d sis_db

# View tables
\dt

# Describe table structure
\d students

# Run queries
SELECT * FROM students WHERE student_status = 'Active';
```

---

## 10. Testing Guidelines

### 10.1 Backend Testing Strategy

**Test Pyramid:**
- **Unit Tests (70%):** Test individual functions and methods
- **Integration Tests (20%):** Test API endpoints with database
- **E2E Tests (10%):** Test complete user workflows

**Unit Tests (`app/tests/unit/`):**
- Test model methods
- Test service functions
- Test utility functions
- Mock external dependencies (database, S3, Redis)

**Example Unit Test:**
```python
# app/tests/unit/test_services.py
import pytest
from app.services.student_service import calculate_attendance_percentage

def test_calculate_attendance_percentage():
    total_days = 100
    present_days = 90
    expected = 90.0

    result = calculate_attendance_percentage(present_days, total_days)

    assert result == expected

def test_calculate_attendance_percentage_zero_days():
    result = calculate_attendance_percentage(0, 0)
    assert result == 0.0
```

**Integration Tests (`app/tests/integration/`):**
- Test API endpoints with test database
- Test database operations
- Test authentication and authorization
- Use pytest fixtures for test data

**Example Integration Test:**
```python
# app/tests/integration/test_student_api.py
import pytest
from fastapi.testclient import TestClient

def test_create_student(client, db_session, auth_token):
    payload = {
        "admission_number": "STU2025001",
        "first_name": "Rahul",
        "last_name": "Sharma",
        "date_of_birth": "2010-05-15",
        "gender": "Male"
    }

    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/v1/students", json=payload, headers=headers)

    assert response.status_code == 201
    assert response.json()["data"]["first_name"] == "Rahul"
    assert response.json()["data"]["admission_number"] == "STU2025001"

def test_create_student_invalid_data(client, auth_token):
    payload = {
        "first_name": "Rahul",
        # Missing required fields
    }

    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/v1/students", json=payload, headers=headers)

    assert response.status_code == 422
    assert "errors" in response.json()
```

**Running Backend Tests:**
```bash
# Run all tests with coverage
pytest --cov=app --cov-report=html

# Open coverage report in browser
# Open htmlcov/index.html
```

**Coverage Goals:**
- Backend: 90%+ coverage
- Critical paths: 100% coverage (authentication, data validation, payment)

### 10.2 Frontend Testing Strategy

**Test Types:**
- **Component Tests:** Test individual components in isolation
- **Integration Tests:** Test component interactions
- **E2E Tests:** Test complete user flows (with Cypress)

**Component Tests (`src/**/*.test.tsx`):**
- Test component rendering
- Test user interactions (clicks, input, form submission)
- Test state changes
- Mock API calls

**Example Component Test:**
```tsx
// src/components/student/StudentForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentForm from './StudentForm';

test('renders student form with all fields', () => {
  render(<StudentForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

  expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
});

test('submits form with valid data', async () => {
  const onSubmit = jest.fn();
  render(<StudentForm onSubmit={onSubmit} onCancel={jest.fn()} />);

  fireEvent.change(screen.getByLabelText(/first name/i), {
    target: { value: 'Rahul' }
  });
  fireEvent.change(screen.getByLabelText(/last name/i), {
    target: { value: 'Sharma' }
  });
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      first_name: 'Rahul',
      last_name: 'Sharma',
      // ...
    });
  });
});

test('shows validation errors for empty required fields', async () => {
  render(<StudentForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
  });
});
```

**Running Frontend Tests:**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

**Coverage Goals:**
- Frontend: 70%+ coverage
- Critical components: 80%+ coverage (forms, authentication, payment)

### 10.3 E2E Testing (Phase 5)

**Tool:** Cypress

**Example E2E Test:**
```javascript
// cypress/e2e/student-management.cy.js
describe('Student Management', () => {
  beforeEach(() => {
    cy.login('admin@school.com', 'admin123');
    cy.visit('/admin/students');
  });

  it('creates a new student profile', () => {
    cy.contains('Add Student').click();

    cy.get('[name="first_name"]').type('Rahul');
    cy.get('[name="last_name"]').type('Sharma');
    cy.get('[name="date_of_birth"]').type('2010-05-15');
    cy.get('[name="gender"]').select('Male');

    cy.contains('Submit').click();

    cy.contains('Student created successfully').should('be.visible');
    cy.contains('Rahul Sharma').should('be.visible');
  });

  it('searches for students', () => {
    cy.get('[placeholder="Search students"]').type('Rahul');

    cy.contains('Rahul Sharma').should('be.visible');
  });
});
```

---

## 11. Deployment Process

### 11.1 Environments

**Development:**
- Local development on laptops
- Database: Local PostgreSQL
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

**Staging:**
- Pre-production testing environment
- Database: AWS RDS PostgreSQL (separate from production)
- Backend: https://staging-api.sis.sparked.in
- Frontend: https://staging.sis.sparked.in

**Production:**
- Live environment serving real users
- Database: AWS RDS PostgreSQL (Multi-AZ, read replicas)
- Backend: https://api.sis.sparked.in
- Frontend: https://sis.sparked.in

### 11.2 Deployment Checklist

**Pre-Deployment:**
- ✅ All tests passing (unit, integration, E2E)
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ Database migrations prepared and tested
- ✅ Environment variables configured
- ✅ Backup of production database taken
- ✅ Rollback plan documented

**Deployment Steps:**
1. Run database migrations on production
2. Build Docker images for backend and frontend
3. Push images to container registry (AWS ECR)
4. Update Kubernetes deployments
5. Run smoke tests
6. Monitor error rates and performance

**Post-Deployment:**
- ✅ Smoke tests passed
- ✅ Error rates normal (<0.1%)
- ✅ API response times acceptable (<500ms)
- ✅ No user-reported issues in first hour
- ✅ Monitoring dashboards checked

### 11.3 CI/CD Pipeline

**GitHub Actions Workflow:**

**Backend CI:**
```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

**Frontend CI:**
```yaml
# .github/workflows/frontend-ci.yml
name: Frontend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend/web-app
          npm ci

      - name: Run tests
        run: |
          cd frontend/web-app
          npm run test

      - name: Build
        run: |
          cd frontend/web-app
          npm run build
```

### 11.4 Rollback Procedure

**If critical issues found after deployment:**

**Step 1: Identify Issue**
- Check error logs in Sentry
- Check monitoring dashboards (Grafana)
- Review user reports

**Step 2: Decide on Rollback**
- Critical bug affecting core functionality → Rollback immediately
- Minor bug with workaround → Fix forward in next release
- Performance degradation → Investigate and optimize

**Step 3: Execute Rollback**
```bash
# Rollback backend (Kubernetes)
kubectl rollout undo deployment/sis-backend -n sis-production

# Rollback frontend
kubectl rollout undo deployment/sis-frontend -n sis-production

# Rollback database (if needed - last resort)
# Restore from last hourly backup
pg_restore --clean --dbname=sis_production backup_2025_10_13_14h.dump

# Verify rollback
kubectl get pods -n sis-production
```

**Step 4: Post-Rollback**
- Verify system is functioning correctly
- Notify team and stakeholders
- Investigate root cause
- Fix issue and prepare hotfix release

---

## 12. Common Tasks

### 12.1 Adding a New API Endpoint

**Step 1: Create Pydantic Schema**
```python
# backend/app/schemas/student.py
class StudentSearch(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
```

**Step 2: Implement Service Function**
```python
# backend/app/services/student_service.py
def search_students(db: Session, query: str, filters: Dict):
    # Elasticsearch search logic
    results = elasticsearch_client.search(
        index="students",
        body={
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["first_name", "last_name", "admission_number"]
                }
            }
        }
    )
    return results
```

**Step 3: Create API Route**
```python
# backend/app/api/v1/students.py
@router.get("/students/search")
def search_students_endpoint(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    results = student_service.search_students(db, q, {})
    return {"data": results}
```

**Step 4: Write Tests**
```python
# backend/app/tests/integration/test_student_api.py
def test_search_students(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/v1/students/search?q=Rahul", headers=headers)

    assert response.status_code == 200
    assert len(response.json()["data"]) > 0
```

### 12.2 Adding a New Database Table

**Step 1: Create SQLAlchemy Model**
```python
# backend/app/models/counseling_session.py
from sqlalchemy import Column, String, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class CounselingSession(Base):
    __tablename__ = "counseling_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id'))
    counselor_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    session_date = Column(Date, nullable=False)
    notes = Column(Text)
    follow_up_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

**Step 2: Create Database Migration**
```bash
# Auto-generate migration from model
alembic revision --autogenerate -m "Add counseling_sessions table"

# Review generated migration in alembic/versions/
# Edit if needed (add indexes, constraints, etc.)

# Apply migration
alembic upgrade head
```

**Step 3: Create Pydantic Schemas**
```python
# backend/app/schemas/counseling.py
class CounselingSessionCreate(BaseModel):
    student_id: UUID
    session_date: date
    notes: str
    follow_up_date: Optional[date] = None

class CounselingSessionResponse(BaseModel):
    id: UUID
    student_id: UUID
    counselor_id: UUID
    session_date: date
    notes: str
    follow_up_date: Optional[date]
    created_at: datetime

    class Config:
        orm_mode = True
```

### 12.3 Adding a New Frontend Component

**Step 1: Create Component File**
```tsx
// frontend/web-app/src/components/counseling/CounselingSessionForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Grid } from '@mui/material';

interface CounselingSessionFormProps {
  studentId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function CounselingSessionForm({
  studentId,
  onSubmit,
  onCancel
}: CounselingSessionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...register('session_date', { required: true })}
            label="Session Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('notes', { required: true })}
            label="Session Notes"
            multiline
            rows={4}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained">Submit</Button>
          <Button onClick={onCancel} variant="outlined">Cancel</Button>
        </Grid>
      </Grid>
    </form>
  );
}
```

**Step 2: Create Component Test**
```tsx
// frontend/web-app/src/components/counseling/CounselingSessionForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CounselingSessionForm from './CounselingSessionForm';

test('renders counseling session form', () => {
  render(
    <CounselingSessionForm
      studentId="123"
      onSubmit={jest.fn()}
      onCancel={jest.fn()}
    />
  );

  expect(screen.getByLabelText(/session date/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/session notes/i)).toBeInTheDocument();
});
```

### 12.4 Debugging Common Issues

**Issue: Database Connection Error**
```
Error: could not connect to server: Connection refused
```

**Solution:**
- Check PostgreSQL is running: `sudo service postgresql status`
- Check connection parameters in `.env` file
- Verify database exists: `psql -l`
- Create database if missing: `createdb sis_db`

**Issue: JWT Token Invalid**
```
Error: 401 Unauthorized - Invalid token
```

**Solution:**
- Check token expiry (access tokens expire after 1 hour)
- Use refresh token to get new access token
- Check `SECRET_KEY` in `.env` matches between backend and frontend
- Verify Authorization header format: `Bearer <token>`

**Issue: CORS Error in Frontend**
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solution:**
- Check CORS middleware in `backend/app/main.py`
- Verify frontend URL is in `allow_origins` list
- For development, add `http://localhost:5173` to allowed origins

**Issue: Slow API Response**
```
API endpoint taking >2 seconds to respond
```

**Solution:**
- Check database queries with `EXPLAIN ANALYZE`
- Add indexes on frequently queried columns
- Implement caching with Redis
- Use database query optimization (select only needed columns)
- Add pagination for large result sets

---

## 13. Troubleshooting

### 13.1 Backend Issues

**Problem: Alembic migration fails**

**Symptoms:**
```
ERROR: relation "students" already exists
```

**Solutions:**
1. Check current migration version: `alembic current`
2. Check migration history: `alembic history`
3. Stamp database at current version: `alembic stamp head`
4. Or drop and recreate database (development only):
   ```bash
   dropdb sis_db
   createdb sis_db
   alembic upgrade head
   ```

**Problem: S3 upload fails**

**Symptoms:**
```
Error: Could not upload file to S3
```

**Solutions:**
1. Check AWS credentials in `.env` file
2. Verify S3 bucket exists and is accessible
3. Check IAM permissions for S3 PutObject
4. Verify bucket CORS configuration

**Problem: Elasticsearch not indexing**

**Symptoms:**
- Search returns no results
- Indexing errors in logs

**Solutions:**
1. Check Elasticsearch is running: `curl http://localhost:9200`
2. Verify index exists: `curl http://localhost:9200/students`
3. Recreate index: `python scripts/recreate_es_index.py`
4. Reindex all students: `python scripts/reindex_students.py`

### 13.2 Frontend Issues

**Problem: Page not loading**

**Symptoms:**
- Blank screen
- Loading spinner forever

**Solutions:**
1. Check browser console for errors
2. Check Redux DevTools for state issues
3. Verify API endpoint is responding (Network tab)
4. Check if authentication token is valid
5. Clear browser cache and reload

**Problem: Form submission fails**

**Symptoms:**
- Form submit button not working
- Validation errors not showing

**Solutions:**
1. Check form validation schema (Yup)
2. Verify API endpoint is correct
3. Check request payload format
4. Look for CORS errors in console
5. Check React Hook Form errors: `console.log(errors)`

**Problem: Slow page load**

**Symptoms:**
- Page takes >5 seconds to load
- Images loading slowly

**Solutions:**
1. Implement lazy loading for components
2. Use code splitting with React.lazy()
3. Optimize images (compress, resize, use WebP)
4. Implement pagination for large lists
5. Add loading skeletons for better UX

### 13.3 Database Issues

**Problem: Query timeout**

**Symptoms:**
```
Error: Query execution time exceeded 30 seconds
```

**Solutions:**
1. Add indexes on queried columns
2. Optimize query with EXPLAIN ANALYZE
3. Use database connection pooling (PgBouncer)
4. Add pagination to large result sets
5. Implement caching for frequently accessed data

**Problem: Deadlock detected**

**Symptoms:**
```
ERROR: deadlock detected
```

**Solutions:**
1. Review transaction isolation level
2. Keep transactions short
3. Access tables in consistent order
4. Use row-level locking sparingly
5. Implement retry logic for deadlock errors

### 13.4 Performance Issues

**Problem: High memory usage**

**Symptoms:**
- Server crashes with out of memory error
- Slow response times

**Solutions:**
1. Implement pagination for large datasets
2. Use streaming for file uploads/downloads
3. Clear unused variables and close connections
4. Optimize database queries (select only needed columns)
5. Implement proper garbage collection

**Problem: High CPU usage**

**Symptoms:**
- Server CPU at 100%
- Slow API responses

**Solutions:**
1. Profile code to find bottlenecks
2. Optimize expensive algorithms
3. Implement caching for computed results
4. Use async processing for heavy tasks (Celery)
5. Scale horizontally with more servers

---

## 14. Integration Points

### 14.1 Internal Module Integrations

**Admission System Integration:**
- **Direction:** Admission → SIS (one-way)
- **Trigger:** Student enrollment confirmed
- **Data:** Student profile, parent info, documents, addresses
- **Endpoint:** `POST /api/v1/integrations/admission/create-student`
- **Implementation:** Webhook from admission system on enrollment

**Attendance Management Integration:**
- **Direction:** Bi-directional
- **Trigger:** Real-time attendance marking
- **Data:** Daily attendance records
- **Sync Frequency:** Every 15 minutes
- **Endpoints:**
  - `POST /api/v1/integrations/attendance/sync` (Attendance → SIS)
  - `GET /api/v1/integrations/attendance/students` (SIS → Attendance)

**Grade Management Integration:**
- **Direction:** Bi-directional
- **Trigger:** Grade entry/update
- **Data:** Exam scores, assessments, grades
- **Sync Frequency:** Real-time
- **Endpoints:**
  - `POST /api/v1/integrations/grades/sync` (Grades → SIS)
  - `GET /api/v1/integrations/grades/students` (SIS → Grades)

**Fee Management Integration:**
- **Direction:** Bi-directional
- **Trigger:** Fee payment, status update
- **Data:** Fee structure, payment history, dues
- **Endpoints:**
  - `GET /api/v1/integrations/fees/student-status` (SIS → Fees)
  - Webhook for fee status updates (Fees → SIS)

### 14.2 External System Integrations

**CBSE Portal Integration:**
- **Purpose:** Submit List of Candidates (LOC) for board exams
- **Method:** File upload (Excel)
- **Frequency:** Annual (September for Class X/XII)
- **Implementation:** Generate Excel in CBSE format, manual upload

**ICSE Portal Integration:**
- **Purpose:** Submit enrollment data
- **Method:** Excel upload
- **Frequency:** Annual (May for Class X)

**UDISE+ Integration:**
- **Purpose:** Annual school and student data submission
- **Method:** XML/Excel upload
- **Frequency:** Annual (August)
- **Implementation:** Generate UDISE+-compliant XML/Excel

**SMS Gateway (MSG91):**
- **Purpose:** Send SMS notifications
- **Use Cases:** Attendance alerts, OTPs, emergency notifications
- **API:** https://api.msg91.com/api/v5/flow/
- **Rate Limit:** 100 SMS/second

**Email Service (SendGrid):**
- **Purpose:** Send email notifications
- **Use Cases:** Welcome emails, grade notifications, reports
- **API:** https://api.sendgrid.com/v3/mail/send
- **Templates:** Use SendGrid dynamic templates

---

## 15. Security & Compliance

### 15.1 Security Measures

**Authentication:**
- JWT-based authentication with access/refresh tokens
- Access token expiry: 1 hour
- Refresh token expiry: 7 days
- Bcrypt password hashing (cost factor: 12)
- Multi-factor authentication (MFA) for admin accounts

**Authorization:**
- Role-based access control (RBAC)
- Roles: Admin, Registrar, Teacher, Parent, Student
- Permission-based access to resources
- Row-level security (parents can only view own children)

**Data Encryption:**
- Encryption at rest: AES-256 for database and S3
- Encryption in transit: TLS 1.3 for all API calls
- Field-level encryption for sensitive data (Aadhaar, medical records)

**API Security:**
- Rate limiting (10-500 requests/minute based on role)
- CORS configuration with allowed origins
- CSRF protection with tokens
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)

**Session Management:**
- Redis-based session storage
- Session timeout after 1 hour of inactivity
- Secure, HttpOnly cookies
- IP-based session validation

### 15.2 Compliance Requirements

**GDPR (General Data Protection Regulation):**
- Data minimization (collect only necessary data)
- Purpose limitation (use data only for stated purpose)
- Right to access (users can request their data)
- Right to erasure (users can request data deletion)
- Data breach notification (within 72 hours)

**COPPA (Children's Online Privacy Protection Act):**
- Parental consent for minors (<13 years)
- Clear privacy policy
- Secure data handling
- No marketing to children

**Indian Personal Data Protection Bill:**
- Data localization requirements
- Parental consent for minors (<18 years)
- Data breach notification
- Penalties up to ₹250 crore for violations

**FERPA (Family Educational Rights and Privacy Act):**
- Student education records privacy
- Parental access to records
- School control over information disclosure

### 15.3 Audit Logging

**What to Log:**
- All data access (view, create, update, delete)
- Authentication events (login, logout, failed login)
- Authorization failures (unauthorized access attempts)
- Data exports (bulk downloads, Excel exports)
- Configuration changes (system settings, user roles)

**Log Format:**
```json
{
  "timestamp": "2025-10-13T14:23:45Z",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "action": "UPDATE",
  "table_name": "students",
  "record_id": "456e7890-e89b-12d3-a456-426614174001",
  "old_values": {"first_name": "Rahul"},
  "new_values": {"first_name": "Ravi"},
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

**Log Storage:**
- Database: `audit_logs` table
- Elasticsearch: For searchable logs
- AWS CloudWatch: For infrastructure logs
- Retention: 7 years minimum (compliance requirement)

---

**Document Version:** 1.0.0
**Last Updated:** October 13, 2025
**Total Pages:** ~30 pages
**Status:** Living Document - Updated as project evolves

---

*This is a comprehensive guide for Claude AI to understand the Student Information System project context, architecture, and development workflows. For quick start instructions, see QUICKSTART.md. For development tasks, see TODO.md.*