import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ndNummerComplianceCheckSchema,
  validateApiRequest,
} from "@/lib/validation/schemas";

// Helper function to check if user has admin permissions
async function checkAdminPermissions(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// Helper function to calculate compliance status
function calculateComplianceStatus(
  ndNummerStatus: string | null,
  vervalDatum: Date | null,
): {
  isCompliant: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number | null;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
} {
  if (!ndNummerStatus || !vervalDatum) {
    return {
      isCompliant: false,
      isExpired: false,
      isExpiringSoon: false,
      daysUntilExpiry: null,
      riskLevel: "CRITICAL",
    };
  }

  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (vervalDatum.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
  const isCompliant = ndNummerStatus === "ACTIEF" && !isExpired;

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

  if (
    isExpired ||
    ndNummerStatus === "INGETROKKEN" ||
    ndNummerStatus === "GESCHORST"
  ) {
    riskLevel = "CRITICAL";
  } else if (daysUntilExpiry <= 30) {
    riskLevel = "HIGH";
  } else if (daysUntilExpiry <= 90) {
    riskLevel = "MEDIUM";
  }

  return {
    isCompliant,
    isExpired,
    isExpiringSoon,
    daysUntilExpiry,
    riskLevel,
  };
}

// GET - Monitor ND-nummer compliance across platform
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authenticatie vereist" },
        { status: 401 },
      );
    }

    // Check admin permissions for full platform monitoring
    const isAdmin = await checkAdminPermissions(session.user.id);
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "user";

    if (scope === "platform" && !isAdmin) {
      return NextResponse.json(
        { error: "Admin rechten vereist voor platform monitoring" },
        { status: 403 },
      );
    }

    let whereClause: any = {};
    const includeClause: any = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    };

    if (scope === "user") {
      // User can only see their own profiles
      whereClause = {
        userId: session.user.id,
      };
    }

    // Get ZZP profiles with ND-nummer data
    const zzpProfiles = await prisma.zZPProfile.findMany({
      where: {
        ...whereClause,
        ndNummer: { not: null },
      },
      include: includeClause,
      select: {
        id: true,
        userId: true,
        ndNummer: true,
        ndNummerStatus: true,
        ndNummerVervalDatum: true,
        ndNummerLaatsteControle: true,
        ndNummerOpmerking: true,
        user: includeClause.user,
      },
    });

    // Get Bedrijf profiles with ND-nummer data
    const bedrijfProfiles = await prisma.bedrijfProfile.findMany({
      where: {
        ...whereClause,
        ndNummer: { not: null },
      },
      include: includeClause,
      select: {
        id: true,
        userId: true,
        bedrijfsnaam: true,
        ndNummer: true,
        ndNummerStatus: true,
        ndNummerVervalDatum: true,
        ndNummerLaatsteControle: true,
        ndNummerOpmerking: true,
        user: includeClause.user,
      },
    });

    // Process compliance data
    const complianceData = [
      ...zzpProfiles.map((profile) => ({
        id: profile.id,
        profileType: "ZZP" as const,
        userId: profile.userId,
        userName: profile.user.name,
        userEmail: profile.user.email,
        bedrijfsnaam: null,
        ndNummer: profile.ndNummer,
        ndNummerStatus: profile.ndNummerStatus,
        ndNummerVervalDatum: profile.ndNummerVervalDatum,
        ndNummerLaatsteControle: profile.ndNummerLaatsteControle,
        ndNummerOpmerking: profile.ndNummerOpmerking,
        ...calculateComplianceStatus(
          profile.ndNummerStatus,
          profile.ndNummerVervalDatum,
        ),
      })),
      ...bedrijfProfiles.map((profile) => ({
        id: profile.id,
        profileType: "BEDRIJF" as const,
        userId: profile.userId,
        userName: profile.user.name,
        userEmail: profile.user.email,
        bedrijfsnaam: profile.bedrijfsnaam,
        ndNummer: profile.ndNummer,
        ndNummerStatus: profile.ndNummerStatus,
        ndNummerVervalDatum: profile.ndNummerVervalDatum,
        ndNummerLaatsteControle: profile.ndNummerLaatsteControle,
        ndNummerOpmerking: profile.ndNummerOpmerking,
        ...calculateComplianceStatus(
          profile.ndNummerStatus,
          profile.ndNummerVervalDatum,
        ),
      })),
    ];

    // Calculate summary statistics
    const totalProfiles = complianceData.length;
    const compliantProfiles = complianceData.filter(
      (p) => p.isCompliant,
    ).length;
    const expiredProfiles = complianceData.filter((p) => p.isExpired).length;
    const expiringSoonProfiles = complianceData.filter(
      (p) => p.isExpiringSoon,
    ).length;
    const criticalRiskProfiles = complianceData.filter(
      (p) => p.riskLevel === "CRITICAL",
    ).length;
    const highRiskProfiles = complianceData.filter(
      (p) => p.riskLevel === "HIGH",
    ).length;

    // Get recent audit activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAudits = await prisma.nDNummerAuditLog.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        ...(scope === "user"
          ? {
              OR: [
                {
                  zzpProfile: {
                    userId: session.user.id,
                  },
                },
                {
                  bedrijfProfile: {
                    userId: session.user.id,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: isAdmin ? 50 : 10,
      select: {
        id: true,
        profileType: true,
        ndNummer: true,
        action: true,
        newStatus: true,
        verificationSource: true,
        createdAt: true,
        zzpProfile: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
        bedrijfProfile: {
          select: {
            bedrijfsnaam: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      summary: {
        totalProfiles,
        compliantProfiles,
        complianceRate:
          totalProfiles > 0
            ? Math.round((compliantProfiles / totalProfiles) * 100)
            : 0,
        expiredProfiles,
        expiringSoonProfiles,
        criticalRiskProfiles,
        highRiskProfiles,
        lastUpdated: new Date(),
      },
      profiles: complianceData.map((profile) => ({
        id: profile.id,
        profileType: profile.profileType,
        userName: profile.userName,
        userEmail: isAdmin ? profile.userEmail : undefined,
        bedrijfsnaam: profile.bedrijfsnaam,
        ndNummer: profile.ndNummer,
        status: profile.ndNummerStatus,
        vervalDatum: profile.ndNummerVervalDatum,
        laatsteControle: profile.ndNummerLaatsteControle,
        isCompliant: profile.isCompliant,
        isExpired: profile.isExpired,
        isExpiringSoon: profile.isExpiringSoon,
        daysUntilExpiry: profile.daysUntilExpiry,
        riskLevel: profile.riskLevel,
        opmerking: profile.ndNummerOpmerking,
      })),
      recentActivity: recentAudits.map((audit) => ({
        id: audit.id,
        profileType: audit.profileType,
        profileName:
          audit.profileType === "ZZP"
            ? audit.zzpProfile?.user?.name
            : audit.bedrijfProfile?.bedrijfsnaam ||
              audit.bedrijfProfile?.user?.name,
        ndNummer: audit.ndNummer,
        action: audit.action,
        newStatus: audit.newStatus,
        verificationSource: audit.verificationSource,
        createdAt: audit.createdAt,
      })),
      alerts: complianceData
        .filter((p) => p.riskLevel === "CRITICAL" || p.riskLevel === "HIGH")
        .map((profile) => ({
          profileId: profile.id,
          profileType: profile.profileType,
          userName: profile.userName,
          bedrijfsnaam: profile.bedrijfsnaam,
          ndNummer: profile.ndNummer,
          riskLevel: profile.riskLevel,
          issue: profile.isExpired
            ? "ND-nummer verlopen"
            : profile.isExpiringSoon
              ? `Verloopt over ${profile.daysUntilExpiry} dagen`
              : "Status vereist aandacht",
          daysUntilExpiry: profile.daysUntilExpiry,
        })),
    });
  } catch (error) {
    console.error("ND-nummer monitoring error:", error);

    return NextResponse.json(
      {
        error: "Fout bij monitoring van ND-nummer compliance",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// POST - Run compliance check and send notifications
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authenticatie vereist" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(ndNummerComplianceCheckSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validatiefout",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    const {
      profileIds,
      checkType,
      includeExpiringSoon,
      daysBeforeExpiry,
      includeInactiveProfiles,
    } = validation.data!;

    // Check if user has permission to check these profiles
    const isAdmin = await checkAdminPermissions(session.user.id);

    if (!isAdmin) {
      // Non-admin users can only check their own profiles
      const userProfiles = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          zzpProfile: true,
          bedrijfProfile: true,
        },
      });

      const allowedProfileIds = [
        userProfiles?.zzpProfile?.id,
        userProfiles?.bedrijfProfile?.id,
      ].filter(Boolean);

      const unauthorizedProfiles = profileIds.filter(
        (id) => !allowedProfileIds.includes(id),
      );

      if (unauthorizedProfiles.length > 0) {
        return NextResponse.json(
          { error: "Geen toegang tot opgegeven profielen" },
          { status: 403 },
        );
      }
    }

    // Get profiles to check
    const zzpProfiles = await prisma.zZPProfile.findMany({
      where: {
        id: { in: profileIds },
        ...(includeInactiveProfiles
          ? {}
          : { ndNummerStatus: { not: "NIET_GEREGISTREERD" } }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const bedrijfProfiles = await prisma.bedrijfProfile.findMany({
      where: {
        id: { in: profileIds },
        ...(includeInactiveProfiles
          ? {}
          : { ndNummerStatus: { not: "NIET_GEREGISTREERD" } }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const allProfiles = [
      ...zzpProfiles.map((p) => ({ ...p, profileType: "ZZP" as const })),
      ...bedrijfProfiles.map((p) => ({
        ...p,
        profileType: "BEDRIJF" as const,
      })),
    ];

    // Perform compliance checks
    const checkResults = allProfiles.map((profile) => {
      const compliance = calculateComplianceStatus(
        profile.ndNummerStatus,
        profile.ndNummerVervalDatum,
      );

      let needsAttention = false;
      const reasons: string[] = [];

      if (checkType === "EXPIRY_CHECK" || checkType === "FULL_AUDIT") {
        if (compliance.isExpired) {
          needsAttention = true;
          reasons.push("ND-nummer is verlopen");
        } else if (
          includeExpiringSoon &&
          compliance.daysUntilExpiry !== null &&
          compliance.daysUntilExpiry <= daysBeforeExpiry
        ) {
          needsAttention = true;
          reasons.push(`Verloopt over ${compliance.daysUntilExpiry} dagen`);
        }
      }

      if (checkType === "STATUS_VERIFICATION" || checkType === "FULL_AUDIT") {
        if (
          profile.ndNummerStatus === "GESCHORST" ||
          profile.ndNummerStatus === "INGETROKKEN"
        ) {
          needsAttention = true;
          reasons.push(`Status: ${profile.ndNummerStatus}`);
        }
      }

      return {
        profileId: profile.id,
        profileType: profile.profileType,
        userId: profile.user.id,
        userName: profile.user.name,
        userEmail: profile.user.email,
        bedrijfsnaam:
          "bedrijfsnaam" in profile ? profile.bedrijfsnaam : undefined,
        ndNummer: profile.ndNummer,
        status: profile.ndNummerStatus,
        vervalDatum: profile.ndNummerVervalDatum,
        compliance,
        needsAttention,
        reasons,
        recommendations: needsAttention
          ? [
              compliance.isExpired ? "Vernieuw ND-nummer onmiddellijk" : null,
              compliance.isExpiringSoon
                ? "Plan vernieuwing binnen 30 dagen"
                : null,
              profile.ndNummerStatus === "GESCHORST"
                ? "Neem contact op met Justis"
                : null,
            ].filter(Boolean)
          : [],
      };
    });

    // Summary of check results
    const summary = {
      totalChecked: checkResults.length,
      needingAttention: checkResults.filter((r) => r.needsAttention).length,
      expired: checkResults.filter((r) => r.compliance.isExpired).length,
      expiringSoon: checkResults.filter((r) => r.compliance.isExpiringSoon)
        .length,
      criticalIssues: checkResults.filter(
        (r) => r.compliance.riskLevel === "CRITICAL",
      ).length,
      checkType,
      performedAt: new Date(),
      performedBy: session.user.id,
    };

    return NextResponse.json({
      success: true,
      summary,
      results: checkResults,
      nextActions: {
        scheduleNotifications:
          checkResults.filter((r) => r.needsAttention).length > 0,
        requiresImmediateAction:
          checkResults.filter((r) => r.compliance.riskLevel === "CRITICAL")
            .length > 0,
        suggestedFollowUp: "7 dagen",
      },
    });
  } catch (error) {
    console.error("ND-nummer compliance check error:", error);

    return NextResponse.json(
      {
        error: "Fout bij uitvoeren compliance check",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
