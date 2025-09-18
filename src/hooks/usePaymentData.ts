import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useApiData } from "./useApiData";

// Types for payment data
export interface PaymentStatus {
  id: string;
  betalingsAanvraagId: string;
  finqlePaymentId?: string;
  amount: number;
  status: "AANGEVRAAGD" | "VERWERKT" | "BETAALD" | "GEFAALD";
  createdAt: string;
  verwerkingsDatum?: string;
  uitbetalingsDatum?: string;
  referentie: string;
  opmerkingen?: string;
}

export interface KycStatus {
  status: "PENDING" | "VERIFIED" | "REJECTED";
  documentsRequired: string[];
  lastUpdate: string;
  rejectionReason?: string;
}

export interface FinqleNotification {
  id: string;
  type:
    | "payment_received"
    | "payment_failed"
    | "kyc_approved"
    | "kyc_rejected"
    | "payout_initiated";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  amount?: number;
  error?: string;
}

// Hook for payment status management
export function usePaymentStatus(zzpProfileId?: string) {
  const endpoint = zzpProfileId
    ? `/api/payments/status?zzpProfileId=${zzpProfileId}`
    : "/api/payments/status";

  const { data, loading, error, refetch } = useApiData<{
    payments: PaymentStatus[];
    summary: {
      totalRequested: number;
      totalPaid: number;
      totalPending: number;
      totalFailed: number;
    };
    kycStatus: KycStatus;
  }>({
    endpoint,
    requireAuth: true,
    refreshInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const requestPayout = useCallback(
    async (payoutData: { amount: number; description?: string }) => {
      try {
        const response = await fetch("/api/payments/request-payout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payoutData),
        });

        if (!response.ok) {
          throw new Error("Failed to request payout");
        }

        const result = await response.json();
        await refetch(); // Refresh payment data
        return result;
      } catch (error) {
        console.error("Error requesting payout:", error);
        throw error;
      }
    },
    [refetch],
  );

  const retryFailedPayment = useCallback(
    async (paymentId: string) => {
      try {
        const response = await fetch("/api/payments/retry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentId }),
        });

        if (!response.ok) {
          throw new Error("Failed to retry payment");
        }

        const result = await response.json();
        await refetch(); // Refresh payment data
        return result;
      } catch (error) {
        console.error("Error retrying payment:", error);
        throw error;
      }
    },
    [refetch],
  );

  return {
    payments: data?.payments || [],
    summary: data?.summary,
    kycStatus: data?.kycStatus,
    loading,
    error,
    refetch,
    requestPayout,
    retryFailedPayment,
  };
}

// Hook for KYC document management
export function useKycManagement() {
  const { data, loading, error, refetch } = useApiData<{
    status: KycStatus;
    requiredDocuments: Array<{
      type: string;
      name: string;
      required: boolean;
      uploaded: boolean;
      status?: "pending" | "approved" | "rejected";
      rejectionReason?: string;
    }>;
    uploadUrl?: string;
  }>({
    endpoint: "/api/kyc/status",
    requireAuth: true,
  });

  const uploadDocument = useCallback(
    async (documentData: { type: string; file: File }) => {
      try {
        const formData = new FormData();
        formData.append("type", documentData.type);
        formData.append("file", documentData.file);

        const response = await fetch("/api/kyc/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload document");
        }

        const result = await response.json();
        await refetch(); // Refresh KYC status
        return result;
      } catch (error) {
        console.error("Error uploading document:", error);
        throw error;
      }
    },
    [refetch],
  );

  const resubmitKyc = useCallback(async () => {
    try {
      const response = await fetch("/api/kyc/resubmit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to resubmit KYC");
      }

      const result = await response.json();
      await refetch(); // Refresh KYC status
      return result;
    } catch (error) {
      console.error("Error resubmitting KYC:", error);
      throw error;
    }
  }, [refetch]);

  return {
    kycStatus: data?.status,
    requiredDocuments: data?.requiredDocuments || [],
    uploadUrl: data?.uploadUrl,
    loading,
    error,
    refetch,
    uploadDocument,
    resubmitKyc,
  };
}

