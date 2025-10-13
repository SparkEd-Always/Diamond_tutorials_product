# Implementation Plan
# Journey 24: Parent Communication System

**Version**: 1.0
**Last Updated**: October 13, 2025
**Status**: Ready for Development
**Project**: Sparked EdTech ERP + SIS + LMS
**Duration**: 10 Weeks (MVP to Production)

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
Develop a production-ready parent communication system that unifies multi-channel messaging (app, SMS, email, voice), real-time two-way chat with auto-translation, meeting scheduling, automated progress reports, emergency alerts, and comprehensive analytics—reducing teacher communication time by 70% and achieving 90%+ parent engagement.

### Timeline
**Total Duration**: 10 weeks (MVP to Production Launch)
- **Phase 1**: Weeks 1-4 (MVP - Core Messaging + Chat)
- **Phase 2**: Weeks 5-7 (Meetings + Progress Reports + Analytics)
- **Phase 3**: Weeks 8-9 (Emergency Alerts + Advanced Features)
- **Phase 4**: Week 10 (Testing + Launch Preparation)

### Team Requirements
- **Backend Developers**: 2 (Python/FastAPI experts)
- **Frontend Developers**: 2 (React 19/TypeScript experts)
- **Full-Stack Developer**: 1 (integration + real-time features)
- **DevOps Engineer**: 1 (part-time, infrastructure setup)
- **QA Engineer**: 1 (testing + automation)
- **Product Manager**: 1 (requirements + stakeholder management)
- **UI/UX Designer**: 1 (part-time, Week 1-2 only)

### Success Metrics
- **Message Delivery**: 99%+ delivery rate via at least one channel
- **Message Read Rate**: 90%+ within 24 hours
- **Teacher Time Savings**: 70% reduction (from 2-3 hours to 30-45 min daily)
- **Parent Satisfaction**: 95%+ satisfaction score
- **System Performance**: < 500ms API response time, 99.9% uptime

---

## 2. Project Setup

### Week 0 (Pre-Development): Environment & Infrastructure Setup

#### Day 1-2: Development Environment Setup

**Tasks**:
1. **Version Control Setup**
   - Create GitHub repository: `parent-communication-system`
   - Set up branch strategy:
     - `main` - Production
     - `develop` - Development
     - `feature/*` - Feature branches
     - `hotfix/*` - Emergency fixes
   - Configure branch protection rules (require PR reviews)

2. **Local Development Setup**
   - Install required tools:
     - Python 3.11+ with pip
     - Node.js 20+ with npm
     - PostgreSQL 15+ (local instance)
     - Redis 7+ (local instance)
     - MongoDB 6+ (local instance or Docker)
     - Docker Desktop (for local services)
   - Create `.env.example` files for backend and frontend
   - Document setup instructions in `QUICKSTART.md`

3. **IDE Configuration**
   - VSCode with extensions:
     - Python (Pylance, Black formatter)
     - TypeScript (ES7+ React snippets)
     - Prettier (code formatting)
     - ESLint (linting)
     - Thunder Client (API testing)
   - Configure linters and formatters
   - Set up shared code style configuration

**Deliverables**:
- ✅ GitHub repository with proper structure
- ✅ All developers can run local environment
- ✅ Development tools configured

---

#### Day 3-4: Cloud Infrastructure Setup

**Tasks**:
1. **AWS Account Setup** (or Azure/GCP if preferred)
   - Create AWS organization and development account
   - Set up IAM roles and policies
   - Configure billing alerts

2. **Database Setup**
   - **PostgreSQL RDS**: Launch db.t3.medium instance
     - Engine: PostgreSQL 15.4
     - Storage: 100 GB SSD (gp3)
     - Multi-AZ for high availability
     - Automated backups (7-day retention)
   - **MongoDB Atlas**: Create M10 cluster
     - Region: Mumbai (ap-south-1)
     - 3-node replica set
     - Automated backups
   - **Redis ElastiCache**: Launch cache.t3.micro instance
     - Engine: Redis 7.0
     - Single node for dev, cluster for prod

3. **Storage Setup**
   - **S3 Buckets**:
     - `sparked-parent-comm-dev-attachments` (message attachments)
     - `sparked-parent-comm-dev-backups` (database backups)
   - Configure bucket policies and lifecycle rules
   - Enable versioning and encryption

4. **Network Configuration**
   - Create VPC with public and private subnets
   - Configure security groups (database access, API access)
   - Set up NAT gateway for private subnet internet access

**Deliverables**:
- ✅ AWS infrastructure provisioned
- ✅ Databases accessible from development machines
- ✅ S3 buckets configured for file storage

---

#### Day 5: CI/CD Pipeline Setup

**Tasks**:
1. **GitHub Actions Configuration**
   - Create workflow files:
     - `.github/workflows/backend-ci.yml` (Python linting, tests)
     - `.github/workflows/frontend-ci.yml` (TypeScript linting, build)
     - `.github/workflows/deploy-dev.yml` (auto-deploy to dev on merge)
   - Configure secrets (AWS credentials, database URLs)

2. **Docker Setup**
   - Create `Dockerfile.backend` (Python FastAPI)
   - Create `Dockerfile.frontend` (React Vite build)
   - Create `docker-compose.yml` (local development stack)
   - Test local Docker builds

3. **Deployment Target Setup**
   - **Option A**: AWS ECS (Fargate) - Containerized deployment
   - **Option B**: AWS EC2 - Traditional server deployment
   - **Option C**: Heroku/Railway - Quick deployment for MVP
   - Configure load balancer (Application Load Balancer)
   - Set up SSL certificates (AWS Certificate Manager)

**Deliverables**:
- ✅ CI/CD pipelines running successfully
- ✅ Docker containers build and run locally
- ✅ Deployment infrastructure ready

---

### Project Structure Creation

```bash
parent-communication-system/
├── README.md
├── CLAUDE.md
├── QUICKSTART.md
├── TODO.md
├── CONTEXT.md
├── PROJECT_STRUCTURE.md
├── SETUP_SUCCESS.md
├── INDEX.md
├── .gitignore
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI entry point
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Settings from .env
│   │   │   ├── database.py            # SQLAlchemy setup
│   │   │   ├── security.py            # JWT authentication
│   │   │   └── websocket.py           # WebSocket manager
│   │   │
│   │   ├── models/                    # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── message.py
│   │   │   ├── conversation.py
│   │   │   ├── meeting.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── schemas/                   # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── message.py
│   │   │   ├── conversation.py
│   │   │   ├── meeting.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── api/v1/                    # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── messages.py
│   │   │   ├── conversations.py
│   │   │   ├── meetings.py
│   │   │   ├── reports.py
│   │   │   ├── analytics.py
│   │   │   └── alerts.py
│   │   │
│   │   ├── services/                  # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── message_service.py
│   │   │   ├── translation_service.py
│   │   │   ├── notification_service.py
│   │   │   ├── sms_service.py
│   │   │   ├── email_service.py
│   │   │   ├── meeting_service.py
│   │   │   └── analytics_service.py
│   │   │
│   │   ├── utils/                     # Helper functions
│   │   │   ├── __init__.py
│   │   │   ├── datetime_utils.py
│   │   │   ├── file_utils.py
│   │   │   └── validators.py
│   │   │
│   │   ├── tasks/                     # Celery tasks
│   │   │   ├── __init__.py
│   │   │   ├── message_tasks.py       # Async message delivery
│   │   │   ├── report_tasks.py        # Weekly report generation
│   │   │   └── reminder_tasks.py      # Automated reminders
│   │   │
│   │   └── tests/                     # Unit tests
│   │       ├── __init__.py
│   │       ├── test_auth.py
│   │       ├── test_messages.py
│   │       └── test_meetings.py
│   │
│   ├── migrations/                    # Alembic migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── scripts/                       # Utility scripts
│   │   ├── seed_data.py
│   │   ├── generate_dummy_users.py
│   │   └── database_backup.py
│   │
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── .env.example
│   ├── .gitignore
│   ├── alembic.ini
│   └── pytest.ini
│
├── frontend/web-app/
│   ├── src/
│   │   ├── main.tsx                   # React entry point
│   │   ├── App.tsx                    # Root component
│   │   ├── index.css                  # Global styles
│   │   │
│   │   ├── components/                # Reusable components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── messages/
│   │   │   │   ├── MessageComposer.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessagePreview.tsx
│   │   │   │   └── DeliveryStatus.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   └── TranslationToggle.tsx
│   │   │   ├── meetings/
│   │   │   │   ├── Calendar.tsx
│   │   │   │   ├── SlotPicker.tsx
│   │   │   │   └── MeetingCard.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Loading.tsx
│   │   │
│   │   ├── pages/                     # Page components
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherDashboard.tsx
│   │   │   │   ├── SendMessagePage.tsx
│   │   │   │   ├── ConversationsPage.tsx
│   │   │   │   └── MeetingsPage.tsx
│   │   │   ├── parent/
│   │   │   │   ├── ParentDashboard.tsx
│   │   │   │   ├── MessagesPage.tsx
│   │   │   │   ├── ChatPage.tsx
│   │   │   │   └── BookMeetingPage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AnalyticsPage.tsx
│   │   │       └── EmergencyAlertPage.tsx
│   │   │
│   │   ├── services/                  # API clients
│   │   │   ├── api.ts                 # Axios configuration
│   │   │   ├── authService.ts
│   │   │   ├── messageService.ts
│   │   │   ├── conversationService.ts
│   │   │   ├── meetingService.ts
│   │   │   └── analyticsService.ts
│   │   │
│   │   ├── contexts/                  # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   ├── WebSocketContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   │
│   │   ├── hooks/                     # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useMeetings.ts
│   │   │
│   │   └── utils/                     # Helper functions
│   │       ├── dateUtils.ts
│   │       ├── validators.ts
│   │       └── formatters.ts
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.png
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── .gitignore
│
├── docs/
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
└── docker/
    ├── docker-compose.yml
    ├── docker-compose.dev.yml
    ├── Dockerfile.backend
    └── Dockerfile.frontend
```

---

## 3. Phase-wise Development Plan

### Phase 1: MVP - Core Messaging & Chat (Weeks 1-4)

**Objective**: Teachers can broadcast messages to parents (multi-channel with translation) and have two-way chat conversations.

---

#### Week 1: Backend Foundation + Database

**Sprint Goal**: Backend skeleton running with user authentication and database models.

**Day 1-2: Backend Setup**

**Backend Developer 1**:
- [ ] Create FastAPI project structure
- [ ] Set up virtual environment and install dependencies
- [ ] Configure `app/core/config.py` to load settings from `.env`
- [ ] Set up SQLAlchemy database connection (`app/core/database.py`)
- [ ] Create base model with `id`, `created_at`, `updated_at` fields
- [ ] Test database connection

**Backend Developer 2**:
- [ ] Set up Alembic for database migrations
- [ ] Create initial migration for core tables
- [ ] Implement JWT authentication (`app/core/security.py`)
  - `create_access_token()`, `verify_token()`
  - Password hashing with bcrypt
- [ ] Create authentication endpoints (`app/api/v1/auth.py`)
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
- [ ] Test authentication flow with Postman

**Full-Stack Developer**:
- [ ] Set up MongoDB connection for chat storage
- [ ] Create Redis connection for caching and sessions
- [ ] Set up Celery for background tasks
- [ ] Create initial Celery tasks structure
- [ ] Test message queue functionality

**DevOps Engineer**:
- [ ] Set up development database (PostgreSQL + MongoDB + Redis)
- [ ] Configure Docker Compose for local development
- [ ] Set up CI pipeline for backend (linting, tests)
- [ ] Create deployment scripts for development environment

**Deliverables**:
- ✅ FastAPI server running at `http://localhost:8000`
- ✅ Database migrations working
- ✅ User registration and login functional
- ✅ JWT authentication protecting endpoints

---

**Day 3-4: Database Models & User Management**

**Backend Developer 1**:
- [ ] Create `User` model (`app/models/user.py`)
  - Fields: id, school_id, role, email, phone, name, password_hash, preferred_language, has_app_installed, communication_preferences
  - Relationships with messages, conversations, meetings
- [ ] Create `School` model for multi-tenancy
- [ ] Create `Student` model (basic info: id, name, class, parent_ids)
- [ ] Create `Parent` model extending User
- [ ] Create `Teacher` model extending User
- [ ] Test model creation with sample data

**Backend Developer 2**:
- [ ] Create `Message` model (`app/models/message.py`)
  - Fields: id, school_id, sender_id, message_type, subject, body, original_language, attachments, recipients, scheduled_at, sent_at
