"use client";

import type { Werkuur } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { subscribeToWerkuurUpdates } from "@/lib/supabase";

interface GPSLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: Date;
}

/**
 * Hook voor real-time GPS tracking en werkuren updates
 * Perfect voor clock-in/out functionaliteit
 */
export function useRealtimeWerkuren(opdrachtId: string | undefined) {
  const [werkuren, setWerkuren] = useState<Werkuur[]>([]);
  const [activeWerkuur, setActiveWerkuur] = useState<Werkuur | null>(null);
  const [lastGPSUpdate, setLastGPSUpdate] = useState<GPSLocation | null>(null);

  useEffect(() => {
    if (!opdrachtId) return;

    // Subscribe to werkuur updates for this opdracht
    const subscription = subscribeToWerkuurUpdates(opdrachtId, (payload) => {
      console.log("Werkuur update:", payload);

      switch (payload.eventType) {
        case "INSERT": {
          const newWerkuur = payload.new as Werkuur;
          setWerkuren((prev) => [...prev, newWerkuur]);

          // If it's a clock-in (no eindTijd), set as active
          if (!newWerkuur.eindTijd) {
            setActiveWerkuur(newWerkuur);
          }
          break;
        }

        case "UPDATE": {
          const updatedWerkuur = payload.new as Werkuur;
          setWerkuren((prev) =>
            prev.map((w) => (w.id === updatedWerkuur.id ? updatedWerkuur : w)),
          );

          // Update active werkuur if it's the one being updated
          if (activeWerkuur?.id === updatedWerkuur.id) {
            if (updatedWerkuur.eindTijd) {
              // Clock-out happened
              setActiveWerkuur(null);
            } else {
              setActiveWerkuur(updatedWerkuur);
            }
          }

          // Update GPS location if available
          if (updatedWerkuur.eindLocatie) {
            setLastGPSUpdate({
              ...(updatedWerkuur.eindLocatie as any),
              timestamp: new Date(),
            });
          }
          break;
        }

        case "DELETE":
          setWerkuren((prev) => prev.filter((w) => w.id !== payload.old.id));
          if (activeWerkuur?.id === payload.old.id) {
            setActiveWerkuur(null);
          }
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [opdrachtId, activeWerkuur]);

  /**
   * Clock in with GPS location
   */
  const clockIn = useCallback(
    async (location: GPSLocation) => {
      if (!opdrachtId) return;

      try {
        const response = await fetch("/api/werkuren/clock-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opdrachtId,
            startLocatie: {
              lat: location.lat,
              lng: location.lng,
              accuracy: location.accuracy,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to clock in");
        }

        return await response.json();
      } catch (error) {
        console.error("Clock in error:", error);
        throw error;
      }
    },
    [opdrachtId],
  );

  /**
   * Clock out with GPS location
   */
  const clockOut = useCallback(
    async (werkuurId: string, location: GPSLocation) => {
      try {
        const response = await fetch(`/api/werkuren/${werkuurId}/clock-out`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eindLocatie: {
              lat: location.lat,
              lng: location.lng,
              accuracy: location.accuracy,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to clock out");
        }

        return await response.json();
      } catch (error) {
        console.error("Clock out error:", error);
        throw error;
      }
    },
    [],
  );

  /**
   * Get current GPS location
   */
  const getCurrentLocation = useCallback((): Promise<GPSLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }, []);

  return {
    werkuren,
    activeWerkuur,
    lastGPSUpdate,
    clockIn,
    clockOut,
    getCurrentLocation,
  };
}
