import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Mock data for when database is empty - will be removed after database is populated
const mockJobs = [
  {
    id: "1",
    title: "Evenementbeveiliging - Concert",
    description:
      "Beveiliging voor groot muziekfestival. Ervaring met evenementen vereist.",
    location: "Amsterdam Zuidoost",
    company: "SecureEvents BV",
    companyId: "company-1",
    startDate: new Date("2025-09-20T18:00:00Z"),
    endDate: new Date("2025-09-21T02:00:00Z"),
    hourlyRate: 28.5,
    spotsAvailable: 10,
    spotsRemaining: 7,
    applicantCount: 3,
    applicationStatus: null,
    hasApplied: false,
    status: "OPEN",
    isUrgent: true,
    estimatedHours: 8,
    estimatedEarnings: 228,
    type: "Evenement",
    requirements: ["BOA certificaat", "Evenementervaring", "Fysiek sterk"],
    image: "/images/jobs/evenement-beveiliging.jpg",
    distance: "2.3 km",
    createdAt: new Date("2025-09-15T10:00:00Z"),
    updatedAt: new Date("2025-09-15T10:00:00Z"),
  },
  {
    id: "2",
    title: "Objectbeveiliging Winkelcentrum",
    description: "Nachtdienst beveiliging voor groot winkelcentrum.",
    location: "Rotterdam Centrum",
    company: "SecureGuard Nederland",
    companyId: "company-2",
    startDate: new Date("2025-09-18T22:00:00Z"),
    endDate: new Date("2025-09-19T06:00:00Z"),
    hourlyRate: 26.0,
    spotsAvailable: 5,
    spotsRemaining: 2,
    applicantCount: 8,
    applicationStatus: null,
    hasApplied: false,
    status: "OPEN",
    isUrgent: false,
    estimatedHours: 8,
    estimatedEarnings: 208,
    type: "Object",
    requirements: ["WPBR vergunning", "Nachtdienst ervaring"],
    image: "/images/jobs/object-beveiliging.jpg",
    distance: "15.2 km",
    createdAt: new Date("2025-09-14T14:30:00Z"),
    updatedAt: new Date("2025-09-14T14:30:00Z"),
  },
  {
    id: "3",
    title: "Winkelbeveiliging - Mode Boutique",
    description: "Dagdienst beveiliging voor exclusieve modezaak.",
    location: "Den Haag Centrum",
    company: "RetailSecure",
    companyId: "company-3",
    startDate: new Date("2025-09-19T09:00:00Z"),
    endDate: new Date("2025-09-19T17:00:00Z"),
    hourlyRate: 24.0,
    spotsAvailable: 2,
    spotsRemaining: 1,
    applicantCount: 5,
    applicationStatus: null,
    hasApplied: false,
    status: "OPEN",
    isUrgent: false,
    estimatedHours: 8,
    estimatedEarnings: 192,
    type: "Winkel",
    requirements: ["WPBR vergunning", "Winkel ervaring"],
    image: "/images/jobs/winkel-beveiliging.jpg",
    distance: "8.7 km",
    createdAt: new Date("2025-09-13T09:15:00Z"),
    updatedAt: new Date("2025-09-13T09:15:00Z"),
  },
  {
    id: "4",
    title: "Horeca Beveiliging - Nachtclub",
    description: "Beveiliging voor drukke nachtclub in het uitgaansgebied.",
    location: "Amsterdam Leidseplein",
    company: "NightSecure",
    companyId: "company-4",
    startDate: new Date("2025-09-21T22:00:00Z"),
    endDate: new Date("2025-09-22T04:00:00Z"),
    hourlyRate: 30.0,
    spotsAvailable: 6,
    spotsRemaining: 4,
    applicantCount: 12,
    applicationStatus: null,
    hasApplied: false,
    status: "OPEN",
    isUrgent: true,
    estimatedHours: 6,
    estimatedEarnings: 180,
    type: "Horeca",
    requirements: ["BOA certificaat", "Horeca ervaring", "Stressbestendig"],
    image: "/images/jobs/horeca-beveiliging.jpg",
    distance: "5.1 km",
    createdAt: new Date("2025-09-16T16:45:00Z"),
    updatedAt: new Date("2025-09-16T16:45:00Z"),
  },
];

