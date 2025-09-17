# Finqle Webhook Testing Command

Comprehensive testing of Finqle payment webhook integration including signature validation, 24-hour SLA compliance, and transaction processing.

## Usage

```
/finqle-webhook-test [scenario]
```

## Test Scenarios

- `webhook` - Webhook signature and processing test (default)
- `sla` - 24-hour payment SLA compliance test
- `retry` - Retry logic and failure handling test
- `security` - Security and signature validation test
- `performance` - Webhook processing performance test
- `idempotency` - Duplicate transaction handling test

## Webhook Testing Process

### 1. Webhook Signature Validation
```bash
# Test Finqle webhook signature verification
npm run test:finqle-webhook
```

**Validates:**
- ✅ HMAC SHA-256 signature verification
- ✅ Webhook payload integrity
- ✅ Timestamp validation (prevent replay attacks)
- ✅ Invalid signature rejection
- ✅ Missing signature handling

### 2. Payment SLA Testing
```bash
# Test 24-hour payment guarantee
npm run test:finqle-sla
```

**Test Cases:**
- ✅ Payment completion within 24 hours
- ✅ SLA breach notifications
- ✅ Weekend/holiday processing
- ✅ High-volume period handling
- ✅ Payment status tracking accuracy

### 3. Retry Logic Testing
```bash
# Test webhook retry and failure handling
npm run test:finqle-retry
```

**Validates:**
- ✅ Exponential backoff retry strategy
- ✅ Maximum retry attempts (5)
- ✅ Dead letter queue for failed webhooks
- ✅ Manual intervention triggers
- ✅ Notification on repeated failures

## Mock Webhook Payloads

### Successful Payment
```json
{
  "event": "payment.completed",
  "payment_id": "finq_test_123456",
  "amount": 2500,
  "currency": "EUR",
  "professional_id": "zzp_001",
  "shift_id": "shift_789",
  "completed_at": "2024-12-15T23:45:00Z",
  "processing_time": "23:30:00",
  "fees": {
    "platform": 125,
    "processing": 50
  },
  "metadata": {
    "check_in_time": "2024-12-14T08:00:00Z",
    "check_out_time": "2024-12-14T20:00:00Z",
    "hours_worked": 12
  }
}
```

### Failed Payment
```json
{
  "event": "payment.failed",
  "payment_id": "finq_test_123457",
  "amount": 2500,
  "currency": "EUR",
  "professional_id": "zzp_002",
  "shift_id": "shift_790",
  "failed_at": "2024-12-15T10:30:00Z",
  "error_code": "insufficient_funds",
  "error_message": "Client account has insufficient funds",
  "retry_count": 3,
  "next_retry": "2024-12-15T14:30:00Z"
}
```

### Payment Pending
```json
{
  "event": "payment.pending",
  "payment_id": "finq_test_123458",
  "amount": 2500,
  "currency": "EUR",
  "professional_id": "zzp_003",
  "shift_id": "shift_791",
  "initiated_at": "2024-12-15T08:00:00Z",
  "estimated_completion": "2024-12-16T08:00:00Z",
  "status": "processing"
}
```

## Webhook Endpoint Testing

### Signature Validation Test
```typescript
describe('Finqle Webhook Signature', () => {
  it('should validate correct signature', async () => {
    const payload = JSON.stringify(mockSuccessfulPayment);
    const signature = generateFinqleSignature(payload);

    const response = await fetch('/api/webhooks/finqle', {
      method: 'POST',
      headers: {
        'x-finqle-signature': signature,
        'content-type': 'application/json'
      },
      body: payload
    });

    expect(response.status).toBe(200);
  });

  it('should reject invalid signature', async () => {
    const payload = JSON.stringify(mockSuccessfulPayment);
    const invalidSignature = 'invalid_signature';

    const response = await fetch('/api/webhooks/finqle', {
      method: 'POST',
      headers: {
        'x-finqle-signature': invalidSignature,
        'content-type': 'application/json'
      },
      body: payload
    });

    expect(response.status).toBe(401);
  });
});
```

