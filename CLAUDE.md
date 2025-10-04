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

### Active Development Planning
**Current Focus**: Journey 1 - Admission to Enrollment
- User journey: Application → Document Upload → Review → Test/Interview → Decision → Fee Payment → Enrollment
- Documentation status: 85% complete (wireframes guide ready, missing only API specs)
- Database schema: Complete PostgreSQL design with user management, academic structure, and admission workflow
- Development readiness: Ready for MVP development start
- Wireframe guide: Completed with time-boxed design approach

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
docs/
├── requirements/modules/        # 37 detailed business requirements
├── development/
│   ├── journeys/               # Journey-specific technical specs
│   │   ├── journey-1-technical-spec.md
│   │   ├── journey-1-database-schema.sql
│   │   └── journey-2-technical-spec.md
│   ├── development-strategy-roadmap.md
│   └── development-readiness-checklist.md
├── product/                     # PRDs and user stories
├── process/                     # Documentation pipeline framework
├── templates/                   # Standardized document templates (empty - lean approach)
├── design/                      # Wireframes and user flows
│   └── figma-wireframe-guide-journey-1.md
├── api/                         # API specifications (planned)
└── architecture/                # System architecture docs (planned)
```

## Technology Decisions Made
- **Database**: PostgreSQL with comprehensive schema design
- **Development Approach**: API-first with proper separation of concerns
- **Integration Strategy**: Real-time data sync between ERP/SIS/LMS components
- **Indian Context**: ₹ currency, GST compliance, local education board requirements

## Next Immediate Steps
1. ~~Complete Journey 1 wireframes and user flows~~ ✅ Wireframe guide completed
2. Define API specifications for admission system (1-2 hours)
3. Set up development environment and tech stack
4. Start Sprint 1 development with user registration & basic admission form
5. Create basic wireframes using the completed Figma guide

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

---

*Last Updated: October 4, 2025*
*Current Phase: Journey 1 Development Ready - MVP Start*