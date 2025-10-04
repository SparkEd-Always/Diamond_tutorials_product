# AVM Tutorial - Manual Testing Checklist

**Date Created**: October 4, 2025
**Automated Tests**: ✅ 100% (27/27 passing)
**Manual Tests**: Pending your execution

---

## 📋 Test Execution Instructions

- Mark each test with ✅ (pass), ❌ (fail), or ⚠️ (partial)
- Note any issues in the "Notes" section of each test
- Take screenshots of failures
- Report bugs using the template at the end

---

## 🖥️ ADMIN WEB APP TESTING (26 Tests)

**URL**: http://localhost:3000
**Credentials**: username=`admin`, password=`admin123`

---

### A1. Authentication & Session (4 tests)

#### Test A1.1: Admin Login - Valid Credentials
**Steps**:
1. Open http://localhost:3000
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Login"

**Expected**:
- Redirects to dashboard
- Shows "Welcome Admin" or admin name
- Dashboard shows stats cards

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ___________✅ Pass__________________

---

#### Test A1.2: Admin Login - Invalid Credentials
**Steps**:
1. Open http://localhost:3000
2. Enter username: `admin`
3. Enter password: `wrongpassword`
4. Click "Login"

**Expected**:
- Shows error message "Invalid credentials" or similar
- Does NOT redirect to dashboard
- Login form still visible

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________ ✅ Pass________________

---

#### Test A1.3: Session Persistence
**Steps**:
1. Login successfully
2. Navigate to Students page
3. Refresh browser (F5 or Cmd+R)

**Expected**:
- User remains logged in
- Still on Students page
- No redirect to login

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ______________✅ Pass_______________

---

#### Test A1.4: Logout
**Steps**:
1. Login successfully
2. Navigate to dashboard
3. Click "Logout" button

**Expected**:
- Redirects to login page
- Session cleared
- Clicking back button doesn't go to dashboard

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________✅ Pass________________

---

### A2. Dashboard (3 tests)

#### Test A2.1: Dashboard Stats Cards
**Steps**:
1. Login as admin
2. View dashboard

