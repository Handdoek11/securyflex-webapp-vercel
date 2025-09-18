import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),

    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // NextAuth
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1).optional(),

    // Email Service (Resend)
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().email().optional(),

    // Optional monitoring
    SENTRY_DSN: z.string().url().optional(),

    // Admin configuration
    ADMIN_EMAILS: z.string().min(1).optional().default("stef@securyflex.com,robert@securyflex.com"),
    ADMIN_TOOLS_PASSWORD: z.string().min(8).optional(),
  },
  client: {
    // Public Supabase keys
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

    // App URL
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .optional()
      .default("http://localhost:3000"),
  },
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  },
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SENTRY_DSN: process.env.SENTRY_DSN,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    ADMIN_TOOLS_PASSWORD: process.env.ADMIN_TOOLS_PASSWORD,

    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    // Shared
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
