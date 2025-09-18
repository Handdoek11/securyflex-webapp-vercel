"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "URGENT";
  category: "SHIFT" | "PAYMENT" | "DOCUMENT" | "SYSTEM" | "MESSAGE";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  urgentCount: number;
  lastUpdate: Date;
}

/**
 * Hook voor real-time notificaties
 */
export function useRealtimeNotifications(userId: string | undefined) {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    urgentCount: 0,
    lastUpdate: new Date(),
  });
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseClient();

    // Subscribe to personal notification channel
    const notificationChannel = supabase
      .channel(`notifications:${userId}`)
      .on("broadcast", { event: "new-notification" }, (payload) => {
        console.log("New notification:", payload);

        const notification: Notification = {
          id: payload.payload.id,
          type: payload.payload.type,
          category: payload.payload.category,
          title: payload.payload.title,
          message: payload.payload.message,
          timestamp: new Date(payload.payload.timestamp),
          isRead: false,
          actionUrl: payload.payload.actionUrl,
          actionLabel: payload.payload.actionLabel,
          metadata: payload.payload.metadata,
        };

        setState((prev) => {
          const updated = [...prev.notifications];

          // Add to beginning of array (newest first)
          updated.unshift(notification);

          // Limit to 100 notifications
          if (updated.length > 100) {
            updated.pop();
          }

          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.isRead).length,
            urgentCount: updated.filter((n) => n.type === "URGENT" && !n.isRead)
              .length,
            lastUpdate: new Date(),
          };
        });

        // Show browser notification if permission granted
        if (
          notification.type === "URGENT" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/logo-icon.png",
            badge: "/badge-icon.png",
            vibrate: [200, 100, 200],
            tag: notification.id,
            data: { actionUrl: notification.actionUrl },
          });
        }
      })
      .on("broadcast", { event: "mark-read" }, (payload) => {
        const notificationId = payload.payload.notificationId;

        setState((prev) => {
          const updated = prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n,
          );

          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.isRead).length,
            urgentCount: updated.filter((n) => n.type === "URGENT" && !n.isRead)
              .length,
            lastUpdate: new Date(),
          };
        });
      })
      .on("broadcast", { event: "mark-all-read" }, () => {
        setState((prev) => ({
          notifications: prev.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
          unreadCount: 0,
          urgentCount: 0,
          lastUpdate: new Date(),
        }));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          console.log(`Connected to notifications channel for user ${userId}`);
        }
      });

    setChannel(notificationChannel);

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const notifications = data.notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));

          setState({
            notifications,
            unreadCount: notifications.filter((n: Notification) => !n.isRead)
              .length,
            urgentCount: notifications.filter(
              (n: Notification) => n.type === "URGENT" && !n.isRead,
            ).length,
            lastUpdate: new Date(),
          });
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      if (notificationChannel) {
        supabase.removeChannel(notificationChannel);
      }
      setIsConnected(false);
    };
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!channel) return;

      await channel.send({
        type: "broadcast",
        event: "mark-read",
        payload: { notificationId },
      });

      // Optimistically update local state
      setState((prev) => {
        const updated = prev.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        );

        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
          urgentCount: updated.filter((n) => n.type === "URGENT" && !n.isRead)
            .length,
          lastUpdate: new Date(),
        };
      });
    },
    [channel],
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!channel) return;

    await channel.send({
      type: "broadcast",
      event: "mark-all-read",
      payload: {},
    });

    // Optimistically update local state
    setState((prev) => ({
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
      urgentCount: 0,
      lastUpdate: new Date(),
    }));
  }, [channel]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setState({
      notifications: [],
      unreadCount: 0,
      urgentCount: 0,
      lastUpdate: new Date(),
    });
  }, []);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    urgentCount: state.urgentCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAll,
    lastUpdate: state.lastUpdate,
  };
}

/**
 * Hook voor real-time alerts (urgent notifications)
 */
