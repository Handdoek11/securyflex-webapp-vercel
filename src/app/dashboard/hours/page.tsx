"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react";
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
import { dashboardToast, toast } from "@/components/ui/toast";

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-xs">
          Voltooid
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className="text-xs">
          In behandeling
        </Badge>
      );
    case "UNDER_REVIEW":
      return (
        <Badge variant="outline" className="text-xs">
          In review
        </Badge>
      );
    case "DISPUTED":
      return (
        <Badge variant="destructive" className="text-xs">
          Betwist
        </Badge>
      );
    default:
      return null;
  }
}

interface TimeEntry {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  hours: number;
  status: string;
  project: string;
  description: string;
  dayName?: string;
  company?: string;
  isGPSVerified?: boolean;
  totalHours?: number;
  breakTime?: number;
  hourlyRate?: number;
  totalEarned?: number;
  location?: string;
}

export default function HoursPage() {
  const { data: session } = useSession();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [_editingEntry, setEditingEntry] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalHours: 0,
    totalEarnings: 0,
    approvedEarnings: 0,
    pendingEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [submittingWeek, setSubmittingWeek] = useState(false);
  const [_showAddHours, setShowAddHours] = useState(false);

  useEffect(() => {
    if (session) {
      fetchHours();
    }
  }, [session, currentWeek]);

  const getWeekBounds = (date: Date) => {
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  const formatWeekRange = (date: Date) => {
    const { monday, sunday } = getWeekBounds(date);
    return `${monday.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} - ${sunday.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`;
  };

  const fetchHours = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);
    try {
      const { monday, sunday } = getWeekBounds(currentWeek);
      const params = new URLSearchParams({
        weekStart: monday.toISOString(),
        weekEnd: sunday.toISOString(),
      });

      const response = await fetch(`/api/hours?${params}`);
      const data = await response.json();

      if (data.success) {
        setTimeEntries(data.data.timeEntries || []);
        setWeeklyStats(
          data.data.weeklyStats || {
            totalHours: 0,
            totalEarnings: 0,
            approvedEarnings: 0,
            pendingEarnings: 0,
          },
        );
      } else {
        setError(data.error || "Failed to load hours");
        dashboardToast.dataLoadError();
      }
    } catch (error) {
      console.error("Error fetching hours:", error);
      setError("Network error");
      dashboardToast.dataLoadError();
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === "prev" ? -7 : 7));
    setCurrentWeek(newDate);
  };

  const submitWeek = async () => {
    setSubmittingWeek(true);
    try {
      const { monday, sunday } = getWeekBounds(currentWeek);
      const response = await fetch("/api/hours/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: monday.toISOString(),
          weekEnd: sunday.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        dashboardToast.hoursSubmitted();
        await fetchHours(); // Refresh data
      } else {
        dashboardToast.hoursSubmitError();
      }
    } catch (error) {
      console.error("Week submission error:", error);
      dashboardToast.hoursSubmitError();
    } finally {
      setSubmittingWeek(false);
    }
  };

  return (
    <PageErrorBoundary>
      <DashboardLayout
        title="Mijn Uren"
        subtitle={`Week ${formatWeekRange(currentWeek)}`}
      >
        <div className="p-4 space-y-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
              Vorige
            </Button>

            <h2 className="font-semibold">
              Week {formatWeekRange(currentWeek)}
            </h2>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
            >
              Volgende
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week Summary */}
          {loading ? (
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
                <div>
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
                <div>
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {weeklyStats.totalHours.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Totaal uren</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    €{weeklyStats.totalEarnings.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Totaal verdiensten
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    €{weeklyStats.approvedEarnings.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Goedgekeurd</p>
                </div>
              </div>
            </Card>
          )}

          {/* Time Entries */}
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <Card key={entry.id} className="p-4">
                {entry.status === "EMPTY" ? (
                  // Empty day - show add button
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="font-medium text-sm">
                          {entry.dayName || "Day"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString("nl-NL", {
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Geen uren ingevoerd
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Uren toevoegen
                    </Button>
                  </div>
                ) : (
                  // Day with hours
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="font-medium text-sm text-primary">
                            {entry.dayName || "Day"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {entry.project}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.company || "Company"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {entry.startTime} - {entry.endTime}
                              </span>
                            </div>
                            {entry.isGPSVerified && (
                              <Badge variant="secondary" className="text-xs">
                                GPS ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(entry.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEntry(entry.id)}
                          className="p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Hours breakdown */}
                    <div className="grid grid-cols-4 gap-4 text-sm bg-muted/30 rounded-lg p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Gewerkte uren
                        </p>
                        <p className="font-medium">{entry.totalHours || 0}u</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pauze</p>
                        <p className="font-medium">{entry.breakTime || 0}min</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Uurtarief
                        </p>
                        <p className="font-medium">€{entry.hourlyRate || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Totaal</p>
                        <p className="font-medium text-green-600">
                          €{(entry.totalEarned || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {entry.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{entry.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => setShowAddHours(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Handmatig toevoegen
            </Button>
            <Button
              variant="outline"
              onClick={submitWeek}
              disabled={
                submittingWeek ||
                timeEntries.filter((e) => e.status !== "EMPTY").length === 0
              }
            >
              {submittingWeek ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Indienen...
                </>
              ) : (
                "Week indienen"
              )}
            </Button>
          </div>

          {/* Help text */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                💡
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Automatische GPS-registratie
                </p>
                <p className="text-sm text-blue-700">
                  Uren met GPS-verificatie worden automatisch goedgekeurd.
                  Handmatig ingevoerde uren kunnen extra controle vereisen.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </PageErrorBoundary>
  );
}
