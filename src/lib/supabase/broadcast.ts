import { supabaseAdmin } from "@/lib/supabase";

/**
 * Server-side broadcast utility for sending real-time updates from API routes
 */

export enum BroadcastEvent {
  // Opdracht events
  OPDRACHT_CREATED = "opdracht:created",
  OPDRACHT_UPDATED = "opdracht:updated",
  OPDRACHT_DELETED = "opdracht:deleted",
  OPDRACHT_STATUS_CHANGED = "opdracht:status_changed",

  // Sollicitatie events
  SOLLICITATIE_CREATED = "sollicitatie:created",
  SOLLICITATIE_ACCEPTED = "sollicitatie:accepted",
  SOLLICITATIE_REJECTED = "sollicitatie:rejected",
  SOLLICITATIE_WITHDRAWN = "sollicitatie:withdrawn",

  // Team events
  TEAM_MEMBER_ASSIGNED = "team:assigned",
  TEAM_MEMBER_REMOVED = "team:removed",
  TEAM_INVITATION_SENT = "team:invitation_sent",

  // Werkuur events
  WERKUUR_CLOCKIN = "werkuur:clockin",
  WERKUUR_CLOCKOUT = "werkuur:clockout",
  WERKUUR_UPDATED = "werkuur:updated",

  // Payment events
  PAYMENT_INITIATED = "payment:initiated",
  PAYMENT_COMPLETED = "payment:completed",
  PAYMENT_FAILED = "payment:failed",

  // Notification events
  NOTIFICATION_NEW = "notification:new",
  NOTIFICATION_READ = "notification:read",

  // Review events
  REVIEW_CREATED = "review:created",
  REVIEW_UPDATED = "review:updated",

  // Message events
  MESSAGE_SENT = "message:sent",
  MESSAGE_READ = "message:read",

  // Verzekering events
  VERZEKERING_AANVRAAG_CREATED = "verzekering:aanvraag_created",
  VERZEKERING_AANVRAAG_UPDATED = "verzekering:aanvraag_updated",
  VERZEKERING_OFFERTE_RECEIVED = "verzekering:offerte_received",
  VERZEKERING_ACTIVATED = "verzekering:activated",
}

export interface BroadcastPayload {
  event: BroadcastEvent;
  data: any;
  userId?: string;
  bedrijfId?: string;
  opdrachtgeverId?: string;
  timestamp: string;
}

/**
 * Broadcast an event to all connected clients on a specific channel
 */
export async function broadcastEvent(
  channel: string,
  event: BroadcastEvent,
  data: any,
  metadata?: {
    userId?: string;
    bedrijfId?: string;
    opdrachtgeverId?: string;
  },
) {
  try {
    const payload: BroadcastPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    const response = await supabaseAdmin.channel(channel).send({
      type: "broadcast",
      event: event,
      payload,
    });

    return { success: true, response };
  } catch (error) {
    console.error(`Failed to broadcast ${event} on ${channel}:`, error);
    return { success: false, error };
  }
}

/**
 * Broadcast opdracht-related events
 */
export async function broadcastOpdrachtEvent(
  event: BroadcastEvent,
  opdracht: any,
  additionalData?: any,
) {
  // Broadcast to multiple channels for different user types
  const channels = [`opdracht:${opdracht.id}`, `opdrachten:all`];

  // Add specific channels based on opdracht properties
  if (opdracht.opdrachtgeverId) {
    channels.push(`opdrachtgever:${opdracht.opdrachtgeverId}`);
  }
  if (opdracht.creatorBedrijfId) {
    channels.push(`bedrijf:${opdracht.creatorBedrijfId}`);
  }
  if (opdracht.acceptedBedrijfId) {
    channels.push(`bedrijf:${opdracht.acceptedBedrijfId}`);
  }

  const results = await Promise.all(
    channels.map((channel) =>
      broadcastEvent(channel, event, { opdracht, ...additionalData }),
    ),
  );

  return results.every((r) => r.success);
}

/**
 * Broadcast sollicitatie-related events
 */