// GET /api/jobs - Lijst van beschikbare jobs voor ZZP beveiligers
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
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";
    const location = searchParams.get("location") || "";
    const minRate = searchParams.get("minRate");
    const _maxDistance = searchParams.get("maxDistance");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Get user's ZZP profile for application status checking
    let zzpProfile = null;
    try {
      zzpProfile = await prisma.zZPProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
    } catch (error) {
      console.error("Failed to get ZZP profile:", error);
    }

    let jobs = [];
    let totalCount = 0;

    try {
      // Build where clause for database query
      const where: Prisma.OpdrachtWhereInput = {
        status: "OPEN", // Only show open jobs
        startDatum: {
          gte: new Date(), // Only future jobs
        },
      };

      // Search filter
      if (search) {
        where.OR = [
          { titel: { contains: search, mode: "insensitive" } },
          { beschrijving: { contains: search, mode: "insensitive" } },
          { locatie: { contains: search, mode: "insensitive" } },
        ];
      }

      // Location filter
      if (location) {
        where.locatie = { contains: location, mode: "insensitive" };
      }

      // Minimum rate filter
      if (minRate) {
        where.uurtarief = { gte: parseFloat(minRate) };
      }

      // Get jobs with pagination from database
      const [dbJobs, dbTotalCount] = await Promise.all([
        prisma.opdracht.findMany({
          where,
          include: {
            opdrachtgever: {
              select: {
                bedrijfsnaam: true,
                id: true,
                contactpersoon: true,
              },
            },
            creatorBedrijf: {
              select: {
                bedrijfsnaam: true,
                id: true,
              },
            },
            acceptedBedrijf: {
              select: {
                bedrijfsnaam: true,
                id: true,
              },
            },
            sollicitaties: zzpProfile
              ? {
                  where: {
                    zzpId: zzpProfile.id, // Check if current user has applied
                  },
                  select: {
                    status: true,
                    sollicitatiedatum: true,
                  },
                }
              : false,
            _count: {
              select: {
                sollicitaties: true, // Count total applicants
              },
            },
          },
          orderBy: [
            { isUrgent: "desc" }, // Urgent jobs first
            { startDatum: "asc" }, // Nearest date first
          ],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.opdracht.count({ where }),
      ]);

      // Format database jobs
      jobs = dbJobs.map((job) => ({
        id: job.id,
        title: job.titel,
        description: job.beschrijving,
        location: job.locatie,
        company:
          job.opdrachtgever?.bedrijfsnaam ||
          job.creatorBedrijf?.bedrijfsnaam ||
          job.acceptedBedrijf?.bedrijfsnaam ||
          "Onbekend",
        companyId:
          job.opdrachtgeverId || job.creatorBedrijfId || job.acceptedBedrijfId,
        startDate: job.startDatum,
        endDate: job.eindDatum,
        hourlyRate: Number(job.uurtarief),
        spotsAvailable: job.aantalBeveiligers,
        spotsRemaining: Math.max(
          0,
          job.aantalBeveiligers - job._count.sollicitaties,
        ),
        applicantCount: job._count.sollicitaties,
        applicationStatus: job.sollicitaties?.[0]
          ? job.sollicitaties[0].status
          : null,
        hasApplied: zzpProfile
          ? job.sollicitaties && job.sollicitaties.length > 0
          : false,
        status: job.status,
        isUrgent:
          job.isUrgent ||
          new Date(job.startDatum).getTime() - Date.now() < 48 * 60 * 60 * 1000,
        estimatedHours: Math.round(
          (job.eindDatum.getTime() - job.startDatum.getTime()) /
            (1000 * 60 * 60),
        ),
        estimatedEarnings: Math.round(
          ((job.eindDatum.getTime() - job.startDatum.getTime()) /
            (1000 * 60 * 60)) *
            Number(job.uurtarief) *
            0.88,
        ),
        type: job.type || "General",
        requirements: Array.isArray(job.vereisten) ? job.vereisten : [],
        image: `/images/jobs/${(job.type || "general").toLowerCase()}-beveiliging.jpg`,
        distance: `${(Math.random() * 20 + 1).toFixed(1)} km`, // Mock distance
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }));

      totalCount = dbTotalCount;

      console.log(`Found ${jobs.length} jobs from database`);
    } catch (dbError) {
      console.error("Database query failed, using mock data:", dbError);

      // Filter mock data
      jobs = mockJobs.filter((job) => {
        const matchesSearch =
          !search ||
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.location.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase());

        const matchesType =
          type === "all" || job.type.toLowerCase().includes(type.toLowerCase());

        const matchesLocation =
          !location ||
          job.location.toLowerCase().includes(location.toLowerCase());

        const matchesRate = !minRate || job.hourlyRate >= parseFloat(minRate);

        return matchesSearch && matchesType && matchesLocation && matchesRate;
      });

      // Sort mock data
      jobs.sort((a, b) => {
        if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      });

      totalCount = jobs.length;

      // Apply pagination to mock data
      const startIndex = (page - 1) * limit;
      jobs = jobs.slice(startIndex, startIndex + limit);
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
        metadata: {
          totalJobs: totalCount,
          urgentJobs: jobs.filter((job) => job.isUrgent).length,
          averageRate:
            jobs.length > 0
              ? Math.round(
                  (jobs.reduce((sum, job) => sum + job.hourlyRate, 0) /
                    jobs.length) *
                    100,
                ) / 100
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
      },
      { status: 500 },
    );
  }
}

// POST /api/jobs - Create a new job (for companies/opdrachtgevers)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const data = await request.json();

    // Validate required fields
    const required = [
      "titel",
      "beschrijving",
      "locatie",
      "startDatum",
      "eindDatum",
      "aantalBeveiligers",
      "uurtarief",
    ];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // Check if user is opdrachtgever or bedrijf
    const [opdrachtgever, bedrijf] = await Promise.all([
      prisma.opdrachtgever.findUnique({ where: { userId: session.user.id } }),
      prisma.bedrijfProfile.findUnique({ where: { userId: session.user.id } }),
    ]);

    if (!opdrachtgever && !bedrijf) {
      return NextResponse.json(
        { success: false, error: "Only companies can create jobs" },
        { status: 403 },
      );
    }

    // Create the job
    const job = await prisma.opdracht.create({
      data: {
        titel: data.titel,
        beschrijving: data.beschrijving,
        locatie: data.locatie,
        startDatum: new Date(data.startDatum),
        eindDatum: new Date(data.eindDatum),
        aantalBeveiligers: parseInt(data.aantalBeveiligers, 10),
        uurtarief: parseFloat(data.uurtarief),
        status: data.urgent ? "URGENT" : "OPEN",
        opdrachtgeverId: opdrachtgever?.id,
        creatorBedrijfId: bedrijf?.id,
        creatorType: opdrachtgever ? "OPDRACHTGEVER" : "BEDRIJF",
        creatorId: opdrachtgever?.id || bedrijf?.id || "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: job,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create job",
      },
      { status: 500 },
    );
  }
}
