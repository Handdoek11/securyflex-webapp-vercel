import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  opdrachtgeverDbProfileSchema,
  zzpProfileSchema,
} from "@/lib/validation/schemas";

// GET /api/profile - Get current user's profile
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user profile with all related data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        zzpProfile: {
          include: {
            certificaten: {
              orderBy: { createdAt: "desc" },
            },
            documenten: {
              orderBy: { uploadedAt: "desc" },
            },
            reviews: {
              include: {
                reviewer: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            opdrachten: {
              include: {
                opdracht: {
                  select: {
                    titel: true,
                    startDatum: true,
                    eindDatum: true,
                    status: true,
                  },
                },
              },
              orderBy: { opdracht: { startDatum: "desc" } },
            },
            werkuren: {
              where: {
                status: "COMPLETED",
              },
              orderBy: { datum: "desc" },
              take: 10,
            },
          },
        },
        bedrijfProfile: true,
        opdrachtgever: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Calculate profile completion percentage
    const profileCompletion = calculateProfileCompletion(user);

    // Calculate statistics
    const stats = await calculateUserStats(user);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        profile: user.zzpProfile || user.bedrijfProfile || user.opdrachtgever,
        profileCompletion,
        stats,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Get current user to determine profile type
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        zzpProfile: true,
        bedrijfProfile: true,
        opdrachtgever: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Handle different profile types
    if (user.role === "ZZP_BEVEILIGER" && user.zzpProfile) {
      return await updateZZPProfile(user.zzpProfile.id, body, user);
    } else if (user.role === "BEDRIJF" && user.bedrijfProfile) {
      return await updateBedrijfProfile(user.bedrijfProfile.id, body, user);
    } else if (user.role === "OPDRACHTGEVER" && user.opdrachtgever) {
      return await updateOpdrachtgeverProfile(
        user.opdrachtgever.id,
        body,
        user,
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Profile not found or incomplete setup" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

// Update ZZP Profile
async function updateZZPProfile(profileId: string, data: any, user: any) {
  // Validate ZZP profile data
  const validation = zzpProfileSchema.partial().safeParse(data);

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid profile data",
        details: validation.error.errors,
      },
      { status: 400 },
    );
  }

  const validatedData = validation.data;

  // Check for KvK number uniqueness if being updated
  if (
    validatedData.kvkNummer &&
    validatedData.kvkNummer !== user.zzpProfile.kvkNummer
  ) {
    const existingProfile = await prisma.zZPProfile.findFirst({
      where: {
        kvkNummer: validatedData.kvkNummer,
        id: { not: profileId },
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: "KvK nummer is already in use" },
        { status: 400 },
      );
    }
  }

  // Update user basic info if provided
  const userUpdates: any = {};
  if (validatedData.name && validatedData.name !== user.name) {
    userUpdates.name = validatedData.name;
  }
  if (validatedData.email && validatedData.email !== user.email) {
    userUpdates.email = validatedData.email;
    userUpdates.emailVerified = null; // Reset email verification
  }

  if (Object.keys(userUpdates).length > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: userUpdates,
    });
  }

  // Prepare profile updates
  const profileUpdates: any = { ...validatedData };
  delete profileUpdates.name;
  delete profileUpdates.email;

  // Update profile completion status
  const updatedProfile = await prisma.zZPProfile.update({
    where: { id: profileId },
    data: {
      ...profileUpdates,
      updatedAt: new Date(),
    },
  });

  // Calculate new profile completion
  const profileCompletion = calculateZZPProfileCompletion({
    ...user,
    zzpProfile: updatedProfile,
    name: userUpdates.name || user.name,
    email: userUpdates.email || user.email,
  });

  return NextResponse.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      profile: updatedProfile,
      profileCompletion,
      emailVerificationRequired: !!userUpdates.email,
    },
  });
}

// Update Bedrijf Profile (placeholder)
async function updateBedrijfProfile(
  _profileId: string,
  _data: any,
  _user: any,
) {
  // Similar implementation for bedrijf profiles
  return NextResponse.json(
    {
      success: false,
      error: "Bedrijf profile updates not yet implemented",
    },
    { status: 501 },
  );
}

