# SecuryFlex Feature Generator

Generate a complete SecuryFlex feature with all necessary components, security checks, and role-based implementations.

## Usage

```
/securyflex-feature [feature-type] [description]
```

## Feature Types

- `shift` - Shift management features
- `gps` - GPS tracking and verification features
- `payment` - Finqle payment integration features
- `security` - Security professional management
- `incident` - Incident reporting and management
- `client` - Client portal features
- `analytics` - Reporting and analytics

## Example

```
/securyflex-feature gps "Real-time location tracking for active shifts with 30-second updates"
```

## Feature Generation Process

### 1. Analyze Requirements
Based on the feature type and description, I will:
- Identify affected user roles
- Determine security implications
- Check compliance requirements
- Plan integration points

### 2. Generate Components

#### Database Schema
```typescript
// Example: GPS tracking table
export const gpsTrackingSchema = pgTable(
  'gps_tracking',
  {
    id: serial('id').primaryKey(),
    shiftId: integer('shift_id').references(() => shiftsSchema.id),
    professionalId: integer('professional_id').references(() => professionalsSchema.id),
    latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
    longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
    accuracy: decimal('accuracy', { precision: 5, scale: 2 }),
    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
    // ... additional fields
  }
);
```

#### API Endpoints
```typescript
// app/api/securyflex/[feature]/route.ts
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { userId, sessionClaims } = auth();

  // Role-based access control
  if (!hasPermission(sessionClaims?.role, 'feature.read')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Feature implementation
}
```

#### React Components
```typescript
// features/[feature]/FeatureComponent.tsx
'use client';

import { useRole } from '@/hooks/useRole';
import { Card } from '@/components/ui/card';

export function FeatureComponent() {
  const role = useRole();

  // Role-specific UI
  if (role === 'zzp') {
    return <ZZPFeatureView />;
  }

  if (role === 'company') {
    return <CompanyFeatureView />;
  }

  // ... other roles
}
```

### 3. Security Implementation

#### GPS Privacy Protection
```typescript
// Only show precise location to authorized users
function sanitizeLocation(location: GPSPosition, userRole: string) {
  if (userRole === 'admin' || userRole === 'company') {
    return location; // Full precision
  }

  // Reduce precision for others
  return {
    latitude: Math.round(location.latitude * 100) / 100,
    longitude: Math.round(location.longitude * 100) / 100,
    accuracy: 'approximate'
  };
}
```

#### Payment Security
```typescript
// Validate Finqle webhooks
async function validateFinqleWebhook(request: Request) {
  const signature = request.headers.get('x-finqle-signature');
  const body = await request.text();

  const expectedSignature = crypto
    .createHmac('sha256', process.env.FINQLE_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new Error('Invalid webhook signature');
  }

  return JSON.parse(body);
}
```

### 4. Localization

#### Dutch (Primary)
```json
{
  "shifts": {
    "check_in": "Inchecken",
    "check_out": "Uitchecken",
    "active": "Actief",
    "location_verified": "Locatie geverifieerd",
    "outside_area": "Buiten toegestaan gebied",
    "gps_required": "GPS is vereist voor deze functie"
  }
}
```

#### English (Secondary)
```json
{
  "shifts": {
    "check_in": "Check In",
    "check_out": "Check Out",
    "active": "Active",
    "location_verified": "Location verified",
    "outside_area": "Outside permitted area",
    "gps_required": "GPS is required for this feature"
  }
}
```

### 5. Testing Strategy

#### Unit Tests
```typescript
// features/[feature]/__tests__/feature.test.ts
describe('SecuryFlex Feature', () => {
  it('should enforce role-based access', async () => {
    const zzpUser = mockUser({ role: 'zzp' });
    const result = await featureAction(zzpUser);
    expect(result).toHaveProperty('limited_access');
  });

  it('should validate GPS accuracy', () => {
    const lowAccuracy = { accuracy: 100 };
    expect(validateGPSAccuracy(lowAccuracy)).toBe(false);
  });
});
```

#### E2E Tests
```typescript
// tests/e2e/[feature].spec.ts
test('GPS check-in flow', async ({ page }) => {
  // Login as ZZP
  await loginAs(page, 'zzp@test.com');

  // Navigate to shift
  await page.goto('/dashboard/shifts/active');

  // Mock geolocation
  await page.evaluate(() => {
    navigator.geolocation.getCurrentPosition = (success) => {
      success({
        coords: {
          latitude: 52.3676,
          longitude: 4.9041,
          accuracy: 10
        }
      });
    };
  });

  // Perform check-in
  await page.click('[data-testid="check-in-button"]');

  // Verify success
  await expect(page.locator('[data-testid="check-in-success"]')).toBeVisible();
});
```

## Feature Patterns by Type

### Shift Features
- Always include start/end time validation
- Implement overlap detection
- Add cancellation policies
- Include replacement professional workflow

### GPS Features
- Implement accuracy thresholds
- Add battery optimization
- Include offline capability
- Provide fallback for GPS failure

### Payment Features
- Always use idempotency keys
- Implement retry logic
- Add refund capabilities
- Include detailed audit logs

### Security Features
- Validate all certifications
- Check expiry dates
- Implement background check status
- Add document verification

### Incident Features
- Include photo upload capability
- Add severity classification
- Implement escalation paths
- Include timestamp verification

### Analytics Features
- Implement data aggregation
- Add export capabilities
- Include date range filters
- Provide role-based metrics

## Success Metrics

Each feature should:
1. Load within 2 seconds
2. Handle offline scenarios gracefully
3. Provide clear error messages in Dutch and English
4. Include proper loading states
5. Be fully accessible (WCAG 2.1 AA)
6. Work on mobile devices
7. Include audit logging
8. Pass security review

## Output

The command will generate:
1. Database migration files
2. API route handlers
3. React components
4. Type definitions
5. Localization strings
6. Test files
7. Documentation updates

All generated code follows SecuryFlex coding standards and security requirements.