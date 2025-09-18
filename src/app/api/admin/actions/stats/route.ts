import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/actions/stats - Get dashboard statistics
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get user statistics
    const totalUsers = await prisma.$queryRaw`
      SELECT
        role,
        COUNT(*)::int as count,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)::int as active_count
      FROM "User"
      GROUP BY role
    `;

    // Get active opdrachten
    const activeOpdrachten = await prisma.$queryRaw`
      SELECT
        status,
        COUNT(*)::int as count
      FROM "Opdracht"
      WHERE status IN ('OPEN', 'TOEGEWEZEN', 'BEZIG')
      GROUP BY status
    `;

    // Get locked accounts
    const lockedAccounts = await prisma.user.count({
      where: {
        lockedUntil: {
          gt: new Date(),
        },
      },
    });

    // Get monthly revenue
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM("totaalBedrag"), 0)::float as total
      FROM "VerzamelFactuur"
      WHERE
        "createdAt" >= date_trunc('month', CURRENT_DATE)
        AND status IN ('PAID', 'PENDING')
    `;

    return NextResponse.json({
      totalUsers,
      activeOpdrachten,
      lockedAccounts,
      monthlyRevenue: (monthlyRevenue as any)[0]?.total || 0,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}