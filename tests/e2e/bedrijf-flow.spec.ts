import { expect, type Page, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

/**
 * Bedrijf E2E Flow Tests
 *
 * Tests the complete bedrijf (security company) user journey
 * from registration to managing opdrachten and team members
 */

const prisma = new PrismaClient();

// Test data
const testBedrijf = {
  email: "e2e-test-bedrijf@securyflex.nl",
  password: "TestPassword123!",
  bedrijfsnaam: "E2E Test Beveiligingsbedrijf BV",
  kvkNummer: "12345678",
  btwNummer: "NL123456789B01",
  contactpersoon: "Jan van der Test",
  telefoon: "+31612345678",
  adres: "Teststraat 123",
  postcode: "1012AB",
  plaats: "Amsterdam",
  specialisaties: ["Evenementbeveiliging", "Objectbeveiliging"],
};

const testOpdrachtData = {
  titel: "E2E Test Evenement Beveiliging",
  omschrijving: "Beveiliging tijdens test evenement in Amsterdam Arena",
  locatie: "Amsterdam Arena",
  postcode: "1101AX",
  startDatum: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16), // 1 week from now
  eindDatum: new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000,
  )
    .toISOString()
    .slice(0, 16), // +10 hours
  uurloon: 28.5,
  aantalPersonen: 8,
  vereisten: ["SIA Diploma", "Ervaring met evenementen", "Fysiek fit"],
};

// Helper functions
async function createTestUser(page: Page) {
  // Navigate to registration
  await page.goto("/auth/register");
  await expect(page).toHaveURL(/.*register/);

  // Fill registration form
  await page.getByLabel(/e-mailadres/i).fill(testBedrijf.email);
  await page
    .getByLabel(/wachtwoord/i)
    .first()
    .fill(testBedrijf.password);
  await page.getByLabel(/wachtwoord bevestigen/i).fill(testBedrijf.password);

  // Submit registration
  await page.getByRole("button", { name: /account aanmaken/i }).click();

  // Should redirect to role selection
  await expect(page).toHaveURL(/.*role-selection/);
}

async function completeBedrijfProfile(page: Page) {
  // Select bedrijf role
  await page.getByRole("button", { name: /beveiligingsbedrijf/i }).click();
  await expect(page).toHaveURL(/.*bedrijf.*profile/);

  // Fill company profile
  await page.getByLabel(/bedrijfsnaam/i).fill(testBedrijf.bedrijfsnaam);
  await page.getByLabel(/kvk.*nummer/i).fill(testBedrijf.kvkNummer);
  await page.getByLabel(/btw.*nummer/i).fill(testBedrijf.btwNummer);
  await page.getByLabel(/contactpersoon/i).fill(testBedrijf.contactpersoon);
  await page.getByLabel(/telefoonnummer/i).fill(testBedrijf.telefoon);
  await page.getByLabel(/adres/i).fill(testBedrijf.adres);
  await page.getByLabel(/postcode/i).fill(testBedrijf.postcode);
  await page.getByLabel(/plaats/i).fill(testBedrijf.plaats);

  // Select specializations
  for (const specialisatie of testBedrijf.specialisaties) {
    await page.getByLabel(specialisatie).check();
  }

  // Submit profile
  await page.getByRole("button", { name: /profiel voltooien/i }).click();

  // Should redirect to bedrijf dashboard
  await expect(page).toHaveURL(/.*dashboard.*bedrijf/);
}

async function loginAsBedrijf(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel(/e-mailadres/i).fill(testBedrijf.email);
  await page.getByLabel(/wachtwoord/i).fill(testBedrijf.password);
  await page.getByRole("button", { name: /inloggen/i }).click();
  await expect(page).toHaveURL(/.*dashboard.*bedrijf/);
}

