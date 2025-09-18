import { useCallback, useEffect, useState } from "react";
import { useApiData } from "./useApiData";

// Types for bedrijf data
export interface BedrijfOpdracht {
  id: string;
  titel: string;
  omschrijving: string;
  locatie: string;
  postcode: string;
  startDatum: string;
  eindDatum: string;
  uurloon: number;
  aantalPersonen: number;
  vereisten: string[];
  status: string;
  targetAudience: string;
  directZZPAllowed: boolean;
  createdAt: string;
  client: {
    name: string;
    contact?: string;
  };
  hasApplied: boolean;
  applicationId?: string;
  applicationStatus?: string;
  totalApplications: number;
  totalValue: number;
  daysUntilStart: number;
}

export interface BedrijfPlanningItem {
  id: string;
  titel: string;
  locatie: string;
  startDatum: string;
  eindDatum: string;
  aantalPersonen: number;
  status: string;
  client: string;
  assignedTeam: Array<{
    id: string;
    zzpId: string;
    name: string;
    phone: string;
    email: string;
    status: string;
  }>;
  isFullyStaffed: boolean;
  missingPersonnel: number;
}

export interface BedrijfKlant {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  telefoon: string;
  email: string;
  adres: string;
  postcode: string;
  plaats: string;
  kvkNummer?: string;
  btwNummer?: string;
  totalOpdrachten: number;
  estimatedRevenue: number;
  isActive: boolean;
  lastInteraction: string;
  recentOpdrachten: Array<{
    id: string;
    titel: string;
    status: string;
    startDatum: string;
    uurloon: number;
    aantalPersonen: number;
  }>;
  memberSince: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface BedrijfStats {
  metrics: {
    totalOpdrachten: number;
    opdrachtGrowth: number;
    estimatedRevenue: number;
    revenueGrowth: number;
    averageHourlyRate: number;
    activeClients: number;
    successRate: number;
  };
  statusBreakdown: {
    open: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  teamStats: {
    totalApplications: number;
    accepted: number;
    pending: number;
    rejected: number;
    successRate: number;
  };
  revenueChart: Array<{
    week: string;
    revenue: number;
    opdrachten: number;
  }>;
  recentOpdrachten: Array<{
    id: string;
    titel: string;
    client: string;
    status: string;
    createdAt: string;
    assignedCount: number;
    requiredCount: number;
    isFullyStaffed: boolean;
  }>;
  upcomingOpdrachten: Array<{
    id: string;
    titel: string;
    client: string;
    startDatum: string;
    locatie: string;
    aantalPersonen: number;
  }>;
  insights: Array<{
    type: "success" | "warning" | "info" | "danger";
    title: string;
    message: string;
  }>;
  period: string;
  role: string;
  generatedAt: string;
}

// Hook for managing bedrijf opdrachten
export function useBedrijfOpdrachten(params?: {
  status?: string;
  role?: "leverancier" | "opdrachtgever";
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set("status", params.status);
  if (params?.role) queryParams.set("role", params.role);
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const endpoint = `/api/bedrijf/opdrachten${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const { data, loading, error, refetch } = useApiData<{
    opdrachten: BedrijfOpdracht[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      role: string;
      status?: string;
    };
  }>({
    endpoint,
    requireAuth: true,
  });

  const createOpdracht = useCallback(
    async (opdrachtData: Record<string, unknown>) => {
      try {
        const response = await fetch("/api/bedrijf/opdrachten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(opdrachtData),
        });

        if (!response.ok) {
          throw new Error("Failed to create opdracht");
        }

        const result = await response.json();
        await refetch(); // Refresh the list
        return result;
      } catch (error) {
        console.error("Error creating opdracht:", error);
        throw error;
      }
    },
    [refetch],
  );

  return {
    opdrachten: data?.opdrachten || [],
    pagination: data?.pagination,
    filters: data?.filters,
    loading,
    error,
    refetch,
    createOpdracht,
  };
}

// Hook for managing bedrijf planning
export function useBedrijfPlanning(params?: {
  view?: "day" | "week" | "month";
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.view) queryParams.set("view", params.view);
  if (params?.startDate) queryParams.set("startDate", params.startDate);
  if (params?.endDate) queryParams.set("endDate", params.endDate);

  const endpoint = `/api/bedrijf/planning${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const { data, loading, error, refetch } = useApiData<{
    planning: BedrijfPlanningItem[];
    teamMembers: Array<{
      id: string;
      voornaam: string;
      achternaam: string;
      telefoon: string;
      specialisaties: string[];
      ervaring: string;
      beschikbaarheid: Record<string, unknown>;
      user: {
        email: string;
      };
    }>;
    dateRange: {
      start: string;
      end: string;
    };
    view: string;
    stats: {
      totalOpdrachten: number;
      fullyStaffed: number;
      understaffed: number;
      totalTeamMembers: number;
    };
  }>({
    endpoint,
    requireAuth: true,
  });

  const assignTeamMembers = useCallback(
    async (assignmentData: {
      opdrachtId: string;
      zzpProfileIds: string[];
      startTijd?: string;
      eindTijd?: string;
      notities?: string;
    }) => {
      try {
        const response = await fetch("/api/bedrijf/planning", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assignmentData),
        });

        if (!response.ok) {
          throw new Error("Failed to assign team members");
        }

        const result = await response.json();
        await refetch(); // Refresh planning data
        return result;
      } catch (error) {
        console.error("Error assigning team members:", error);
        throw error;
      }
    },
    [refetch],
  );

  return {
    planning: data?.planning || [],
    teamMembers: data?.teamMembers || [],
    dateRange: data?.dateRange,
    view: data?.view,
    stats: data?.stats,
    loading,
    error,
    refetch,
    assignTeamMembers,
  };
}

// Hook for managing bedrijf klanten
export function useBedrijfKlanten(params?: {
  search?: string;
  status?: "active" | "inactive" | "all";
  sortBy?: "recent" | "name" | "revenue";
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set("search", params.search);
  if (params?.status) queryParams.set("status", params.status);
  if (params?.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());

  const endpoint = `/api/bedrijf/klanten${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const { data, loading, error, refetch } = useApiData<{
    klanten: BedrijfKlant[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      totalKlanten: number;
      activeKlanten: number;
      totalRevenue: number;
      averageOrderValue: number;
    };
    filters: {
      search?: string;
      status?: string;
      sortBy?: string;
    };
  }>({
    endpoint,
    requireAuth: true,
  });

  const updateClient = useCallback(
    async (clientData: {
      clientId: string;
      action: "add_note" | "update_contact" | "mark_favorite";
      data: Record<string, unknown>;
    }) => {
      try {
        const response = await fetch("/api/bedrijf/klanten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clientData),
        });

        if (!response.ok) {
          throw new Error("Failed to update client");
        }

        const result = await response.json();
        await refetch(); // Refresh client data
        return result;
      } catch (error) {
        console.error("Error updating client:", error);
        throw error;
      }
    },
    [refetch],
  );

  return {
    klanten: data?.klanten || [],
    pagination: data?.pagination,
    stats: data?.stats,
    filters: data?.filters,
    loading,
    error,
    refetch,
    updateClient,
  };
}

// Hook for bedrijf dashboard statistics
export function useBedrijfStats(params?: {
  period?: "week" | "month" | "quarter" | "year";
  role?: "leverancier" | "opdrachtgever" | "both";
}) {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.set("period", params.period);
  if (params?.role) queryParams.set("role", params.role);

  const endpoint = `/api/bedrijf/dashboard/stats${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const { data, loading, error, refetch } = useApiData<BedrijfStats>({
    endpoint,
    requireAuth: true,
  });

  return {
    stats: data,
    loading,
    error,
    refetch,
  };
}

// Hook for managing real-time updates
export function useBedrijfRealtime() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // This would integrate with Supabase real-time
  // For now, we'll provide a simple refresh mechanism
  const refreshData = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    // Set up real-time listeners here
    // This would connect to Supabase channels for bedrijf-specific updates
    const interval = setInterval(() => {
      // Check for updates every 30 seconds
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    lastUpdate,
    refreshData,
  };
}
