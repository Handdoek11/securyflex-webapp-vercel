# INITIAL: Complete Authentication System

## FEATURE:
Implement complete authentication and role-based access control system for SecuryFlex, including multi-step registration, role routing, and organization selection based on existing wireframes. The system must support 4-step registration process, Google OAuth, biometric authentication, and organization context management for multi-tenant architecture.

**Specific Requirements:**
- 4-step registration process matching wireframes Section 1.3
- Role-based routing: zzp→mobile app, company→dashboard, client→portal
- Google OAuth + biometric authentication support
- Organization selection and context management
- Terms acceptance with GDPR/AVG compliance
- Mobile-first design with 44px touch targets

## EXAMPLES:
Reference these existing patterns and implementations:

**Current Authentication Foundation:**
- `src/app/[locale]/(auth)/layout.tsx`: Existing role redirect logic and protected routes
- `src/app/[locale]/(auth)/onboarding/organization-selection/page.tsx`: Organization selection pattern

**Wireframe Specifications:**
- `wireframes/002_auth/Auth.md` sections 1.1-1.4: Complete authentication flow
  - Section 1.1: Login screen with Google/biometric options
  - Section 1.2: User type selection cards (👮 ZZP, 🏢 Company, 🔒 Client)
  - Section 1.3: 4-step progressive registration with progress bar
  - Section 1.4: Terms acceptance with scrollable content

**Database Integration:**
- `src/models/Schema.ts` lines 27-28: User roles enum (company, client, zzp)
- User profile creation patterns and organization assignment
- SecurityProfessional record creation for ZZP users

**Design System:**
- `CLAUDE.md` VERPLICHT colors: Primary #1e3a8a, Secondary #3b82f6, Success #10b981
- Mobile-first requirements with 16px font size (prevents iOS zoom)

## DOCUMENTATION:
**Primary Implementation Reference:**
- `wireframes/002_auth/Auth.md`: Complete authentication wireframes and user flows
- `CLAUDE.md` Authentication Flow section: Role redirect and organization context patterns

**Technical Architecture:**
- Clerk authentication with organization support and custom user metadata
- Next.js 15 App Router with protected route patterns
- Supabase integration for user profiles and organization management

**Performance Requirements:**
- Login completion < 2 seconds
- Registration flow completion < 30 seconds
- Organization switching < 1 second
- Biometric authentication < 1 second

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Role-Based Routing**: After authentication, redirect based on user role (zzp→/zzp/dashboard, company→/company/dashboard, client→/client/dashboard)
2. **Organization Context**: Multi-tenant organization selection for companies/clients with proper data isolation
3. **Mobile PWA**: Biometric authentication (Touch ID/Face ID), secure credential storage, offline capability
4. **GDPR Compliance**: Terms acceptance with AVG compliance, WPBR terms for security professionals

**Common Pitfalls to Avoid:**
- Don't skip organization context validation - critical for data isolation
- Don't forget biometric authentication for PWA - essential for mobile users
- Don't overlook 4-step registration progress indicators
- Don't implement without proper session management and auto-logout
- Don't skip admin detection via email domain routing

**Security Considerations:**
- Organization data isolation critical for multi-tenancy
- Admin access detection via email domain (see .admin/ADMIN_ACCESS.md)
- Session management with automatic timeout
- Authentication token security and rotation

**Dependencies:**
- Database schema must be applied first
- Clerk environment variables configured
- Organization tables must exist

**Integration Points:**
- Must integrate with all user dashboards (ZZP, Company, Client)
- Must work with organization-scoped API routes
- Must connect to landing page conversion tracking

**Performance Targets:**
- Authentication flow: <2s completion
- Mobile touch targets: 44px minimum
- Error handling: Clear feedback for all failure types
- Session persistence: Remember me functionality

**Recommended Agent:** @security-auditor for GDPR compliance, @mobile-optimizer for PWA features