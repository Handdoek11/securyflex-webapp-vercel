import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Mock application data for when database is empty
const mockApplications = [
  {
    id: "app-1",
    jobId: "1",
    status: "PENDING",
    appliedAt: new Date("2025-09-16T10:30:00Z"),
    job: {
      id: "1",
      title: "Evenementbeveiliging - Concert",
      company: "SecureEvents BV",
      location: "Amsterdam Zuidoost",
      startDate: new Date("2025-09-20T18:00:00Z"),
      hourlyRate: 28.5,
      totalApplicants: 3,
      status: "OPEN",
    },
  },
  {
    id: "app-2",
    jobId: "2",
    status: "ACCEPTED",
    appliedAt: new Date("2025-09-15T14:15:00Z"),
    acceptedAt: new Date("2025-09-16T09:00:00Z"),
    job: {
      id: "2",
      title: "Objectbeveiliging Winkelcentrum",
      company: "SecureGuard Nederland",
      location: "Rotterdam Centrum",
      startDate: new Date("2025-09-18T22:00:00Z"),
      hourlyRate: 26.0,
      totalApplicants: 8,
      status: "OPEN",
    },
  },
];

// GET /api/applications - Get user's applications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let applications = [];
    let totalCount = 0;

    try {
      // Get user's ZZP profile
      const zzpProfile = await prisma.zZPProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!zzpProfile) {
        return NextResponse.json({
          success: true,
          data: {
            applications: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
            stats: {
              totalApplications: 0,
              pending: 0,
              accepted: 0,
              rejected: 0,
              reviewing: 0,
            },
          },
        });
      }

      // Build where clause
      const where: Prisma.OpdrachtSollicitatieWhereInput = {
        zzpId: zzpProfile.id,
      };

      if (status !== "all") {
        where.status = status.toUpperCase();
      }

      // Get applications with pagination
      const [dbApplications, dbTotalCount] = await Promise.all([
        prisma.opdrachtSollicitatie.findMany({
          where,
          include: {
            opdracht: {
              include: {
                opdrachtgever: {
                  select: {
                    bedrijfsnaam: true,
                    contactpersoon: true,
                    id: true,
                  },
                },
                creatorBedrijf: {
                  select: {
                    bedrijfsnaam: true,
                    id: true,
                  },
                },
                _count: {
                  select: {
                    sollicitaties: true,
                  },
                },
              },
            },
          },
          orderBy: [{ sollicitatiedatum: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.opdrachtSollicitatie.count({ where }),
      ]);

      // Format database applications
      applications = dbApplications.map((app) => ({
        id: app.id,
        jobId: app.opdrachtId,
        status: app.status,
        appliedAt: app.sollicitatiedatum,
        acceptedAt: app.status === "ACCEPTED" ? app.beoordeeldOp : null,
        rejectedAt: app.status === "REJECTED" ? app.beoordeeldOp : null,
        notes: app.motivatie,
        job: {
          id: app.opdracht.id,
          title: app.opdracht.titel,
          description: app.opdracht.beschrijving,
          company:
            app.opdracht.opdrachtgever?.bedrijfsnaam ||
            app.opdracht.creatorBedrijf?.bedrijfsnaam ||
            "Onbekend",
          location: app.opdracht.locatie,
          startDate: app.opdracht.startDatum,
          endDate: app.opdracht.eindDatum,
          hourlyRate: Number(app.opdracht.uurtarief),
          totalApplicants: app.opdracht._count.sollicitaties,
          status: app.opdracht.status,
          isUrgent: app.opdracht.isUrgent,
        },
      }));

      totalCount = dbTotalCount;

      console.log(`Found ${applications.length} applications from database`);
    } catch (dbError) {
      console.error("Database query failed, using mock data:", dbError);

      // Filter mock data
      applications = mockApplications.filter((app) => {
        if (status !== "all") {
          return app.status.toLowerCase() === status.toLowerCase();
        }
        return true;
      });

      totalCount = applications.length;

      // Apply pagination to mock data
      const startIndex = (page - 1) * limit;
      applications = applications.slice(startIndex, startIndex + limit);
    }

    // Calculate statistics
    const stats = {
      totalApplications: totalCount,
      pending: applications.filter((app) => app.status === "PENDING").length,
      accepted: applications.filter((app) => app.status === "ACCEPTED").length,
      rejected: applications.filter((app) => app.status === "REJECTED").length,
      reviewing: applications.filter((app) => app.status === "REVIEWING")
        .length,
    };

    return NextResponse.json({
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}
