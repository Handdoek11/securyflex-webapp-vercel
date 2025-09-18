/**
 * Database Seed Script
 *
 * Populates the database with sample data using the new schema structure
 *
 * Usage: npx prisma db seed
 */

import {
  AccountStatus,
  CertificateStatus,
  CreatorType,
  DocumentStatus,
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
  await prisma.certificate.deleteMany();
  await prisma.document.deleteMany();
  await prisma.opdrachtLocatie.deleteMany();
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
      finqleId: "finqle-zzp-001",
      finqleKYCStatus: "VERIFIED",
      finqleVerified: true,
      finqleVerifiedAt: new Date("2024-01-15"),
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
      finqleId: "finqle-bedrijf-001",
      finqleKYCStatus: "VERIFIED",
      finqleVerified: true,
      finqleVerifiedAt: new Date("2024-01-10"),
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

  // Create ZZP Profile with all new fields
  console.log("👤 Creating ZZP profile...");
  const zzpProfile = await prisma.zZPProfile.create({
    data: {
      userId: zzpUser.id,
      voornaam: "Jan",
      achternaam: "Jansen",
      geboortedatum: new Date("1985-03-15"),
      kvkNummer: "12345678",
      btwNummer: "NL123456789B01",
      specialisaties: ["Evenementen", "Objectbeveiliging", "Horeca"],
      certificatenLegacy: ["BOA", "BHV", "EHBO"], // Will be migrated to Certificate model
      werkgebied: ["Amsterdam", "Utrecht", "Rotterdam"],
      uurtarief: 27.5,
      adres: "Hoofdstraat 123",
      postcode: "1234AB",
      plaats: "Amsterdam",
      rijbewijs: true,
      autoDescikbaar: true,
      ervaring: 8,
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
      finqleAccountId: "account-zzp-001",
      finqleVerified: true,
    },
  });

  // Create Certificates for ZZP
  console.log("📜 Creating certificates...");
  await prisma.certificate.createMany({
    data: [
      {
        zzpId: zzpProfile.id,
        naam: "BOA Certificaat",
        uitgever: "Nederlandse Politie",
        certificaatNummer: "BOA-2024-001",
        uitgifteDatum: new Date("2024-01-01"),
        verloopdatum: new Date("2029-01-01"),
        beschrijving: "Buitengewoon Opsporingsambtenaar certificaat",
        status: CertificateStatus.APPROVED,
        isVerified: true,
        verifiedAt: new Date("2024-01-05"),
      },
      {
        zzpId: zzpProfile.id,
        naam: "BHV Certificaat",
        uitgever: "NIBHV",
        certificaatNummer: "BHV-2023-456",
        uitgifteDatum: new Date("2023-06-15"),
        verloopdatum: new Date("2025-06-15"),
        beschrijving: "Bedrijfshulpverlening certificaat",
        status: CertificateStatus.APPROVED,
        isVerified: true,
        verifiedAt: new Date("2023-06-20"),
      },
    ],
  });

  // Create Documents for ZZP
  console.log("📄 Creating documents...");
  await prisma.document.createMany({
    data: [
      {
        zzpId: zzpProfile.id,
        titel: "VOG Verklaring",
        documentType: "VOG_P_CERTIFICAAT",
        fileName: "vog-jan-jansen-2024.pdf",
        originalFileName: "VOG_Verklaring.pdf",
        fileUrl: "/uploads/documents/vog-jan-jansen-2024.pdf",
        fileSize: 524288,
        mimeType: "application/pdf",
        status: DocumentStatus.APPROVED,
        uploadedAt: new Date("2024-01-10"),
      },
      {
        zzpId: zzpProfile.id,
        titel: "Identiteitsbewijs",
        documentType: "IDENTITEITSBEWIJS",
        fileName: "id-jan-jansen.pdf",
        originalFileName: "Paspoort_scan.pdf",
        fileUrl: "/uploads/documents/id-jan-jansen.pdf",
        fileSize: 1048576,
        mimeType: "application/pdf",
        status: DocumentStatus.APPROVED,
        uploadedAt: new Date("2024-01-08"),
      },
    ],
  });

  // Create Bedrijf Profile with all new fields
  console.log("🏢 Creating bedrijf profile...");
  const bedrijfProfile = await prisma.bedrijfProfile.create({
    data: {
      userId: bedrijfUser.id,
      bedrijfsnaam: "SecureGuard BV",
      kvkNummer: "87654321",
      btwNummer: "NL987654321B01",
      adres: "Industrieweg 456",
      postcode: "5678CD",
      plaats: "Rotterdam",
      website: "https://secureguard.nl",
      beschrijving:
        "Professionele beveiligingsdiensten voor evenementen, bouw en horeca",
      werkgebied: ["Zuid-Holland", "Noord-Holland", "Utrecht"],
      specialisaties: [
        "Evenementen",
        "Bouwbeveiliging",
        "Horecabeveiliging",
        "Objectbeveiliging",
      ],
      aantalMedewerkers: 25,
      oprichtingsjaar: 2015,
      certificeringen: ["ISO 9001:2015", "VCA**", "Keurmerk Beveiliging"],
      bedrijfsstructuur: "BV",
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
      startDatum: new Date("2024-07-05T08:00:00"),
      eindDatum: new Date("2024-07-07T23:00:00"),
      aantalBeveiligers: 12, // New field name
      uurtarief: 32.5, // New field name
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

  // Create OpdrachtLocatie
  await prisma.opdrachtLocatie.create({
    data: {
      opdrachtId: opdracht1.id,
      adres: "Festivalterrein Zuiderpark",
      postcode: "1234AB",
      plaats: "Amsterdam",
      lat: 52.370216,
      lng: 4.895168,
      reisafstand: 15,
      parkeerinfo: "Gratis parkeren voor beveiligers op P2",
      openbaarvervoer: {
        trein: "Station Amsterdam Zuid (10 min lopen)",
        bus: "Lijn 65 en 142, halte Zuiderpark",
        metro: "Metro 50, halte Henk Sneevlietweg",
      },
    },
  });

  const opdracht2 = await prisma.opdracht.create({
    data: {
      titel: "Bouwplaats Beveiliging - Nieuwbouwproject Noord",
      beschrijving:
        "Nachtbeveiliging voor grote bouwplaats. Toegangscontrole, rondes lopen en cameratoezicht.",
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

  // Create OpdrachtLocatie for second opdracht
  await prisma.opdrachtLocatie.create({
    data: {
      opdrachtId: opdracht2.id,
      adres: "Bouwlocatie Noord 1",
      postcode: "5678EF",
      plaats: "Rotterdam",
      lat: 51.92442,
      lng: 4.477733,
      reisafstand: 8,
      parkeerinfo: "Parkeren op bouwterrein mogelijk",
    },
  });

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
  console.log("- 1 ZZP Profile with all new fields");
  console.log("- 2 Certificates");
  console.log("- 2 Documents");
  console.log("- 1 Bedrijf Profile with all new fields");
  console.log("- 1 Opdrachtgever");
  console.log("- 2 Opdrachten with OpdrachtLocatie");
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
