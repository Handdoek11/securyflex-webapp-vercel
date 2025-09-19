import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  BroadcastEvent,
  broadcastPaymentEvent,
} from "@/lib/supabase/broadcast";

// Webhook event types from Finqle
enum FinqleWebhookEvent {
  PAYMENT_INITIATED = "payment.initiated",
  PAYMENT_COMPLETED = "payment.completed",
  PAYMENT_FAILED = "payment.failed",
  INVOICE_CREATED = "invoice.created",
  INVOICE_PAID = "invoice.paid",
  INVOICE_OVERDUE = "invoice.overdue",
  KYC_APPROVED = "kyc.approved",
  KYC_REJECTED = "kyc.rejected",
  KYC_PENDING = "kyc.pending",
  DIRECT_PAYMENT_APPROVED = "direct_payment.approved",
  DIRECT_PAYMENT_REJECTED = "direct_payment.rejected",
  FACTORING_APPROVED = "factoring.approved",
  FACTORING_REJECTED = "factoring.rejected",
  WEEKLY_PAYOUT_INITIATED = "weekly_payout.initiated",
  WEEKLY_PAYOUT_COMPLETED = "weekly_payout.completed",
}

// Finqle webhook data interfaces
interface PaymentInitiatedData {
  paymentId: string;
  invoiceId: string;
  amount: number;
  merchantId: string;
}

interface PaymentCompletedData {
  paymentId: string;
  invoiceId: string;
  amount: number;
  merchantId: string;
  payoutDate: string;
}

interface PaymentFailedData {
  paymentId: string;
  invoiceId: string;
  amount: number;
  merchantId: string;
  reason: string;
}

interface InvoiceCreatedData {
  invoiceId: string;
  merchantId: string;
  amount: number;
  dueDate: string;
  opdrachtId: string;
}

interface InvoicePaidData {
  invoiceId: string;
  paymentDate: string;
  amount: number;
}

interface InvoiceOverdueData {
  invoiceId: string;
  daysOverdue: number;
  amount: number;
}

interface KYCApprovedData {
  merchantId: string;
  approvedAt: string;
}

interface KYCRejectedData {
  merchantId: string;
  reason: string;
  rejectedAt: string;
}

interface DirectPaymentApprovedData {
  requestId: string;
  merchantId: string;
  debtorId: string;
  amount: number;
  approvedAt: string;
}

interface DirectPaymentRejectedData {
  requestId: string;
  merchantId: string;
  debtorId: string;
  amount: number;
  reason: string;
}

interface WeeklyPayoutCompletedData {
  payoutId: string;
  merchantId: string;
  totalAmount: number;
  invoiceCount: number;
  payoutDate: string;
}

// Union type for all possible webhook data
type FinqleWebhookData =
  | PaymentInitiatedData
  | PaymentCompletedData
  | PaymentFailedData
  | InvoiceCreatedData
  | InvoicePaidData
  | InvoiceOverdueData
  | KYCApprovedData
  | KYCRejectedData
  | DirectPaymentApprovedData
  | DirectPaymentRejectedData
  | WeeklyPayoutCompletedData;

interface FinqleWebhookPayload {
  event: FinqleWebhookEvent;
  timestamp: string;
  data: FinqleWebhookData;
  signature?: string;
}

// Verify webhook signature (optional but recommended for security)
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

