# Local Testing Guide - AVM Tutorial Mobile App

## ✅ System Status

### Backend Server
- **Status:** ✅ Running
- **URL:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Process:** Python FastAPI with uvicorn

### Mobile App (Expo)
- **Status:** ✅ Running
- **Metro Bundler:** http://localhost:8081
- **Status Endpoint:** http://localhost:8081/status (shows: packager-status:running)

---

## 🚀 How to Test Locally on Your MacBook

### Option 1: Using Expo Go App (Recommended for Quick Testing)

1. **Install Expo Go on your phone:**
   - iOS: Download from App Store
   - Android: Download from Play Store

2. **Connect to same WiFi network:**
   - Ensure your MacBook and phone are on the same WiFi

3. **Scan QR Code:**
   ```bash
   # In terminal, you should see a QR code displayed
   # Scan it with:
   # - iOS: Camera app
   # - Android: Expo Go app
   ```

4. **If QR code not visible, check the Expo output:**
   ```bash
   # Check running Expo process output
   # It will show something like:
   # › Metro waiting on exp://192.168.x.x:8081
   # › Scan the QR code above with Expo Go (Android) or Camera (iOS)
   ```

### Option 2: Using iOS Simulator (macOS only)

1. **Open iOS Simulator:**
   ```bash
   # Press 'i' in the Expo terminal
   # Or manually:
   open -a Simulator
   ```

2. **Wait for app to build and load**

### Option 3: Using Android Emulator

1. **Start Android Emulator first:**
   ```bash
   # Open Android Studio > AVD Manager > Start emulator
   ```

2. **In Expo terminal, press 'a'** to open in Android

---

## 🧪 Test Scenarios

### 1. First-Time User Flow (Fresh Install)

**Test Steps:**
1. Open app
2. See OTP Login Screen
3. Enter phone number: `+919876543210` (test number)
4. Click "Send OTP"
5. Check backend console for OTP (development mode)
6. Enter OTP
7. **Should navigate to:** "Setup Quick Login" screen
8. Choose either:
   - **Set up PIN** → Create 4-digit PIN → Confirm
   - **Use Biometrics** → Authenticate → Create backup PIN
   - **Skip for now** → Go directly to home

**Expected Outcome:**
- ✅ OTP sent successfully
- ✅ User authenticated
- ✅ Quick login setup screen appears
- ✅ PIN/Biometric configured (if chosen)
- ✅ Navigate to Teacher/Parent home screen

### 2. Returning User with PIN

**Test Steps:**
1. Close app completely
2. Reopen app
3. **Should see:** PIN Login Screen
4. Enter your 4-digit PIN
5. Should navigate to home screen instantly

**Expected Outcome:**
- ✅ PIN screen appears (no OTP needed)
- ✅ Correct PIN → Home screen
- ✅ Wrong PIN → Error + attempts counter
- ✅ 5 wrong attempts → Locked for 5 minutes

### 3. Returning User with Biometric

**Test Steps:**
1. Close app completely
2. Reopen app
3. **Should see:** Biometric prompt automatically
4. Use Face ID/Touch ID/Fingerprint
5. Should navigate to home screen

**Expected Outcome:**
- ✅ Biometric prompt appears
- ✅ Success → Home screen
- ✅ Failed → Option to use PIN
- ✅ 3 failed attempts → Fall back to PIN

### 4. Forgot PIN Flow

**Test Steps:**
1. On PIN screen, click "Forgot PIN?"
2. Confirm reset
3. **Should navigate to:** OTP Login Screen
4. Phone number pre-filled
5. Verify via OTP
6. **Should navigate to:** Create New PIN screen
7. Create new PIN

**Expected Outcome:**
- ✅ OTP sent for verification
- ✅ After OTP → Create New PIN screen
- ✅ New PIN saved successfully
- ✅ Can login with new PIN

### 5. Token Expiry (Simulate 30+ days)

**Test Steps:**
1. In AsyncStorage, manually set `last_login` to 31 days ago
2. Restart app
3. **Should force:** OTP re-authentication
4. After OTP, ask to keep previous PIN method

