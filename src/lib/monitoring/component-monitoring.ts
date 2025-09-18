"use client";

import * as Sentry from "@sentry/nextjs";
import { useCallback, useEffect } from "react";
import { SecuryFlexMonitoring } from "./sentry";

/**
 * Hook for tracking component performance
 */
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const transaction = SecuryFlexMonitoring.createTransaction(
      `Component: ${componentName}`,
      "component",
    );
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      // Track slow component renders
      if (duration > 100) {
        // 100ms threshold
        SecuryFlexMonitoring.trackBusinessEvent("slow_component_render", {
          component: componentName,
          duration,
          threshold: 100,
        });
      }

      transaction.finish();
    };
  }, [componentName]);
}

/**
 * Hook for tracking user interactions
 */
export function useInteractionTracking(componentName: string) {
  const trackClick = useCallback(
    (action: string, details?: Record<string, any>) => {
      SecuryFlexMonitoring.trackBusinessEvent("user_interaction", {
        component: componentName,
        action,
        timestamp: new Date().toISOString(),
        ...details,
      });

      // Add breadcrumb for debugging
      Sentry.addBreadcrumb({
        category: "ui",
        message: `User clicked: ${action}`,
        data: {
          component: componentName,
          ...details,
        },
        level: "info",
      });
    },
    [componentName],
  );

  const trackFormSubmit = useCallback(
    (formType: string, success: boolean, errors?: string[]) => {
      SecuryFlexMonitoring.trackBusinessEvent("form_submission", {
        component: componentName,
        formType,
        success,
        errors,
        timestamp: new Date().toISOString(),
      });

      if (!success && errors?.length) {
        Sentry.captureMessage(`Form submission failed: ${formType}`, {
          level: "warning",
          tags: {
            component: componentName,
            form_type: formType,
          },
          extra: {
            errors,
          },
        });
      }
    },
    [componentName],
  );

  const trackPageView = useCallback(
    (page: string, metadata?: Record<string, any>) => {
      SecuryFlexMonitoring.trackBusinessEvent("page_view", {
        component: componentName,
        page,
        timestamp: new Date().toISOString(),
        ...metadata,
      });

      Sentry.addBreadcrumb({
        category: "navigation",
        message: `Page viewed: ${page}`,
        data: {
          component: componentName,
          ...metadata,
        },
        level: "info",
      });
    },
    [componentName],
  );

  return {
    trackClick,
    trackFormSubmit,
    trackPageView,
  };
}

/**
 * Hook for tracking API calls from components
 */
export function useApiCallTracking(componentName: string) {
  const trackApiCall = useCallback(
    async <T>(
      endpoint: string,
      apiCall: () => Promise<T>,
      metadata?: Record<string, any>,
    ): Promise<T> => {
      const startTime = performance.now();
      const transaction = Sentry.startTransaction({
        name: `API Call: ${endpoint}`,
        op: "http.client",
        tags: {
          component: componentName,
          endpoint,
        },
      });

      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;

        // Track successful API call
        SecuryFlexMonitoring.trackBusinessEvent("api_call_success", {
          component: componentName,
          endpoint,
          duration,
          ...metadata,
        });

        transaction.setStatus("ok");
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        // Track failed API call
        SecuryFlexMonitoring.captureError(error as Error, {
          tags: {
            component: componentName,
            endpoint,
            api_call: "failed",
          },
          extra: {
            duration,
            ...metadata,
          },
        });

        transaction.setStatus("internal_error");
        throw error;
      } finally {
        transaction.finish();
      }
    },
    [componentName],
  );

  return { trackApiCall };
}

/**
 * Hook for tracking ZZP-specific business events
 */
