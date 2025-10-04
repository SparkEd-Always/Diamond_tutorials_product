# Tutorial Management System - Complete Development Context

## Project Overview

**Client**: Tutorial Institution with 77 students (Classes 7-10) and 5 teachers
**Pricing**: ₹29 per student per month (subject to negotiation)
**Goal**: Self-service app - zero maintenance calls after deployment

## Key Requirements

### Core Problems to Solve
1. **Attendance Management** (Student + Teacher)
2. **Student Profile Management**
3. **Messaging** (Individual + Bulk to parents)
4. **Teacher Attendance Tracking**

### Platform Requirements
- **Mobile App**: Android (Play Store ready)
- **Web Application**: Desktop admin interface
- **Both platforms**: Demo-ready with dummy data

### User Access & RBAC
- **2 Full Admins**: Complete system access
- **5 Teachers**: Limited access for student attendance marking
- **Role-Based Access Control**: Admin-controlled permissions per role
- **Parents**: View-only access to their child's data
- **Students**: Limited access to their own records

### Unique ID System
- **Format**: AVM-[TYPE]-[NUMBER]
- **Examples**: 
  - Students: AVM-STU-001 to AVM-STU-077
  - Teachers: AVM-TCH-001 to AVM-TCH-005
  - Admins: AVM-ADM-001, AVM-ADM-002

## Features Specification

### 1. Student Records Management
**User Story**: As a school admin/teacher, I want to record, update, and maintain accurate student records (attendance, grades, certificates) so that the school has a reliable history of each student's academic journey.

**Key Features**:
- Daily attendance tracking with mobile app for teachers
- Grade management and automated report card generation
- Digital certificate generation (bonafide, transfer, completion)
- Parent portal for real-time access to attendance & grades
- Analytics dashboards to identify at-risk students

**Acceptance Criteria**:
- ✅ Teachers can mark attendance digitally within minutes
- ✅ Parents receive absence notifications instantly
- ✅ Grades entered once → automatically reflected in report cards
- ✅ Certificates auto-generated using stored student data
- ✅ System supports multiple grading schemes
- ✅ Records are secure, searchable, and exportable

### 2. Notices & Announcements
**User Story**: As a school admin/teacher, I want to publish and distribute notices & announcements digitally, so that students, parents, and staff receive timely, consistent, and reliable communication.

**Key Features**:
- Centralized digital notice board (web & mobile)
- Multi-channel distribution (app, SMS, email, WhatsApp)
- Read receipts and acknowledgment tracking
- Role-based targeting (specific grades, staff, parents)
- Scheduled announcements (auto-publish at set times)
- Analytics on engagement & reach

**Acceptance Criteria**:
- ✅ Admin/teachers can draft notices with attachments
- ✅ Notices can be targeted to specific groups
- ✅ Multi-channel distribution supported
- ✅ Parents/students notified instantly
- ✅ Acknowledgment tracking for critical notices
- ✅ Notices archived with search/filter options
- ✅ Scheduled publishing supported

### 3. Parent Communication - **CRITICAL WHATSAPP INTEGRATION**

**User Story**: As a school admin/teacher, I want to communicate with parents across multiple channels so that parents stay informed, engaged, and can collaborate effectively in supporting their child's education.

#### **WhatsApp Communication Requirements (Updated)**

**IMPORTANT**: Parents should get notifications on WhatsApp with TWO SEPARATE CHAT THREADS:

##### **Thread 1: Individual Student Messages (Daily Attendance)**
**Workflow**:
```
Teacher marks attendance → Admin approval → WhatsApp to parents
```

**Process**:
1. Teachers mark attendance for their assigned classes via mobile app
2. System collects all attendance data for the day
3. Admin receives consolidated attendance report for approval
4. Admin approves (bulk approve or individual review)
5. WhatsApp messages sent to each parent automatically
6. **Each parent gets CONSISTENT CHAT THREAD** with institution for daily updates

**WhatsApp Message Format**:
```
📚 AVM Tutorial - Daily Update

🎓 Student: Rahul Sharma (AVM-STU-025)
📅 Date: 28 Sep 2025
✅ Attendance: Present
📊 Marks: Math Test - 85/100

💬 Reply to this chat for any queries.
```

##### **Thread 2: Mass Communication (Announcements)**
**Separate WhatsApp Chat Thread for**:
- Exam schedules
- Holiday announcements
- Fee reminders
- Event notifications
- Emergency closures

