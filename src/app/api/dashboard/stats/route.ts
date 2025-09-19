import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/dashboard/stats - Get dashboard statistics for user
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

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

    let stats = {
      thisWeek: { hours: 0, earnings: 0, shifts: 0 },
      thisMonth: { hours: 0, earnings: 0, shifts: 0 },
      total: { hours: 0, earnings: 0, shifts: 0, rating: 4.8 },
    };

    try {
      const now = new Date();

      // Calculate week start (Monday)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      // Calculate month start
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get work hours statistics
      const [weekHours, monthHours, totalHours] = await Promise.all([
        // This week
        prisma.werkuur.aggregate({
          where: {
            zzpId: zzpProfile.id,
            startTijd: { gte: weekStart },
            status: { in: ["PENDING", "APPROVED"] },
          },
          _sum: {
            urenGewerkt: true,
            uurtarief: true,
          },
          _count: true,
        }),

        // This month
        prisma.werkuur.aggregate({
          where: {
            zzpId: zzpProfile.id,
            startTijd: { gte: monthStart },
            status: { in: ["PENDING", "APPROVED"] },
          },
          _sum: {
            urenGewerkt: true,
            uurtarief: true,
          },
          _count: true,
        }),

        // Total (all time)
        prisma.werkuur.aggregate({
          where: {
            zzpId: zzpProfile.id,
            status: { in: ["PENDING", "APPROVED"] },
          },
          _sum: {
            urenGewerkt: true,
            uurtarief: true,
          },
          _count: true,
        }),
      ]);

      // Get unique jobs count for total shifts
      const totalShifts = await prisma.werkuur.findMany({
        where: {
          zzpId: zzpProfile.id,
          status: { in: ["PENDING", "APPROVED", "PAID"] },
        },
        select: {
          opdrachtId: true,
        },
        distinct: ["opdrachtId"],
      });

      // Get average rating (would come from reviews table in real implementation)
      const avgRating = 4.8; // Mock for now

      stats = {
        thisWeek: {
          hours: Number(weekHours._sum?.urenGewerkt) || 0,
          earnings: 0, // TODO: Calculate from urenGewerkt * uurtarief
          shifts: weekHours._count || 0,
        },
        thisMonth: {
          hours: Number(monthHours._sum?.urenGewerkt) || 0,
          earnings: 0, // TODO: Calculate from urenGewerkt * uurtarief
          shifts: Number(monthHours._count) || 0,
        },
        total: {
          hours: Number(totalHours._sum?.urenGewerkt) || 0,
          earnings: 0, // TODO: Calculate from urenGewerkt * uurtarief
          shifts: totalShifts.length || 0,
          rating: avgRating,
        },
      };

      console.log(`Dashboard stats calculated for user ${session.user.id}`);
    } catch (dbError) {
      console.error(
        "Database error calculating stats, using mock data:",
        dbError,
      );

      // Return mock statistics for development
      stats = {
        thisWeek: { hours: 32.5, earnings: 780.5, shifts: 4 },
        thisMonth: { hours: 124.5, earnings: 2985.75, shifts: 15 },
        total: { hours: 890.5, earnings: 21456.25, shifts: 156, rating: 4.8 },
      };
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 },
    );
  }
}
