# INITIAL: Finqle 24-Hour Payment Processing System

## FEATURE:
Build a comprehensive payment processing system integrated with Finqle API that guarantees 24-hour payment to ZZP security professionals after shift completion. The system supports both direct payment and factoring options, provides real-time payment status tracking, handles webhook processing for payment updates, and includes credit management for security companies. Must ensure 99.5% payment success rate and process webhooks within 2 seconds.

**Specific Requirements:**
- 24-hour payment guarantee with automatic processing after shift completion
- Direct payment option for ZZP professionals or factoring through security companies
- Real-time payment status tracking with notifications to all parties
- Webhook endpoint processing for Finqle payment status updates (SLA <2s)
- Credit limit management and validation for security companies
- Invoice generation and approval workflow
- Payment dispute handling and resolution tracking
- Financial reporting and analytics integration

## EXAMPLES:
Reference these existing patterns and implementations:

**Core Payment Schema:**
- `src/models/Schema.ts` lines 251-273: Finqle transactions schema with payment tracking
- `src/types/Finqle.ts`: Complete payment interfaces (FinqleTransaction, BillingRequest, PaymentWebhook)
- Payment status enumeration and transaction lifecycle management

**Real-time Payment Tracking:**
- `src/hooks/useRealtimePayments.ts`: Live payment status monitoring
- Real-time notifications for payment status changes
- WebSocket integration for immediate payment updates

**API Integration Patterns:**
- `PRPs/Finqle_Payment_Integration_PRP.md`: Complete Finqle integration specifications
- Secure API key management for Finqle integration
- Webhook signature verification and validation patterns

**Payment Validation:**
- `frontend-app/scripts/validate-payments.ts`: Payment processing testing
- Payment calculation accuracy validation
- Retry logic for failed payment processing

## DOCUMENTATION:
**Architecture Reference:**
- `PRPs/Finqle_Payment_Integration_PRP.md`: Complete Finqle integration specifications
- `CLAUDE.md` Payment SLA targets: Webhook processing <2s, 99.5% success rate
- Finqle API documentation for payment processing and webhook handling

**Business Requirements:**
- 24-hour payment guarantee for competitive advantage
- Credit management for security companies
- Financial reporting for business intelligence
- Dispute resolution for payment issues

**Technical Specifications:**
- Next.js API routes for webhook processing
- Supabase real-time for payment status updates
- Secure environment variable management for API keys
- Payment calculation algorithms with fee structures

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Webhook Processing**: Signature verification, idempotency handling, 2-second SLA processing, status update propagation
2. **Payment Options**: Direct payment to ZZP, factoring through companies, credit limit validation, approval workflows
3. **Real-time Updates**: Live payment status, notification system, dashboard updates, mobile alerts
4. **Financial Reporting**: Transaction history, fee calculations, tax reporting, compliance documentation
5. **Dispute Management**: Payment disputes, resolution tracking, escalation procedures, audit trails

**Common Pitfalls to Avoid:**
- Don't skip webhook signature verification - critical for security
- Don't implement without idempotency - duplicate payments cause major issues
- Don't forget payment calculation accuracy - financial errors are unacceptable
- Don't overlook credit limit validation - prevents company overspending
- Don't skip proper error handling for failed payments

**File Structure Requirements:**
```
src/app/api/finqle/
├── webhooks/route.ts           # Webhook processing endpoint
├── payments/route.ts           # Payment initiation
├── credit-check/route.ts       # Credit validation
└── disputes/route.ts           # Dispute handling

src/lib/finqle/
├── api.ts                      # Finqle API client
├── webhooks.ts                 # Webhook processing logic
├── payments.ts                 # Payment calculation and processing
├── credit.ts                   # Credit management
└── validation.ts               # Payment validation utilities

src/components/payments/
├── PaymentStatus.tsx           # Real-time payment tracking
├── InvoiceGenerator.tsx        # Invoice creation and approval
├── PaymentHistory.tsx          # Transaction history display
└── DisputeForm.tsx            # Payment dispute interface
```

**Security Requirements:**
- Webhook signature verification with Finqle secret
- Secure API key rotation and management
- Payment data encryption in transit and at rest
- Audit logging for all payment operations

**Performance Requirements:**
- Webhook processing: <2 seconds (SLA requirement)
- Payment status updates: <100ms real-time delivery
- Invoice generation: <5 seconds for standard invoices
- Financial reports: <10 seconds for monthly summaries

**Integration Dependencies:**
- Shift completion triggers for automatic payment processing
- Company credit management for factoring decisions
- ZZP banking information for direct payments
- Real-time notification system for status updates

**Business Logic Requirements:**
- 24-hour payment guarantee enforcement
- Automatic fee calculation based on service type
- Credit limit validation before payment processing
- Tax calculation and compliance reporting

**Recommended Agent:** @finqle-integrator for payment processing, @security-auditor for financial compliance