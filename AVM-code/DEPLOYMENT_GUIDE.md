# AVM Tutorial Management System - Live Deployment Guide

## Deployment Options

### Option 1: Vercel + Railway (Recommended)
**Best for**: Quick deployment with minimal configuration

#### Backend on Railway
1. **Create Railway Account**: https://railway.app
2. **Deploy Backend**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   cd backend
   railway init
   railway up
   ```

3. **Environment Variables on Railway**:
   ```env
   DATABASE_URL=sqlite:///./avm_tutorial.db
   SECRET_KEY=your-production-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

#### Web Admin on Vercel
1. **Create Vercel Account**: https://vercel.com
2. **Deploy Web App**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   cd frontend/web-app
   vercel --prod
   ```

3. **Environment Variables on Vercel**:
   ```env
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app
   ```

#### Mobile App on Expo
1. **Create Expo Account**: https://expo.dev
2. **Build and Deploy**:
   ```bash
   cd frontend/mobile-app
   npx expo install
   npx expo build:web
   npx expo publish
   ```

### Option 2: Docker + Cloud Provider
**Best for**: Full control and scalability

#### Create Dockerfiles

**Backend Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Web App Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./avm_tutorial.db
      - SECRET_KEY=your-secret-key
    volumes:
      - ./backend/avm_tutorial.db:/app/avm_tutorial.db

  web:
    build: ./frontend/web-app
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://backend:8000
    depends_on:
      - backend

  mobile:
    build: ./frontend/mobile-app
    ports:
      - "19006:19006"
    depends_on:
      - backend
```

### Option 3: Heroku (Simple but Limited)
**Best for**: Quick prototype deployment

#### Backend on Heroku
1. **Create Procfile**:
   ```
   web: uvicorn main:app --host=0.0.0.0 --port=${PORT:-8000}
   ```

2. **Deploy**:
   ```bash
   cd backend
   heroku create avm-tutorial-backend
   git init
   git add .
   git commit -m "Initial deployment"
   heroku git:remote -a avm-tutorial-backend
   git push heroku main
   ```

## Production Configuration

### Backend Production Settings
Create `backend/.env`:
```env
# Security
SECRET_KEY=your-super-secure-secret-key-minimum-32-characters
CORS_ORIGINS=["https://your-web-app-domain.com"]

# Database (for production, consider PostgreSQL)
DATABASE_URL=sqlite:///./avm_tutorial.db

# WhatsApp Integration
WHATSAPP_TOKEN=your-whatsapp-business-api-token
WHATSAPP_WEBHOOK_SECRET=your-webhook-verification-secret
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# Email (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Production Settings
Create `frontend/web-app/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_APP_NAME=AVM Tutorial Management
REACT_APP_VERSION=1.0.0
```

### Mobile App Production Settings
Update `frontend/mobile-app/app.json`:
```json
{
  "expo": {
    "name": "AVM Tutorial",
    "slug": "avm-tutorial",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4F46E5"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "apiUrl": "https://your-backend-domain.com"
    }
  }
}
```

## Quick Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Deploying AVM Tutorial Management System..."

# Backend deployment
echo "📦 Deploying Backend to Railway..."
cd backend
railway up

# Get backend URL
BACKEND_URL=$(railway status --json | jq -r '.deployment.url')
echo "Backend deployed at: $BACKEND_URL"

# Web app deployment
echo "🌐 Deploying Web App to Vercel..."
cd ../frontend/web-app
echo "REACT_APP_API_URL=$BACKEND_URL" > .env.production
vercel --prod

# Mobile app deployment
echo "📱 Publishing Mobile App to Expo..."
cd ../mobile-app
# Update API URL in app.json
jq --arg url "$BACKEND_URL" '.expo.extra.apiUrl = $url' app.json > app.json.tmp && mv app.json.tmp app.json
npx expo publish

echo "✅ Deployment Complete!"
echo "Backend: $BACKEND_URL"
echo "Web App: Check Vercel dashboard for URL"
echo "Mobile App: Check Expo dashboard for URL"
```

## Database Migration for Production

For production, consider migrating to PostgreSQL:

1. **Create production database setup**:
```python
# backend/create_production_db.py
import os
from sqlalchemy import create_engine
from app.core.database import Base
from app.models import *  # Import all models

# Use PostgreSQL for production
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/avm_tutorial")

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)

print("✅ Production database created successfully!")
```

2. **Update database configuration**:
```python
# backend/app/core/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use PostgreSQL in production, SQLite in development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./avm_tutorial.db")

if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL)
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

## SSL and Security

### Enable HTTPS
1. **Backend**: Configure SSL certificate
2. **Web App**: Vercel/Netlify provide SSL automatically
3. **Mobile App**: Expo handles HTTPS automatically

### Security Headers
Add to backend `main.py`:
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# HTTPS redirect in production
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["your-domain.com", "*.your-domain.com"]
)
```

