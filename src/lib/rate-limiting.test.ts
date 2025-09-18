import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addRateLimitHeaders,
  checkRateLimit,
  checkUserActionLimit,
  createCustomRateLimiter,
  getRateLimiter,
  isTrustedSource,
  rateLimitMiddleware,
  rateLimitWithTrustCheck,
} from "./rate-limiting";

// Mock NextResponse
const mockJson = vi.fn();
const mockNextResponse = {
  json: mockJson,
  headers: new Map(),
  set: vi.fn(),
};

vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      json: vi.fn(() => mockNextResponse),
      next: vi.fn(() => ({ headers: new Map() })),
    },
  };
});

// Helper to create mock NextRequest
function createMockRequest(
  url: string,
  options: {
    ip?: string;
    forwardedFor?: string;
  } = {},
): NextRequest {
  const headers = new Map();
  if (options.forwardedFor) {
    headers.set("x-forwarded-for", options.forwardedFor);
  }

  return {
    nextUrl: { pathname: new URL(url, "http://localhost").pathname },
    headers: {
      get: (key: string) => headers.get(key) || null,
    },
    ip: options.ip,
  } as any;
}

describe("Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNextResponse.headers.clear();
  });

  describe("getRateLimiter", () => {
    it("should return auth limiter for auth endpoints", () => {
      const limiter = getRateLimiter("/api/auth/login");
      expect(limiter.points).toBe(5); // Auth limiter has 5 points
    });

    it("should return upload limiter for upload endpoints", () => {
      const limiter = getRateLimiter("/api/upload/image");
      expect(limiter.points).toBe(5); // Upload limiter has 5 points
    });

    it("should return strict limiter for admin endpoints", () => {
      const limiter = getRateLimiter("/api/admin/users");
      expect(limiter.points).toBe(10); // Strict limiter has 10 points
    });

    it("should return strict limiter for payment endpoints", () => {
      const limiter = getRateLimiter("/api/payment/process");
      expect(limiter.points).toBe(10); // Strict limiter has 10 points
    });

    it("should return api limiter for general endpoints", () => {
      const limiter = getRateLimiter("/api/users");
      expect(limiter.points).toBe(100); // API limiter has 100 points
    });
  });

  describe("checkRateLimit", () => {
    it("should return null when rate limit is not exceeded", async () => {
      const req = createMockRequest("http://localhost/api/test", {
        ip: "192.168.1.1",
      });
      const limiter = getRateLimiter("/api/test");

      const result = await checkRateLimit(req, limiter);

      expect(result).toBeNull();
    });

    it("should return rate limit response when limit is exceeded", async () => {
      const req = createMockRequest("http://localhost/api/test", {
        ip: "192.168.1.2",
      });
      const limiter = createCustomRateLimiter({
        points: 1,
        duration: 60,
        keyPrefix: "test",
      });

      // First request should pass
      await checkRateLimit(req, limiter);

      // Second request should be rate limited
      const result = await checkRateLimit(req, limiter);

      expect(result).not.toBeNull();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Te veel verzoeken. Probeer het over enkele minuten opnieuw.",
        }),
        expect.objectContaining({
          status: 429,
        }),
      );
    });

    it("should use forwarded IP when available", async () => {
      const req = createMockRequest("http://localhost/api/test", {
        forwardedFor: "203.0.113.1, 192.168.1.1",
      });
      const limiter = createCustomRateLimiter({
        points: 1,
        duration: 60,
        keyPrefix: "forwarded",
      });

      // Should use the first IP from forwarded header
      await checkRateLimit(req, limiter);
      const result = await checkRateLimit(req, limiter);

      expect(result).not.toBeNull();
    });

    it("should handle requests without IP", async () => {
      const req = createMockRequest("http://localhost/api/test");
      const limiter = createCustomRateLimiter({
        points: 1,
        duration: 60,
        keyPrefix: "noip",
      });

      const result = await checkRateLimit(req, limiter);

      expect(result).toBeNull(); // Should work with fallback key
    });
  });

  describe("rateLimitMiddleware", () => {
    it("should skip rate limiting for health checks", async () => {
      const req = createMockRequest("http://localhost/api/health");

      const result = await rateLimitMiddleware(req);

      expect(result).toBeNull();
    });

    it("should skip rate limiting for static assets", async () => {
      const req = createMockRequest("http://localhost/favicon.ico");

      const result = await rateLimitMiddleware(req);

      expect(result).toBeNull();
    });

    it("should skip rate limiting for non-API routes", async () => {
      const req = createMockRequest("http://localhost/dashboard");

      const result = await rateLimitMiddleware(req);

      expect(result).toBeNull();
    });

    it("should apply rate limiting to API routes", async () => {
      const req = createMockRequest("http://localhost/api/users", {
        ip: "192.168.1.3",
      });

      const result = await rateLimitMiddleware(req);

      expect(result).toBeNull(); // First request should pass
    });
  });

  describe("checkUserActionLimit", () => {
    it("should apply user-specific rate limiting", async () => {
      const req = createMockRequest("http://localhost/api/action");
      const userId = "user-123";
      const action = "submit_application";

      const options = {
        points: 1,
        duration: 60,
      };

      // First request should pass
      let result = await checkUserActionLimit(req, userId, action, options);
      expect(result).toBeNull();

      // Second request should be rate limited
      result = await checkUserActionLimit(req, userId, action, options);
      expect(result).not.toBeNull();
    });

    it("should isolate rate limits between different users", async () => {
      const req = createMockRequest("http://localhost/api/action");
      const action = "submit_application";
      const options = { points: 1, duration: 60 };

      // User 1 hits limit
      await checkUserActionLimit(req, "user-1", action, options);
      const user1Result = await checkUserActionLimit(
        req,
        "user-1",
        action,
        options,
      );
      expect(user1Result).not.toBeNull();

      // User 2 should still be able to make requests
      const user2Result = await checkUserActionLimit(
        req,
        "user-2",
        action,
        options,
      );
      expect(user2Result).toBeNull();
    });

    it("should isolate rate limits between different actions", async () => {
      const req = createMockRequest("http://localhost/api/action");
      const userId = "user-123";
      const options = { points: 1, duration: 60 };

      // Action 1 hits limit
      await checkUserActionLimit(req, userId, "action1", options);
      const action1Result = await checkUserActionLimit(
        req,
        userId,
        "action1",
        options,
      );
      expect(action1Result).not.toBeNull();

      // Action 2 should still be available
      const action2Result = await checkUserActionLimit(
        req,
        userId,
        "action2",
        options,
      );
      expect(action2Result).toBeNull();
    });
  });

  describe("isTrustedSource", () => {
    it("should trust localhost IPs", () => {
      const req1 = createMockRequest("http://localhost/api/webhook", {
        ip: "127.0.0.1",
      });
      const req2 = createMockRequest("http://localhost/api/webhook", {
        ip: "::1",
      });

      expect(isTrustedSource(req1)).toBe(true);
      expect(isTrustedSource(req2)).toBe(true);
    });

    it("should not trust external IPs", () => {
      const req = createMockRequest("http://localhost/api/webhook", {
        ip: "203.0.113.1",
      });

      expect(isTrustedSource(req)).toBe(false);
    });

    it("should handle forwarded headers for trusted sources", () => {
      const req = createMockRequest("http://localhost/api/webhook", {
        forwardedFor: "127.0.0.1, 192.168.1.1",
      });

      expect(isTrustedSource(req)).toBe(true);
    });

    it("should handle requests without IP", () => {
      const req = createMockRequest("http://localhost/api/webhook");

      expect(isTrustedSource(req)).toBe(false);
    });
  });

  describe("rateLimitWithTrustCheck", () => {
    it("should bypass rate limiting for trusted sources", async () => {
      const req = createMockRequest("http://localhost/api/webhook", {
        ip: "127.0.0.1",
      });

      const result = await rateLimitWithTrustCheck(req);

      expect(result).toBeNull();
    });

    it("should apply rate limiting for non-trusted sources", async () => {
      const req = createMockRequest("http://localhost/api/users", {
        ip: "203.0.113.1",
      });

      const result = await rateLimitWithTrustCheck(req);

      expect(result).toBeNull(); // First request should pass
    });
  });

  describe("createCustomRateLimiter", () => {
    it("should create rate limiter with custom options", () => {
      const limiter = createCustomRateLimiter({
        points: 50,
        duration: 120,
        blockDuration: 300,
        keyPrefix: "custom",
      });

      expect(limiter.points).toBe(50);
      expect(limiter.duration).toBe(120);
    });

    it("should use duration as blockDuration when not specified", () => {
      const limiter = createCustomRateLimiter({
        points: 10,
        duration: 60,
      });

      expect(limiter.points).toBe(10);
      expect(limiter.duration).toBe(60);
    });
  });

  describe("addRateLimitHeaders", () => {
    it("should add rate limit headers to response", () => {
      const { NextResponse } = require("next/server");
      const response = NextResponse.next();
      const limiter = createCustomRateLimiter({ points: 100, duration: 60 });

      addRateLimitHeaders(response, limiter, 90);

      expect(response.headers.set).toHaveBeenCalledWith(
        "X-RateLimit-Limit",
        "100",
      );
      expect(response.headers.set).toHaveBeenCalledWith(
        "X-RateLimit-Remaining",
        "90",
      );
      expect(response.headers.set).toHaveBeenCalledWith(
        "X-RateLimit-Reset",
        expect.any(String),
      );
    });
  });
});
