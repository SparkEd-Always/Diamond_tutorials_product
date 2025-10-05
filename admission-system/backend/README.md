# Admission Management System - Backend

Journey 1: Digital Admission System API built with FastAPI

## Tech Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL / SQLite (development)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with bcrypt
- **File Storage**: Local filesystem (can be extended to S3)

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Initialize Database
```bash
# For PostgreSQL, create database first:
createdb admission_system

# For SQLite (development), it will be created automatically

# Run the application (it will create tables automatically)
python -m app.main
```

### 5. Run Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Access API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure
```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── core/            # Config, database, security
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── tests/               # Test files
├── uploads/             # File storage
├── requirements.txt     # Dependencies
└── .env                 # Environment variables
```

## Database Models

### Core Tables
- `users` - User authentication
- `user_profiles` - User profile information
- `students` - Student records
- `parents` - Parent information
- `student_parents` - Student-parent relationships

### Academic Tables
- `academic_years` - Academic year configuration
- `classes` - Class definitions
- `sections` - Section details

### Admission Tables
- `admission_applications` - Application records
- `application_documents` - Uploaded documents
- `document_types` - Document type definitions
- `admission_tests` - Test scheduling and results
- `interviews` - Interview scheduling and feedback
- `application_status_history` - Status change audit trail

## API Endpoints (Coming Soon)

### Authentication
- `POST /api/v1/auth/register` - Register new parent
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

### Applications
- `POST /api/v1/admissions/applications` - Create application
- `GET /api/v1/admissions/applications` - List applications (admin)
- `GET /api/v1/admissions/applications/{id}` - Get application details
- `PUT /api/v1/admissions/applications/{id}` - Update application

### Documents
- `POST /api/v1/admissions/documents` - Upload document
- `GET /api/v1/admissions/documents/{id}` - Download document
- `PUT /api/v1/admissions/documents/{id}/verify` - Verify document (admin)

## Development Status
✅ Database models complete
✅ Pydantic schemas complete
✅ Core configuration complete
⏳ API endpoints (in progress)
⏳ Business logic services
⏳ Authentication flow
⏳ File upload handling

## Next Steps
1. Create API endpoints
2. Implement authentication service
3. Build admission workflow service
4. Add document upload/verification
5. Create admin operations
6. Add email/SMS notifications
7. Testing and validation

---

**Version**: 1.0.0
**Status**: Development
