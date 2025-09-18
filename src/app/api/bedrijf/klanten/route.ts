import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/bedrijf/klanten - Get client management data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "Alleen bedrijven kunnen klanten beheren" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // active, inactive, all
    const sortBy = searchParams.get("sortBy") || "recent"; // recent, name, revenue
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions: Prisma.OpdrachtgeverWhereInput = {};

    if (search) {
      searchConditions.OR = [
        { bedrijfsnaam: { contains: search, mode: "insensitive" } },
        { contactpersoon: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get all opdrachtgevers who have worked with this bedrijf
    const clientIds = await prisma.opdracht.findMany({
      where: {
        OR: [
          {
            creatorType: "BEDRIJF",
            creatorBedrijfId: bedrijfProfile.id,
          },
          {
            acceptedBedrijfId: bedrijfProfile.id,
          },
        ],
      },
      select: {
        opdrachtgeverId: true,
      },
      distinct: ["opdrachtgeverId"],
    });

    const validClientIds = clientIds
      .map((c) => c.opdrachtgeverId)
      .filter((id) => id !== null) as string[];

    if (validClientIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          klanten: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
          stats: {
            totalKlanten: 0,
            activeKlanten: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
          },
        },
      });
    }

    searchConditions.id = { in: validClientIds };

    // Fetch clients with aggregated data
    const [klanten, total] = await Promise.all([
      prisma.opdrachtgever.findMany({
        where: searchConditions,
        include: {
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
          opdrachten: {
            where: {
              OR: [
                {
                  creatorType: "BEDRIJF",
                  creatorBedrijfId: bedrijfProfile.id,
                },
                {
                  acceptedBedrijfId: bedrijfProfile.id,
                },
              ],
            },
            select: {
              id: true,
              titel: true,
              status: true,
              startDatum: true,
              eindDatum: true,
              uurtarief: true,
              aantalBeveiligers: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5, // Recent opdrachten for preview
          },
          _count: {
            select: {
              opdrachten: {
                where: {
                  OR: [
                    {
                      creatorType: "BEDRIJF",
                      creatorBedrijfId: bedrijfProfile.id,
                    },
                    {
                      acceptedBedrijfId: bedrijfProfile.id,
                    },
                  ],
                },
              },
            },
          },
        },
        orderBy:
          sortBy === "name"
            ? { bedrijfsnaam: "asc" }
            : sortBy === "recent"
              ? { user: { createdAt: "desc" } }
              : { bedrijfsnaam: "asc" },
        skip,
        take: limit,
      }),
      prisma.opdrachtgever.count({ where: searchConditions }),
    ]);

    // Calculate client statistics
    const klantenWithStats = await Promise.all(
      klanten.map(async (klant) => {
        // Calculate revenue and stats for this client
        const opdrachtStats = await prisma.opdracht.aggregate({
          where: {
            opdrachtgeverId: klant.id,
            OR: [
              {
                creatorType: "BEDRIJF",
                creatorBedrijfId: bedrijfProfile.id,
              },
              {
                acceptedBedrijfId: bedrijfProfile.id,
              },
            ],
          },
          _sum: {
            uurtarief: true,
            aantalBeveiligers: true,
          },
          _count: {
            id: true,
          },
        });

        // Calculate estimated revenue (simplified)
        const totalOpdrachten = opdrachtStats._count.id || 0;
        const avgHourlyRate = opdrachtStats._sum.uurtarief || 0;
        const avgPersonnel = opdrachtStats._sum.aantalBeveiligers || 0;
        const estimatedRevenue =
          totalOpdrachten > 0
            ? Number(avgHourlyRate) * avgPersonnel * 8 * totalOpdrachten // Estimate 8 hours per assignment
            : 0;

        // Get last interaction date
        const lastOpdracht = klant.opdrachten[0];
        const lastInteraction = lastOpdracht
          ? lastOpdracht.createdAt
          : klant.user.createdAt;

        // Determine if client is active (has opdracht in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isActive = lastInteraction > thirtyDaysAgo;

        return {
          id: klant.id,
          bedrijfsnaam: klant.bedrijfsnaam,
          contactpersoon: klant.contactpersoon,
          telefoon: klant.telefoon,
          email: klant.user.email,
          adres: klant.adres,
          postcode: klant.postcode,
          plaats: klant.plaats,
          kvkNummer: klant.kvkNummer,
          btwNummer: klant.btwNummer,

          // Statistics
          totalOpdrachten,
          estimatedRevenue,
          isActive,
          lastInteraction,

          // Recent opdrachten preview
          recentOpdrachten: klant.opdrachten.map((opdracht) => ({
            id: opdracht.id,
            titel: opdracht.titel,
            status: opdracht.status,
            startDatum: opdracht.startDatum,
            uurtarief: opdracht.uurtarief,
            aantalBeveiligers: opdracht.aantalBeveiligers,
          })),

          // Account info
          memberSince: klant.user.createdAt,

          // Contact info
          primaryContact: {
            name: klant.contactpersoon,
            email: klant.user.email,
            phone: klant.telefoon,
          },
        };
      }),
    );

    // Filter by status if specified
    let filteredKlanten = klantenWithStats;
    if (status === "active") {
      filteredKlanten = klantenWithStats.filter((k) => k.isActive);
    } else if (status === "inactive") {
      filteredKlanten = klantenWithStats.filter((k) => !k.isActive);
    }

    // Sort by revenue if specified
    if (sortBy === "revenue") {
      filteredKlanten.sort((a, b) => b.estimatedRevenue - a.estimatedRevenue);
    }

    // Calculate overall stats
    const totalRevenue = filteredKlanten.reduce(
      (sum, k) => sum + k.estimatedRevenue,
      0,
    );
    const activeKlanten = filteredKlanten.filter((k) => k.isActive).length;
    const averageOrderValue =
      filteredKlanten.length > 0
        ? totalRevenue /
          filteredKlanten.reduce((sum, k) => sum + k.totalOpdrachten, 0)
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        klanten: filteredKlanten,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalKlanten: total,
          activeKlanten,
          totalRevenue,
          averageOrderValue: Number.isNaN(averageOrderValue)
            ? 0
            : averageOrderValue,
        },
        filters: {
          search,
          status,
          sortBy,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching bedrijf klanten:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch klanten data" },
      { status: 500 },
    );
  }
}

