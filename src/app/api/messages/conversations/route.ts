import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/messages/conversations - Get user's conversations
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
    const type = searchParams.get("type");
    const opdrachtId = searchParams.get("opdrachtId");

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
            isActive: true,
          },
        },
        ...(type && { type }),
        ...(opdrachtId && { opdrachtId }),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        opdracht: {
          select: {
            id: true,
            titel: true,
            status: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    // Get unread counts
    const conversationsWithUnread = conversations.map((conv) => {
      const participant = conv.participants.find(
        (p) => p.userId === session.user.id,
      );
      return {
        ...conv,
        unreadCount: participant?.unreadCount || 0,
        lastMessage: conv.messages[0] || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: conversationsWithUnread,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

// POST /api/messages/conversations - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const createConversationSchema = z.object({
      type: z.enum(["DIRECT", "GROUP", "OPDRACHT", "SUPPORT"]),
      participantIds: z.array(z.string()).min(1),
      title: z.string().optional(),
      opdrachtId: z.string().optional(),
      initialMessage: z.string().optional(),
    });

    const body = await request.json();
    const validatedData = createConversationSchema.parse(body);

    // Check if conversation already exists (for DIRECT type)
    if (
      validatedData.type === "DIRECT" &&
      validatedData.participantIds.length === 1
    ) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "DIRECT",
          participants: {
            every: {
              userId: {
                in: [session.user.id, validatedData.participantIds[0]],
              },
            },
          },
        },
      });

      if (existingConversation) {
        return NextResponse.json({
          success: true,
          data: existingConversation,
          existing: true,
        });
      }
    }

    // Create conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        opdrachtId: validatedData.opdrachtId,
        participants: {
          create: [
            { userId: session.user.id },
            ...validatedData.participantIds.map((id) => ({ userId: id })),
          ],
        },
        ...(validatedData.initialMessage && {
          messages: {
            create: {
              senderId: session.user.id,
              content: validatedData.initialMessage,
              type: "TEXT",
            },
          },
          lastMessageAt: new Date(),
        }),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Send notifications to other participants
    const notificationPromises = validatedData.participantIds.map((userId) =>
      prisma.notification.create({
        data: {
          userId,
          type: "MESSAGE_NEW",
          category: "MESSAGE",
          title: "Nieuw gesprek",
          message: `${session.user.name} heeft een gesprek met je gestart`,
          actionUrl: `/dashboard/messages/${conversation.id}`,
        },
      }),
    );

    await Promise.all(notificationPromises);

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.issues,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
