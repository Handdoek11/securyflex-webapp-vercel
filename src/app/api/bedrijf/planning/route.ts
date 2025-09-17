import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { broadcastOpdrachtEvent, BroadcastEvent } from "@/lib/supabase/broadcast";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// GET /api/bedrijf/planning - Get planning overview
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "Alleen bedrijven kunnen planning beheren" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "week"; // week, month, day
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate date range based on view
    let dateRange = {
      start: new Date(),
      end: new Date()
    };

    if (startDate && endDate) {
      dateRange.start = new Date(startDate);
      dateRange.end = new Date(endDate);
    } else {
      const now = new Date();
      switch (view) {
        case "day":
          dateRange.start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateRange.end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "week":
          const weekStart = now.getDate() - now.getDay();
          dateRange.start = new Date(now.getFullYear(), now.getMonth(), weekStart);
          dateRange.end = new Date(now.getFullYear(), now.getMonth(), weekStart + 7);
          break;
        case "month":
          dateRange.start = new Date(now.getFullYear(), now.getMonth(), 1);
          dateRange.end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
      }
    }

    // Fetch active opdrachten for this bedrijf
    const activeOpdrachten = await prisma.opdracht.findMany({
      where: {
        OR: [
          {
            creatorType: "BEDRIJF",
            creatorBedrijfId: bedrijfProfile.id,
            status: { in: ["OPEN", "IN_PROGRESS", "ASSIGNED"] }
          },
          {
            acceptedBedrijfId: bedrijfProfile.id,
            status: { in: ["IN_PROGRESS", "ASSIGNED"] }
          }
        ],
        startDatum: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        sollicitaties: {
          where: {
            status: "ACCEPTED"
          },
          include: {
            zzpProfile: {
              select: {
                voornaam: true,
                achternaam: true,
                telefoon: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        opdrachtgever: {
          select: {
            bedrijfsnaam: true,
            contactpersoon: true
          }
        }
      }
    });

    // Fetch team members (ZZP profiles working with this bedrijf)
    const teamMembers = await prisma.zZPProfile.findMany({
      where: {
        sollicitaties: {
          some: {
            opdracht: {
              OR: [
                {
                  creatorType: "BEDRIJF",
                  creatorBedrijfId: bedrijfProfile.id
                },
                {
                  acceptedBedrijfId: bedrijfProfile.id
                }
              ]
            },
            status: "ACCEPTED"
          }
        }
      },
      select: {
        id: true,
        voornaam: true,
        achternaam: true,
        telefoon: true,
        specialisaties: true,
        ervaring: true,
        beschikbaarheid: true,
        user: {
          select: {
            email: true
          }
        }
      },
      distinct: ["id"]
    });

    // Format planning data
    const planningData = activeOpdrachten.map(opdracht => ({
      id: opdracht.id,
      titel: opdracht.titel,
      locatie: opdracht.locatie,
      startDatum: opdracht.startDatum,
      eindDatum: opdracht.eindDatum,
      aantalBeveiligers: opdracht.aantalBeveiligers,
      status: opdracht.status,

      // Client info
      client: opdracht.opdrachtgever?.bedrijfsnaam || "Intern",

      // Assigned team
      assignedTeam: opdracht.sollicitaties.map(sollicitatie => ({
        id: sollicitatie.id,
        zzpId: sollicitatie.zzpProfileId,
        name: `${sollicitatie.zzpProfile.voornaam} ${sollicitatie.zzpProfile.achternaam}`,
        phone: sollicitatie.zzpProfile.telefoon,
        email: sollicitatie.zzpProfile.user.email,
        status: sollicitatie.status
      })),

      // Planning status
      isFullyStaffed: opdracht.sollicitaties.length >= opdracht.aantalBeveiligers,
      missingPersonnel: Math.max(0, opdracht.aantalBeveiligers - opdracht.sollicitaties.length)
    }));

    return NextResponse.json({
      success: true,
      data: {
        planning: planningData,
        teamMembers,
        dateRange,
        view,
        stats: {
          totalOpdrachten: activeOpdrachten.length,
          fullyStaffed: planningData.filter(p => p.isFullyStaffed).length,
          understaffed: planningData.filter(p => !p.isFullyStaffed).length,
          totalTeamMembers: teamMembers.length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching bedrijf planning:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch planning data" },
      { status: 500 }
    );
  }
}

// POST /api/bedrijf/planning - Create planning assignment
const CreatePlanningSchema = z.object({
  opdrachtId: z.string().min(1, "Opdracht ID is verplicht"),
  zzpProfileIds: z.array(z.string()).min(1, "Minimaal één ZZP'er moet worden toegewezen"),
  startTijd: z.string().datetime().optional(),
  eindTijd: z.string().datetime().optional(),
  notities: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "Alleen bedrijven kunnen planning beheren" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const validationResult = CreatePlanningSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { opdrachtId, zzpProfileIds, startTijd, eindTijd, notities } = validationResult.data;

    // Verify opdracht exists and bedrijf has access
    const opdracht = await prisma.opdracht.findFirst({
      where: {
        id: opdrachtId,
        OR: [
          {
            creatorType: "BEDRIJF",
            creatorBedrijfId: bedrijfProfile.id
          },
          {
            acceptedBedrijfId: bedrijfProfile.id
          }
        ]
      }
    });

    if (!opdracht) {
      return NextResponse.json(
        { success: false, error: "Opdracht niet gevonden of geen toegang" },
        { status: 404 }
      );
    }

    // Check if ZZP profiles exist and are available
    const zzpProfiles = await prisma.zZPProfile.findMany({
      where: {
        id: { in: zzpProfileIds }
      }
    });

    if (zzpProfiles.length !== zzpProfileIds.length) {
      return NextResponse.json(
        { success: false, error: "Een of meer ZZP'ers niet gevonden" },
        { status: 400 }
      );
    }

    // Check for existing assignments that would conflict
    const existingAssignments = await prisma.sollicitatie.findMany({
      where: {
        opdrachtId,
        zzpProfileId: { in: zzpProfileIds },
        status: { in: ["ACCEPTED", "PENDING"] }
      }
    });

    if (existingAssignments.length > 0) {
      return NextResponse.json(
        { success: false, error: "Een of meer ZZP'ers zijn al toegewezen aan deze opdracht" },
        { status: 400 }
      );
    }

    // Create planning assignments (as sollicitaties with ACCEPTED status)
    const assignments = await Promise.all(
      zzpProfileIds.map(zzpProfileId =>
        prisma.sollicitatie.create({
          data: {
            opdrachtId,
            zzpProfileId,
            motivatie: notities || "Toegewezen door beveiligingsbedrijf",
            status: "ACCEPTED",
            acceptedAt: new Date(),
            startTijd: startTijd ? new Date(startTijd) : undefined,
            eindTijd: eindTijd ? new Date(eindTijd) : undefined
          },
          include: {
            zzpProfile: {
              select: {
                voornaam: true,
                achternaam: true,
                telefoon: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        })
      )
    );

    // Update opdracht status if now fully staffed
    const totalAssigned = await prisma.sollicitatie.count({
      where: {
        opdrachtId,
        status: "ACCEPTED"
      }
    });

    if (totalAssigned >= opdracht.aantalBeveiligers && opdracht.status === "OPEN") {
      await prisma.opdracht.update({
        where: { id: opdrachtId },
        data: { status: "ASSIGNED" }
      });
    }

    // Broadcast planning update
    await broadcastOpdrachtEvent(BroadcastEvent.OPDRACHT_UPDATED, {
      ...opdracht,
      status: totalAssigned >= opdracht.aantalBeveiligers ? "ASSIGNED" : opdracht.status
    });

    return NextResponse.json({
      success: true,
      message: `${assignments.length} ZZP'er(s) succesvol toegewezen`,
      data: {
        assignments: assignments.map(assignment => ({
          id: assignment.id,
          zzpName: `${assignment.zzpProfile.voornaam} ${assignment.zzpProfile.achternaam}`,
          zzpPhone: assignment.zzpProfile.telefoon,
          zzpEmail: assignment.zzpProfile.user.email,
          startTijd: assignment.startTijd,
          eindTijd: assignment.eindTijd
        })),
        opdracht: {
          id: opdracht.id,
          titel: opdracht.titel,
          totalAssigned,
          fullyStaffed: totalAssigned >= opdracht.aantalBeveiligers
        }
      }
    });

  } catch (error) {
    console.error("Error creating planning assignment:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: "Deze ZZP'er is al toegewezen aan deze opdracht" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to create planning assignment" },
      { status: 500 }
    );
  }
}