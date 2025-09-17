// This file configures the initialization of Sentry for edge runtime.
// The config you add here will be used whenever a page or API route is handled by the Edge Runtime.

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,

  // Edge runtime specific configuration
  integrations: [
    // Only include lightweight integrations for edge runtime
  ],

  // Performance Monitoring for edge
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0, // Lower sampling for edge

  // Environment
  environment: process.env.NODE_ENV,

  // Edge-specific error filtering
  beforeSend(event, hint) {
    // Add edge runtime context
    if (event.contexts) {
      event.contexts.runtime = {
        name: 'edge',
        version: 'unknown',
      }
    }

    // Filter sensitive data for edge runtime
    if (event.request?.data) {
      const data = event.request.data as any
      if (typeof data === 'object') {
        const sensitiveFields = [
          'password',
          'token',
          'apiKey',
          'secret',
          'authorization'
        ]

        sensitiveFields.forEach(field => {
          if (data[field]) {
            data[field] = '[Filtered]'
          }
        })
      }
    }

    return event
  },

  // Custom tags for edge context
  initialScope: {
    tags: {
      application: 'securyflex-edge',
      platform: 'edge'
    }
  }
})