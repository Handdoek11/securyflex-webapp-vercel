// This file configures the initialization of Sentry on the server side.
// The config you add here will be used whenever the server handles a request.

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  integrations: [
    Sentry.httpIntegration({
      // Capture outgoing HTTP requests
      tracing: true,
    }),
    Sentry.prismaIntegration({
      // Capture Prisma operations
      client: undefined, // Will be set dynamically
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Server-side error filtering
  beforeSend(event, hint) {
    // Add server-side context
    if (event.contexts) {
      event.contexts.runtime = {
        name: "node",
        version: process.version,
      };
    }

    // Filter sensitive data from server-side events
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      if (typeof data === "object") {
        const sensitiveFields = [
          "password",
          "hashedPassword",
          "token",
          "apiKey",
          "secret",
          "privateKey",
          "kvkNummer",
          "btwNummer",
          "bankAccount",
          "iban",
          "socialSecurityNumber",
        ];

        sensitiveFields.forEach((field) => {
          if (data[field]) {
            data[field] = "[Filtered]";
          }
        });
      }
    }

    // Filter out known non-critical server errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip database connection timeout errors during development
        if (
          process.env.NODE_ENV === "development" &&
          error.message?.includes("connect ETIMEDOUT")
        ) {
          return null;
        }

        // Skip rate limiting errors (they're handled gracefully)
        if (error.message?.includes("Rate limit exceeded")) {
          return null;
        }

        // Skip file not found errors for static assets
        if (
          error.message?.includes("ENOENT") &&
          error.message?.includes("/static/")
        ) {
          return null;
        }
      }
    }

    return event;
  },

  // Custom tags for server context
  initialScope: {
    tags: {
      application: "securyflex-server",
      platform: "node",
    },
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
});
