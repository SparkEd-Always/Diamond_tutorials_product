# AVM Tutorial Management System - Complete Deployment Guide

**Version**: 1.0
**Last Updated**: October 2, 2025
**Focus**: Cost-Effective & Secure Deployment

---

## 🎯 Deployment Overview

### Current Local Status ✅
- ✅ **Backend API**: Running on http://localhost:8000
- ✅ **Web Application**: Running on http://localhost:3000
- ✅ **Mobile App**: Running on http://localhost:8081

### Deployment Strategy - ECONOMICAL & SECURE

| Component | Platform | Cost | Security |
|-----------|----------|------|----------|
| Backend API | Railway.app | **FREE** → $5/month | ✅ HTTPS, PostgreSQL encryption |
| Database | Railway PostgreSQL | **Included FREE** | ✅ Encrypted, automated backups |
| Web App | Vercel | **FREE Forever** | ✅ HTTPS, CDN, DDoS protection |
| Mobile App | Google Drive APK | **FREE** | ✅ APK signing |
| WhatsApp API | Meta Cloud API | **FREE** (1000 msgs/month) | ✅ End-to-end encryption |

**Total Monthly Cost**: $0 (Free tier) → $5 (Production scale)
**For 77 Students**: Completely FREE for first 6-12 months!

---

## Step 1: WhatsApp Cloud API Setup (FREE)

### Why WhatsApp Cloud API?
- ✅ **100% FREE** for up to 1,000 conversations/month
- ✅ Official Meta API (no account ban risk)
- ✅ No WhatsApp Business account needed
- ✅ 77 students × 1 message/day = 77 messages/day (well under limit)
- ✅ Built-in end-to-end encryption

### Setup Steps (15 minutes):

#### 1. Create Facebook Developer Account
```
Website: https://developers.facebook.com/
Steps:
1. Go to https://developers.facebook.com/
2. Click "Get Started"
3. Login with Facebook account (or create one)
4. Verify email
5. Accept terms
```

#### 2. Create WhatsApp Business App
```
Steps:
1. Click "My Apps" → "Create App"
2. Select "Business" as app type
3. App Name: "AVM Tutorial Notifications"
4. Contact Email: your email
5. Click "Create App"
```

#### 3. Add WhatsApp Product
```
Steps:
1. In app dashboard, find "WhatsApp" product
2. Click "Set Up"
3. Select "WhatsApp Business Platform"
4. Choose "Start using the API"
```

#### 4. Get Your Credentials
```
Location: WhatsApp > Getting Started

You'll see:
1. Temporary Access Token (valid 24 hours)
   - Copy this token
   - Use for initial testing

2. Phone Number ID
   - This is your sender number
   - Copy this ID

3. WhatsApp Business Account ID
   - Copy for reference
```

#### 5. Generate Permanent Access Token
```
Steps:
1. Go to App Settings → Basic
2. Copy App ID and App Secret
3. Go to WhatsApp → Getting Started
4. Click "Generate New Token"
5. Select permissions:
   - whatsapp_business_messaging
   - whatsapp_business_management
6. Generate token
7. Copy and save securely (show once only!)
```

#### 6. Add Test Number
```
Steps:
1. In WhatsApp > Getting Started
2. Find "To" field
3. Click "Add phone number"
4. Enter your phone number with country code (+91XXXXXXXXXX)
5. Verify with OTP received on WhatsApp
6. Send test message
```

#### 7. Configure Backend
```bash
# Update backend/.env file
nano ~/AVM/product/AVM-code/backend/.env

# Add these lines:
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_API_VERSION=v17.0
WHATSAPP_VERIFY_TOKEN=avm_tutorial_webhook_2025
```

#### 8. Test WhatsApp Integration
```bash
# Restart backend
cd ~/AVM/product/AVM-code/backend
source venv/bin/activate
# Kill existing server
pkill -f uvicorn
# Start fresh
uvicorn main:app --reload

# Test via API docs
# Open: http://localhost:8000/docs
# Try POST /api/v1/whatsapp/test
```

