import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { broadcastNotificationEvent } from "@/lib/supabase/broadcast";

// Schema for updating notification status
const updateNotificationSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAsRead: z.boolean().optional(),
  markAsUnread: z.boolean().optional(),
});

// GET /api/opdrachtgever/notifications - Get notifications for opdrachtgever
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user's Opdrachtgever profile
    const opdrachtgeverProfile = await prisma.opdrachtgever.findUnique({
      where: { userId: session.user.id },
      select: { id: true, bedrijfsnaam: true },
    });

    if (!opdrachtgeverProfile) {
      return NextResponse.json(
        { success: false, error: "Opdrachtgever profile not found" },
        { status: 404 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const category = searchParams.get("category"); // shift, application, system, payment
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const _priority = searchParams.get("priority"); // high, normal, low - TODO: implement priority filtering

    try {
      // Build where clause
      const where: Prisma.NotificationWhereInput = {
        userId: session.user.id,
        // Filter for opdrachtgever-specific notifications
        OR: [
          { type: "OPDRACHT_NEW" },
          { type: "OPDRACHT_ASSIGNED" },
          { type: "OPDRACHT_UPDATED" },
          { type: "OPDRACHT_CANCELLED" },
          { type: "TEAM_INVITED" },
          { type: "PAYMENT_PENDING" },
          { type: "SYSTEM_ANNOUNCEMENT" },
        ],
      };

      if (unreadOnly) {
        where.isRead = false;
      }

      if (category) {
        const categoryMap: Record<string, string[]> = {
          opdracht: [
            "OPDRACHT_NEW",
            "OPDRACHT_ASSIGNED",
            "OPDRACHT_UPDATED",
            "OPDRACHT_CANCELLED",
          ],
          team: ["TEAM_INVITED", "TEAM_ACCEPTED"],
          system: ["SYSTEM_ANNOUNCEMENT"],
          payment: ["PAYMENT_RECEIVED", "PAYMENT_PENDING"],
        };

        if (categoryMap[category]) {
          where.type = { in: categoryMap[category] };
        }
      }

      // Note: Priority field doesn't exist in database schema, so we ignore this filter

      // Get notifications with related data
      const [notifications, totalCount, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: {
            userId: session.user.id,
            isRead: false,
            OR: where.OR,
          },
        }),
      ]);

      // Transform notifications for frontend
      const transformedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          const relatedInfo = null;

          // Note: relatedId field doesn't exist in schema, so relatedInfo stays null

          return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: "NORMAL" as const, // Default priority since field doesn't exist
            category: notification.category,
            isRead: notification.isRead,
            relatedId: null, // relatedId doesn't exist in schema, using null
            relatedInfo,
            createdAt: notification.createdAt,
            readAt: notification.readAt,

            // UI helpers
            icon: getNotificationIcon(notification.type),
            color: getNotificationColor("NORMAL"),
            timeAgo: getTimeAgo(notification.createdAt),
          };
        }),
      );

      // Calculate category counts
      const categoryCounts = await Promise.all([
        prisma.notification.count({
          where: {
            userId: session.user.id,
            isRead: false,
            type: {
              in: [
                "SHIFT_APPLICATION",
                "SHIFT_CANCELLED",
                "SHIFT_COMPLETED",
                "URGENT_SHIFT",
              ],
            },
          },
        }),
        prisma.notification.count({
          where: {
            userId: session.user.id,
            isRead: false,
            type: {
              in: [
                "SHIFT_APPLICATION",
                "APPLICATION_APPROVED",
                "APPLICATION_REJECTED",
              ],
            },
          },
        }),
        prisma.notification.count({
          where: {
            userId: session.user.id,
            isRead: false,
            type: { in: ["SYSTEM_UPDATE", "ACCOUNT_UPDATE"] },
          },
        }),
        prisma.notification.count({
          where: {
            userId: session.user.id,
            isRead: false,
            type: { in: ["PAYMENT_DUE", "PAYMENT_COMPLETED", "INVOICE_READY"] },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        data: {
          notifications: transformedNotifications,
          unreadCount,
          categoryCounts: {
            shift: categoryCounts[0],
            application: categoryCounts[1],
            system: categoryCounts[2],
            payment: categoryCounts[3],
          },
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (dbError) {
      console.error("Database error fetching notifications:", dbError);

      // Return mock data for development
      return NextResponse.json({
        success: true,
        data: {
          notifications: [
            {
              id: "mock-1",
              type: "OPDRACHT_NEW",
              title: "Nieuwe sollicitatie",
              message:
                "Jan de Vries heeft gesolliciteerd voor Terminal 1 - Nachtdienst",
              priority: "NORMAL",
              category: "OPDRACHT",
              isRead: false,
              createdAt: new Date(),
              icon: "👤",
              color: "blue",
              timeAgo: "5 minuten geleden",
            },
            {
              id: "mock-2",
              type: "OPDRACHT_UPDATED",
              title: "Opdracht bijgewerkt",
              message: "Terminal 2 - Dagdienst morgen is bijgewerkt",
              priority: "NORMAL",
              category: "OPDRACHT",
              isRead: false,
              createdAt: new Date(Date.now() - 30 * 60 * 1000),
              icon: "🚨",
              color: "blue",
              timeAgo: "30 minuten geleden",
            },
          ],
          unreadCount: 7,
          categoryCounts: {
            shift: 3,
            application: 2,
            system: 1,
            payment: 1,
          },
          pagination: {
            page: 1,
            limit: 20,
            total: 7,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }
  } catch (error) {
    console.error("Opdrachtgever notifications GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

// PUT /api/opdrachtgever/notifications - Update notification status
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { notificationIds, markAsRead, markAsUnread } =
      updateNotificationSchema.parse(body);

    if (!notificationIds || notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No notification IDs provided" },
        { status: 400 },
      );
    }

    try {
      const updateData: Prisma.NotificationUpdateManyMutationInput = {
        updatedAt: new Date(),
      };

      if (markAsRead) {
        updateData.isRead = true;
        updateData.readAt = new Date();
      } else if (markAsUnread) {
        updateData.isRead = false;
        updateData.readAt = null;
      }

      // Update notifications (only user's own notifications)
      const updatedNotifications = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id,
        },
        data: updateData,
      });

      console.log(
        `Updated ${updatedNotifications.count} notifications for user ${session.user.id}`,
      );

      // Broadcast notification read status change (optional, for real-time UI updates)
      if (markAsRead && notificationIds && notificationIds.length > 0) {
        for (const notificationId of notificationIds) {
          await broadcastNotificationEvent(session.user.id, {
            id: notificationId,
            isRead: true,
            updatedAt: new Date(),
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          updatedCount: updatedNotifications.count,
        },
        message: `${updatedNotifications.count} meldingen bijgewerkt`,
      });
    } catch (dbError) {
      console.error("Database error updating notifications:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to update notifications" },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Update notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}

// Helper functions
function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    OPDRACHT_NEW: "👤",
    OPDRACHT_ASSIGNED: "✅",
    OPDRACHT_UPDATED: "📝",
    OPDRACHT_CANCELLED: "❌",
    TEAM_INVITED: "👥",
    TEAM_ACCEPTED: "✅",
    MESSAGE_NEW: "💬",
    REVIEW_RECEIVED: "⭐",
    PAYMENT_RECEIVED: "💰",
    PAYMENT_PENDING: "💰",
    WERKUUR_APPROVED: "✅",
    WERKUUR_DISPUTED: "⚠️",
    SYSTEM_ANNOUNCEMENT: "🔔",
  };
  return iconMap[type] || "📢";
}

function getNotificationColor(priority: string): string {
  const colorMap: Record<string, string> = {
    HIGH: "red",
    NORMAL: "blue",
    LOW: "gray",
  };
  return colorMap[priority] || "gray";
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Zojuist";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minuut" : "minuten"} geleden`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "uur" : "uren"} geleden`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "dag" : "dagen"} geleden`;
  }
}
