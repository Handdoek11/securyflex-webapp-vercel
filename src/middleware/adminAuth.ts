import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminEmail } from "@/lib/admin/auth";

// Admin protected routes
const ADMIN_ROUTES = [
  "/api/admin/auth-logs",
  "/api/admin/document-review",
  "/api/admin/users",
  "/api/admin/security",
  "/api/admin/stats",
];

/**
 * Middleware to validate admin access for protected routes
 */
export async function validateAdminAccess(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if this is an admin protected route
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  try {
    // Get the session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if user is authenticated
    if (!token || !token.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const userEmail = (token.email as string).toLowerCase();

    // Validate admin access
    if (!isAdminEmail(userEmail)) {
      // Log unauthorized access attempt
      console.warn(
        `Unauthorized admin access attempt: ${userEmail} tried to access ${pathname}`,
      );

      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    // Admin validated - continue to the route
    return NextResponse.next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication validation failed" },
      { status: 500 },
    );
  }
}

/**
 * Helper function to check if a user is an admin
 */
export function isAdmin(email: string | null | undefined): boolean {
  return isAdminEmail(email);
}

/**
 * Helper to get admin status from request headers
 */
export async function getAdminStatus(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  email: string | null;
}> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.email) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        email: null,
      };
    }

    const email = token.email as string;
    return {
      isAuthenticated: true,
      isAdmin: isAdmin(email),
      email: email.toLowerCase(),
    };
  } catch (error) {
    console.error("Error getting admin status:", error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      email: null,
    };
  }
}
