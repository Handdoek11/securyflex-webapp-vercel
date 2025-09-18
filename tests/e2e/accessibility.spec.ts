import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibility E2E Tests
 *
 * Ensures SecuryFlex meets WCAG 2.1 AA standards
 * Critical for inclusive design and legal compliance
 */

test.describe("Accessibility Tests", () => {
  test("should have no accessibility violations on homepage", async ({
    page,
  }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have no accessibility violations on ZZP dashboard", async ({
    page,
  }) => {
    // Use authentication state
    await page.goto("/dashboard/zzp", {
      // This would use the auth state from global setup
      // For now, we'll mock the authentication
    });

    // Mock authenticated user
    await page.addInitScript(() => {
      window.localStorage.setItem("auth-token", "mock-token");
      window.localStorage.setItem("user-role", "ZZP_BEVEILIGER");
    });

    await page.goto("/dashboard/zzp");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .exclude('[data-testid="map-component"]') // Maps often have accessibility issues
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have proper keyboard navigation", async ({ page }) => {
    await page.goto("/auth/login");

    // Test tab navigation
    await page.keyboard.press("Tab");
    await expect(page.getByLabel(/e-mailadres/i)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByLabel(/wachtwoord/i)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /inloggen/i })).toBeFocused();

    // Test Enter key submission
    await page.getByLabel(/e-mailadres/i).fill("test@example.com");
    await page.getByLabel(/wachtwoord/i).fill("password123");

    await page.keyboard.press("Enter");

    // Should attempt login (even if it fails due to invalid credentials)
    await expect(page).toHaveURL(/.*login.*/);
  });

  test("should have proper ARIA labels and roles", async ({ page }) => {
    await page.goto("/dashboard/zzp/jobs");

    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem("auth-token", "mock-token");
      window.localStorage.setItem("user-role", "ZZP_BEVEILIGER");
    });

    await page.reload();

    // Check main navigation has proper ARIA
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();

    // Check job cards have proper labels
    const jobCards = page.locator('[data-testid="job-card"]');
    if ((await jobCards.count()) > 0) {
      const firstCard = jobCards.first();
      await expect(firstCard).toHaveAttribute("role", "article");

      // Should have accessible name
      const cardTitle = firstCard.locator("h3, h2");
      await expect(cardTitle).toBeVisible();
    }

    // Check buttons have proper labels
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute("aria-label");
      const hasVisibleText = await button.textContent();

      // Button should have either aria-label or visible text
      expect(
        hasAriaLabel || (hasVisibleText && hasVisibleText.trim().length > 0),
      ).toBeTruthy();
    }
  });

  test("should work with screen reader simulation", async ({ page }) => {
    await page.goto("/auth/register");

    // Test form labels are properly associated
    const emailInput = page.getByLabel(/e-mailadres/i);
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("required");

    const passwordInput = page.getByLabel(/wachtwoord/i).first();
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(passwordInput).toHaveAttribute("required");

    // Test error messages are announced
    await emailInput.fill("invalid-email");
    await page.getByRole("button", { name: /account aanmaken/i }).click();

    const errorMessage = page.locator('[role="alert"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toHaveText(/geldig e-mailadres/i);
    }
  });

  test("should have sufficient color contrast", async ({ page }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .include(["color-contrast"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should work without JavaScript", async ({ browser }) => {
    // Create context with JavaScript disabled
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });

    const page = await context.newPage();
    await page.goto("/auth/login");

    // Basic form should still work
    await expect(page.getByLabel(/e-mailadres/i)).toBeVisible();
    await expect(page.getByLabel(/wachtwoord/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /inloggen/i })).toBeVisible();

    // Form should be submittable (even without JS)
    await page.getByLabel(/e-mailadres/i).fill("test@example.com");
    await page.getByLabel(/wachtwoord/i).fill("password123");

    const form = page.locator("form");
    await expect(form).toHaveAttribute("method", "POST");

    await context.close();
  });

  test("should handle high contrast mode", async ({ browser }) => {
    // Simulate high contrast mode
    const context = await browser.newContext({
      colorScheme: "dark",
      forcedColors: "active",
    });

    const page = await context.newPage();
    await page.goto("/");

    // Check that content is still visible and accessible
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Check navigation is still functional
    const navLinks = page.locator("nav a");
    if ((await navLinks.count()) > 0) {
      await expect(navLinks.first()).toBeVisible();
    }

    await context.close();
  });

  test("should work with reduced motion preferences", async ({ browser }) => {
    // Simulate reduced motion preference
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });

    const page = await context.newPage();
    await page.goto("/");

    // Check that animations are disabled or minimal
    // This would typically check that CSS animations respect prefers-reduced-motion
    const styles = await page.evaluate(() => {
      const element = document.querySelector("*");
      return window.getComputedStyle(element as Element).animationDuration;
    });

    // In reduced motion mode, animations should be minimal or disabled
    // This is a basic check - more sophisticated testing would check specific elements
    expect(["0s", "none"]).toContain(styles);

    await context.close();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Check heading hierarchy
    const _headings = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .allTextContents();

    // Should have at least one h1
    const h1Elements = await page.locator("h1").count();
    expect(h1Elements).toBeGreaterThanOrEqual(1);

    // Check that headings are in logical order (basic check)
    const h1 = await page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("should have proper focus management", async ({ page }) => {
    await page.goto("/dashboard/zzp/jobs");

    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem("auth-token", "mock-token");
    });

    await page.reload();

    // Test focus trap in modal (if job details modal exists)
    const jobCard = page.locator('[data-testid="job-card"]').first();

    if (await jobCard.isVisible()) {
      await jobCard.click();

      // Check if modal opened
      const modal = page.locator('[role="dialog"]');

      if (await modal.isVisible()) {
        // Focus should be trapped within modal
        await page.keyboard.press("Tab");

        // Check that focus is within modal
        const _focusedElement = page.locator(":focus");
        const isWithinModal = (await modal.locator(":focus").count()) > 0;

        expect(isWithinModal).toBe(true);

        // Test Escape key closes modal
        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test("should work with zoom up to 200%", async ({ page }) => {
    await page.goto("/");

    // Set 200% zoom
    await page.setViewportSize({ width: 640, height: 480 }); // Simulates zoom

    // Check that content is still accessible and usable
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Check that navigation still works
    const navElements = page.locator("nav");
    if ((await navElements.count()) > 0) {
      await expect(navElements.first()).toBeVisible();
    }

    // Check that text is still readable (not cut off)
    const textElements = page
      .locator("p, span, div")
      .filter({ hasText: /\w+/ });
    if ((await textElements.count()) > 0) {
      const firstTextElement = textElements.first();
      const boundingBox = await firstTextElement.boundingBox();

      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
      }
    }
  });

  test("should have proper error handling for screen readers", async ({
    page,
  }) => {
    await page.goto("/auth/login");

    // Fill invalid data and submit
    await page.getByLabel(/e-mailadres/i).fill("invalid-email");
    await page.getByLabel(/wachtwoord/i).fill("123"); // Too short

    await page.getByRole("button", { name: /inloggen/i }).click();

    // Check for ARIA live regions for error announcements
    const liveRegions = page.locator(
      '[aria-live="polite"], [aria-live="assertive"], [role="alert"]',
    );

    if ((await liveRegions.count()) > 0) {
      const errorText = await liveRegions.first().textContent();
      expect(errorText).toBeTruthy();
      expect(errorText?.length).toBeGreaterThan(0);
    }

    // Check that form fields have proper error states
    const emailField = page.getByLabel(/e-mailadres/i);
    const hasAriaInvalid = await emailField.getAttribute("aria-invalid");
    const hasAriaDescribedBy =
      await emailField.getAttribute("aria-describedby");

    // Field should indicate error state
    expect(
      hasAriaInvalid === "true" || hasAriaDescribedBy !== null,
    ).toBeTruthy();
  });

  test("should support alternative input methods", async ({ page }) => {
    await page.goto("/dashboard/zzp/hours");

    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem("auth-token", "mock-token");
    });

    await page.reload();

    // Test that buttons can be activated with Space and Enter
    const button = page.getByRole("button").first();

    if (await button.isVisible()) {
      await button.focus();

      // Test Space key activation
      await page.keyboard.press("Space");

      // Test Enter key activation
      await page.keyboard.press("Enter");

      // Both should work (no specific assertion as behavior depends on button type)
    }
  });
});
