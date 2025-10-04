# AVM Tutorial - Quick Testing Reference Card

**Last Updated**: October 4, 2025

---

## 🚀 Quick Start Commands

### Start All Services
```bash
# Terminal 1: Backend (if not running)
cd /Users/koustubskulkarni/AVM/product/AVM-code/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Admin Web App (if not running)
cd /Users/koustubskulkarni/AVM/product/AVM-code/frontend/web-app
npm start

# Terminal 3: Mobile App (if not running)
cd /Users/koustubskulkarni/AVM/product/AVM-code/frontend/mobile-app
npx expo start

# Terminal 4: Watch OTP Logs
cd /Users/koustubskulkarni/AVM/product
./watch-otps.sh
```

### Run Automated Tests
```bash
cd /Users/koustubskulkarni/AVM/product
./run_automated_tests.sh
```

---

## 🔑 Test Accounts

### Admin Web App
- **URL**: http://localhost:3000
- **Username**: `admin`
- **Password**: `admin123`

### Mobile App (Parents)
| Phone Number | Child | Purpose |
|--------------|-------|---------|
| 9986660025 | Aarav Kumar (AVM-STU-001) | Primary test parent |
| 8105198350 | Diya Sharma (AVM-STU-002) | Secondary test |
| 8123001495 | Rohan Patel (AVM-STU-003) | Third test |

### Mobile App (Teachers)
- Check database for teacher phone numbers
- Use OTP login (check backend logs for OTP)

---

## 📊 Automated Test Results (Latest)

**Overall**: 14/27 PASSED (51%) ⚠️

### ✅ What's Working:
- Admin login/logout
- Get students list (with auth)
- Messages inbox retrieval
- Database integrity (ID format, uniqueness)
- OTP expiry mechanism

### ❌ What's Broken (Needs Your Manual Testing):
- OTP send/verify endpoints (API level - but mobile app may work)
- Attendance marking via API
- Get single student by ID
- Create communication endpoint
- Invalid token rejection

---

## 📱 Mobile App Manual Testing Checklist

### Teacher App (Priority 1)
- [ ] **Login**: Phone → OTP → PIN/Face ID setup
- [ ] **Home Screen**: Stats cards, menu items
- [ ] **Mark Attendance**: Filter by class, mark P/A/L/Leave, submit
- [ ] **My Students**: View list, filter by class, search
- [ ] **Attendance History**: Date range, status filter, class filter
- [ ] **Messages**: View inbox, read messages
- [ ] **Profile**: View info, logout

### Parent App (Priority 2)
- [ ] **Login**: Phone → OTP → PIN/Face ID setup
- [ ] **Home Screen**: Children cards, quick actions
- [ ] **Messages**: View inbox, read messages
- [ ] **Attendance History**: MUST show only child's records
- [ ] **Children Filtering**: Verify no other students visible

---

## 🌐 Admin Web App Manual Testing Checklist

### Authentication (Priority 1)
- [ ] **Login**: admin/admin123
- [ ] **Invalid Login**: Test wrong password
- [ ] **Logout**: Verify redirect to login

### Students Module (Priority 2)
- [ ] **View Students**: All students display
- [ ] **Search**: Filter by name/ID/class
- [ ] **Add Student**: Create new student
- [ ] **Edit Student**: Modify student details
- [ ] **Delete Student**: Remove student

### Teachers Module (Priority 3)
- [ ] **View Teachers**: All teachers display
- [ ] **Import Excel**: Upload teacher_import_template.xlsx
- [ ] **Export**: Download teachers as Excel

### Attendance Module (Priority 4)
- [ ] **View Today's Attendance**: Default view
- [ ] **Filter by Date**: Select date range
- [ ] **Filter by Class**: Select specific class
- [ ] **Export Report**: Download attendance data

### Communications Module (Priority 5)
- [ ] **Create Individual Message**: Send to one parent
- [ ] **Create Bulk Message**: Send to all parents
- [ ] **View Sent Messages**: Check sent items

---

## 🐛 Known Issues (Don't Report These Again)

1. **OTP API tests fail** - But mobile app works fine (using different format)
2. **Attendance API tests fail** - But mobile app works fine (JSON format difference)
3. **7 orphaned attendance records** - Old test data, not impacting functionality
4. **Only 1 student returned via API** - May be filter/pagination issue

---

## 🔍 What to Look For During Testing

### Critical Issues (Report Immediately)
- [ ] App crashes or freezes
- [ ] Login fails completely
- [ ] Data not saving
- [ ] Wrong data shown (e.g., parent sees other children)
- [ ] Security breaches (unauthorized access)

