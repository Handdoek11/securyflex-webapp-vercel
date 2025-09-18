import crypto from "node:crypto";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Rate limiters for different bedrijf operations
const bedrijfGeneralLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
});

const bedrijfWriteLimiter = new RateLimiterMemory({
  points: 20, // Fewer write operations allowed
  duration: 60,
  blockDuration: 120, // Longer block for write operations
});

const bedrijfPlanningLimiter = new RateLimiterMemory({
  points: 50, // Planning operations
  duration: 60,
  blockDuration: 60,
});

const bedrijfPaymentLimiter = new RateLimiterMemory({
  points: 10, // Very limited payment operations
  duration: 60,
  blockDuration: 300, // 5 minute block for payment limits
});

// Security configuration
export interface SecurityConfig {
  requireBedrijf: boolean;
  allowedMethods: string[];
  rateLimiter: "general" | "write" | "planning" | "payment";
  requireCSRF?: boolean;
  sanitizeInput?: boolean;
  logActivity?: boolean;
}

export interface BedrijfAuthContext {
  user: any;
  session: any;
  bedrijfProfile: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Main security middleware for bedrijf endpoints
export function withBedrijfSecurity(
  handler: (
    request: NextRequest,
    context: BedrijfAuthContext,
  ) => Promise<NextResponse>,
  config: SecurityConfig = {
    requireBedrijf: true,
    allowedMethods: ["GET", "POST"],
    rateLimiter: "general",
  },
) {
  return async (request: NextRequest) => {
    try {
      const startTime = Date.now();

      // 1. Method validation
      if (!config.allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { success: false, error: "Method not allowed" },
          { status: 405 },
        );
      }

      // 2. Extract client information
      const headersList = headers();
      const ipAddress = getClientIP(request, headersList);
      const userAgent = headersList.get("user-agent") || "unknown";

      // 3. Rate limiting
      const rateLimiter = getRateLimiter(config.rateLimiter);
      try {
        await rateLimiter.consume(ipAddress);
      } catch (rejRes: any) {
        return NextResponse.json(
          {
            success: false,
            error: "Te veel verzoeken. Probeer het later opnieuw.",
            retryAfter: Math.round(rejRes.msBeforeNext / 1000),
          },
          {
            status: 429,
            headers: {
              "Retry-After": Math.round(rejRes.msBeforeNext / 1000).toString(),
            },
          },
        );
      }

      // 4. Authentication
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      // 5. Bedrijf profile validation
      let bedrijfProfile = null;
      if (config.requireBedrijf) {
        bedrijfProfile = await prisma.bedrijfProfile.findUnique({
          where: { userId: session.user.id },
          select: {
            id: true,
            bedrijfsnaam: true,
            kvkNummer: true,
            isActive: true,
            accountStatus: true,
            userId: true,
          },
        });

        if (!bedrijfProfile) {
          return NextResponse.json(
            {
              success: false,
              error: "Alleen bedrijven hebben toegang tot deze functionaliteit",
            },
            { status: 403 },
          );
        }

        if (!bedrijfProfile.isActive) {
          return NextResponse.json(
            { success: false, error: "Bedrijfaccount is gedeactiveerd" },
            { status: 403 },
          );
        }

        if (bedrijfProfile.accountStatus === "SUSPENDED") {
          return NextResponse.json(
            { success: false, error: "Bedrijfaccount is opgeschort" },
            { status: 403 },
          );
        }
      }

      // 6. CSRF protection for state-changing operations
      if (
        config.requireCSRF &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
      ) {
        const csrfToken = headersList.get("x-csrf-token");
        const sessionCsrfToken = session.csrfToken;

        if (
          !csrfToken ||
          !sessionCsrfToken ||
          !crypto.timingSafeEqual(
            Buffer.from(csrfToken),
            Buffer.from(sessionCsrfToken),
          )
        ) {
          return NextResponse.json(
            { success: false, error: "Invalid CSRF token" },
            { status: 403 },
          );
        }
      }

      // 7. Activity logging
      if (config.logActivity) {
        await logBedrijfActivity({
          bedrijfId: bedrijfProfile?.id,
          userId: session.user.id,
          action: `${request.method} ${request.url}`,
          ipAddress,
          userAgent,
          timestamp: new Date(),
        });
      }

      // 8. Build context
      const context: BedrijfAuthContext = {
        user: session.user,
        session,
        bedrijfProfile,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      };

      // 9. Execute handler
      const response = await handler(request, context);

      // 10. Add security headers
      const secureResponse = addSecurityHeaders(response);

      // 11. Performance logging
      const duration = Date.now() - startTime;
      if (duration > 5000) {
        // Log slow requests
        console.warn(
          `Slow bedrijf request: ${request.method} ${request.url} took ${duration}ms`,
        );
      }

      return secureResponse;
    } catch (error) {
      console.error("Bedrijf security middleware error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

// Input validation middleware
export function validateBedrijfInput<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ data: T; error?: string }> => {
    try {
      const body = await request.json();

      // Sanitize input
      const sanitizedBody = sanitizeObject(body);

      const validationResult = schema.safeParse(sanitizedBody);

      if (!validationResult.success) {
        return {
          data: {} as T,
          error: formatValidationError(validationResult.error),
        };
      }

      return { data: validationResult.data };
    } catch (_error) {
      return {
        data: {} as T,
        error: "Invalid JSON format",
      };
    }
  };
}

// Database query optimization middleware
export function withDatabaseOptimization<T>(
  queryFn: () => Promise<T>,
  _cacheKey?: string,
  _cacheDuration = 300, // 5 minutes default
) {
  return async (): Promise<T> => {
    const startTime = Date.now();

    try {
      // Execute query with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Database query timeout")), 30000); // 30 second timeout
      });

      const result = await Promise.race([queryFn(), timeoutPromise]);

      const duration = Date.now() - startTime;

      // Log slow queries
      if (duration > 3000) {
        console.warn(`Slow database query took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Database query failed after ${duration}ms:`, error);
      throw error;
    }
  };
}

// Helper functions
function getClientIP(request: NextRequest, headersList: Headers): string {
  // Check various headers for real IP
  const xForwardedFor = headersList.get("x-forwarded-for");
  const xRealIP = headersList.get("x-real-ip");
  const xClientIP = headersList.get("x-client-ip");

  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  if (xRealIP) return xRealIP;
  if (xClientIP) return xClientIP;

  return request.ip || "unknown";
}

function getRateLimiter(type: SecurityConfig["rateLimiter"]) {
  switch (type) {
    case "write":
      return bedrijfWriteLimiter;
    case "planning":
      return bedrijfPlanningLimiter;
    case "payment":
      return bedrijfPaymentLimiter;
    default:
      return bedrijfGeneralLimiter;
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
  );

  return response;
}

function sanitizeObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeKey(key)] = sanitizeObject(value);
  }

  return sanitized;
}

