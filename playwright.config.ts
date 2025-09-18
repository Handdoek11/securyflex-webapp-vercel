import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for SecuryFlex E2E tests
 *
 * Comprehensive testing setup for production readiness validation
 */
export default defineConfig({
  testDir: "./tests/e2e",

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  // Maximum time each test can run
  timeout: 30 * 1000,

  // Global test configuration
  use: {
    // Base URL for tests
    baseURL: "http://localhost:3000",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Take screenshot on failure
    screenshot: "only-on-failure",

    // Record video on failure
    video: "retain-on-failure",

    // Maximum time each action such as `click()` can take
    actionTimeout: 10 * 1000,

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Accept downloads
    acceptDownloads: true,

    // Geolocation for GPS testing
    geolocation: { longitude: 4.9041, latitude: 52.3676 }, // Amsterdam
    permissions: ["geolocation"],

    // Locale and timezone
    locale: "nl-NL",
    timezoneId: "Europe/Amsterdam",
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Enable GPS and camera permissions for ZZP features
        permissions: ["geolocation", "camera"],
        // Use Dutch locale for form validation testing
        locale: "nl-NL",
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        permissions: ["geolocation"],
        locale: "nl-NL",
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        permissions: ["geolocation"],
        locale: "nl-NL",
      },
    },

    // Mobile testing for responsive design
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        permissions: ["geolocation", "camera"],
        locale: "nl-NL",
      },
    },

    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 12"],
        permissions: ["geolocation"],
        locale: "nl-NL",
      },
    },

    // Test with reduced viewport for accessibility
    {
      name: "accessibility",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        permissions: ["geolocation"],
        locale: "nl-NL",
      },
    },
  ],

  // Test match patterns
  testMatch: ["**/*.spec.ts", "**/*.e2e.ts"],

  // Test ignore patterns
  testIgnore: ["**/*.unit.ts", "**/*.integration.ts"],

  // Global setup and teardown
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",

  // Run your local dev server before starting the tests
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start server
    env: {
      // Test environment variables
      NODE_ENV: "test",
      NEXTAUTH_URL: "http://localhost:3000",
      DATABASE_URL:
        process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "",
      // Disable rate limiting for E2E tests
      DISABLE_RATE_LIMITING: "true",
      // Use test Sentry DSN to avoid polluting production
      SENTRY_DSN: process.env.TEST_SENTRY_DSN || "",
      // Use test Supabase project
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.TEST_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.TEST_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "",
    },
  },

  // Expect configuration
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 10 * 1000,

    // Take screenshots of failed expect() calls
    toHaveScreenshot: {
      animations: "disabled",
    },
  },

  // Test output directory
  outputDir: "test-results/",

  // Artifacts
  reportSlowTests: {
    max: 10,
    threshold: 15 * 1000, // 15 seconds
  },
});
