"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, AlertTriangle, CheckCircle, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast, gpsToast } from "@/components/ui/toast";

// GPS location interface
export interface GPSLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
  altitude?: number;
  heading?: number;
  speed?: number;
}

// GPS status types
type GPSStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable" | "error";

interface GPSTrackerProps {
  onLocationUpdate?: (location: GPSLocation) => void;
  onError?: (error: GeolocationPositionError) => void;
  requiredAccuracy?: number; // in meters
  autoUpdate?: boolean;
  updateInterval?: number; // in milliseconds
  showStatus?: boolean;
  showAccuracy?: boolean;
  allowManualRefresh?: boolean;
  className?: string;
  variant?: "default" | "compact" | "status-only";
}

export function GPSTracker({
  onLocationUpdate,
  onError,
  requiredAccuracy = 100, // 100 meters
  autoUpdate = false,
  updateInterval = 30000, // 30 seconds
  showStatus = true,
  showAccuracy = true,
  allowManualRefresh = true,
  className,
  variant = "default",
}: GPSTrackerProps) {
  const [status, setStatus] = useState<GPSStatus>("idle");
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check if geolocation is supported
  const isGeolocationSupported = "geolocation" in navigator;

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<GPSLocation> => {
    return new Promise((resolve, reject) => {
      if (!isGeolocationSupported) {
        reject(new Error("Geolocation wordt niet ondersteund door deze browser"));
        return;
      }

      if (!isOnline) {
        reject(new Error("Geen internetverbinding beschikbaar"));
        return;
      }

      setStatus("requesting");

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 60000, // 1 minute
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsLocation: GPSLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };

          setLocation(gpsLocation);
          setLastUpdate(new Date());
          setStatus("granted");
          resolve(gpsLocation);
        },
        (error) => {
          console.error("GPS Error:", error);
          handleGeolocationError(error);
          reject(error);
        },
        options
      );
    });
  }, [isGeolocationSupported, isOnline]);

  // Handle geolocation errors
  const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setStatus("denied");
        gpsToast.locationRequired();
        break;
      case error.POSITION_UNAVAILABLE:
        setStatus("unavailable");
        toast.error("GPS locatie niet beschikbaar");
        break;
      case error.TIMEOUT:
        setStatus("error");
        toast.error("GPS timeout - probeer opnieuw");
        break;
      default:
        setStatus("error");
        gpsToast.locationError();
        break;
    }
    onError?.(error);
  }, [onError]);

  // Start continuous tracking
  const startTracking = useCallback(() => {
    if (!isGeolocationSupported || !isOnline) return;

    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const gpsLocation: GPSLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };

        setLocation(gpsLocation);
        setLastUpdate(new Date());
        setStatus("granted");
        onLocationUpdate?.(gpsLocation);
      },
      handleGeolocationError,
      options
    );

    setWatchId(id);
    setIsTracking(true);
  }, [isGeolocationSupported, isOnline, watchId, onLocationUpdate, handleGeolocationError]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  // Manual refresh
  const refreshLocation = useCallback(async () => {
    try {
      const newLocation = await getCurrentLocation();
      onLocationUpdate?.(newLocation);
      toast.success("Locatie bijgewerkt");
    } catch (error) {
      console.error("Failed to refresh location:", error);
    }
  }, [getCurrentLocation, onLocationUpdate]);

  // Auto-update effect
  useEffect(() => {
    if (autoUpdate && !isTracking) {
      startTracking();
    }

    return () => {
      if (autoUpdate && isTracking) {
        stopTracking();
      }
    };
  }, [autoUpdate, isTracking, startTracking, stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Get status badge props
  const getStatusBadge = () => {
    switch (status) {
      case "requesting":
        return { variant: "secondary" as const, label: "Ophalen...", icon: <Loader2 className="h-3 w-3 animate-spin" /> };
      case "granted":
        return { variant: "default" as const, label: "Actief", icon: <CheckCircle className="h-3 w-3" /> };
      case "denied":
        return { variant: "destructive" as const, label: "Geweigerd", icon: <AlertTriangle className="h-3 w-3" /> };
      case "unavailable":
        return { variant: "destructive" as const, label: "Niet beschikbaar", icon: <AlertTriangle className="h-3 w-3" /> };
      case "error":
        return { variant: "destructive" as const, label: "Fout", icon: <AlertTriangle className="h-3 w-3" /> };
      default:
        return { variant: "outline" as const, label: "Inactief", icon: <MapPin className="h-3 w-3" /> };
    }
  };

  // Get accuracy color
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return "text-green-600";
    if (accuracy <= 50) return "text-yellow-600";
    return "text-red-600";
  };

  // Status only variant
  if (variant === "status-only") {
    const statusBadge = getStatusBadge();
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant={statusBadge.variant} className="text-xs">
          {statusBadge.icon}
          <span className="ml-1">{statusBadge.label}</span>
        </Badge>
        {!isOnline && <WifiOff className="h-4 w-4 text-red-500" />}
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    const statusBadge = getStatusBadge();
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-2">
          <Badge variant={statusBadge.variant} className="text-xs">
            {statusBadge.icon}
            <span className="ml-1">{statusBadge.label}</span>
          </Badge>
          {location && showAccuracy && (
            <span className={cn("text-xs", getAccuracyColor(location.accuracy))}>
              ±{Math.round(location.accuracy)}m
            </span>
          )}
        </div>

        {allowManualRefresh && (
          <Button
            size="sm"
            variant="outline"
            onClick={refreshLocation}
            disabled={status === "requesting" || !isOnline}
          >
            <RefreshCw className={cn("h-3 w-3", status === "requesting" && "animate-spin")} />
          </Button>
        )}
      </div>
    );
  }

  // Default variant - full card
  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">GPS Locatie</h3>
          </div>

          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            {showStatus && (
              <Badge variant={getStatusBadge().variant} className="text-xs">
                {getStatusBadge().icon}
                <span className="ml-1">{getStatusBadge().label}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Location info */}
        {location && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Breedtegraad:</span>
                <p className="font-mono">{location.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Lengtegraad:</span>
                <p className="font-mono">{location.lng.toFixed(6)}</p>
              </div>
            </div>

            {showAccuracy && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nauwkeurigheid:</span>
                <span className={cn("font-medium", getAccuracyColor(location.accuracy))}>
                  ±{Math.round(location.accuracy)} meter
                </span>
              </div>
            )}

            {/* Accuracy indicator */}
            {showAccuracy && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Signaal kwaliteit</span>
                  <span>{location.accuracy <= requiredAccuracy ? "Goed" : "Onvoldoende"}</span>
                </div>
                <Progress
                  value={Math.max(0, 100 - (location.accuracy / requiredAccuracy) * 100)}
                  className="h-2"
                />
              </div>
            )}

            {lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Laatste update: {lastUpdate.toLocaleTimeString("nl-NL")}
              </p>
            )}
          </div>
        )}

        {/* Error state */}
        {(status === "denied" || status === "unavailable" || status === "error") && (
          <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
              {status === "denied" && "Locatie toegang geweigerd"}
              {status === "unavailable" && "GPS niet beschikbaar"}
              {status === "error" && "GPS fout opgetreden"}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              Controleer je browser instellingen en GPS verbinding
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!isTracking ? (
            <Button
              size="sm"
              onClick={startTracking}
              disabled={!isGeolocationSupported || !isOnline}
              className="flex-1"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={stopTracking}
              className="flex-1"
            >
              Stop Tracking
            </Button>
          )}

          {allowManualRefresh && (
            <Button
              size="sm"
              variant="outline"
              onClick={refreshLocation}
              disabled={status === "requesting" || !isOnline}
            >
              <RefreshCw className={cn("h-4 w-4", status === "requesting" && "animate-spin")} />
            </Button>
          )}
        </div>

        {/* GPS not supported warning */}
        {!isGeolocationSupported && (
          <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              GPS wordt niet ondersteund door deze browser
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// GPS utility functions
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function isWithinGeofence(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(currentLat, currentLng, targetLat, targetLng);
  return distance <= radiusMeters;
}

export function formatGPSCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function getGPSAccuracyLevel(accuracy: number): "excellent" | "good" | "fair" | "poor" {
  if (accuracy <= 5) return "excellent";
  if (accuracy <= 20) return "good";
  if (accuracy <= 50) return "fair";
  return "poor";
}