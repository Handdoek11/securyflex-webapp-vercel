# INITIAL: DevOps Pipeline & Infrastructure

## FEATURE:
Establish a complete DevOps pipeline for SecuryFlex with automated CI/CD, multi-environment management (dev/staging/prod), infrastructure as code, monitoring/alerting, and zero-downtime deployments. The pipeline must support rapid iteration while maintaining security compliance, performance SLAs (99.9% uptime), and automatic rollback capabilities for failed deployments.

**Specific Requirements:**
- GitHub Actions CI/CD pipeline with automated testing and deployment
- Multi-environment setup with Vercel (frontend) and Supabase (backend)
- Infrastructure as Code using Terraform for reproducible environments
- Monitoring with Sentry, Better Stack, and Checkly
- Automatic rollback on failed health checks
- Database migration management with rollback support
- Secret management with GitHub Secrets and Vercel environment variables

## EXAMPLES:
Reference these existing patterns and implementations:

**CI/CD Pipeline Structure:**
```yaml
# .github/workflows/main.yml
name: SecuryFlex CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:coverage

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: test
    steps:
      - name: Deploy to Staging
        run: vercel --prod --env=staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    steps:
      - name: Deploy to Production
        run: vercel --prod --env=production
```

**Environment Configuration:**
```
Development:
  - URL: dev.securyflex.nl
  - Database: Supabase Dev Project
  - Features: All flags enabled

Staging:
  - URL: staging.securyflex.nl
  - Database: Supabase Staging
  - Features: Production-like

Production:
  - URL: app.securyflex.nl
  - Database: Supabase Production
  - Features: Stable only
```

**Monitoring Stack:**
- Sentry: Error tracking and performance
- Better Stack: Uptime monitoring and incidents
- Checkly: API and E2E monitoring
- Vercel Analytics: Web vitals and performance

## DOCUMENTATION:
**Infrastructure Architecture:**
- Vercel Edge Functions for API routes
- Supabase for database and real-time
- Cloudflare for CDN and DDoS protection
- GitHub Actions for CI/CD
- Terraform for infrastructure management

**Deployment Strategy:**
- Blue-green deployments for zero downtime
- Canary releases for gradual rollout
- Feature flags with LaunchDarkly
- Automatic rollback on error rate spike

**Database Migration Process:**
```bash
# Migration workflow
npm run db:generate  # Create migration
npm run db:migrate   # Apply to staging
npm run db:verify    # Run tests
npm run db:deploy    # Apply to production
```

**Performance Monitoring:**
- Core Web Vitals tracking
- API response time monitoring
- Database query performance
- Real-time subscription latency

## OTHER CONSIDERATIONS:

**Critical Deployment Checks:**
1. **Pre-deployment**: Unit tests, integration tests, security scan, dependency audit
2. **Deployment**: Database migration, environment variables, feature flags, health checks
3. **Post-deployment**: Smoke tests, performance validation, error rate monitoring, rollback ready

**Environment Variables Management:**
```typescript
// Environment structure
interface Environment {
  // Clerk Auth
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Finqle Payments
  FINQLE_API_KEY: string;
  FINQLE_WEBHOOK_SECRET: string;

  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;

  // Monitoring
  SENTRY_DSN: string;
  LOGTAIL_SOURCE_TOKEN: string;
}
```

**Rollback Strategy:**
```yaml
rollback:
  triggers:
    - error_rate > 5%
    - response_time_p95 > 2000ms
    - health_check_fails > 3

  actions:
    - revert_deployment
    - restore_database_snapshot
    - notify_team
    - create_incident
```

**Security Scanning:**
```yaml
security:
  - npm audit
  - OWASP dependency check
  - Secret scanning
  - SAST analysis
  - Container vulnerability scan
```

**Common Pitfalls to Avoid:**
- Don't deploy without database backup
- Don't skip staging environment testing
- Don't ignore monitoring alerts
- Don't deploy during peak hours
- Don't forget to update environment variables

**Performance Budgets:**
```javascript
// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: ['/', '/dashboard', '/gps-checkin'],
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
  },
};
```

**Incident Response:**
```yaml
incident_response:
  severity_levels:
    P1: # Complete outage
      response_time: 5min
      escalation: immediate

    P2: # Major degradation
      response_time: 15min
      escalation: 30min

    P3: # Minor issues
      response_time: 1hour
      escalation: 4hours

  runbook:
    - Check deployment logs
    - Verify database status
    - Review error rates
    - Check payment processing
    - Initiate rollback if needed
```

**Monitoring Dashboards:**
- Business KPIs: Active users, GPS check-ins, payments processed
- Technical Metrics: Response times, error rates, database performance
- Infrastructure: CPU, memory, disk usage, network traffic
- Security: Failed logins, suspicious activity, rate limit violations

**Database Backup Strategy:**
- Continuous replication to standby
- Daily snapshots with 30-day retention
- Point-in-time recovery capability
- Automated backup testing

**Recommended Agent:** @devops-engineer for pipeline setup, @sre for monitoring configuration