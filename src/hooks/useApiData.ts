"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface UseApiDataOptions<T = unknown> {
  endpoint: string;
  fallbackData?: T;
  requireAuth?: boolean;
  params?: Record<string, string>;
  enabled?: boolean;
  refreshInterval?: number;
}

interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

/**
 * Generic hook for fetching data from API endpoints
 * Automatically handles loading states, errors, and fallback to mock data
 */
export function useApiData<T = unknown>({
  endpoint,
  fallbackData = null as T | null,
  requireAuth = true,
  params = {},
  enabled = true,
  refreshInterval = 0,
}: UseApiDataOptions<T>): UseApiDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build URL with query params
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error(
          `API endpoint not found or error: ${url.toString()} - Status: ${response.status}`,
        );
        throw new Error(
          `API error: ${response.statusText} (${response.status}) - Endpoint: ${endpoint}`,
        );
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Use fallback data if provided
      if (fallbackData) {
        console.log(`Using fallback data for ${endpoint}`);
        setData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip if auth is required but user is not authenticated
    if (requireAuth && status === "unauthenticated") {
      setLoading(false);
      setError("Authentication required");
      return;
    }

    // Skip if explicitly disabled
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Skip if auth is still loading
    if (requireAuth && status === "loading") {
      return;
    }

    fetchData();

    // Set up refresh interval if specified
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [status, enabled, fetchData, refreshInterval, requireAuth]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate: setData,
  };
}

/**
 * Hook for fetching team members
 */
export function useTeamMembers() {
  const fallbackData = {
    teamMembers: [
      {
        id: "1",
        name: "Jan de Vries",
        available: true,
        rating: 4.8,
        skills: ["Evenement", "Objectbeveiliging"],
      },
      {
        id: "2",
        name: "Piet Bakker",
        available: true,
        rating: 4.6,
        skills: ["Horeca", "Crowd Control"],
      },
    ],
    stats: {
      total: 2,
      active: 2,
      invited: 0,
      finqleReady: 0,
    },
  };

  return useApiData({
    endpoint: "/api/bedrijf/team",
    fallbackData,
    requireAuth: true,
  });
}

/**
 * Hook for fetching opdrachten
 */
export function useOpdrachten(
  view: "available" | "own" | "team" = "available",
) {
  const fallbackData = {
    opdrachten: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };

  return useApiData({
    endpoint: "/api/opdrachten",
    params: { view },
    fallbackData,
    requireAuth: true,
  });
}

/**
 * Hook for fetching jobs/opdrachten with filters
 */
