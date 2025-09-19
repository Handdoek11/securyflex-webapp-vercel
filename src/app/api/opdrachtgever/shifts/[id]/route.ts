import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  BroadcastEvent,
  broadcastOpdrachtEvent,
} from "@/lib/supabase/broadcast";

// Schema for updating shifts
const updateShiftSchema = z.object({
  titel: z.string().min(1).optional(),
  beschrijving: z.string().optional(),
  locatie: z.string().min(1).optional(),
  adres: z.string().optional(),
  datum: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  startTijd: z.string().min(1).optional(),
  eindTijd: z.string().min(1).optional(),
  aantalBeveiligers: z.number().min(1).optional(),
  uurtarief: z.number().min(0).optional(),
  budget: z.number().optional(),
  vereisten: z.array(z.string()).optional(),
  specialisatie: z.string().optional(),
  isUrgent: z.boolean().optional(),
  status: z
    .enum([
      "OPEN",
      "GEPUBLICEERD",
      "BEVESTIGD",
      "BEZIG",
      "AFGEROND",
      "GEANNULEERD",
    ])
    .optional(),
});

// GET /api/opdrachtgever/shifts/[id] - Get specific shift
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const opdrachtgeverProfile = await prisma.opdrachtgever.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!opdrachtgeverProfile) {
      return NextResponse.json(
        { success: false, error: "Opdrachtgever profile not found" },
        { status: 404 },
      );
    }

    try {
      const shift = await prisma.opdracht.findFirst({
        where: {
          id: id,
          opdrachtgeverId: opdrachtgeverProfile.id,
        },
        include: {
          sollicitaties: {
            include: {
              zzp: {
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
            },
            orderBy: {
              appliedAt: "desc",
            },
          },
          werkuren: {
            include: {
              zzp: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              startTijd: "desc",
            },
          },
          feedback: true,
          opdrachtgever: {
            select: {
              bedrijfsnaam: true,
              contactpersoon: true,
            },
          },
        },
      });

      if (!shift) {
        return NextResponse.json(
          { success: false, error: "Shift not found" },
          { status: 404 },
        );
      }

      // Transform shift data for frontend
      const transformedShift = {
        id: shift.id,
        title: shift.titel,
        description: shift.beschrijving,
        location: shift.locatie,
        address: shift.locatie,
        date: shift.startDatum,
        startTime: shift.startDatum.toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: shift.eindDatum.toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: shift.status,
        budget: null,
        hourlyRate: shift.uurtarief,
        requiredBeveiligers: shift.aantalBeveiligers,
        requirements: shift.vereisten || [],
        specialization: null,
        isUrgent: shift.status === "URGENT",
        directBooking: shift.directZZPAllowed,
        targetAudience: shift.targetAudience,

        // Application details
        applications: shift.sollicitaties.map((sol: any) => ({
          id: sol.id,
          beveiligerId: sol.zzpId,
          name: sol.zzp?.user?.name || "Onbekend",
          email: sol.zzp?.user?.email || "Onbekend",
          phone: sol.zzp?.user?.phone || "Onbekend",
          status: sol.status,
          appliedAt: sol.appliedAt,
          motivatie: sol.motivatie,
          rating: sol.zzp?.rating || 0,
          profileData: {
            specialisaties: sol.zzp?.specialisaties || [],
            certificaten: sol.zzp?.certificaten || [],
            totalReviews: 0,
          },
        })),

        // Accepted beveiliger
        acceptedBeveiliger: null,

        // Work hours tracking
        workHours: shift.werkuren.map((wu: any) => ({
          id: wu.id,
          beveiligerId: wu.zzpId,
          beveiligernaam: wu.zzp?.user?.name || "Onbekend",
          datum: wu.startTijd,
          startTijd: wu.startTijd,
          eindTijd: wu.eindTijd,
          pauze: 0,
          urenGewerkt: wu.urenGewerkt,
          uurtarief: wu.uurtarief,
          totaalBedrag: Number(wu.urenGewerkt) * Number(wu.uurtarief),
          status: wu.status,
          opmerking: null,
        })),

        // Feedback
        feedback: null,

        // Company info
        company: {
          name: shift.opdrachtgever?.bedrijfsnaam || "Onbekend",
          contact: shift.opdrachtgever?.contactpersoon || "Onbekend",
        },

        // Metadata
        createdAt: shift.createdAt,
        updatedAt: shift.updatedAt,
      };

      return NextResponse.json({
        success: true,
        data: transformedShift,
      });
    } catch (dbError) {
      console.error("Database error fetching shift:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch shift from database" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Get shift error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shift" },
      { status: 500 },
    );
  }
}

