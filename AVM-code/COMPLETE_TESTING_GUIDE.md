# 🧪 Complete End-to-End Testing Guide - AVM Tutorial Management System

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Admin Workflows](#admin-workflows)
3. [Teacher Workflows](#teacher-workflows)
4. [Parent Workflows](#parent-workflows)
5. [Integration Testing](#integration-testing)
6. [Test Data Setup](#test-data-setup)

---

## 🎯 System Overview

**Components:**
- **Admin Web App:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Mobile App:** Expo Go (Teachers & Parents)

**User Types:**
- **Admin:** Full system access via web app
- **Teacher:** Mobile app access (Attendance, Messages, Students)
- **Parent:** Mobile app access (View child's attendance, Messages)

---

## 👨‍💼 ADMIN WORKFLOWS

### **Setup & Access**

#### 1. Admin Login
**URL:** http://localhost:3000

**Test Steps:**
1. Open http://localhost:3000
2. Login with admin credentials:
   - **Username:** admin / teacher username
   - **Password:** password123 (or your admin password)
3. Should redirect to Dashboard

**Expected Result:**
✅ Dashboard shows live statistics
✅ All navigation menu items visible
✅ No errors in console

---

### **Workflow 1: Student Management**

#### Test 1.1: View Students List
1. Click **"Students"** in sidebar
2. Should see table with all students
3. Check columns: Name, Class, Parent Phone, Status

**Expected Result:**
✅ All students displayed
✅ Search bar functional
✅ Filter by class works
✅ Auto-refresh every 30 seconds

#### Test 1.2: Add New Student
1. Click **"Add Student"** button
2. Fill form:
   - Full Name: "Test Student"
   - Class: "10th Grade"
   - Section: "A"
   - Parent Name: "Test Parent"
   - Parent Phone: "+919876543210"
   - Parent Email: "parent@test.com"
3. Click **"Save"**

**Expected Result:**
✅ Student added successfully
✅ Toast notification shows "Student added"
✅ Student appears in list immediately
✅ Parent can now login with this phone

#### Test 1.3: Edit Student
1. Click **Edit** icon on any student
2. Modify details (e.g., change class)
3. Click **"Update"**

**Expected Result:**
✅ Student updated
✅ Changes reflected immediately
✅ Toast shows "Student updated"

#### Test 1.4: Bulk Import Students
1. Click **"Import Students"** (if available)
2. Upload Excel file with student data
3. Review preview
4. Click **"Import"**

**Expected Result:**
✅ All valid students imported
✅ Errors shown for invalid rows
✅ Summary displayed (X imported, Y failed)

---

### **Workflow 2: Teacher Management**

#### Test 2.1: Add Teacher
1. Go to **"Teachers"** page
2. Click **"Add Teacher"**
3. Fill form:
   - Full Name: "Test Teacher"
   - Phone: "+919876543211"
   - Email: "teacher@test.com"
   - Subjects: "Mathematics, Science"
   - Classes Assigned: "10th A, 10th B"
4. Click **"Save"**

**Expected Result:**
✅ Teacher added successfully
✅ Teacher can login via mobile app
✅ Phone number registered for OTP

#### Test 2.2: Assign Classes to Teacher
1. Edit teacher
2. Update "Classes Assigned" field
3. Save changes

**Expected Result:**
✅ Teacher sees only assigned classes in mobile app
✅ Can mark attendance only for assigned classes

---

### **Workflow 3: Attendance Management**

#### Test 3.1: View Pending Attendance
1. Go to **"Attendance"** page
2. Click **"Pending Approval"** tab
3. Should see attendance marked by teachers

**Expected Result:**
✅ List of pending attendance records
✅ Shows: Teacher, Class, Date, Status

#### Test 3.2: Approve Attendance
1. Select an attendance record
2. Click **"Approve"**
3. Confirm approval

**Expected Result:**
✅ Status changes to "Approved"
✅ Parents receive notification (if enabled)
✅ WhatsApp message sent to parents (if configured)

#### Test 3.3: Reject Attendance
1. Select an attendance record
2. Click **"Reject"**
3. Add rejection reason
4. Confirm

**Expected Result:**
✅ Status changes to "Rejected"
✅ Teacher notified to re-submit

#### Test 3.4: View Attendance Reports
1. Go to **"Reports"** tab
2. Select date range
3. Select class/student
4. Click **"Generate Report"**

**Expected Result:**
✅ Report shows attendance summary
✅ Can export to PDF/Excel
✅ Shows attendance percentage

---

### **Workflow 4: Communications**

#### Test 4.1: Send Message to All Parents
1. Go to **"Communications"** page
2. Click **"Send New Message"**
3. Fill form:
   - Subject: "Test Announcement"
   - Message: "This is a test message"
   - Recipients: "All Parents"
4. Click **"Send"**

**Expected Result:**
✅ Message sent to all parents
✅ Shows in communication history
✅ Parents see message in mobile app
✅ Push notification sent (if enabled)

#### Test 4.2: Send Message to Specific Class
1. Click **"Send New Message"**
2. Recipients: Select "Class 10A"
3. Enter subject and message
4. Click **"Send"**

**Expected Result:**
✅ Only Class 10A parents receive message
✅ Message count correct in history

#### Test 4.3: View Communication History
1. Go to **"History"** tab
2. Should see all sent messages
3. Check auto-refresh (every 30 seconds)

**Expected Result:**
✅ All messages displayed with timestamps
✅ Shows recipient count
✅ Auto-refresh works

---

### **Workflow 5: Dashboard Analytics**

#### Test 5.1: Verify Real-Time Data
1. Open Dashboard
2. Note current statistics
3. Add a new student from another tab
4. Wait 30 seconds (auto-refresh)
5. Dashboard should update

**Expected Result:**
✅ Total Students count increases
✅ Auto-refresh works every 30 seconds
✅ All stats are accurate

#### Test 5.2: Check All Dashboard Cards
Verify each card shows correct data:
- **Total Students** → Matches Students page count
- **Teachers** → Matches Teachers page count
- **Pending Attendance** → Matches Attendance pending count
- **Messages Sent** → Matches Communications history
- **Attendance Rate** → Calculated correctly
- **Active Classes** → Unique classes from students

**Expected Result:**
✅ All numbers accurate
✅ No hardcoded values
✅ Live data from backend

---

## 👨‍🏫 TEACHER WORKFLOWS (Mobile App)

### **Setup**

**Required:**
- Teacher added in admin panel with phone number
- Expo Go installed on phone
- Phone connected to same WiFi as backend

---

### **Workflow 1: First-Time Login**

#### Test 1.1: OTP Login
1. Open mobile app
2. Enter teacher phone: `+919876543211` (registered teacher)
3. Click **"Send OTP"**
4. Check backend console for OTP (development mode)
5. Enter OTP
6. Click **"Verify OTP"**

**Expected Result:**
✅ OTP sent successfully
✅ OTP appears in backend console
✅ After verification → "Setup Quick Login" screen

#### Test 1.2: Setup PIN
1. On "Setup Quick Login" screen
2. Click **"Set up PIN"**
3. Enter 4-digit PIN (e.g., 1234)
4. Confirm PIN
5. Optional: Enable biometric

**Expected Result:**
✅ PIN saved successfully
✅ Navigates to Teacher Home Screen
✅ Push token registered (check console)

#### Test 1.3: Test Unregistered Number
1. Logout (if option available) or clear app data
2. Enter unregistered phone: `+919999999999`
3. Click **"Send OTP"**

**Expected Result:**
✅ Error alert: **"Not Registered"**
✅ Message: "Phone number not registered. Please contact school administration."

---

### **Workflow 2: Returning User Login**

#### Test 2.1: PIN Login
1. Close and reopen app
2. Should see **PIN Login Screen**
3. Enter your 4-digit PIN

**Expected Result:**
✅ PIN screen appears (no OTP)
✅ Correct PIN → Teacher Home Screen
✅ Shows teacher name: "Welcome back, [Name]!"

#### Test 2.2: Wrong PIN Attempts
1. Enter wrong PIN (e.g., 9999)
2. Try 4 more times (total 5 attempts)

**Expected Result:**
✅ Error: "Incorrect PIN"
✅ Shows "X attempts remaining"
✅ After 5 attempts → Locked for 5 minutes
✅ "Forgot PIN?" option available

#### Test 2.3: Biometric Login
(If biometric was enabled)
1. Close and reopen app
2. Biometric prompt appears automatically
3. Use Face ID/Touch ID/Fingerprint

**Expected Result:**
✅ Biometric prompt shows
✅ Success → Home Screen
✅ Failure → Can use PIN instead

#### Test 2.4: Forgot PIN
1. On PIN screen, click **"Forgot PIN?"**
2. Confirm reset
3. Enter phone number (pre-filled)
4. Get OTP and verify
5. Create new PIN

**Expected Result:**
✅ OTP sent for verification
✅ Can create new PIN
✅ New PIN works for login

---

### **Workflow 3: Mark Attendance**

#### Test 3.1: View Assigned Classes
1. On Teacher Home, go to **"Attendance"** tab
2. Should see only assigned classes

**Expected Result:**
✅ Shows only classes assigned to teacher
✅ Shows class name, section, student count

#### Test 3.2: Mark Attendance for Class
1. Select a class (e.g., "10th A")
2. See list of all students
3. Mark attendance:
   - Student 1: Present ✅
   - Student 2: Absent ❌
   - Student 3: Late ⏰
4. Add remarks (optional)
5. Click **"Submit Attendance"**

**Expected Result:**
✅ Attendance submitted successfully
✅ Toast: "Attendance submitted for approval"
✅ Status shows "Pending" (awaiting admin approval)

#### Test 3.3: View Attendance History
1. Go to **"History"** tab
2. Should see all submitted attendance

**Expected Result:**
✅ Shows date, class, status (Pending/Approved/Rejected)
✅ Can view details of each record

---

### **Workflow 4: View Messages**

#### Test 4.1: View Inbox
1. Go to **"Messages"** tab
2. Should see messages from admin

**Expected Result:**
✅ Shows all messages sent by admin
✅ Unread messages highlighted
✅ Pull-to-refresh works

#### Test 4.2: Read Message
1. Tap on a message
2. Should open message detail view

**Expected Result:**
✅ Message content displayed
✅ Shows sender, subject, timestamp
✅ Marked as "read"
✅ Unread badge disappears

---

### **Workflow 5: View Students**

#### Test 5.1: View Student List
1. Go to **"Students"** tab
2. Should see students from assigned classes

**Expected Result:**
✅ Shows students only from teacher's classes
✅ Shows: Name, Class, Parent Phone
✅ Search functionality works

---

## 👨‍👩‍👧 PARENT WORKFLOWS (Mobile App)

### **Setup**

**Required:**
- Student added in admin with parent phone
- Parent phone registered in system
- Expo Go installed

---

### **Workflow 1: First-Time Login**

#### Test 1.1: OTP Login as Parent
1. Open mobile app
2. Enter parent phone: `+919876543210`
3. Click **"Send OTP"**
4. Get OTP from backend console
5. Verify OTP

**Expected Result:**
✅ OTP sent successfully
✅ After verification → "Setup Quick Login" screen
✅ User type detected as "parent"

#### Test 1.2: Setup PIN
1. Setup 4-digit PIN
2. Optional: Enable biometric
3. Navigate to Parent Home Screen

**Expected Result:**
✅ PIN saved
✅ Shows **Parent Home Screen**
✅ Shows children's information

---

### **Workflow 2: View Children**

#### Test 2.1: View Children List
1. On Parent Home
2. Should see all children linked to parent phone

**Expected Result:**
✅ Shows: Child name, class, section
✅ Each child has own card/section

---

### **Workflow 3: View Attendance**

#### Test 3.1: View Child's Attendance
1. Select a child
2. Go to **"Attendance"** tab
3. View attendance records

**Expected Result:**
✅ Shows attendance history for selected child
✅ Shows: Date, Status (Present/Absent/Late)
✅ Shows remarks if any
✅ Color-coded (Green=Present, Red=Absent)

#### Test 3.2: Attendance Summary
1. View monthly summary
2. Check attendance percentage

**Expected Result:**
✅ Shows attendance percentage
✅ Shows total present/absent days
✅ Graphical representation (if available)

---

### **Workflow 4: View Messages**

#### Test 4.1: View Parent Messages
1. Go to **"Messages"** tab
2. Should see announcements from school

**Expected Result:**
✅ Shows all messages sent to parents
✅ Class-specific messages if applicable
✅ Unread messages highlighted

#### Test 4.2: Push Notifications
(If on real device)
1. Admin sends new message
2. Parent should receive push notification

**Expected Result:**
✅ Push notification appears on phone
✅ Tapping notification opens message
✅ Shows in Messages tab

---

## 🔄 INTEGRATION TESTING

### **End-to-End Flow 1: Complete Attendance Cycle**

**Scenario:** Teacher marks attendance → Admin approves → Parent sees it

**Steps:**
1. **Teacher (Mobile):**
   - Login
   - Mark attendance for Class 10A
   - Submit for approval

2. **Admin (Web):**
   - Login to admin panel
   - Go to Attendance → Pending
   - Approve the attendance

3. **Parent (Mobile):**
   - Login
   - View child's attendance
   - Should see today's attendance as "Present" (if marked)

**Expected Result:**
✅ Complete flow works end-to-end
✅ Data syncs across all platforms
✅ Notifications sent (if enabled)

---

### **End-to-End Flow 2: Communication Chain**

**Scenario:** Admin sends message → All parents receive it

**Steps:**
1. **Admin (Web):**
   - Go to Communications
   - Send message: "School holiday on Monday"
   - Recipients: "All Parents"

2. **Parent (Mobile):**
   - Open Messages tab
   - Should see new message
   - Receive push notification (if on real device)

3. **Verify:**
   - Check communication history in admin
   - Shows message sent
   - Shows recipient count

**Expected Result:**
✅ Message delivered to all parents
✅ Shows in mobile inbox
✅ History updated in admin panel

---

### **End-to-End Flow 3: New Student Registration**

**Scenario:** Add student → Parent can login → Teacher sees student

**Steps:**
1. **Admin (Web):**
   - Add new student: "New Student"
   - Parent phone: `+919123456789`
   - Assign to Class 10A
   - Save

2. **Parent (Mobile):**
   - Login with `+919123456789`
   - Should get OTP
   - Setup PIN
   - See child in home screen

3. **Teacher (Mobile):**
   - Go to Students tab
   - Should see "New Student" in Class 10A
   - Can mark attendance for this student

**Expected Result:**
✅ Student creation cascades correctly
✅ Parent auto-linked
✅ Teacher can access student
✅ All data synchronized

---

## 🧪 TEST DATA SETUP

### **Initial Setup Commands**

**Create Test Admin:**
```sql
-- Run in database
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES ('admin', 'admin@avm.com', '[hashed_password]', 'admin', true);
```

**Create Test Teacher:**
```python
# Via admin panel or API
{
  "full_name": "Test Teacher",
  "phone": "+919876543211",
  "email": "teacher@test.com",
  "subjects": ["Mathematics", "Science"],
  "classes_assigned": ["10th A", "10th B"]
}
```

**Create Test Students:**
```python
# Student 1 - for Teacher's class
{
  "full_name": "Test Student 1",
  "class_name": "10th Grade",
  "section": "A",
  "parent_name": "Test Parent 1",
  "parent_phone": "+919876543210",
  "parent_email": "parent1@test.com"
}

# Student 2 - for testing multiple children
{
  "full_name": "Test Student 2",
  "class_name": "10th Grade",
  "section": "A",
  "parent_name": "Test Parent 1",
  "parent_phone": "+919876543210",  # Same parent
  "parent_email": "parent1@test.com"
}
```

---

## ✅ Testing Checklist

### **Admin Panel**
- [ ] Login works
- [ ] Dashboard shows live data
- [ ] Auto-refresh works (30s)
- [ ] Students: Add, Edit, Delete
- [ ] Teachers: Add, Edit, Assign classes
- [ ] Attendance: Approve, Reject
- [ ] Communications: Send, View history
- [ ] All forms validate correctly
- [ ] No console errors

### **Teacher Mobile App**
- [ ] OTP login works
- [ ] Unregistered number shows error
- [ ] PIN setup works
- [ ] PIN login works
- [ ] Biometric login works (if enabled)
- [ ] Forgot PIN flow works
- [ ] Mark attendance works
- [ ] View messages works
- [ ] View students works
- [ ] Keyboard dismisses on tap outside
- [ ] Push token registered

### **Parent Mobile App**
- [ ] OTP login works
- [ ] PIN setup works
- [ ] View all children
- [ ] View attendance per child
- [ ] View messages
- [ ] Push notifications work (real device)
- [ ] Keyboard dismisses properly

### **Integration**
- [ ] Attendance flow: Teacher → Admin → Parent
- [ ] Communication flow: Admin → Parents
- [ ] New student: Admin → Teacher & Parent
- [ ] Real-time data sync across platforms
- [ ] All notifications working

---

## 🐛 Common Issues & Solutions

### Issue 1: OTP Not Received
**Solution:** Check backend console - OTP printed there in development mode

### Issue 2: "Not Registered" Error
**Solution:** Ensure phone number added in admin panel (with +91 prefix)

### Issue 3: Dashboard Not Updating
**Solution:** Check auto-refresh (30s), force refresh browser

### Issue 4: Push Notifications Not Working
**Solution:**
- Only works on real device (not simulator)
- Check Expo Go permissions
- Verify push token in backend

### Issue 5: Keyboard Won't Dismiss
**Solution:** Fixed! Tap anywhere outside input field

---

## 📊 Success Metrics

**All tests pass if:**
✅ Admin can manage all entities (students, teachers, attendance)
✅ Teachers can login, mark attendance, view messages
✅ Parents can login, view children's attendance, messages
✅ Real-time data sync works across all platforms
✅ Notifications delivered successfully
✅ No critical errors in any component

---

**Testing Complete! System Ready for Production** 🚀
