import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Mock data for when database is empty
const mockTimeEntries = [
  {
    id: "1",
    date: new Date("2025-09-16"),
    dayName: "Ma",
    company: "SecureEvents BV",
    project: "Concert Beveiliging",
    startTime: "20:00",
    endTime: "02:00",
    breakTime: 30,
    totalHours: 5.5,
    hourlyRate: 28.5,
    totalEarned: 156.75,
    status: "APPROVED",
    isGPSVerified: true,
    location: "Amsterdam Zuidoost",
  },
  {
    id: "2",
    date: new Date("2025-09-17"),
    dayName: "Di",
    company: "SecureGuard Nederland",
    project: "Winkelcentrum Bewaking",
    startTime: "22:00",
    endTime: "06:00",
    breakTime: 30,
    totalHours: 7.5,
    hourlyRate: 26.0,
    totalEarned: 195.0,
    status: "PENDING",
    isGPSVerified: true,
    location: "Rotterdam Centrum",
  },
  {
    id: "3",
    date: new Date("2025-09-18"),
    dayName: "Wo",
    company: null,
    project: null,
    startTime: "",
    endTime: "",
    breakTime: 0,
    totalHours: 0,
    hourlyRate: 0,
    totalEarned: 0,
    status: "EMPTY",
    isGPSVerified: false,
    location: "",
  },
  {
    id: "4",
    date: new Date("2025-09-19"),
    dayName: "Do",
    company: "MobileSecure",
    project: "Mobiel Toezicht",
    startTime: "06:00",
    endTime: "14:00",
    breakTime: 60,
    totalHours: 7.0,
    hourlyRate: 29.0,
    totalEarned: 203.0,
    status: "PENDING",
    isGPSVerified: false,
    location: "Utrecht Noord",
  },
];

// GET /api/hours - Get user's work hours for a specific week
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
    const weekStart = url.searchParams.get("weekStart");
    const weekEnd = url.searchParams.get("weekEnd");

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

    let timeEntries = [];
    let weeklyStats = {
      totalHours: 0,
      totalEarnings: 0,
      approvedEarnings: 0,
      pendingEarnings: 0,
    };

    try {
      // Parse week boundaries
      const startDate = weekStart ? new Date(weekStart) : new Date();
      const endDate = weekEnd
        ? new Date(weekEnd)
        : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get work hours from database
      const workHours = await prisma.werkuur.findMany({
        where: {
          zzpId: zzpProfile.id,
          startTijd: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          opdracht: {
            include: {
              opdrachtgever: {
                select: {
                  bedrijfsnaam: true,
                },
              },
              creatorBedrijf: {
                select: {
                  bedrijfsnaam: true,
                },
              },
              acceptedBedrijf: {
                select: {
                  bedrijfsnaam: true,
                },
              },
            },
          },
        },
        orderBy: {
          startTijd: "asc",
        },
      });

      // Transform database work hours to frontend format
      timeEntries = workHours.map((wh) => {
        const date = new Date(wh.startTijd);
        const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

        return {
          id: wh.id,
          date: wh.startTijd,
          dayName: dayNames[date.getDay()],
          company:
            wh.opdracht.opdrachtgever?.bedrijfsnaam ||
            wh.opdracht.creatorBedrijf?.bedrijfsnaam ||
            wh.opdracht.acceptedBedrijf?.bedrijfsnaam ||
            "Onbekend",
          project: wh.opdracht.titel,
          startTime: wh.startTijd
            ? wh.startTijd.toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          endTime: wh.eindTijd
            ? wh.eindTijd.toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          breakTime: 0, // Not stored in current Werkuur model
          totalHours: Number(wh.urenGewerkt) || 0,
          hourlyRate: Number(wh.uurtarief) || 0,
          totalEarned:
            Number(wh.urenGewerkt) * Number(wh.uurtarief) -
            Number(wh.platformFee),
          status: wh.status || "PENDING",
          isGPSVerified: !!(wh.startLocatie && wh.eindLocatie),
          location: wh.opdracht.locatie || "",
          opdrachtId: wh.opdrachtId,
        };
      });

      // Calculate weekly stats
      weeklyStats = {
        totalHours: timeEntries.reduce(
          (sum, entry) => sum + entry.totalHours,
          0,
        ),
        totalEarnings: timeEntries.reduce(
          (sum, entry) => sum + entry.totalEarned,
          0,
        ),
        approvedEarnings: timeEntries
          .filter((entry) => entry.status === "PAID")
          .reduce((sum, entry) => sum + entry.totalEarned, 0),
        pendingEarnings: timeEntries
          .filter((entry) => entry.status === "PENDING")
          .reduce((sum, entry) => sum + entry.totalEarned, 0),
      };

      // Fill in empty days for the week
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const existingEntry = timeEntries.find(
          (entry) =>
            new Date(entry.date).toDateString() === currentDate.toDateString(),
        );

        if (!existingEntry) {
          const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
          weekDays.push({
            id: `empty-${i}`,
            date: currentDate,
            dayName: dayNames[currentDate.getDay()],
            company: null,
            project: null,
            startTime: "",
            endTime: "",
            breakTime: 0,
            totalHours: 0,
            hourlyRate: 0,
            totalEarned: 0,
            status: "EMPTY",
            isGPSVerified: false,
            location: "",
            opdrachtId: null,
          });
        } else {
          weekDays.push(existingEntry);
        }
      }

      timeEntries = weekDays;

      console.log(
        `Found ${workHours.length} work hours from database for week ${startDate.toISOString().split("T")[0]}`,
      );
    } catch (dbError) {
      console.error("Database query failed, using mock data:", dbError);

      // Filter mock data for requested week if provided
      if (weekStart && weekEnd) {
        const start = new Date(weekStart);
        const end = new Date(weekEnd);
        timeEntries = mockTimeEntries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });
      } else {
        timeEntries = mockTimeEntries;
      }

      // Calculate stats from mock data
      weeklyStats = {
        totalHours: timeEntries.reduce(
          (sum, entry) => sum + entry.totalHours,
          0,
        ),
        totalEarnings: timeEntries.reduce(
          (sum, entry) => sum + entry.totalEarned,
          0,
        ),
        approvedEarnings: timeEntries
          .filter((entry) => entry.status === "APPROVED")
          .reduce((sum, entry) => sum + entry.totalEarned, 0),
        pendingEarnings: timeEntries
          .filter((entry) => entry.status === "PENDING")
          .reduce((sum, entry) => sum + entry.totalEarned, 0),
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        timeEntries,
        weeklyStats,
        weekInfo: {
          startDate: weekStart || new Date().toISOString(),
          endDate:
            weekEnd ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Hours fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch work hours" },
      { status: 500 },
    );
  }
}