**Expected Outcome:**
- ✅ Detects expired token
- ✅ Forces OTP login
- ✅ Asks to keep PIN settings
- ✅ Re-establishes session

### 6. Push Notifications

**Test Steps:**
1. Login successfully
2. Send test notification from backend:
   ```python
   from app.services.push_notification_service import PushNotificationService

   PushNotificationService.send_notification(
       push_token="ExponentPushToken[YOUR_TOKEN]",
       title="Test Notification",
       body="This is a test from AVM Tutorial",
       data={"test": "true"}
   )
   ```
3. Check if notification appears

**Expected Outcome:**
- ✅ Push token saved on login
- ✅ Notification received on device
- ✅ Clicking notification opens app

### 7. In-App Messaging

**Test Steps:**
1. Login as teacher/parent
2. Navigate to Messages screen
3. Check inbox
4. Tap a message to view details
5. Pull to refresh

**Expected Outcome:**
- ✅ Messages list loads
- ✅ Unread messages highlighted
- ✅ Message detail view works
- ✅ Mark as read functionality works
- ✅ Refresh works

---

## 📱 Testing on Physical Device

### iOS (using Expo Go)

1. **Connect to same WiFi**
2. **Open Camera app**
3. **Scan QR code from Expo terminal**
4. **Opens in Expo Go**

### Android (using Expo Go)

1. **Connect to same WiFi**
2. **Open Expo Go app**
3. **Scan QR code**
4. **App loads**

---

## 🔧 Troubleshooting

### Issue: Can't connect to backend

**Solution:**
```bash
# Update API_BASE_URL in mobile app
# Change from localhost to your Mac's IP address

# Find your Mac's IP:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update in:
# - src/screens/LoginOTPScreen.tsx
# - src/screens/MessagesScreen.tsx
# Change: http://localhost:8000
# To: http://192.168.x.x:8000 (your Mac's IP)
```

### Issue: Metro bundler not accessible

**Solution:**
```bash
# Kill all Expo processes
pkill -9 -f "expo"

# Clear cache and restart
cd frontend/mobile-app
npx expo start --clear
```

### Issue: Push notifications not working

**Checklist:**
- ✅ Push token printed in console after login?
- ✅ Token saved in backend database?
- ✅ Using real device (not simulator for notifications)
- ✅ Notifications enabled in device settings

### Issue: Biometric not working

**Checklist:**
- ✅ Using real device (simulators have limited biometric support)
- ✅ Biometric enabled in device settings?
- ✅ Fallback to PIN works?

---

## 📊 Key Files to Monitor

### Backend Logs
```bash
# Watch backend logs
tail -f /Users/koustubskulkarni/AVM/product/AVM-code/backend/logs/app.log
```

### Database
```bash
# Check stored user data
sqlite3 /Users/koustubskulkarni/AVM/product/AVM-code/backend/avm.db
```

### AsyncStorage (Mobile)
- Can view in React Native Debugger
- Or check in Expo Dev Tools

---

## ✅ Verification Checklist

- [ ] Backend server responds at http://localhost:8000/docs
- [ ] Metro bundler shows "packager-status:running"
- [ ] Can open app on device/simulator
- [ ] OTP login works
- [ ] PIN setup works
- [ ] PIN login works
- [ ] Biometric login works (on real device)
- [ ] Forgot PIN flow works
- [ ] Push notifications work (on real device)
- [ ] In-app messages work
- [ ] Teacher home screen loads
- [ ] Parent home screen loads

---

## 🚀 Next Steps After Local Testing

Once everything works locally:

1. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Test APK on device:**
   - Install and test all flows

3. **Production Build:**
   ```bash
   eas build --platform android --profile production
   ```

4. **Play Store Submission:**
   - Configure app signing
   - Upload to Google Play Console

---

**Current Status:** All components running successfully ✅
- Backend: http://localhost:8000 ✅
- Mobile: http://localhost:8081 ✅