function sanitizeValue(value: any): any {
  if (typeof value === "string") {
    // Remove potentially dangerous characters
    return value
      .replace(/[<>]/g, "") // Remove HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .trim();
  }

  return value;
}

function sanitizeKey(key: string): string {
  // Only allow alphanumeric characters and underscores in keys
  return key.replace(/[^a-zA-Z0-9_]/g, "");
}

function formatValidationError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });

  return `Validatiefout: ${issues.join(", ")}`;
}

async function logBedrijfActivity(activity: {
  bedrijfId?: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}) {
  try {
    // In production, you might want to use a separate audit log table
    console.log("Bedrijf Activity:", {
      bedrijfId: activity.bedrijfId,
      userId: activity.userId,
      action: activity.action,
      ipAddress: `${activity.ipAddress.slice(0, 8)}...`, // Partially anonymize IP
    });

    // Could also send to external logging service (Sentry, etc.)
  } catch (error) {
    console.error("Failed to log bedrijf activity:", error);
  }
}

// Validation schemas for common bedrijf operations
export const bedrijfValidationSchemas = {
  createOpdracht: z.object({
    titel: z
      .string()
      .min(3, "Titel moet minimaal 3 karakters bevatten")
      .max(200),
    omschrijving: z
      .string()
      .min(10, "Omschrijving moet minimaal 10 karakters bevatten"),
    locatie: z.string().min(2, "Locatie is verplicht"),
    postcode: z
      .string()
      .regex(/^\d{4}[A-Z]{2}$/i, "Ongeldige Nederlandse postcode"),
    startDatum: z.string().datetime("Ongeldige startdatum"),
    eindDatum: z.string().datetime("Ongeldige einddatum"),
    uurloon: z
      .number()
      .min(0.01, "Uurloon moet hoger zijn dan €0.01")
      .max(200, "Uurloon mag niet hoger zijn dan €200"),
    aantalPersonen: z
      .number()
      .int()
      .min(1, "Minimaal 1 persoon vereist")
      .max(50, "Maximaal 50 personen toegestaan"),
    vereisten: z.array(z.string()).max(10, "Maximaal 10 vereisten toegestaan"),
    targetAudience: z.enum(["ALLEEN_ZZP", "ALLEEN_BEDRIJVEN", "BEIDEN"]),
    directZZPAllowed: z.boolean(),
    isDraft: z.boolean().optional(),
  }),

  planningAssignment: z.object({
    opdrachtId: z.string().uuid("Ongeldig opdracht ID"),
    zzpProfileIds: z
      .array(z.string().uuid())
      .min(1, "Minimaal één ZZP'er vereist")
      .max(20, "Maximaal 20 ZZP'ers per toewijzing"),
    startTijd: z.string().datetime().optional(),
    eindTijd: z.string().datetime().optional(),
    notities: z
      .string()
      .max(500, "Notities mogen maximaal 500 karakters bevatten")
      .optional(),
  }),

  clientUpdate: z.object({
    clientId: z.string().uuid("Ongeldig client ID"),
    action: z.enum(["add_note", "update_contact", "mark_favorite"]),
    data: z
      .record(z.any())
      .refine((data) => Object.keys(data).length <= 10, "Te veel data velden"),
  }),
};

// Performance monitoring
export function withPerformanceMonitoring<T>(
  operation: string,
  fn: () => Promise<T>,
) {
  return async (): Promise<T> => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    try {
      const result = await fn();

      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();
      const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;

      if (duration > 2000) {
        console.warn(`Slow operation ${operation}: ${duration}ms`);
      }

      if (memoryDiff > 50 * 1024 * 1024) {
        // 50MB
        console.warn(
          `High memory usage in ${operation}: ${Math.round(memoryDiff / 1024 / 1024)}MB`,
        );
      }

      return result;
    } catch (error) {
      console.error(`Operation ${operation} failed:`, error);
      throw error;
    }
  };
}
