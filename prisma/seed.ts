/**
 * Database Seed Script
 *
 * Populates the database with sample data using the new schema structure
 *
 * Usage: npx prisma db seed
 */

import {
  AccountStatus,
  CreatorType,
  NDNummerStatus,
  OpdrachtStatus,
  PrismaClient,
  SubscriptionTier,
  TargetAudience,
  UserRole,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.opdrachtSollicitatie.deleteMany();
  await prisma.werkuur.deleteMany();
  await prisma.opdracht.deleteMany();
  await prisma.zZPProfile.deleteMany();
  await prisma.bedrijfProfile.deleteMany();
  await prisma.opdrachtgever.deleteMany();
  await prisma.user.deleteMany();

  // Create Users with new fields
  console.log("👥 Creating users...");

  // ZZP User
  const zzpUser = await prisma.user.create({
    data: {
      email: "jan.jansen@example.com",
      password: await hash("Password123!", 12),
      name: "Jan Jansen",
      phone: "+31612345678",
      role: UserRole.ZZP_BEVEILIGER,
      status: AccountStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  // Bedrijf User
  const bedrijfUser = await prisma.user.create({
    data: {
      email: "info@secureguard.nl",
      password: await hash("Password123!", 12),
      name: "SecureGuard BV",
      phone: "+31620234567",
      role: UserRole.BEDRIJF,
      status: AccountStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  // Opdrachtgever User
  const opdrachtgeverUser = await prisma.user.create({
    data: {
      email: "events@festival.nl",
      password: await hash("Password123!", 12),
      name: "Festival Organisatie",
      phone: "+31630345678",
      role: UserRole.OPDRACHTGEVER,
      status: AccountStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  // Create ZZP Profile with all required fields
  console.log("👤 Creating ZZP profile...");
  const zzpProfile = await prisma.zZPProfile.create({
    data: {
      userId: zzpUser.id,
      voornaam: "Jan",
      achternaam: "Jansen",
      kvkNummer: "12345678",
      btwNummer: "NL123456789B01",
      specialisaties: ["Evenementen", "Objectbeveiliging", "Horeca"],
      certificaten: ["BOA", "BHV", "EHBO"],
      werkgebied: ["Amsterdam", "Utrecht", "Rotterdam"],
      uurtarief: 27.5,
      ndNummer: "ND123456",
      ndNummerVervalDatum: new Date("2029-01-15"),
      ndNummerStatus: NDNummerStatus.ACTIEF,
      beschikbaarheid: {
        maandag: { beschikbaar: true, van: "08:00", tot: "20:00" },
        dinsdag: { beschikbaar: true, van: "08:00", tot: "20:00" },
        woensdag: { beschikbaar: true, van: "08:00", tot: "20:00" },
        donderdag: { beschikbaar: true, van: "08:00", tot: "20:00" },
        vrijdag: { beschikbaar: true, van: "08:00", tot: "22:00" },
        zaterdag: { beschikbaar: true, van: "10:00", tot: "23:00" },
        zondag: { beschikbaar: false },
      },
      rating: 4.8,
      totalReviews: 45,
      finqleMerchantId: "merchant-zzp-001",
      finqleOnboarded: true,
    },
  });

  // Note: Certificates are stored as string array in ZZPProfile.certificaten
  // Documents are handled by DocumentVerificatie model
  console.log("✅ Certificate data already created in ZZP profile");

  // Create Bedrijf Profile
  console.log("🏢 Creating bedrijf profile...");
  const bedrijfProfile = await prisma.bedrijfProfile.create({
    data: {
      userId: bedrijfUser.id,
      bedrijfsnaam: "SecureGuard BV",
      kvkNummer: "87654321",
      btwNummer: "NL987654321B01",
      teamSize: 25,
      extraAccounts: 3,
      ndNummer: "ND789012",
      ndNummerVervalDatum: new Date("2028-06-01"),
      ndNummerStatus: NDNummerStatus.ACTIEF,
      ndNummerManagers: {
        managers: [
          {
            naam: "Peter de Vries",
            functie: "Directeur",
            ndNummer: "ND789012-01",
          },
          {
            naam: "Maria van der Berg",
            functie: "Operationeel Manager",
            ndNummer: "ND789012-02",
          },
        ],
      },
      subscriptionTier: SubscriptionTier.MEDIUM,
      finqleDebtorId: "debtor-bedrijf-001",
      finqleCreditLimit: 50000,
    },
  });

  // Create Opdrachtgever
  console.log("🏭 Creating opdrachtgever...");
  const opdrachtgever = await prisma.opdrachtgever.create({
    data: {
      userId: opdrachtgeverUser.id,
      bedrijfsnaam: "Festival Organisatie BV",
      kvkNummer: "98765432",
      contactpersoon: "Emma de Boer",
      totalHoursBooked: 0,
      totalSpent: 0,
      finqleDebtorId: "debtor-opdracht-001",
      finqleCreditLimit: 25000,
    },
  });

  // Create Opdrachten with new location structure
  console.log("📋 Creating opdrachten...");

  const opdracht1 = await prisma.opdracht.create({
    data: {
      titel: "Zomerfestival 2024 - Hoofdpodium Beveiliging",
      beschrijving:
        "Beveiliging hoofdpodium tijdens driedaags zomerfestival. Crowd control, artiestenbegeleiding en VIP-beveiliging vereist.",
      locatie: "Festivalterrein Zuiderpark, 1234AB Amsterdam",
      startDatum: new Date("2024-07-05T08:00:00"),
      eindDatum: new Date("2024-07-07T23:00:00"),
      aantalBeveiligers: 12,
      uurtarief: 32.5,
      vereisten: ["BOA", "Evenementbeveiliging", "Crowd Control"],
      type: "Evenement",
      isUrgent: false,
      status: OpdrachtStatus.OPEN,
      creatorType: CreatorType.OPDRACHTGEVER,
      creatorId: opdrachtgever.id,
      opdrachtgeverId: opdrachtgever.id,
      targetAudience: TargetAudience.BEIDEN,
      directZZPAllowed: true,
    },
  });

  // Note: Location info is stored in the locatie field as a string

  const opdracht2 = await prisma.opdracht.create({
    data: {
      titel: "Bouwplaats Beveiliging - Nieuwbouwproject Noord",
      beschrijving:
        "Nachtbeveiliging voor grote bouwplaats. Toegangscontrole, rondes lopen en cameratoezicht.",
      locatie: "Bouwlocatie Noord 1, 5678EF Rotterdam",
      startDatum: new Date("2024-06-01T22:00:00"),
      eindDatum: new Date("2024-08-31T06:00:00"),
      aantalBeveiligers: 2,
      uurtarief: 28.0,
      vereisten: ["Objectbeveiliging", "VCA Basis"],
      type: "Object",
      isUrgent: true,
      status: OpdrachtStatus.URGENT,
      creatorType: CreatorType.BEDRIJF,
      creatorId: bedrijfProfile.id,
      creatorBedrijfId: bedrijfProfile.id,
      targetAudience: TargetAudience.ALLEEN_ZZP,
      directZZPAllowed: true,
    },
  });

  // Note: Location info is stored in the locatie field as a string

  // Create Sollicitaties
  console.log("📝 Creating sollicitaties...");
  await prisma.opdrachtSollicitatie.create({
    data: {
      opdrachtId: opdracht1.id,
      sollicitantType: "ZZP_BEVEILIGER",
      zzpId: zzpProfile.id,
      status: "PENDING",
      motivatie:
        "Ruime ervaring met festivalbeveiliging. BOA gecertificeerd en bekend met crowd control.",
      voorgesteldTarief: 30.0,
      sollicitatiedatum: new Date("2024-05-15"),
    },
  });

  await prisma.opdrachtSollicitatie.create({
    data: {
      opdrachtId: opdracht2.id,
      sollicitantType: "ZZP_BEVEILIGER",
      zzpId: zzpProfile.id,
      status: "ACCEPTED",
      motivatie: "Ervaren in objectbeveiliging en VCA gecertificeerd.",
      voorgesteldTarief: 28.0,
      sollicitatiedatum: new Date("2024-05-20"),
      beoordeeldOp: new Date("2024-05-21"),
    },
  });

  console.log("✅ Database seed completed successfully!");

  // Summary
  console.log("\n📊 Summary:");
  console.log("- 3 Users created (ZZP, Bedrijf, Opdrachtgever)");
  console.log("- 1 ZZP Profile with certificates as string array");
  console.log("- 1 Bedrijf Profile");
  console.log("- 1 Opdrachtgever");
  console.log("- 2 Opdrachten with location strings");
  console.log("- 2 Sollicitaties");

  console.log("\n🔑 Test credentials:");
  console.log("ZZP: jan.jansen@example.com / Password123!");
  console.log("Bedrijf: info@secureguard.nl / Password123!");
  console.log("Opdrachtgever: events@festival.nl / Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
