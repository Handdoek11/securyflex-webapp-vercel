"use client";

import type { UserRole } from "@prisma/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { getOnlineUsers, trackUserPresence } from "@/lib/supabase";

interface OnlineUser {
  user_id: string;
  online_at: string;
  role?: UserRole;
  name?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

/**
 * Hook voor het bijhouden van online/offline status van gebruikers
 * Handig voor het tonen van beschikbare beveiligers
 */
export function useRealtimePresence(userId?: string, metadata?: Record<string, unknown>) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupPresence = async () => {
      // Track current user if userId provided
      if (userId) {
        channel = trackUserPresence(userId, metadata);
        setIsTracking(true);
      }

      // Get all online users
      const users = (await getOnlineUsers()) as OnlineUser[];
      setOnlineUsers(users);
    };

    setupPresence();

    // Cleanup
    return () => {
      if (channel) {
        channel.unsubscribe();
        setIsTracking(false);
      }
    };
  }, [userId, metadata]);

  /**
   * Check if a specific user is online
   */
  const isUserOnline = useCallback(
    (checkUserId: string) => {
      return onlineUsers.some((user) => user.user_id === checkUserId);
    },
    [onlineUsers],
  );

  /**
   * Get online users by role (e.g., all online ZZP_BEVEILIGER)
   */
  const getOnlineUsersByRole = useCallback(
    (role: UserRole) => {
      return onlineUsers.filter((user) => user.role === role);
    },
    [onlineUsers],
  );

  /**
   * Update current user's metadata (e.g., location)
   */
  const updatePresence = useCallback(
    async (newMetadata: Record<string, unknown>) => {
      if (!userId) return;

      const channel = trackUserPresence(userId, {
        ...metadata,
        ...newMetadata,
        updated_at: new Date().toISOString(),
      });

      return channel;
    },
    [userId, metadata],
  );

  return {
    onlineUsers,
    isTracking,
    isUserOnline,
    getOnlineUsersByRole,
    updatePresence,
  };
}

/**
 * Hook specifiek voor het tonen van beschikbare beveiligers
 */
export function useAvailableBeveiligers() {
  const [availableBeveiligers, setAvailableBeveiligers] = useState<
    OnlineUser[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const users = (await getOnlineUsers(
          "beveiligers-available",
        )) as OnlineUser[];
        const beveiligers = users.filter(
          (user) => user.role === "ZZP_BEVEILIGER",
        );
        setAvailableBeveiligers(beveiligers);
      } catch (error) {
        console.error("Error fetching available beveiligers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailable();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAvailable, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    availableBeveiligers,
    isLoading,
    count: availableBeveiligers.length,
  };
}
