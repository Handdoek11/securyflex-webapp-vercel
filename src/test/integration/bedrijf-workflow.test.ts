import { PrismaClient } from "@prisma/client";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

// Test utilities
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

// Mock authentication for tests
const _mockAuth = {
  user: {
    id: "test-user-bedrijf",
    email: "test@bedrijf.com",
    role: "BEDRIJF",
  },
  session: {
    user: {
      id: "test-user-bedrijf",
      email: "test@bedrijf.com",
      role: "BEDRIJF",
    },
  },
};

describe("Bedrijf Integration Workflow Tests", () => {
  let testBedrijfProfile: any;
  let testOpdrachtgever: any;
  let testZZPProfile: any;

  beforeAll(async () => {
    // Set up test data
    await setupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Reset any test-specific state
  });

  afterEach(async () => {
    // Clean up any test-specific data
  });

  async function setupTestData() {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        id: "test-user-bedrijf",
        email: "test@bedrijf.com",
        password: "hashedPassword123",
        name: "Test Bedrijf User",
        role: "BEDRIJF",
        emailVerified: new Date(),
      },
    });

    // Create bedrijf profile
    testBedrijfProfile = await prisma.bedrijfProfile.create({
      data: {
        userId: testUser.id,
        bedrijfsnaam: "Test Beveiligingsbedrijf BV",
        kvkNummer: "12345678",
        btwNummer: "NL123456789B01",
        teamSize: 1,
        extraAccounts: 0,
        subscriptionTier: "SMALL",
        subscriptionId: null,
        finqleCreditLimit: null,
        finqleDebtorId: null,
        ndNummer: null,
        ndNummerLaatsteControle: null,
        ndNummerManagers: null,
        ndNummerOpmerking: null,
        ndNummerStatus: "NIET_GEREGISTREERD",
        ndNummerVervalDatum: null,
      },
    });

    // Create test opdrachtgever
    const opdrachtgeverUser = await prisma.user.create({
      data: {
        id: "test-user-opdrachtgever",
        email: "test@opdrachtgever.com",
        password: "hashedPassword123",
        name: "Test Opdrachtgever",
        role: "OPDRACHTGEVER",
        emailVerified: new Date(),
      },
    });

    testOpdrachtgever = await prisma.opdrachtgever.create({
      data: {
        userId: opdrachtgeverUser.id,
        bedrijfsnaam: "Test Events BV",
        kvkNummer: "87654321",
        contactpersoon: "Marie de Wit",
        totalHoursBooked: 0,
        totalSpent: 0,
        finqleCreditLimit: null,
        finqleDebtorId: null,
      },
    });

    // Create test ZZP profile
    const zzpUser = await prisma.user.create({
      data: {
        id: "test-user-zzp",
        email: "test@zzp.com",
        password: "hashedPassword123",
        name: "Test ZZP Beveiliger",
        role: "ZZP_BEVEILIGER",
        emailVerified: new Date(),
      },
    });

    testZZPProfile = await prisma.zZPProfile.create({
      data: {
        userId: zzpUser.id,
        kvkNummer: "87654321",
        btwNummer: "NL987654321B01",
        specialisaties: ["SIA Diploma", "Evenementbeveiliging"],
        certificaten: [],
        werkgebied: ["Utrecht", "Amsterdam"],
        beschikbaarheid: {},
        uurtarief: 22.5,
        rating: null,
        totalReviews: 0,
        subscriptionId: null,
        trialEndsAt: null,
        finqleMerchantId: null,
        finqleOnboarded: false,
        ndNummer: null,
        ndNummerLaatsteControle: null,
        ndNummerOpmerking: null,
        ndNummerStatus: "NIET_GEREGISTREERD",
        ndNummerVervalDatum: null,
        voornaam: "Piet",
        achternaam: "Jansen",
      },
    });
  }

  async function cleanupTestData() {
    // Delete in correct order to respect foreign keys
    await prisma.opdrachtSollicitatie.deleteMany({
      where: {
        OR: [
          { zzpId: testZZPProfile?.id },
          { bedrijfId: testBedrijfProfile?.id },
        ],
      },
    });

    await prisma.opdracht.deleteMany({
      where: {
        OR: [
          { creatorBedrijfId: testBedrijfProfile?.id },
          { opdrachtgeverId: testOpdrachtgever?.id },
        ],
      },
    });

    await prisma.werkuur.deleteMany({
      where: { zzpId: testZZPProfile?.id },
    });

    await prisma.zZPProfile.deleteMany({
      where: { id: testZZPProfile?.id },
    });

    await prisma.bedrijfProfile.deleteMany({
      where: { id: testBedrijfProfile?.id },
    });

    await prisma.opdrachtgever.deleteMany({
      where: { id: testOpdrachtgever?.id },
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: ["test-user-bedrijf", "test-user-opdrachtgever", "test-user-zzp"],
        },
      },
    });
  }

  describe("Complete Bedrijf Workflow", () => {
    it("should complete full opdracht lifecycle as opdrachtgever", async () => {
      // 1. Create opdracht as bedrijf opdrachtgever
      const opdrachtData = {
        titel: "Integration Test Opdracht",
        omschrijving: "Test opdracht voor integratie tests",
        locatie: "Amsterdam",
        postcode: "1012AB",
        startDatum: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        eindDatum: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
        ), // +8 hours
        uurloon: 25.0,
        aantalPersonen: 2,
        vereisten: ["SIA Diploma"],
        targetAudience: "ALLEEN_ZZP",
        directZZPAllowed: true,
        creatorType: "BEDRIJF",
        creatorBedrijfId: testBedrijfProfile.id,
        status: "OPEN",
      };

      const createdOpdracht = await prisma.opdracht.create({
        data: opdrachtData,
        include: {
          creatorBedrijf: {
            select: { bedrijfsnaam: true },
          },
        },
      });

      expect(createdOpdracht).toBeDefined();
      expect(createdOpdracht.titel).toBe(opdrachtData.titel);
      expect(createdOpdracht.creatorBedrijfId).toBe(testBedrijfProfile.id);
      expect(createdOpdracht.status).toBe("OPEN");

      // 2. ZZP applies for the opdracht
      const sollicitatie = await prisma.opdrachtSollicitatie.create({
        data: {
          opdrachtId: createdOpdracht.id,
          sollicitantType: "ZZP_BEVEILIGER",
          zzpId: testZZPProfile.id,
          motivatie: "Ik ben geïnteresseerd in deze opdracht",
          status: "PENDING",
        },
        include: {
          zzp: {
            select: {
              voornaam: true,
              achternaam: true,
            },
          },
        },
      });

      expect(sollicitatie).toBeDefined();
      expect(sollicitatie.status).toBe("PENDING");
      expect(sollicitatie.zzpId).toBe(testZZPProfile.id);

      // 3. Bedrijf accepts the application (planning assignment)
      const acceptedSollicitatie = await prisma.opdrachtSollicitatie.update({
        where: { id: sollicitatie.id },
        data: {
          status: "ACCEPTED",
          beoordeeldOp: new Date(),
          beoordeeldDoor: testBedrijfProfile.userId,
        },
      });

      expect(acceptedSollicitatie.status).toBe("ACCEPTED");
      expect(acceptedSollicitatie.beoordeeldOp).toBeDefined();

      // 4. Update opdracht status to assigned
      const updatedOpdracht = await prisma.opdracht.update({
        where: { id: createdOpdracht.id },
        data: { status: "TOEGEWEZEN" },
      });

      expect(updatedOpdracht.status).toBe("TOEGEWEZEN");

      // 5. ZZP logs work hours
      const werkuren = await prisma.werkuur.create({
        data: {
          zzpId: testZZPProfile.id,
          opdrachtId: createdOpdracht.id,
          startTijd: new Date(),
          eindTijd: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours later
          startLocatie: { address: opdrachtData.locatie },
          eindLocatie: { address: opdrachtData.locatie },
          urenGewerkt: 8.0,
          uurtarief: opdrachtData.uurtarief,
          status: "APPROVED",
        },
      });

      expect(werkuren).toBeDefined();
      expect(werkuren.zzpId).toBe(testZZPProfile.id);
      expect(werkuren.status).toBe("APPROVED");

      // 6. Complete the opdracht
      const completedOpdracht = await prisma.opdracht.update({
        where: { id: createdOpdracht.id },
        data: { status: "AFGEROND" },
      });

      expect(completedOpdracht.status).toBe("AFGEROND");

      // 7. Create payment record for the work
      const betaling = await prisma.betaling.create({
        data: {
          bedrag: 200.0, // 8 hours * €25
          betalerId: testOpdrachtgever.id,
          betalerType: "OPDRACHTGEVER",
          ontvangerId: testZZPProfile.id,
          ontvangerType: "ZZP",
          type: "DIRECT_PAYMENT",
          status: "PENDING",
        },
      });

      expect(betaling).toBeDefined();
      expect(betaling.bedrag).toBe(200.0);
      expect(betaling.status).toBe("PENDING");
    });

    it("should complete planning workflow as leverancier", async () => {
      // 1. Create external opdracht (from opdrachtgever)
      const externalOpdracht = await prisma.opdracht.create({
        data: {
          titel: "External Client Opdracht",
          omschrijving: "Opdracht from external client",
          locatie: "Rotterdam",
          postcode: "3012AB",
          startDatum: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          eindDatum: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000,
          ),
          uurloon: 28.0,
          aantalPersonen: 3,
          vereisten: ["SIA Diploma", "Ervaring"],
          targetAudience: "ALLEEN_BEDRIJVEN",
          directZZPAllowed: false,
          creatorType: "OPDRACHTGEVER",
          opdrachtgeverId: testOpdrachtgever.id,
          status: "OPEN",
        },
      });

      // 2. Bedrijf accepts the opdracht as leverancier
      const acceptedOpdracht = await prisma.opdracht.update({
        where: { id: externalOpdracht.id },
        data: {
          acceptedBedrijfId: testBedrijfProfile.id,
          status: "TOEGEWEZEN",
        },
      });

      expect(acceptedOpdracht.acceptedBedrijfId).toBe(testBedrijfProfile.id);
      expect(acceptedOpdracht.status).toBe("TOEGEWEZEN");

      // 3. Assign ZZP to the opdracht (planning)
      const planningSollicitatie = await prisma.opdrachtSollicitatie.create({
        data: {
          opdrachtId: externalOpdracht.id,
          sollicitantType: "ZZP_BEVEILIGER",
          zzpId: testZZPProfile.id,
          bedrijfId: testBedrijfProfile.id, // Assigned by bedrijf
          motivatie: "Toegewezen door beveiligingsbedrijf",
          status: "ACCEPTED",
          beoordeeldOp: new Date(),
          beoordeeldDoor: testBedrijfProfile.userId,
        },
      });

      expect(planningSollicitatie.bedrijfId).toBe(testBedrijfProfile.id);
      expect(planningSollicitatie.status).toBe("ACCEPTED");

      // 4. Mark opdracht as in progress
      const inProgressOpdracht = await prisma.opdracht.update({
        where: { id: externalOpdracht.id },
        data: { status: "BEZIG" },
      });

      expect(inProgressOpdracht.status).toBe("BEZIG");
    });

    it("should handle client relationship management", async () => {
      // 1. Create multiple opdrachten for the same client
      const opdrachten = await Promise.all([
        prisma.opdracht.create({
          data: {
            titel: "Client Opdracht 1",
            omschrijving: "First opdracht for client",
            locatie: "Amsterdam",
            postcode: "1012AB",
            startDatum: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            eindDatum: new Date(
              Date.now() + 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
            ),
            uurloon: 22.0,
            aantalPersonen: 1,
            vereisten: [],
            targetAudience: "ALLEEN_BEDRIJVEN",
            directZZPAllowed: false,
            creatorType: "OPDRACHTGEVER",
            opdrachtgeverId: testOpdrachtgever.id,
            acceptedBedrijfId: testBedrijfProfile.id,
            status: "AFGEROND",
          },
        }),
        prisma.opdracht.create({
          data: {
            titel: "Client Opdracht 2",
            omschrijving: "Second opdracht for client",
            locatie: "Amsterdam",
            postcode: "1012AB",
            startDatum: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            eindDatum: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000,
            ),
            uurloon: 24.0,
            aantalPersonen: 2,
            vereisten: ["SIA Diploma"],
            targetAudience: "ALLEEN_BEDRIJVEN",
            directZZPAllowed: false,
            creatorType: "OPDRACHTGEVER",
            opdrachtgeverId: testOpdrachtgever.id,
            acceptedBedrijfId: testBedrijfProfile.id,
            status: "BEZIG",
          },
        }),
      ]);

      expect(opdrachten).toHaveLength(2);

      // 2. Query client relationship data
      const clientData = await prisma.opdrachtgever.findUnique({
        where: { id: testOpdrachtgever.id },
        include: {
          opdrachten: {
            where: {
              acceptedBedrijfId: testBedrijfProfile.id,
            },
            select: {
              id: true,
              titel: true,
              status: true,
              uurloon: true,
              aantalPersonen: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              opdrachten: {
                where: {
                  acceptedBedrijfId: testBedrijfProfile.id,
                },
              },
            },
          },
        },
      });

      expect(clientData).toBeDefined();
      expect(clientData?.opdrachten).toHaveLength(2);
      expect(clientData?._count.opdrachten).toBe(2);

      // 3. Calculate client statistics
      const totalRevenue = clientData?.opdrachten.reduce(
        (sum, opdracht) =>
          sum + Number(opdracht.uurloon) * opdracht.aantalPersonen * 8, // Assume 8 hours
        0,
      );

      expect(totalRevenue).toBe(22 * 1 * 8 + 24 * 2 * 8); // 176 + 384 = 560
    });

    it("should handle dashboard statistics aggregation", async () => {
      // Create test data for statistics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Create opdrachten in different states
      await Promise.all([
        // Current period opdrachten
        prisma.opdracht.create({
          data: {
            titel: "Stats Test 1",
            omschrijving: "For statistics testing",
            locatie: "Test Location",
            postcode: "1234AB",
            startDatum: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            eindDatum: new Date(
              now.getTime() + 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
            ),
            uurloon: 20.0,
            aantalPersonen: 1,
            vereisten: [],
            targetAudience: "ALLEEN_ZZP",
            directZZPAllowed: true,
            creatorType: "BEDRIJF",
            creatorBedrijfId: testBedrijfProfile.id,
            status: "OPEN",
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
        }),
        prisma.opdracht.create({
          data: {
            titel: "Stats Test 2",
            omschrijving: "For statistics testing",
            locatie: "Test Location",
            postcode: "5678CD",
            startDatum: new Date(now.getTime() + 48 * 60 * 60 * 1000),
            eindDatum: new Date(
              now.getTime() + 48 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000,
            ),
            uurloon: 25.0,
            aantalPersonen: 2,
            vereisten: ["SIA Diploma"],
            targetAudience: "ALLEEN_ZZP",
            directZZPAllowed: true,
            creatorType: "BEDRIJF",
            creatorBedrijfId: testBedrijfProfile.id,
            status: "TOEGEWEZEN",
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          },
        }),
      ]);

      // Query statistics
      const stats = await prisma.opdracht.aggregate({
        where: {
          creatorType: "BEDRIJF",
          creatorBedrijfId: testBedrijfProfile.id,
          createdAt: {
            gte: weekAgo,
          },
        },
        _count: { id: true },
        _sum: {
          uurloon: true,
          aantalPersonen: true,
        },
        _avg: { uurloon: true },
      });

      expect(stats._count.id).toBeGreaterThanOrEqual(2);
      expect(Number(stats._sum.uurloon)).toBe(45.0); // 20 + 25
      expect(stats._sum.aantalPersonen).toBe(3); // 1 + 2
      expect(Number(stats._avg.uurloon)).toBe(22.5); // (20 + 25) / 2

      // Query status breakdown
      const statusBreakdown = await prisma.opdracht.groupBy({
        by: ["status"],
        where: {
          creatorType: "BEDRIJF",
          creatorBedrijfId: testBedrijfProfile.id,
          createdAt: {
            gte: weekAgo,
          },
        },
        _count: { id: true },
      });

      expect(statusBreakdown).toHaveLength(2); // OPEN and TOEGEWEZEN
      expect(statusBreakdown.find((s) => s.status === "OPEN")?._count.id).toBe(
        1,
      );
      expect(
        statusBreakdown.find((s) => s.status === "TOEGEWEZEN")?._count.id,
      ).toBe(1);
    });

    it("should handle performance under load", async () => {
      const startTime = Date.now();

      // Create multiple opdrachten concurrently
      const opdrachtPromises = Array.from({ length: 20 }, (_, i) =>
        prisma.opdracht.create({
          data: {
            titel: `Load Test Opdracht ${i + 1}`,
            omschrijving: `Load test opdracht number ${i + 1}`,
            locatie: "Load Test Location",
            postcode: "1111AA",
            startDatum: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
            eindDatum: new Date(
              Date.now() + (i + 1) * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
            ),
            uurloon: 20.0 + i,
            aantalPersonen: (i % 3) + 1,
            vereisten: i % 2 === 0 ? ["SIA Diploma"] : [],
            targetAudience: "ALLEEN_ZZP",
            directZZPAllowed: true,
            creatorType: "BEDRIJF",
            creatorBedrijfId: testBedrijfProfile.id,
            status: "OPEN",
          },
        }),
      );

      const createdOpdrachten = await Promise.all(opdrachtPromises);
      const creationTime = Date.now() - startTime;

      expect(createdOpdrachten).toHaveLength(20);
      expect(creationTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Test querying performance
      const queryStartTime = Date.now();

      const queryResult = await prisma.opdracht.findMany({
        where: {
          creatorType: "BEDRIJF",
          creatorBedrijfId: testBedrijfProfile.id,
        },
        include: {
          _count: {
            select: {
              sollicitaties: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const queryTime = Date.now() - queryStartTime;

      expect(queryResult.length).toBeGreaterThanOrEqual(20);
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe("Error Scenarios", () => {
    it("should handle concurrent opdracht creation", async () => {
      const concurrentPromises = Array.from({ length: 5 }, () =>
        prisma.opdracht.create({
          data: {
            titel: "Concurrent Test",
            omschrijving: "Testing concurrent creation",
            locatie: "Concurrent Location",
            postcode: "2222BB",
            startDatum: new Date(Date.now() + 24 * 60 * 60 * 1000),
            eindDatum: new Date(
              Date.now() + 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
            ),
            uurloon: 23.0,
            aantalPersonen: 1,
            vereisten: [],
            targetAudience: "ALLEEN_ZZP",
            directZZPAllowed: true,
            creatorType: "BEDRIJF",
            creatorBedrijfId: testBedrijfProfile.id,
            status: "OPEN",
          },
        }),
      );

      const results = await Promise.all(concurrentPromises);
      expect(results).toHaveLength(5);
      expect(results.every((r) => r.id)).toBe(true);
    });

    it("should handle database constraint violations", async () => {
      // Test foreign key constraint
      try {
        await prisma.opdracht.create({
          data: {
            titel: "Invalid Opdracht",
            omschrijving: "Testing invalid foreign key",
            locatie: "Invalid Location",
            postcode: "3333CC",
            startDatum: new Date(Date.now() + 24 * 60 * 60 * 1000),
            eindDatum: new Date(
              Date.now() + 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
            ),
            uurloon: 20.0,
            aantalPersonen: 1,
            vereisten: [],
            targetAudience: "ALLEEN_ZZP",
            directZZPAllowed: true,
            creatorType: "BEDRIJF",
            creatorBedrijfId: "invalid-bedrijf-id", // Invalid foreign key
            status: "OPEN",
          },
        });

        // Should not reach this point
        expect(false).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
        // Should be a foreign key constraint error
      }
    });

    it("should handle transaction rollbacks", async () => {
      const initialCount = await prisma.opdracht.count({
        where: { creatorBedrijfId: testBedrijfProfile.id },
      });

      try {
        await prisma.$transaction(async (tx) => {
          // Create opdracht
          await tx.opdracht.create({
            data: {
              titel: "Transaction Test",
              omschrijving: "Testing transaction rollback",
              locatie: "Transaction Location",
              postcode: "4444DD",
              startDatum: new Date(Date.now() + 24 * 60 * 60 * 1000),
              eindDatum: new Date(
                Date.now() + 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
              ),
              uurloon: 21.0,
              aantalPersonen: 1,
              vereisten: [],
              targetAudience: "ALLEEN_ZZP",
              directZZPAllowed: true,
              creatorType: "BEDRIJF",
              creatorBedrijfId: testBedrijfProfile.id,
              status: "OPEN",
            },
          });

          // Force error to trigger rollback
          throw new Error("Intentional error for rollback test");
        });

        // Should not reach this point
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toBe("Intentional error for rollback test");
      }

      // Verify rollback occurred
      const finalCount = await prisma.opdracht.count({
        where: { creatorBedrijfId: testBedrijfProfile.id },
      });

      expect(finalCount).toBe(initialCount); // Count should be unchanged
    });
  });
});
