import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clockOutSchema } from "@/lib/validation/schemas";
import { calculateDistance } from "@/components/ui/gps-tracker";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GPS validation constants
const MAX_ALLOWED_ACCURACY = 150; // meters (slightly more lenient for clock-out)
const MAX_LOCATION_DISTANCE = 300; // meters from clock-in location
const MIN_WORK_DURATION = 5 * 60 * 1000; // 5 minutes minimum
const MAX_WORK_DURATION = 16 * 60 * 60 * 1000; // 16 hours maximum

// PATCH /api/werkuren/[id]/clock-out - Clock out with GPS validation
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: werkuurId } = await params;

    // Get and validate request data
    const body = await request.json();
    const validation = clockOutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { locatie, foto, pauzetijd, opmerkingen, incidenten } = validation.data;

    // Get ZZP profile
    const zzpProfile = await prisma.zZPProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    });

    if (!zzpProfile) {
      return NextResponse.json(
        { success: false, error: "ZZP profile not found" },
        { status: 404 }
      );
    }

    // Get active work hour record
    const werkuur = await prisma.werkuur.findUnique({
      where: { id: werkuurId },
      include: {
        opdracht: {
          include: {
            opdrachtgever: {
              select: { bedrijfsnaam: true }
            },
            bedrijf: {
              select: { bedrijfsnaam: true }
            }
          }
        }
      }
    });

    if (!werkuur) {
      return NextResponse.json(
        { success: false, error: "Work hour record not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (werkuur.beveiligerId !== zzpProfile.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized for this work hour record" },
        { status: 403 }
      );
    }

    // Check if already clocked out
    if (werkuur.eindTijd) {
      return NextResponse.json(
        { success: false, error: "Already clocked out" },
        { status: 400 }
      );
    }

    // Validate work duration
    const now_date = new Date();
    const workDuration = now_date.getTime() - werkuur.startTijd.getTime();

    if (workDuration < MIN_WORK_DURATION) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum work duration is 5 minutes. You've worked for ${Math.round(workDuration / 60000)} minutes.`,
          code: "WORK_DURATION_TOO_SHORT"
        },
        { status: 400 }
      );
    }

    if (workDuration > MAX_WORK_DURATION) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum work duration exceeded (16 hours). Please contact support.",
          code: "WORK_DURATION_TOO_LONG"
        },
        { status: 400 }
      );
    }

    // GPS Validation

    // 1. Check GPS accuracy
    if (locatie.accuracy && locatie.accuracy > MAX_ALLOWED_ACCURACY) {
      return NextResponse.json(
        {
          success: false,
          error: `GPS accuracy insufficient (${Math.round(locatie.accuracy)}m). Required: <${MAX_ALLOWED_ACCURACY}m. Try moving outside for better signal.`,
          code: "GPS_ACCURACY_LOW"
        },
        { status: 400 }
      );
    }

    // 2. Validate distance from clock-in location
    if (werkuur.startLocatie && typeof werkuur.startLocatie === 'object') {
      const startLocation = werkuur.startLocatie as any;
      const distance = calculateDistance(
        locatie.lat,
        locatie.lng,
        startLocation.lat,
        startLocation.lng
      );

      if (distance > MAX_LOCATION_DISTANCE) {
        return NextResponse.json(
          {
            success: false,
            error: `Clock-out location too far from clock-in (${Math.round(distance)}m). Maximum allowed: ${MAX_LOCATION_DISTANCE}m.`,
            code: "CLOCK_OUT_TOO_FAR",
            details: {
              currentDistance: Math.round(distance),
              maxDistance: MAX_LOCATION_DISTANCE,
              suggestion: "Move closer to your work area to clock out"
            }
          },
          { status: 400 }
        );
      }
    }

    // Calculate total work hours
    const totalMinutes = Math.floor(workDuration / 60000);
    const breakMinutes = pauzetijd || 0;
    const workedMinutes = totalMinutes - breakMinutes;
    const workedHours = workedMinutes / 60;

    // Validate break time
    if (breakMinutes > totalMinutes) {
      return NextResponse.json(
        {
          success: false,
          error: "Break time cannot exceed total work time",
          code: "INVALID_BREAK_TIME"
        },
        { status: 400 }
      );
    }

    // Calculate earnings
    const hourlyRate = Number(werkuur.uurtarief);
    const grossEarnings = workedHours * hourlyRate;
    const platformFee = 2.99; // €2.99 platform fee per hour
    const totalPlatformFee = Math.ceil(workedHours) * platformFee;
    const netEarnings = grossEarnings - totalPlatformFee;

    // Prepare location data
    const clockOutLocation = {
      lat: locatie.lat,
      lng: locatie.lng,
      accuracy: locatie.accuracy,
      timestamp: now_date.toISOString(),
      distanceFromClockIn: werkuur.startLocatie ? Math.round(calculateDistance(
        locatie.lat,
        locatie.lng,
        (werkuur.startLocatie as any).lat,
        (werkuur.startLocatie as any).lng
      )) : null
    };

    // Prepare incidents data
    const incidentsData = incidenten?.map(incident => ({
      ...incident,
      reportedAt: now_date.toISOString(),
      reportedBy: zzpProfile.id
    }));

    // Update work hour record
    const updatedWerkuur = await prisma.werkuur.update({
      where: { id: werkuurId },
      data: {
        eindTijd: now_date,
        eindLocatie: clockOutLocation,
        totaleUren: Number(workedHours.toFixed(2)),
        pauzetijd: breakMinutes,
        brutoBedrag: Number(grossEarnings.toFixed(2)),
        platformKosten: Number(totalPlatformFee.toFixed(2)),
        nettoBedrag: Number(netEarnings.toFixed(2)),
        status: incidentsData && incidentsData.length > 0 ? "UNDER_REVIEW" : "COMPLETED",
        opmerkingen: [
          werkuur.opmerkingen,
          opmerkingen
        ].filter(Boolean).join('\n\n---\n\n'),
        metadata: {
          ...((werkuur.metadata as any) || {}),
          clockOutPhoto: foto,
          clockOutTime: now_date.toISOString(),
          incidents: incidentsData,
          workSummary: {
            totalMinutes,
            breakMinutes,
            workedMinutes,
            workedHours: Number(workedHours.toFixed(2)),
            grossEarnings: Number(grossEarnings.toFixed(2)),
            platformFee: Number(totalPlatformFee.toFixed(2)),
            netEarnings: Number(netEarnings.toFixed(2))
          }
        }
      }
    });

    // Create payment record
    await createPaymentRecord(updatedWerkuur, zzpProfile);

    // Send notifications
    await sendClockOutNotifications(updatedWerkuur, zzpProfile, incidentsData);

    // Prepare response data
    const workSummary = {
      workDate: werkuur.datum.toLocaleDateString("nl-NL"),
      clockInTime: werkuur.startTijd.toLocaleTimeString("nl-NL"),
      clockOutTime: now_date.toLocaleTimeString("nl-NL"),
      totalDuration: formatDuration(totalMinutes),
      breakTime: formatDuration(breakMinutes),
      workedTime: formatDuration(workedMinutes),
      workedHours: Number(workedHours.toFixed(2)),
      hourlyRate: hourlyRate,
      grossEarnings: Number(grossEarnings.toFixed(2)),
      platformFee: Number(totalPlatformFee.toFixed(2)),
      netEarnings: Number(netEarnings.toFixed(2)),
      jobTitle: werkuur.opdracht.titel,
      company: werkuur.opdracht.opdrachtgever?.bedrijfsnaam || werkuur.opdracht.bedrijf?.bedrijfsnaam,
      incidents: incidentsData?.length || 0
    };

    return NextResponse.json({
      success: true,
      message: "Successfully clocked out",
      data: {
        werkuurId: werkuur.id,
        status: updatedWerkuur.status,
        workSummary,
        nextSteps: {
          paymentProcessing: updatedWerkuur.status === "COMPLETED",
          reviewRequired: updatedWerkuur.status === "UNDER_REVIEW",
          estimatedPaymentDate: getEstimatedPaymentDate()
        }
      }
    });

  } catch (error) {
    console.error("Clock-out error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during clock-out" },
      { status: 500 }
    );
  }
}

