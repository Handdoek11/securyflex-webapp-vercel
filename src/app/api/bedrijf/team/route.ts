import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getFinqleClient } from "@/lib/finqle/client";

// GET /api/bedrijf/team - Get team members
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get bedrijf profile
    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        teamLeden: {
          include: {
            zzp: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            },
            assignments: {
              include: {
                opdracht: {
                  select: {
                    id: true,
                    titel: true,
                    status: true
                  }
                }
              },
              where: {
                status: {
                  in: ["ASSIGNED", "CONFIRMED"]
                }
              }
            }
          }
        }
      }
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "Alleen bedrijven kunnen team leden beheren" },
        { status: 403 }
      );
    }

    // Format team members data
    const teamMembers = bedrijfProfile.teamLeden.map((member) => ({
      id: member.id,
      zzpId: member.zzpId,
      name: member.zzp.user.name,
      email: member.zzp.user.email,
      image: member.zzp.user.image,
      kvkNummer: member.zzp.kvkNummer,
      specialisaties: member.zzp.specialisaties,
      certificaten: member.zzp.certificaten,
      uurtarief: member.zzp.uurtarief,
      rating: member.zzp.rating,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      activeAssignments: member.assignments.length,
      finqleOnboarded: member.zzp.finqleOnboarded
    }));

    return NextResponse.json({
      success: true,
      data: {
        teamMembers,
        stats: {
          total: teamMembers.length,
          active: teamMembers.filter(m => m.status === "ACTIVE").length,
          invited: teamMembers.filter(m => m.status === "INVITED").length,
          finqleReady: teamMembers.filter(m => m.finqleOnboarded).length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST /api/bedrijf/team - Invite ZZP to team
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { zzpEmail, role = "MEMBER" } = data;

    // Validate input
    if (!zzpEmail) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Get bedrijf profile
    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        teamLeden: true
      }
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "Alleen bedrijven kunnen team leden uitnodigen" },
        { status: 403 }
      );
    }

    // Check team size limits based on subscription
    const maxTeamSize = {
      ZZP: 1,
      SMALL: 5,
      MEDIUM: 15,
      LARGE: 999
    }[bedrijfProfile.subscriptionTier];

    if (bedrijfProfile.teamLeden.length >= maxTeamSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Team limiet bereikt. Upgrade je abonnement voor meer team leden (max ${maxTeamSize})`
        },
        { status: 400 }
      );
    }

    // Find ZZP user by email
    const zzpUser = await prisma.user.findUnique({
      where: { email: zzpEmail },
      include: {
        zzpProfile: true
      }
    });

    if (!zzpUser || !zzpUser.zzpProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Geen ZZP beveiliger gevonden met dit email adres"
        },
        { status: 404 }
      );
    }

    // Check if already in team
    const existingMember = await prisma.bedrijfTeamLid.findUnique({
      where: {
        bedrijfId_zzpId: {
          bedrijfId: bedrijfProfile.id,
          zzpId: zzpUser.zzpProfile.id
        }
      }
    });

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          error: "Deze beveiliger is al lid van je team"
        },
        { status: 400 }
      );
    }

    // Create team member invitation
    const teamMember = await prisma.bedrijfTeamLid.create({
      data: {
        bedrijfId: bedrijfProfile.id,
        zzpId: zzpUser.zzpProfile.id,
        role,
        status: "INVITED"
      },
      include: {
        zzp: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // TODO: Send invitation email/notification

    return NextResponse.json({
      success: true,
      message: `Uitnodiging verstuurd naar ${zzpUser.name}`,
      data: {
        teamMemberId: teamMember.id,
        name: teamMember.zzp.user.name,
        email: teamMember.zzp.user.email,
        status: teamMember.status
      }
    });

  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to invite team member" },
      { status: 500 }
    );
  }
}

// DELETE /api/bedrijf/team - Remove team member
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamMemberId = searchParams.get("id");

    if (!teamMemberId) {
      return NextResponse.json(
        { success: false, error: "Team member ID is required" },
        { status: 400 }
      );
    }

    // Get bedrijf profile
    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if team member exists and belongs to this bedrijf
    const teamMember = await prisma.bedrijfTeamLid.findFirst({
      where: {
        id: teamMemberId,
        bedrijfId: bedrijfProfile.id
      },
      include: {
        assignments: {
          where: {
            status: {
              in: ["ASSIGNED", "CONFIRMED"]
            }
          }
        }
      }
    });

    if (!teamMember) {
      return NextResponse.json(
        { success: false, error: "Team member not found" },
        { status: 404 }
      );
    }

    // Check if member has active assignments
    if (teamMember.assignments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Kan teamlid niet verwijderen met actieve opdrachten"
        },
        { status: 400 }
      );
    }

    // Delete team member
    await prisma.bedrijfTeamLid.delete({
      where: { id: teamMemberId }
    });

    return NextResponse.json({
      success: true,
      message: "Team lid verwijderd"
    });

  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}