// POST /api/webhooks/finqle - Handle Finqle webhook events
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const bodyText = await request.text();
    const payload: FinqleWebhookPayload = JSON.parse(bodyText);

    // Optional: Verify webhook signature if Finqle provides one
    const signature = request.headers.get("x-finqle-signature");
    const webhookSecret = process.env.FINQLE_WEBHOOK_SECRET;

    if (signature && webhookSecret) {
      const isValid = verifyWebhookSignature(
        bodyText,
        signature,
        webhookSecret,
      );
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    console.log(`Received Finqle webhook: ${payload.event}`, payload.data);

    // Handle different webhook events
    switch (payload.event) {
      case FinqleWebhookEvent.PAYMENT_INITIATED:
        await handlePaymentInitiated(payload.data as PaymentInitiatedData);
        break;

      case FinqleWebhookEvent.PAYMENT_COMPLETED:
        await handlePaymentCompleted(payload.data as PaymentCompletedData);
        break;

      case FinqleWebhookEvent.PAYMENT_FAILED:
        await handlePaymentFailed(payload.data as PaymentFailedData);
        break;

      case FinqleWebhookEvent.INVOICE_CREATED:
        await handleInvoiceCreated(payload.data as InvoiceCreatedData);
        break;

      case FinqleWebhookEvent.INVOICE_PAID:
        await handleInvoicePaid(payload.data as InvoicePaidData);
        break;

      case FinqleWebhookEvent.INVOICE_OVERDUE:
        await handleInvoiceOverdue(payload.data as InvoiceOverdueData);
        break;

      case FinqleWebhookEvent.KYC_APPROVED:
        await handleKYCApproved(payload.data as KYCApprovedData);
        break;

      case FinqleWebhookEvent.KYC_REJECTED:
        await handleKYCRejected(payload.data as KYCRejectedData);
        break;

      case FinqleWebhookEvent.DIRECT_PAYMENT_APPROVED:
        await handleDirectPaymentApproved(
          payload.data as DirectPaymentApprovedData,
        );
        break;

      case FinqleWebhookEvent.DIRECT_PAYMENT_REJECTED:
        await handleDirectPaymentRejected(
          payload.data as DirectPaymentRejectedData,
        );
        break;

      case FinqleWebhookEvent.WEEKLY_PAYOUT_COMPLETED:
        await handleWeeklyPayoutCompleted(
          payload.data as WeeklyPayoutCompletedData,
        );
        break;

      default:
        console.log(`Unhandled webhook event: ${payload.event}`);
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Error processing Finqle webhook:", error);

    // Still return 200 to prevent retries for malformed requests
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 200 },
    );
  }
}

// Handler functions for each event type

async function handlePaymentInitiated(data: PaymentInitiatedData) {
  const { paymentId, invoiceId, amount, merchantId } = data;

  // Update payment record
  const _payment = await prisma.betaling.updateMany({
    where: {
      verzamelFactuurId: invoiceId,
      finqleReferentie: paymentId,
    },
    data: {
      status: "PROCESSING",
      metadata: {
        finqleStatus: "initiated",
        initiatedAt: new Date().toISOString(),
      },
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: merchantId, // This should map to actual user ID
      type: "PAYMENT_UPDATE" as any,
      category: "PAYMENT",
      title: "Betaling wordt verwerkt",
      message: `Je betaling van €${amount} wordt verwerkt door Finqle`,
      actionUrl: `/dashboard/betalingen/${paymentId}`,
    },
  });

  // Broadcast payment event
  await broadcastPaymentEvent(BroadcastEvent.PAYMENT_INITIATED, {
    paymentId,
    invoiceId,
    amount,
    status: "PROCESSING",
  });
}

async function handlePaymentCompleted(data: PaymentCompletedData) {
  const { paymentId, invoiceId, amount, merchantId, payoutDate } = data;

  // Update payment record
  const payment = await prisma.betaling.update({
    where: {
      finqleReferentie: paymentId,
    },
    data: {
      status: "PAID",
      paidAt: new Date(payoutDate),
      finqleReferentie: paymentId as any,
      metadata: {
        finqleStatus: "completed",
        completedAt: new Date().toISOString(),
        payoutDate,
      },
    },
    include: {
      verzamelFactuur: true,
    },
  });

  // Update related invoice
  if (payment.factuurId) {
    await prisma.factuur.update({
      where: { id: payment.factuurId },
      data: { status: "BETAALD" },
    });
  }

  // Create notification for recipient based on ontvangerId
  const recipientUserId = payment.ontvangerId;
  if (recipientUserId) {
    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: "PAYMENT_UPDATE" as any,
        category: "PAYMENT",
        title: "Betaling ontvangen!",
        message: `Je hebt €${amount} ontvangen via Finqle`,
        actionUrl: `/dashboard/betalingen/${paymentId}`,
      },
    });
  }

  // Broadcast payment completed event
  await broadcastPaymentEvent(BroadcastEvent.PAYMENT_COMPLETED, payment, {
    payoutDate,
  });
}

