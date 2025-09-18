import crypto from "node:crypto";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  BroadcastEvent,
  broadcastOpdrachtEvent,
} from "@/lib/supabase/broadcast";

// Finqle webhook event types
type FinqleEventType =
  | "payment.initiated"
  | "payment.completed"
  | "payment.failed"
  | "payment.refunded"
  | "payout.initiated"
  | "payout.completed"
  | "payout.failed"
  | "kyc.approved"
  | "kyc.rejected"
  | "kyc.pending"
  | "invoice.generated"
  | "invoice.paid"
  | "batch_payout.initiated"
  | "batch_payout.completed"
  | "direct_payment.approved"
  | "direct_payment.rejected";

interface FinqleWebhookPayload {
  event: FinqleEventType;
  timestamp: string;
  data: {
    payment_id?: string;
    payout_id?: string;
    user_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
    error_code?: string;
    error_message?: string;
    invoice_id?: string;
    batch_id?: string;
    kyc_status?: string;
    kyc_documents?: Array<{
      type: string;
      status: string;
      reason?: string;
    }>;
  };
}

// POST /api/bedrijf/webhooks/finqle - Handle Finqle webhooks
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const headersList = await headers();
    const signature = headersList.get("x-finqle-signature");
    const timestamp = headersList.get("x-finqle-timestamp");

    if (!signature || !timestamp) {
      console.error("Missing Finqle webhook signature or timestamp");
      return NextResponse.json(
        { success: false, error: "Missing webhook headers" },
        { status: 400 },
      );
    }

    const body = await request.text();

    // Verify webhook signature (implement based on Finqle docs)
    if (!verifyFinqleSignature(body, signature, timestamp)) {
      console.error("Invalid Finqle webhook signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    const payload: FinqleWebhookPayload = JSON.parse(body);

    console.log(`Processing Finqle webhook: ${payload.event}`, {
      timestamp: payload.timestamp,
      paymentId: payload.data.payment_id,
      userId: payload.data.user_id,
    });

    // Process webhook based on event type
    switch (payload.event) {
      case "payment.initiated":
        await handlePaymentInitiated(payload);
        break;

      case "payment.completed":
        await handlePaymentCompleted(payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload);
        break;

      case "payout.initiated":
        await handlePayoutInitiated(payload);
        break;

      case "payout.completed":
        await handlePayoutCompleted(payload);
        break;

      case "payout.failed":
        await handlePayoutFailed(payload);
        break;

      case "kyc.approved":
        await handleKycApproved(payload);
        break;

      case "kyc.rejected":
        await handleKycRejected(payload);
        break;

      case "invoice.generated":
        await handleInvoiceGenerated(payload);
        break;

      case "batch_payout.completed":
        await handleBatchPayoutCompleted(payload);
        break;

      case "direct_payment.approved":
        await handleDirectPaymentApproved(payload);
        break;

      default:
        console.log(`Unhandled Finqle webhook event: ${payload.event}`);
    }

    return NextResponse.json({
      success: true,
      message: `Webhook ${payload.event} processed successfully`,
    });
  } catch (error) {
    console.error("Error processing Finqle webhook:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

// Signature verification
function verifyFinqleSignature(
  body: string,
  signature: string,
  timestamp: string,
): boolean {
  try {
    const webhookSecret = process.env.FINQLE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("FINQLE_WEBHOOK_SECRET not configured");
      return false;
    }

    // Check timestamp to prevent replay attacks (within 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp, 10);
    if (Math.abs(currentTime - webhookTime) > 300) {
      console.error("Webhook timestamp too old");
      return false;
    }

    // Calculate expected signature
    const payload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    // Compare signatures securely
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Payment initiated - log the payment attempt
async function handlePaymentInitiated(payload: FinqleWebhookPayload) {
  const { payment_id, amount } = payload.data;

  try {
    // Find the related betalingsaanvraag
    const betaling = await prisma.betaling.findFirst({
      where: {
        finqleReferentie: payment_id,
      },
    });

    if (betaling) {
      await prisma.betaling.update({
        where: { id: betaling.id },
        data: {
          status: "PENDING",
          paidAt: new Date(),
        },
      });

      // Broadcast payment status update
      await broadcastPaymentUpdate(betaling.zzpProfileId, {
        type: "payment_initiated",
        paymentId: payment_id,
        amount: amount,
        status: "processing",
      });
    }
  } catch (error) {
    console.error("Error handling payment.initiated:", error);
  }
}

// Payment completed - update status and notify users
async function handlePaymentCompleted(payload: FinqleWebhookPayload) {
  const { payment_id, amount } = payload.data;

  try {
    const betaling = await prisma.betaling.findFirst({
      where: {
        finqleReferentie: payment_id,
      },
      include: {
        zzpProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (betaling) {
      await prisma.betaling.update({
        where: { id: betaling.id },
        data: {
          status: "PAID",
          uitbetalingsDatum: new Date(),
          finqlePaymentId: payment_id,
        },
      });

      // Broadcast successful payment
      await broadcastPaymentUpdate(betaling.zzpProfileId, {
        type: "payment_completed",
        paymentId: payment_id,
        amount: Number(amount),
        status: "completed",
      });

      // Create notification for ZZP
      await createPaymentNotification(betaling.zzpProfile.user.id, {
        type: "payment_received",
        title: "Betaling ontvangen",
        message: `Je uitbetaling van €${amount} is succesvol verwerkt`,
        amount: Number(amount),
      });
    }
  } catch (error) {
    console.error("Error handling payment.completed:", error);
  }
}

// Payment failed - notify and allow retry
async function handlePaymentFailed(payload: FinqleWebhookPayload) {
  const { payment_id, error_code, error_message } = payload.data;

  try {
    const betaling = await prisma.betaling.findFirst({
      where: {
        finqleReferentie: payment_id,
      },
      include: {
        zzpProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (betaling) {
      await prisma.betaling.update({
        where: { id: betaling.id },
        data: {
          status: "FAILED",
          finqlePaymentId: payment_id,
          opmerkingen: `Payment failed: ${error_message} (${error_code})`,
        },
      });

      // Broadcast payment failure
      await broadcastPaymentUpdate(betaling.zzpProfileId, {
        type: "payment_failed",
        paymentId: payment_id,
        status: "failed",
        error: error_message,
      });

      // Create notification for ZZP
      await createPaymentNotification(betaling.zzpProfile.user.id, {
        type: "payment_failed",
        title: "Betaling mislukt",
        message: `Je uitbetaling is mislukt: ${error_message}. Controleer je bankgegevens.`,
        error: error_message,
      });
    }
  } catch (error) {
    console.error("Error handling payment.failed:", error);
  }
}

// KYC approved - enable payments for user
async function handleKycApproved(payload: FinqleWebhookPayload) {
  const { user_id } = payload.data;

  try {
    // Find user by Finqle user ID or other mapping
    const user = await prisma.user.findFirst({
      where: {
        // Assuming we store Finqle user ID somewhere
        // This might need adjustment based on your user model
        email: { contains: user_id }, // Temporary - adjust based on actual mapping
      },
      include: {
        zzpProfile: true,
      },
    });

    if (user?.zzpProfile) {
      await prisma.zZPProfile.update({
        where: { id: user.zzpProfile.id },
        data: {
          // KYC status not tracked in current schema
          finqleMerchantId: user_id,
        },
      });

      // Broadcast KYC approval
      await broadcastUserUpdate(user.id, {
        type: "kyc_approved",
        status: "verified",
      });

      // Create notification
      await createPaymentNotification(user.id, {
        type: "kyc_approved",
        title: "Verificatie voltooid",
        message:
          "Je account is geverifieerd. Je kunt nu uitbetalingen ontvangen.",
      });
    }
  } catch (error) {
    console.error("Error handling kyc.approved:", error);
  }
}

// KYC rejected - notify user and request re-submission
async function handleKycRejected(payload: FinqleWebhookPayload) {
  const { user_id, kyc_documents } = payload.data;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: { contains: user_id },
      },
      include: {
        zzpProfile: true,
      },
    });

    if (user?.zzpProfile) {
      await prisma.zZPProfile.update({
        where: { id: user.zzpProfile.id },
        data: {
          // KYC status not tracked in current schema
        },
      });

      // Get rejection reasons
      const rejectionReasons = kyc_documents
        ?.filter((doc) => doc.status === "rejected")
        .map((doc) => doc.reason)
        .join(", ");

      // Create notification
      await createPaymentNotification(user.id, {
        type: "kyc_rejected",
        title: "Verificatie afgewezen",
        message: `Je verificatie is afgewezen. Reden: ${rejectionReasons}. Upload nieuwe documenten.`,
        error: rejectionReasons,
      });
    }
  } catch (error) {
    console.error("Error handling kyc.rejected:", error);
  }
}

// Batch payout completed - update multiple payments
async function handleBatchPayoutCompleted(payload: FinqleWebhookPayload) {
  const { batch_id } = payload.data;

  try {
    // Update all payments in this batch
    await prisma.betaling.updateMany({
      where: {
        finqleBatchId: batch_id,
      },
      data: {
        status: "BETAALD",
        uitbetalingsDatum: new Date(),
      },
    });

    console.log(`Batch payout completed: ${batch_id}`);
  } catch (error) {
    console.error("Error handling batch_payout.completed:", error);
  }
}

// Helper functions
async function handlePayoutInitiated(payload: FinqleWebhookPayload) {
  // Similar to payment initiated but for payouts
  console.log("Payout initiated:", payload.data);
}

async function handlePayoutCompleted(payload: FinqleWebhookPayload) {
  // Handle payout completion
  console.log("Payout completed:", payload.data);
}

async function handlePayoutFailed(payload: FinqleWebhookPayload) {
  // Handle payout failure
  console.log("Payout failed:", payload.data);
}

async function handleInvoiceGenerated(payload: FinqleWebhookPayload) {
  // Handle invoice generation
  console.log("Invoice generated:", payload.data);
}

async function handleDirectPaymentApproved(payload: FinqleWebhookPayload) {
  // Handle direct payment approval
  console.log("Direct payment approved:", payload.data);
}

interface PaymentUpdate {
  type: string;
  paymentId?: string;
  amount?: number;
  status: string;
  error?: string;
}

async function broadcastPaymentUpdate(
  zzpProfileId: string,
  update: PaymentUpdate,
) {
  try {
    await broadcastOpdrachtEvent(BroadcastEvent.PAYMENT_COMPLETED, {
      zzpProfileId,
      ...update,
    });
  } catch (error) {
    console.error("Error broadcasting payment update:", error);
  }
}

interface UserUpdate {
  type: string;
  status?: string;
  notification?: {
    type: string;
    title: string;
    message: string;
    amount?: number;
    error?: string;
  };
}

async function broadcastUserUpdate(userId: string, update: UserUpdate) {
  try {
    // User updates not handled via broadcast events in current system
    console.log("User update:", { userId, update });
  } catch (error) {
    console.error("Error broadcasting user update:", error);
  }
}

async function createPaymentNotification(
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    amount?: number;
    error?: string;
  },
) {
  try {
    // This would create a notification record
    // For now, we'll just broadcast it
    await broadcastUserUpdate(userId, {
      type: "notification",
      notification,
    });
  } catch (error) {
    console.error("Error creating payment notification:", error);
  }
}
