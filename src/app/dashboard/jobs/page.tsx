"use client";

import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  Euro,
  Filter,
  Heart,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";

const filterOptions = [
  { label: "Alle types", value: "all" },
  { label: "Evenement", value: "evenement" },
  { label: "Object", value: "object" },
  { label: "Winkel", value: "winkel" },
  { label: "Horeca", value: "horeca" },
];

export default function JobsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  interface Job {
    id: string;
    titel: string;
    opdrachtgever?: {
      bedrijfsnaam: string;
    };
    locatie: string;
    tarief: number;
    startDatum: string;
    eindDatum: string;
    status: string;
    type: string;
    vereisten: string[];
    beschrijving: string;
    // Optional UI properties
    image?: string;
    distance?: string;
    isUrgent?: boolean;
    spotsRemaining?: number;
    applicantCount?: number;
    applicationStatus?: string;
  }
  interface Application {
    id: string;
    status: string;
    appliedAt: string;
    jobId: string;
    job: Job;
  }
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    if (!session) return;

    setLoadingJobs(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        type: selectedFilter,
        limit: "20",
      });

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data.jobs || []);
      } else {
        setError(data.error || "Failed to load jobs");
        toast.error("Kon jobs niet laden");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Network error");
      toast.error("Netwerkfout bij laden van jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplications = async () => {
    if (!session) return;

    setLoadingApplications(true);
    setError(null);
    try {
      const response = await fetch("/api/applications");
      const data = await response.json();
      if (data.success) {
        setApplications(data.data.applications || []);
      } else {
        setError(data.error || "Failed to load applications");
        toast.error("Kon sollicitaties niet laden");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError("Network error");
      toast.error("Netwerkfout bij laden van sollicitaties");
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    if (activeTab === "browse" && session) {
      fetchJobs();
    } else if (activeTab === "applications" && session) {
      fetchApplications();
    }
  }, [activeTab, session]);

  useEffect(() => {
    if (session && activeTab === "browse") {
      fetchJobs();
    }
  }, [session, activeTab]);

  const toggleFavorite = async (jobId: string) => {
    const isFavorited = favorites.includes(jobId);

    // Optimistic update
    setFavorites((prev) =>
      isFavorited ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );

    try {
      const response = await fetch(`/api/jobs/${jobId}/favorite`, {
        method: isFavorited ? "DELETE" : "POST",
      });

      if (!response.ok) {
        // Revert on failure
        setFavorites((prev) =>
          isFavorited ? [...prev, jobId] : prev.filter((id) => id !== jobId),
        );
        toast.error("Kon favoriet niet bijwerken");
      } else {
        toast.success(
          isFavorited
            ? "Verwijderd uit favorieten"
            : "Toegevoegd aan favorieten",
        );
      }
    } catch (_error) {
      // Revert on failure
      setFavorites((prev) =>
        isFavorited ? [...prev, jobId] : prev.filter((id) => id !== jobId),
      );
      toast.error("Netwerkfout bij bijwerken favoriet");
    }
  };

  const withdrawApplication = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Sollicitatie ingetrokken");
        fetchApplications(); // Refresh applications list
      } else {
        toast.error(data.error || "Kon sollicitatie niet intrekken");
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Netwerkfout bij intrekken sollicitatie");
    }
  };

  const filteredJobs = jobs; // Filtering is now done server-side

  return (
    <DashboardLayout
      title="Jobs & Sollicitaties"
      subtitle={
        activeTab === "browse"
          ? loadingJobs
            ? "Jobs laden..."
            : `${filteredJobs.length} jobs gevonden`
          : loadingApplications
            ? "Sollicitaties laden..."
            : `${applications.length} sollicitaties`
      }
    >
      <div className="p-4 space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Beschikbaar
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mijn Sollicitaties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek jobs op locatie, type of bedrijf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filterOptions.map((filter) => (
                <Button
                  key={filter.value}
                  variant={
                    selectedFilter === filter.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                  className="whitespace-nowrap flex-shrink-0"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Job Cards */}
            {loadingJobs ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-14" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Er ging iets mis</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchJobs} variant="outline">
                  Opnieuw proberen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const startDate = new Date(job.startDatum);
                  const endDate = new Date(job.eindDatum);
                  const startTime = startDate.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endTime = endDate.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <Card key={job.id} className="overflow-hidden">
                      {/* Job Image */}
                      <div className="relative h-48 w-full">
                        <Image
                          src={
                            job.image || "/images/jobs/default-beveiliging.jpg"
                          }
                          alt={job.titel}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Overlay Content */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          {job.isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          <div className="flex gap-2 ml-auto">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => toggleFavorite(job.id)}
                              className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites.includes(job.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-white"
                                }`}
                              />
                            </Button>
                          </div>
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="flex items-center gap-1 font-semibold text-lg mb-1">
                            <Euro className="h-4 w-4" />
                            <span>{job.tarief.toFixed(2)}/uur</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{job.locatie}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {startTime} - {endTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Job Content */}
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{job.titel}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.opdrachtgever?.bedrijfsnaam}{" "}
                            {job.distance && `• ${job.distance}`}
                          </p>
                        </div>

                        {/* Job Description */}
                        <p className="text-sm text-foreground">
                          {job.beschrijving}
                        </p>

                        {/* Requirements */}
                        {job.vereisten && job.vereisten.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.vereisten.map((req: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {req}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{job.spotsRemaining || 0} plekken over</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>{job.applicantCount || 0} sollicitanten</span>
                          </div>
                        </div>

                        {/* Application Status */}
                        {job.applicationStatus && (
                          <Badge
                            variant={
                              job.applicationStatus === "ACCEPTED"
                                ? "default"
                                : job.applicationStatus === "REJECTED"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="w-fit"
                          >
                            {job.applicationStatus === "ACCEPTED"
                              ? "Geaccepteerd"
                              : job.applicationStatus === "REJECTED"
                                ? "Afgewezen"
                                : job.applicationStatus === "PENDING"
                                  ? "In behandeling"
                                  : "In review"}
                          </Badge>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {job.applicationStatus === "ACCEPTED" ? (
                            <Button
                              className="flex-1"
                              size="sm"
                              onClick={() => router.push("/dashboard/shifts")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Bekijk in Shifts
                            </Button>
                          ) : job.applicationStatus ? (
                            <Button
                              className="flex-1"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/dashboard/jobs/${job.id}`)
                              }
                            >
                              Bekijk Status
                            </Button>
                          ) : (
                            <>
                              <Button
                                className="flex-1"
                                size="sm"
                                onClick={() =>
                                  router.push(`/dashboard/jobs/${job.id}`)
                                }
                                disabled={job.spotsRemaining === 0}
                              >
                                {job.spotsRemaining === 0
                                  ? "Vol"
                                  : "Solliciteren"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/dashboard/jobs/${job.id}`)
                                }
                              >
                                Details
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {!loadingJobs && !error && filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Geen jobs gevonden
                </h3>
                <p className="text-muted-foreground mb-4">
                  Probeer je zoekterm aan te passen of gebruik andere filters.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}
                  variant="outline"
                >
                  Filters wissen
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4 mt-4">
            {loadingApplications ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Sollicitaties laden...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nog geen sollicitaties
                </h3>
                <p className="text-muted-foreground mb-4">
                  Je hebt nog niet gesolliciteerd op opdrachten.
                </p>
                <Button onClick={() => setActiveTab("browse")}>
                  Bekijk beschikbare jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {application.job.titel}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {application.job.opdrachtgever?.bedrijfsnaam} •{" "}
                          {application.job.locatie}
                        </p>
                      </div>
                      <Badge
                        variant={
                          application.status === "ACCEPTED"
                            ? "success"
                            : application.status === "REJECTED"
                              ? "destructive"
                              : application.status === "PENDING"
                                ? "default"
                                : "secondary"
                        }
                      >
                        {application.status === "ACCEPTED"
                          ? "Geaccepteerd"
                          : application.status === "REJECTED"
                            ? "Afgewezen"
                            : application.status === "PENDING"
                              ? "In behandeling"
                              : "In review"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        <span>€{application.job.tarief}/uur</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(
                            application.job.startDatum,
                          ).toLocaleDateString("nl-NL")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {application.job.applicantCount || 0} sollicitanten
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          application.status === "ACCEPTED"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => {
                          if (application.status === "ACCEPTED") {
                            router.push("/dashboard/shifts");
                          } else {
                            router.push(`/dashboard/jobs/${application.jobId}`);
                          }
                        }}
                      >
                        {application.status === "ACCEPTED"
                          ? "Bekijk in Shifts"
                          : "Bekijk Details"}
                      </Button>
                      {application.status === "PENDING" && (
                        <ConfirmDialog
                          trigger={
                            <Button size="sm" variant="ghost">
                              Intrekken
                            </Button>
                          }
                          title="Sollicitatie intrekken"
                          description="Weet je zeker dat je deze sollicitatie wilt intrekken? Deze actie kan niet ongedaan worden gemaakt."
                          confirmText="Ja, intrekken"
                          cancelText="Annuleren"
                          variant="destructive"
                          onConfirm={() =>
                            withdrawApplication(application.jobId)
                          }
                        />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