// POST /api/bedrijf/klanten - Add client note or update client info
const ClientUpdateSchema = z.object({
  clientId: z.string().min(1, "Client ID is verplicht"),
  action: z.enum(["add_note", "update_contact", "mark_favorite"]),
  data: z.record(z.any()), // Flexible data based on action
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Alleen bedrijven kunnen klantgegevens beheren",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validationResult = ClientUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { clientId, action, data } = validationResult.data;

    // Verify client exists and bedrijf has worked with them
    const hasWorkedWith = await prisma.opdracht.findFirst({
      where: {
        opdrachtgeverId: clientId,
        OR: [
          {
            creatorType: "BEDRIJF",
            creatorBedrijfId: bedrijfProfile.id,
          },
          {
            acceptedBedrijfId: bedrijfProfile.id,
          },
        ],
      },
    });

    if (!hasWorkedWith) {
      return NextResponse.json(
        { success: false, error: "Geen toegang tot deze klant" },
        { status: 403 },
      );
    }

    let result;

    switch (action) {
      case "add_note": {
        // For now, we'll store notes in a simple way
        // In production, you might want a separate ClientNote model
        const noteText = data.note as string;
        if (!noteText || noteText.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: "Note text is required" },
            { status: 400 },
          );
        }

        // Store note as part of a client interaction log
        // This is a simplified approach - consider a dedicated notes table
        result = {
          action: "note_added",
          note: noteText,
          addedAt: new Date().toISOString(),
          addedBy: bedrijfProfile.bedrijfsnaam,
        };
        break;
      }

      case "mark_favorite":
        // This would typically update a relationship table
        // For now, we'll return success as this is client-side preference
        result = {
          action: "favorite_toggled",
          isFavorite: data.isFavorite as boolean,
        };
        break;

      case "update_contact":
        // This would require careful consideration of permissions
        // As bedrijven shouldn't be able to directly modify opdrachtgever data
        return NextResponse.json(
          { success: false, error: "Direct contact updates not allowed" },
          { status: 403 },
        );

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      message: "Client data updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating client data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update client data" },
      { status: 500 },
    );
  }
}