**WhatsApp Message Format**:
```
📢 AVM Tutorial - Announcements

🏫 Important Notice
📅 Parent-Teacher Meeting scheduled for 5th Oct 2025
⏰ Time: 10:00 AM - 2:00 PM
📍 Venue: School Auditorium

Please confirm your attendance.
```

**Technical Implementation**:
- **WhatsApp Business API** integration
- **Persistent chat sessions** - new messages append to existing conversations
- **Chat ID mapping** stored in database per parent
- **Two separate chat types**: INDIVIDUAL and ANNOUNCEMENT
- **Database tracking** of chat sessions to maintain continuity

**Acceptance Criteria**:
- ✅ Teachers/admins can send messages via multiple channels
- ✅ Parents receive updates on their preferred channel
- ✅ **Each parent has TWO separate WhatsApp conversations** - daily updates and announcements
- ✅ **New messages append to existing chats** (no new chat creation)
- ✅ Urgent communication flagged with priority delivery
- ✅ Admin approval required before daily attendance WhatsApp messages
- ✅ PTMs can be scheduled with reminders
- ✅ Communication logs searchable and stored securely
- ✅ Parents can reply/raise queries via WhatsApp
- ✅ Delivery reports available

### 4. HR Management (Teacher Attendance)
**Features to Implement**:
- Teacher check-in/check-out system
- Leave management system
- Attendance analytics and reports
- GPS-based check-in (if needed)
- Payroll integration ready

## Self-Service Features

### 1. Simple Login System
**No-Hassle Authentication**:
- **Admin Login**: Email/Username + Password with "Remember Me"
- **Teacher Login**: Phone Number + OTP OR Email + Password
- **Parent Login**: Student ID + Mobile Number (first time), then password
- **Features**: Auto-detect role, biometric login (mobile), session persistence

### 2. Data Upload Wizard
**Self-Service Data Import**:

**Step 1**: Institution Setup (School Name, Address, Logo, Admin accounts)

**Step 2**: Bulk Data Upload using Excel/CSV templates:
- **Student List Template**: Student_ID, Name, Class, Section, DOB, Parent details, etc.
- **Teacher List Template**: Teacher_ID, Name, Subject, Phone, Email, Classes_Assigned
- **Parent Contact Template**: Student_ID, Parent details, Relationship

**Step 3**: Automated processing with:
- Data validation during upload
- Duplicate detection and merge
- Error reporting with line numbers
- Preview before final import
- Automatic unique ID generation (AVM-STU-001, etc.)

**Step 4**: Account generation:
- Teacher accounts with temp passwords sent via SMS
- Parent accounts with phone verification
- Student profile activation
- Welcome messages sent automatically

## Design & UI Specifications

### Color Palette (Colorful & Catchy)
**Primary Colors**:
- Primary Blue: `#4F46E5` (Trust, Education)
- Success Green: `#10B981` (Present/Success)
- Warning Orange: `#F59E0B` (Alerts/Attention)
- Danger Red: `#EF4444` (Absent/Critical)
- Purple Accent: `#8B5CF6` (Premium features)

**Secondary Colors**:
- Light Blue: `#3B82F6` (Links, Info)
- Teal: `#14B8A6` (Student profiles)
- Pink: `#EC4899` (Parent communication)
- Yellow: `#FBBF24` (Notifications)

**Design Principles**:
- High contrast for excellent readability
- Color-blind friendly combinations
- Consistent across web + mobile
- Engaging, bright, modern, educational feel
- Professional, suitable for institutional use

### UI Examples
**Student Cards**: Teal border, Green status, Blue accent
**Notice Cards**: Pink header, Yellow accent, Blue button
**Teacher Interface**: Green-dominant (positive vibes)
**Admin Dashboard**: Multi-color charts and graphs

## Technical Architecture

### Technology Stack
**Backend**:
- **FastAPI** with Python
- **SQLAlchemy** (ORM) with **Alembic** (migrations)
- **Pydantic** for data validation
- **JWT** authentication with **python-jose**
- **FastAPI-Users** for RBAC
- **Celery** + **Redis** for background tasks
- **WhatsApp Business API** for messaging

