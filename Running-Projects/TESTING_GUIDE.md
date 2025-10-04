# AVM Tutorial Management System - Comprehensive Testing Guide

**Version**: 1.0
**Last Updated**: October 2, 2025
**Status**: Ready for Production Testing

---

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Credentials](#test-credentials)
4. [Backend API Testing](#backend-api-testing)
5. [Web Application Testing](#web-application-testing)
6. [Mobile Application Testing](#mobile-application-testing)
7. [Integration Testing](#integration-testing)
8. [User Acceptance Testing (UAT)](#user-acceptance-testing-uat)
9. [Performance Testing](#performance-testing)
10. [Security Testing](#security-testing)
11. [Deployment Testing](#deployment-testing)
12. [Known Issues & Workarounds](#known-issues--workarounds)
13. [Test Results Template](#test-results-template)

---

## Pre-Testing Setup

### System Requirements

**Development/Testing Machine**:
- macOS, Windows, or Linux
- Python 3.11+
- Node.js 18+
- 8GB RAM minimum
- 10GB free disk space

**Mobile Testing**:
- Android device or emulator (Android 8.0+)
- iOS device (optional, for future iOS app)
- Expo Go app installed

---

## Test Environment Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd ~/AVM/product/AVM-code/backend

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Verify all dependencies installed
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Verify backend is running
# Open browser: http://localhost:8000/docs
```

**Expected Result**: Swagger API documentation should load

### 2. Web Application Setup

```bash
# Navigate to web app directory
cd ~/AVM/product/AVM-code/frontend/web-app

# Install dependencies (if not already done)
npm install

# Start development server
npm start

# Verify web app is running
# Browser should auto-open: http://localhost:3000
```

**Expected Result**: Login page should appear

### 3. Mobile Application Setup

```bash
# Navigate to mobile app directory
cd ~/AVM/product/AVM-code/frontend/mobile-app

# Install dependencies (if not already done)
npm install

# Start Expo development server
npx expo start --web

# For Android testing
npx expo start

# Scan QR code with Expo Go app (Android)
# OR
# Press 'a' to open in Android emulator
```

**Expected Result**: Expo developer tools should open

### 4. Database Setup

```bash
# Navigate to backend directory
cd ~/AVM/product/AVM-code/backend

# Check if database exists
ls -la avm_tutorial.db

# If database doesn't exist or needs reset
python create_test_data.py

# Verify database has data
sqlite3 avm_tutorial.db
sqlite> .tables
sqlite> SELECT COUNT(*) FROM users;
sqlite> SELECT COUNT(*) FROM students;
sqlite> SELECT COUNT(*) FROM teachers;
sqlite> .quit
```

**Expected Result**: Database should have 2 admins, 5 teachers, 77 students

---

## Test Credentials

### Admin Accounts

**Primary Admin**:
- Email: `admin@avm.com`
- Password: `password123`
- Name: Principal Rajesh Kumar
- Role: Admin
- Unique ID: AVM-ADM-001

**Secondary Admin**:
- Email: `admin2@avm.com`
- Password: `password123`
- Name: Vice Principal Sunita Sharma
- Role: Admin
- Unique ID: AVM-ADM-002

### Teacher Accounts

**Teacher 1**:
- Email: `priya.patel@avm.com`
- Password: `password123`
- Name: Mrs. Priya Patel
- Subjects: Mathematics, Science
- Classes: 7th A, 8th A

**Teacher 2**:
- Email: `amit.singh@avm.com`
- Password: `password123`
- Name: Mr. Amit Singh
- Subjects: English, Social Studies
- Classes: 7th B, 8th B

**Teacher 3**:
- Email: `kavita.sharma@avm.com`
- Password: `password123`
- Name: Mrs. Kavita Sharma
- Subjects: Science, Computer Science
- Classes: 9th A, 10th A

**Teacher 4**:
- Email: `ravi.kumar@avm.com`
- Password: `password123`
- Name: Mr. Ravi Kumar
- Subjects: Mathematics, Physics
- Classes: 9th B, 10th B

**Teacher 5**:
- Email: `neha.gupta@avm.com`
- Password: `password123`
- Name: Ms. Neha Gupta
- Subjects: Hindi, Sanskrit
- Classes: 7th A, 7th B, 8th A, 8th B

---

## Backend API Testing

### Using Swagger UI (http://localhost:8000/docs)

#### Test 1: Authentication APIs

**1.1 Admin Login**
```
POST /api/v1/auth/login
Body: {
  "username": "admin@avm.com",
  "password": "password123"
}
```
✅ **Expected**: 200 OK, returns JWT token and user details
❌ **Failure**: 401 Unauthorized

**1.2 Teacher Login**
```
POST /api/v1/auth/login
Body: {
  "username": "priya.patel@avm.com",
  "password": "password123"
}
```
✅ **Expected**: 200 OK, returns JWT token
❌ **Failure**: 401 Unauthorized

**1.3 Invalid Login**
```
POST /api/v1/auth/login
Body: {
  "username": "admin@avm.com",
  "password": "wrongpassword"
}
```
✅ **Expected**: 401 Unauthorized
❌ **Failure**: 200 OK (security issue!)

#### Test 2: Student APIs

**2.1 Get All Students** (Requires Authentication)
```
GET /api/v1/students/
Headers: Authorization: Bearer {token}
```
✅ **Expected**: 200 OK, returns list of 77 students
❌ **Failure**: 401 Unauthorized or empty array

**2.2 Create New Student**
```
POST /api/v1/students/
Headers: Authorization: Bearer {admin_token}
Body: {
  "full_name": "Test Student",
  "class_name": "7th",
  "section": "A",
  "roll_number": "99",
  "parent_name": "Test Parent",
  "parent_phone": "+91-9999999999"
}
```
✅ **Expected**: 201 Created, returns student with unique_id (AVM-STU-XXX)
❌ **Failure**: 400 Bad Request or unique_id not generated

**2.3 Update Student**
```
PUT /api/v1/students/{student_id}
Headers: Authorization: Bearer {admin_token}
Body: {
  "full_name": "Updated Name",
  "class_name": "8th"
}
```
✅ **Expected**: 200 OK, returns updated student
❌ **Failure**: 404 Not Found

**2.4 Delete Student**
```
DELETE /api/v1/students/{student_id}
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, confirmation message
❌ **Failure**: 404 Not Found or 403 Forbidden

#### Test 3: Teacher APIs

**3.1 Get All Teachers**
```
GET /api/v1/teachers/
Headers: Authorization: Bearer {token}
```
✅ **Expected**: 200 OK, returns list of 5 teachers
❌ **Failure**: 401 Unauthorized or empty array

**3.2 Get Teacher by ID**
```
GET /api/v1/teachers/{teacher_id}
Headers: Authorization: Bearer {token}
```
✅ **Expected**: 200 OK, returns teacher details
❌ **Failure**: 404 Not Found

**3.3 Delete Teacher**
```
DELETE /api/v1/teachers/{teacher_id}
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, teacher and related attendance records deleted
❌ **Failure**: Foreign key constraint error

#### Test 4: Student Attendance APIs

**4.1 Mark Attendance (Teacher)**
```
POST /api/v1/attendance/mark
Headers: Authorization: Bearer {teacher_token}
Body: {
  "date": "2025-10-02",
  "student_records": [
    {
      "student_id": 1,
      "status": "present",
      "remarks": "On time"
    },
    {
      "student_id": 2,
      "status": "absent",
      "remarks": "Informed leave"
    }
  ],
  "is_draft": false
}
```
✅ **Expected**: 200 OK, attendance marked, status "pending_admin_approval"
❌ **Failure**: 400 Bad Request or status not set correctly

**4.2 Get Pending Attendance (Admin)**
```
GET /api/v1/attendance/pending-approval
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, returns list of pending attendance records
❌ **Failure**: Empty array when records exist

**4.3 Approve Attendance (Admin)**
```
POST /api/v1/attendance/approve
Headers: Authorization: Bearer {admin_token}
Body: {
  "attendance_ids": [1, 2, 3]
}
```
✅ **Expected**: 200 OK, attendance approved, WhatsApp messages queued
❌ **Failure**: 404 Not Found or approval fails

**4.4 Get Attendance Summary**
```
GET /api/v1/attendance/summary?start_date=2025-10-01&end_date=2025-10-31
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, returns statistics (total, approved, pending, breakdown)
❌ **Failure**: Incorrect calculations

#### Test 5: Teacher Attendance APIs

**5.1 Mark Teacher Attendance**
```
POST /api/v1/teacher-attendance/mark
Headers: Authorization: Bearer {admin_token}
Body: {
  "date": "2025-10-02",
  "teacher_records": [
    {
      "teacher_id": 1,
      "status": "present",
      "remarks": "On time"
    }
  ]
}
```
✅ **Expected**: 200 OK, teacher attendance marked
❌ **Failure**: 400 Bad Request

**5.2 Get Teacher Attendance by Date**
```
GET /api/v1/teacher-attendance/date/2025-10-02
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, returns teachers with attendance status
❌ **Failure**: Empty array or incorrect data

**5.3 Get Teacher Attendance Summary**
```
GET /api/v1/teacher-attendance/summary?start_date=2025-10-01&end_date=2025-10-31
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, returns statistics
❌ **Failure**: Incorrect calculations

#### Test 6: Communications APIs

**6.1 Send Communication**
```
POST /api/v1/communications/send
Headers: Authorization: Bearer {admin_token}
Body: {
  "subject": "Test Message",
  "message": "This is a test message",
  "recipient_ids": [1, 2, 3],
  "message_type": "WHATSAPP"
}
```
✅ **Expected**: 200 OK, message sent successfully
❌ **Failure**: 400 Bad Request or send fails

**6.2 Get Communication History**
```
GET /api/v1/communications/history
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, returns list of sent communications
❌ **Failure**: Empty array or error

#### Test 7: Import APIs

**7.1 Download Student Template**
```
GET /api/v1/import/templates/students
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, Excel file downloaded
❌ **Failure**: 404 Not Found

**7.2 Upload Students**
```
POST /api/v1/import/students
Headers: Authorization: Bearer {admin_token}
Body: FormData with Excel file
```
✅ **Expected**: 200 OK, students imported successfully
❌ **Failure**: 400 Bad Request or validation errors

**7.3 Download Teacher Template**
```
GET /api/v1/import/templates/teachers
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, Excel file downloaded
❌ **Failure**: 404 Not Found

**7.4 Upload Teachers**
```
POST /api/v1/import/teachers
Headers: Authorization: Bearer {admin_token}
Body: FormData with Excel file
```
✅ **Expected**: 200 OK, teachers imported successfully
❌ **Failure**: 400 Bad Request or validation errors

#### Test 8: Activity Logs APIs

**8.1 Get Recent Activities**
```
GET /api/v1/activities/recent?limit=10
Headers: Authorization: Bearer {admin_token}
```
✅ **Expected**: 200 OK, returns recent activity logs
❌ **Failure**: Empty array or error

---

## Web Application Testing

### Test Flow 1: Admin Login and Dashboard

**Steps**:
1. Open http://localhost:3000
2. Enter credentials: `admin@avm.com` / `password123`
3. Click "Login"

✅ **Expected**:
- Redirects to `/dashboard`
- Shows admin name in header
- Navigation sidebar visible
- Dashboard displays statistics

❌ **Failure**:
- Login fails
- Stays on login page
- Dashboard doesn't load

### Test Flow 2: Student Management

**Steps**:
1. Login as admin
2. Navigate to "Students" from sidebar
3. View student list (should show 77 students)
4. Click "Add Student" button
5. Fill form:
   - Full Name: "Test Student"
   - Class: "7th"
   - Section: "A"
   - Roll Number: "100"
   - Parent Name: "Test Parent"
   - Parent Phone: "+91-9999999999"
6. Click "Save"
7. Verify student appears in list
8. Click edit icon on new student
9. Update class to "8th"
10. Click "Save"
11. Verify changes saved
12. Click delete icon
13. Confirm deletion
14. Verify student removed

✅ **Expected**: All operations succeed without errors
❌ **Failure**: Any operation fails or data not persisted

### Test Flow 3: Teacher Management

**Steps**:
1. Login as admin
2. Navigate to "Teachers"
3. View teacher list (should show 5 teachers)
4. Click on a teacher to view details
5. Click "Edit" button
6. Update phone number
7. Click "Save"
8. Verify changes saved

✅ **Expected**: Teacher details updated successfully
❌ **Failure**: Changes not saved or error occurs

### Test Flow 4: Student Attendance Approval

**Steps**:
1. Login as teacher in mobile app (see Mobile Testing section)
2. Mark attendance for some students
3. Submit for approval
4. Login as admin in web app
5. Navigate to "Attendance Approval"
6. Verify pending records appear with badge count
7. Review attendance records
8. Select records to approve
9. Click "Approve Selected"
10. Verify records approved and removed from pending list

✅ **Expected**: Attendance approval workflow works end-to-end
❌ **Failure**: Records don't appear or approval fails

### Test Flow 5: Attendance History

**Steps**:
1. Login as admin
2. Navigate to "Attendance History"
3. Select date range
4. Click "Search"
5. Verify approved attendance records displayed
6. Export to Excel (if implemented)

✅ **Expected**: History shows correct data
❌ **Failure**: No data or incorrect data

### Test Flow 6: Teacher Attendance

**Steps**:
1. Login as admin
2. Navigate to "Teacher Attendance"
3. Select today's date
4. View teacher list (should show 5 teachers)
5. Mark status for each teacher:
   - Teacher 1: Present
   - Teacher 2: Absent
   - Teacher 3: Half Day
   - Teacher 4: On Leave
   - Teacher 5: Present
6. Add remarks for absent teacher
7. Click "Submit Attendance"
8. Verify success message
9. Refresh page
10. Verify attendance persisted

✅ **Expected**: Teacher attendance marked successfully
❌ **Failure**: Attendance not saved or error occurs

### Test Flow 7: Communications

**Steps**:
1. Login as admin
2. Navigate to "Communications"
3. Click "Send Message" button
4. Fill form:
   - Select recipients (students/parents)
   - Enter subject
   - Enter message
   - Select message type: "WhatsApp"
5. Click "Send"
6. Verify message sent successfully
7. View communication history
8. Verify message appears in history

✅ **Expected**: Message sent and logged
❌ **Failure**: Send fails or not logged

### Test Flow 8: Data Import

**Steps**:
1. Login as admin
2. Navigate to "Import Data"
3. Click "Download Student Template"
4. Verify Excel file downloads
5. Open Excel file, verify structure
6. Modify a few student records
7. Upload modified file
8. Verify success message and student count
9. Navigate to "Students" page
10. Verify imported students appear
11. Repeat for Teacher template

✅ **Expected**: Import works correctly
❌ **Failure**: Upload fails or data not imported

### Test Flow 9: Profile and Logout

**Steps**:
1. Login as admin
2. Click profile icon in header
3. Click "Profile" menu item
4. View profile details
5. Click profile icon again
6. Click "Logout"
7. Verify redirected to login page
8. Try accessing dashboard URL directly
9. Verify redirected back to login

✅ **Expected**: Logout works and protected routes redirect
❌ **Failure**: Can access dashboard after logout

---

## Mobile Application Testing

### Test Flow 1: Teacher Login

**Steps**:
1. Open Expo Go app on Android device
2. Scan QR code from Expo dev server
3. App should load showing login screen
4. Enter credentials: `priya.patel@avm.com` / `password123`
5. Click "Login"

✅ **Expected**:
- Redirects to home screen
- Shows teacher name and subjects
- Navigation menu accessible

❌ **Failure**:
- Login fails
- Error not displayed
- Stays on login page

### Test Flow 2: View Students

**Steps**:
1. Login as teacher
2. Navigate to "Students" from bottom navigation
3. View student list
4. Use search to find specific student
5. Use class filter to filter by class
6. Click on a student to view details

✅ **Expected**: Students list loads and filtering works
❌ **Failure**: Empty list or filtering broken

### Test Flow 3: Mark Attendance

**Steps**:
1. Login as teacher
2. Navigate to "Attendance" from bottom navigation
3. Verify today's date selected
4. View student list for assigned classes
5. Mark attendance for students:
   - Student 1: Present
   - Student 2: Absent
   - Student 3: Late
   - Student 4: Leave
6. Add remarks for absent student
7. Click "Save" (Draft)
8. Verify success message
9. Mark more students
10. Click "Submit for Approval"
11. Confirm submission
12. Verify success message

✅ **Expected**: Attendance marked and submitted successfully
❌ **Failure**: Submission fails or records not saved

### Test Flow 4: View Attendance History

**Steps**:
1. Login as teacher
2. Navigate to "Attendance History"
3. Select date range
4. View submitted attendance
5. Verify approval status shown

✅ **Expected**: History displays correctly
❌ **Failure**: No data or error

### Test Flow 5: Profile and Logout

**Steps**:
1. Login as teacher
2. Navigate to "Profile"
3. View teacher details
4. Click "Logout"
5. Verify returned to login screen
6. Try navigating back
7. Verify redirected to login

✅ **Expected**: Logout works correctly
❌ **Failure**: Still logged in or can access screens

---

## Integration Testing

### End-to-End Workflow: Attendance with WhatsApp

**Prerequisites**:
- WhatsApp integration configured (if testing with real WhatsApp)
- At least one student with valid parent phone number

**Steps**:
1. **Teacher marks attendance** (Mobile App):
   - Login as teacher
   - Mark attendance for 10 students
   - Include mix of present/absent/late
   - Submit for approval

2. **Admin reviews** (Web App):
   - Login as admin
   - Check notification badge (should show pending count)
   - Navigate to "Attendance Approval"
   - Review submitted records
   - Approve all records

3. **System processes**:
   - Attendance records marked as approved
   - Activity logs created
   - WhatsApp messages queued (if configured)

4. **Verify** (Database):
   ```sql
   SELECT * FROM attendance WHERE admin_approved = TRUE;
   SELECT * FROM activity_logs WHERE action_type = 'attendance_approved';
   SELECT * FROM communications WHERE message_type = 'WHATSAPP';
   ```

✅ **Expected**: Complete workflow succeeds
❌ **Failure**: Any step fails or data inconsistency

---

## Performance Testing

### Load Testing

**Test 1: Concurrent Logins**
- Simulate 10 users logging in simultaneously
- Expected: All logins succeed within 5 seconds

**Test 2: Bulk Student Import**
- Import Excel file with 100 students
- Expected: Import completes within 30 seconds

**Test 3: Attendance Query Performance**
- Query attendance history for 1 month (77 students × 20 days = 1,540 records)
- Expected: Results return within 2 seconds

**Test 4: Dashboard Load Time**
- Measure time to load dashboard with statistics
- Expected: < 3 seconds on first load, < 1 second on refresh

### Browser Compatibility

**Test across**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

✅ **Expected**: All features work on all browsers
❌ **Failure**: UI broken or features not working

### Mobile Device Testing

**Test on**:
- Android 8.0+
- Different screen sizes (5", 6", 6.5"+)

✅ **Expected**: App responsive and usable
❌ **Failure**: UI elements cut off or unusable

---

## Security Testing

### Authentication Security

**Test 1: Token Expiration**
- Login and obtain token
- Wait for token to expire
- Try accessing protected endpoints
- ✅ Expected: 401 Unauthorized

**Test 2: Invalid Token**
- Use random/invalid token
- Try accessing protected endpoints
- ✅ Expected: 401 Unauthorized

**Test 3: Role-Based Access**
- Login as teacher
- Try accessing admin-only endpoints
- ✅ Expected: 403 Forbidden

### SQL Injection Testing

**Test 1: Login Form**
- Try SQL injection in username: `admin' OR '1'='1`
- ✅ Expected: Login fails

**Test 2: Search Fields**
- Try SQL injection in search: `test'; DROP TABLE students;--`
- ✅ Expected: No SQL execution, safe search

### XSS Testing

**Test 1: Input Fields**
- Enter script tag: `<script>alert('XSS')</script>`
- ✅ Expected: Sanitized, no script execution

---

## Deployment Testing

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Static files served correctly
- [ ] HTTPS enabled
- [ ] CORS configured for production domains
- [ ] API rate limiting configured
- [ ] Error logging enabled (Sentry/similar)
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured

### Production Environment Testing

**Test 1: Backend Health Check**
```bash
curl https://your-api-domain.com/health
# Expected: 200 OK
```

**Test 2: API Endpoints**
- Test all critical endpoints on production
- Verify same functionality as development

**Test 3: Database Connection**
- Verify PostgreSQL connected
- Test read/write operations

**Test 4: File Uploads**
- Test Excel import on production
- Verify files stored correctly

**Test 5: WhatsApp Integration**
- Send test message
- Verify delivery

---

## Known Issues & Workarounds

### Issue 1: Database Migration Pending
**Problem**: Teacher attendance table not created
**Workaround**: Restart backend server to trigger SQLAlchemy table creation

### Issue 2: Mobile App Connection on Different Network
**Problem**: Mobile app can't connect to backend on different WiFi
**Workaround**: Use `ngrok` to expose localhost or deploy backend

### Issue 3: WhatsApp Messages Not Sending
**Problem**: WhatsApp API credentials not configured
**Status**: Expected - requires setup
**Workaround**: Skip WhatsApp testing until credentials obtained

---

## Test Results Template

### Test Session Information

- **Date**: _______________
- **Tester**: _______________
- **Environment**: [ ] Development [ ] Staging [ ] Production
- **Backend Version**: _______________
- **Frontend Version**: _______________

### Test Results

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| BE-1.1 | Admin Login | ✅ ❌ | |
| BE-1.2 | Teacher Login | ✅ ❌ | |
| BE-2.1 | Get All Students | ✅ ❌ | |
| BE-2.2 | Create Student | ✅ ❌ | |
| BE-3.1 | Get All Teachers | ✅ ❌ | |
| BE-4.1 | Mark Attendance | ✅ ❌ | |
| BE-4.2 | Get Pending Attendance | ✅ ❌ | |
| BE-4.3 | Approve Attendance | ✅ ❌ | |
| BE-5.1 | Mark Teacher Attendance | ✅ ❌ | |
| WEB-1 | Admin Login | ✅ ❌ | |
| WEB-2 | Student Management | ✅ ❌ | |
| WEB-3 | Teacher Management | ✅ ❌ | |
| WEB-4 | Attendance Approval | ✅ ❌ | |
| WEB-5 | Teacher Attendance | ✅ ❌ | |
| WEB-6 | Communications | ✅ ❌ | |
| WEB-7 | Data Import | ✅ ❌ | |
| MOB-1 | Teacher Login | ✅ ❌ | |
| MOB-2 | View Students | ✅ ❌ | |
| MOB-3 | Mark Attendance | ✅ ❌ | |
| INT-1 | End-to-End Attendance | ✅ ❌ | |

### Critical Issues Found

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Test Summary

- **Total Tests**: _______________
- **Passed**: _______________
- **Failed**: _______________
- **Blocked**: _______________
- **Pass Rate**: _______________%

### Sign-off

- **Tested By**: _______________
- **Approved By**: _______________
- **Date**: _______________

---

## Quick Test Commands

```bash
# Backend health check
curl http://localhost:8000/health

# Test admin login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@avm.com","password":"password123"}'

# Get all students (replace TOKEN)
curl http://localhost:8000/api/v1/students/ \
  -H "Authorization: Bearer TOKEN"

# Check database
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM students;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM teachers;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM attendance;"
```

---

**End of Testing Guide**

For issues or questions, contact: Papaya Productions Team
