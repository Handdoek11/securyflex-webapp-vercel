"use client";

import type { Opdracht } from "@prisma/client";
import { useEffect, useState } from "react";
import { subscribeToOpdrachtUpdates } from "@/lib/supabase";

interface UseRealtimeOpdrachtenOptions {
  opdrachtgeverId?: string;
  bedrijfId?: string;
  status?: string;
}

/**
 * Hook voor real-time opdracht updates
 * Gebruik dit om live updates te ontvangen wanneer opdrachten wijzigen
 */
export function useRealtimeOpdrachten(
  options: UseRealtimeOpdrachtenOptions = {},
) {
  const [opdrachten, setOpdrachten] = useState<Opdracht[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = subscribeToOpdrachtUpdates(options, (payload) => {
      console.log("Opdracht update received:", payload);
      setLastUpdate(new Date());

      // Handle different event types
      switch (payload.eventType) {
        case "INSERT":
          setOpdrachten((prev) => [...prev, payload.new as Opdracht]);
          break;
        case "UPDATE":
          setOpdrachten((prev) =>
            prev.map((opdracht) =>
              opdracht.id === payload.new.id
                ? (payload.new as Opdracht)
                : opdracht,
            ),
          );
          break;
        case "DELETE":
          setOpdrachten((prev) =>
            prev.filter((opdracht) => opdracht.id !== payload.old.id),
          );
          break;
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [options.opdrachtgeverId, options.bedrijfId, options.status, options]);

  return {
    opdrachten,
    lastUpdate,
  };
}

/**
 * Hook voor een specifieke opdracht met real-time updates
 */
export function useRealtimeOpdracht(opdrachtId: string | undefined) {
  const [opdracht, setOpdracht] = useState<Opdracht | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!opdrachtId) {
      setOpdracht(null);
      setIsLoading(false);
      return;
    }

    // Fetch initial data
    const fetchOpdracht = async () => {
      try {
        const response = await fetch(`/api/opdrachten/${opdrachtId}`);
        if (response.ok) {
          const data = await response.json();
          setOpdracht(data);
        }
      } catch (error) {
        console.error("Error fetching opdracht:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpdracht();

    // Subscribe to updates for this specific opdracht
    const subscription = subscribeToOpdrachtUpdates({}, (payload) => {
      if (payload.new?.id === opdrachtId || payload.old?.id === opdrachtId) {
        if (payload.eventType === "DELETE") {
          setOpdracht(null);
        } else if (payload.eventType === "UPDATE") {
          setOpdracht(payload.new as Opdracht);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [opdrachtId]);

  return {
    opdracht,
    isLoading,
  };
}