**Expected**:
- Shows "Total Students" card with count (should be 3)
- Shows "Total Teachers" card with count (should be 3)
- Shows "Pending Attendance" card with count
- All numbers are accurate

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: messages sent dashboard "total students" and "total teacher" cards  counts shows 3, there is "pending approval" card shows 0, "Messages Sent" card shows 1 (I don't know why we never sent any messages) (remove this card), "attendance rate" card shows 0% and "active classes" card shows 3 classes_________________

---

#### Test A2.2: Recent Activities
**Steps**:
1. On dashboard, scroll to "Recent Activities" section

**Expected**:
- Shows list of recent actions
- Each activity has timestamp, user, and action
- Activities are sorted by time (newest first)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ______________no recent activites section, it's okay if it's not their in the development. move on_______________

---

#### Test A2.3: Quick Actions
**Steps**:
1. On dashboard, locate quick action buttons
2. Click each button

**Expected**:
- "Add Student" button → navigates to student form
- "View Attendance" button → navigates to attendance page
- "Send Message" button → navigates to communications page

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _________there are not quick actions button, it's okay of they are not there. move on____________________

---

### A3. Student Management (7 tests)

#### Test A3.1: View All Students
**Steps**:
1. Login as admin
2. Navigate to "Students" page

**Expected**:
- Shows table/list of students
- At least 3 students visible
- Displays: Name, Unique ID, Class, Parent Phone

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ______________✅ Pass_______________

---

#### Test A3.2: Search Students by Name
**Steps**:
1. On Students page
2. Type "Aarav" in search box

**Expected**:
- Shows only "Aarav Kumar"
- Other students filtered out
- Search is case-insensitive

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ________searched Arjun Kumar, it worked__________✅ Pass__________

---

#### Test A3.3: Filter Students by Class
**Steps**:
1. On Students page
2. Select "Class 10A" from class filter dropdown

**Expected**:
- Shows only Class 10A students
- Updates count/total
- Can clear filter to show all

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _______there is not filter button, students page. The search button takes care of filtering too I guess, if I type class name it shows student with that class. For example, I typed class 8 in search bar it only showed student "Priya Patel"_____________________
---

#### Test A3.4: Add New Student
**Steps**:
1. Click "Add Student" button
2. Fill form:
   - Full Name: `Test Student`
   - Unique ID: `AVM-STU-999`
   - Class: `Class 10A`
   - Section: `A`
   - Parent Name: `Test Parent`
   - Parent Phone: `9876543210`
   - Parent Email: `test@example.com`
3. Click "Save"

**Expected**:
- Success message appears
- New student appears in list
- All fields saved correctly

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ______________✅ Pass_______________

---

#### Test A3.5: Edit Student
**Steps**:
1. Find "Aarav Kumar" in student list
2. Click "Edit" button
3. Change Parent Phone to `9999999999`
4. Click "Save"

**Expected**:
- Success message appears
- Phone number updated in list
- Database updated (verify by refreshing)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ______________✅ Pass _______________

---

#### Test A3.6: Delete Student (if implemented)
**Steps**:
1. Find test student created in A3.4
2. Click "Delete" button
3. Confirm deletion in popup

**Expected**:
- Confirmation dialog appears
- Student removed from list after confirmation
- Cannot be recovered (or moved to inactive)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ____________________❌ Fail__error : failed to delete student______

---

#### Test A3.7: Student Details View
**Steps**:
1. Click on "Aarav Kumar" name
2. View detailed student profile

**Expected**:
- Shows all student information
- Shows attendance history
- Shows parent contact details
- Can navigate back to list

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ______________student detailed view, not working as we did not implement this at all, let's not worry about this now. Maybe in next iteration. Moving on_______________

---

### A4. Teacher Management (4 tests)

#### Test A4.1: View All Teachers
**Steps**:
1. Navigate to "Teachers" page

**Expected**:
- Shows table/list of teachers
- At least 3 teachers visible
- Displays: Name, Email, Phone, Subjects

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: __________displays unique teacher ID too, 3 teachers✅ Pass___________________

---

#### Test A4.2: Import Teachers from Excel
**Steps**:
1. Click "Import from Excel" button
2. Select file: `/Users/koustubskulkarni/AVM/product/teacher_import_template.xlsx`
3. Click "Upload"

**Expected**:
- File uploads successfully
- Shows preview of data
- Can confirm import
- Teachers added to list

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________✅ Pass____, it said cannot import because those teachers alray exist____________

---

#### Test A4.3: Export Teachers to Excel
**Steps**:
1. On Teachers page
2. Click "Export to Excel" button

**Expected**:
- Excel file downloads
- Contains all teacher data
- Proper formatting (columns aligned)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _______________ther is no export button bro______________

---

#### Test A4.4: View Teacher Details
**Steps**:
1. Click on any teacher name
2. View detailed profile

**Expected**:
- Shows teacher information
- Shows assigned classes (if any)
- Shows contact details

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ________we did not implement this feature we are not interested in implementing this now, maybe next iteration_____________________

---

### A5. Attendance Management (4 tests)

#### Test A5.1: View Pending Attendance
**Steps**:
1. Navigate to "Attendance" page
2. Click "Pending Approval" tab

**Expected**:
- Shows attendance records submitted by teachers
- Each record shows: Student, Date, Status, Teacher
- Can see "Approve" button for each record

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ______________the pending approval tab on dashbaord is not functional and let's keep it that way. I went to attendance page through the "attendance approval" button form the left panel____________

---

#### Test A5.2: Approve Attendance (Single)
**Steps**:
1. On Pending Attendance tab
2. Click "Approve" for one student's attendance
3. Confirm approval

**Expected**:
- Success message appears
- Record moves from "Pending" to "Approved"
- WhatsApp message sent to parent (check backend logs)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _________there is do data to approve attendance____________________

---

#### Test A5.3: Bulk Approve Attendance
**Steps**:
1. On Pending Attendance tab
2. Select multiple records (checkboxes)
3. Click "Approve Selected"
4. Confirm bulk approval

**Expected**:
- All selected records approved
- WhatsApp messages queued for all parents
- Success message shows count

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _______no data to approve attendance, here there is approve & send to whatspp but we are not implementing push notifications to be sent to parents as opposed to whatsapp so change the button "Approve & Send whatspp" to send notification as we are sending it to parents app______________________

---

#### Test A5.4: View Attendance History
**Steps**:
1. Navigate to "Attendance History" tab
2. Select date range (last 7 days)
3. Click "Filter"

**Expected**:
- Shows all attendance for date range
- Can filter by class
- Can filter by status (Present/Absent/Late/Leave)
- Can export to Excel

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ______________no data to check attendance history_______________

---

### A6. Communications (4 tests)

#### Test A6.1: View Sent Messages
**Steps**:
1. Navigate to "Communications" page
2. View "Sent Messages" list

**Expected**:
- Shows previously sent messages
- Each message shows: Subject, Recipients, Date
- Can click to view details

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: __________here we have "Message hostory" tab wher currently we don't have any data to show__________________

---

#### Test A6.2: Send Message to Single Parent
**Steps**:
1. Click "New Message" button
2. Select "Single Parent" as recipient type
3. Search and select "Aarav Kumar's Parent"
4. Enter subject: "Test Message"
5. Enter message: "This is a test message"
6. Click "Send"

**Expected**:
- Success message appears
- Message appears in Sent Messages
- WhatsApp notification sent (check backend logs)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________we don't have functionality to send communications to single parent, let's keep it that way_______________

---

#### Test A6.3: Send Bulk Message to All Parents
**Steps**:
1. Click "New Message" button
2. Select "All Parents" as recipient type
3. Enter subject: "School Announcement"
4. Enter message: "Important announcement for all parents"
5. Click "Send"

**Expected**:
- Confirmation dialog shows count of recipients
- Success message appears
- WhatsApp messages queued for all parents
- Shows delivery status

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _______❌ Fail________error_message psted below:_____

localhost: 3000 says
Error: (sqlite3.OperationalError) table communications has no column named recipient_id
[SQL: INSERT INTO communications (sender_id, student_id, recipient_id, recipient_type, subject, message, message_type, whatsapp_chat_id, whatsapp_chat_type, is_sent, sent_at, delivery_status, is_bulk, bulk_group_name, is_read, read_at, requires_acknowledgment) VALUES
(?, ?, ?, ?, ?, ?, ?, ?,?, ?,?, 2,?,?, 2, 2, ?) RETURNING id, created_at, updated ]

[parameters: (1, None, 1, 'parent', 'werewrwerwer',
'werewrwerwer', 'IN_APP', None, None, 1, '2025-10-04
07:02:36.628936', 'delivered', O, None, O, None, 0)]
(Background on this error at: https://sqlalche.me/e/20/e3q8)
_____

---

#### Test A6.4: Send Message to Class
**Steps**:
1. Click "New Message" button
2. Select "Class" as recipient type
3. Choose "Class 10A"
4. Enter subject and message
5. Click "Send"

**Expected**:
- Only Class 10A parents receive message
- Shows count of recipients before sending
- Success message confirms sent count

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: ____________________❌ Fail__Same error as last one______

localhost: 3000 says
Error: (sqlite3.OperationalError) table communications has no column named recipient_id
[SQL: INSERT INTO communications (sender_id, student_id, recipient_id, recipient_type, subject, message, message_type, whatsapp_chat_id, whatsapp_chat_type, is_sent, sent_at, delivery_status, is_bulk, bulk_group_name, is_read, read_at, requires_acknowledgment) VALUES
(?, ?, ?, ?, ?, ?, ?, ?,?, ?,?, 2,?,?, 2, 2, ?) RETURNING id, created_at, updated ]

[parameters: (1, None, 1, 'parent', 'werewrwerwer',
'werewrwerwer', 'IN_APP', None, None, 1, '2025-10-04
07:02:36.628936', 'delivered', O, None, O, None, 0)]
(Background on this error at: https://sqlalche.me/e/20/e3q8)

## 📱 TEACHER MOBILE APP TESTING (38 Tests)

**App**: Open Expo Go on your phone
**Test Phone**: Any registered teacher phone number
**OTP**: Check backend logs at `/Users/koustubskulkarni/AVM/product/backend-logs.txt`

---

### T1. Authentication (6 tests)

#### Test T1.1: First-Time Login - Phone Entry
**Steps**:
1. Open mobile app
2. Enter phone number: `9986660025` (or any teacher phone in database)
3. Click "Send OTP"

**Expected**:
- OTP sent message appears
- Navigates to OTP entry screen
- Check backend logs for OTP code (6 digits)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**OTP Code**: _________
**Notes**: _____________________________

---

#### Test T1.2: OTP Verification
**Steps**:
1. After T1.1, on OTP screen
2. Enter OTP from backend logs
3. Click "Verify"

**Expected**:
- OTP verified successfully
- Navigates to PIN setup screen (first time)
- OR navigates to Home if PIN already set

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T1.3: PIN Setup
**Steps**:
1. On PIN setup screen
2. Enter 4-digit PIN: `1234`
3. Confirm PIN: `1234`
4. Click "Set PIN"

**Expected**:
- PIN saved successfully
- Option to enable Face ID/Touch ID appears
- Can skip biometric setup
- Navigates to Home screen

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T1.4: PIN Login (Subsequent)
**Steps**:
1. Close and reopen app
2. App shows PIN entry screen
3. Enter PIN: `1234`

**Expected**:
- PIN accepted
- Navigates directly to Home
- No OTP required

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T1.5: Biometric Login (If Enabled)
**Steps**:
1. Close and reopen app
2. Use Face ID/Touch ID

**Expected**:
- Biometric authentication works
- Navigates to Home without PIN
- Falls back to PIN if biometric fails

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail | N/A
**Notes**: _____________________________

---

#### Test T1.6: Invalid OTP
**Steps**:
1. Request OTP for phone
2. Enter wrong OTP: `000000`
3. Click "Verify"

**Expected**:
- Error message: "Invalid OTP"
- Does NOT navigate forward
- Can request new OTP

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### T2. Home Screen (5 tests)

#### Test T2.1: Home Screen Layout
**Steps**:
1. Login successfully
2. View home screen

**Expected**:
- Shows teacher name at top
- Shows 4 stat cards: Today's Attendance, Total Students, Pending Approvals, Messages
- Shows quick action buttons
- Navigation menu visible

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T2.2: Stats Cards - Data Accuracy
**Steps**:
1. On home screen
2. Check each stat card value

**Expected**:
- "Today's Attendance" shows correct count (if any marked today)
- "Total Students" shows 3 (or actual count)
- "Pending Approvals" shows 0 or correct count
- "Messages" shows inbox count

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T2.3: Quick Actions - Mark Attendance
**Steps**:
1. Tap "Mark Attendance" button

**Expected**:
- Navigates to Mark Attendance screen
- Shows class selection
- Shows student list

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T2.4: Quick Actions - My Students
**Steps**:
1. Tap "My Students" button

**Expected**:
- Navigates to Students screen
- Shows all students (or assigned students)
- Has search/filter options

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T2.5: Navigation Menu
**Steps**:
1. Open navigation drawer/menu
2. Check all menu items

**Expected**:
- Shows: Home, Mark Attendance, My Students, Messages, Profile, Logout
- Each menu item navigates correctly
- Current screen is highlighted

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### T3. Mark Attendance (12 tests)

#### Test T3.1: Select Class
**Steps**:
1. Navigate to "Mark Attendance"
2. View class selection dropdown

**Expected**:
- Shows list of all classes
- Can select "Class 10A"
- Student list updates after selection

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.2: View Student List for Class
**Steps**:
1. Select "Class 10A"
2. View student list

**Expected**:
- Shows all Class 10A students
- Each student has: Name, Unique ID, Current Status
- Default status is blank/not marked

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.3: Mark Single Student - Present
**Steps**:
1. Find "Aarav Kumar" in list
2. Tap "Present" button/radio

**Expected**:
- Button highlighted/selected
- Checkmark or color change visible
- Can change selection

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.4: Mark Single Student - Absent
**Steps**:
1. Find "Diya Sharma" in list
2. Tap "Absent" button
3. Add remark: "Sick"

**Expected**:
- Absent button highlighted
- Remarks field appears
- Can enter text

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.5: Mark Single Student - Late
**Steps**:
1. Find "Rohan Patel" in list
2. Tap "Late" button

**Expected**:
- Late button highlighted
- Optional remarks field available

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.6: Mark Single Student - Leave
**Steps**:
1. Select any student
2. Tap "Leave" button
3. Add remark: "Planned leave"

**Expected**:
- Leave button highlighted
- Remarks saved with record

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.7: Mark All Present (Quick Action)
**Steps**:
1. On attendance screen
2. Tap "Mark All Present" button (if available)

**Expected**:
- All students marked as Present
- Can still change individual statuses
- Shows count of marked students

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail | N/A
**Notes**: _____________________________

---

#### Test T3.8: Save as Draft
**Steps**:
1. Mark some students (not all)
2. Tap "Save as Draft" button

**Expected**:
- Success message appears
- Draft saved (can view later)
- Does NOT submit for approval
- Does NOT send WhatsApp

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.9: Edit Draft
**Steps**:
1. After saving draft
2. Go back to Mark Attendance
3. Select same class and date

**Expected**:
- Previously marked statuses are loaded
- Can edit any status
- Can save changes

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.10: Submit for Approval
**Steps**:
1. Mark all students in class
2. Tap "Submit for Approval" button
3. Confirm submission

**Expected**:
- Confirmation dialog appears
- Success message after submission
- Attendance locked (cannot edit)
- Goes to Pending Approval status

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.11: Cannot Edit After Submission
**Steps**:
1. After submitting attendance
2. Try to edit same class/date

**Expected**:
- Shows "Already submitted" message
- OR buttons disabled
- Cannot change status
- Can only view

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T3.12: Attendance for Different Date
**Steps**:
1. On Mark Attendance screen
2. Change date to tomorrow
3. Mark attendance

**Expected**:
- Can select any date (past or future)
- Saves with correct date
- Each date is independent

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### T4. My Students (8 tests)

#### Test T4.1: View All Students
**Steps**:
1. Navigate to "My Students"
2. View student list

**Expected**:
- Shows all students (or assigned classes)
- Each student card shows: Name, ID, Class, Photo
- Scrollable list

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T4.2: Search Students by Name
**Steps**:
1. On Students screen
2. Type "Aarav" in search box

**Expected**:
- Shows only Aarav Kumar
- Search is instant/live
- Clear search button works

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T4.3: Filter by Class
**Steps**:
1. Tap filter icon
2. Select "Class 10A"
3. Apply filter

**Expected**:
- Shows only Class 10A students
- Filter badge/indicator visible
- Can clear filter

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T4.4: View Student Details
**Steps**:
1. Tap on "Aarav Kumar" card
2. View detailed screen

**Expected**:
- Shows full student information
- Shows parent contact details
- Shows recent attendance history
- Can call/message parent (if implemented)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T4.5: Student Attendance History
**Steps**:
1. On student details
2. View "Attendance History" section

**Expected**:
- Shows last 7-30 days attendance
- Color-coded: Green (Present), Red (Absent), Yellow (Late), Blue (Leave)
- Shows percentage/stats

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T4.6: Contact Parent - Phone Call
**Steps**:
1. On student details
2. Tap phone icon/button

**Expected**:
- Opens phone dialer
- Parent phone number pre-filled
- Can make call

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail | N/A
**Notes**: _____________________________

---

#### Test T4.7: Contact Parent - WhatsApp (If Implemented)
**Steps**:
1. On student details
2. Tap WhatsApp icon

**Expected**:
- Opens WhatsApp with parent number
- Can send message

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail | N/A
**Notes**: _____________________________

---

#### Test T4.8: Pull to Refresh
**Steps**:
1. On Students list
2. Pull down to refresh

**Expected**:
- Loading indicator appears
- List refreshes with latest data
- New students appear if added

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### T5. Messages (3 tests)

#### Test T5.1: View Inbox
**Steps**:
1. Navigate to "Messages"
2. View message list

**Expected**:
- Shows received messages from admin
- Each message shows: Subject, Preview, Date, Read/Unread status
- Unread messages highlighted

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T5.2: Read Message
**Steps**:
1. Tap on any message
2. View full message

**Expected**:
- Shows full subject and message body
- Shows sender (Admin)
- Shows timestamp
- Marks as read

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T5.3: Delete Message (If Implemented)
**Steps**:
1. Long-press on message
2. Select "Delete"
3. Confirm

**Expected**:
- Message removed from inbox
- Confirmation dialog appears
- Cannot be recovered

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail | N/A
**Notes**: _____________________________

---

### T6. Profile & Settings (4 tests)

#### Test T6.1: View Profile
**Steps**:
1. Navigate to "Profile"
2. View teacher profile

**Expected**:
- Shows teacher name
- Shows email
- Shows phone number
- Shows assigned classes (if any)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T6.2: Change PIN
**Steps**:
1. On Profile screen
2. Tap "Change PIN"
3. Enter old PIN: `1234`
4. Enter new PIN: `5678`
5. Confirm new PIN

**Expected**:
- PIN updated successfully
- Next login requires new PIN
- Success message appears

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test T6.3: Enable/Disable Biometric
**Steps**:
1. On Profile/Settings
2. Toggle "Face ID/Touch ID" switch

**Expected**:
- Biometric prompt appears
- Setting saved
- Works on next login

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail | N/A
**Notes**: _____________________________

---

#### Test T6.4: Logout
**Steps**:
1. On Profile screen
2. Tap "Logout" button
3. Confirm logout

**Expected**:
- Confirmation dialog appears
- Session cleared
- Returns to login screen
- Next login requires OTP

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

## 📱 PARENT MOBILE APP TESTING (14 Tests)

**Test Phone**: `9986660025` (Aarav Kumar's parent)
**Child**: Aarav Kumar (AVM-STU-001, Class 10A)

---

### P1. Authentication (3 tests)

#### Test P1.1: Parent Login - OTP Flow
**Steps**:
1. Open mobile app
2. Enter phone: `9986660025`
3. Click "Send OTP"
4. Enter OTP from backend logs
5. Click "Verify"

**Expected**:
- OTP sent successfully
- OTP verified
- Navigates to PIN setup (first time) or Home

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**OTP Code**: _________
**Notes**: _____________________________

---

#### Test P1.2: PIN Setup for Parent
**Steps**:
1. After OTP, on PIN setup
2. Enter PIN: `1234`
3. Confirm PIN
4. Optional: Enable biometric

**Expected**:
- PIN saved
- Navigates to Home
- Shows parent dashboard

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test P1.3: Parent Re-login with PIN
**Steps**:
1. Close and reopen app
2. Enter PIN: `1234`

**Expected**:
- PIN accepted
- Navigates to Home
- Shows child information

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### P2. Home Screen (3 tests)

#### Test P2.1: View Children Cards
**Steps**:
1. Login as parent
2. View home screen

**Expected**:
- Shows card for "Aarav Kumar"
- Card displays: Name, Class, Photo, Quick stats
- Can tap card to view details

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test P2.2: Quick Stats on Child Card
**Steps**:
1. View Aarav's card on home

**Expected**:
- Shows attendance percentage (e.g., "95% this month")
- Shows last attendance status
- Shows unread messages count

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test P2.3: Navigation Menu
**Steps**:
1. Open navigation drawer
2. Check menu items

**Expected**:
- Shows: Home, My Children, Messages, Attendance, Profile, Logout
- Each navigates correctly

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### P3. View Child Attendance (4 tests)

#### Test P3.1: View Monthly Attendance
**Steps**:
1. Tap on Aarav's card
2. Navigate to "Attendance" tab

**Expected**:
- Shows calendar view OR list view
- Shows current month attendance
- Color-coded: Present/Absent/Late/Leave
- Shows monthly percentage

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test P3.2: Filter Attendance by Date Range
**Steps**:
1. On Attendance screen
2. Select "Last 7 days" filter

**Expected**:
- Shows only last 7 days
- Updates stats accordingly
- Can change to "Last 30 days" or custom

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test P3.3: View Attendance Details
**Steps**:
1. Tap on any attendance record
2. View details

**Expected**:
- Shows: Date, Status, Marked by (teacher name), Time
- Shows remarks (if any)
- Shows admin approval status

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test P3.4: Data Isolation - Cannot See Other Children
**Steps**:
1. Login with Aarav's parent phone
2. Check if other students visible

**Expected**:
- ONLY shows Aarav Kumar
- CANNOT see Diya Sharma or Rohan Patel
- Search/filter shows only Aarav
- Critical security test!

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### P4. Messages (2 tests)

#### Test P4.1: View Messages from School
**Steps**:
1. Navigate to "Messages"
2. View inbox

**Expected**:
- Shows messages sent by admin
- Shows: Subject, Preview, Date
- Unread messages highlighted

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test P4.2: Read Message
**Steps**:
1. Tap on any message
2. View full content

**Expected**:
- Shows full message
- Shows sender (School/Admin)
- Marks as read
- Can go back to inbox

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### P5. Profile (2 tests)

#### Test P5.1: View Parent Profile
**Steps**:
1. Navigate to "Profile"
2. View details

**Expected**:
- Shows parent name
- Shows phone number
- Shows email (if any)
- Shows list of children

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

#### Test P5.2: Logout
**Steps**:
1. On Profile
2. Tap "Logout"
3. Confirm

**Expected**:
- Returns to login screen
- Session cleared
- Next login requires OTP

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

## 🔗 INTEGRATION TESTING (4 Journeys)

Test complete workflows across multiple components.

---

### I1. Complete Attendance Flow (Teacher → Admin → Parent)

#### Journey Steps:
1. **Teacher Mobile**: Login, mark attendance for Aarav (Absent, remark "Sick"), submit for approval
2. **Admin Web**: Login, view pending attendance, approve Aarav's absence
3. **Check Backend Logs**: Verify WhatsApp message queued/sent
4. **Parent Mobile**: Login, view Aarav's attendance, see "Absent" status with remark

**Expected Results**:
- Attendance flows through all stages
- WhatsApp notification sent
- Parent sees updated attendance
- All timestamps correct

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### I2. Bulk Communication Flow (Admin → All Parents)

#### Journey Steps:
1. **Admin Web**: Login, create bulk message "School Holiday Tomorrow", send to all parents
2. **Check Backend Logs**: Verify WhatsApp messages queued for all 3 parents
3. **Parent Mobile (Phone 1)**: Login, check messages, verify received
4. **Parent Mobile (Phone 2)**: Login with different parent, check messages, verify received

**Expected Results**:
- All parents receive message
- Message content correct
- Delivery status tracked
- No duplicate messages

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### I3. Student Management Flow (Admin → Teacher View)

#### Journey Steps:
1. **Admin Web**: Add new student "Test Student", assign to Class 10A
2. **Teacher Mobile**: Refresh student list, verify new student appears
3. **Teacher Mobile**: Mark attendance for new student
4. **Admin Web**: Verify attendance submission received

**Expected Results**:
- Student visible to teacher immediately (after refresh)
- Can mark attendance
- Data consistent across platforms

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

### I4. Multi-User Concurrent Testing

#### Journey Steps:
1. **Admin Web (Browser 1)**: Login, navigate to Attendance page
2. **Teacher Mobile (Phone 1)**: Login, start marking attendance
3. **Admin Web (Browser 2)**: Login as different admin (if possible) OR same admin, view pending
4. **Teacher Mobile (Phone 1)**: Submit attendance
5. **Admin Web (Browser 1)**: Approve attendance
6. **Parent Mobile (Phone 2)**: Login, verify attendance appears

**Expected Results**:
- No conflicts or race conditions
- All users see updated data
- No session issues
- No data loss

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail
**Notes**: _____________________________

---

## ⚡ PERFORMANCE TESTING (6 Tests)

Test app performance and responsiveness.

---

### Perf-1: Page Load Times (Admin Web)
**Steps**:
1. Open http://localhost:3000
2. Login
3. Navigate to Students page
4. Use browser DevTools (F12) → Network tab
5. Measure load time

**Expected**: < 3 seconds for each page
**Actual**: _______ seconds
**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Perf-2: Mobile App Launch Time
**Steps**:
1. Close mobile app completely
2. Launch app
3. Time from tap to first screen

**Expected**: < 5 seconds
**Actual**: _______ seconds
**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Perf-3: Search Performance (Large Dataset)
**Steps**:
1. Admin web → Students page
2. Type search query
3. Measure response time

**Expected**: Instant/live search, < 500ms
**Actual**: _______ ms
**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Perf-4: Attendance Submission Time
**Steps**:
1. Teacher mobile → Mark attendance for full class (3 students)
2. Submit for approval
3. Time from tap to success message

**Expected**: < 5 seconds
**Actual**: _______ seconds
**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Perf-5: Bulk Message Sending Time
**Steps**:
1. Admin web → Send message to all parents (3 parents)
2. Time from submit to success

**Expected**: < 10 seconds
**Actual**: _______ seconds
**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Perf-6: Mobile App Scrolling Smoothness
**Steps**:
1. Parent mobile → View attendance list (30+ records)
2. Scroll up and down rapidly

**Expected**: Smooth 60fps, no lag
**Actual**: Smooth / Laggy / Choppy
**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 🐛 BUG REPORT TEMPLATE

When you find a bug, copy this template and fill it out:

```
## 🐛 BUG #___: [Short Title]

**Severity**: 🔴 Critical | 🟡 High | 🟢 Medium | 🔵 Low

**Module**: Admin Web / Teacher Mobile / Parent Mobile / Backend API

**Test Case**: [e.g., Test A3.4: Add New Student]

**Environment**:
- Device: [iPhone 14 / MacBook Pro / etc.]
- OS: [iOS 17 / macOS 14 / etc.]
- Browser: [Safari / Chrome / N/A]
- App Version: [Check About screen]

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happened

**Screenshots/Video**:
[Attach or describe]

**Console Errors** (if applicable):
```
[Paste any error messages]
```

**Additional Notes**:
Any other relevant information

**Workaround** (if found):
How to temporarily bypass the issue
```

---

## 📊 TESTING PROGRESS TRACKER

### Overall Progress
- **Admin Web App**: ☐☐☐☐☐☐☐☐☐☐ 0/26 (0%)
- **Teacher Mobile App**: ☐☐☐☐☐☐☐☐☐☐ 0/38 (0%)
- **Parent Mobile App**: ☐☐☐☐☐☐☐☐☐☐ 0/14 (0%)
- **Integration Tests**: ☐☐☐☐ 0/4 (0%)
- **Performance Tests**: ☐☐☐☐☐☐ 0/6 (0%)

**Total Manual Tests**: 0/88 (0%)
**Automated Tests**: 27/27 (100%) ✅

---

## 🎯 TESTING PRIORITIES

### Day 1 (Today) - Critical Features
1. ✅ Admin login (Test A1.1)
2. ✅ Teacher mobile login (Test T1.1-T1.3)
3. ✅ Parent mobile login (Test P1.1-P1.2)
4. ✅ Mark attendance (Test T3.1-T3.10)
5. ✅ Approve attendance (Test A5.2)
6. ✅ Parent view attendance (Test P3.1-P3.4)

### Day 2 - Core Workflows
7. ☐ Student management (Tests A3.1-A3.7)
8. ☐ Teacher management (Tests A4.1-A4.4)
9. ☐ Communications (Tests A6.1-A6.4)
10. ☐ Integration Journey I1

### Day 3 - Advanced Features
11. ☐ Bulk operations (Test A5.3)
12. ☐ Integration Journeys I2-I4
13. ☐ Performance tests (Perf-1 to Perf-6)

### Day 4 - Edge Cases & Polish
14. ☐ All remaining tests
15. ☐ Retesting fixed bugs
16. ☐ Final regression testing

---

## 📝 NOTES

**Test Database**:
- Location: `/Users/koustubskulkarni/AVM/product/AVM-code/backend/avm_tutorial.db`
- Students: 3 (Aarav, Diya, Rohan)
- Teachers: 3
- Parents: 2

**Backend Logs**:
- Location: `/Users/koustubskulkarni/AVM/product/backend-logs.txt`
- Contains: OTP codes, WhatsApp messages, API calls

**Test Phone Numbers**:
- Parent 1: `9986660025` (Aarav's parent)
- Parent 2: `8105198350` (Diya's parent)
- Parent 3: `8123001495` (Rohan's parent)

**Admin Credentials**:
- Username: `admin`
- Password: `admin123`

---

**Happy Testing! 🚀**

**Questions?** Check:
- COMPLETE_TESTING_GUIDE.md for detailed procedures
- QUICK_TESTING_REFERENCE.md for quick commands
- AUTOMATED_TEST_SUMMARY.md for API test results