#### 9. Verify Business Phone Number (Production)
```
For Production Use:
1. Go to WhatsApp > API Setup
2. Click "Add phone number"
3. Enter business phone number
4. Verify via SMS/Call
5. Complete Business Verification:
   - Business name
   - Business address
   - Business documents (optional for free tier)
```

#### 10. Message Limits & Costs
```
FREE TIER:
- 1,000 conversations/month
- Conversation = 24-hour window
- For 77 students: 13 conversations/student/month
- More than sufficient!

PAID TIER (if needed):
- $0.005 - $0.05 per conversation
- Only if exceeding 1,000/month
- Estimated: ~$5/month for 2000 conversations
```

### Security Best Practices:
1. ✅ **Never commit tokens to Git**
2. ✅ **Use environment variables**
3. ✅ **Rotate tokens every 90 days**
4. ✅ **Enable webhook verification**
5. ✅ **Use HTTPS only**

---

## Step 2: Deploy Backend to Railway (FREE → $5/month)

### Why Railway?
- ✅ **$5 free credit/month** (sufficient for development)
- ✅ **One-click PostgreSQL** database
- ✅ **Automatic HTTPS**
- ✅ **Git-based deployments**
- ✅ **Built-in monitoring**
- ✅ **Automated backups**

### Setup Steps (20 minutes):

#### 1. Create Railway Account
```
Website: https://railway.app/
Steps:
1. Go to https://railway.app/
2. Click "Start a New Project"
3. Sign in with GitHub
4. Authorize Railway
```

#### 2. Push Code to GitHub
```bash
cd ~/AVM/product/AVM-code

# Initialize git (if not already)
git init
git add .
git commit -m "Production ready deployment"

# Create GitHub repository
# Go to: https://github.com/new
# Repository name: avm-tutorial-system
# Keep it PRIVATE for security

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/avm-tutorial-system.git
git branch -M main
git push -u origin main
```

#### 3. Create Railway Project
```
Steps:
1. In Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose "avm-tutorial-system"
5. Railway will detect FastAPI app
```

#### 4. Add PostgreSQL Database
```
Steps:
1. In Railway project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Database will be provisioned
4. Connection details auto-configured
```

#### 5. Configure Environment Variables
```
Steps:
1. In Railway project, click backend service
2. Go to "Variables" tab
3. Add these variables:

DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-filled
SECRET_KEY=generate_random_secret_key_here
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_API_VERSION=v17.0
WHATSAPP_VERIFY_TOKEN=avm_tutorial_webhook_2025
ENVIRONMENT=production
```

#### 6. Generate Secure SECRET_KEY
```bash
# On your Mac, run:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Copy the output and use as SECRET_KEY
```

#### 7. Configure Build Settings
```
Railway auto-detects Python, but verify:

Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### 8. Deploy
```
Steps:
1. Railway automatically deploys on push
2. Wait for build (2-5 minutes)
3. Check logs for errors
4. Once deployed, Railway provides URL
   Example: https://avm-tutorial-api.up.railway.app
```

#### 9. Run Database Migrations
```
Steps:
1. In Railway, go to backend service
2. Click "Deploy Logs"
3. SQLAlchemy will auto-create tables on first run
4. Or manually via Railway terminal:
   - Click "Terminal" tab
   - Run: python create_test_data.py
```

#### 10. Test Deployed API
```bash
# Test health endpoint
curl https://your-railway-url.railway.app/docs

# Should return Swagger UI
# Test login via docs
```

### Railway Security Settings:
```
1. Enable HTTPS only (automatic)
2. Set up custom domain (optional)
3. Enable Database connection pooling
4. Configure automated backups (in settings)
5. Set up monitoring alerts
```

### Cost Optimization:
```
FREE TIER:
- $5 free credit/month
- 500 hours execution time
- 1GB RAM
- 1GB storage
- Sufficient for 50-100 users

