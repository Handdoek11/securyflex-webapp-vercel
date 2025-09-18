import type {
  Assignment,
  Bedrijf,
  Opdracht,
  Opdrachtgever,
  Prisma,
  TeamLid,
  User,
  ZZPProfile,
} from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Type definitions
type OpdrachtWithRelations = Opdracht & {
  opdrachtgever?: Opdrachtgever | null;
  bedrijf?: Bedrijf | null;
  assignments: Array<
    Assignment & {
      teamLid: TeamLid & {
        zzp?: ZZPProfile | null;
      };
    }
  >;
};

type AssignmentWithTeamLid = Assignment & {
  teamLid: TeamLid & {
    zzp?: (ZZPProfile & { userId: string }) | null;
  };
  status: string;
};

// GET /api/reviews - Get reviews
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
    const userId = searchParams.get("userId");
    const opdrachtId = searchParams.get("opdrachtId");
    const type = searchParams.get("type"); // "given" or "received"

    const where: Prisma.ReviewWhereInput = {};

    if (userId && type === "given") {
      where.reviewerId = userId;
    } else if (userId && type === "received") {
      where.reviewedId = userId;
    } else if (userId) {
      where.OR = [{ reviewerId: userId }, { reviewedId: userId }];
    }

    if (opdrachtId) {
      where.opdrachtId = opdrachtId;
    }

    const reviews = await prisma.review.findMany({
      where: {
        ...where,
        isPublic: true,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        reviewed: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        opdracht: {
          select: {
            id: true,
            titel: true,
            startDatum: true,
            eindDatum: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average ratings
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    // Group ratings by aspect
    const aspectRatings: Record<string, number> = {};
    let aspectCount = 0;

    reviews.forEach((review) => {
      if (review.aspectRatings && typeof review.aspectRatings === "object") {
        const ratings = review.aspectRatings as Record<string, number>;
        Object.entries(ratings).forEach(([aspect, rating]) => {
          if (!aspectRatings[aspect]) {
            aspectRatings[aspect] = 0;
          }
          aspectRatings[aspect] += rating;
        });
        aspectCount++;
      }
    });

    // Calculate average for each aspect
    if (aspectCount > 0) {
      Object.keys(aspectRatings).forEach((aspect) => {
        aspectRatings[aspect] = aspectRatings[aspect] / aspectCount;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: {
          totalReviews: reviews.length,
          averageRating,
          aspectRatings,
          ratingDistribution: {
            5: reviews.filter((r) => r.rating === 5).length,
            4: reviews.filter((r) => r.rating === 4).length,
            3: reviews.filter((r) => r.rating === 3).length,
            2: reviews.filter((r) => r.rating === 2).length,
            1: reviews.filter((r) => r.rating === 1).length,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const createReviewSchema = z.object({
      reviewedId: z.string(),
      opdrachtId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
      aspectRatings: z
        .object({
          punctuality: z.number().min(1).max(5).optional(),
          professionalism: z.number().min(1).max(5).optional(),
          quality: z.number().min(1).max(5).optional(),
          communication: z.number().min(1).max(5).optional(),
          value: z.number().min(1).max(5).optional(),
        })
        .optional(),
      isPublic: z.boolean().default(true),
    });

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Check if user can review this person for this opdracht
    const opdracht = await prisma.opdracht.findUnique({
      where: { id: validatedData.opdrachtId },
      include: {
        opdrachtgever: true,
        bedrijf: true,
        assignments: {
          include: {
            teamLid: true,
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

    // Validate review relationship
    const canReview = validateReviewPermission(
      session.user,
      opdracht,
      validatedData.reviewedId,
    );

    if (!canReview) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot review this user for this opdracht",
        },
        { status: 403 },
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_reviewedId_opdrachtId: {
          reviewerId: session.user.id,
          reviewedId: validatedData.reviewedId,
          opdrachtId: validatedData.opdrachtId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already reviewed this user for this opdracht",
        },
        { status: 409 },
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        reviewedId: validatedData.reviewedId,
        opdrachtId: validatedData.opdrachtId,
        rating: validatedData.rating,
        comment: validatedData.comment,
        aspectRatings: validatedData.aspectRatings,
        isPublic: validatedData.isPublic,
      },
      include: {
        reviewer: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Update reviewed user's rating
    await updateUserRating(validatedData.reviewedId);

    // Send notification to reviewed user
    await prisma.notification.create({
      data: {
        userId: validatedData.reviewedId,
        type: "REVIEW_RECEIVED",
        category: "REVIEW",
        title: "Nieuwe beoordeling ontvangen",
        message: `${session.user.name} heeft je beoordeeld met ${validatedData.rating} sterren`,
        actionUrl: `/dashboard/reviews`,
        metadata: {
          reviewId: review.id,
          rating: validatedData.rating,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid review data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 },
    );
  }
}

// PATCH /api/reviews - Add response to review
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const updateReviewSchema = z.object({
      reviewId: z.string(),
      response: z.string(),
    });

    const body = await request.json();
    const validatedData = updateReviewSchema.parse(body);

    // Check if user is the reviewed person
    const review = await prisma.review.findFirst({
      where: {
        id: validatedData.reviewId,
        reviewedId: session.user.id,
      },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: "Review not found or you're not the reviewed person",
        },
        { status: 404 },
      );
    }

    if (review.response) {
      return NextResponse.json(
        { success: false, error: "Response already exists" },
        { status: 409 },
      );
    }

    // Update review with response
    const updatedReview = await prisma.review.update({
      where: { id: validatedData.reviewId },
      data: {
        response: validatedData.response,
        responseAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response data",
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to add response" },
      { status: 500 },
    );
  }
}

// Helper function to validate review permission
function validateReviewPermission(
  user: User,
  opdracht: OpdrachtWithRelations,
  reviewedId: string,
): boolean {
  // Opdrachtgever can review Bedrijf
  if (
    user.id === opdracht.opdrachtgeverId &&
    reviewedId === opdracht.bedrijf?.userId
  ) {
    return true;
  }

  // Bedrijf can review Opdrachtgever
  if (
    user.id === opdracht.bedrijf?.userId &&
    reviewedId === opdracht.opdrachtgeverId
  ) {
    return true;
  }

  // Bedrijf can review assigned ZZP
  if (user.id === opdracht.bedrijf?.userId) {
    const assignedZzp = opdracht.assignments.find(
      (a: AssignmentWithTeamLid) =>
        a.teamLid.zzp?.userId === reviewedId && a.status === "COMPLETED",
    );
    if (assignedZzp) return true;
  }

  // ZZP can review Bedrijf they worked for
  const userAssignment = opdracht.assignments.find(
    (a: AssignmentWithTeamLid) =>
      a.teamLid.zzp?.userId === user.id && a.status === "COMPLETED",
  );
  if (userAssignment && reviewedId === opdracht.bedrijf?.userId) {
    return true;
  }

  return false;
}

// Helper function to update user rating
async function updateUserRating(userId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      reviewedId: userId,
      isPublic: true,
    },
    select: {
      rating: true,
    },
  });

  if (reviews.length === 0) return;

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Update based on user role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ZZP_BEVEILIGER") {
    await prisma.zZPProfile.updateMany({
      where: { userId },
      data: {
        rating: averageRating,
        totalReviews: reviews.length,
      },
    });
  }
}
