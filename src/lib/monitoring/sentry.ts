import * as Sentry from '@sentry/nextjs'
import type { User } from 'next-auth'

// Custom Sentry utilities for SecuryFlex
export class SecuryFlexMonitoring {

  /**
   * Set user context for Sentry tracking
   */
  static setUserContext(user: User) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      role: user.role,
      segment: this.getUserSegment(user.role)
    })

    // Set user-specific tags
    Sentry.setTag('user.role', user.role)
    Sentry.setTag('user.segment', this.getUserSegment(user.role))
    Sentry.setTag('user.hasCompletedProfile', user.hasCompletedProfile)
  }

  /**
   * Clear user context (on logout)
   */
  static clearUserContext() {
    Sentry.setUser(null)
    Sentry.setTag('user.role', null)
    Sentry.setTag('user.segment', null)
  }

  /**
   * Track business events
   */
  static trackBusinessEvent(event: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'business',
      message: event,
      data,
      level: 'info'
    })

    // Also send as custom event for analytics
    Sentry.captureMessage(`Business Event: ${event}`, {
      level: 'info',
      tags: {
        event_type: 'business',
        event_name: event
      },
      extra: data
    })
  }

  /**
   * Track API performance
   */
  static trackApiPerformance(endpoint: string, method: string, duration: number, status: number) {
    const transaction = Sentry.getActiveTransaction()
    if (transaction) {
      const span = transaction.startChild({
        op: 'http.server',
        description: `${method} ${endpoint}`
      })

      span.setTag('http.method', method)
      span.setTag('http.status_code', status)
      span.setData('duration', duration)

      if (status >= 400) {
        span.setStatus('internal_error')
      } else {
        span.setStatus('ok')
      }

      span.finish()
    }

    // Track slow API calls
    if (duration > 5000) { // 5 seconds
      Sentry.captureMessage(`Slow API Response: ${method} ${endpoint}`, {
        level: 'warning',
        tags: {
          endpoint,
          method,
          performance: 'slow'
        },
        extra: {
          duration,
          status
        }
      })
    }
  }

  /**
   * Track database operations
   */
  static trackDatabaseOperation(operation: string, table: string, duration: number, error?: Error) {
    const span = Sentry.getActiveSpan()
    const childSpan = span?.startChild({
      op: 'db',
      description: `${operation} ${table}`
    })

    if (childSpan) {
      childSpan.setTag('db.operation', operation)
      childSpan.setTag('db.table', table)
      childSpan.setData('duration', duration)

      if (error) {
        childSpan.setStatus('internal_error')
        childSpan.setData('error', error.message)
      } else {
        childSpan.setStatus('ok')
      }

      childSpan.finish()
    }

    // Track slow database queries
    if (duration > 2000) { // 2 seconds
      Sentry.captureMessage(`Slow Database Query: ${operation} on ${table}`, {
        level: 'warning',
        tags: {
          operation,
          table,
          performance: 'slow'
        },
        extra: {
          duration,
          error: error?.message
        }
      })
    }
  }

  /**
   * Track rate limiting events
   */
  static trackRateLimit(endpoint: string, ip: string, limit: number, remaining: number) {
    Sentry.addBreadcrumb({
      category: 'security',
      message: 'Rate limit check',
      data: {
        endpoint,
        ip: this.anonymizeIP(ip),
        limit,
        remaining
      },
      level: remaining <= 5 ? 'warning' : 'info'
    })

    // Alert on rate limit abuse
    if (remaining === 0) {
      Sentry.captureMessage(`Rate Limit Exceeded: ${endpoint}`, {
        level: 'warning',
        tags: {
          endpoint,
          security: 'rate_limit',
          action: 'blocked'
        },
        extra: {
          ip: this.anonymizeIP(ip),
          limit
        }
      })
    }
  }

  /**
   * Track security events
   */
  static trackSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', details?: Record<string, any>) {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info'

    Sentry.captureMessage(`Security Event: ${event}`, {
      level,
      tags: {
        security: 'event',
        severity,
        event_type: event
      },
      extra: details
    })

    // Add security breadcrumb
    Sentry.addBreadcrumb({
      category: 'security',
      message: event,
      data: details,
      level
    })
  }

  /**
   * Track payment events
   */
  static trackPaymentEvent(event: string, amount?: number, currency = 'EUR', details?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'payment',
      message: `Payment: ${event}`,
      data: {
        amount,
        currency,
        ...details
      },
      level: 'info'
    })

    // Track payment failures as warnings
    if (event.includes('failed') || event.includes('error')) {
      Sentry.captureMessage(`Payment Issue: ${event}`, {
        level: 'warning',
        tags: {
          payment: 'event',
          status: 'failed'
        },
        extra: {
          amount,
          currency,
          ...details
        }
      })
    }
  }

  /**
   * Track GPS/location events
   */
  static trackLocationEvent(event: string, accuracy?: number, error?: string) {
    Sentry.addBreadcrumb({
      category: 'location',
      message: `GPS: ${event}`,
      data: {
        accuracy,
        error
      },
      level: error ? 'error' : 'info'
    })

    // Track location permission issues
    if (error) {
      Sentry.captureMessage(`GPS Issue: ${event}`, {
        level: 'warning',
        tags: {
          feature: 'gps',
          status: 'error'
        },
        extra: {
          error,
          accuracy
        }
      })
    }
  }

  /**
   * Track file upload events
   */
  static trackFileUpload(type: string, size: number, success: boolean, error?: string) {
    Sentry.addBreadcrumb({
      category: 'upload',
      message: `File upload: ${type}`,
      data: {
        type,
        size,
        success,
        error
      },
      level: success ? 'info' : 'error'
    })

    if (!success && error) {
      Sentry.captureMessage(`File Upload Failed: ${type}`, {
        level: 'warning',
        tags: {
          feature: 'upload',
          file_type: type
        },
        extra: {
          size,
          error
        }
      })
    }
  }

  /**
   * Set request context for API routes
   */
  static setRequestContext(method: string, url: string, userAgent?: string, ip?: string) {
    Sentry.setTag('http.method', method)
    Sentry.setTag('http.url', url)

    Sentry.setContext('request', {
      method,
      url,
      user_agent: userAgent,
      ip: ip ? this.anonymizeIP(ip) : undefined
    })
  }

  /**
   * Track feature usage
   */
  static trackFeatureUsage(feature: string, user_role: string, success: boolean = true) {
    Sentry.addBreadcrumb({
      category: 'feature',
      message: `Feature used: ${feature}`,
      data: {
        feature,
        user_role,
        success
      },
      level: 'info'
    })
  }

  /**
   * Create performance transaction
   */
  static createTransaction(name: string, op: string = 'navigation') {
    return Sentry.startTransaction({
      name,
      op,
      tags: {
        application: 'securyflex'
      }
    })
  }

  /**
   * Handle and report errors with context
   */
  static captureError(error: Error, context?: {
    user?: User
    extra?: Record<string, any>
    tags?: Record<string, string>
  }) {
    Sentry.withScope((scope) => {
      if (context?.user) {
        this.setUserContext(context.user)
      }

      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value)
        })
      }

      if (context?.extra) {
        scope.setExtra('context', context.extra)
      }

      Sentry.captureException(error)
    })
  }

  // Private helper methods

  private static getUserSegment(role: string): string {
    switch (role) {
      case 'ZZP_BEVEILIGER':
        return 'security_professional'
      case 'BEDRIJF':
        return 'security_company'
      case 'OPDRACHTGEVER':
        return 'client'
      case 'ADMIN':
        return 'admin'
      default:
        return 'unknown'
    }
  }

  private static anonymizeIP(ip: string): string {
    // Anonymize IP for privacy compliance
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`
    }
    // For IPv6, anonymize the last 64 bits
    if (ip.includes(':')) {
      const ipv6Parts = ip.split(':')
      return `${ipv6Parts.slice(0, 4).join(':')}:xxxx:xxxx:xxxx:xxxx`
    }
    return 'xxx.xxx.xxx.xxx'
  }
}

// Export convenience functions
export const {
  setUserContext,
  clearUserContext,
  trackBusinessEvent,
  trackApiPerformance,
  trackDatabaseOperation,
  trackRateLimit,
  trackSecurityEvent,
  trackPaymentEvent,
  trackLocationEvent,
  trackFileUpload,
  setRequestContext,
  trackFeatureUsage,
  createTransaction,
  captureError
} = SecuryFlexMonitoring