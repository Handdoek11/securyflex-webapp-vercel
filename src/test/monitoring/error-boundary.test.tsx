import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as Sentry from '@sentry/nextjs'
import ErrorBoundary, { DashboardErrorBoundary, ApiErrorBoundary } from '@/components/monitoring/ErrorBoundary'
import { useRouter } from 'next/navigation'

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  showReportDialog: vi.fn(),
  withScope: vi.fn((callback) => callback({
    setTag: vi.fn(),
    setContext: vi.fn()
  }))
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

// Component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush
    })
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should catch errors and display error UI', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = vi.fn()

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Er is iets misgegaan')).toBeInTheDocument()
    expect(screen.getByText(/We hebben dit probleem geregistreerd/)).toBeInTheDocument()

    // Restore console.error
    console.error = originalError
  })

  it('should capture error with Sentry', () => {
    const originalError = console.error
    console.error = vi.fn()

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        contexts: expect.objectContaining({
          react: expect.objectContaining({
            componentStack: expect.any(String)
          })
        }),
        tags: expect.objectContaining({
          errorBoundary: true,
          component: 'SecuryFlexErrorBoundary'
        })
      })
    )

    console.error = originalError
  })

  it('should reset error when reset button is clicked', async () => {
    const originalError = console.error
    console.error = vi.fn()

    let shouldThrow = true

    function ToggleError() {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ToggleError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Er is iets misgegaan')).toBeInTheDocument()

    const resetButton = screen.getByRole('button', { name: /probeer opnieuw/i })

    // Reset the error state and re-render
    shouldThrow = false
    fireEvent.click(resetButton)

    // Wait for the component to reset and re-render
    await vi.waitFor(() => {
      rerender(
        <ErrorBoundary>
          <ToggleError />
        </ErrorBoundary>
      )
    })

    expect(screen.getByText('No error')).toBeInTheDocument()

    console.error = originalError
  })

  it('should navigate to dashboard when home button is clicked', () => {
    const originalError = console.error
    console.error = vi.fn()

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const homeButton = screen.getByRole('button', { name: /ga naar dashboard/i })
    fireEvent.click(homeButton)

    expect(mockPush).toHaveBeenCalledWith('/dashboard')

    console.error = originalError
  })

  it('should show development error details in development mode', () => {
    const originalError = console.error
    const originalEnv = process.env.NODE_ENV
    console.error = vi.fn()
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Development Error:')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()

    console.error = originalError
    process.env.NODE_ENV = originalEnv
  })

  describe('DashboardErrorBoundary', () => {
    it('should set dashboard-specific tags', () => {
      const originalError = console.error
      console.error = vi.fn()

      const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn()
      }

      ;(Sentry.withScope as any).mockImplementation((callback: any) => callback(mockScope))

      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      )

      expect(Sentry.captureException).toHaveBeenCalled()

      console.error = originalError
    })
  })

  describe('ApiErrorBoundary', () => {
    it('should set API-specific tags', () => {
      const originalError = console.error
      console.error = vi.fn()

      const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn()
      }

      ;(Sentry.withScope as any).mockImplementation((callback: any) => callback(mockScope))

      render(
        <ApiErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ApiErrorBoundary>
      )

      expect(Sentry.captureException).toHaveBeenCalled()

      console.error = originalError
    })

    it('should detect network errors', () => {
      const originalError = console.error
      console.error = vi.fn()

      const mockScope = {
        setTag: vi.fn(),
        setContext: vi.fn()
      }

      ;(Sentry.withScope as any).mockImplementation((callback: any) => callback(mockScope))

      function NetworkError() {
        throw new Error('fetch network error')
      }

      render(
        <ApiErrorBoundary>
          <NetworkError />
        </ApiErrorBoundary>
      )

      expect(Sentry.captureException).toHaveBeenCalled()

      console.error = originalError
    })
  })
})