PAID TIER (if needed):
- $5/month for Hobby plan
- Unlimited hours
- Scales automatically
```

---

## Step 3: Deploy Web App to Vercel (FREE Forever)

### Why Vercel?
- ✅ **100% FREE** for React apps
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Zero configuration**
- ✅ **Unlimited bandwidth**
- ✅ **DDoS protection**

### Setup Steps (10 minutes):

#### 1. Create Vercel Account
```
Website: https://vercel.com/
Steps:
1. Go to https://vercel.com/signup
2. Sign in with GitHub
3. Authorize Vercel
```

#### 2. Update API URL in Frontend
```bash
cd ~/AVM/product/AVM-code/frontend/web-app

# Create production environment file
cat > .env.production << EOF
REACT_APP_API_URL=https://your-railway-url.railway.app/api/v1
EOF

# Commit changes
git add .env.production
git commit -m "Add production API URL"
git push
```

#### 3. Deploy to Vercel
```
Steps:
1. In Vercel dashboard
2. Click "Add New..." → "Project"
3. Import from GitHub
4. Select "avm-tutorial-system"
5. Configure:
   - Framework Preset: Create React App
   - Root Directory: frontend/web-app
   - Build Command: npm run build
   - Output Directory: build
6. Click "Deploy"
```

#### 4. Configure Environment Variables
```
In Vercel project settings:
- Go to "Environment Variables"
- Add: REACT_APP_API_URL
- Value: https://your-railway-url.railway.app/api/v1
- Environment: Production
```

#### 5. Enable CORS on Backend
```bash
# Update backend/app/main.py

# Ensure CORS allows Vercel domain
origins = [
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Add this
    "*"  # Remove in production for security
]
```

#### 6. Test Deployed Web App
```
1. Visit: https://your-app.vercel.app
2. Test login with admin@avm.com
3. Verify all features work
4. Check browser console for errors
```

#### 7. Set Up Custom Domain (Optional)
```
Steps:
1. In Vercel project → Settings → Domains
2. Add your domain (e.g., avm-tutorial.com)
3. Update DNS records as instructed
4. Vercel auto-provisions SSL certificate
```

### Vercel Security:
```
✅ Automatic HTTPS
✅ DDoS protection
✅ Secure headers
✅ No sensitive data in frontend
✅ All secrets in backend only
```

---

## Step 4: Build & Distribute Mobile APK

### Why APK Distribution First?
- ✅ **Instant testing** (no 7-day Play Store review)
- ✅ **FREE** distribution via Google Drive
- ✅ **Client can test immediately**
- ✅ **Play Store later** (optional)

### Prerequisites:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
# Use your Expo account or create one
```

### Build Steps (30 minutes):

#### 1. Update API URL for Production
```bash
cd ~/AVM/product/AVM-code/frontend/mobile-app

# Update src/services/apiService.ts
# Change API_BASE_URL to your Railway URL
```

#### 2. Configure EAS Build
```bash
# Check eas.json
cat eas.json

# Should have:
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### 3. Update App Configuration
```bash
# Update app.json
nano app.json

# Ensure these fields:
{
  "expo": {
    "name": "AVM Tutorial",
    "slug": "avm-tutorial-teacher",
    "version": "1.0.0",
    "android": {
      "package": "com.papayaproductions.avmtutorial",
      "versionCode": 1
    }
  }
}
```

#### 4. Build APK
```bash
# Build for production
eas build --platform android --profile production

# EAS will:
# 1. Upload your code
# 2. Build on Expo servers
# 3. Generate signed APK
# 4. Provide download link

