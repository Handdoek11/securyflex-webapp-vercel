import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/verzekeringen/producten - Haal verzekering producten op
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Niet ingelogd" },
        { status: 401 },
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const categorieId = searchParams.get("categorieId");
    const featured = searchParams.get("featured") === "true";

    // Check ZZP status and subscription
    const zzpProfile = await prisma.zZPProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        subscription: true,
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

    // Build query
    const whereClause: any = {
      isActief: true,
    };

    if (categorieId) {
      whereClause.categorieId = categorieId;
    }

    if (featured) {
      whereClause.isFeatured = true;
    }

    // Fetch products
    const products = await prisma.verzekeringProduct.findMany({
      where: whereClause,
      include: {
        categorie: {
          select: {
            id: true,
            naam: true,
          },
        },
        kortingen: {
          include: {
            korting: {
              where: {
                isActief: true,
                geldigVan: { lte: new Date() },
                geldigTot: { gte: new Date() },
              },
            },
          },
        },
        _count: {
          select: { aanvragen: true },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { naam: "asc" }],
    });

    // Format response with calculated discounts
    const formattedProducts = products.map((product) => {
      // Find best available discount
      const activeDiscounts = product.kortingen
        .filter((pk) => pk.korting?.isActief)
        .map((pk) => pk.korting);

      const bestDiscount = activeDiscounts.reduce((best, current) => {
        if (!current) return best;
        if (!best) return current;

        // Compare discount values (convert to percentage if needed)
        const currentValue =
          current.kortingType === "PERCENTAGE"
            ? Number(current.waarde)
            : product.basispremie
              ? (Number(current.waarde) / Number(product.basispremie)) * 100
              : 0;

        const bestValue =
          best.kortingType === "PERCENTAGE"
            ? Number(best.waarde)
            : product.basispremie
              ? (Number(best.waarde) / Number(product.basispremie)) * 100
              : 0;

        return currentValue > bestValue ? current : best;
      }, null as any);

      return {
        id: product.id,
        naam: product.naam,
        beschrijving: product.beschrijving,
        korteBeschrijving: product.korteBeschrijving,
        categorie: product.categorie,
        verzekeraar: product.verzekeraar,
        verzekeraarLogo: product.verzekeraarLogo,
        basispremie: product.basispremie,
        platformKorting: product.kortingPercentage,
        extraKorting: bestDiscount
          ? {
              code: bestDiscount.code,
              naam: bestDiscount.naam,
              type: bestDiscount.kortingType,
              waarde: bestDiscount.waarde,
            }
          : null,
        totaleKorting:
          Number(product.kortingPercentage) +
          (bestDiscount && bestDiscount.kortingType === "PERCENTAGE"
            ? Number(bestDiscount.waarde)
            : 0),
        features: product.productFeatures,
        isFeatured: product.isFeatured,
        aantalAanvragen: product._count.aanvragen,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        total: formattedProducts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching insurance products:", error);
    return NextResponse.json(
      { success: false, error: "Er ging iets mis" },
      { status: 500 },
    );
  }
}