## Monitoring and Analytics

### Backend Monitoring
```python
# Add to main.py
import logging
from fastapi.middleware.cors import CORSMiddleware

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AVM Tutorial API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow()
    }
```

### Frontend Analytics
Add Google Analytics to web app:
```html
<!-- In public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

## Live URLs (Once Deployed)

After deployment, update these URLs in the testing guide:

### Production URLs
- **Backend API**: `https://avm-tutorial-backend.railway.app`
- **Web Admin Dashboard**: `https://avm-tutorial-web.vercel.app`
- **Mobile App**: `https://expo.dev/@username/avm-tutorial`
- **API Documentation**: `https://avm-tutorial-backend.railway.app/docs`

### Test Accounts (Same as Development)
- **Admin**: admin@avmtutorial.com / admin123
- **Teacher**: rajesh.kumar@avmtutorial.com / teacher123

## Post-Deployment Checklist

- [ ] All three applications accessible via HTTPS
- [ ] Database populated with test data
- [ ] CORS configured for frontend domains
- [ ] Environment variables set correctly
- [ ] SSL certificates active
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Domain names configured (if custom domains)
- [ ] WhatsApp webhook URL updated (production only)
- [ ] Test all authentication flows
- [ ] Verify attendance workflow end-to-end
- [ ] Test mobile app on actual devices

---

## 🎯 **RECOMMENDED DEPLOYMENT PLAN (Most Economical)**

### **Total Time: ~90 minutes** | **Monthly Cost: ₹420-687**

---

## 📱 **Phase 1: Mobile App Preparation (15 mins)**

### Step 1.1: Update Production API URL ✅ DONE
Already updated in `app.json`:
```json
"extra": {
  "apiUrl": "https://avm-tutorial-api.railway.app"
}
```

### Step 1.2: Install EAS CLI
```bash
npm install -g eas-cli
eas login  # Use your Expo account
```

### Step 1.3: Configure EAS Build ✅ DONE
Already created `eas.json` with:
- `preview` profile → APK for direct download
- `production` profile → AAB for Play Store

---

## 🔧 **Phase 2: Backend Deployment to Railway (25 mins)**

### Step 2.1: Prepare Backend Files (5 mins)
```bash
cd /Users/koustubskulkarni/AVM/product/AVM-code/backend

# Create requirements.txt
pip freeze > requirements.txt

# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Create railway.json
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
EOF
```

### Step 2.2: Create Railway Project (10 mins)
1. Go to https://railway.app → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository → Choose `backend` folder
4. Railway will auto-detect Python and start build

### Step 2.3: Add PostgreSQL Database (2 mins)
1. In Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway auto-connects `DATABASE_URL`

### Step 2.4: Set Environment Variables (5 mins)
Add in Railway project settings:
```
DATABASE_URL=${RAILWAY_PROVIDED_DATABASE_URL}
SECRET_KEY=<generate with: python3 -c "import secrets; print(secrets.token_urlsafe(32))">
FRONTEND_URL=https://avm-tutorial.vercel.app
WHATSAPP_ACCESS_TOKEN=your-token-when-ready
WHATSAPP_PHONE_NUMBER_ID=your-id-when-ready
WHATSAPP_API_VERSION=v17.0
PORT=8000
```

### Step 2.5: Deploy & Get URL (3 mins)
- Railway deploys automatically
- Copy public URL: `https://avm-tutorial-api.railway.app`
- Test: Visit `/health` and `/docs` endpoints

**Cost: ₹420/month ($5 Hobby plan)**

---

## 🌐 **Phase 3: Web App Deployment to Vercel (10 mins)**

### Step 3.1: Prepare Web App (3 mins)
```bash
cd /Users/koustubskulkarni/AVM/product/AVM-code/frontend/web-app

# Create production environment file
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://avm-tutorial-api.railway.app/api/v1
EOF

# Test build
npm run build
```

### Step 3.2: Deploy to Vercel (5 mins)
1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import GitHub repo
3. Select `frontend/web-app` as root directory
4. Configure:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variable: `REACT_APP_API_URL=https://avm-tutorial-api.railway.app/api/v1`
5. Click "Deploy"

### Step 3.3: Get URL (2 mins)
- Vercel deploys in 2-3 mins
- Copy URL: `https://avm-tutorial.vercel.app`
- Test login with admin credentials

**Cost: ₹0 (Free tier)**

---

## 📱 **Phase 4: Build Android APK (30 mins)**

### Step 4.1: Build APK for Direct Download (25 mins)
```bash
cd /Users/koustubskulkarni/AVM/product/AVM-code/frontend/mobile-app

# Build APK (goes to Expo cloud)
eas build --platform android --profile preview

# Wait for build to complete (15-20 mins)
# Download link will be provided:
# https://expo.dev/accounts/your-account/projects/avm-tutorial-teacher/builds/...
```

