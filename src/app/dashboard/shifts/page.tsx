"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { GPSTracker } from "@/components/ui/gps-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gpsToast, toast } from "@/components/ui/toast";

function getStatusBadge(status: string) {
  switch (status) {
    case "BEVESTIGD":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Bevestigd</Badge>
      );
    case "WACHTEN":
      return <Badge variant="secondary">Wachten op bevestiging</Badge>;
    case "ACTIEF":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Actief</Badge>;
    case "VOLTOOID":
      return <Badge className="bg-gray-500 hover:bg-gray-600">Voltooid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function ShiftsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("aankomend");
  const [shifts, setShifts] = useState({
    aankomend: [],
    actief: [],
    historie: [],
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clockingIn, setClockingIn] = useState<string | null>(null);
  const [clockingOut, setClockingOut] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchShifts();
    }
  }, [session, fetchShifts]);

  const fetchShifts = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/shifts");
      const data = await response.json();

      if (data.success) {
        setShifts(
          data.data.shifts || { aankomend: [], actief: [], historie: [] },
        );
        setStats(data.data.stats);
      } else {
        setError(data.error || "Failed to load shifts");
        toast.error("Kon shifts niet laden");
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setError("Network error");
      toast.error("Netwerkfout bij laden van shifts");
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (
    shiftId: string,
    location: { lat: number; lng: number; accuracy: number },
  ) => {
    setClockingIn(shiftId);
    try {
      const response = await fetch("/api/werkuren/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opdrachtId: shiftId,
          locatie: location,
          foto: null, // Could add camera integration
        }),
      });

      const data = await response.json();

      if (data.success) {
        gpsToast.clockInSuccess();
        await fetchShifts(); // Refresh to show active status
        setActiveTab("actief"); // Switch to active tab
      } else {
        toast.error(data.error || "Kon niet inchecken");
      }
    } catch (error) {
      console.error("Clock-in error:", error);
      toast.error("Netwerkfout bij inchecken");
    } finally {
      setClockingIn(null);
    }
  };

  const handleClockOut = async (
    werkuurId: string,
    location: { lat: number; lng: number; accuracy: number },
  ) => {
    setClockingOut(werkuurId);
    try {
      const response = await fetch(`/api/werkuren/${werkuurId}/clock-out`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locatie: location,
          foto: null, // Could add camera integration
          pauzetijd: 0, // Could add break tracking
          opmerkingen: "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        gpsToast.clockOutSuccess();

        // Show work summary
        const summary = data.data.workSummary;
        toast.success(
          `Shift voltooid! ${summary.workedHours}u gewerkt. €${summary.netEarnings.toFixed(2)} verdiend.`,
          { duration: 6000 },
        );

        await fetchShifts(); // Refresh to show completed status
        setActiveTab("historie"); // Switch to history tab
      } else {
        toast.error(data.error || "Kon niet uitchecken");
      }
    } catch (error) {
      console.error("Clock-out error:", error);
      toast.error("Netwerkfout bij uitchecken");
    } finally {
      setClockingOut(null);
    }
  };

  return (
    <DashboardLayout
      title="Mijn Shifts"
      subtitle={
        loading
          ? "Shifts laden..."
          : stats
            ? `${stats.totalShifts} shifts • €${stats.totalEarningsThisWeek.toFixed(2)} deze week`
            : "Overzicht van je werkroosters"
      }
    >
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Er ging iets mis</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchShifts} variant="outline">
              Opnieuw proberen
            </Button>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="aankomend" className="text-sm">
                Aankomend
                <Badge variant="secondary" className="ml-2 text-xs">
                  {shifts.aankomend.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="actief" className="text-sm">
                Actief
                <Badge variant="secondary" className="ml-2 text-xs">
                  {shifts.actief.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="historie" className="text-sm">
                Historie
                <Badge variant="secondary" className="ml-2 text-xs">
                  {shifts.historie.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="aankomend" className="space-y-4">
              {shifts.aankomend.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Geen aankomende shifts
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Je hebt momenteel geen geplande shifts.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/jobs")}
                    variant="outline"
                  >
                    Zoek nieuwe opdrachten
                  </Button>
                </div>
              ) : (
                shifts.aankomend.map((shift: any) => {
                  const shiftDate = new Date(shift.date);
                  const isClockingIn = clockingIn === shift.id;

                  return (
                    <Card key={shift.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {shift.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {shift.company}
                          </p>
                          {getStatusBadge(shift.status)}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            €{shift.hourlyRate?.toFixed(2)}/uur
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ~€{shift.estimatedEarnings?.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {shiftDate.toLocaleDateString("nl-NL", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{shift.address}</span>
                        </div>
                      </div>

                      {shift.instructions && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                            Instructies:
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {shift.instructions}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {shift.contactPerson} - {shift.contactPhone}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {shift.canClockIn ? (
                          <GPSTracker
                            onLocationUpdate={(location) =>
                              handleClockIn(shift.id, location)
                            }
                            onError={(error) =>
                              toast.error(`GPS fout: ${error}`)
                            }
                            requiredAccuracy={100}
                            className="flex-1"
                          >
                            <Button
                              className="w-full"
                              size="sm"
                              disabled={isClockingIn}
                            >
                              {isClockingIn ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Inchecken...
                                </>
                              ) : (
                                <>
                                  <LogIn className="h-4 w-4 mr-2" />
                                  Inchecken
                                </>
                              )}
                            </Button>
                          </GPSTracker>
                        ) : (
                          <Button
                            className="flex-1"
                            size="sm"
                            variant="outline"
                            disabled
                          >
                            Nog niet beschikbaar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `https://maps.google.com/maps?daddr=${encodeURIComponent(shift.address)}`;
                            window.open(url, "_blank");
                          }}
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="actief" className="space-y-4">
              {shifts.actief.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Geen actieve shifts
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Je bent momenteel niet ingecheckt voor een shift.
                  </p>
                  <Button
                    onClick={() => setActiveTab("aankomend")}
                    variant="outline"
                  >
                    Bekijk aankomende shifts
                  </Button>
                </div>
              ) : (
                shifts.actief.map((shift: any) => {
                  const isClockingOut = clockingOut === shift.werkuurId;
                  const shiftDate = new Date(shift.date);

                  return (
                    <Card
                      key={shift.id}
                      className="p-4 space-y-4 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {shift.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {shift.company}
                          </p>
                          {getStatusBadge(shift.status)}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Ingecheckt om
                          </p>
                          <p className="font-semibold">{shift.checkedInAt}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ~{shift.hoursWorked?.toFixed(1)}u gewerkt
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {shiftDate.toDateString() ===
                            new Date().toDateString()
                              ? "Vandaag"
                              : shiftDate.toLocaleDateString("nl-NL", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{shift.address}</span>
                        </div>
                      </div>

                      {/* Live earnings counter */}
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Huidige verdiensten:
                          </span>
                          <span className="font-semibold text-green-900 dark:text-green-100">
                            ~€{shift.currentEarnings?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>

                      {shift.instructions && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                            Instructies:
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {shift.instructions}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {shift.contactPerson} - {shift.contactPhone}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <ConfirmDialog
                          trigger={
                            <GPSTracker
                              onLocationUpdate={(location) =>
                                handleClockOut(shift.werkuurId, location)
                              }
                              onError={(error) =>
                                toast.error(`GPS fout: ${error}`)
                              }
                              requiredAccuracy={150}
                              className="flex-1"
                            >
                              <Button
                                variant="destructive"
                                className="w-full"
                                size="sm"
                                disabled={isClockingOut}
                              >
                                {isClockingOut ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uitchecken...
                                  </>
                                ) : (
                                  <>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Uitchecken
                                  </>
                                )}
                              </Button>
                            </GPSTracker>
                          }
                          title="Shift beëindigen"
                          description={`Weet je zeker dat je wilt uitchecken voor ${shift.title}? Je huidige werktijd wordt geregistreerd.`}
                          confirmText="Ja, uitchecken"
                          cancelText="Annuleren"
                          variant="destructive"
                          onConfirm={() => {}} // GPS tracker handles the actual action
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`tel:${shift.contactPhone}`, "_self");
                          }}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="historie" className="space-y-4">
              {shifts.historie.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nog geen voltooide shifts
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Je voltooide shifts verschijnen hier na het uitchecken.
                  </p>
                  <Button
                    onClick={() => setActiveTab("aankomend")}
                    variant="outline"
                  >
                    Bekijk aankomende shifts
                  </Button>
                </div>
              ) : (
                shifts.historie.map((shift: any) => {
                  const shiftDate = new Date(shift.date);

                  return (
                    <Card key={shift.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {shift.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {shift.company}
                          </p>
                          {getStatusBadge(shift.status)}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            €{shift.totalEarned?.toFixed(2) || "0.00"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shift.hoursWorked?.toFixed(1) || 0} uur
                          </p>
                          {shift.paymentStatus && (
                            <Badge
                              variant={
                                shift.paymentStatus === "PAID"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs mt-1"
                            >
                              {shift.paymentStatus === "PAID"
                                ? "Betaald"
                                : "In behandeling"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {shiftDate.toLocaleDateString("nl-NL", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                      </div>

                      {/* Rating display */}
                      {shift.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Beoordeling:
                          </span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < shift.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({shift.rating}/5)
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/shifts/${shift.id}`)
                          }
                        >
                          Details bekijken
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Factuur
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
