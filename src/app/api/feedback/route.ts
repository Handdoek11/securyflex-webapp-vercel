import type { Assignment, Opdracht, User } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/feedback - Get feedback for opdrachten
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
    const opdrachtId = searchParams.get("opdrachtId");
    const requiresAction = searchParams.get("requiresAction") === "true";

    const feedback = await prisma.opdrachtFeedback.findMany({
      where: {
        ...(opdrachtId && { opdrachtId }),
        ...(requiresAction && { requiresAction: true }),
        OR: [
          { opdracht: { opdrachtgeverId: session.user.id } },
          { opdracht: { bedrijf: { userId: session.user.id } } },
          { authorId: session.user.id },
        ],
      },
      include: {
        opdracht: {
          select: {
            id: true,
            titel: true,
            status: true,
            startDatum: true,
            eindDatum: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate statistics
    const stats = {
      totalFeedback: feedback.length,
      averageQuality: 0,
      averageCommunication: 0,
      averageValue: 0,
      requiresAction: feedback.filter((f) => f.requiresAction).length,
    };

    if (feedback.length > 0) {
      const qualitySum = feedback.reduce(
        (sum, f) => sum + (f.qualityScore || 0),
        0,
      );
      const communicationSum = feedback.reduce(
        (sum, f) => sum + (f.communicationScore || 0),
        0,
      );
      const valueSum = feedback.reduce(
        (sum, f) => sum + (f.valueScore || 0),
        0,
      );

      stats.averageQuality =
        qualitySum / feedback.filter((f) => f.qualityScore).length || 0;
      stats.averageCommunication =
        communicationSum /
          feedback.filter((f) => f.communicationScore).length || 0;
      stats.averageValue =
        valueSum / feedback.filter((f) => f.valueScore).length || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}

// POST /api/feedback - Submit feedback for completed opdracht
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const createFeedbackSchema = z.object({
      opdrachtId: z.string(),
      type: z.enum([
        "OPDRACHTGEVER_TO_BEDRIJF",
        "BEDRIJF_TO_OPDRACHTGEVER",
        "BEDRIJF_TO_ZZP",
        "ZZP_TO_BEDRIJF",
        "PLATFORM_QUALITY_CHECK",
      ]),
      rating: z.number().min(1).max(5).optional(),
      qualityScore: z.number().min(1).max(5).optional(),
      communicationScore: z.number().min(1).max(5).optional(),
      valueScore: z.number().min(1).max(5).optional(),
      positives: z.array(z.string()),
      improvements: z.array(z.string()),
      comment: z.string().optional(),
      requiresAction: z.boolean().default(false),
    });

    const body = await request.json();
    const validatedData = createFeedbackSchema.parse(body);

    // Check if opdracht is completed
    const opdracht = await prisma.opdracht.findUnique({
      where: { id: validatedData.opdrachtId },
      include: {
        opdrachtgever: true,
        bedrijf: true,
        assignments: {
          include: {
            teamLid: {
              include: {
                zzp: true,
              },
            },
          },
        },
      },
    });

    if (!opdracht) {
      return NextResponse.json(
        { success: false, error: "Opdracht not found" },
        { status: 404 },
      );
    }

    if (opdracht.status !== "AFGEROND") {
      return NextResponse.json(
        {
          success: false,
          error: "Opdracht must be completed to provide feedback",
        },
        { status: 400 },
      );
    }

    // Validate feedback type based on user role
    const isValidFeedbackType = validateFeedbackType(
      session.user,
      opdracht,
      validatedData.type,
    );

    if (!isValidFeedbackType) {
      return NextResponse.json(
        { success: false, error: "Invalid feedback type for your role" },
        { status: 403 },
      );
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.opdrachtFeedback.findFirst({
      where: {
        opdrachtId: validatedData.opdrachtId,
        authorId: session.user.id,
        type: validatedData.type,
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already provided feedback for this opdracht",
        },
        { status: 409 },
      );
    }

    // Create feedback
    const feedback = await prisma.opdrachtFeedback.create({
      data: {
        opdrachtId: validatedData.opdrachtId,
        authorId: session.user.id,
        type: validatedData.type,
        rating: validatedData.rating,
        qualityScore: validatedData.qualityScore,
        communicationScore: validatedData.communicationScore,
        valueScore: validatedData.valueScore,
        positives: validatedData.positives,
        improvements: validatedData.improvements,
        comment: validatedData.comment,
        requiresAction: validatedData.requiresAction,
      },
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    // Determine recipient for notification
    let recipientId: string | null = null;

    if (validatedData.type === "OPDRACHTGEVER_TO_BEDRIJF" && opdracht.bedrijf) {
      recipientId = opdracht.bedrijf.userId;
    } else if (validatedData.type === "BEDRIJF_TO_OPDRACHTGEVER") {
      recipientId = opdracht.opdrachtgeverId;
    }

    if (recipientId) {
      // Send notification
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: "OPDRACHT_UPDATED",
          category: "OPDRACHT",
          title: "Nieuwe feedback ontvangen",
          message: `${session.user.name} heeft feedback achtergelaten voor opdracht "${opdracht.titel}"`,
          actionUrl: `/dashboard/feedback/${feedback.id}`,
          metadata: {
            feedbackId: feedback.id,
            opdrachtId: opdracht.id,
            requiresAction: validatedData.requiresAction,
          },
        },
      });
    }

    // If feedback requires action, create a task or alert
    if (validatedData.requiresAction) {
      // This could trigger additional workflows like creating support tickets
      // or escalating to management
      console.log(`Feedback requires action: ${feedback.id}`);
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid feedback data",
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create feedback" },
      { status: 500 },
    );
  }
}

// PATCH /api/feedback - Update feedback with action taken
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const updateFeedbackSchema = z.object({
      feedbackId: z.string(),
      actionTaken: z.string(),
      requiresAction: z.boolean().default(false),
    });

    const body = await request.json();
    const validatedData = updateFeedbackSchema.parse(body);

    // Check if user can update this feedback
    const feedback = await prisma.opdrachtFeedback.findFirst({
      where: {
        id: validatedData.feedbackId,
        OR: [
          { opdracht: { opdrachtgeverId: session.user.id } },
          { opdracht: { bedrijf: { userId: session.user.id } } },
        ],
      },
    });

    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          error: "Feedback not found or you don't have permission",
        },
        { status: 404 },
      );
    }

    // Update feedback
    const updatedFeedback = await prisma.opdrachtFeedback.update({
      where: { id: validatedData.feedbackId },
      data: {
        actionTaken: validatedData.actionTaken,
        actionBy: session.user.id,
        actionAt: new Date(),
        requiresAction: validatedData.requiresAction,
      },
    });

    // Send notification to original author
    if (feedback.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: feedback.authorId,
          type: "OPDRACHT_UPDATED",
          category: "OPDRACHT",
          title: "Actie ondernomen op feedback",
          message: `Er is actie ondernomen op je feedback voor opdracht`,
          actionUrl: `/dashboard/feedback/${feedback.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid update data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update feedback" },
      { status: 500 },
    );
  }
}

// Helper function to validate feedback type
function validateFeedbackType(
  user: User & { role: string },
  opdracht: Opdracht & {
    opdrachtgeverId?: string;
    bedrijf?: { userId: string } | null;
    assignments?: Assignment[];
  },
  type: string,
): boolean {
  const userRole = user.role;

  switch (type) {
    case "OPDRACHTGEVER_TO_BEDRIJF":
      return (
        userRole === "OPDRACHTGEVER" && user.id === opdracht.opdrachtgeverId
      );

    case "BEDRIJF_TO_OPDRACHTGEVER":
      return userRole === "BEDRIJF" && opdracht.bedrijf?.userId === user.id;

    case "BEDRIJF_TO_ZZP":
      return userRole === "BEDRIJF" && opdracht.bedrijf?.userId === user.id;

    case "ZZP_TO_BEDRIJF": {
      // Check if ZZP was assigned to this opdracht
      const assignment = opdracht.assignments?.find(
        (a: Assignment & { teamLid?: { zzp?: { userId: string } } }) =>
          a.teamLid?.zzp?.userId === user.id,
      );
      return userRole === "ZZP_BEVEILIGER" && !!assignment;
    }

    case "PLATFORM_QUALITY_CHECK":
      // Only admin users can create platform quality checks
      return userRole === "ADMIN";

    default:
      return false;
  }
}
