import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedVerzekeringen() {
  console.log("🌱 Seeding verzekeringen data...");

  try {
    // Clean existing data
    await prisma.verzekeringAanvraag.deleteMany();
    await prisma.verzekeringProductKorting.deleteMany();
    await prisma.verzekeringKorting.deleteMany();
    await prisma.verzekeringProduct.deleteMany();
    await prisma.verzekeringCategorie.deleteMany();

    // Create categories
    const zakelijkCat = await prisma.verzekeringCategorie.create({
      data: {
        naam: "Zakelijke verzekeringen",
        beschrijving:
          "Bescherm je onderneming met de juiste zakelijke verzekeringen",
        sortOrder: 1,
        isActief: true,
      },
    });

    const particulierCat = await prisma.verzekeringCategorie.create({
      data: {
        naam: "Particuliere verzekeringen",
        beschrijving: "Voor jou en je gezin, met aantrekkelijke kortingen",
        sortOrder: 2,
        isActief: true,
      },
    });

    const pensioenCat = await prisma.verzekeringCategorie.create({
      data: {
        naam: "Pensioen & Inkomen",
        beschrijving: "Bouw aan je toekomst met fiscaal voordelige regelingen",
        sortOrder: 3,
        isActief: true,
      },
    });

    console.log("✅ Categories created");

    // Create products - Zakelijk
    const avbProduct = await prisma.verzekeringProduct.create({
      data: {
        naam: "Beroepsaansprakelijkheid (AVB)",
        beschrijving:
          "De beroepsaansprakelijkheidsverzekering dekt schade die je tijdens je werkzaamheden als beveiliger veroorzaakt aan derden. Essentieel voor iedere beveiliger.",
        korteBeschrijving: "Verplichte verzekering voor beveiligers",
        categorieId: zakelijkCat.id,
        verzekeraar: "Schouten Zekerheid",
        verzekeraarLogo: "/logos/schouten-zekerheid.png",
        basispremie: 42.5,
        kortingPercentage: 15,
        vereisteBasisdata: {
          fields: [
            { name: "kvkNummer", label: "KvK Nummer", required: true },
            { name: "startDatum", label: "Ingangsdatum", required: true },
            { name: "ervaring", label: "Jaren ervaring", required: true },
          ],
        },
        productFeatures: [
          "Dekking tot €2.500.000 per aanspraak",
          "Inclusief rechtsbijstand",
          "Werelddekking (excl. USA/Canada)",
          "Geen eigen risico",
          "24/7 schademeldservice",
        ],
        externalProductId: "SCH-AVB-001",
        isActief: true,
        isFeatured: true,
        sortOrder: 1,
      },
    });

    const bedrijfsautoProduct = await prisma.verzekeringProduct.create({
      data: {
        naam: "Bedrijfsauto verzekering",
        beschrijving:
          "All-risk dekking voor je bedrijfsauto met uitgebreide dekking en pechhulp in heel Europa.",
        korteBeschrijving: "Voor je bedrijfsvoertuig",
        categorieId: zakelijkCat.id,
        verzekeraar: "Veko Adviesgroep",
        basispremie: 89.0,
        kortingPercentage: 10,
        vereisteBasisdata: {
          fields: [
            { name: "kenteken", label: "Kenteken", required: true },
            { name: "bouwjaar", label: "Bouwjaar", required: true },
          ],
        },
        productFeatures: [
          "All-risk dekking",
          "Gratis vervangend vervoer",
          "No-claim beschermer",
          "Pechhulp Europa",
        ],
        isActief: true,
        isFeatured: false,
        sortOrder: 2,
      },
    });

    const aovProduct = await prisma.verzekeringProduct.create({
      data: {
        naam: "Arbeidsongeschiktheid (AOV)",
        beschrijving:
          "Verzekerd inkomen bij arbeidsongeschiktheid door ziekte of ongeval. Essentieel voor ZZP'ers.",
        korteBeschrijving: "Inkomen bij ziekte of ongeval",
        categorieId: zakelijkCat.id,
        verzekeraar: "Schouten Zekerheid",
        basispremie: 125.0,
        kortingPercentage: 20,
        vereisteBasisdata: {
          fields: [
            { name: "geboortedatum", label: "Geboortedatum", required: true },
            { name: "inkomen", label: "Jaarinkomen", required: true },
          ],
        },
        productFeatures: [
          "80% inkomensdekking",
          "Kortere wachttijd (30 dagen)",
          "Premievrijstelling bij AO",
          "Re-integratie ondersteuning",
        ],
        isActief: true,
        isFeatured: true,
        sortOrder: 3,
      },
    });

    // Create products - Particulier
    const autoProduct = await prisma.verzekeringProduct.create({
      data: {
        naam: "Autoverzekering Privé",
        beschrijving:
          "Scherpe premie voor je persoonlijke auto met uitgebreide dekking.",
        korteBeschrijving: "Voor je privé auto",
        categorieId: particulierCat.id,
        verzekeraar: "Veko Adviesgroep",
        basispremie: 45.0,
        kortingPercentage: 8,
        vereisteBasisdata: {
          fields: [
            { name: "kenteken", label: "Kenteken", required: true },
            { name: "geboortedatum", label: "Geboortedatum", required: true },
          ],
        },
        productFeatures: [
          "WA + Casco dekking",
          "No-claim korting behoud",
          "Gratis pechhulp",
          "Ruitschade zonder eigen risico",
        ],
        isActief: true,
        isFeatured: false,
        sortOrder: 1,
      },
    });

    const aansprakelijkheidProduct = await prisma.verzekeringProduct.create({
      data: {
        naam: "Aansprakelijkheid Particulier",
        beschrijving:
          "Dekt schade die je per ongeluk aan anderen toebrengt. Onmisbaar voor ieder huishouden.",
        korteBeschrijving: "Bij schade aan anderen",
        categorieId: particulierCat.id,
        verzekeraar: "Veko Adviesgroep",
        basispremie: 5.95,
        kortingPercentage: 15,
        vereisteBasisdata: {
          fields: [
            {
              name: "gezinssamenstelling",
              label: "Gezinssamenstelling",
              required: true,
            },
          ],
        },
        productFeatures: [
          "Gezinsdekking",
          "Werelddekking",
          "Oppas dekking",
          "Sport & hobby dekking",
        ],
        isActief: true,
        isFeatured: true,
        sortOrder: 2,
      },
    });

    // Create products - Pensioen
    const pensioenProduct = await prisma.verzekeringProduct.create({
      data: {
        naam: "Pensioenregeling ZZP",
        beschrijving:
          "Flexibele pensioenopbouw met fiscale voordelen. Speciaal voor ZZP'ers in de beveiliging.",
        korteBeschrijving: "Bouw pensioen op met belastingvoordeel",
        categorieId: pensioenCat.id,
        verzekeraar: "Brand New Day",
        basispremie: 150.0,
        kortingPercentage: 0, // Special promo instead
        vereisteBasisdata: {
          fields: [
            { name: "geboortedatum", label: "Geboortedatum", required: true },
            {
              name: "gewenstInleg",
              label: "Maandelijkse inleg",
              required: true,
            },
          ],
        },
        productFeatures: [
          "Fiscaal aftrekbaar",
          "Flexibele inleg",
          "Lage kosten (0.59%)",
          "Online beheer",
          "Eerste maand gratis",
        ],
        isActief: true,
        isFeatured: true,
        sortOrder: 1,
      },
    });

    console.log("✅ Products created");

    // Create discount codes
    const nieuweKlantKorting = await prisma.verzekeringKorting.create({
      data: {
        code: "SECURYFLEX25",
        naam: "Nieuwe klant korting",
        beschrijving: "Speciale korting voor nieuwe SecuryFlex leden",
        kortingType: "PERCENTAGE",
        waarde: 25,
        geldigVan: new Date("2024-01-01"),
        geldigTot: new Date("2025-12-31"),
        maxGebruik: 1000,
        gebruiktAantal: 0,
        maxPerGebruiker: 1,
        nieuweKlantenOnly: true,
        isActief: true,
      },
    });

    const loyaltyKorting = await prisma.verzekeringKorting.create({
      data: {
        code: "LOYALTY10",
        naam: "Loyaliteitskorting",
        beschrijving: "Voor trouwe leden (min. 3 maanden)",
        kortingType: "PERCENTAGE",
        waarde: 10,
        geldigVan: new Date("2024-01-01"),
        geldigTot: new Date("2025-12-31"),
        minAbonnementDuur: 3,
        maxPerGebruiker: 3,
        isActief: true,
      },
    });

    const eersteGratis = await prisma.verzekeringKorting.create({
      data: {
        code: "EERSTEGRATIS",
        naam: "Eerste maand gratis",
        beschrijving: "Eerste maand premie gratis voor pensioenregeling",
        kortingType: "VAST_BEDRAG",
        waarde: 150,
        geldigVan: new Date("2024-01-01"),
        geldigTot: new Date("2025-06-30"),
        maxGebruik: 100,
        gebruiktAantal: 12,
        maxPerGebruiker: 1,
        isActief: true,
      },
    });

    console.log("✅ Discount codes created");

    // Link discounts to products
    // SECURYFLEX25 - works on all products
    const allProducts = [
      avbProduct,
      bedrijfsautoProduct,
      aovProduct,
      autoProduct,
      aansprakelijkheidProduct,
    ];
    for (const product of allProducts) {
      await prisma.verzekeringProductKorting.create({
        data: {
          productId: product.id,
          kortingId: nieuweKlantKorting.id,
        },
      });
    }

    // LOYALTY10 - works on zakelijke products
    const zakelijkeProducts = [avbProduct, bedrijfsautoProduct, aovProduct];
    for (const product of zakelijkeProducts) {
      await prisma.verzekeringProductKorting.create({
        data: {
          productId: product.id,
          kortingId: loyaltyKorting.id,
        },
      });
    }

    // EERSTEGRATIS - only for pension
    await prisma.verzekeringProductKorting.create({
      data: {
        productId: pensioenProduct.id,
        kortingId: eersteGratis.id,
      },
    });

    console.log("✅ Discount codes linked to products");

    // Create some sample applications (optional)
    const sampleZZP = await prisma.zZPProfile.findFirst({
      where: {
        subscription: {
          status: "active",
        },
      },
    });

    if (sampleZZP) {
      await prisma.verzekeringAanvraag.create({
        data: {
          zzpId: sampleZZP.id,
          productId: avbProduct.id,
          kortingId: nieuweKlantKorting.id,
          kortingCode: "SECURYFLEX25",
          aanvraagData: {
            naam: "Jan Bakker",
            email: "jan@example.com",
            telefoon: "0612345678",
            kvkNummer: "12345678",
            startDatum: "2025-02-01",
          },
          offertePremie: 42.5,
          platformKorting: 6.38, // 15%
          codeKorting: 10.63, // 25%
          finaalPremie: 25.49,
          status: "OFFERTE",
          externalRef: "REF-2025-001",
        },
      });

      console.log("✅ Sample application created");
    }

    console.log("🎉 Verzekeringen seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding verzekeringen:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedVerzekeringen().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
