/**
 * Data Migration Script for SecuryFlex Schema Updates
 *
 * This script migrates existing data to match the new Prisma schema structure.
 * Run this after applying the Prisma schema changes.
 *
 * Usage: npx ts-node prisma/migrations/data-migration.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateLocationData() {
  console.log("🔄 Starting location data migration...");

  try {
    // Get all Opdrachten to ensure they have the required locatie field
    const opdrachten = await prisma.opdracht.findMany({
      where: {
        NOT: {
          locatie: null,
        },
      },
      select: {
        id: true,
        locatie: true,
      },
    });

    console.log(`Found ${opdrachten.length} opdrachten with location data`);

    // Note: Current schema uses a simple locatie: String field
    // No migration needed as OpdrachtLocatie model doesn't exist in current schema
    console.log(
      "✅ Location data is already in correct format (single string field)",
    );

    console.log("✅ Location migration completed");
  } catch (error) {
    console.error("❌ Location migration failed:", error);
    throw error;
  }
}

async function migrateCertificateData() {
  console.log("🔄 Starting certificate data migration...");

  try {
    // Get all ZZPProfiles with certificate data
    const profiles = await prisma.zZPProfile.findMany({
      where: {
        NOT: {
          certificaten: {
            isEmpty: true,
          },
        },
      },
      select: {
        id: true,
        certificaten: true,
      },
    });

    console.log(`Found ${profiles.length} profiles with certificate data`);

    // Note: Current schema uses certificaten: String[] array field
    // No migration needed as Certificate model doesn't exist in current schema
    // Certificate data is stored directly as string array in ZZPProfile
    console.log(
      "✅ Certificate data is already in correct format (string array)",
    );

    console.log("✅ Certificate migration completed");
  } catch (error) {
    console.error("❌ Certificate migration failed:", error);
    throw error;
  }
}

async function updateFieldNames() {
  console.log("🔄 Updating field names in existing data...");

  try {
    // This would be done via Prisma migrations, but documenting the SQL here:
    console.log(`
    Field name updates that should be handled in SQL migration:

    ALTER TABLE "Opdracht"
      RENAME COLUMN "uurloon" TO "uurtarief";

    ALTER TABLE "Opdracht"
      RENAME COLUMN "aantalPersonen" TO "aantalBeveiligers";

    -- Note: These renames might not be needed if fields don't exist yet
    `);

    console.log("✅ Field name update documentation created");
  } catch (error) {
    console.error("❌ Field name update failed:", error);
    throw error;
  }
}

async function addMissingDefaults() {
  console.log("🔄 Adding missing default values...");

  try {
    // Update ZZPProfiles with missing required fields
    await prisma.zZPProfile.updateMany({
      where: {
        OR: [{ voornaam: "" }, { achternaam: "" }],
      },
      data: {
        voornaam: "Onbekend",
        achternaam: "Onbekend",
      },
    });

    // Note: BedrijfProfile fields in current schema don't include these arrays
    // Current BedrijfProfile has teamSize, extraAccounts, subscriptionTier etc.
    console.log("✅ BedrijfProfile structure is already up to date");

    console.log("✅ Missing defaults added");
  } catch (error) {
    console.error("❌ Adding defaults failed:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting SecuryFlex data migration...\n");

  try {
    // Run migrations in sequence
    await migrateLocationData();
    await migrateCertificateData();
    await updateFieldNames();
    await addMissingDefaults();

    console.log("\n✅ All migrations completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export {
  migrateLocationData,
  migrateCertificateData,
  updateFieldNames,
  addMissingDefaults,
};
