# Clerk Authentication Integration Context

## Overview
Clerk provides authentication and user management for SecuryFlex with 4 distinct user roles.

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## User Roles

### Role Definitions
```typescript
export enum UserRole {
  ADMIN = 'admin',
  COMPANY = 'company',    // Security companies
  CLIENT = 'client',      // Clients needing security
  ZZP = 'zzp'            // Freelance professionals
}
```

### Role Metadata
```typescript
// Store in Clerk user metadata
interface UserMetadata {
  role: UserRole;
  organizationId?: string;
  professionalId?: number;
  onboardingCompleted: boolean;
}
```

## Authentication Flow

### Sign Up Process
```typescript
// 1. Create Clerk user
const user = await clerk.users.createUser({
  emailAddress: email,
  password: password,
  publicMetadata: {
    role: selectedRole
  }
});

// 2. Create database record
await db.insert(users).values({
  id: user.id,
  email: email,
  role: selectedRole,
  createdAt: new Date()
});

// 3. Handle role-specific setup
switch (selectedRole) {
  case 'zzp':
    await createSecurityProfessional(user.id);
    break;
  case 'company':
  case 'client':
    await createOrganization(user.id, orgData);
    break;
}
```

### Sign In Flow
```typescript
// app/[locale]/(auth)/(center)/sign-in/[[...sign-in]]/page.tsx
<SignIn
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "shadow-none"
    }
  }}
  afterSignInUrl="/dashboard"
/>
```

## Middleware Protection

### Auth Middleware
```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/webhooks/(.*)'
  ],
  ignoredRoutes: [
    '/api/public/(.*)'
  ],
  afterAuth(auth, req) {
    // Redirect to onboarding if needed
    if (auth.userId && !auth.sessionClaims?.onboardingCompleted) {
      const onboardingUrl = new URL('/onboarding', req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // Role-based redirects
    if (auth.userId && req.nextUrl.pathname === '/dashboard') {
      const role = auth.sessionClaims?.role;
      const roleUrl = new URL(`/dashboard/${role}`, req.url);
      return NextResponse.redirect(roleUrl);
    }
  }
});
```

## Server-Side Authentication

### Get Current User
```typescript
import { auth } from '@clerk/nextjs';

export async function getCurrentUser() {
  const { userId } = auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user[0];
}
```

### Role Checking
```typescript
import { currentUser } from '@clerk/nextjs';

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const userRole = user.publicMetadata.role as UserRole;

  if (!allowedRoles.includes(userRole)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}
```

## Client-Side Hooks

### User Hook
```typescript
import { useUser } from '@clerk/nextjs';

export function Dashboard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loading />;
  }

  const role = user?.publicMetadata?.role;

  return (
    <div>
      Welcome {user?.firstName}!
      Your role: {role}
    </div>
  );
}
```

### Auth Hook
```typescript
import { useAuth } from '@clerk/nextjs';

export function SecureComponent() {
  const { isSignedIn, userId, getToken } = useAuth();

  const fetchData = async () => {
    const token = await getToken();

    const response = await fetch('/api/secure', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };
}
```

## Organization Management

### Create Organization
```typescript
import { organizations } from '@clerk/nextjs';

// Create company/client organization
const org = await organizations.createOrganization({
  name: companyName,
  slug: companySlug,
  publicMetadata: {
    type: 'security_company',
    wpbrNumber: wpbrNumber,
    kvkNumber: kvkNumber
  }
});

// Add user to organization
await organizations.addMember({
  organizationId: org.id,
  userId: userId,
  role: 'admin'
});
```

### Organization Context
```typescript
import { useOrganization } from '@clerk/nextjs';

export function OrgDashboard() {
  const { organization, membership } = useOrganization();

  return (
    <div>
      Organization: {organization?.name}
      Your role: {membership?.role}
    </div>
  );
}
```

## Session Management

### Session Claims
```typescript
// Customize session claims
export default {
  async afterAuth(auth, req) {
    const { userId, sessionClaims } = auth;

    if (userId) {
      // Add custom claims
      const user = await getUser(userId);
      sessionClaims.role = user.role;
      sessionClaims.organizationId = user.organizationId;
      sessionClaims.permissions = getRolePermissions(user.role);
    }

    return NextResponse.next();
  }
};
```

### Session Refresh
```typescript
import { useClerk } from '@clerk/nextjs';

export function RefreshSession() {
  const { session } = useClerk();

  const refreshSession = async () => {
    await session?.reload();
  };
}
```

## Webhooks

### User Events
```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';

export async function POST(request: Request) {
  const payload = await request.json();
  const headers = request.headers;

  // Verify webhook
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const evt = wh.verify(payload, headers);

  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data);
      break;
    case 'user.updated':
      await handleUserUpdated(evt.data);
      break;
    case 'user.deleted':
      await handleUserDeleted(evt.data);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

## Security Features

### MFA Setup
```typescript
// Force MFA for sensitive roles
if (role === 'admin' || role === 'company') {
  await clerk.users.updateUser(userId, {
    totpEnabled: true,
    backupCodeEnabled: true
  });
}
```

### Session Security
```typescript
// Set strict session settings
const sessionConfig = {
  sessionMaxAge: 30 * 60 * 1000, // 30 minutes
  sessionInactivityTimeout: 15 * 60 * 1000, // 15 minutes
  sessionSingleSignOut: true
};
```

## Testing

### Mock Clerk
```typescript
// Mock for testing
export const mockClerk = {
  auth: () => ({
    userId: 'test_user_123',
    sessionId: 'test_session_456'
  }),
  currentUser: () => ({
    id: 'test_user_123',
    emailAddress: 'test@securyflex.nl',
    publicMetadata: { role: 'zzp' }
  })
};
```

## Common Patterns

### Protected API Route
```typescript
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Your logic here
}
```

### Role-Based UI
```typescript
import { useUser } from '@clerk/nextjs';

export function Navigation() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role;

  return (
    <nav>
      {role === 'zzp' && <Link href="/shifts">My Shifts</Link>}
      {role === 'company' && <Link href="/manage">Manage</Link>}
      {role === 'client' && <Link href="/locations">Locations</Link>}
      {role === 'admin' && <Link href="/admin">Admin</Link>}
    </nav>
  );
}
```