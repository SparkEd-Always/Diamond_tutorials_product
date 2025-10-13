# Teacher-Student Interaction System (LMS) - Development Prompt

## 🎯 Use this prompt to start LMS development

---

```
Hi Claude,

I want to develop the next module for the Sparked EdTech platform.

Module: Teacher-Student Interaction System (Learning Management System - LMS)
Category: Academics (Learning & Instruction)

Please follow the MODULE_DEVELOPMENT_GUIDE.md process:

1. Check study/admin_tasks_teacher_student_interaction.md for comprehensive module details
2. Check docs/requirements/modules/technology/erp-sis-lms-administration.md for existing LMS infrastructure requirements
3. Perform research on Learning Management Systems (LMS), best practices for K-12 education, Indian school requirements
4. Generate comprehensive PRD (140-180 pages) with detailed user journeys for:
   - Teachers (create courses, conduct classes, assign work, grade submissions, provide feedback)
   - Students (attend classes, submit assignments, take quizzes, access resources, track progress)
   - Parents (monitor child's learning, view grades, communicate with teachers)
   - Class Coordinators (oversee class activities, track class progress)
   - Content Creators (develop educational content, multimedia materials)
   - Academic Administrators (oversee teaching quality, curriculum delivery)
5. Create implementation plan (95-120 pages) with 16-week timeline:
   - Phase 1: Core LMS (Weeks 1-4)
     * Course creation, content upload
     * Assignment creation, submission, grading
     * Student enrollment, class management
     * Basic dashboards (teacher, student)
     * Manual attendance marking
     * Basic announcements
   - Phase 2: Communication & Collaboration (Weeks 5-7)
     * Discussion forums, Q&A boards
     * Direct messaging, group chats
     * Live class integration (Zoom, Google Meet)
     * Enhanced notifications (email, SMS, push)
     * File sharing, resource library
   - Phase 3: Assessments & Analytics (Weeks 8-10)
     * Quiz builder (MCQ, short answer, essay)
     * Auto-grading, rubric-based grading
     * Student analytics (progress tracking, at-risk identification)
     * Teacher analytics (class performance, engagement metrics)
     * Progress reports for parents
   - Phase 4: Advanced Features (Weeks 11-13)
     * Gamification (points, badges, leaderboards)
     * Offline mode, mobile apps
     * Parent portal integration
     * AI-powered content recommendations
     * Predictive analytics
   - Phase 5: Integrations & Polish (Weeks 14-16)
     * SIS integration (auto-enrollment, grade sync)
     * Attendance module integration
     * Timetable module integration
     * API for external integrations
     * Performance optimization, load testing
     * User training, documentation
6. Create project structure: teacher-student-interaction-system/
7. Create all essential documentation files (README, CLAUDE, QUICKSTART, TODO, CONTEXT, PROJECT_STRUCTURE, SETUP_SUCCESS, FINAL_SUMMARY, INDEX, API, DATABASE_SCHEMA)
8. Set up backend skeleton (FastAPI + SQLAlchemy + PostgreSQL)
9. Set up frontend skeleton (React 19 + TypeScript + Material-UI v7)

Technologies to use (same as admission-system and fee-management-system):
- Backend: FastAPI 0.104+ | Python 3.11+ | SQLAlchemy 2.0 | PostgreSQL 15+ | JWT | WebSockets (for real-time)
- Frontend: React 19 | TypeScript 5.9 | Vite 7.1.9 | Material-UI v7.3 | Axios 1.12
- Additional:
  * Video: WebRTC (built-in) or Zoom SDK, Google Meet API
  * Real-time: Socket.io / WebSockets (for live classes, messaging)
  * File Storage: AWS S3 / MinIO (for content, assignments)
  * Video Streaming: HLS, DASH (adaptive bitrate streaming)
  * PDF Generation: ReportLab (for certificates, reports)
  * Caching: Redis (for frequently accessed content)
  * Search: Elasticsearch (for content search)
  * Background Jobs: Celery + Redis (for grading, notifications)
  * AI: OpenAI API / Claude API (for auto-grading, tutoring chatbot)

Key Features to Implement:

### Core LMS Features (Phase 1):
- Course creation and management
- Content upload (videos, PDFs, presentations, links)
- Assignment creation with instructions, rubrics, deadlines
- Student submission portal
- Grading interface (manual grading with rubrics)
- Class enrollment (auto from SIS)
- Teacher and student dashboards
- Attendance marking (manual)
- Basic announcements
- Notification system (email, SMS, push)

### Communication Features (Phase 2):
- Discussion forums (topic-based, threaded)
- Direct messaging (teacher-student, one-on-one)
- Group chats (study groups, project teams)
- Live class integration (Zoom, Google Meet, or built-in WebRTC)
- Class recording and playback
- File sharing and collaborative workspace
- Virtual office hours (scheduled availability)
- Announcement broadcast (class-wide, school-wide)

### Assessment Features (Phase 3):
- Quiz builder (MCQ, true/false, short answer, essay, fill-in-blanks)
- Question bank (reusable, tagged by topic, difficulty)
- Auto-grading (objective questions)
- Rubric-based grading (subjective questions)
- Timed assessments with auto-submission
- Randomization (question order, answer shuffling)
- Proctoring (webcam, tab switching detection)
- Plagiarism detection (text submissions)

### Analytics Features (Phase 3):
- Student progress tracking (grades, completion, time spent)
- At-risk student identification (AI-powered, 85%+ accuracy)
- Teacher analytics (class performance, engagement metrics)
- Learning analytics (content access, quiz attempts, patterns)
- Progress reports (auto-generated, weekly/monthly)
- Comparative analytics (student vs. class average)
- Predictive insights (performance predictions)
- Export capabilities (Excel, CSV, PDF)

### Advanced Features (Phase 4):
- Gamification (points, badges, leaderboards, streaks)
- Offline mode (download content for offline viewing)
- Mobile apps (native iOS, Android)
- Parent portal (view child's progress, grades, attendance)
- AI-powered content recommendations
- Adaptive learning (personalized content)
- Auto-grading essays (NLP-based)
- Chatbot tutor (AI-powered Q&A)

### Integration Requirements:
- Student Information System (SIS) - auto-enroll students, sync grades
- Attendance Management - sync attendance data (online auto, offline manual)
- Timetable Module - import class schedules, room assignments
- Grade Management - send assignment grades, calculate GPA
- Fee Management - check fee clearance before exam access
- Communication System - announcements, parent notifications
- Library System - reserve books, digital library access
- Exam Management - conduct online exams, process results
- Parent Portal - unified parent view of learning progress
- External APIs - Zoom, Google Meet, YouTube, Khan Academy

### Security & Compliance:
- Role-based access control (RBAC) - students, teachers, parents, admins
- Multi-factor authentication (MFA) - for teacher and admin accounts
- End-to-end encryption - student submissions, grades, messages
- COPPA, FERPA, GDPR compliance - student data privacy
- Session management - auto-logout, secure tokens
- File upload security - malware scanning, file type restrictions
- API rate limiting - prevent abuse, DDoS protection
- Audit trails - all data access, modifications logged

### Performance Requirements:
- Support 5,000+ concurrent users
- Page load time <3 seconds on 3G networks
- Video streaming on 5 Mbps connections
- 99.9% uptime during school hours
- API response time <500ms
- File uploads (50 MB) within 2 minutes
- Auto-scaling for exam periods, assignment deadlines

### Accessibility & UX:
- WCAG 2.1 AA compliant (screen readers, keyboard navigation)
- Mobile-first design (60% access via mobile)
- Multi-language support (English, Hindi, regional languages)
- Dark mode (reduce eye strain)
- Offline mode with sync
- Low-bandwidth mode (optimized for 2G/3G)
- Responsive design (phones, tablets, desktops)
- Student-friendly UI (age-appropriate for different grades)

Please take all permissions needed to read, write, run commands.

Let's build a production-ready, comprehensive Learning Management System (LMS) that revolutionizes teaching and learning!
```

