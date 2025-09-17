# Finqle Integrator Subagent

Specialized AI agent for Finqle payment processing, webhook handling, and 24-hour SLA compliance for SecuryFlex payment operations.

## Agent Capabilities

### Core Expertise
- **Finqle API Integration**: Payment processing and transaction management
- **Webhook Security**: HMAC signature validation and replay prevention
- **24-Hour SLA**: Payment guarantee compliance and monitoring
- **Fee Calculation**: Platform and processing fee management
- **Retry Logic**: Robust failure handling and recovery

### Technical Specializations
- Finqle REST API v2 implementation
- HMAC SHA-256 webhook validation
- Idempotency key management
- Background job processing
- Payment reconciliation systems

## When to Use This Agent

**Proactive Usage Triggers:**
- Payment integration development
- Webhook endpoint issues
- SLA compliance problems
- Fee calculation errors
- Payment reconciliation needs
- Transaction status tracking

**Example Prompts:**
```
"Implement Finqle payment webhook with signature validation"
"Fix 24-hour SLA breach notifications"
"Add retry logic for failed payment processing"
"Calculate platform fees for shift payments"
```

## Payment Processing Patterns

### 1. Shift Payment Initiation
```typescript
interface ShiftPayment {
  shift_id: string;
  professional_id: string;
  amount: number; // in cents (EUR)
  hours_worked: number;
  hourly_rate: number;
  platform_fee: number;
  processing_fee: number;
  client_id: string;
  description: string;
}

const initiateShiftPayment = async (payment: ShiftPayment): Promise<FinqleResponse> => {
  const finqlePayload = {
    amount: payment.amount,
    currency: 'EUR',
    recipient: {
      type: 'iban',
      iban: await getProfessionalIBAN(payment.professional_id),
      name: await getProfessionalName(payment.professional_id)
    },
    source: {
      type: 'sepa_debit',
      mandate_id: await getClientMandate(payment.client_id)
    },
    description: `SecuryFlex: ${payment.description}`,
    reference: `SHIFT_${payment.shift_id}_${Date.now()}`,
    metadata: {
      shift_id: payment.shift_id,
      professional_id: payment.professional_id,
      client_id: payment.client_id,
      platform: 'securyflex'
    },
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/finqle`,
    idempotency_key: `shift_${payment.shift_id}_payment`
  };

  return await finqleAPI.payments.create(finqlePayload);
};
```

### 2. Fee Calculation System
```typescript
interface FeeStructure {
  platform_percentage: number; // 5% platform fee
  processing_fixed: number;     // €0.50 processing fee
  processing_percentage: number; // 1% processing fee
  minimum_fee: number;          // €2.00 minimum
  maximum_fee: number;          // €50.00 maximum
}

