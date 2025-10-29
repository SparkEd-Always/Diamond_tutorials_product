# Fixes Applied - v1.0.3
**Date**: October 29, 2025
**Issues Fixed**: Parent deletion, Push notification visibility

---

## 🐛 Issue 1: Orphaned Parents Not Deleted

### Problem:
When students are deleted from the admin console, their parents remain in the `parents` table. This causes:
- Messages being sent to 6 parents when only 1 student exists
- Orphaned parent records cluttering the database
- Confusion about active parents

### Root Cause:
The "lazy login" approach creates parent records only when parents log in. However, when students are deleted, the code didn't check if the parent should also be removed.

### Fix Applied:

**File**: `backend/app/api/v1/students.py`

**Changes**:
1. Added `from sqlalchemy import or_` import
2. Updated `delete_student()` endpoint:
   - Stores parent phone before deleting student
   - After deletion, checks if parent has any other active children
   - If parent has no other children, deletes parent and their messages
   - Returns `parent_deleted` flag in response

3. Updated `delete_multiple_students()` endpoint:
   - Tracks all parent phones from deleted students
   - After deletions, checks each parent for orphans
   - Deletes parents with no remaining children
   - Returns count of parents deleted

**Logic**:
```python
# After deleting student
if no other active students with this parent_phone:
    delete parent from parents table
    delete parent's messages
```

### Cleanup Script Created:

**File**: `backend/cleanup_orphaned_parents.py`

Run this once to clean up existing orphaned parents:

```bash
cd ~/AVM/product/AVM-code/backend
python cleanup_orphaned_parents.py
```

**What it does**:
- Scans all parents in database
- Checks if each parent has active students
- Deletes orphaned parents and their messages
- Provides summary of cleanup

---

## 🐛 Issue 2: Push Notifications Not Appearing on Device

### Problem:
- Push notifications are sent successfully from backend
- Messages appear in the in-app inbox
- But device doesn't show notification banner/sound/vibration

### Likely Causes:

#### 1. **App in Foreground (Most Common)**
When the app is **open and active**, Android may not show notification banners by default. This is expected behavior.

**Test**:
1. Close the app completely (swipe away from recent apps)
2. Lock the device
3. Send a message from admin
4. Notification should appear on lock screen

#### 2. **Android Notification Settings**
Device notification permissions may be partially granted.

**Check**:
```
Settings → Apps → Sparky → Notifications
- Ensure "Show notifications" is ON
- Check "Notification categories" → Default → Set to "Alerting" or "High importance"
- Enable "Lock screen" notifications
```

#### 3. **Android 12+ Restrictions**
Android 12 and higher have stricter notification rules.

**Verify in app.json**:
```json
"android": {
  "permissions": [
    "android.permission.POST_NOTIFICATIONS"  // ✅ Already added
  ]
}
```

#### 4. **Battery Optimization**
Some devices (Xiaomi, Oppo, Vivo) aggressively kill background processes.

**Disable**:
```
Settings → Battery → Battery optimization → Sparky → Don't optimize
Settings → App info → Sparky → Battery → Unrestricted
```

---

## 🧪 How to Test Push Notifications

### Test 1: App Backgrounded

