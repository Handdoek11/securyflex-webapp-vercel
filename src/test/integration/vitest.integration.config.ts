import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'integration',
    environment: 'node',
    setupFiles: [path.resolve(__dirname, '../setup.ts')],

    // Integration tests may take longer
    testTimeout: 30000,
    hookTimeout: 10000,

    // Coverage for integration tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      include: ['src/app/api/**/*.ts'],
      exclude: [
        'src/test/**',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },

    // Parallel execution for integration tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 2
      }
    },

    // Separate integration test reports
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results/integration-results.json'
    },

    // Globals for integration testing
    globals: true,

    // Integration test specific settings
    sequence: {
      shuffle: true, // Randomize test execution order
      concurrent: true
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../'),
      '@/lib': path.resolve(__dirname, '../../lib'),
      '@/app': path.resolve(__dirname, '../../app'),
      '@/components': path.resolve(__dirname, '../../components')
    }
  }
})