import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  sendDocumentApprovedNotification,
  sendDocumentRejectedNotification
} from "@/lib/documents/notifications";

const UPLOAD_DIR = join(process.cwd(), "uploads", "documents");

// GET endpoint to serve document files (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminEmails = ['stef@securyflex.com', 'robert@securyflex.com'];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id: documentId } = await params;

    // Get document from database
    const document = await prisma.documentVerificatie.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document niet gevonden" },
        { status: 404 }
      );
    }

    // Check if file exists on disk
    const filePath = join(UPLOAD_DIR, document.fileName);
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "Bestand niet gevonden op server" },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `inline; filename="${document.originalFileName}"`,
        'Content-Length': document.fileSize.toString(),
        'Cache-Control': 'private, no-cache'
      }
    });

  } catch (error) {
    console.error("Error serving document:", error);
    return NextResponse.json(
      { error: "Failed to serve document" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update document verification status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminEmails = ['stef@securyflex.com', 'robert@securyflex.com'];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id: documentId } = await params;
    const data = await request.json();

    const { status, adminNotes, rejectionReason, externalVerified, externalSource, externalRef } = data;

    // Get current document
    const currentDocument = await prisma.documentVerificatie.findUnique({
      where: { id: documentId }
    });

    if (!currentDocument) {
      return NextResponse.json(
        { error: "Document niet gevonden" },
        { status: 404 }
      );
    }

    // Get client IP and User Agent
    const ipAddress = request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Update document
    const updatedDocument = await prisma.documentVerificatie.update({
      where: { id: documentId },
      data: {
        status: status || currentDocument.status,
        adminNotes: adminNotes !== undefined ? adminNotes : currentDocument.adminNotes,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : currentDocument.rejectionReason,
        verificatieDatum: status && status !== currentDocument.status ? new Date() : currentDocument.verificatieDatum,
        verifiedBy: status && status !== currentDocument.status ? session.user.id : currentDocument.verifiedBy,
        externalVerified: externalVerified !== undefined ? externalVerified : currentDocument.externalVerified,
        externalSource: externalSource !== undefined ? externalSource : currentDocument.externalSource,
        externalRef: externalRef !== undefined ? externalRef : currentDocument.externalRef
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Log verification history if status changed
    if (status && status !== currentDocument.status) {
      const actionMap: Record<string, string> = {
        'IN_REVIEW': 'REVIEW_STARTED',
        'APPROVED': 'APPROVED',
        'REJECTED': 'REJECTED',
        'ADDITIONAL_INFO': 'INFO_REQUESTED',
        'SUSPENDED': 'SUSPENDED'
      };

      await prisma.documentVerificationHistory.create({
        data: {
          documentId: documentId,
          action: actionMap[status] || 'UPDATED',
          oldStatus: currentDocument.status,
          newStatus: status,
          adminNotes: adminNotes || null,
          performedBy: session.user.id,
          performedByName: session.user.name || session.user.email,
          ipAddress,
          userAgent
        }
      });
    } else if (adminNotes) {
      // Log note addition
      await prisma.documentVerificationHistory.create({
        data: {
          documentId: documentId,
          action: 'NOTE_ADDED',
          oldStatus: currentDocument.status,
          newStatus: currentDocument.status,
          adminNotes: adminNotes,
          performedBy: session.user.id,
          performedByName: session.user.name || session.user.email,
          ipAddress,
          userAgent
        }
      });
    }

    // Send notification to user about status change
    if (status && status !== currentDocument.status) {
      try {
        const notificationData = {
          user: {
            name: updatedDocument.user.name || "Gebruiker",
            email: updatedDocument.user.email
          },
          document: {
            id: updatedDocument.id,
            documentType: updatedDocument.documentType,
            originalFileName: updatedDocument.originalFileName,
            status: updatedDocument.status,
            rejectionReason: updatedDocument.rejectionReason,
            adminNotes: updatedDocument.adminNotes
          },
          adminName: session.user.name || session.user.email
        };

        if (status === 'APPROVED') {
          await sendDocumentApprovedNotification(notificationData);
        } else if (status === 'REJECTED') {
          await sendDocumentRejectedNotification(notificationData);
        }
      } catch (notificationError) {
        console.error("Failed to send status change notification:", notificationError);
        // Don't fail the update if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument
    });

  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete document (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminEmails = ['stef@securyflex.com', 'robert@securyflex.com'];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id: documentId } = await params;

    // Get document first
    const document = await prisma.documentVerificatie.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document niet gevonden" },
        { status: 404 }
      );
    }

    // Get client IP and User Agent
    const ipAddress = request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Log deletion in history before deleting
    await prisma.documentVerificationHistory.create({
      data: {
        documentId: documentId,
        action: 'DELETED',
        oldStatus: document.status,
        newStatus: document.status,
        adminNotes: "Document verwijderd door admin",
        performedBy: session.user.id,
        performedByName: session.user.name || session.user.email,
        ipAddress,
        userAgent
      }
    });

    // Delete document from database (this will cascade delete history due to onDelete: Cascade)
    await prisma.documentVerificatie.delete({
      where: { id: documentId }
    });

    // TODO: Also delete file from disk
    // const filePath = join(UPLOAD_DIR, document.fileName);
    // if (existsSync(filePath)) {
    //   await unlink(filePath);
    // }

    return NextResponse.json({
      success: true,
      message: "Document verwijderd"
    });

  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}