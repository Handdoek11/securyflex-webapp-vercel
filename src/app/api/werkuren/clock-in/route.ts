import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clockInSchema } from "@/lib/validation/schemas";
import { calculateDistance } from "@/components/ui/gps-tracker";

// Rate limiting - prevent rapid clock-in attempts
const clockInAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

// GPS validation constants
const MAX_ALLOWED_ACCURACY = 100; // meters
const MAX_LOCATION_DISTANCE = 200; // meters from job location
const MAX_SPEED_THRESHOLD = 100; // km/h (to detect GPS spoofing)

// POST /api/werkuren/clock-in - Clock in with GPS validation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get and validate request data
    const body = await request.json();
    const validation = clockInSchema.safeParse(body);

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

    const { opdrachtId, locatie, foto, opmerkingen } = validation.data;

    // Rate limiting check
    const clientId = session.user.id;
    const now = Date.now();
    const attempts = clockInAttempts.get(clientId);

    if (attempts) {
      if (now - attempts.lastAttempt < RATE_LIMIT_WINDOW) {
        if (attempts.count >= MAX_ATTEMPTS) {
          return NextResponse.json(
            { success: false, error: "Te veel clock-in pogingen. Wacht 5 minuten." },
            { status: 429 }
          );
        }
        attempts.count++;
        attempts.lastAttempt = now;
      } else {
        // Reset counter after window
        attempts.count = 1;
        attempts.lastAttempt = now;
      }
    } else {
      clockInAttempts.set(clientId, { count: 1, lastAttempt: now });
    }

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

    // Get job details with location
    const opdracht = await prisma.opdracht.findUnique({
      where: { id: opdrachtId },
      include: {
        beveiligers: {
          where: {
            zzpId: zzpProfile.id,
            status: "ACCEPTED"
          }
        },
        opdrachtgever: {
          select: { bedrijfsnaam: true }
        },
        bedrijf: {
          select: { bedrijfsnaam: true }
        }
      }
    });

    if (!opdracht) {
      return NextResponse.json(
        { success: false, error: "Opdracht not found" },
        { status: 404 }
      );
    }

    // Check if user is assigned to this job
    if (opdracht.beveiligers.length === 0) {
      return NextResponse.json(
        { success: false, error: "You are not assigned to this job" },
        { status: 403 }
      );
    }

    // Check if job is active and within time window
    const now_date = new Date();
    const jobStart = new Date(opdracht.startDatum);
    const jobEnd = new Date(opdracht.eindDatum);

    // Allow clock-in 30 minutes before job start
    const allowedClockInTime = new Date(jobStart.getTime() - 30 * 60 * 1000);

    if (now_date < allowedClockInTime) {
      return NextResponse.json(
        {
          success: false,
          error: `Te vroeg om in te checken. Je kunt ${allowedClockInTime.toLocaleTimeString("nl-NL")} inchecken.`
        },
        { status: 400 }
      );
    }

    if (now_date > jobEnd) {
      return NextResponse.json(
        { success: false, error: "Job has ended, cannot clock in" },
        { status: 400 }
      );
    }

    // Check if already clocked in for this job
    const existingClockIn = await prisma.werkuur.findFirst({
      where: {
        zzpId: zzpProfile.id,
        opdrachtId: opdrachtId,
        eindTijd: null // Still clocked in
      }
    });

    if (existingClockIn) {
      return NextResponse.json(
        { success: false, error: "Already clocked in for this job" },
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

    // 2. Validate location against job location (if we have it)
    // Note: In real implementation, job locations would be stored in database
    // For now, we'll simulate this with mock coordinates
    const jobLocation = getJobLocation(opdrachtId); // Mock function

    if (jobLocation) {
      const distance = calculateDistance(
        locatie.lat,
        locatie.lng,
        jobLocation.lat,
        jobLocation.lng
      );

      if (distance > MAX_LOCATION_DISTANCE) {
        return NextResponse.json(
          {
            success: false,
            error: `You are ${Math.round(distance)}m from the job location. You must be within ${MAX_LOCATION_DISTANCE}m to clock in.`,
            code: "OUTSIDE_GEOFENCE",
            details: {
              currentDistance: Math.round(distance),
              maxDistance: MAX_LOCATION_DISTANCE,
              jobLocation: jobLocation.address
            }
          },
          { status: 400 }
        );
      }
    }

    // 3. Speed validation (anti-spoofing)
    const lastGPSRecord = await getLastGPSRecord(zzpProfile.id);
    if (lastGPSRecord && lastGPSRecord.timestamp) {
      const timeDiff = (now_date.getTime() - lastGPSRecord.timestamp.getTime()) / 1000; // seconds

      if (timeDiff > 0 && timeDiff < 300) { // Only check if within 5 minutes
        const distance = calculateDistance(
          locatie.lat,
          locatie.lng,
          lastGPSRecord.lat,
          lastGPSRecord.lng
        );

        const speed = (distance / timeDiff) * 3.6; // km/h

        if (speed > MAX_SPEED_THRESHOLD) {
          return NextResponse.json(
            {
              success: false,
              error: "GPS anomaly detected. Please try again in a few moments.",
              code: "GPS_ANOMALY"
            },
            { status: 400 }
          );
        }
      }
    }

    // Create clock-in record
    const werkuur = await prisma.werkuur.create({
      data: {
        zzpId: zzpProfile.id,
        opdrachtId: opdrachtId,
        datum: now_date,
        startTijd: now_date,
        startLocatie: {
          lat: locatie.lat,
          lng: locatie.lng,
          accuracy: locatie.accuracy,
          timestamp: now_date.toISOString(),
          address: jobLocation?.address || "Unknown location"
        },
        uurtarief: opdracht.uurtarief,
        status: "ACTIVE",
        opmerkingen: opmerkingen || "",
        // Store photo if provided
        ...(foto && {
          metadata: {
            clockInPhoto: foto,
            clockInTime: now_date.toISOString()
          }
        })
      }
    });

    // Store GPS record for speed validation
    await storeGPSRecord(zzpProfile.id, {
      lat: locatie.lat,
      lng: locatie.lng,
      accuracy: locatie.accuracy,
      timestamp: now_date
    });

    // Send real-time notification to job owner
    await sendClockInNotification(opdracht, zzpProfile, now_date);

    // Reset rate limiting on successful clock-in
    clockInAttempts.delete(clientId);

    return NextResponse.json({
      success: true,
      message: "Successfully clocked in",
      data: {
        werkuurId: werkuur.id,
        clockInTime: now_date.toISOString(),
        jobTitle: opdracht.titel,
        company: opdracht.opdrachtgever?.bedrijfsnaam || opdracht.bedrijf?.bedrijfsnaam,
        hourlyRate: opdracht.uurtarief,
        location: {
          accuracy: locatie.accuracy,
          distance: jobLocation ? Math.round(calculateDistance(
            locatie.lat,
            locatie.lng,
            jobLocation.lat,
            jobLocation.lng
          )) : null
        }
      }
    });

  } catch (error) {
    console.error("Clock-in error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during clock-in" },
      { status: 500 }
    );
  }
}