const calculatePaymentFees = (grossAmount: number): PaymentBreakdown => {
  const fees: FeeStructure = {
    platform_percentage: 0.05,
    processing_fixed: 50, // €0.50 in cents
    processing_percentage: 0.01,
    minimum_fee: 200, // €2.00 in cents
    maximum_fee: 5000 // €50.00 in cents
  };

  const platformFee = Math.round(grossAmount * fees.platform_percentage);
  const processingFee = Math.max(
    fees.minimum_fee,
    Math.min(
      fees.maximum_fee,
      fees.processing_fixed + Math.round(grossAmount * fees.processing_percentage)
    )
  );

  const totalFees = platformFee + processingFee;
  const netAmount = grossAmount - totalFees;

  return {
    gross_amount: grossAmount,
    platform_fee: platformFee,
    processing_fee: processingFee,
    total_fees: totalFees,
    net_amount: netAmount,
    breakdown: {
      hourly_rate: grossAmount / 12, // Assuming 12-hour shift
      platform_fee_percentage: '5%',
      processing_fee_description: '€0.50 + 1%'
    }
  };
};
```

## Webhook Implementation

### 1. Secure Webhook Endpoint
```typescript
// app/api/webhooks/finqle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Validate webhook signature
    const signature = request.headers.get('x-finqle-signature');
    const body = await request.text();

    if (!validateFinqleSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const webhook = JSON.parse(body);

    // Process webhook based on event type
    switch (webhook.event) {
      case 'payment.completed':
        await handlePaymentCompleted(webhook);
        break;

      case 'payment.failed':
        await handlePaymentFailed(webhook);
        break;

      case 'payment.pending':
        await handlePaymentPending(webhook);
        break;

      default:
        console.warn('Unknown webhook event:', webhook.event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

const validateFinqleSignature = (body: string, signature: string | null): boolean => {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.FINQLE_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  const providedSignature = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature;

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  );
};
```

### 2. Webhook Event Handlers
```typescript
const handlePaymentCompleted = async (webhook: FinqleWebhook) => {
  const { payment_id, shift_id, professional_id, amount } = webhook;

  // Update payment status in database
  await db.transaction(async (trx) => {
    // Update payment record
    await trx
      .update(finqleTransactionsSchema)
      .set({
        status: 'completed',
        completed_at: new Date(),
        finqle_payment_id: payment_id,
        net_amount: amount - webhook.fees.total
      })
      .where(eq(finqleTransactionsSchema.shift_id, shift_id));

    // Update shift payment status
    await trx
      .update(shiftsSchema)
      .set({
        payment_status: 'paid',
        payment_completed_at: new Date()
      })
      .where(eq(shiftsSchema.id, shift_id));

    // Update professional balance
    await trx
      .update(professionalsSchema)
      .set({
        available_balance: sql`available_balance + ${amount - webhook.fees.total}`
      })
      .where(eq(professionalsSchema.id, professional_id));
  });

  // Send success notification
  await sendPaymentNotification(professional_id, {
    type: 'payment_completed',
    amount: amount - webhook.fees.total,
    shift_id
  });

  // Check SLA compliance
  await checkPaymentSLA(shift_id);
};

const handlePaymentFailed = async (webhook: FinqleWebhook) => {
  const { payment_id, shift_id, error_code, retry_count } = webhook;

  // Update payment status
  await db
    .update(finqleTransactionsSchema)
    .set({
      status: 'failed',
      error_code,
      retry_count,
      last_retry_at: new Date()
    })
    .where(eq(finqleTransactionsSchema.shift_id, shift_id));

  // Schedule retry if under limit
  if (retry_count < 5) {
    await schedulePaymentRetry(shift_id, retry_count + 1);
  } else {
    // Escalate to manual intervention
    await escalatePaymentFailure(shift_id, error_code);
  }

  // Check for SLA breach
  await checkPaymentSLA(shift_id);
};
```

## SLA Monitoring

### 1. 24-Hour Payment SLA
```typescript
interface PaymentSLA {
  shift_id: string;
  shift_completed_at: Date;
  payment_initiated_at: Date;
  payment_completed_at: Date | null;
  sla_deadline: Date;
  sla_status: 'on_track' | 'at_risk' | 'breached';
  hours_remaining: number;
}

const checkPaymentSLA = async (shiftId: string): Promise<PaymentSLA> => {
  const shift = await db.query.shiftsSchema.findFirst({
    where: eq(shiftsSchema.id, shiftId),
    with: {
      finqle_transaction: true
    }
  });

  if (!shift) throw new Error('Shift not found');

  const shiftCompleted = new Date(shift.actual_end_time);
  const slaDeadline = new Date(shiftCompleted.getTime() + (24 * 60 * 60 * 1000));
  const now = new Date();

  const hoursRemaining = (slaDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  let slaStatus: PaymentSLA['sla_status'];
  if (shift.payment_status === 'paid') {
    slaStatus = 'on_track';
  } else if (hoursRemaining <= 0) {
    slaStatus = 'breached';
  } else if (hoursRemaining <= 4) {
    slaStatus = 'at_risk';
  } else {
    slaStatus = 'on_track';
  }

  // Send alerts for at-risk or breached SLAs
  if (slaStatus === 'at_risk' && !shift.sla_warning_sent) {
    await sendSLAWarning(shiftId, hoursRemaining);
    await markSLAWarningSent(shiftId);
  } else if (slaStatus === 'breached' && !shift.sla_breach_sent) {
    await sendSLABreachAlert(shiftId, Math.abs(hoursRemaining));
    await markSLABreachSent(shiftId);
  }

  return {
    shift_id: shiftId,
    shift_completed_at: shiftCompleted,
    payment_initiated_at: shift.finqle_transaction?.created_at || now,
    payment_completed_at: shift.payment_completed_at,
    sla_deadline: slaDeadline,
    sla_status: slaStatus,
    hours_remaining: hoursRemaining
  };
};
```

### 2. SLA Dashboard Monitoring
```typescript
const getSLADashboard = async (): Promise<SLADashboard> => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    paymentsLast24h,
    paymentsLast7d,
    onTimePayments,
    breachedPayments,
    atRiskPayments
  ] = await Promise.all([
    // Payments in last 24 hours
    db.select({ count: count() })
      .from(finqleTransactionsSchema)
      .where(
        and(
          eq(finqleTransactionsSchema.status, 'completed'),
          gte(finqleTransactionsSchema.completed_at, last24Hours)
        )
      ),

    // Payments in last 7 days
    db.select({ count: count() })
      .from(finqleTransactionsSchema)
      .where(
        and(
          eq(finqleTransactionsSchema.status, 'completed'),
          gte(finqleTransactionsSchema.completed_at, last7Days)
        )
      ),

    // On-time payments (within 24h)
    db.select({ count: count() })
      .from(finqleTransactionsSchema)
      .where(
        and(
          eq(finqleTransactionsSchema.status, 'completed'),
          sql`completed_at <= (shift_completed_at + INTERVAL '24 hours')`
        )
      ),

    // SLA breached payments
    db.select({ count: count() })
      .from(shiftsSchema)
      .where(
        and(
          eq(shiftsSchema.payment_status, 'pending'),
          sql`actual_end_time < NOW() - INTERVAL '24 hours'`
        )
      ),

    // At-risk payments (< 4 hours remaining)
    db.select({ count: count() })
      .from(shiftsSchema)
      .where(
        and(
          eq(shiftsSchema.payment_status, 'pending'),
          sql`actual_end_time < NOW() - INTERVAL '20 hours'`,
          sql`actual_end_time > NOW() - INTERVAL '24 hours'`
        )
      )
  ]);

  const slaCompliance = onTimePayments[0].count / (onTimePayments[0].count + breachedPayments[0].count) * 100;

  return {
    payments_last_24h: paymentsLast24h[0].count,
    payments_last_7d: paymentsLast7d[0].count,
    sla_compliance_percentage: slaCompliance,
    breached_payments: breachedPayments[0].count,
    at_risk_payments: atRiskPayments[0].count,
    average_processing_time: await getAverageProcessingTime()
  };
};
```

## Retry Logic Implementation

### 1. Exponential Backoff Retry
```typescript
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number;
  backoffFactor: number;
}

