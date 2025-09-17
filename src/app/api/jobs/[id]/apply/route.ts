import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkDirectPaymentEligibility } from "@/lib/finqle/client";
import { broadcastSollicitatieEvent, broadcastOpdrachtEvent, BroadcastEvent } from "@/lib/supabase/broadcast";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/jobs/[id]/apply - Apply for a job
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Je moet ingelogd zijn om te solliciteren" },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    const data = await request.json();

    // Get user profile (ZZP or Bedrijf)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        zzpProfile: true,
        bedrijfProfile: {
          include: {
            teamLeden: {
              where: { status: "ACTIVE" }
            }
          }
        }
      }
    });

    if (!user?.zzpProfile && !user?.bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "Alleen ZZP'ers en beveiligingsbedrijven kunnen solliciteren" },
        { status: 403 }
      );
    }

    // Check if profile is complete
    if (user.zzpProfile && (!user.zzpProfile.kvkNummer || !user.zzpProfile.btwNummer)) {
      return NextResponse.json(
        { success: false, error: "Vul eerst je profiel volledig in" },
        { status: 400 }
      );
    }

    if (user.bedrijfProfile && (!user.bedrijfProfile.kvkNummer || !user.bedrijfProfile.btwNummer)) {
      return NextResponse.json(
        { success: false, error: "Vul eerst je bedrijfsprofiel volledig in" },
        { status: 400 }
      );
    }

    // Get job details
    const job = await prisma.opdracht.findUnique({
      where: { id: jobId },
      include: {
        sollicitaties: {
          where: {
            OR: [
              ...(user.zzpProfile ? [{ zzpId: user.zzpProfile.id }] : []),
              ...(user.bedrijfProfile ? [{ bedrijfId: user.bedrijfProfile.id }] : [])
            ]
          }
        },
        opdrachtgever: true,
        creatorBedrijf: true,
        acceptedBedrijf: true
      }
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Opdracht niet gevonden" },
        { status: 404 }
      );
    }

    // Check if job is still open
    if (job.status !== "OPEN" && job.status !== "URGENT") {
      return NextResponse.json(
        { success: false, error: "Deze opdracht is niet meer beschikbaar" },
        { status: 400 }
      );
    }

    // Check target audience restrictions
    if (user.zzpProfile) {
      if (job.targetAudience === "ALLEEN_BEDRIJVEN") {
        return NextResponse.json(
          { success: false, error: "Deze opdracht is alleen voor beveiligingsbedrijven" },
          { status: 403 }
        );
      }
      if (!job.directZZPAllowed && job.targetAudience !== "ALLEEN_ZZP") {
        return NextResponse.json(
          { success: false, error: "Directe ZZP sollicitaties zijn niet toegestaan voor deze opdracht" },
          { status: 403 }
        );
      }
    } else if (user.bedrijfProfile) {
      if (job.targetAudience === "ALLEEN_ZZP") {
        return NextResponse.json(
          { success: false, error: "Deze opdracht is alleen voor individuele ZZP'ers" },
          { status: 403 }
        );
      }
      if (job.targetAudience === "EIGEN_TEAM" && job.creatorBedrijfId !== user.bedrijfProfile.id) {
        return NextResponse.json(
          { success: false, error: "Deze opdracht is alleen voor het eigen team van het bedrijf" },
          { status: 403 }
        );
      }
    }

    // Check if already applied
    if (job.sollicitaties.length > 0) {
      return NextResponse.json(
        { success: false, error: "Je hebt al gesolliciteerd op deze opdracht" },
        { status: 400 }
      );
    }

    // Check if spots are available
    const acceptedCount = await prisma.opdrachtSollicitatie.count({
      where: {
        opdrachtId: jobId,
        status: "ACCEPTED"
      }
    });

    if (acceptedCount >= job.aantalBeveiligers) {
      return NextResponse.json(
        { success: false, error: "Alle plekken zijn al bezet" },
        { status: 400 }
      );
    }

    // Check Finqle eligibility if requested (for ZZP only)
    let finqleEligible = false;
    if (user.zzpProfile && data.requestDirectPayment) {
      const debtorId = job.opdrachtgeverId || job.creatorBedrijfId || "";
      const estimatedAmount = Number(job.uurtarief) * 8; // Estimate 8 hours
      finqleEligible = await checkDirectPaymentEligibility(debtorId, estimatedAmount);
    }

    // Determine sollicitant type
    const sollicitantType = user.zzpProfile ? "ZZP_BEVEILIGER" : "BEDRIJF";

    // Create application
    const application = await prisma.opdrachtSollicitatie.create({
      data: {
        opdrachtId: jobId,
        sollicitantType,
        ...(user.zzpProfile && { zzpId: user.zzpProfile.id }),
        ...(user.bedrijfProfile && {
          bedrijfId: user.bedrijfProfile.id,
          teamGrootte: data.teamGrootte || user.bedrijfProfile.teamLeden.length
        }),
        status: data.quickApply ? "PENDING" : "REVIEWING",
        motivatie: data.motivatie,
        voorgesteldTarief: data.voorgesteldTarief
      },
      include: {
        opdracht: true,
        zzp: user.zzpProfile ? {
          include: {
            user: true
          }
        } : undefined,
        bedrijf: user.bedrijfProfile ? true : undefined
      }
    });

    // Broadcast sollicitatie event
    await broadcastSollicitatieEvent(
      BroadcastEvent.SOLLICITATIE_CREATED,
      application,
      job
    );

    // Send notification to job owner
    const ownerName = job.opdrachtgever?.bedrijfsnaam || job.creatorBedrijf?.bedrijfsnaam;
    const sollicitantName = user.zzpProfile
      ? user.name
      : user.bedrijfProfile?.bedrijfsnaam;

    await prisma.notification.create({
      data: {
        userId: job.creatorId,
        type: "OPDRACHT_NEW",
        category: "OPDRACHT",
        title: "Nieuwe sollicitatie ontvangen",
        message: `${sollicitantName} heeft gesolliciteerd op "${job.titel}"`,
        actionUrl: `/dashboard/opdrachten/${jobId}/sollicitaties`
      }
    });

    // If quick apply and auto-accept is enabled, accept immediately
    if (data.quickApply && job.status === "URGENT" && job.autoAccept) {
      await prisma.opdrachtSollicitatie.update({
        where: { id: application.id },
        data: { status: "ACCEPTED" }
      });

      // Create shift entry for ZZP
      if (user.zzpProfile) {
        await prisma.werkuur.create({
          data: {
            zzpId: user.zzpProfile.id,
            opdrachtId: jobId,
            startTijd: job.startDatum,
            eindTijd: job.eindDatum,
            uurtarief: data.voorgesteldTarief || job.uurtarief,
            urenGewerkt: 0,
            startLocatie: {},
            platformFee: 2.99,
            status: "PENDING"
          }
        });
      }

      // Broadcast acceptance if auto-accepted
      await broadcastSollicitatieEvent(
        BroadcastEvent.SOLLICITATIE_ACCEPTED,
        application,
        job
      );

      return NextResponse.json({
        success: true,
        message: "Sollicitatie geaccepteerd! Check je shifts voor details.",
        data: {
          applicationId: application.id,
          status: "ACCEPTED",
          finqleEligible
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sollicitatie verstuurd!",
      data: {
        applicationId: application.id,
        status: application.status,
        finqleEligible
      }
    });

  } catch (error) {
    console.error("Error applying for job:", error);
    return NextResponse.json(
      { success: false, error: "Er ging iets mis bij het solliciteren" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id]/apply - Withdraw application
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        zzpProfile: true,
        bedrijfProfile: true
      }
    });

    if (!user?.zzpProfile && !user?.bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    // Find application
    const application = await prisma.opdrachtSollicitatie.findFirst({
      where: {
        opdrachtId: jobId,
        OR: [
          ...(user.zzpProfile ? [{ zzpId: user.zzpProfile.id }] : []),
          ...(user.bedrijfProfile ? [{ bedrijfId: user.bedrijfProfile.id }] : [])
        ]
      }
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Sollicitatie niet gevonden" },
        { status: 404 }
      );
    }

    // Check if can withdraw
    if (application.status === "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Geaccepteerde sollicitatie kan niet worden ingetrokken" },
        { status: 400 }
      );
    }

    // Delete application
    await prisma.opdrachtSollicitatie.delete({
      where: { id: application.id }
    });

    return NextResponse.json({
      success: true,
      message: "Sollicitatie ingetrokken"
    });

  } catch (error) {
    console.error("Error withdrawing application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to withdraw application" },
      { status: 500 }
    );
  }
}