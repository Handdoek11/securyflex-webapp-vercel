import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  BroadcastEvent,
  broadcastOpdrachtEvent,
} from "@/lib/supabase/broadcast";

// GET /api/opdrachten - Get opdrachten based on user role and permissions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get("view") || "available"; // available, own, team
    const status = searchParams.get("status");
    const targetAudience = searchParams.get("targetAudience");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        zzpProfile: true,
        bedrijfProfile: true,
        opdrachtgever: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // ND-NUMMER COMPLIANCE CHECK FOR AVAILABLE JOBS
    // Only show available jobs if user has valid ND-nummer (for ZZP and Bedrijf users)
    let ndNummerValid = false;
    let _shouldShowComplianceWarning = false;

    if (view === "available" && (user.zzpProfile || user.bedrijfProfile)) {
      let ndNummerStatus = null;
      let ndNummerExpiry = null;

      if (user.zzpProfile) {
        ndNummerStatus = user.zzpProfile.ndNummerStatus;
        ndNummerExpiry = user.zzpProfile.ndNummerVervalDatum;
      } else if (user.bedrijfProfile) {
        ndNummerStatus = user.bedrijfProfile.ndNummerStatus;
        ndNummerExpiry = user.bedrijfProfile.ndNummerVervalDatum;
      }

      ndNummerValid = !!(
        ndNummerStatus === "ACTIEF" &&
        ndNummerExpiry &&
        new Date(ndNummerExpiry) > new Date()
      );

      // Calculate if warning should be shown (invalid ND-nummer or expiring soon)
      _shouldShowComplianceWarning =
        !(ndNummerValid ?? false) ||
        (ndNummerExpiry &&
          Math.ceil(
            (new Date(ndNummerExpiry).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ) <= 30);

      // If ND-nummer is not valid, don't show any available jobs
      if (!ndNummerValid && view === "available") {
        return NextResponse.json({
          success: true,
          data: {
            opdrachten: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
            filters: { view, status, targetAudience, search },
            complianceWarning: {
              show: true,
              ndNummerStatus,
              message:
                !ndNummerStatus || ndNummerStatus === "NIET_GEREGISTREERD"
                  ? "U heeft een geldig ND-nummer nodig om beveiligingsopdrachten te bekijken en uit te voeren."
                  : ndNummerStatus === "VERLOPEN"
                    ? "Uw ND-nummer is verlopen. Vernieuw uw ND-nummer om opdrachten te kunnen bekijken."
                    : "Uw ND-nummer is niet actief. Controleer uw compliance status.",
              actionUrl: "/dashboard/compliance",
              actionLabel: "ND-nummer Beheren",
            },
          },
        });
      }
    }

    // Build query based on user role and view
    const where: Prisma.OpdrachtWhereInput = {};

    if (view === "available") {
      // Opdrachten available for application
      where.status = { in: ["OPEN", "URGENT"] };

      if (user.zzpProfile) {
        // ZZP can see opdrachten that allow direct ZZP
        where.OR = [
          { targetAudience: "BEIDEN" },
          { targetAudience: "ALLEEN_ZZP" },
          { directZZPAllowed: true },
        ];
      } else if (user.bedrijfProfile) {
        // Bedrijf can see opdrachten for bedrijven
        where.OR = [
          { targetAudience: "BEIDEN" },
          { targetAudience: "ALLEEN_BEDRIJVEN" },
        ];
      }
    } else if (view === "own") {
      // Opdrachten created by user
      if (user.opdrachtgever) {
        where.opdrachtgeverId = user.opdrachtgever.id;
      } else if (user.bedrijfProfile) {
        where.creatorBedrijfId = user.bedrijfProfile.id;
      }
    } else if (view === "team" && user.bedrijfProfile) {
      // Opdrachten for bedrijf's own team
      where.OR = [
        {
          creatorBedrijfId: user.bedrijfProfile.id,
          targetAudience: "EIGEN_TEAM",
        },
        { acceptedBedrijfId: user.bedrijfProfile.id },
      ];
    }

    // Additional filters
    if (status) {
      where.status = status as any;
    }

    if (targetAudience) {
      where.targetAudience = targetAudience as any;
    }

    if (search) {
      where.OR = [
        { titel: { contains: search, mode: "insensitive" } },
        { beschrijving: { contains: search, mode: "insensitive" } },
        { locatie: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute queries
    const [opdrachten, totalCount] = await Promise.all([
      prisma.opdracht.findMany({
        where,
        include: {
          opdrachtgever: {
            select: {
              id: true,
              bedrijfsnaam: true,
            },
          },
          creatorBedrijf: {
            select: {
              id: true,
              bedrijfsnaam: true,
            },
          },
          acceptedBedrijf: {
            select: {
              id: true,
              bedrijfsnaam: true,
            },
          },
          sollicitaties: {
            select: {
              id: true,
              status: true,
              sollicitantType: true,
            },
          },
          assignments: {
            select: {
              id: true,
              status: true,
            },
          },
          _count: {
            select: {
              sollicitaties: true,
              assignments: true,
              werkuren: true,
            },
          },
        },
        orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.opdracht.count({ where }),
    ]);

    // Format response
    const formattedOpdrachten = opdrachten.map((opdracht) => ({
      id: opdracht.id,
      titel: opdracht.titel,
      beschrijving: opdracht.beschrijving,
      locatie: opdracht.locatie,
      startDatum: opdracht.startDatum,
      eindDatum: opdracht.eindDatum,
      aantalBeveiligers: opdracht.aantalBeveiligers,
      uurtarief: Number(opdracht.uurtarief),
      vereisten: opdracht.vereisten,
      type: opdracht.type,
      isUrgent: opdracht.isUrgent,
      status: opdracht.status,
      creatorType: opdracht.creatorType,
      targetAudience: opdracht.targetAudience,
      directZZPAllowed: opdracht.directZZPAllowed,
      autoAccept: opdracht.autoAccept,
      creator:
        opdracht.creatorType === "OPDRACHTGEVER"
          ? opdracht.opdrachtgever?.bedrijfsnaam
          : opdracht.creatorBedrijf?.bedrijfsnaam,
      acceptedBy: opdracht.acceptedBedrijf?.bedrijfsnaam,
      stats: {
        sollicitaties: opdracht._count.sollicitaties,
        assignments: opdracht._count.assignments,
        werkuren: opdracht._count.werkuren,
        openSpots: Math.max(
          0,
          opdracht.aantalBeveiligers -
            opdracht.assignments.filter((a) => a.status === "CONFIRMED").length,
        ),
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        opdrachten: formattedOpdrachten,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching opdrachten:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch opdrachten" },
      { status: 500 },
    );
  }
}

// POST /api/opdrachten - Create new opdracht
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Schema for creating opdracht
    const createOpdrachtSchema = z.object({
      titel: z.string().min(1),
      beschrijving: z.string(),
      locatie: z.string().min(1),
      startDatum: z.string(),
      eindDatum: z.string(),
      aantalBeveiligers: z.number().min(1),
      uurtarief: z.number().min(20),
      vereisten: z.array(z.string()).optional(),
      type: z.string().optional(),
      isUrgent: z.boolean().optional(),
      targetAudience: z.enum([
        "ALLEEN_BEDRIJVEN",
        "ALLEEN_ZZP",
        "BEIDEN",
        "EIGEN_TEAM",
      ]),
      directZZPAllowed: z.boolean().optional(),
      minTeamSize: z.number().optional(),
      autoAccept: z.boolean().optional(),
      klant: z.string().optional(), // For bedrijf creating opdracht for client
      assignedTeamMembers: z.array(z.string()).optional(), // Pre-assign team members
    });

    const body = await request.json();
    const validatedData = createOpdrachtSchema.parse(body);

    // Get user profile to determine creator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        opdrachtgever: true,
        bedrijfProfile: {
          include: {
            teamLeden: true,
          },
        },
      },
    });

    if (!user?.opdrachtgever && !user?.bedrijfProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Only opdrachtgevers and bedrijven can create opdrachten",
        },
        { status: 403 },
      );
    }

    // Determine creator type and ID
    const creatorType = user.opdrachtgever ? "OPDRACHTGEVER" : "BEDRIJF";
    const creatorId = user.opdrachtgever?.id || user.bedrijfProfile?.id;

    if (!creatorId) {
      return NextResponse.json(
        {
          success: false,
          error: "Creator ID required",
        },
        { status: 400 },
      );
    }

    // Create opdracht
    const opdracht = await prisma.opdracht.create({
      data: {
        titel: validatedData.titel,
        beschrijving: validatedData.beschrijving,
        locatie: validatedData.locatie,
        startDatum: new Date(validatedData.startDatum),
        eindDatum: new Date(validatedData.eindDatum),
        aantalBeveiligers: validatedData.aantalBeveiligers,
        uurtarief: validatedData.uurtarief,
        vereisten: validatedData.vereisten || [],
        type: validatedData.type,
        isUrgent: validatedData.isUrgent || false,
        status: validatedData.isUrgent ? "URGENT" : "OPEN",
        creatorType,
        creatorId,
        targetAudience: validatedData.targetAudience,
        directZZPAllowed:
          validatedData.directZZPAllowed ??
          validatedData.targetAudience !== "ALLEEN_BEDRIJVEN",
        minTeamSize: validatedData.minTeamSize,
        autoAccept: validatedData.autoAccept || false,

        // Set relations based on creator
        ...(user.opdrachtgever && {
          opdrachtgeverId: user.opdrachtgever.id,
        }),
        ...(user.bedrijfProfile && {
          creatorBedrijfId: user.bedrijfProfile.id,
          // If bedrijf creates for own team, also set as accepted
          ...(validatedData.targetAudience === "EIGEN_TEAM" && {
            acceptedBedrijfId: user.bedrijfProfile.id,
            status: "TOEGEWEZEN",
          }),
        }),
      },
    });

    // If bedrijf created for own team and provided team members, assign them
    if (user.bedrijfProfile && validatedData.assignedTeamMembers?.length) {
      const assignments = validatedData.assignedTeamMembers
        .filter((memberId) =>
          user.bedrijfProfile?.teamLeden.some((tl) => tl.id === memberId),
        )
        .map((memberId) => ({
          opdrachtId: opdracht.id,
          teamLidId: memberId,
          assignedBy: session.user.id,
          status: "ASSIGNED" as const,
        }));

      if (assignments.length > 0) {
        await prisma.opdrachtAssignment.createMany({
          data: assignments,
        });
      }
    }

    // Broadcast the new opdracht event
    await broadcastOpdrachtEvent(BroadcastEvent.OPDRACHT_CREATED, opdracht, {
      creatorType,
      creatorName:
        user.opdrachtgever?.bedrijfsnaam || user.bedrijfProfile?.bedrijfsnaam,
    });

    // Create notification for relevant users
    if (
      creatorType === "OPDRACHTGEVER" &&
      validatedData.targetAudience !== "EIGEN_TEAM"
    ) {
      // Notify bedrijven about new opdracht
      const notification = {
        type: "OPDRACHT_NEW",
        category: "OPDRACHT",
        title: "Nieuwe opdracht beschikbaar",
        message: `${validatedData.titel} in ${validatedData.locatie}`,
        actionUrl: `/dashboard/opdrachten/${opdracht.id}`,
      };

      // Here you would send notifications to relevant bedrijven/ZZP'ers
      console.log("Would send notification:", notification);
    }

    return NextResponse.json(
      {
        success: true,
        data: opdracht,
        message: `Opdracht "${opdracht.titel}" is aangemaakt`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating opdracht:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create opdracht" },
      { status: 500 },
    );
  }
}
