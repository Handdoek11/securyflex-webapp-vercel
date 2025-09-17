# ND-nummer API Reference

## API Endpoints Overview

All ND-nummer API endpoints follow REST conventions and require authentication. Base URL: `/api/compliance/nd-nummer`

## Authentication

All endpoints require valid session authentication:

```typescript
// Headers required
{
  "Authorization": "Bearer <session-token>",
  "Content-Type": "application/json"
}
```

## 🔐 User Registration & Management

### POST `/api/compliance/nd-nummer/register`

Registreer een nieuw ND-nummer voor de authenticated user.

#### Request Body

```typescript
{
  ndNummer: string;           // Format: /^ND\d{6,8}$/
  vervalDatum: string;        // ISO date string
  documenten: string[];       // Array of document URLs
  profileType?: "ZZP" | "BEDRIJF"; // Auto-detected if omitted
}
```

#### Example Request

```json
{
  "ndNummer": "ND1234567",
  "vervalDatum": "2024-12-31T23:59:59.000Z",
  "documenten": [
    "/uploads/nd-cert-1234567.pdf",
    "/uploads/id-copy-1234567.jpg"
  ]
}
```

#### Response

```typescript
// Success (201)
{
  success: true;
  data: {
    id: string;
    ndNummer: string;
    status: "IN_BEHANDELING";
    vervalDatum: string;
    message: string;
  }
}

// Error (400)
{
  success: false;
  error: string;
  details?: ZodError[];
}
```

### PUT `/api/compliance/nd-nummer/register`

Update bestaand ND-nummer.

#### Request Body

```typescript
{
  ndNummer?: string;          // Nieuw ND-nummer
  vervalDatum?: string;       // Nieuwe vervaldatum
  documenten?: string[];      // Nieuwe documenten
  reden: string;              // Reden voor update
}
```

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    ndNummer: string;
    status: string;
    vervalDatum: string;
    message: string;
  }
}
```

## 🔍 Validation & Status

### POST `/api/compliance/nd-nummer/validate`

Valideer ND-nummer bij Justis API.

#### Request Body

```typescript
{
  ndNummer: string;           // ND-nummer om te valideren
  forceRefresh?: boolean;     // Bypass cache
}
```

#### Example Request

```json
{
  "ndNummer": "ND1234567",
  "forceRefresh": true
}
```

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    ndNummer: string;
    status: "ACTIEF" | "VERLOPEN" | "NIET_GEREGISTREERD";
    vervalDatum: string | null;
    laatsteCheck: string;
    justisResponse: {
      valid: boolean;
      expiryDate: string;
      status: string;
    }
  }
}

// Error (400)
{
  success: false;
  error: string;
  details: {
    justisError?: string;
    retryAfter?: number;
  }
}
```

### GET `/api/compliance/nd-nummer/validate`

Haal huidige ND-nummer status op.

#### Query Parameters

```typescript
?includeDetails=boolean     // Include audit trail
&includeCompliance=boolean  // Include compliance calculation
```

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    ndNummer: string;
    status: NDNummerStatus;
    vervalDatum: string;
    dagenTotVervaldatum: number;
    complianceStatus: {
      isCompliant: boolean;
      risicoNiveau: "LAAG" | "MEDIUM" | "HOOG" | "KRITIEK";
      volgendeActie: string;
      volgendeActionDatum: string;
    }
    auditTrail?: AuditEntry[];
  }
}
```

## 📊 Monitoring & Analytics

### GET `/api/compliance/nd-nummer/monitor`

Platform monitoring voor administrators.

#### Query Parameters

```typescript
?view=string                // "platform" | "user" | "team"
&timeframe=string          // "day" | "week" | "month" | "year"
&status=string             // Filter by status
&riskLevel=string          // Filter by risk level
```

#### Admin Response (Platform View)

```typescript
// Success (200)
{
  success: true;
  data: {
    statistics: {
      totalUsers: number;
      statusDistribution: {
        ACTIEF: number;
        VERLOPEN: number;
        VERLOOPT_BINNENKORT: number;
        NIET_GEREGISTREERD: number;
      }
      riskDistribution: {
        LAAG: number;
        MEDIUM: number;
        HOOG: number;
        KRITIEK: number;
      }
      verificationMetrics: {
        successRate: number;
        averageResponseTime: number;
        dailyVerifications: number;
      }
    }
    trends: {
      registrations: DailyCount[];
      expirations: DailyCount[];
      verifications: DailyCount[];
    }
    alerts: {
      expiringToday: number;
      expiringSoon: number;
      overdue: number;
    }
  }
}
```

#### User Response

```typescript
// Success (200)
{
  success: true;
  data: {
    userCompliance: {
      ndNummer: string;
      status: NDNummerStatus;
      dagenTotVervaldatum: number;
      complianceScore: number;
    }
    notifications: NotificationSummary[];
    recentActivity: ActivityEntry[];
  }
}
```

## 🔔 Notifications

### GET `/api/compliance/nd-nummer/notifications`

Haal notification geschiedenis op.

#### Query Parameters

```typescript
?type=string               // Notification type filter
&status=string             // "sent" | "delivered" | "failed"
&limit=number              // Pagination limit
&offset=number             // Pagination offset
```

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    notifications: {
      id: string;
      type: NotificationType;
      title: string;
      message: string;
      channels: string[];     // ["email", "sms", "push", "in-app"]
      status: "sent" | "delivered" | "failed";
      sentAt: string;
      deliveredAt: string | null;
      metadata: Record<string, any>;
    }[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    }
  }
}
```

