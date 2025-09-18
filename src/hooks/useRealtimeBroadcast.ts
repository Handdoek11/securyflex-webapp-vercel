"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BroadcastEvent,
  type BroadcastPayload,
} from "@/lib/supabase/broadcast";

interface UseRealtimeBroadcastOptions {
  channels: string[];
  events?: BroadcastEvent[];
  onMessage?: (payload: BroadcastPayload) => void;
  enabled?: boolean;
}

/**
 * Hook to listen to real-time broadcasts from the server
 */
export function useRealtimeBroadcast({
  channels,
  events,
  onMessage,
  enabled = true,
}: UseRealtimeBroadcastOptions) {
  const [lastMessage, setLastMessage] = useState<BroadcastPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    if (!enabled || channels.length === 0) return;

    const subscriptions: RealtimeChannel[] = [];

    // Subscribe to each channel
    channels.forEach((channelName) => {
      const channel = supabase.channel(channelName);

      // Subscribe to all events or specific ones
      if (!events || events.length === 0) {
        // Listen to all broadcast events
        channel.on("broadcast", { event: "*" }, (payload) => {
          console.log(`Broadcast received on ${channelName}:`, payload);
          const broadcastPayload = payload.payload as BroadcastPayload;
          setLastMessage(broadcastPayload);
          onMessage?.(broadcastPayload);
        });
      } else {
        // Listen to specific events
        events.forEach((event) => {
          channel.on("broadcast", { event }, (payload) => {
            console.log(
              `Broadcast ${event} received on ${channelName}:`,
              payload,
            );
            const broadcastPayload = payload.payload as BroadcastPayload;
            setLastMessage(broadcastPayload);
            onMessage?.(broadcastPayload);
          });
        });
      }

      // Subscribe and track connection status
      channel.subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status);
        setIsConnected(status === "SUBSCRIBED");
      });

      subscriptions.push(channel);
    });

    channelsRef.current = subscriptions;

    // Cleanup on unmount or when dependencies change
    return () => {
      subscriptions.forEach((channel) => {
        channel.unsubscribe();
      });
      channelsRef.current = [];
      setIsConnected(false);
    };
  }, [
    enabled, // Subscribe to each channel
    channels.forEach,
    channels.length,
    events,
    onMessage,
  ]);

  return {
    lastMessage,
    isConnected,
    channels: channelsRef.current,
  };
}

/**
 * Hook to listen to opdracht broadcasts
 */
export function useOpdrachtBroadcast(
  opdrachtId?: string,
  onUpdate?: (payload: BroadcastPayload) => void,
) {
  const channels = opdrachtId
    ? [`opdracht:${opdrachtId}`, `opdrachten:all`]
    : [`opdrachten:all`];

  return useRealtimeBroadcast({
    channels,
    events: [
      BroadcastEvent.OPDRACHT_CREATED,
      BroadcastEvent.OPDRACHT_UPDATED,
      BroadcastEvent.OPDRACHT_STATUS_CHANGED,
      BroadcastEvent.OPDRACHT_DELETED,
    ],
    onMessage: onUpdate,
  });
}

/**
 * Hook to listen to sollicitatie broadcasts for a specific opdracht
 */
export function useSollicitatieBroadcast(
  opdrachtId: string,
  onUpdate?: (payload: BroadcastPayload) => void,
) {
  return useRealtimeBroadcast({
    channels: [`opdracht:${opdrachtId}:sollicitaties`],
    events: [
      BroadcastEvent.SOLLICITATIE_CREATED,
      BroadcastEvent.SOLLICITATIE_ACCEPTED,
      BroadcastEvent.SOLLICITATIE_REJECTED,
      BroadcastEvent.SOLLICITATIE_WITHDRAWN,
    ],
    onMessage: onUpdate,
  });
}

/**
 * Hook to listen to team broadcasts for a bedrijf
 */
export function useTeamBroadcast(
  bedrijfId: string,
  onUpdate?: (payload: BroadcastPayload) => void,
) {
  return useRealtimeBroadcast({
    channels: [`bedrijf:${bedrijfId}:team`],
    events: [
      BroadcastEvent.TEAM_MEMBER_ASSIGNED,
      BroadcastEvent.TEAM_MEMBER_REMOVED,
      BroadcastEvent.TEAM_INVITATION_SENT,
    ],
    onMessage: onUpdate,
  });
}

/**
 * Hook to listen to werkuur (time tracking) broadcasts
 */
export function useWerkuurBroadcast(
  opdrachtId?: string,
  zzpId?: string,
  onUpdate?: (payload: BroadcastPayload) => void,
) {
  const channels = [];
  if (opdrachtId) channels.push(`opdracht:${opdrachtId}:werkuren`);
  if (zzpId) channels.push(`zzp:${zzpId}:werkuren`);

  return useRealtimeBroadcast({
    channels,
    events: [
      BroadcastEvent.WERKUUR_CLOCKIN,
      BroadcastEvent.WERKUUR_CLOCKOUT,
      BroadcastEvent.WERKUUR_UPDATED,
    ],
    onMessage: onUpdate,
    enabled: channels.length > 0,
  });
}

/**
 * Hook to listen to payment broadcasts
 */
export function usePaymentBroadcast(
  userId: string,
  userType: "zzp" | "bedrijf" | "opdrachtgever",
  onUpdate?: (payload: BroadcastPayload) => void,
) {
  const channel = `${userType}:${userId}:payments`;

  return useRealtimeBroadcast({
    channels: [channel],
    events: [
      BroadcastEvent.PAYMENT_INITIATED,
      BroadcastEvent.PAYMENT_COMPLETED,
      BroadcastEvent.PAYMENT_FAILED,
    ],
    onMessage: onUpdate,
  });
}

/**
 * Hook to listen to notification broadcasts
 */