export async function broadcastSollicitatieEvent(
  event: BroadcastEvent,
  sollicitatie: any,
  opdracht: any,
) {
  const channels = [
    `opdracht:${opdracht.id}:sollicitaties`,
    `sollicitatie:${sollicitatie.id}`,
  ];

  // Add channel for the sollicitant
  if (sollicitatie.zzpId) {
    channels.push(`zzp:${sollicitatie.zzpId}`);
  }
  if (sollicitatie.bedrijfId) {
    channels.push(`bedrijf:${sollicitatie.bedrijfId}`);
  }

  // Add channel for opdracht owner
  if (opdracht.creatorId) {
    channels.push(`user:${opdracht.creatorId}`);
  }

  const results = await Promise.all(
    channels.map((channel) =>
      broadcastEvent(channel, event, { sollicitatie, opdracht }),
    ),
  );

  return results.every((r) => r.success);
}

/**
 * Broadcast team-related events
 */
export async function broadcastTeamEvent(
  event: BroadcastEvent,
  teamData: any,
  bedrijfId: string,
) {
  const channels = [`bedrijf:${bedrijfId}:team`, `team:updates`];

  const results = await Promise.all(
    channels.map((channel) =>
      broadcastEvent(channel, event, teamData, { bedrijfId }),
    ),
  );

  return results.every((r) => r.success);
}

/**
 * Broadcast werkuur (time tracking) events
 */
export async function broadcastWerkuurEvent(
  event: BroadcastEvent,
  werkuur: any,
  opdracht?: any,
) {
  const channels = [`werkuur:${werkuur.id}`, `zzp:${werkuur.zzpId}:werkuren`];

  if (werkuur.opdrachtId) {
    channels.push(`opdracht:${werkuur.opdrachtId}:werkuren`);
  }

  const results = await Promise.all(
    channels.map((channel) =>
      broadcastEvent(channel, event, { werkuur, opdracht }),
    ),
  );

  return results.every((r) => r.success);
}

/**
 * Broadcast payment-related events
 */
export async function broadcastPaymentEvent(
  event: BroadcastEvent,
  payment: any,
  metadata?: any,
) {
  const channels = [`payment:${payment.id}`, `payments:all`];

  // Add channels for involved parties
  if (payment.zzpId) {
    channels.push(`zzp:${payment.zzpId}:payments`);
  }
  if (payment.bedrijfId) {
    channels.push(`bedrijf:${payment.bedrijfId}:payments`);
  }
  if (payment.opdrachtgeverId) {
    channels.push(`opdrachtgever:${payment.opdrachtgeverId}:payments`);
  }

  const results = await Promise.all(
    channels.map((channel) =>
      broadcastEvent(channel, event, { payment, ...metadata }),
    ),
  );

  return results.every((r) => r.success);
}

/**
 * Broadcast notification events
 */
export async function broadcastNotificationEvent(
  userId: string,
  notification: any,
) {
  return broadcastEvent(
    `user:${userId}:notifications`,
    BroadcastEvent.NOTIFICATION_NEW,
    notification,
    { userId },
  );
}

/**
 * Broadcast message events for real-time chat
 */
export async function broadcastMessageEvent(
  event: BroadcastEvent,
  message: any,
  conversationId: string,
) {
  const channels = [
    `conversation:${conversationId}`,
    `messages:${message.senderId}`,
    `messages:${message.receiverId}`,
  ];

  const results = await Promise.all(
    channels.map((channel) => broadcastEvent(channel, event, message)),
  );

  return results.every((r) => r.success);
}

/**
 * Broadcast verzekering (insurance) related events
 */
export async function broadcastVerzekeringEvent(
  event: BroadcastEvent | string,
  payload: any,
  userId?: string,
) {
  const channels = ["verzekeringen"];

  if (userId) {
    channels.push(`user:${userId}:verzekeringen`);
  }

  const results = await Promise.all(
    channels.map((channel) =>
      broadcastEvent(channel, event as BroadcastEvent, payload),
    ),
  );

  return results.every((r) => r.success);
}
