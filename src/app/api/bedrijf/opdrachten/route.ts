import { NextRequest, NextResponse } from "next/server";
import { withBedrijfSecurity, validateBedrijfInput, bedrijfValidationSchemas, withDatabaseOptimization } from "@/lib/middleware/bedrijfSecurity";
import { BedrijfQueryOptimizer } from "@/lib/database/optimization";
import { broadcastOpdrachtEvent, BroadcastEvent } from "@/lib/supabase/broadcast";
import { CreateOpdrachtSchema } from "@/lib/validation/schemas";
import { Prisma, TargetAudience, CreatorType } from "@prisma/client";
import { cachedQuery } from "@/lib/database/optimization";
import prisma from "@/lib/prisma";

// GET /api/bedrijf/opdrachten - Get bedrijf opdrachten (with security hardening)
export const GET = withBedrijfSecurity(
  async (request, context) => {
    const { bedrijfProfile } = context;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role") || "leverancier"; // leverancier or opdrachtgever
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Use optimized bedrijf query
    const queryOptimizer = new BedrijfQueryOptimizer(prisma);
    const result = await withDatabaseOptimization(
      () => queryOptimizer.getOpdrachtForBedrijf(
        bedrijfProfile.id,
        role as 'leverancier' | 'opdrachtgever',
        {
          status: status || undefined,
          page,
          limit,
          includeStats: true
        }
      ),
      `bedrijf-opdrachten-${bedrijfProfile.id}-${role}-${status || 'all'}`
    )();

    // Format response data using optimized result
    const formattedOpdrachten = result.data.map(opdracht => ({
      id: opdracht.id,
      titel: opdracht.titel,
      omschrijving: opdracht.omschrijving,
      locatie: opdracht.locatie,
      postcode: opdracht.postcode,
      startDatum: opdracht.startDatum,
      eindDatum: opdracht.eindDatum,
      uurtarief: opdracht.uurtarief,
      aantalBeveiligers: opdracht.aantalBeveiligers,
      vereisten: opdracht.vereisten,
      status: opdracht.status,
      targetAudience: opdracht.targetAudience,
      directZZPAllowed: opdracht.directZZPAllowed,
      createdAt: opdracht.createdAt,

      // Client info
      client: {
        name: opdracht.opdrachtgever?.bedrijfsnaam || opdracht.creatorBedrijf?.bedrijfsnaam || "Onbekend",
        contact: opdracht.opdrachtgever?.contactpersoon || null
      },

      // Application status
      hasApplied: opdracht.sollicitaties?.length > 0 || false,
      applicationId: opdracht.sollicitaties?.[0]?.id || null,
      applicationStatus: opdracht.sollicitaties?.[0]?.status || null,
      totalApplications: opdracht._count?.sollicitaties || 0,

      // Calculated fields
      totalValue: Number(opdracht.uurtarief) * opdracht.aantalBeveiligers *
        (opdracht.eindDatum ?
          Math.ceil((opdracht.eindDatum.getTime() - opdracht.startDatum.getTime()) / (1000 * 60 * 60)) : 8),
      daysUntilStart: Math.ceil((opdracht.startDatum.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }));

    return NextResponse.json({
      success: true,
      data: {
        opdrachten: formattedOpdrachten,
        pagination: result.pagination,
        filters: {
          role,
          status
        }
      }
    });
  },
  {
    requireBedrijf: true,
    allowedMethods: ['GET'],
    rateLimiter: 'general',
    logActivity: true
  }
);

// POST /api/bedrijf/opdrachten - Create new opdracht (with security hardening)
export const POST = withBedrijfSecurity(
  async (request, context) => {
    const { bedrijfProfile } = context;

    // Validate input data using secure validation
    const validationResult = await validateBedrijfInput(bedrijfValidationSchemas.createOpdracht)(request);
    if (validationResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Create the opdracht with database optimization
    const opdracht = await withDatabaseOptimization(
      () => prisma.opdracht.create({
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
          targetAudience: validatedData.targetAudience || TargetAudience.ALLEEN_ZZP,
          directZZPAllowed: validatedData.directZZPAllowed || false,

          // Set creator as bedrijf
          creatorType: CreatorType.BEDRIJF,
          creatorBedrijfId: bedrijfProfile.id,

          status: validatedData.isDraft ? "DRAFT" : "OPEN",
        },
        include: {
          creatorBedrijf: {
            select: {
              bedrijfsnaam: true
            }
          }
        }
      }),
      `create-opdracht-${bedrijfProfile.id}`
    )();

    // Broadcast new opdracht if not draft
    if (!validatedData.isDraft) {
      await broadcastOpdrachtEvent(BroadcastEvent.OPDRACHT_CREATED, opdracht);
    }

    return NextResponse.json({
      success: true,
      message: validatedData.isDraft ? "Concept opdracht opgeslagen" : "Opdracht succesvol geplaatst",
      data: {
        opdrachtId: opdracht.id,
        titel: opdracht.titel,
        status: opdracht.status,
        client: opdracht.creatorBedrijf?.bedrijfsnaam
      }
    });
  },
  {
    requireBedrijf: true,
    allowedMethods: ['POST'],
    rateLimiter: 'write',
    requireCSRF: true,
    sanitizeInput: true,
    logActivity: true
  }
);