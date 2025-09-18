// This file configures the initialization of Sentry on the browser/client side.
// The config you add here will be used whenever a page is visited.

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Replay may only be enabled for the client-side
  integrations: [
    Sentry.replayIntegration({
      // Use correct property names for v10.x
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with an error will be recorded

  // Release Health

  // Environment
  environment: process.env.NODE_ENV,

  // Before send hook to filter sensitive data
  beforeSend(event, hint) {
    // Filter out sensitive information
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      if (typeof data === "object") {
        // Remove sensitive fields
        const sensitiveFields = [
          "password",
          "confirmPassword",
          "token",
          "accessToken",
          "refreshToken",
          "apiKey",
          "secret",
          "kvkNummer",
          "btwNummer",
          "bankAccount",
          "iban",
        ];

        sensitiveFields.forEach((field) => {
          if (data[field]) {
            data[field] = "[Filtered]";
          }
        });
      }
    }

    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip ChunkLoadErrors (common with code splitting)
        if (error.name === "ChunkLoadError") {
          return null;
        }

        // Skip navigation cancelled errors
        if (error.message?.includes("Navigation cancelled")) {
          return null;
        }

        // Skip network errors from ad blockers
        if (error.message?.includes("blocked:mixed-content")) {
          return null;
        }
      }
    }

    return event;
  },

  // Custom tags for SecuryFlex context
  initialScope: {
    tags: {
      application: "securyflex-client",
      platform: "web",
    },
  },
});