- [ ] Create `MessageDelivery` model
  - Fields: id, message_id, recipient_id, channel, delivery_status, delivered_at, read_at
- [ ] Create `MessageTranslation` model
  - Fields: id, message_id, language, translated_subject, translated_body
- [ ] Test message models with sample data

**Full-Stack Developer**:
- [ ] Create `Conversation` model (PostgreSQL)
  - Fields: id, school_id, parent_id, teacher_id, student_id, status, last_message_at
- [ ] Design chat message schema (MongoDB)
  - Fields: conversation_id, sender_id, message_text, original_language, translations, attachments, read_at, created_at
- [ ] Create chat message repository (MongoDB operations)
- [ ] Test conversation creation and message storage

**Deliverables**:
- ✅ All database models created and tested
- ✅ Database migrations for all models
- ✅ Sample data seed script created

---

**Day 5: User Management APIs**

**Backend Developer 1**:
- [ ] Create user schemas (`app/schemas/user.py`)
  - UserCreate, UserUpdate, UserResponse, UserProfile
- [ ] Implement user endpoints (`app/api/v1/users.py`)
  - `GET /api/v1/users/me` - Get current user profile
  - `PUT /api/v1/users/me` - Update profile (including language preference)
  - `GET /api/v1/users/{id}` - Get user details (role-based access)
- [ ] Create user service layer (`app/services/user_service.py`)
- [ ] Write unit tests for user APIs

**Backend Developer 2**:
- [ ] Create student-parent relationship endpoints
  - `GET /api/v1/users/me/children` - Parent gets their children list
  - `GET /api/v1/users/me/students` - Teacher gets their students list
- [ ] Create class/grade filtering endpoints
  - `GET /api/v1/classes` - Get all classes
  - `GET /api/v1/classes/{id}/students` - Get students in class
  - `GET /api/v1/classes/{id}/parents` - Get parents of students in class
- [ ] Write unit tests

**Full-Stack Developer**:
- [ ] Set up WebSocket server (Socket.io with FastAPI)
- [ ] Create WebSocket connection handler
- [ ] Implement basic authentication for WebSocket connections
- [ ] Create WebSocket room structure (per conversation)
- [ ] Test WebSocket connection from browser

**Deliverables**:
- ✅ User management APIs fully functional
- ✅ Student-parent-teacher relationships queryable
- ✅ WebSocket server running and accepting connections

---

#### Week 2: Message Broadcasting + Translation

**Sprint Goal**: Teachers can compose and send messages to parents with automatic translation and multi-channel delivery.

**Day 1-2: Translation Service Integration**

**Backend Developer 1**:
- [ ] Research and choose translation API (Microsoft Translator vs. Google Cloud)
- [ ] Create translation service (`app/services/translation_service.py`)
  - `translate_text(text, source_lang, target_lang)` → translated_text
  - `translate_bulk(texts, target_langs)` → {lang: translated_text}
  - Support for 10+ Indian languages
- [ ] Implement caching for common translations (Redis)
- [ ] Create custom glossary for education terms
- [ ] Write unit tests for translation service
- [ ] Test translation quality with sample messages

**Backend Developer 2**:
- [ ] Create message schemas (`app/schemas/message.py`)
  - MessageCreate, MessageUpdate, MessageResponse, MessageWithDeliveries
- [ ] Implement message creation endpoint
  - `POST /api/v1/messages` - Create and send message
  - Accept message content, recipients, attachments
  - Validate all inputs
- [ ] Create message service layer (`app/services/message_service.py`)
  - `create_message()`, `translate_message()`, `send_message()`
- [ ] Write unit tests

**Full-Stack Developer**:
- [ ] Set up file upload to S3
  - Configure boto3 for S3 operations
  - Create file upload endpoint: `POST /api/v1/upload`
  - Validate file types and sizes
  - Return secure S3 URL for attachments
- [ ] Implement presigned URL generation for secure downloads
- [ ] Test file upload with various file types

**Deliverables**:
- ✅ Translation service working for 10+ languages
- ✅ Message creation API functional
- ✅ File upload to S3 working

---

**Day 3-4: Multi-Channel Message Delivery**

**Backend Developer 1**:
- [ ] Integrate SMS gateway (MSG91 or Twilio)
  - Create SMS service (`app/services/sms_service.py`)
  - `send_sms(phone, message, language)` → delivery_status
  - Handle SMS character limits (160 chars)
  - Implement retry logic for failed SMS
- [ ] Create SMS delivery task (Celery)
  - `tasks/message_tasks.py` - `send_sms_batch()`
- [ ] Test SMS delivery to Indian phone numbers
- [ ] Implement SMS delivery status tracking (webhooks)

**Backend Developer 2**:
- [ ] Integrate email service (SendGrid or AWS SES)
  - Create email service (`app/services/email_service.py`)
  - `send_email(to, subject, body, attachments)` → delivery_status
  - Create HTML email templates
  - Implement retry logic
- [ ] Create email delivery task (Celery)
  - `tasks/message_tasks.py` - `send_email_batch()`
- [ ] Test email delivery with Gmail, Yahoo, Outlook
- [ ] Implement email delivery tracking (open/click tracking)

**Full-Stack Developer**:
- [ ] Integrate Firebase Cloud Messaging (FCM) for push notifications
  - Create notification service (`app/services/notification_service.py`)
  - `send_push_notification(user_id, title, body, data)` → delivery_status
  - Handle device token management
- [ ] Create push notification task (Celery)
- [ ] Test push notifications on Android and iOS (or web PWA)

**Deliverables**:
- ✅ SMS delivery working (MSG91/Twilio)
- ✅ Email delivery working (SendGrid/SES)
- ✅ Push notifications working (FCM)

---

**Day 5: Message Delivery Orchestration**

**Backend Developer 1**:
- [ ] Implement message delivery orchestration logic
  - Determine delivery channels based on parent preferences
  - If parent has app installed → Push notification + Email
  - If parent doesn't have app → SMS + Email
  - If emergency alert → All channels simultaneously
- [ ] Create delivery task: `tasks/message_tasks.py` - `process_message_delivery()`
  - Translate message to each parent's preferred language
  - Send via appropriate channels
  - Track delivery status in `message_deliveries` table
- [ ] Implement retry logic for failed deliveries
- [ ] Write unit tests

**Backend Developer 2**:
- [ ] Create message delivery status endpoints
  - `GET /api/v1/messages/{id}/deliveries` - Get delivery status
  - `POST /api/v1/messages/{id}/resend` - Resend failed deliveries
- [ ] Implement read receipt tracking
  - `POST /api/v1/messages/{id}/mark-read` - Mark message as read
  - Update `read_at` timestamp in `message_deliveries`
- [ ] Create delivery status webhook handler (for SMS/email confirmations)
- [ ] Write unit tests

**Full-Stack Developer**:
- [ ] Create scheduled message delivery system
  - Background task to check for scheduled messages
  - Send scheduled messages at specified time
  - Handle timezone conversions
- [ ] Implement message recall/edit functionality
  - Allow recall within 5 minutes if not yet read
  - Update message and notify recipients
- [ ] Test end-to-end message delivery flow

**Deliverables**:
- ✅ Complete message delivery system working
- ✅ Messages delivered via app, SMS, email based on preferences
- ✅ Delivery tracking and read receipts functional

---

#### Week 3: Frontend Foundation + Message Broadcasting UI

**Sprint Goal**: Teachers can log in and send messages to parents through a user-friendly interface.

**Day 1-2: Frontend Setup + Authentication**

**Frontend Developer 1**:
- [ ] Create React 19 + TypeScript + Vite project
- [ ] Install dependencies: Material-UI v7, React Router, Axios, React Hook Form, Yup
- [ ] Set up folder structure (components, pages, services, contexts, hooks, utils)
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Configure Vite (`vite.config.ts`)
- [ ] Set up Axios instance with base URL and interceptors

**Frontend Developer 2**:
- [ ] Create authentication service (`services/authService.ts`)
  - `login(email, password)` → JWT token
  - `register(userData)` → user profile
  - `logout()` → clear token
  - `refreshToken()` → new JWT
- [ ] Create AuthContext (`contexts/AuthContext.tsx`)
  - Store current user and token
  - Provide login/logout functions
  - Handle token refresh
- [ ] Create useAuth hook (`hooks/useAuth.ts`)

**Frontend Developer 1**:
- [ ] Create login page (`pages/auth/LoginPage.tsx`)
  - Email/phone input
  - Password input
  - Form validation with Yup
  - Error handling
- [ ] Create registration page (`pages/auth/RegisterPage.tsx`)
  - User type selection (parent/teacher)
  - Form fields based on user type
  - Form validation
- [ ] Test authentication flow

**Frontend Developer 2**:
- [ ] Create layout components
  - `components/layout/Navbar.tsx` - Top navigation bar
  - `components/layout/Sidebar.tsx` - Left sidebar menu
  - `components/layout/Footer.tsx`
- [ ] Create teacher dashboard page (`pages/teacher/TeacherDashboard.tsx`)
  - Dashboard cards: Messages Sent, Queries Received, Meetings Today
  - Quick actions: Send Message, View Conversations
- [ ] Test navigation and routing

**Deliverables**:
- ✅ React app running at `http://localhost:5173`
- ✅ User can register and log in
- ✅ Teacher dashboard displays basic info

---

**Day 3-4: Message Composer UI**

**Frontend Developer 1**:
- [ ] Create message service (`services/messageService.ts`)
  - `sendMessage(messageData)` → message response
  - `getMessages()` → message list
  - `getMessageDetails(id)` → message with deliveries
- [ ] Create message composer page (`pages/teacher/SendMessagePage.tsx`)
  - Rich text editor (Quill or Draft.js)
  - Subject and body inputs
  - File upload component (react-dropzone)
  - Recipient selector (class, grade, individual parents)
- [ ] Implement file upload with progress indicator

**Frontend Developer 2**:
- [ ] Create recipient selector component (`components/messages/RecipientSelector.tsx`)
  - Dropdown for class/grade selection
  - Multi-select for individual parents
  - Display selected recipients count
- [ ] Create message template selector component
  - Predefined templates (homework update, announcement, etc.)
  - Custom template creation
  - Template preview
- [ ] Test message composition flow

**Frontend Developer 1**:
- [ ] Create translation preview component
  - Show message in multiple languages before sending
  - Allow manual correction of translations
  - Language selector (10+ languages)
- [ ] Create message scheduling component
  - Date and time picker
  - Option to send now or schedule
- [ ] Implement form validation (subject required, recipients required, etc.)

**Frontend Developer 2**:
- [ ] Create message preview modal
  - Show how message will appear to parents
  - Show delivery channels (app, SMS, email)
  - Confirm send button
- [ ] Implement send message functionality
  - POST to `/api/v1/messages`
  - Handle success and error responses
  - Show success notification
- [ ] Test end-to-end message sending

**Deliverables**:
- ✅ Teachers can compose messages with rich text and attachments
- ✅ Teachers can select recipients (class, grade, individuals)
- ✅ Teachers can preview translations before sending
- ✅ Messages successfully sent to backend

---

**Day 5: Message History & Delivery Status UI**

**Frontend Developer 1**:
- [ ] Create message list page (`pages/teacher/MessageHistoryPage.tsx`)
  - Table/list showing sent messages
  - Columns: Subject, Sent To, Sent Date, Read Rate
  - Filters: Date range, recipient type, message type
  - Pagination
- [ ] Create message details page
  - Full message content
  - Delivery status by recipient
  - Read receipts visualization
  - Option to resend failed deliveries

**Frontend Developer 2**:
- [ ] Create delivery status component (`components/messages/DeliveryStatus.tsx`)
  - Visual indicators: Sent, Delivered, Read
  - Breakdown by channel (app, SMS, email)
  - List of parents who haven't read
  - Option to send follow-up
- [ ] Create delivery analytics chart
  - Read rate over time
  - Engagement by channel
  - Use Recharts or Chart.js
- [ ] Test delivery status display

**Deliverables**:
- ✅ Teachers can view message history
- ✅ Teachers can see delivery status for each message
- ✅ Read receipts displayed in real-time

---

#### Week 4: Two-Way Chat + Real-Time Messaging

**Sprint Goal**: Parents and teachers can chat in real-time with automatic translation.

**Day 1-2: Chat Backend**

**Full-Stack Developer**:
- [ ] Create conversation endpoints (`app/api/v1/conversations.py`)
  - `POST /api/v1/conversations` - Start new conversation
  - `GET /api/v1/conversations` - Get user's conversations
  - `GET /api/v1/conversations/{id}` - Get conversation details
  - `GET /api/v1/conversations/{id}/messages` - Get chat history (paginated)
  - `PUT /api/v1/conversations/{id}/status` - Update status (resolved, escalated)
