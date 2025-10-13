# Student Information System (SIS) - Quick Start Guide

**Version:** 1.0.0
**Date:** October 13, 2025
**Estimated Setup Time:** 5-15 minutes
**Project:** Sparked EdTech Platform - Student Information System

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Quick Setup (5 Minutes)](#3-quick-setup-5-minutes)
4. [Manual Setup](#4-manual-setup)
5. [First-Time Configuration](#5-first-time-configuration)
6. [Creating Your First Student Profile](#6-creating-your-first-student-profile)
7. [Testing Key Features](#7-testing-key-features)
8. [Common Issues & Solutions](#8-common-issues--solutions)
9. [Next Steps](#9-next-steps)

---

## 1. Overview

### What is SIS?

The **Student Information System (SIS)** is a comprehensive platform for managing all student-related data including:
- Student profiles and family relationships
- Academic records and transcripts
- Attendance tracking and analytics
- Medical records and health information
- Behavioral tracking and counseling
- Extracurricular activities and achievements
- Document vault and certificate generation
- Parent portal with mobile apps

### Quick Facts

- **Current Status:** Phase 2 (Week 6 of 12-week plan)
- **Phase 1 Complete:** Student profiles, documents, search, bulk operations
- **Phase 2 In Progress:** Attendance and academic records integration
- **Tech Stack:** FastAPI + React 19 + PostgreSQL + Redis + Elasticsearch
- **Supported:** 10,000+ students per school

---

## 2. Prerequisites

### Required Software

**Backend:**
- Python 3.11 or higher ([Download](https://www.python.org/downloads/))
- PostgreSQL 15 or higher ([Download](https://www.postgresql.org/download/))
- Redis 7 or higher ([Download](https://redis.io/download))

**Frontend:**
- Node.js 20 or higher ([Download](https://nodejs.org/))
- npm (comes with Node.js)

**Optional (Recommended):**
- Docker & Docker Compose ([Download](https://www.docker.com/products/docker-desktop))
- Git ([Download](https://git-scm.com/downloads))
- VS Code ([Download](https://code.visualstudio.com/))

### Check Installed Versions

```bash
# Python
python --version  # Should be 3.11+

# PostgreSQL
psql --version    # Should be 15+

# Redis
redis-server --version  # Should be 7+

# Node.js
node --version    # Should be 20+

# npm
npm --version     # Should be 10+

# Docker (optional)
docker --version
docker-compose --version
```

### System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 10 GB

**Recommended:**
- CPU: 4+ cores
- RAM: 8+ GB
- Storage: 20+ GB SSD

---

## 3. Quick Setup (5 Minutes)

### Option 1: Docker Compose (Fastest) ⚡

**Step 1: Clone Repository**
```bash
git clone https://github.com/sparked/student-information-system.git
cd student-information-system
```

**Step 2: Start All Services**
```bash
docker-compose up -d
```

This single command will:
- Start PostgreSQL database
- Start Redis cache
- Start Elasticsearch (optional)
- Build and start backend (FastAPI)
- Build and start frontend (React)

**Step 3: Wait for Services (30 seconds)**
```bash
# Check if services are running
docker-compose ps
```

**Step 4: Access Application**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

**Step 5: Create Admin Account**
```bash
# Run seed script to create admin user
docker-compose exec backend python scripts/create_admin.py
```

**Login Credentials:**
- Email: `admin@school.com`
- Password: `admin123`

🎉 **You're ready!** Skip to [Section 6: Creating Your First Student Profile](#6-creating-your-first-student-profile)

---

### Option 2: Manual Setup (15 Minutes)

Follow this if you prefer manual control or Docker isn't available.

#### Step 1: Clone Repository
```bash
git clone https://github.com/sparked/student-information-system.git
cd student-information-system
```

#### Step 2: Database Setup

**Create PostgreSQL Database:**
```bash
# Open PostgreSQL shell
psql -U postgres

# Create database
CREATE DATABASE sis_db;

# Create user (optional)
CREATE USER sis_user WITH PASSWORD 'sis_password';
GRANT ALL PRIVILEGES ON DATABASE sis_db TO sis_user;

# Exit
\q
```

**Start Redis:**
```bash
# On Windows (if installed as service)
net start redis

# On Mac/Linux
redis-server
```

#### Step 3: Backend Setup

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

# Create .env file
cp .env.example .env
```

**Edit `.env` file:**
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sis_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Secret (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY=your-secret-key-here

# AWS S3 (optional for development)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=sis-documents

# Email/SMS (optional for development)
SENDGRID_API_KEY=your-sendgrid-key
MSG91_AUTH_KEY=your-msg91-key

# Environment
ENVIRONMENT=development
```

**Run Database Migrations:**
```bash
alembic upgrade head
```

**Seed Database:**
```bash
python scripts/seed_database.py
python scripts/create_admin.py
```

**Start Backend Server:**
```bash
python -m app.main
```

Backend will run at: **http://localhost:8000**

#### Step 4: Frontend Setup

**Open New Terminal:**
```bash
cd frontend/web-app

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `.env` file:**
```env
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Start Frontend Server:**
```bash
npm run dev
```

Frontend will run at: **http://localhost:5173**

#### Step 5: Verify Setup

**Check Backend:**
```bash
curl http://localhost:8000/
# Should return: {"message": "Student Information System API"}
```

**Check Frontend:**
Open browser to http://localhost:5173 - should see login page

🎉 **Setup Complete!** Continue to [Section 5: First-Time Configuration](#5-first-time-configuration)

---

## 4. Manual Setup

*See Option 2 in Section 3 above*

---

## 5. First-Time Configuration

### Step 1: Login as Admin

**Open Frontend:** http://localhost:5173 (or http://localhost:3000 if using Docker)

**Login Credentials:**
- Email: `admin@school.com`
- Password: `admin123`

### Step 2: Configure School Information

1. Navigate to **Settings** > **School Information**
2. Fill in school details:
   - School Name: "ABC International School"
   - Board: CBSE / ICSE / State Board
   - Address: School address
   - Contact: Phone, Email
   - Logo: Upload school logo (optional)
3. Click **Save**

### Step 3: Set Up Academic Structure

**Create Classes:**
1. Go to **Settings** > **Classes**
2. Click **Add Class**
3. Add classes (Pre-KG, KG, Class 1-12)

**Create Sections:**
1. Go to **Settings** > **Sections**
2. Click **Add Section**
3. Add sections (A, B, C, etc.)

**Create Houses (Optional):**
1. Go to **Settings** > **Houses**
2. Add houses (Red, Blue, Green, Yellow)

**Create Academic Year:**
1. Go to **Settings** > **Academic Years**
2. Click **Add Academic Year**
3. Fill in:
   - Year: 2024-2025
   - Start Date: 2024-04-01
   - End Date: 2025-03-31
   - Is Current: Yes
4. Click **Save**

### Step 4: Create User Accounts

**Create Teacher Accounts:**
1. Go to **Users** > **Teachers**
2. Click **Add Teacher**
3. Fill in teacher details
4. Assign role: Teacher
5. Click **Save**

**Create Parent Accounts (Optional):**
- Parents are auto-created when student profiles are created
- Or create manually: **Users** > **Parents**

### Step 5: Configure Permissions (Optional)

1. Go to **Settings** > **Roles & Permissions**
2. Review default permissions for each role
3. Customize if needed

---

## 6. Creating Your First Student Profile

### Method 1: Manual Entry (Recommended for First Student)

**Step 1: Navigate to Students Page**
1. Click **Students** in sidebar
2. Click **Add Student** button

**Step 2: Fill Basic Information**
```
First Name: Rahul
Middle Name: Kumar (optional)
Last Name: Sharma
Date of Birth: 2010-05-15
Gender: Male
Blood Group: O+ (optional)
Admission Number: STU2025001
Admission Date: 2024-04-01
Current Class: Class 5
Current Section: A
House: Red House (optional)
```

**Step 3: Add Address**
```
Address Type: Current
Address Line 1: 123 Main Street
Address Line 2: Apartment 4B
City: New Delhi
State: Delhi
Postal Code: 110001
Country: India
```

**Step 4: Add Parent Information**
```
Parent Type: Father
Title: Mr.
First Name: Rajesh
Last Name: Sharma
Email: rajesh.sharma@email.com
Phone: +91 9876543210
Occupation: Software Engineer (optional)
Is Primary Contact: Yes
Can Pickup Student: Yes
```

**Step 5: Add Emergency Contact**
```
Contact Name: Anita Sharma (Mother)
Relationship: Mother
Phone: +91 9876543211
Priority: 1 (Primary)
Can Pickup Student: Yes
```

**Step 6: Upload Documents**
1. Click **Upload Documents** tab
2. Upload:
   - Student Photo (JPG/PNG)
   - Birth Certificate (PDF)
   - Aadhaar Card (PDF) - optional
   - Previous School TC (PDF) - optional

**Step 7: Review and Submit**
1. Click **Review** tab
2. Verify all information
3. Click **Submit**

✅ **Student Profile Created!**

### Method 2: Bulk Import (For Multiple Students)

**Step 1: Download Template**
1. Go to **Students** page
2. Click **Bulk Import**
3. Click **Download Template**

**Step 2: Fill Excel Template**
- Open downloaded Excel file
- Fill student data (one row per student)
- Required columns: `first_name`, `last_name`, `date_of_birth`, `gender`, `admission_number`
- Optional columns: `class`, `section`, `parent_name`, `parent_email`, `parent_phone`

**Example:**
| first_name | last_name | date_of_birth | gender | admission_number | class | section | parent_name | parent_email | parent_phone |
|------------|-----------|---------------|--------|------------------|-------|---------|-------------|---------------|--------------|
| Rahul | Sharma | 2010-05-15 | Male | STU2025001 | 5 | A | Rajesh Sharma | rajesh@email.com | 9876543210 |
| Priya | Patel | 2011-08-20 | Female | STU2025002 | 4 | B | Amit Patel | amit@email.com | 9876543211 |

**Step 3: Upload and Import**
1. Click **Upload File**
2. Select filled Excel file
3. Click **Validate**
4. Review validation results
5. Click **Import**

**Step 4: Review Import Results**
- View successfully imported students
- View failed imports with error messages
- Fix errors and re-import failed records

---

## 7. Testing Key Features

### 7.1 Search Students

**Test Global Search:**
1. Use search bar at top of page
2. Type student name: "Rahul"
3. Should see search results instantly

**Test Advanced Search:**
1. Click **Advanced Search** button
2. Apply filters:
   - Class: Class 5
   - Section: A
   - Status: Active
3. Click **Search**
4. View filtered results

### 7.2 View Student Profile

1. Click on student name from list
2. View complete student profile with tabs:
   - **Overview:** Basic information, photo, contact
   - **Academic:** Grades, transcripts, performance
   - **Attendance:** Daily attendance, analytics
   - **Medical:** Health records, allergies, medications
   - **Behavioral:** Discipline records, counseling
   - **Activities:** Extracurricular participation
   - **Documents:** All uploaded documents
   - **Family:** Parents, siblings, emergency contacts

### 7.3 Upload Documents

1. Go to student profile
2. Click **Documents** tab
3. Click **Upload Document**
4. Select document type: "Birth Certificate"
5. Choose file (PDF/JPG/PNG)
6. Click **Upload**
7. View uploaded document in list

### 7.4 Link Parent to Student

**If parent doesn't exist:**
1. Go to student profile
2. Click **Family** tab
3. Click **Add Parent**
4. Fill parent information
5. Select relationship: "Mother"
6. Click **Save**

**If parent exists:**
1. Click **Link Existing Parent**
2. Search for parent by name/email
3. Select parent
4. Select relationship
5. Click **Link**

### 7.5 Generate Student List Report

1. Go to **Students** page
2. Apply filters (class, section, status)
3. Click **Export** button
4. Select format: Excel / PDF / CSV
5. Click **Download**
6. Open downloaded file

### 7.6 Bulk Update Students

**Example: Promote students to next class**
1. Go to **Students** page
2. Filter by class: "Class 5"
3. Select all students (or specific students)
4. Click **Bulk Actions** > **Promote**
5. Select new class: "Class 6"
6. Click **Confirm**
7. View promotion results

### 7.7 Test Attendance Integration (Phase 2)

**Prerequisites:** Attendance module must be integrated

1. Go to student profile
2. Click **Attendance** tab
3. View attendance calendar
4. Check attendance percentage
5. View monthly/term attendance summary
6. View attendance alerts (if below 75%)

### 7.8 Test Academic Records (Phase 2)

1. Go to student profile
2. Click **Academic** tab
3. View grades by subject and term
4. View performance chart
5. Check class rank and percentile
6. View performance trends

---

## 8. Common Issues & Solutions

### Issue 1: Backend Won't Start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
# Ensure virtual environment is activated
cd backend
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Error:** `could not connect to server: Connection refused`

**Solution:**
- PostgreSQL is not running
- Start PostgreSQL:
  ```bash
  # Windows
  net start postgresql-x64-15

  # Mac
  brew services start postgresql@15

  # Linux
  sudo service postgresql start
  ```

**Error:** `database "sis_db" does not exist`

**Solution:**
```bash
# Create database
createdb sis_db

# Or using psql
psql -U postgres -c "CREATE DATABASE sis_db;"
```

### Issue 2: Frontend Won't Start

**Error:** `Cannot find module '@mui/material'`

**Solution:**
```bash
cd frontend/web-app
rm -rf node_modules package-lock.json
npm install
```

**Error:** `Port 5173 is already in use`

**Solution:**
- Another process is using port 5173
- Kill process:
  ```bash
  # Find process
  lsof -i :5173  # Mac/Linux
  netstat -ano | findstr :5173  # Windows

  # Kill process
  kill -9 <PID>  # Mac/Linux
  taskkill /PID <PID> /F  # Windows
  ```
- Or change port in `vite.config.ts`:
  ```ts
  export default defineConfig({
    server: {
      port: 3000  // Change to different port
    }
  })
  ```

### Issue 3: Cannot Login

**Error:** `Invalid email or password`

**Solution:**
- Verify admin account exists:
  ```bash
  cd backend
  python scripts/check_users.py
  ```
- If admin doesn't exist, create it:
  ```bash
  python scripts/create_admin.py
  ```
- Use correct credentials:
  - Email: `admin@school.com`
  - Password: `admin123`

**Error:** `CORS error: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Check CORS configuration in `backend/app/main.py`:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173", "http://localhost:3000"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

### Issue 4: Database Migration Fails

**Error:** `ERROR: relation "students" already exists`

**Solution:**
- Check current migration:
  ```bash
  cd backend
  alembic current
  ```
- Stamp database at head:
  ```bash
  alembic stamp head
  ```
- Or drop and recreate (development only):
  ```bash
  dropdb sis_db && createdb sis_db
  alembic upgrade head
  python scripts/seed_database.py
  ```

### Issue 5: File Upload Fails

**Error:** `Could not upload file to S3`

**Solution:**
- Check AWS credentials in `.env`:
  ```env
  AWS_ACCESS_KEY_ID=your-key
  AWS_SECRET_ACCESS_KEY=your-secret
  S3_BUCKET_NAME=sis-documents
  ```
- For development, use local storage instead:
  ```env
  FILE_STORAGE=local
  LOCAL_STORAGE_PATH=./uploads
  ```

### Issue 6: Search Not Working

**Error:** `Elasticsearch is not available`

**Solution:**
- Elasticsearch is optional in development
- Disable Elasticsearch:
  ```env
  ENABLE_ELASTICSEARCH=false
  ```
- Or install and start Elasticsearch:
  ```bash
  # Using Docker
  docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0
  ```

### Issue 7: Slow Performance

**Symptoms:**
- Pages load slowly
- API responses take >2 seconds

**Solutions:**
1. **Enable Redis caching:**
   ```env
   ENABLE_REDIS=true
   REDIS_URL=redis://localhost:6379/0
   ```

2. **Add database indexes:**
   ```bash
   cd backend
   python scripts/optimize_database.py
   ```

3. **Reduce data per page:**
   - Frontend: Change pagination to 25 or 50 per page
   - Implement lazy loading for images

### Issue 8: Docker Compose Issues

**Error:** `ERROR: Couldn't connect to Docker daemon`

**Solution:**
- Docker is not running
- Start Docker Desktop (Windows/Mac)
- Or start Docker daemon (Linux):
  ```bash
  sudo systemctl start docker
  ```

**Error:** `port is already allocated`

**Solution:**
- Another container is using the port
- Stop all containers:
  ```bash
  docker-compose down
  ```
- Change ports in `docker-compose.yml`:
  ```yaml
  ports:
    - "8001:8000"  # Change host port
  ```

---

## 9. Next Steps

### Immediate Next Steps

**1. Explore Admin Dashboard**
- View student statistics
- Check pending tasks
- Review recent activities

**2. Create More Student Profiles**
- Add 5-10 students manually
- Or import via Excel bulk import
- Upload documents for each student

**3. Configure Parent Portal**
- Enable parent access
- Test parent login
- View student information as parent

**4. Set Up Attendance (Phase 2)**
- Integrate with attendance module
- View attendance data in student profiles
- Test attendance alerts

**5. Add Academic Records (Phase 2)**
- Integrate with grade management
- View grades in student profiles
- Generate transcripts

### Learning Resources

**Documentation:**
- **CLAUDE.md** - Complete project context (30 pages)
- **TODO.md** - Development task list (40 pages)
- **INDEX.md** - Documentation index (12 pages)
- **API Documentation** - http://localhost:8000/docs (Swagger UI)

**Related Modules:**
- **Admission System** - `/admission-system/` (already integrated)
- **Fee Management** - `/fee-management-system/` (integration planned)
- **Attendance Management** - Integration in progress

**Study Materials:**
- `study/SIS_COMPREHENSIVE_RESEARCH_REPORT.md` - Detailed research
- `study/admin_tasks_student_information_system.md` - Requirements
- `study/SIS_DEVELOPMENT_PROMPT.md` - Development guide

### Development Tasks (Current Week)

**Week 6 Tasks (Academic Records Integration):**
- [ ] Complete academic records backend API
- [ ] Implement performance analytics
- [ ] Create grade display frontend components
- [ ] Create performance chart components
- [ ] Test academic records sync

**Week 7 Tasks (Transcripts & Report Cards):**
- [ ] Implement transcript generation (PDF)
- [ ] Implement report card generation
- [ ] Create transcript viewing UI
- [ ] Add bulk report card generation
- [ ] Phase 2 testing and bug fixes

### Testing Checklist

Before moving to Phase 3, ensure Phase 1 & 2 features are working:

**Phase 1 Features:**
- [ ] Create student profile manually
- [ ] Upload documents
- [ ] Search students (basic and advanced)
- [ ] View student details
- [ ] Edit student profile
- [ ] Link parents to students
- [ ] Add emergency contacts
- [ ] Bulk import students (Excel)
- [ ] Export students (Excel/CSV/PDF)
- [ ] Bulk promote students to next class

**Phase 2 Features:**
- [ ] View attendance data in student profile
- [ ] View attendance percentage
- [ ] View attendance alerts (below 75%)
- [ ] View grades by subject and term
- [ ] View performance trends
- [ ] View class rank and percentile
- [ ] Generate academic transcript
- [ ] Generate report card

### Getting Help

**Documentation:**
- Read **CLAUDE.md** for detailed project context
- Check **TODO.md** for development tasks
- Refer to **API docs** at http://localhost:8000/docs

**Troubleshooting:**
- Review [Section 8: Common Issues](#8-common-issues--solutions)
- Check logs:
  - Backend logs: Terminal where backend is running
  - Frontend logs: Browser console (F12)
  - Database logs: PostgreSQL logs

**Community:**
- GitHub Issues: https://github.com/sparked/student-information-system/issues
- Team Slack: #sis-support channel
- Email: support@sparked.in

---

## Appendix A: Useful Commands

### Backend Commands

```bash
# Start backend server
python -m app.main

# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest app/tests/unit/test_models.py

# Database migrations
alembic upgrade head  # Apply all migrations
alembic downgrade -1  # Rollback one migration
alembic revision --autogenerate -m "Add table"  # Create migration

# Seed database
python scripts/seed_database.py

# Create admin user
python scripts/create_admin.py

# Generate dummy students
python scripts/generate_dummy_students.py 50

# Check database status
python scripts/check_db_status.py
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose build

# Run specific service
docker-compose up backend

# Execute command in container
docker-compose exec backend python scripts/seed_database.py
```

### Database Commands

```bash
# Connect to database
psql -h localhost -U postgres -d sis_db

# Backup database
pg_dump -h localhost -U postgres sis_db > backup.sql

# Restore database
psql -h localhost -U postgres sis_db < backup.sql

# List tables
psql -h localhost -U postgres -d sis_db -c "\dt"

# Count students
psql -h localhost -U postgres -d sis_db -c "SELECT COUNT(*) FROM students;"
```

---

## Appendix B: Default Credentials

### Admin Account
- **Email:** admin@school.com
- **Password:** admin123
- **Role:** Admin
- **Access:** Full access to all features

### Test Teacher Account (if seeded)
- **Email:** teacher@school.com
- **Password:** teacher123
- **Role:** Teacher
- **Access:** View students, update grades, mark attendance

### Test Parent Account (if seeded)
- **Email:** parent@school.com
- **Password:** parent123
- **Role:** Parent
- **Access:** View own children only

**Important:** Change all default passwords in production!

---

## Appendix C: Port Reference

| Service | Development Port | Production Port |
|---------|-----------------|-----------------|
| Frontend (Vite) | 5173 | 80/443 |
| Frontend (Docker) | 3000 | 80/443 |
| Backend API | 8000 | 80/443 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| Elasticsearch | 9200 | 9200 |
| Kibana (logs) | 5601 | 5601 |
| Grafana (monitoring) | 3001 | 3001 |

---

## Appendix D: Environment Variables Reference

### Backend `.env` File

```env
# Application
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=your-secret-key-here
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sis_db
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20

# Redis
REDIS_URL=redis://localhost:6379/0
ENABLE_REDIS=true

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ENABLE_ELASTICSEARCH=false

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# File Storage
FILE_STORAGE=s3  # or 'local'
LOCAL_STORAGE_PATH=./uploads
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=sis-documents

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@sparked.in

# SMS
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your-msg91-key

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Frontend `.env` File

```env
# API
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Environment
VITE_ENVIRONMENT=development

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_CHAT=false
```

---

**Document Version:** 1.0.0
**Last Updated:** October 13, 2025
**Total Pages:** ~15 pages

---

*This quick start guide helps you get the Student Information System up and running in 5-15 minutes. For detailed project context, see CLAUDE.md. For development tasks, see TODO.md.*