test.describe("Bedrijf Complete User Flow", () => {
  test("should complete bedrijf registration and onboarding flow", async ({
    page,
  }) => {
    // Complete registration
    await createTestUser(page);

    // Complete bedrijf profile
    await completeBedrijfProfile(page);

    // Verify dashboard content
    await expect(
      page.getByText(/welkom.*test beveiligingsbedrijf/i),
    ).toBeVisible();
    await expect(page.getByText(/dashboard/i)).toBeVisible();

    // Verify navigation menu
    await expect(page.getByRole("link", { name: /opdrachten/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /planning/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /team/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /klanten/i })).toBeVisible();
  });

  test("should create and manage opdrachten as opdrachtgever", async ({
    page,
  }) => {
    // Login
    await loginAsBedrijf(page);

    // Navigate to opdrachten
    await page.getByRole("link", { name: /opdrachten/i }).click();
    await expect(page).toHaveURL(/.*opdrachten/);

    // Switch to opdrachtgever mode
    await page.getByRole("button", { name: /opdrachtgever/i }).click();
    await expect(page.getByText(/eigen opdrachten/i)).toBeVisible();

    // Create new opdracht
    await page.getByRole("button", { name: /nieuwe opdracht/i }).click();
    await expect(page.getByText(/opdracht plaatsen/i)).toBeVisible();

    // Fill opdracht form
    await page.getByLabel(/titel/i).fill(testOpdrachtData.titel);
    await page.getByLabel(/omschrijving/i).fill(testOpdrachtData.omschrijving);
    await page.getByLabel(/locatie/i).fill(testOpdrachtData.locatie);
    await page.getByLabel(/postcode/i).fill(testOpdrachtData.postcode);

    // Fill datetime fields
    await page.getByLabel(/startdatum/i).fill(testOpdrachtData.startDatum);
    await page.getByLabel(/einddatum/i).fill(testOpdrachtData.eindDatum);

    // Fill numeric fields
    await page.getByLabel(/uurloon/i).fill(testOpdrachtData.uurloon.toString());
    await page
      .getByLabel(/aantal personen/i)
      .fill(testOpdrachtData.aantalPersonen.toString());

    // Add requirements
    for (const vereiste of testOpdrachtData.vereisten) {
      await page.getByPlaceholder(/voeg vereiste toe/i).fill(vereiste);
      await page.keyboard.press("Enter");
    }

    // Set target audience
    await page.getByLabel(/alleen zzp/i).check();
    await page.getByLabel(/directe sollicitaties toestaan/i).check();

    // Submit opdracht
    await page.getByRole("button", { name: /opdracht plaatsen/i }).click();

    // Verify success
    await expect(page.getByText(/opdracht succesvol geplaatst/i)).toBeVisible();

    // Verify opdracht appears in list
    await expect(page.getByText(testOpdrachtData.titel)).toBeVisible();
    await expect(page.getByText(`€${testOpdrachtData.uurloon}`)).toBeVisible();
    await expect(
      page.getByText(`${testOpdrachtData.aantalPersonen} personen`),
    ).toBeVisible();
  });

  test("should manage planning and team assignments", async ({ page }) => {
    // Login and navigate to planning
    await loginAsBedrijf(page);
    await page.getByRole("link", { name: /planning/i }).click();
    await expect(page).toHaveURL(/.*planning/);

    // Verify planning overview
    await expect(page.getByText(/planning overzicht/i)).toBeVisible();
    await expect(page.getByText(/week.*weergave/i)).toBeVisible();

    // Switch to different views
    await page.getByRole("button", { name: /maand/i }).click();
    await expect(page.getByText(/maand.*weergave/i)).toBeVisible();

    // Check for planning filters
    await expect(page.getByPlaceholder(/zoek opdrachten/i)).toBeVisible();

    // Test calendar navigation
    await page.getByRole("button", { name: /volgende/i }).click();
    await page.getByRole("button", { name: /vorige/i }).click();
  });

  test("should manage client relationships", async ({ page }) => {
    // Login and navigate to clients
    await loginAsBedrijf(page);
    await page.getByRole("link", { name: /klanten/i }).click();
    await expect(page).toHaveURL(/.*klanten/);

    // Verify client overview
    await expect(page.getByText(/klanten beheer/i)).toBeVisible();

    // Test client filters
    await page.getByPlaceholder(/zoek klanten/i).fill("test");
    await page.keyboard.press("Enter");

    // Test status filters
    await page.getByRole("button", { name: /actieve klanten/i }).click();
    await page.getByRole("button", { name: /alle klanten/i }).click();

    // Test sorting options
    await page.getByRole("button", { name: /sorteren/i }).click();
    await page.getByRole("menuitem", { name: /naam/i }).click();
    await page.getByRole("button", { name: /sorteren/i }).click();
    await page.getByRole("menuitem", { name: /omzet/i }).click();
  });

  test("should view and understand dashboard statistics", async ({ page }) => {
    // Login to dashboard
    await loginAsBedrijf(page);
    await expect(page).toHaveURL(/.*dashboard.*bedrijf/);

    // Verify key metrics
    await expect(page.getByText(/totaal opdrachten/i)).toBeVisible();
    await expect(page.getByText(/omzet/i)).toBeVisible();
    await expect(page.getByText(/team grootte/i)).toBeVisible();
    await expect(page.getByText(/actieve klanten/i)).toBeVisible();

    // Test period filters
    await page.getByRole("button", { name: /deze maand/i }).click();
    await page.getByRole("menuitem", { name: /deze week/i }).click();
    await expect(page.getByText(/deze week/i)).toBeVisible();

    await page.getByRole("button", { name: /deze week/i }).click();
    await page.getByRole("menuitem", { name: /dit kwartaal/i }).click();
    await expect(page.getByText(/dit kwartaal/i)).toBeVisible();

    // Verify charts are present
    await expect(page.locator("canvas, svg")).toBeVisible(); // Revenue chart
    await expect(page.getByText(/omzet ontwikkeling/i)).toBeVisible();

    // Test role switching
    await page
      .getByRole("button", { name: /leverancier.*opdrachtgever/i })
      .click();
    await expect(page.getByText(/leverancier/i)).toBeVisible();
  });

  test("should handle responsive design on mobile viewport", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await loginAsBedrijf(page);

    // Test mobile navigation
    const mobileMenu = page.getByRole("button", { name: /menu/i });
    await expect(mobileMenu).toBeVisible();
    await mobileMenu.click();

    // Verify mobile menu items
    await expect(page.getByRole("link", { name: /opdrachten/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /planning/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /team/i })).toBeVisible();

    // Navigate to opdrachten on mobile
    await page.getByRole("link", { name: /opdrachten/i }).click();
    await expect(page).toHaveURL(/.*opdrachten/);

    // Test mobile opdracht card layout
    const opdrachtCards = page.locator('[data-testid="opdracht-card"]');
    if ((await opdrachtCards.count()) > 0) {
      const firstCard = opdrachtCards.first();
      await expect(firstCard).toBeVisible();

      // Test card interaction on mobile
      await firstCard.click();
    }

    // Test mobile forms
    await page.getByRole("button", { name: /nieuwe opdracht/i }).click();

    // Form should be responsive
    await expect(page.getByLabel(/titel/i)).toBeVisible();
    await expect(page.getByLabel(/omschrijving/i)).toBeVisible();
  });

  test("should handle error scenarios gracefully", async ({ page }) => {
    // Login
    await loginAsBedrijf(page);

    // Test network error handling
    await page.route("**/api/bedrijf/**", (route) => route.abort());

    await page.getByRole("link", { name: /opdrachten/i }).click();

    // Should show error state
    await expect(page.getByText(/fout.*laden/i)).toBeVisible({
      timeout: 10000,
    });

    // Remove network block
    await page.unroute("**/api/bedrijf/**");

    // Test retry functionality
    await page.getByRole("button", { name: /opnieuw proberen/i }).click();

    // Should recover
    await expect(page.getByText(/opdrachten/i)).toBeVisible();
  });

  test("should validate form inputs correctly", async ({ page }) => {
    // Login and navigate to opdracht creation
    await loginAsBedrijf(page);
    await page.getByRole("link", { name: /opdrachten/i }).click();
    await page.getByRole("button", { name: /nieuwe opdracht/i }).click();

    // Test required field validation
    await page.getByRole("button", { name: /opdracht plaatsen/i }).click();

    await expect(page.getByText(/titel is verplicht/i)).toBeVisible();
    await expect(page.getByText(/omschrijving is verplicht/i)).toBeVisible();
    await expect(page.getByText(/locatie is verplicht/i)).toBeVisible();

    // Test field format validation
    await page.getByLabel(/titel/i).fill("Te"); // Too short
    await expect(page.getByText(/minimaal 3 karakters/i)).toBeVisible();

    await page.getByLabel(/postcode/i).fill("123AB"); // Invalid format
    await expect(page.getByText(/ongeldige postcode/i)).toBeVisible();

    await page.getByLabel(/uurloon/i).fill("-5"); // Negative amount
    await expect(page.getByText(/moet hoger zijn dan €0/i)).toBeVisible();

    await page.getByLabel(/aantal personen/i).fill("0"); // Zero persons
    await expect(page.getByText(/minimaal 1 persoon/i)).toBeVisible();

    // Test date validation
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);
    await page.getByLabel(/startdatum/i).fill(pastDate);
    await expect(
      page.getByText(/startdatum mag niet in het verleden/i),
    ).toBeVisible();
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Login
    await loginAsBedrijf(page);

    // Test tab navigation
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    // Navigate through main menu
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      if (await focusedElement.isVisible()) {
        const tagName = await focusedElement.evaluate((el) => el.tagName);
        if (["A", "BUTTON", "INPUT"].includes(tagName)) {
          // Valid focusable element
          break;
        }
      }
    }

    // Test Enter key activation
    await page.keyboard.press("Enter");

    // Test escape key for modals
    if (await page.locator('[role="dialog"]').isVisible()) {
      await page.keyboard.press("Escape");
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });

  test("should work offline and handle reconnection", async ({
    page,
    context,
  }) => {
    // Login first
    await loginAsBedrijf(page);

    // Go offline
    await context.setOffline(true);

    // Try to navigate
    await page.getByRole("link", { name: /planning/i }).click();

    // Should show offline message
    await expect(page.getByText(/geen internetverbinding/i)).toBeVisible({
      timeout: 10000,
    });

    // Go back online
    await context.setOffline(false);

    // Should recover
    await expect(page.getByText(/verbinding hersteld/i)).toBeVisible({
      timeout: 10000,
    });

    // Navigation should work again
    await page.getByRole("link", { name: /opdrachten/i }).click();
    await expect(page).toHaveURL(/.*opdrachten/);
  });
});

