import { type NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  // Fallback for development/testing
  return "127.0.0.1";
}

// Memory-based rate limiters for development/single instance
const apiLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
});

const authLimiter = new RateLimiterMemory({
  points: 5, // 5 login attempts
  duration: 60 * 15, // Per 15 minutes
  blockDuration: 60 * 15, // Block for 15 minutes
});

const strictLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // Per minute
  blockDuration: 60 * 5, // Block for 5 minutes
});

const uploadLimiter = new RateLimiterMemory({
  points: 5, // 5 uploads
  duration: 60 * 10, // Per 10 minutes
  blockDuration: 60 * 10, // Block for 10 minutes
});

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  req: NextRequest,
  limiter: RateLimiterMemory,
  points: number = 1,
  customKey?: string,
): Promise<NextResponse | null> {
  try {
    const key = customKey || getClientIP(req);
    await limiter.consume(key, points);
    return null; // No rate limit hit
  } catch (rejRes: unknown) {
    // Rate limit exceeded
    const rateLimitRes = rejRes as {
      msBeforeNext?: number;
      remainingPoints?: number;
    };
    const secs = Math.round((rateLimitRes.msBeforeNext || 0) / 1000) || 1;

    return NextResponse.json(
      {
        success: false,
        error: "Te veel verzoeken. Probeer het over enkele minuten opnieuw.",
        retryAfter: secs,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(secs),
          "X-RateLimit-Limit": String(limiter.points),
          "X-RateLimit-Remaining": String(rateLimitRes.remainingPoints || 0),
          "X-RateLimit-Reset": String(
            new Date(Date.now() + (rateLimitRes.msBeforeNext || 0)),
          ),
        },
      },
    );
  }
}

/**
 * Get the appropriate rate limiter based on the request path
 */
export function getRateLimiter(pathname: string): RateLimiterMemory {
  // Authentication endpoints - stricter limits
  if (
    pathname.startsWith("/api/auth") ||
    pathname.includes("/login") ||
    pathname.includes("/register")
  ) {
    return authLimiter;
  }

  // Upload endpoints - very strict
  if (
    pathname.includes("/upload") ||
    pathname.includes("/files") ||
    pathname.includes("/images")
  ) {
    return uploadLimiter;
  }

  // Sensitive operations - strict limits
  if (
    pathname.includes("/admin") ||
    pathname.includes("/payment") ||
    pathname.includes("/finqle") ||
    pathname.includes("/webhook")
  ) {
    return strictLimiter;
  }

  // General API endpoints - normal limits
  return apiLimiter;
}

/**
 * Add rate limiting headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limiter: RateLimiterMemory,
  remainingPoints: number = 0,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(limiter.points));
  response.headers.set("X-RateLimit-Remaining", String(remainingPoints));
  response.headers.set(
    "X-RateLimit-Reset",
    String(Date.now() + limiter.duration * 1000),
  );

  return response;
}

/**
 * Rate limiting middleware for API routes
 */
export async function rateLimitMiddleware(
  req: NextRequest,
): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname;

  // Skip rate limiting for health checks and static assets
  if (
    pathname === "/api/health" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  ) {
    return null;
  }

  // Only apply to API routes
  if (!pathname.startsWith("/api/")) {
    return null;
  }

  const limiter = getRateLimiter(pathname);
  const ip = getClientIP(req);

  // Generate appropriate key based on limiter type
  let key = ip;
  if (
    pathname.startsWith("/api/auth") ||
    pathname.includes("/login") ||
    pathname.includes("/register")
  ) {
    key = `auth_${ip}`;
  } else if (
    pathname.includes("/upload") ||
    pathname.includes("/files") ||
    pathname.includes("/images")
  ) {
    key = `upload_${ip}`;
  } else if (
    pathname.includes("/admin") ||
    pathname.includes("/payment") ||
    pathname.includes("/finqle") ||
    pathname.includes("/webhook")
  ) {
    key = `strict_${ip}`;
  }

  return await checkRateLimit(req, limiter, 1, key);
}

/**
 * Custom rate limiter for specific use cases
 */
export function createCustomRateLimiter(options: {
  points: number;
  duration: number;
  blockDuration?: number;
  keyPrefix?: string;
}) {
  return new RateLimiterMemory({
    points: options.points,
    duration: options.duration,
    blockDuration: options.blockDuration || options.duration,
  });
}

/**
 * Rate limiting for specific user actions
 */
export async function checkUserActionLimit(
  req: NextRequest,
  userId: string,
  action: string,
  options: {
    points: number;
    duration: number;
    blockDuration?: number;
  },
): Promise<NextResponse | null> {
  const limiter = new RateLimiterMemory({
    points: options.points,
    duration: options.duration,
    blockDuration: options.blockDuration || options.duration,
  });

  // Use user-specific key instead of IP
  try {
    const key = `user_${userId}_${action}`;
    await limiter.consume(key, 1);
    return null;
  } catch (rejRes: unknown) {
    const rateLimitRes = rejRes as {
      msBeforeNext?: number;
      remainingPoints?: number;
    };
    const secs = Math.round((rateLimitRes.msBeforeNext || 0) / 1000) || 1;

    return NextResponse.json(
      {
        success: false,
        error: "Te veel verzoeken. Probeer het over enkele minuten opnieuw.",
        retryAfter: secs,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(secs),
          "X-RateLimit-Limit": String(limiter.points),
          "X-RateLimit-Remaining": String(rateLimitRes.remainingPoints || 0),
          "X-RateLimit-Reset": String(
            new Date(Date.now() + (rateLimitRes.msBeforeNext || 0)),
          ),
        },
      },
    );
  }
}

/**
 * Check if request is from trusted source (for webhooks)
 */
export function isTrustedSource(req: NextRequest): boolean {
  const trustedIPs = [
    "127.0.0.1",
    "::1",
    // Add Finqle webhook IPs here when available
    // Add other trusted service IPs
  ];

  const ip = getClientIP(req);

  return trustedIPs.includes(ip);
}

/**
 * Bypass rate limiting for trusted sources
 */
export async function rateLimitWithTrustCheck(
  req: NextRequest,
): Promise<NextResponse | null> {
  // Skip rate limiting for trusted sources (webhooks, etc.)
  if (isTrustedSource(req)) {
    return null;
  }

  return await rateLimitMiddleware(req);
}
