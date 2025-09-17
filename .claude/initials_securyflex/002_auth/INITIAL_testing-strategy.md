# INITIAL: Comprehensive Testing Strategy & Implementation

## FEATURE:
Establish a complete testing strategy for SecuryFlex platform covering unit tests, integration tests, E2E tests, and performance testing. The strategy must ensure 80% code coverage minimum, validate all critical business flows (GPS check-in, payment processing, multi-tenant isolation), and support TDD/BDD development practices with Dutch language test descriptions for business stakeholder clarity.

**Specific Requirements:**
- Unit testing with Vitest for all business logic and utilities
- Integration testing with React Testing Library for component interactions
- E2E testing with Playwright for critical user journeys
- Performance testing for GPS operations and payment processing
- Accessibility testing for WCAG 2.1 AA compliance
- Security testing for authentication and multi-tenant isolation
- Mobile testing on real devices for GPS and camera features

## EXAMPLES:
Reference these existing patterns and implementations:

**Test File Structure:**
```
src/
├── __tests__/              # Global test utilities
│   ├── setup.ts           # Test environment setup
│   ├── mocks/             # Shared mocks
│   └── fixtures/          # Test data fixtures
├── lib/gps/
│   ├── location.ts
│   └── location.test.ts   # Unit tests alongside source
├── components/gps/
│   ├── GPSCheckIn.tsx
│   └── GPSCheckIn.test.tsx # Component tests
└── app/[locale]/(auth)/
    └── __tests__/         # Page-level integration tests
```

**Critical Test Scenarios:**
- GPS check-in within 50m radius validation
- 24-hour payment processing workflow
- Multi-tenant data isolation verification
- Offline capability with sync testing
- Real-time subscription event testing

**Performance Benchmarks:**
- GPS check-in: <2 seconds (including photo)
- Payment webhook: <2 seconds processing
- Dashboard load: <3 seconds on 3G
- API responses: <200ms average

## DOCUMENTATION:
**Testing Standards:**
- Vitest configuration with coverage reporting
- React Testing Library best practices
- Playwright E2E test organization
- Performance testing with Lighthouse CI
- Security testing with OWASP guidelines

**Test Coverage Requirements:**
- Overall: 80% minimum
- Critical paths: 95% (GPS, payments, auth)
- API endpoints: 100%
- Utility functions: 90%
- UI components: 70%

**Dutch Language Support:**
- Test descriptions in Dutch for business stakeholders
- Error messages testing in Dutch/English
- Locale-specific formatting tests

## OTHER CONSIDERATIONS:

**Critical Test Suites:**
1. **Authentication & Authorization**: Role-based access, organization switching, session management
2. **GPS & Location Services**: Accuracy validation, offline capability, photo evidence
3. **Payment Processing**: Calculation accuracy, webhook handling, dispute resolution
4. **Multi-tenant Isolation**: Data separation, organization context, RLS policies
5. **Real-time Features**: WebSocket events, live updates, subscription management

**Test Data Management:**
- Seed data for consistent testing
- Factory patterns for test object creation
- Database cleanup between tests
- Mock external services (Finqle, Google Maps)

**CI/CD Integration:**
```yaml
# GitHub Actions workflow
test:
  - npm run test:unit        # Fast feedback
  - npm run test:integration # Component validation
  - npm run test:e2e        # Critical paths only
  - npm run test:coverage   # Coverage reporting
```

**Mobile Device Testing:**
- GPS permission flows on iOS/Android
- Camera integration testing
- Background location tracking
- Offline mode verification
- Battery optimization validation

**Common Pitfalls to Avoid:**
- Don't skip GPS accuracy tests - critical for business
- Don't mock Supabase RLS - test actual policies
- Don't forget Dutch language in test cases
- Don't skip mobile device testing
- Don't ignore flaky test investigation

**Test Naming Conventions:**
```typescript
describe('GPS Check-in Service', () => {
  it('should validate location within 50m radius', () => {})
  it('should require photo for check-in but not check-out', () => {})
  it('should handle offline check-in with sync', () => {})
})

// Dutch for business-critical tests
describe('Betaling Verwerking', () => {
  it('moet binnen 24 uur betalen aan ZZP', () => {})
  it('moet webhook binnen 2 seconden verwerken', () => {})
})
```

**Performance Testing Targets:**
- Lighthouse Performance Score: >90
- First Contentful Paint: <1.8s
- Time to Interactive: <3.5s
- GPS Lock Time: <5 seconds
- API p95 latency: <500ms

**Security Testing Requirements:**
- SQL injection prevention
- XSS protection validation
- CSRF token verification
- Rate limiting effectiveness
- Multi-tenant isolation verification

**Recommended Agent:** @test-engineer for test strategy, @performance-optimizer for benchmarks