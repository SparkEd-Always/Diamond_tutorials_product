# Testing Instructions - Sparky v1.0.2 (Push Notification Fix)
**Build Date**: October 29, 2025
**APK Location**: `~/AVM/product/AVM-code/Sparky-v1.0.2-push-fix-20251029.apk`
**APK Size**: 68 MB

---

## ✅ What's Fixed in v1.0.2

### Frontend Changes:
- ✅ **Push token generation fixed** - Added explicit `projectId` parameter
- ✅ **Enhanced error logging** - Better debugging with try-catch blocks
- ✅ **Improved console messages** - Clear success/failure indicators

### Backend Changes:
- ✅ **Test endpoint added** - `POST /test-push-notification` for manual testing
- ✅ **Token monitoring endpoint** - `GET /check-push-tokens` to view registered tokens
- ✅ **Already deployed to Railway** - Backend changes live at production URL

### Version Updates:
- App Version: `1.0.0` → `1.0.2`
- Android versionCode: `3`
- iOS buildNumber: `3`

---

## 📱 Step 1: Install New APK

### Option A: Install via ADB (Recommended)

**Connect Device**:
```bash
# Ensure device is connected and USB debugging enabled
adb devices
```

**Install APK**:
```bash
cd ~/AVM/product/AVM-code
adb install -r Sparky-v1.0.2-push-fix-20251029.apk
```

**Expected Output**:
```
Performing Streamed Install
Success
```

### Option B: Transfer and Install Manually

```bash
# Transfer to Downloads folder
adb push Sparky-v1.0.2-push-fix-20251029.apk /sdcard/Download/

# On device: Open Files app → Downloads → Tap APK → Install
```

---

## 🧪 Step 2: Test Push Token Generation

### 2.1 Open ADB Logcat
```bash
# Open logcat in a separate terminal
adb logcat | grep -i "expo\|push\|token\|notification"
```

### 2.2 Login to App

1. **Open Sparky app** on your device
2. **Enter phone number** (e.g., `+91-9986660025` or your test parent number)
3. **Receive OTP** via SMS (ensure Twilio is funded)
4. **Enter OTP** and login

### 2.3 Check Logcat Output

**✅ SUCCESS - Look for**:
```
✅ Expo Push Token generated successfully!
Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

**❌ FAILURE - If you see**:
```
❌ Error generating push token: ...
❌ Failed to get push notification permissions!
❌ Must use physical device for Push Notifications
```

**Troubleshooting**:
- Ensure using **physical device** (not emulator)
- Check **notification permissions**: Settings → Apps → Sparky → Notifications → Allowed
- Reinstall app completely (uninstall first)

---

## 🔍 Step 3: Verify Token Stored in Database

### Check Railway Database
```bash
curl https://product-production-afd1.up.railway.app/check-push-tokens
```

**Expected Output**:
```json
{
  "total_parents": 5,
  "with_tokens": 1,
  "without_tokens": 4,
  "parents_with_tokens": [
    {
      "name": "Parent Name",
      "phone": "+91-9986660025",
      "has_token": true,
      "device_type": "android",
      "token_preview": "ExponentPushToken[xxxxxx]..."
    }
  ],
  "parents_without_tokens": [ ... ]
}
```

**✅ Success**: Your parent should appear in `parents_with_tokens`
**❌ Failure**: Parent appears in `parents_without_tokens` → Token not saved

---

## 📤 Step 4: Send Test Notification

### Copy Push Token
From Step 2.3 logcat output or Step 3 API response, copy the full push token:
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

### Send Test Notification
```bash
curl -X POST https://product-production-afd1.up.railway.app/test-push-notification \
  -H "Content-Type: application/json" \
  -d '{
    "push_token": "ExponentPushToken[PASTE_YOUR_TOKEN_HERE]",
    "title": "Test from Sparky 🎉",
    "message": "If you see this, push notifications are working perfectly!"
  }'
```

### Expected Result
**✅ Within 3-5 seconds**:
- Notification appears on device
- Title: "Test from Sparky 🎉"
- Body: "If you see this, push notifications are working perfectly!"
- **Tapping notification opens the app**

**Response from API**:
```json
{
  "success": true,
  "message": "Test notification sent",
  "result": {
    "status": "success",
    "ticket": { "status": "ok", "id": "..." }
  }
}
```

---

## 🎯 Step 5: Full Attendance Workflow Test

### 5.1 Teacher Marks Attendance (Mobile App)

1. **Login as Teacher**:
   - Phone: `+91-8123001495` (or your test teacher number)
   - Enter OTP from SMS

2. **Navigate to Attendance**:
   - Tap "Attendance" in bottom navigation
   - Select today's date
   - Mark students:
     - Student 1: Present
     - Student 2: Absent
     - Student 3: Present

3. **Submit for Approval**:
   - Tap "Submit for Approval"
   - Confirm submission
   - ✅ Success message should appear

### 5.2 Admin Approves Attendance (Web App)

1. **Login to Web App**:
   - Open: https://sparky-avm.com
   - Username: `ADMumesh`
   - Password: `admin1`

2. **Navigate to Attendance Approval**:
   - Click "Attendance Approval" from sidebar
   - ✅ Pending records should appear

3. **Approve Attendance**:
   - Select pending records
   - Click "Approve Selected"
   - ✅ Confirmation message should appear

### 5.3 Parent Receives Notification (Mobile App)

**✅ Expected (within 5 seconds of approval)**:
- Push notification appears on parent's device
- Title: "✅ Attendance Update"
- Body: "Student Name marked present on 2025-10-29"

**Verify Notification Data**:
- Tap notification → Opens app → Shows Attendance History
- Attendance record visible with approved status

### 5.4 Check Railway Logs

```bash
# View Railway logs
# Go to: https://railway.app → Backend Service → Logs