test.describe("Bedrijf Advanced Workflows", () => {
  test("should handle bulk operations on opdrachten", async ({ page }) => {
    // Login and navigate to opdrachten
    await loginAsBedrijf(page);
    await page.getByRole("link", { name: /opdrachten/i }).click();

    // Select multiple opdrachten (if any exist)
    const checkboxes = page.locator('[data-testid="opdracht-checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      // Select first two opdrachten
      for (let i = 0; i < Math.min(2, checkboxCount); i++) {
        await checkboxes.nth(i).check();
      }

      // Bulk actions should appear
      await expect(page.getByText(/geselecteerd/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /bulk.*acties/i }),
      ).toBeVisible();

      // Test bulk status change
      await page.getByRole("button", { name: /bulk.*acties/i }).click();
      await page.getByRole("menuitem", { name: /status wijzigen/i }).click();

      await expect(
        page.getByText(/status wijzigen voor.*opdrachten/i),
      ).toBeVisible();
    }
  });

  test("should export opdrachten data", async ({ page }) => {
    // Login and navigate to opdrachten
    await loginAsBedrijf(page);
    await page.getByRole("link", { name: /opdrachten/i }).click();

    // Test export functionality
    const exportButton = page.getByRole("button", { name: /exporteren/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();

      await expect(page.getByText(/export formaat/i)).toBeVisible();

      // Test CSV export
      await page.getByRole("button", { name: /csv/i }).click();

      // File download should be triggered (in real browser)
      // In test environment, we verify the action was attempted
      await expect(page.getByText(/export gestart/i)).toBeVisible();
    }
  });

  test("should handle real-time updates", async ({ page, context }) => {
    // Open two pages for real-time testing
    const page2 = await context.newPage();

    // Login on both pages
    await loginAsBedrijf(page);
    await loginAsBedrijf(page2);

    // Navigate both to opdrachten
    await page.getByRole("link", { name: /opdrachten/i }).click();
    await page2.getByRole("link", { name: /opdrachten/i }).click();

    // Create opdracht on page 1
    await page.getByRole("button", { name: /nieuwe opdracht/i }).click();

    // Fill minimal form
    await page.getByLabel(/titel/i).fill("Real-time Test Opdracht");
    await page.getByLabel(/omschrijving/i).fill("Testing real-time updates");
    await page.getByLabel(/locatie/i).fill("Test Location");
    await page.getByLabel(/postcode/i).fill("1234AB");

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);
    await page.getByLabel(/startdatum/i).fill(futureDate);
    await page.getByLabel(/einddatum/i).fill(futureDate);

    await page.getByLabel(/uurloon/i).fill("25");
    await page.getByLabel(/aantal personen/i).fill("1");

    await page.getByRole("button", { name: /opdracht plaatsen/i }).click();

    // Verify opdracht appears on page 2 (real-time update)
    await expect(page2.getByText("Real-time Test Opdracht")).toBeVisible({
      timeout: 10000,
    });
  });
});

// Cleanup after all tests
test.afterAll(async () => {
  // Clean up test data
  try {
    await prisma.opdracht.deleteMany({
      where: {
        creatorBedrijf: {
          user: {
            email: testBedrijf.email,
          },
        },
      },
    });

    await prisma.bedrijfProfile.deleteMany({
      where: {
        user: {
          email: testBedrijf.email,
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: testBedrijf.email,
      },
    });
  } catch (error) {
    console.warn("Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
});
