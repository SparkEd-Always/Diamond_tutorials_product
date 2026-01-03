# AVM Tutorial Management System

A complete tutorial management system with WhatsApp integration for AVM Tutorial. Built with FastAPI backend and React frontend, featuring attendance management, parent communication, and admin dashboard.

## 🎯 Project Overview

**Client**: AVM Tutorial (77 students, 5 teachers)
**Pricing**: ₹29 per student per month
**Goal**: Self-service app with zero maintenance calls

## ✨ Key Features

### Core Functionality
- **Attendance Management** - Digital attendance marking with admin approval workflow
- **WhatsApp Integration** - Dual chat threads (individual + announcements)
- **Student Records** - Complete student profile management
- **Teacher Management** - Staff profiles and class assignments
- **Parent Communication** - Multi-channel messaging system
- **Admin Dashboard** - Real-time analytics and approval interface

### Unique WhatsApp Requirements
- **Thread 1**: Individual daily attendance updates (Teacher → Admin → WhatsApp)
- **Thread 2**: Mass announcements and notices
- **Message Continuity**: Persistent chat sessions with no new chat creation
- **Admin Approval**: Required before WhatsApp messages are sent

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── core/           # Configuration, database, security
│   ├── models/         # SQLAlchemy database models
│   ├── schemas/        # Pydantic data validation schemas
│   ├── api/v1/         # API endpoints
│   ├── services/       # Business logic services
│   └── utils/          # Utility functions
├── alembic/            # Database migrations
└── tests/              # Test files
```

### Frontend (React + Material-UI)
```
frontend/
├── web-app/            # React web application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Redux store and slices
│   │   ├── services/   # API service functions
│   │   └── types/      # TypeScript type definitions
└── mobile-app/        # React Native mobile app
```

## 🚀 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM with Alembic migrations
- **Redis** - Caching and session management
- **Celery** - Background task processing
- **WhatsApp Business API** - Parent communication
- **JWT** - Authentication and authorization

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Professional UI components
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Mobile App
- **React Native** - Cross-platform mobile development
- **React Native Paper** - Material Design components
- **Redux** - Shared state management

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#4F46E5` (Trust, Education)
- **Success Green**: `#10B981` (Present/Success)
- **Warning Orange**: `#F59E0B` (Alerts/Attention)
- **Danger Red**: `#EF4444` (Absent/Critical)
- **Purple Accent**: `#8B5CF6` (Premium features)

### UI Principles
- High contrast for readability
- Color-blind friendly combinations
- Consistent across web + mobile
- Professional, educational feel

## 🔧 Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 6+

### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend/web-app

# Install dependencies
npm install

# Start development server
npm start
```

### Mobile App Setup
```bash
cd frontend/mobile-app

# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android
```

## 🔑 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tutorial_management

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📱 User Roles & Access

### Admin (AVM-ADM-001, AVM-ADM-002)
- Complete system access
- Attendance approval workflow
- WhatsApp message management
- User management
- Analytics dashboard

### Teachers (AVM-TCH-001 to AVM-TCH-005)
- Student attendance marking
- View student records
- Limited communication access

### Parents
- View child's attendance records
- Receive WhatsApp notifications
- Read-only access to notices

### Students (AVM-STU-001 to AVM-STU-077)
- Limited access to own records
- View notices and announcements

## 🔄 Attendance Workflow

1. **Teacher Marks Attendance** → Mobile app (daily)
2. **Admin Reviews** → Web dashboard (bulk approval)
3. **System Sends WhatsApp** → Individual parent messages
4. **Parent Receives** → Daily attendance update
5. **Analytics Updated** → Real-time dashboard

## 📊 WhatsApp Integration Details

### Individual Chat (Daily Attendance)
```
📚 AVM Tutorial - Daily Update

🎓 Student: Rahul Sharma (AVM-STU-025)
📅 Date: 28 Sep 2025
✅ Attendance: Present
📊 Marks: Math Test - 85/100

💬 Reply to this chat for any queries.
```

### Announcement Chat (Mass Communication)
```
📢 AVM Tutorial - Announcements

🏫 Important Notice
📅 Parent-Teacher Meeting scheduled for 5th Oct 2025
⏰ Time: 10:00 AM - 2:00 PM
📍 Venue: School Auditorium

Please confirm your attendance.
```

## 🚀 Deployment

### Production Hosting Strategy
- **Backend**: Railway, Heroku, or DigitalOcean
- **Database**: Managed PostgreSQL
- **Redis**: Redis Cloud
- **Frontend**: Vercel or Netlify
- **Mobile**: Google Play Store

### Cost Estimation
- **Hosting**: ~₹580/month
- **Revenue**: ₹2,233/month (77 × ₹29)
- **Net Profit**: ₹1,653/month (74% margin)

## 📝 API Documentation

Once the backend is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend/web-app
npm test
```

## 📈 Development Status

### ✅ Completed
- [x] Project structure setup
- [x] FastAPI backend with database models
- [x] Authentication and RBAC system
- [x] WhatsApp Business API integration
- [x] Attendance management with admin approval
- [x] React web application with Material-UI
- [x] Admin dashboard for attendance approval

### 🚧 In Progress
- [ ] React Native mobile app initialization
- [ ] Complete API endpoint implementations
- [ ] Database seeding and migrations
- [ ] WhatsApp webhook handling

### 📋 Upcoming
- [ ] Student and teacher data upload wizard
- [ ] Push notifications implementation
- [ ] Offline capabilities for mobile app
- [ ] Production deployment setup
- [ ] Performance optimization
- [ ] Security audit and testing

## 👥 Team Structure

- **Product Manager**: Business requirements, user stories
- **Tech Lead**: Architecture, database design
- **Frontend Developer**: React/React Native implementation
- **Backend Developer**: FastAPI and integrations
- **UI/UX Designer**: Wireframes, user flows

## 📞 Support

For development questions or issues:
1. Check the API documentation at `/docs`
2. Review the project specifications in `Running-Projects/AVM-project.md`
3. Ensure all environment variables are properly configured
4. Verify database and Redis connections

## 📄 License

This project is proprietary software developed for AVM Tutorial. All rights reserved.

---

**Last Updated**: September 28, 2025
**Version**: 1.0.0-alpha
**Status**: Development Phase