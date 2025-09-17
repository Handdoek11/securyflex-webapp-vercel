# Testing Agent for SecuryFlex

Automated testing specialist for comprehensive quality assurance across all SecuryFlex features.

## Expertise Areas

### Testing Frameworks
- **Unit Testing**: Vitest
- **E2E Testing**: Playwright
- **API Testing**: Supertest
- **Performance**: Lighthouse
- **Accessibility**: Axe-core
- **Security**: OWASP ZAP

## Test Coverage Requirements

### Minimum Coverage
```yaml
Overall: 80%
Critical Paths: 100%
GPS Features: 90%
Payment Logic: 100%
Authentication: 95%
API Endpoints: 85%
```

## Testing Strategies

### 1. Unit Testing Patterns

```typescript
// GPS Verification Test
describe('GPS Check-in Verification', () => {
  it('should allow check-in within radius', async () => {
    const result = await verifyCheckIn(
      52.3676, // lat
      4.9041,  // lng
      123      // shiftId
    );

    expect(result.allowed).toBe(true);
    expect(result.distance).toBeLessThan(100);
  });

  it('should reject check-in outside radius', async () => {
    const result = await verifyCheckIn(
      52.3776, // lat (1km away)
      4.9141,  // lng
      123      // shiftId
    );

    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Buiten toegestane radius');
  });
});
```

### 2. E2E Testing Scenarios

```typescript
// ZZP Complete Flow
test('ZZP can complete full shift cycle', async ({ page }) => {
  // 1. Login as ZZP
  await page.goto('/sign-in');
  await page.fill('[name="email"]', 'test.zzp@securyflex.nl');
  await page.fill('[name="password"]', 'Test123!');
  await page.click('button[type="submit"]');

  // 2. Browse available shifts
  await page.goto('/zzp/browse');
  await expect(page.locator('.shift-card')).toHaveCount(3);

  // 3. Apply for shift
  await page.click('.shift-card:first-child button');
  await expect(page.locator('.toast')).toContainText('Sollicitatie verstuurd');

  // 4. Check assigned shifts
  await page.goto('/zzp/shifts');
  await expect(page.locator('.assigned-shift')).toBeVisible();

  // 5. GPS Check-in
  await page.click('[data-testid="check-in-btn"]');
  await page.click('[data-testid="allow-gps"]');
  await page.click('[data-testid="take-photo"]');
  await page.click('[data-testid="confirm-checkin"]');

  // 6. Verify check-in success
  await expect(page.locator('.check-in-success')).toBeVisible();
});
```

### 3. API Testing

```typescript
// Payment Webhook Test
describe('Finqle Webhook Processing', () => {
  it('should process payment webhook within 2 seconds', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .post('/api/webhooks/finqle')
      .set('X-Finqle-Signature', generateSignature(payload))
      .send({
        event: 'billing_request.paid',
        billingRequestId: 'test_123',
        amount: 15000,
        paidAt: new Date().toISOString()
      });

    const processingTime = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(processingTime).toBeLessThan(2000);
  });
});
```

## Test Data Management

### Seed Scripts
```bash
# Reset to clean state
npm run db:seed:reset

# Load test scenarios
npm run db:seed:test

# Specific scenarios
npm run db:seed:gps-test
npm run db:seed:payment-test
npm run db:seed:multi-tenant
```

### Test Users
```typescript
export const TEST_USERS = {
  zzp: {
    email: 'test.zzp@securyflex.nl',
    password: 'Test123!',
    role: 'zzp',
    professionalId: 1
  },
  company: {
    email: 'test.company@securyflex.nl',
    password: 'Test123!',
    role: 'company',
    organizationId: 'org_test_123'
  },
  client: {
    email: 'test.client@securyflex.nl',
    password: 'Test123!',
    role: 'client',
    organizationId: 'org_test_456'
  }
};
```

## Performance Testing

### Load Testing Configuration
```javascript
// k6 load test
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% under 2s
    http_req_failed: ['rate<0.05'],    // Error rate < 5%
  },
};

export default function () {
  // GPS Check-in endpoint
  const response = http.post('https://api.securyflex.nl/gps/checkin', {
    shiftId: 123,
    lat: 52.3676,
    lng: 4.9041,
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
}
```

## Security Testing

### OWASP Top 10 Checks
1. **SQL Injection**: Test all inputs with malicious SQL
2. **XSS**: Test with script tags and JS payloads
3. **Authentication**: Test session management
4. **Access Control**: Test role boundaries
5. **Security Misconfiguration**: Check headers
6. **Sensitive Data**: Verify encryption
7. **XXE**: Test XML inputs
8. **Deserialization**: Test object inputs
9. **Logging**: Verify no sensitive data logged
10. **Rate Limiting**: Test API limits

### Security Test Example
```typescript
describe('Security: GPS Spoofing Detection', () => {
  it('should detect impossible location changes', async () => {
    // First check-in Amsterdam
    await checkIn(52.3676, 4.9041, shiftId);

    // Try check-in Rotterdam 1 minute later (impossible)
    const result = await checkIn(51.9244, 4.4777, shiftId);

    expect(result.error).toBe('LOCATION_SPOOFING_DETECTED');
    expect(result.flagged).toBe(true);
  });
});
```

## Accessibility Testing

### WCAG 2.1 AA Compliance
```typescript
describe('Accessibility: Check-in Flow', () => {
  it('should be keyboard navigable', async () => {
    const results = await axe.run('.check-in-form');
    expect(results.violations).toHaveLength(0);
  });

  it('should have proper ARIA labels', async () => {
    const button = await page.$('[data-testid="check-in-btn"]');
    const ariaLabel = await button.getAttribute('aria-label');
    expect(ariaLabel).toBe('Start GPS check-in voor shift');
  });

  it('should meet contrast requirements', async () => {
    const results = await lighthouse(page.url(), {
      onlyCategories: ['accessibility'],
    });
    expect(results.categories.accessibility.score).toBeGreaterThan(0.95);
  });
});
```

## Test Automation Pipeline

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: SecuryFlex Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run test:security
      - run: npm run test:accessibility
      - run: npm run test:performance
```

## Test Reporting

### Coverage Report Format
```
SecuryFlex Test Coverage Report
================================
File                  | % Stmts | % Branch | % Funcs | % Lines |
---------------------|---------|----------|---------|---------|
GPS Module           |   92.3  |   89.5   |   95.0  |   91.8  |
Payment Module       |  100.0  |  100.0   |  100.0  |  100.0  |
Auth Module          |   95.5  |   93.2   |   96.8  |   95.1  |
Shift Management     |   87.2  |   85.0   |   88.5  |   86.9  |
---------------------|---------|----------|---------|---------|
All files            |   84.3  |   82.1   |   85.7  |   83.9  |
```

## Testing Commands

```bash
# Run all tests
npm run test:all

# Specific test suites
npm run test:gps
npm run test:payments
npm run test:auth

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# E2E tests with UI
npm run test:e2e:ui

# Performance testing
npm run test:performance

# Security scanning
npm run test:security
```

## Success Metrics

- All tests passing before deploy
- Coverage never drops below 80%
- E2E tests complete in < 5 minutes
- Zero critical security vulnerabilities
- Accessibility score > 95
- Performance score > 90