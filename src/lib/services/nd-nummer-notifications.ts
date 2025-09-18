import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/supabase/broadcast";

export interface NDNummerNotification {
  profileId: string;
  profileType: "ZZP" | "BEDRIJF";
  notificationType:
    | "EXPIRY_WARNING_90_DAYS"
    | "EXPIRY_WARNING_60_DAYS"
    | "EXPIRY_WARNING_30_DAYS"
    | "EXPIRED_NOTIFICATION"
    | "RENEWAL_REMINDER"
    | "STATUS_CHANGE"
    | "VERIFICATION_REQUIRED"
    | "DOCUMENT_UPLOAD_REQUIRED";
  channels: ("EMAIL" | "SMS" | "PUSH" | "IN_APP")[];
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  customMessage?: string;
  scheduledFor?: Date;
  ndNummer: string;
  vervalDatum?: Date;
  daysUntilExpiry?: number;
}

export interface NotificationTemplate {
  subject: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

/**
 * Get notification templates for different ND-nummer scenarios
 */
export function getNotificationTemplate(
  type: NDNummerNotification["notificationType"],
  data: {
    userName: string;
    bedrijfsnaam?: string;
    ndNummer: string;
    daysUntilExpiry?: number;
    vervalDatum?: Date;
    newStatus?: string;
  },
): NotificationTemplate {
  const displayName = data.bedrijfsnaam || data.userName;

  const templates: Record<
    NDNummerNotification["notificationType"],
    NotificationTemplate
  > = {
    EXPIRY_WARNING_90_DAYS: {
      subject: "ND-nummer verloopt over 90 dagen - Plan vernieuwing",
      message: `Beste ${displayName},\n\nUw ND-nummer (${data.ndNummer}) verloopt over ${data.daysUntilExpiry} dagen op ${data.vervalDatum?.toLocaleDateString("nl-NL")}.\n\nWij adviseren u om de vernieuwingsprocedure te starten bij Justis. De vernieuwing kan 6-8 weken in beslag nemen.\n\nZonder geldig ND-nummer kunt u geen beveiligingsopdrachten uitvoeren.`,
      actionUrl: "/dashboard/compliance",
      actionLabel: "Plan Vernieuwing",
      priority: "MEDIUM",
    },

    EXPIRY_WARNING_60_DAYS: {
      subject: "Urgent: ND-nummer verloopt over 60 dagen",
      message: `Beste ${displayName},\n\nUw ND-nummer (${data.ndNummer}) verloopt over ${data.daysUntilExpiry} dagen op ${data.vervalDatum?.toLocaleDateString("nl-NL")}.\n\nDit is uw tweede waarschuwing. Start direct de vernieuwingsprocedure bij Justis om onderbreking van uw activiteiten te voorkomen.\n\nBenodigde stappen:\n1. Aanvraag indienen bij Justis\n2. Betaling van €600 + €92 per manager\n3. Wachten op goedkeuring (6-8 weken)`,
      actionUrl: "/dashboard/compliance",
      actionLabel: "Vernieuwen Nu",
      priority: "HIGH",
    },

    EXPIRY_WARNING_30_DAYS: {
      subject: "KRITIEK: ND-nummer verloopt over 30 dagen!",
      message: `Beste ${displayName},\n\nUw ND-nummer (${data.ndNummer}) verloopt over ${data.daysUntilExpiry} dagen op ${data.vervalDatum?.toLocaleDateString("nl-NL")}.\n\n⚠️ KRITIEKE WAARSCHUWING ⚠️\n\nU heeft nog maar 30 dagen om uw ND-nummer te vernieuwen. Na vervaldatum:\n- Kunt u geen nieuwe opdrachten accepteren\n- Worden actieve opdrachten mogelijk geannuleerd\n- Riskeert u boetes wegens illegale activiteiten\n\nNeem ONMIDDELLIJK contact op met Justis voor spoedvernieuwing.`,
      actionUrl: "https://www.justis.nl",
      actionLabel: "Contact Justis",
      priority: "CRITICAL",
    },

    EXPIRED_NOTIFICATION: {
      subject: "ND-nummer VERLOPEN - Onmiddellijke actie vereist",
      message: `Beste ${displayName},\n\nUw ND-nummer (${data.ndNummer}) is VERLOPEN op ${data.vervalDatum?.toLocaleDateString("nl-NL")}.\n\n🚨 URGENT: U mag GEEN beveiligingsactiviteiten meer uitvoeren 🚨\n\nOnmiddellijke gevolgen:\n- Alle opdrachten zijn geblokkeerd\n- Nieuwe sollicitaties zijn niet mogelijk\n- U handelt illegaal als u doorgaat met werken\n\nActies:\n1. Stop onmiddellijk alle beveiligingsactiviteiten\n2. Dien spoedvernieuwing in bij Justis\n3. Neem contact op met onze compliance afdeling`,
      actionUrl: "/dashboard/compliance",
      actionLabel: "Spoedvernieuwing",
      priority: "CRITICAL",
    },

    RENEWAL_REMINDER: {
      subject: "Herinnering: ND-nummer vernieuwing in behandeling",
      message: `Beste ${displayName},\n\nUw ND-nummer (${data.ndNummer}) vernieuwingsaanvraag is in behandeling bij Justis.\n\nStatus: Wachtend op goedkeuring\nVerwachte behandeltijd: 6-8 weken\n\nHoud uw e-mail in de gaten voor updates van Justis. Neem contact op als u na 8 weken nog geen reactie heeft ontvangen.`,
      actionUrl: "/dashboard/compliance",
      actionLabel: "Status Bekijken",
      priority: "LOW",
    },

    STATUS_CHANGE: {
      subject: `ND-nummer status gewijzigd: ${data.newStatus}`,
      message: `Beste ${displayName},\n\nDe status van uw ND-nummer (${data.ndNummer}) is gewijzigd naar: ${data.newStatus}\n\nDeze wijziging kan gevolgen hebben voor uw mogelijkheid om opdrachten uit te voeren. Controleer uw compliance dashboard voor meer informatie.`,
      actionUrl: "/dashboard/compliance",
      actionLabel: "Details Bekijken",
      priority:
        data.newStatus === "GESCHORST" || data.newStatus === "INGETROKKEN"
          ? "CRITICAL"
          : "MEDIUM",
    },

    VERIFICATION_REQUIRED: {
      subject: "ND-nummer verificatie vereist",
      message: `Beste ${displayName},\n\nUw ND-nummer (${data.ndNummer}) vereist verificatie via de Justis API.\n\nDit kan gebeuren bij:\n- Nieuwe registratie\n- Statuswijzigingen\n- Reguliere controles\n\nKlik op de knop hieronder om de verificatie uit te voeren.`,
      actionUrl: "/dashboard/compliance",
      actionLabel: "Verificatie Uitvoeren",
      priority: "MEDIUM",
    },

    DOCUMENT_UPLOAD_REQUIRED: {
      subject: "Document upload vereist voor ND-nummer",
      message: `Beste ${displayName},\n\nVoor uw ND-nummer (${data.ndNummer}) zijn aanvullende documenten vereist.\n\nMogelijke documenten:\n- Bijgewerkt ND-nummer certificaat\n- Vernieuwingsbewijs\n- Aanvullende identificatie\n\nUpload de benodigde documenten om uw compliance status bij te werken.`,
      actionUrl: "/dashboard/compliance",
      actionLabel: "Documenten Uploaden",
      priority: "HIGH",
    },
  };

  return templates[type];
}

/**
 * Send notification via specified channels
 */
export async function sendNotification(
  notification: NDNummerNotification,
): Promise<boolean> {
  try {
    // Get user profile information
    const profile =
      notification.profileType === "ZZP"
        ? await prisma.zZPProfile.findUnique({
            where: { id: notification.profileId },
            include: { user: true },
          })
        : await prisma.bedrijfProfile.findUnique({
            where: { id: notification.profileId },
            include: { user: true },
          });

    if (!profile) {
      console.error(
        "Profile not found for notification:",
        notification.profileId,
      );
      return false;
    }

    const userName = profile.user.name;
    const bedrijfsnaam =
      "bedrijfsnaam" in profile ? profile.bedrijfsnaam : undefined;
    const userEmail = profile.user.email;
    const userPhone = profile.user.phone;

    // Get notification template
    const template = getNotificationTemplate(notification.notificationType, {
      userName,
      bedrijfsnaam,
      ndNummer: notification.ndNummer,
      daysUntilExpiry: notification.daysUntilExpiry,
      vervalDatum: notification.vervalDatum,
    });

    const finalMessage = notification.customMessage || template.message;

    // Create in-app notification
    if (notification.channels.includes("IN_APP")) {
      await prisma.notification.create({
        data: {
          userId: profile.user.id,
          type: getInAppNotificationType(notification.notificationType),
          category: "SYSTEM",
          title: template.subject,
          message: finalMessage,
          actionUrl: template.actionUrl,
          actionLabel: template.actionLabel,
          metadata: {
            ndNummer: notification.ndNummer,
            urgency: notification.urgency,
            profileType: notification.profileType,
            notificationType: notification.notificationType,
          },
        },
      });

      // Broadcast real-time notification
      await broadcastEvent(`user:${profile.user.id}:notifications`, {
        type: "NOTIFICATION_NEW",
        data: {
          title: template.subject,
          message: finalMessage,
          urgency: notification.urgency,
          category: "ND_NUMMER",
        },
      });
    }

    // Send email notification
    if (notification.channels.includes("EMAIL")) {
      // In a real implementation, you would integrate with an email service
      // For now, we'll log the email content
      console.log("EMAIL NOTIFICATION:", {
        to: userEmail,
        subject: template.subject,
        body: finalMessage,
        priority: template.priority,
      });

      // TODO: Integrate with email service (SendGrid, Resend, etc.)
      // await emailService.send({
      //   to: userEmail,
      //   subject: template.subject,
      //   html: generateEmailHTML(template, notification),
      //   priority: template.priority
      // });
    }

    // Send SMS notification
    if (notification.channels.includes("SMS") && userPhone) {
      const smsMessage = `SecuryFlex: ${template.subject}\n\n${finalMessage.substring(0, 100)}...\n\nBekijk details: ${template.actionUrl}`;

      console.log("SMS NOTIFICATION:", {
        to: userPhone,
        message: smsMessage,
        urgency: notification.urgency,
      });

      // TODO: Integrate with SMS service (Twilio, MessageBird, etc.)
      // await smsService.send({
      //   to: userPhone,
      //   message: smsMessage,
      //   priority: notification.urgency
      // });
    }

    // Send push notification
    if (notification.channels.includes("PUSH")) {
      console.log("PUSH NOTIFICATION:", {
        userId: profile.user.id,
        title: template.subject,
        body: finalMessage.substring(0, 100),
        data: {
          actionUrl: template.actionUrl,
          urgency: notification.urgency,
          category: "ND_NUMMER",
        },
      });

      // TODO: Integrate with push notification service
      // await pushService.send({
      //   userId: profile.user.id,
      //   title: template.subject,
      //   body: finalMessage.substring(0, 100),
      //   data: { actionUrl: template.actionUrl }
      // });
    }

    // Log the notification for audit purposes
    await logNotificationSent(notification, profile.user.id);

    return true;
  } catch (error) {
    console.error("Error sending ND-nummer notification:", error);
    return false;
  }
}

/**
 * Check for expiring ND-nummers and send notifications
 */
export async function checkExpiringNDNummers(): Promise<void> {
  try {
    const now = new Date();
    const _in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const _in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Check ZZP profiles
    const expiringZZPs = await prisma.zZPProfile.findMany({
      where: {
        ndNummerStatus: "ACTIEF",
        ndNummerVervalDatum: {
          lte: in90Days,
          gt: now,
        },
      },
      include: { user: true },
    });

    // Check Bedrijf profiles
    const expiringBedrijven = await prisma.bedrijfProfile.findMany({
      where: {
        ndNummerStatus: "ACTIEF",
        ndNummerVervalDatum: {
          lte: in90Days,
          gt: now,
        },
      },
      include: { user: true },
    });

    const allExpiringProfiles = [
      ...expiringZZPs.map((p) => ({ ...p, profileType: "ZZP" as const })),
      ...expiringBedrijven.map((p) => ({
        ...p,
        profileType: "BEDRIJF" as const,
      })),
    ];

    for (const profile of allExpiringProfiles) {
      if (!profile.ndNummerVervalDatum || !profile.ndNummer) continue;

      const daysUntilExpiry = Math.ceil(
        (profile.ndNummerVervalDatum.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Determine notification type based on days until expiry
      let notificationType: NDNummerNotification["notificationType"];
      let urgency: NDNummerNotification["urgency"];

      if (daysUntilExpiry <= 30) {
        notificationType = "EXPIRY_WARNING_30_DAYS";
        urgency = "CRITICAL";
      } else if (daysUntilExpiry <= 60) {
        notificationType = "EXPIRY_WARNING_60_DAYS";
        urgency = "HIGH";
      } else {
        notificationType = "EXPIRY_WARNING_90_DAYS";
        urgency = "MEDIUM";
      }

      // Check if we already sent this notification recently
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: profile.user.id,
          type: getInAppNotificationType(notificationType),
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      });

      if (recentNotification) continue; // Skip if already notified recently

      // Send notification
      const notification: NDNummerNotification = {
        profileId: profile.id,
        profileType: profile.profileType,
        notificationType,
        channels:
          urgency === "CRITICAL"
            ? ["EMAIL", "SMS", "PUSH", "IN_APP"]
            : ["EMAIL", "IN_APP"],
        urgency,
        ndNummer: profile.ndNummer,
        vervalDatum: profile.ndNummerVervalDatum,
        daysUntilExpiry,
      };

      await sendNotification(notification);
    }

    // Check for expired ND-nummers
    const expiredZZPs = await prisma.zZPProfile.findMany({
      where: {
        ndNummerStatus: "ACTIEF",
        ndNummerVervalDatum: { lt: now },
      },
      include: { user: true },
    });

    const expiredBedrijven = await prisma.bedrijfProfile.findMany({
      where: {
        ndNummerStatus: "ACTIEF",
        ndNummerVervalDatum: { lt: now },
      },
      include: { user: true },
    });

    // Update expired profiles and send notifications
    for (const profile of [...expiredZZPs, ...expiredBedrijven]) {
      const isZZP = "kvkNummer" in profile && !("bedrijfsnaam" in profile);
      const profileType = isZZP ? "ZZP" : "BEDRIJF";

      // Update status to VERLOPEN
      if (isZZP) {
        await prisma.zZPProfile.update({
          where: { id: profile.id },
          data: {
            ndNummerStatus: "VERLOPEN",
            ndNummerOpmerking: "Automatisch verlopen - vernieuwing vereist",
          },
        });
      } else {
        await prisma.bedrijfProfile.update({
          where: { id: profile.id },
          data: {
            ndNummerStatus: "VERLOPEN",
            ndNummerOpmerking: "Automatisch verlopen - vernieuwing vereist",
          },
        });
      }

      // Create audit log
      await prisma.nDNummerAuditLog.create({
        data: {
          profileType: profileType as any,
          zzpProfileId: isZZP ? profile.id : undefined,
          bedrijfProfileId: isZZP ? undefined : profile.id,
          ndNummer: profile.ndNummer,
          previousStatus: "ACTIEF",
          newStatus: "VERLOPEN",
          action: "AUTOMATISCHE_CHECK",
          verificationSource: "Automated",
          complianceNotes: "ND-nummer automatisch verlopen door systeem",
        },
      });

      // Send expired notification
      if (profile.ndNummer) {
        const notification: NDNummerNotification = {
          profileId: profile.id,
          profileType: profileType as "ZZP" | "BEDRIJF",
          notificationType: "EXPIRED_NOTIFICATION",
          channels: ["EMAIL", "SMS", "PUSH", "IN_APP"],
          urgency: "CRITICAL",
          ndNummer: profile.ndNummer,
          vervalDatum: profile.ndNummerVervalDatum,
        };

        await sendNotification(notification);
      }
    }

    console.log(
      `ND-nummer expiry check completed. Processed ${allExpiringProfiles.length} expiring profiles and ${expiredZZPs.length + expiredBedrijven.length} expired profiles.`,
    );
  } catch (error) {
    console.error("Error checking expiring ND-nummers:", error);
  }
}

/**
 * Schedule periodic ND-nummer compliance checks
 */
export function scheduleNDNummerChecks(): void {
  // Run daily at 9 AM
  const interval = 24 * 60 * 60 * 1000; // 24 hours

  const runCheck = async () => {
    console.log("Starting scheduled ND-nummer compliance check...");
    await checkExpiringNDNummers();
    console.log("Scheduled ND-nummer compliance check completed");
  };

  // Run immediately on startup
  runCheck();

  // Schedule recurring checks
  setInterval(runCheck, interval);
}

/**
 * Helper functions
 */
function getInAppNotificationType(
  notificationType: NDNummerNotification["notificationType"],
) {
  const mapping = {
    EXPIRY_WARNING_90_DAYS: "SYSTEM_ANNOUNCEMENT",
    EXPIRY_WARNING_60_DAYS: "SYSTEM_ANNOUNCEMENT",
    EXPIRY_WARNING_30_DAYS: "SYSTEM_ANNOUNCEMENT",
    EXPIRED_NOTIFICATION: "SYSTEM_ANNOUNCEMENT",
    RENEWAL_REMINDER: "SYSTEM_ANNOUNCEMENT",
    STATUS_CHANGE: "SYSTEM_ANNOUNCEMENT",
    VERIFICATION_REQUIRED: "SYSTEM_ANNOUNCEMENT",
    DOCUMENT_UPLOAD_REQUIRED: "SYSTEM_ANNOUNCEMENT",
  } as const;

  return mapping[notificationType] || "SYSTEM_ANNOUNCEMENT";
}

async function logNotificationSent(
  notification: NDNummerNotification,
  _userId: string,
): Promise<void> {
  try {
    await prisma.nDNummerAuditLog.create({
      data: {
        profileType: notification.profileType,
        zzpProfileId:
          notification.profileType === "ZZP"
            ? notification.profileId
            : undefined,
        bedrijfProfileId:
          notification.profileType === "BEDRIJF"
            ? notification.profileId
            : undefined,
        ndNummer: notification.ndNummer,
        action: "HERINNERING_VERSTUURD",
        newStatus: "ACTIEF", // Assuming current status
        verificationSource: "Automated",
        complianceNotes: `Notificatie verstuurd: ${notification.notificationType} via ${notification.channels.join(", ")}`,
        performedBy: "system",
      },
    });
  } catch (error) {
    console.error("Error logging notification:", error);
  }
}
