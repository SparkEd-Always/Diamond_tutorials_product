# Sparky (AVM Tutorial) - Deployment Guide

## 🚀 Overview

This guide will help you deploy the Sparky application to production using:
- **Backend API**: Railway.app (with PostgreSQL)
- **Web App**: Vercel or Netlify (static hosting)
- **Mobile App**: Production APK for Android

---

## 📋 Prerequisites

1. **GitHub Account** - For code repository
2. **Railway Account** - Sign up at https://railway.app (free to start)
3. **Vercel/Netlify Account** - For web app hosting (free tier available)
4. **Domain (Optional)** - Custom domain for your app

---

## Part 1: Deploy Backend API to Railway

### Step 1: Push Code to GitHub

```bash
cd /Users/koustubskulkarni/AVM/product
git status
git add .
git commit -m "Prepare for production deployment"
git push origin master
```

### Step 2: Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `sparked-org/product`
5. Railway will detect the Python app automatically

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL instance
4. Click on PostgreSQL service → "Connect" tab
5. Copy the `DATABASE_URL` (will look like: `postgresql://...`)

### Step 4: Configure Environment Variables

In Railway project, go to your backend service → "Variables" tab and add:

```bash
# Database (automatically set by Railway if PostgreSQL is linked)
DATABASE_URL=<copied from PostgreSQL service>

# Security - IMPORTANT: Generate new secret key!
SECRET_KEY=<generate-new-random-secret-key-here>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Twilio (copy from your development .env)
TWILIO_ACCOUNT_SID=ACf0ea969a0daf0277ad832e44741dc881
TWILIO_AUTH_TOKEN=e8af4b63bccbad5e77bf631a4e1a590e
TWILIO_WHATSAPP_NUMBER=whatsapp:+17069898371
TWILIO_PHONE_NUMBER=+1234567890

# School Settings
SCHOOL_NAME=AVM Tutorials
SCHOOL_WHATSAPP_NUMBER=+919380668711

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**To generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 5: Configure Railway Deployment

1. Go to "Settings" tab in your backend service
2. **Root Directory**: Set to `AVM-code/backend`
3. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Click "Deploy" or push to GitHub to trigger deployment

### Step 6: Create Database Tables

Once deployed, you need to create database tables:

**Option A: Use Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect to project
railway login
railway link

# Run database setup
railway run python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

**Option B: Add initialization to main.py**
The tables will be created automatically on first startup if you add this to `app/main.py`.

### Step 7: Create Admin Users

After database is set up, create admin users using Railway shell or a migration script.

**Create admin script** (`AVM-code/backend/create_admins.py`):
```python
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

db = SessionLocal()

# Admin 1
admin1 = User(
    unique_id="AVM-ADM-001",
    username="admin1",
    email="admin1@avmtutorials.com",
    phone_number="+919380668711",
    full_name="Admin One",
    hashed_password=get_password_hash("TemporaryPassword123"),
    role=UserRole.ADMIN,
    is_active=True,
    is_verified=True
)

# Admin 2
admin2 = User(
    unique_id="AVM-ADM-002",
    username="admin2",
    email="admin2@avmtutorials.com",
    phone_number="+919380668712",
    full_name="Admin Two",
    hashed_password=get_password_hash("TemporaryPassword123"),
    role=UserRole.ADMIN,
    is_active=True,
    is_verified=True
)

db.add(admin1)
db.add(admin2)
db.commit()
print("✅ Admin users created successfully!")
print("Username: admin1 | Password: TemporaryPassword123")
print("Username: admin2 | Password: TemporaryPassword123")
print("⚠️  Please change passwords immediately after first login!")
```

Run via Railway:
```bash
railway run python create_admins.py
```

### Step 8: Test Backend

Your backend will be live at: `https://your-project-name.up.railway.app`

Test endpoints:
- Health check: `https://your-project-name.up.railway.app/`
- API docs: `https://your-project-name.up.railway.app/docs`

---

## Part 2: Deploy Web App

