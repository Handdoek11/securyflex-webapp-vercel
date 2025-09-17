# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
SecuryFlex is a three-sided marketplace connecting security guards (ZZP Beveiligers), security companies (Beveiligingsbedrijven), and clients (Opdrachtgevers) who need security services. Built with Next.js 15, TypeScript, Prisma ORM, Supabase for real-time features, and Finqle for payment processing.

## Development Commands

```bash
# Install dependencies (prefer pnpm)
pnpm install

# Run development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Code quality
pnpm lint     # Run Biome linter
pnpm format   # Format code with Biome

# Testing
pnpm test                     # Run unit tests with Vitest
pnpm test:watch              # Run tests in watch mode
pnpm test:integration        # Run integration tests
pnpm test:e2e                # Run E2E tests with Playwright
pnpm test:all                # Run all test suites

# Database management
npx prisma generate      # Generate Prisma client after schema changes
npx prisma db push       # Push schema changes (development)
npx prisma migrate dev   # Create and run migrations (needs DIRECT_URL)
npx prisma studio        # Open database GUI

# Component management
npx shadcn@latest add [component]  # Add shadcn/ui components

# Kill stuck processes (Windows)
taskkill /F /IM node.exe  # If EPERM errors occur with Prisma
```

## Critical Architecture Patterns

### Multi-Role Opdracht System
The opdracht (assignment) flow is the core of the platform with flexible creator tracking:

```prisma
model Opdracht {
  creatorType       CreatorType      // OPDRACHTGEVER | BEDRIJF
  creatorId         String           // Polymorphic reference
  targetAudience    TargetAudience   // ALLEEN_BEDRIJVEN | ALLEEN_ZZP | BEIDEN | EIGEN_TEAM
  directZZPAllowed  Boolean          // Can ZZP apply directly

  // Optional relations based on creator
  opdrachtgeverId   String?          // If created by Opdrachtgever
  creatorBedrijfId  String?          // If created by Bedrijf
  acceptedBedrijfId String?          // Bedrijf that accepted
}
```

**Key Understanding**: Both Opdrachtgevers AND Beveiligingsbedrijven can create opdrachten. Bedrijven have 3 modes:
- **Leverancier**: Accept external opdrachten
- **Opdrachtgever**: Create opdrachten for others
- **Werkgever**: Create internal team assignments

### API Pattern Consolidation
All opdracht operations go through `/api/opdrachten/*` endpoints:
- `GET /api/opdrachten` - Intelligent filtering based on user role
- `POST /api/opdrachten` - Auto-detects creator type
- `/api/opdrachten/[id]/solliciteer` - Unified application endpoint

Legacy `/api/jobs/*` endpoints are being phased out but still exist for compatibility.

#### Role-Specific API Endpoints
Each user role has dedicated API endpoints:

**Opdrachtgever (Client) APIs:**
- `/api/opdrachtgever/dashboard/stats` - Dashboard statistics
- `/api/opdrachtgever/shifts` - CRUD operations for shifts
- `/api/opdrachtgever/beveiligers` - Browse security guard pool
- `/api/opdrachtgever/notifications` - Client-specific notifications

**Bedrijf (Security Company) APIs:**
- `/api/bedrijf/team` - Team member management
- `/api/bedrijf/dashboard` - Company dashboard data
- `/api/bedrijf/opdrachten` - Company assignment management

**ZZP (Freelancer) APIs:**
- `/api/zzp/dashboard` - Freelancer dashboard
- `/api/zzp/opdrachten` - Available assignments
- `/api/zzp/werkuren` - Time tracking

### Real-time Broadcast Architecture
Server-side broadcasts (`/lib/supabase/broadcast.ts`) emit events on mutations:
```typescript
// In API routes after mutations:
await broadcastOpdrachtEvent(BroadcastEvent.OPDRACHT_CREATED, opdracht);

// Client-side listeners:
const { lastMessage } = useOpdrachtBroadcast(opdrachtId, (payload) => {
  // Handle real-time update
});
```