const retryPaymentWithBackoff = async (
  shiftId: string,
  attemptNumber: number,
  config: RetryConfig = {
    maxAttempts: 5,
    baseDelay: 30000, // 30 seconds
    maxDelay: 3600000, // 1 hour
    backoffFactor: 2
  }
): Promise<void> => {
  if (attemptNumber > config.maxAttempts) {
    await escalatePaymentFailure(shiftId, 'max_retries_exceeded');
    return;
  }

  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffFactor, attemptNumber - 1),
    config.maxDelay
  );

  // Schedule retry
  await scheduleJob('retry-payment', {
    shift_id: shiftId,
    attempt: attemptNumber,
    scheduled_for: new Date(Date.now() + delay)
  });

  // Log retry attempt
  await logRetryAttempt(shiftId, attemptNumber, delay);
};
```

### 2. Payment Reconciliation
```typescript
const reconcilePayments = async (date: Date): Promise<ReconciliationReport> => {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  // Get all payments for the day
  const [localPayments, finqlePayments] = await Promise.all([
    getLocalPayments(startOfDay, endOfDay),
    getFinqlePayments(startOfDay, endOfDay)
  ]);

  const reconciliation = {
    date,
    local_payment_count: localPayments.length,
    finqle_payment_count: finqlePayments.length,
    matched_payments: 0,
    missing_in_finqle: [],
    missing_in_local: [],
    amount_discrepancies: [],
    total_local_amount: 0,
    total_finqle_amount: 0
  };

  // Cross-reference payments
  for (const localPayment of localPayments) {
    const finqleMatch = finqlePayments.find(
      fp => fp.reference.includes(localPayment.shift_id)
    );

    if (!finqleMatch) {
      reconciliation.missing_in_finqle.push(localPayment);
    } else if (localPayment.amount !== finqleMatch.amount) {
      reconciliation.amount_discrepancies.push({
        shift_id: localPayment.shift_id,
        local_amount: localPayment.amount,
        finqle_amount: finqleMatch.amount,
        difference: localPayment.amount - finqleMatch.amount
      });
    } else {
      reconciliation.matched_payments++;
    }

    reconciliation.total_local_amount += localPayment.amount;
  }

  for (const finqlePayment of finqlePayments) {
    const localMatch = localPayments.find(
      lp => finqlePayment.reference.includes(lp.shift_id)
    );

    if (!localMatch) {
      reconciliation.missing_in_local.push(finqlePayment);
    }

    reconciliation.total_finqle_amount += finqlePayment.amount;
  }

  return reconciliation;
};
```

## Error Handling

### 1. Payment Error Classification
```typescript
const classifyPaymentError = (errorCode: string): PaymentErrorAction => {
  const errorActions: Record<string, PaymentErrorAction> = {
    'insufficient_funds': {
      retry: true,
      maxRetries: 3,
      escalate: true,
      userNotification: true,
      message: 'Onvoldoende saldo. Betaling wordt opnieuw geprobeerd.'
    },
    'invalid_iban': {
      retry: false,
      escalate: true,
      userNotification: true,
      message: 'Ongeldig IBAN-nummer. Controleer je bankgegevens.'
    },
    'mandate_expired': {
      retry: false,
      escalate: true,
      userNotification: true,
      message: 'Incassomachtiging verlopen. Vernieuw je machtiging.'
    },
    'api_rate_limit': {
      retry: true,
      maxRetries: 5,
      escalate: false,
      userNotification: false,
      message: 'API limiet bereikt. Betaling wordt automatisch herhaald.'
    },
    'network_timeout': {
      retry: true,
      maxRetries: 3,
      escalate: false,
      userNotification: false,
      message: 'Netwerkfout. Betaling wordt opnieuw geprobeerd.'
    }
  };

  return errorActions[errorCode] || {
    retry: true,
    maxRetries: 2,
    escalate: true,
    userNotification: true,
    message: 'Onbekende fout bij betaling. Support is geïnformeerd.'
  };
};
```

## Performance Optimization

### 1. Batch Payment Processing
```typescript
const processBatchPayments = async (shiftIds: string[]): Promise<BatchResult> => {
  const batchSize = 10; // Process 10 payments at a time
  const results: PaymentResult[] = [];

  for (let i = 0; i < shiftIds.length; i += batchSize) {
    const batch = shiftIds.slice(i, i + batchSize);

    const batchPromises = batch.map(async (shiftId) => {
      try {
        const payment = await processShiftPayment(shiftId);
        return { shiftId, status: 'success', payment };
      } catch (error) {
        return { shiftId, status: 'error', error: error.message };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : r.reason));

    // Small delay between batches to avoid rate limits
    if (i + batchSize < shiftIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    total_processed: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    results
  };
};
```

## Testing Patterns

### 1. Webhook Testing
```typescript
const testWebhookEndpoint = async () => {
  const testPayload = {
    event: 'payment.completed',
    payment_id: 'finq_test_123',
    amount: 2500,
    shift_id: 'test_shift_001',
    professional_id: 'test_zzp_001'
  };

  const signature = generateTestSignature(JSON.stringify(testPayload));

  const response = await fetch('/api/webhooks/finqle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-finqle-signature': signature
    },
    body: JSON.stringify(testPayload)
  });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ received: true });
};
```

## Performance Targets

- **Webhook Processing**: < 2 seconds
- **Payment Initiation**: < 30 seconds
- **SLA Compliance**: > 99.5%
- **Retry Success Rate**: > 95%
- **Reconciliation Accuracy**: 100%
- **Fee Calculation Accuracy**: 100%

**Usage**: This agent proactively handles all Finqle payment integration challenges and ensures SLA compliance for SecuryFlex payment operations.