- [ ] Create conversation service (`app/services/conversation_service.py`)
  - `create_conversation()`, `get_conversation()`, `update_status()`
- [ ] Write unit tests

**Backend Developer 1**:
- [ ] Implement real-time chat via WebSocket
  - Handle `send_message` event from client
  - Translate message to recipient's language
  - Store message in MongoDB
  - Emit `new_message` event to recipient
  - Update `last_message_at` in conversation
- [ ] Implement typing indicators
  - Handle `typing_start` and `typing_stop` events
  - Emit to conversation participants
- [ ] Implement read receipts in chat
  - Handle `mark_read` event
  - Update `read_at` in message

**Backend Developer 2**:
- [ ] Create chat notification system
  - Send push notification when new chat message received (if recipient offline)
  - Send SMS notification if parent doesn't have app
  - Track notification delivery status
- [ ] Implement chat history pagination
  - Load last 50 messages initially
  - Load more on scroll up
  - Optimize MongoDB queries for performance
- [ ] Write unit tests for chat functionality

**Deliverables**:
- ✅ Chat backend APIs functional
- ✅ Real-time messaging via WebSocket working
- ✅ Chat history stored in MongoDB

---

**Day 3-4: Chat Frontend**

**Frontend Developer 1**:
- [ ] Create WebSocket service (`services/websocketService.ts`)
  - Connect to WebSocket server with JWT token
  - Handle connection/disconnection
  - Send and receive messages
  - Handle typing indicators
- [ ] Create WebSocketContext (`contexts/WebSocketContext.tsx`)
  - Provide WebSocket connection to components
  - Handle reconnection logic
  - Emit and listen to events
- [ ] Create useWebSocket hook

**Frontend Developer 2**:
- [ ] Create conversation service (`services/conversationService.ts`)
  - `getConversations()` → conversation list
  - `getConversationMessages(id)` → message history
  - `sendMessage(conversationId, message)` → via WebSocket
- [ ] Create conversations list page (`pages/teacher/ConversationsPage.tsx`)
  - List of all conversations
  - Show last message and timestamp
  - Unread indicator
  - Search/filter conversations

**Frontend Developer 1**:
- [ ] Create chat window component (`components/chat/ChatWindow.tsx`)
  - Message bubbles (left for received, right for sent)
  - Timestamp for each message
  - Read receipts (single check = sent, double check = read)
  - Scroll to bottom on new message
- [ ] Create message input component
  - Text input with emoji picker
  - File attachment button
  - Send button
  - Character counter

**Frontend Developer 2**:
- [ ] Create message bubble component (`components/chat/MessageBubble.tsx`)
  - Display message text
  - Show original language + translation toggle
  - Display attachments (images, PDFs)
  - Timestamp and read status
- [ ] Implement typing indicator
  - Show "Teacher is typing..." when teacher typing
  - Show "Parent is typing..." when parent typing
  - Hide after 3 seconds of no typing
- [ ] Test real-time chat between teacher and parent

**Deliverables**:
- ✅ Real-time chat UI functional
- ✅ Messages sent and received in real-time
- ✅ Automatic translation working in chat

---

**Day 5: Chat Features + Testing**

**Frontend Developer 1**:
- [ ] Implement translation toggle in chat
  - Button to show original message
  - Button to show translated message
  - Store preference in local storage
- [ ] Implement message search in conversation
  - Search bar above chat window
  - Highlight matching messages
  - Jump to searched message
- [ ] Implement infinite scroll for chat history
  - Load more messages on scroll up
  - Show loading indicator

