# INITIAL: Core Infrastructure & Foundation

## FEATURE:
Establish the complete core infrastructure for SecuryFlex platform including authentication system, database operations, real-time subscriptions, API foundation, and multi-tenant organization support. This forms the foundation that all user-specific applications (ZZP, Company, Client) will build upon, ensuring consistent data handling, security, and performance across the entire platform.

**Specific Requirements:**
- Complete authentication flow with Clerk integration and role-based routing
- Supabase database connection with Drizzle ORM and PostGIS for GPS functionality
- Real-time subscription infrastructure for live updates across all user types
- RESTful API foundation with proper error handling and validation
- Multi-tenant organization support with data isolation
- Performance monitoring and logging integration (Sentry, Better Stack)

## EXAMPLES:
Reference these existing patterns and implementations:

**Authentication Foundation:**
- `src/app/[locale]/(auth)/layout.tsx`: Role-based routing logic and organization context
- `src/app/[locale]/(auth)/onboarding/organization-selection/page.tsx`: Multi-tenant onboarding pattern

**Database Schema Reference:**
- `src/models/Schema.ts`: Complete database schema with all relationships
  - Lines 27-28: User roles enum (company, client, zzp)
  - Lines 140-167: Organizations schema for multi-tenancy
  - Lines 199-222: GPS check-ins with PostGIS integration
  - Lines 251-273: Finqle transactions schema

**API Patterns:**
- Next.js 15 API routes with proper error handling
- Supabase client configuration with Row Level Security (RLS)
- Real-time subscription patterns for live data updates

**Configuration Files:**
- Environment variables setup for all integrations
- Database migration patterns with Drizzle ORM

## DOCUMENTATION:
**Architecture Reference:**
- `SECURYFLEX_ARCHITECTURE.md`: Complete system architecture overview
- `CLAUDE.md` Development Commands: Database operations and environment setup

**Integration Specifications:**
- Clerk documentation for authentication and organization support
- Supabase documentation for real-time subscriptions and PostGIS
- Drizzle ORM documentation for type-safe database operations
- Finqle API documentation for payment integration preparation

**Performance Requirements:**
- Database queries: <100ms for simple operations
- Real-time event delivery: <50ms latency
- API response time: <200ms (95th percentile)
- Authentication verification: <500ms

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Database Foundation**: PostGIS extension setup, spatial indexing for GPS queries, proper RLS policies for multi-tenancy
2. **Authentication Flow**: Complete role-based routing, organization context management, session handling
3. **Real-time Infrastructure**: Supabase real-time subscriptions for shifts, GPS, payments, messaging
4. **API Architecture**: Consistent error handling, request validation, rate limiting, logging

**Common Pitfalls to Avoid:**
- Don't skip PostGIS spatial indexing - critical for GPS performance
- Don't forget Row Level Security policies - essential for multi-tenancy
- Don't overlook environment variable validation
- Don't implement without proper error handling and logging
- Don't skip performance monitoring setup

**Security Considerations:**
- Multi-tenant data isolation with proper RLS policies
- Environment variable security and rotation
- API rate limiting and abuse prevention
- Secure file upload handling

**Dependencies:**
- All environment variables must be configured
- Database schema must be applied
- PostGIS extension must be enabled
- Monitoring services must be configured

**Foundation for Future Features:**
- ZZP mobile application (GPS tracking, shift management)
- Company dashboard (team management, analytics)
- Client portal (service booking, monitoring)
- Payment processing (Finqle integration)

**Performance Targets:**
- Database connection pool: <20 concurrent connections
- Real-time subscription latency: <50ms
- API endpoint response: <200ms average
- File upload processing: <5 seconds

**Recommended Agent:** @database-expert for schema optimization, @security-auditor for compliance