**Frontend**:
- **Web App**: React.js + Material-UI + Redux Toolkit
- **Mobile App**: React Native + React Native Paper + Redux Toolkit
- **Shared State Management**: Redux for both platforms

**Database**:
- **PostgreSQL** (primary database)
- **Redis** (caching and session management)

**Additional Services**:
- **WhatsApp Business API** for parent communication
- **Firebase Cloud Messaging** for push notifications
- **Twilio** for SMS notifications (backup)
- **NodeMailer** with **SendGrid** for email
- **AWS S3** or **Google Cloud Storage** for file storage

### Database Models

**Core Tables**:
- `users` (admins, teachers, parents with unique_id)
- `students` (profile, class, enrollment with unique_id)
- `teachers` (name, subject, classes_assigned with unique_id)
- `attendance` (daily records with status enum + admin approval fields)
- `notices` (announcements with target groups)
- `communications` (parent messages)
- `whatsapp_chats` (track chat sessions for continuity)
- `roles_permissions` (RBAC system)

**WhatsApp Integration Tables**:
```sql
-- Track WhatsApp chat sessions for conversation continuity
CREATE TABLE whatsapp_chats (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(15),
    chat_type ENUM('individual', 'announcement'),
    chat_id VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    last_message_at TIMESTAMP
);

-- Updated attendance table with admin approval
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    teacher_id INTEGER REFERENCES teachers(id),
    date DATE,
    status ENUM('present', 'absent', 'late', 'leave'),
    remarks VARCHAR(200),
    admin_approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    marked_at TIMESTAMP DEFAULT NOW()
);

-- Updated communications table
CREATE TABLE communications (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    recipient_ids TEXT, -- JSON array
    subject VARCHAR(200),
    message TEXT,
    message_type VARCHAR(20), -- 'WHATSAPP', 'SMS', 'EMAIL'
    whatsapp_chat_id VARCHAR(100),
    is_bulk BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT NOW()
);
```

**Unique ID Generation**:
- Students: AVM-STU-001, AVM-STU-002, etc.
- Teachers: AVM-TCH-001, AVM-TCH-002, etc.
- Admins: AVM-ADM-001, AVM-ADM-002
- Auto-generated during data upload

### Authentication & Security
- **JWT-based authentication** with role validation
- **Role-based access control** (Admin, Teacher, Parent, Student)
- **Password hashing** with bcrypt
- **Session management** with Redis
- **API endpoint protection** based on user roles

## Project Structure

```
tutorial-management-system/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── core/              # Config, security, database
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── api/v1/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utility functions
│   ├── alembic/               # Database migrations
│   └── tests/                 # Test files
├── frontend/
│   ├── web-app/               # React web application
│   └── mobile-app/            # React Native Android app
├── shared/                    # Shared utilities
└── docs/                      # Documentation
```

## Key Code Components Already Designed

### 1. Backend Structure (FastAPI)
- **Main application** setup with CORS
- **Database models** for all entities
- **Unique ID generation service** 
- **Authentication & RBAC system**
- **WhatsApp integration service**
- **Attendance approval workflow**

### 2. WhatsApp Business API Integration
```python
class WhatsAppService:
    async def send_individual_attendance_message(...)
    async def send_mass_communication(...)
    def _get_or_create_individual_chat(...)
    def _get_or_create_announcement_chat(...)
```

### 3. Attendance Approval Workflow
```python
class AttendanceApprovalService:
    async def get_pending_attendance_for_approval(...)
    async def approve_attendance_bulk(...)
    async def approve_attendance_by_class(...)
```

### 4. Admin Dashboard Components
- **Attendance approval interface** with class-wise grouping
- **Bulk approval functionality**
- **WhatsApp message sending integration**
- **Colorful Material-UI design**

## Development Phases

### Phase 1: Foundation ✅
- [x] Backend structure (FastAPI)
- [x] Database models design
- [x] Unique ID generation system
- [x] Authentication & RBAC system
- [x] WhatsApp integration planning
- [x] Project structure planning

### Phase 2A: Core APIs
- [ ] Authentication endpoints (/login, /register, /reset-password)
- [ ] Data upload endpoints (/upload/students, /upload/teachers)
- [ ] Student management APIs
- [ ] Teacher management APIs
- [ ] Attendance APIs with admin approval
- [ ] WhatsApp API integration

### Phase 2B: Frontend Setup
- [ ] React Web App with Material-UI
- [ ] React Native Mobile App setup
- [ ] Redux store configuration
- [ ] Shared state management