**Frontend Developer 2**:
- [ ] Create parent chat page (`pages/parent/ChatPage.tsx`)
  - Similar to teacher chat but parent perspective
  - List of teachers (child's teachers)
  - Option to start new conversation
- [ ] Implement push notification handling
  - Show browser notification when new message received
  - Play sound notification (optional)
  - Request notification permission on login
- [ ] Test chat functionality across browsers

**QA Engineer**:
- [ ] Write automated tests for chat functionality
  - Test WebSocket connection
  - Test message sending and receiving
  - Test translation in chat
  - Test typing indicators
  - Test read receipts
- [ ] Perform manual testing
  - Test real-time messaging between users
  - Test offline message queueing
  - Test reconnection after network failure
- [ ] Document bugs and create tickets

**Deliverables**:
- ✅ Chat fully functional with all features
- ✅ Parent and teacher can chat seamlessly
- ✅ Automated tests written and passing

---

**End of Phase 1 (Week 4) - MVP Checkpoint**

**MVP Features Completed**:
- ✅ User authentication (register, login, JWT)
- ✅ Message broadcasting with multi-channel delivery (app, SMS, email)
- ✅ Automatic translation to 10+ languages
- ✅ Delivery tracking and read receipts
- ✅ Real-time two-way chat with translation
- ✅ File attachments (upload to S3)
- ✅ WebSocket-based real-time communication

**Demo Day**: Present MVP to stakeholders
- Show teacher sending message to parents
- Show multi-channel delivery (app, SMS, email)
- Show parent receiving message in Hindi
- Show real-time chat with translation
- Gather feedback for Phase 2

---

### Phase 2: Meetings + Progress Reports + Analytics (Weeks 5-7)

**Objective**: Add meeting scheduling, automated progress reports, and analytics dashboard.

---

#### Week 5: Meeting Scheduling

**Sprint Goal**: Teachers can publish meeting slots, parents can book slots, and both receive automated reminders.

**Day 1-2: Meeting Backend**

**Backend Developer 1**:
- [ ] Create `Meeting` model enhancements
  - Add virtual meeting link generation
  - Add meeting notes and summary fields
  - Add follow-up tasks field
- [ ] Create meeting schemas (`app/schemas/meeting.py`)
  - MeetingSlotCreate, MeetingBooking, MeetingResponse, MeetingWithDetails
- [ ] Create meeting endpoints (`app/api/v1/meetings.py`)
  - `POST /api/v1/meetings/slots` - Teacher creates slots
  - `GET /api/v1/meetings/slots` - Get available/all slots
  - `POST /api/v1/meetings/{id}/book` - Parent books slot
  - `PUT /api/v1/meetings/{id}/reschedule` - Reschedule meeting
  - `DELETE /api/v1/meetings/{id}` - Cancel meeting
  - `POST /api/v1/meetings/{id}/notes` - Add meeting notes
  - `GET /api/v1/meetings/{id}/summary` - Get summary

**Backend Developer 2**:
- [ ] Create meeting service (`app/services/meeting_service.py`)
  - `create_slots()` - Bulk slot creation
  - `book_meeting()` - Book slot with conflict check
  - `send_meeting_invite()` - Email calendar invite (.ics file)
  - `generate_virtual_link()` - Google Meet or Zoom link
- [ ] Implement calendar invite generation
  - Create .ics file format
  - Include meeting details, location, virtual link
  - Attach to email notification
- [ ] Write unit tests

**Full-Stack Developer**:
- [ ] Integrate with Google Meet API (or Zoom API)
  - Create virtual meeting rooms
  - Generate meeting links
  - Handle API rate limits
- [ ] Create automated reminder tasks (`app/tasks/reminder_tasks.py`)
  - `send_meeting_reminders()` - Celery scheduled task
  - Run daily to check upcoming meetings
  - Send reminders at -7 days, -3 days, -1 day, -1 hour
  - Multi-channel reminders (app, SMS, email)
- [ ] Test virtual meeting link generation

**Deliverables**:
- ✅ Meeting backend APIs functional
- ✅ Booking system prevents double-booking
- ✅ Calendar invites sent via email
- ✅ Virtual meeting links generated

---

**Day 3-5: Meeting Frontend**

**Frontend Developer 1**:
- [ ] Create meeting service (`services/meetingService.ts`)
  - `createSlots()`, `getAvailableSlots()`, `bookMeeting()`, `cancelMeeting()`
- [ ] Install FullCalendar library for calendar UI
- [ ] Create meeting calendar page (`pages/teacher/MeetingsPage.tsx`)
  - Calendar view showing all meetings
  - Option to create new slots
  - View booked vs. available slots
  - Color coding: Green (available), Red (booked), Gray (past)

**Frontend Developer 2**:
- [ ] Create slot creation modal
  - Date range picker
  - Time slot configuration (start, end, duration, buffer)
  - Location input (classroom or virtual)
  - Option to generate virtual link
  - Bulk slot creation (multiple days)
- [ ] Create slot list view (alternative to calendar)
  - Table showing all slots
  - Filters: Date range, status (available/booked)
  - Pagination

**Frontend Developer 1**:
- [ ] Create parent meeting booking page (`pages/parent/BookMeetingPage.tsx`)
  - Calendar view showing teacher's available slots
  - Click to book slot
  - Add agenda/topics to discuss
  - Confirmation modal
- [ ] Create booking confirmation component
  - Display meeting details
  - Add to calendar button
  - Virtual meeting link (if applicable)
  - Option to reschedule or cancel

**Frontend Developer 2**:
- [ ] Create meeting details page
  - Meeting information (date, time, location/link)
  - Participant details
  - Agenda/topics
  - Meeting notes section (teacher only)
  - Follow-up tasks section
- [ ] Implement meeting notes editor
  - Rich text editor for teacher to add notes during meeting
  - Auto-save functionality
  - Generate summary button
- [ ] Test meeting scheduling end-to-end

**Deliverables**:
- ✅ Teachers can create meeting slots via calendar UI
- ✅ Parents can view and book available slots
- ✅ Calendar invites sent to both parties
- ✅ Meeting notes and summaries functional

---

#### Week 6: Progress Reports + Integration

**Sprint Goal**: Automated weekly progress reports generated and sent to parents, integrating data from other modules.

**Day 1-2: Progress Report Backend**

**Backend Developer 1**:
- [ ] Design progress report schema
  - Weekly report structure (attendance, homework, behavior, grades)
  - Term report structure (comprehensive summary)
  - Teacher comment field
- [ ] Create report endpoints (`app/api/v1/reports.py`)
  - `GET /api/v1/reports/weekly/{student_id}` - Get weekly report
  - `GET /api/v1/reports/term/{student_id}` - Get term report
  - `POST /api/v1/reports/{id}/comment` - Add teacher comment
  - `GET /api/v1/reports/history/{student_id}` - Get historical reports
- [ ] Write unit tests

**Backend Developer 2**:
- [ ] Create integration service for pulling data from other modules
  - `app/services/integration_service.py`
  - `get_student_attendance(student_id, date_range)` - From attendance module
  - `get_student_assignments(student_id, date_range)` - From assignment module
  - `get_student_behavior(student_id, date_range)` - From behavior module
  - `get_student_grades(student_id, date_range)` - From grade module
  - Mock these services for now (or integrate if modules exist)
- [ ] Write integration tests

**Full-Stack Developer**:
- [ ] Create report generation service (`app/services/report_service.py`)
  - `generate_weekly_report(student_id)` - Aggregate data from all sources
  - `generate_term_report(student_id)` - Comprehensive report
  - `generate_report_pdf(report_data)` - PDF generation with ReportLab
- [ ] Create scheduled task for weekly report generation
  - `app/tasks/report_tasks.py` - `generate_weekly_reports()`
  - Run every Friday at 5 PM
  - Generate reports for all students
  - Send to parents via notification service
- [ ] Test report generation with mock data

**Deliverables**:
- ✅ Progress report backend functional
- ✅ Weekly reports auto-generated every Friday
- ✅ Reports sent to parents via app notification

---

**Day 3-5: Progress Report Frontend**

**Frontend Developer 1**:
- [ ] Create report service (`services/reportService.ts`)
  - `getWeeklyReport(studentId)`, `getTermReport(studentId)`, `getReportHistory(studentId)`
- [ ] Create progress report page (`pages/parent/ProgressReportPage.tsx`)
  - Display weekly report
  - Sections: Attendance, Homework, Behavior, Academics
  - Visual charts (attendance rate, homework completion, grade trends)
  - Teacher's note section
- [ ] Use Recharts for data visualization
  - Attendance chart (bar chart)
  - Homework completion chart (pie chart)
  - Grade trend chart (line chart)

**Frontend Developer 2**:
- [ ] Create report history page
  - List of all past reports
  - Filters: Date range, report type
  - Download as PDF button
- [ ] Create report detail view
  - Full report display
  - Option to print
  - Option to share (export as PDF)
- [ ] Implement PDF download functionality
  - Call backend API to generate PDF
  - Download file to user's device

**Frontend Developer 1**:
- [ ] Create teacher report review page (`pages/teacher/ReviewReportsPage.tsx`)
  - List of students with pending reports
  - Option to add personalized comment
  - Option to flag concerns (triggers alert to parents)
  - Approve and send report
- [ ] Implement teacher comment editor
  - Text area for teacher's note
  - Character limit indicator
  - Save draft functionality

**Frontend Developer 2**:
- [ ] Create report notification component
  - Show notification when new report available
  - Link to report page
  - Badge on dashboard showing unread reports
- [ ] Test progress report flow end-to-end
- [ ] Ensure reports load quickly (< 2 seconds)

**Deliverables**:
- ✅ Parents can view weekly progress reports
- ✅ Teachers can add comments to reports
- ✅ Reports can be downloaded as PDF
- ✅ Historical reports accessible

---

#### Week 7: Analytics Dashboard

**Sprint Goal**: Teachers, coordinators, and principals can view communication analytics and identify disengaged parents.

**Day 1-3: Analytics Backend**

**Backend Developer 1**:
- [ ] Create analytics data collection service
  - Track all communication events (message_sent, message_read, query_received, query_resolved, meeting_booked, meeting_attended)
  - Store in `communication_analytics` table
  - Aggregate data for dashboards
- [ ] Create analytics endpoints (`app/api/v1/analytics.py`)
  - `GET /api/v1/analytics/dashboard` - Role-based dashboard data
  - `GET /api/v1/analytics/engagement` - Parent engagement metrics
  - `GET /api/v1/analytics/disengaged-parents` - List of disengaged parents
  - `GET /api/v1/analytics/teacher-performance` - Teacher communication stats
  - `POST /api/v1/analytics/export` - Export report (PDF/Excel)

**Backend Developer 2**:
- [ ] Create analytics service (`app/services/analytics_service.py`)
  - `calculate_engagement_score(user_id)` - Based on reads, replies, meeting attendance
  - `identify_disengaged_parents(threshold)` - Parents below engagement threshold
  - `get_communication_trends(date_range)` - Trends over time
  - `get_teacher_performance(teacher_id)` - Response time, resolution rate
- [ ] Implement parent engagement scoring algorithm
  - Factors: Message read rate, reply rate, meeting attendance, query frequency
  - Score: 0-100 (100 = highly engaged, 0 = disengaged)
- [ ] Write unit tests

**Full-Stack Developer**:
- [ ] Create report export service
  - Generate PDF reports with charts (matplotlib or ReportLab)
  - Generate Excel reports (openpyxl)
  - Include: Engagement metrics, trends, disengaged parents, recommendations
- [ ] Create scheduled task for weekly analytics summary
  - `app/tasks/analytics_tasks.py` - `generate_weekly_analytics_summary()`
  - Send to principal/coordinators every Monday
- [ ] Test analytics calculations with mock data

**Deliverables**:
- ✅ Analytics backend APIs functional
- ✅ Parent engagement scoring algorithm working
- ✅ Disengaged parents identified accurately
- ✅ Export reports generated successfully

---

**Day 4-5: Analytics Dashboard Frontend**

**Frontend Developer 1**:
- [ ] Create analytics service (`services/analyticsService.ts`)
  - `getDashboard()`, `getEngagement()`, `getDisengagedParents()`, `exportReport()`
- [ ] Create teacher analytics dashboard (`pages/teacher/AnalyticsDashboard.tsx`)
  - Summary cards: Messages Sent, Average Read Rate, Queries Received, Response Time
  - Charts: Read rate over time, query volume trends
  - List of disengaged parents (in teacher's class)
- [ ] Use Recharts for visualizations
  - Line chart for read rate trends
  - Bar chart for query volume
  - Pie chart for message delivery channels

**Frontend Developer 2**:
- [ ] Create admin analytics dashboard (`pages/admin/AnalyticsDashboard.tsx`)
  - School-wide metrics
  - Summary cards: Total Messages, Overall Engagement, Disengaged Parents Count
  - Charts: Engagement by class, teacher performance comparison
  - Alerts: Low engagement warnings
- [ ] Create disengaged parents page
  - Table showing disengaged parents with scores
  - Filters: Class, engagement threshold, last activity date
  - Option to send follow-up message or schedule call

**Frontend Developer 1**:
- [ ] Create teacher performance page (for coordinators/principals)
  - Table showing all teachers with metrics
  - Columns: Name, Messages Sent, Response Time, Resolution Rate, Engagement Score
  - Sort and filter functionality
  - Drill-down to teacher details
- [ ] Create export functionality
  - Button to download analytics report
  - Choose format: PDF or Excel
  - Date range selector

**Frontend Developer 2**:
- [ ] Create engagement trend page
  - Line charts showing trends over weeks/months
  - Filters: Date range, class, grade
  - Compare current period vs. previous period
- [ ] Test analytics dashboard with real data
- [ ] Ensure charts render correctly and load quickly

**Deliverables**:
- ✅ Teachers can view their communication analytics
- ✅ Admins can view school-wide analytics
- ✅ Disengaged parents identified and displayed
- ✅ Reports can be exported as PDF or Excel

---

**End of Phase 2 (Week 7) - Feature Complete**

**Phase 2 Features Completed**:
- ✅ Meeting scheduling with calendar integration
- ✅ Automated weekly progress reports
- ✅ Comprehensive analytics dashboard
- ✅ Parent engagement tracking
- ✅ Teacher performance metrics

**Checkpoint Review**: Present Phase 2 features to stakeholders
- Demo meeting scheduling flow
- Show automated progress reports
- Show analytics dashboard with engagement metrics
- Gather feedback for Phase 3

---

### Phase 3: Emergency Alerts + Advanced Features (Weeks 8-9)

**Objective**: Add emergency alert system, query management, templates, and polish all features.

---

#### Week 8: Emergency Alerts + Query Management

**Sprint Goal**: Admins can send emergency alerts with multi-channel delivery and tracking, plus structured query management system.

**Day 1-2: Emergency Alert Backend**

**Backend Developer 1**:
- [ ] Create emergency alert endpoint (`app/api/v1/alerts.py`)
  - `POST /api/v1/alerts/emergency` - Send emergency alert
  - `GET /api/v1/alerts/{id}/status` - Real-time delivery status
  - `GET /api/v1/alerts/{id}/acknowledgments` - Who acknowledged
  - `POST /api/v1/alerts/{id}/follow-up` - Send follow-up message
- [ ] Implement emergency alert logic
  - Highest priority delivery (bypass all queues)
  - Multi-channel broadcast (app + SMS + email simultaneously)
  - Voice call integration for non-responders
- [ ] Create voice call service (`app/services/voice_call_service.py`)
  - Integrate with Twilio Voice API
  - Text-to-speech in multiple languages
  - Track call status (answered, voicemail, busy, no answer)

**Backend Developer 2**:
- [ ] Create acknowledgment tracking
  - Parents can acknowledge receipt with one tap
  - Track who acknowledged and when
  - Identify parents who haven't acknowledged
  - Auto-trigger voice calls after 10 minutes
- [ ] Create real-time status dashboard endpoint
  - WebSocket-based real-time updates
  - Show: Total sent, delivered, read, acknowledged, not reached
  - Update every 5 seconds
- [ ] Write unit tests for emergency alerts

**Full-Stack Developer**:
- [ ] Create query management system
  - Create `Query` model (ticket-based system)
  - Fields: id, parent_id, teacher_id, category, subject, description, severity, status, assigned_to, created_at, resolved_at
- [ ] Create query endpoints (`app/api/v1/queries.py`)
  - `POST /api/v1/queries` - Parent submits query
  - `GET /api/v1/queries` - Get queries (filtered by user)
  - `GET /api/v1/queries/{id}` - Get query details
  - `PUT /api/v1/queries/{id}` - Update query status
  - `POST /api/v1/queries/{id}/escalate` - Escalate to coordinator/principal
  - `POST /api/v1/queries/{id}/respond` - Teacher responds to query
- [ ] Implement query routing and escalation logic
- [ ] Write unit tests

**Deliverables**:
- ✅ Emergency alert backend functional
- ✅ Multi-channel delivery with voice calls
- ✅ Real-time acknowledgment tracking
- ✅ Query management system backend ready

---

**Day 3-5: Emergency Alerts + Query Management Frontend**

**Frontend Developer 1**:
- [ ] Create emergency alert page (`pages/admin/EmergencyAlertPage.tsx`)
  - Large red "Emergency Alert" button
  - Template selector (school closure, safety incident, weather)
  - Message composer with translation preview
  - Recipient selector (all parents, grade-specific, class-specific)
  - Confirmation modal (requires double-confirmation)
- [ ] Create real-time delivery status dashboard
  - Live updates via WebSocket
  - Progress bars: Sent, Delivered, Read, Acknowledged
  - List of parents who haven't acknowledged
  - Option to trigger voice calls manually

**Frontend Developer 2**:
- [ ] Create parent acknowledgment UI
  - When emergency alert received, show modal
  - "Acknowledge" button (large, prominent)
  - Display message content
  - Multi-language support
- [ ] Create alert history page
  - List of all emergency alerts sent
  - Date, subject, recipients, acknowledgment rate
  - Drill-down to detailed status

**Frontend Developer 1**:
- [ ] Create query submission form (`pages/parent/SubmitQueryPage.tsx`)
  - Category selector (Academic, Behavioral, Administrative, Safety, Other)
  - Subject and description fields
  - Severity selector (Low, Medium, High, Urgent)
  - File attachment option
  - Submit button
- [ ] Create query list page
  - List of all queries submitted by parent
  - Status badges (Pending, In Progress, Resolved, Escalated)
  - Click to view query details

**Frontend Developer 2**:
- [ ] Create teacher query management page (`pages/teacher/QueriesPage.tsx`)
  - List of queries assigned to teacher
  - Filters: Status, severity, date range
  - Option to respond, resolve, or escalate
  - Response time tracking
- [ ] Create query detail page
  - Full query thread (question + responses)
  - Action buttons (Respond, Escalate, Mark Resolved)
  - Satisfaction survey after resolution
- [ ] Test query management flow end-to-end

**Deliverables**:
- ✅ Admins can send emergency alerts
- ✅ Real-time delivery tracking functional
- ✅ Parents can acknowledge alerts
- ✅ Query management system fully functional

---

#### Week 9: Templates + Advanced Features + Polish

**Sprint Goal**: Add message templates, communication preferences, and polish UI/UX.

**Day 1-2: Templates & Preferences**

**Backend Developer 1**:
- [ ] Create template system
  - Create `Template` model (id, name, category, subject, body, placeholders, language, created_by)
  - Create template endpoints (`app/api/v1/templates.py`)
    - `GET /api/v1/templates` - Get all templates
    - `POST /api/v1/templates` - Create custom template
    - `PUT /api/v1/templates/{id}` - Update template
    - `DELETE /api/v1/templates/{id}` - Delete template
- [ ] Seed 50+ pre-built templates
  - Categories: Daily Updates, Academic, Behavioral, Administrative, Emergency
  - Support placeholders: {StudentName}, {Date}, {Assignment}, {ExamDate}, etc.
- [ ] Write unit tests

**Backend Developer 2**:
- [ ] Create communication preferences system
  - Add fields to User model: notification_preferences (JSON)
    - Preferred channels: {app: true, sms: false, email: true}
    - Notification frequency: immediate | daily_digest | weekly_digest
    - Quiet hours: {start: "22:00", end: "07:00"}
    - Emergency alert opt-out: false (cannot opt out)
- [ ] Create preferences endpoint
  - `GET /api/v1/users/me/preferences` - Get preferences
  - `PUT /api/v1/users/me/preferences` - Update preferences
- [ ] Implement notification batching for daily/weekly digests
- [ ] Write unit tests

**Full-Stack Developer**:
- [ ] Implement quick reply suggestions (AI-powered or rule-based)
  - Analyze parent query content
  - Suggest relevant replies based on keywords
  - Common replies: "Yes, approved", "Please submit formal application", etc.
- [ ] Create notification batching task
  - `app/tasks/notification_tasks.py` - `send_daily_digest()`
  - Run daily at 6 PM
  - Aggregate all messages for the day into one email/SMS
- [ ] Test quick replies with various query types

**Deliverables**:
- ✅ Template system functional with 50+ templates
- ✅ Communication preferences editable by users
- ✅ Quick reply suggestions working
- ✅ Notification batching implemented

---

**Day 3-5: UI/UX Polish + Performance Optimization**

**Frontend Developer 1**:
- [ ] UI/UX improvements
  - Consistent spacing and typography
  - Loading states for all async operations
  - Error states with helpful messages
  - Empty states with illustrations
  - Tooltips for complex features
- [ ] Implement responsive design
  - Mobile-friendly layouts (breakpoints for mobile, tablet, desktop)
  - Touch-friendly buttons and inputs
  - Hamburger menu for mobile navigation

**Frontend Developer 2**:
- [ ] Create notification preferences page (`pages/settings/NotificationPreferences.tsx`)
  - Toggle switches for channels (app, SMS, email)
  - Frequency selector (immediate, daily digest, weekly)
  - Quiet hours time picker
  - Save preferences button
- [ ] Create template library page (`pages/teacher/TemplatesPage.tsx`)
  - Grid view of all templates
  - Filters: Category, language
  - Preview template button
  - Use template button (pre-fills message composer)

**Frontend Developer 1**:
- [ ] Performance optimization
  - Implement lazy loading for images
  - Code splitting for large pages
  - Memoization for expensive computations (React.memo, useMemo)
  - Debouncing for search inputs
  - Virtualization for long lists (react-window)
- [ ] Lighthouse performance audit
  - Target: Performance score > 90
  - Optimize bundle size (analyze with webpack-bundle-analyzer)
  - Minimize third-party scripts

**Frontend Developer 2**:
- [ ] Accessibility improvements
  - ARIA labels for all interactive elements
  - Keyboard navigation support
  - Focus management
  - Screen reader compatibility
  - Color contrast compliance (WCAG AA)
- [ ] Cross-browser testing
  - Test on Chrome, Firefox, Safari, Edge
  - Fix browser-specific issues
  - Ensure consistent experience

**QA Engineer**:
- [ ] Comprehensive testing
  - Regression testing (all features from Phase 1-3)
  - Cross-browser compatibility testing
  - Mobile responsiveness testing
  - Performance testing (load times, API response times)
  - Security testing (XSS, CSRF, SQL injection)
- [ ] Create bug reports and prioritize fixes
- [ ] Verify all P0 and P1 bugs are fixed

**Deliverables**:
- ✅ UI/UX polished and consistent
- ✅ Performance optimized (Lighthouse score > 90)
- ✅ Accessibility compliant
- ✅ Cross-browser compatibility ensured

---

**End of Phase 3 (Week 9) - Feature Complete & Polished**

**Phase 3 Features Completed**:
- ✅ Emergency alert system with multi-channel delivery
- ✅ Query/concern management with escalation
- ✅ Template library (50+ templates)
- ✅ Communication preferences
- ✅ Quick reply suggestions
- ✅ UI/UX polished
- ✅ Performance optimized

**Final Review**: Present complete system to stakeholders
- Demo all features end-to-end
- Show performance metrics
- Conduct UAT (User Acceptance Testing) with pilot users
- Create punch list for final fixes

---

### Phase 4: Testing & Launch (Week 10)

**Objective**: Comprehensive testing, bug fixes, documentation, and production launch.

---

#### Week 10: Testing, Bug Fixes & Launch

**Day 1-2: Comprehensive Testing**

**QA Engineer**:
- [ ] **Unit Testing**
  - Backend: Ensure 90%+ code coverage
  - Frontend: Ensure 70%+ code coverage
  - Run all test suites and fix failing tests
- [ ] **Integration Testing**
  - Test all API endpoints with various inputs
  - Test third-party integrations (SMS, email, translation, video)
  - Test database operations (CRUD, transactions, rollbacks)
- [ ] **End-to-End Testing**
  - Write E2E tests with Playwright or Cypress
  - Test critical user journeys:
    - Teacher sends message → Parent receives and reads
    - Parent messages teacher → Teacher responds
    - Teacher creates meeting slots → Parent books slot
    - Admin sends emergency alert → All parents receive
  - Run E2E tests in CI/CD pipeline

**Backend Developer 1 + 2**:
- [ ] **Load Testing**
  - Use Locust or Apache JMeter
  - Simulate 5000+ concurrent users
  - Test scenarios:
    - 100 teachers sending messages simultaneously
    - 500 parents opening app at the same time
    - Emergency alert to 2500 parents
  - Identify bottlenecks and optimize
  - Target: API response time < 500ms for 95% of requests

**Full-Stack Developer**:
- [ ] **Security Testing**
  - Penetration testing (automated tools: OWASP ZAP)
  - Check for vulnerabilities: SQL injection, XSS, CSRF
  - Verify JWT token security (expiration, refresh logic)
  - Ensure data encryption (in transit and at rest)
  - Review CORS and CSP policies
- [ ] Fix all security issues immediately

**Deliverables**:
- ✅ All tests passing (unit, integration, E2E)
- ✅ Load testing passed (system handles 5000+ concurrent users)
- ✅ Security testing passed (no critical vulnerabilities)

---

**Day 3: Bug Fixes & Documentation**

**Backend Developer 1 + 2 + Frontend Developer 1 + 2**:
- [ ] Fix all P0 (critical) bugs
- [ ] Fix all P1 (high priority) bugs
- [ ] Triage P2 (medium) bugs (fix if time permits, otherwise defer to post-launch)
- [ ] Code review for all recent changes
- [ ] Refactor code for maintainability

**Product Manager**:
- [ ] **User Documentation**
  - Create user guides for teachers (how to send messages, schedule meetings)
  - Create user guides for parents (how to use app, book meetings, view reports)
  - Create admin guides (how to send emergency alerts, view analytics)
  - Record video tutorials (5-10 min each)
- [ ] **API Documentation**
  - Update `docs/API.md` with all endpoints
  - Include request/response examples
  - Document authentication and error codes
- [ ] **Deployment Documentation**
  - Update `docs/DEPLOYMENT.md` with production deployment steps
  - Include database migration instructions
  - Document environment variables and configuration

**Deliverables**:
- ✅ All P0 and P1 bugs fixed
- ✅ User documentation complete
- ✅ API documentation updated
- ✅ Deployment guide ready

---

**Day 4: Production Deployment**

**DevOps Engineer**:
- [ ] **Pre-Deployment Checklist**
  - [ ] Production database created and secured
  - [ ] Production environment variables configured
  - [ ] SSL certificates installed
  - [ ] CDN configured (CloudFront or Cloudflare)
  - [ ] Monitoring tools set up (Datadog, New Relic, Sentry)
  - [ ] Logging configured (ELK stack or CloudWatch)
  - [ ] Backup system configured (automated daily backups)
  - [ ] Disaster recovery plan documented

- [ ] **Database Migration**
  - [ ] Run Alembic migrations on production database
  - [ ] Seed initial data (schools, templates, default settings)
  - [ ] Verify data integrity

- [ ] **Backend Deployment**
  - [ ] Build Docker images for production
  - [ ] Push images to container registry (Docker Hub, ECR)
  - [ ] Deploy to production environment (ECS, EC2, or Kubernetes)
  - [ ] Configure auto-scaling (scale up/down based on load)
  - [ ] Test backend APIs on production (smoke tests)

- [ ] **Frontend Deployment**
  - [ ] Build production frontend (npm run build)
  - [ ] Deploy to S3 + CloudFront (or Netlify/Vercel)
  - [ ] Configure custom domain and SSL
  - [ ] Test frontend on production URL

- [ ] **Post-Deployment Verification**
  - [ ] Health check endpoints return 200 OK
  - [ ] Database connections successful
  - [ ] Third-party integrations working (SMS, email, translation)
  - [ ] WebSocket connections stable
  - [ ] Monitoring dashboards showing data

**Deliverables**:
- ✅ Backend deployed to production
- ✅ Frontend deployed to production
- ✅ All systems operational
- ✅ Monitoring and logging active

---

**Day 5: Launch Preparation & Go-Live**

**Product Manager**:
- [ ] **Pilot School Onboarding**
  - [ ] Onboard 1-2 pilot schools (50-100 users)
  - [ ] Import student/parent/teacher data
  - [ ] Conduct training sessions (2-hour workshop)
  - [ ] Provide onboarding materials (videos, guides)
  - [ ] Set up support channel (email, phone, chat)

- [ ] **Communication Plan**
  - [ ] Send launch announcement to pilot schools
  - [ ] Email templates for teachers and parents
  - [ ] Social media posts (if applicable)
  - [ ] Press release (if applicable)

- [ ] **Success Metrics Tracking**
  - [ ] Set up analytics tracking (Google Analytics, Mixpanel)
  - [ ] Define KPIs to monitor:
    - Daily active users (DAU)
    - Message delivery rate (target: 99%+)
    - Message read rate (target: 90%+)
    - Parent satisfaction (NPS survey)
    - System uptime (target: 99.9%+)
  - [ ] Create dashboard for stakeholders

**Backend Developer 1 + 2 + Full-Stack Developer**:
- [ ] Monitor production systems for first 24 hours
  - Watch for errors in logs
  - Monitor API response times
  - Check database performance
  - Verify message delivery (SMS, email, push)
  - Be on-call for emergency fixes

**Frontend Developer 1 + 2**:
- [ ] Monitor frontend performance
  - Check for JavaScript errors (Sentry)
  - Monitor page load times
  - Verify WebSocket connections
  - Test on different devices and browsers

**QA Engineer**:
- [ ] Conduct smoke testing on production
  - Test all critical user journeys
  - Verify data integrity
  - Test with pilot school users
  - Document any issues

**Deliverables**:
- ✅ Pilot schools onboarded
- ✅ Training sessions conducted
- ✅ System monitored for 24 hours
- ✅ No critical issues reported

---

**🎉 PRODUCTION LAUNCH - Week 10, Day 5**

**Post-Launch Activities**:

**Week 11 (Post-Launch Week 1)**:
- [ ] Daily monitoring of system health
- [ ] Gather feedback from pilot school users
- [ ] Fix any bugs reported by users (prioritize P0, P1)
- [ ] Conduct retrospective meeting with team
  - What went well?
  - What can be improved?
  - Lessons learned for future modules

**Week 12-16 (Months 1-2)**:
- [ ] Onboard additional schools (5-10 schools)
- [ ] Gather more feedback and iterate
- [ ] Plan Phase 4 features (post-MVP enhancements):
  - Parent community feed
  - Video calling integration
  - AI-powered insights
  - Mobile app (React Native)
- [ ] Optimize based on usage analytics
- [ ] Scale infrastructure as needed

---

## 4. Team Structure & Responsibilities

### Core Team (7 members)

#### 1. **Product Manager** (1 person)
**Responsibilities**:
- Define and prioritize features
- Create and maintain product roadmap
- Manage stakeholder communication
- Conduct user research and feedback sessions
- Write user stories and acceptance criteria
- Oversee UAT and pilot onboarding
- Create user documentation and training materials

**Skills Required**:
- Product management experience
- Understanding of EdTech domain
- Stakeholder management
- Technical writing

---

#### 2. **Backend Developer 1** (Senior)
**Responsibilities**:
- Design and implement core backend architecture
- Develop authentication and authorization
- Build messaging and translation services
- Implement multi-channel delivery (SMS, email, push)
- Create Celery tasks for background processing
- Write unit tests (target: 90% coverage)

**Skills Required**:
- Python 3.11+, FastAPI 0.104+
- SQLAlchemy 2.0, PostgreSQL 15+
- JWT authentication, bcrypt
- Experience with Celery and Redis
- API design and RESTful principles
- 5+ years backend development experience

---

#### 3. **Backend Developer 2** (Mid-level)
**Responsibilities**:
- Implement API endpoints
- Integrate third-party services (SMS gateways, email services)
- Build meeting scheduling system
- Develop query management system
- Create analytics and reporting services
- Write unit tests

**Skills Required**:
- Python 3.11+, FastAPI 0.104+
- SQLAlchemy 2.0, PostgreSQL 15+
- Experience with third-party API integration
- Background task processing (Celery)
- 3+ years backend development experience

---

#### 4. **Full-Stack Developer** (Senior)
**Responsibilities**:
- Build real-time chat with WebSocket (Socket.io)
- Integrate MongoDB for chat storage
- Develop progress report generation system
- Create data integration services (pull from other modules)
- Implement PDF generation (ReportLab)
- Bridge frontend and backend (integration work)

**Skills Required**:
- Python (backend) + TypeScript (frontend)
- WebSocket programming (Socket.io)
- MongoDB, Redis
- React 19, Material-UI v7
- Full-stack architecture
- 5+ years full-stack experience

---

#### 5. **Frontend Developer 1** (Senior)
**Responsibilities**:
- Set up React 19 + TypeScript + Vite project
- Design and implement UI components (reusable component library)
- Build message composer and broadcasting UI
- Develop chat interface with real-time updates
- Implement analytics dashboards with charts
- Ensure responsive design and accessibility

**Skills Required**:
- React 19, TypeScript 5.9
- Material-UI v7
- Vite 7.1.9
- State management (Context API, Redux Toolkit)
- WebSocket integration (Socket.io-client)
- Recharts or Chart.js
- 5+ years frontend development experience

---

#### 6. **Frontend Developer 2** (Mid-level)
**Responsibilities**:
- Build authentication UI (login, register)
- Develop meeting scheduling UI (calendar, booking)
- Create progress report display pages
- Implement notification preferences UI
- Build template library and quick reply features
- Write component tests (Jest, React Testing Library)

**Skills Required**:
- React 19, TypeScript 5.9
- Material-UI v7
- React Hook Form, Yup validation
- FullCalendar for scheduling UI
- 3+ years frontend development experience

---

#### 7. **DevOps Engineer** (Part-time, 50%)
**Responsibilities**:
- Set up AWS infrastructure (RDS, ElastiCache, S3, ECS/EC2)
- Configure CI/CD pipelines (GitHub Actions)
- Create Docker containers for backend and frontend
- Set up monitoring and logging (Datadog, Sentry)
- Manage database migrations and backups
- Handle production deployment and scaling

**Skills Required**:
- AWS (EC2, RDS, S3, ElastiCache, ECS)
- Docker, Docker Compose
- CI/CD (GitHub Actions, GitLab CI)
- Monitoring tools (Datadog, New Relic, Sentry)
- PostgreSQL, MongoDB, Redis administration
- 3+ years DevOps experience

---

#### 8. **QA Engineer** (1 person)
**Responsibilities**:
- Write and execute test plans
- Perform manual testing (functional, regression, UAT)
- Write automated tests (unit, integration, E2E)
- Conduct load testing and performance testing
- Perform security testing
- Track bugs and verify fixes
- Ensure quality standards are met before release

**Skills Required**:
- Manual testing and test case writing
- Automated testing (Pytest, Jest, Playwright/Cypress)
- Load testing (Locust, JMeter)
- Security testing basics
- 3+ years QA experience

---

#### 9. **UI/UX Designer** (Part-time, Weeks 1-2 only)
**Responsibilities**:
- Review existing admission system UI for consistency
- Design UI mockups for new features (message composer, chat, meeting calendar)
- Create design system (colors, typography, spacing)
- Provide design assets (icons, illustrations)
- Conduct usability reviews

**Skills Required**:
- UI/UX design experience
- Figma or Adobe XD
- Understanding of Material Design
- EdTech experience (preferred)

---

### Team Communication & Collaboration

**Daily Standup** (15 minutes, 10:00 AM):
- What did you complete yesterday?
- What are you working on today?
- Any blockers?

**Weekly Sprint Review** (Friday, 4:00 PM):
- Demo completed features
- Review sprint goals (achieved vs. missed)
- Gather feedback from stakeholders

**Weekly Sprint Planning** (Monday, 10:00 AM):
- Review backlog
- Prioritize tasks for upcoming week
- Assign tasks to team members
- Estimate story points

**Tools**:
- Project Management: Jira, Linear, or Asana
- Communication: Slack or Microsoft Teams
- Version Control: GitHub
- Design: Figma
- Documentation: Confluence or Notion

---

## 5. Technology Stack & Tools

### Backend Technologies

**Core Framework**:
- **FastAPI 0.104+**: Modern, fast Python web framework
- **Python 3.11+**: Latest Python version
- **Uvicorn**: ASGI server for FastAPI

**Database**:
- **PostgreSQL 15+**: Primary relational database
- **MongoDB 6+**: Chat message storage (NoSQL)
- **Redis 7+**: Caching and session management

**ORM & Migrations**:
- **SQLAlchemy 2.0**: Python SQL toolkit and ORM
- **Alembic 1.12+**: Database migration tool

**Authentication & Security**:
- **python-jose[cryptography]**: JWT token creation and verification
- **passlib[bcrypt]**: Password hashing
- **bcrypt 4.0.1**: Password hashing algorithm

**Task Queue**:
- **Celery 5.3+**: Distributed task queue
- **Redis**: Message broker for Celery

**Real-Time**:
- **python-socketio**: WebSocket implementation for FastAPI
- **Socket.io**: Real-time bidirectional communication

**Third-Party Integrations**:
- **twilio** or **msg91-python**: SMS gateway
- **sendgrid** or **boto3** (AWS SES): Email service
- **azure-cognitiveservices-translator** or **google-cloud-translate**: Translation API
- **firebase-admin**: Firebase Cloud Messaging (push notifications)
- **boto3**: AWS SDK (S3, SES, etc.)
- **reportlab**: PDF generation
- **openpyxl**: Excel generation

**Testing**:
- **pytest**: Testing framework
- **pytest-asyncio**: Async test support
- **httpx**: Async HTTP client for testing
- **faker**: Generate fake data for tests

**Code Quality**:
- **black**: Code formatter
- **flake8**: Linting
- **mypy**: Static type checker
- **isort**: Import sorting

---

### Frontend Technologies

**Core Framework**:
- **React 19**: JavaScript library for building UI
- **TypeScript 5.9**: Type-safe JavaScript
- **Vite 7.1.9**: Build tool and dev server

**UI Library**:
- **Material-UI v7.3** (@mui/material): React component library
- **@mui/icons-material**: Icon library
- **@emotion/react** & **@emotion/styled**: CSS-in-JS

**State Management**:
- **React Context API**: Built-in state management
- **Redux Toolkit**: For complex global state (if needed)

**Routing**:
- **React Router 7.9**: Client-side routing

**Form Handling**:
- **React Hook Form 7.64**: Performant form library
- **Yup 1.7**: Schema validation

**HTTP Client**:
- **Axios 1.12**: Promise-based HTTP client

**Real-Time**:
- **socket.io-client**: WebSocket client

**Date & Time**:
- **Day.js 1.11**: Lightweight date library

**Charts & Visualization**:
- **Recharts**: Composable charting library
- Or **Chart.js** with **react-chartjs-2**

**Rich Text Editor**:
- **Quill** or **Draft.js**: WYSIWYG editor

**File Upload**:
- **react-dropzone**: Drag-and-drop file upload

**Calendar**:
- **FullCalendar**: Feature-rich calendar component

**Notifications**:
- **react-toastify**: Toast notifications

**Testing**:
- **Jest**: Testing framework
- **React Testing Library**: React component testing
- **Playwright** or **Cypress**: E2E testing

**Code Quality**:
- **ESLint**: Linting
- **Prettier**: Code formatter

---

### DevOps & Infrastructure

**Cloud Provider**:
- **AWS** (preferred) or **Azure** or **Google Cloud**

**Compute**:
- **AWS ECS (Fargate)**: Container orchestration
- Or **AWS EC2**: Virtual machines
- Or **Kubernetes (EKS)**: For larger scale

**Database**:
- **AWS RDS (PostgreSQL)**: Managed PostgreSQL
- **MongoDB Atlas**: Managed MongoDB
- **AWS ElastiCache (Redis)**: Managed Redis

**Storage**:
- **AWS S3**: Object storage for files

**Load Balancing**:
- **AWS Application Load Balancer (ALB)**: Distribute traffic

**CDN**:
- **AWS CloudFront** or **Cloudflare**: Content delivery

**SSL**:
- **AWS Certificate Manager**: Free SSL certificates

**Monitoring & Logging**:
- **Datadog** or **New Relic**: Application performance monitoring
- **Sentry**: Error tracking
- **AWS CloudWatch**: Logs and metrics
- Or **ELK Stack** (Elasticsearch, Logstash, Kibana)

**CI/CD**:
- **GitHub Actions**: Automated builds and deployments
- Or **GitLab CI** or **CircleCI**

**Containers**:
- **Docker**: Containerization
- **Docker Compose**: Local development

**Version Control**:
- **GitHub** or **GitLab**: Git repository hosting

---

## 6. Database Design

### PostgreSQL Tables (Relational Data)

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    role VARCHAR(50) NOT NULL, -- 'parent', 'teacher', 'admin', 'principal', 'coordinator'
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en', -- 'en', 'hi', 'ta', 'te', 'bn', etc.
    has_app_installed BOOLEAN DEFAULT FALSE,
    fcm_token VARCHAR(255), -- Firebase Cloud Messaging token for push notifications
    communication_preferences JSONB DEFAULT '{"app": true, "sms": true, "email": true, "frequency": "immediate", "quiet_hours": {"start": "22:00", "end": "07:00"}}',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
```

#### Schools Table
```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    settings JSONB DEFAULT '{}', -- School-specific settings
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Students Table
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    name VARCHAR(255) NOT NULL,
    class VARCHAR(50), -- 'Pre-KG', 'Class 1', 'Class 10', etc.
    grade INTEGER, -- Numeric grade for filtering
    section VARCHAR(10), -- 'A', 'B', 'C'
    roll_number VARCHAR(50),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_students_class ON students(class);
```

#### Student-Parent Relationships Table
```sql
CREATE TABLE student_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    parent_id UUID NOT NULL REFERENCES users(id),
    relationship VARCHAR(50), -- 'mother', 'father', 'guardian'
    is_primary_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_parents_student ON student_parents(student_id);
CREATE INDEX idx_student_parents_parent ON student_parents(parent_id);
```

#### Student-Teacher Relationships Table
```sql
CREATE TABLE student_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(100), -- 'Class Teacher', 'Mathematics', 'Science', etc.
    is_class_teacher BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_teachers_student ON student_teachers(student_id);
CREATE INDEX idx_student_teachers_teacher ON student_teachers(teacher_id);
```

#### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type VARCHAR(50) NOT NULL, -- 'broadcast', 'direct', 'emergency', 'progress_report'
    subject VARCHAR(500),
    body TEXT NOT NULL,
    original_language VARCHAR(10) DEFAULT 'en',
    attachments JSONB, -- [{"filename": "homework.pdf", "url": "https://...", "size": 102400}]
    recipients JSONB, -- {"type": "class", "class_id": "uuid"} or {"type": "individual", "user_ids": []}
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_school ON messages(school_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_type ON messages(message_type);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
```

#### Message Translations Table
```sql
CREATE TABLE message_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL, -- 'hi', 'ta', 'te', etc.
    translated_subject VARCHAR(500),
    translated_body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_translations_message ON message_translations(message_id);
CREATE INDEX idx_translations_language ON message_translations(language);
```

#### Message Deliveries Table
```sql
CREATE TABLE message_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id),
    channel VARCHAR(20) NOT NULL, -- 'app', 'sms', 'email', 'voice'
    delivery_status VARCHAR(50) NOT NULL, -- 'pending', 'sent', 'delivered', 'failed', 'read'
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT, -- If delivery failed
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deliveries_message ON message_deliveries(message_id);
CREATE INDEX idx_deliveries_recipient ON message_deliveries(recipient_id);
CREATE INDEX idx_deliveries_status ON message_deliveries(delivery_status);
```

#### Conversations Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    parent_id UUID NOT NULL REFERENCES users(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    student_id UUID REFERENCES students(id), -- Optional, link to specific student
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'resolved', 'escalated'
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_parent ON conversations(parent_id);
CREATE INDEX idx_conversations_teacher ON conversations(teacher_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at);
```

#### Meetings Table
```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID REFERENCES users(id), -- NULL if slot not booked yet
    student_id UUID REFERENCES students(id),
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    meeting_type VARCHAR(20) NOT NULL, -- 'in_person', 'virtual'
    location VARCHAR(255), -- Classroom name or virtual meeting link
    agenda TEXT, -- Parent's topics to discuss
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'booked', 'completed', 'cancelled', 'no_show'
    meeting_notes TEXT, -- Teacher's notes during meeting
    summary TEXT, -- Auto-generated or teacher-written summary
    follow_up_tasks JSONB, -- [{"task": "Monitor homework", "due_date": "2025-11-01"}]
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meetings_teacher ON meetings(teacher_id);
CREATE INDEX idx_meetings_parent ON meetings(parent_id);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_meetings_status ON meetings(status);
```

#### Queries Table (Ticket System)
```sql
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    parent_id UUID NOT NULL REFERENCES users(id),
    teacher_id UUID REFERENCES users(id), -- Assigned teacher
    student_id UUID REFERENCES students(id),
    category VARCHAR(50) NOT NULL, -- 'academic', 'behavioral', 'administrative', 'safety', 'other'
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'escalated'
    assigned_to UUID REFERENCES users(id), -- Current handler (teacher, coordinator, principal)
    resolved_at TIMESTAMP,
    parent_satisfaction INTEGER, -- 1-5 rating after resolution
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_queries_parent ON queries(parent_id);
CREATE INDEX idx_queries_teacher ON queries(teacher_id);
CREATE INDEX idx_queries_status ON queries(status);
CREATE INDEX idx_queries_severity ON queries(severity);
```

#### Query Responses Table
```sql
CREATE TABLE query_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    responder_id UUID NOT NULL REFERENCES users(id),
    response_text TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_query_responses_query ON query_responses(query_id);
```

#### Templates Table
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id), -- NULL for system-wide templates
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- 'daily_update', 'academic', 'behavioral', 'administrative', 'emergency'
    subject VARCHAR(500),
    body TEXT NOT NULL,
    placeholders JSONB, -- ["{StudentName}", "{Date}", "{Assignment}"]
    language VARCHAR(10) DEFAULT 'en',
    is_system_template BOOLEAN DEFAULT FALSE, -- True for pre-built templates
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_school ON templates(school_id);
CREATE INDEX idx_templates_category ON templates(category);
```

#### Communication Analytics Table
```sql
CREATE TABLE communication_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    user_id UUID NOT NULL REFERENCES users(id),
    user_role VARCHAR(50),
    metric_type VARCHAR(100) NOT NULL, -- 'message_sent', 'message_read', 'query_received', 'query_resolved', 'meeting_booked', 'meeting_attended'
    metric_value INTEGER DEFAULT 1,
    metadata JSONB, -- Additional context (e.g., response time, read time)
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_school ON communication_analytics(school_id);
CREATE INDEX idx_analytics_user ON communication_analytics(user_id);
CREATE INDEX idx_analytics_type ON communication_analytics(metric_type);
CREATE INDEX idx_analytics_date ON communication_analytics(recorded_at);
```

---

### MongoDB Collections (NoSQL Data)

#### Chat Messages Collection
```json
{
  "_id": "ObjectId",
  "conversation_id": "UUID (from PostgreSQL conversations table)",
  "sender_id": "UUID",
  "sender_role": "parent | teacher",
  "message_text": "String",
  "original_language": "en | hi | ta | te | ...",
  "translations": {
    "en": "English translation",
    "hi": "Hindi translation",
    "ta": "Tamil translation"
  },
  "attachments": [
    {
      "filename": "homework.jpg",
      "url": "https://s3.amazonaws.com/...",
      "size": 102400,
      "type": "image/jpeg"
    }
  ],
  "read_at": "ISODate | null",
  "created_at": "ISODate"
}
```

**Indexes**:
- `conversation_id` (ascending)
- `created_at` (descending) - For pagination
- `read_at` (sparse) - For unread messages

---

### Redis Data Structures (Cache & Sessions)

#### User Sessions
```
Key: session:{user_id}
Type: Hash
Fields: {access_token, refresh_token, expires_at}
TTL: 24 hours
```

#### Translation Cache
```
Key: translation:{text_hash}:{target_language}
Type: String (JSON)
Value: {"translated_text": "..."}
TTL: 7 days
```

#### Rate Limiting
```
Key: rate_limit:{user_id}:{endpoint}
Type: String (counter)
TTL: 1 minute
```

#### WebSocket Connections
```
Key: ws_connections:{user_id}
Type: Set
Value: [socket_id_1, socket_id_2]
TTL: None (removed on disconnect)
```

---

## 7. API Development Plan

### API Versioning Strategy
- All APIs will be versioned under `/api/v1/`
- Future breaking changes will create `/api/v2/`
- Maintain backward compatibility for at least 6 months

### Authentication
- All endpoints except `/auth/register` and `/auth/login` require JWT token
- Token passed in `Authorization: Bearer {token}` header
- Access token expires in 24 hours, refresh token in 30 days

### Error Handling
- Standard HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (invalid/missing token)
  - 403: Forbidden (insufficient permissions)
  - 404: Not Found
  - 500: Internal Server Error
- Error response format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ]
  }
}
```

### Pagination
- Use query parameters: `?page=1&limit=50`
- Response format:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_pages": 10,
    "total_items": 500
  }
}
```

