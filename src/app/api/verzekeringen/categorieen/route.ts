import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/verzekeringen/categorieen - Haal alle verzekeringscategorieën op
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Niet ingelogd" },
        { status: 401 },
      );
    }

    // Check if user is ZZP with active subscription
    const zzpProfile = await prisma.zZPProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        subscription: true,
      },
    });

    if (!zzpProfile) {
      return NextResponse.json(
        { success: false, error: "Alleen voor ZZP beveiligers" },
        { status: 403 },
      );
    }

    // Check subscription status
    const hasActiveSubscription =
      zzpProfile.subscription?.status === "active" &&
      new Date(zzpProfile.subscription.currentPeriodEnd) > new Date();

    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: "Actief abonnement vereist",
          requiresSubscription: true,
        },
        { status: 403 },
      );
    }

    // Fetch categories with product counts
    const categories = await prisma.verzekeringCategorie.findMany({
      where: { isActief: true },
      include: {
        _count: {
          select: { producten: true },
        },
        producten: {
          where: { isActief: true },
          select: {
            id: true,
            naam: true,
            korteBeschrijving: true,
            kortingPercentage: true,
            isFeatured: true,
          },
          take: 3, // Show first 3 products as preview
          orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Format response
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      naam: cat.naam,
      beschrijving: cat.beschrijving,
      aantalProducten: cat._count.producten,
      voorbeeldProducten: cat.producten.map((p) => ({
        id: p.id,
        naam: p.naam,
        beschrijving: p.korteBeschrijving,
        korting: p.kortingPercentage,
        isFeatured: p.isFeatured,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: formattedCategories,
        userStatus: {
          hasSubscription: true,
          canAccessInsurance: true,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching insurance categories:", error);
    return NextResponse.json(
      { success: false, error: "Er ging iets mis" },
      { status: 500 },
    );
  }
}
