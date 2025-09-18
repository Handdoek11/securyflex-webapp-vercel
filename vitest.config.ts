/// <reference types="vitest" />

import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "src/app/wireframes/",
        "context-engineering-intro-main/",
        "prisma/",
        ".next/",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    // Test patterns
    include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
    exclude: [
      "node_modules/",
      "dist/",
      ".next/",
      "context-engineering-intro-main/",
    ],
    // Mock patterns
    deps: {
      inline: ["@testing-library/react", "@testing-library/jest-dom"],
    },
    // Timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/app": path.resolve(__dirname, "./src/app"),
    },
  },
});
