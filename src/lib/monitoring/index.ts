// Central monitoring exports for SecuryFlex

// Core Sentry utilities
export { SecuryFlexMonitoring } from './sentry'

// API middleware
export {
  withMonitoring,
  monitorDatabaseOperation,
  trackSecurityEvent,
  trackBusinessEvent,
  withPerformanceMonitoring,
  setUserContext
} from './api-middleware'

// Component monitoring hooks
export {
  useComponentPerformance,
  useInteractionTracking,
  useApiCallTracking,
  useZZPEventTracking,
  useSecurityEventTracking,
  setupGlobalErrorHandling
} from './component-monitoring'

// Error boundaries
export {
  default as ErrorBoundary,
  DashboardErrorBoundary,
  ApiErrorBoundary
} from '../components/monitoring/ErrorBoundary'

// Setup function for application initialization
export function initializeMonitoring() {
  // Setup global error handling for unhandled promises and JS errors
  setupGlobalErrorHandling()

  // Log initialization
  console.log('📊 SecuryFlex monitoring initialized')

  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Sentry monitoring active')
  } else {
    console.log('🔧 Development mode - Enhanced logging enabled')
  }
}

// Type definitions for monitoring
export interface MonitoringConfig {
  enablePerformanceTracking?: boolean
  enableUserTracking?: boolean
  enableSecurityTracking?: boolean
  enableBusinessEventTracking?: boolean
  performanceThresholds?: {
    componentRender?: number
    apiCall?: number
    databaseQuery?: number
  }
}

// Default monitoring configuration
export const defaultMonitoringConfig: MonitoringConfig = {
  enablePerformanceTracking: true,
  enableUserTracking: true,
  enableSecurityTracking: true,
  enableBusinessEventTracking: true,
  performanceThresholds: {
    componentRender: 100, // 100ms
    apiCall: 5000, // 5 seconds
    databaseQuery: 2000 // 2 seconds
  }
}