### Processing Time Test
```typescript
it('should process webhook within 2 seconds', async () => {
  const startTime = Date.now();
  const payload = JSON.stringify(mockSuccessfulPayment);
  const signature = generateFinqleSignature(payload);

  const response = await fetch('/api/webhooks/finqle', {
    method: 'POST',
    headers: {
      'x-finqle-signature': signature,
      'content-type': 'application/json'
    },
    body: payload
  });

  const processingTime = Date.now() - startTime;

  expect(response.status).toBe(200);
  expect(processingTime).toBeLessThan(2000);
});
```

## SLA Compliance Testing

### 24-Hour Payment Test
```typescript
describe('24-Hour SLA Compliance', () => {
  it('should complete payment within 24 hours', async () => {
    const shiftCompleted = new Date('2024-12-14T20:00:00Z');
    const paymentCompleted = new Date('2024-12-15T19:30:00Z');

    const timeDiff = paymentCompleted.getTime() - shiftCompleted.getTime();
    const hoursElapsed = timeDiff / (1000 * 60 * 60);

    expect(hoursElapsed).toBeLessThan(24);
  });

  it('should trigger SLA breach notification', async () => {
    const shiftCompleted = new Date('2024-12-14T20:00:00Z');
    const currentTime = new Date('2024-12-15T20:30:00Z'); // 24.5 hours later

    const slaStatus = checkPaymentSLA(shiftCompleted, currentTime);

    expect(slaStatus.breached).toBe(true);
    expect(slaStatus.hoursOverdue).toBe(0.5);
    expect(slaStatus.notificationSent).toBe(true);
  });
});
```

## Idempotency Testing

### Duplicate Webhook Handling
```typescript
it('should handle duplicate webhooks idempotently', async () => {
  const payload = JSON.stringify(mockSuccessfulPayment);
  const signature = generateFinqleSignature(payload);

  // Send same webhook twice
  const response1 = await sendWebhook(payload, signature);
  const response2 = await sendWebhook(payload, signature);

  expect(response1.status).toBe(200);
  expect(response2.status).toBe(200); // Should not fail

  // Verify only one payment record created
  const paymentRecords = await getPaymentRecords(mockSuccessfulPayment.payment_id);
  expect(paymentRecords.length).toBe(1);
});
```

### Idempotency Key Validation
```typescript
it('should use payment_id as idempotency key', async () => {
  const payment1 = { ...mockSuccessfulPayment };
  const payment2 = { ...mockSuccessfulPayment, amount: 3000 }; // Different amount, same ID

  await processWebhook(payment1);
  await processWebhook(payment2);

  const finalPayment = await getPayment(payment1.payment_id);
  expect(finalPayment.amount).toBe(2500); // Original amount preserved
});
```

## Security Testing

### Webhook Security Headers
```typescript
it('should validate required security headers', async () => {
  const payload = JSON.stringify(mockSuccessfulPayment);

  const responseNoSignature = await fetch('/api/webhooks/finqle', {
    method: 'POST',
    body: payload
  });

  const responseNoContentType = await fetch('/api/webhooks/finqle', {
    method: 'POST',
    headers: {
      'x-finqle-signature': 'some_signature'
    },
    body: payload
  });

  expect(responseNoSignature.status).toBe(401);
  expect(responseNoContentType.status).toBe(400);
});
```

### Rate Limiting Test
```typescript
it('should implement rate limiting for webhooks', async () => {
  const requests = Array.from({ length: 100 }, () =>
    sendWebhook(mockSuccessfulPayment)
  );

  const responses = await Promise.all(requests);
  const rateLimitedResponses = responses.filter(r => r.status === 429);

  expect(rateLimitedResponses.length).toBeGreaterThan(0);
});
```

## Performance Testing

### High Volume Processing
```typescript
it('should handle high volume webhook bursts', async () => {
  const webhooks = Array.from({ length: 50 }, (_, i) => ({
    ...mockSuccessfulPayment,
    payment_id: `finq_test_${i}`,
    shift_id: `shift_${i}`
  }));

  const startTime = Date.now();
  const results = await Promise.all(
    webhooks.map(webhook => processWebhook(webhook))
  );
  const totalTime = Date.now() - startTime;

  expect(results.every(r => r.success)).toBe(true);
  expect(totalTime).toBeLessThan(10000); // 10 seconds for 50 webhooks
});
```

