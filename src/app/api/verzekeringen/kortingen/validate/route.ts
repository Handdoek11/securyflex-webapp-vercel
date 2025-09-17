import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/verzekeringen/kortingen/validate - Valideer een kortingscode
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Niet ingelogd" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, productId } = body;

    if (!code || !productId) {
      return NextResponse.json(
        { success: false, error: "Code en product ID zijn vereist" },
        { status: 400 }
      );
    }

    // Check ZZP status
    const zzpProfile = await prisma.zZPProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        subscription: true,
        verzekeringAanvragen: {
          where: {
            kortingCode: code.toUpperCase()
          }
        }
      }
    });

    if (!zzpProfile || zzpProfile.subscription?.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Actief abonnement vereist",
          requiresSubscription: true
        },
        { status: 403 }
      );
    }

    // Find discount code
    const korting = await prisma.verzekeringKorting.findUnique({
      where: {
        code: code.toUpperCase()
      },
      include: {
        producten: {
          where: {
            productId: productId
          }
        }
      }
    });

    if (!korting) {
      return NextResponse.json(
        { success: false, error: "Ongeldige kortingscode" },
        { status: 404 }
      );
    }

    // Validate discount
    const now = new Date();
    const validationErrors = [];

    // Check if active
    if (!korting.isActief) {
      validationErrors.push("Deze kortingscode is niet meer actief");
    }

    // Check validity period
    if (korting.geldigVan > now) {
      validationErrors.push("Deze kortingscode is nog niet geldig");
    }

    if (korting.geldigTot < now) {
      validationErrors.push("Deze kortingscode is verlopen");
    }

    // Check usage limits
    if (korting.maxGebruik && korting.gebruiktAantal >= korting.maxGebruik) {
      validationErrors.push("Deze kortingscode is op");
    }

    // Check if user already used this code
    const userUsageCount = zzpProfile.verzekeringAanvragen.filter(
      aanvraag => aanvraag.kortingCode === code.toUpperCase()
    ).length;

    if (userUsageCount >= korting.maxPerGebruiker) {
      validationErrors.push(`Je hebt deze code al ${userUsageCount} keer gebruikt`);
    }

    // Check if code applies to this product
    if (korting.producten.length === 0) {
      validationErrors.push("Deze code geldt niet voor dit product");
    }

    // Check subscription duration if required
    if (korting.minAbonnementDuur) {
      const subscriptionStartDate = zzpProfile.subscription?.createdAt;
      if (!subscriptionStartDate) {
        validationErrors.push("Abonnement informatie niet gevonden");
      } else {
        const monthsSubscribed = Math.floor(
          (now.getTime() - new Date(subscriptionStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        if (monthsSubscribed < korting.minAbonnementDuur) {
          validationErrors.push(
            `Minimaal ${korting.minAbonnementDuur} maanden abonnement vereist (je hebt ${monthsSubscribed} maanden)`
          );
        }
      }
    }

    // Check new customer requirement
    if (korting.nieuweKlantenOnly && zzpProfile.verzekeringAanvragen.length > 0) {
      validationErrors.push("Deze code is alleen voor nieuwe klanten");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: validationErrors[0],
        errors: validationErrors,
        isValid: false
      });
    }

    // Calculate discount value
    const product = await prisma.verzekeringProduct.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product niet gevonden" },
        { status: 404 }
      );
    }

    let discountAmount = 0;
    let discountPercentage = 0;

    if (korting.kortingType === "PERCENTAGE") {
      discountPercentage = Number(korting.waarde);
      if (product.basispremie) {
        discountAmount = Number(product.basispremie) * (discountPercentage / 100);
      }
    } else {
      discountAmount = Number(korting.waarde);
      if (product.basispremie && Number(product.basispremie) > 0) {
        discountPercentage = (discountAmount / Number(product.basispremie)) * 100;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        code: korting.code,
        naam: korting.naam,
        beschrijving: korting.beschrijving,
        type: korting.kortingType,
        waarde: korting.waarde,
        calculatedDiscount: {
          amount: discountAmount,
          percentage: discountPercentage
        },
        message: `Kortingscode ${korting.naam} is geldig!`
      }
    });

  } catch (error) {
    console.error("Error validating discount code:", error);
    return NextResponse.json(
      { success: false, error: "Er ging iets mis bij het valideren" },
      { status: 500 }
    );
  }
}