---

## 📊 Expected Deliverables

### Documentation (Day 1-3)
1. **PRD** (140-180 pages):
   - Executive Summary
   - Product Vision & Goals
   - Market Research (LMS landscape, competitors)
   - User Personas (6 detailed profiles)
   - User Journeys (15+ detailed flows)
   - Features & Requirements (100+ features)
   - Technical Architecture (microservices, scalability)
   - Database Schema (25+ tables)
   - API Endpoints (150+ endpoints)
   - UI/UX Wireframes
   - Success Metrics
   - Risk Assessment
   - Release Plan (16 weeks)

2. **Implementation Plan** (95-120 pages):
   - Project Setup (tools, infrastructure)
   - 16-Week Development Plan (5 phases)
   - Team Structure (roles, responsibilities)
   - Technology Stack (detailed)
   - Database Design (ER diagrams, schema)
   - API Development Plan (RESTful + WebSockets)
   - Frontend Development Plan (component hierarchy)
   - Integration Plan (10+ integrations)
   - Testing Strategy (unit, integration, E2E, load)
   - Deployment Plan (CI/CD, infrastructure)
   - Security Plan (authentication, authorization, encryption)
   - Performance Optimization (caching, CDN, compression)
   - Risk Management (mitigation strategies)
   - Go-Live Checklist (quality gates)

