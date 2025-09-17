import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Browser client for client-side operations
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server client with service role for admin operations
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ============================================
// REAL-TIME SUBSCRIPTION HELPERS
// ============================================

type RealtimeCallback = (payload: any) => void;

/**
 * Create a generic real-time subscription
 */
export const createRealtimeSubscription = (
  table: string,
  callback: RealtimeCallback,
  filter?: string
) => {
  return supabase
    .channel(`realtime-${table}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter,
      },
      callback
    )
    .subscribe();
};

/**
 * Subscribe to GPS/Werkuur updates for clock-in/out tracking
 */
export const subscribeToWerkuurUpdates = (
  opdrachtId: string,
  callback: RealtimeCallback
) => {
  return createRealtimeSubscription(
    "Werkuur",
    callback,
    `opdrachtId=eq.${opdrachtId}`
  );
};

/**
 * Subscribe to Opdracht (assignment) updates
 */
export const subscribeToOpdrachtUpdates = (
  filter: {
    opdrachtgeverId?: string;
    bedrijfId?: string;
    status?: string;
  },
  callback: RealtimeCallback
) => {
  let filterString = "";
  if (filter.opdrachtgeverId) {
    filterString = `opdrachtgeverId=eq.${filter.opdrachtgeverId}`;
  } else if (filter.bedrijfId) {
    filterString = `bedrijfId=eq.${filter.bedrijfId}`;
  } else if (filter.status) {
    filterString = `status=eq.${filter.status}`;
  }

  return createRealtimeSubscription("Opdracht", callback, filterString);
};

/**
 * Subscribe to Betaling (payment) updates
 */
export const subscribeToBetalingUpdates = (
  opdrachtgeverId: string,
  callback: RealtimeCallback
) => {
  return createRealtimeSubscription(
    "Betaling",
    callback,
    `opdrachtgeverId=eq.${opdrachtgeverId}`
  );
};

/**
 * Subscribe to Review updates for ZZP beveiligers
 */
export const subscribeToReviewUpdates = (
  beveiligerId: string,
  callback: RealtimeCallback
) => {
  return createRealtimeSubscription(
    "Review",
    callback,
    `beveiligerId=eq.${beveiligerId}`
  );
};

/**
 * Subscribe to User status updates (for online/offline tracking)
 */
export const subscribeToUserStatusUpdates = (
  userId: string,
  callback: RealtimeCallback
) => {
  return createRealtimeSubscription(
    "User",
    callback,
    `id=eq.${userId}`
  );
};

// ============================================
// PRESENCE (for live user tracking)
// ============================================

/**
 * Track user presence (online/offline status)
 */
export const trackUserPresence = (userId: string, metadata?: any) => {
  const channel = supabase.channel("presence");

  channel
    .on("presence", { event: "sync" }, () => {
      console.log("Presence state:", channel.presenceState());
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...metadata,
        });
      }
    });

  return channel;
};

/**
 * Get all online users in a specific context (e.g., available beveiligers)
 */
export const getOnlineUsers = (channelName: string = "presence") => {
  const channel = supabase.channel(channelName);

  return new Promise((resolve) => {
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        resolve(Object.values(state).flat());
      })
      .subscribe();
  });
};

// ============================================
// BROADCAST (for real-time messaging)
// ============================================

/**
 * Send a broadcast message (e.g., notifications)
 */
export const sendBroadcast = (
  channel: string,
  event: string,
  payload: any
) => {
  return supabase.channel(channel).send({
    type: "broadcast",
    event,
    payload,
  });
};

/**
 * Listen to broadcast messages
 */
export const listenToBroadcast = (
  channel: string,
  event: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(channel)
    .on("broadcast", { event }, ({ payload }) => callback(payload))
    .subscribe();
};