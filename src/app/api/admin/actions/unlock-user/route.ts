import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin/auth";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/admin/actions/unlock-user - Unlock a user account
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Log admin action
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        email: session.user.email,
        eventType: "ACCOUNT_UNLOCKED",
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        metadata: {
          action: "unlock-user",
          targetEmail: email,
          adminAction: true,
        },
      },
    });

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
          unlockedBy: session.user.email,
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