### POST `/api/compliance/nd-nummer/notifications`

Verstuur manual notification (admin only).

#### Request Body

```typescript
{
  type: NotificationType;
  recipients?: string[];     // User IDs, empty = all eligible users
  customMessage?: string;    // Override default template
  channels?: string[];       // Override default channels
  scheduling?: {
    sendAt: string;          // ISO date for scheduled sending
    timezone: string;
  }
}
```

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    notificationId: string;
    recipientCount: number;
    estimatedDelivery: string;
    channels: string[];
  }
}
```

## 🔍 Audit Trail

### GET `/api/compliance/nd-nummer/audit`

Haal audit logs op (admin only).

#### Query Parameters

```typescript
?userId=string             // Filter by user
&action=string             // Filter by action type
&startDate=string          // ISO date
&endDate=string            // ISO date
&limit=number              // Pagination
&offset=number             // Pagination
```

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    auditLogs: {
      id: string;
      userId: string;
      profileType: "ZZP" | "BEDRIJF";
      action: NDNummerAction;
      oldValue: string | null;
      newValue: string | null;
      timestamp: string;
      ipAddress: string;
      userAgent: string;
      details: Record<string, any>;
    }[];
    pagination: PaginationInfo;
  }
}
```

## 📈 Advanced Analytics

### GET `/api/compliance/nd-nummer/analytics`

Gedetailleerde analytics (admin only).

#### Query Parameters

```typescript
?metric=string             // "compliance" | "performance" | "usage"
&groupBy=string            // "day" | "week" | "month" | "userType"
&timeframe=string          // Time period
&format=string             // "json" | "csv" | "excel"
```

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    metrics: {
      complianceRate: TimeSeries[];
      verificationSuccessRate: TimeSeries[];
      averageResponseTime: TimeSeries[];
      userGrowth: TimeSeries[];
    }
    insights: {
      trending: string;
      recommendations: string[];
      risksIdentified: RiskAssessment[];
    }
    export?: {
      downloadUrl: string;
      expiresAt: string;
    }
  }
}
```

## 🚨 Emergency Operations

### POST `/api/compliance/nd-nummer/emergency/override`

Emergency status override (super admin only).

#### Request Body

```typescript
{
  userId: string;
  newStatus: NDNummerStatus;
  reason: string;
  duration?: number;         // Hours, max 720 (30 days)
  notifyUser?: boolean;
}
```

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    overrideId: string;
    userId: string;
    newStatus: NDNummerStatus;
    expiresAt: string;
    auditEntry: string;
  }
}
```

### POST `/api/compliance/nd-nummer/emergency/bulk-notify`

Emergency bulk notification.

#### Request Body

```typescript
{
  userIds: string[];
  message: string;
  channels: string[];
  priority: "low" | "medium" | "high" | "critical";
}
```

## 🔧 System Configuration

### GET `/api/compliance/nd-nummer/config`

Haal system configuratie op (admin only).

#### Response