# Look for:
✅ Push notification sent to ExponentPushToken[xxx]...
```

---

## 📊 Validation Checklist

Use this checklist to confirm everything works:

- [ ] APK installs successfully on device
- [ ] App launches without crashes
- [ ] Login with phone number works
- [ ] OTP received via SMS (ensure Twilio funded)
- [ ] Push token generated (visible in logcat)
- [ ] Token saved to database (visible via API endpoint)
- [ ] Test notification received on device
- [ ] Tapping notification opens app
- [ ] Teacher can mark attendance
- [ ] Admin can approve attendance
- [ ] Parent receives attendance notification within 5 seconds
- [ ] Notification tap opens correct screen (Attendance History)
- [ ] No crashes or errors in entire flow

---

## 🚨 Troubleshooting

### Issue 1: Token Still Returns Null

**Symptoms**:
```
❌ Error generating push token: ...
```

**Solutions**:
1. **Check Device**: Must be physical device (NOT emulator)
2. **Check Permissions**: Settings → Apps → Sparky → Notifications → Enabled
3. **Reinstall App**: Completely uninstall first, then reinstall
4. **Check Expo Account**: Ensure `d9867ba4-c8ce-4ab6-9408-58606c1bfab7` exists
5. **Update Expo**: `npm install expo@latest` and rebuild

### Issue 2: Notification Not Received

**Symptoms**:
- API returns success, but no notification on device

**Solutions**:
1. **Check Token Format**: Must start with `ExponentPushToken[`
2. **Check Internet**: Device must have active internet connection
3. **Check Do Not Disturb**: Disable DND mode on device
4. **Check Battery Saver**: Disable battery optimization for Sparky
5. **Check Expo Status**: Visit https://status.expo.dev

### Issue 3: Notification Received But Tap Doesn't Work

**Symptoms**:
- Notification appears, but tapping does nothing

**Solutions**:
1. **Check Notification Data**: Must include `action` field
2. **Check Navigation**: Ensure target screen exists in app
3. **Reinstall App**: Sometimes navigation config gets cached

### Issue 4: Backend 500 Error

**Symptoms**:
```json
{"error": "Failed to send test notification: ..."}
```

**Check Railway Logs**:
```
# Go to: https://railway.app → Backend Service → Logs
# Look for specific error message
```

**Common Errors**:
- `401 Unauthorized` from Expo → Invalid projectId or Expo credentials
- `DeviceNotRegistered` → Token expired, user needs to re-login
- `MessageTooBig` → Notification content exceeds 2KB limit

---

## 📈 Success Metrics

Push notifications are **fully operational** when:

- ✅ **Token Generation**: 95%+ success rate for new logins
- ✅ **Token Storage**: Visible via `/check-push-tokens` endpoint
- ✅ **Notification Delivery**: < 5 second latency
- ✅ **Notification Interaction**: Tap opens correct screen
- ✅ **Parent Coverage**: 80%+ of parents have registered tokens within 1 week
- ✅ **Zero Crashes**: No crashes related to push notifications

---

## 🎯 Next Steps After Successful Testing

Once all tests pass:

### 1. Deploy to All Users

**Option A: Direct APK Distribution**
```bash
# Share APK via:
# - Google Drive
# - Email
# - WhatsApp
# - Direct download link
```

**Option B: Google Play Store (Recommended)**
- See `PUSH_NOTIFICATION_FIX_GUIDE.md` for Play Store publishing steps

### 2. Monitor Token Registration

**Check daily for first week**:
```bash
curl https://product-production-afd1.up.railway.app/check-push-tokens
```

**Expected Growth**:
- Day 1: 20-30% of parents
- Day 3: 50-60% of parents
- Day 7: 80%+ of parents

### 3. Monitor Notification Delivery

**Check Railway logs for**:
- Success rate: `✅ Push notification sent`
- Failure rate: `❌ Push notification error`
- Error patterns: Any recurring errors

### 4. User Feedback

**Ask users**:
- "Did you receive the attendance notification?"
- "How quickly did you receive it?"
- "Did tapping the notification work?"

---

## 📞 Support Contacts

**Railway Backend**: https://railway.app
**Expo Dashboard**: https://expo.dev/accounts/koustubsk/projects/sparky
**Expo Status**: https://status.expo.dev
**Project Documentation**: `PUSH_NOTIFICATION_FIX_GUIDE.md`

---

## 🎉 Congratulations!

If all tests pass, you've successfully fixed push notifications! 🚀

**What's Working**:
- ✅ Push token generation
- ✅ Token storage in production database
- ✅ Notification delivery via Expo
- ✅ End-to-end attendance workflow
- ✅ Ready for Google Play Store submission

---

**Last Updated**: October 29, 2025
**Version**: 1.0.2
**Status**: ✅ Ready for Production Testing
**Build**: Sparky-v1.0.2-push-fix-20251029.apk
