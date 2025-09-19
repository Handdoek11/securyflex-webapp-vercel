import type {
  BedrijfProfile,
  NDNummerStatus,
  Prisma,
  ZZPProfile,
} from "@prisma/client";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ndNummerVerificationSchema,
  validateApiRequest,
} from "@/lib/validation/schemas";

// Mock Justis API - In production, this would call the real Justis API
async function validateWithJustisAPI(
  ndNummer: string,
  profileType: "ZZP" | "BEDRIJF",
) {
  // This is a mock implementation
  // In production, you would integrate with the real Dutch government Justis API

  const mockValidResponses = ["ND123456", "ND234567", "ND345678", "ND456789"];

  const mockExpiredResponses = ["ND111111", "ND222222"];

  const mockInvalidResponses = ["ND000000", "ND999999"];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (mockValidResponses.includes(ndNummer)) {
    return {
      valid: true,
      status: "ACTIEF",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 4), // 4 years from now
      companyName: profileType === "BEDRIJF" ? "Test Security BV" : undefined,
      registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      lastVerified: new Date(),
    };
  } else if (mockExpiredResponses.includes(ndNummer)) {
    return {
      valid: false,
      status: "VERLOPEN",
      expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      companyName:
        profileType === "BEDRIJF" ? "Expired Security BV" : undefined,
      registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 6), // 6 years ago
      lastVerified: new Date(),
    };
  } else if (mockInvalidResponses.includes(ndNummer)) {
    return {
      valid: false,
      status: "GEWEIGERD",
      error: "ND-nummer niet gevonden in Justis database",
      lastVerified: new Date(),
    };
  } else {
    return {
      valid: false,
      status: "NIET_GEREGISTREERD",
      error: "ND-nummer bestaat niet",
      lastVerified: new Date(),
    };
  }
}