### API Endpoints Summary (40+ endpoints)

**Authentication** (`/api/v1/auth`):
- POST `/register` - Register new user
- POST `/login` - Login
- POST `/refresh` - Refresh access token
- POST `/logout` - Logout

**Users** (`/api/v1/users`):
- GET `/me` - Get current user profile
- PUT `/me` - Update profile
- GET `/me/children` - Parent gets children list
- GET `/me/students` - Teacher gets students list
- GET `/me/preferences` - Get communication preferences
- PUT `/me/preferences` - Update preferences

**Messages** (`/api/v1/messages`):
- POST `/` - Create and send message
- GET `/` - Get messages (filtered by sender/recipient/type)
- GET `/{id}` - Get message details
- PUT `/{id}` - Edit message (within 5 min)
- DELETE `/{id}` - Recall message
- GET `/{id}/deliveries` - Get delivery status
- POST `/{id}/resend` - Resend failed deliveries
- POST `/{id}/mark-read` - Mark message as read

**Conversations** (`/api/v1/conversations`):
- POST `/` - Start new conversation
- GET `/` - Get user's conversations
- GET `/{id}` - Get conversation details
- GET `/{id}/messages` - Get chat history (paginated)
- PUT `/{id}/status` - Update status (resolved, escalated)

**Meetings** (`/api/v1/meetings`):
- POST `/slots` - Teacher creates availability slots
- GET `/slots` - Get available/all slots
- POST `/{id}/book` - Parent books slot
- PUT `/{id}/reschedule` - Reschedule meeting
- DELETE `/{id}` - Cancel meeting
- POST `/{id}/notes` - Teacher adds meeting notes
- GET `/{id}/summary` - Get meeting summary

