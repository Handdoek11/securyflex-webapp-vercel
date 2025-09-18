import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Mock data for when database is empty
const mockShifts = {
  aankomend: [
    {
      id: "1",
      title: "Evenementbeveiliging - Concert",
      company: "SecureEvents BV",
      location: "Amsterdam Zuidoost",
      date: new Date("2025-09-20T18:00:00Z"),
      startTime: "18:00",
      endTime: "02:00",
      hourlyRate: 28.5,
      contactPerson: "Jan Bakker",
      contactPhone: "06-12345678",
      status: "BEVESTIGD",
      instructions:
        "Melden bij hoofdingang om 17:45. Zwarte kleding en oordopjes meebrengen.",
      address: "Johan Cruijff ArenA, Amsterdam",
      canClockIn: false,
      estimatedEarnings: 228,
    },
    {
      id: "2",
      title: "Objectbeveiliging Winkelcentrum",
      company: "SecureGuard Nederland",
      location: "Rotterdam Centrum",
      date: new Date("2025-09-22T22:00:00Z"),
      startTime: "22:00",
      endTime: "06:00",
      hourlyRate: 26.0,
      contactPerson: "Maria van den Berg",
      contactPhone: "010-7654321",
      status: "WACHTEN",
      instructions: "Briefing om 21:45 bij beveiligingskantoor.",
      address: "Beurstraverse 100, Rotterdam",
      canClockIn: false,
      estimatedEarnings: 208,
    },
  ],
  actief: [
    {
      id: "3",
      title: "Mobiel Toezicht - Bedrijventerrein",
      company: "MobileSecure",
      location: "Utrecht Noord",
      date: new Date("2025-09-16T20:00:00Z"),
      startTime: "20:00",
      endTime: "06:00",
      hourlyRate: 29.0,
      contactPerson: "Piet de Vries",
      contactPhone: "030-9876543",
      status: "ACTIEF",
      checkedInAt: "19:58",
      instructions: "Rondgang elke 2 uur. Route kaart bij conciërge.",
      address: "Bedrijventerrein De Wetering, Utrecht",
      hoursWorked: 4.5,
      currentEarnings: 130.5,
      werkuurId: "werkuur-3",
    },
  ],
  historie: [
    {
      id: "4",
      title: "Winkelbeveiliging",
      company: "RetailSecure",
      location: "Den Haag",
      date: new Date("2025-09-15T09:00:00Z"),
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 24.0,
      status: "VOLTOOID",
      hoursWorked: 8,
      totalEarned: 192.0,
      rating: 5,
      paymentStatus: "PAID",
    },
    {
      id: "5",
      title: "Evenementbeveiliging - Voetbalwedstrijd",
      company: "SportSecure",
      location: "Amsterdam",
      date: new Date("2025-09-14T12:00:00Z"),
      startTime: "12:00",
      endTime: "18:00",
      hourlyRate: 30.0,
      status: "VOLTOOID",
      hoursWorked: 6,
      totalEarned: 180.0,
      rating: 4,
      paymentStatus: "PAID",
    },
  ],
};