// Create audit log entry
async function createAuditLog(
  profileType: "ZZP" | "BEDRIJF",
  profileId: string,
  ndNummer: string,
  previousStatus: string | null,
  newStatus: string,
  performedBy: string,
  ipAddress: string | null,
  userAgent: string | null,
  apiResponse: Prisma.JsonValue,
) {
  try {
    const auditData: any = {
      profileType: profileType as "ZZP" | "BEDRIJF",
      ndNummer,
      previousStatus: previousStatus as NDNummerStatus | null,
      newStatus: newStatus as NDNummerStatus,
      action: "VERIFICATIE" as const,
      performedBy,
      verificationSource: "Justis API",
      ipAddress,
      userAgent,
      apiResponse,
    };

    if (profileType === "ZZP") {
      auditData.zzpProfileId = profileId;
    } else {
      auditData.bedrijfProfileId = profileId;
    }

    await prisma.nDNummerAuditLog.create({
      data: auditData,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit log failure shouldn't block the main operation
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authenticatie vereist" },
        { status: 401 },
      );
    }

    // Get request headers for audit trail
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(ndNummerVerificationSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validatiefout",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    const { ndNummer, bedrijfsnaam, kvkNummer, profileType } = validation.data!;

    // Get user profile to verify permissions and get profile ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        zzpProfile: true,
        bedrijfProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 },
      );
    }

    // Determine the profile to update based on profileType
    let profileId: string;
    let _currentProfile: ZZPProfile | BedrijfProfile | null;
    let previousStatus: string | null = null;

    if (profileType === "ZZP") {
      if (!user.zzpProfile) {
        return NextResponse.json(
          { error: "ZZP profiel niet gevonden" },
          { status: 404 },
        );
      }
      profileId = user.zzpProfile.id;
      _currentProfile = user.zzpProfile;
      previousStatus = user.zzpProfile.ndNummerStatus;
    } else {
      if (!user.bedrijfProfile) {
        return NextResponse.json(
          { error: "Bedrijf profiel niet gevonden" },
          { status: 404 },
        );
      }
      profileId = user.bedrijfProfile.id;
      _currentProfile = user.bedrijfProfile;
      previousStatus = user.bedrijfProfile.ndNummerStatus;
    }

    // Call Justis API for verification
    const justisResponse = await validateWithJustisAPI(ndNummer, profileType);

    // Update the profile with ND-nummer information
    const updateData = {
      ndNummer,
      ndNummerStatus: justisResponse.status as NDNummerStatus,
      ndNummerLaatsteControle: new Date(),
      ndNummerVervalDatum: justisResponse.expiryDate || null,
      ndNummerOpmerking:
        justisResponse.error ||
        (justisResponse.valid ? "Geverifieerd via Justis API" : null),
    };

    let updatedProfile: ZZPProfile | BedrijfProfile | null = null;
    if (profileType === "ZZP") {
      updatedProfile = await prisma.zZPProfile.update({
        where: { id: profileId },
        data: updateData,
      });
    } else {
      updatedProfile = await prisma.bedrijfProfile.update({
        where: { id: profileId },
        data: {
          ...updateData,
          // For bedrijf, also update manager information if provided
          ndNummerManagers: bedrijfsnaam
            ? [
                {
                  naam: bedrijfsnaam,
                  kvkNummer: kvkNummer,
                  registratieDatum: new Date(),
                },
              ]
            : undefined,
        },
      });
    }

    // Create audit log
    await createAuditLog(
      profileType,
      profileId,
      ndNummer,
      previousStatus,
      justisResponse.status,
      session.user.id,
      ipAddress,
      userAgent,
      {
        ...justisResponse,
        expiryDate: justisResponse.expiryDate?.toISOString(),
        registrationDate: justisResponse.registrationDate?.toISOString(),
        lastVerified: justisResponse.lastVerified?.toISOString(),
      },
    );

    // Return response
    return NextResponse.json({
      success: true,
      validation: {
        ndNummer,
        status: justisResponse.status,
        valid: justisResponse.valid,
        expiryDate: justisResponse.expiryDate,
        companyName: justisResponse.companyName,
        registrationDate: justisResponse.registrationDate,
        lastVerified: justisResponse.lastVerified,
        error: justisResponse.error,
      },
      profile: {
        id: profileId,
        ndNummerStatus: updatedProfile.ndNummerStatus,
        ndNummerVervalDatum: updatedProfile.ndNummerVervalDatum,
        ndNummerLaatsteControle: updatedProfile.ndNummerLaatsteControle,
      },
      complianceInfo: {
        isCompliant: justisResponse.valid && justisResponse.status === "ACTIEF",
        requiresAction:
          justisResponse.status === "VERLOPEN" ||
          justisResponse.status === "GESCHORST",
        daysUntilExpiry: justisResponse.expiryDate
          ? Math.ceil(
              (justisResponse.expiryDate.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            )
          : null,
        nextCheckDue: justisResponse.expiryDate
          ? new Date(
              justisResponse.expiryDate.getTime() - 90 * 24 * 60 * 60 * 1000,
            )
          : null, // 90 days before expiry
      },
    });
  } catch (error) {
    console.error("ND-nummer validation error:", error);

    return NextResponse.json(
      {
        error: "Fout bij validatie van ND-nummer",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authenticatie vereist" },
        { status: 401 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const profileType = searchParams.get("profileType");

    if (!profileType || !["ZZP", "BEDRIJF"].includes(profileType)) {
      return NextResponse.json(
        { error: "Geldig profileType (ZZP of BEDRIJF) is vereist" },
        { status: 400 },
      );
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        zzpProfile: profileType === "ZZP",
        bedrijfProfile: profileType === "BEDRIJF",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 },
      );
    }

    const profile =
      profileType === "ZZP" ? user.zzpProfile : user.bedrijfProfile;

    if (!profile) {
      return NextResponse.json(
        { error: `${profileType} profiel niet gevonden` },
        { status: 404 },
      );
    }

    // Get audit history
    const auditLogs = await prisma.nDNummerAuditLog.findMany({
      where:
        profileType === "ZZP"
          ? { zzpProfileId: profile.id }
          : { bedrijfProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 10, // Last 10 entries
    });

    // Calculate compliance status
    const isExpiringSoon = profile.ndNummerVervalDatum
      ? profile.ndNummerVervalDatum.getTime() - Date.now() <
        90 * 24 * 60 * 60 * 1000
      : false;

    const isExpired = profile.ndNummerVervalDatum
      ? profile.ndNummerVervalDatum.getTime() < Date.now()
      : false;

    return NextResponse.json({
      profile: {
        id: profile.id,
        ndNummer: profile.ndNummer,
        ndNummerStatus: profile.ndNummerStatus,
        ndNummerVervalDatum: profile.ndNummerVervalDatum,
        ndNummerLaatsteControle: profile.ndNummerLaatsteControle,
        ndNummerOpmerking: profile.ndNummerOpmerking,
      },
      compliance: {
        isCompliant: profile.ndNummerStatus === "ACTIEF" && !isExpired,
        isExpiringSoon,
        isExpired,
        daysUntilExpiry: profile.ndNummerVervalDatum
          ? Math.ceil(
              (profile.ndNummerVervalDatum.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            )
          : null,
        requiresRenewal: isExpiringSoon || isExpired,
        canAcceptJobs: profile.ndNummerStatus === "ACTIEF" && !isExpired,
      },
      auditHistory: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        previousStatus: log.previousStatus,
        newStatus: log.newStatus,
        verificationSource: log.verificationSource,
        createdAt: log.createdAt,
        complianceNotes: log.complianceNotes,
      })),
    });
  } catch (error) {
    console.error("ND-nummer status retrieval error:", error);

    return NextResponse.json(
      {
        error: "Fout bij ophalen ND-nummer status",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 },
    );
  }
}