export function useJobs(
  filters: {
    search?: string;
    location?: string;
    type?: string;
    minRate?: string;
    page?: number;
  } = {},
) {
  const params: Record<string, string> = {};

  if (filters.search) params.search = filters.search;
  if (filters.location) params.location = filters.location;
  if (filters.type) params.type = filters.type;
  if (filters.minRate) params.minRate = filters.minRate;
  if (filters.page) params.page = filters.page.toString();

  return useApiData({
    endpoint: "/api/jobs",
    params,
    fallbackData: {
      jobs: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    requireAuth: false, // Jobs can be viewed without auth
  });
}

/**
 * Hook for fetching dashboard statistics
 */
export function useDashboardStats() {
  return useApiData({
    endpoint: "/api/dashboard/stats",
    fallbackData: {
      totalOpdrachten: 0,
      activeOpdrachten: 0,
      totalRevenue: 0,
      teamSize: 0,
      weeklyHours: 0,
      pendingInvoices: 0,
    },
    requireAuth: true,
    refreshInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook for fetching notifications
 */
export function useNotifications(unreadOnly = false) {
  return useApiData({
    endpoint: "/api/notifications",
    params: unreadOnly ? { unreadOnly: "true" } : {},
    fallbackData: {
      notifications: [],
      unreadCount: 0,
      categoryCounts: {},
    },
    requireAuth: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook for fetching werk uren
 */
export function useWerkuren(status?: string) {
  const params: Record<string, string> = {};
  if (status) params.status = status;

  return useApiData({
    endpoint: "/api/werkuren",
    params,
    fallbackData: [],
    requireAuth: true,
  });
}

// ============================================
// OPDRACHTGEVER-SPECIFIC HOOKS
// ============================================

/**
 * Hook for fetching opdrachtgever dashboard statistics
 */
export function useOpdrachtgeverStats() {
  return useApiData({
    endpoint: "/api/opdrachtgever/dashboard/stats",
    fallbackData: {
      profile: {
        id: "",
        bedrijfsnaam: "Uw Bedrijf",
        kvkNummer: "",
        contactpersoon: "",
      },
      stats: {
        activeShifts: 0,
        weeklyShifts: 0,
        monthlyShifts: 0,
        totalShifts: 0,
        totalSpent: 0,
        avgRating: 0,
        beveiligerCount: 0,
        urgentShifts: 0,
        completedThisMonth: 0,
        pendingApprovals: 0,
      },
    },
    requireAuth: true,
    refreshInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook for fetching opdrachtgever shifts with filters
 */
export function useOpdrachtgeverShifts(
  filters: {
    status?: "open" | "active" | "completed" | "cancelled";
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {},
) {
  const params: Record<string, string> = {};

  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = filters.page.toString();
  if (filters.limit) params.limit = filters.limit.toString();
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  return useApiData({
    endpoint: "/api/opdrachtgever/shifts",
    params,
    fallbackData: {
      shifts: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    requireAuth: true,
  });
}

/**
 * Hook for fetching a specific shift by ID
 */
export function useOpdrachtgeverShift(shiftId: string, enabled = true) {
  return useApiData({
    endpoint: `/api/opdrachtgever/shifts/${shiftId}`,
    fallbackData: null,
    requireAuth: true,
    enabled: enabled && !!shiftId,
  });
}

/**
 * Hook for fetching beveiligers pool with filters
 */
export function useOpdrachtgeverBeveiligers(
  filters: {
    view?: "all" | "favorites" | "available";
    search?: string;
    location?: string;
    specialization?: string;
    minRating?: number;
    maxDistance?: number;
    availableOnly?: boolean;
    page?: number;
    limit?: number;
  } = {},
) {
  const params: Record<string, string> = {};

  if (filters.view) params.view = filters.view;
  if (filters.search) params.search = filters.search;
  if (filters.location) params.location = filters.location;
  if (filters.specialization) params.specialization = filters.specialization;
  if (filters.minRating) params.minRating = filters.minRating.toString();
  if (filters.maxDistance) params.maxDistance = filters.maxDistance.toString();
  if (filters.availableOnly) params.availableOnly = "true";
  if (filters.page) params.page = filters.page.toString();
  if (filters.limit) params.limit = filters.limit.toString();

  return useApiData({
    endpoint: "/api/opdrachtgever/beveiligers",
    params,
    fallbackData: {
      beveiligers: [],
      stats: {
        total: 0,
        available: 0,
        favorites: 0,
        premium: 0,
        averageRating: 0,
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    requireAuth: true,
  });
}

/**
 * Hook for fetching favorites list
 */
export function useOpdrachtgeverFavorites() {
  return useApiData({
    endpoint: "/api/opdrachtgever/beveiligers/favorites",
    fallbackData: {
      favorites: [],
      count: 0,
    },
    requireAuth: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook for fetching opdrachtgever notifications
 */
export function useOpdrachtgeverNotifications(
  filters: {
    unreadOnly?: boolean;
    category?: "shift" | "application" | "system" | "payment";
    priority?: "high" | "normal" | "low";
    page?: number;
    limit?: number;
  } = {},
) {
  const params: Record<string, string> = {};

  if (filters.unreadOnly) params.unreadOnly = "true";
  if (filters.category) params.category = filters.category;
  if (filters.priority) params.priority = filters.priority;
  if (filters.page) params.page = filters.page.toString();
  if (filters.limit) params.limit = filters.limit.toString();

  return useApiData({
    endpoint: "/api/opdrachtgever/notifications",
    params,
    fallbackData: {
      notifications: [],
      unreadCount: 0,
      categoryCounts: {
        shift: 0,
        application: 0,
        system: 0,
        payment: 0,
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    requireAuth: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

// ============================================
// MUTATION HOOKS FOR OPDRACHTGEVER
// ============================================

/**
 * Hook for creating new shifts
 */
export function useCreateShift() {
  return useApiMutation("/api/opdrachtgever/shifts");
}

/**
 * Hook for updating shifts
 */
export function useUpdateShift(shiftId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateShift = async (data: Record<string, unknown>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/opdrachtgever/shifts/${shiftId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Update failed");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateShift,
    loading,
    error,
  };
}

/**
 * Hook for cancelling shifts
 */
export function useCancelShift(shiftId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelShift = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/opdrachtgever/shifts/${shiftId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Cancel failed");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    cancelShift,
    loading,
    error,
  };
}

/**
 * Hook for managing favorites (add/remove)
 */
export function useManageFavorites() {
  return useApiMutation("/api/opdrachtgever/beveiligers/favorites");
}

/**
 * Hook for updating notification status
 */
export function useUpdateNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNotifications = async (data: {
    notificationIds: string[];
    markAsRead?: boolean;
    markAsUnread?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/opdrachtgever/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Update failed");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateNotifications,
    loading,
    error,
  };
}

// ============================================
// GENERAL MUTATION HOOK
// ============================================

/**
 * Hook for posting data to an API endpoint
 */
export function useApiMutation<T = unknown>(endpoint: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    data: Record<string, unknown>,
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Operation failed");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}
