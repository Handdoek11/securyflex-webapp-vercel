# PRP: Finqle Payment Integration

**Status**: Active
**Version**: 1.0.0
**Last Updated**: 2024-12-15
**Confidence**: 8/10

## Overview
24-hour payment guarantee system using Finqle's factoring service. Ensures ZZP beveiligers receive payment within 24 hours of shift completion.

## Context

### Business Requirements
- Payment within 24 hours guaranteed
- VAT handling (21% BTW)
- Factoring fee (2.5%) 
- Automatic invoice generation
- Support for multiple payment methods
- Payment status tracking
- Webhook processing <2 seconds

### Technical Requirements
- Finqle API integration
- Webhook signature verification
- Idempotent payment processing
- Retry mechanism for failures
- Invoice PDF generation
- Real-time status updates
- Decimal precision for currency

## Implementation Steps

### Step 1: Configure Finqle Environment
```typescript
// .env.local
FINQLE_API_URL=https://api.finqle.com/v1
FINQLE_API_KEY=your_api_key_here
FINQLE_WEBHOOK_SECRET=your_webhook_secret
FINQLE_MERCHANT_ID=your_merchant_id

// src/config/finqle.config.ts
export const FINQLE_CONFIG = {
  apiUrl: process.env.FINQLE_API_URL!,
  apiKey: process.env.FINQLE_API_KEY!,
  webhookSecret: process.env.FINQLE_WEBHOOK_SECRET!,
  merchantId: process.env.FINQLE_MERCHANT_ID!,
  
  // Business rules
  vatPercentage: 21,
  factoringFeePercentage: 2.5,
  paymentDeadlineHours: 24,
  
  // Retry configuration
  maxRetries: 3,
  retryDelayMs: 1000,
  webhookTimeoutMs: 1900, // Must respond < 2s
}
```

**Validation**:
- [ ] Environment variables set
- [ ] API key valid (test call)
- [ ] Webhook URL configured in Finqle

