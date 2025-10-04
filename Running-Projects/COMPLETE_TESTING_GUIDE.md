# AVM Tutorial Management System - Complete End-to-End Testing Guide

**Version**: 1.0
**Last Updated**: October 3, 2025
**System Components**: Admin Web App + Teacher Mobile App + Parent Mobile App + Backend API

---

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Test Data Preparation](#test-data-preparation)
3. [Backend API Testing](#backend-api-testing)
4. [Admin Web App Testing](#admin-web-app-testing)
5. [Mobile App Testing - Teachers](#mobile-app-testing---teachers)
6. [Mobile App Testing - Parents](#mobile-app-testing---parents)
7. [Integration Testing](#integration-testing)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Bug Reporting Template](#bug-reporting-template)

---

## Pre-Testing Setup

### System Requirements
- **MacBook**: macOS with backend running
- **iPhone**: Connected to same WiFi network as MacBook
- **Browsers**: Chrome/Safari for admin web app
- **Expo Go**: Installed on iPhone

### Services Status Check

```bash
# 1. Check backend is running
curl http://192.168.29.163:8000/docs
# Expected: FastAPI docs page loads

# 2. Check database exists
ls /Users/koustubskulkarni/AVM/product/AVM-code/backend/avm_tutorial.db
# Expected: File exists

# 3. Check admin web app is running
curl http://localhost:3000
# Expected: React app loads

# 4. Check mobile app in Expo
# Open Expo Go on iPhone and scan QR code
# Expected: App loads to login screen
```

### Network Configuration Verification

```bash
# Verify Mac IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
# Expected: 192.168.29.163 (or your local IP)

# Test API endpoint from iPhone
# Use browser on iPhone: http://192.168.29.163:8000/docs
# Expected: API docs page loads
```

---

## Test Data Preparation

### Required Test Accounts

#### Admin Accounts
| Username | Password | Purpose |
|----------|----------|---------|
| admin | admin123 | Primary testing account |

#### Teacher Accounts
| Name | Phone Number | Classes | Subjects |
|------|-------------|---------|----------|
| Teacher 1 | (Add from DB) | Class 10A, 10B | Math, Science |
| Teacher 2 | (Add from DB) | Class 9A | English |

#### Parent Accounts
| Parent Name | Phone Number | Children | Purpose |
|-------------|-------------|----------|---------|
| Parent 1 | 9986660025 | Aarav Kumar (AVM-STU-001) | Single child testing |
| Parent 2 | 8105198350 | Diya Sharma (AVM-STU-002) | Single child testing |
| Parent 3 | 8123001495 | Rohan Patel (AVM-STU-003) | Single child testing |

#### Student Records
Minimum 10 students across Classes 8, 9, 10 with:
- Valid unique_id (AVM-STU-XXX format)
- Parent phone numbers
- Class and section assignments

### Data Import Checklist

```bash
# 1. Navigate to backend directory
cd /Users/koustubskulkarni/AVM/product/AVM-code/backend

# 2. Create test students (if not exists)
python create_students_with_phones.py

# 3. Import teachers (if needed)
# Use admin web app Import Data module with teacher_import_template.xlsx

# 4. Verify data in database
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM students;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM teachers;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM parents;"

# Expected: At least 10 students, 2 teachers, 3 parents
```

---

## Backend API Testing

### Test Suite 1: Authentication APIs

#### Test 1.1: Admin Login
```bash
curl -X POST http://192.168.29.163:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Expected Response:
# {
#   "access_token": "eyJ...",
#   "token_type": "bearer",
#   "user": { "username": "admin", "role": "admin" }
# }
# Status: 200 OK
```

**✅ Pass Criteria**: Returns JWT token and user object
**❌ Fail Criteria**: 401 Unauthorized or invalid token

#### Test 1.2: Send OTP (Teacher)
```bash
curl -X POST http://192.168.29.163:8000/api/v1/mobile/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "TEACHER_PHONE"}'

# Check backend logs for OTP:
tail -20 /Users/koustubskulkarni/AVM/product/backend-logs.txt | grep "🔐 OTP"

# Expected: "🔐 OTP sent to TEACHER_PHONE: XXXXXX"
# Status: 200 OK
```

**✅ Pass Criteria**: OTP printed in logs, SMS would be sent in production
**❌ Fail Criteria**: "Phone number not registered" or 500 error

#### Test 1.3: Send OTP (Parent)
```bash
curl -X POST http://192.168.29.163:8000/api/v1/mobile/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9986660025"}'

# Expected: OTP sent, status 200
```

#### Test 1.4: Verify OTP (Invalid)
```bash
curl -X POST http://192.168.29.163:8000/api/v1/mobile/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9986660025", "otp_code": "000000"}'

# Expected Response:
# { "detail": "Invalid or expired OTP" }
# Status: 400 Bad Request
```

**✅ Pass Criteria**: Rejects invalid OTP
**❌ Fail Criteria**: Accepts any OTP

#### Test 1.5: Verify OTP (Valid)
```bash
# Use actual OTP from logs
curl -X POST http://192.168.29.163:8000/api/v1/mobile/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9986660025", "otp_code": "XXXXXX"}'

# Expected Response:
# {
#   "access_token": "eyJ...",
#   "token_type": "bearer",
#   "user_type": "parent",
#   "user": { "phone_number": "9986660025", "children": [...] }
# }
# Status: 200 OK
```

**✅ Pass Criteria**: Returns JWT, user_type, and user object
**❌ Fail Criteria**: OTP doesn't expire after use

### Test Suite 2: Student APIs

#### Test 2.1: Get All Students (With Auth)
```bash
# First get admin token
TOKEN=$(curl -s -X POST http://192.168.29.163:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | jq -r '.access_token')

# Get students
curl -X GET http://192.168.29.163:8000/api/v1/students/ \
  -H "Authorization: Bearer $TOKEN"

# Expected: JSON array of students with all fields
# Status: 200 OK
```

**✅ Pass Criteria**: Returns array with at least 10 students
**❌ Fail Criteria**: Empty array or 401 error

#### Test 2.2: Get Students (Without Auth)
```bash
curl -X GET http://192.168.29.163:8000/api/v1/students/

# Expected Response:
# { "detail": "Not authenticated" }
# Status: 401 Unauthorized
```

**✅ Pass Criteria**: Rejects unauthenticated requests
**❌ Fail Criteria**: Returns data without token

#### Test 2.3: Get Single Student
```bash
curl -X GET http://192.168.29.163:8000/api/v1/students/1 \
  -H "Authorization: Bearer $TOKEN"

# Expected: Single student object with ID 1
# Status: 200 OK
```

### Test Suite 3: Attendance APIs

#### Test 3.1: Mark Attendance (Bulk)
```bash
curl -X POST http://192.168.29.163:8000/api/v1/attendance/mark \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-03",
    "attendance_records": [
      {
        "student_unique_id": "AVM-STU-001",
        "status": "present",
        "remarks": ""
      },
      {
        "student_unique_id": "AVM-STU-002",
        "status": "absent",
        "remarks": "Sick leave"
      }
    ]
  }'

# Expected: Success message with count
# Status: 200 OK
```

**✅ Pass Criteria**: Creates attendance records in database
**❌ Fail Criteria**: Duplicate entries allowed or invalid status accepted

#### Test 3.2: Get Attendance History
```bash
curl -X GET "http://192.168.29.163:8000/api/v1/attendance/history?start_date=2025-10-01&end_date=2025-10-03" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Array of attendance records within date range
# Status: 200 OK
```

#### Test 3.3: Filter by Class
```bash
curl -X GET "http://192.168.29.163:8000/api/v1/attendance/history?class_name=Class 10A" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Only Class 10A records
```

#### Test 3.4: Filter by Status
```bash
curl -X GET "http://192.168.29.163:8000/api/v1/attendance/history?status=absent" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Only absent records
```

### Test Suite 4: Messages APIs

#### Test 4.1: Get Messages Inbox
```bash
curl -X GET http://192.168.29.163:8000/api/v1/messages/inbox \
  -H "Authorization: Bearer $TOKEN"

# Expected: Array of messages (may be empty)
# Status: 200 OK
```

#### Test 4.2: Create Communication (Admin to Parents)
```bash
curl -X POST http://192.168.29.163:8000/api/v1/communications/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Message",
    "message": "This is a test communication",
    "target_type": "parent",
    "target_ids": []
  }'

# Expected: Success message
# Status: 201 Created
```

---

## Admin Web App Testing

### Test Suite 5: Admin Authentication

#### Test 5.1: Admin Login Page
**Steps**:
1. Open browser: `http://localhost:3000`
2. Verify login form displays
3. Enter username: `admin`
4. Enter password: `admin123`
5. Click "Login"

**✅ Pass Criteria**:
- Redirects to dashboard
- Shows admin name in header
- No console errors

**❌ Fail Criteria**:
- Stays on login page
- Shows "Invalid credentials"
- Console errors

#### Test 5.2: Invalid Login
**Steps**:
1. Enter username: `admin`
2. Enter password: `wrong`
3. Click "Login"

**✅ Pass Criteria**:
- Shows error message
- Stays on login page
- Password field cleared

#### Test 5.3: Remember Me
**Steps**:
1. Login with "Remember Me" checked
2. Close browser tab
3. Reopen `http://localhost:3000`

**✅ Pass Criteria**:
- Automatically logged in
- Dashboard loads directly

### Test Suite 6: Student Management

#### Test 6.1: View Students List
**Steps**:
1. Login as admin
2. Navigate to Students module
3. Verify students table displays

**✅ Pass Criteria**:
- All students visible
- Columns: ID, Name, Class, Section, Parent Phone
- Search box functional
- Pagination works

#### Test 6.2: Search Students
**Steps**:
1. In Students module
2. Enter student name in search box
3. Verify results filter in real-time

**✅ Pass Criteria**:
- Search works on name, ID, class
- Updates instantly as you type
- No results message if not found

#### Test 6.3: Add New Student
**Steps**:
1. Click "Add Student" button
2. Fill form:
   - First Name: Test
   - Last Name: Student
   - Class: Class 10A
   - Section: A
   - Parent Phone: 9999999999
3. Click "Save"

**✅ Pass Criteria**:
- Success message shown
- New student appears in list
- Unique ID auto-generated (AVM-STU-XXX)
- Redirects to students list

#### Test 6.4: Edit Student
**Steps**:
1. Click "Edit" on any student
2. Change class to "Class 9A"
3. Click "Save"

**✅ Pass Criteria**:
- Success message
- Changes reflected in list
- Page refreshes data

#### Test 6.5: Delete Student
**Steps**:
1. Click "Delete" on a student
2. Confirm deletion in modal

**✅ Pass Criteria**:
- Confirmation modal appears
- After confirm, student removed from list
- Success message shown

### Test Suite 7: Teacher Management

#### Test 7.1: View Teachers
**Steps**:
1. Navigate to Teachers module
2. Verify teachers list displays

**✅ Pass Criteria**:
- All teachers visible
- Columns: ID, Name, Phone, Classes, Subjects
- Can see assignments

#### Test 7.2: Import Teachers (Excel)
**Steps**:
1. Click "Import Data" button
2. Select "Teachers"
3. Choose `teacher_import_template.xlsx` file
4. Click "Upload"

**✅ Pass Criteria**:
- Progress bar shows
- Success message: "X teachers imported"
- New teachers appear in list
- Phone field populated correctly

**❌ Fail Criteria**:
- "Error: Failed to import"
- Phone field empty after import
- Duplicate entries created

#### Test 7.3: Export Teachers
**Steps**:
1. Click "Export" button
2. Select "Teachers"
3. Choose format: Excel

**✅ Pass Criteria**:
- File downloads
- Opens in Excel
- Contains all teacher data

### Test Suite 8: Attendance Module (Admin)

#### Test 8.1: View Today's Attendance
**Steps**:
1. Navigate to Attendance module
2. Default view shows today's date

**✅ Pass Criteria**:
- Shows all classes
- Status counts: Present, Absent, Late, Leave
- Percentage calculation correct

#### Test 8.2: Filter by Date
**Steps**:
1. Select date: Yesterday
2. Click "Apply Filter"

**✅ Pass Criteria**:
- Shows attendance for selected date
- Counts update correctly
- No data message if nothing marked

#### Test 8.3: Filter by Class
**Steps**:
1. Select class: "Class 10A"
2. Click "Apply Filter"

**✅ Pass Criteria**:
- Shows only Class 10A students
- Other classes hidden
- Count reflects filtered data

#### Test 8.4: Export Attendance Report
**Steps**:
1. Select date range: Last 7 days
2. Click "Export Report"

**✅ Pass Criteria**:
- Excel/CSV file downloads
- Contains attendance data for range
- Proper formatting

### Test Suite 9: Communications Module

#### Test 9.1: Create Individual Message
**Steps**:
1. Navigate to Communications
2. Click "New Message"
3. Select "Individual"
4. Choose recipient: Parent 1
5. Enter subject: "Test Message"
6. Enter message: "This is a test"
7. Click "Send"

**✅ Pass Criteria**:
- Success notification
- Message appears in sent items
- Parent can see in mobile app

#### Test 9.2: Create Bulk Message
**Steps**:
1. Click "New Message"
2. Select "Bulk"
3. Target: "All Parents"
4. Enter subject and message
5. Click "Send"

**✅ Pass Criteria**:
- Confirmation modal (warns about bulk send)
- After confirm, success message
- All parents receive message

#### Test 9.3: View Sent Messages
**Steps**:
1. Click "Sent" tab
2. Verify sent messages list

**✅ Pass Criteria**:
- Shows all sent messages
- Displays recipient count
- Shows timestamp

### Test Suite 10: Import/Export Module

#### Test 10.1: Import Students
**Steps**:
1. Navigate to Import/Export
2. Click "Import Students"
3. Choose `student_import_template.xlsx`
4. Click "Upload"

**✅ Pass Criteria**:
- Preview shows data
- Validation runs (duplicates, missing fields)
- Success message with count
- All students appear in Students module

#### Test 10.2: Clear All Data
**Steps**:
1. Click "Clear All Data" button
2. Confirm action in modal

**✅ Pass Criteria**:
- Confirmation modal with warning
- After confirm, all data deleted
- Success message
- Students/Teachers lists empty

**⚠️ Warning**: This is destructive - only test with backup data!

---

## Mobile App Testing - Teachers

### Test Suite 11: Teacher Authentication

#### Test 11.1: OTP Login (First Time)
**Steps**:
1. Open Expo Go app on iPhone
2. Scan QR code to load AVM app
3. Enter teacher phone number
4. Click "Send OTP"
5. Check backend logs for OTP:
   ```bash
   tail -f /Users/koustubskulkarni/AVM/product/backend-logs.txt | grep "🔐 OTP"
   ```
6. Enter OTP received
7. Click "Verify OTP"

**✅ Pass Criteria**:
- OTP sent message appears
- OTP found in backend logs
- After verify, shows "Setup Quick Login" screen
- No errors or crashes

**❌ Fail Criteria**:
- "Failed to send OTP" error
- "Phone number not registered" error
- App crashes after OTP entry

#### Test 11.2: Skip Quick Login Setup
**Steps**:
1. After OTP verification
2. Click "Skip for Now" on Setup Quick Login screen

**✅ Pass Criteria**:
- Navigates to Teacher Home screen
- Shows welcome message with teacher name
- Shows stats: X Classes, X Subjects

#### Test 11.3: Enable Quick Login (PIN)
**Steps**:
1. After OTP verification
2. Click "Enable Quick Login"
3. Choose "PIN"
4. Enter 6-digit PIN: 123456
5. Confirm PIN: 123456

**✅ Pass Criteria**:
- PIN confirmation matches
- Success message
- Navigates to Teacher Home
- Next login uses PIN screen

#### Test 11.4: Enable Quick Login (Biometric)
**Steps**:
1. After OTP verification
2. Click "Enable Quick Login"
3. Choose "Face ID" or "Touch ID"
4. Follow biometric setup prompts

**✅ Pass Criteria**:
- Biometric auth requested
- After successful setup, navigates to home
- Next login uses biometric

#### Test 11.5: Login with PIN
**Steps**:
1. Logout from Teacher Home
2. App returns to PIN Login screen
3. Enter PIN: 123456

**✅ Pass Criteria**:
- Accepts correct PIN
- Navigates to Teacher Home
- Session persists

#### Test 11.6: Login with Biometric
**Steps**:
1. Logout from Teacher Home
2. App shows "Use Face ID" button
3. Click button and authenticate

**✅ Pass Criteria**:
- Biometric prompt appears
- After success, navigates to Teacher Home

#### Test 11.7: Logout
**Steps**:
1. From Teacher Home
2. Click "Logout" button in header
3. Confirm logout

**✅ Pass Criteria**:
- Confirmation alert appears
- After confirm, returns to PIN Login (not OTP Login)
- PIN/Biometric settings preserved
- Token cleared from storage

### Test Suite 12: Teacher Home Screen

#### Test 12.1: Home Screen Display
**Steps**:
1. Login as teacher
2. Observe home screen

**✅ Pass Criteria**:
- Shows "Welcome back, [Teacher Name]"
- Stats cards: "X Classes", "X Subjects"
- Quick Actions menu with 5 items:
  - 📋 Mark Attendance
  - 👥 My Students
  - 📜 Attendance History
  - 📨 Messages
  - 👤 My Profile
- Footer: "AVM Tutorials Teacher App v1.0"

#### Test 12.2: Classes Card (Tappable)
**Steps**:
1. Tap on "X Classes" stat card
2. Modal opens

**✅ Pass Criteria**:
- Modal displays with title "My Classes"
- Lists all assigned classes (e.g., Class 10A, Class 10B)
- Each class shows icon 🏫
- "Close" button at bottom
- Tap outside modal or close button dismisses

#### Test 12.3: Subjects Card (Tappable)
**Steps**:
1. Tap on "X Subjects" stat card
2. Modal opens

**✅ Pass Criteria**:
- Modal displays with title "My Subjects"
- Lists all assigned subjects (e.g., Math, Science)
- Each subject shows icon 📚
- "Close" button at bottom
- Tap outside modal or close button dismisses

### Test Suite 13: Mark Attendance

#### Test 13.1: Open Attendance Screen
**Steps**:
1. From Teacher Home
2. Tap "Mark Attendance"

**✅ Pass Criteria**:
- Attendance screen loads
- Shows date picker (default: today)
- Shows class filter dropdown (default: "all")
- Shows search box
- Students list loads from database

**❌ Fail Criteria**:
- Loading spinner never stops
- Empty student list (if students exist)
- API error shown

#### Test 13.2: Filter by Class (Dynamic)
**Steps**:
1. Tap class filter dropdown
2. Observe available options

**✅ Pass Criteria**:
- Options are NOT hardcoded
- Shows "all" + actual classes from database (e.g., Class 8A, Class 9A, Class 10A)
- No classes that don't exist in student data

**Steps Continued**:
3. Select "Class 10A"
4. Observe student list

**✅ Pass Criteria**:
- Only Class 10A students displayed
- Other classes filtered out
- Count updates to match filtered students

#### Test 13.3: Search Students
**Steps**:
1. Enter student name in search box
2. Type: "Aarav"

**✅ Pass Criteria**:
- Results filter in real-time
- Shows students matching "Aarav" in name or ID
- Search is case-insensitive

#### Test 13.4: Mark Single Student Present
**Steps**:
1. Find student: Aarav Kumar (AVM-STU-001)
2. Tap "P" (Present) button

**✅ Pass Criteria**:
- Button highlights in green
- Other status buttons (A, L, Leave) dim/disabled
- Can tap again to deselect

#### Test 13.5: Mark Student Absent with Remarks
**Steps**:
1. Find student: Diya Sharma (AVM-STU-002)
2. Tap "A" (Absent) button
3. Tap "Add Remarks" (if available)
4. Enter: "Sick leave"
5. Tap "Save Remarks"

**✅ Pass Criteria**:
- Absent button highlighted in red
- Remarks saved and displayed
- Can edit remarks later

#### Test 13.6: Mark Student Late
**Steps**:
1. Find student: Rohan Patel (AVM-STU-003)
2. Tap "L" (Late) button

**✅ Pass Criteria**:
- Late button highlighted in yellow/orange
- Status recorded

#### Test 13.7: Mark Student Leave
**Steps**:
1. Find another student
2. Tap "Leave" button

**✅ Pass Criteria**:
- Leave button highlighted
- Status recorded

#### Test 13.8: Submit Attendance (Success)
**Steps**:
1. Mark at least 3 students with different statuses
2. Scroll down
3. Tap "Submit Attendance" button

**✅ Pass Criteria**:
- Loading indicator appears
- Success message: "Attendance marked successfully"
- Navigates back to Teacher Home or clears form
- Check admin attendance module - records appear

**API Verification**:
```bash
curl -X GET "http://192.168.29.163:8000/api/v1/attendance/history?date=2025-10-03" \
  -H "Authorization: Bearer $TOKEN"

# Should show newly marked attendance records
```

#### Test 13.9: Submit Attendance (Validation)
**Steps**:
1. Don't mark any students
2. Tap "Submit Attendance"

**✅ Pass Criteria**:
- Error message: "Please mark attendance for at least one student"
- Stays on attendance screen

### Test Suite 14: My Students

#### Test 14.1: Open Students Screen
**Steps**:
1. From Teacher Home
2. Tap "My Students"

**✅ Pass Criteria**:
- Students screen loads
- Shows search box
- Shows class filter (dynamic)
- Shows list of students in cards

#### Test 14.2: Student Card Display
**Steps**:
1. Observe first student card

**✅ Pass Criteria**:
- Shows student avatar (first letter of name)
- Student name in bold
- Class and section (e.g., "Class 10A - Section A")
- Unique ID (e.g., "ID: AVM-STU-001")
- Parent phone number
- Card has subtle shadow and rounded corners

#### Test 14.3: Dynamic Class Filter
**Steps**:
1. Tap class filter dropdown
2. Verify options

**✅ Pass Criteria**:
- Shows "all" + classes from database
- NOT hardcoded list
- Matches actual student data

**Steps Continued**:
3. Select "Class 10A"

**✅ Pass Criteria**:
- Only Class 10A students shown
- Count updates

#### Test 14.4: Search Students
**Steps**:
1. Enter "Kumar" in search box

**✅ Pass Criteria**:
- Filters students by name, ID, class, section
- Real-time filtering
- Case-insensitive

#### Test 14.5: Pull to Refresh
**Steps**:
1. Pull down on students list

**✅ Pass Criteria**:
- Loading spinner appears
- Data reloads from API
- List updates

### Test Suite 15: Attendance History (Teacher)

#### Test 15.1: Open Attendance History
**Steps**:
1. From Teacher Home
2. Tap "Attendance History"

**✅ Pass Criteria**:
- Attendance history screen loads
- Shows date pickers (start and end date)
- Shows status filter dropdown
- Shows class filter dropdown (dynamic)
- Shows search box

#### Test 15.2: Default View
**Steps**:
1. Observe default state

**✅ Pass Criteria**:
- Shows last 7 days by default
- Shows all statuses
- Shows all classes
- Records displayed in cards

#### Test 15.3: Filter by Date Range
**Steps**:
1. Tap "Start Date" picker
2. Select: October 1, 2025
3. Tap "End Date" picker
4. Select: October 3, 2025
5. Tap "Apply Filters"

**✅ Pass Criteria**:
- Only records between Oct 1-3 shown
- Count updates
- API called with date params

#### Test 15.4: Filter by Status
**Steps**:
1. Tap status filter
2. Select "Absent"
3. Tap "Apply Filters"

**✅ Pass Criteria**:
- Only absent records shown
- Other statuses hidden

#### Test 15.5: Filter by Class (Dynamic)
**Steps**:
1. Tap class filter
2. Verify options are dynamic (from database)
3. Select "Class 10A"
4. Tap "Apply Filters"

**✅ Pass Criteria**:
- Only Class 10A records shown
- Options loaded from actual data, not hardcoded

#### Test 15.6: Search Records
**Steps**:
1. Enter student name in search

**✅ Pass Criteria**:
- Filters records by student name or ID
- Real-time search

#### Test 15.7: Attendance Record Card
**Steps**:
1. Observe a single record card

**✅ Pass Criteria**:
- Student name and ID
- Date
- Status with color coding:
  - Present = Green
  - Absent = Red
  - Late = Yellow
  - Leave = Blue
- Remarks (if any)
- Class and section

### Test Suite 16: Messages (Teacher)

#### Test 16.1: Open Messages
**Steps**:
1. From Teacher Home
2. Tap "Messages"

**✅ Pass Criteria**:
- Messages screen loads
- Shows inbox
- If no messages: "No messages yet"
- If messages exist: List of message cards

#### Test 16.2: Message Card Display
**Steps**:
1. Observe a message card (if exists)

**✅ Pass Criteria**:
- Shows sender name (e.g., "Admin")
- Shows subject/title
- Shows message preview (first 100 chars)
- Shows timestamp (e.g., "2 hours ago")
- Shows read/unread indicator (dot or bold text)

#### Test 16.3: Tap Message to Read
**Steps**:
1. Tap on an unread message

**✅ Pass Criteria**:
- Message expands or opens detail view
- Shows full message content
- Marks as read automatically
- Unread indicator disappears

#### Test 16.4: Token Authentication
**Steps**:
1. Check if messages load without errors

**✅ Pass Criteria**:
- Uses 'access_token' from AsyncStorage
- No 401 Unauthorized errors
- API call successful

**❌ Fail Criteria**:
- "Could not validate credentials" error
- Empty messages due to auth failure

### Test Suite 17: Teacher Profile

#### Test 17.1: Open Profile
**Steps**:
1. From Teacher Home
2. Tap "My Profile"

**✅ Pass Criteria**:
- Profile screen loads
- Shows teacher information

#### Test 17.2: Profile Information Display
**Steps**:
1. Observe profile sections

**✅ Pass Criteria**:
- **Personal Info Section**:
  - Full name
  - Phone number
  - Email (if available)
  - Unique ID (AVM-TCH-XXX)

- **Teaching Info Section**:
  - Assigned classes (e.g., Class 10A, Class 10B)
  - Assigned subjects (e.g., Math, Science)

- **Logout Button** at bottom

#### Test 17.3: Logout from Profile
**Steps**:
1. Tap "Logout" button
2. Confirm in alert

**✅ Pass Criteria**:
- Alert: "Are you sure you want to logout?"
- After confirm, navigates to PIN Login screen
- PIN settings preserved
- Token cleared

---

## Mobile App Testing - Parents

### Test Suite 18: Parent Authentication

#### Test 18.1: OTP Login (Parent)
**Steps**:
1. Open AVM app in Expo Go
2. Enter parent phone: 9986660025
3. Click "Send OTP"
4. Check backend logs for OTP
5. Enter OTP and verify

**✅ Pass Criteria**:
- OTP sent successfully
- After verify, shows "Setup Quick Login" or navigates to Parent Home
- Loads children data correctly

#### Test 18.2: Parent Quick Login Setup
**Steps**:
1. After OTP, setup PIN or biometric
2. Follow same steps as Teacher Test 11.3/11.4

**✅ Pass Criteria**:
- Same behavior as teacher quick login
- Settings persist after logout

### Test Suite 19: Parent Home Screen

#### Test 19.1: Home Screen Display
**Steps**:
1. Login as parent (phone: 9986660025)
2. Observe home screen

**✅ Pass Criteria**:
- Shows "Welcome, [Parent Name]"
- **My Children Section**:
  - Shows child cards (at least 1)
  - Each card shows:
    - Child avatar (first letter)
    - Child name
    - Class and section
    - Unique ID
    - "View" button
  - If no children: "No children registered"

- **Quick Actions Section**:
  - 📨 Messages (with badge count if unread)
  - 📋 Attendance
  - 📚 Homework (Coming Soon)
  - 💰 Fees (Coming Soon)
  - 📅 Events (Coming Soon)

- **Contact Card**:
  - "Need Help?" section
  - "Contact school administration"

- **Footer**: "AVM Tutorials Parent App v1.0"

#### Test 19.2: Child Card Display
**Steps**:
1. Observe child card details

**✅ Pass Criteria**:
- Avatar with first letter in green circle
- Child name in bold (e.g., "Aarav Kumar")
- Class info (e.g., "Class 10A - Section A")
- ID displayed (e.g., "ID: AVM-STU-001")
- "View" button (may show alert "Coming Soon")

#### Test 19.3: Badge Error Fix
**Steps**:
1. Observe Messages card badge

**✅ Pass Criteria**:
- If 0 messages: No badge shown
- If > 0 messages: Red badge with count
- No error: "Text strings must be rendered within <Text> component"

**❌ Fail Criteria**:
- Error popup appears
- Badge shows "0" when should be hidden

### Test Suite 20: Messages (Parent)

#### Test 20.1: Open Messages from Home
**Steps**:
1. From Parent Home
2. Tap "Messages" card

**✅ Pass Criteria**:
- Messages screen loads
- Shows inbox of messages sent to this parent
- No 401 authentication error
- Uses 'access_token' correctly

**❌ Fail Criteria**:
- Error popup appears
- "Could not validate credentials"
- App crashes

#### Test 20.2: View Messages Inbox
**Steps**:
1. Observe messages list

**✅ Pass Criteria**:
- Shows messages sent by admin
- Each message card shows:
  - Sender name
  - Subject/Title
  - Message preview
  - Timestamp
  - Read/Unread status (blue dot or bold)
- If no messages: "No messages yet"

#### Test 20.3: Read Message
**Steps**:
1. Tap on a message card

**✅ Pass Criteria**:
- Message expands or opens detail view
- Shows full message content
- Marks as read automatically
- API call successful

### Test Suite 21: Attendance History (Parent)

#### Test 21.1: Open Attendance History
**Steps**:
1. From Parent Home
2. Tap "Attendance" card

**✅ Pass Criteria**:
- Attendance history screen loads
- Shows date range pickers
- Shows status filter
- Shows class filter (dynamic)
- Shows search box

#### Test 21.2: Parent-Only Filtering (CRITICAL)
**Steps**:
1. Observe attendance records displayed
2. Note student names shown

**✅ Pass Criteria**:
- ONLY shows attendance for parent's children
- Does NOT show other students' attendance
- If parent has child "Aarav Kumar" (AVM-STU-001), only Aarav's records visible
- Other students completely hidden

**❌ Fail Criteria**:
- Shows all students in school
- Shows other parents' children
- Privacy breach

#### Test 21.3: Filter Parent's Child Attendance by Date
**Steps**:
1. Select date range: Last 7 days
2. Tap "Apply Filters"

**✅ Pass Criteria**:
- Shows child's attendance for last 7 days
- Only child's records, not others

#### Test 21.4: Filter by Status
**Steps**:
1. Select status: "Absent"
2. Tap "Apply Filters"

**✅ Pass Criteria**:
- Shows only days when child was absent
- Still filtered to parent's children only

#### Test 21.5: Search Child Records
**Steps**:
1. Enter child name in search

**✅ Pass Criteria**:
- Filters within parent's children records
- Case-insensitive search

#### Test 21.6: Multiple Children (If Applicable)
**Test Data Needed**: Parent with 2+ children

**Steps**:
1. Login as parent with multiple children
2. View attendance history

**✅ Pass Criteria**:
- Shows attendance for ALL parent's children
- Still does NOT show other students
- Can filter by class to isolate one child

---

## Integration Testing

### Test Suite 22: End-to-End User Journeys

#### Test 22.1: Teacher Daily Attendance Journey
**Scenario**: Teacher marks attendance in morning, admin reviews, parent receives notification

**Steps**:
1. **Teacher Mobile App**:
   - Login as teacher
   - Navigate to Mark Attendance
   - Select today's date
   - Filter: Class 10A
   - Mark 5 students: 3 Present, 1 Absent, 1 Late
   - Add remark for absent student: "Sick leave"
   - Submit attendance

2. **Verify in Admin Web App**:
   - Login as admin
   - Navigate to Attendance module
   - Filter: Today, Class 10A
   - Verify 5 records appear with correct statuses
   - Verify remark shows for absent student

3. **Verify in Parent Mobile App**:
   - Login as parent of absent student
   - Navigate to Attendance History
   - Filter: Today
   - Verify child's absence shows with remark

**✅ Pass Criteria**: Data flows correctly through all 3 platforms

#### Test 22.2: Student Data CRUD Journey
**Scenario**: Admin adds student, teacher sees in list, parent can view child

**Steps**:
1. **Admin Web App**:
   - Add new student:
     - Name: Test Student
     - Class: Class 9A
     - Parent Phone: 9999999999
   - Note unique ID generated (e.g., AVM-STU-050)

2. **Teacher Mobile App**:
   - Navigate to My Students
   - Filter: Class 9A
   - Verify "Test Student" appears
   - Check all details correct

3. **Create Parent Login**:
   - Backend: Ensure parent record exists for phone 9999999999

4. **Parent Mobile App**:
   - Login with phone 9999999999
   - Verify "Test Student" shows in My Children section

5. **Admin Web App**:
   - Edit student: Change class to Class 10A

6. **Teacher Mobile App**:
   - Refresh Students list
   - Filter: Class 10A
   - Verify "Test Student" now in Class 10A

7. **Admin Web App**:
   - Delete "Test Student"

8. **Teacher Mobile App**:
   - Refresh
   - Verify "Test Student" no longer appears

**✅ Pass Criteria**: Changes propagate across all platforms in real-time or after refresh

#### Test 22.3: Communication Flow Journey
**Scenario**: Admin sends message, parent receives and reads

**Steps**:
1. **Admin Web App**:
   - Navigate to Communications
   - Create new message:
     - Target: All Parents
     - Subject: "Parent-Teacher Meeting"
     - Message: "PTM scheduled for Oct 10th at 10 AM"
   - Send message

2. **Parent Mobile App** (Multiple Parents):
   - Login as Parent 1 (9986660025)
   - Navigate to Messages
   - Verify message appears with subject "Parent-Teacher Meeting"
   - Message shows as unread (blue dot or bold)
   - Tap to read
   - Verify full message displays
   - Logout

   - Login as Parent 2 (8105198350)
   - Navigate to Messages
   - Verify same message appears

3. **Admin Web App**:
   - Check sent messages
   - Verify message shows sent to all parents

**✅ Pass Criteria**: Message delivered to all parents, read status tracked

#### Test 22.4: Bulk Import to Mobile View Journey
**Scenario**: Admin imports students via Excel, teacher immediately sees them on mobile

**Steps**:
1. **Prepare Excel File**:
   - Open `student_import_template.xlsx`
   - Add 5 new students (IDs 051-055)
   - All in Class 8A
   - Save file

2. **Admin Web App**:
   - Navigate to Import/Export
   - Click "Import Students"
   - Choose file
   - Upload
   - Verify success: "5 students imported"

3. **Verify in Admin**:
   - Navigate to Students
   - Filter: Class 8A
   - Verify 5 new students appear

4. **Teacher Mobile App**:
   - Navigate to My Students
   - Pull to refresh
   - Filter: Class 8A
   - Verify 5 new students appear

5. **Teacher Mobile - Attendance**:
   - Navigate to Mark Attendance
   - Filter: Class 8A
   - Verify 5 new students in list
   - Mark attendance for them
   - Submit
   - Verify success

**✅ Pass Criteria**: Imported data immediately accessible on mobile

### Test Suite 23: Multi-User Concurrent Testing

#### Test 23.1: Two Teachers Marking Attendance Simultaneously
**Requirements**: 2 Teacher accounts, 2 iPhones (or use Expo Go + web mobile simulator)

**Steps**:
1. **Teacher 1 (iPhone 1)**:
   - Login as Teacher 1
   - Navigate to Mark Attendance
   - Select Class 10A
   - Start marking attendance (don't submit yet)

2. **Teacher 2 (iPhone 2)**:
   - Login as Teacher 2
   - Navigate to Mark Attendance
   - Select Class 9A
   - Mark attendance for Class 9A
   - Submit

3. **Teacher 1**:
   - Continue marking Class 10A
   - Submit attendance

4. **Admin Web App**:
   - Check Attendance module
   - Verify both teachers' attendance recorded
   - No conflicts or overwrite
   - Both classes have separate records

**✅ Pass Criteria**: No data loss, both submissions successful

#### Test 23.2: Admin Edits While Teacher Views
**Steps**:
1. **Teacher Mobile App**:
   - Open My Students screen
   - View list of students

2. **Admin Web App** (simultaneously):
   - Edit a student's class
   - Change from Class 10A to Class 10B
   - Save

3. **Teacher Mobile App**:
   - Pull to refresh
   - Verify student now shows in Class 10B
   - Filter: Class 10A
   - Verify student no longer in Class 10A

**✅ Pass Criteria**: Changes reflect after refresh, no crashes

---

## Performance Testing

### Test Suite 24: Load and Response Time

#### Test 24.1: Mobile App Launch Time
**Steps**:
1. Force quit app
2. Reopen from Expo Go
3. Measure time to login screen

**✅ Pass Criteria**: < 3 seconds to login screen

#### Test 24.2: Login Speed (OTP)
**Steps**:
1. Enter phone and send OTP
2. Measure time to receive OTP (check logs)
3. Enter OTP and verify
4. Measure time to home screen

**✅ Pass Criteria**:
- OTP generation: < 2 seconds
- OTP verification to home: < 2 seconds

#### Test 24.3: Student List Load Time
**Steps**:
1. Navigate to My Students
2. Measure time from screen open to list display

**✅ Pass Criteria**: < 2 seconds for up to 100 students

#### Test 24.4: Attendance Submission Speed
**Steps**:
1. Mark attendance for 30 students
2. Click Submit
3. Measure time to success message

**✅ Pass Criteria**: < 3 seconds for 30 records

#### Test 24.5: Search Responsiveness
**Steps**:
1. Open My Students (100+ students loaded)
2. Type in search box
3. Measure filter response

**✅ Pass Criteria**: Real-time filtering, no lag (< 100ms)

#### Test 24.6: Admin Dashboard Load Time
**Steps**:
1. Login to admin web app
2. Measure time to dashboard display

**✅ Pass Criteria**: < 3 seconds on 4G/WiFi

---

## Security Testing

### Test Suite 25: Authentication & Authorization

#### Test 25.1: Access Without Token
**Steps**:
1. Clear AsyncStorage (or use Postman)
2. Try to access `GET /api/v1/students/`

**✅ Pass Criteria**: 401 Unauthorized error

#### Test 25.2: Expired Token
**Steps**:
1. Manually edit token expiry in database (set to past date)
2. Try to make API call

**✅ Pass Criteria**: 401 Unauthorized, forced to re-login

#### Test 25.3: Parent Cannot Access Other Children
**Steps**:
1. Login as Parent 1 (child: AVM-STU-001)
2. Try to access attendance for AVM-STU-005 (another parent's child)

**✅ Pass Criteria**: Only AVM-STU-001 data visible, cannot see others

#### Test 25.4: Teacher Cannot Access Admin Endpoints
**Steps**:
1. Get teacher JWT token
2. Try to access admin endpoints (e.g., delete student)

**✅ Pass Criteria**: 403 Forbidden or 401 error

#### Test 25.5: OTP Expiry
**Steps**:
1. Request OTP
2. Wait 11 minutes (OTP expires after 10 mins)
3. Try to verify OTP

**✅ Pass Criteria**: "Invalid or expired OTP" error

#### Test 25.6: OTP Single Use
**Steps**:
1. Request OTP
2. Verify OTP successfully
3. Try to verify same OTP again

**✅ Pass Criteria**: OTP already used, rejected

#### Test 25.7: PIN Brute Force Protection
**Test**: Try 10 wrong PINs in a row

**⚠️ Note**: Currently no lockout implemented - future enhancement

---

## Bug Reporting Template

When you find a bug during testing, use this template:

### Bug Report: [Short Description]

**Bug ID**: BUG-XXX
**Reported By**: [Your Name]
**Date**: [Date]
**Severity**: Critical / High / Medium / Low
**Module**: Admin Web App / Teacher Mobile / Parent Mobile / Backend API

#### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

#### Expected Behavior
What should happen

#### Actual Behavior
What actually happens

#### Screenshots/Logs
[Attach screenshots or paste error logs]

#### Environment
- Device: iPhone 12 / MacBook Pro / etc.
- OS: iOS 17 / macOS Sonoma / etc.
- Browser: Chrome 118 / Safari 17 / etc.
- Network: WiFi / 4G / etc.

#### Additional Context
Any other relevant information

---

## Test Execution Checklist

### Pre-Testing
- [ ] Backend server running on 192.168.29.163:8000
- [ ] Admin web app running on localhost:3000
- [ ] Mobile app loaded in Expo Go
- [ ] Test data present in database (students, teachers, parents)
- [ ] Backend logs accessible for OTP monitoring

### Backend API Testing
- [ ] Authentication APIs (6 tests)
- [ ] Student APIs (3 tests)
- [ ] Attendance APIs (4 tests)
- [ ] Messages APIs (2 tests)

### Admin Web App Testing
- [ ] Admin Authentication (3 tests)
- [ ] Student Management (5 tests)
- [ ] Teacher Management (3 tests)
- [ ] Attendance Module (4 tests)
- [ ] Communications Module (3 tests)
- [ ] Import/Export Module (2 tests)

### Teacher Mobile App Testing
- [ ] Teacher Authentication (7 tests)
- [ ] Teacher Home Screen (3 tests)
- [ ] Mark Attendance (9 tests)
- [ ] My Students (5 tests)
- [ ] Attendance History (7 tests)
- [ ] Messages (4 tests)
- [ ] Profile (3 tests)

### Parent Mobile App Testing
- [ ] Parent Authentication (2 tests)
- [ ] Parent Home Screen (3 tests)
- [ ] Messages (3 tests)
- [ ] Attendance History (6 tests)

### Integration Testing
- [ ] Teacher Daily Attendance Journey
- [ ] Student Data CRUD Journey
- [ ] Communication Flow Journey
- [ ] Bulk Import to Mobile View Journey
- [ ] Multi-User Concurrent Testing (2 tests)

### Performance Testing
- [ ] Mobile App Launch Time
- [ ] Login Speed
- [ ] Student List Load Time
- [ ] Attendance Submission Speed
- [ ] Search Responsiveness
- [ ] Admin Dashboard Load Time

### Security Testing
- [ ] Access Without Token
- [ ] Expired Token
- [ ] Parent Cannot Access Other Children
- [ ] Teacher Cannot Access Admin Endpoints
- [ ] OTP Expiry
- [ ] OTP Single Use
- [ ] PIN Brute Force Protection

---

## Summary Report Template

After completing all tests, fill this summary:

### Test Execution Summary

**Date**: [Date]
**Tested By**: [Name]
**Duration**: [X hours]

#### Test Results Overview
- **Total Tests**: [Number]
- **Passed**: [Number] ([Percentage]%)
- **Failed**: [Number] ([Percentage]%)
- **Blocked**: [Number] (couldn't test due to dependency)
- **Not Tested**: [Number]

#### Critical Issues Found
1. [Issue 1 - Description]
2. [Issue 2 - Description]
3. [Issue 3 - Description]

#### High Priority Issues Found
1. [Issue 1]
2. [Issue 2]

#### Medium/Low Issues Found
1. [Issue 1]
2. [Issue 2]

#### Recommendations
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

#### Sign-Off
- **Tested By**: [Name]
- **Approved By**: [Name]
- **Status**: Ready for Production / Needs Fixes / Requires Retesting

---

## Quick Test Commands

### Start All Services
```bash
# Terminal 1: Backend
cd /Users/koustubskulkarni/AVM/product/AVM-code/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Admin Web App
cd /Users/koustubskulkarni/AVM/product/AVM-code/frontend/web-app
npm start

# Terminal 3: Mobile App
cd /Users/koustubskulkarni/AVM/product/AVM-code/frontend/mobile-app
npx expo start

# Terminal 4: Watch OTP Logs
cd /Users/koustubskulkarni/AVM/product
./watch-otps.sh
```

### Quick Database Checks
```bash
cd /Users/koustubskulkarni/AVM/product/AVM-code/backend

# Count records
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM students;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM teachers;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM parents;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM attendance;"

# View recent attendance
sqlite3 avm_tutorial.db "SELECT * FROM attendance ORDER BY marked_at DESC LIMIT 10;"

# Check OTPs
sqlite3 avm_tutorial.db "SELECT * FROM otps WHERE is_verified = 0;"
```

### Reset Test Environment
```bash
# WARNING: This clears all data!
cd /Users/koustubskulkarni/AVM/product/AVM-code/backend

# Backup database first
cp avm_tutorial.db avm_tutorial_backup.db

# Clear data via admin or manually
sqlite3 avm_tutorial.db "DELETE FROM attendance;"
sqlite3 avm_tutorial.db "DELETE FROM communications;"
sqlite3 avm_tutorial.db "DELETE FROM otps;"

# Recreate test data
python create_students_with_phones.py
```

---

**End of Testing Guide**

**Note**: This guide covers current implementation. Update as new features are added.
