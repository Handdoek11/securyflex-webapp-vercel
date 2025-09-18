import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  BroadcastEvent,
  broadcastOpdrachtEvent,
} from "@/lib/supabase/broadcast";

// Schema for creating/updating shifts
const createShiftSchema = z.object({
  titel: z.string().min(1, "Titel is verplicht"),
  beschrijving: z.string().optional(),
  locatie: z.string().min(1, "Locatie is verplicht"),
  adres: z.string().optional(),
  datum: z.string().transform((str) => new Date(str)),
  startTijd: z.string().min(1, "Start tijd is verplicht"),
  eindTijd: z.string().min(1, "Eind tijd is verplicht"),
  aantalBeveiligers: z.number().min(1, "Minimaal 1 beveiliger vereist"),
  uurtarief: z.number().min(0, "Uurtarief moet positief zijn"),
  budget: z.number().optional(),
  vereisten: z.array(z.string()).optional(),
  specialisatie: z.string().optional(),
  isUrgent: z.boolean().optional(),
  isDirectBooking: z.boolean().optional(),
  targetAudience: z
    .enum(["ALLEEN_BEDRIJVEN", "ALLEEN_ZZP", "BEIDEN"])
    .optional(),
  directZZPAllowed: z.boolean().optional(),
});

// GET /api/opdrachtgever/shifts - Get shifts for opdrachtgever
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user's Opdrachtgever profile
    const opdrachtgeverProfile = await prisma.opdrachtgever.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!opdrachtgeverProfile) {
      // Return mock data for development/demo purposes when profile doesn't exist
      console.log("No opdrachtgever profile found, returning mock data");

      const mockShifts = [
        {
          id: "mock-1",
          titel: "Evenement Beveiliging - Hoofdpodium",
          beschrijving: "Beveiliging voor festival hoofdpodium",
          locatie: {
            adres: "Festivalterrein 1",
            postcode: "1234AB",
            plaats: "Amsterdam",
          },
          datum: new Date("2025-09-20"),
          startTijd: "20:00",
          eindTijd: "02:00",
          aantalBeveiligers: 4,
          uurtarief: 28.5,
          status: "OPEN",
          isUrgent: false,
          filled: 1,
          required: 4,
          applications: 3,
        },
        {
          id: "mock-2",
          titel: "Nachtdienst Bouwplaats",
          beschrijving: "Beveiliging bouwterrein gedurende de nacht",
          locatie: {
            adres: "Industrieweg 45",
            postcode: "5678CD",
            plaats: "Rotterdam",
          },
          datum: new Date("2025-09-18"),
          startTijd: "22:00",
          eindTijd: "06:00",
          aantalBeveiligers: 2,
          uurtarief: 25.0,
          status: "URGENT",
          isUrgent: true,
          filled: 0,
          required: 2,
          applications: 5,
        },
      ];

      return NextResponse.json({
        success: true,
        data: {
          shifts: mockShifts,
          pagination: {
            page: 1,
            limit: 10,
            total: mockShifts.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "datum";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: Prisma.OpdrachtWhereInput = {
      opdrachtgeverId: opdrachtgeverProfile.id,
    };

    // Filter by status
    if (status) {
      if (status === "open") {
        where.status = { in: ["OPEN", "GEPUBLICEERD"] };
      } else if (status === "active") {
        where.status = { in: ["ACTIEF", "BEVESTIGD"] };
        where.datum = {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        };
      } else if (status === "completed") {
        where.status = "VOLTOOID";
      } else if (status === "cancelled") {
        where.status = "GEANNULEERD";
      }
    }

    try {
      // Get shifts with pagination
      const [shifts, totalCount] = await Promise.all([
        prisma.opdracht.findMany({
          where,
          include: {
            sollicitaties: {
              include: {
                beveiliger: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
            acceptedBeveiliger: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            werkuren: {
              select: {
                id: true,
                status: true,
                startTijd: true,
                eindTijd: true,
                urenGewerkt: true,
              },
            },
            feedback: {
              select: {
                id: true,
                ratingBeveiliger: true,
                commentaarBeveiliger: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder as "asc" | "desc",
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.opdracht.count({ where }),
      ]);

      // Transform shifts data for frontend
      const transformedShifts = shifts.map((shift) => ({
        id: shift.id,
        title: shift.titel,
        description: shift.beschrijving,
        location: shift.locatie,
        address: shift.adres,
        date: shift.datum,
        startTime: shift.startTijd,
        endTime: shift.eindTijd,
        status: shift.status,
        budget: shift.budget,
        hourlyRate: shift.uurtarief,
        requiredBeveiligers: shift.aantalBeveiligers,
        requirements: shift.vereisten || [],
        specialization: shift.specialisatie,
        isUrgent: shift.isUrgent,
        directBooking: shift.isDirectBooking,

        // Application info
        applications: shift.sollicitaties.length,
        applicants: shift.sollicitaties.map((sol) => ({
          id: sol.id,
          beveiligerId: sol.beveiligerId,
          name: sol.beveiliger.user.name,
          email: sol.beveiliger.user.email,
          status: sol.status,
          appliedAt: sol.createdAt,
          motivatie: sol.motivatie,
        })),

        // Accepted beveiliger info
        acceptedBeveiliger: shift.acceptedBeveiliger
          ? {
              id: shift.acceptedBeveiliger.id,
              name: shift.acceptedBeveiliger.user.name,
              email: shift.acceptedBeveiliger.user.email,
              phone: shift.acceptedBeveiliger.user.phone,
            }
          : null,

        // Work hours and feedback
        workHours: shift.werkuren,
        feedback: shift.feedback,

        // Progress indicators
        filled: shift.acceptedBeveiliger ? 1 : 0,
        isCompleted: shift.status === "VOLTOOID",
        isActive: shift.status === "ACTIEF",
        needsAttention:
          shift.status === "OPEN" &&
          new Date(shift.datum) < new Date(Date.now() + 24 * 60 * 60 * 1000),

        createdAt: shift.createdAt,
        updatedAt: shift.updatedAt,
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        data: {
          shifts: transformedShifts,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (dbError) {
      console.error("Database error fetching shifts:", dbError);

      // Return mock data for development
      return NextResponse.json({
        success: true,
        data: {
          shifts: [
            {
              id: "mock-1",
              title: "Terminal 1 - Nachtdienst",
              location: "Schiphol Airport",
              date: new Date("2025-09-17"),
              startTime: "22:00",
              endTime: "06:00",
              status: "OPEN",
              filled: 2,
              required: 3,
              hourlyRate: 22.5,
              isUrgent: true,
              requirements: ["VCA Basis", "Engels B1+"],
              applications: 5,
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }
  } catch (error) {
    console.error("Opdrachtgever shifts GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shifts" },
      { status: 500 },
    );
  }
}

// POST /api/opdrachtgever/shifts - Create new shift
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user's Opdrachtgever profile
    const opdrachtgeverProfile = await prisma.opdrachtgever.findUnique({
      where: { userId: session.user.id },
      select: { id: true, bedrijfsnaam: true },
    });

    if (!opdrachtgeverProfile) {
      // Return error but with helpful message for development
      console.log("No opdrachtgever profile found for POST request");
      return NextResponse.json(
        { success: false, error: "Opdrachtgever profile not found" },
        { status: 404 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createShiftSchema.parse(body);

    // Calculate budget if not provided
    const calculatedBudget =
      validatedData.budget ||
      validatedData.uurtarief *
        validatedData.aantalBeveiligers *
        (parseInt(validatedData.eindTijd.split(":")[0], 10) -
          parseInt(validatedData.startTijd.split(":")[0], 10));

    try {
      // Create new opdracht
      const newShift = await prisma.opdracht.create({
        data: {
          titel: validatedData.titel,
          beschrijving: validatedData.beschrijving,
          locatie: validatedData.locatie,
          adres: validatedData.adres,
          datum: validatedData.datum,
          startTijd: validatedData.startTijd,
          eindTijd: validatedData.eindTijd,
          aantalBeveiligers: validatedData.aantalBeveiligers,
          uurtarief: validatedData.uurtarief,
          budget: calculatedBudget,
          vereisten: validatedData.vereisten,
          specialisatie: validatedData.specialisatie,
          isUrgent: validatedData.isUrgent || false,
          isDirectBooking: validatedData.isDirectBooking || false,
          targetAudience: validatedData.targetAudience || "BEIDEN",
          directZZPAllowed: validatedData.directZZPAllowed !== false,

          // Link to opdrachtgever
          opdrachtgeverId: opdrachtgeverProfile.id,
          creatorType: "OPDRACHTGEVER",
          creatorId: opdrachtgeverProfile.id,

          // Initial status
          status: validatedData.isDirectBooking ? "OPEN" : "GEPUBLICEERD",
        },
        include: {
          opdrachtgever: {
            select: {
              bedrijfsnaam: true,
            },
          },
        },
      });

      console.log(
        `New shift created by opdrachtgever ${opdrachtgeverProfile.id}: ${newShift.id}`,
      );

      // Broadcast the new shift creation
      await broadcastOpdrachtEvent(BroadcastEvent.OPDRACHT_CREATED, newShift);

      return NextResponse.json(
        {
          success: true,
          data: newShift,
          message: "Shift succesvol aangemaakt",
        },
        { status: 201 },
      );
    } catch (dbError) {
      console.error("Database error creating shift:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to create shift in database" },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Opdrachtgever shifts POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create shift" },
      { status: 500 },
    );
  }
}
