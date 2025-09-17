import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Mock data fallback for development
const mockJobs = [
  {
    id: "1",
    title: "Evenementbeveiliging - Concert",
    company: "SecureEvents BV",
    location: "Amsterdam Zuidoost",
    distance: "2.3 km",
    startDate: "2025-09-20",
    startTime: "18:00",
    endTime: "02:00",
    hourlyRate: 28.50,
    description: "Beveiliging voor groot muziekfestival. Ervaring met evenementen vereist.",
    requirements: ["BOA certificaat", "Evenementervaring", "Fysiek sterk"],
    type: "Evenement",
    isUrgent: true,
    isFavorite: false,
    image: "/images/jobs/evenement-beveiliging.jpg",
  },
  {
    id: "2",
    title: "Objectbeveiliging Winkelcentrum",
    company: "SecureGuard Nederland",
    location: "Rotterdam Centrum",
    distance: "15.2 km",
    startDate: "2025-09-18",
    startTime: "22:00",
    endTime: "06:00",
    hourlyRate: 26.00,
    description: "Nachtdienst beveiliging voor groot winkelcentrum.",
    requirements: ["WPBR vergunning", "Nachtdienst ervaring"],
    type: "Object",
    isUrgent: false,
    isFavorite: true,
    image: "/images/jobs/object-beveiliging.jpg",
  },
  {
    id: "3",
    title: "Winkelbeveiliging - Mode Boutique",
    company: "RetailSecure",
    location: "Den Haag Centrum",
    distance: "8.7 km",
    startDate: "2025-09-19",
    startTime: "09:00",
    endTime: "17:00",
    hourlyRate: 24.00,
    description: "Dagdienst beveiliging voor exclusieve modezaak.",
    requirements: ["WPBR vergunning", "Winkel ervaring"],
    type: "Winkel",
    isUrgent: false,
    isFavorite: false,
    image: "/images/jobs/winkel-beveiliging.jpg",
  },
  {
    id: "4",
    title: "Horeca Beveiliging - Nachtclub",
    company: "NightSecure",
    location: "Amsterdam Leidseplein",
    distance: "5.1 km",
    startDate: "2025-09-21",
    startTime: "22:00",
    endTime: "04:00",
    hourlyRate: 30.00,
    description: "Beveiliging voor drukke nachtclub in het uitgaansgebied.",
    requirements: ["BOA certificaat", "Horeca ervaring", "Stressbestendig"],
    type: "Horeca",
    isUrgent: true,
    isFavorite: false,
    image: "/images/jobs/horeca-beveiliging.jpg",
  },
];

