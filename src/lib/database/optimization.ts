import { type Prisma, PrismaClient } from "@prisma/client";
import { LRUCache } from "lru-cache";

// Cache configuration
const queryCache = new LRUCache<string, any>({
  max: 1000, // Maximum number of cached queries
  ttl: 1000 * 60 * 5, // 5 minutes TTL
  allowStale: false,
  updateAgeOnGet: false,
});

const statsCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 2, // 2 minutes for stats
  allowStale: true,
  updateAgeOnGet: true,
});

// Query performance monitoring
interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  cached: boolean;
  resultCount?: number;
}

const queryMetrics: QueryMetrics[] = [];

// Database connection pool optimization
export function createOptimizedPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "warn",
      },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

// Optimized query wrapper with caching
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  options: {
    ttl?: number;
    skipCache?: boolean;
    cacheable?: boolean;
  } = {},
): Promise<T> {
  const startTime = Date.now();
  let _fromCache = false;

  try {
    // Check cache first (unless explicitly skipped)
    if (!options.skipCache && options.cacheable !== false) {
      const cached = queryCache.get(cacheKey);
      if (cached !== undefined) {
        _fromCache = true;
        const duration = Date.now() - startTime;

        recordQueryMetric({
          query: cacheKey,
          duration,
          timestamp: new Date(),
          cached: true,
          resultCount: Array.isArray(cached) ? cached.length : 1,
        });

        return cached;
      }
    }

    // Execute query
    const result = await queryFn();
    const duration = Date.now() - startTime;

    // Cache the result (if cacheable and not explicitly skipped)
    if (options.cacheable !== false && !options.skipCache) {
      queryCache.set(cacheKey, result, {
        ttl: options.ttl,
      });
    }

    recordQueryMetric({
      query: cacheKey,
      duration,
      timestamp: new Date(),
      cached: false,
      resultCount: Array.isArray(result) ? result.length : 1,
    });

    return result;
  } catch (error) {
    console.error(`Query failed: ${cacheKey}`, error);
    throw error;
  }
}

// Optimized pagination with cursor-based approach
export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  orderBy?: Record<string, "asc" | "desc">;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    cursor?: string;
  };
}

export async function paginateQuery<T>(
  model: any,
  where: any,
  options: PaginationOptions,
  include?: any,
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20)); // Max 100 items per page
  const skip = (page - 1) * limit;

  // Use parallel queries for better performance
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy: options.orderBy || { createdAt: "desc" },
      skip,
      take: limit,
      ...(options.cursor ? { cursor: { id: options.cursor } } : {}),
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      cursor: data.length > 0 ? data[data.length - 1].id : undefined,
    },
  };
}

// Bedrijf-specific optimized queries
export class BedrijfQueryOptimizer {
  constructor(private prisma: PrismaClient) {}

  // Optimized opdrachten query with intelligent joins
  async getOpdrachtForBedrijf(
    bedrijfId: string,
    role: "leverancier" | "opdrachtgever",
    filters: {
      status?: string;
      page?: number;
      limit?: number;
      includeStats?: boolean;
    } = {},
  ) {
    const cacheKey = `bedrijf:${bedrijfId}:opdrachten:${role}:${JSON.stringify(filters)}`;

    return cachedQuery(
      cacheKey,
      async () => {
        const whereClause: Prisma.OpdrachtWhereInput = {};

        if (role === "opdrachtgever") {
          whereClause.creatorType = "BEDRIJF";
          whereClause.creatorBedrijfId = bedrijfId;
        } else {
          whereClause.OR = [
            {
              targetAudience: "ALLEEN_BEDRIJVEN",
              creatorType: "OPDRACHTGEVER",
            },
            {
              targetAudience: "BEIDEN",
              creatorType: "OPDRACHTGEVER",
            },
          ];
          whereClause.NOT = {
            creatorBedrijfId: bedrijfId,
          };
        }

        if (filters.status) {
          whereClause.status = filters.status as any;
        }

        // Use selective includes to reduce data transfer
        const include: Prisma.OpdrachtInclude = {
          opdrachtgever: {
            select: {
              bedrijfsnaam: true,
              contactpersoon: true,
            },
          },
          creatorBedrijf: {
            select: {
              bedrijfsnaam: true,
            },
          },
          _count: {
            select: {
              sollicitaties: true,
            },
          },
        };

        // Only include sollicitaties if needed
        if (filters.includeStats) {
          include.sollicitaties = {
            where: { bedrijfId: bedrijfId },
            take: 1,
            select: {
              id: true,
              status: true,
            },
          };
        }

        return paginateQuery(
          this.prisma.opdracht,
          whereClause,
          {
            page: filters.page,
            limit: filters.limit,
            orderBy: { createdAt: "desc" },
          },
          include,
        );
      },
      { ttl: 1000 * 60 * 2 }, // 2 minutes cache
    );
  }