// Hook for payment notifications
export function usePaymentNotifications(filters?: {
  unreadOnly?: boolean;
  type?: string;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.unreadOnly) queryParams.set("unreadOnly", "true");
  if (filters?.type) queryParams.set("type", filters.type);
  if (filters?.limit) queryParams.set("limit", filters.limit.toString());

  const endpoint = `/api/payments/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const { data, loading, error, refetch } = useApiData<{
    notifications: FinqleNotification[];
    unreadCount: number;
  }>({
    endpoint,
    requireAuth: true,
    refreshInterval: 15000, // Refresh every 15 seconds for notifications
  });

  const markAsRead = useCallback(
    async (notificationIds: string[]) => {
      try {
        const response = await fetch("/api/payments/notifications/read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationIds }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark notifications as read");
        }

        const result = await response.json();
        await refetch(); // Refresh notifications
        return result;
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        throw error;
      }
    },
    [refetch],
  );

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    loading,
    error,
    refetch,
    markAsRead,
  };
}

// Hook for real-time payment updates via WebSocket/SSE
export function usePaymentRealtime(userId?: string) {
  const [lastPaymentUpdate, setLastPaymentUpdate] = useState<Date>(new Date());
  const [paymentEvents, setPaymentEvents] = useState<
    Array<{
      type: string;
      data: any;
      timestamp: Date;
    }>
  >([]);

  useEffect(() => {
    if (!userId) return;

    // Set up real-time connection for payment updates
    // This would typically connect to Supabase real-time or WebSocket

    // For now, we'll use polling as a fallback
    const interval = setInterval(() => {
      // Check for payment updates
      fetch("/api/payments/check-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          lastCheck: lastPaymentUpdate.toISOString(),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.updates.length > 0) {
            setPaymentEvents((prev) => [...prev, ...data.updates]);
            setLastPaymentUpdate(new Date());
          }
        })
        .catch((error) => {
          console.error("Error checking payment updates:", error);
        });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [userId, lastPaymentUpdate]);

  const clearEvents = useCallback(() => {
    setPaymentEvents([]);
  }, []);

  return {
    paymentEvents,
    lastUpdate: lastPaymentUpdate,
    clearEvents,
  };
}

// Hook for batch payment operations (for bedrijf)
export function useBatchPayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processBatchPayout = useCallback(
    async (paymentData: {
      zzpPayments: Array<{
        zzpProfileId: string;
        amount: number;
        description?: string;
        workHours?: string[];
      }>;
      batchId?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/payments/batch-payout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          throw new Error("Failed to process batch payout");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        console.error("Error processing batch payout:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getBatchStatus = useCallback(async (batchId: string) => {
    try {
      const response = await fetch(`/api/payments/batch-status/${batchId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get batch status");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error getting batch status:", error);
      throw error;
    }
  }, []);

  return {
    processBatchPayout,
    getBatchStatus,
    loading,
    error,
  };
}

// Hook for Finqle integration status
export function useFinqleIntegration() {
  const { data: session } = useSession();

  const { data, loading, error, refetch } = useApiData<{
    connected: boolean;
    userId?: string;
    accountStatus: "active" | "pending" | "suspended";
    capabilities: {
      canReceivePayments: boolean;
      canSendPayments: boolean;
      batchPayoutsEnabled: boolean;
    };
    limits: {
      dailyLimit: number;
      monthlyLimit: number;
      currentDailyUsage: number;
      currentMonthlyUsage: number;
    };
    lastSync: string;
  }>({
    endpoint: "/api/payments/finqle-status",
    requireAuth: true,
  });

  const connectToFinqle = useCallback(
    async (userData: {
      companyName?: string;
      taxId?: string;
      businessType?: string;
    }) => {
      try {
        const response = await fetch("/api/payments/connect-finqle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error("Failed to connect to Finqle");
        }

        const result = await response.json();
        await refetch(); // Refresh integration status
        return result;
      } catch (error) {
        console.error("Error connecting to Finqle:", error);
        throw error;
      }
    },
    [refetch],
  );

  const syncWithFinqle = useCallback(async () => {
    try {
      const response = await fetch("/api/payments/sync-finqle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync with Finqle");
      }

      const result = await response.json();
      await refetch(); // Refresh integration status
      return result;
    } catch (error) {
      console.error("Error syncing with Finqle:", error);
      throw error;
    }
  }, [refetch]);

  return {
    integrationStatus: data,
    loading,
    error,
    refetch,
    connectToFinqle,
    syncWithFinqle,
  };
}
