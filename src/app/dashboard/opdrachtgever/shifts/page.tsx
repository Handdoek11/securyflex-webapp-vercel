"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  Filter,
  MapPin,
  Plus,
  Search,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { OpdrachtgeverDashboardLayout } from "@/components/dashboard/OpdrachtgeverDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpdrachtgeverShifts } from "@/hooks/useApiData";
import { useOpdrachtgeverOwnShiftsBroadcast } from "@/hooks/useRealtimeBroadcast";

const _mockShifts = {
  open: [
    {
      id: "1",
      title: "Terminal 1 - Nachtdienst",
      location: "Schiphol Airport",
      date: "2025-09-17",
      startTime: "22:00",
      endTime: "06:00",
      filled: 2,
      required: 3,
      hourlyRate: 22.5,
      isUrgent: true,
      requirements: ["VCA Basis", "Engels B1+"],
      status: "OPEN",
    },
    {
      id: "2",
      title: "Cargo Area - Mobiele surveillance",
      location: "Schiphol Cargo",
      date: "2025-09-20",
      startTime: "14:00",
      endTime: "22:00",
      filled: 0,
      required: 2,
      hourlyRate: 19.5,
      isUrgent: false,
      requirements: ["WPBR vergunning"],
      status: "OPEN",
    },
  ],
  active: [
    {
      id: "3",
      title: "Terminal 3 - Objectbeveiliging",
      location: "Schiphol Airport",
      date: "2025-09-16",
      startTime: "06:00",
      endTime: "14:00",
      team: [
        { name: "Jan de Vries", checkedInAt: "06:03", status: "ACTIVE" },
        { name: "Maria Jansen", checkedInAt: "06:01", status: "ACTIVE" },
        { name: "Peter Smit", checkedInAt: "06:00", status: "ACTIVE" },
        { name: "Ahmed K.", checkedInAt: "06:02", status: "ACTIVE" },
      ],
      status: "LIVE",
      endTimeRemaining: "2 uur 15 min",
    },
    {
      id: "4",
      title: "Gates B - Toegangscontrole",
      location: "Schiphol Airport",
      date: "2025-09-16",
      startTime: "14:00",
      endTime: "22:00",
      team: [
        { name: "Tom Peters", checkedInAt: "14:00", status: "ACTIVE" },
        {
          name: "Lisa Admin",
          checkedInAt: null,
          status: "LATE",
          minutesLate: 15,
        },
      ],
      status: "ISSUE",
      issue: "Lisa Admin 15 min te laat",
    },
  ],
  history: [
    {
      id: "5",
      title: "Terminal 3 - Objectbeveiliging",
      location: "Schiphol Airport",
      date: "2025-09-15",
      startTime: "06:00",
      endTime: "14:00",
      beveiligers: 4,
      status: "COMPLETED",
      totalCost: 896.0,
      rating: 5,
      feedback: "Uitstekend",
    },
    {
      id: "6",
      title: "Cargo Area - Surveillance",
      location: "Schiphol Cargo",
      date: "2025-09-14",
      startTime: "22:00",
      endTime: "06:00",
      beveiligers: 2,
      status: "COMPLETED",
      totalCost: 456.0,
      rating: 4,
      feedback: "Goed",
      note: "1 beveiliger 10 min laat",
    },
    {
      id: "7",
      title: "Gates B - Toegangscontrole",
      location: "Schiphol Airport",
      date: "2025-09-12",
      beveiligers: 2,
      status: "CANCELLED",
      totalCost: 0.0,
      reason: "Technische storing",
    },
  ],
};

