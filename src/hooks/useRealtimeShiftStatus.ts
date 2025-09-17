"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ShiftStatus {
  shiftId: string;
  status: 'LIVE' | 'STARTING_SOON' | 'ISSUE' | 'COMPLETED';
  checkInsCount: number;
  totalRequired: number;
  activeGuards: GuardCheckIn[];
  issues: ShiftIssue[];
  lastUpdate: Date;
}

interface GuardCheckIn {
  guardId: string;
  guardName: string;
  checkedInAt: string | null;
  status: 'ACTIVE' | 'LATE' | 'NO_SHOW';
  minutesLate?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface ShiftIssue {
  type: 'LATE_CHECK_IN' | 'NO_SHOW' | 'EARLY_DEPARTURE' | 'INCIDENT';
  description: string;
  timestamp: Date;
  guardId?: string;
}

/**
 * Hook voor real-time shift status monitoring
 * Gebruik voor live tracking van actieve shifts
 */
export function useRealtimeShiftStatus(shiftId: string | undefined) {
  const [status, setStatus] = useState<ShiftStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!shiftId) return;

    const supabase = createSupabaseClient();

    // Subscribe to shift status channel
    const shiftChannel = supabase.channel(`shift-status:${shiftId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = shiftChannel.presenceState();
        console.log('Presence sync:', state);

        // Process presence data for active guards
        const activeGuards = Object.values(state).flatMap((presences: any) =>
          presences.map((presence: any) => ({
            guardId: presence.guard_id,
            guardName: presence.guard_name,
            checkedInAt: presence.checked_in_at,
            status: presence.status,
            location: presence.location
          }))
        );

        setStatus(prev => prev ? {
          ...prev,
          activeGuards,
          checkInsCount: activeGuards.filter(g => g.status === 'ACTIVE').length
        } : null);
      })
      .on('broadcast', { event: 'shift-update' }, (payload) => {
        console.log('Shift update:', payload);

        setStatus(prev => ({
          shiftId,
          status: payload.payload.status || prev?.status || 'LIVE',
          checkInsCount: payload.payload.checkInsCount || prev?.checkInsCount || 0,
          totalRequired: payload.payload.totalRequired || prev?.totalRequired || 0,
          activeGuards: payload.payload.activeGuards || prev?.activeGuards || [],
          issues: payload.payload.issues || prev?.issues || [],
          lastUpdate: new Date()
        }));
      })
      .on('broadcast', { event: 'check-in' }, (payload) => {
        console.log('Guard check-in:', payload);

        const newCheckIn: GuardCheckIn = {
          guardId: payload.payload.guard_id,
          guardName: payload.payload.guard_name,
          checkedInAt: payload.payload.checked_in_at,
          status: 'ACTIVE',
          location: payload.payload.location
        };

        setStatus(prev => {
          if (!prev) return null;

          const updatedGuards = [
            ...prev.activeGuards.filter(g => g.guardId !== newCheckIn.guardId),
            newCheckIn
          ];

          return {
            ...prev,
            activeGuards: updatedGuards,
            checkInsCount: updatedGuards.filter(g => g.status === 'ACTIVE').length
          };
        });
      })
      .on('broadcast', { event: 'issue' }, (payload) => {
        console.log('Shift issue:', payload);

        const newIssue: ShiftIssue = {
          type: payload.payload.type,
          description: payload.payload.description,
          timestamp: new Date(payload.payload.timestamp),
          guardId: payload.payload.guard_id
        };

        setStatus(prev => {
          if (!prev) return null;

          return {
            ...prev,
            status: 'ISSUE',
            issues: [...prev.issues, newIssue]
          };
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log(`Connected to shift ${shiftId} status channel`);

          // Track presence for this client
          await shiftChannel.track({
            online_at: new Date().toISOString(),
            user_type: 'opdrachtgever'
          });
        }
      });

    setChannel(shiftChannel);

    // Cleanup on unmount
    return () => {
      if (shiftChannel) {
        supabase.removeChannel(shiftChannel);
      }
      setIsConnected(false);
    };
  }, [shiftId]);

  // Function to manually refresh status
  const refreshStatus = async () => {
    if (!shiftId) return;

    try {
      const response = await fetch(`/api/shifts/${shiftId}/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus({
          shiftId,
          status: data.status,
          checkInsCount: data.checkInsCount,
          totalRequired: data.totalRequired,
          activeGuards: data.activeGuards,
          issues: data.issues,
          lastUpdate: new Date()
        });
      }
    } catch (error) {
      console.error('Error refreshing shift status:', error);
    }
  };

  // Function to report an issue
  const reportIssue = async (issue: Omit<ShiftIssue, 'timestamp'>) => {
    if (!channel) return;

    await channel.send({
      type: 'broadcast',
      event: 'issue',
      payload: {
        ...issue,
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    status,
    isConnected,
    refreshStatus,
    reportIssue
  };
}

/**
 * Hook voor real-time monitoring van meerdere shifts
 */
export function useRealtimeMultipleShifts(shiftIds: string[]) {
  const [statuses, setStatuses] = useState<Map<string, ShiftStatus>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!shiftIds.length) return;

    const supabase = createSupabaseClient();
    const channels: RealtimeChannel[] = [];

    // Subscribe to each shift
    shiftIds.forEach(shiftId => {
      const channel = supabase.channel(`shift-status:${shiftId}`)
        .on('broadcast', { event: 'shift-update' }, (payload) => {
          setStatuses(prev => {
            const updated = new Map(prev);
            updated.set(shiftId, {
              shiftId,
              status: payload.payload.status,
              checkInsCount: payload.payload.checkInsCount,
              totalRequired: payload.payload.totalRequired,
              activeGuards: payload.payload.activeGuards || [],
              issues: payload.payload.issues || [],
              lastUpdate: new Date()
            });
            return updated;
          });
        })
        .subscribe();

      channels.push(channel);
    });

    setIsConnected(true);

    // Cleanup
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, [shiftIds.join(',')]);

  return {
    statuses,
    isConnected
  };
}

/**
 * Hook voor real-time dashboard statistieken
 */
export function useRealtimeDashboardStats(opdrachtgeverId: string | undefined) {
  const [stats, setStats] = useState({
    activeShifts: 0,
    urgentAlerts: 0,
    checkInRate: 100,
    todaysCost: 0,
    weeklyShifts: 0,
    monthlyShifts: 0
  });

  useEffect(() => {
    if (!opdrachtgeverId) return;

    const supabase = createSupabaseClient();

    // Subscribe to dashboard updates
    const channel = supabase.channel(`dashboard:${opdrachtgeverId}`)
      .on('broadcast', { event: 'stats-update' }, (payload) => {
        console.log('Dashboard stats update:', payload);
        setStats(payload.payload);
      })
      .subscribe();

    // Initial fetch
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/dashboard/opdrachtgever/${opdrachtgeverId}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [opdrachtgeverId]);

  return stats;
}