# Wait 10-15 minutes for build
```

#### 5. Download APK
```bash
# Once build completes:
# 1. EAS will provide download URL
# 2. Download APK file
# 3. Rename: AVM-Tutorial-v1.0.0.apk
```

#### 6. Upload to Google Drive
```
Steps:
1. Go to Google Drive
2. Create folder: "AVM Tutorial App"
3. Upload APK file
4. Right-click → Share → Get link
5. Set: "Anyone with the link can view"
6. Copy shareable link
```

#### 7. Create Installation Instructions
```markdown
# AVM Tutorial Teacher App - Installation

**Version**: 1.0.0
**Size**: ~50MB
**Requirements**: Android 8.0+

## Installation Steps:

1. **Download APK**:
   - Click: [Download AVM Tutorial App](your-google-drive-link)
   - File will download to your device

2. **Enable Unknown Sources**:
   - Go to Settings → Security
   - Enable "Install from Unknown Sources"
   - (or "Allow from this source" for this download)

3. **Install App**:
   - Open downloaded file
   - Click "Install"
   - Wait for installation
   - Click "Open"

4. **Login**:
   - Email: your-teacher-email@avm.com
   - Password: (provided by admin)

5. **Test Features**:
   - View students
   - Mark attendance
   - Submit for approval

## Security Note:
This APK is digitally signed by Papaya Productions.
If you see a security warning, it's because the app
is not from Play Store. It's safe to install.

## Support:
For issues, contact: support@papayaproductions.com
```

#### 8. Distribute to Teachers
```
1. Share Google Drive link via:
   - WhatsApp
   - Email
   - SMS
2. Include installation instructions
3. Provide login credentials
4. Schedule training session
```

### APK Security:
```
✅ Signed by Expo/Google
✅ HTTPS only communication
✅ No sensitive data stored locally
✅ JWT token encryption
✅ Automatic token expiration
```

---

## Step 5: Play Store Submission (Optional - Later)

### When to Submit to Play Store?
- After successful APK testing (2-4 weeks)
- When ready for public distribution
- When Play Store listing is prepared

### Requirements:
```
1. Google Play Console Account ($25 one-time fee)
2. App screenshots (6+ images)
3. App icon (512x512px)
4. Privacy Policy URL
5. App description
6. Content rating questionnaire
```

### Timeline:
```
- Preparation: 2-3 days
- Submission: 30 minutes
- Review: 3-7 days (sometimes 1-14 days)
- After approval: Public on Play Store
```

---

## Security Checklist ✅

### Backend Security:
- [ ] HTTPS enabled (automatic on Railway)
- [ ] Environment variables configured
- [ ] SECRET_KEY is random and secure
- [ ] Database encrypted (PostgreSQL default)
- [ ] API rate limiting enabled
- [ ] CORS restricted to known domains
- [ ] No secrets in code
- [ ] Automated backups enabled

### Frontend Security:
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] No API keys in frontend code
- [ ] All secrets in backend only
- [ ] JWT tokens stored securely
- [ ] XSS prevention (React default)
- [ ] CSRF protection
- [ ] Input validation
- [ ] Secure password requirements

### Database Security:
- [ ] PostgreSQL encryption at rest
- [ ] Connection pooling
- [ ] Automated backups (daily)
- [ ] Access restricted to backend only
- [ ] Strong database password
- [ ] No public access

### WhatsApp Security:
- [ ] Tokens stored as environment variables
- [ ] HTTPS only communication
- [ ] End-to-end encryption (built-in)
- [ ] Webhook verification
- [ ] Rate limiting
- [ ] Message logging for audit

### Mobile App Security:
- [ ] APK signed
- [ ] HTTPS only communication
- [ ] JWT token encryption
- [ ] No hardcoded secrets
- [ ] Secure storage for tokens
- [ ] Certificate pinning (optional)

---

## Cost Summary

### Development Phase (0-3 months):
```
Backend (Railway):        $0 (free tier)
Database (Railway):       $0 (included)
Web App (Vercel):        $0 (free forever)
Mobile APK:              $0 (free distribution)
WhatsApp:                $0 (1000 msgs/month)
--------------------------------
TOTAL:                   $0/month
```

### Production Phase (3+ months):
```
Backend (Railway):        $5/month
Database (Railway):       $0 (included)
Web App (Vercel):        $0 (free forever)
Mobile APK:              $0 (or $25 one-time for Play Store)
WhatsApp:                $0 (under 1000 msgs/month)
Domain (optional):       $10/year (~$1/month)
--------------------------------
TOTAL:                   $5-6/month
```

### Revenue vs Cost:
```
Students:                77
Price per student:       ₹29/month
Monthly Revenue:         ₹2,233 (~$27)
Monthly Cost:            $5-6
Profit:                  $21-22/month (₹1,750)
Profit Margin:           ~78%
```

---

## Post-Deployment Checklist

### Day 1 - Immediate:
- [ ] All services deployed and running
- [ ] Admin can login to web app
- [ ] Teachers can login to mobile app
- [ ] WhatsApp test message sent successfully
- [ ] Database populated with test data
- [ ] All API endpoints responding

### Week 1 - Testing:
- [ ] Teachers mark attendance daily
- [ ] Admin approves attendance
- [ ] WhatsApp messages delivered to parents
- [ ] Excel import works
- [ ] All CRUD operations tested
- [ ] Performance acceptable
- [ ] No critical bugs

### Week 2-4 - Monitoring:
- [ ] Monitor Railway usage (stay under free limit)
- [ ] Monitor WhatsApp message count
- [ ] Check error logs daily
- [ ] Gather user feedback
- [ ] Fix minor bugs
- [ ] Document issues

### Month 2 - Optimization:
- [ ] Optimize database queries
- [ ] Add caching if needed
- [ ] Improve mobile app performance
- [ ] Add missing features
- [ ] Prepare Play Store listing
- [ ] Update documentation

---

## Troubleshooting

### Backend Issues:
```
Problem: API not responding
Fix: Check Railway logs, restart service

