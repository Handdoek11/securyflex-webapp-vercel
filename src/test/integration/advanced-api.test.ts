import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { GET as getDashboardStats } from "@/app/api/dashboard/stats/route";

// Import additional API routes for comprehensive testing
import { POST as applyForJob } from "@/app/api/jobs/[id]/apply/route";
import {
  GET as getProfile,
  PUT as updateProfile,
} from "@/app/api/profile/route";
import { POST as clockOut } from "@/app/api/werkuren/[id]/clock-out/route";
import { POST as clockIn } from "@/app/api/werkuren/clock-in/route";
import {
  createDatabaseError,
  createMockRequest,
  createMockUser,
  expectValidApiResponse,
  mockDatabaseResponses,
} from "../helpers/auth-helpers";

// Mock external services
const mockBroadcast = vi.fn();
const mockPrisma = {
  user: { findUnique: vi.fn(), update: vi.fn() },
  zZPProfile: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
  bedrijfProfile: { findUnique: vi.fn(), update: vi.fn() },
  opdrachtgever: { findUnique: vi.fn(), update: vi.fn() },
  opdracht: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  sollicitatie: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
  werkuren: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  opdrachtAssignment: { findMany: vi.fn(), create: vi.fn() },
  $transaction: vi.fn(),
};

const mockAuth = vi.fn();
const mockSupabase = { from: vi.fn() };