function getStatusBadge(status: string, isUrgent?: boolean) {
  if (isUrgent) {
    return <Badge className="bg-red-500 hover:bg-red-600">🚨 Urgent</Badge>;
  }

  switch (status) {
    case "LIVE":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Badge className="bg-green-500 hover:bg-green-600">⚡ Live</Badge>
        </div>
      );
    case "ISSUE":
      return <Badge className="bg-amber-500 hover:bg-amber-600">⚠️ Issue</Badge>;
    case "COMPLETED":
      return (
        <Badge className="bg-gray-500 hover:bg-gray-600">✅ Voltooid</Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">❌ Geannuleerd</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function OpdrachtgeverShiftsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "open";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data for each tab using real API calls
  const {
    data: openShiftsData,
    loading: openLoading,
    refetch: refetchOpen,
  } = useOpdrachtgeverShifts({
    status: "open",
    page: 1,
    limit: 20,
  });

  const {
    data: activeShiftsData,
    loading: activeLoading,
    refetch: refetchActive,
  } = useOpdrachtgeverShifts({
    status: "active",
    page: 1,
    limit: 20,
  });

  const {
    data: historyShiftsData,
    loading: historyLoading,
    refetch: refetchHistory,
  } = useOpdrachtgeverShifts({
    status: "completed",
    page: 1,
    limit: 20,
  });

  // Get shift counts
  const openShifts = openShiftsData?.shifts || [];
  const activeShifts = activeShiftsData?.shifts || [];
  const historyShifts = historyShiftsData?.shifts || [];

  const openCount = openShiftsData?.pagination?.total || 0;
  const activeCount = activeShiftsData?.pagination?.total || 0;
  const historyCount = historyShiftsData?.pagination?.total || 0;

  // Real-time updates for shifts
  useOpdrachtgeverOwnShiftsBroadcast(
    session?.user?.id || "", // Use user ID instead of opdrachtgever ID for now
    (_shift, eventType) => {
      // Refetch appropriate data based on the event type
      refetchOpen();
      refetchActive();
      if (eventType === "OPDRACHT_STATUS_CHANGED") {
        refetchHistory();
      }
    },
  );

  // Set initial tab from URL params
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <OpdrachtgeverDashboardLayout
      title="Shifts Beheer"
      subtitle="Overzicht van alle shifts"
    >
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="open" className="text-sm">
              Open
              <Badge variant="secondary" className="ml-2 text-xs">
                {openCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="text-sm">
              Actief
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              Historie
              <Badge variant="secondary" className="ml-2 text-xs">
                {historyCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Search & Filter Bar */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek of filter shifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3 mr-1" />
                Datum ▼
              </Button>
              <Button variant="outline" size="sm">
                Locatie ▼
              </Button>
              <Button variant="outline" size="sm">
                Status ▼
              </Button>
            </div>
          </div>

          {/* Open Shifts Tab */}
          <TabsContent value="open" className="space-y-4">
            <h3 className="font-semibold text-lg">OPENSTAANDE SHIFTS</h3>

            {openLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-40 mb-4" />
                    <Skeleton className="h-2 w-full mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : openShifts.length > 0 ? (
              openShifts.map((shift: any) => (
                <Card
                  key={shift.id}
                  className={`p-4 ${shift.isUrgent || shift.needsAttention ? "border-amber-500 border-2" : ""}`}
                >
                  {(shift.isUrgent || shift.needsAttention) && (
                    <div className="bg-amber-500 text-white px-3 py-1 rounded-t-lg -mx-4 -mt-4 mb-4">
                      <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        {shift.isUrgent ? "URGENT" : "AANDACHT VEREIST"}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{shift.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{shift.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(shift.date).toLocaleDateString(
                                "nl-NL",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                },
                              )}{" "}
                              • {shift.startTime}-{shift.endTime}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>
                              Gevuld: {shift.filled}/{shift.requiredBeveiligers}{" "}
                              beveiligers
                            </span>
                            <span>
                              {Math.round(
                                (shift.filled / shift.requiredBeveiligers) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                shift.filled === shift.requiredBeveiligers
                                  ? "bg-green-500"
                                  : shift.filled > 0
                                    ? "bg-amber-500"
                                    : "bg-gray-300"
                              }`}
                              style={{
                                width: `${(shift.filled / shift.requiredBeveiligers) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {shift.requirements &&
                          shift.requirements.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">
                                Vereisten:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {shift.requirements.map(
                                  (req: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {req}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <Euro className="h-4 w-4" />
                          <span>
                            €{shift.hourlyRate?.toFixed(2) || "0.00"}/uur
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(shift.status, shift.isUrgent)}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button className="flex-1" size="sm">
                        Bekijk sollicitaties ({shift.applications || 0})
                      </Button>
                      <Link
                        href={`/dashboard/opdrachtgever/shifts/${shift.id}`}
                      >
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-semibold mb-2">
                  Geen openstaande shifts
                </h4>
                <p className="mb-4">
                  Maak je eerste shift aan om beveiligers te vinden
                </p>
                <Link href="/dashboard/opdrachtgever/shifts/nieuwe">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe shift aanmaken
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Active Shifts Tab */}
          <TabsContent value="active" className="space-y-4">
            <h3 className="font-semibold text-lg">ACTIEVE SHIFTS</h3>

            {activeLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-40 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : activeShifts.length > 0 ? (
              activeShifts.map((shift: any) => (
                <Card
                  key={shift.id}
                  className={`p-4 ${shift.isActive ? "border-green-500 border-2" : "border-amber-500 border-2"}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{shift.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{shift.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{shift.requiredBeveiligers} beveiligers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {shift.startTime}-{shift.endTime}
                            </span>
                          </div>
                        </div>

                        {shift.isActive && (
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-700">
                              Shift is actief
                            </span>
                          </div>
                        )}

                        {shift.acceptedBeveiliger && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Beveiliger:</p>
                            <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <span>• {shift.acceptedBeveiliger.name}</span>
                              <span className="text-green-600">Actief</span>
                            </div>
                          </div>
                        )}

                        {shift.workHours && shift.workHours.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">
                              Werkuren:
                            </p>
                            <div className="text-sm text-muted-foreground">
                              {shift.workHours.length} uren ingevoerd
                            </div>
                          </div>
                        )}
                      </div>
                      {getStatusBadge(shift.status)}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Link
                        href={`/dashboard/opdrachtgever/shifts/${shift.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full" size="sm">
                          Live tracking
                        </Button>
                      </Link>
                      {shift.acceptedBeveiliger && (
                        <Button variant="outline" size="sm">
                          Contact beveiliger
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-semibold mb-2">
                  Geen actieve shifts
                </h4>
                <p className="mb-4">Je hebt momenteel geen actieve shifts</p>
                <Link href="/dashboard/opdrachtgever/shifts?tab=open">
                  <Button variant="outline">Bekijk openstaande shifts</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">SHIFT HISTORIE</h3>
              {historyShiftsData?.pagination?.total && (
                <div className="text-sm text-muted-foreground">
                  {historyShiftsData.pagination.total} voltooide shifts
                </div>
              )}
            </div>

            {historyLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-16 mb-1" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : historyShifts.length > 0 ? (
              historyShifts.map((shift: any) => (
                <Card key={shift.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{shift.title}</h4>
                      <div className="text-sm text-muted-foreground mb-2">
                        {new Date(shift.date).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • {shift.startTime}-{shift.endTime}
                        {shift.acceptedBeveiliger &&
                          ` • ${shift.acceptedBeveiliger.name}`}
                      </div>

                      {shift.feedback && shift.feedback.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>Rating:</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (shift.feedback[0]?.ratingBeveiliger || 0)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          {shift.feedback[0]?.commentaarBeveiliger && (
                            <span>
                              "{shift.feedback[0].commentaarBeveiliger}"
                            </span>
                          )}
                        </div>
                      )}

                      {shift.workHours && shift.workHours.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Werkuren:{" "}
                          {shift.workHours
                            .reduce(
                              (total: number, wh: any) =>
                                total + (wh.urenGewerkt || 0),
                              0,
                            )
                            .toFixed(1)}
                          u
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      {getStatusBadge(shift.status)}
                      {shift.budget && (
                        <div className="text-sm font-semibold text-green-600 mt-1">
                          € {shift.budget.toFixed(2)} {shift.isCompleted && "✓"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t mt-3">
                    <Link
                      href={`/dashboard/opdrachtgever/shifts/${shift.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full" size="sm">
                        Details bekijken
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      {shift.isCompleted ? "Factuur" : "Info"}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-semibold mb-2">
                  Geen shift historie
                </h4>
                <p className="mb-4">Je hebt nog geen voltooide shifts</p>
                <Link href="/dashboard/opdrachtgever/shifts?tab=open">
                  <Button variant="outline">Bekijk openstaande shifts</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40">
          <Link href="/dashboard/opdrachtgever/shifts/nieuwe">
            <Button
              className="w-80 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              NIEUWE SHIFT AANMAKEN
            </Button>
          </Link>
        </div>
      </div>
    </OpdrachtgeverDashboardLayout>
  );
}
