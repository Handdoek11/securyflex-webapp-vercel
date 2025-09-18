import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import {
  isAdminEmail,
  transactionsToCSV,
  usersToCSV,
  validateAdminPassword,
} from "@/lib/admin/auth";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/actions/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const pathname = request.nextUrl.pathname;

    // Route to specific handlers based on path
    if (pathname.endsWith("/stats")) {
      return handleGetStats();
    } else if (pathname.endsWith("/export-users")) {
      return handleExportUsers();
    } else if (pathname.endsWith("/export-transactions")) {
      return handleExportTransactions();
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/admin/actions/* - Handle admin actions
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const pathname = request.nextUrl.pathname;
    const body = await request.json();

    // Log admin action
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        email: session.user.email,
        eventType: "SUSPICIOUS_ACTIVITY", // Using appropriate enum value
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        metadata: {
          action: pathname,
          targetEmail: body.email,
          adminAction: true,
        },
      },
    });

    // Route to specific handlers
    if (pathname.endsWith("/unlock-user")) {
      return handleUnlockUser(body);
    } else if (pathname.endsWith("/reset-password")) {
      return handleResetPassword(body, session.user.email);
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handler: Get dashboard statistics
async function handleGetStats() {
  try {
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
    const monthlyRevenue = await prisma.$queryRaw<Array<{ total: number }>>`
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
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}

// Handler: Unlock user account
async function handleUnlockUser(body: { email: string }) {
  try {
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Unlock the account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
      },
    });

    // Log the unlock action
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        email: user.email,
        eventType: "ACCOUNT_UNLOCKED",
        metadata: {
          unlockedBy: "admin",
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Account ${email} has been unlocked`,
    });
  } catch (error) {
    console.error("Unlock user error:", error);
    return NextResponse.json(
      { error: "Failed to unlock account" },
      { status: 500 },
    );
  }
}

// Handler: Reset user password
async function handleResetPassword(
  body: { email: string; adminPassword: string },
  adminEmail: string,
) {
  try {
    const { email, adminPassword } = body;

    if (!email || !adminPassword) {
      return NextResponse.json(
        { error: "Email and admin password are required" },
        { status: 400 },
      );
    }

    // Validate admin password
    if (!validateAdminPassword(adminPassword)) {
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 403 },
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new password
    const newPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Log the password reset
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        email: user.email,
        eventType: "PASSWORD_RESET_COMPLETED",
        metadata: {
          resetBy: adminEmail,
          method: "admin_reset",
        },
      },
    });

    return NextResponse.json({
      success: true,
      newPassword,
      message:
        "Password has been reset. Share this password securely with the user.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}

// Handler: Export users to CSV
async function handleExportUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const csv = usersToCSV(users);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export users error:", error);
    return NextResponse.json(
      { error: "Failed to export users" },
      { status: 500 },
    );
  }
}

// Handler: Export transactions to CSV
async function handleExportTransactions() {
  try {
    const transactions = await prisma.betaling.findMany({
      select: {
        id: true,
        createdAt: true,
        bedrag: true,
        status: true,
        type: true,
        betalerId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000, // Limit to last 1000 transactions
    });

    const csv = transactionsToCSV(transactions);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export transactions error:", error);
    return NextResponse.json(
      { error: "Failed to export transactions" },
      { status: 500 },
    );
  }
}

// Helper: Generate secure password
function generateSecurePassword(length = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const all = uppercase + lowercase + numbers + special;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
