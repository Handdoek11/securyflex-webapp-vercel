import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin email whitelist
const ADMIN_EMAILS = ['stef@securyflex.com', 'robert@securyflex.com'];

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify",
  "/jobs",
  "/about",
  "/contact",
  "/api/auth",
  "/api/register"
];

// Admin-only routes
const adminRoutes = [
  "/admin",
  "/api/admin"
];

export default withAuth(
  function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = (request as any).nextauth?.token;

    // Check if this is an admin route
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute) {
      // Check if user is authenticated
      if (!token) {
        // Redirect to admin login
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      // Check if user is an admin
      const userEmail = token.email?.toLowerCase();
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        // Log unauthorized admin access attempt
        console.warn(`Unauthorized admin access attempt: ${userEmail} tried to access ${pathname}`);

        // Return 403 for API routes, redirect for pages
        if (pathname.startsWith("/api/admin")) {
          return NextResponse.json(
            { success: false, error: "Admin access required" },
            { status: 403 }
          );
        } else {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
      }
    }

    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow public routes
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\..*$).*)"
  ]
};