import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/opdrachten/[id]/accept - Accept opdracht as bedrijf
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: opdrachtId } = await params;

    // Get bedrijf profile
    const bedrijfProfile = await prisma.bedrijfProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        teamLeden: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!bedrijfProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Alleen bedrijven kunnen opdrachten accepteren",
        },
        { status: 403 },
      );
    }

    // Get opdracht details
    const opdracht = await prisma.opdracht.findUnique({
      where: { id: opdrachtId },
      include: {
        opdrachtgever: true,
        bedrijf: true,
        beveiligers: true,
        assignments: true,
      },
    });

    if (!opdracht) {
      return NextResponse.json(
        { success: false, error: "Opdracht niet gevonden" },
        { status: 404 },
      );
    }

    // Check if opdracht is still available
    if (opdracht.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "Deze opdracht is niet meer beschikbaar" },
        { status: 400 },
      );
    }

    // Check if already assigned to another bedrijf
    if (opdracht.bedrijfId && opdracht.bedrijfId !== bedrijfProfile.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Deze opdracht is al toegewezen aan een ander bedrijf",
        },
        { status: 400 },
      );
    }

    // Check if bedrijf has enough active team members
    if (bedrijfProfile.teamLeden.length < opdracht.aantalBeveiligers) {
      return NextResponse.json(
        {
          success: false,
          error: `Je hebt minimaal ${opdracht.aantalBeveiligers} actieve teamleden nodig voor deze opdracht`,
        },
        { status: 400 },
      );
    }

    // Check if opdrachtgever has Finqle credit limit
    let hasFinqleCredit = false;
    if (
      opdracht.opdrachtgever.finqleDebtorId &&
      opdracht.opdrachtgever.finqleCreditLimit
    ) {
      const estimatedAmount =
        Number(opdracht.uurtarief) * opdracht.aantalBeveiligers * 8; // Estimate 8 hours
      hasFinqleCredit =
        Number(opdracht.opdrachtgever.finqleCreditLimit) >= estimatedAmount;
    }

    // Accept opdracht
    const updatedOpdracht = await prisma.opdracht.update({
      where: { id: opdrachtId },
      data: {
        bedrijfId: bedrijfProfile.id,
        status: "TOEGEWEZEN",
      },
    });

    // TODO: Send notification to opdrachtgever

    return NextResponse.json({
      success: true,
      message: "Opdracht geaccepteerd! Je kunt nu je team toewijzen.",
      data: {
        opdrachtId: updatedOpdracht.id,
        status: updatedOpdracht.status,
        hasFinqleCredit,
        requiredTeamMembers: opdracht.aantalBeveiligers,
        availableTeamMembers: bedrijfProfile.teamLeden.length,
      },
    });
  } catch (error) {
    console.error("Error accepting opdracht:", error);
    return NextResponse.json(
      { success: false, error: "Failed to accept opdracht" },
      { status: 500 },
    );
  }
}
