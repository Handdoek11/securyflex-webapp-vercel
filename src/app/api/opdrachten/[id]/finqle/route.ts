import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFinqleClient } from "@/lib/finqle/client";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/opdrachten/[id]/finqle/check - Check Finqle direct payment eligibility
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: opdrachtId } = await params;
    const { action } = await request.json();

    if (action === "check") {
      // Check direct payment eligibility
      const opdracht = await prisma.opdracht.findUnique({
        where: { id: opdrachtId },
        include: {
          opdrachtgever: true,
          werkuren: {
            where: {
              status: "APPROVED",
              finqleTransaction: null,
            },
          },
        },
      });

      if (!opdracht) {
        return NextResponse.json(
          { success: false, error: "Opdracht niet gevonden" },
          { status: 404 },
        );
      }

      // Check if opdrachtgever has Finqle debtor ID
      if (!opdracht.opdrachtgever.finqleDebtorId) {
        return NextResponse.json({
          success: false,
          error: "Opdrachtgever is niet geregistreerd bij Finqle",
          requiresOnboarding: true,
        });
      }

      // Calculate total amount for unpaid werkuren
      const totalAmount = opdracht.werkuren.reduce((sum, werkuur) => {
        return sum + Number(werkuur.urenGewerkt) * Number(werkuur.uurtarief);
      }, 0);

      // Check credit with Finqle
      const finqleClient = getFinqleClient();
      const creditCheck = await finqleClient.checkCredit(
        opdracht.opdrachtgever.finqleDebtorId,
        totalAmount,
      );

      if (!creditCheck.success || !creditCheck.data) {
        return NextResponse.json({
          success: false,
          error: "Kon krediet niet controleren",
          eligibleForDirectPayment: false,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          eligibleForDirectPayment: creditCheck.data.directPaymentEligible,
          creditAvailable: creditCheck.data.creditAvailable,
          creditLimit: creditCheck.data.creditLimit,
          requestedAmount: totalAmount,
          unpaidWerkuren: opdracht.werkuren.length,
        },
      });
    } else if (action === "approve") {
      // Approve werkuren for payment
      const { werkuurIds, requestDirectPayment } = await request.json();

      if (!werkuurIds || !Array.isArray(werkuurIds)) {
        return NextResponse.json(
          { success: false, error: "Invalid werkuur IDs" },
          { status: 400 },
        );
      }

      // Get werkuren with ZZP details
      const werkuren = await prisma.werkuur.findMany({
        where: {
          id: { in: werkuurIds },
          opdrachtId,
          status: "APPROVED",
        },
        include: {
          opdracht: {
            include: {
              opdrachtgever: true,
              assignments: {
                include: {
                  teamLid: {
                    include: {
                      zzp: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (werkuren.length !== werkuurIds.length) {
        return NextResponse.json(
          {
            success: false,
            error: "Een of meer werkuren zijn niet beschikbaar voor betaling",
          },
          { status: 400 },
        );
      }

      const finqleClient = getFinqleClient();
      const finqleTransactions = [];

      for (const werkuur of werkuren) {
        // Find the ZZP for this werkuur
        const assignment = werkuur.opdracht.assignments.find(
          (a) => a.teamLid.zzpId === werkuur.beveiligerId,
        );

        if (!assignment) {
          console.error(`No assignment found for werkuur ${werkuur.id}`);
          continue;
        }

        const zzp = assignment.teamLid.zzp;

        // Check if ZZP has Finqle merchant ID
        if (!zzp.finqleMerchantId) {
          console.error(`ZZP ${zzp.id} has no Finqle merchant ID`);
          continue;
        }

        const amount = Number(werkuur.urenGewerkt) * Number(werkuur.uurtarief);
        const platformFee =
          Number(werkuur.platformFee) * Number(werkuur.urenGewerkt);

        // Create billing request in Finqle
        const billingRequest = await finqleClient.createBillingRequest({
          debtorId: werkuur.opdracht.opdrachtgever.finqleDebtorId!,
          projectId: werkuur.opdrachtId,
          merchantId: zzp.finqleMerchantId,
          hours: Number(werkuur.urenGewerkt),
          tariff: Number(werkuur.uurtarief),
          expenses: platformFee,
          description: `Werkuren ${werkuur.startTijd.toISOString().split("T")[0]} - Opdracht: ${werkuur.opdracht.titel}`,
        });

        if (!billingRequest.success || !billingRequest.data) {
          console.error(
            `Failed to create billing request for werkuur ${werkuur.id}`,
          );
          continue;
        }

        // Create Finqle transaction record
        const finqleTransaction = await prisma.finqleTransaction.create({
          data: {
            werkuurId: werkuur.id,
            merchantId: zzp.finqleMerchantId,
            debtorId: werkuur.opdracht.opdrachtgever.finqleDebtorId!,
            amount,
            directPayment: requestDirectPayment || false,
            finqleRequestId: billingRequest.data.requestId,
            status: "PENDING",
          },
        });

        finqleTransactions.push(finqleTransaction);

        // If direct payment requested, process it
        if (requestDirectPayment) {
          const directPaymentResult = await finqleClient.requestDirectPayment(
            zzp.finqleMerchantId,
            amount,
            billingRequest.data.requestId,
          );

          if (
            directPaymentResult.success &&
            directPaymentResult.data?.approved
          ) {
            await prisma.finqleTransaction.update({
              where: { id: finqleTransaction.id },
              data: {
                status: "APPROVED",
                directPayment: true,
              },
            });

            // Update werkuur status to PAID
            await prisma.werkuur.update({
              where: { id: werkuur.id },
              data: { status: "PAID" },
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `${finqleTransactions.length} werkuren verwerkt voor betaling`,
        data: {
          processedCount: finqleTransactions.length,
          totalAmount: finqleTransactions.reduce(
            (sum, t) => sum + Number(t.amount),
            0,
          ),
          directPaymentRequested: requestDirectPayment,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error processing Finqle request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Finqle request" },
      { status: 500 },
    );
  }
}

// GET /api/opdrachten/[id]/finqle - Get Finqle payment status
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: opdrachtId } = await params;

    // Get Finqle transactions for this opdracht
    const transactions = await prisma.finqleTransaction.findMany({
      where: {
        werkuur: {
          opdrachtId,
        },
      },
      include: {
        werkuur: {
          select: {
            id: true,
            startTijd: true,
            eindTijd: true,
            urenGewerkt: true,
            uurtarief: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate statistics
    const stats = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      pending: transactions.filter((t) => t.status === "PENDING").length,
      approved: transactions.filter((t) => t.status === "APPROVED").length,
      paid: transactions.filter((t) => t.status === "PAID").length,
      failed: transactions.filter((t) => t.status === "FAILED").length,
      directPayments: transactions.filter((t) => t.directPayment).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.map((t) => ({
          id: t.id,
          werkuurId: t.werkuurId,
          amount: t.amount,
          status: t.status,
          directPayment: t.directPayment,
          finqleRequestId: t.finqleRequestId,
          finqleInvoiceId: t.finqleInvoiceId,
          createdAt: t.createdAt,
          werkuur: t.werkuur,
        })),
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching Finqle payment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment status" },
      { status: 500 },
    );
  }
}
