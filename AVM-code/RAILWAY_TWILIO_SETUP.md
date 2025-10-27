# Railway Twilio Configuration Guide

## 🚂 Railway Deployment

**Current Backend URL:** https://product-production-afd1.up.railway.app

## Issue: OTP SMS Not Sending

The OTP message shows "OTP sent" but users don't receive SMS because `TWILIO_PHONE_NUMBER` is set to a placeholder value.

---

## 📋 Step-by-Step Railway Configuration

### 1. Access Railway Dashboard

```
1. Go to: https://railway.app/
2. Sign in to your account
3. Navigate to your project: "product" (or AVM backend)
4. Click on the backend service
```

### 2. Check Current Environment Variables

Go to: **Variables** tab

Current Twilio variables should be:
```
TWILIO_ACCOUNT_SID=ACf0ea969a0daf0277ad832e44741dc881
TWILIO_AUTH_TOKEN=e8af4b63bccbad5e77bf631a4e1a590e
TWILIO_WHATSAPP_NUMBER=whatsapp:+17069898371
TWILIO_PHONE_NUMBER=+1234567890  ❌ This is the problem!
```

### 3. Get Valid Twilio Phone Number

#### Option A: Purchase Twilio Phone Number ($1-2/month)

1. **Log in to Twilio Console**
   ```
   URL: https://console.twilio.com/
   Account SID: ACf0ea969a0daf0277ad832e44741dc881
   ```

2. **Buy a Phone Number**
   - Navigate: Develop → Phone Numbers → Manage → Buy a number
   - Filter by:
     - Country: United States (best compatibility)
     - Capabilities: ✓ SMS
     - Number Type: Mobile (preferred)
   - Click "Search"
   - Select a number
   - Click "Buy" ($1-2/month)

3. **Get Your Number**
   - After purchase, go to: Phone Numbers → Manage → Active numbers
   - Copy your new number (format: +1XXXXXXXXXX)

#### Option B: Use Twilio Trial Number (Free, Limited)

1. Go to Twilio Console → Phone Numbers
2. Find your **Trial Number** (should already exist)
3. **Important Limitation**: Can only send SMS to verified numbers
4. To verify numbers:
   - Go to: Phone Numbers → Manage → Verified Caller IDs
   - Click "+ Add a new number"
   - Enter the phone number you want to test with
   - Verify via SMS code

### 4. Update Railway Environment Variable

1. **Go to Railway Dashboard**
   - Project → Backend Service → Variables tab

2. **Update TWILIO_PHONE_NUMBER**
   - Click "New Variable" or edit existing
   - Variable name: `TWILIO_PHONE_NUMBER`
   - Value: `+1XXXXXXXXXX` (your Twilio number)
   - Click "Add" or "Update"

3. **Railway will automatically redeploy** (takes 1-2 minutes)

---

## 🧪 Testing the Configuration

### 1. Wait for Railway Deployment

Check deployment status:
```
Railway Dashboard → Your Service → Deployments
Wait for "Success" status (green checkmark)
```

### 2. Test OTP Flow

1. **Open Mobile App** (or web at deployed URL)
2. **Login with Phone Number**: Enter Indian mobile (+91XXXXXXXXXX)
3. **Check Backend Logs** on Railway:
   ```
   Railway Dashboard → Service → Deployments → Latest → View Logs

   Look for:
   ✅ OTP sent via Twilio to +91XXXXXXXXXX (SID: SMXXXXXXXXXXXX)
   📱 OTP sent to +91XXXXXXXXXX via SMS
   ```

4. **Check Mobile Phone**: Should receive SMS with OTP

### 3. Check for Errors

If SMS still fails, check Railway logs for:
```
❌ Twilio error: [Error message]
🔐 OTP for +91XXXXXXXXXX: 123456 (SMS failed, using console)
```

---

## 🇮🇳 Alternative: MSG91 for India (Recommended)

If Twilio has issues with Indian numbers, MSG91 is better suited for India:

### Why MSG91?
- ✅ Better rates for Indian SMS
- ✅ Easier compliance with Indian telecom regulations
- ✅ Better delivery rates to Indian carriers
- ✅ DLT registration support

### MSG91 Setup

