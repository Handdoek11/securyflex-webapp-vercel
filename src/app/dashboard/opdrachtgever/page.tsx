"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Calendar,
  BarChart3,
  Plus,
  ArrowRight,
  Activity,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OpdrachtgeverDashboardLayout } from "@/components/dashboard/OpdrachtgeverDashboardLayout";
import { useOpdrachtgeverStats, useOpdrachtgeverShifts, useOpdrachtgeverNotifications } from "@/hooks/useApiData";
import { useOpdrachtgeverDashboardBroadcast, useOpdrachtgeverNotificationsBroadcast } from "@/hooks/useRealtimeBroadcast";
import { useSession } from "next-auth/react";
import Link from "next/link";

const mockActiveShifts = [
  {
    id: "1",
    title: "Terminal 3 - Objectbeveiliging",
    beveiligers: 4,
    startTime: "06:00",
    endTime: "14:00",
    status: "ACTIVE",
    checkedIn: 4,
    total: 4,
  },
  {
    id: "2",
    title: "Gates B - Toegangscontrole",
    beveiligers: 2,
    startTime: "14:00",
    endTime: "22:00",
    status: "STARTING_SOON",
    checkedIn: 0,
    total: 2,
    startsIn: 45,
  }
];

const mockWeekData = [
  { day: "Ma 16/09", shifts: 12, filled: 12, percentage: 100 },
  { day: "Di 17/09", shifts: 10, filled: 8, percentage: 80 },
  { day: "Wo 18/09", shifts: 0, filled: 0, percentage: 0 },
  { day: "Do 19/09", shifts: 6, filled: 4, percentage: 67 },
  { day: "Vr 20/09", shifts: 12, filled: 10, percentage: 83 },
];

const mockRecentActivity = [
  {
    id: "1",
    type: "INCIDENT",
    time: "12:45",
    title: "Incident Terminal 2",
    description: "Jan de Vries heeft een incident gerapporteerd",
    icon: "🔴",
  },
  {
    id: "2",
    type: "SUCCESS",
    time: "11:30",
    title: "Shift gevuld",
    description: "Zaterdagavond shift is volledig bemand (4/4 beveiligers)",
    icon: "✅",
  }
];