**Progress Reports** (`/api/v1/reports`):
- GET `/weekly/{student_id}` - Get weekly report
- GET `/term/{student_id}` - Get term report
- POST `/{id}/comment` - Teacher adds comment
- GET `/history/{student_id}` - Get historical reports

**Analytics** (`/api/v1/analytics`):
- GET `/dashboard` - Role-based dashboard
- GET `/engagement` - Parent engagement metrics
- GET `/disengaged-parents` - List of disengaged parents
- GET `/teacher-performance` - Teacher communication stats
- POST `/export` - Export report (PDF/Excel)

**Emergency Alerts** (`/api/v1/alerts`):
- POST `/emergency` - Send emergency alert
- GET `/{id}/status` - Real-time delivery status
- GET `/{id}/acknowledgments` - Who acknowledged
- POST `/{id}/follow-up` - Send follow-up

**Queries** (`/api/v1/queries`):
- POST `/` - Parent submits query
- GET `/` - Get queries (filtered)
- GET `/{id}` - Get query details
- PUT `/{id}` - Update query status
- POST `/{id}/escalate` - Escalate query
- POST `/{id}/respond` - Teacher responds

**Templates** (`/api/v1/templates`):
- GET `/` - Get all templates
- POST `/` - Create custom template
- PUT `/{id}` - Update template
- DELETE `/{id}` - Delete template

