# Finqle API Integration Context

## Overview
Finqle is the payment provider for SecuryFlex, enabling 24-hour automatic payments to security professionals. NOT Stripe.

## API Configuration

### Environment Variables
```bash
FINQLE_API_KEY=your_api_key
FINQLE_API_SECRET=your_api_secret
FINQLE_WEBHOOK_SECRET=your_webhook_secret
FINQLE_BASE_URL=https://api.finqle.nl/v1
```

## Authentication

### API Headers
```typescript
const headers = {
  'X-API-Key': process.env.FINQLE_API_KEY,
  'X-API-Secret': process.env.FINQLE_API_SECRET,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

## Core API Endpoints

### Create Billing Request
```typescript
POST /billing-requests

interface BillingRequest {
  amount: number; // In cents
  description: string;
  recipient: {
    iban: string;
    name: string;
    email: string;
  };
  metadata: {
    shiftId: number;
    professionalId: number;
    companyId: string;
  };
  dueDate?: string; // ISO date
  directPayment: boolean;
}

// Response
{
  id: "br_1234567890",
  status: "pending",
  amount: 24200,
  createdAt: "2024-01-01T10:00:00Z"
}
```

### Get Billing Status
```typescript
GET /billing-requests/{id}

// Response
{
  id: "br_1234567890",
  status: "paid", // pending | approved | paid | failed
  amount: 24200,
  paidAt: "2024-01-01T12:00:00Z",
  transactionId: "tx_9876543210"
}
```

### Cancel Billing Request
```typescript
DELETE /billing-requests/{id}

// Response
{
  success: true,
  message: "Billing request cancelled"
}
```

## Webhook Processing

### Webhook Events
```typescript
// Webhook payload structure
interface FinqleWebhook {
  event: 'billing_request.created' |
         'billing_request.approved' |
         'billing_request.paid' |
         'billing_request.failed';
  billingRequestId: string;
  amount: number;
  metadata: Record<string, any>;
  timestamp: string;
  signature: string;
}
```

### Webhook Handler
```typescript
// app/api/webhooks/finqle/route.ts
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('X-Finqle-Signature');

  // Verify signature
  if (!verifyWebhookSignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body) as FinqleWebhook;

  switch (event.event) {
    case 'billing_request.paid':
      await handlePaymentSuccess(event);
      break;
    case 'billing_request.failed':
      await handlePaymentFailure(event);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

### Signature Verification
```typescript
function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', process.env.FINQLE_WEBHOOK_SECRET!);
  hmac.update(body);
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Payment Calculations

### Fee Structure
```typescript
interface PaymentCalculation {
  baseAmount: number;      // Hours × hourly rate
  vat: number;             // 21% BTW
  factorFee?: number;      // 2.5% if not direct payment
  totalAmount: number;     // Final amount to pay
}

function calculatePayment(shift: Shift): PaymentCalculation {
  const baseAmount = shift.hours * shift.hourlyRate * 100; // Convert to cents
  const vat = Math.round(baseAmount * 0.21);

  let factorFee = 0;
  if (!shift.directPayment) {
    factorFee = Math.round(baseAmount * 0.025);
  }

  return {
    baseAmount,
    vat,
    factorFee,
    totalAmount: baseAmount + vat - factorFee
  };
}
```

## Invoice Generation

### Invoice Data Structure
```typescript
interface FinqleInvoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vat: number;
  }>;
  totals: {
    subtotal: number;
    vat: number;
    total: number;
  };
}
```

## Error Handling

### Common Error Codes
```typescript
enum FinqleErrorCode {
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  INVALID_IBAN = 'invalid_iban',
  DUPLICATE_REQUEST = 'duplicate_request',
  RATE_LIMIT = 'rate_limit_exceeded',
  INVALID_AMOUNT = 'invalid_amount'
}

// Error handler
async function handleFinqleError(error: FinqleError) {
  switch (error.code) {
    case FinqleErrorCode.INSUFFICIENT_FUNDS:
      await notifyCompany(error.metadata.companyId);
      break;
    case FinqleErrorCode.INVALID_IBAN:
      await notifyProfessional(error.metadata.professionalId);
      break;
  }

  // Log to monitoring
  await logError('finqle_error', error);
}
```

## Rate Limiting

```typescript
// Rate limit: 100 requests per minute
const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 100
});

// Apply before API calls
await rateLimiter.check();
```

## Testing

### Mock Finqle Client
```typescript
export const mockFinqle = {
  createBillingRequest: jest.fn().mockResolvedValue({
    id: 'br_test_123',
    status: 'pending'
  }),
  getBillingStatus: jest.fn().mockResolvedValue({
    status: 'paid',
    paidAt: new Date()
  })
};
```

### Test Webhook
```typescript
describe('Finqle Webhook', () => {
  it('should process payment within 2 seconds', async () => {
    const start = Date.now();

    await request(app)
      .post('/api/webhooks/finqle')
      .set('X-Finqle-Signature', generateTestSignature())
      .send({
        event: 'billing_request.paid',
        billingRequestId: 'br_test_123'
      });

    expect(Date.now() - start).toBeLessThan(2000);
  });
});
```

## Monitoring

### Key Metrics
- Payment processing time: < 2 seconds
- Webhook success rate: > 99.9%
- 24-hour payment SLA: 100%
- Failed payment rate: < 1%

### Health Check
```typescript
async function checkFinqleHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${FINQLE_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
```