function getStatusBadge(status: string, checkedIn: number, total: number) {
  switch (status) {
    case "ACTIVE":
    case "ACTIEF":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Badge className="bg-green-500 hover:bg-green-600">Actief</Badge>
        </div>
      );
    case "STARTING_SOON":
    case "BEVESTIGD":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <Badge className="bg-amber-500 hover:bg-amber-600">Start binnenkort</Badge>
        </div>
      );
    case "OPEN":
    case "GEPUBLICEERD":
      return <Badge variant="outline">Open</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function RecentNotifications() {
  const { data: notificationsData, loading } = useOpdrachtgeverNotifications({
    limit: 5
  });

  const notifications = notificationsData?.notifications || [];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Geen recente meldingen</p>
        <p className="text-xs">Nieuwe meldingen verschijnen hier</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification: any) => (
        <div key={notification.id} className="flex items-start gap-3">
          <span className="text-lg">{notification.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{notification.title}</span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{notification.timeAgo}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OpdrachtgeverDashboardPage() {
  const { data: session } = useSession();

  // Fetch real data using hooks
  const { data: statsData, loading: statsLoading, error: statsError, refetch: refetchStats } = useOpdrachtgeverStats();
  const { data: activeShiftsData, loading: shiftsLoading, refetch: refetchActiveShifts } = useOpdrachtgeverShifts({
    status: "active",
    limit: 5
  });
  const { data: openShiftsData, refetch: refetchOpenShifts } = useOpdrachtgeverShifts({
    status: "open",
    limit: 10
  });

  const profile = statsData?.profile;
  const stats = statsData?.stats;
  const activeShifts = activeShiftsData?.shifts || [];
  const openShifts = openShiftsData?.shifts || [];

  // Real-time updates for dashboard stats
  useOpdrachtgeverDashboardBroadcast(
    profile?.id || "",
    () => {
      // Refetch stats when any relevant changes occur
      refetchStats();
      refetchActiveShifts();
      refetchOpenShifts();
    }
  );

  const urgentShifts = openShifts.filter(shift => shift.isUrgent || shift.needsAttention);

  if (statsLoading) {
    return (
      <OpdrachtgeverDashboardLayout
        title="SecuryFlex"
        subtitle="Dashboard wordt geladen..."
      >
        <div className="p-4 space-y-6">
          {/* Loading skeleton */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-3">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-12" />
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </OpdrachtgeverDashboardLayout>
    );
  }

  return (
    <OpdrachtgeverDashboardLayout
      title="SecuryFlex"
      subtitle={`Welkom terug, ${profile?.bedrijfsnaam || "Opdrachtgever"}`}
    >
      <div className="p-4 space-y-6">
        {/* Alert Banner */}
        {urgentShifts.length > 0 && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">ACTIE VEREIST</p>
                <p className="text-sm text-amber-700">
                  {urgentShifts.length} {urgentShifts.length === 1 ? 'shift' : 'shifts'} hebben urgent aandacht nodig
                </p>
                <Link href="/dashboard/opdrachtgever/shifts?tab=open">
                  <Button variant="link" className="p-0 h-auto text-amber-700 hover:text-amber-800">
                    Bekijk openstaande shifts <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.activeShifts || 0}</p>
            <p className="text-xs text-muted-foreground">Actief</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.weeklyShifts || 0}</p>
            <p className="text-xs text-muted-foreground">Week</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.monthlyShifts || 0}</p>
            <p className="text-xs text-muted-foreground">Maand</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.avgRating?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </div>

        {/* Today Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            VANDAAG - {new Date().toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            }).toUpperCase()}
          </h2>

          {/* Active Shifts */}
          <Card className="p-4 border-green-200 bg-green-50/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-green-800">ACTIEVE SHIFTS</h3>
            </div>

            <div className="space-y-4">
              {shiftsLoading ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="border-b border-green-200 last:border-0 pb-4 last:pb-0">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : activeShifts.length > 0 ? (
                activeShifts.map((shift: any) => (
                  <div key={shift.id} className="border-b border-green-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{shift.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{shift.requiredBeveiligers} beveiligers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{shift.startTime}-{shift.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{shift.location}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(shift.status, shift.filled, shift.requiredBeveiligers)}
                    </div>

                    {shift.isActive && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-700">
                          {shift.acceptedBeveiliger ?
                            `${shift.acceptedBeveiliger.name} is actief` :
                            "Shift is actief"
                          }
                        </span>
                      </div>
                    )}

                    {shift.status === "BEVESTIGD" && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-700">
                          Start vandaag om {shift.startTime}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Geen actieve shifts vandaag</p>
                  <Link href="/dashboard/opdrachtgever/shifts/nieuwe">
                    <Button variant="outline" size="sm" className="mt-2">
                      Plan nieuwe shift
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/dashboard/opdrachtgever/shifts?tab=active">
              <Button variant="outline" className="w-full mt-4">
                Alle actieve shifts <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">QUICK ACTIONS</h3>

          {/* Emergency Button */}
          <Link href="/dashboard/opdrachtgever/shifts/nieuwe?urgent=true">
            <Button
              className="w-full mb-4 h-14 bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              <div className="text-center">
                <div className="font-semibold">🚨 SPOED BEVEILIGER NODIG</div>
                <div className="text-sm opacity-90">Direct een beveiliger</div>
              </div>
            </Button>
          </Link>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/opdrachtgever/shifts/nieuwe">
              <Button variant="default" className="h-12 w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Plan Shift
              </Button>
            </Link>
            <Link href="/dashboard/opdrachtgever/analytics">
              <Button variant="default" className="h-12 w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Rapportage
              </Button>
            </Link>
          </div>
        </div>

        {/* Week Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">DEZE WEEK OVERZICHT</h3>
            <div className="text-sm text-muted-foreground">
              {stats?.weeklyShifts || 0} totaal shifts
            </div>
          </div>
          <Card className="p-4">
            <div className="space-y-3">
              {mockWeekData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-20">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          day.percentage === 100 ? 'bg-green-500' :
                          day.percentage > 50 ? 'bg-blue-500' :
                          day.percentage > 0 ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${day.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-right w-16">
                    {day.shifts > 0 ? `${day.shifts} shifts` : '0 geplanned'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">RECENTE MELDINGEN</h3>
            <Link href="/dashboard/opdrachtgever/notifications">
              <Button variant="outline" size="sm">
                Alle meldingen
              </Button>
            </Link>
          </div>
          <Card className="p-4">
            <RecentNotifications />
          </Card>
        </div>
      </div>
    </OpdrachtgeverDashboardLayout>
  );
}