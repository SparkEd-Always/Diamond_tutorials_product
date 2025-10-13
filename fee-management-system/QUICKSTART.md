# Quick Start Guide
## Fee Management System - Get Running in 10 Minutes

**Last Updated**: October 13, 2025

---

## ⚡ Prerequisites

Before you begin, ensure you have:

- ✅ **Python 3.11+** - [Download](https://www.python.org/downloads/)
- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **Code Editor** - VS Code recommended

**Optional** (for production features):
- PostgreSQL 15+ (production database)
- Redis 5.0+ (for Celery tasks)

---

## 🚀 Quick Setup (Development)

### Step 1: Clone Repository

```bash
cd d:\Projects\sparked\fee-management-system
```

### Step 2: Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# OR
cp .env.example .env    # macOS/Linux

# Run database migrations
alembic upgrade head

# Start backend server
python -m app.main
```

✅ **Backend running at**: http://localhost:8000
✅ **API Docs**: http://localhost:8000/docs

---

### Step 3: Frontend Setup (3 minutes)

Open a **new terminal** (keep backend running):

```bash
# Navigate to frontend
cd frontend/web-app

# Install dependencies
npm install

# Create .env file
copy .env.example .env  # Windows
# OR
cp .env.example .env    # macOS/Linux

# Start frontend server
npm run dev
```

✅ **Frontend running at**: http://localhost:5173

---

### Step 4: Access the Application (1 minute)

Open your browser and visit:

**Admin Portal**: http://localhost:5173/admin/dashboard
**Parent Portal**: http://localhost:5173/parent/dashboard

**Default Login Credentials**:
- **Admin**: admin@school.com / admin123
- **Parent**: parent@school.com / parent123

---

## 🎯 First-Time Setup Tasks

### 1. Create Fee Types (2 minutes)

1. Go to: http://localhost:5173/admin/fees/types
2. Click "Add Fee Type"
3. Create the following fee types:
   - **Tuition** (Mandatory, Annual)
   - **Exam** (Mandatory, Annual)
   - **Library** (Mandatory, Annual)
   - **Sports** (Mandatory, Annual)
   - **Transport** (Optional, Annual)

### 2. Configure Fee Structure (3 minutes)

1. Go to: http://localhost:5173/admin/fees/structures
2. Select Academic Year: 2025-26
3. Select Class: Class 1
4. Add fees:
   - Tuition: ₹60,000 (₹20,000 per term)
   - Exam: ₹6,000 (₹2,000 per term)
   - Library: ₹3,000 (annual)
   - Sports: ₹3,000 (annual)
5. Click "Save Fee Structure"

### 3. Assign Fees to Students (1 minute)

1. Go to: http://localhost:5173/admin/fees/assign
2. Select Class: Class 1
3. Click "Bulk Assign Fees"
4. System assigns fees to all Class 1 students

### 4. Generate Invoices (1 minute)

1. Go to: http://localhost:5173/admin/invoices
2. Click "Bulk Generate Invoices"
3. Select Class: Class 1, Term: Term 1
4. Click "Generate"
5. System generates invoices for all Class 1 students

### 5. Test Payment Flow (2 minutes)

**As Parent**:
1. Login as parent: parent@school.com / parent123
2. Go to: http://localhost:5173/parent/fees
3. Click on an invoice
4. Click "Pay Now"
5. Select payment method: **UPI** (Test Mode)
6. Complete payment (test mode - no real money)
7. Verify receipt is generated

---

## 🧪 Test Data Setup (Optional)

### Generate Dummy Data

```bash
cd backend

# Generate dummy students (if not from admission system)
python scripts/generate_dummy_students.py 50

# Generate dummy fee structures
python scripts/generate_dummy_fees.py

# Generate dummy invoices
python scripts/generate_dummy_invoices.py
```

---

## 🔧 Configuration

### Backend Configuration (.env)

Edit `backend/.env`:

```bash
# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL=sqlite:///./fee_management.db

# JWT Authentication
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# SMS (MSG91)
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=SCHOOL
MSG91_ROUTE=4

# Celery (Task Queue)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# App Settings
APP_NAME=Fee Management System
SCHOOL_NAME=ABC School
SCHOOL_ADDRESS=123 Main St, City, State
```

### Frontend Configuration (.env)

Edit `frontend/web-app/.env`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:8000/api/v1

# App Settings
VITE_APP_NAME=Fee Management System
VITE_SCHOOL_NAME=ABC School
```

---

## 🧰 Development Tools

### Backend Testing

```bash
cd backend

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# View coverage report
# Open: htmlcov/index.html
```

### Frontend Testing

```bash
cd frontend/web-app

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Database Management

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history
```

### View Database (SQLite)

```bash
cd backend

# Install DB Browser for SQLite
# Download from: https://sqlitebrowser.org/

# Or use command line
sqlite3 fee_management.db

# View tables
.tables

# View schema
.schema invoices

# Query data
SELECT * FROM invoices LIMIT 10;

# Exit
.quit
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Ensure virtual environment is activated
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

---

**Error**: `Database connection failed`

**Solution**:
```bash
# Check .env file exists
cd backend
cat .env  # Should show database config

# Run migrations
alembic upgrade head

# If migrations fail, delete database and recreate
rm fee_management.db
alembic upgrade head
```

---

### Frontend Won't Load

**Error**: `Cannot connect to backend`

**Solution**:
```bash
# Verify backend is running
# Open: http://localhost:8000/docs
# Should show API documentation

# Check .env file
cd frontend/web-app
cat .env  # Should have VITE_API_URL=http://localhost:8000/api/v1

# Restart frontend
npm run dev
```

---

**Error**: `npm install fails`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Payment Not Working

**Error**: `Payment gateway error`

**Solution**:
```bash
# Check Razorpay credentials in .env
cd backend
cat .env | grep RAZORPAY

# Use Razorpay test mode credentials
# Get from: https://dashboard.razorpay.com/app/website-app-settings/api-keys

# Test mode keys start with:
# RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
# RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

---

**Error**: `Webhook not received`

**Solution**:
```bash
# For local development, use ngrok to expose localhost
ngrok http 8000

# Copy ngrok URL (e.g., https://abc123.ngrok.io)
# Update webhook URL in Razorpay dashboard:
# https://abc123.ngrok.io/api/v1/payments/webhook
```

---

### Celery Tasks Not Running

**Error**: `Reminders not being sent`

**Solution**:
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# If Redis not installed (Windows):
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use WSL

# Start Celery worker
cd backend
celery -A app.tasks.celery_app worker --loglevel=info

# Start Celery beat (separate terminal)
celery -A app.tasks.celery_app beat --loglevel=info
```

---

## 📚 Next Steps

### Learn the System

1. **Read Documentation**:
   - [README.md](README.md) - Project overview
   - [CLAUDE.md](CLAUDE.md) - AI context and architecture
   - [docs/API.md](docs/API.md) - API documentation
   - [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - Database schema

2. **Explore API**:
   - Open: http://localhost:8000/docs
   - Try out endpoints
   - Understand request/response formats

3. **Explore UI**:
   - Navigate all admin pages
   - Test parent portal
   - Try principal dashboard

4. **Review Code**:
   - Backend: `backend/app/`
   - Frontend: `frontend/web-app/src/`
   - Models: `backend/app/models/`
   - Components: `frontend/web-app/src/components/`

### Start Development

1. **Pick a Feature** from [Implementation Plan](../docs/development/journeys/journey-2-implementation-plan.md)
2. **Create a Branch**:
   ```bash
   git checkout -b feature/fee-types-management
   ```
3. **Write Code** (backend + frontend)
4. **Write Tests** (unit + integration)
5. **Test Locally** (all flows work)
6. **Create Pull Request** for review
7. **Merge and Deploy** after approval

---

## 🎓 Key Concepts

### Fee Lifecycle

```
Fee Structure Setup → Fee Assignment → Invoice Generation →
Payment Processing → Receipt Generation → Reconciliation
```

### User Roles

- **Parent**: Pay fees, view invoices, download receipts
- **Finance Admin**: Manage fees, reconcile payments, track outstanding
- **Principal**: Monitor collections, approve waivers
- **Accountant**: Export to Tally, GST reports

### Payment Flow

```
Parent clicks "Pay Now" →
Razorpay modal opens →
Parent completes payment →
Razorpay sends webhook →
System verifies webhook →
Invoice marked PAID →
Receipt generated →
Email + SMS sent to parent
```

### Reconciliation Flow

```
Payment gateway settlement (T+1/T+2) →
System fetches settlement data →
Auto-matches transactions →
Unmatched transactions flagged →
Admin manually matches edge cases →
Reconciliation report generated
```

---

## 📞 Need Help?

### Resources

- **Documentation**: Check [docs/](docs/) folder
- **API Docs**: http://localhost:8000/docs
- **GitHub Issues**: Report bugs and request features
- **Slack**: #fee-management-dev channel

### Common Commands Quick Reference

```bash
# Backend
cd backend
venv\Scripts\activate  # Activate virtual env
python -m app.main     # Start server
pytest tests/          # Run tests
alembic upgrade head   # Run migrations

# Frontend
cd frontend/web-app
npm run dev            # Start dev server
npm test               # Run tests
npm run build          # Build for production

# Database
sqlite3 fee_management.db  # Open SQLite DB
alembic history            # View migrations
python scripts/generate_dummy_data.py  # Generate test data

# Celery
celery -A app.tasks.celery_app worker --loglevel=info  # Start worker
celery -A app.tasks.celery_app beat --loglevel=info    # Start scheduler
```

---

**Happy Coding! 🚀**

*You're now ready to start developing the Fee Management System!*

---

**Last Updated**: October 13, 2025
**Version**: 1.0