### Step 4.2: Build AAB for Play Store (runs in parallel)
```bash
# In another terminal, build AAB
eas build --platform android --profile production

# This generates .aab file for Play Store
```

### Step 4.3: Download Built Files (2 mins)
- Download APK from Expo dashboard
- Download AAB from Expo dashboard
- Save both files locally

**Cost: ₹0 (Free builds on Expo)**

---

## ☁️ **Phase 5: Google Drive APK Distribution (5 mins)**

### Step 5.1: Upload to Google Drive
1. Go to https://drive.google.com
2. Create folder: "AVM Tutorial App"
3. Upload `avm-tutorial-teacher-1.0.0.apk`
4. Right-click → Share → "Anyone with link can view"
5. Copy link

### Step 5.2: Create Short Link (Optional)
- Visit bit.ly or tinyurl.com
- Create: `bit.ly/avm-teacher-app`

### Step 5.3: Share with Teachers
```
📱 AVM Tutorial Teacher App - Ready!

Download: https://bit.ly/avm-teacher-app

Steps:
1. Click link & download APK
2. Enable "Unknown Sources" in phone settings
3. Install app
4. Login with your credentials

Questions? Reply here.
```

**Cost: ₹0 (Google Drive free)**

---

## 🏪 **Phase 6: Play Store Submission (15 mins + review time)**

### Step 6.1: Prepare Assets (5 mins)
- App icon: Already at `assets/icon.png` (512x512)
- Screenshots: Take 4-8 from running app
- Feature graphic: Create 1024x500 banner
- Privacy policy: Use https://www.freeprivacypolicy.com/

### Step 6.2: Create Play Console Listing (8 mins)
1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill details:
   - Name: AVM Tutorial Teacher
   - Language: English (India)
   - App type: App
   - Free or paid: Free
   - Category: Education

4. Upload AAB file to "Internal testing" track first
5. Add your email as tester
6. Complete all required sections

### Step 6.3: Submit for Review (2 mins)
- Complete all checklist items
- Click "Send for review"
- Review time: 1-7 days

**Cost: ₹0 (already have Play Store account)**

---

## ✅ **Post-Deployment Verification**

### Backend Health Check
```bash
# Check health endpoint
curl https://avm-tutorial-api.railway.app/health

# Check API docs
open https://avm-tutorial-api.railway.app/docs

# Test login
curl -X POST "https://avm-tutorial-api.railway.app/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@avmtutorial.com&password=admin123"
```

### Web App Check
- Visit: https://avm-tutorial.vercel.app
- Login as admin
- Check all pages load
- Test student/teacher CRUD
- Verify attendance approval

### Mobile App Check
- Install APK on Android device
- Login with teacher credentials
- Mark attendance
- Verify data saves to backend
- Check filters work

---

## 📊 **Deployment Summary**

| Phase | Service | Time | Cost/Month |
|-------|---------|------|------------|
| 1 | Mobile App Prep | 15 mins | ₹0 |
| 2 | Railway Backend | 25 mins | ₹420 |
| 3 | Vercel Web App | 10 mins | ₹0 |
| 4 | EAS Build APK/AAB | 30 mins | ₹0 |
| 5 | Google Drive | 5 mins | ₹0 |
| 6 | Play Store Submit | 15 mins | ₹0 |
| **TOTAL** | | **~90 mins** | **₹420/month** |

### Additional Optional Costs
- WhatsApp Business API: ₹100-200/month (pay per message)
- Custom domain: ₹67/month (₹800/year)

---

## 🚀 **Quick Deploy Commands**

Run these in sequence:

```bash
# 1. Backend prep
cd backend
pip freeze > requirements.txt
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# 2. Web app prep
cd ../frontend/web-app
echo "REACT_APP_API_URL=https://avm-tutorial-api.railway.app/api/v1" > .env.production
npm run build

# 3. Mobile app build
cd ../mobile-app
eas build --platform android --profile preview   # APK
eas build --platform android --profile production # AAB
```

Then:
- Deploy backend via Railway dashboard
- Deploy web app via Vercel dashboard
- Download APK/AAB from Expo dashboard
- Upload APK to Google Drive
- Submit AAB to Play Store

---

## 🎉 **You're Live!**

Once deployed:

1. **Teachers get**:
   - Google Drive APK link immediately
   - Play Store link in 1-7 days

2. **Admins access**:
   - Web dashboard: https://avm-tutorial.vercel.app

3. **Monitor**:
   - Railway dashboard: Backend metrics
   - Vercel dashboard: Web traffic
   - Play Console: App installs

**Next Steps**: Choose your deployment option and follow the specific steps above. Railway + Vercel is recommended for the fastest deployment with minimal configuration.