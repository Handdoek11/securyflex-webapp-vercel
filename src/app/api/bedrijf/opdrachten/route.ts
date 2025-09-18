import { CreatorType, TargetAudience } from "@prisma/client";
import { NextResponse } from "next/server";
import { BedrijfQueryOptimizer } from "@/lib/database/optimization";
import {
  bedrijfValidationSchemas,
  validateBedrijfInput,
  withBedrijfSecurity,
  withDatabaseOptimization,
} from "@/lib/middleware/bedrijfSecurity";
import prisma from "@/lib/prisma";
import {
  BroadcastEvent,
  broadcastOpdrachtEvent,
} from "@/lib/supabase/broadcast";

// GET /api/bedrijf/opdrachten - Get bedrijf opdrachten (with security hardening)
export const GET = withBedrijfSecurity(
  async (request, context) => {
    const { bedrijfProfile } = context;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role") || "leverancier"; // leverancier or opdrachtgever
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Use optimized bedrijf query
    const queryOptimizer = new BedrijfQueryOptimizer(prisma);
    const result = await withDatabaseOptimization(
      () =>
        queryOptimizer.getOpdrachtForBedrijf(
          bedrijfProfile.id,
          role as "leverancier" | "opdrachtgever",
          {
            status: status || undefined,
            page,
            limit,
            includeStats: true,
          },
        ),
      `bedrijf-opdrachten-${bedrijfProfile.id}-${role}-${status || "all"}`,
    )();

    // Format response data using optimized result
    const formattedOpdrachten = result.data.map((opdracht: unknown) => {
      // Type assertion for the opdracht object from the optimizer
      const typedOpdracht = opdracht as {
        id: string;
        titel: string;
        omschrijving: string;
        locatie: string;
        postcode: string;
        startDatum: Date;
        eindDatum: Date;
        uurtarief: number;
        aantalBeveiligers: number;
        vereisten: string[];
        status: string;
        targetAudience: string;
        directZZPAllowed: boolean;
        createdAt: Date;
        opdrachtgever?: { bedrijfsnaam: string; contactpersoon?: string };
        creatorBedrijf?: { bedrijfsnaam: string };
        sollicitaties?: Array<{ id: string; status: string }>;
        _count?: { sollicitaties: number };
      };

      return {
        id: typedOpdracht.id,
        titel: typedOpdracht.titel,
        omschrijving: typedOpdracht.omschrijving,
        locatie: typedOpdracht.locatie,
        postcode: typedOpdracht.postcode,
        startDatum: typedOpdracht.startDatum,
        eindDatum: typedOpdracht.eindDatum,
        uurtarief: typedOpdracht.uurtarief,
        aantalBeveiligers: typedOpdracht.aantalBeveiligers,
        vereisten: typedOpdracht.vereisten,
        status: typedOpdracht.status,
        targetAudience: typedOpdracht.targetAudience,
        directZZPAllowed: typedOpdracht.directZZPAllowed,
        createdAt: typedOpdracht.createdAt,

        // Client info
        client: {
          name:
            typedOpdracht.opdrachtgever?.bedrijfsnaam ||
            typedOpdracht.creatorBedrijf?.bedrijfsnaam ||
            "Onbekend",
          contact: typedOpdracht.opdrachtgever?.contactpersoon || null,
        },

        // Application status
        hasApplied: typedOpdracht.sollicitaties?.length > 0 || false,
        applicationId: typedOpdracht.sollicitaties?.[0]?.id || null,
        applicationStatus: typedOpdracht.sollicitaties?.[0]?.status || null,
        totalApplications: typedOpdracht._count?.sollicitaties || 0,

        // Calculated fields
        totalValue:
          Number(typedOpdracht.uurtarief) *
          typedOpdracht.aantalBeveiligers *
          (typedOpdracht.eindDatum
            ? Math.ceil(
                (typedOpdracht.eindDatum.getTime() -
                  typedOpdracht.startDatum.getTime()) /
                  (1000 * 60 * 60),
              )
            : 8),
        daysUntilStart: Math.ceil(
          (typedOpdracht.startDatum.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        opdrachten: formattedOpdrachten,
        pagination: result.pagination,
        filters: {
          role,
          status,
        },
      },
    });
  },
  {
    requireBedrijf: true,
    allowedMethods: ["GET"],
    rateLimiter: "general",
    logActivity: true,
  },
);

// POST /api/bedrijf/opdrachten - Create new opdracht (with security hardening)
export const POST = withBedrijfSecurity(
  async (request, context) => {
    const { bedrijfProfile } = context;

    // Validate input data using secure validation
    const validationResult = await validateBedrijfInput(
      bedrijfValidationSchemas.createOpdracht,
    )(request);
    if (validationResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
        },
        { status: 400 },
      );
    }

    const validatedData = validationResult.data;

    // Create the opdracht with database optimization
    const opdracht = await withDatabaseOptimization(
      () =>
        prisma.opdracht.create({
          data: {
            titel: validatedData.titel,
            omschrijving: validatedData.omschrijving,
            locatie: validatedData.locatie,
            postcode: validatedData.postcode,
            startDatum: new Date(validatedData.startDatum),
            eindDatum: new Date(validatedData.eindDatum),
            uurtarief: validatedData.uurtarief,
            aantalBeveiligers: validatedData.aantalBeveiligers,
            vereisten: validatedData.vereisten || [],
            targetAudience:
              validatedData.targetAudience || TargetAudience.ALLEEN_ZZP,
            directZZPAllowed: validatedData.directZZPAllowed || false,

            // Set creator as bedrijf
            creatorType: CreatorType.BEDRIJF,
            creatorBedrijfId: bedrijfProfile.id,

            status: validatedData.isDraft ? "DRAFT" : "OPEN",
          },
          include: {
            creatorBedrijf: {
              select: {
                bedrijfsnaam: true,
              },
            },
          },
        }),
      `create-opdracht-${bedrijfProfile.id}`,
    )();

    // Broadcast new opdracht if not draft
    if (!validatedData.isDraft) {
      await broadcastOpdrachtEvent(BroadcastEvent.OPDRACHT_CREATED, opdracht);
    }

    return NextResponse.json({
      success: true,
      message: validatedData.isDraft
        ? "Concept opdracht opgeslagen"
        : "Opdracht succesvol geplaatst",
      data: {
        opdrachtId: opdracht.id,
        titel: opdracht.titel,
        status: opdracht.status,
        client: opdracht.creatorBedrijf?.bedrijfsnaam,
      },
    });
  },
  {
    requireBedrijf: true,
    allowedMethods: ["POST"],
    rateLimiter: "write",
    requireCSRF: true,
    sanitizeInput: true,
    logActivity: true,
  },
);
