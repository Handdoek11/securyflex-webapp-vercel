"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected";
  subscriptions: Map<string, RealtimeChannel>;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  connectionStatus: "disconnected",
  subscriptions: new Map(),
});

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
}

interface RealtimeProviderProps {
  children: ReactNode;
}

/**
 * Provider voor app-wide real-time functionaliteit
 * Wrap je app hiermee voor globale real-time features
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const [subscriptions] = useState(new Map());
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) {
      setConnectionStatus("disconnected");
      setIsConnected(false);
      return;
    }

    setConnectionStatus("connecting");

    // Setup realtime connection
    const setupRealtime = async () => {
      try {
        // Test connection
        const { data, error } = await supabase
          .from("User")
          .select("id")
          .limit(1);

        if (!error) {
          setIsConnected(true);
          setConnectionStatus("connected");
          console.log("✅ Supabase real-time connected");
        } else {
          console.error("❌ Supabase connection error:", error);
          setConnectionStatus("disconnected");
        }
      } catch (error) {
        console.error("Failed to setup realtime:", error);
        setConnectionStatus("disconnected");
      }
    };

    setupRealtime();

    // Monitor connection status
    const channel = supabase.channel("connection-monitor");

    channel
      .on("system", { event: "*" }, (payload) => {
        console.log("System event:", payload);
        if (payload.type === "error") {
          setConnectionStatus("disconnected");
          setIsConnected(false);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
          setIsConnected(true);
        } else if (status === "CHANNEL_ERROR") {
          setConnectionStatus("disconnected");
          setIsConnected(false);
        }
      });

    return () => {
      // Cleanup all subscriptions
      subscriptions.forEach((sub) => sub.unsubscribe());
      subscriptions.clear();
      channel.unsubscribe();
    };
  }, [session?.user, subscriptions]);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        connectionStatus,
        subscriptions,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Component om connection status te tonen
 */
export function RealtimeStatus() {
  const { isConnected, connectionStatus } = useRealtime();

  if (connectionStatus === "connected") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Live
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        Connecting...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="h-2 w-2 rounded-full bg-gray-400" />
      Offline
    </div>
  );
}
