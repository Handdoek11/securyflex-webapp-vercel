import type { Opdracht, Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/bedrijf/dashboard/stats - Get comprehensive dashboard statistics
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
        {
          success: false,
          error: "Alleen bedrijven kunnen dashboard stats bekijken",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // week, month, quarter, year
    const role = searchParams.get("role") || "both"; // leverancier, opdrachtgever, both

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;

    switch (period) {
      case "week":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7,
        );
        previousPeriodStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 14,
        );
        previousPeriodEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7,
        );
        break;
      case "quarter": {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        previousPeriodStart = new Date(
          now.getFullYear(),
          (currentQuarter - 1) * 3,
          1,
        );
        previousPeriodEnd = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      }
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
        previousPeriodEnd = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Build base filter conditions
    const baseWhereClause: Prisma.OpdrachtWhereInput = {
      OR: [
        ...(role !== "leverancier"
          ? [
              {
                creatorType: "BEDRIJF" as const,
                creatorBedrijfId: bedrijfProfile.id,
              },
            ]
          : []),
        ...(role !== "opdrachtgever"
          ? [
              {
                acceptedBedrijfId: bedrijfProfile.id,
              },
            ]
          : []),
      ],
    };

    // Current period stats
    const currentPeriodWhere = {
      ...baseWhereClause,
      createdAt: { gte: startDate },
    };

    // Previous period stats
    const previousPeriodWhere = {
      ...baseWhereClause,
      createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
    };

    // Execute all queries in parallel for performance
    const [
      currentStats,
      previousStats,
      statusBreakdown,
      recentOpdrachten,
      teamStats,
      clientStats,
      revenueData,
      upcomingOpdrachten,
    ] = await Promise.all([
      // Current period aggregated stats
      prisma.opdracht.aggregate({
        where: currentPeriodWhere,
        _count: { id: true },
        _sum: {
          uurtarief: true,
          aantalBeveiligers: true,
        },
        _avg: { uurtarief: true },
      }),

      // Previous period for comparison
      prisma.opdracht.aggregate({
        where: previousPeriodWhere,
        _count: { id: true },
        _sum: {
          uurtarief: true,
          aantalBeveiligers: true,
        },
      }),

      // Status breakdown
      prisma.opdracht.groupBy({
        by: ["status"],
        where: currentPeriodWhere,
        _count: { id: true },
      }),

      // Recent opdrachten
      prisma.opdracht.findMany({
        where: baseWhereClause,
        include: {
          opdrachtgever: {
            select: {
              bedrijfsnaam: true,
            },
          },
          _count: {
            select: {
              sollicitaties: {
                where: { status: "ACCEPTED" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Team performance stats
      prisma.opdrachtSollicitatie.groupBy({
        by: ["status"],
        where: {
          opdrachtId: {
            in: (
              await prisma.opdracht.findMany({
                where: baseWhereClause,
                select: { id: true },
              })
            ).map((o) => o.id),
          },
          sollicitatiedatum: { gte: startDate },
        },
        _count: { id: true },
      }),

      // Client diversity
      prisma.opdracht.groupBy({
        by: ["opdrachtgeverId"],
        where: {
          ...currentPeriodWhere,
          opdrachtgeverId: { not: null },
        },
        _count: { id: true },
      }),

      // Revenue timeline data (last 12 weeks for chart)
      prisma.opdracht.findMany({
        where: {
          ...baseWhereClause,
          createdAt: {
            gte: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - 84,
            ), // 12 weeks
          },
        },
        select: {
          createdAt: true,
          uurtarief: true,
          aantalBeveiligers: true,
          status: true,
        },
        orderBy: { createdAt: "asc" },
      }),

      // Upcoming opdrachten
      prisma.opdracht.findMany({
        where: {
          ...baseWhereClause,
          startDatum: {
            gte: now,
            lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
          },
        },
        include: {
          opdrachtgever: {
            select: {
              bedrijfsnaam: true,
            },
          },
        },
        orderBy: { startDatum: "asc" },
        take: 10,
      }),
    ]);

    // Calculate key metrics
    const currentCount = currentStats._count.id || 0;
    const previousCount = previousStats._count.id || 0;
    const opdrachtGrowth =
      previousCount > 0
        ? ((currentCount - previousCount) / previousCount) * 100
        : currentCount > 0
          ? 100
          : 0;

    const currentRevenue =
      Number(currentStats._sum.uurtarief || 0) *
      Number(currentStats._sum.aantalBeveiligers || 0) *
      8; // Estimate 8 hours
    const previousRevenue =
      Number(previousStats._sum.uurtarief || 0) *
      Number(previousStats._sum.aantalBeveiligers || 0) *
      8;
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    const averageRate = Number(currentStats._avg.uurtarief || 0);

    // Process status breakdown
    const statusData = statusBreakdown.reduce(
      (
        acc: Record<string, number>,
        item: { status: string; _count: { id: number } },
      ) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Process team stats
    const teamPerformance = teamStats.reduce(
      (
        acc: Record<string, number>,
        item: { status: string; _count: { id: number } },
      ) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate success rates
    const totalApplications = Object.values(teamPerformance).reduce(
      (sum: number, count: unknown) =>
        sum + (typeof count === "number" ? count : 0),
      0,
    );
    const successRate =
      totalApplications > 0
        ? ((teamPerformance.ACCEPTED || 0) / totalApplications) * 100
        : 0;

    // Process revenue timeline for chart
    const revenueTimeline = revenueData.reduce(
      (
        acc: Record<
          string,
          { week: string; revenue: number; opdrachten: number }
        >,
        opdracht,
      ) => {
        const weekKey = getWeekKey(opdracht.createdAt);
        if (!acc[weekKey]) {
          acc[weekKey] = { week: weekKey, revenue: 0, opdrachten: 0 };
        }
        const estimated =
          Number(opdracht.uurtarief) * opdracht.aantalBeveiligers * 8;
        acc[weekKey].revenue += estimated;
        acc[weekKey].opdrachten += 1;
        return acc;
      },
      {} as Record<
        string,
        { week: string; revenue: number; opdrachten: number }
      >,
    );

    // Convert to array and sort
    const chartData = Object.values(revenueTimeline)
      .sort((a: unknown, b: unknown) => {
        const weekA = (a as { week: string }).week;
        const weekB = (b as { week: string }).week;
        return weekA.localeCompare(weekB);
      })
      .slice(-12); // Last 12 weeks

    return NextResponse.json({
      success: true,
      data: {
        // Key metrics
        metrics: {
          totalOpdrachten: currentCount,
          opdrachtGrowth: Math.round(opdrachtGrowth * 100) / 100,
          estimatedRevenue: currentRevenue,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          averageHourlyRate: Math.round(averageRate * 100) / 100,
          activeClients: clientStats.length,
          successRate: Math.round(successRate * 100) / 100,
        },

        // Status breakdown
        statusBreakdown: {
          open: statusData.OPEN || 0,
          assigned: statusData.ASSIGNED || 0,
          in_progress: statusData.IN_PROGRESS || 0,
          completed: statusData.COMPLETED || 0,
          cancelled: statusData.CANCELLED || 0,
        },

        // Team performance
        teamStats: {
          totalApplications,
          accepted: teamPerformance.ACCEPTED || 0,
          pending: teamPerformance.PENDING || 0,
          rejected: teamPerformance.REJECTED || 0,
          successRate: Math.round(successRate * 100) / 100,
        },

        // Chart data
        revenueChart: chartData,

        // Recent activity
        recentOpdrachten: recentOpdrachten.map((opdracht) => ({
          id: opdracht.id,
          titel: opdracht.titel,
          client: opdracht.opdrachtgever?.bedrijfsnaam || "Onbekend",
          status: opdracht.status,
          createdAt: opdracht.createdAt,
          assignedCount: opdracht._count.sollicitaties,
          requiredCount: opdracht.aantalBeveiligers,
          isFullyStaffed:
            opdracht._count.sollicitaties >= opdracht.aantalBeveiligers,
        })),

        // Upcoming work
        upcomingOpdrachten: upcomingOpdrachten.map((opdracht) => ({
          id: opdracht.id,
          titel: opdracht.titel,
          client: opdracht.opdrachtgever?.bedrijfsnaam || "Onbekend",
          startDatum: opdracht.startDatum,
          locatie: opdracht.locatie,
          aantalPersonen: opdracht.aantalBeveiligers,
        })),

        // Insights and alerts
        insights: generateInsights({
          currentCount,
          previousCount,
          statusData,
          successRate,
          upcomingCount: upcomingOpdrachten.length,
        }),

        // Metadata
        period,
        role,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching bedrijf dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 },
    );
  }
}

// Helper function to get week key for grouping
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const weekNumber = getWeekNumber(date);
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper function to generate insights
function generateInsights(data: {
  currentCount: number;
  previousCount: number;
  statusData: Record<string, number>;
  successRate: number;
  upcomingCount: number;
}) {
  const insights: Array<{
    type: "success" | "warning" | "info" | "danger";
    title: string;
    message: string;
  }> = [];

  // Growth insights
  if (data.currentCount > data.previousCount) {
    insights.push({
      type: "success",
      title: "Groeiende vraag",
      message: `${data.currentCount - data.previousCount} meer opdrachten dan vorige periode`,
    });
  } else if (data.currentCount < data.previousCount) {
    insights.push({
      type: "warning",
      title: "Dalende vraag",
      message:
        "Minder opdrachten dan vorige periode. Overweeg marketing activiteiten.",
    });
  }

  // Success rate insights
  if (data.successRate > 80) {
    insights.push({
      type: "success",
      title: "Hoge acceptatiegraad",
      message: `${data.successRate.toFixed(1)}% van sollicitaties wordt geaccepteerd`,
    });
  } else if (data.successRate < 50) {
    insights.push({
      type: "danger",
      title: "Lage acceptatiegraad",
      message:
        "Minder dan 50% acceptatie. Check of jullie tarieven/voorwaarden competitief zijn.",
    });
  }

  // Upcoming work insights
  if (data.upcomingCount > 5) {
    insights.push({
      type: "info",
      title: "Drukke week vooruit",
      message: `${data.upcomingCount} opdrachten starten binnenkort`,
    });
  } else if (data.upcomingCount === 0) {
    insights.push({
      type: "warning",
      title: "Geen aankomende opdrachten",
      message:
        "Overweeg om nieuwe opdrachten te zoeken of klanten te contacteren.",
    });
  }

  // Open opdrachten insights
  const openCount = data.statusData.OPEN || 0;
  if (openCount > 10) {
    insights.push({
      type: "warning",
      title: "Veel openstaande opdrachten",
      message: `${openCount} opdrachten wachten nog op personeel`,
    });
  }

  return insights;
}
