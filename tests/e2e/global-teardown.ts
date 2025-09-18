import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

/**
 * Global teardown for Playwright E2E tests
 *
 * Cleans up test data and temporary files
 */

const prisma = new PrismaClient();

async function globalTeardown() {
  console.log("🧹 Starting E2E test global teardown...");

  try {
    // Clean test database
    await cleanTestDatabase();

    // Clean temporary authentication files
    await cleanAuthFiles();

    // Clean test artifacts
    await cleanTestArtifacts();

    console.log("✅ E2E test global teardown completed");
  } catch (error) {
    console.error("❌ Error during global teardown:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanTestDatabase() {
  console.log("🗄️ Cleaning test database...");

  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.werkuren.deleteMany({
      where: {
        zzpProfile: {
          user: {
            email: {
              contains: "e2e-test",
            },
          },
        },
      },
    });

    await prisma.betalingsAanvraag.deleteMany({
      where: {
        zzpProfile: {
          user: {
            email: {
              contains: "e2e-test",
            },
          },
        },
      },
    });

    await prisma.sollicitatie.deleteMany({
      where: {
        zzpProfile: {
          user: {
            email: {
              contains: "e2e-test",
            },
          },
        },
      },
    });

    await prisma.opdracht.deleteMany({
      where: {
        OR: [
          {
            opdrachtgever: {
              user: {
                email: {
                  contains: "test",
                },
              },
            },
          },
          {
            creatorBedrijf: {
              user: {
                email: {
                  contains: "test",
                },
              },
            },
          },
        ],
      },
    });

    await prisma.zZPProfile.deleteMany({
      where: {
        user: {
          email: {
            contains: "e2e-test",
          },
        },
      },
    });

    await prisma.bedrijfProfile.deleteMany({
      where: {
        user: {
          email: {
            contains: "test",
          },
        },
      },
    });

    await prisma.opdrachtgever.deleteMany({
      where: {
        user: {
          email: {
            contains: "test",
          },
        },
      },
    });

    await prisma.session.deleteMany({
      where: {
        user: {
          email: {
            contains: "test",
          },
        },
      },
    });

    await prisma.account.deleteMany({
      where: {
        user: {
          email: {
            contains: "test",
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "test",
        },
      },
    });

    console.log("✅ Test database cleaned");
  } catch (error) {
    console.error("❌ Error cleaning test database:", error);
  }
}

async function cleanAuthFiles() {
  console.log("🔐 Cleaning authentication files...");

  const authDir = join(process.cwd(), "tests/e2e/auth");
  const authFiles = [
    "zzp-auth.json",
    "bedrijf-auth.json",
    "opdrachtgever-auth.json",
  ];

  authFiles.forEach((file) => {
    const filePath = join(authDir, file);
    if (existsSync(filePath)) {
      try {
        rmSync(filePath);
        console.log(`✅ Removed auth file: ${file}`);
      } catch (error) {
        console.warn(`⚠️ Could not remove auth file ${file}:`, error);
      }
    }
  });
}

async function cleanTestArtifacts() {
  console.log("🗂️ Cleaning test artifacts...");

  const artifactDirs = ["test-results", "playwright-report", "coverage"];

  artifactDirs.forEach((dir) => {
    const dirPath = join(process.cwd(), dir);
    if (existsSync(dirPath)) {
      try {
        rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Removed artifact directory: ${dir}`);
      } catch (error) {
        console.warn(`⚠️ Could not remove directory ${dir}:`, error);
      }
    }
  });

  // Clean specific test files
  const testFiles = [
    "backup-scheduler.json", // Backup scheduler state
    ".next/cache", // Next.js cache
  ];

  testFiles.forEach((file) => {
    const filePath = join(process.cwd(), file);
    if (existsSync(filePath)) {
      try {
        rmSync(filePath, { recursive: true, force: true });
        console.log(`✅ Removed test file: ${file}`);
      } catch (error) {
        console.warn(`⚠️ Could not remove file ${file}:`, error);
      }
    }
  });
}

export default globalTeardown;