1. **Sign up**: https://msg91.com/
2. **Get credentials**:
   - API Key (Auth Key)
   - Template ID (for OTP)
   - Sender ID

3. **Update Code** (requires minor backend changes):
   ```python
   # In otp_service.py, add MSG91 integration
   # Similar to Twilio but using MSG91 API
   ```

4. **Update Railway Variables**:
   ```
   MSG91_AUTH_KEY=your-msg91-auth-key
   MSG91_SENDER_ID=your-sender-id
   MSG91_TEMPLATE_ID=your-otp-template-id
   ```

---

## 📊 Current Deployment Info

### Backend (Railway)
- **URL**: https://product-production-afd1.up.railway.app
- **Service**: FastAPI
- **Database**: SQLite (should migrate to PostgreSQL for production)
- **Auto-deploy**: Enabled on push to master branch

### Frontend (Vercel)
- **URL**: Check Vercel dashboard
- **Framework**: React 19 + Vite
- **Auto-deploy**: Enabled on push to master branch

### Mobile App
- **Platform**: React Native + Expo
- **API**: Points to Railway backend
- **Latest APK**: Sparky-v1.0.0-20251027.apk (69 MB)

---

## 🔐 Environment Variables Checklist

Copy this to Railway Variables:

```bash
# Database (SQLite for now, migrate to PostgreSQL later)
DATABASE_URL=sqlite:///./admission.db

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Twilio - UPDATE THESE!
TWILIO_ACCOUNT_SID=ACf0ea969a0daf0277ad832e44741dc881
TWILIO_AUTH_TOKEN=e8af4b63bccbad5e77bf631a4e1a590e
TWILIO_WHATSAPP_NUMBER=whatsapp:+17069898371
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX  # ⬅️ UPDATE THIS!

# School Info
SCHOOL_NAME=AVM Tutorials
SCHOOL_WHATSAPP_NUMBER=+919380668711
```

---

## 🐛 Troubleshooting

### Issue: SMS Still Not Received

**Check 1: Twilio Account Balance**
```
Twilio Console → Account → Billing
Ensure you have credits
Trial accounts: $15 free credit
Paid accounts: Check balance
```

**Check 2: Number Verification (Trial Accounts)**
```
Trial accounts can ONLY send to verified numbers
Verify your test phone numbers first
```

**Check 3: Railway Logs**
```
Railway → Service → Deployments → View Logs
Search for "Twilio" or "OTP"
```

**Check 4: Phone Number Format**
```
Ensure: +91XXXXXXXXXX (with +91 country code)
Not: 91XXXXXXXXXX or 9XXXXXXXXX
```

### Issue: Railway Deployment Failed

```
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Check if backend code has syntax errors
4. Try manual redeploy: Deployments → ⋯ → Redeploy
```

---

## 🚀 Next Steps After Configuration

1. **Update Twilio Number** in Railway ✅
2. **Wait for deployment** (1-2 min) ✅
3. **Test OTP login** from mobile app ✅
4. **Monitor logs** for successful SMS delivery ✅
5. **Consider MSG91** if issues persist ⚠️
6. **Migrate to PostgreSQL** database (recommended for production) 📋

---

## 📞 Quick Access Links

- **Railway Dashboard**: https://railway.app/
- **Twilio Console**: https://console.twilio.com/
- **Backend API**: https://product-production-afd1.up.railway.app
- **API Docs**: https://product-production-afd1.up.railway.app/docs
- **MSG91**: https://msg91.com/ (alternative)

---

## ✅ Teacher Form Fix - Already Deployed!

The teacher email validation issue has been fixed and pushed to Railway.

**Commit**: `dd14d23b2`
**File**: `app/api/v1/teachers.py`
**Change**: Made email field optional

**Test It:**
1. Go to your deployed admin dashboard
2. Navigate to Teachers page
3. Click "Add Teacher"
4. Fill in fields (no email required)
5. Click "Add" - should work without email error ✅

---

**Generated:** October 27, 2025, 13:45 UTC
**Last Deployment:** Teacher form fix pushed to Railway
**Status:**
- Teacher form: ✅ Fixed & Deployed
- OTP SMS: ⚠️ Needs Twilio number configuration
