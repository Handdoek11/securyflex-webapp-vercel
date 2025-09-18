import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const cursor = searchParams.get("cursor");

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(category && { category }),
        ...(unreadOnly && { isRead: false }),
        ...(cursor && {
          createdAt: {
            lt: new Date(cursor),
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    // Get category counts
    const categoryCounts = await prisma.notification.groupBy({
      by: ["category"],
      where: {
        userId: session.user.id,
        isRead: false,
      },
      _count: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        categoryCounts: categoryCounts.reduce(
          (acc, item) => {
            acc[item.category] = item._count.category;
            return acc;
          },
          {} as Record<string, number>,
        ),
        hasMore: notifications.length === limit,
        nextCursor:
          notifications.length > 0
            ? notifications[notifications.length - 1].createdAt.toISOString()
            : null,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

// POST /api/notifications - Create notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const createNotificationSchema = z.object({
      recipientId: z.string(),
      type: z.enum([
        "OPDRACHT_NEW",
        "OPDRACHT_ASSIGNED",
        "OPDRACHT_UPDATED",
        "OPDRACHT_CANCELLED",
        "TEAM_INVITED",
        "TEAM_ACCEPTED",
        "MESSAGE_NEW",
        "REVIEW_RECEIVED",
        "PAYMENT_RECEIVED",
        "PAYMENT_PENDING",
        "WERKUUR_APPROVED",
        "WERKUUR_DISPUTED",
        "SYSTEM_ANNOUNCEMENT",
      ]),
      category: z.enum([
        "OPDRACHT",
        "TEAM",
        "PAYMENT",
        "MESSAGE",
        "REVIEW",
        "SYSTEM",
      ]),
      title: z.string(),
      message: z.string(),
      actionUrl: z.string().optional(),
      actionLabel: z.string().optional(),
      metadata: z.any().optional(),
    });

    const body = await request.json();
    const validatedData = createNotificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: {
        userId: validatedData.recipientId,
        type: validatedData.type,
        category: validatedData.category,
        title: validatedData.title,
        message: validatedData.message,
        actionUrl: validatedData.actionUrl,
        actionLabel: validatedData.actionLabel,
        metadata: validatedData.metadata,
      },
    });

    // Send real-time notification via Supabase
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    await supabase.channel(`user:${validatedData.recipientId}`).send({
      type: "broadcast",
      event: "new_notification",
      payload: notification,
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid notification data",
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 },
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const updateNotificationSchema = z.object({
      notificationIds: z.array(z.string()).optional(),
      markAllAsRead: z.boolean().optional(),
    });

    const body = await request.json();
    const validatedData = updateNotificationSchema.parse(body);

    let result: Prisma.BatchPayload;

    if (validatedData.markAllAsRead) {
      // Mark all unread notifications as read
      result = await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else if (validatedData.notificationIds) {
      // Mark specific notifications as read
      result = await prisma.notification.updateMany({
        where: {
          id: { in: validatedData.notificationIds },
          userId: session.user.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "No notifications specified" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid update data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const notificationIds = searchParams.get("ids")?.split(",");
    const clearAll = searchParams.get("clearAll") === "true";

    let result: Prisma.BatchPayload;

    if (clearAll) {
      result = await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
        },
      });
    } else if (notificationIds) {
      result = await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "No notifications specified" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notifications" },
      { status: 500 },
    );
  }
}