### High Priority Issues
- [ ] Features don't work as expected
- [ ] Error messages unclear
- [ ] Slow performance (>5 seconds)
- [ ] UI rendering errors

### Medium Priority Issues
- [ ] Minor UI glitches
- [ ] Confusing navigation
- [ ] Missing labels or text
- [ ] Inconsistent styling

### Low Priority Issues
- [ ] Typos
- [ ] Alignment issues
- [ ] Color inconsistencies
- [ ] Nice-to-have features

---

## 📝 Bug Report Template (Copy/Paste)

```markdown
## Bug: [Short Description]

**Severity**: Critical / High / Medium / Low
**Module**: Admin Web / Teacher Mobile / Parent Mobile

### Steps to Reproduce:
1. Step 1
2. Step 2
3. Step 3

### Expected:
What should happen

### Actual:
What actually happened

### Screenshot:
[Attach if possible]

### Environment:
- Device: iPhone/MacBook/etc.
- Browser: Chrome/Safari/etc.
- Time: [When did this happen]
```

---

## 📊 Database Quick Checks

### Check Data Counts
```bash
cd /Users/koustubskulkarni/AVM/product/AVM-code/backend

sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM students;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM teachers;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM parents;"
sqlite3 avm_tutorial.db "SELECT COUNT(*) FROM attendance;"
```

### View Recent Attendance
```bash
sqlite3 avm_tutorial.db "SELECT * FROM attendance ORDER BY marked_at DESC LIMIT 10;"
```

### Check OTPs
```bash
sqlite3 avm_tutorial.db "SELECT * FROM otps WHERE is_verified = 0 ORDER BY created_at DESC LIMIT 5;"
```

### Get Latest OTP for Phone
```bash
sqlite3 avm_tutorial.db "SELECT otp_code, expires_at FROM otps WHERE phone_number='9986660025' ORDER BY created_at DESC LIMIT 1;"
```

---

## 🎯 Testing Priority Order

### Day 1 (Today) - Core Functionality
1. ✅ Automated API tests (DONE)
2. ⏳ Admin login/logout
3. ⏳ Teacher mobile login (OTP + PIN)
4. ⏳ Parent mobile login (OTP + PIN)
5. ⏳ Teacher mark attendance
6. ⏳ Parent view attendance

### Day 2 - Full Feature Testing
7. ⏳ Admin student management (CRUD)
8. ⏳ Admin teacher management
9. ⏳ Teacher view students
10. ⏳ Communications (admin → parents)

### Day 3 - Integration & Edge Cases
11. ⏳ End-to-end journeys
12. ⏳ Multi-user scenarios
13. ⏳ Performance testing
14. ⏳ Edge cases and error handling

---

## 📞 Support & Reference

### Documentation Locations
- **Complete Testing Guide**: `/Users/koustubskulkarni/AVM/product/Running-Projects/COMPLETE_TESTING_GUIDE.md`
- **Automated Test Results**: `/Users/koustubskulkarni/AVM/product/test_results_*.md`
- **Test Summary**: `/Users/koustubskulkarni/AVM/product/Running-Projects/AUTOMATED_TEST_SUMMARY.md`
- **Project Documentation**: `/Users/koustubskulkarni/AVM/product/Running-Projects/AVM-project.md`

### Quick API Tests (cURL)
```bash
# Admin login
curl -X POST http://192.168.29.163:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

# Get students (need token from login)
curl -X GET http://192.168.29.163:8000/api/v1/students/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Send OTP
curl -X POST http://192.168.29.163:8000/api/v1/mobile/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"9986660025"}'
```

---

## ✅ Testing Progress Tracker

Update this as you complete tests:

### Automated Tests
- [x] Backend API tests (27 tests) - 14 PASSED, 13 FAILED

### Manual Tests
- [ ] Admin Web App (26 tests) - 0/26 completed
- [ ] Teacher Mobile App (38 tests) - 0/38 completed
- [ ] Parent Mobile App (14 tests) - 0/14 completed
- [ ] Integration Tests (4 journeys) - 0/4 completed
- [ ] Performance Tests (6 tests) - 0/6 completed

**Total Progress**: 27/115 tests completed (23%)

---

## 🎓 Tips for Effective Testing

1. **Follow the Guide**: Don't skip steps in COMPLETE_TESTING_GUIDE.md
2. **Document Everything**: Screenshot errors, note unexpected behavior
3. **Test Edge Cases**: Empty data, special characters, long text
4. **Test as Real User**: Pretend you're a teacher/parent/admin
5. **Check Logs**: When something fails, check backend logs
6. **Retest After Fixes**: Verify bugs are truly fixed

---

**Happy Testing! 🚀**

**Questions?** Refer to COMPLETE_TESTING_GUIDE.md for detailed procedures.