Problem: Database connection error
Fix: Verify DATABASE_URL environment variable

Problem: WhatsApp not sending
Fix: Verify WHATSAPP_ACCESS_TOKEN is valid
```

### Frontend Issues:
```
Problem: Web app not loading
Fix: Check Vercel deployment logs

Problem: API calls failing
Fix: Verify REACT_APP_API_URL is correct

Problem: CORS errors
Fix: Add Vercel URL to backend CORS origins
```

### Mobile App Issues:
```
Problem: APK not installing
Fix: Enable "Unknown Sources" in Android settings

Problem: Login failing
Fix: Verify API URL in apiService.ts

Problem: Attendance not submitting
Fix: Check backend logs for errors
```

---

## Support & Maintenance

### Daily Tasks:
- Check error logs (5 minutes)
- Monitor WhatsApp delivery (2 minutes)

### Weekly Tasks:
- Review Railway usage (5 minutes)
- Check database backups (2 minutes)
- Update dependencies (if needed)

### Monthly Tasks:
- Rotate WhatsApp tokens (10 minutes)
- Review performance metrics
- Plan feature updates
- Security audit

---

## Next Steps

1. ✅ **Complete WhatsApp Setup** (15 min)
2. ✅ **Deploy to Railway** (20 min)
3. ✅ **Deploy to Vercel** (10 min)
4. ✅ **Build APK** (30 min + build time)
5. ✅ **Test Everything** (1-2 hours)
6. ✅ **Train Teachers** (1 hour)
7. ✅ **Go Live!** 🚀

---

**Deployment Support**: For issues, check logs first. Most problems are configuration-related.

**Cost Optimization**: Stay on free tiers for first 6 months. Upgrade only when needed.

**Security**: Never commit secrets to Git. Use environment variables. Rotate tokens regularly.

---

**A Papaya Production**
© 2025 All Rights Reserved