async function handlePaymentFailed(data: PaymentFailedData) {
  const { paymentId, invoiceId, amount, merchantId, reason } = data;

  // Update payment record
  const _payment = await prisma.betaling.updateMany({
    where: {
      finqleReferentie: paymentId,
    },
    data: {
      status: "FAILED",
      metadata: {
        finqleStatus: "failed",
        failedAt: new Date().toISOString(),
        failureReason: reason,
      },
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: merchantId,
      type: "PAYMENT_UPDATE" as any,
      category: "PAYMENT",
      title: "Betaling mislukt",
      message: `Je betaling van €${amount} is mislukt: ${reason}`,
      actionUrl: `/dashboard/betalingen/${paymentId}`,
      priority: "HIGH",
    },
  });

  // Broadcast payment failed event
  await broadcastPaymentEvent(BroadcastEvent.PAYMENT_FAILED, {
    paymentId,
    invoiceId,
    amount,
    reason,
  });
}

async function handleInvoiceCreated(data: InvoiceCreatedData) {
  const { invoiceId, merchantId, amount, dueDate, opdrachtId } = data;

  // Create or update invoice record
  const _invoice = await prisma.factuur.upsert({
    where: { externalId: invoiceId },
    create: {
      externalId: invoiceId,
      nummer: `INV-${Date.now()}`,
      bedrag: amount,
      vervaldatum: new Date(dueDate),
      status: "OPEN",
      opdrachtId: opdrachtId,
      // Need to determine which profile this belongs to
      metadata: {
        finqleInvoiceId: invoiceId,
        createdVia: "finqle_webhook",
      },
    },
    update: {
      status: "OPEN",
      metadata: {
        finqleInvoiceId: invoiceId,
      },
    },
  });
}

async function handleInvoicePaid(data: InvoicePaidData) {
  const { invoiceId, paymentDate, amount } = data;

  // Update invoice status
  const invoice = await prisma.factuur.update({
    where: { externalId: invoiceId },
    data: {
      status: "BETAALD",
      metadata: {
        paidAt: paymentDate,
        paidAmount: amount,
      },
    },
    include: {
      zzp: true,
      bedrijf: true,
    },
  });

  // Create notification
  const userId = invoice.zzp?.userId || invoice.bedrijf?.userId;
  if (userId) {
    await prisma.notification.create({
      data: {
        userId,
        type: "PAYMENT_UPDATE" as any,
        category: "PAYMENT",
        title: "Factuur betaald",
        message: `Factuur ${invoice.nummer} is betaald (€${amount})`,
        actionUrl: `/dashboard/facturen/${invoice.id}`,
      },
    });
  }
}

async function handleInvoiceOverdue(data: InvoiceOverdueData) {
  const { invoiceId, daysOverdue, amount } = data;

  // Update invoice status
  const invoice = await prisma.factuur.update({
    where: { externalId: invoiceId },
    data: {
      status: "ACHTERSTALLIG",
      metadata: {
        overdueNotificationSent: new Date().toISOString(),
        daysOverdue,
      },
    },
    include: {
      opdrachtgever: true,
    },
  });

  // Create notification for opdrachtgever
  if (invoice.opdrachtgeverId) {
    await prisma.notification.create({
      data: {
        userId: invoice.opdrachtgever?.userId,
        type: "PAYMENT_UPDATE" as any,
        category: "PAYMENT",
        title: "Factuur achterstallig",
        message: `Factuur ${invoice.nummer} is ${daysOverdue} dagen achterstallig (€${amount})`,
        actionUrl: `/dashboard/facturen/${invoice.id}`,
        priority: "HIGH",
      },
    });
  }
}

async function handleKYCApproved(data: KYCApprovedData) {
  const { merchantId, approvedAt } = data;

  // Update user's Finqle status
  const _profiles = await Promise.all([
    prisma.zZPProfile.updateMany({
      where: { finqleMerchantId: merchantId },
      data: {
        finqleKYCStatus: "APPROVED",
        finqleVerifiedAt: new Date(approvedAt),
      },
    }),
    prisma.bedrijfProfile.updateMany({
      where: { finqleMerchantId: merchantId },
      data: {
        finqleKYCStatus: "APPROVED",
        finqleVerifiedAt: new Date(approvedAt),
      },
    }),
  ]);

  // Find user and create notification
  const zzp = await prisma.zZPProfile.findFirst({
    where: { finqleMerchantId: merchantId },
    include: { user: true },
  });

  const bedrijf = await prisma.bedrijfProfile.findFirst({
    where: { finqleMerchantId: merchantId },
    include: { user: true },
  });

  const user = zzp?.user || bedrijf?.user;

  if (user) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "KYC_UPDATE" as any,
        category: "PAYMENT",
        title: "Finqle verificatie goedgekeurd!",
        message: "Je kunt nu directe betalingen ontvangen via Finqle",
        actionUrl: "/dashboard/instellingen/betalingen",
      },
    });
  }
}