### Step 2: Payment Service Implementation
```typescript
// src/services/finqle-payment.service.ts
import { Decimal } from 'decimal.js'

export class FinqlePaymentService {
  async createPayment(shiftData: CompletedShift): Promise<Payment> {
    // Calculate amounts with precision
    const hours = new Decimal(shiftData.hoursWorked)
    const rate = new Decimal(shiftData.hourlyRate)
    const subtotal = hours.mul(rate)
    
    // VAT calculation (21%)
    const vatAmount = subtotal.mul(0.21)
    const totalWithVAT = subtotal.plus(vatAmount)
    
    // Factoring fee (2.5% of subtotal)
    const factoringFee = subtotal.mul(0.025)
    
    // Net amount to ZZP (after factoring fee)
    const netAmount = subtotal.minus(factoringFee)
    
    // Create invoice in database
    const invoice = await prisma.factuur.create({
      data: {
        nummer: this.generateInvoiceNumber(),
        bedrag: netAmount.toNumber(),
        vatAmount: vatAmount.toNumber(),
        factoringFee: factoringFee.toNumber(),
        status: 'PENDING',
        zzpId: shiftData.zzpId,
        shiftId: shiftData.id,
        dueDate: this.calculate24HourDeadline()
      }
    })
    
    // Submit to Finqle
    const finqleResponse = await this.submitToFinqle({
      invoiceId: invoice.id,
      amount: totalWithVAT.toNumber(),
      recipient: await this.getRecipientDetails(shiftData.zzpId),
      metadata: {
        shiftId: shiftData.id,
        invoiceNumber: invoice.nummer
      }
    })
    
    // Update with Finqle reference
    await prisma.factuur.update({
      where: { id: invoice.id },
      data: {
        finqleReference: finqleResponse.reference,
        status: 'PROCESSING'
      }
    })
    
    return invoice
  }
  
  private async submitToFinqle(data: FinqlePaymentRequest) {
    const response = await fetch(`${FINQLE_CONFIG.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FINQLE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${data.invoiceId}_${Date.now()}`
      },
      body: JSON.stringify({
        type: 'FACTORING',
        amount: Math.round(data.amount * 100), // In cents
        currency: 'EUR',
        description: `SecuryFlex Invoice ${data.metadata.invoiceNumber}`,
        recipient: {
          iban: data.recipient.iban,
          name: data.recipient.name,
          kvk: data.recipient.kvkNumber
        },
        webhookUrl: `${process.env.APP_URL}/api/webhooks/finqle`,
        metadata: data.metadata
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new FinqleError(error.code, error.message)
    }
    
    return response.json()
  }
}
```

**Validation**:
- [ ] VAT calculation correct (21%)
- [ ] Factoring fee correct (2.5%)
- [ ] Decimal precision maintained
- [ ] Invoice number unique
- [ ] API call succeeds

### Step 3: Webhook Handler
```typescript
// src/app/api/webhooks/finqle/route.ts
import crypto from 'crypto'

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    // Verify signature
    const signature = req.headers.get('X-Finqle-Signature')
    const body = await req.text()
    
    if (!verifySignature(body, signature)) {
      return new Response('Invalid signature', { status: 401 })
    }
    
    const event = JSON.parse(body)
    
    // Process based on event type
    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSuccess(event.data)
        break
        
      case 'payment.failed':
        await handlePaymentFailure(event.data)
        break
        
      case 'payment.processing':
        await handlePaymentProcessing(event.data)
        break
        
      default:
        console.log('Unknown event type:', event.type)
    }
    
    // Ensure response within 2 seconds
    const elapsed = Date.now() - startTime
    if (elapsed > 1900) {
      console.error('Webhook processing took too long:', elapsed)
    }
    
    return new Response('OK', { status: 200 })
    
  } catch (error) {
    console.error('Webhook error:', error)
    // Return success to prevent retries for bad data
    return new Response('OK', { status: 200 })
  }
}

function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false
  
  const expected = crypto
    .createHmac('sha256', FINQLE_CONFIG.webhookSecret)
    .update(payload)
    .digest('hex')
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

async function handlePaymentSuccess(data: any) {
  // Update invoice status
  await prisma.factuur.update({
    where: { finqleReference: data.reference },
    data: {
      status: 'PAID',
      paidAt: new Date(data.paidAt),
      transactionId: data.transactionId
    }
  })
  
  // Notify ZZP via push notification
  await sendNotification(data.metadata.zzpId, {
    title: 'Betaling ontvangen! 💰',
    body: `€${data.amount / 100} is uitbetaald voor je shift`,
    data: { invoiceId: data.metadata.invoiceId }
  })
  
  // Update shift status
  await prisma.werkuur.update({
    where: { id: data.metadata.shiftId },
    data: { paymentStatus: 'PAID' }
  })
}
```

**Validation**:
- [ ] Signature verification works
- [ ] Response always <2 seconds
- [ ] Database updates succeed
- [ ] Notifications sent
- [ ] Idempotent processing

### Step 4: Invoice Generation
```typescript
// src/services/invoice-generator.service.ts
import PDFDocument from 'pdfkit'

export class InvoiceGenerator {
  async generatePDF(invoice: Invoice): Promise<Buffer> {
    const doc = new PDFDocument()
    const chunks: Buffer[] = []
    
    doc.on('data', chunk => chunks.push(chunk))
    
    // Header
    doc.fontSize(20).text('FACTUUR', 50, 50)
    doc.fontSize(12)
    
    // Invoice details
    doc.text(`Factuur nummer: ${invoice.nummer}`, 50, 100)
    doc.text(`Datum: ${invoice.createdAt.toLocaleDateString('nl-NL')}`, 50, 120)
    doc.text(`Vervaldatum: ${invoice.dueDate.toLocaleDateString('nl-NL')}`, 50, 140)
    
    // ZZP Details
    const zzp = await prisma.zZPProfile.findUnique({
      where: { id: invoice.zzpId },
      include: { user: true }
    })
    
    doc.text('Aan:', 50, 180)
    doc.text(zzp.user.name, 50, 200)
    doc.text(`KvK: ${zzp.kvkNummer}`, 50, 220)
    doc.text(`BTW: ${zzp.btwNummer}`, 50, 240)
    
    // Line items
    doc.text('Omschrijving', 50, 300)
    doc.text('Uren', 250, 300)
    doc.text('Tarief', 350, 300)
    doc.text('Bedrag', 450, 300)
    
    const shift = await prisma.werkuur.findUnique({
      where: { id: invoice.shiftId }
    })
    
    doc.text('Beveiligingsdiensten', 50, 330)
    doc.text(shift.urenGewerkt.toString(), 250, 330)
    doc.text(`€${shift.uurtarief}`, 350, 330)
    doc.text(`€${shift.urenGewerkt * shift.uurtarief}`, 450, 330)
    
    // Totals
    const subtotal = shift.urenGewerkt * shift.uurtarief
    const vat = subtotal * 0.21
    const factoringFee = subtotal * 0.025
    const total = subtotal - factoringFee
    
    doc.text(`Subtotaal: €${subtotal.toFixed(2)}`, 350, 400)
    doc.text(`BTW (21%): €${vat.toFixed(2)}`, 350, 420)
    doc.text(`Factoring fee: -€${factoringFee.toFixed(2)}`, 350, 440)
    doc.text(`Totaal: €${total.toFixed(2)}`, 350, 460, { bold: true })
    
    // Footer
    doc.fontSize(10)
    doc.text('Betaling gegarandeerd binnen 24 uur via Finqle', 50, 700)
    doc.text('SecuryFlex B.V. | KvK: 12345678 | BTW: NL123456789B01', 50, 720)
    
    doc.end()
    
    return Buffer.concat(chunks)
  }
}
```

**Validation**:
- [ ] PDF generates correctly
- [ ] All amounts calculated properly
- [ ] Dutch formatting used
- [ ] Can be emailed
- [ ] Stored in cloud

### Step 5: Payment Status Monitoring
```typescript
// src/jobs/payment-monitor.job.ts
import { CronJob } from 'cron'

export class PaymentMonitorJob {
  start() {
    // Run every hour
    new CronJob('0 * * * *', async () => {
      await this.checkPendingPayments()
    }).start()
  }
  
  async checkPendingPayments() {
    // Find payments pending > 24 hours
    const overduePayments = await prisma.factuur.findMany({
      where: {
        status: 'PROCESSING',
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
    
    for (const payment of overduePayments) {
      // Check status with Finqle
      const status = await this.checkFinqleStatus(payment.finqleReference)
      
      if (status === 'PAID') {
        await handlePaymentSuccess({ reference: payment.finqleReference })
      } else if (status === 'FAILED') {
        // Alert admin and ZZP
        await this.alertPaymentFailure(payment)
      }
    }
  }
  
  async checkFinqleStatus(reference: string) {
    const response = await fetch(
      `${FINQLE_CONFIG.apiUrl}/payments/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${FINQLE_CONFIG.apiKey}`
        }
      }
    )
    
    const data = await response.json()
    return data.status
  }
}
```

**Validation**:
- [ ] Cron job runs hourly
- [ ] Overdue payments detected
- [ ] Status updates work
- [ ] Alerts sent for failures

### Step 6: Retry Mechanism
```typescript
// src/utils/retry.util.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError!
}

// Usage in payment service
async submitPaymentWithRetry(data: PaymentData) {
  return retryWithBackoff(
    () => this.submitToFinqle(data),
    FINQLE_CONFIG.maxRetries,
    FINQLE_CONFIG.retryDelayMs
  )
}
```

**Validation**:
- [ ] Retries on failure
- [ ] Exponential backoff works
- [ ] Max retries respected
- [ ] Errors logged

## Testing Checklist

### Unit Tests
```typescript
describe('FinqlePaymentService', () => {
  test('calculates VAT correctly (21%)')
  test('calculates factoring fee correctly (2.5%)')
  test('generates unique invoice numbers')
  test('handles decimal precision')
  test('retries on failure')
})

describe('Webhook Handler', () => {
  test('verifies signature correctly')
  test('responds within 2 seconds')
  test('processes payment success')
  test('handles unknown events')
  test('is idempotent')
})
```

### Integration Tests
- [ ] Full payment flow works
- [ ] Webhooks received and processed
- [ ] PDF invoice generated
- [ ] Notifications sent
- [ ] Status monitoring works

### Manual Testing
- [ ] Test payment (Finqle sandbox)
- [ ] Webhook delivery verified
- [ ] Invoice PDF readable
- [ ] 24-hour guarantee met
- [ ] Failed payment handled

## Error Handling

### API Errors
- **401**: Invalid API key
- **422**: Invalid payment data
- **429**: Rate limit exceeded
- **500**: Finqle server error

### Business Errors
- **Insufficient funds**: Retry later
- **Invalid IBAN**: Request update
- **KvK not found**: Verification required
- **Duplicate payment**: Check idempotency

## Performance Targets
- API call latency: <500ms
- Webhook response: <2000ms
- PDF generation: <3000ms
- Payment processing: <5000ms

## Success Criteria
- [ ] Payments within 24 hours
- [ ] VAT calculated correctly
- [ ] Factoring fee applied
- [ ] Webhooks processed <2s
- [ ] No duplicate payments
- [ ] Invoice PDFs generated
- [ ] Status tracking works

## Dependencies
- Finqle API access
- pdfkit for PDF generation
- decimal.js for precision
- cron for monitoring
- crypto for signatures

## Security Considerations
- Store API keys securely
- Verify webhook signatures
- Use HTTPS for all calls
- Implement rate limiting
- Log all transactions
- PCI compliance not needed (Finqle handles)

## References
- [Finqle API Docs](https://docs.finqle.com)
- [Example: finqle-integration.ts](../../examples/payments/finqle-integration.ts)
- [Webhook Best Practices](https://docs.finqle.com/webhooks)

## Notes
- Sandbox environment for testing
- Production requires KYB verification
- Consider backup payment provider
- Monthly reconciliation recommended