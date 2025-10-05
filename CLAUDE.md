# Claude AI Context for EdTech ERP + SIS + LMS Project

## Project Overview
Building an integrated Educational Technology platform combining Enterprise Resource Planning (ERP), Student Information System (SIS), and Learning Management System (LMS) for Indian schools.

## Development Approach
**Journey-Driven Development**: Building complete user journeys end-to-end rather than isolated modules to ensure proper integration and immediate user value.

## Current Status

### Completed Documentation
- **37 Business Requirements**: Complete modules across 8 categories (Academics, Operations, HR, Communication, Compliance, Technology, Events, Financials)
- **Development Strategy**: Overall technical roadmap and approach
- **Journey 1 Specifications**: Complete PRD, user stories, technical specs, and database schema for Admission to Enrollment
- **Journey 2 Specifications**: Technical specs for Fee Collection & Financial Management
- **Documentation Pipeline**: Early-stage framework optimized for startup speed
- **Development Readiness Checklist**: Lean startup-focused checklist for MVP development
- **Figma Wireframe Guide**: Detailed wireframe creation guide for Journey 1 (2-hour design sprint)

### Active Development
**Current Focus**: Journey 1 - Admission to Enrollment

#### ✅ Admission System (COMPLETED & DEPLOYED)
- **Status**: Production-ready application running successfully
- **Backend**: http://localhost:8000 (FastAPI + SQLite)
- **Frontend**: http://localhost:5176 (React 19 + TypeScript + Material-UI)
- **Database**: Fully initialized with seed data
- **Documentation**: Complete technical guide in `admission-system/CLAUDE.md`
- **User journey**: Application → Document Upload → Review → Test/Interview → Decision → Fee Payment → Enrollment
- **Features**: User registration, 5-step application wizard, document upload, admin workflows, status tracking

#### Next Immediate Steps
1. ~~Complete Journey 1 development~~ ✅ Admission system operational
2. Test all user workflows (parent registration, application submission, admin review)
3. Begin Journey 2: Fee Collection & Financial Management integration
4. Connect admission system to fee payment workflow
5. Plan broader ERP/SIS/LMS integration strategy

## Documentation Framework

### Early-Stage Pipeline (5 Documents)
Optimized for startup speed while preventing major development mistakes:

1. **User Research & Vision** (Day 1)
   - Customer pain points and business goals
   - Product vision and success metrics

2. **User Stories & Acceptance Criteria** (Day 2-3)
   - Sprint-ready development tasks
   - Clear definitions of done

3. **Technical Foundation** (Day 4-5)
   - Database schema and API endpoints
   - Technology stack decisions

4. **Wireframes & User Flow** (Week 2, Day 1-3)
   - Simple wireframes and user journey flows
   - Key screen layouts

5. **Sprint Plan & Risk Assessment** (Week 2, Day 4-5)
   - Sprint breakdown and execution plan
   - Risk mitigation strategies

### Quality Gates
- **Gate 1**: Vision alignment (Day 3) - 30-min team sync
- **Gate 2**: Design & technical readiness (End Week 2) - 1-hour review
- **Gate 3**: Sprint ready (Start Week 3) - Quick standup

## File Structure
```
sparked/
├── CLAUDE.md                    # Main project context (this file)
│
├── docs/                        # Overall project documentation
│   ├── requirements/modules/   # 37 detailed business requirements
│   ├── development/
│   │   ├── journeys/          # Journey-specific technical specs
│   │   │   ├── journey-1-technical-spec.md
│   │   │   ├── journey-1-database-schema.sql
│   │   │   └── journey-2-technical-spec.md
│   │   ├── development-strategy-roadmap.md
│   │   └── development-readiness-checklist.md
│   ├── product/               # PRDs and user stories
│   ├── process/               # Documentation pipeline framework
│   ├── design/                # Wireframes and user flows
│   │   └── figma-wireframe-guide-journey-1.md
│   ├── api/                   # API specifications (planned)
│   └── architecture/          # System architecture docs (planned)
│
└── admission-system/           # ✅ COMPLETED & OPERATIONAL
    ├── CLAUDE.md              # Admission system context (specific)
    ├── LAUNCH_SUCCESS.md      # Launch guide and testing
    ├── PROJECT_UNDERSTANDING_GUIDE.md  # Technical documentation
    ├── backend/               # FastAPI backend
    └── frontend/web-app/      # React frontend
```

## Technology Decisions Made

### Overall Platform
- **Database**: PostgreSQL with comprehensive schema design (for production ERP/SIS/LMS)
- **Development Approach**: API-first with proper separation of concerns
- **Integration Strategy**: Real-time data sync between ERP/SIS/LMS components
- **Indian Context**: ₹ currency, GST compliance, local education board requirements

### Admission System (Implemented)
- **Backend**: FastAPI 0.104+ with SQLite (SQLAlchemy 2.0)
- **Frontend**: React 19 + TypeScript + Material-UI v7 + Vite
- **Authentication**: JWT with bcrypt password hashing
- **API Design**: RESTful with 30+ endpoints
- **File Storage**: Local filesystem (documents/uploads)

## Team Roles
- **Product Manager**: Business requirements, user stories, vision
- **Tech Lead**: Architecture, database design, technical decisions
- **UX Designer**: Wireframes, user flows, interaction design
- **Developers**: Implementation following documented specifications

## Success Metrics
- **Process Efficiency**: Reduce admission time from 3-4 weeks to 3-5 days
- **Documentation Quality**: 85% completeness before development starts
- **Development Speed**: Predictable sprint delivery with minimal rework
- **User Satisfaction**: 90%+ satisfaction with digital admission process

## Key Principles
- **User-first**: Every feature serves a real user need
- **Integration-focused**: All systems work together seamlessly
- **Quality-driven**: Proper documentation prevents expensive mistakes
- **Startup-optimized**: Lean process that maintains speed while ensuring quality

## Related Documentation

### Admission System (Journey 1)
- **admission-system/CLAUDE.md** - Admission system specific context and technical details
- **admission-system/LAUNCH_SUCCESS.md** - Launch guide, testing checklist, credentials
- **admission-system/PROJECT_UNDERSTANDING_GUIDE.md** - Comprehensive technical documentation

### Planning & Strategy
- **docs/development/development-strategy-roadmap.md** - Overall development roadmap
- **docs/development/journeys/journey-1-technical-spec.md** - Journey 1 specifications
- **docs/development/journeys/journey-2-technical-spec.md** - Journey 2 specifications
- **docs/design/figma-wireframe-guide-journey-1.md** - Wireframe design guide

---

*Last Updated: October 4, 2025*
*Current Phase: Journey 1 COMPLETED ✅ - Testing & Journey 2 Planning*