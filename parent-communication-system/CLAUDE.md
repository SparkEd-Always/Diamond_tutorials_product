# Claude AI Context - Parent Communication System
## Sparked EdTech ERP + SIS + LMS - Journey 24

**Purpose**: AI-assisted development context
**Last Updated**: October 13, 2025
**Status**: Setup Complete - Ready for Development

---

## 🎯 Project Overview

### Mission
Transform parent-teacher communication in Indian schools through unified multi-channel platform that reduces teacher workload by 70% while achieving 90%+ parent engagement.

### Core Problem
- Teachers spend 2-3 hours daily on fragmented communication
- 40% parents miss important messages
- Language barriers (60% prefer regional languages)
- No smartphone access for 30% parents
- No delivery confirmation

### Solution
Multi-channel delivery (app + SMS + email + voice) with real-time translation, two-way chat, meeting scheduling, progress reports, emergency alerts, analytics.

---

## 🏗️ Architecture

### Stack
**Backend**: FastAPI 0.104+ | Python 3.11+ | PostgreSQL 15+ | MongoDB 6+ | Redis 7+
**Frontend**: React 19 | TypeScript 5.9 | Material-UI v7.3 | Vite 7.1.9
**Real-time**: Socket.io (WebSocket)
**Integrations**: MSG91 (SMS), SendGrid (Email), MS Translator, FCM (Push), S3 (Storage)

---

## 📋 10-Week Roadmap

**Phase 1 (Weeks 1-4)**: MVP - Broadcasting + Chat
**Phase 2 (Weeks 5-7)**: Meetings + Reports + Analytics
**Phase 3 (Weeks 8-9)**: Emergency Alerts + Advanced Features
**Phase 4 (Week 10)**: Testing + Launch

---

## 🔑 Key Features

1. **Multi-Channel Broadcasting**: Teachers send once, delivered via app/SMS/email with auto-translation
2. **Real-Time Chat**: WhatsApp-like with bi-directional translation
3. **Meeting Scheduling**: Self-booking with automated reminders
4. **Emergency Alerts**: 100% reach within 10 minutes
5. **Progress Reports**: Auto-generated weekly from attendance/grades/homework
6. **Analytics**: Parent engagement scoring, identify disengaged parents

---

## 💻 Quick Start

```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && alembic upgrade head
python -m app.main  # http://localhost:8000

# Frontend
cd frontend/web-app && npm install && npm run dev  # http://localhost:5173
```

---

## 🎯 Success Metrics

- 99%+ message delivery rate
- 90%+ read rate within 24 hours
- 70% teacher time savings
- 95%+ parent satisfaction
- < 500ms API response time

---

**Status**: ✅ Ready for Development
**Next**: Week 1 - Backend Foundation

*See README.md, QUICKSTART.md, TODO.md for details*