Broadcast channels follow pattern: `{entity}:{id}:{sub-resource}`
- `opdracht:123` - All updates for opdracht 123
- `bedrijf:456:team` - Team updates for bedrijf 456
- `opdrachtgever:789` - All updates for opdrachtgever
- `user:789:notifications` - User-specific notifications

**Available Broadcast Events:**
- Opdracht: CREATED, UPDATED, DELETED, STATUS_CHANGED
- Sollicitatie: CREATED, ACCEPTED, REJECTED, WITHDRAWN
- Team: MEMBER_ASSIGNED, MEMBER_REMOVED, INVITATION_SENT
- Werkuur: CLOCKIN, CLOCKOUT, UPDATED
- Payment: INITIATED, COMPLETED, FAILED
- Notification: NEW, READ
- Message: SENT, READ
- Verzekering: AANVRAAG_CREATED, OFFERTE_RECEIVED, ACTIVATED

### Data Fetching Pattern
Use `useApiData` hooks instead of direct fetch calls:
```typescript
// Generic hook with fallback
const { data, loading, error, refetch } = useApiData({
  endpoint: "/api/bedrijf/team",
  fallbackData: mockData,
  requireAuth: true,
  refreshInterval: 60000  // Auto-refresh every minute
});

// Specialized hooks for each role
const { data } = useOpdrachtgeverStats();        // Client stats
const { data } = useOpdrachtgeverShifts();       // Client shifts
const { data } = useOpdrachtgeverBeveiligers();  // Security guard pool
const { data } = useTeamMembers();               // Company team
const { data } = useOpdrachten(view: "team");    // Filtered assignments
```

### Finqle Payment Integration
Webhook handlers at `/api/webhooks/finqle` process 15+ event types:
- Payment lifecycle (initiated → completed/failed)
- KYC verification status
- Weekly batch payouts
- Direct payment approvals

Each webhook updates database AND broadcasts real-time events.

### Database Connection Strategy
- **`DATABASE_URL`**: Pooled connection via PgBouncer for queries
- **`DIRECT_URL`**: Direct connection for migrations only
- Migrations may fail with pooled connection - use `DIRECT_URL` or Supabase SQL Editor

### Environment Configuration
Type-safe env vars via `@t3-oss/env-nextjs` in `/lib/env.ts`:
- Required server vars are validated at build time
- Client vars must start with `NEXT_PUBLIC_`
- Missing required vars will fail the build

## Project Structure Highlights

### Key Directories
- `/src/app/api/*` - API routes (App Router style)
- `/src/app/dashboard/*` - Role-specific dashboards
- `/src/components/dashboard/*` - Dashboard UI components
- `/src/hooks/*` - Custom React hooks (real-time, data fetching)
- `/src/lib/supabase/*` - Supabase utilities and broadcast system
- `/src/lib/finqle/*` - Payment integration
- `/src/lib/validation/*` - Zod schemas for validation
- `/src/lib/mockData/*` - Development fallback data
- `/prisma/schema.prisma` - Single source of truth for data model

### Authentication Flow
NextAuth 5.0 beta with Prisma adapter:
1. User authenticates → creates base User record
2. Post-auth redirect to role selection
3. Role selection creates profile (ZZPProfile/BedrijfProfile/Opdrachtgever)
4. Session includes user.id and user.role

### Component Patterns
- Use shadcn/ui components from `/src/components/ui/*`
- Dashboard layouts in `/src/components/dashboard/*Layout.tsx`
- Real-time components subscribe to broadcasts in useEffect
- Forms use react-hook-form with zod validation
- Responsive design with `useResponsive` hook

### Profile Reference Patterns
Database relations use consistent naming:
- User has `opdrachtgever` relation (NOT `opdrachtgeverProfile`)
- User has `zzpProfile` relation
- User has `bedrijfProfile` relation

Always check Prisma schema for exact relation names when querying.

## Common Development Scenarios

### Adding New API Endpoint
1. Create route in `/src/app/api/[resource]/route.ts`
2. Add broadcast events after mutations
3. Create corresponding hook in `/src/hooks/useApiData.ts`
4. Update types if needed
5. Add mock data fallback for development

