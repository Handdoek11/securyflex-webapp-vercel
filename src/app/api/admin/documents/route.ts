import type { DocumentType, Prisma, VerificatieStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin/auth";
import { auth } from "@/lib/auth";
import {
  sendDocumentApprovedNotification,
  sendDocumentRejectedNotification,
} from "@/lib/documents/notifications";
import prisma from "@/lib/prisma";

// GET endpoint for admin to view all documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const documentType = searchParams.get("documentType");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sortBy = searchParams.get("sortBy") || "uploadedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: Prisma.DocumentVerificatieWhereInput = {};

    if (status) {
      where.status = status as VerificatieStatus;
    }

    if (documentType) {
      where.documentType = documentType as DocumentType;
    }

    if (userId) {
      where.userId = userId;
    }

    // Get documents with pagination
    const [documents, totalCount] = await Promise.all([
      prisma.documentVerificatie.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          verificationHistory: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              action: true,
              oldStatus: true,
              newStatus: true,
              performedByName: true,
              createdAt: true,
              adminNotes: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder as "asc" | "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.documentVerificatie.count({ where }),
    ]);

    // Get summary statistics
    const stats = await prisma.documentVerificatie.groupBy({
      by: ["status"],
      _count: true,
      where: status ? undefined : {}, // Get all stats if no status filter
    });

    // Get expiring documents (within 30 days)
    const expiringCount = await prisma.documentVerificatie.count({
      where: {
        geldigTot: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        status: "APPROVED",
      },
    });

    // Get documents by type
    const documentTypeStats = await prisma.documentVerificatie.groupBy({
      by: ["documentType"],
      _count: true,
      where: {},
    });

    return NextResponse.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
        stats: {
          byStatus: stats.reduce(
            (acc, item) => {
              acc[item.status] = item._count;
              return acc;
            },
            {} as Record<string, number>,
          ),
          expiringCount,
          byDocumentType: documentTypeStats.reduce(
            (acc, item) => {
              acc[item.documentType] = item._count;
              return acc;
            },
            {} as Record<string, number>,
          ),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

// POST endpoint for bulk operations
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { action, documentIds, data } = await request.json();

    if (!action || !documentIds || !Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    // Get client IP and User Agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    let updatedCount = 0;

    switch (action) {
      case "BULK_APPROVE":
        // Bulk approve documents
        for (const documentId of documentIds) {
          const currentDoc = await prisma.documentVerificatie.findUnique({
            where: { id: documentId },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          });

          if (currentDoc && currentDoc.status !== "APPROVED") {
            const updatedDoc = await prisma.documentVerificatie.update({
              where: { id: documentId },
              data: {
                status: "APPROVED",
                verificatieDatum: new Date(),
                verifiedBy: session.user.id,
                adminNotes: data?.adminNotes || "Bulk approved",
              },
            });

            // Log history
            await prisma.documentVerificationHistory.create({
              data: {
                documentId,
                action: "APPROVED",
                oldStatus: currentDoc.status,
                newStatus: "APPROVED",
                adminNotes: data?.adminNotes || "Bulk approved",
                performedBy: session.user.id,
                performedByName: session.user.name || session.user.email,
                ipAddress,
                userAgent,
              },
            });

            // Send approval notification
            try {
              await sendDocumentApprovedNotification({
                user: {
                  name: currentDoc.user.name || "Gebruiker",
                  email: currentDoc.user.email,
                },
                document: {
                  id: updatedDoc.id,
                  documentType: updatedDoc.documentType,
                  originalFileName: updatedDoc.originalFileName,
                  status: updatedDoc.status,
                  adminNotes: updatedDoc.adminNotes || undefined,
                },
                adminName: session.user.name || session.user.email,
              });
            } catch (notificationError) {
              console.error(
                `Failed to send approval notification for document ${documentId}:`,
                notificationError,
              );
              // Don't fail the bulk operation if notification fails
            }

            updatedCount++;
          }
        }
        break;

      case "BULK_REJECT":
        // Bulk reject documents
        for (const documentId of documentIds) {
          const currentDoc = await prisma.documentVerificatie.findUnique({
            where: { id: documentId },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          });

          if (currentDoc && currentDoc.status !== "REJECTED") {
            const updatedDoc = await prisma.documentVerificatie.update({
              where: { id: documentId },
              data: {
                status: "REJECTED",
                verificatieDatum: new Date(),
                verifiedBy: session.user.id,
                rejectionReason: data?.rejectionReason || "Bulk rejected",
                adminNotes: data?.adminNotes || undefined,
              },
            });

            // Log history
            await prisma.documentVerificationHistory.create({
              data: {
                documentId,
                action: "REJECTED",
                oldStatus: currentDoc.status,
                newStatus: "REJECTED",
                adminNotes: data?.rejectionReason || "Bulk rejected",
                performedBy: session.user.id,
                performedByName: session.user.name || session.user.email,
                ipAddress,
                userAgent,
              },
            });

            // Send rejection notification
            try {
              await sendDocumentRejectedNotification({
                user: {
                  name: currentDoc.user.name || "Gebruiker",
                  email: currentDoc.user.email,
                },
                document: {
                  id: updatedDoc.id,
                  documentType: updatedDoc.documentType,
                  originalFileName: updatedDoc.originalFileName,
                  status: updatedDoc.status,
                  rejectionReason: updatedDoc.rejectionReason || undefined,
                  adminNotes: updatedDoc.adminNotes || undefined,
                },
                adminName: session.user.name || session.user.email,
              });
            } catch (notificationError) {
              console.error(
                `Failed to send rejection notification for document ${documentId}:`,
                notificationError,
              );
              // Don't fail the bulk operation if notification fails
            }

            updatedCount++;
          }
        }
        break;

      case "BULK_DELETE":
        // Bulk delete documents
        for (const documentId of documentIds) {
          const currentDoc = await prisma.documentVerificatie.findUnique({
            where: { id: documentId },
          });

          if (currentDoc) {
            // Log deletion in history before deleting
            await prisma.documentVerificationHistory.create({
              data: {
                documentId,
                action: "DELETED",
                oldStatus: currentDoc.status,
                newStatus: currentDoc.status,
                adminNotes: "Bulk deleted by admin",
                performedBy: session.user.id,
                performedByName: session.user.name || session.user.email,
                ipAddress,
                userAgent,
              },
            });

            await prisma.documentVerificatie.delete({
              where: { id: documentId },
            });

            updatedCount++;
          }
        }
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} documents ${action.toLowerCase()}`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 },
    );
  }
}
