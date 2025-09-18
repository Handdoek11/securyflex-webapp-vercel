import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation/schemas";

// Default settings for new users
const DEFAULT_SETTINGS = {
  // Notification preferences
  emailNotifications: {
    jobOffers: true,
    shiftReminders: true,
    payments: true,
    marketing: false,
  },
  smsNotifications: {
    urgentJobs: true,
    shiftReminders: true,
    emergencyAlerts: true,
  },
  pushNotifications: {
    jobOffers: true,
    shiftReminders: true,
    messages: true,
    emergencyAlerts: true,
  },

  // Privacy settings
  profileVisibility: "VERIFIED_ONLY" as const,
  showOnlineStatus: true,
  shareLocationData: true,

  // Work preferences
  maxTravelDistance: 25,
  autoAcceptUrgent: false,
  preferredJobTypes: [],
  minimumNoticeHours: 4,

  // GPS & Security settings
  gpsAccuracy: "HIGH" as const,
  autoClockIn: false,
  requirePhotoVerification: true,
  biometricAuth: false,
};

// GET /api/settings - Get user settings
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSettings) {
      // Create default settings for new user
      const _newSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          settings: DEFAULT_SETTINGS,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...DEFAULT_SETTINGS,
          name: session.user.name,
          email: session.user.email,
          phone: null, // Would get from profile
        },
      });
    }

    // Get user profile for basic info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        zzpProfile: {
          select: { phone: true },
        },
      },
    });

    const settings = userSettings.settings as any;

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        name: user?.name,
        email: user?.email,
        phone: user?.zzpProfile?.phone,
      },
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PATCH /api/settings - Update user settings
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

    // Validate settings data
    const validation = settingsSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid settings data",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const validatedData = validation.data;

    // Separate user profile updates from settings
    const userUpdates: any = {};
    const settingsUpdates: any = { ...validatedData };

    // Handle basic profile fields
    if (validatedData.name) {
      userUpdates.name = validatedData.name;
      delete settingsUpdates.name;
    }

    if (validatedData.email) {
      userUpdates.email = validatedData.email;
      userUpdates.emailVerified = null; // Reset email verification
      delete settingsUpdates.email;
    }

    // Handle phone number (stored in ZZP profile)
    let phoneUpdated = false;
    if (validatedData.phone) {
      const zzpProfile = await prisma.zZPProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (zzpProfile) {
        await prisma.zZPProfile.update({
          where: { id: zzpProfile.id },
          data: { phone: validatedData.phone },
        });
        phoneUpdated = true;
      }
      delete settingsUpdates.phone;
    }

    // Update user basic info
    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdates,
      });
    }

    // Get current settings to merge with updates
    let currentSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!currentSettings) {
      // Create default settings if they don't exist
      currentSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          settings: DEFAULT_SETTINGS,
        },
      });
    }

    // Merge current settings with updates
    const mergedSettings = {
      ...(currentSettings.settings as any),
      ...settingsUpdates,
    };

    // Update settings
    const _updatedSettings = await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: {
        settings: mergedSettings,
        updatedAt: new Date(),
      },
    });

    // Handle privacy settings changes
    if (validatedData.profileVisibility) {
      await handlePrivacySettingsChange(
        session.user.id,
        validatedData.profileVisibility,
      );
    }

    // Handle notification preferences changes
    if (
      validatedData.emailNotifications ||
      validatedData.smsNotifications ||
      validatedData.pushNotifications
    ) {
      await updateNotificationPreferences(session.user.id, mergedSettings);
    }

    // Handle work preference changes
    if (validatedData.maxTravelDistance || validatedData.preferredJobTypes) {
      await updateJobRecommendations(session.user.id, mergedSettings);
    }

    // Log settings changes for audit
    await logSettingsChange(session.user.id, Object.keys(settingsUpdates));

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: {
        settings: mergedSettings,
        userUpdated: Object.keys(userUpdates).length > 0,
        phoneUpdated,
        emailVerificationRequired: !!userUpdates.email,
      },
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}

// Handle privacy settings changes
async function handlePrivacySettingsChange(userId: string, visibility: string) {
  try {
    // Update profile visibility in ZZP profile
    const zzpProfile = await prisma.zZPProfile.findUnique({
      where: { userId },
    });

    if (zzpProfile) {
      await prisma.zZPProfile.update({
        where: { id: zzpProfile.id },
        data: {
          metadata: {
            ...((zzpProfile.metadata as any) || {}),
            profileVisibility: visibility,
            lastVisibilityChange: new Date().toISOString(),
          },
        },
      });
    }

    // If setting to private, hide from search results
    if (visibility === "PRIVATE") {
      console.log(
        `User ${userId} set profile to private - updating search visibility`,
      );
    }
  } catch (error) {
    console.error("Privacy settings update error:", error);
  }
}

// Update notification preferences in external services
async function updateNotificationPreferences(userId: string, settings: any) {
  try {
    // In production, integrate with notification services:
    // - Email service (SendGrid, Mailgun)
    // - SMS service (Twilio, MessageBird)
    // - Push notification service (Firebase, OneSignal)

    console.log(`Notification preferences updated for user ${userId}:`, {
      email: settings.emailNotifications,
      sms: settings.smsNotifications,
      push: settings.pushNotifications,
    });

    // Example integrations:
    // await emailService.updatePreferences(userId, settings.emailNotifications);
    // await smsService.updatePreferences(userId, settings.smsNotifications);
    // await pushService.updatePreferences(userId, settings.pushNotifications);
  } catch (error) {
    console.error("Notification preferences update error:", error);
  }
}

// Update job recommendation algorithm
async function updateJobRecommendations(userId: string, settings: any) {
  try {
    // Update job matching criteria
    const criteria = {
      maxTravelDistance: settings.maxTravelDistance,
      preferredJobTypes: settings.preferredJobTypes,
      minimumNoticeHours: settings.minimumNoticeHours,
      autoAcceptUrgent: settings.autoAcceptUrgent,
    };

    // In production, update recommendation engine
    console.log(`Job recommendations updated for user ${userId}:`, criteria);

    // Example: Update machine learning model weights
    // await recommendationEngine.updateUserPreferences(userId, criteria);
  } catch (error) {
    console.error("Job recommendations update error:", error);
  }
}

// Log settings changes for audit trail
async function logSettingsChange(userId: string, changedFields: string[]) {
  try {
    // Store audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "SETTINGS_UPDATE",
        details: {
          changedFields,
          timestamp: new Date().toISOString(),
          userAgent: "Unknown", // Would get from request headers
        },
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
    // Don't fail the request if audit logging fails
  }
}

// DELETE /api/settings - Reset settings to default
export async function DELETE(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Reset to default settings
    const _resetSettings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        settings: DEFAULT_SETTINGS,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        settings: DEFAULT_SETTINGS,
      },
    });

    // Log the reset action
    await logSettingsChange(session.user.id, ["SETTINGS_RESET"]);

    return NextResponse.json({
      success: true,
      message: "Settings reset to default",
      data: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error("Settings reset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset settings" },
      { status: 500 },
    );
  }
}