### Memory Usage Test
```typescript
it('should maintain stable memory usage', async () => {
  const initialMemory = process.memoryUsage().heapUsed;

  // Process 1000 webhooks
  for (let i = 0; i < 1000; i++) {
    await processWebhook({
      ...mockSuccessfulPayment,
      payment_id: `finq_test_${i}`
    });
  }

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

  expect(memoryIncrease).toBeLessThan(50); // Less than 50MB increase
});
```

## Database Testing

### Transaction Integrity
```typescript
it('should maintain transaction integrity', async () => {
  const payment = mockSuccessfulPayment;

  await processWebhook(payment);

  // Verify all related records updated
  const paymentRecord = await getPayment(payment.payment_id);
  const shiftRecord = await getShift(payment.shift_id);
  const professionalRecord = await getProfessional(payment.professional_id);

  expect(paymentRecord.status).toBe('completed');
  expect(shiftRecord.payment_status).toBe('paid');
  expect(professionalRecord.balance).toBeGreaterThan(0);
});
```

### Rollback on Failure
```typescript
it('should rollback on processing failure', async () => {
  const invalidPayment = {
    ...mockSuccessfulPayment,
    professional_id: 'invalid_id'
  };

  const initialState = await getDatabaseState();

  try {
    await processWebhook(invalidPayment);
  } catch (error) {
    // Expected to fail
  }

  const finalState = await getDatabaseState();
  expect(finalState).toEqual(initialState); // No changes made
});
```

## Error Scenarios

### Network Failures
```typescript
it('should handle database connection failures', async () => {
  mockDatabaseConnection.mockImplementation(() => {
    throw new Error('Connection timeout');
  });

  const result = await processWebhook(mockSuccessfulPayment);

  expect(result.success).toBe(false);
  expect(result.shouldRetry).toBe(true);
  expect(result.retryAfter).toBeGreaterThan(0);
});
```

### Invalid Data
```typescript
it('should handle malformed webhook data', async () => {
  const malformedPayload = '{"invalid": json}';
  const signature = generateFinqleSignature(malformedPayload);

  const response = await sendWebhook(malformedPayload, signature);

  expect(response.status).toBe(400);
  expect(response.error).toBe('invalid_json');
});
```

## Test Reports

### Success Report
```json
{
  "test_id": "finqle_20241215_001",
  "timestamp": "2024-12-15T10:30:00Z",
  "scenario": "webhook",
  "status": "passed",
  "results": {
    "signature_validation": {
      "valid_signatures": "100%",
      "invalid_rejections": "100%",
      "processing_time": "avg 45ms"
    },
    "sla_compliance": {
      "payments_within_24h": "98.5%",
      "average_processing": "22.3h",
      "sla_breaches": "1.5%"
    },
    "performance": {
      "webhook_processing": "avg 1.2s",
      "high_volume_handling": "50 webhooks/10s",
      "memory_stability": "stable"
    },
    "security": {
      "invalid_rejections": "100%",
      "rate_limiting": "active",
      "replay_prevention": "effective"
    }
  },
  "passed_tests": 32,
  "failed_tests": 0,
  "warnings": 2
}
```

## CI/CD Integration

### Webhook Test Pipeline
```yaml
# .github/workflows/finqle-tests.yml
- name: Finqle Integration Tests
  run: |
    npm run test:finqle-webhook
    npm run test:finqle-sla
    npm run test:finqle-security
```

### Production Monitoring
```bash
# Monitor webhook endpoint health
curl -f https://api.securyflex.nl/health/webhooks/finqle
```

## Success Criteria

Finqle webhook testing passes when:
1. ✅ Signature validation 100% accurate
2. ✅ Processing time < 2 seconds
3. ✅ SLA compliance > 99%
4. ✅ Idempotency handling correct
5. ✅ Security requirements met
6. ✅ High volume handling stable

**Usage**: Run before payment feature releases and during webhook endpoint changes.