```typescript
// Success (200)
{
  success: true;
  data: {
    validation: {
      ndNummerRegex: string;
      requiredDocuments: number;
      maxFileSize: number;
      allowedFileTypes: string[];
    }
    notifications: {
      warningDays: number[];
      retryAttempts: number;
      rateLimits: Record<string, number>;
    }
    justisApi: {
      baseUrl: string;
      timeout: number;
      rateLimitPerHour: number;
      retryPolicy: RetryConfig;
    }
    automation: {
      dailyScanTime: string;
      batchSize: number;
      maxRetries: number;
    }
  }
}
```

### PUT `/api/compliance/nd-nummer/config`

Update system configuratie (super admin only).

#### Request Body

```typescript
{
  validation?: ValidationConfig;
  notifications?: NotificationConfig;
  justisApi?: JustisApiConfig;
  automation?: AutomationConfig;
}
```

## 📝 Type Definitions

### Common Types

```typescript
enum NDNummerStatus {
  ACTIEF = "ACTIEF",
  VERLOPEN = "VERLOPEN",
  VERLOOPT_BINNENKORT = "VERLOOPT_BINNENKORT",
  NIET_GEREGISTREERD = "NIET_GEREGISTREERD",
  IN_BEHANDELING = "IN_BEHANDELING"
}

enum NDNummerAction {
  REGISTRATIE = "REGISTRATIE",
  UPDATE = "UPDATE",
  VERIFICATIE = "VERIFICATIE",
  STATUS_WIJZIGING = "STATUS_WIJZIGING",
  DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD",
  NOTIFICATIE_VERZONDEN = "NOTIFICATIE_VERZONDEN",
  ADMIN_OVERRIDE = "ADMIN_OVERRIDE"
}

enum NotificationType {
  EXPIRY_90_DAYS = "EXPIRY_90_DAYS",
  EXPIRY_60_DAYS = "EXPIRY_60_DAYS",
  EXPIRY_30_DAYS = "EXPIRY_30_DAYS",
  EXPIRY_WARNING = "EXPIRY_WARNING",
  EXPIRED = "EXPIRED",
  VERIFICATION_REQUIRED = "VERIFICATION_REQUIRED",
  INVALID_STATUS = "INVALID_STATUS",
  REGISTRATION_REMINDER = "REGISTRATION_REMINDER"
}

interface TimeSeries {
  date: string;
  value: number;
  metadata?: Record<string, any>;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

## 🚦 Rate Limits

| Endpoint | Rate Limit | Notes |
|----------|------------|-------|
| POST /validate | 10/min per user | Justis API throttling |
| POST /register | 5/hour per user | Prevent spam |
| GET /monitor | 60/hour | Analytics heavy |
| POST /notifications | 100/hour admin | Bulk operations |
| GET /audit | 30/min admin | Large datasets |

## 🔒 Security Considerations

### Data Protection

- All ND-nummer data encrypted at rest
- PII anonymized in logs
- GDPR compliant data handling
- Automatic data retention cleanup

### API Security

- Rate limiting per endpoint
- IP whitelisting for admin endpoints
- Audit logging for all operations
- Session validation on every request

### Error Handling

```typescript
// Standard error response
{
  success: false;
  error: string;           // User-friendly message
  code?: string;           // Error code for client handling
  details?: any;           // Additional error context
  retryAfter?: number;     // Seconds to wait before retry
}
```

## 📋 Examples

### Complete Registration Flow

```typescript
// 1. Register ND-nummer
const registration = await fetch('/api/compliance/nd-nummer/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ndNummer: 'ND1234567',
    vervalDatum: '2024-12-31T23:59:59.000Z',
    documenten: ['/uploads/cert.pdf']
  })
});

// 2. Check validation status
const status = await fetch('/api/compliance/nd-nummer/validate?includeCompliance=true');

// 3. Monitor compliance
const monitoring = await fetch('/api/compliance/nd-nummer/monitor?view=user');
```

### Admin Monitoring Setup

```typescript
// Get platform statistics
const stats = await fetch('/api/compliance/nd-nummer/monitor?view=platform&timeframe=month');

// Send bulk notification
const notification = await fetch('/api/compliance/nd-nummer/notifications', {
  method: 'POST',
  body: JSON.stringify({
    type: 'EXPIRY_30_DAYS',
    customMessage: 'Urgent: Vernieuw uw ND-nummer binnen 30 dagen'
  })
});

// Review audit trail
const audit = await fetch('/api/compliance/nd-nummer/audit?startDate=2024-01-01&action=REGISTRATIE');
```

---

*Voor meer voorbeelden en integration guides, zie de [Technical Documentation](./README.md).*