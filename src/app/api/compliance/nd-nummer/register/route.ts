import {
  type BedrijfProfile,
  NDNummerStatus,
  type ZZPProfile,
} from "@prisma/client";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ndNummerRegistrationSchema,
  validateApiRequest,
} from "@/lib/validation/schemas";

// Create audit log entry for registration
async function createRegistrationAuditLog(
  profileType: "ZZP" | "BEDRIJF",
  profileId: string,
  ndNummer: string,
  newStatus: string,
  performedBy: string,
  ipAddress: string | null,
  userAgent: string | null,
  vervalDatum: Date,
) {
  try {
    const auditData = {
      profileType: profileType as "ZZP" | "BEDRIJF",
      zzpProfileId: profileType === "ZZP" ? profileId : undefined,
      bedrijfProfileId: profileType === "BEDRIJF" ? profileId : undefined,
      ndNummer,
      previousStatus: NDNummerStatus.NIET_GEREGISTREERD,
      newStatus: newStatus as NDNummerStatus,
      action: "REGISTRATIE" as const,
      performedBy,
      verificationSource: "Manual",
      expiryDate: vervalDatum,
      nextCheckDue: new Date(vervalDatum.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days before expiry
      complianceNotes: "ND-nummer geregistreerd door gebruiker",
      ipAddress,
      userAgent,
    };

    await prisma.nDNummerAuditLog.create({
      data: auditData,
    });
  } catch (error) {
    console.error("Failed to create registration audit log:", error);
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
    const validation = validateApiRequest(ndNummerRegistrationSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validatiefout",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    if (!validation.data) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { ndNummer, vervalDatum, documentUpload } = validation.data;

    // Get user profile
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

    // Determine profile type and validate existence
    let profileType: "ZZP" | "BEDRIJF";
    let profileId: string;
    let currentProfile: ZZPProfile | BedrijfProfile;

    if (user.role === "ZZP_BEVEILIGER") {
      if (!user.zzpProfile) {
        return NextResponse.json(
          { error: "ZZP profiel niet gevonden" },
          { status: 404 },
        );
      }
      profileType = "ZZP";
      profileId = user.zzpProfile.id;
      currentProfile = user.zzpProfile;
    } else if (user.role === "BEDRIJF") {
      if (!user.bedrijfProfile) {
        return NextResponse.json(
          { error: "Bedrijf profiel niet gevonden" },
          { status: 404 },
        );
      }
      profileType = "BEDRIJF";
      profileId = user.bedrijfProfile.id;
      currentProfile = user.bedrijfProfile;
    } else {
      return NextResponse.json(
        {
          error:
            "Alleen ZZP beveiligers en beveiligingsbedrijven kunnen ND-nummer registreren",
        },
        { status: 403 },
      );
    }

    // Check if ND-nummer already exists in database (unique constraint)
    const existingNDNummer =
      (await prisma.zZPProfile.findFirst({
        where: { ndNummer },
      })) ||
      (await prisma.bedrijfProfile.findFirst({
        where: { ndNummer },
      }));

    if (existingNDNummer) {
      return NextResponse.json(
        { error: "Dit ND-nummer is al geregistreerd in het systeem" },
        { status: 409 },
      );
    }

    // Check if user already has an ND-nummer registered
    if (currentProfile.ndNummer && currentProfile.ndNummer !== ndNummer) {
      return NextResponse.json(
        {
          error: "U heeft al een ND-nummer geregistreerd",
          details: {
            existingNDNummer: currentProfile.ndNummer,
            existingStatus: currentProfile.ndNummerStatus,
          },
        },
        { status: 409 },
      );
    }

    const vervalDate = new Date(vervalDatum);

    // Update the profile with ND-nummer information
    const updateData = {
      ndNummer,
      ndNummerStatus: NDNummerStatus.AANGEVRAAGD, // Status will be verified later
      ndNummerVervalDatum: vervalDate,
      ndNummerLaatsteControle: new Date(),
      ndNummerOpmerking: "Geregistreerd door gebruiker, wacht op verificatie",
    };

    let _updatedProfile: ZZPProfile | BedrijfProfile;
    if (profileType === "ZZP") {
      _updatedProfile = await prisma.zZPProfile.update({
        where: { id: profileId },
        data: updateData,
      });
    } else {
      _updatedProfile = await prisma.bedrijfProfile.update({
        where: { id: profileId },
        data: updateData,
      });
    }

    // Create audit log
    await createRegistrationAuditLog(
      profileType,
      profileId,
      ndNummer,
      "AANGEVRAAGD",
      session.user.id,
      ipAddress,
      userAgent,
      vervalDate,
    );

    // Calculate compliance status
    const daysUntilExpiry = Math.ceil(
      (vervalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    const isExpiringSoon = daysUntilExpiry <= 90;

    return NextResponse.json({
      success: true,
      message: "ND-nummer succesvol geregistreerd",
      registration: {
        ndNummer,
        status: "AANGEVRAAGD",
        vervalDatum: vervalDate,
        documentUpload,
        profileType,
      },
      compliance: {
        daysUntilExpiry,
        isExpiringSoon,
        requiresVerification: true,
        nextSteps: [
          "Wacht op automatische verificatie via Justis API",
          "Upload relevante documenten indien nodig",
          isExpiringSoon ? "Plan vernieuwing vanwege nabije vervaldatum" : null,
        ].filter(Boolean),
      },
      nextActions: {
        verifyUrl: `/api/compliance/nd-nummer/validate`,
        documentsUrl: `/api/compliance/nd-nummer/documents`,
        statusUrl: `/api/compliance/nd-nummer/validate?profileType=${profileType}`,
      },
    });
  } catch (error) {
    console.error("ND-nummer registration error:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Dit ND-nummer is al geregistreerd" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Fout bij registratie van ND-nummer",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const validation = validateApiRequest(
      ndNummerRegistrationSchema.partial(),
      body,
    );

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validatiefout",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    if (!validation.data) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updateData = validation.data;

    // Get user profile
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

    // Determine profile type
    let profileType: "ZZP" | "BEDRIJF";
    let profileId: string;
    let currentProfile: ZZPProfile | BedrijfProfile;

    if (user.role === "ZZP_BEVEILIGER" && user.zzpProfile) {
      profileType = "ZZP";
      profileId = user.zzpProfile.id;
      currentProfile = user.zzpProfile;
    } else if (user.role === "BEDRIJF" && user.bedrijfProfile) {
      profileType = "BEDRIJF";
      profileId = user.bedrijfProfile.id;
      currentProfile = user.bedrijfProfile;
    } else {
      return NextResponse.json(
        { error: "Profiel niet gevonden" },
        { status: 404 },
      );
    }

    // Check if user has an existing ND-nummer to update
    if (!currentProfile.ndNummer) {
      return NextResponse.json(
        { error: "Geen ND-nummer geregistreerd om bij te werken" },
        { status: 404 },
      );
    }

    // Build update object
    const dbUpdateData: {
      ndNummerLaatsteControle: Date;
      ndNummerVervalDatum?: Date;
      ndNummerStatus?: NDNummerStatus;
    } = {
      ndNummerLaatsteControle: new Date(),
    };

    if (updateData.vervalDatum) {
      dbUpdateData.ndNummerVervalDatum = new Date(updateData.vervalDatum);
    }

    if (updateData.documentUpload) {
      dbUpdateData.ndNummerOpmerking = "Document bijgewerkt door gebruiker";
    }

    // Update the profile
    let updatedProfile: ZZPProfile | BedrijfProfile;
    if (profileType === "ZZP") {
      updatedProfile = await prisma.zZPProfile.update({
        where: { id: profileId },
        data: dbUpdateData,
      });
    } else {
      updatedProfile = await prisma.bedrijfProfile.update({
        where: { id: profileId },
        data: dbUpdateData,
      });
    }

    // Create audit log for the update
    await createRegistrationAuditLog(
      profileType,
      profileId,
      currentProfile.ndNummer,
      currentProfile.ndNummerStatus,
      session.user.id,
      ipAddress,
      userAgent,
      dbUpdateData.ndNummerVervalDatum || currentProfile.ndNummerVervalDatum,
    );

    return NextResponse.json({
      success: true,
      message: "ND-nummer informatie bijgewerkt",
      profile: {
        ndNummer: updatedProfile.ndNummer,
        status: updatedProfile.ndNummerStatus,
        vervalDatum: updatedProfile.ndNummerVervalDatum,
        laatsteControle: updatedProfile.ndNummerLaatsteControle,
      },
    });
  } catch (error) {
    console.error("ND-nummer update error:", error);

    return NextResponse.json(
      {
        error: "Fout bij bijwerken ND-nummer",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