export function useZZPEventTracking() {
  const trackJobApplication = useCallback(
    (jobId: string, success: boolean, error?: string) => {
      SecuryFlexMonitoring.trackBusinessEvent("zzp_job_application", {
        jobId,
        success,
        error,
        timestamp: new Date().toISOString(),
      });

      if (!success && error) {
        SecuryFlexMonitoring.trackSecurityEvent(
          "application_failed",
          "medium",
          {
            jobId,
            error,
            userAction: "job_application",
          },
        );
      }
    },
    [],
  );

  const trackShiftAction = useCallback(
    (
      action: "start" | "pause" | "resume" | "end",
      shiftId: string,
      location?: { lat: number; lng: number },
    ) => {
      SecuryFlexMonitoring.trackBusinessEvent("zzp_shift_action", {
        action,
        shiftId,
        location: location ? `${location.lat},${location.lng}` : undefined,
        timestamp: new Date().toISOString(),
      });

      // Track GPS accuracy for location-based actions
      if (location && (action === "start" || action === "end")) {
        SecuryFlexMonitoring.trackLocationEvent(
          `shift_${action}`,
          undefined,
          undefined,
        );
      }
    },
    [],
  );

  const trackPaymentEvent = useCallback(
    (
      event: "request" | "received" | "disputed",
      amount: number,
      shiftId?: string,
    ) => {
      SecuryFlexMonitoring.trackPaymentEvent(
        `zzp_payment_${event}`,
        amount,
        "EUR",
        {
          shiftId,
          timestamp: new Date().toISOString(),
        },
      );
    },
    [],
  );

  const trackDocumentUpload = useCallback(
    (
      documentType: string,
      fileSize: number,
      success: boolean,
      error?: string,
    ) => {
      SecuryFlexMonitoring.trackFileUpload(
        documentType,
        fileSize,
        success,
        error,
      );

      if (success) {
        SecuryFlexMonitoring.trackBusinessEvent("zzp_document_uploaded", {
          documentType,
          fileSize,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [],
  );

  return {
    trackJobApplication,
    trackShiftAction,
    trackPaymentEvent,
    trackDocumentUpload,
  };
}

/**
 * Hook for tracking security-related events
 */
export function useSecurityEventTracking() {
  const trackSuspiciousActivity = useCallback(
    (activity: string, details?: Record<string, any>) => {
      SecuryFlexMonitoring.trackSecurityEvent("suspicious_activity", "high", {
        activity,
        timestamp: new Date().toISOString(),
        ...details,
      });
    },
    [],
  );

  const trackAuthenticationEvent = useCallback(
    (
      event: "login" | "logout" | "failed_login",
      details?: Record<string, any>,
    ) => {
      const eventMap = {
        login: "login_success",
        logout: "logout",
        failed_login: "login_failed",
      } as const;

      SecuryFlexMonitoring.trackSecurityEvent(
        eventMap[event],
        event === "failed_login" ? "medium" : "low",
        {
          timestamp: new Date().toISOString(),
          ...details,
        },
      );
    },
    [],
  );

  const trackDataAccess = useCallback(
    (
      dataType: string,
      action: "read" | "write" | "delete",
      authorized: boolean,
    ) => {
      if (!authorized) {
        SecuryFlexMonitoring.trackSecurityEvent("unauthorized_access", "high", {
          dataType,
          action,
          timestamp: new Date().toISOString(),
        });
      } else {
        Sentry.addBreadcrumb({
          category: "security",
          message: `Data access: ${action} ${dataType}`,
          data: {
            dataType,
            action,
            authorized,
          },
          level: "info",
        });
      }
    },
    [],
  );

  return {
    trackSuspiciousActivity,
    trackAuthenticationEvent,
    trackDataAccess,
  };
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandling() {
  if (typeof window !== "undefined") {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      SecuryFlexMonitoring.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          tags: {
            error_type: "unhandled_promise_rejection",
            global_handler: "true",
          },
          extra: {
            reason: event.reason,
            promise: event.promise,
          },
        },
      );
    });

    // Handle global JavaScript errors
    window.addEventListener("error", (event) => {
      SecuryFlexMonitoring.captureError(
        event.error || new Error(event.message),
        {
          tags: {
            error_type: "javascript_error",
            global_handler: "true",
          },
          extra: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
      );
    });
  }
}
