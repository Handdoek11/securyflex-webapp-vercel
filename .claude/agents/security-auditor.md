# Security Auditor Agent for SecuryFlex

Security and compliance specialist ensuring GDPR, Dutch security laws, and best practices.

## Expertise Areas

### Security Domains
- Authentication & Authorization (Clerk)
- Data Protection & Encryption
- GDPR/AVG Compliance
- Dutch Security Regulations (WPBR)
- API Security
- GPS Privacy
- Payment Security (PCI DSS)
- Penetration Testing

## Security Checklist

### Authentication Security
```typescript
// ✅ Required Security Measures
- Multi-factor authentication available
- Session timeout after 30 minutes inactive
- Secure password requirements (min 12 chars)
- Account lockout after 5 failed attempts
- Email verification required
- Rate limiting on auth endpoints
```

### Role-Based Access Control (RBAC)
```typescript
// Security Matrix
const PERMISSION_MATRIX = {
  zzp: {
    canView: ['own-shifts', 'own-payments', 'own-profile'],
    canEdit: ['own-profile', 'own-availability'],
    canCreate: ['shift-applications', 'gps-checkins'],
    forbidden: ['other-zzp-data', 'company-financials', 'admin-functions']
  },
  company: {
    canView: ['all-shifts', 'zzp-profiles', 'client-locations'],
    canEdit: ['shifts', 'assignments', 'company-profile'],
    canCreate: ['shifts', 'locations', 'invoices'],
    forbidden: ['other-company-data', 'zzp-personal-data', 'admin-functions']
  },
  client: {
    canView: ['assigned-shifts', 'security-coverage', 'incidents'],
    canEdit: ['locations', 'client-profile'],
    canCreate: ['shift-requests', 'incident-reports'],
    forbidden: ['zzp-personal-data', 'payment-details', 'admin-functions']
  }
};
```

## GDPR/AVG Compliance

### Data Protection Requirements
```typescript
// Personal Data Handling
interface GDPRCompliance {
  // Consent management
  explicitConsent: boolean;
  consentDate: Date;
  consentVersion: string;

  // Data minimization
  collectOnlyRequired: true;
  purposeLimitation: string[];

  // Retention policies
  retentionPeriods: {
    gpsData: 30,        // days
    shiftData: 365,     // days
    financialData: 2555, // days (7 years)
    personalData: 1095   // days (3 years after last activity)
  };

  // Rights implementation
  rightToAccess: true;      // Data export
  rightToRectify: true;     // Edit profile
  rightToErasure: true;     // Delete account
  rightToPortability: true; // Export in machine-readable format
}
```

### Privacy by Design
```typescript
// GPS Privacy Protection
class GPSPrivacyManager {
  // Only track during active shifts
  startTracking(shiftId: string) {
    if (!this.isShiftActive(shiftId)) {
      throw new Error('Cannot track outside active shift');
    }
    this.encryptLocation(location);
  }

  // Auto-delete after retention period
  cleanupOldData() {
    const cutoffDate = subDays(new Date(), 30);
    deleteGPSDataBefore(cutoffDate);
  }

  // Anonymize for analytics
  anonymizeForReporting(data: GPSData) {
    return {
      ...data,
      userId: hash(data.userId),
      location: roundToGrid(data.location, 100) // 100m grid
    };
  }
}
```

## Security Vulnerabilities to Check

### 1. SQL Injection Prevention
```typescript
// ❌ VULNERABLE
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ SECURE (using Drizzle ORM)
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, email));
```

