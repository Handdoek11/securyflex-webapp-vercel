# INITIAL: Error Handling & Recovery System

## FEATURE:
Implement a comprehensive error handling system for SecuryFlex with standardized error codes, user-friendly Dutch/English messages, automatic recovery patterns, and structured logging. The system must handle GPS failures, payment errors, network issues, and security violations gracefully while maintaining audit trails for compliance and providing clear feedback to users across all three user types.

**Specific Requirements:**
- Standardized error code system with categories (AUTH, GPS, PAY, NET, SEC)
- Bilingual error messages (Dutch primary, English fallback)
- Automatic retry logic with exponential backoff
- User-friendly error displays with actionable recovery steps
- Structured logging with Sentry integration
- Offline error queue for sync when connected
- WPBR compliance error reporting

## EXAMPLES:
Reference these existing patterns and implementations:

**Error Code Structure:**
```typescript
// Error categories and codes
enum ErrorCategory {
  AUTH = 'AUTH',  // Authentication/Authorization
  GPS = 'GPS',    // Location services
  PAY = 'PAY',    // Payment processing
  NET = 'NET',    // Network/Connectivity
  SEC = 'SEC',    // Security violations
  BIZ = 'BIZ',    // Business logic
  VAL = 'VAL',    // Validation errors
}

// Example error codes
AUTH001: 'Invalid credentials'
GPS001: 'Location accuracy insufficient (<50m required)'
PAY001: 'Payment processing failed - retry in 24h'
NET001: 'No internet connection - offline mode active'
SEC001: 'Multi-tenant violation detected'
```

**Error Response Format:**
```typescript
interface ErrorResponse {
  code: string;           // e.g., 'GPS001'
  message: string;        // User-friendly Dutch message
  messageEn?: string;     // English fallback
  details?: any;          // Technical details for debugging
  recovery?: string[];    // Steps user can take
  retry?: boolean;        // If automatic retry is possible
  severity: 'info' | 'warning' | 'error' | 'critical';
}
```

**Recovery Patterns:**
- GPS failures: Fallback to manual address entry
- Payment failures: Queue for 24-hour retry
- Network failures: Offline mode with sync queue
- Auth failures: Refresh token or re-login flow

## DOCUMENTATION:
**Error Handling Architecture:**
- Centralized error boundary components
- Global error interceptor for API calls
- Structured logging with correlation IDs
- Error analytics dashboard in Sentry
- Compliance reporting for WPBR

**Dutch Error Messages:**
```typescript
const errorMessages = {
  GPS001: {
    nl: 'GPS locatie niet nauwkeurig genoeg. Minimaal 50m vereist.',
    en: 'GPS location not accurate enough. Minimum 50m required.',
    recovery: [
      'Ga naar een open ruimte',
      'Controleer GPS instellingen',
      'Probeer opnieuw over 10 seconden'
    ]
  },
  PAY001: {
    nl: 'Betaling mislukt. Automatische herpoging binnen 24 uur.',
    en: 'Payment failed. Automatic retry within 24 hours.',
    recovery: [
      'Controleer betaalgegevens',
      'Neem contact op met Finqle support'
    ]
  }
}
```

**Logging Standards:**
- Error level: ERROR, WARN, INFO, DEBUG
- Required fields: userId, organizationId, timestamp, errorCode
- Sensitive data masking (BSN, payment details)
- Retention: 30 days for errors, 7 days for debug

## OTHER CONSIDERATIONS:

**Critical Error Scenarios:**
1. **GPS Check-in Failures**: Manual override option for managers, photo evidence required, audit trail
2. **Payment Processing Errors**: Automatic retry queue, notification system, dispute handling
3. **Multi-tenant Violations**: Immediate logout, security alert, investigation trigger
4. **Offline Sync Conflicts**: Conflict resolution UI, server authority, user notification
5. **Authentication Failures**: Token refresh, session management, organization context preservation

**Error Monitoring Dashboard:**
```typescript
// Sentry configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Mask sensitive data
    return maskSensitiveData(event);
  },
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres(),
  ]
});
```

**User Experience Patterns:**
- Toast notifications for non-blocking errors
- Modal dialogs for critical errors requiring action
- Inline validation for form errors
- Status indicators for degraded services
- Fallback UI for component failures

**Common Pitfalls to Avoid:**
- Don't expose technical details to end users
- Don't log sensitive data (passwords, BSN, payment)
- Don't ignore offline scenarios
- Don't skip error recovery paths
- Don't forget Dutch translations

**Mobile-Specific Error Handling:**
```typescript
// GPS permission denied
if (error.code === 'GPS_PERMISSION_DENIED') {
  showInstructionsForSettings();
  offerManualCheckIn();
}

// Camera access failed
if (error.code === 'CAMERA_PERMISSION_DENIED') {
  allowFileUpload();
  notifyManagerForOverride();
}
```

**Business Rule Violations:**
```typescript
// Examples of business errors
BIZ001: 'Shift al ingecheckt'
BIZ002: 'Buiten werkgebied (>100m)'
BIZ003: 'Certificaat verlopen (WPBR/VCA)'
BIZ004: 'Credit limiet bereikt'
BIZ005: 'Dubbele check-in poging'
```

**API Error Interceptor:**
```typescript
// Global error handling for API calls
axios.interceptors.response.use(
  response => response,
  async error => {
    const errorResponse = parseError(error);

    if (errorResponse.retry && retryCount < 3) {
      return retryWithBackoff(error.config);
    }

    logToSentry(errorResponse);
    showUserNotification(errorResponse);

    return Promise.reject(errorResponse);
  }
);
```

**Compliance & Audit:**
- WPBR incident reporting for security errors
- Financial error tracking for payment issues
- GPS failure documentation for disputes
- Privacy violation alerts for GDPR

**Recommended Agent:** @error-handler for recovery patterns, @dutch-localizer for messages