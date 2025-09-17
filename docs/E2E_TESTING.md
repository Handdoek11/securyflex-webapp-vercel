# E2E Testing Strategy - SecuryFlex

## Overview

SecuryFlex implements comprehensive End-to-End (E2E) testing using Playwright to ensure production readiness and validate complete user workflows. The testing strategy covers the critical ZZP (security guard) user journey from registration to payment completion.

## Test Architecture

### Test Categories

1. **ZZP User Flow Tests** (`zzp-flow.spec.ts`)
   - Complete user journey testing
   - Registration and onboarding
   - Job application workflows
   - Work hours tracking with GPS
   - Payment management
   - Profile management

2. **API Integration Tests** (`api-integration.spec.ts`)
   - RESTful API endpoint validation
   - Authentication and authorization
   - Data consistency and integrity
   - Real-time functionality
   - Error handling and edge cases

3. **Accessibility Tests** (`accessibility.spec.ts`)
   - WCAG 2.1 AA compliance
   - Screen reader compatibility
   - Keyboard navigation
   - High contrast and reduced motion support

### Configuration

The E2E test suite is configured via `playwright.config.ts` with:

- **Multi-browser Testing**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Accessibility Testing**: Dedicated browser configuration with reduced motion
- **Geolocation Support**: Mock GPS coordinates for location-based features
- **Dutch Locale**: Tests run with `nl-NL` locale for proper form validation
- **Authentication State**: Persistent login states between tests

## Test Data Management

### Global Setup (`global-setup.ts`)

Before tests run:
1. **Database Cleanup**: Removes existing test data
2. **Test Data Seeding**: Creates realistic test scenarios
   - Test clients (Opdrachtgevers)
   - Test security companies (Beveiligingsbedrijven)
   - Test job postings (Opdrachten)
3. **Authentication Setup**: Pre-authenticates test users

### Test Data Structure

```typescript
// Sample test opdracht
{
  titel: 'Evenement Beveiliging - Amsterdam Arena',
  omschrijving: 'Beveiliging tijdens voetbalwedstrijd',
  locatie: 'Amsterdam',
  startDatum: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  uurloon: 18.50,
  aantalPersonen: 10,
  vereisten: ['SIA Diploma', 'Ervaring met evenementen'],
  status: 'OPEN'
}
```

### Global Teardown (`global-teardown.ts`)

After tests complete:
1. **Database Cleanup**: Removes all test data
2. **File Cleanup**: Removes authentication files and artifacts
3. **Artifact Management**: Cleans test reports and coverage data

## Key Test Scenarios

### 1. Registration and Onboarding Flow

```typescript
test('should complete ZZP registration flow', async () => {
  // Navigate to registration
  await page.goto('/auth/register')

  // Fill registration form
  await page.getByLabel(/e-mailadres/i).fill(testZZP.email)
  await page.getByLabel(/wachtwoord/i).first().fill(testZZP.password)

  // Submit and verify role selection
  await page.getByRole('button', { name: /account aanmaken/i }).click()
  await expect(page).toHaveURL(/\/auth\/role-selection/)

  // Complete ZZP profile setup
  await page.getByRole('button', { name: /zzp beveiliger/i }).click()
  // ... profile completion
})
```

### 2. Job Application Workflow

```typescript
test('should view job details and apply for job', async () => {
  await page.goto('/dashboard/zzp/jobs')

  // Click on first available job
  const firstJob = page.locator('[data-testid="job-card"]').first()
  await firstJob.click()

  // Apply with motivation
  await page.getByRole('button', { name: /solliciteren/i }).click()
  await page.getByLabel(/motivatie/i).fill('Ik ben zeer geïnteresseerd...')

  // Verify application submission
  await page.getByRole('button', { name: /sollicitatie versturen/i }).click()
  await expect(page.getByText(/sollicitatie verstuurd/i)).toBeVisible()
})
```

### 3. GPS-Based Work Hours Tracking

