import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "./src/lib/auth"
import { rateLimitWithTrustCheck } from "./src/lib/rate-limiting"

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/error',
  '/api/auth',
  '/api/test-db'
]

// Define route patterns for role-based access
const roleBasedRoutes = {
  '/dashboard': 'ZZP_BEVEILIGER', // Main dashboard is for ZZP users
  '/dashboard/bedrijf': 'BEDRIJF',
  '/dashboard/opdrachtgever': 'OPDRACHTGEVER', // Covers all opdrachtgever subroutes
  '/onboarding/beveiliger': 'ZZP_BEVEILIGER',
  '/onboarding/bedrijf': 'BEDRIJF',
  '/onboarding/opdrachtgever': 'OPDRACHTGEVER'
}

// Routes that require completed profile
const profileRequiredRoutes = [
  '/dashboard',
  '/opdrachten',
  '/profile'
]

export default auth(async (req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // Apply rate limiting first
  const rateLimitResponse = await rateLimitWithTrustCheck(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Get auth information
  const token = req.auth
  const user = token?.user

  // Redirect to login if not authenticated
  if (!user) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  const requiredRole = getRoleForRoute(pathname)
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's role
    const userDashboard = getDashboardForRole(user.role)
    return NextResponse.redirect(new URL(userDashboard, req.url))
  }

  // Check profile completion for certain routes
  if (requiresCompletedProfile(pathname) && !user.hasCompletedProfile) {
    // Don't redirect if already on onboarding
    if (pathname.startsWith('/onboarding')) {
      return NextResponse.next()
    }

    // Redirect to appropriate onboarding flow
    const onboardingUrl = getOnboardingForRole(user.role)
    return NextResponse.redirect(new URL(onboardingUrl, req.url))
  }

  // If user has incomplete profile and is trying to access non-onboarding routes,
  // redirect to onboarding (except for auth and API routes)
  if (!user.hasCompletedProfile &&
      !pathname.startsWith('/onboarding') &&
      !pathname.startsWith('/auth') &&
      !pathname.startsWith('/api')) {
    const onboardingUrl = getOnboardingForRole(user.role)
    return NextResponse.redirect(new URL(onboardingUrl, req.url))
  }

  return NextResponse.next()
})

// Helper functions
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === pathname) return true
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname.startsWith(route)
  })
}

function getRoleForRoute(pathname: string): string | null {
  for (const [routePattern, role] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(routePattern)) {
      return role
    }
  }
  return null
}

function requiresCompletedProfile(pathname: string): boolean {
  return profileRequiredRoutes.some(route => pathname.startsWith(route))
}

function getDashboardForRole(role: string): string {
  switch (role) {
    case 'ZZP_BEVEILIGER':
      return '/dashboard'
    case 'BEDRIJF':
      return '/dashboard/bedrijf'
    case 'OPDRACHTGEVER':
      return '/dashboard/opdrachtgever'
    case 'ADMIN':
      return '/admin/auth-monitor'
    default:
      return '/dashboard'
  }
}

function getOnboardingForRole(role: string): string {
  switch (role) {
    case 'ZZP_BEVEILIGER':
      return '/onboarding/beveiliger'
    case 'BEDRIJF':
      return '/onboarding/bedrijf'
    case 'OPDRACHTGEVER':
      return '/onboarding/opdrachtgever'
    default:
      return '/onboarding'
  }
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ]
}