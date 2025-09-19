import type { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { expect, vi } from "vitest";
import * as authModule from "@/lib/auth";

// Mock user factory
export function createMockUser(
  role: UserRole,
  additionalData: Record<string, unknown> = {},
) {
  const baseUser = {
    id: `user-${role.toLowerCase()}-${Date.now()}`,
    email: `test-${role.toLowerCase()}@example.com`,
    name: `Test ${role}`,
    role,
    status: "ACTIVE" as const,
    phone: "+31612345678",
    hasCompletedProfile: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...additionalData,
  };

  return baseUser;
}

// Mock NextRequest factory
export function createMockRequest(
  method: string,
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;

  const requestHeaders = new Headers({
    "Content-Type": "application/json",
    ...headers,
  });

  const requestInit: Record<string, unknown> = {
    method,
    headers: requestHeaders,
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    requestInit.body = JSON.stringify(body);
  }

  // Cast to unknown first to avoid type issues with Next.js RequestInit
  return new NextRequest(fullUrl, requestInit as unknown as RequestInit);
}

// Helper for testing authenticated routes
export async function testWithAuth<T>(
  user: Record<string, unknown>,
  testFn: () => Promise<T>,
): Promise<T> {
  // Mock authentication to return the provided user
  const mockAuth = vi.spyOn(authModule, "auth");
  mockAuth.mockResolvedValue({ user } as unknown as ReturnType<
    typeof authModule.auth
  >);

  try {
    return await testFn();
  } finally {
    mockAuth.mockReset();
  }
}

// Create mock session data
export function createMockSession(user: Record<string, unknown>) {
  return {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };
}

// Mock user profiles for different roles
export const mockUserProfiles = {
  zzp: {
    id: "zzp-profile-1",
    userId: "user-zzp-1",
    kvkNummer: "12345678",
    btwNummer: "NL123456789B01",
    uurtarief: 28.5,
    beschrijving: "Ervaren beveiliger",
    specialisaties: ["Evenement beveiliging", "Object beveiliging"],
    certificaten: ["BOA", "BHV"],
    werkgebied: ["Amsterdam", "Utrecht"],
    beschikbaarheid: {
      maandag: { beschikbaar: true, van: "09:00", tot: "17:00" },
      dinsdag: { beschikbaar: true, van: "09:00", tot: "17:00" },
      woensdag: { beschikbaar: true, van: "09:00", tot: "17:00" },
      donderdag: { beschikbaar: true, van: "09:00", tot: "17:00" },
      vrijdag: { beschikbaar: true, van: "09:00", tot: "17:00" },
      zaterdag: { beschikbaar: false },
      zondag: { beschikbaar: false },
    },
    rating: 4.8,
    totalReviews: 12,
    completedJobs: 45,
    totalHoursWorked: 320,
  },

  bedrijf: {
    id: "bedrijf-profile-1",
    userId: "user-bedrijf-1",
    bedrijfsnaam: "SecureGuard Nederland BV",
    kvkNummer: "87654321",
    btwNummer: "NL987654321B01",
    beschrijving: "Professionele beveiligingsdiensten",
    website: "https://secureguard.nl",
    adres: "Beveiligingslaan 123",
    postcode: "1234AB",
    plaats: "Amsterdam",
    telefoon: "+31201234567",
    specialisaties: [
      "Object beveiliging",
      "Evenement beveiliging",
      "Mobiele surveillance",
    ],
    werkgebied: ["Noord-Holland", "Utrecht"],
    teamSize: 25,
    extraAccounts: 3,
    subscriptionTier: "MEDIUM",
    certificeringen: ["ISO 27001", "VCA*"],
    bedrijfsstructuur: "BV",
  },

  opdrachtgever: {
    id: "opdrachtgever-1",
    userId: "user-opdrachtgever-1",
    bedrijfsnaam: "EventCorp International",
    contactpersoon: "Maria van der Berg",
    beschrijving: "Organisatie van zakelijke evenementen",
    website: "https://eventcorp.nl",
    adres: "Evenementenlaan 456",
    postcode: "5678CD",
    plaats: "Rotterdam",
    telefoon: "+31107654321",
    sector: "Evenementen",
    organisatietype: "BEDRIJF",
    kvkNummer: "11223344",
    btwNummer: "NL112233445B01",
    totalHoursBooked: 1200,
    totalSpent: 45000,
    activeContracts: 3,
  },
};

// Mock database responses for common scenarios
export const mockDatabaseResponses = {
  emptyResults: {
    jobs: [],
    opdrachten: [],
    users: [],
    count: 0,
  },

  sampleJobs: [
    {
      id: "job-1",
      titel: "Evenementbeveiliging Concert",
      beschrijving: "Beveiliging voor groot outdoor concert",
      locatie: "Amsterdam Noord",
      startDatum: new Date("2025-12-25T18:00:00Z"),
      eindDatum: new Date("2025-12-26T02:00:00Z"),
      aantalBeveiligers: 8,
      uurtarief: 32.5,
      vereisten: ["BOA certificaat", "Evenement ervaring", "Stressbestendig"],
      type: "Evenement",
      isUrgent: true,
      status: "OPEN",
      opdrachtgever: { id: "og-1", bedrijfsnaam: "EventCorp" },
      bedrijf: null,
      beveiligers: [],
      _count: { beveiligers: 3 },
      createdAt: new Date("2025-09-15T10:00:00Z"),
      updatedAt: new Date("2025-09-15T10:00:00Z"),
    },
    {
      id: "job-2",
      titel: "Objectbeveiliging Winkelcentrum",
      beschrijving: "Nachtdienst in groot winkelcentrum",
      locatie: "Rotterdam Centrum",
      startDatum: new Date("2025-12-20T22:00:00Z"),
      eindDatum: new Date("2025-12-21T06:00:00Z"),
      aantalBeveiligers: 4,
      uurtarief: 28.0,
      vereisten: ["WPBR vergunning", "Objectbeveiliging ervaring"],
      type: "Object",
      isUrgent: false,
      status: "OPEN",
      opdrachtgever: { id: "og-2", bedrijfsnaam: "RetailSecure" },
      bedrijf: null,
      beveiligers: [],
      _count: { beveiligers: 1 },
      createdAt: new Date("2025-09-14T14:30:00Z"),
      updatedAt: new Date("2025-09-14T14:30:00Z"),
    },
  ],
};

// Validation helpers
export function expectValidApiResponse(
  responseData: {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
  },
  expectedProperties: string[] = [],
) {
  expect(responseData).toBeDefined();
  expect(responseData).toHaveProperty("success");

  if (responseData.success) {
    expect(responseData).toHaveProperty("data");
    expectedProperties.forEach((prop) => {
      expect(responseData.data).toHaveProperty(prop);
    });
  } else {
    expect(responseData).toHaveProperty("error");
  }
}

export function expectValidPaginatedResponse(responseData: {
  success: boolean;
  data?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    [key: string]: unknown;
  };
  error?: string;
}) {
  expectValidApiResponse(responseData);

  if (responseData.success && responseData.data) {
    expect(responseData.data).toHaveProperty("pagination");
    const pagination = responseData.data.pagination;

    if (pagination) {
      expect(pagination).toHaveProperty("page");
      expect(pagination).toHaveProperty("limit");
      expect(pagination).toHaveProperty("total");
      expect(pagination).toHaveProperty("totalPages");
      expect(pagination).toHaveProperty("hasNext");
      expect(pagination).toHaveProperty("hasPrev");

      expect(typeof pagination.page).toBe("number");
      expect(typeof pagination.limit).toBe("number");
      expect(typeof pagination.total).toBe("number");
      expect(typeof pagination.totalPages).toBe("number");
      expect(typeof pagination.hasNext).toBe("boolean");
      expect(typeof pagination.hasPrev).toBe("boolean");
    }
  }
}

