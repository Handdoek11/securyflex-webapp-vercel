# Testing Strategy Context Bundle

## Overview
Comprehensive testing approach covering unit, integration, E2E, and specialized tests for GPS and payments.

## Testing Stack

### Frameworks
- **Unit Testing**: Vitest
- **E2E Testing**: Playwright
- **API Testing**: Supertest
- **Component Testing**: React Testing Library
- **Performance**: Lighthouse CI
- **Accessibility**: axe-core

## Test Structure

```
frontend-app/
├── __tests__/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── e2e/           # End-to-end tests
│   └── fixtures/      # Test data
├── scripts/
│   ├── validate-gps.ts
│   └── validate-payments.ts
```

## Coverage Requirements

### Minimum Targets
- Overall: 80%
- Critical paths: 100%
- GPS features: 90%
- Payment logic: 100%
- Authentication: 95%
- API endpoints: 85%

## Unit Testing Patterns

### GPS Validation Test
```typescript
import { describe, it, expect } from 'vitest';
import { validateCheckIn } from '@/libs/GPS';

describe('GPS Check-in', () => {
  it('should validate location within radius', async () => {
    const result = await validateCheckIn({
      lat: 52.3676,
      lng: 4.9041,
      shiftId: 123,
      accuracy: 25
    });

    expect(result.isValid).toBe(true);
    expect(result.distance).toBeLessThan(100);
  });

  it('should reject location outside radius', async () => {
    const result = await validateCheckIn({
      lat: 52.3776,
      lng: 4.9141,
      shiftId: 123,
      accuracy: 25
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('OUTSIDE_RADIUS');
  });
});
```

### Payment Calculation Test
```typescript
describe('Payment Calculations', () => {
  it('should calculate VAT correctly', () => {
    const payment = calculatePayment({
      hours: 8,
      hourlyRate: 25,
      directPayment: true
    });

    expect(payment.base).toBe(20000); // €200 in cents
    expect(payment.vat).toBe(4200);    // 21% VAT
    expect(payment.total).toBe(24200);
  });

  it('should apply factoring fee', () => {
    const payment = calculatePayment({
      hours: 8,
      hourlyRate: 25,
      directPayment: false
    });

    expect(payment.factorFee).toBe(500); // 2.5%
    expect(payment.total).toBe(23700);   // Base - fee + VAT
  });
});
```

## E2E Test Scenarios

### Critical User Flows
```typescript
// ZZP Complete Shift Flow
test('ZZP completes shift lifecycle', async ({ page }) => {
  // Login
  await loginAsZZP(page);

  // Browse shifts
  await page.goto('/zzp/browse');
  await expect(page.locator('.shift-card')).toBeVisible();

  // Apply for shift
  await page.click('[data-testid="apply-shift"]');
  await expect(page.locator('.toast')).toContainText('Sollicitatie verstuurd');

  // Check-in with GPS
  await page.goto('/zzp/shifts/active');
  await page.click('[data-testid="start-checkin"]');
  await page.click('[data-testid="allow-gps"]');
  await page.click('[data-testid="take-photo"]');
  await page.click('[data-testid="confirm-checkin"]');

  // Verify check-in
  await expect(page.locator('.checkin-success')).toBeVisible();
});
```

## API Testing

### Authentication Tests
```typescript
describe('API Authentication', () => {
  it('should reject unauthorized requests', async () => {
    const response = await request(app)
      .get('/api/shifts')
      .expect(401);

    expect(response.body.error).toBe('Unauthorized');
  });

  it('should validate role permissions', async () => {
    const token = await getZZPToken();

    const response = await request(app)
      .delete('/api/shifts/123')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });
});
```

## Performance Testing

### Load Test Configuration
```javascript
// k6 load test
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};
```

## Test Data Management

### Seeding Strategy
```typescript
// Test data factory
export const createTestShift = (overrides = {}) => ({
  id: faker.number.int(),
  companyId: 'org_test_company',
  clientId: 'org_test_client',
  locationId: 1,
  startDatetime: faker.date.future(),
  endDatetime: faker.date.future(),
  hourlyRate: faker.number.float({ min: 20, max: 50 }),
  status: 'published',
  ...overrides
});
```

### Database Reset
```bash
# Reset test database
npm run db:test:reset

# Seed test data
npm run db:test:seed
```

## Mocking Strategies

### External Services
```typescript
// Mock Finqle API
vi.mock('@/libs/Finqle', () => ({
  createBillingRequest: vi.fn().mockResolvedValue({
    id: 'billing_123',
    status: 'pending'
  }),
  getBillingStatus: vi.fn().mockResolvedValue({
    status: 'paid',
    paidAt: new Date()
  })
}));

// Mock GPS
vi.mock('@/libs/GPS', () => ({
  getCurrentPosition: vi.fn().mockResolvedValue({
    coords: {
      latitude: 52.3676,
      longitude: 4.9041,
      accuracy: 25
    }
  })
}));
```

## Security Testing

### OWASP Checks
```typescript
describe('Security', () => {
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";

    const response = await request(app)
      .post('/api/search')
      .send({ query: maliciousInput })
      .expect(200);

    // Should sanitize input, not execute SQL
    expect(response.body.results).toEqual([]);
  });

  it('should prevent XSS', async () => {
    const xssPayload = '<script>alert("XSS")</script>';

    const response = await request(app)
      .post('/api/profile')
      .send({ bio: xssPayload });

    // Should escape HTML
    expect(response.body.bio).not.toContain('<script>');
  });
});
```

## Accessibility Testing

```typescript
describe('Accessibility', () => {
  it('should meet WCAG standards', async () => {
    const results = await axe(page);
    expect(results.violations).toHaveLength(0);
  });

  it('should be keyboard navigable', async () => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeDefined();
  });
});
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:coverage
```

## Test Commands

```bash
# Run all tests
npm test

# Specific test suites
npm run test:unit
npm run test:e2e
npm run test:api

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Validation scripts
npm run validate:gps
npm run validate:payments
npm run validate:rbac
```

## Debugging Tests

### VS Code Launch Config
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:debug"],
  "console": "integratedTerminal"
}
```