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

// Type-safe interfaces for real-time payload
interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: Werkuur;
  old?: Werkuur;
}

// Type guard for GPS location validation
function isValidGPSLocation(
  location: unknown,
): location is Omit<GPSLocation, "timestamp"> {
  return (
    typeof location === "object" &&
    location !== null &&
    typeof (location as any).lat === "number" &&
    typeof (location as any).lng === "number" &&
    !isNaN((location as any).lat) &&
    !isNaN((location as any).lng)
  );
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
    const subscription = subscribeToWerkuurUpdates(
      opdrachtId,
      (payload: RealtimePayload) => {
        console.log("Werkuur update:", payload);

        switch (payload.eventType) {
          case "INSERT": {
            const newWerkuur = payload.new;
            if (!newWerkuur) return;

            setWerkuren((prev) => [...prev, newWerkuur]);

            // If it's a clock-in (no eindTijd), set as active
            if (!newWerkuur.eindTijd) {
              setActiveWerkuur(newWerkuur);
            }
            break;
          }

          case "UPDATE": {
            const updatedWerkuur = payload.new;
            if (!updatedWerkuur) return;

            setWerkuren((prev) =>
              prev.map((w) =>
                w.id === updatedWerkuur.id ? updatedWerkuur : w,
              ),
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

            // Update GPS location if available - type-safe validation
            if (
              updatedWerkuur.eindLocatie &&
              isValidGPSLocation(updatedWerkuur.eindLocatie)
            ) {
              setLastGPSUpdate({
                lat: updatedWerkuur.eindLocatie.lat,
                lng: updatedWerkuur.eindLocatie.lng,
                accuracy: updatedWerkuur.eindLocatie.accuracy,
                timestamp: new Date(),
              });
            }
            break;
          }

          case "DELETE": {
            const deletedWerkuur = payload.old;
            if (!deletedWerkuur?.id) return;

            setWerkuren((prev) =>
              prev.filter((w) => w.id !== deletedWerkuur.id),
            );
            if (activeWerkuur?.id === deletedWerkuur.id) {
              setActiveWerkuur(null);
            }
            break;
          }
        }
      },
    );

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
