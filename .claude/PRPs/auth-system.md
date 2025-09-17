# PRP: Authentication System Implementation

**Status**: Active
**Version**: 1.0.0  
**Last Updated**: 2024-12-15
**Confidence**: 9/10

## Overview
Complete authentication system for SecuryFlex with role-based access control for three user types: ZZP_BEVEILIGER, BEDRIJF, and OPDRACHTGEVER.

## Context

### Business Requirements
- Three distinct user roles with different dashboards
- ZZP beveiligers need WPBR verification
- Bedrijven need KVK validation
- Opdrachtgevers can register without verification
- Subscription management per role
- 14-day free trial for ZZP
- Email verification required

### Technical Requirements  
- NextAuth v5 with Prisma Adapter
- JWT strategy for sessions
- bcrypt for password hashing
- Role-based middleware
- CSRF protection
- Rate limiting on auth endpoints

## Implementation Steps

### Step 1: Configure NextAuth
```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [CredentialsProvider({...})],
  callbacks: {...},
  pages: {...},
  session: { strategy: 'jwt' }
})
```

**Validation**: 
- [ ] Auth configuration loads without errors
- [ ] Can import auth in other files
- [ ] Environment variables set (AUTH_SECRET)

### Step 2: Create Registration Flow
```typescript
// src/app/(auth)/register/page.tsx
// Multi-step registration:
// 1. Select user type
// 2. Enter basic info
// 3. Role-specific verification
// 4. Email confirmation
```

**Validation**:
- [ ] Form validates with Zod
- [ ] Password meets requirements (8+ chars, number, special)
- [ ] KVK validation for BEDRIJF
- [ ] WPBR upload for ZZP
- [ ] Emails are sent

### Step 3: Implement Role-Based Middleware
```typescript
// src/middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const path = request.nextUrl.pathname
  
  // Check protected routes
  if (path.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect('/auth/signin')
    
    // Role-specific redirects
    const roleRoutes = {
      'ZZP_BEVEILIGER': '/dashboard/zzp',
      'BEDRIJF': '/dashboard/bedrijf',
      'OPDRACHTGEVER': '/dashboard/opdrachtgever'
    }
    
    // Redirect to correct dashboard
    if (!path.startsWith(roleRoutes[session.user.role])) {
      return NextResponse.redirect(roleRoutes[session.user.role])
    }
  }
}
```

**Validation**:
- [ ] Unauthorized users redirected to signin
- [ ] Wrong role cannot access other dashboards
- [ ] Correct dashboard loads per role

### Step 4: Setup Login with Rate Limiting
```typescript
// src/app/api/auth/signin/route.ts
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 900, // per 15 minutes
})

export async function POST(req: Request) {
  const ip = req.ip ?? '127.0.0.1'
  
  try {
    await rateLimiter.consume(ip)
  } catch {
    return NextResponse.json(
      { error: 'Too many attempts' },
      { status: 429 }
    )
  }
  
  // Process login
}
```

**Validation**:
- [ ] After 5 failed attempts, user blocked for 15 min
- [ ] Success resets counter
- [ ] Different IPs tracked separately

### Step 5: Email Verification System
```typescript
// src/lib/email/verification.ts
import jwt from 'jsonwebtoken'

export async function sendVerificationEmail(userId: string, email: string) {
  const token = jwt.sign(
    { userId, email },
    process.env.EMAIL_SECRET!,
    { expiresIn: '24h' }
  )
  
  const url = `${process.env.APP_URL}/auth/verify?token=${token}`
  
  // Send email via provider
  await sendEmail({
    to: email,
    subject: 'Verifieer je SecuryFlex account',
    html: `Click <a href="${url}">hier</a> om je account te verifiëren`
  })
}
```

**Validation**:
- [ ] Email arrives within 1 minute
- [ ] Link works and verifies account
- [ ] Token expires after 24 hours
- [ ] Can request new verification email

### Step 6: Password Reset Flow
```typescript
// src/app/(auth)/forgot-password/page.tsx
// Flow:
// 1. Enter email
// 2. Receive reset link
// 3. Enter new password
// 4. Auto-login after reset
```

**Validation**:
- [ ] Reset email sent for existing accounts
- [ ] No info leaked for non-existent emails
- [ ] Token valid for 1 hour
- [ ] Old password no longer works after reset

### Step 7: Session Management
```typescript
// src/components/auth/session-provider.tsx
'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refresh every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}
```

**Validation**:
- [ ] Session refreshes automatically
- [ ] useSession hook works in components
- [ ] Session persists on page refresh
- [ ] Logout clears session completely

### Step 8: Role-Specific Dashboards
```typescript
// src/app/(dashboard)/dashboard/[role]/page.tsx
// Dynamic dashboard based on role
// - ZZP: Available shifts, earnings, GPS checkin
// - BEDRIJF: Team management, shift creation
// - OPDRACHTGEVER: Service requests, monitoring
```

**Validation**:
- [ ] Each role sees correct dashboard
- [ ] Features limited by permissions
- [ ] Navigation reflects user role
- [ ] Subscription status shown

## Testing Checklist

### Unit Tests
```typescript
// __tests__/auth.test.ts
describe('Authentication', () => {
  test('successful login returns session')
  test('invalid credentials rejected')
  test('rate limiting blocks after 5 attempts')
  test('email verification works')
  test('password reset flow completes')
  test('role-based access enforced')
})
```

### E2E Tests
```typescript
// cypress/e2e/auth.cy.ts
describe('Auth Flow', () => {
  it('completes ZZP registration')
  it('completes BEDRIJF registration with KVK')
  it('blocks unauthorized dashboard access')
  it('redirects after login based on role')
})
```

### Security Tests
- [ ] SQL injection attempts blocked
- [ ] XSS in forms prevented
- [ ] CSRF tokens validated
- [ ] Sessions expire properly
- [ ] Passwords hashed with bcrypt
- [ ] No sensitive data in JWT

## Error Handling

### Common Errors & Solutions
1. **"Invalid credentials"**: Check email/password
2. **"Account not verified"**: Send verification email
3. **"Too many attempts"**: Wait 15 minutes
4. **"Session expired"**: Re-login required
5. **"Insufficient permissions"**: Wrong user role

### Monitoring
- Track failed login attempts
- Monitor session duration
- Alert on suspicious activity
- Log role-based access violations

## Success Criteria
- [ ] All three user types can register
- [ ] Login works with rate limiting
- [ ] Sessions persist correctly
- [ ] Role-based access enforced
- [ ] Email verification functional
- [ ] Password reset works
- [ ] No security vulnerabilities
- [ ] Mobile responsive
- [ ] <2s login time
- [ ] 100% test coverage on auth

## Dependencies
- next-auth@5.0.0-beta.29
- @auth/prisma-adapter@^2.10.0
- bcryptjs@^3.0.2
- jsonwebtoken@^9.0.2
- rate-limiter-flexible@^7.3.1
- zod@^4.1.8

## References
- [NextAuth v5 Docs](https://authjs.dev)
- [Example: role-based-auth.tsx](../../examples/auth/role-based-auth.tsx)
- [Example: session-management.ts](../../examples/auth/session-management.ts)
- [Example: secure-api-route.ts](../../examples/auth/secure-api-route.ts)

## Notes
- WPBR verification currently manual - automate in v2
- Consider OAuth providers (Google/Microsoft) in future
- Biometric auth for mobile app planned
- 2FA implementation scheduled for Q2