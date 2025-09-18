import crypto from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DocumentType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  sendAdminNewDocumentNotification,
  sendDocumentUploadNotification,
} from "@/lib/documents/notifications";
import prisma from "@/lib/prisma";

const UPLOAD_DIR = join(process.cwd(), "uploads", "documents");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;
    const documentNummer = formData.get("documentNummer") as string | null;
    const geldigTot = formData.get("geldigTot") as string | null;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: "Geen bestand gevonden" },
        { status: 400 },
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is vereist" },
        { status: 400 },
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Bestand is te groot (max 10MB)" },
        { status: 400 },
      );
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Bestandstype niet toegestaan" },
        { status: 400 },
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate secure filename
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const secureFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, secureFileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Get client IP and User Agent
    const ipAddress =
      request.ip ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Save to database
    const document = await prisma.documentVerificatie.create({
      data: {
        userId: session.user.id,
        documentType: documentType as DocumentType,
        documentNummer: documentNummer || null,
        fileName: secureFileName,
        originalFileName: file.name,
        fileUrl: `/uploads/documents/${secureFileName}`,
        fileSize: file.size,
        mimeType: file.type,
        geldigTot: geldigTot ? new Date(geldigTot) : null,
        ipAddress,
        userAgent,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log verification history
    await prisma.documentVerificationHistory.create({
      data: {
        documentId: document.id,
        action: "UPLOADED",
        newStatus: "PENDING",
        performedBy: session.user.id,
        performedByName: session.user.name || session.user.email,
        ipAddress,
        userAgent,
      },
    });

    // Send notifications
    try {
      // Send upload confirmation to user
      await sendDocumentUploadNotification({
        user: {
          name: document.user.name || "Gebruiker",
          email: document.user.email,
        },
        document: {
          id: document.id,
          documentType: document.documentType,
          originalFileName: document.originalFileName,
          status: document.status,
        },
      });

      // Send notification to admins about new document
      await sendAdminNewDocumentNotification({
        user: {
          name: document.user.name || "Gebruiker",
          email: document.user.email,
        },
        document: {
          id: document.id,
          documentType: document.documentType,
          originalFileName: document.originalFileName,
          status: document.status,
        },
      });
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
      // Don't fail the upload if notifications fail
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        documentType: document.documentType,
        originalFileName: document.originalFileName,
        status: document.status,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}

// GET endpoint to list user's documents
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.documentVerificatie.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        documentType: true,
        documentNummer: true,
        originalFileName: true,
        status: true,
        geldigTot: true,
        uploadedAt: true,
        verificatieDatum: true,
        rejectionReason: true,
        adminNotes: true,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}
