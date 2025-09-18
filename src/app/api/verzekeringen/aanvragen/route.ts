import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { broadcastVerzekeringEvent } from "@/lib/supabase/broadcast";

// GET /api/verzekeringen/aanvragen - Haal eigen aanvragen op
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Niet ingelogd" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Get ZZP profile
    const zzpProfile = await prisma.zZPProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!zzpProfile) {
      return NextResponse.json(
        { success: false, error: "Geen ZZP profiel gevonden" },
        { status: 404 },
      );
    }

    // Build where clause
    const whereClause: any = {
      zzpId: zzpProfile.id,
    };

    if (status) {
      whereClause.status = status;
    }

    // Fetch applications
    const aanvragen = await prisma.verzekeringAanvraag.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            categorie: true,
          },
        },
        korting: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format response
    const formattedAanvragen = aanvragen.map((aanvraag) => ({
      id: aanvraag.id,
      product: {
        id: aanvraag.product.id,
        naam: aanvraag.product.naam,
        categorie: aanvraag.product.categorie.naam,
        verzekeraar: aanvraag.product.verzekeraar,
      },
      status: aanvraag.status,
      statusReden: aanvraag.statusReden,
      offertePremie: aanvraag.offertePremie,
      platformKorting: aanvraag.platformKorting,
      codeKorting: aanvraag.codeKorting,
      finaalPremie: aanvraag.finaalPremie,
      kortingscode: aanvraag.korting
        ? {
            code: aanvraag.korting.code,
            naam: aanvraag.korting.naam,
          }
        : null,
      externalRef: aanvraag.externalRef,
      offerteUrl: aanvraag.offerteUrl,
      aangevraagdOp: aanvraag.createdAt,
      laatstBijgewerkt: aanvraag.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        aanvragen: formattedAanvragen,
        total: formattedAanvragen.length,
      },
    });
  } catch (error) {
    console.error("Error fetching insurance applications:", error);
    return NextResponse.json(
      { success: false, error: "Er ging iets mis" },
      { status: 500 },
    );
  }
}

// POST /api/verzekeringen/aanvragen - Maak nieuwe aanvraag
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Niet ingelogd" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      productId,
      aanvraagData,
      kortingCode,
      saveAsConcept = false,
    } = body;

    if (!productId || !aanvraagData) {
      return NextResponse.json(
        { success: false, error: "Product ID en aanvraag data zijn vereist" },
        { status: 400 },
      );
    }

    // Get ZZP profile with subscription
    const zzpProfile = await prisma.zZPProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        subscription: true,
        verzekeringProfile: true,
      },
    });

    if (!zzpProfile || zzpProfile.subscription?.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Actief abonnement vereist",
          requiresSubscription: true,
        },
        { status: 403 },
      );
    }

    // Get product details
    const product = await prisma.verzekeringProduct.findUnique({
      where: { id: productId },
      include: {
        categorie: true,
      },
    });

    if (!product || !product.isActief) {
      return NextResponse.json(
        { success: false, error: "Product niet gevonden of niet actief" },
        { status: 404 },
      );
    }

    // Validate discount code if provided
    let kortingId = null;
    let codeKorting = 0;

    if (kortingCode) {
      const validationResponse = await fetch(
        `${request.nextUrl.origin}/api/verzekeringen/kortingen/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie") || "",
          },
          body: JSON.stringify({
            code: kortingCode,
            productId: productId,
          }),
        },
      );

      const validationResult = await validationResponse.json();

      if (!validationResult.success || !validationResult.data?.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: validationResult.error || "Ongeldige kortingscode",
          },
          { status: 400 },
        );
      }

      // Get korting ID
      const korting = await prisma.verzekeringKorting.findUnique({
        where: { code: kortingCode.toUpperCase() },
      });

      if (korting) {
        kortingId = korting.id;
        codeKorting = validationResult.data.calculatedDiscount.amount;

        // Increment usage counter
        await prisma.verzekeringKorting.update({
          where: { id: korting.id },
          data: { gebruiktAantal: { increment: 1 } },
        });
      }
    }

    // Calculate premiums (simplified - in production would call insurance API)
    const basePremie = product.basispremie ? Number(product.basispremie) : 0;
    const platformKorting =
      basePremie * (Number(product.kortingPercentage) / 100);
    const finaalPremie = Math.max(
      0,
      basePremie - platformKorting - codeKorting,
    );

    // Create application
    const aanvraag = await prisma.verzekeringAanvraag.create({
      data: {
        zzpId: zzpProfile.id,
        productId: productId,
        kortingId: kortingId,
        kortingCode: kortingCode?.toUpperCase(),
        aanvraagData: aanvraagData,
        offertePremie: basePremie,
        platformKorting: platformKorting,
        codeKorting: codeKorting,
        finaalPremie: finaalPremie,
        status: saveAsConcept ? "CONCEPT" : "AANGEVRAAGD",
        ipAdres:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      },
      include: {
        product: {
          include: {
            categorie: true,
          },
        },
        korting: true,
      },
    });

    // Update verzekering profile
    if (!zzpProfile.verzekeringProfile) {
      await prisma.zZPVerzekeringProfile.create({
        data: {
          zzpId: zzpProfile.id,
          intereseCategorieen: [product.categorie.naam],
          totaalAanvragen: 1,
          laatsteActiviteit: new Date(),
        },
      });
    } else {
      await prisma.zZPVerzekeringProfile.update({
        where: { zzpId: zzpProfile.id },
        data: {
          totaalAanvragen: { increment: 1 },
          laatsteActiviteit: new Date(),
          intereseCategorieen: {
            set: Array.from(
              new Set([
                ...zzpProfile.verzekeringProfile.intereseCategorieen,
                product.categorie.naam,
              ]),
            ),
          },
        },
      });
    }

    // Broadcast event for real-time updates
    await broadcastVerzekeringEvent("AANVRAAG_CREATED", {
      aanvraagId: aanvraag.id,
      userId: session.user.id,
      product: product.naam,
      status: aanvraag.status,
    });

    // TODO: Send to insurance partner API if not concept
    if (!saveAsConcept) {
      // This would integrate with Schouten Zekerheid API
      console.log("Would send to insurance API:", {
        product: product.externalProductId,
        data: aanvraagData,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        aanvraag: {
          id: aanvraag.id,
          status: aanvraag.status,
          product: {
            naam: aanvraag.product.naam,
            categorie: aanvraag.product.categorie.naam,
          },
          premie: {
            basis: aanvraag.offertePremie,
            platformKorting: aanvraag.platformKorting,
            codeKorting: aanvraag.codeKorting,
            finaal: aanvraag.finaalPremie,
          },
          message: saveAsConcept
            ? "Aanvraag opgeslagen als concept"
            : "Aanvraag succesvol ingediend",
        },
      },
    });
  } catch (error) {
    console.error("Error creating insurance application:", error);
    return NextResponse.json(
      { success: false, error: "Er ging iets mis bij het indienen" },
      { status: 500 },
    );
  }
}