describe("Advanced API Integration Tests", () => {
  beforeAll(() => {
    // Mock all external dependencies
    vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));
    vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
    vi.mock("@/lib/supabase/broadcast", () => ({
      broadcastOpdrachtEvent: mockBroadcast,
      BroadcastEvent: {
        OPDRACHT_CREATED: "OPDRACHT_CREATED",
        SOLLICITATIE_NEW: "SOLLICITATIE_NEW",
        WERKUREN_STARTED: "WERKUREN_STARTED",
        WERKUREN_COMPLETED: "WERKUREN_COMPLETED",
      },
    }));
    vi.mock("@/lib/supabase", () => ({ createClient: () => mockSupabase }));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("Job Applications Flow", () => {
    const mockZZPUser = createMockUser("ZZP_BEVEILIGER", {
      zzpProfile: { id: "zzp-1", uurtarief: 30.0 },
    });

    describe("POST /api/jobs/[id]/apply", () => {
      it("should successfully apply ZZP user for job", async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        // Mock finding the job/opdracht
        mockPrisma.opdracht.findUnique.mockResolvedValue({
          id: "job-1",
          titel: "Test Job",
          status: "OPEN",
          directZZPAllowed: true,
          targetAudience: "BEIDEN",
          aantalBeveiligers: 5,
          uurtarief: 28.0,
        });

        // Mock ZZP profile
        mockPrisma.zZPProfile.findUnique.mockResolvedValue({
          id: "zzp-1",
          userId: mockZZPUser.id,
          uurtarief: 30.0,
        });

        // Mock no existing application
        mockPrisma.sollicitatie.findFirst.mockResolvedValue(null);

        // Mock successful application creation
        mockPrisma.sollicitatie.create.mockResolvedValue({
          id: "application-1",
          opdrachtId: "job-1",
          sollicitantId: "zzp-1",
          sollicitantType: "ZZP",
          status: "PENDING",
          motivatie: "Ik ben zeer geïnteresseerd",
          createdAt: new Date(),
        });

        const applicationData = {
          motivatie: "Ik ben zeer geïnteresseerd in deze opdracht",
          beschikbaarheidOpmerking: "Volledig beschikbaar",
          uurtariefVoorstel: 30.0,
        };

        const request = createMockRequest(
          "POST",
          "/api/jobs/job-1/apply",
          applicationData,
        );
        const response = await applyForJob(request, {
          params: { id: "job-1" },
        });

        expect(response.status).toBe(201);

        const responseData = await response.json();
        expectValidApiResponse(responseData);
        expect(responseData.success).toBe(true);
        expect(mockPrisma.sollicitatie.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            opdrachtId: "job-1",
            sollicitantId: "zzp-1",
            sollicitantType: "ZZP",
            status: "PENDING",
          }),
        });
        expect(mockBroadcast).toHaveBeenCalled();
      });

      it("should prevent duplicate applications", async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        mockPrisma.opdracht.findUnique.mockResolvedValue({
          id: "job-1",
          status: "OPEN",
          directZZPAllowed: true,
        });

        mockPrisma.zZPProfile.findUnique.mockResolvedValue({ id: "zzp-1" });

        // Mock existing application
        mockPrisma.sollicitatie.findFirst.mockResolvedValue({
          id: "existing-app",
          status: "PENDING",
        });

        const request = createMockRequest("POST", "/api/jobs/job-1/apply", {
          motivatie: "Test motivation",
        });

        const response = await applyForJob(request, {
          params: { id: "job-1" },
        });

        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain("al gesolliciteerd");
      });

      it("should reject applications for closed jobs", async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        mockPrisma.opdracht.findUnique.mockResolvedValue({
          id: "job-1",
          status: "GESLOTEN",
          directZZPAllowed: true,
        });

        const request = createMockRequest("POST", "/api/jobs/job-1/apply", {
          motivatie: "Test motivation",
        });

        const response = await applyForJob(request, {
          params: { id: "job-1" },
        });

        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain("niet meer open");
      });
    });
  });

  describe("Time Tracking Flow", () => {
    const mockZZPUser = createMockUser("ZZP_BEVEILIGER", {
      zzpProfile: { id: "zzp-1" },
    });

    describe("POST /api/werkuren/clock-in", () => {
      it("should successfully clock in for assigned opdracht", async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        // Mock assigned opdracht
        mockPrisma.opdrachtAssignment.findFirst.mockResolvedValue({
          id: "assignment-1",
          opdrachtId: "opdracht-1",
          status: "CONFIRMED",
        });

        mockPrisma.opdracht.findUnique.mockResolvedValue({
          id: "opdracht-1",
          titel: "Test Opdracht",
          locatie: "Amsterdam",
          startDatum: new Date(),
          status: "ACTIEF",
        });

        // Mock no existing active werkuren
        mockPrisma.werkuren.findFirst.mockResolvedValue(null);

        mockPrisma.werkuren.create.mockResolvedValue({
          id: "werkuren-1",
          opdrachtId: "opdracht-1",
          beveiligerId: "zzp-1",
          startTijd: new Date(),
          locatieCheckin: { lat: 52.3676, lng: 4.9041, accuracy: 10 },
          status: "ACTIEF",
        });

        const clockInData = {
          opdrachtId: "opdracht-1",
          locatie: { lat: 52.3676, lng: 4.9041, accuracy: 10 },
          foto: "base64-encoded-photo-data",
          opmerkingen: "Aangekomen op locatie",
        };

        const request = createMockRequest(
          "POST",
          "/api/werkuren/clock-in",
          clockInData,
        );
        const response = await clockIn(request);

        expect(response.status).toBe(201);

        const responseData = await response.json();
        expectValidApiResponse(responseData);
        expect(mockPrisma.werkuren.create).toHaveBeenCalled();
        expect(mockBroadcast).toHaveBeenCalled();
      });

      it("should prevent double clock-in", async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        mockPrisma.opdrachtAssignment.findFirst.mockResolvedValue({
          id: "assignment-1",
          opdrachtId: "opdracht-1",
          status: "CONFIRMED",
        });

        // Mock existing active werkuren
        mockPrisma.werkuren.findFirst.mockResolvedValue({
          id: "werkuren-1",
          status: "ACTIEF",
          startTijd: new Date(),
        });

        const clockInData = {
          opdrachtId: "opdracht-1",
          locatie: { lat: 52.3676, lng: 4.9041 },
        };

        const request = createMockRequest(
          "POST",
          "/api/werkuren/clock-in",
          clockInData,
        );
        const response = await clockIn(request);

        expect(response.status).toBe(400);

        const responseData = await response.json();
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain("al ingeklokt");
      });

      it("should validate GPS location accuracy", async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        const clockInData = {
          opdrachtId: "opdracht-1",
          locatie: { lat: 52.3676, lng: 4.9041, accuracy: 1000 }, // Very inaccurate
        };

        const request = createMockRequest(
          "POST",
          "/api/werkuren/clock-in",
          clockInData,
        );
        const response = await clockIn(request);

        expect(response.status).toBe(400);

        const responseData = await response.json();
        expect(responseData.error).toContain("locatie");
      });
    });

    describe("POST /api/werkuren/[id]/clock-out", () => {
      it("should successfully clock out with incident reports", async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        // Mock active werkuren
        mockPrisma.werkuren.findUnique.mockResolvedValue({
          id: "werkuren-1",
          beveiligerId: "zzp-1",
          status: "ACTIEF",
          startTijd: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        });

        mockPrisma.werkuren.update.mockResolvedValue({
          id: "werkuren-1",
          status: "VOLTOOID",
          eindTijd: new Date(),
          totaleUren: 4.0,
          totaleVerdiensten: 120.0,
        });

        const clockOutData = {
          locatie: { lat: 52.3676, lng: 4.9041, accuracy: 5 },
          foto: "base64-encoded-photo-data",
          pauzetijd: 30, // 30 minutes
          opmerkingen: "Dienst succesvol voltooid",
          incidenten: [
            {
              type: "INCIDENT",
              beschrijving: "Verdachte persoon gespot en weggestuurd",
              tijdstip: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              locatie: "Hoofdingang",
            },
          ],
        };

        const request = createMockRequest(
          "POST",
          "/api/werkuren/werkuren-1/clock-out",
          clockOutData,
        );
        const response = await clockOut(request, {
          params: { id: "werkuren-1" },
        });

        expect(response.status).toBe(200);

        const responseData = await response.json();
        expectValidApiResponse(responseData);
        expect(mockPrisma.werkuren.update).toHaveBeenCalledWith({
          where: { id: "werkuren-1" },
          data: expect.objectContaining({
            status: "VOLTOOID",
            eindTijd: expect.any(Date),
            locatieCheckout: clockOutData.locatie,
            pauzes: expect.arrayContaining([
              expect.objectContaining({ duurMinuten: 30 }),
            ]),
            incidenten: expect.arrayContaining([
              expect.objectContaining({
                type: "INCIDENT",
                beschrijving: expect.any(String),
              }),
            ]),
          }),
        });
      });

      it("should calculate accurate work hours and earnings", async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        const startTime = new Date("2025-12-25T09:00:00Z");
        const endTime = new Date("2025-12-25T17:00:00Z"); // 8 hours

        mockPrisma.werkuren.findUnique.mockResolvedValue({
          id: "werkuren-1",
          beveiligerId: "zzp-1",
          status: "ACTIEF",
          startTijd: startTime,
          opdracht: { uurtarief: 30.0 },
        });

        const mockUpdatedWerkuren = {
          id: "werkuren-1",
          status: "VOLTOOID",
          startTijd: startTime,
          eindTijd: endTime,
          totaleUren: 7.5, // 8 hours - 0.5 hour break
          brutoPay: 225.0, // 7.5 * 30
          netPay: 198.0, // After deductions
          pauzes: [{ duurMinuten: 30 }],
        };

        mockPrisma.werkuren.update.mockResolvedValue(mockUpdatedWerkuren);

        const clockOutData = {
          locatie: { lat: 52.3676, lng: 4.9041 },
          pauzetijd: 30,
        };

        const request = createMockRequest(
          "POST",
          "/api/werkuren/werkuren-1/clock-out",
          clockOutData,
        );
        const response = await clockOut(request, {
          params: { id: "werkuren-1" },
        });

        const responseData = await response.json();

        expect(responseData.data.totaleUren).toBe(7.5);
        expect(responseData.data.brutoPay).toBe(225.0);
        expect(responseData.data.netPay).toBeLessThan(
          responseData.data.brutoPay,
        );
      });
    });
  });

  describe("Profile Management", () => {
    describe("GET /api/profile", () => {
      it("should return complete ZZP profile", async () => {
        const mockZZPUser = createMockUser("ZZP_BEVEILIGER");
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        const mockProfile = {
          id: "zzp-1",
          userId: mockZZPUser.id,
          kvkNummer: "12345678",
          btwNummer: "NL123456789B01",
          uurtarief: 32.5,
          beschrijving: "Ervaren beveiliger",
          specialisaties: ["Object", "Evenement"],
          certificaten: ["BOA", "BHV"],
          rating: 4.8,
          totalReviews: 15,
          completedJobs: 67,
          user: {
            name: mockZZPUser.name,
            email: mockZZPUser.email,
            phone: mockZZPUser.phone,
          },
        };

        mockPrisma.user.findUnique.mockResolvedValue({
          ...mockZZPUser,
          zzpProfile: mockProfile,
        });

        const request = createMockRequest("GET", "/api/profile");
        const response = await getProfile(request);

        expect(response.status).toBe(200);

        const responseData = await response.json();
        expectValidApiResponse(responseData, ["profile"]);
        expect(responseData.data.profile.kvkNummer).toBe("12345678");
        expect(responseData.data.profile.rating).toBe(4.8);
      });

      it("should return appropriate profile based on user role", async () => {
        const mockBedrijfUser = createMockUser("BEDRIJF");
        mockAuth.mockResolvedValue({ user: mockBedrijfUser });

        mockPrisma.user.findUnique.mockResolvedValue({
          ...mockBedrijfUser,
          bedrijfProfile: {
            id: "bedrijf-1",
            bedrijfsnaam: "SecureGuard BV",
            teamSize: 12,
            subscriptionTier: "MEDIUM",
          },
        });

        const request = createMockRequest("GET", "/api/profile");
        const response = await getProfile(request);

        expect(response.status).toBe(200);

        const responseData = await response.json();
        expect(responseData.data.profile.bedrijfsnaam).toBe("SecureGuard BV");
        expect(responseData.data.profile.teamSize).toBe(12);
      });
    });

    describe("PUT /api/profile", () => {
      it("should update ZZP profile with validation", async () => {
        const mockZZPUser = createMockUser("ZZP_BEVEILIGER");
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        mockPrisma.user.findUnique.mockResolvedValue({
          ...mockZZPUser,
          zzpProfile: { id: "zzp-1" },
        });

        const updateData = {
          uurtarief: 35.0,
          beschrijving: "Bijgewerkte beschrijving",
          specialisaties: ["Object", "Evenement", "VIP Beveiliging"],
          beschikbaarheid: {
            maandag: { beschikbaar: true, van: "08:00", tot: "18:00" },
            dinsdag: { beschikbaar: true, van: "08:00", tot: "18:00" },
            woensdag: { beschikbaar: false },
            donderdag: { beschikbaar: true, van: "08:00", tot: "18:00" },
            vrijdag: { beschikbaar: true, van: "08:00", tot: "18:00" },
            zaterdag: { beschikbaar: true, van: "10:00", tot: "16:00" },
            zondag: { beschikbaar: false },
          },
        };

        mockPrisma.zZPProfile.update.mockResolvedValue({
          id: "zzp-1",
          ...updateData,
        });

        const request = createMockRequest("PUT", "/api/profile", updateData);
        const response = await updateProfile(request);

        expect(response.status).toBe(200);

        const responseData = await response.json();
        expectValidApiResponse(responseData);
        expect(mockPrisma.zZPProfile.update).toHaveBeenCalledWith({
          where: { id: "zzp-1" },
          data: expect.objectContaining({
            uurtarief: 35.0,
            beschrijving: "Bijgewerkte beschrijving",
          }),
        });
      });

      it("should validate hourly rate limits", async () => {
        const mockZZPUser = createMockUser("ZZP_BEVEILIGER");
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        const invalidUpdateData = {
          uurtarief: 200.0, // Above maximum
        };

        const request = createMockRequest(
          "PUT",
          "/api/profile",
          invalidUpdateData,
        );
        const response = await updateProfile(request);

        expect(response.status).toBe(400);

        const responseData = await response.json();
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain("tarief");
      });
    });
  });

  describe("Dashboard Statistics", () => {
    describe("GET /api/dashboard/stats", () => {
      it("should return comprehensive ZZP dashboard stats", async () => {
        const mockZZPUser = createMockUser("ZZP_BEVEILIGER");
        mockAuth.mockResolvedValue({ user: mockZZPUser });

        // Mock various statistics queries
        mockPrisma.user.findUnique.mockResolvedValue({
          ...mockZZPUser,
          zzpProfile: { id: "zzp-1" },
        });

        // Mock active jobs
        mockPrisma.werkuren.findMany.mockResolvedValue([
          { id: "w1", status: "ACTIEF", startTijd: new Date() },
        ]);

        // Mock upcoming jobs
        mockPrisma.opdrachtAssignment.findMany.mockResolvedValue([
          {
            opdracht: {
              id: "o1",
              titel: "Upcoming Job",
              startDatum: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          },
        ]);

        // Mock earnings data
        mockPrisma.$transaction.mockResolvedValue([
          [{ totalEarnings: 2450.0, totalHours: 82.5 }], // This month
          [{ totalEarnings: 2100.0, totalHours: 70.0 }], // Last month
          [{ count: 12 }], // Completed jobs
          [{ count: 3 }], // Pending applications
        ]);

        const request = createMockRequest("GET", "/api/dashboard/stats");
        const response = await getDashboardStats(request);

        expect(response.status).toBe(200);

        const responseData = await response.json();
        expectValidApiResponse(responseData, ["stats"]);

        const stats = responseData.data.stats;
        expect(stats).toHaveProperty("activeJobs");
        expect(stats).toHaveProperty("upcomingJobs");
        expect(stats).toHaveProperty("earnings");
        expect(stats).toHaveProperty("performance");

        expect(typeof stats.earnings.thisMonth).toBe("number");
        expect(typeof stats.performance.completedJobs).toBe("number");
        expect(Array.isArray(stats.upcomingJobs)).toBe(true);
      });

      it("should handle different user roles appropriately", async () => {
        const mockOpdrachtgeverUser = createMockUser("OPDRACHTGEVER");
        mockAuth.mockResolvedValue({ user: mockOpdrachtgeverUser });

        mockPrisma.user.findUnique.mockResolvedValue({
          ...mockOpdrachtgeverUser,
          opdrachtgever: { id: "og-1" },
        });

        // Mock opdrachtgever-specific stats
        mockPrisma.$transaction.mockResolvedValue([
          [{ count: 8 }], // Active opdrachten
          [{ count: 15 }], // Total applications received
          [{ totalSpent: 15750.0 }], // This month spending
          [{ totalSpent: 12400.0 }], // Last month spending
        ]);

        const request = createMockRequest("GET", "/api/dashboard/stats");
        const response = await getDashboardStats(request);

        expect(response.status).toBe(200);

        const responseData = await response.json();
        expect(responseData.data.stats).toHaveProperty("activeOpdrachten");
        expect(responseData.data.stats).toHaveProperty("totalApplications");
        expect(responseData.data.stats).toHaveProperty("spending");
      });
    });
  });

  describe("Error Handling & Resilience", () => {
    it("should handle database connection failures gracefully", async () => {
      const mockUser = createMockUser("ZZP_BEVEILIGER");
      mockAuth.mockResolvedValue({ user: mockUser });

      mockPrisma.user.findUnique.mockRejectedValue(
        createDatabaseError("connection"),
      );

      const request = createMockRequest("GET", "/api/profile");
      const response = await getProfile(request);

      expect([500, 503]).toContain(response.status); // Either internal error or service unavailable

      const responseData = await response.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });

    it("should handle transaction rollbacks properly", async () => {
      const mockUser = createMockUser("ZZP_BEVEILIGER");
      mockAuth.mockResolvedValue({ user: mockUser });

      // Mock transaction failure
      mockPrisma.$transaction.mockRejectedValue(
        new Error("Transaction failed"),
      );

      const clockInData = {
        opdrachtId: "opdracht-1",
        locatie: { lat: 52.3676, lng: 4.9041 },
      };

      const request = createMockRequest(
        "POST",
        "/api/werkuren/clock-in",
        clockInData,
      );
      const response = await clockIn(request);

      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData.success).toBe(false);
    });

    it("should validate request size limits", async () => {
      const mockUser = createMockUser("ZZP_BEVEILIGER");
      mockAuth.mockResolvedValue({ user: mockUser });

      // Create oversized payload
      const oversizedData = {
        beschrijving: "x".repeat(100000), // Very large description
        specialisaties: Array.from({ length: 1000 }, (_, i) => `Skill ${i}`),
      };

      const request = createMockRequest("PUT", "/api/profile", oversizedData);
      const response = await updateProfile(request);

      expect([400, 413]).toContain(response.status); // Bad request or payload too large
    });

    it("should handle concurrent requests without data corruption", async () => {
      const mockUser = createMockUser("ZZP_BEVEILIGER");
      mockAuth.mockResolvedValue({ user: mockUser });

      // Setup successful responses
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        zzpProfile: { id: "zzp-1" },
      });
      mockPrisma.zZPProfile.update.mockResolvedValue({
        id: "zzp-1",
        uurtarief: 30.0,
      });

      // Simulate 10 concurrent profile updates
      const updates = Array.from({ length: 10 }, (_, i) =>
        updateProfile(
          createMockRequest("PUT", "/api/profile", { uurtarief: 25 + i }),
        ),
      );

      const responses = await Promise.all(updates);

      // All requests should complete (either succeed or fail gracefully)
      responses.forEach((response) => {
        expect([200, 400, 409, 500]).toContain(response.status);
      });

      // Database update should have been called for each request
      expect(mockPrisma.zZPProfile.update).toHaveBeenCalledTimes(10);
    });
  });

  describe("Performance & Load Testing", () => {
    it("should handle rapid sequential requests efficiently", async () => {
      const mockUser = createMockUser("ZZP_BEVEILIGER");
      mockAuth.mockResolvedValue({ user: mockUser });

      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        zzpProfile: { id: "zzp-1" },
      });

      const start = performance.now();

      // Make 50 rapid profile requests
      const requests = Array.from({ length: 50 }, () =>
        getProfile(createMockRequest("GET", "/api/profile")),
      );

      const responses = await Promise.all(requests);
      const end = performance.now();

      const totalTime = end - start;
      const avgResponseTime = totalTime / responses.length;

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Average response time should be reasonable (less than 100ms per request)
      expect(avgResponseTime).toBeLessThan(100);

      console.log(
        `Performance test: ${responses.length} requests in ${totalTime.toFixed(2)}ms (avg: ${avgResponseTime.toFixed(2)}ms)`,
      );
    });

    it("should maintain response quality under load", async () => {
      const mockUser = createMockUser("ZZP_BEVEILIGER");
      mockAuth.mockResolvedValue({ user: mockUser });

      // Mock complex data responses
      mockPrisma.user.findUnique.mockResolvedValue({
        zzpProfile: { id: "zzp-1" },
      });
      mockPrisma.werkuren.findMany.mockResolvedValue(
        mockDatabaseResponses.sampleJobs,
      );
      mockPrisma.opdrachtAssignment.findMany.mockResolvedValue([]);
      mockPrisma.$transaction.mockResolvedValue([
        [{ totalEarnings: 3500.0 }],
        [{ totalEarnings: 3200.0 }],
        [{ count: 25 }],
        [{ count: 5 }],
      ]);

      const requests = Array.from({ length: 20 }, () =>
        getDashboardStats(createMockRequest("GET", "/api/dashboard/stats")),
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Verify response data quality is maintained
      const responseData = await responses[0].json();
      expectValidApiResponse(responseData, ["stats"]);
      expect(responseData.data.stats.earnings.thisMonth).toBe(3500.0);
    });
  });
});