### Option A: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Root Directory**: `AVM-code/frontend/web-app`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-railway-backend.up.railway.app/api/v1
   ```

6. Click "Deploy"

### Option B: Deploy to Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repository
4. Configure:
   - **Base directory**: `AVM-code/frontend/web-app`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-railway-backend.up.railway.app/api/v1
   ```

6. Update `package.json` proxy to point to production API (or remove it)

7. Click "Deploy"

---

## Part 3: Build Production APK for Mobile App

### Step 1: Update API Base URL

Edit `AVM-code/frontend/mobile-app/src/services/apiService.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000'  // Development (emulator)
  : 'https://your-railway-backend.up.railway.app';  // Production
```

### Step 2: Update App Version

Edit `AVM-code/frontend/mobile-app/app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

### Step 3: Build Production APK

```bash
cd AVM-code/frontend/mobile-app

# Build APK
eas build --platform android --profile production

# OR use local build
npx expo build:android
```

### Step 4: Test APK

Install on physical Android device and test all features with production backend.

---

## Part 4: Database Migration (SQLite → PostgreSQL)

### Export Data from SQLite

```bash
cd AVM-code/backend

# Export students
sqlite3 avm_tutorial.db "SELECT * FROM students;" > students_export.csv

# Export teachers
sqlite3 avm_tutorial.db "SELECT * FROM teachers;" > teachers_export.csv

# Export users
sqlite3 avm_tutorial.db "SELECT * FROM users;" > users_export.csv
```

### Import to PostgreSQL

Use the import feature in your web app once deployed, or create a migration script.

---

## 🔒 Security Checklist

- [ ] Changed SECRET_KEY in production
- [ ] Set ACCESS_TOKEN_EXPIRE_MINUTES to 30 (not 480)
- [ ] Admin passwords changed from temporary ones
- [ ] DATABASE_URL uses strong password
- [ ] Twilio credentials secured
- [ ] CORS configured for production domains only
- [ ] HTTPS enabled (automatic on Railway/Vercel)
- [ ] Environment variables not committed to Git

---

## 💰 Cost Estimation

- **Railway**: $5-10/month (backend + PostgreSQL)
- **Vercel/Netlify**: Free tier (sufficient for 77 students)
- **Total**: ~$5-10/month

**Revenue**: 77 students × ₹29/month = ₹2,233 (~$27 USD)
**Profit**: ~$17-22/month

---

## 📊 Monitoring

### Railway Logs
View live logs in Railway dashboard to monitor:
- API requests
- Database queries
- Error messages
- OTP generation

### Error Tracking (Optional)
Consider adding Sentry for error tracking:
```bash
pip install sentry-sdk
```

---

## 🔄 CI/CD (Continuous Deployment)

Once set up, Railway automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin master
# Railway deploys automatically!
```

---

## 📱 Updating Mobile App

For each new version:
1. Update version in `app.json`
2. Build new APK
3. Distribute to users via WhatsApp/Email
4. (Later) Publish to Google Play Store

---

## 🆘 Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify DATABASE_URL is set correctly
- Ensure all required environment variables are set

### Database connection failed
- Check PostgreSQL service is running
- Verify DATABASE_URL format
- Ensure psycopg2-binary is in requirements.txt

### Mobile app can't connect
- Verify API_BASE_URL in apiService.ts
- Check CORS settings in backend
- Test backend URL in browser first

---

## ✅ Post-Deployment Tasks

1. **Test all features end-to-end**
   - Admin login ✓
   - Teacher attendance marking ✓
   - Parent viewing attendance ✓
   - Push notifications ✓
   - Change password ✓

2. **Share credentials with client**
   - Admin URLs (web + mobile)
   - Temporary admin passwords
   - Instruct to change passwords immediately

3. **Setup monitoring**
   - Enable Railway notifications
   - Monitor error rates
   - Track API usage

4. **Documentation**
   - User manuals for admins/teachers/parents
   - Video tutorials (optional)

---

## 📞 Support

For deployment issues, contact:
- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- Expo/EAS Build: https://docs.expo.dev

---

*Last Updated: October 13, 2025*
*Deployment Status: Ready for Production*
