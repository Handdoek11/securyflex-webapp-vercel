'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  showDialog?: boolean
  beforeCapture?: (scope: Sentry.Scope, error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  eventId?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  eventId: string | null
}

class SecuryFlexErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      eventId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      },
      tags: {
        errorBoundary: true,
        component: 'SecuryFlexErrorBoundary'
      }
    })

    this.setState({ eventId })

    // Custom beforeCapture hook
    if (this.props.beforeCapture) {
      Sentry.withScope((scope) => {
        this.props.beforeCapture?.(scope, error, errorInfo)
      })
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      eventId: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          eventId={this.state.eventId || undefined}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError, eventId }: ErrorFallbackProps) {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  const handleReportFeedback = () => {
    if (eventId) {
      Sentry.showReportDialog({ eventId })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Er is iets misgegaan
        </h1>

        <p className="text-gray-600 mb-6">
          We hebben dit probleem geregistreerd en werken aan een oplossing.
          Probeer de pagina te vernieuwen of ga terug naar het dashboard.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-left">
            <p className="text-sm text-red-800 font-medium mb-1">Development Error:</p>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {eventId && (
          <p className="text-xs text-gray-500 mb-4">
            Error ID: {eventId}
          </p>
        )}

        <div className="space-y-3">
          <Button
            onClick={resetError}
            className="w-full"
            variant="default"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Probeer opnieuw
          </Button>

          <Button
            onClick={handleGoHome}
            className="w-full"
            variant="outline"
          >
            <Home className="h-4 w-4 mr-2" />
            Ga naar dashboard
          </Button>

          {eventId && (
            <Button
              onClick={handleReportFeedback}
              className="w-full"
              variant="ghost"
              size="sm"
            >
              Probleem melden
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Convenience wrapper for common use cases
export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SecuryFlexErrorBoundary
      beforeCapture={(scope, error, errorInfo) => {
        scope.setTag('boundary_type', 'dashboard')
        scope.setContext('component_info', {
          componentStack: errorInfo.componentStack
        })
      }}
    >
      {children}
    </SecuryFlexErrorBoundary>
  )
}

// API Error boundary for data fetching components
export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SecuryFlexErrorBoundary
      beforeCapture={(scope, error, errorInfo) => {
        scope.setTag('boundary_type', 'api')
        scope.setTag('error_category', 'data_fetching')

        // Check if it's a network error
        if (error.message.includes('fetch') || error.message.includes('network')) {
          scope.setTag('error_type', 'network')
        }
      }}
    >
      {children}
    </SecuryFlexErrorBoundary>
  )
}

export default SecuryFlexErrorBoundary