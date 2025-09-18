import type { Prisma, SecurityEventType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin/auth";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/auth-logs - View authentication logs
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth();
    if (!session?.user) {
      console.log("No session found for auth-logs request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      console.log(
        "Non-admin user attempted to access auth-logs:",
        session.user.email,
      );
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    console.log("Auth-logs request from admin:", session.user.email);

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const userId = searchParams.get("userId");
    const eventType = searchParams.get("eventType");

    const where: Prisma.SecurityLogWhereInput = {};
    if (userId) where.userId = userId;
    if (eventType) where.eventType = eventType as SecurityEventType;

    // Get security logs
    const logs = await prisma.securityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get summary statistics
    const stats = await prisma.securityLog.groupBy({
      by: ["eventType"],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Get failed login attempts
    const failedLogins = await prisma.securityLog.count({
      where: {
        eventType: "LOGIN_FAILED",
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    // Get locked accounts
    const lockedAccounts = await prisma.user.count({
      where: {
        lockedUntil: {
          gt: new Date(),
        },
      },
    });

    return NextResponse.json({
      logs,
      stats: {
        last24Hours: stats,
        recentFailedLogins: failedLogins,
        currentlyLockedAccounts: lockedAccounts,
      },
    });
  } catch (error) {
    console.error("Error fetching auth logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
