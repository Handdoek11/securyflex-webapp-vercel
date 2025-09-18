"use client";

import { AlertTriangle, Home, RefreshCw, Shield } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Er is iets misgegaan
          </h2>
          <p className="text-sm text-muted-foreground">
            Er is een onverwachte fout opgetreden. Probeer de pagina te
            vernieuwen of neem contact op met de support.
          </p>
        </div>

        {!isProduction && (
          <div className="text-left p-4 bg-muted rounded-lg">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
              {error.name}: {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            onClick={resetError}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Probeer opnieuw
          </Button>
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Naar Dashboard
          </Button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Blijft dit probleem optreden?
            <br />
            <a
              href="mailto:support@securyflex.nl"
              className="text-primary hover:underline"
            >
              Neem contact op met support
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

// Minimal error fallback for smaller components
function MinimalErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
      <p className="text-sm text-red-700 dark:text-red-300 mb-2 text-center">
        Er is een fout opgetreden
      </p>
      <Button onClick={resetError} size="sm" variant="outline">
        <RefreshCw className="w-3 h-3 mr-1" />
        Opnieuw
      </Button>
    </div>
  );
}

// GPS-specific error fallback
function GPSErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
      <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
      <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
        GPS Service Fout
      </h3>
      <p className="text-sm text-orange-700 dark:text-orange-300 mb-4 text-center">
        Kan je locatie niet bepalen. Controleer je GPS instellingen en probeer
        opnieuw.
      </p>
      <div className="flex gap-2">
        <Button onClick={resetError} size="sm" variant="outline">
          <RefreshCw className="w-3 h-3 mr-1" />
          Probeer opnieuw
        </Button>
        <Button
          onClick={() =>
            window.open(
              "https://support.google.com/chrome/answer/142065",
              "_blank",
            )
          }
          size="sm"
          variant="ghost"
        >
          GPS Help
        </Button>
      </div>
    </div>
  );
}

// Main error boundary class component
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Report to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      // Analytics/error reporting would go here
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error("Error handled by useErrorHandler:", error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

// Async error handler for promises
export function useAsyncError() {
  const { handleError } = useErrorHandler();

  return React.useCallback(
    (error: Error) => {
      handleError(error);
    },
    [handleError],
  );
}

// Higher-order component wrapper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Specific error boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ErrorBoundary fallback={DefaultErrorFallback}>{children}</ErrorBoundary>;

export const ComponentErrorBoundary: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <ErrorBoundary fallback={MinimalErrorFallback}>{children}</ErrorBoundary>
);

export const GPSErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ErrorBoundary fallback={GPSErrorFallback}>{children}</ErrorBoundary>;

// Error types for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class GPSError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "GPSError";
  }
}

export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class PermissionError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "PermissionError";
  }
}

// Network error utilities
export function handleNetworkError(error: any): string {
  // Check if user is offline
  if (!navigator.onLine) {
    return "Geen internetverbinding. Controleer je netwerk en probeer opnieuw.";
  }

  // Handle fetch errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return "Kan geen verbinding maken met de server. Probeer later opnieuw.";
  }

  // Handle HTTP status errors
  if (error.status || error.response?.status) {
    const status = error.status || error.response.status;

    switch (status) {
      case 400:
        return "Ongeldige aanvraag. Controleer je gegevens en probeer opnieuw.";
      case 401:
        return "Je sessie is verlopen. Log opnieuw in.";
      case 403:
        return "Je hebt geen toegang tot deze functie.";
      case 404:
        return "De gevraagde informatie kon niet worden gevonden.";
      case 408:
        return "Verzoek verlopen. Probeer opnieuw.";
      case 409:
        return "Er is een conflict opgetreden. Ververs de pagina en probeer opnieuw.";
      case 422:
        return "De ingevoerde gegevens zijn niet geldig.";
      case 429:
        return "Te veel verzoeken. Wacht even en probeer opnieuw.";
      case 500:
        return "Server fout. Probeer later opnieuw.";
      case 502:
        return "Gateway fout. Probeer later opnieuw.";
      case 503:
        return "Service tijdelijk niet beschikbaar. Probeer later opnieuw.";
      case 504:
        return "Server timeout. Probeer opnieuw.";
      default:
        return `Netwerkfout (${status}). Probeer opnieuw.`;
    }
  }

  // Handle known error types
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return `Validatiefout: ${error.message}`;
  }

  if (error instanceof GPSError) {
    return `GPS fout: ${error.message}`;
  }

  if (error instanceof AuthenticationError) {
    return "Je moet inloggen om deze actie uit te voeren.";
  }

  if (error instanceof PermissionError) {
    return "Je hebt geen toestemming voor deze actie.";
  }

  // Generic error message
  return (
    error.message || "Er is een onverwachte fout opgetreden. Probeer opnieuw."
  );
}

// Retry mechanism with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (
        error instanceof AuthenticationError ||
        error instanceof PermissionError ||
        error instanceof ValidationError
      ) {
        throw lastError;
      }

      // Don't retry on client errors (4xx)
      if (
        error instanceof APIError &&
        error.status &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * backoffFactor ** attempt, maxDelay);

      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// API request wrapper with error handling
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code,
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new APIError(data.error || "API request failed", response.status);
    }

    return data.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new APIError("Netwerkfout - controleer je internetverbinding");
    }

    throw new APIError(error.message || "Onbekende fout opgetreden");
  }
}

// Safe async wrapper that catches errors
export function safeAsync<T extends any[], R>(fn: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<{ data?: R; error?: Error }> => {
    try {
      const data = await fn(...args);
      return { data };
    } catch (error) {
      console.error("Safe async error:", error);
      return {
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };
}