// PUT /api/opdrachtgever/shifts/[id] - Update shift
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const opdrachtgeverProfile = await prisma.opdrachtgever.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!opdrachtgeverProfile) {
      return NextResponse.json(
        { success: false, error: "Opdrachtgever profile not found" },
        { status: 404 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateShiftSchema.parse(body);

    try {
      // Check if shift exists and belongs to this opdrachtgever
      const existingShift = await prisma.opdracht.findFirst({
        where: {
          id: id,
          opdrachtgeverId: opdrachtgeverProfile.id,
        },
      });

      if (!existingShift) {
        return NextResponse.json(
          { success: false, error: "Shift not found or access denied" },
          { status: 404 },
        );
      }

      // Check if shift can be updated (not if it's completed or cancelled)
      if (
        existingShift.status === "AFGEROND" ||
        existingShift.status === "GEANNULEERD"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot update completed or cancelled shifts",
          },
          { status: 400 },
        );
      }

      // Recalculate budget if relevant fields changed
      let updatedBudget = validatedData.budget;
      if (
        !updatedBudget &&
        (validatedData.uurtarief ||
          validatedData.aantalBeveiligers ||
          validatedData.startTijd ||
          validatedData.eindTijd)
      ) {
        const uurtarief = validatedData.uurtarief || existingShift.uurtarief;
        const aantalBeveiligers =
          validatedData.aantalBeveiligers || existingShift.aantalBeveiligers;
        const startTijd = validatedData.startTijd || existingShift.startTijd;
        const eindTijd = validatedData.eindTijd || existingShift.eindTijd;

        const startHour = parseInt(startTijd.split(":")[0], 10);
        const endHour = parseInt(eindTijd.split(":")[0], 10);
        const hours = endHour - startHour;

        updatedBudget = Number(uurtarief) * aantalBeveiligers * hours;
      }

      // Update shift
      const updatedShift = await prisma.opdracht.update({
        where: { id: id },
        data: {
          ...validatedData,
          budget: updatedBudget,
          updatedAt: new Date(),
        },
        include: {
          sollicitaties: {
            include: {
              zzp: {
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
        },
      });

      console.log(
        `Shift ${id} updated by opdrachtgever ${opdrachtgeverProfile.id}`,
      );

      // Broadcast the shift update
      await broadcastOpdrachtEvent(
        BroadcastEvent.OPDRACHT_UPDATED,
        updatedShift,
      );

      return NextResponse.json({
        success: true,
        data: updatedShift,
        message: "Shift succesvol bijgewerkt",
      });
    } catch (dbError) {
      console.error("Database error updating shift:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to update shift in database" },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Update shift error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update shift" },
      { status: 500 },
    );
  }
}

// DELETE /api/opdrachtgever/shifts/[id] - Delete/Cancel shift
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const opdrachtgeverProfile = await prisma.opdrachtgever.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!opdrachtgeverProfile) {
      return NextResponse.json(
        { success: false, error: "Opdrachtgever profile not found" },
        { status: 404 },
      );
    }

    try {
      // Check if shift exists and belongs to this opdrachtgever
      const existingShift = await prisma.opdracht.findFirst({
        where: {
          id: id,
          opdrachtgeverId: opdrachtgeverProfile.id,
        },
        include: {
          sollicitaties: true,
          werkuren: true,
        },
      });

      if (!existingShift) {
        return NextResponse.json(
          { success: false, error: "Shift not found or access denied" },
          { status: 404 },
        );
      }

      // Check if shift can be cancelled
      if (existingShift.status === "AFGEROND") {
        return NextResponse.json(
          { success: false, error: "Cannot cancel completed shifts" },
          { status: 400 },
        );
      }

      if (existingShift.status === "BEZIG") {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot cancel active shifts. Please contact support.",
          },
          { status: 400 },
        );
      }

      // Instead of deleting, mark as cancelled
      const cancelledShift = await prisma.opdracht.update({
        where: { id: id },
        data: {
          status: "GEANNULEERD",
          updatedAt: new Date(),
        },
      });

      // Update any pending sollicitaties to rejected
      if (existingShift.sollicitaties.length > 0) {
        await prisma.opdrachtSollicitatie.updateMany({
          where: {
            opdrachtId: id,
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
            updatedAt: new Date(),
          },
        });
      }

      console.log(
        `Shift ${id} cancelled by opdrachtgever ${opdrachtgeverProfile.id}`,
      );

      // Broadcast the shift cancellation (status change)
      await broadcastOpdrachtEvent(
        BroadcastEvent.OPDRACHT_STATUS_CHANGED,
        cancelledShift,
      );

      return NextResponse.json({
        success: true,
        data: cancelledShift,
        message: "Shift succesvol geannuleerd",
      });
    } catch (dbError) {
      console.error("Database error cancelling shift:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to cancel shift in database" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Cancel shift error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel shift" },
      { status: 500 },
    );
  }
}