### Project Setup (Day 4-5)
3. **Project Structure**:
   - teacher-student-interaction-system/
   - Backend skeleton (FastAPI, 40+ files)
   - Frontend skeleton (React 19, 60+ files)
   - Documentation files (11 files)
   - Docker setup (multi-container)
   - CI/CD configuration (GitHub Actions)

4. **Documentation Files**:
   - README.md (~25 pages)
   - CLAUDE.md (~35 pages)
   - QUICKSTART.md (~18 pages)
   - TODO.md (~50 pages)
   - CONTEXT.md (~30 pages)
   - PROJECT_STRUCTURE.md (~12 pages)
   - SETUP_SUCCESS.md (~15 pages)
   - FINAL_SUMMARY.md (~22 pages)
   - INDEX.md (~15 pages)
   - docs/API.md (~40 pages)
   - docs/DATABASE_SCHEMA.md (~25 pages)

### Development (Weeks 1-16)
5. **Phase 1 (Weeks 1-4)**: Core LMS working (courses, assignments, grading)
6. **Phase 2 (Weeks 5-7)**: Communication & collaboration features complete
7. **Phase 3 (Weeks 8-10)**: Assessments & analytics operational
8. **Phase 4 (Weeks 11-13)**: Advanced features (gamification, mobile, AI)
9. **Phase 5 (Weeks 14-16)**: Integrations, testing, training, launch

---

## 🎯 Success Criteria

### Technical:
- ✅ 150+ API endpoints operational
- ✅ 25+ database tables with proper relationships
- ✅ Support 5,000+ concurrent users
- ✅ Page load time <3 seconds on 3G
- ✅ Video streaming on 5 Mbps connections
- ✅ 99.9% uptime during school hours
- ✅ API response time <500ms
- ✅ 90%+ test coverage (backend), 75%+ (frontend)

### Business:
- ✅ Assignment creation 60% faster (30 min → 12 min)
- ✅ Grading 80% faster (2 hours → 24 min)
- ✅ Attendance 90% faster (5 min → 30 sec)
- ✅ Paper & printing reduced by 95%
- ✅ Student engagement improved from 50% to 75%
- ✅ Parent satisfaction improved from 60% to 88%
- ✅ Learning outcomes improved by 15-20%

### User Experience:
- ✅ Mobile apps (iOS, Android) available
- ✅ Offline mode functional
- ✅ Multi-language support (English, Hindi, 3+ regional)
- ✅ WCAG 2.1 AA accessible
- ✅ Dark mode available
- ✅ Low-bandwidth mode operational
- ✅ Platform usable with <2 hours training

---

## 📚 Reference Materials

### Study Materials:
- study/admin_tasks_teacher_student_interaction.md (THIS FILE - comprehensive requirements)
- docs/requirements/modules/technology/erp-sis-lms-administration.md (LMS infrastructure)
- admission-system/ (reference implementation for project structure)
- fee-management-system/ (reference implementation for documentation)

### LMS Research:
- Google Classroom (K-12 leader)
- Canvas LMS (higher education standard)
- Moodle (open-source, widely used)
- Blackboard Learn (enterprise LMS)
- Schoology (K-12 focus)
- Khan Academy (personalized learning)
- Coursera, Udemy (online courses)

