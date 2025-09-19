"use client";

import {
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Euro,
  MapPin,
  Percent,
  Shield,
  Star,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ComponentErrorBoundary,
  PageErrorBoundary,
} from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

interface DashboardStats {
  thisWeek?: { hours: number; earnings: number; shifts: number };
  thisMonth?: { hours: number; earnings: number; shifts: number };
  total?: { hours: number; earnings: number; shifts: number; rating: number };
  subscription?: { status: string };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  time: string;
  status: string;
  amount?: number;
}

interface Shift {
  id: string;
  title: string;
  company: string;
  location: string;
  date: Date | string;
  startTime: string;
  hourlyRate: number;
  estimatedEarnings: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showInsurancePromo, setShowInsurancePromo] = useState(true);

  const fetchDashboardData = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch all dashboard data in parallel
      const [statsRes, shiftsRes, hoursRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/shifts?status=aankomend&limit=3"),
        fetch("/api/hours"),
      ]);

      const [statsData, shiftsData, hoursData] = await Promise.all([
        statsRes.json(),
        shiftsRes.json(),
        hoursRes.json(),
      ]);

      if (statsData.success) {
        setStats(statsData.data);
        // Check subscription status for insurance promo
        setHasActiveSubscription(
          statsData.data?.subscription?.status === "active",
        );

        // Check if user has already dismissed the promo
        const promoDismissed = localStorage.getItem("insurancePromoDismissed");
        if (promoDismissed) {
          setShowInsurancePromo(false);
        }
      }

      if (shiftsData.success) {
        setUpcomingShifts(shiftsData.data.shifts.aankomend || []);
      }

      // Create recent activity from various sources
      const activity: Activity[] = [];
      if (hoursData.success && hoursData.data.timeEntries) {
        const recentEntries = hoursData.data.timeEntries
          .filter(
            (entry: unknown) =>
              typeof entry === "object" &&
              entry !== null &&
              "status" in entry &&
              (entry as { status: string }).status !== "EMPTY",
          )
          .slice(0, 3);

        recentEntries.forEach((entry: unknown) => {
          if (
            typeof entry === "object" &&
            entry !== null &&
            "id" in entry &&
            "totalHours" in entry &&
            "company" in entry
          ) {
            const validEntry = entry as {
              id: string;
              totalHours: number;
              company: string;
              project?: string;
              date: string;
              status: string;
              totalEarned?: number;
            };

            activity.push({
              id: `hour-${validEntry.id}`,
              type: "WORK_LOGGED",
              title: `${validEntry.totalHours}u gewerkt bij ${validEntry.company}`,
              subtitle: validEntry.project,
              time: new Date(validEntry.date).toLocaleDateString("nl-NL"),
              status: validEntry.status,
              amount: validEntry.totalEarned,
            });
          }
        });
      }

      setRecentActivity(activity);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setError("Netwerkfout bij laden van dashboard");
      toast.error("Kon dashboard niet laden");

      // Set mock data for development
      setStats({
        thisWeek: { hours: 32.5, earnings: 780.5, shifts: 4 },
        thisMonth: { hours: 124.5, earnings: 2985.75, shifts: 15 },
        total: { hours: 890.5, earnings: 21456.25, shifts: 156, rating: 4.8 },
      });

      setUpcomingShifts([
        {
          id: "1",
          title: "Evenementbeveiliging - Concert",
          company: "SecureEvents BV",
          location: "Amsterdam",
          date: new Date("2025-09-20T18:00:00Z"),
          startTime: "18:00",
          hourlyRate: 28.5,
          estimatedEarnings: 228,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const dismissInsurancePromo = () => {
    setShowInsurancePromo(false);
    localStorage.setItem("insurancePromoDismissed", "true");
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Overzicht van je werkzaamheden"
      >
        <div className="p-4 space-y-6">
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </Card>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-3 border rounded">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <PageErrorBoundary>
      <DashboardLayout
        title="Dashboard"
        subtitle="Overzicht van je werkzaamheden"
      >
        <div className="p-4 space-y-6">
          {/* Insurance Promo Banner - Only show if subscription active and not dismissed */}
          {hasActiveSubscription && showInsurancePromo && (
            <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative p-6">
                {/* Dismiss button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={dismissInsurancePromo}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                    <Shield className="h-8 w-8" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                        NIEUW
                      </Badge>
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0">
                        EXCLUSIEF
                      </Badge>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold mb-2">
                      Verzekeringen met korting voor SecuryFlex leden
                    </h2>

                    <p className="text-white/90 mb-4 max-w-2xl">
                      Als SecuryFlex lid krijg je exclusieve kortingen op
                      verzekeringen en pensioenregelingen. Tot 25% korting op
                      beroepsaansprakelijkheid en meer!
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link href="/dashboard/verzekeringen">
                        <Button
                          size="lg"
                          className="bg-white text-blue-600 hover:bg-white/90"
                        >
                          Bekijk verzekeringen
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>

                      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg">
                        <Percent className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          Code: SECURYFLEX25
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <ComponentErrorBoundary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Deze week</p>
                    <p className="text-2xl font-bold">
                      {stats?.thisWeek?.hours || 0}u
                    </p>
                    <p className="text-xs text-green-600">
                      €{stats?.thisWeek?.earnings?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Deze maand</p>
                    <p className="text-2xl font-bold">
                      €{stats?.thisMonth?.earnings?.toFixed(0) || "0"}
                    </p>
                    <p className="text-xs text-blue-600">
                      {stats?.thisMonth?.hours || 0} uren
                    </p>
                  </div>
                  <Euro className="h-8 w-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Totaal shifts
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.total?.shifts || 0}
                    </p>
                    <p className="text-xs text-purple-600">
                      {stats?.total?.hours || 0} uren
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Beoordeling</p>
                    <p className="text-2xl font-bold">
                      {stats?.total?.rating || "4.8"}
                    </p>
                    <p className="text-xs text-yellow-600">Gemiddeld</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </Card>
            </div>
          </ComponentErrorBoundary>

          <ComponentErrorBoundary>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recente activiteit</h3>
                  <Link href="/dashboard/hours">
                    <Button variant="outline" size="sm">
                      Bekijk alles
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.subtitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            €{activity.amount?.toFixed(2) || "0.00"}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {activity.status === "PENDING"
                              ? "Wachtend"
                              : activity.status === "COMPLETED"
                                ? "Voltooid"
                                : activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nog geen recente activiteit</p>
                      <p className="text-xs">
                        Start je eerste shift om activiteit te zien
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Upcoming Shifts */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Aankomende shifts</h3>
                  <Link href="/dashboard/shifts">
                    <Button variant="outline" size="sm">
                      Bekijk alles
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {upcomingShifts.length > 0 ? (
                    upcomingShifts.map((shift) => (
                      <div key={shift.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {shift.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {shift.company}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            €{shift.estimatedEarnings}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(shift.date).toLocaleDateString("nl-NL")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{shift.startTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{shift.location}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Geen aankomende shifts</p>
                      <Link href="/dashboard/jobs">
                        <Button variant="outline" size="sm" className="mt-2">
                          Zoek nieuwe jobs
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </ComponentErrorBoundary>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Snelle acties</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/dashboard/jobs">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Zoek jobs
                </Button>
              </Link>
              <Link href="/dashboard/shifts">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Mijn shifts
                </Button>
              </Link>
              <Link href="/dashboard/hours">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Uren invoeren
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Profiel
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </PageErrorBoundary>
  );
}
