import type { Message } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{
    conversationId: string;
  }>;
}

// GET /api/messages/[conversationId] - Get messages from conversation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { conversationId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const cursor = searchParams.get("cursor");

    // Check if user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant || !participant.isActive) {
      return NextResponse.json(
        { success: false, error: "Not a participant in this conversation" },
        { status: 403 },
      );
    }

    // Fetch messages with pagination
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
        ...(cursor && {
          createdAt: {
            lt: new Date(cursor),
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Mark messages as read
    await prisma.conversationParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(),
        hasMore: messages.length === limit,
        nextCursor:
          messages.length > 0 ? messages[0].createdAt.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

// POST /api/messages/[conversationId] - Send message
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { conversationId } = await params;

    const sendMessageSchema = z.object({
      content: z.string().min(1),
      type: z
        .enum(["TEXT", "IMAGE", "FILE", "LOCATION", "SYSTEM", "ASSIGNMENT"])
        .default("TEXT"),
      attachments: z
        .array(
          z.object({
            url: z.string(),
            name: z.string(),
            type: z.string(),
            size: z.number(),
          }),
        )
        .optional(),
      metadata: z.any().optional(),
    });

    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    // Check if user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant || !participant.isActive) {
      return NextResponse.json(
        { success: false, error: "Not a participant in this conversation" },
        { status: 403 },
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: validatedData.content,
        type: validatedData.type,
        attachments: validatedData.attachments,
        metadata: validatedData.metadata,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Update unread counts for other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: session.user.id },
        isActive: true,
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    // Get other participants for notifications
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: session.user.id },
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notifications
    const notificationPromises = otherParticipants.map((participant) =>
      prisma.notification.create({
        data: {
          userId: participant.userId,
          type: "MESSAGE_NEW",
          category: "MESSAGE",
          title: `Nieuw bericht van ${session.user.name}`,
          message: validatedData.content.substring(0, 100),
          actionUrl: `/dashboard/messages/${conversationId}`,
        },
      }),
    );

    await Promise.all(notificationPromises);

    // Broadcast real-time update via Supabase
    const supabase = createSupabaseServerClient();
    await supabase.channel(`conversation:${conversationId}`).send({
      type: "broadcast",
      event: "new_message",
      payload: message,
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid message data",
          details: error.issues,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 },
    );
  }
}

// PATCH /api/messages/[conversationId] - Update message (edit/delete)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { conversationId } = await params;

    const updateMessageSchema = z.object({
      messageId: z.string(),
      action: z.enum(["edit", "delete"]),
      content: z.string().optional(),
    });

    const body = await request.json();
    const validatedData = updateMessageSchema.parse(body);

    // Check if user is sender
    const message = await prisma.message.findFirst({
      where: {
        id: validatedData.messageId,
        senderId: session.user.id,
      },
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message not found or you're not the sender" },
        { status: 404 },
      );
    }

    let updatedMessage: Message | undefined;

    if (validatedData.action === "edit" && validatedData.content) {
      updatedMessage = await prisma.message.update({
        where: { id: validatedData.messageId },
        data: {
          content: validatedData.content,
          isEdited: true,
          editedAt: new Date(),
        },
      });
    } else if (validatedData.action === "delete") {
      updatedMessage = await prisma.message.update({
        where: { id: validatedData.messageId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }

    // Broadcast update via Supabase
    const supabase = createSupabaseServerClient();
    await supabase.channel(`conversation:${conversationId}`).send({
      type: "broadcast",
      event:
        validatedData.action === "delete"
          ? "message_deleted"
          : "message_edited",
      payload: updatedMessage,
    });

    return NextResponse.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid update data", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 },
    );
  }
}
