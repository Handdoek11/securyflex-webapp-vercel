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
    // Get all Opdrachten with old location string format
    const opdrachten = (await prisma.$queryRaw`
      SELECT id, locatie
      FROM "Opdracht"
      WHERE locatie IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "OpdrachtLocatie"
        WHERE "opdrachtId" = "Opdracht".id
      )
    `) as { id: string; locatie: string }[];

    console.log(`Found ${opdrachten.length} opdrachten to migrate`);

    for (const opdracht of opdrachten) {
      try {
        // Parse location string (expecting format: "Street, PostalCode City")
        const locationParts = opdracht.locatie
          .split(",")
          .map((s: string) => s.trim());

        const adres = locationParts[0] || "Onbekend";
        const postcodeAndCity = locationParts[1] || "";

        // Extract postcode and city from second part
        const postcodeMatch = postcodeAndCity.match(/(\d{4}\s?[A-Z]{2})/i);
        const postcode = postcodeMatch ? postcodeMatch[1] : "1000AA";
        const plaats =
          postcodeAndCity.replace(postcodeMatch?.[0] || "", "").trim() ||
          "Onbekend";

        // Create new OpdrachtLocatie record
        await prisma.opdrachtLocatie.create({
          data: {
            opdrachtId: opdracht.id,
            adres,
            postcode,
            plaats,
          },
        });

        console.log(`✅ Migrated location for opdracht ${opdracht.id}`);
      } catch (error) {
        console.error(
          `❌ Failed to migrate location for opdracht ${opdracht.id}:`,
          error,
        );
      }
    }

    console.log("✅ Location migration completed");
  } catch (error) {
    console.error("❌ Location migration failed:", error);
    throw error;
  }
}

async function migrateCertificateData() {
  console.log("🔄 Starting certificate data migration...");

  try {
    // Get all ZZPProfiles with legacy certificate strings
    const profiles = await prisma.zZPProfile.findMany({
      where: {
        certificatenLegacy: {
          isEmpty: false,
        },
      },
      select: {
        id: true,
        certificatenLegacy: true,
      },
    });

    console.log(`Found ${profiles.length} profiles with legacy certificates`);

    for (const profile of profiles) {
      for (const certName of profile.certificatenLegacy || []) {
        try {
          // Create Certificate record for each legacy string
          await prisma.certificate.create({
            data: {
              zzpId: profile.id,
              naam: certName,
              uitgever: "Onbekend", // Will need manual update
              status: "PENDING",
              beschrijving: "Gemigreerd uit legacy systeem",
            },
          });

          console.log(
            `✅ Created certificate "${certName}" for profile ${profile.id}`,
          );
        } catch (error) {
          console.error(
            `❌ Failed to create certificate for profile ${profile.id}:`,
            error,
          );
        }
      }
    }

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
    // Update ZZPProfiles with missing new required fields
    await prisma.zZPProfile.updateMany({
      where: {
        voornaam: null,
      },
      data: {
        voornaam: "Onbekend",
        achternaam: "Onbekend",
      },
    });

    // Update BedrijfProfiles with missing arrays
    await prisma.$executeRaw`
      UPDATE "BedrijfProfile"
      SET
        werkgebied = ARRAY[]::text[],
        specialisaties = ARRAY[]::text[],
        certificeringen = ARRAY[]::text[]
      WHERE
        werkgebied IS NULL
        OR specialisaties IS NULL
        OR certificeringen IS NULL
    `;

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
