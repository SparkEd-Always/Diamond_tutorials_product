# 🚀 Quick Start Guide - Admission System Backend

Get the admission management system API up and running in 5 minutes!

## Prerequisites
- Python 3.9+ installed
- PostgreSQL installed (or use SQLite for quick testing)

## Step 1: Setup Environment

```bash
# Navigate to backend directory
cd admission-system/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 2: Configure Database

### Option A: Quick Start with SQLite (Recommended for testing)
```bash
# Create .env file
copy .env.example .env  # Windows
# or
cp .env.example .env    # Linux/Mac

# Edit .env and set:
DATABASE_URL=sqlite:///./admission.db
```

### Option B: PostgreSQL (Production)
```bash
# Create database
createdb admission_system

# Edit .env and set:
DATABASE_URL=postgresql://username:password@localhost:5432/admission_system
```

## Step 3: Initialize Database

```bash
# Initialize database with default data
python -m app.utils.init_db
```

This will create:
- ✅ Admin user (`admin@school.com` / `admin123`)
- ✅ Academic year 2024-25
- ✅ 13 classes (Pre-KG to Class 10)
- ✅ Sections A, B, C for each class
- ✅ 10 document types

## Step 4: Start Server

```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:
```bash
python -m app.main
```

## Step 5: Access API Documentation

Open your browser:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🎯 Test the API

### 1. Register a Parent
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "password123",
    "phone": "+919876543210"
  }'
```

### 2. Login as Admin
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123"
  }'
```

Response will include `access_token` - use this in subsequent requests.

### 3. List Applications (Admin)
```bash
curl -X GET "http://localhost:8000/api/v1/admissions/applications" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📋 Available API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register parent
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

### Admissions
- `POST /api/v1/admissions/applications` - Create application
- `GET /api/v1/admissions/applications` - List applications
- `GET /api/v1/admissions/applications/{id}` - Get application details
- `PUT /api/v1/admissions/applications/{id}/submit` - Submit application
- `PUT /api/v1/admissions/applications/{id}/status` - Update status (Admin)

### Documents
- `POST /api/v1/documents/upload` - Upload document
- `GET /api/v1/documents/applications/{id}/documents` - List documents
- `GET /api/v1/documents/download/{id}` - Download document
- `PUT /api/v1/documents/verify/{id}` - Verify document (Admin)
- `GET /api/v1/documents/types` - List document types

### Tests & Interviews
- `POST /api/v1/admissions/tests/schedule` - Schedule test (Admin)
- `GET /api/v1/admissions/tests` - List tests
- `PUT /api/v1/admissions/tests/{id}/result` - Record test result
- `POST /api/v1/admissions/interviews/schedule` - Schedule interview (Admin)
- `GET /api/v1/admissions/interviews` - List interviews
- `PUT /api/v1/admissions/interviews/{id}/feedback` - Record feedback

## 🔐 Default Login Credentials

**Admin:**
- Email: `admin@school.com`
- Password: `admin123`

**⚠️ Change these credentials in production!**

## 📂 Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   │   ├── auth.py
│   │   ├── admissions.py
│   │   ├── documents.py
│   │   └── tests_interviews.py
│   ├── core/            # Core configuration
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/          # Database models
│   ├── schemas/         # Pydantic schemas
│   ├── utils/           # Utilities
│   └── main.py          # FastAPI app
├── uploads/             # Uploaded documents
├── requirements.txt
├── .env.example
└── README.md
```

## 🐛 Troubleshooting

### Issue: "No module named 'app'"
**Solution**: Make sure you're in the backend directory and running with `python -m app.main`

### Issue: "Database connection error"
**Solution**: Check your DATABASE_URL in .env file

### Issue: "Upload directory not found"
**Solution**: Directory is created automatically. Check UPLOAD_DIR in .env

### Issue: "Port 8000 already in use"
**Solution**: Change port: `uvicorn app.main:app --port 8001`

## 🔄 Reset Database

```bash
# Delete database file (SQLite)
rm admission.db

# Reinitialize
python -m app.utils.init_db
```

## 📝 Next Steps

1. Test all API endpoints using Swagger UI
2. Integrate with frontend application
3. Configure email/SMS notifications
4. Set up file storage (S3/Cloudinary)
5. Deploy to production

## 🆘 Need Help?

- Check API documentation: http://localhost:8000/docs
- Review README.md for detailed information
- Check logs for error details

---

**Happy Coding! 🎉**
