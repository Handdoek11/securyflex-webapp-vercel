# INITIAL: Complete ZZP Freelancer Mobile Application

## FEATURE:
Build a complete mobile-first Progressive Web Application for ZZP (Zelfstandige Zonder Personeel) security professionals with GPS check-in capabilities, real-time job matching, shift management, and 24-hour payment tracking. The app must match exact wireframe specifications from `docs/WIREFRAMES.md` Section 2 with 5 fully functional pages: Dashboard, Jobs, Schedule, Chat, and Profile.

**Specific Requirements:**
- Mobile-first design optimized for 375px width with bottom navigation
- GPS check-in with photo capture and offline capability
- Real-time messaging and job matching system
- Certificate management (WPBR, VCA, EHBO compliance)
- Dutch-first UI with complete localization
- Performance targets: GPS check-in <2s, page transitions <500ms

## EXAMPLES:
Reference these existing patterns and implementations:

**Core Implementation Patterns:**
- `wireframes/003_zzp'ers/01-dashboard-hoofdscherm.md`: Main dashboard wireframe
- `wireframes/003_zzp'ers/02-jobs-vacatures.md`: Jobs and applications wireframe
- `wireframes/003_zzp'ers/03-gps-checkin-flow.md`: GPS check-in flow wireframe
- `wireframes/003_zzp'ers/04-planning-schedule.md`: Schedule and planning wireframe
- `wireframes/003_zzp'ers/05-chat-berichten.md`: Real-time messaging wireframe
- `wireframes/003_zzp'ers/06-profiel.md`: Profile and settings wireframe
- `src/models/Schema.ts` lines 199-222: GPS check-ins schema with PostGIS integration
- `src/hooks/useRealtimeShifts.ts`: Live shift status and payment tracking patterns

**Mobile PWA Foundation:**
- `src/app/[locale]/(auth)/layout.tsx`: Role-based routing for ZZP users
- `src/components/ui/`: shadcn/ui components for touch-friendly design
- GPS verification patterns with photo compression to 1920x1080

**Design System Integration:**
- `CLAUDE.md` VERPLICHT colors: Primary #1e3a8a, Secondary #3b82f6, Success #10b981
- Mobile-first patterns with 44px minimum touch targets
- Bottom navigation with active state indicators

## DOCUMENTATION:
**Architecture Reference:**
- `wireframes/003_zzp'ers/`: Complete ZZP wireframe collection with all 6 pages
- `CLAUDE.md` Mobile Performance Targets and design system requirements
- `frontend/CLAUDE.md` PWA implementation and offline capabilities

**Technical Specifications:**
- Next.js 15 App Router with PWA service worker
- Supabase real-time subscriptions for live updates
- Finqle payment integration for 24-hour guarantee tracking
- Google Maps API for GPS verification within 50-100m radius

**Security Industry Requirements:**
- WPBR compliance for security industry regulations
- Certificate validation and expiry tracking
- CAO labor law compliance for work hours

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **GPS Check-in System**: Offline-capable with photo required for check-in, PostGIS radius validation, automatic sync when online
2. **Bottom Navigation**: 5 tabs (🏠Home, 💼Jobs, 📅Planning, 💬Chat, 👤Profiel) visible across all pages
3. **Real-time Features**: Live job updates, payment status, messaging with <100ms delivery
4. **PWA Requirements**: Service worker, install prompt, background sync, push notifications

**Common Pitfalls to Avoid:**
- Don't create desktop-first layouts - mobile 375px baseline required
- Don't skip photo compression for GPS check-ins (essential for performance)
- Don't implement without offline GPS capability
- Don't use touch targets smaller than 44px
- Don't forget Dutch-first localization with security terminology

**Performance Critical Elements:**
- GPS location acquisition: <5 seconds
- Job search results: <1 second loading
- Photo upload: <5 seconds after compression
- Schedule calendar: <1 second rendering
- Real-time message delivery: <100ms latency

**File Structure Requirements:**
```
src/app/[locale]/(auth)/zzp/
├── dashboard/page.tsx           # KPI cards + notification feed
├── jobs/                        # Search, filter, apply to shifts
├── schedule/page.tsx            # Calendar with GPS check-ins
├── chat/                        # Real-time messaging
├── profile/                     # Certificates + settings
└── layout.tsx                   # Bottom navigation layout

src/components/zzp/
├── BottomNavigation.tsx         # Touch-friendly 5-tab nav
├── GPSCheckInButton.tsx         # Offline GPS with photo
├── JobCard.tsx                  # Swipeable job listings
└── CertificateCard.tsx          # WPBR/VCA/EHBO display
```

**Integration Dependencies:**
- Company dashboard integration for job applications
- Client dashboard integration for service delivery
- Finqle payment system for 24-hour guarantee
- Supabase real-time for live updates across all features

**Recommended Agent:** @mobile-optimizer for PWA features, @gps-engineer for location verification