```typescript
test('should start and track work hours with GPS', async () => {
  // Mock geolocation
  await context.grantPermissions(['geolocation'])
  await page.addInitScript(() => {
    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
      writable: true,
      value: (success) => success({
        coords: { latitude: 52.3676, longitude: 4.9041, accuracy: 10 }
      })
    })
  })

  // Start work shift
  await page.getByRole('button', { name: /dienst starten/i }).click()
  await expect(page.getByText(/GPS locatie vastgelegd/i)).toBeVisible()
})
```

### 4. Real-time Features Testing

```typescript
test('should receive real-time notifications', async () => {
  // Mock real-time event
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('notification', {
      detail: {
        type: 'job_update',
        message: 'Je sollicitatie is geaccepteerd!',
        jobId: 'test-job-123'
      }
    }))
  })

  // Verify notification display
  await expect(page.getByText(/sollicitatie is geaccepteerd/i)).toBeVisible({ timeout: 5000 })
})
```

## API Integration Testing

### Authentication Flow Testing

```typescript
test('should register new ZZP user via API', async () => {
  const response = await apiContext.post('/api/auth/register', {
    data: {
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.password
    }
  })

  expect(response.status()).toBe(201)
  expect(data.success).toBe(true)
  expect(data.user.email).toBe(testUser.email)
})
```

### Data Consistency Validation

```typescript
test('should maintain data consistency across operations', async () => {
  // Create application via API
  const applyResponse = await apiContext.post(`/api/jobs/${jobId}/apply`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
    data: { motivation: 'Test application' }
  })

  // Fetch from different endpoint
  const fetchResponse = await apiContext.get(`/api/applications/${applicationId}`)

  // Verify consistency
  expect(fetchData.application.jobId).toBe(jobId)
  expect(fetchData.application.motivation).toBe('Test application')
})
```

## Accessibility Testing

### WCAG Compliance Validation

```typescript
test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/dashboard/zzp')

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
```

### Keyboard Navigation Testing

```typescript
test('should have proper keyboard navigation', async ({ page }) => {
  await page.goto('/auth/login')

  // Test tab sequence
  await page.keyboard.press('Tab')
  await expect(page.getByLabel(/e-mailadres/i)).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByLabel(/wachtwoord/i)).toBeFocused()

  // Test Enter submission
  await page.keyboard.press('Enter')
})
```

## Error Handling and Edge Cases

### Network Error Simulation

```typescript
test('should handle network errors gracefully', async () => {
  // Simulate offline mode
  await context.setOffline(true)
  await page.goto('/dashboard/zzp/jobs')

  // Verify offline handling
  await expect(page.getByText(/geen internetverbinding/i)).toBeVisible({ timeout: 10000 })

  // Test reconnection
  await context.setOffline(false)
  await expect(page.getByText(/verbinding hersteld/i)).toBeVisible({ timeout: 10000 })
})
```

### Form Validation Testing

```typescript
test('should validate form inputs correctly', async () => {
  await page.goto('/dashboard/zzp/profile')

  // Clear required field
  await page.getByLabel(/telefoonnummer/i).fill('')
  await page.getByRole('button', { name: /wijzigingen opslaan/i }).click()

  // Verify validation error
  await expect(page.getByText(/telefoonnummer is verplicht/i)).toBeVisible()
})
```

## Performance Testing

### Load Time Validation

```typescript
test('should load dashboard within performance budget', async ({ page }) => {
  const startTime = Date.now()
  await page.goto('/dashboard/zzp')
  await expect(page.getByText(/beschikbare opdrachten/i)).toBeVisible()

  const loadTime = Date.now() - startTime
  expect(loadTime).toBeLessThan(3000) // 3 second budget
})
```

### Large Dataset Handling