### Modifying Database Schema
1. Edit `/prisma/schema.prisma`
2. Run `npx prisma generate` to update client
3. Run `npx prisma db push` for development
4. Test with `npx prisma studio`
5. Update validation schemas in `/src/lib/validation/schemas.ts`

### Adding Real-time Feature
1. Define broadcast event in `/lib/supabase/broadcast.ts`
2. Emit event in relevant API route after mutation
3. Create/update hook in `/src/hooks/useRealtimeBroadcast.ts`
4. Use hook in component with proper cleanup

Example:
```typescript
// API route
await broadcastOpdrachtEvent(BroadcastEvent.OPDRACHT_UPDATED, opdracht);

// Component
useOpdrachtBroadcast(opdrachtId, (payload) => {
  if (payload.event === BroadcastEvent.OPDRACHT_UPDATED) {
    refetch(); // Refresh data
  }
});
```

### Implementing CRUD Operations
1. Create API routes with proper error handling
2. Add real-time broadcasts for each operation
3. Create mutation hooks in `useApiData.ts`
4. Handle loading states and errors in UI
5. Test with mock data first, then real database

### Debugging Real-time Issues
- Check Supabase dashboard for active connections
- Verify RLS policies allow subscription
- Check browser console for WebSocket errors
- Use `console.log` in broadcast callbacks
- Verify channel names match exactly

## Testing Strategy

### Unit Tests (Vitest)
- Component tests in `*.test.tsx` files
- Hook tests in `/src/hooks/*.test.ts`
- Utility tests in `/src/lib/*.test.ts`

### Integration Tests
- API route tests in `/src/test/integration/*`
- Database interaction tests
- Real-time broadcast tests

### E2E Tests (Playwright)
- User flow tests in `/tests/e2e/*`
- Cross-browser testing
- Mobile responsive tests

## Performance Considerations

### Data Fetching
- Use `refreshInterval` for periodic updates
- Implement optimistic updates for better UX
- Cache API responses with `fallbackData`
- Use parallel fetching with multiple hooks

### Real-time Updates
- Limit broadcast channels to reduce WebSocket overhead
- Batch updates when possible
- Clean up subscriptions on unmount
- Use debouncing for frequent updates

## Security Best Practices

### API Routes
- Always validate session with `getServerSession`
- Check user roles and permissions
- Validate input with Zod schemas
- Sanitize database queries

### Environment Variables
- Never commit `.env` files
- Use `.env.example` for documentation
- Validate all env vars at build time
- Keep sensitive keys server-side only

## Platform-Specific Notes

### Windows Development
- Use `taskkill /F /IM node.exe` if Prisma generate fails with EPERM
- Prefer PowerShell or Git Bash over CMD
- File paths in imports use forward slashes
- Line endings: Configure Git to use LF

### Port Configuration
- Default: http://localhost:3000
- If occupied, Next.js will try 3001, 3002, etc.
- Update NEXTAUTH_URL if using different port

## Common Gotchas and Solutions

### Prisma Relations
- Profile relations: `user.opdrachtgever` NOT `user.opdrachtgeverProfile`
- Always check schema.prisma for exact names
- Use `include` or `select` for nested data

### TypeScript Errors
- Run `npx prisma generate` after schema changes
- Check for missing type imports
- Use type assertions sparingly

### Real-time Not Working
- Check Supabase connection limits
- Verify WebSocket is not blocked
- Ensure proper cleanup in useEffect
- Check browser dev tools Network tab

### Build Failures
- Missing environment variables
- Type errors in API routes
- Import path issues (use @/ alias)
- Prisma client not generated

## Workflow Tips

### Before Starting Work
1. Run `pnpm install` to ensure dependencies
2. Check `.env` has all required variables
3. Run `npx prisma generate` for latest schema
4. Start dev server with `pnpm dev`

### During Development
1. Use mock data for rapid iteration
2. Test real-time features in multiple tabs
3. Check console for warnings/errors
4. Run linter frequently: `pnpm lint`

### Before Committing
1. Run `pnpm test:all` for full test suite
2. Check `pnpm lint` passes
3. Verify no console.log statements
4. Test in production mode: `pnpm build && pnpm start`