// GET /api/jobs/[id] - Get job details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id: jobId } = await params;

    const job = await prisma.opdracht.findUnique({
      where: { id: jobId },
      include: {
        opdrachtgever: {
          select: {
            id: true,
            bedrijfsnaam: true,
            contactpersoon: true
          }
        },
        bedrijf: {
          select: {
            id: true,
            bedrijfsnaam: true,
            teamSize: true
          }
        },
        beveiligers: {
          select: {
            id: true,
            beveiligerId: true,
            status: true,
            beveiliger: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        werkuren: {
          select: {
            id: true,
            startTijd: true
          }
        }
      }
    });

    if (!job) {
      // Fallback to mock data for development
      const mockJob = mockJobs.find(j => j.id === jobId);
      if (mockJob) {
        // Convert mock data to expected format
        const formattedMockJob = {
          id: mockJob.id,
          title: mockJob.title,
          description: mockJob.description,
          location: mockJob.location,
          company: {
            id: "mock-company",
            name: mockJob.company,
            contactPerson: null,
            description: null,
            size: null
          },
          startDate: `${mockJob.startDate}T${mockJob.startTime}:00.000Z`,
          endDate: `${mockJob.startDate}T${mockJob.endTime}:00.000Z`,
          hourlyRate: mockJob.hourlyRate,
          spotsAvailable: 1,
          spotsRemaining: 1,
          applicantCount: 0,
          applicationStatus: null,
          status: "ACTIVE",
          isUrgent: mockJob.isUrgent,
          estimatedHours: 8,
          estimatedEarnings: mockJob.hourlyRate * 8,
          requirements: mockJob.requirements,
          type: mockJob.type
        };

        return NextResponse.json({
          success: true,
          data: formattedMockJob
        });
      }

      return NextResponse.json(
        { success: false, error: "Job not found", jobId },
        { status: 404 }
      );
    }

    // Check if current user has applied
    let applicationStatus = null;
    if (session?.user) {
      const zzpProfile = await prisma.zZPProfile.findUnique({
        where: { userId: session.user.id }
      });

      if (zzpProfile) {
        const application = job.beveiligers.find(
          b => b.beveiligerId === zzpProfile.id
        );
        applicationStatus = application?.status || null;
      }
    }

    // Format response
    const formattedJob = {
      id: job.id,
      title: job.titel,
      description: job.beschrijving,
      location: job.locatie,
      company: {
        id: job.opdrachtgeverId || job.bedrijfId,
        name: job.opdrachtgever?.bedrijfsnaam || job.bedrijf?.bedrijfsnaam || "Onbekend",
        contactPerson: job.opdrachtgever?.contactpersoon || null,
        description: null,
        size: job.bedrijf?.teamSize || null
      },
      startDate: job.startDatum,
      endDate: job.eindDatum,
      hourlyRate: job.uurtarief,
      spotsAvailable: job.aantalBeveiligers,
      spotsRemaining: job.aantalBeveiligers - job.beveiligers.filter(b => b.status === "ACCEPTED").length,
      applicantCount: job.beveiligers.length,
      applicationStatus,
      status: job.status,
      isUrgent: new Date(job.startDatum).getTime() - Date.now() < 48 * 60 * 60 * 1000,
      // Calculate estimated earnings
      estimatedHours: Math.floor((new Date(job.eindDatum).getTime() - new Date(job.startDatum).getTime()) / (1000 * 60 * 60)),
      estimatedEarnings: null // Will be calculated based on hours
    };

    // Calculate estimated earnings
    formattedJob.estimatedEarnings = formattedJob.estimatedHours * Number(job.uurtarief);

    return NextResponse.json({
      success: true,
      data: formattedJob
    });

  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] - Update job (for job owner)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    const data = await request.json();

    // Check ownership
    const job = await prisma.opdracht.findUnique({
      where: { id: jobId },
      include: {
        opdrachtgever: { select: { userId: true } },
        bedrijf: { select: { userId: true } }
      }
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const isOwner = job.opdrachtgever?.userId === session.user.id ||
                    job.bedrijf?.userId === session.user.id;

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this job" },
        { status: 403 }
      );
    }

    // Update job
    const updatedJob = await prisma.opdracht.update({
      where: { id: jobId },
      data: {
        titel: data.titel || undefined,
        beschrijving: data.beschrijving || undefined,
        locatie: data.locatie || undefined,
        startDatum: data.startDatum ? new Date(data.startDatum) : undefined,
        eindDatum: data.eindDatum ? new Date(data.eindDatum) : undefined,
        aantalBeveiligers: data.aantalBeveiligers ? parseInt(data.aantalBeveiligers) : undefined,
        uurtarief: data.uurtarief ? parseFloat(data.uurtarief) : undefined,
        status: data.status || undefined
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedJob
    });

  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete/Cancel job
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;

    // Check ownership
    const job = await prisma.opdracht.findUnique({
      where: { id: jobId },
      include: {
        opdrachtgever: { select: { userId: true } },
        bedrijf: { select: { userId: true } },
        beveiligers: true
      }
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const isOwner = job.opdrachtgever?.userId === session.user.id ||
                    job.bedrijf?.userId === session.user.id;

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to delete this job" },
        { status: 403 }
      );
    }

    // Check if job has accepted applicants
    if (job.beveiligers.some(b => b.status === "ACCEPTED")) {
      return NextResponse.json(
        { success: false, error: "Cannot delete job with accepted applicants" },
        { status: 400 }
      );
    }

    // Update status to CANCELLED instead of deleting
    await prisma.opdracht.update({
      where: { id: jobId },
      data: { status: "CANCELLED" }
    });

    return NextResponse.json({
      success: true,
      message: "Job cancelled successfully"
    });

  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete job" },
      { status: 500 }
    );
  }
}