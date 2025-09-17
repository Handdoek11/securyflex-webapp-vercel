import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Admin whitelist
const ADMIN_EMAILS = ['stef@securyflex.com', 'robert@securyflex.com'];

// POST /api/admin/auth - Verify admin credentials
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase();

    // Check if email is in admin whitelist
    if (!ADMIN_EMAILS.includes(email)) {
      // Log unauthorized admin access attempt
      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          email: email,
          eventType: "SUSPICIOUS_ACTIVITY",
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          metadata: {
            reason: "Unauthorized admin access attempt",
            attemptedPath: "/admin/auth-monitor"
          }
        }
      });

      return NextResponse.json(
        { success: false, error: "Admin access denied" },
        { status: 403 }
      );
    }

    // Log successful admin authentication
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        email: email,
        eventType: "LOGIN_SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        metadata: {
          isAdmin: true,
          loginType: "admin_portal"
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        isAdmin: true,
        email: email,
        sessionId: session.user.id
      }
    });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// GET /api/admin/auth - Check admin status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        isAdmin: false,
        authenticated: false
      });
    }

    const email = session.user.email.toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(email);

    return NextResponse.json({
      success: true,
      isAdmin,
      authenticated: true,
      email: isAdmin ? email : null
    });
  } catch (error) {
    console.error("Admin auth check error:", error);
    return NextResponse.json({
      success: false,
      isAdmin: false,
      authenticated: false
    });
  }
}