1. **Open Sparky app** and login
2. **Press home button** (don't close app, just background it)
3. **Admin sends message** from web
4. **Expected**: Notification appears in notification drawer

### Test 2: App Closed

1. **Close Sparky completely** (swipe away from recent apps)
2. **Admin sends message** from web
3. **Expected**:
   - Notification appears on lock screen
   - Sound plays
   - Device vibrates
   - LED light blinks (if device has one)

### Test 3: Device Locked

1. **Lock device**
2. **Admin sends message** from web
3. **Expected**: Notification appears on lock screen

### Test 4: App in Foreground

1. **Keep Sparky open** and viewing
2. **Admin sends message** from web
3. **Expected**:
   - In-app inbox shows new message
   - May or may not show system notification (this varies by device)
   - Can add custom in-app alert if needed

---

## 🔧 Additional Fixes (If Still Not Working)

### Fix 1: Check Expo Project ID

Ensure `app.json` has correct projectId:
```json
"extra": {
  "eas": {
    "projectId": "d9867ba4-c8ce-4ab6-9408-58606c1bfab7"
  }
}
```

### Fix 2: Verify Push Token

```bash
# Check if push token is registered
curl https://product-production-afd1.up.railway.app/check-push-tokens

# Should show parent with push_token
```

### Fix 3: Test with Expo Push Tool

```bash
# Visit: https://expo.dev/notifications

# Enter:
# - Token: ExponentPushToken[xxx] (from check-push-tokens)
# - Title: Test
# - Message: Testing
# - Send notification

# If this works, backend integration is correct
# If this doesn't work, issue is with Expo/device
```

### Fix 4: Check Railway Logs

```bash
# Railway → Backend Service → Logs
# Look for:
✅ Push notification sent to ExponentPushToken[xxx]...

# Or errors:
❌ Invalid push token
❌ DeviceNotRegistered
```

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend Changes

```bash
cd ~/AVM/product/AVM-code

# Commit changes
git add backend/app/api/v1/students.py backend/cleanup_orphaned_parents.py FIXES_v1.0.3.md
git commit -m "FIX: Delete orphaned parents when students are removed

- Updated delete_student() to check for orphaned parents
- Updated delete_multiple_students() with same logic
- Added cleanup script for existing orphaned parents
- Added comprehensive fix documentation

Fixes: Parent table not cleaned up on student deletion
Issue: Messages sent to 6 parents when only 1 student exists"

# Push to trigger Railway deployment
git push origin master
```

### Step 2: Clean Up Existing Orphaned Parents

**After backend is deployed**:

```bash
# SSH into Railway or use local connection to production DB
cd ~/AVM/product/AVM-code/backend

# Run cleanup script
python cleanup_orphaned_parents.py
```

**Expected output**:
```
🔍 Checking 6 parents for orphans...
============================================================

❌ Orphaned parent found:
   Name: Parent 1
   Phone: +91-1234567890
   ID: 2
   Deleted 3 messages
   ✅ Parent deleted

✅ Parent 2 has 1 active student(s) - keeping

...

🎉 Cleanup complete!
   Total parents checked: 6
   Orphaned parents removed: 5
   Active parents remaining: 1
```

### Step 3: Verify Fix

```bash
# Check parent count matches student count
curl https://product-production-afd1.up.railway.app/check-push-tokens

# Should show:
{
  "total_parents": 1,  // Matches number of unique parent phones with active students
  "with_tokens": 1,
  ...
}
```

### Step 4: Test Message Sending

1. **Admin sends message** from web
2. **Verify only 1 parent receives it** (check Railway logs)
3. **Expected**:
```
📱 Sending to 1 parent(s)
✅ Push notification sent to ExponentPushToken[xxx]...
```

---

## 📊 Summary of Changes

### Files Modified:
1. `backend/app/api/v1/students.py` - Fixed parent deletion logic
2. `backend/cleanup_orphaned_parents.py` - Created cleanup script
3. `FIXES_v1.0.3.md` - This document

### Behavior Changes:
- **Before**: Students deleted, parents remain in table
- **After**: Students deleted → Parent checked → If no other children, parent deleted

### Database Impact:
- Orphaned parents will be automatically removed
- Parent messages will be cleaned up with parent
- No impact on parents with multiple children

---

## 🎯 Railway GitHub Connection Issue

### Error:
```
Branch connected to production
Changes made to this GitHub branch will be automatically pushed to this environment.
Problem processing request
```

### Possible Causes:
1. **GitHub App permissions revoked** - Railway lost access to repo
2. **Repository moved or renamed** - Old connection invalid
3. **Railway service restart needed** - Stale connection

### Fix:

#### Option 1: Reconnect GitHub (Recommended)

1. **Go to Railway Dashboard**:
   ```
   https://railway.app/project/[your-project-id]
   ```

2. **Click on Backend Service** → **Settings** → **Source**

3. **Disconnect current repo**:
   - Click "Disconnect"
   - Confirm disconnection

4. **Reconnect repo**:
   - Click "Connect Repo"
   - Select GitHub
   - Authorize Railway if prompted
   - Select `sparked-org/product` repository
   - Select `master` branch
   - Save

5. **Trigger deployment**:
   - Click "Deploy" → "Redeploy"
   - Or push a new commit to master

#### Option 2: Manual Deployment

If auto-deploy isn't critical:
1. Leave GitHub disconnected
2. Deploy manually via Railway CLI when needed:
   ```bash
   railway up
   ```

#### Option 3: Check GitHub App Permissions

1. **Go to GitHub**:
   ```
   https://github.com/settings/installations
   ```

2. **Find Railway app**

3. **Check permissions**:
   - Ensure Railway has access to `sparked-org/product`
   - Grant permissions if needed

4. **Go back to Railway** and try reconnecting

---

## ✅ Verification Checklist

After deploying fixes:

- [ ] Backend deployed successfully to Railway
- [ ] Cleanup script run on production database
- [ ] Parent count matches active students (check `/check-push-tokens`)
- [ ] Message sent from admin reaches only active parents
- [ ] Railway logs show correct push notification count
- [ ] GitHub auto-deploy working (or manual deploy configured)
- [ ] Push notifications tested with app backgrounded
- [ ] Push notifications tested with app closed
- [ ] Push notifications tested with device locked

---

**Last Updated**: October 29, 2025
**Version**: 1.0.3 (includes v1.0.2 push notification fix + orphaned parent fix)
**Status**: Ready for deployment and testing