export function expectValidJobData(job: Record<string, unknown>) {
  const requiredFields = [
    "id",
    "title",
    "description",
    "location",
    "company",
    "startDate",
    "endDate",
    "hourlyRate",
    "spotsAvailable",
    "spotsRemaining",
    "status",
  ];

  requiredFields.forEach((field) => {
    expect(job).toHaveProperty(field);
  });

  // Type validations
  expect(typeof job.hourlyRate).toBe("number");
  expect(typeof job.spotsAvailable).toBe("number");
  expect(typeof job.spotsRemaining).toBe("number");
  expect(job.hourlyRate).toBeGreaterThan(0);
  expect(job.spotsAvailable).toBeGreaterThanOrEqual(0);
  expect(job.spotsRemaining).toBeGreaterThanOrEqual(0);
}

export function expectValidOpdrachtData(opdracht: Record<string, unknown>) {
  const requiredFields = [
    "id",
    "titel",
    "beschrijving",
    "locatie",
    "startDatum",
    "eindDatum",
    "aantalBeveiligers",
    "uurtarief",
    "status",
  ];

  requiredFields.forEach((field) => {
    expect(opdracht).toHaveProperty(field);
  });

  // Type validations
  expect(typeof opdracht.uurtarief).toBe("number");
  expect(typeof opdracht.aantalBeveiligers).toBe("number");
  expect(opdracht.uurtarief).toBeGreaterThan(0);
  expect(opdracht.aantalBeveiligers).toBeGreaterThan(0);
}

// Test data cleanup helpers
export function resetAllMocks(mocks: Array<{ mockReset?: () => void }>) {
  mocks.forEach((mock) => {
    if (mock && typeof mock.mockReset === "function") {
      mock.mockReset();
    }
  });
}

// Error simulation helpers
export function createDatabaseError(
  type: "connection" | "constraint" | "timeout" = "connection",
) {
  const errors = {
    connection: new Error("Connection to database failed"),
    constraint: Object.assign(new Error("Unique constraint violation"), {
      code: "P2002",
    }),
    timeout: new Error("Query timeout"),
  };

  return errors[type];
}

// Performance test helpers
export function measureApiPerformance<T>(fn: () => Promise<T>) {
  return async (): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    return {
      result,
      duration: end - start,
    };
  };
}
