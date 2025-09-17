"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface BeveiligersAvailability {
  beveiligerIds: string[];
  availableNow: BeveiligersInfo[];
  availableSoon: BeveiligersInfo[];
  unavailable: BeveiligersInfo[];
  onlineCount: number;
  lastUpdate: Date;
}

interface BeveiligersInfo {
  id: string;
  name: string;
  photo?: string;
  rating: number;
  location: string;
  distance: number;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'BUSY';
  availableFrom?: Date;
  currentShift?: {
    id: string;
    endTime: Date;
    location: string;
  };
  isOnline: boolean;
  lastSeen?: Date;
  skills: string[];
  hourlyRate: number;
}

/**
 * Hook voor real-time beveiliger beschikbaarheid monitoring
 */
export function useRealtimeBeveiligersPool(filters?: {
  location?: string;
  maxDistance?: number;
  skills?: string[];
  minRating?: number;
}) {
  const [availability, setAvailability] = useState<BeveiligersAvailability>({
    beveiligerIds: [],
    availableNow: [],
    availableSoon: [],
    unavailable: [],
    onlineCount: 0,
    lastUpdate: new Date()
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient();

    // Subscribe to beveiliger availability channel
    const channel = supabase.channel('beveiligers-pool')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Beveiligers presence sync:', state);

        // Count online beveiligers
        const onlineCount = Object.keys(state).length;
        setAvailability(prev => ({
          ...prev,
          onlineCount,
          lastUpdate: new Date()
        }));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Beveiliger joined:', key, newPresences);

        setAvailability(prev => ({
          ...prev,
          onlineCount: prev.onlineCount + 1,
          lastUpdate: new Date()
        }));
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Beveiliger left:', key, leftPresences);

        setAvailability(prev => ({
          ...prev,
          onlineCount: Math.max(0, prev.onlineCount - 1),
          lastUpdate: new Date()
        }));
      })
      .on('broadcast', { event: 'availability-update' }, (payload) => {
        console.log('Availability update:', payload);

        const beveiligersInfo: BeveiligersInfo = {
          id: payload.payload.id,
          name: payload.payload.name,
          photo: payload.payload.photo,
          rating: payload.payload.rating,
          location: payload.payload.location,
          distance: payload.payload.distance,
          status: payload.payload.status,
          availableFrom: payload.payload.availableFrom ? new Date(payload.payload.availableFrom) : undefined,
          currentShift: payload.payload.currentShift,
          isOnline: payload.payload.isOnline,
          lastSeen: payload.payload.lastSeen ? new Date(payload.payload.lastSeen) : undefined,
          skills: payload.payload.skills || [],
          hourlyRate: payload.payload.hourlyRate
        };

        // Apply filters
        if (filters) {
          if (filters.maxDistance && beveiligersInfo.distance > filters.maxDistance) {
            return;
          }
          if (filters.minRating && beveiligersInfo.rating < filters.minRating) {
            return;
          }
          if (filters.skills && filters.skills.length > 0) {
            const hasRequiredSkills = filters.skills.every(skill =>
              beveiligersInfo.skills.includes(skill)
            );
            if (!hasRequiredSkills) {
              return;
            }
          }
        }

        setAvailability(prev => {
          const updated = { ...prev };

          // Remove from all arrays first
          updated.availableNow = updated.availableNow.filter(b => b.id !== beveiligersInfo.id);
          updated.availableSoon = updated.availableSoon.filter(b => b.id !== beveiligersInfo.id);
          updated.unavailable = updated.unavailable.filter(b => b.id !== beveiligersInfo.id);

          // Add to appropriate array based on status
          if (beveiligersInfo.status === 'AVAILABLE') {
            updated.availableNow.push(beveiligersInfo);
          } else if (beveiligersInfo.status === 'LIMITED' || beveiligersInfo.availableFrom) {
            updated.availableSoon.push(beveiligersInfo);
          } else {
            updated.unavailable.push(beveiligersInfo);
          }

          // Sort by distance
          updated.availableNow.sort((a, b) => a.distance - b.distance);
          updated.availableSoon.sort((a, b) => a.distance - b.distance);

          updated.lastUpdate = new Date();
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Connected to beveiligers pool channel');

          // Track opdrachtgever presence
          await channel.track({
            online_at: new Date().toISOString(),
            user_type: 'opdrachtgever',
            filters
          });
        }
      });

    // Initial fetch
    const fetchAvailability = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.location) queryParams.append('location', filters.location);
        if (filters?.maxDistance) queryParams.append('maxDistance', filters.maxDistance.toString());
        if (filters?.skills) queryParams.append('skills', filters.skills.join(','));
        if (filters?.minRating) queryParams.append('minRating', filters.minRating.toString());

        const response = await fetch(`/api/beveiligers/availability?${queryParams}`);
        if (response.ok) {
          const data = await response.json();
          setAvailability({
            beveiligerIds: data.beveiligerIds || [],
            availableNow: data.availableNow || [],
            availableSoon: data.availableSoon || [],
            unavailable: data.unavailable || [],
            onlineCount: data.onlineCount || 0,
            lastUpdate: new Date()
          });
        }
      } catch (error) {
        console.error('Error fetching beveiliger availability:', error);
      }
    };

    fetchAvailability();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [filters?.location, filters?.maxDistance, filters?.skills?.join(','), filters?.minRating]);

  return {
    availability,
    isConnected,
    totalAvailable: availability.availableNow.length,
    totalLimited: availability.availableSoon.length,
    totalUnavailable: availability.unavailable.length
  };
}

