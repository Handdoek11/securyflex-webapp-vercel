import { NextRequest, NextResponse } from 'next/server'
import { SecuryFlexMonitoring } from './sentry'

/**
 * Monitoring middleware wrapper for API routes
 */
export function withMonitoring<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: {
    operation?: string
    feature?: string
    trackPerformance?: boolean
  } = {}
): T {
  const { operation = 'api', feature, trackPerformance = true } = options

  return (async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    const method = req.method
    const pathname = req.nextUrl.pathname

    // Set request context
    SecuryFlexMonitoring.setRequestContext(
      method,
      pathname,
      req.headers.get('user-agent') || undefined,
      req.headers.get('x-forwarded-for') || req.ip
    )

    // Create transaction for performance tracking
    const transaction = SecuryFlexMonitoring.createTransaction(
      `${method} ${pathname}`,
      operation
    )

    try {
      // Track feature usage if specified
      if (feature) {
        // We'll get user role from the request if available
        const authHeader = req.headers.get('authorization')
        SecuryFlexMonitoring.trackFeatureUsage(feature, 'unknown') // Role will be updated when auth is parsed
      }

      // Execute the handler
      const response = await handler(req, ...args)

      const duration = Date.now() - startTime
      const status = response.status

      // Track API performance
      if (trackPerformance) {
        SecuryFlexMonitoring.trackApiPerformance(pathname, method, duration, status)
      }

      // Track success business event
      if (status >= 200 && status < 300) {
        SecuryFlexMonitoring.trackBusinessEvent('api_success', {
          endpoint: pathname,
          method,
          duration,
          status
        })
      }

      // Set transaction status
      transaction.setHttpStatus(status)
      transaction.setTag('http.method', method)
      transaction.setTag('http.status_code', status)

      return response

    } catch (error) {
      const duration = Date.now() - startTime

      // Track error
      SecuryFlexMonitoring.captureError(error as Error, {
        tags: {
          endpoint: pathname,
          method,
          operation,
          feature: feature || 'unknown'
        },
        extra: {
          duration,
          request_id: req.headers.get('x-request-id'),
          user_agent: req.headers.get('user-agent')
        }
      })

      // Track business event for errors
      SecuryFlexMonitoring.trackBusinessEvent('api_error', {
        endpoint: pathname,
        method,
        duration,
        error: (error as Error).message
      })

      // Set transaction status
      transaction.setHttpStatus(500)
      transaction.setTag('error', true)

      // Re-throw the error to be handled by the application
      throw error

    } finally {
      // Finish the transaction
      transaction.finish()
    }
  }) as T
}

/**
 * Database operation monitoring decorator
 */
export function monitorDatabaseOperation<T extends (...args: any[]) => Promise<any>>(
  operation: string,
  table: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now()

    try {
      const result = await fn(...args)
      const duration = Date.now() - startTime

      SecuryFlexMonitoring.trackDatabaseOperation(operation, table, duration)

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      SecuryFlexMonitoring.trackDatabaseOperation(operation, table, duration, error as Error)

      throw error
    }
  }) as T
}

/**
 * Security event tracker for authentication and authorization
 */
export function trackSecurityEvent(
  event: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access' | 'rate_limit_exceeded' | 'suspicious_activity',
  details?: Record<string, any>
) {
  const severityMap = {
    'login_success': 'low' as const,
    'login_failed': 'medium' as const,
    'logout': 'low' as const,
    'unauthorized_access': 'high' as const,
    'rate_limit_exceeded': 'medium' as const,
    'suspicious_activity': 'high' as const
  }

  SecuryFlexMonitoring.trackSecurityEvent(event, severityMap[event], details)
}

/**
 * Business event tracker for key user actions
 */
export function trackBusinessEvent(
  event: 'user_registered' | 'profile_completed' | 'job_posted' | 'application_submitted' |
         'job_accepted' | 'payment_processed' | 'shift_started' | 'shift_completed' |
         'review_submitted' | 'dispute_created',
  data?: Record<string, any>
) {
  SecuryFlexMonitoring.trackBusinessEvent(event, data)
}

/**
 * Performance monitor for critical paths
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  options: {
    warnThreshold?: number // milliseconds
    errorThreshold?: number // milliseconds
  } = {}
): T {
  const { warnThreshold = 5000, errorThreshold = 10000 } = options

  return (async (...args: any[]) => {
    const transaction = SecuryFlexMonitoring.createTransaction(name, 'function')
    const startTime = Date.now()

    try {
      const result = await fn(...args)
      const duration = Date.now() - startTime

      // Log performance warnings
      if (duration > errorThreshold) {
        SecuryFlexMonitoring.captureError(new Error(`Performance critical: ${name} took ${duration}ms`), {
          tags: {
            performance: 'critical',
            operation: name
          },
          extra: { duration, threshold: errorThreshold }
        })
      } else if (duration > warnThreshold) {
        SecuryFlexMonitoring.trackBusinessEvent('performance_warning', {
          operation: name,
          duration,
          threshold: warnThreshold
        })
      }

      transaction.setStatus('ok')
      return result

    } catch (error) {
      const duration = Date.now() - startTime

      SecuryFlexMonitoring.captureError(error as Error, {
        tags: {
          operation: name,
          performance: 'error'
        },
        extra: { duration }
      })

      transaction.setStatus('internal_error')
      throw error

    } finally {
      transaction.finish()
    }
  }) as T
}

/**
 * User context helper for API routes
 */
export function setUserContext(user: {
  id: string
  email?: string | null
  name?: string | null
  role: string
  hasCompletedProfile?: boolean
}) {
  SecuryFlexMonitoring.setUserContext(user as any)
}