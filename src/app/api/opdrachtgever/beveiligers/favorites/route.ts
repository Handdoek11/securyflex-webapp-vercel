import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Schema for managing favorites
const favoriteSchema = z.object({
  beveiligerId: z.string().min(1, "Beveiliger ID is required"),
  action: z.enum(["add", "remove"]),
});

// POST /api/opdrachtgever/beveiligers/favorites - Add/Remove favorite
export async function POST(request: NextRequest) {
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
      select: { id: true, bedrijfsnaam: true },
    });

    if (!opdrachtgeverProfile) {
      return NextResponse.json(
        { success: false, error: "Opdrachtgever profile not found" },
        { status: 404 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { beveiligerId, action } = favoriteSchema.parse(body);

    try {
      // Verify beveiliger exists
      const beveiliger = await prisma.zZPProfile.findUnique({
        where: { id: beveiligerId },
        include: {
          user: {
            select: {
              name: true,
              status: true,
            },
          },
        },
      });

      if (!beveiliger) {
        return NextResponse.json(
          { success: false, error: "Beveiliger not found" },
          { status: 404 },
        );
      }

      if (beveiliger.user.status !== "ACTIVE") {
        return NextResponse.json(
          { success: false, error: "Beveiliger is not active" },
          { status: 400 },
        );
      }

      // Check if favorite already exists
      const existingFavorite = await prisma.opdrachtgeverFavoriet.findUnique({
        where: {
          opdrachtgeverId_beveiligerId: {
            opdrachtgeverId: opdrachtgeverProfile.id,
            beveiligerId: beveiligerId,
          },
        },
      });

      if (action === "add") {
        if (existingFavorite) {
          return NextResponse.json(
            { success: false, error: "Beveiliger is already in favorites" },
            { status: 400 },
          );
        }

        // Add to favorites
        const newFavorite = await prisma.opdrachtgeverFavoriet.create({
          data: {
            opdrachtgeverId: opdrachtgeverProfile.id,
            beveiligerId: beveiligerId,
          },
          include: {
            beveiliger: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        console.log(
          `Beveiliger ${beveiligerId} added to favorites by opdrachtgever ${opdrachtgeverProfile.id}`,
        );

        return NextResponse.json({
          success: true,
          data: newFavorite,
          message: `${beveiliger.user.name} toegevoegd aan favorieten`,
        });
      } else if (action === "remove") {
        if (!existingFavorite) {
          return NextResponse.json(
            { success: false, error: "Beveiliger is not in favorites" },
            { status: 400 },
          );
        }

        // Remove from favorites
        await prisma.opdrachtgeverFavoriet.delete({
          where: {
            opdrachtgeverId_beveiligerId: {
              opdrachtgeverId: opdrachtgeverProfile.id,
              beveiligerId: beveiligerId,
            },
          },
        });

        console.log(
          `Beveiliger ${beveiligerId} removed from favorites by opdrachtgever ${opdrachtgeverProfile.id}`,
        );

        return NextResponse.json({
          success: true,
          message: `${beveiliger.user.name} verwijderd uit favorieten`,
        });
      }
    } catch (dbError) {
      console.error("Database error managing favorites:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to update favorites" },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Favorites management error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to manage favorites" },
      { status: 500 },
    );
  }
}

// GET /api/opdrachtgever/beveiligers/favorites - Get favorites list
export async function GET(_request: NextRequest) {
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
      select: { id: true },
    });

    if (!opdrachtgeverProfile) {
      return NextResponse.json(
        { success: false, error: "Opdrachtgever profile not found" },
        { status: 404 },
      );
    }

    try {
      // Get all favorites with beveiliger details
      const favorites = await prisma.opdrachtgeverFavoriet.findMany({
        where: {
          opdrachtgeverId: opdrachtgeverProfile.id,
        },
        include: {
          beveiliger: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                  image: true,
                },
              },
              // Get recent work with this opdrachtgever
              werkuren: {
                where: {
                  opdracht: {
                    opdrachtgeverId: opdrachtgeverProfile.id,
                  },
                },
                orderBy: {
                  datum: "desc",
                },
                take: 3,
                include: {
                  opdracht: {
                    select: {
                      titel: true,
                      datum: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform favorites data
      const transformedFavorites = await Promise.all(
        favorites.map(async (favorite) => {
          const beveiliger = favorite.beveiliger;

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

          return {
            id: beveiliger.id,
            name: beveiliger.user.name,
            email: beveiliger.user.email,
            phone: beveiliger.user.phone,
            image: beveiliger.user.image,
            rating: Number(beveiliger.rating) || 0,
            totalReviews: beveiliger.totalReviews,
            specialisaties: beveiliger.specialisaties,
            certificaten: beveiliger.certificaten,
            uurtarief: Number(beveiliger.uurtarief),
            isAvailable,
            availabilityText: isAvailable ? "Beschikbaar nu" : "Bezet vandaag",
            recentWork: beveiliger.werkuren.map((wu) => ({
              title: wu.opdracht.titel,
              date: wu.opdracht.datum,
              hours: wu.urenGewerkt,
            })),
            addedToFavoritesAt: favorite.createdAt,
          };
        }),
      );

      return NextResponse.json({
        success: true,
        data: {
          favorites: transformedFavorites,
          count: transformedFavorites.length,
        },
      });
    } catch (dbError) {
      console.error("Database error fetching favorites:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch favorites" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get favorites" },
      { status: 500 },
    );
  }
}
