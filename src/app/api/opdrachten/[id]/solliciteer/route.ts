import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { broadcastSollicitatieEvent, broadcastOpdrachtEvent, BroadcastEvent } from "@/lib/supabase/broadcast";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/opdrachten/[id]/solliciteer - Apply for opdracht (ZZP or Bedrijf)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: opdrachtId } = await params;

    // Schema for sollicitatie
    const solliciteerSchema = z.object({
      motivatie: z.string().optional(),
      voorgesteldTarief: z.number().optional(),
      teamGrootte: z.number().optional(), // For bedrijf sollicitaties
      beschikbareTeamLeden: z.array(z.string()).optional(), // Team member IDs
      requestDirectPayment: z.boolean().optional()
    });

    const body = await request.json();
    const validatedData = solliciteerSchema.parse(body);

    // Get user profile
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
        { success: false, error: "Only ZZP'ers and bedrijven can apply" },
        { status: 403 }
      );
    }

    // ND-NUMMER COMPLIANCE CHECK
    // Check if user has valid ND-nummer for security work
    let ndNummerValid = false;
    let ndNummerStatus = null;
    let ndNummerExpiry = null;

    if (user.zzpProfile) {
      ndNummerStatus = user.zzpProfile.ndNummerStatus;
      ndNummerExpiry = user.zzpProfile.ndNummerVervalDatum;
      ndNummerValid = ndNummerStatus === 'ACTIEF' &&
                      ndNummerExpiry &&
                      new Date(ndNummerExpiry) > new Date();
    } else if (user.bedrijfProfile) {
      ndNummerStatus = user.bedrijfProfile.ndNummerStatus;
      ndNummerExpiry = user.bedrijfProfile.ndNummerVervalDatum;
      ndNummerValid = ndNummerStatus === 'ACTIEF' &&
                      ndNummerExpiry &&
                      new Date(ndNummerExpiry) > new Date();
    }

    // Block application if ND-nummer is not valid
    if (!ndNummerValid) {
      const errorMessage = !ndNummerStatus || ndNummerStatus === 'NIET_GEREGISTREERD'
        ? "Een geldig ND-nummer is verplicht voor beveiligingsopdrachten. Registreer uw ND-nummer in uw dashboard."
        : ndNummerStatus === 'VERLOPEN'
        ? "Uw ND-nummer is verlopen. Vernieuw uw ND-nummer om opdrachten te kunnen accepteren."
        : ndNummerStatus === 'GESCHORST'
        ? "Uw ND-nummer is geschorst. Neem contact op met Justis voor meer informatie."
        : ndNummerStatus === 'INGETROKKEN'
        ? "Uw ND-nummer is ingetrokken. U kunt geen beveiligingsopdrachten meer uitvoeren."
        : "Uw ND-nummer is niet actief. Controleer uw compliance status in het dashboard.";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          complianceError: true,
          ndNummerStatus,
          actionUrl: "/dashboard/compliance"
        },
        { status: 403 }
      );
    }

    // Warn if ND-nummer expires soon (within 30 days)
    if (ndNummerExpiry) {
      const daysUntilExpiry = Math.ceil(
        (new Date(ndNummerExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        // Log warning but allow application
        console.warn(`User ${user.id} applying with ND-nummer expiring in ${daysUntilExpiry} days`);
      }
    }

    // Get opdracht details
    const opdracht = await prisma.opdracht.findUnique({
      where: { id: opdrachtId },
      include: {
        sollicitaties: true,
        assignments: true,
        opdrachtgever: true,
        creatorBedrijf: true
      }
    });

    if (!opdracht) {
      return NextResponse.json(
        { success: false, error: "Opdracht not found" },
        { status: 404 }
      );
    }

    // Check if opdracht is open for applications
    if (!["OPEN", "URGENT"].includes(opdracht.status)) {
      return NextResponse.json(
        { success: false, error: "Deze opdracht is niet meer open voor sollicitaties" },
        { status: 400 }
      );
    }

    // Determine sollicitant type
    const sollicitantType = user.zzpProfile ? "ZZP_BEVEILIGER" : "BEDRIJF";

    // Check target audience restrictions
    if (user.zzpProfile) {
      // ZZP checks
      if (opdracht.targetAudience === "ALLEEN_BEDRIJVEN") {
        return NextResponse.json(
          { success: false, error: "Deze opdracht is alleen voor bedrijven" },
          { status: 403 }
        );
      }

      if (!opdracht.directZZPAllowed && opdracht.targetAudience !== "ALLEEN_ZZP") {
        return NextResponse.json(
          { success: false, error: "Directe ZZP sollicitaties zijn niet toegestaan" },
          { status: 403 }
        );
      }

      // Check if already applied
      const existingSollicitatie = opdracht.sollicitaties.find(
        s => s.zzpId === user.zzpProfile!.id
      );

      if (existingSollicitatie) {
        return NextResponse.json(
          { success: false, error: "Je hebt al gesolliciteerd op deze opdracht" },
          { status: 409 }
        );
      }
    } else if (user.bedrijfProfile) {
      // Bedrijf checks
      if (opdracht.targetAudience === "ALLEEN_ZZP") {
        return NextResponse.json(
          { success: false, error: "Deze opdracht is alleen voor individuele ZZP'ers" },
          { status: 403 }
        );
      }

      if (opdracht.targetAudience === "EIGEN_TEAM" && opdracht.creatorBedrijfId !== user.bedrijfProfile.id) {
        return NextResponse.json(
          { success: false, error: "Deze opdracht is alleen voor het eigen team van het bedrijf" },
          { status: 403 }
        );
      }

      // Check team size requirements
      const teamSize = validatedData.teamGrootte || user.bedrijfProfile.teamLeden.length;

      if (opdracht.minTeamSize && teamSize < opdracht.minTeamSize) {
        return NextResponse.json(
          {
            success: false,
            error: `Minimaal ${opdracht.minTeamSize} teamleden vereist, je hebt er ${teamSize}`
          },
          { status: 400 }
        );
      }

      // Check if already applied
      const existingSollicitatie = opdracht.sollicitaties.find(
        s => s.bedrijfId === user.bedrijfProfile!.id
      );

      if (existingSollicitatie) {
        return NextResponse.json(
          { success: false, error: "Je bedrijf heeft al gesolliciteerd op deze opdracht" },
          { status: 409 }
        );
      }
    }

    // Check available spots
    const acceptedSollicitaties = opdracht.sollicitaties.filter(
      s => s.status === "ACCEPTED"
    ).length;
    const confirmedAssignments = opdracht.assignments.filter(
      a => a.status === "CONFIRMED"
    ).length;
    const totalAccepted = acceptedSollicitaties + confirmedAssignments;

    if (totalAccepted >= opdracht.aantalBeveiligers) {
      return NextResponse.json(
        { success: false, error: "Alle plekken zijn al bezet" },
        { status: 400 }
      );
    }

    // Create sollicitatie with ND-nummer compliance metadata
    const sollicitatie = await prisma.opdrachtSollicitatie.create({
      data: {
        opdrachtId,
        sollicitantType,
        ...(user.zzpProfile && { zzpId: user.zzpProfile.id }),
        ...(user.bedrijfProfile && { bedrijfId: user.bedrijfProfile.id }),
        motivatie: validatedData.motivatie,
        voorgesteldTarief: validatedData.voorgesteldTarief,
        teamGrootte: validatedData.teamGrootte,
        status: opdracht.autoAccept ? "ACCEPTED" : "PENDING",
        // Store ND-nummer compliance info for audit trail
        complianceInfo: {
          ndNummerStatus,
          ndNummerExpiry,
          complianceCheckedAt: new Date(),
          daysUntilExpiry: ndNummerExpiry ? Math.ceil(
            (new Date(ndNummerExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          ) : null
        }
      }
    });

    // Create ND-nummer audit log entry for job application
    if (user.zzpProfile?.ndNummer || user.bedrijfProfile?.ndNummer) {
      await prisma.nDNummerAuditLog.create({
        data: {
          profileType: user.zzpProfile ? 'ZZP' : 'BEDRIJF',
          zzpProfileId: user.zzpProfile?.id,
          bedrijfProfileId: user.bedrijfProfile?.id,
          ndNummer: user.zzpProfile?.ndNummer || user.bedrijfProfile?.ndNummer,
          action: 'VERIFICATIE',
          newStatus: ndNummerStatus as any,
          verificationSource: 'Job Application',
          complianceNotes: `ND-nummer gebruikt voor sollicitatie op opdracht ${opdracht.titel}`,
          performedBy: session.user.id
        }
      });
    }

    // If auto-accept is enabled and this is urgent
    if (opdracht.autoAccept && opdracht.status === "URGENT") {
      // Update opdracht status if enough people accepted
      const newTotalAccepted = totalAccepted + 1;
      if (newTotalAccepted >= opdracht.aantalBeveiligers) {
        await prisma.opdracht.update({
          where: { id: opdrachtId },
          data: { status: "TOEGEWEZEN" }
        });
      }

      // Create werkuur entry if ZZP
      if (user.zzpProfile) {
        await prisma.werkuur.create({
          data: {
            beveiligerId: user.zzpProfile.id,
            opdrachtId,
            datum: opdracht.startDatum,
            startTijd: opdracht.startDatum,
            eindTijd: opdracht.eindDatum,
            uurtarief: validatedData.voorgesteldTarief || opdracht.uurtarief,
            status: "SCHEDULED"
          }
        });
      }
    }

    // Broadcast sollicitatie event
    await broadcastSollicitatieEvent(
      BroadcastEvent.SOLLICITATIE_CREATED,
      sollicitatie,
      opdracht
    );

    // If auto-accepted, also broadcast the acceptance
    if (opdracht.autoAccept && opdracht.status === "URGENT") {
      await broadcastSollicitatieEvent(
        BroadcastEvent.SOLLICITATIE_ACCEPTED,
        sollicitatie,
        opdracht
      );
    }

    // Create notification for opdracht owner
    const ownerName = opdracht.opdrachtgever?.bedrijfsnaam || opdracht.creatorBedrijf?.bedrijfsnaam;
    const sollicitantName = user.zzpProfile
      ? user.name
      : user.bedrijfProfile?.bedrijfsnaam;

    await prisma.notification.create({
      data: {
        userId: opdracht.creatorId,
        type: "OPDRACHT_NEW",
        category: "OPDRACHT",
        title: "Nieuwe sollicitatie ontvangen",
        message: `${sollicitantName} heeft gesolliciteerd op "${opdracht.titel}"`,
        actionUrl: `/dashboard/opdrachten/${opdrachtId}/sollicitaties`
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        sollicitatieId: sollicitatie.id,
        status: sollicitatie.status,
        message: opdracht.autoAccept
          ? "Sollicitatie automatisch geaccepteerd!"
          : "Sollicitatie verstuurd!"
      }
    });

  } catch (error) {
    console.error("Error applying for opdracht:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to apply for opdracht" },
      { status: 500 }
    );
  }
}

// GET /api/opdrachten/[id]/solliciteer - Get sollicitaties for opdracht
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: opdrachtId } = await params;

    // Get opdracht with sollicitaties
    const opdracht = await prisma.opdracht.findUnique({
      where: { id: opdrachtId },
      include: {
        opdrachtgever: true,
        creatorBedrijf: true,
        sollicitaties: {
          include: {
            zzp: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            },
            bedrijf: {
              select: {
                bedrijfsnaam: true,
                kvkNummer: true,
                teamSize: true
              }
            }
          },
          orderBy: {
            sollicitatiedatum: "desc"
          }
        }
      }
    });

    if (!opdracht) {
      return NextResponse.json(
        { success: false, error: "Opdracht not found" },
        { status: 404 }
      );
    }

    // Check if user can view sollicitaties
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        opdrachtgever: true,
        bedrijfProfile: true
      }
    });

    const canView =
      (opdracht.opdrachtgever && opdracht.opdrachtgeverId === user?.opdrachtgever?.id) ||
      (opdracht.creatorBedrijf && opdracht.creatorBedrijfId === user?.bedrijfProfile?.id);

    if (!canView) {
      return NextResponse.json(
        { success: false, error: "Not authorized to view sollicitaties" },
        { status: 403 }
      );
    }

    // Format sollicitaties
    const formattedSollicitaties = opdracht.sollicitaties.map(s => ({
      id: s.id,
      type: s.sollicitantType,
      name: s.zzp ? s.zzp.user.name : s.bedrijf?.bedrijfsnaam,
      email: s.zzp?.user.email,
      image: s.zzp?.user.image,
      kvkNummer: s.zzp?.kvkNummer || s.bedrijf?.kvkNummer,
      rating: s.zzp?.rating,
      teamSize: s.teamGrootte || s.bedrijf?.teamSize,
      status: s.status,
      motivatie: s.motivatie,
      voorgesteldTarief: s.voorgesteldTarief ? Number(s.voorgesteldTarief) : null,
      sollicitatiedatum: s.sollicitatiedatum
    }));

    return NextResponse.json({
      success: true,
      data: {
        opdracht: {
          id: opdracht.id,
          titel: opdracht.titel,
          aantalBeveiligers: opdracht.aantalBeveiligers
        },
        sollicitaties: formattedSollicitaties,
        stats: {
          total: formattedSollicitaties.length,
          pending: formattedSollicitaties.filter(s => s.status === "PENDING").length,
          accepted: formattedSollicitaties.filter(s => s.status === "ACCEPTED").length,
          rejected: formattedSollicitaties.filter(s => s.status === "REJECTED").length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching sollicitaties:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sollicitaties" },
      { status: 500 }
    );
  }
}

// PATCH /api/opdrachten/[id]/solliciteer - Accept/reject sollicitatie
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const updateSchema = z.object({
      sollicitatieId: z.string(),
      action: z.enum(["accept", "reject"])
    });

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    // Get sollicitatie with opdracht
    const sollicitatie = await prisma.opdrachtSollicitatie.findUnique({
      where: { id: validatedData.sollicitatieId },
      include: {
        opdracht: {
          include: {
            opdrachtgever: true,
            creatorBedrijf: true
          }
        }
      }
    });

    if (!sollicitatie) {
      return NextResponse.json(
        { success: false, error: "Sollicitatie not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        opdrachtgever: true,
        bedrijfProfile: true
      }
    });

    const canManage =
      (sollicitatie.opdracht.opdrachtgeverId === user?.opdrachtgever?.id) ||
      (sollicitatie.opdracht.creatorBedrijfId === user?.bedrijfProfile?.id);

    if (!canManage) {
      return NextResponse.json(
        { success: false, error: "Not authorized to manage this sollicitatie" },
        { status: 403 }
      );
    }

    // Update sollicitatie status
    const newStatus = validatedData.action === "accept" ? "ACCEPTED" : "REJECTED";

    const updated = await prisma.opdrachtSollicitatie.update({
      where: { id: validatedData.sollicitatieId },
      data: {
        status: newStatus,
        beoordeeldOp: new Date(),
        beoordeeldDoor: session.user.id
      }
    });

    // If accepting a bedrijf, also update opdracht
    if (newStatus === "ACCEPTED" && sollicitatie.bedrijfId) {
      await prisma.opdracht.update({
        where: { id: sollicitatie.opdrachtId },
        data: {
          acceptedBedrijfId: sollicitatie.bedrijfId,
          status: "TOEGEWEZEN"
        }
      });
    }

    // Broadcast sollicitatie status change
    await broadcastSollicitatieEvent(
      newStatus === "ACCEPTED"
        ? BroadcastEvent.SOLLICITATIE_ACCEPTED
        : BroadcastEvent.SOLLICITATIE_REJECTED,
      updated,
      sollicitatie.opdracht
    );

    // If status changed to TOEGEWEZEN, broadcast opdracht update
    if (newStatus === "ACCEPTED" && sollicitatie.bedrijfId) {
      await broadcastOpdrachtEvent(
        BroadcastEvent.OPDRACHT_STATUS_CHANGED,
        { ...sollicitatie.opdracht, status: "TOEGEWEZEN" }
      );
    }

    // Send notification to sollicitant
    const sollicitantUserId = sollicitatie.zzpId || sollicitatie.bedrijfId;
    if (sollicitantUserId) {
      await prisma.notification.create({
        data: {
          userId: sollicitantUserId,
          type: newStatus === "ACCEPTED" ? "OPDRACHT_ASSIGNED" : "OPDRACHT_UPDATED",
          category: "OPDRACHT",
          title: newStatus === "ACCEPTED" ? "Sollicitatie geaccepteerd!" : "Sollicitatie afgewezen",
          message: `Je sollicitatie voor "${sollicitatie.opdracht.titel}" is ${
            newStatus === "ACCEPTED" ? "geaccepteerd" : "afgewezen"
          }`,
          actionUrl: `/dashboard/opdrachten/${sollicitatie.opdrachtId}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Sollicitatie ${newStatus === "ACCEPTED" ? "geaccepteerd" : "afgewezen"}`
    });

  } catch (error) {
    console.error("Error updating sollicitatie:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update sollicitatie" },
      { status: 500 }
    );
  }
}