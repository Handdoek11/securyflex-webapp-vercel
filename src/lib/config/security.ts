/**
 * Security and Performance Configuration for SecuryFlex
 *
 * Centralized configuration for all security hardening measures
 * and performance optimization settings.
 */

export const SecurityConfig = {
  // Rate Limiting Configuration
  rateLimiting: {
    // General API endpoints
    general: {
      points: 100, // requests per window
      duration: 60, // window in seconds
      blockDuration: 60, // block duration in seconds
    },

    // Write operations (POST, PUT, PATCH, DELETE)
    write: {
      points: 20,
      duration: 60,
      blockDuration: 120,
    },

    // Planning operations
    planning: {
      points: 50,
      duration: 60,
      blockDuration: 60,
    },

    // Payment operations (most restrictive)
    payment: {
      points: 10,
      duration: 60,
      blockDuration: 300, // 5 minutes
    },

    // Authentication endpoints
    auth: {
      points: 5,
      duration: 60,
      blockDuration: 900, // 15 minutes
    },
  },

  // Input Validation Settings
  validation: {
    maxStringLength: 10000, // Maximum string field length
    maxArrayLength: 100, // Maximum array size
    maxObjectDepth: 10, // Maximum nested object depth
    allowedFileTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "text/csv",
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },

  // CSRF Protection
  csrf: {
    enabled: true,
    cookieName: "__Host-csrf-token",
    headerName: "x-csrf-token",
    tokenLength: 32,
  },

  // Session Security
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
  },

  // Password Requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  },

  // Encryption Settings
  encryption: {
    algorithm: "aes-256-gcm",
    keyDerivation: "pbkdf2",
    iterations: 100000,
    saltLength: 32,
    ivLength: 16,
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net",
      ],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", "https:", "wss:"],
      "font-src": ["'self'"],
      "object-src": ["'none'"],
      "media-src": ["'self'"],
      "frame-src": ["'none'"],
    },
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: ["'self'"],
      payment: ["'self'"],
    },
  },
} as const;

export const PerformanceConfig = {
  // Database Query Optimization
  database: {
    connectionTimeout: 30000, // 30 seconds
    queryTimeout: 15000, // 15 seconds
    maxConnections: 20,
    idleTimeout: 300000, // 5 minutes

    // Query caching
    cache: {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000, // maximum cached queries
      statsCache: {
        ttl: 120000, // 2 minutes
        maxSize: 100,
      },
    },

    // Pagination limits
    pagination: {
      defaultLimit: 20,
      maxLimit: 100,
      maxOffset: 10000, // Prevent deep pagination
    },
  },

  // Response Compression
  compression: {
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6, // Compression level (1-9)
    filter: (req: any) => {
      // Don't compress responses for certain content types
      return !req.headers["x-no-compression"];
    },
  },

  // Memory Management
  memory: {
    maxHeapSize: 512 * 1024 * 1024, // 512MB
    gcInterval: 30000, // Force GC every 30 seconds if needed
    warningThreshold: 400 * 1024 * 1024, // 400MB warning
  },

  // API Response Timeouts
  timeouts: {
    default: 30000, // 30 seconds
    upload: 300000, // 5 minutes for file uploads
    reports: 120000, // 2 minutes for report generation
    payments: 60000, // 1 minute for payment operations
  },
} as const;

// Environment-specific overrides
export const getSecurityConfig = () => {
  const config = JSON.parse(
    JSON.stringify(SecurityConfig),
  ) as typeof SecurityConfig;

  if (process.env.NODE_ENV === "development") {
    // Relax some restrictions for development
    config.rateLimiting.general.points = 1000;
    config.rateLimiting.write.points = 200;
    config.csrf.enabled = false; // Disable CSRF in development
  }

  if (process.env.NODE_ENV === "test") {
    // Minimal restrictions for testing
    config.rateLimiting.general.points = 10000;
    config.rateLimiting.write.points = 1000;
    config.csrf.enabled = false;
  }

  return config;
};

export const getPerformanceConfig = () => {
  const config = JSON.parse(
    JSON.stringify(PerformanceConfig),
  ) as typeof PerformanceConfig;

  if (process.env.NODE_ENV === "development") {
    // Longer timeouts for development/debugging
    config.database.connectionTimeout = 60000;
    config.database.queryTimeout = 30000;
    config.timeouts.default = 60000;
  }

  return config;
};

// Security middleware configuration presets
export const SecurityPresets = {
  // For public endpoints (no authentication required)
  public: {
    requireBedrijf: false,
    allowedMethods: ["GET"],
    rateLimiter: "general" as const,
    requireCSRF: false,
    sanitizeInput: true,
    logActivity: false,
  },

  // For read-only authenticated endpoints
  readOnly: {
    requireBedrijf: true,
    allowedMethods: ["GET"],
    rateLimiter: "general" as const,
    requireCSRF: false,
    sanitizeInput: true,
    logActivity: true,
  },

  // For standard write operations
  write: {
    requireBedrijf: true,
    allowedMethods: ["POST", "PUT", "PATCH"],
    rateLimiter: "write" as const,
    requireCSRF: true,
    sanitizeInput: true,
    logActivity: true,
  },

  // For sensitive operations (planning, payments)
  sensitive: {
    requireBedrijf: true,
    allowedMethods: ["POST", "PUT"],
    rateLimiter: "payment" as const,
    requireCSRF: true,
    sanitizeInput: true,
    logActivity: true,
  },

  // For delete operations
  delete: {
    requireBedrijf: true,
    allowedMethods: ["DELETE"],
    rateLimiter: "write" as const,
    requireCSRF: true,
    sanitizeInput: true,
    logActivity: true,
  },
} as const;

// Monitoring and alerting thresholds
export const MonitoringConfig = {
  performance: {
    slowQueryThreshold: 3000, // 3 seconds
    slowRequestThreshold: 5000, // 5 seconds
    highMemoryThreshold: 400 * 1024 * 1024, // 400MB
    errorRateThreshold: 0.05, // 5% error rate
  },

  security: {
    maxFailedAttempts: 5,
    suspiciousActivityThreshold: 10,
    blockedIPThreshold: 100,
    alertCooldown: 300000, // 5 minutes between similar alerts
  },

  business: {
    criticalEndpoints: [
      "/api/bedrijf/opdrachten",
      "/api/bedrijf/planning",
      "/api/bedrijf/webhooks/finqle",
      "/api/payments",
    ],
    maxDowntime: 300000, // 5 minutes
    targetResponseTime: 1000, // 1 second
  },
} as const;

// Feature flags for security features
export const SecurityFeatures = {
  enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== "false",
  enableCSRF: process.env.NODE_ENV === "production",
  enableInputSanitization: true,
  enableSecurityHeaders: true,
  enableQueryOptimization: true,
  enableCaching: process.env.DISABLE_CACHING !== "true",
  enableLogging: process.env.ENABLE_SECURITY_LOGGING !== "false",
  enableMonitoring: process.env.NODE_ENV === "production",
} as const;

// Export types for TypeScript
export type SecurityConfigType = typeof SecurityConfig;
export type PerformanceConfigType = typeof PerformanceConfig;
export type SecurityPresetType =
  (typeof SecurityPresets)[keyof typeof SecurityPresets];