// Mock function to get job location - in production this would come from database
function getJobLocation(opdrachtId: string) {
  // Mock job locations
  const jobLocations: Record<string, { lat: number; lng: number; address: string }> = {
    "1": { lat: 52.3676, lng: 4.9041, address: "Amsterdam Zuidoost" },
    "2": { lat: 51.9244, lng: 4.4777, address: "Rotterdam Centrum" },
    "3": { lat: 52.0705, lng: 4.3007, address: "Den Haag Centrum" },
    "4": { lat: 52.3702, lng: 4.8952, address: "Amsterdam Leidseplein" },
  };

  return jobLocations[opdrachtId] || null;
}

// Store GPS record for fraud detection
async function storeGPSRecord(zzpId: string, location: any) {
  try {
    // In production, store in a separate GPS tracking table
    // For now, we'll use a simple cache or database approach
    await prisma.werkuur.updateMany({
      where: {
        beveiligerId: beveiligerId,
        status: "ACTIVE"
      },
      data: {
        metadata: {
          lastGPSUpdate: location
        }
      }
    });
  } catch (error) {
    console.error("Failed to store GPS record:", error);
  }
}

// Get last GPS record for speed validation
async function getLastGPSRecord(beveiligerId: string) {
  try {
    const lastRecord = await prisma.werkuur.findFirst({
      where: {
        beveiligerId: beveiligerId
      },
      orderBy: {
        startTijd: 'desc'
      },
      select: {
        startLocatie: true,
        startTijd: true
      }
    });

    if (lastRecord?.startLocatie && typeof lastRecord.startLocatie === 'object') {
      const location = lastRecord.startLocatie as any;
      return {
        lat: location.lat,
        lng: location.lng,
        timestamp: lastRecord.startTijd
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to get last GPS record:", error);
    return null;
  }
}

// Send notification to job owner
async function sendClockInNotification(opdracht: any, beveiliger: any, clockInTime: Date) {
  try {
    // In production, this would integrate with your notification service
    console.log(`Clock-in notification: ${beveiliger.user.name} clocked in for ${opdracht.titel} at ${clockInTime.toISOString()}`);

    // Could integrate with:
    // - Email service
    // - Push notifications
    // - Slack/Teams webhook
    // - SMS service

  } catch (error) {
    console.error("Failed to send clock-in notification:", error);
  }
}