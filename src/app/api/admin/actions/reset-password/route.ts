import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmail, validateAdminPassword } from "@/lib/admin/auth";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

// POST /api/admin/actions/reset-password - Reset a user's password
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email, adminPassword } = body;

    if (!email || !adminPassword) {
      return NextResponse.json(
        { error: "Email and admin password are required" },
        { status: 400 },
      );
    }

    // Validate admin password
    if (!validateAdminPassword(adminPassword)) {
      // Log failed attempt
      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          email: session.user.email,
          eventType: "SUSPICIOUS_ACTIVITY",
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          metadata: {
            action: "password-reset-failed",
            reason: "Invalid admin password",
            targetEmail: email,
          },
        },
      });

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
          resetBy: session.user.email,
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