**Translation** (`/api/v1/translate`):
- POST `/` - Translate text
- POST `/bulk` - Translate multiple texts

**File Upload** (`/api/v1/upload`):
- POST `/` - Upload file to S3, return URL

---

## 8. Frontend Development Plan

### Component Library Structure

**Atomic Design Approach**:
- **Atoms**: Button, Input, Select, Checkbox, Radio, Badge, Avatar, Icon
- **Molecules**: FormField, Card, SearchBar, DatePicker, FileUpload
- **Organisms**: Navbar, Sidebar, MessageComposer, ChatWindow, Calendar, DataTable
- **Templates**: DashboardLayout, AuthLayout, DetailLayout
- **Pages**: Full pages composed of templates and organisms

### State Management Strategy

**React Context API** (for MVP):
- **AuthContext**: Current user, login/logout, token management
- **WebSocketContext**: WebSocket connection, send/receive messages
- **NotificationContext**: Toast notifications, push notifications

**Redux Toolkit** (if needed for complex state):
- Messages slice (message list, delivery status)
- Conversations slice (conversation list, active conversation)
- Meetings slice (meeting slots, bookings)
- Analytics slice (dashboard data)

### Performance Optimization

**Code Splitting**:
- Lazy load routes: `React.lazy()` for pages
- Chunk vendor libraries separately

**Memoization**:
- `React.memo()` for expensive components
- `useMemo()` for expensive calculations
- `useCallback()` for stable function references

**Virtualization**:
- Use `react-window` for long lists (message history, parent lists)

**Image Optimization**:
- Lazy load images below the fold
- Use WebP format with fallback
- Serve from CDN

**Bundle Size**:
- Tree-shaking unused code
- Analyze bundle with `webpack-bundle-analyzer`
- Target: < 500 KB initial bundle

### Accessibility (WCAG AA Compliance)

- Semantic HTML (header, nav, main, footer, section, article)
- ARIA labels for interactive elements
- Keyboard navigation (tab order, focus management)
- Screen reader compatibility
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible
- Error messages announced to screen readers

### Responsive Design

**Breakpoints**:
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

**Layout Strategy**:
- Mobile-first approach
- Use Material-UI Grid system
- Flexbox and CSS Grid
- Touch-friendly targets (min 44x44px)

### Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (Chrome Android, Safari iOS)

---

## 9. Integration Plan

### Module Integrations

#### 1. Admission System Integration
- **Purpose**: Import student and parent data
- **Approach**:
  - Share PostgreSQL database (same school)
  - Read from `students` and `users` tables
  - Sync data on student enrollment completion
- **API Endpoints Needed**:
  - GET `/api/v1/students` - List all students
  - GET `/api/v1/students/{id}/parents` - Get student's parents

#### 2. Fee Management Integration
- **Purpose**: Send fee reminders and payment confirmations
- **Approach**:
  - Fee system triggers parent communication events
  - When fee due → Send reminder message
  - When payment received → Send confirmation message
- **API Endpoints Needed**:
  - POST `/api/v1/messages` (called by fee system)
- **Webhook**:
  - Fee system webhooks: `payment_received`, `fee_due`, `fee_overdue`

#### 3. Attendance Module Integration
- **Purpose**: Pull attendance data for progress reports
- **Approach**:
  - Mock data for MVP
  - Real integration: Read from attendance database
- **API Endpoints Needed** (from attendance module):
  - GET `/api/v1/attendance/student/{id}?date_from=&date_to=` - Get attendance records

#### 4. Assignment/Homework Module Integration
- **Purpose**: Pull homework completion data for progress reports
- **Approach**:
  - Mock data for MVP
  - Real integration: Read from assignment database
- **API Endpoints Needed** (from assignment module):
  - GET `/api/v1/assignments/student/{id}?status=completed|pending` - Get assignments

#### 5. Behavior Module Integration
- **Purpose**: Pull behavior points/incidents for progress reports
- **Approach**:
  - Mock data for MVP
  - Real integration: Read from behavior database
- **API Endpoints Needed** (from behavior module):
  - GET `/api/v1/behavior/student/{id}?date_from=&date_to=` - Get behavior records

#### 6. Grade/Assessment Module Integration
- **Purpose**: Pull test scores and grades for progress reports
- **Approach**:
  - Mock data for MVP
  - Real integration: Read from grading database
- **API Endpoints Needed** (from grade module):
  - GET `/api/v1/grades/student/{id}?date_from=&date_to=` - Get grade records

### Third-Party Service Integrations

#### 1. SMS Gateway (MSG91 or Twilio)
- **Purpose**: Send SMS to parents
- **Setup**:
  - Sign up for MSG91 account (India-focused)
  - Get API key and sender ID
  - Configure in `.env`: `SMS_API_KEY`, `SMS_SENDER_ID`
- **Testing**: Use test mode initially (free credits)
- **Cost**: ~₹0.20 per SMS (India)

#### 2. Email Service (SendGrid or AWS SES)
- **Purpose**: Send emails to parents
- **Setup**:
  - Sign up for SendGrid account
  - Verify domain (SPF, DKIM records)
  - Get API key
  - Configure in `.env`: `SENDGRID_API_KEY`, `FROM_EMAIL`
- **Testing**: Use sandbox mode initially
- **Cost**: Free tier (100 emails/day), then $15/month (40,000 emails)

#### 3. Translation API (Microsoft Translator or Google Cloud)
- **Purpose**: Translate messages to 10+ Indian languages
- **Setup**:
  - Sign up for Microsoft Azure Translator
  - Get API key and region
  - Configure in `.env`: `TRANSLATOR_API_KEY`, `TRANSLATOR_REGION`
- **Testing**: Free tier (2M characters/month)
- **Cost**: $10 per 1M characters after free tier

#### 4. Firebase Cloud Messaging (FCM)
- **Purpose**: Send push notifications to mobile/web apps
- **Setup**:
  - Create Firebase project
  - Download service account JSON
  - Store in backend: `firebase-credentials.json`
  - Configure in `.env`: `FIREBASE_CREDENTIALS_PATH`