### Phase 3: Core Features
- [ ] Attendance marking interface (mobile-first)
- [ ] Admin attendance approval dashboard
- [ ] Student records management
- [ ] Notice & announcement system
- [ ] Parent communication system with WhatsApp

### Phase 4: Advanced Features
- [ ] Analytics dashboard
- [ ] Report generation
- [ ] File upload handling
- [ ] Push notifications
- [ ] WhatsApp conversation management

### Phase 5: Deployment
- [ ] Production hosting setup
- [ ] Play Store submission
- [ ] Testing with dummy data
- [ ] Documentation and training materials

## Development Environment Setup

### MacBook Setup Commands
```bash
# Install prerequisites
brew install python@3.11 node postgresql@15 redis
brew services start postgresql@15
brew services start redis

# Create project structure
mkdir tutorial-management-system
cd tutorial-management-system
mkdir -p backend/{app/{core,models,schemas,api/{v1},services,utils},alembic,tests}
mkdir -p frontend/{web-app,mobile-app}
mkdir -p shared docs scripts

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic python-jose passlib python-multipart redis celery python-dotenv pandas openpyxl pytest

# Frontend setup
cd ../frontend/web-app
npx create-react-app . --template redux
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install react-router-dom axios react-hook-form react-query
npm install chart.js react-chartjs-2 date-fns react-datepicker

# Mobile app setup
cd ../mobile-app
npx react-native init TutorialManagementApp .
npm install @react-navigation/native @react-navigation/stack
npm install react-native-paper react-native-vector-icons
npm install @reduxjs/toolkit react-redux redux-persist
```

### Required Environment Variables
```bash
# backend/.env
DATABASE_URL=postgresql://username:password@localhost:5432/tutorial_management
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_API_VERSION=v17.0
```

## Hosting & Deployment

### Production Hosting Strategy
**Recommended Stack**:
- **Backend**: Heroku, Railway, or DigitalOcean App Platform
- **Database**: PostgreSQL (managed service)
- **Redis**: Redis Cloud or platform-provided
- **File Storage**: AWS S3 or Google Cloud Storage
- **Web App**: Vercel or Netlify
- **Mobile App**: Google Play Store

**Cost Estimation**: ~₹580/month for hosting
**Revenue**: ₹2,233/month (77 students × ₹29)
**Net Profit**: ₹1,653/month (~74% margin)

### Play Store Requirements
- HTTPS mandatory for API calls
- Privacy Policy required
- Data Protection compliance
- App Signing via Google Play
- Internal testing track first

## Critical Implementation Notes

### WhatsApp Integration Requirements
1. **Two separate chat threads per parent**:
   - Individual daily attendance updates
   - Mass announcements/notices

2. **Message continuity**: 
   - New messages append to existing chats
   - No new chat creation for each message
   - Chat session tracking in database

3. **Admin approval workflow**:
   - Teachers mark attendance → Admin approval → WhatsApp messages
   - Bulk approval capability
   - Class-wise approval options

4. **Message formatting**:
   - Professional, branded messages
   - Emoji usage for visual appeal
   - Clear action items and contact info

### Next Immediate Tasks for Claude Code
1. **Complete FastAPI backend implementation**
   - Finish all database models
   - Implement WhatsApp service
   - Create attendance approval APIs
   - Build authentication system

2. **Admin dashboard development**
   - Attendance approval interface
   - Bulk operations
   - WhatsApp message management
   - Colorful Material-UI components

3. **Mobile app development**
   - Teacher attendance marking
   - Offline capabilities
   - Push notifications
   - Biometric authentication

4. **Data upload wizard**
   - Excel/CSV processing
   - Data validation
   - Unique ID generation
   - Account creation automation

## Success Metrics
- **User Experience**: Teachers mark attendance in <30 seconds
- **Performance**: App loads in <3 seconds
- **Reliability**: 99.9% uptime
- **Security**: Role-based access working correctly
- **Communication**: WhatsApp messages with proper chat continuity
- **Deployment**: Play Store ready Android app
- **Self-Service**: Zero maintenance calls from client

---

**This document contains the complete context for continuing development in Claude Code. All technical decisions, requirements, implementation details, and especially the critical WhatsApp integration requirements are captured here for seamless development continuation.**