/**
 * Hook voor real-time tracking van een specifieke beveiliger
 */
export function useRealtimeBeveiliger(beveiligererId: string | undefined) {
  const [beveiliger, setBeveiliger] = useState<BeveiligersInfo | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!beveiligererId) return;

    const supabase = createSupabaseClient();

    // Subscribe to specific beveiliger channel
    const channel = supabase.channel(`beveiliger:${beveiligererId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setIsOnline(Object.keys(state).length > 0);
      })
      .on('broadcast', { event: 'status-update' }, (payload) => {
        console.log('Beveiliger status update:', payload);

        setBeveiliger({
          id: beveiligererId,
          name: payload.payload.name,
          photo: payload.payload.photo,
          rating: payload.payload.rating,
          location: payload.payload.location,
          distance: payload.payload.distance,
          status: payload.payload.status,
          availableFrom: payload.payload.availableFrom ? new Date(payload.payload.availableFrom) : undefined,
          currentShift: payload.payload.currentShift,
          isOnline: payload.payload.isOnline,
          lastSeen: new Date(),
          skills: payload.payload.skills || [],
          hourlyRate: payload.payload.hourlyRate
        });
      })
      .on('broadcast', { event: 'location-update' }, (payload) => {
        console.log('Beveiliger location update:', payload);

        setCurrentLocation({
          lat: payload.payload.latitude,
          lng: payload.payload.longitude
        });
      })
      .subscribe();

    // Initial fetch
    const fetchBeveiliger = async () => {
      try {
        const response = await fetch(`/api/beveiligers/${beveiligererId}/status`);
        if (response.ok) {
          const data = await response.json();
          setBeveiliger(data);
          setIsOnline(data.isOnline);
        }
      } catch (error) {
        console.error('Error fetching beveiliger status:', error);
      }
    };

    fetchBeveiliger();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [beveiligererId]);

  return {
    beveiliger,
    isOnline,
    currentLocation
  };
}

/**
 * Hook voor real-time shift matching
 */
export function useRealtimeShiftMatches(shiftRequirements: {
  skills: string[];
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  minRating?: number;
}) {
  const [matches, setMatches] = useState<BeveiligersInfo[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseClient();

    // Subscribe to matching updates
    const channel = supabase.channel('shift-matches')
      .on('broadcast', { event: 'match-found' }, (payload) => {
        if (payload.payload.matchesRequirements) {
          const match: BeveiligersInfo = payload.payload.beveiliger;

          setMatches(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === match.id)) {
              return prev;
            }

            // Add and sort by rating and distance
            const updated = [...prev, match];
            updated.sort((a, b) => {
              // First by rating (descending)
              if (b.rating !== a.rating) {
                return b.rating - a.rating;
              }
              // Then by distance (ascending)
              return a.distance - b.distance;
            });

            return updated;
          });

          setMatchCount(prev => prev + 1);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to shift matches channel');

          // Send match request
          await channel.send({
            type: 'broadcast',
            event: 'search-matches',
            payload: shiftRequirements
          });
        }
      });

    // Initial search
    const searchMatches = async () => {
      setIsSearching(true);
      try {
        const response = await fetch('/api/shifts/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shiftRequirements)
        });

        if (response.ok) {
          const data = await response.json();
          setMatches(data.matches);
          setMatchCount(data.totalCount);
        }
      } catch (error) {
        console.error('Error searching matches:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchMatches();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [JSON.stringify(shiftRequirements)]);

  return {
    matches,
    matchCount,
    isSearching,
    topMatches: matches.slice(0, 10)
  };
}