export function useRealtimeAlerts(opdrachtgeverId: string | undefined) {
  const [alerts, setAlerts] = useState<{
    shiftAlerts: Array<{
      id: string;
      shiftId: string;
      type: "UNFILLED" | "NO_SHOW" | "INCIDENT" | "LATE_CHECK_IN";
      message: string;
      severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      timestamp: Date;
      requiresAction: boolean;
    }>;
    documentAlerts: Array<{
      id: string;
      beveiligererId: string;
      documentType: string;
      message: string;
      expiresIn: number; // days
      timestamp: Date;
    }>;
    paymentAlerts: Array<{
      id: string;
      invoiceId: string;
      message: string;
      amount: number;
      dueDate: Date;
      isOverdue: boolean;
    }>;
  }>({
    shiftAlerts: [],
    documentAlerts: [],
    paymentAlerts: [],
  });

  useEffect(() => {
    if (!opdrachtgeverId) return;

    const supabase = createSupabaseClient();

    // Subscribe to alerts channel
    const channel = supabase
      .channel(`alerts:${opdrachtgeverId}`)
      .on("broadcast", { event: "shift-alert" }, (payload) => {
        console.log("Shift alert:", payload);

        setAlerts((prev) => ({
          ...prev,
          shiftAlerts: [
            {
              id: payload.payload.id,
              shiftId: payload.payload.shiftId,
              type: payload.payload.type,
              message: payload.payload.message,
              severity: payload.payload.severity,
              timestamp: new Date(payload.payload.timestamp),
              requiresAction: payload.payload.requiresAction,
            },
            ...prev.shiftAlerts,
          ].slice(0, 20), // Keep last 20 alerts
        }));
      })
      .on("broadcast", { event: "document-alert" }, (payload) => {
        console.log("Document alert:", payload);

        setAlerts((prev) => ({
          ...prev,
          documentAlerts: [
            {
              id: payload.payload.id,
              beveiligererId: payload.payload.beveiligererId,
              documentType: payload.payload.documentType,
              message: payload.payload.message,
              expiresIn: payload.payload.expiresIn,
              timestamp: new Date(payload.payload.timestamp),
            },
            ...prev.documentAlerts,
          ].slice(0, 10),
        }));
      })
      .on("broadcast", { event: "payment-alert" }, (payload) => {
        console.log("Payment alert:", payload);

        setAlerts((prev) => ({
          ...prev,
          paymentAlerts: [
            {
              id: payload.payload.id,
              invoiceId: payload.payload.invoiceId,
              message: payload.payload.message,
              amount: payload.payload.amount,
              dueDate: new Date(payload.payload.dueDate),
              isOverdue: payload.payload.isOverdue,
            },
            ...prev.paymentAlerts,
          ].slice(0, 10),
        }));
      })
      .subscribe();

    // Initial fetch
    const fetchAlerts = async () => {
      try {
        const response = await fetch(
          `/api/alerts/opdrachtgever/${opdrachtgeverId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setAlerts({
            shiftAlerts:
              data.shiftAlerts?.map((a: any) => ({
                ...a,
                timestamp: new Date(a.timestamp),
              })) || [],
            documentAlerts:
              data.documentAlerts?.map((a: any) => ({
                ...a,
                timestamp: new Date(a.timestamp),
              })) || [],
            paymentAlerts:
              data.paymentAlerts?.map((a: any) => ({
                ...a,
                dueDate: new Date(a.dueDate),
              })) || [],
          });
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [opdrachtgeverId]);

  const totalAlerts =
    alerts.shiftAlerts.filter((a) => a.requiresAction).length +
    alerts.documentAlerts.length +
    alerts.paymentAlerts.filter((a) => a.isOverdue).length;

  const criticalAlerts = alerts.shiftAlerts.filter(
    (a) => a.severity === "CRITICAL",
  );

  return {
    alerts,
    totalAlerts,
    criticalAlerts,
    hasUrgentAlerts:
      criticalAlerts.length > 0 ||
      alerts.paymentAlerts.some((a) => a.isOverdue),
  };
}
