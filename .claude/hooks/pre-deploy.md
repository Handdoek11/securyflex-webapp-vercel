# Pre-Deploy Hook for SecuryFlex

Critical checks before deploying to production. ALL checks must pass.

## Environment Validation

### 1. Required Environment Variables
```bash
# Check all required vars are set
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ✓
CLERK_SECRET_KEY ✓
NEXT_PUBLIC_SUPABASE_URL ✓
NEXT_PUBLIC_SUPABASE_ANON_KEY ✓
SUPABASE_SERVICE_ROLE_KEY ✓
DATABASE_URL ✓
FINQLE_API_KEY ✓
FINQLE_WEBHOOK_SECRET ✓
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ✓
```

### 2. Database Readiness
```bash
# Ensure all migrations are applied
npm run db:migrate

# Verify PostGIS is enabled
SELECT PostGIS_Version();

# Check storage buckets exist
- gps-photos
- incident-photos
- certificates
- documents
```

## Security Checklist

### Critical Security Points
- [ ] No hardcoded secrets in code
- [ ] All API endpoints have authentication
- [ ] Role-based access control enforced
- [ ] GPS data encrypted in transit
- [ ] Payment webhooks use signature verification
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention via Drizzle ORM

## Performance Validation

### Build Optimization
```bash
npm run build
npm run build-stats

# Check bundle size
- Main bundle < 500KB
- First load JS < 200KB
- GPS tracking module < 50KB
```

### GPS Performance
- Check-in response < 2 seconds
- Photo upload < 5 seconds
- Location accuracy verification < 500ms

### Payment Performance
- Finqle webhook processing < 2 seconds
- Transaction creation < 1 second
- Payment status update < 500ms

## Compliance Verification

### GDPR Compliance
- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] Data retention policies active
- [ ] User data export available
- [ ] Right to deletion implemented

### Dutch Security Laws
- [ ] WPBR registration check active
- [ ] BSN data properly encrypted
- [ ] KvK verification working
- [ ] Location data retention <= 30 days

## Final Checks

### 1. Full Test Suite
```bash
npm run test:all
npm run test:e2e
```

### 2. Lighthouse Scores
- Performance > 90
- Accessibility > 95
- Best Practices > 95
- SEO > 90

### 3. Mobile Responsiveness
- [ ] GPS check-in works on mobile
- [ ] Touch targets >= 44x44px
- [ ] Offline mode functional

### 4. Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile browsers

## Rollback Plan
- Previous version tagged
- Database backup created
- Rollback script ready
- Monitoring alerts configured

## Deploy Command
```bash
# Only if all checks pass
npm run deploy:production
```

## IMPORTANT
**DO NOT DEPLOY IF ANY CHECK FAILS**

Emergency contacts:
- DevOps: [Contact]
- Security: [Contact]
- Database: [Contact]