// POST /api/hours - Create manual time entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { opdrachtId, datum, startTijd, eindTijd, pauzetijd, opmerkingen } =
      body;

    // Get user's ZZP profile
    const zzpProfile = await prisma.zZPProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!zzpProfile) {
      return NextResponse.json(
        { success: false, error: "ZZP profile not found" },
        { status: 404 },
      );
    }

    // Validate required fields
    if (!opdrachtId || !datum || !startTijd || !eindTijd) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get job details for rate calculation
    const opdracht = await prisma.opdracht.findUnique({
      where: { id: opdrachtId },
    });

    if (!opdracht) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 },
      );
    }

    // Calculate hours and earnings
    const start = new Date(`${datum}T${startTijd}`);
    const end = new Date(`${datum}T${eindTijd}`);
    const workMinutes =
      (end.getTime() - start.getTime()) / (1000 * 60) - (pauzetijd || 0);
    const workHours = workMinutes / 60;
    const grossEarnings = workHours * Number(opdracht.uurtarief);
    const platformFee = Math.ceil(workHours) * 2.99;
    const netEarnings = grossEarnings - platformFee;

    // Create manual work hour entry
    const workHour = await prisma.werkuur.create({
      data: {
        zzpId: zzpProfile.id,
        opdrachtId,
        startTijd: start,
        eindTijd: end,
        urenGewerkt: Number(workHours.toFixed(2)),
        uurtarief: opdracht.uurtarief,
        platformFee: Number(platformFee.toFixed(2)),
        status: "PENDING", // Manual entries need approval
        startLocatie: {
          type: "MANUAL_ENTRY",
          createdAt: new Date().toISOString(),
          requiresApproval: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Time entry created successfully",
      data: {
        id: workHour.id,
        totalHours: workHours,
        netEarnings,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("Manual time entry creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create time entry" },
      { status: 500 },
    );
  }
}
