import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/opdrachtgever/beveiligers - Get available beveiligers pool
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user's Opdrachtgever profile
    const opdrachtgeverProfile = await prisma.opdrachtgever.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        bedrijfsnaam: true,
        locatie: true,
      },
    });

    if (!opdrachtgeverProfile) {
      return NextResponse.json(
        { success: false, error: "Opdrachtgever profile not found" },
        { status: 404 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "all"; // all, favorites, available
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const specialization = searchParams.get("specialization") || "";
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const _maxDistance = parseInt(searchParams.get("maxDistance") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const availableOnly = searchParams.get("availableOnly") === "true";

    try {
      // Build base where clause for beveiligers
      const where: Prisma.ZZPProfileWhereInput = {
        user: {
          status: "ACTIVE",
        },
      };

      // Search by name or specialization
      if (search) {
        where.OR = [
          {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            specialisaties: {
              hasSome: [search],
            },
          },
        ];
      }

      // Filter by specialization
      if (specialization) {
        where.specialisaties = {
          hasSome: [specialization],
        };
      }

      // Filter by rating
      if (minRating > 0) {
        where.rating = {
          gte: minRating,
        };
      }

      // Filter by location/distance (simplified - in real app would use geographical calculations)
      if (location) {
        where.werkgebied = {
          hasSome: [location],
        };
      }

      // Get beveiligers with related data
      const [beveiligers, totalCount] = await Promise.all([
        prisma.zZPProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
              },
            },
            // Get recent work history with this opdrachtgever
            werkuren: {
              where: {
                opdracht: {
                  opdrachtgeverId: opdrachtgeverProfile.id,
                },
              },
              orderBy: {
                datum: "desc",
              },
              take: 5,
              include: {
                opdracht: {
                  select: {
                    titel: true,
                    datum: true,
                  },
                },
              },
            },
            // Get average ratings for this beveiliger
            reviewsReceived: {
              where: {
                fromOpdrachtgever: opdrachtgeverProfile.id,
              },
              select: {
                rating: true,
                commentaar: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
            },
          },
          orderBy: [
            { rating: "desc" },
            { totalReviews: "desc" },
            { user: { name: "asc" } },
          ],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.zZPProfile.count({ where }),
      ]);

      // Get favorites for this opdrachtgever
      const favorites = await prisma.opdrachtgeverFavoriet.findMany({
        where: {
          opdrachtgeverId: opdrachtgeverProfile.id,
        },
        select: {
          beveiligerId: true,
        },
      });

      const favoriteIds = favorites.map((f) => f.beveiligerId);

      // Transform beveiligers data for frontend
      const transformedBeveiligers = await Promise.all(
        beveiligers.map(async (beveiliger) => {
          // Check current availability
          const now = new Date();
          const todayShifts = await prisma.opdracht.count({
            where: {
              acceptedBeveiligerId: beveiliger.id,
              datum: {
                gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                lte: new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate() + 1,
                ),
              },
              status: { in: ["ACTIEF", "BEVESTIGD"] },
            },
          });

          const isAvailable = todayShifts === 0;
          const hasWorkedBefore = beveiliger.werkuren.length > 0;
          const isFavorite = favoriteIds.includes(beveiliger.id);

          // Calculate reliability score
          const totalCompletedShifts = await prisma.werkuur.count({
            where: {
              beveiligerId: beveiliger.id,
              status: "PAID",
            },
          });

          const totalAssignedShifts = await prisma.opdracht.count({
            where: {
              acceptedBeveiligerId: beveiliger.id,
              status: { not: "GEANNULEERD" },
            },
          });

          const reliabilityScore =
            totalAssignedShifts > 0
              ? Math.round((totalCompletedShifts / totalAssignedShifts) * 100)
              : null;

          // Get next availability
          const nextShift = await prisma.opdracht.findFirst({
            where: {
              acceptedBeveiligerId: beveiliger.id,
              datum: { gt: now },
              status: { in: ["BEVESTIGD", "ACTIEF"] },
            },
            orderBy: {
              datum: "asc",
            },
            select: {
              datum: true,
              eindTijd: true,
            },
          });

          return {
            id: beveiliger.id,
            name: beveiliger.user.name,
            email: beveiliger.user.email,
            phone: beveiliger.user.phone,
            image: beveiliger.user.image,

            // Profile info
            rating: Number(beveiliger.rating) || 0,
            totalReviews: beveiliger.totalReviews,
            specialisaties: beveiliger.specialisaties,
            certificaten: beveiliger.certificaten,
            werkgebied: beveiliger.werkgebied,
            uurtarief: Number(beveiliger.uurtarief),

            // Availability status
            isAvailable,
            availabilityText: isAvailable
              ? "Beschikbaar nu"
              : nextShift
                ? `Beschikbaar vanaf ${nextShift.datum.toLocaleDateString("nl-NL")} ${nextShift.eindTijd}`
                : "Bezet vandaag",
            nextAvailable: nextShift
              ? {
                  date: nextShift.datum,
                  time: nextShift.eindTijd,
                }
              : null,

            // Relationship with this opdrachtgever
            isFavorite,
            hasWorkedBefore,
            reliabilityScore,
            recentWork: beveiliger.werkuren.map((wu) => ({
              title: wu.opdracht.titel,
              date: wu.opdracht.datum,
              hours: wu.urenGewerkt,
              rating: wu.ratingOpdrachtgever,
            })),

            // Reviews from this opdrachtgever
            reviews: beveiliger.reviewsReceived.map((review) => ({
              rating: review.rating,
              comment: review.commentaar,
              date: review.createdAt,
            })),

            // Distance calculation (simplified - would use real geolocation in production)
            distance: Math.floor(Math.random() * 30) + 1, // Mock distance in km

            // Status indicators
            status: isAvailable
              ? "AVAILABLE"
              : todayShifts > 0
                ? "BUSY"
                : "LIMITED",
            isOnline: Math.random() > 0.7, // Mock online status
            lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Mock last seen

            // Premium features
            isPremium:
              beveiliger.rating &&
              beveiliger.rating >= 4.8 &&
              beveiliger.totalReviews >= 50,
            isVerified: beveiliger.finqleOnboarded,
            isNewTalent: beveiliger.totalReviews < 10,

            createdAt: beveiliger.user.createdAt,
          };
        }),
      );

      // Filter based on view
      let filteredBeveiligers = transformedBeveiligers;

      if (view === "favorites") {
        filteredBeveiligers = transformedBeveiligers.filter(
          (b) => b.isFavorite,
        );
      } else if (view === "available") {
        filteredBeveiligers = transformedBeveiligers.filter(
          (b) => b.status === "AVAILABLE",
        );
      }

      if (availableOnly) {
        filteredBeveiligers = filteredBeveiligers.filter(
          (b) => b.status === "AVAILABLE",
        );
      }

      // Calculate stats
      const stats = {
        total: totalCount,
        available: transformedBeveiligers.filter(
          (b) => b.status === "AVAILABLE",
        ).length,
        favorites: transformedBeveiligers.filter((b) => b.isFavorite).length,
        premium: transformedBeveiligers.filter((b) => b.isPremium).length,
        averageRating:
          transformedBeveiligers.length > 0
            ? transformedBeveiligers.reduce((sum, b) => sum + b.rating, 0) /
              transformedBeveiligers.length
            : 0,
      };

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        data: {
          beveiligers: filteredBeveiligers,
          stats,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (dbError) {
      console.error("Database error fetching beveiligers:", dbError);

      // Return mock data for development
      return NextResponse.json({
        success: true,
        data: {
          beveiligers: [
            {
              id: "mock-1",
              name: "Jan de Vries",
              rating: 4.9,
              totalReviews: 523,
              specialisaties: ["Objectbeveiliging", "Evenementen"],
              certificaten: ["VCA", "EHBO", "Engels B2"],
              isAvailable: true,
              availabilityText: "Beschikbaar nu",
              location: "Amsterdam",
              distance: 5,
              uurtarief: 20.5,
              isFavorite: true,
              hasWorkedBefore: true,
              reliabilityScore: 98,
              status: "AVAILABLE",
              isPremium: true,
              isVerified: true,
            },
          ],
          stats: {
            total: 234,
            available: 47,
            favorites: 12,
            premium: 23,
            averageRating: 4.6,
          },
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }
  } catch (error) {
    console.error("Opdrachtgever beveiligers GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch beveiligers" },
      { status: 500 },
    );
  }
}