async function handleKYCRejected(data: KYCRejectedData) {
  const { merchantId, reason, rejectedAt } = data;

  // Update user's Finqle status
  await Promise.all([
    prisma.zZPProfile.updateMany({
      where: { finqleMerchantId: merchantId },
      data: {
        finqleKYCStatus: "REJECTED",
      },
    }),
    prisma.bedrijfProfile.updateMany({
      where: { finqleMerchantId: merchantId },
      data: {
        finqleKYCStatus: "REJECTED",
      },
    }),
  ]);

  // Find user and create notification
  const zzp = await prisma.zZPProfile.findFirst({
    where: { finqleMerchantId: merchantId },
    include: { user: true },
  });

  const bedrijf = await prisma.bedrijfProfile.findFirst({
    where: { finqleMerchantId: merchantId },
    include: { user: true },
  });

  const user = zzp?.user || bedrijf?.user;

  if (user) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "KYC_UPDATE" as any,
        category: "PAYMENT",
        title: "Finqle verificatie afgewezen",
        message: `Je verificatie is afgewezen: ${reason}`,
        actionUrl: "/dashboard/instellingen/betalingen",
        priority: "HIGH",
      },
    });
  }
}

async function handleDirectPaymentApproved(data: DirectPaymentApprovedData) {
  const { requestId, merchantId, debtorId, amount, approvedAt } = data;

  // Create notification for merchant
  const zzp = await prisma.zZPProfile.findFirst({
    where: { finqleMerchantId: merchantId },
    include: { user: true },
  });

  if (zzp?.user) {
    await prisma.notification.create({
      data: {
        userId: zzp.user.id,
        type: "PAYMENT_UPDATE" as any,
        category: "PAYMENT",
        title: "Directe betaling goedgekeurd",
        message: `Je directe betaling van €${amount} is goedgekeurd`,
        actionUrl: "/dashboard/betalingen",
      },
    });
  }
}

async function handleDirectPaymentRejected(data: DirectPaymentRejectedData) {
  const { requestId, merchantId, debtorId, amount, reason } = data;

  // Create notification for merchant
  const zzp = await prisma.zZPProfile.findFirst({
    where: { finqleMerchantId: merchantId },
    include: { user: true },
  });

  if (zzp?.user) {
    await prisma.notification.create({
      data: {
        userId: zzp.user.id,
        type: "PAYMENT_UPDATE" as any,
        category: "PAYMENT",
        title: "Directe betaling afgewezen",
        message: `Je directe betaling van €${amount} is afgewezen: ${reason}`,
        actionUrl: "/dashboard/betalingen",
        priority: "HIGH",
      },
    });
  }
}

async function handleWeeklyPayoutCompleted(data: WeeklyPayoutCompletedData) {
  const { payoutId, merchantId, totalAmount, invoiceCount, payoutDate } = data;

  // Find merchant
  const zzp = await prisma.zZPProfile.findFirst({
    where: { finqleMerchantId: merchantId },
    include: { user: true },
  });

  const bedrijf = await prisma.bedrijfProfile.findFirst({
    where: { finqleMerchantId: merchantId },
    include: { user: true },
  });

  const user = zzp?.user || bedrijf?.user;

  if (user) {
    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "PAYMENT_UPDATE" as any,
        category: "PAYMENT",
        title: "Wekelijkse uitbetaling voltooid",
        message: `€${totalAmount} voor ${invoiceCount} facturen is uitbetaald`,
        actionUrl: "/dashboard/betalingen",
      },
    });

    // Update payment records
    await prisma.betaling.updateMany({
      where: {
        OR: [{ zzpId: zzp?.id }, { bedrijfId: bedrijf?.id }],
        status: "PROCESSING",
        metadata: {
          path: ["payoutBatch"],
          equals: payoutId,
        },
      },
      data: {
        status: "PAID",
        betaalDatum: new Date(payoutDate),
      },
    });
  }
}