  // Optimized planning query with team availability
  async getPlanningForBedrijf(
    bedrijfId: string,
    dateRange: { start: Date; end: Date },
  ) {
    const cacheKey = `bedrijf:${bedrijfId}:planning:${dateRange.start.toISOString()}:${dateRange.end.toISOString()}`;

    return cachedQuery(
      cacheKey,
      async () => {
        // Efficient query combining multiple related data
        const [activeOpdrachten, teamMembers] = await Promise.all([
          this.prisma.opdracht.findMany({
            where: {
              OR: [
                {
                  creatorType: "BEDRIJF",
                  creatorBedrijfId: bedrijfId,
                  status: { in: ["OPEN", "IN_PROGRESS", "ASSIGNED"] },
                },
                {
                  acceptedBedrijfId: bedrijfId,
                  status: { in: ["IN_PROGRESS", "ASSIGNED"] },
                },
              ],
              startDatum: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
            include: {
              sollicitaties: {
                where: { status: "ACCEPTED" },
                include: {
                  zzpProfile: {
                    select: {
                      id: true,
                      voornaam: true,
                      achternaam: true,
                      telefoon: true,
                      user: {
                        select: { email: true },
                      },
                    },
                  },
                },
              },
              opdrachtgever: {
                select: {
                  bedrijfsnaam: true,
                  contactpersoon: true,
                },
              },
            },
          }),

          // Get available team members efficiently
          this.prisma.$queryRaw`
            SELECT DISTINCT zp.id, zp.voornaam, zp.achternaam, zp.telefoon,
                   zp.specialisaties, zp.ervaring, u.email
            FROM "ZZPProfile" zp
            JOIN "User" u ON zp."userId" = u.id
            WHERE zp.id IN (
              SELECT DISTINCT s."zzpProfileId"
              FROM "Sollicitatie" s
              JOIN "Opdracht" o ON s."opdrachtId" = o.id
              WHERE (o."creatorBedrijfId" = ${bedrijfId} OR o."acceptedBedrijfId" = ${bedrijfId})
              AND s.status = 'ACCEPTED'
            )
          `,
        ]);

        return {
          activeOpdrachten,
          teamMembers,
        };
      },
      { ttl: 1000 * 60 * 3 }, // 3 minutes cache for planning
    );
  }

  // Optimized client data with aggregated statistics
  async getKlantenForBedrijf(
    bedrijfId: string,
    filters: {
      search?: string;
      status?: "active" | "inactive" | "all";
      page?: number;
      limit?: number;
    } = {},
  ) {
    const cacheKey = `bedrijf:${bedrijfId}:klanten:${JSON.stringify(filters)}`;

    return cachedQuery(
      cacheKey,
      async () => {
        // First get client IDs who have worked with this bedrijf
        const clientRelations = await this.prisma.opdracht.groupBy({
          by: ["opdrachtgeverId"],
          where: {
            OR: [
              {
                creatorType: "BEDRIJF",
                creatorBedrijfId: bedrijfId,
              },
              {
                acceptedBedrijfId: bedrijfId,
              },
            ],
            opdrachtgeverId: { not: null },
          },
          _count: {
            id: true,
          },
          _sum: {
            uurloon: true,
            aantalPersonen: true,
          },
        });

        if (clientRelations.length === 0) {
          return {
            klanten: [],
            stats: {
              totalKlanten: 0,
              activeKlanten: 0,
              totalRevenue: 0,
              averageOrderValue: 0,
            },
          };
        }

        const validClientIds = clientRelations
          .map((c) => c.opdrachtgeverId)
          .filter((id) => id !== null) as string[];

        // Build search conditions
        const searchConditions: Prisma.OpdrachtgeverWhereInput = {
          id: { in: validClientIds },
        };

        if (filters.search) {
          searchConditions.OR = [
            { bedrijfsnaam: { contains: filters.search, mode: "insensitive" } },
            {
              contactpersoon: { contains: filters.search, mode: "insensitive" },
            },
            {
              user: {
                email: { contains: filters.search, mode: "insensitive" },
              },
            },
          ];
        }

        // Efficient query with calculated fields
        const klanten = await this.prisma.opdrachtgever.findMany({
          where: searchConditions,
          include: {
            user: {
              select: {
                email: true,
                createdAt: true,
              },
            },
            opdrachten: {
              where: {
                OR: [
                  {
                    creatorType: "BEDRIJF",
                    creatorBedrijfId: bedrijfId,
                  },
                  {
                    acceptedBedrijfId: bedrijfId,
                  },
                ],
              },
              select: {
                id: true,
                titel: true,
                status: true,
                startDatum: true,
                uurloon: true,
                aantalPersonen: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 5, // Recent opdrachten preview
            },
          },
          take: filters.limit || 20,
          skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        });

        return {
          klanten,
          clientRelations, // Include aggregated stats
        };
      },
      { ttl: 1000 * 60 * 5 }, // 5 minutes cache for client data
    );
  }

  // Optimized dashboard stats with pre-calculated metrics
  async getDashboardStats(
    bedrijfId: string,
    period: "week" | "month" | "quarter" | "year" = "month",
  ) {
    const cacheKey = `bedrijf:${bedrijfId}:stats:${period}`;

    return (
      statsCache.get(cacheKey) ||
      (await cachedQuery(
        cacheKey,
        async () => {
          const now = new Date();
          const dateRanges = calculateDateRanges(now, period);

          // Use raw SQL for complex aggregations (better performance)
          const [currentStats, previousStats, statusBreakdown] =
            await Promise.all([
              this.prisma.$queryRaw`
            SELECT
              COUNT(*)::int as total_opdrachten,
              SUM("uurloon" * "aantalPersonen")::int as estimated_revenue,
              AVG("uurloon")::float as avg_hourly_rate
            FROM "Opdracht"
            WHERE (
              ("creatorType" = 'BEDRIJF' AND "creatorBedrijfId" = ${bedrijfId})
              OR "acceptedBedrijfId" = ${bedrijfId}
            )
            AND "createdAt" >= ${dateRanges.current.start}
            AND "createdAt" <= ${dateRanges.current.end}
          `,

              this.prisma.$queryRaw`
            SELECT
              COUNT(*)::int as total_opdrachten,
              SUM("uurloon" * "aantalPersonen")::int as estimated_revenue
            FROM "Opdracht"
            WHERE (
              ("creatorType" = 'BEDRIJF' AND "creatorBedrijfId" = ${bedrijfId})
              OR "acceptedBedrijfId" = ${bedrijfId}
            )
            AND "createdAt" >= ${dateRanges.previous.start}
            AND "createdAt" < ${dateRanges.previous.end}
          `,

              this.prisma.opdracht.groupBy({
                by: ["status"],
                where: {
                  OR: [
                    {
                      creatorType: "BEDRIJF",
                      creatorBedrijfId: bedrijfId,
                    },
                    {
                      acceptedBedrijfId: bedrijfId,
                    },
                  ],
                  createdAt: {
                    gte: dateRanges.current.start,
                    lte: dateRanges.current.end,
                  },
                },
                _count: { id: true },
              }),
            ]);

          return {
            currentStats: (currentStats as any)[0],
            previousStats: (previousStats as any)[0],
            statusBreakdown,
            period,
            generatedAt: new Date().toISOString(),
          };
        },
        { ttl: 1000 * 60 * 5 }, // 5 minutes for dashboard stats
      ))
    );
  }
}

// Helper functions
function calculateDateRanges(now: Date, period: string) {
  const ranges = {
    current: { start: new Date(), end: new Date() },
    previous: { start: new Date(), end: new Date() },
  };

  switch (period) {
    case "week":
      ranges.current.start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );
      ranges.current.end = now;
      ranges.previous.start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14,
      );
      ranges.previous.end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );
      break;
    case "quarter": {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      ranges.current.start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      ranges.current.end = now;
      ranges.previous.start = new Date(
        now.getFullYear(),
        (currentQuarter - 1) * 3,
        1,
      );
      ranges.previous.end = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    }
    case "year":
      ranges.current.start = new Date(now.getFullYear(), 0, 1);
      ranges.current.end = now;
      ranges.previous.start = new Date(now.getFullYear() - 1, 0, 1);
      ranges.previous.end = new Date(now.getFullYear(), 0, 1);
      break;
    default: // month
      ranges.current.start = new Date(now.getFullYear(), now.getMonth(), 1);
      ranges.current.end = now;
      ranges.previous.start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      ranges.previous.end = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return ranges;
}

function recordQueryMetric(metric: QueryMetrics) {
  queryMetrics.push(metric);

  // Keep only last 1000 metrics to prevent memory leak
  if (queryMetrics.length > 1000) {
    queryMetrics.splice(0, queryMetrics.length - 1000);
  }

  // Log slow queries
  if (metric.duration > 3000 && !metric.cached) {
    console.warn(
      `Slow database query: ${metric.query} took ${metric.duration}ms`,
    );
  }
}

// Cache management utilities
export function clearCache(pattern?: string) {
  if (pattern) {
    queryCache.forEach((_value, key) => {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    });
  } else {
    queryCache.clear();
  }
}

export function getCacheStats() {
  return {
    queryCache: {
      size: queryCache.size,
      calculatedSize: queryCache.calculatedSize,
      hits: queryCache.hits,
      misses: queryCache.misses,
    },
    statsCache: {
      size: statsCache.size,
      calculatedSize: statsCache.calculatedSize,
      hits: statsCache.hits,
      misses: statsCache.misses,
    },
    recentQueries: queryMetrics.slice(-10),
    slowQueries: queryMetrics
      .filter((m) => m.duration > 1000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10),
  };
}

export { queryCache, statsCache };
