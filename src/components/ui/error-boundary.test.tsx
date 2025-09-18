import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  APIError,
  ErrorBoundary,
  GPSError,
  handleNetworkError,
  retryWithBackoff,
  useErrorHandler,
  ValidationError,
} from "./error-boundary";

// Mock console methods to avoid test noise
const originalError = console.error;
const originalLog = console.log;

beforeEach(() => {
  console.error = vi.fn();
  console.log = vi.fn();
});

afterEach(() => {
  console.error = originalError;
  console.log = originalLog;
});

// Test component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

// Test component for GPS errors
const ThrowGPSError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new GPSError("GPS permission denied", "PERMISSION_DENIED");
  }
  return <div>GPS working</div>;
};

// Test component for validation errors
const _ThrowValidationError = ({
  shouldThrow = false,
}: {
  shouldThrow?: boolean;
}) => {
  if (shouldThrow) {
    throw new ValidationError("Invalid email format", "email");
  }
  return <div>Validation passed</div>;
};

describe("ErrorBoundary", () => {
  it("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("should render default error fallback when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Er is iets misgegaan")).toBeInTheDocument();
    expect(
      screen.getByText(/Er is een onverwachte fout opgetreden/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /probeer opnieuw/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /naar dashboard/i }),
    ).toBeInTheDocument();
  });

  it("should show error details in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("should hide error details in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(
      screen.queryByText(/Error: Test error message/),
    ).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("should reset error when reset button is clicked", () => {
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error("Test error message");
      }
      return <div>No error</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Er is iets misgegaan")).toBeInTheDocument();

    const resetButton = screen.getByRole("button", {
      name: /probeer opnieuw/i,
    });
    shouldThrow = false;

    fireEvent.click(resetButton);

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });

  it("should render custom fallback component", () => {
    const CustomFallback = ({ error, resetError }: any) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={resetError}>Custom Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /custom reset/i }),
    ).toBeInTheDocument();
  });
});

describe("GPS Error Boundary", () => {
  it("should render GPS-specific error fallback", () => {
    render(
      <ErrorBoundary
        fallback={({ error, resetError }) => {
          if (error instanceof GPSError) {
            return (
              <div>
                <h3>GPS Service Fout</h3>
                <p>Kan je locatie niet bepalen</p>
                <button onClick={resetError}>GPS Probeer opnieuw</button>
              </div>
            );
          }
          return <div>Generic error</div>;
        }}
      >
        <ThrowGPSError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("GPS Service Fout")).toBeInTheDocument();
    expect(screen.getByText(/Kan je locatie niet bepalen/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /gps probeer opnieuw/i }),
    ).toBeInTheDocument();
  });
});

describe("useErrorHandler", () => {
  it("should handle errors correctly", () => {
    let errorHandler: any;
    let resetError: any;

    const TestComponent = () => {
      const { handleError, resetError: reset } = useErrorHandler();
      errorHandler = handleError;
      resetError = reset;
      return <div>Test component</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Test component")).toBeInTheDocument();

    // This would trigger the error boundary in a real scenario
    expect(errorHandler).toBeDefined();
    expect(resetError).toBeDefined();
  });
});

describe("Error Classes", () => {
  it("should create APIError with correct properties", () => {
    const error = new APIError("API request failed", 404, "NOT_FOUND");

    expect(error.name).toBe("APIError");
    expect(error.message).toBe("API request failed");
    expect(error.status).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error instanceof Error).toBe(true);
  });

  it("should create ValidationError with correct properties", () => {
    const error = new ValidationError("Invalid email format", "email");

    expect(error.name).toBe("ValidationError");
    expect(error.message).toBe("Invalid email format");
    expect(error.field).toBe("email");
    expect(error instanceof Error).toBe(true);
  });

  it("should create GPSError with correct properties", () => {
    const error = new GPSError("GPS permission denied", "PERMISSION_DENIED");

    expect(error.name).toBe("GPSError");
    expect(error.message).toBe("GPS permission denied");
    expect(error.code).toBe("PERMISSION_DENIED");
    expect(error instanceof Error).toBe(true);
  });
});

describe("handleNetworkError", () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
  });

  it("should return offline message when no connection", () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
    });

    const error = new Error("Fetch failed");
    const message = handleNetworkError(error);

    expect(message).toBe(
      "Geen internetverbinding. Controleer je netwerk en probeer opnieuw.",
    );
  });

  it("should handle fetch errors", () => {
    const error = new TypeError("Failed to fetch");
    const message = handleNetworkError(error);

    expect(message).toBe(
      "Kan geen verbinding maken met de server. Probeer later opnieuw.",
    );
  });

  it("should handle HTTP status errors", () => {
    const error = { status: 404 };
    const message = handleNetworkError(error);

    expect(message).toBe("De gevraagde informatie kon niet worden gevonden.");
  });

  it("should handle 401 unauthorized", () => {
    const error = { status: 401 };
    const message = handleNetworkError(error);

    expect(message).toBe("Je sessie is verlopen. Log opnieuw in.");
  });

  it("should handle 429 rate limiting", () => {
    const error = { status: 429 };
    const message = handleNetworkError(error);

    expect(message).toBe("Te veel verzoeken. Wacht even en probeer opnieuw.");
  });

  it("should handle 500 server error", () => {
    const error = { status: 500 };
    const message = handleNetworkError(error);

    expect(message).toBe("Server fout. Probeer later opnieuw.");
  });

  it("should handle APIError instances", () => {
    const error = new APIError("Custom API error");
    const message = handleNetworkError(error);

    expect(message).toBe("Custom API error");
  });

  it("should handle ValidationError instances", () => {
    const error = new ValidationError("Invalid input");
    const message = handleNetworkError(error);

    expect(message).toBe("Validatiefout: Invalid input");
  });

  it("should handle generic errors", () => {
    const error = new Error("Generic error");
    const message = handleNetworkError(error);

    expect(message).toBe("Generic error");
  });

  it("should handle unknown errors", () => {
    const error = {};
    const message = handleNetworkError(error);

    expect(message).toBe(
      "Er is een onverwachte fout opgetreden. Probeer opnieuw.",
    );
  });
});

describe("retryWithBackoff", () => {
  it("should succeed on first try", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const result = await retryWithBackoff(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and eventually succeed", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("First attempt"))
      .mockRejectedValueOnce(new Error("Second attempt"))
      .mockResolvedValue("success");

    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should not retry ValidationError", async () => {
    const fn = vi.fn().mockRejectedValue(new ValidationError("Invalid input"));

    await expect(retryWithBackoff(fn)).rejects.toThrow("Invalid input");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should not retry 4xx client errors", async () => {
    const fn = vi.fn().mockRejectedValue(new APIError("Bad request", 400));

    await expect(retryWithBackoff(fn)).rejects.toThrow("Bad request");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry 5xx server errors", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new APIError("Server error", 500))
      .mockResolvedValue("success");

    const result = await retryWithBackoff(fn, { baseDelay: 10 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should fail after max retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Always fails"));

    await expect(
      retryWithBackoff(fn, { maxRetries: 2, baseDelay: 10 }),
    ).rejects.toThrow("Always fails");
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });
});