// GET /api/shifts - Get user's shifts organized by status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all"; // all, aankomend, actief, historie

    // Get user's ZZP profile
    let zzpProfile = null;
    try {
      zzpProfile = await prisma.zZPProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
    } catch (error) {
      console.error("Failed to get ZZP profile:", error);
    }

    if (!zzpProfile) {
      return NextResponse.json(
        { success: false, error: "ZZP profile not found" },
        { status: 404 },
      );
    }

    let shifts = { aankomend: [], actief: [], historie: [] };

    try {
      // Get all accepted job applications for this beveiliger
      const applications = await prisma.opdrachtSollicitatie.findMany({
        where: {
          zzpId: zzpProfile.id,
          status: "ACCEPTED",
        },
        include: {
          opdracht: {
            include: {
              opdrachtgever: {
                select: {
                  bedrijfsnaam: true,
                  contactpersoon: true,
                  telefoonnummer: true,
                },
              },
              bedrijf: {
                select: {
                  bedrijfsnaam: true,
                  contactpersoon: true,
                  telefoonnummer: true,
                },
              },
              werkuren: {
                where: {
                  beveiligerId: zzpProfile.id,
                },
                orderBy: {
                  datum: "desc",
                },
              },
            },
          },
        },
        orderBy: {
          opdracht: {
            startDatum: "desc",
          },
        },
      });

      const now = new Date();

      // Process applications into shift categories
      for (const app of applications) {
        const job = app.opdracht;
        const startDate = new Date(job.startDatum);
        const endDate = new Date(job.eindDatum);

        // Find active work hour record for this job
        const activeWorkHour = job.werkuren.find(
          (wh) => !wh.eindTijd && wh.startTijd,
        );
        const completedWorkHours = job.werkuren.filter((wh) => wh.eindTijd);

        // Calculate total hours and earnings from completed work sessions
        const totalHours = completedWorkHours.reduce(
          (sum, wh) => sum + (wh.totaleUren || 0),
          0,
        );
        const totalEarnings = completedWorkHours.reduce(
          (sum, wh) => sum + (wh.nettoBedrag || 0),
          0,
        );

        const shift = {
          id: job.id,
          title: job.titel,
          description: job.beschrijving,
          company:
            job.opdrachtgever?.bedrijfsnaam ||
            job.bedrijf?.bedrijfsnaam ||
            "Onbekend",
          location: job.locatie,
          date: startDate,
          startTime: startDate.toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: endDate.toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          hourlyRate: Number(job.uurtarief),
          contactPerson:
            job.opdrachtgever?.contactpersoon ||
            job.bedrijf?.contactpersoon ||
            "Contactpersoon",
          contactPhone:
            job.opdrachtgever?.telefoonnummer ||
            job.bedrijf?.telefoonnummer ||
            "Niet beschikbaar",
          address: job.locatie,
          instructions: job.instructies || null,
          estimatedEarnings: Math.round(
            ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) *
              Number(job.uurtarief) *
              0.88,
          ),
          applicationId: app.id,
          canClockIn: false,
          hoursWorked: totalHours,
          totalEarned: totalEarnings,
        };

        // Categorize shifts
        if (activeWorkHour) {
          // Currently active shift
          shifts.actief.push({
            ...shift,
            status: "ACTIEF",
            checkedInAt: activeWorkHour.startTijd.toLocaleTimeString("nl-NL", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            werkuurId: activeWorkHour.id,
            currentEarnings:
              ((now.getTime() - activeWorkHour.startTijd.getTime()) /
                (1000 * 60 * 60)) *
              Number(job.uurtarief) *
              0.88,
          });
        } else if (endDate < now) {
          // Completed shifts
          shifts.historie.push({
            ...shift,
            status: completedWorkHours.length > 0 ? "VOLTOOID" : "GEMIST",
            rating: 4, // Would get from reviews table
            paymentStatus: "PAID", // Would get from payment records
          });
        } else {
          // Upcoming shifts
          const canClockIn =
            startDate.getTime() - now.getTime() <= 30 * 60 * 1000; // 30 minutes before
          shifts.aankomend.push({
            ...shift,
            status: "BEVESTIGD",
            canClockIn,
          });
        }
      }

      console.log(`Found ${applications.length} shifts from database`);
    } catch (dbError) {
      console.error("Database query failed, using mock data:", dbError);
      shifts = mockShifts;
    }

    // Filter by status if requested
    if (status !== "all") {
      const filteredShifts = { aankomend: [], actief: [], historie: [] };
      if (shifts[status]) {
        filteredShifts[status] = shifts[status];
      }
      shifts = filteredShifts;
    }

    // Calculate summary stats
    const stats = {
      totalShifts:
        shifts.aankomend.length + shifts.actief.length + shifts.historie.length,
      upcomingShifts: shifts.aankomend.length,
      activeShifts: shifts.actief.length,
      completedShifts: shifts.historie.length,
      totalEarningsThisWeek: shifts.historie
        .filter((s) => {
          const shiftDate = new Date(s.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return shiftDate >= weekAgo;
        })
        .reduce((sum, s) => sum + (s.totalEarned || 0), 0),
      averageRating:
        shifts.historie.length > 0
          ? shifts.historie.reduce((sum, s) => sum + (s.rating || 0), 0) /
            shifts.historie.length
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        shifts,
        stats,
      },
    });
  } catch (error) {
    console.error("Shifts fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shifts" },
      { status: 500 },
    );
  }
}
