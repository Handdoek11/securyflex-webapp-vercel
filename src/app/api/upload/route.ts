import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// File security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = {
  CERTIFICATE: ["application/pdf", "image/jpeg", "image/png"],
  ID: ["image/jpeg", "image/png"],
  KVK: ["application/pdf"],
  BANK: ["application/pdf"],
  PROFILE_PHOTO: ["image/jpeg", "image/png"],
};

const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".pif",
  ".scr",
  ".vbs",
  ".js",
  ".jar",
  ".app",
  ".deb",
  ".pkg",
  ".dmg",
  ".rpm",
  ".msi",
  ".run",
  ".bin",
  ".sh",
  ".pl",
  ".py",
  ".php",
  ".asp",
  ".aspx",
  ".jsp",
];

// Virus scanning simulation (in production use real antivirus API)
async function scanFileForViruses(
  buffer: Buffer,
  filename: string,
): Promise<{ safe: boolean; threat?: string }> {
  // Simulate virus scanning delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Check file extension
  const extension = filename.toLowerCase().substr(filename.lastIndexOf("."));
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return { safe: false, threat: "Dangerous file extension detected" };
  }

  // Check for suspicious patterns in file content
  const content = buffer.toString("hex").toLowerCase();

  // Check for executable signatures
  const suspiciousPatterns = [
    "4d5a", // MZ header (executable)
    "504b0304", // ZIP header (could contain executable)
    "7f454c46", // ELF header (Linux executable)
    "cafebabe", // Java class file
    "d0cf11e0a1b11ae1", // Microsoft Office (old format, could contain macros)
  ];

  for (const pattern of suspiciousPatterns) {
    if (content.startsWith(pattern)) {
      return { safe: false, threat: "Suspicious file signature detected" };
    }
  }

  // In production, integrate with real antivirus services:
  // - ClamAV
  // - VirusTotal API
  // - AWS GuardDuty
  // - Azure Defender

  return { safe: true };
}

// Image processing and compression
async function processImage(
  buffer: Buffer,
  _maxWidth = 1920,
  _quality = 85,
): Promise<Buffer> {
  // In production, use proper image processing library like Sharp
  // For now, return original buffer

  // Simulated image processing
  if (buffer.length > 2 * 1024 * 1024) {
    // 2MB
    // In real implementation, compress the image
    console.log("Image would be compressed here");
  }

  return buffer;
}

// Generate secure filename
function generateSecureFilename(originalName: string, userId: string): string {
  const extension = originalName
    .toLowerCase()
    .substr(originalName.lastIndexOf("."));
  const uuid = randomUUID();
  const timestamp = Date.now();

  // Remove any path traversal attempts
  const _safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");

  return `${userId}_${timestamp}_${uuid}${extension}`;
}

// Store file metadata in database
async function storeFileMetadata(
  userId: string,
  fileType: string,
  filename: string,
  originalName: string,
  size: number,
  mimeType: string,
  description?: string,
) {
  const metadata = {
    originalName,
    size,
    mimeType,
    uploadedAt: new Date(),
    uploadedBy: userId,
    scanStatus: "CLEAN",
    description: description || null,
  };

  if (fileType === "PROFILE_PHOTO") {
    // Update user profile photo
    await prisma.user.update({
      where: { id: userId },
      data: { image: `/uploads/${filename}` },
    });
  }

  // Store in DocumentVerificatie table
  return await prisma.documentVerificatie.create({
    data: {
      userId,
      documentType: fileType as any,
      fileName: filename,
      originalFileName: originalName,
      fileSize: size,
      mimeType,
      fileUrl: `/uploads/${filename}`,
      status: "PENDING",
      adminNotes: description,
    },
  });
}

// POST /api/upload - Upload and process files
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("type") as string;
    const description = formData.get("description") as string;

    if (!file || !fileType) {
      return NextResponse.json(
        { success: false, error: "File and type are required" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES[fileType as keyof typeof ALLOWED_MIME_TYPES]) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 },
      );
    }

    // Validate MIME type
    const allowedMimeTypes =
      ALLOWED_MIME_TYPES[fileType as keyof typeof ALLOWED_MIME_TYPES];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format. Allowed: ${allowedMimeTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    // Check user upload limits
    const uploadCount = await prisma.documentVerificatie.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (uploadCount >= 20) {
      // Max 20 uploads per day
      return NextResponse.json(
        { success: false, error: "Daily upload limit exceeded" },
        { status: 429 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Virus scan
    const scanResult = await scanFileForViruses(buffer, file.name);
    if (!scanResult.safe) {
      return NextResponse.json(
        {
          success: false,
          error: "File failed security scan",
          details: scanResult.threat,
        },
        { status: 400 },
      );
    }

    // Process file based on type
    let processedBuffer = buffer;
    if (file.type.startsWith("image/")) {
      processedBuffer = (await processImage(buffer)) as Buffer;
    }

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name, session.user.id);

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (_error) {
      // Directory might already exist
    }

    // Write file to disk
    const filePath = join(uploadDir, secureFilename);
    await writeFile(filePath, processedBuffer);

    // Store metadata in database
    const documentRecord = await storeFileMetadata(
      session.user.id,
      fileType,
      secureFilename,
      file.name,
      processedBuffer.length,
      file.type,
      description,
    );

    // Log upload activity
    console.log(
      `File uploaded: ${secureFilename} by user ${session.user.id} (${file.type}, ${processedBuffer.length} bytes)`,
    );

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: documentRecord.id,
        filename: secureFilename,
        originalName: file.name,
        size: processedBuffer.length,
        type: fileType,
        url: `/uploads/${secureFilename}`,
        uploadedAt: documentRecord.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}

// GET /api/upload - List user's uploaded files
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    const where: Prisma.DocumentVerificatieWhereInput = {
      userId: session.user.id,
      status: "APPROVED",
    };

    if (type) {
      where.documentType = type;
    }

    const documents = await prisma.documentVerificatie.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        documentType: true,
        fileName: true,
        originalFileName: true,
        fileSize: true,
        mimeType: true,
        adminNotes: true,
        status: true,
        createdAt: true,
        fileUrl: true,
      },
    });

    const formattedDocuments = documents.map((doc: any) => ({
      ...doc,
      url: doc.fileUrl,
      sizeFormatted: formatFileSize(doc.fileSize),
    }));

    return NextResponse.json({
      success: true,
      data: {
        documents: formattedDocuments,
        total: documents.length,
      },
    });
  } catch (error) {
    console.error("File list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}

// DELETE /api/upload/[id] - Delete uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const fileId = url.pathname.split("/").pop();

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "File ID required" },
        { status: 400 },
      );
    }

    // Find and verify ownership
    const document = await prisma.documentVerificatie.findFirst({
      where: {
        id: fileId,
        userId: session.user.id,
        status: "APPROVED",
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 },
      );
    }

    // Mark as rejected (soft delete)
    await prisma.documentVerificatie.update({
      where: { id: fileId },
      data: {
        status: "REJECTED",
        rejectionReason: "Deleted by user",
      },
    });

    // In production, you might want to actually delete the file
    // or move it to a quarantine folder

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("File deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 },
    );
  }
}

// Utility function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