- **Testing**: Test with web browser (PWA notifications)
- **Cost**: Free

#### 5. Google Meet API or Zoom API
- **Purpose**: Generate virtual meeting links
- **Setup**:
  - Create Google Cloud project
  - Enable Google Calendar API
  - Set up OAuth 2.0 credentials
  - Configure in `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Alternative**: Use Zoom API (simpler setup)
- **Testing**: Create test meetings
- **Cost**: Free with Google Workspace account

#### 6. AWS S3
- **Purpose**: Store message attachments and files
- **Setup**:
  - Create S3 bucket
  - Configure IAM user with S3 access
  - Get access key and secret
  - Configure in `.env`: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- **Testing**: Upload test files
- **Cost**: $0.023 per GB/month

---

## 10. Testing Strategy

### Unit Testing

**Backend**:
- **Framework**: Pytest
- **Coverage Target**: 90%+
- **What to Test**:
  - Service layer functions (business logic)
  - Utility functions (validators, formatters)
  - Database models (CRUD operations)
- **Example**:
```python
def test_create_message_service(db_session):
    user = create_test_user()
    message_data = {
        "subject": "Test",
        "body": "Test message",
        "recipients": {"type": "class", "class_id": "uuid"}
    }
    message = message_service.create_message(user.id, message_data)
    assert message.subject == "Test"
    assert message.sender_id == user.id
```

**Frontend**:
- **Framework**: Jest + React Testing Library
- **Coverage Target**: 70%+
- **What to Test**:
  - Component rendering
  - User interactions (clicks, form submissions)
  - State changes
  - API calls (mocked)
- **Example**:
```typescript
test('renders login form', () => {
  render(<LoginPage />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
```

---

### Integration Testing

**Backend**:
- Test API endpoints with real database (TestContainers or in-memory DB)
- Test third-party integrations (use mocks or test accounts)
- **Example**:
```python
def test_send_message_api(client, auth_headers):
    response = client.post(
        "/api/v1/messages",
        json={
            "subject": "Test",
            "body": "Test message",
            "recipients": {"type": "class", "class_id": "uuid"}
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["subject"] == "Test"
```

---

### End-to-End Testing

**Framework**: Playwright or Cypress
**What to Test**:
- Critical user journeys from start to finish
- Cross-browser compatibility
- **Example Test Cases**:
  1. Teacher sends message → Parent receives in app
  2. Parent messages teacher → Teacher responds → Parent sees response
  3. Teacher creates meeting slots → Parent books slot → Both receive confirmation
  4. Admin sends emergency alert → All parents receive and acknowledge

**Example**:
```javascript
test('teacher sends message to parents', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'teacher@school.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.click('text=Send Message');
  await page.fill('[name="subject"]', 'Homework Update');
  await page.fill('[name="body"]', 'Complete pages 42-43');
  await page.selectOption('[name="recipients"]', 'class-3a');
  await page.click('button:has-text("Send")');

  await expect(page.locator('text=Message sent successfully')).toBeVisible();
});
```

---

### Load Testing

**Tool**: Locust or Apache JMeter
**Scenarios**:
1. **Message Broadcasting**:
   - 100 teachers send messages simultaneously
   - Each message to 50 parents
   - Total: 5,000 recipients
   - Target: < 5 seconds to process all

2. **Real-Time Chat**:
   - 500 concurrent WebSocket connections
   - 1,000 messages/minute across all connections
   - Target: < 2 seconds message delivery

3. **API Load**:
   - 5,000 API requests/minute (distributed across endpoints)
   - Target: 95% of requests < 500ms response time

**Example Locust Test**:
```python
from locust import HttpUser, task, between

class ParentUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def view_messages(self):
        self.client.get("/api/v1/messages", headers={"Authorization": f"Bearer {self.token}"})

    @task
    def send_chat_message(self):
        self.client.post(
            "/api/v1/conversations/uuid/messages",
            json={"message": "Hello teacher"},
            headers={"Authorization": f"Bearer {self.token}"}
        )
```

---

### Security Testing

**Tools**: OWASP ZAP, Burp Suite
**What to Test**:
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Authentication bypass
- Authorization flaws
- Sensitive data exposure
- Broken authentication and session management

**Manual Tests**:
- Try accessing other users' data with manipulated user IDs
- Try sending messages without authentication
- Try SQL injection in form inputs
- Check if passwords are hashed in database
- Verify JWT tokens expire correctly

---

### User Acceptance Testing (UAT)

**Participants**: Pilot school teachers, parents, admins
**Duration**: 1 week
**Process**:
1. Onboard 1-2 pilot schools
2. Provide training (2-hour workshop)
3. Ask users to complete predefined tasks:
   - Teachers: Send 5 messages, chat with 3 parents, schedule PTM
   - Parents: Read messages, chat with teacher, book meeting
   - Admins: Send emergency alert, view analytics
4. Gather feedback via surveys and interviews
5. Prioritize and fix issues

---

## 11. Deployment Plan

### Development Environment
- **URL**: `https://dev.sparked-parentcomm.com`
- **Purpose**: Daily deployments for testing
- **Auto-deploy**: On merge to `develop` branch

### Staging Environment
- **URL**: `https://staging.sparked-parentcomm.com`
- **Purpose**: Pre-production testing, UAT
- **Deploy**: Manual trigger after QA approval

### Production Environment
- **URL**: `https://parentcomm.sparked.com`
- **Purpose**: Live system for schools
- **Deploy**: Manual trigger after stakeholder approval

### Deployment Steps (Production)

#### Pre-Deployment Checklist
- [ ] All tests passing (unit, integration, E2E)
- [ ] Load testing passed
- [ ] Security audit passed
- [ ] Stakeholder approval obtained
- [ ] Database backup taken
- [ ] Rollback plan documented

#### Deployment Process
1. **Database Migration**:
   ```bash
   # SSH into production server
   cd /app/backend
   alembic upgrade head
   ```

2. **Backend Deployment**:
   ```bash
   # Build Docker image
   docker build -f docker/Dockerfile.backend -t sparked/parent-comm-backend:v1.0 .

   # Push to registry
   docker push sparked/parent-comm-backend:v1.0

   # Deploy to ECS/EC2
   ecs-cli compose --file docker-compose.prod.yml up
   ```

3. **Frontend Deployment**:
   ```bash
   # Build production bundle
   cd frontend/web-app
   npm run build

   # Deploy to S3 + CloudFront
   aws s3 sync dist/ s3://sparked-parentcomm-frontend/
   aws cloudfront create-invalidation --distribution-id E123456 --paths "/*"
   ```

4. **Verify Deployment**:
   - Check health endpoint: `GET /health` returns 200 OK
   - Test login flow
   - Test sending a message
   - Check monitoring dashboard (no errors)

5. **Monitor for 24 Hours**:
   - Watch error logs (Sentry)
   - Monitor API response times (Datadog)
   - Check database performance (CloudWatch)
   - Be on-call for critical issues

#### Rollback Plan
If critical issue detected:
1. Revert to previous Docker image: `sparked/parent-comm-backend:v0.9`
2. Rollback database migration: `alembic downgrade -1`
3. Revert frontend: Deploy previous S3 version
4. Notify stakeholders of rollback
5. Post-mortem meeting within 24 hours

---

### Zero-Downtime Deployment Strategy

**Blue-Green Deployment**:
- Maintain two identical environments: Blue (current) and Green (new)
- Deploy new version to Green environment
- Test Green environment
- Switch traffic from Blue to Green (load balancer)
- Keep Blue as rollback option for 24 hours

**Database Migration Strategy**:
- Use backward-compatible migrations (no breaking changes)
- Add new columns as nullable initially
- Deprecate old columns gradually (not drop immediately)

---

## 12. Risk Management

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SMS gateway failures | Medium | High | Multiple gateways, retry logic |
| Translation errors | Medium | Medium | Manual preview, quality audits |
| WebSocket scaling issues | Medium | High | Redis, horizontal scaling, load testing |
| Database bottlenecks | Low | High | Indexing, read replicas, caching |
| Low parent adoption | High | High | SMS/email fallback, onboarding support |
| Teacher resistance | Medium | High | Training, mandate usage, show ROI |
| Security breach | Low | Critical | Encryption, security audits, monitoring |
| Third-party API downtime | Low | Medium | Fallback mechanisms, SLA monitoring |

---

## 13. Success Criteria & Go-Live Checklist

### Success Criteria

**Technical Metrics**:
- ✅ 99%+ message delivery rate
- ✅ < 500ms API response time (95th percentile)
- ✅ 99.9% system uptime
- ✅ 90%+ backend code coverage
- ✅ Zero critical security vulnerabilities

**User Metrics**:
- ✅ 90%+ message read rate within 24 hours
- ✅ 70% reduction in teacher communication time
- ✅ 95%+ parent satisfaction score (NPS)
- ✅ < 5% meeting no-show rate
- ✅ 80%+ parent app adoption within 3 months

**Business Metrics**:
- ✅ 2+ pilot schools successfully onboarded
- ✅ 100+ active users (teachers + parents)
- ✅ 1,000+ messages sent in first month
- ✅ Positive feedback from stakeholders
- ✅ No critical production incidents

---

### Go-Live Checklist

#### Technical Readiness
- [ ] All features implemented and tested
- [ ] All P0 and P1 bugs fixed
- [ ] Load testing passed (5,000+ concurrent users)
- [ ] Security testing passed (no critical vulnerabilities)
- [ ] Database migrations tested
- [ ] Backup and disaster recovery tested
- [ ] Monitoring and alerting configured
- [ ] Logging working (errors captured in Sentry)
- [ ] Health check endpoints operational

#### Infrastructure Readiness
- [ ] Production environment provisioned (AWS RDS, ElastiCache, S3, ECS)
- [ ] Load balancer configured with SSL
- [ ] CDN configured (CloudFront)
- [ ] Domain configured (DNS records)
- [ ] SSL certificates installed
- [ ] Environment variables configured
- [ ] Third-party services configured (SMS, email, translation, FCM)
- [ ] Database backups automated

#### Documentation Readiness
- [ ] User guides created (teachers, parents, admins)
- [ ] Video tutorials recorded
- [ ] API documentation complete
- [ ] Deployment guide complete
- [ ] Troubleshooting guide created
- [ ] FAQ document created

#### Operational Readiness
- [ ] Support team trained
- [ ] On-call rotation scheduled
- [ ] Incident response plan documented
- [ ] Rollback plan documented
- [ ] Communication plan for launch announcement
- [ ] Pilot schools identified and contacted
- [ ] Training sessions scheduled

#### Business Readiness
- [ ] Stakeholder approval obtained
- [ ] Pilot school agreements signed
- [ ] Pricing finalized (if applicable)
- [ ] Launch date confirmed
- [ ] Success metrics defined
- [ ] Feedback collection plan ready

---

**🎉 When all checklist items are complete, system is READY FOR PRODUCTION LAUNCH!**

---

## Appendix A: Development Tools & Resources

### Recommended Tools
- **IDE**: VSCode, PyCharm, WebStorm
- **API Testing**: Postman, Thunder Client, Insomnia
- **Database GUI**: DBeaver, pgAdmin, TablePlus
- **Git Client**: GitKraken, Sourcetree, or built-in IDE
- **Design**: Figma
- **Project Management**: Jira, Linear, Asana
- **Communication**: Slack, Microsoft Teams
- **Documentation**: Confluence, Notion, Google Docs

### Learning Resources
- FastAPI: https://fastapi.tiangolo.com/
- React 19: https://react.dev/
- Material-UI: https://mui.com/
- Socket.io: https://socket.io/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- MongoDB: https://docs.mongodb.com/
- Redis: https://redis.io/docs/
- AWS: https://docs.aws.amazon.com/

---

## Appendix B: Contact & Support

**Project Lead**: [Product Manager Name]
**Technical Lead**: [Tech Lead Name]
**Email**: team@sparked.com
**Slack Channel**: #parent-communication
**GitHub**: https://github.com/sparked/parent-communication-system

---

**End of Implementation Plan**

**Document Statistics**:
- Pages: ~90 (when formatted)
- Word Count: ~25,000+
- Sections: 13 major sections + 2 appendices
- Timeline: 10 weeks (MVP to Production)
- Team Size: 7 core members + 1 part-time designer

**Next Steps**:
1. Review and approval from stakeholders ✅
2. Begin Week 0 project setup
3. Kick off Phase 1 development (Week 1)

---

*Document created by: Product Team*
*For: Sparked EdTech Platform - Parent Communication Module*
*Date: October 13, 2025*
*Status: Ready for Development Kickoff*
