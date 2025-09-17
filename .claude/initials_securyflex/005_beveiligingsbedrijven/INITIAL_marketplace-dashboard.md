# INITIAL: Beveiligingsbedrijven Marketplace Dashboard Platform

## FEATURE:
Build a comprehensive marketplace platform for beveiligingsbedrijven to find opdrachten from bedrijven/klanten AND recruit ZZP beveiligers. The platform provides bidding on client jobs, team management, real-time monitoring, and analytics. The application must match exact wireframe specifications from `wireframes/005_beveiligingsbedrijven/` and enable security companies to operate in the 3-party marketplace ecosystem.

**Specific Requirements:**
- Desktop-first design optimized for 1024px+ width with responsive mobile support
- Navigation: 📊Dashboard, 🛒Marketplace, 👥Team Beheer, 💰Financiën
- Marketplace workflow: browse opdrachten → bid on jobs → win contracts → assign ZZP'ers
- Recruitment workflow: post vacatures → attract ZZP'ers → build team
- Real-time monitoring of active diensten with GPS tracking
- Analytics for win-rate, margins, team utilization
- Multi-tenant support for franchise/multi-location operations

## EXAMPLES:
Reference these existing patterns and implementations:

**Core Marketplace Schema:**
- `wireframes/005_beveiligingsbedrijven/01-dashboard-marketplace-overzicht.md`: Marketplace dashboard
- `wireframes/005_beveiligingsbedrijven/02-opdracht-marketplace.md`: Bidding workflow
- `wireframes/005_beveiligingsbedrijven/03-team-beheer.md`: ZZP team management
- `wireframes/005_beveiligingsbedrijven/04-actieve-diensten-monitoring.md`: Live monitoring
- `wireframes/005_beveiligingsbedrijven/05-biedingen-contracten.md`: Sales pipeline
- `wireframes/005_beveiligingsbedrijven/06-financien-dashboard.md`: Financial dashboard
- `src/models/Schema.ts` lines 168-197: Shifts schema with company relations
- `src/models/Schema.ts` lines 140-167: Organizations schema for multi-tenancy

**Organization Context Management:**
- `src/app/[locale]/(auth)/layout.tsx`: Organization context and data isolation
- `src/app/[locale]/(auth)/onboarding/organization-selection/page.tsx`: Multi-tenant setup
- `src/types/User.ts`: UserWithRelations interface for company associations

**Business Intelligence Patterns:**
- `src/hooks/useRealtimeShifts.ts`: Live shift updates for team monitoring
- Financial reporting integration with Finqle transactions
- Real-time applicant notifications and status changes

**Desktop-First UI Components:**
- `src/components/ui/`: shadcn/ui components for business interface
- Table components for applicant management with sorting/filtering
- Chart components for analytics visualization and KPI displays

## DOCUMENTATION:
**Architecture Reference:**
- `wireframes/004_bedrijven/`: Complete Company wireframe collection with all 6 pages
- `CLAUDE.md` Design system with business-focused color palette
- `SECURYFLEX_ARCHITECTURE.md`: Multi-tenant organization architecture

**Business Intelligence Requirements:**
- Recruitment funnel analytics with conversion tracking
- Financial reporting with Finqle payment integration
- Team performance metrics and client feedback systems
- Export capabilities for compliance and reporting

**Technical Specifications:**
- Next.js 15 App Router with organization context
- Supabase Row Level Security for multi-tenant data isolation
- Advanced filtering and search for large datasets
- Real-time dashboard updates for active operations

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Applicant Tracking System**: Complete workflow from job posting to hiring with interview scheduling, document management, and compliance tracking
2. **Multi-Tenant Architecture**: Organization context in all queries, proper data isolation, secure organization switching
3. **Real-time Operations**: Live team monitoring, GPS status tracking, incident alerts, payment processing updates
4. **Analytics Dashboard**: Recruitment metrics, financial reporting, team performance KPIs, client satisfaction tracking
5. **Export System**: PDF reports, Excel exports, compliance documentation, audit trails

**Common Pitfalls to Avoid:**
- Don't skip organization context validation - critical for data isolation
- Don't forget desktop-first design - companies primarily use desktop interfaces
- Don't implement without proper export functionality - required for business operations
- Don't overlook real-time team monitoring - essential for operational oversight
- Don't skip advanced filtering for large datasets

**File Structure Requirements:**
```
src/app/[locale]/(auth)/company/
├── dashboard/page.tsx          # KPI overview + real-time operations
├── jobs/                       # ATS workflow + job management
├── team/                       # Team monitoring + performance
├── analytics/                  # Business intelligence + reports
├── profile/                    # Organization settings
└── layout.tsx                  # Company navigation layout

src/components/company/
├── ATS/                        # Applicant tracking components
├── TeamMonitoring/             # Real-time team status
├── Analytics/                  # Chart and report components
├── JobManagement/              # Job posting and templates
└── OrganizationSelector.tsx    # Multi-tenant switching
```

**Performance Requirements:**
- Large dataset handling with pagination and virtual scrolling
- Real-time updates without blocking UI operations
- Export generation: <10 seconds for standard reports
- Dashboard load time: <2 seconds for critical KPIs

**Integration Dependencies:**
- ZZP application system for candidate pipeline
- Client portal integration for service delivery
- Finqle payment system for financial reporting
- GPS tracking system for team monitoring

**Security & Compliance:**
- Organization data isolation with RLS policies
- Audit trails for all business operations
- GDPR compliance for applicant data handling
- Export security with access logging

**Recommended Agent:** @business-intelligence for analytics, @security-auditor for multi-tenant compliance