### Indian Context:
- DIKSHA (NCERT digital platform)
- SWAYAM (online courses for Indian students)
- CBSE digital learning guidelines
- NEP 2020 (National Education Policy) digital learning focus
- PM eVIDYA initiative

### Standards & Compliance:
- SCORM (Sharable Content Object Reference Model)
- LTI (Learning Tools Interoperability)
- xAPI (Experience API)
- COPPA (Children's Online Privacy Protection Act)
- FERPA (Family Educational Rights and Privacy Act)
- GDPR (for international students)

### Best Practices:
- Universal Design for Learning (UDL)
- Bloom's Taxonomy (learning objectives)
- Formative vs. Summative assessment
- Active learning strategies
- Blended learning models
- Mobile-first design
- Accessibility standards (WCAG 2.1)

---

## 🚀 Ready to Start?

Copy the prompt above and paste it to Claude to begin development of the comprehensive Teacher-Student Interaction System (LMS)!

**Estimated Time**:
- Documentation: 3 days
- Project Setup: 2 days
- Development: 16 weeks
- **Total: 16 weeks + 5 days**

**Complexity**: Very High (Most complex module - real-time features, video streaming, AI, mobile)
**Priority**: Critical (Core to teaching and learning, especially post-COVID)
**Dependencies**: Student Information System (SIS) for student enrollment
**Integrations**: 10+ modules (SIS, attendance, timetable, grades, fee, communication, library, exam, parent portal, mobile app)

---

## 💡 Why This Module is Important

### 1. Post-COVID Reality:
- **Hybrid learning** is the new normal (online + offline)
- **Continuity of education** during lockdowns, emergencies
- **Remote students** can participate (illness, travel, remote locations)
- **Flexible learning** anytime, anywhere access

### 2. Teaching Efficiency:
- **60% faster** assignment creation with templates
- **80% faster** grading with auto-grading, rubrics
- **90% faster** attendance with online auto-tracking
- **95% reduction** in paper, printing costs

### 3. Learning Effectiveness:
- **Personalized learning** with AI-powered recommendations
- **At-risk identification** prevents failures
- **Real-time feedback** improves learning
- **15-20% improvement** in learning outcomes

### 4. Parent Engagement:
- **3x increase** in parent-teacher interactions
- **Real-time visibility** into child's learning
- **88% parent satisfaction** (up from 60%)

### 5. Competitive Advantage:
- **Modern LMS** attracts tech-savvy parents, students
- **Scalability** to new branches without infrastructure investment
- **Global reach** can offer courses internationally

---

## 🔄 Module Comparison

| Aspect | Parent Communication | Student Information System | Teacher-Student Interaction (LMS) |
|--------|---------------------|---------------------------|----------------------------------|
| **Complexity** | Medium | Very High | Very High |
| **Duration** | 8 weeks | 12 weeks | 16 weeks |
| **PRD Pages** | 100-120 | 120-160 | 140-180 |
| **Plan Pages** | 60-70 | 85-105 | 95-120 |
| **Database Tables** | 8-10 | 20+ | 25+ |
| **API Endpoints** | 40-50 | 100+ | 150+ |
| **User Roles** | 3 | 8 | 9 |
| **Integrations** | 6-8 | 10+ | 10+ |
| **Real-time** | No | No | Yes (live classes, messaging) |
| **Mobile Apps** | Yes | Yes | Yes (critical) |
| **Video** | No | No | Yes (streaming, recording) |
| **AI** | No | Yes (at-risk) | Yes (recommendations, grading) |
| **Priority** | Medium | Critical | Critical |

---

## 📝 Development Phases Breakdown

### Phase 1: Core LMS (Weeks 1-4) - MVP
**Goal**: Teachers can create courses, students can submit assignments, basic grading works.

**Features**:
- Course CRUD operations
- Content upload (PDFs, videos, links)
- Assignment creation, submission
- Manual grading interface
- Student enrollment (auto from SIS)
- Teacher dashboard, student dashboard
- Manual attendance marking
- Basic announcements

**Deliverables**:
- 30+ API endpoints
- 10+ database tables
- Teacher web interface
- Student web interface
- Basic notification system

### Phase 2: Communication & Collaboration (Weeks 5-7)
**Goal**: Teachers and students can communicate, collaborate, conduct live classes.

**Features**:
- Discussion forums (threaded)
- Direct messaging (DMs)
- Group chats
- Live class integration (Zoom/Google Meet)
- Class recording, playback
- File sharing
- Enhanced notifications (email, SMS, push)

**Deliverables**:
- WebSocket implementation (real-time)
- Video conferencing integration
- Messaging system (backend + frontend)
- Forum system
- File storage (S3/MinIO)

### Phase 3: Assessments & Analytics (Weeks 8-10)
**Goal**: Create quizzes, auto-grade, track student progress, identify at-risk students.

**Features**:
- Quiz builder (MCQ, short answer, essay)
- Question bank
- Auto-grading (objective)
- Rubric-based grading (subjective)
- Timed assessments
- Student analytics (progress, at-risk)
- Teacher analytics (class performance)
- Progress reports (auto-generated)

**Deliverables**:
- Quiz engine (backend + frontend)
- Auto-grading algorithm
- Analytics dashboard (teacher)
- Analytics dashboard (student)
- Report generator (PDF)

### Phase 4: Advanced Features (Weeks 11-13)
**Goal**: Gamification, mobile apps, AI features, offline mode.

**Features**:
- Gamification (points, badges, leaderboards)
- Offline mode (download content)
- Mobile apps (iOS, Android)
- Parent portal
- AI content recommendations
- AI essay grading
- Chatbot tutor
- Plagiarism detection

**Deliverables**:
- Gamification engine
- Mobile apps (iOS, Android)
- Offline sync mechanism
- AI integrations (OpenAI/Claude API)
- Plagiarism detection (Turnitin API)

### Phase 5: Integrations & Polish (Weeks 14-16)
**Goal**: Integrate with all school systems, optimize performance, train users, launch.

**Features**:
- SIS integration (auto-enrollment, grade sync)
- Attendance integration
- Timetable integration
- API for external integrations
- Performance optimization
- Load testing
- Security hardening
- User training, documentation

**Deliverables**:
- Integration adapters (10+ modules)
- Performance optimization (caching, CDN)
- Load testing report (5,000+ concurrent users)
- Security audit report
- User training materials
- Launch checklist

---

## ✅ Quality Gates

### Gate 1: Requirements Complete (Day 3)
- [ ] PRD generated (140-180 pages)
- [ ] Implementation plan created (95-120 pages)
- [ ] User journeys documented (15+)
- [ ] Database schema designed (25+ tables)
- [ ] API endpoints listed (150+)
- [ ] UI/UX wireframes created

### Gate 2: Project Setup Complete (Day 5)
- [ ] Project structure created
- [ ] Documentation files created (11 files)
- [ ] Backend skeleton set up
- [ ] Frontend skeleton set up
- [ ] Both servers start successfully
- [ ] CI/CD pipeline configured

### Gate 3: Phase 1 Complete (Week 4)
- [ ] Course creation working
- [ ] Assignment submission working
- [ ] Grading interface functional
- [ ] Dashboards operational
- [ ] Unit tests written (30+ tests)

### Gate 4: Phase 2 Complete (Week 7)
- [ ] Messaging system working
- [ ] Live classes functional (Zoom integration)
- [ ] Discussion forums operational
- [ ] File sharing working
- [ ] Integration tests passed

### Gate 5: Phase 3 Complete (Week 10)
- [ ] Quiz engine working
- [ ] Auto-grading functional
- [ ] Analytics dashboards operational
- [ ] At-risk identification working (85%+ accuracy)
- [ ] Progress reports generated

### Gate 6: Phase 4 Complete (Week 13)
- [ ] Mobile apps published (iOS, Android)
- [ ] Offline mode working
- [ ] Gamification operational
- [ ] AI features integrated
- [ ] Parent portal functional

### Gate 7: Production Ready (Week 16)
- [ ] All integrations working
- [ ] Load testing passed (5,000+ users)
- [ ] Security testing passed
- [ ] User acceptance testing passed
- [ ] Documentation complete
- [ ] Training delivered
- [ ] Production deployment successful

---

*Created: October 13, 2025*
*Module: Teacher-Student Interaction System (LMS)*
*Category: Academics (Learning & Instruction)*
*Status: Ready for Development*
