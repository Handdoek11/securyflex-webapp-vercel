import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/bedrijf/team/assign - Assign team members to opdracht
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
    const { opdrachtId, teamMemberIds } = data;

    // Validate input
    if (!opdrachtId || !teamMemberIds || !Array.isArray(teamMemberIds)) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get bedrijf profile
    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        { success: false, error: "Alleen bedrijven kunnen team toewijzen" },
        { status: 403 }
      );
    }

    // Check if opdracht exists and is assigned to this bedrijf
    const opdracht = await prisma.opdracht.findFirst({
      where: {
        id: opdrachtId,
        acceptedBedrijfId: bedrijfProfile.id,
        status: {
          in: ["TOEGEWEZEN", "BEZIG"]
        }
      },
      include: {
        assignments: true
      }
    });

    if (!opdracht) {
      return NextResponse.json(
        {
          success: false,
          error: "Opdracht niet gevonden of niet toegewezen aan dit bedrijf"
        },
        { status: 404 }
      );
    }

    // Check if we're not exceeding required beveiligers
    const currentAssignments = opdracht.assignments.filter(
      a => a.status !== "DECLINED"
    ).length;
    const newAssignments = teamMemberIds.length;

    if (currentAssignments + newAssignments > opdracht.aantalBeveiligers) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${opdracht.aantalBeveiligers} beveiligers toegestaan voor deze opdracht`
        },
        { status: 400 }
      );
    }

    // Verify all team members belong to this bedrijf and are active
    const teamMembers = await prisma.bedrijfTeamLid.findMany({
      where: {
        id: { in: teamMemberIds },
        bedrijfId: bedrijfProfile.id,
        status: "ACTIVE"
      },
      include: {
        zzp: true
      }
    });

    if (teamMembers.length !== teamMemberIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Een of meer teamleden zijn niet beschikbaar"
        },
        { status: 400 }
      );
    }

    // Check for existing assignments
    const existingAssignments = await prisma.opdrachtAssignment.findMany({
      where: {
        opdrachtId,
        teamLidId: { in: teamMemberIds }
      }
    });

    if (existingAssignments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Een of meer teamleden zijn al toegewezen aan deze opdracht"
        },
        { status: 400 }
      );
    }

    // Create assignments
    const assignments = await prisma.opdrachtAssignment.createMany({
      data: teamMemberIds.map(teamLidId => ({
        opdrachtId,
        teamLidId,
        assignedBy: session.user.id,
        status: "ASSIGNED"
      }))
    });

    // Update opdracht status if fully assigned
    const totalAssignments = currentAssignments + newAssignments;
    if (totalAssignments === opdracht.aantalBeveiligers) {
      await prisma.opdracht.update({
        where: { id: opdrachtId },
        data: { status: "BEZIG" }
      });
    }

    // Get created assignments with details
    const createdAssignments = await prisma.opdrachtAssignment.findMany({
      where: {
        opdrachtId,
        teamLidId: { in: teamMemberIds }
      },
      include: {
        teamLid: {
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
        }
      }
    });

    // TODO: Send notifications to assigned team members

    return NextResponse.json({
      success: true,
      message: `${assignments.count} teamleden toegewezen aan opdracht`,
      data: {
        assignments: createdAssignments.map(a => ({
          id: a.id,
          teamMemberId: a.teamLidId,
          name: a.teamLid.zzp.user.name,
          email: a.teamLid.zzp.user.email,
          status: a.status,
          assignedAt: a.assignedAt
        })),
        opdrachtStatus: totalAssignments === opdracht.aantalBeveiligers ? "BEZIG" : "TOEGEWEZEN"
      }
    });

  } catch (error) {
    console.error("Error assigning team:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign team members" },
      { status: 500 }
    );
  }
}

// GET /api/bedrijf/team/assign - Get assignments
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const opdrachtId = searchParams.get("opdrachtId");
    const teamLidId = searchParams.get("teamLidId");

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

    // Build query
    const where: any = {};

    if (opdrachtId) {
      // Verify opdracht belongs to this bedrijf
      const opdracht = await prisma.opdracht.findFirst({
        where: {
          id: opdrachtId,
          acceptedBedrijfId: bedrijfProfile.id
        }
      });

      if (!opdracht) {
        return NextResponse.json(
          { success: false, error: "Opdracht not found" },
          { status: 404 }
        );
      }

      where.opdrachtId = opdrachtId;
    }

    if (teamLidId) {
      // Verify team member belongs to this bedrijf
      const teamMember = await prisma.bedrijfTeamLid.findFirst({
        where: {
          id: teamLidId,
          bedrijfId: bedrijfProfile.id
        }
      });

      if (!teamMember) {
        return NextResponse.json(
          { success: false, error: "Team member not found" },
          { status: 404 }
        );
      }

      where.teamLidId = teamLidId;
    }

    // If no specific filters, get all assignments for this bedrijf's opdrachten
    if (!opdrachtId && !teamLidId) {
      const bedrijfOpdrachten = await prisma.opdracht.findMany({
        where: { acceptedBedrijfId: bedrijfProfile.id },
        select: { id: true }
      });

      where.opdrachtId = { in: bedrijfOpdrachten.map(o => o.id) };
    }

    // Get assignments
    const assignments = await prisma.opdrachtAssignment.findMany({
      where,
      include: {
        opdracht: {
          select: {
            id: true,
            titel: true,
            locatie: true,
            startDatum: true,
            eindDatum: true,
            status: true
          }
        },
        teamLid: {
          include: {
            zzp: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        assignedAt: "desc"
      }
    });

    // Format response
    const formattedAssignments = assignments.map(a => ({
      id: a.id,
      opdracht: {
        id: a.opdracht.id,
        titel: a.opdracht.titel,
        locatie: a.opdracht.locatie,
        startDatum: a.opdracht.startDatum,
        eindDatum: a.opdracht.eindDatum,
        status: a.opdracht.status
      },
      teamMember: {
        id: a.teamLid.id,
        name: a.teamLid.zzp.user.name,
        email: a.teamLid.zzp.user.email,
        image: a.teamLid.zzp.user.image,
        role: a.teamLid.role
      },
      status: a.status,
      assignedAt: a.assignedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        assignments: formattedAssignments,
        stats: {
          total: formattedAssignments.length,
          assigned: formattedAssignments.filter(a => a.status === "ASSIGNED").length,
          confirmed: formattedAssignments.filter(a => a.status === "CONFIRMED").length,
          declined: formattedAssignments.filter(a => a.status === "DECLINED").length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// PATCH /api/bedrijf/team/assign - Update assignment status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { assignmentId, status } = data;

    // Validate input
    if (!assignmentId || !status) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const validStatuses = ["ASSIGNED", "CONFIRMED", "DECLINED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get assignment and verify ownership
    const assignment = await prisma.opdrachtAssignment.findFirst({
      where: { id: assignmentId },
      include: {
        opdracht: true,
        teamLid: {
          include: {
            zzp: true
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if user can update this assignment
    // Either the bedrijf owner or the assigned ZZP can update
    const isBedrijfOwner = assignment.opdracht.acceptedBedrijfId &&
      await prisma.bedrijfProfile.findFirst({
        where: {
          id: assignment.opdracht.acceptedBedrijfId,
          userId: session.user.id
        }
      });

    const isAssignedZZP = assignment.teamLid.zzp.userId === session.user.id;

    if (!isBedrijfOwner && !isAssignedZZP) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to update this assignment" },
        { status: 403 }
      );
    }

    // ZZP can only confirm or decline
    if (isAssignedZZP && !isBedrijfOwner && !["CONFIRMED", "DECLINED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status update" },
        { status: 400 }
      );
    }

    // Update assignment
    const updatedAssignment = await prisma.opdrachtAssignment.update({
      where: { id: assignmentId },
      data: { status }
    });

    // TODO: Send notifications based on status change

    return NextResponse.json({
      success: true,
      message: `Assignment status updated to ${status}`,
      data: {
        assignmentId: updatedAssignment.id,
        status: updatedAssignment.status
      }
    });

  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}