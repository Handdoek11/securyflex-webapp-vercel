# Test Runner Hook for SecuryFlex

Automated testing that runs based on code changes and context.

## Test Strategy

### Unit Tests (Vitest)
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### E2E Tests (Playwright)
```bash
# Full E2E suite
npm run test:e2e

# Specific user role tests
npm run test:e2e:zzp
npm run test:e2e:company
npm run test:e2e:client
```

## Smart Test Selection

### GPS Feature Changes
When GPS-related files change, run:
- `validate-gps.test.ts`
- `gps-checkin.e2e.ts`
- `location-radius.test.ts`
- `offline-sync.test.ts`

### Payment Feature Changes
When payment-related files change, run:
- `finqle-integration.test.ts`
- `payment-calculation.test.ts`
- `24hour-payment.e2e.ts`
- `webhook-processing.test.ts`

### Authentication Changes
When auth-related files change, run:
- `role-based-access.test.ts`
- `organization-setup.e2e.ts`
- `clerk-integration.test.ts`
- `protected-routes.test.ts`

## Critical Test Paths

### 1. ZZP Check-in Flow
```typescript
// Must complete in < 10 seconds
1. Open shift details
2. Click "Check In"
3. Allow GPS permission
4. Take photo
5. Confirm check-in
6. Verify within radius
```

### 2. Payment Processing
```typescript
// Must process within 24 hours
1. Shift completed
2. Calculate payment
3. Send to Finqle
4. Process webhook
5. Update status
6. Notify ZZP
```

### 3. Shift Assignment
```typescript
// Must notify within 1 minute
1. Company creates shift
2. ZZP applies
3. Company assigns
4. Notifications sent
5. Calendar updated
```

## Performance Benchmarks

### Response Times
- GPS check-in: < 2s
- Photo upload: < 5s
- Payment webhook: < 2s
- Shift search: < 1s
- Dashboard load: < 3s

### Accuracy Requirements
- GPS accuracy: < 50m
- Payment calculation: 100% accurate
- Radius verification: ± 5m tolerance
- Time tracking: ± 1 minute

## Test Data Management

### Seed Data
```bash
# Reset to clean state
npm run db:seed

# Load test scenarios
npm run db:seed:scenarios
```

### Test Users
- ZZP: `test.zzp@securyflex.nl`
- Company: `test.company@securyflex.nl`
- Client: `test.client@securyflex.nl`

## Continuous Testing

### On Every Push
- Type checking
- Lint checking
- Unit tests for changed files

### On Pull Request
- Full unit test suite
- E2E critical paths
- Performance benchmarks

### Before Deploy
- Complete E2E suite
- Load testing
- Security scanning
- Accessibility testing

## Test Reports

### Coverage Requirements
- Overall: > 80%
- Critical paths: 100%
- GPS features: > 90%
- Payment logic: 100%

### Output Format
```
SecuryFlex Test Results
=======================
✅ Unit Tests: 127 passed
✅ E2E Tests: 23 passed
✅ Coverage: 84.3%
✅ Performance: All benchmarks met

GPS Features: 100% ✓
Payments: 100% ✓
Auth: 95% ✓
```

## Failure Handling

### Auto-Recovery
1. Retry flaky tests (max 3x)
2. Clear test cache
3. Reset test database
4. Restart test server

### Notifications
- Slack: #securyflex-tests
- Email: dev-team@securyflex.nl
- Dashboard: /admin/test-status

## IMPORTANT
Tests must pass before:
- Merging to main
- Deploying to staging
- Releasing to production