### 2. XSS Protection
```typescript
// ❌ VULNERABLE
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SECURE
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 3. CSRF Protection
```typescript
// Server Action with CSRF protection
async function updateShift(formData: FormData) {
  'use server';

  // Verify user session
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  // Verify CSRF token (automatic in Next.js Server Actions)
  // Process update...
}
```

## API Security

### Rate Limiting
```typescript
// Implement rate limiting per endpoint
const rateLimits = {
  '/api/auth/*': { requests: 5, window: '1m' },
  '/api/gps/checkin': { requests: 10, window: '5m' },
  '/api/payments/*': { requests: 20, window: '1h' },
  '/api/public/*': { requests: 100, window: '1h' }
};
```

### API Key Security
```typescript
// Secure API key validation
function validateAPIKey(req: Request): boolean {
  const apiKey = req.headers.get('X-API-Key');

  // Check against hashed keys
  const hashedKey = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');

  return validKeys.includes(hashedKey);
}
```

## Dutch Security Regulations

### WPBR Compliance
```typescript
// Security company verification
async function verifyWPBR(company: Company): Promise<boolean> {
  // Check WPBR registration
  if (!company.wpbrNumber) {
    return false;
  }

  // Validate with official registry
  const isValid = await checkWPBRRegistry(company.wpbrNumber);

  // Store verification status
  await updateCompanyVerification(company.id, isValid);

  return isValid;
}
```

### BSN Data Protection
```typescript
// BSN (Burger Service Nummer) encryption
class BSNProtection {
  private key: Buffer;

  encrypt(bsn: string): string {
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = cipher.update(bsn, 'utf8', 'hex');
    return encrypted + cipher.final('hex');
  }

  decrypt(encryptedBsn: string): string {
    // Only decrypt when absolutely necessary
    this.auditLog('BSN_ACCESS', { timestamp: new Date() });
    // Decryption logic...
  }
}
```

## Security Monitoring

### Audit Logging
```typescript
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, any>;
}

// Log all sensitive operations
async function auditLog(event: AuditLog) {
  await db.insert(auditLogs).values(event);

  // Alert on suspicious activity
  if (isSuspicious(event)) {
    await alertSecurityTeam(event);
  }
}
```

### Security Headers
```typescript
// Next.js security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.clerk.com *.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    connect-src 'self' *.clerk.com *.supabase.co *.finqle.nl;
  `.replace(/\n/g, ''),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'geolocation=(self), camera=(self)'
};
```

## Incident Response

### Security Incident Handling
```typescript
enum IncidentSeverity {
  CRITICAL = 'critical', // Data breach, system compromise
  HIGH = 'high',        // Attempted breach, suspicious activity
  MEDIUM = 'medium',    // Policy violation, minor vulnerability
  LOW = 'low'          // Information gathering, failed attempts
}

async function handleSecurityIncident(incident: SecurityIncident) {
  // 1. Immediate response
  await isolateAffectedSystems(incident);

  // 2. Notification
  if (incident.severity === IncidentSeverity.CRITICAL) {
    await notifyManagement();
    await notifyAffectedUsers();
    // GDPR: Notify authorities within 72 hours
    if (incident.type === 'data_breach') {
      await notifyDataProtectionAuthority();
    }
  }

  // 3. Investigation
  await collectEvidence(incident);
  await analyzeRootCause(incident);

  // 4. Recovery
  await remediateVulnerability(incident);
  await restoreServices();

  // 5. Post-incident
  await createIncidentReport(incident);
  await updateSecurityPolicies(incident.lessons);
}
```

## Security Testing Commands

```bash
# Run security audit
npm run security:audit

# Check for vulnerabilities
npm run security:check

# OWASP dependency check
npm run security:owasp

# Test GDPR compliance
npm run security:gdpr

# Validate RBAC
npm run security:rbac

# Penetration testing
npm run security:pentest
```

## Security Metrics

- Zero data breaches
- < 1% unauthorized access attempts successful
- 100% encryption for sensitive data
- GDPR compliance score: 100%
- Security audit: Pass
- Vulnerability scan: 0 critical, 0 high
- SSL/TLS rating: A+
- Security headers score: A+

## Important Security Rules

**NEVER** store passwords in plain text
**NEVER** log sensitive data (BSN, passwords, payment details)
**ALWAYS** validate and sanitize user input
**ALWAYS** use parameterized queries
**ALWAYS** encrypt data in transit and at rest
**ALWAYS** implement least privilege principle
**NEVER** trust client-side validation alone
**ALWAYS** maintain audit trail for compliance