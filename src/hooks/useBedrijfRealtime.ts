import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

// Import the Supabase broadcast utility
// This would typically connect to your existing broadcast system

export interface RealtimeUpdate {
  type:
    | "opdracht_created"
    | "opdracht_updated"
    | "payment_updated"
    | "team_updated"
    | "planning_updated";
  data: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  bedrijfId?: string;
}

export interface BroadcastSubscription {
  channel: string;
  callback: (update: RealtimeUpdate) => void;
  active: boolean;
}

// Hook for bedrijf-specific real-time updates
export function useBedrijfRealtime(bedrijfId?: string) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null);
  const subscriptionsRef = useRef<BroadcastSubscription[]>([]);

  // Generic subscription method
  const subscribe = useCallback(
    (channel: string, callback: (update: RealtimeUpdate) => void) => {
      if (!bedrijfId) return null;

      const subscription: BroadcastSubscription = {
        channel,
        callback,
        active: true,
      };

      subscriptionsRef.current.push(subscription);

      // In a real implementation, this would connect to Supabase
      // For now, we'll simulate with a mock connection
      console.log(`Subscribed to bedrijf channel: ${channel}`);

      // Return cleanup function
      return () => {
        subscription.active = false;
        subscriptionsRef.current = subscriptionsRef.current.filter(
          (sub) => sub !== subscription,
        );
      };
    },
    [bedrijfId],
  );

  // Subscribe to opdracht updates
  const subscribeToOpdrachten = useCallback(
    (callback: (update: RealtimeUpdate) => void) => {
      return subscribe(`bedrijf:${bedrijfId}:opdrachten`, callback);
    },
    [subscribe, bedrijfId],
  );

  // Subscribe to planning updates
  const subscribeToPlanning = useCallback(
    (callback: (update: RealtimeUpdate) => void) => {
      return subscribe(`bedrijf:${bedrijfId}:planning`, callback);
    },
    [subscribe, bedrijfId],
  );

  // Subscribe to team updates
  const subscribeToTeam = useCallback(
    (callback: (update: RealtimeUpdate) => void) => {
      return subscribe(`bedrijf:${bedrijfId}:team`, callback);
    },
    [subscribe, bedrijfId],
  );

  // Subscribe to payment updates
  const subscribeToPayments = useCallback(
    (callback: (update: RealtimeUpdate) => void) => {
      return subscribe(`bedrijf:${bedrijfId}:payments`, callback);
    },
    [subscribe, bedrijfId],
  );

  // Broadcast an update (for testing or manual triggers)
  const broadcast = useCallback(
    async (channel: string, update: Omit<RealtimeUpdate, "timestamp">) => {
      try {
        const fullUpdate: RealtimeUpdate = {
          ...update,
          timestamp: new Date().toISOString(),
          bedrijfId,
        };

        // In real implementation, this would use Supabase broadcast
        // For now, we'll simulate by calling relevant callbacks
        const relevantSubs = subscriptionsRef.current.filter(
          (sub) => sub.active && sub.channel === channel,
        );

        relevantSubs.forEach((sub) => {
          try {
            sub.callback(fullUpdate);
          } catch (error) {
            console.error("Error in broadcast callback:", error);
          }
        });

        setLastUpdate(fullUpdate);
      } catch (error) {
        console.error("Error broadcasting update:", error);
      }
    },
    [bedrijfId],
  );

  // Initialize connection when bedrijfId is available
  useEffect(() => {
    if (!bedrijfId || !session) return;

    // Simulate connection establishment
    const timeout = setTimeout(() => {
      setIsConnected(true);
      console.log(`Connected to bedrijf realtime: ${bedrijfId}`);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      setIsConnected(false);
      // Clean up all subscriptions
      subscriptionsRef.current.forEach((sub) => {
        sub.active = false;
      });
      subscriptionsRef.current = [];
    };
  }, [bedrijfId, session]);

  return {
    isConnected,
    lastUpdate,
    subscribe,
    subscribeToOpdrachten,
    subscribeToPlanning,
    subscribeToTeam,
    subscribeToPayments,
    broadcast,
  };
}

// Hook for specific opdracht real-time updates
export function useOpdrachtRealtime(opdrachtId: string) {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const { subscribe } = useBedrijfRealtime();

  useEffect(() => {
    if (!opdrachtId || !subscribe) return;

    const unsubscribe = subscribe(`opdracht:${opdrachtId}`, (update) => {
      setUpdates((prev) => [...prev.slice(-9), update]); // Keep last 10 updates
    });

    return unsubscribe;
  }, [opdrachtId, subscribe]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    clearUpdates,
    hasUpdates: updates.length > 0,
    latestUpdate: updates[updates.length - 1] || null,
  };
}

