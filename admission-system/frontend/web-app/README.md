# Admission Management System - Frontend

React + TypeScript + Material-UI frontend for Journey 1 Admission System

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend API running on http://localhost:8000

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Access the app at: http://localhost:5173

## 📋 Features Implemented

### Authentication
- ✅ Parent Registration
- ✅ User Login with JWT
- ✅ Auto-login on page refresh
- ✅ Protected routes
- ✅ Role-based access (Parent/Admin)

### Pages
- ✅ **HomePage** - Landing page with features
- ✅ **LoginPage** - User authentication
- ✅ **RegisterPage** - Parent registration
- ✅ **DashboardPage** - Role-based dashboard with stats
- ✅ **ApplicationFormPage** - 5-step wizard form
- ✅ **ApplicationListPage** - View all applications with filters
- ✅ **ApplicationDetailsPage** - Detailed application view

### Components
- ✅ Multi-step form wizard (Stepper)
- ✅ Data tables with pagination
- ✅ Status badges and chips
- ✅ Responsive layouts
- ✅ Material-UI theme (Indigo/Green)

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI v5** - UI components
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool

## 📁 Project Structure

```
src/
├── components/
│   ├── common/        # Reusable components
│   └── layout/        # Layout components
├── contexts/
│   └── AuthContext.tsx    # Authentication state
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ApplicationFormPage.tsx
│   ├── ApplicationListPage.tsx
│   └── ApplicationDetailsPage.tsx
├── services/
│   └── api.ts         # API service layer
├── types/
│   └── index.ts       # TypeScript definitions
├── App.tsx            # Main app with routing
├── config.ts          # App configuration
└── theme.ts           # Material-UI theme
```

## 🔑 Default Login

After backend initialization:
- **Admin**: admin@school.com / admin123
- **Parent**: Register new account at /register

## 🌐 Available Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes
- `/dashboard` - User dashboard
- `/apply` - New application form
- `/applications` - List all applications
- `/applications/:id` - Application details

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📡 API Integration

The frontend connects to the backend API at `VITE_API_BASE_URL` (default: http://localhost:8000)

All API calls are handled through `src/services/api.ts` with:
- Automatic JWT token injection
- Error handling
- Response interceptors
- Type-safe responses

## 🎯 User Flows

### Parent Flow
1. Register account → `/register`
2. Login → `/login`
3. View dashboard → `/dashboard`
4. Create application → `/apply`
5. Fill 5-step form:
   - Student Details
   - Parent Details
   - Address
   - Academic Details
   - Review & Submit
6. Track status → `/applications`

### Admin Flow
1. Login with admin credentials
2. View dashboard with stats
3. Review all applications
4. View application details
5. Approve/Reject applications

## 🔐 Authentication

- JWT token stored in localStorage
- Auto-login on page refresh
- Protected routes redirect to login
- Role-based access control
- Automatic logout on token expiry

## 🎨 Theme Customization

Edit `src/theme.ts` to customize:
- Colors (Primary, Secondary, etc.)
- Typography
- Component styles
- Border radius
- Shadows

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
**Solution**: Ensure backend is running on http://localhost:8000

### Issue: "CORS Error"
**Solution**: Backend CORS is configured for localhost:5173

### Issue: "Login not working"
**Solution**: Check backend database is initialized with admin user

## 📝 Next Steps

### To Complete MVP
- [ ] Add document upload component
- [ ] Implement form validation with Yup
- [ ] Add loading states and skeletons
- [ ] Enhance error handling
- [ ] Add success notifications
- [ ] Implement real-time updates

## 📄 License

Proprietary - All rights reserved

---

**Version**: 1.0.0
**Status**: MVP Complete ✅
**Last Updated**: October 4, 2025
