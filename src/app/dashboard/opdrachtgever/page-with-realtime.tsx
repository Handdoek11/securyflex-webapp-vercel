"use client";

import { AlertTriangle, ArrowRight, Bell, Clock, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { OpdrachtgeverDashboardLayout } from "@/components/dashboard/OpdrachtgeverDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRealtimeBeveiligersPool } from "@/hooks/useRealtimeBeveiligersPool";
import {
  useRealtimeAlerts,
  useRealtimeNotifications,
} from "@/hooks/useRealtimeNotifications";
// Import real-time hooks
import {
  useRealtimeDashboardStats,
  useRealtimeMultipleShifts,
} from "@/hooks/useRealtimeShiftStatus";

export default function OpdrachtgeverDashboardPageWithRealtime() {
  const { data: session } = useSession();
  const opdrachtgeverId = session?.user?.id;

  // Real-time hooks
  const stats = useRealtimeDashboardStats(opdrachtgeverId);
  const { availability, isConnected: poolConnected } =
    useRealtimeBeveiligersPool();
  const { notifications, unreadCount, urgentCount, markAsRead } =
    useRealtimeNotifications(opdrachtgeverId);
  const { alerts, hasUrgentAlerts, criticalAlerts } =
    useRealtimeAlerts(opdrachtgeverId);

  // Track multiple active shifts
  const activeShiftIds = ["shift-1", "shift-2", "shift-3"]; // In real app, fetch from API
  const { statuses: shiftStatuses, isConnected: shiftsConnected } =
    useRealtimeMultipleShifts(activeShiftIds);

  // Company data enhanced with real-time stats
  const companyData = {
    bedrijfsnaam: session?.user?.name || "Schiphol Security B.V.",
    activeShifts: stats.activeShifts || 12,
    weeklyShifts: stats.weeklyShifts || 28,
    monthlyShifts: stats.monthlyShifts || 156,
    score: 4.7,
    urgentAlerts:
      alerts.shiftAlerts.filter((a) => a.requiresAction).length || 0,
  };

  // Convert real-time shift statuses to display format
  const activeShifts = Array.from(shiftStatuses.values()).map((status) => ({
    id: status.shiftId,
    title: `Shift ${status.shiftId}`,
    beveiligers: status.totalRequired,
    startTime: "14:00",
    endTime: "22:00",
    status: status.status,
    checkedIn: status.checkInsCount,
    total: status.totalRequired,
    startsIn: status.status === "STARTING_SOON" ? 45 : undefined,
    issues: status.issues,
  }));

  // Real-time activity from notifications
  const recentActivity = notifications.slice(0, 5).map((notification) => ({
    id: notification.id,
    type: notification.type === "ERROR" ? "INCIDENT" : "SUCCESS",
    time: new Date(notification.timestamp).toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    title: notification.title,
    description: notification.message,
    icon: notification.type === "ERROR" ? "🔴" : "✅",
  }));

  function getStatusBadge(status: string, _checkedIn: number, _total: number) {
    switch (status) {
      case "LIVE":
      case "ACTIVE":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Badge className="bg-green-500 hover:bg-green-600">Actief</Badge>
          </div>
        );
      case "STARTING_SOON":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <Badge className="bg-amber-500 hover:bg-amber-600">
              Start binnenkort
            </Badge>
          </div>
        );
      case "ISSUE":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <Badge className="bg-red-500 hover:bg-red-600">Probleem</Badge>
          </div>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <OpdrachtgeverDashboardLayout
      title="SecuryFlex"
      subtitle={`Welkom terug, ${companyData.bedrijfsnaam}`}
      headerActions={
        <div className="relative">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </Button>
        </div>
      }
    >
      <div className="p-4 space-y-6">
        {/* Connection Status */}
        {(poolConnected || shiftsConnected) && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live verbinding actief</span>
          </div>
        )}

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  KRITIEKE WAARSCHUWING
                </p>
                <p className="text-sm text-red-700">
                  {criticalAlerts[0].message}
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-red-700 hover:text-red-800"
                >
                  Direct actie ondernemen{" "}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Alert Banner */}
        {hasUrgentAlerts && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">ACTIE VEREIST</p>
                <p className="text-sm text-amber-700">
                  {companyData.urgentAlerts} shifts morgen nog niet gevuld
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-amber-700 hover:text-amber-800"
                >
                  Bekijk openstaande shifts{" "}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats Grid - Enhanced with real-time data */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {companyData.activeShifts}
            </p>
            <p className="text-xs text-muted-foreground">Actief</p>
            {shiftsConnected && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mt-1"></div>
            )}
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {companyData.weeklyShifts}
            </p>
            <p className="text-xs text-muted-foreground">Week</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {companyData.monthlyShifts}
            </p>
            <p className="text-xs text-muted-foreground">Maand</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {companyData.score}
            </p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </div>

        {/* Beveiliger Availability - Real-time */}
        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">BESCHIKBARE BEVEILIGERS</h3>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{availability.onlineCount} online</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {availability.availableNow.length}
              </p>
              <p className="text-xs text-muted-foreground">Nu beschikbaar</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {availability.availableSoon.length}
              </p>
              <p className="text-xs text-muted-foreground">Binnenkort</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">
                {availability.unavailable.length}
              </p>
              <p className="text-xs text-muted-foreground">Bezet</p>
            </div>
          </div>
        </Card>

        {/* Today Section with real-time shifts */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            VANDAAG -{" "}
            {new Date()
              .toLocaleDateString("nl-NL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
              .toUpperCase()}
          </h2>

          {/* Active Shifts with real-time status */}
          <Card className="p-4 border-green-200 bg-green-50/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-green-800">
                ACTIEVE SHIFTS (LIVE)
              </h3>
            </div>

            <div className="space-y-4">
              {activeShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="border-b border-green-200 last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{shift.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {shift.checkedIn}/{shift.total} ingecheckt
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {shift.startTime}-{shift.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(shift.status, shift.checkedIn, shift.total)}
                  </div>

                  {/* Real-time progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        shift.checkedIn === shift.total
                          ? "bg-green-500"
                          : shift.checkedIn > 0
                            ? "bg-amber-500"
                            : "bg-gray-300"
                      }`}
                      style={{
                        width: `${(shift.checkedIn / shift.total) * 100}%`,
                      }}
                    ></div>
                  </div>

                  {shift.issues && shift.issues.length > 0 && (
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700">
                        {shift.issues[0].description}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              Alle actieve shifts <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Card>
        </div>

        {/* Real-time notifications as activity feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">RECENTE MELDINGEN</h3>
            {urgentCount > 0 && (
              <Badge variant="destructive">{urgentCount} urgent</Badge>
            )}
          </div>
          <Card className="p-4">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.time}</span>
                      <span>-</span>
                      <span className="font-medium">{activity.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </OpdrachtgeverDashboardLayout>
  );
}