```typescript
test('should handle large job lists without performance degradation', async ({ page }) => {
  await page.goto('/dashboard/zzp/jobs')

  // Mock large dataset
  await page.evaluate(() => {
    const jobList = document.querySelector('[data-testid="job-list"]')
    for (let i = 0; i < 100; i++) {
      const jobCard = document.createElement('div')
      jobCard.setAttribute('data-testid', 'job-card')
      jobCard.textContent = `Test Job ${i}`
      jobList?.appendChild(jobCard)
    }
  })

  // Verify smooth scrolling
  await page.mouse.wheel(0, 1000)
  await expect(page.locator('[data-testid="job-card"]').last()).toBeVisible()
})
```

## Cross-Browser and Device Testing

### Browser Matrix

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome on Android, Safari on iOS
- **Accessibility**: Chrome with reduced motion preferences

### Viewport Testing

```typescript
test('should work correctly on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/dashboard/zzp')

  // Test mobile navigation
  const mobileMenu = page.getByRole('button', { name: /menu/i })
  await expect(mobileMenu).toBeVisible()
  await mobileMenu.click()

  // Verify mobile menu functionality
  await expect(page.getByRole('link', { name: /opdrachten/i })).toBeVisible()
})
```

## Running E2E Tests

### Local Development

```bash
# Install browser dependencies
npm run e2e:install

# Run all E2E tests
npm run e2e

# Run with UI (interactive mode)
npm run e2e:ui

# Debug specific test
npm run e2e:debug --grep "should complete ZZP registration"

# View test report
npm run e2e:report
```

### CI/CD Integration

```bash
# Production-like environment
npm run build
npm start &

# Run tests in headless mode
npm run e2e --forbid-only --retries=2

# Generate reports
npm run e2e:report
```

## Test Data and Environment

### Environment Variables

```bash
# Test-specific database
TEST_DATABASE_URL=postgresql://...

# Test Supabase project
TEST_SUPABASE_URL=https://test.supabase.co
TEST_SUPABASE_ANON_KEY=test_key

# Test Sentry project
TEST_SENTRY_DSN=https://test.sentry.io

# Disable rate limiting for tests
DISABLE_RATE_LIMITING=true
```

### Mock Data Strategy

1. **Realistic Data**: Use production-like data structures
2. **Dutch Locale**: KvK numbers, postal codes, phone numbers
3. **Temporal Data**: Future-dated opdrachten for application testing
4. **Complete Workflows**: End-to-end user journeys with all steps

## Debugging and Troubleshooting

### Common Issues

1. **Timeouts**: Increase timeout for slow operations
2. **Authentication**: Verify test user creation in global setup
3. **Database State**: Ensure clean state between test runs
4. **GPS Permissions**: Mock geolocation correctly
5. **Real-time Events**: Properly simulate WebSocket/SSE events

### Debug Commands

```bash
# Run single test with debugging
npx playwright test zzp-flow.spec.ts --debug

# Record test for later playback
npx playwright codegen localhost:3000

# View test trace
npx playwright show-trace trace.zip

# Check browser console
npx playwright test --headed --slowMo=1000
```

### Test Reports

- **HTML Report**: Visual test results with screenshots
- **JSON Report**: Machine-readable results for CI/CD
- **JUnit Report**: Integration with testing dashboards
- **Coverage Report**: Code coverage from E2E tests

## Future Enhancements

### Planned Additions

1. **Visual Regression Testing**: Screenshot comparison for UI changes
2. **Performance Monitoring**: Core Web Vitals tracking
3. **Security Testing**: Authentication bypass attempts
4. **Load Testing**: High concurrency user simulation
5. **Mobile App Testing**: React Native or PWA testing

### Advanced Scenarios

1. **Multi-user Workflows**: Collaborative features testing
2. **Payment Integration**: Full Finqle payment flow testing
3. **Document Upload**: File handling and validation
4. **Notification Systems**: Email and push notification testing
5. **GPS Accuracy**: Location-based feature testing with various coordinates

The E2E testing strategy ensures SecuryFlex is production-ready by validating complete user workflows, API integrity, accessibility compliance, and error handling across all supported browsers and devices.