// Create payment record
async function createPaymentRecord(werkuur: any, beveiliger: any) {
  try {
    await prisma.betaling.create({
      data: {
        bedrag: werkuur.nettoBedrag,
        status: "PENDING",
        type: "WERKUUR_BETALING",
        beschrijving: `Payment for work on ${werkuur.datum.toLocaleDateString("nl-NL")} - ${werkuur.opdracht.titel}`,
        metadata: {
          werkuurId: werkuur.id,
          beveiligerId: beveiliger.id,
          grossAmount: werkuur.brutoBedrag,
          platformFee: werkuur.platformKosten,
          hoursWorked: werkuur.totaleUren
        }
        // Note: Add recipient/sender IDs based on your payment model
      }
    });
  } catch (error) {
    console.error("Failed to create payment record:", error);
  }
}

// Send clock-out notifications
async function sendClockOutNotifications(werkuur: any, beveiliger: any, incidents: any[]) {
  try {
    // Notify job owner
    console.log(`Clock-out notification: ${beveiliger.user.name} clocked out for ${werkuur.opdracht.titel}`);

    // If incidents reported, notify support team
    if (incidents && incidents.length > 0) {
      console.log(`Incident alert: ${incidents.length} incidents reported during shift ${werkuur.id}`);

      // In production, send urgent notifications for incidents
      // Could integrate with:
      // - Support ticket system
      // - Emergency notification system
      // - Management dashboard alerts
    }

    // Send payment confirmation to beveiliger
    console.log(`Payment notification: €${werkuur.nettoBedrag} payment initiated for ${beveiliger.user.name}`);

  } catch (error) {
    console.error("Failed to send clock-out notifications:", error);
  }
}

// Utility functions
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}u`;
  }

  return `${hours}u ${mins}m`;
}

function getEstimatedPaymentDate(): string {
  const now = new Date();
  const paymentDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  return paymentDate.toLocaleDateString("nl-NL");
}