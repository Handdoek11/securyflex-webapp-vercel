import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  ndNummerNotificationSchema,
  validateApiRequest
} from '@/lib/validation/schemas';
import {
  sendNotification,
  checkExpiringNDNummers,
  type NDNummerNotification
} from '@/lib/services/nd-nummer-notifications';
import { headers } from 'next/headers';

// Check if user has admin permissions
async function checkAdminPermissions(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === 'ADMIN';
}

// POST - Send manual ND-nummer notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(ndNummerNotificationSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validatiefout',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const notificationData = validation.data!;

    // Check if user has permission to send notifications
    const isAdmin = await checkAdminPermissions(session.user.id);

    if (!isAdmin) {
      // Non-admin users can only send notifications for their own profiles
      const userProfiles = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          zzpProfile: true,
          bedrijfProfile: true
        }
      });

      const allowedProfileIds = [
        userProfiles?.zzpProfile?.id,
        userProfiles?.bedrijfProfile?.id
      ].filter(Boolean);

      if (!allowedProfileIds.includes(notificationData.profileId)) {
        return NextResponse.json(
          { error: 'Geen toegang tot opgegeven profiel' },
          { status: 403 }
        );
      }
    }

    // Get profile information for the notification
    const profile = notificationData.profileType === 'ZZP'
      ? await prisma.zZPProfile.findUnique({
          where: { id: notificationData.profileId },
          include: { user: true }
        })
      : await prisma.bedrijfProfile.findUnique({
          where: { id: notificationData.profileId },
          include: { user: true }
        });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profiel niet gevonden' },
        { status: 404 }
      );
    }

    if (!profile.ndNummer) {
      return NextResponse.json(
        { error: 'Geen ND-nummer geregistreerd voor dit profiel' },
        { status: 400 }
      );
    }

    // Calculate days until expiry if applicable
    let daysUntilExpiry: number | undefined;
    if (profile.ndNummerVervalDatum) {
      const now = new Date();
      daysUntilExpiry = Math.ceil(
        (profile.ndNummerVervalDatum.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Create notification object
    const notification: NDNummerNotification = {
      profileId: notificationData.profileId,
      profileType: notificationData.profileType,
      notificationType: notificationData.notificationType,
      channels: notificationData.channels,
      urgency: notificationData.urgency,
      customMessage: notificationData.customMessage,
      scheduledFor: notificationData.scheduledFor ? new Date(notificationData.scheduledFor) : undefined,
      ndNummer: profile.ndNummer,
      vervalDatum: profile.ndNummerVervalDatum || undefined,
      daysUntilExpiry
    };

    // Send the notification
    const success = await sendNotification(notification);

    if (!success) {
      return NextResponse.json(
        { error: 'Notificatie versturen mislukt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notificatie succesvol verstuurd',
      notification: {
        profileId: notification.profileId,
        profileType: notification.profileType,
        notificationType: notification.notificationType,
        channels: notification.channels,
        urgency: notification.urgency,
        sentAt: new Date(),
        recipient: {
          name: profile.user.name,
          email: profile.user.email,
          bedrijfsnaam: 'bedrijfsnaam' in profile ? profile.bedrijfsnaam : undefined
        }
      }
    });

  } catch (error) {
    console.error('ND-nummer notification error:', error);

    return NextResponse.json(
      {
        error: 'Fout bij versturen notificatie',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Get notification history for a profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const profileType = searchParams.get('profileType') as 'ZZP' | 'BEDRIJF' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check permissions
    const isAdmin = await checkAdminPermissions(session.user.id);

    if (!isAdmin) {
      // Non-admin users can only see their own notifications
      const userProfiles = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          zzpProfile: true,
          bedrijfProfile: true
        }
      });

      const allowedProfileIds = [
        userProfiles?.zzpProfile?.id,
        userProfiles?.bedrijfProfile?.id
      ].filter(Boolean);

      if (profileId && !allowedProfileIds.includes(profileId)) {
        return NextResponse.json(
          { error: 'Geen toegang tot opgegeven profiel' },
          { status: 403 }
        );
      }
    }

    // Build where clause for notifications
    let whereClause: any = {
      type: 'SYSTEM_ANNOUNCEMENT',
      metadata: {
        path: ['category'],
        equals: 'ND_NUMMER'
      }
    };

    if (profileId && profileType) {
      // Get notifications for specific profile
      whereClause.metadata = {
        path: ['profileId'],
        equals: profileId
      };
    } else if (!isAdmin) {
      // Non-admin users see only their own notifications
      whereClause.userId = session.user.id;
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            email: isAdmin,
            zzpProfile: {
              select: { id: true, ndNummer: true }
            },
            bedrijfProfile: {
              select: { id: true, bedrijfsnaam: true, ndNummer: true }
            }
          }
        }
      }
    });

    // Get total count
    const totalCount = await prisma.notification.count({
      where: whereClause
    });

    // Format response
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      urgency: notification.metadata?.urgency || 'MEDIUM',
      notificationType: notification.metadata?.notificationType,
      channels: notification.metadata?.channels || ['IN_APP'],
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      recipient: {
        name: notification.user.name,
        email: isAdmin ? notification.user.email : undefined,
        ndNummer: notification.user.zzpProfile?.ndNummer || notification.user.bedrijfProfile?.ndNummer,
        bedrijfsnaam: notification.user.bedrijfProfile?.bedrijfsnaam
      }
    }));

    return NextResponse.json({
      notifications: formattedNotifications,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);

    return NextResponse.json(
      {
        error: 'Fout bij ophalen notificaties',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Run manual expiry check (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await checkAdminPermissions(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin rechten vereist' },
        { status: 403 }
      );
    }

    console.log(`Manual ND-nummer expiry check triggered by admin ${session.user.id}`);

    // Run the expiry check
    await checkExpiringNDNummers();

    return NextResponse.json({
      success: true,
      message: 'Handmatige verloopdatum controle uitgevoerd',
      triggeredBy: session.user.id,
      triggeredAt: new Date()
    });

  } catch (error) {
    console.error('Manual expiry check error:', error);

    return NextResponse.json(
      {
        error: 'Fout bij uitvoeren handmatige controle',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Mark notification as read
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notificatie ID is verplicht' },
        { status: 400 }
      );
    }

    // Check if notification belongs to user or user is admin
    const isAdmin = await checkAdminPermissions(session.user.id);

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificatie niet gevonden' },
        { status: 404 }
      );
    }

    if (!isAdmin && notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Geen toegang tot deze notificatie' },
        { status: 403 }
      );
    }

    // Mark as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Notificatie gemarkeerd als gelezen'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);

    return NextResponse.json(
      {
        error: 'Fout bij markeren notificatie',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}