export function useNotificationBroadcast(
  userId: string,
  onNewNotification?: (notification: any) => void,
) {
  return useRealtimeBroadcast({
    channels: [`user:${userId}:notifications`],
    events: [BroadcastEvent.NOTIFICATION_NEW, BroadcastEvent.NOTIFICATION_READ],
    onMessage: (payload) => {
      if (payload.event === BroadcastEvent.NOTIFICATION_NEW) {
        onNewNotification?.(payload.data);
      }
    },
  });
}

/**
 * Hook to listen to message broadcasts for real-time chat
 */
export function useMessageBroadcast(
  conversationId: string,
  userId: string,
  onNewMessage?: (message: any) => void,
) {
  return useRealtimeBroadcast({
    channels: [`conversation:${conversationId}`, `messages:${userId}`],
    events: [BroadcastEvent.MESSAGE_SENT, BroadcastEvent.MESSAGE_READ],
    onMessage: (payload) => {
      if (payload.event === BroadcastEvent.MESSAGE_SENT) {
        onNewMessage?.(payload.data);
      }
    },
  });
}

// ============================================
// OPDRACHTGEVER-SPECIFIC BROADCAST HOOKS
// ============================================

/**
 * Hook to listen to opdrachtgever-specific opdracht broadcasts
 */
export function useOpdrachtgeverShiftsBroadcast(
  opdrachtgeverId: string,
  onUpdate?: (payload: BroadcastPayload) => void,
) {
  return useRealtimeBroadcast({
    channels: [`opdrachtgever:${opdrachtgeverId}`, `opdrachten:all`],
    events: [
      BroadcastEvent.OPDRACHT_CREATED,
      BroadcastEvent.OPDRACHT_UPDATED,
      BroadcastEvent.OPDRACHT_STATUS_CHANGED,
      BroadcastEvent.OPDRACHT_DELETED,
    ],
    onMessage: onUpdate,
  });
}

/**
 * Hook to listen to shifts created by this opdrachtgever
 */
export function useOpdrachtgeverOwnShiftsBroadcast(
  opdrachtgeverId: string,
  onShiftUpdate?: (shift: any, eventType: BroadcastEvent) => void,
) {
  return useRealtimeBroadcast({
    channels: [`opdrachtgever:${opdrachtgeverId}`],
    events: [
      BroadcastEvent.OPDRACHT_CREATED,
      BroadcastEvent.OPDRACHT_UPDATED,
      BroadcastEvent.OPDRACHT_STATUS_CHANGED,
    ],
    onMessage: (payload) => {
      if (payload.data?.opdracht && onShiftUpdate) {
        onShiftUpdate(payload.data.opdracht, payload.event);
      }
    },
  });
}

/**
 * Hook to listen to sollicitatie broadcasts for opdrachtgever's shifts
 */
export function useOpdrachtgeverSollicitatieBroadcast(
  opdrachtgeverId: string,
  onApplicationUpdate?: (payload: BroadcastPayload) => void,
) {
  return useRealtimeBroadcast({
    channels: [
      `opdrachtgever:${opdrachtgeverId}`,
      `sollicitaties:opdrachtgever:${opdrachtgeverId}`,
    ],
    events: [
      BroadcastEvent.SOLLICITATIE_CREATED,
      BroadcastEvent.SOLLICITATIE_ACCEPTED,
      BroadcastEvent.SOLLICITATIE_REJECTED,
      BroadcastEvent.SOLLICITATIE_WITHDRAWN,
    ],
    onMessage: onApplicationUpdate,
  });
}

/**
 * Hook to listen to opdrachtgever dashboard updates
 */
export function useOpdrachtgeverDashboardBroadcast(
  opdrachtgeverId: string,
  onStatsUpdate?: (stats: any) => void,
) {
  return useRealtimeBroadcast({
    channels: [
      `opdrachtgever:${opdrachtgeverId}`,
      `dashboard:opdrachtgever:${opdrachtgeverId}`,
    ],
    events: [
      BroadcastEvent.OPDRACHT_CREATED,
      BroadcastEvent.OPDRACHT_STATUS_CHANGED,
      BroadcastEvent.SOLLICITATIE_CREATED,
      BroadcastEvent.SOLLICITATIE_ACCEPTED,
      BroadcastEvent.PAYMENT_COMPLETED,
    ],
    onMessage: (payload) => {
      // Any of these events could affect dashboard stats
      onStatsUpdate?.(payload.data);
    },
  });
}

/**
 * Hook to listen to opdrachtgever-specific notifications
 */
export function useOpdrachtgeverNotificationsBroadcast(
  userId: string,
  onNewNotification?: (notification: any) => void,
  onNotificationRead?: (notificationId: string) => void,
) {
  return useRealtimeBroadcast({
    channels: [`user:${userId}:notifications`],
    events: [BroadcastEvent.NOTIFICATION_NEW, BroadcastEvent.NOTIFICATION_READ],
    onMessage: (payload) => {
      if (payload.event === BroadcastEvent.NOTIFICATION_NEW) {
        onNewNotification?.(payload.data);
      } else if (payload.event === BroadcastEvent.NOTIFICATION_READ) {
        onNotificationRead?.(payload.data.id);
      }
    },
  });
}

/**
 * Hook for real-time shift applications/sollicitaties updates
 */
export function useShiftApplicationsBroadcast(
  shiftId: string,
  onApplicationChange?: (payload: BroadcastPayload) => void,
) {
  return useRealtimeBroadcast({
    channels: [`opdracht:${shiftId}:sollicitaties`],
    events: [
      BroadcastEvent.SOLLICITATIE_CREATED,
      BroadcastEvent.SOLLICITATIE_WITHDRAWN,
    ],
    onMessage: onApplicationChange,
  });
}