// Update Opdrachtgever Profile
async function updateOpdrachtgeverProfile(
  profileId: string,
  data: any,
  user: any,
) {
  // Validate opdrachtgever profile data
  const validation = opdrachtgeverDbProfileSchema.partial().safeParse(data);

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid profile data",
        details: validation.error.errors,
      },
      { status: 400 },
    );
  }

  const validatedData = validation.data;

  // Check for KvK number uniqueness if being updated
  if (
    validatedData.kvkNummer &&
    validatedData.kvkNummer !== user.opdrachtgever.kvkNummer
  ) {
    const existingProfile = await prisma.opdrachtgever.findFirst({
      where: {
        kvkNummer: validatedData.kvkNummer,
        id: { not: profileId },
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: "KvK nummer is already in use" },
        { status: 400 },
      );
    }
  }

  // Update user basic info if provided
  const userUpdates: any = {};
  if (validatedData.name && validatedData.name !== user.name) {
    userUpdates.name = validatedData.name;
  }
  if (validatedData.email && validatedData.email !== user.email) {
    userUpdates.email = validatedData.email;
    userUpdates.emailVerified = null; // Reset email verification
  }
  if (validatedData.phone && validatedData.phone !== user.phone) {
    userUpdates.phone = validatedData.phone;
  }

  if (Object.keys(userUpdates).length > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: userUpdates,
    });
  }

  // Prepare profile updates
  const profileUpdates: any = {};
  if (validatedData.bedrijfsnaam)
    profileUpdates.bedrijfsnaam = validatedData.bedrijfsnaam;
  if (validatedData.kvkNummer !== undefined)
    profileUpdates.kvkNummer = validatedData.kvkNummer;
  if (validatedData.contactpersoon)
    profileUpdates.contactpersoon = validatedData.contactpersoon;

  // Update profile
  const updatedProfile = await prisma.opdrachtgever.update({
    where: { id: profileId },
    data: {
      ...profileUpdates,
      updatedAt: new Date(),
    },
  });

  // Calculate new profile completion
  const profileCompletion = calculateOpdrachtgeverProfileCompletion({
    ...user,
    opdrachtgever: updatedProfile,
    name: userUpdates.name || user.name,
    email: userUpdates.email || user.email,
    phone: userUpdates.phone || user.phone,
  });

  return NextResponse.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      profile: updatedProfile,
      profileCompletion,
      emailVerificationRequired: !!userUpdates.email,
    },
  });
}

// Calculate profile completion percentage
function calculateProfileCompletion(user: any): number {
  if (user.role === "ZZP_BEVEILIGER" && user.zzpProfile) {
    return calculateZZPProfileCompletion(user);
  } else if (user.role === "OPDRACHTGEVER" && user.opdrachtgever) {
    return calculateOpdrachtgeverProfileCompletion(user);
  }
  // Add other profile types as needed
  return 0;
}

function calculateZZPProfileCompletion(user: any): number {
  const profile = user.zzpProfile;
  let completed = 0;
  const total = 15; // Total number of profile fields

  // Basic info (5 points)
  if (user.name) completed++;
  if (user.email) completed++;
  if (profile.phone) completed++;
  if (user.image) completed++;
  if (profile.beschrijving && profile.beschrijving.length >= 50) completed++;

  // Business info (3 points)
  if (profile.kvkNummer && profile.kvkNummer !== `TEMP_${user.id}`) completed++;
  if (profile.btwNummer) completed++;
  if (profile.uurtarief && profile.uurtarief > 0) completed++;

  // Location info (3 points)
  if (profile.adres) completed++;
  if (profile.postcode) completed++;
  if (profile.plaats) completed++;

  // Professional info (4 points)
  if (profile.specialisaties && profile.specialisaties.length > 0) completed++;
  if (profile.werkgebied && profile.werkgebied.length > 0) completed++;
  if (profile.ervaring !== null) completed++;
  if (
    profile.beschikbaarheid &&
    Object.keys(profile.beschikbaarheid).length > 0
  )
    completed++;

  return Math.round((completed / total) * 100);
}

function calculateOpdrachtgeverProfileCompletion(user: any): number {
  const profile = user.opdrachtgever;
  let completed = 0;
  const total = 6; // Total number of profile fields

  // Basic user info (3 points)
  if (user.name) completed++;
  if (user.email) completed++;
  if (user.phone) completed++;

  // Business info (3 points)
  if (profile.bedrijfsnaam) completed++;
  if (profile.contactpersoon) completed++;
  if (profile.kvkNummer) completed++;

  return Math.round((completed / total) * 100);
}

// Calculate user statistics
async function calculateUserStats(user: any) {
  if (user.role === "ZZP_BEVEILIGER" && user.zzpProfile) {
    const profileId = user.zzpProfile.id;

    // Get aggregated stats
    const [
      totalShifts,
      totalHours,
      totalEarnings,
      avgRating,
      activeApplications,
    ] = await Promise.all([
      // Total completed shifts
      prisma.werkuur.count({
        where: {
          beveiligerId: profileId,
          status: "COMPLETED",
        },
      }),

      // Total hours worked
      prisma.werkuur.aggregate({
        where: {
          beveiligerId: profileId,
          status: "COMPLETED",
        },
        _sum: {
          totaleUren: true,
        },
      }),

      // Total earnings
      prisma.werkuur.aggregate({
        where: {
          beveiligerId: profileId,
          status: "COMPLETED",
        },
        _sum: {
          nettoBedrag: true,
        },
      }),

      // Average rating
      prisma.review.aggregate({
        where: {
          beveiligerId: profileId,
        },
        _avg: {
          rating: true,
        },
      }),

      // Active applications
      prisma.opdrachtSollicitatie.count({
        where: {
          zzpId: profileId,
          status: { in: ["PENDING", "REVIEWING"] },
        },
      }),
    ]);

    return {
      totalShifts,
      totalHours: totalHours._sum.totaleUren || 0,
      totalEarnings: totalEarnings._sum.nettoBedrag || 0,
      avgRating: avgRating._avg.rating || 0,
      activeApplications,
      joinDate: user.createdAt,
      profileViews: 0, // Would track in separate table
      responseRate: 95, // Would calculate from application responses
    };
  }

  return {};
}
