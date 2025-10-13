# Quick Start Guide - Parent Communication System
## 10-Minute Setup

### Prerequisites
- Python 3.11+, Node.js 20+, PostgreSQL 15+, Redis 7+, MongoDB 6+

### 1. Clone & Navigate
```bash
git clone https://github.com/sparked/parent-communication-system.git
cd parent-communication-system
```

### 2. Backend Setup (5 minutes)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
alembic upgrade head
python -m app.main
```
✅ Backend: http://localhost:8000

### 3. Frontend Setup (5 minutes)
```bash
cd frontend/web-app
npm install
cp .env.example .env
npm run dev
```
✅ Frontend: http://localhost:5173

### 4. Login
- Admin: admin@school.com / admin123
- Teacher: teacher@school.com / teacher123

---

**Need help?** See README.md or CLAUDE.md
