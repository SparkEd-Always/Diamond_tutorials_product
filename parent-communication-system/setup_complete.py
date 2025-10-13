#!/usr/bin/env python3
"""
Complete Project Setup Script for Parent Communication System
Generates all remaining backend and frontend skeleton files
"""

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

def create_file(path: str, content: str):
    """Create file with content"""
    file_path = BASE_DIR / path
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Created: {path}")

# ==================== Backend Files ====================

# .env.example
create_file('backend/.env.example', '''# Database
DATABASE_URL=postgresql://user:password@localhost:5432/parent_comm
MONGODB_URL=mongodb://localhost:27017/parent_comm
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=sparked-parent-comm-attachments
S3_REGION=ap-south-1

# SMS (MSG91 or Twilio)
SMS_PROVIDER=msg91
MSG91_API_KEY=your-msg91-api-key
MSG91_SENDER_ID=SCHOOL
# TWILIO_ACCOUNT_SID=your-twilio-sid
# TWILIO_AUTH_TOKEN=your-twilio-token
# TWILIO_PHONE_NUMBER=+1234567890

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@school.com
FROM_NAME=School Name

# Translation (Microsoft Translator)
TRANSLATOR_API_KEY=your-translator-api-key
TRANSLATOR_REGION=centralindia

# Firebase Cloud Messaging
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# Google Meet (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Environment
ENVIRONMENT=development
DEBUG=True
''')

# Backend main.py
create_file('backend/app/main.py', '''"""
FastAPI application entry point for Parent Communication System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Parent Communication System API",
    version="1.0.0",
    description="Multi-channel parent-teacher communication platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Parent Communication System API",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
''')

# Backend config.py
create_file('backend/app/core/config.py', '''"""
Application configuration loaded from environment variables
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    MONGODB_URL: str
    REDIS_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # AWS
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    S3_BUCKET_NAME: str
    S3_REGION: str = "ap-south-1"

    # SMS
    SMS_PROVIDER: str = "msg91"
    MSG91_API_KEY: str | None = None
    MSG91_SENDER_ID: str | None = None

    # Email
    SENDGRID_API_KEY: str
    FROM_EMAIL: str
    FROM_NAME: str

    # Translation
    TRANSLATOR_API_KEY: str
    TRANSLATOR_REGION: str = "centralindia"

    # Firebase
    FIREBASE_CREDENTIALS_PATH: str

    # Celery
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
''')

# Backend database.py
create_file('backend/app/core/database.py', '''"""
Database configuration for PostgreSQL and MongoDB
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient
from redis import Redis
from app.core.config import settings

# PostgreSQL
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# MongoDB
mongo_client = MongoClient(settings.MONGODB_URL)
mongo_db = mongo_client.parent_comm

# Redis
redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
''')

# Backend security.py
create_file('backend/app/core/security.py', '''"""
Authentication and security utilities
"""
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict | None:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
''')

# Backend __init__.py files
for init_path in [
    'backend/app/__init__.py',
    'backend/app/core/__init__.py',
    'backend/app/models/__init__.py',
    'backend/app/schemas/__init__.py',
    'backend/app/api/__init__.py',
    'backend/app/api/v1/__init__.py',
    'backend/app/services/__init__.py',
    'backend/app/utils/__init__.py',
    'backend/app/tasks/__init__.py',
    'backend/app/tests/__init__.py'
]:
    create_file(init_path, '"""Package initialization"""\n')

# ==================== Frontend Files ====================

# Frontend package.json
create_file('frontend/web-app/package.json', '''{
  "name": "parent-communication-web-app",
  "version": "1.0.0",
  "description": "Parent Communication System Web Application",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \\"src/**/*.{ts,tsx,json,css}\\""
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@mui/material": "^7.3.0",
    "@mui/icons-material": "^7.3.0",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "react-router-dom": "^7.9.0",
    "axios": "^1.12.0",
    "react-hook-form": "^7.64.0",
    "yup": "^1.7.0",
    "@hookform/resolvers": "^3.3.2",
    "socket.io-client": "^4.5.4",
    "dayjs": "^1.11.10",
    "recharts": "^2.10.0",
    "react-dropzone": "^14.2.3",
    "react-toastify": "^9.1.3",
    "@fullcalendar/react": "^6.1.10",
    "@fullcalendar/daygrid": "^6.1.10",
    "@fullcalendar/timegrid": "^6.1.10",
    "@fullcalendar/interaction": "^6.1.10"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.9.0",
    "vite": "^7.1.9",
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "prettier": "^3.1.1"
  }
}
''')

# Frontend .env.example
create_file('frontend/web-app/.env.example', '''VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_NAME=Parent Communication System
VITE_APP_VERSION=1.0.0
''')

# Frontend tsconfig.json
create_file('frontend/web-app/tsconfig.json', '''{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
''')

# Frontend vite.config.ts
create_file('frontend/web-app/vite.config.ts', '''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
''')

# Frontend main.tsx
create_file('frontend/web-app/src/main.tsx', '''import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
''')

# Frontend App.tsx
create_file('frontend/web-app/src/App.tsx', '''import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <div className="App">
          <h1>Parent Communication System</h1>
          <p>Frontend skeleton ready. Start building!</p>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
''')

# Frontend index.css
create_file('frontend/web-app/src/index.css', '''* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}
''')

# Frontend index.html
create_file('frontend/web-app/index.html', '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Parent Communication System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
''')

# .gitignore
create_file('.gitignore', '''# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
venv/
env/
ENV/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
dist/
.env.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log
logs/

# Environment
.env
.env.local
.env.production

# Testing
.coverage
htmlcov/
.pytest_cache/
coverage/

# Misc
*.pid
*.seed
*.pid.lock
.firebase/
firebase-credentials.json
''')

print("\n✅ Project setup complete!")
print("📁 All backend and frontend skeleton files created")
print("\n🚀 Next steps:")
print("1. cd backend && python -m venv venv && source venv/bin/activate")
print("2. pip install -r requirements.txt")
print("3. cp .env.example .env && edit .env with your credentials")
print("4. python -m app.main  # Start backend")
print("5. cd ../frontend/web-app && npm install && npm run dev  # Start frontend")