// Hook for team member real-time status
export function useTeamRealtime(bedrijfId?: string) {
  const [teamStatus, setTeamStatus] = useState<
    Map<
      string,
      {
        online: boolean;
        lastSeen: string;
        currentLocation?: { lat: number; lng: number };
        activeShift?: string;
      }
    >
  >(new Map());

  const { subscribeToTeam } = useBedrijfRealtime(bedrijfId);

  useEffect(() => {
    if (!subscribeToTeam) return;

    const unsubscribe = subscribeToTeam((update) => {
      if (update.type === "team_updated") {
        const { memberId, status } = update.data;
        setTeamStatus((prev) => new Map(prev.set(memberId, status)));
      }
    });

    return unsubscribe;
  }, [subscribeToTeam]);

  const getTeamMemberStatus = useCallback(
    (memberId: string) => {
      return (
        teamStatus.get(memberId) || {
          online: false,
          lastSeen: new Date().toISOString(),
        }
      );
    },
    [teamStatus],
  );

  return {
    teamStatus: Object.fromEntries(teamStatus),
    getTeamMemberStatus,
  };
}

// Hook for payment status real-time updates
export function usePaymentRealtime(bedrijfId?: string) {
  const [paymentUpdates, setPaymentUpdates] = useState<
    Array<{
      paymentId: string;
      status: string;
      amount?: number;
      timestamp: string;
      zzpProfileId?: string;
    }>
  >([]);

  const { subscribeToPayments } = useBedrijfRealtime(bedrijfId);

  useEffect(() => {
    if (!subscribeToPayments) return;

    const unsubscribe = subscribeToPayments((update) => {
      if (update.type === "payment_updated") {
        setPaymentUpdates((prev) => [
          ...prev.slice(-19), // Keep last 20 updates
          {
            paymentId: update.data.paymentId,
            status: update.data.status,
            amount: update.data.amount,
            timestamp: update.timestamp,
            zzpProfileId: update.data.zzpProfileId,
          },
        ]);
      }
    });

    return unsubscribe;
  }, [subscribeToPayments]);

  const clearPaymentUpdates = useCallback(() => {
    setPaymentUpdates([]);
  }, []);

  const getPaymentUpdate = useCallback(
    (paymentId: string) => {
      return paymentUpdates.find((update) => update.paymentId === paymentId);
    },
    [paymentUpdates],
  );

  return {
    paymentUpdates,
    clearPaymentUpdates,
    getPaymentUpdate,
    hasPaymentUpdates: paymentUpdates.length > 0,
  };
}

// Hook for dashboard real-time statistics
export function useDashboardRealtime(bedrijfId?: string) {
  const [statsUpdates, setStatsUpdates] = useState<{
    totalOpdrachten?: number;
    activeOpdrachten?: number;
    teamSize?: number;
    pendingPayments?: number;
    lastUpdated?: string;
  }>({});

  const { subscribe } = useBedrijfRealtime(bedrijfId);

  useEffect(() => {
    if (!subscribe || !bedrijfId) return;

    const unsubscribe = subscribe(
      `bedrijf:${bedrijfId}:dashboard`,
      (update) => {
        if (update.data.stats) {
          setStatsUpdates((prev) => ({
            ...prev,
            ...update.data.stats,
            lastUpdated: update.timestamp,
          }));
        }
      },
    );

    return unsubscribe;
  }, [subscribe, bedrijfId]);

  return {
    statsUpdates,
    hasStatsUpdates: Object.keys(statsUpdates).length > 0,
    lastUpdated: statsUpdates.lastUpdated,
  };
}

// Hook for notifications real-time updates
export function useNotificationRealtime(userId?: string) {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
    }>
  >([]);

  const { subscribe } = useBedrijfRealtime();

  useEffect(() => {
    if (!subscribe || !userId) return;

    const unsubscribe = subscribe(`user:${userId}:notifications`, (update) => {
      if (update.data.notification) {
        setNotifications((prev) => [
          update.data.notification,
          ...prev.slice(0, 49), // Keep last 50 notifications
        ]);
      }
    });

    return unsubscribe;
  }, [subscribe, userId]);

  const markAsRead = useCallback((notificationIds: string[]) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notificationIds.includes(notif.id) ? { ...notif, read: true } : notif,
      ),
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead,
    clearNotifications,
  };
}

// Utility hook for connection status
export function useRealtimeConnection() {
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [lastPing, setLastPing] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate connection status monitoring
    const interval = setInterval(() => {
      setLastPing(new Date());
      // In real implementation, this would ping the WebSocket connection
    }, 30000); // Ping every 30 seconds

    // Simulate initial connection
    const timeout = setTimeout(() => {
      setConnectionStatus("connected");
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return {
    connectionStatus,
    lastPing,
    isConnected: connectionStatus === "connected",
  };
}
