"use client";

import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Euro,
  Heart,
  MapPin,
  Share2,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { jobToast, toast } from "@/components/ui/toast";

interface JobDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  company: {
    id: string;
    name: string;
    contactPerson?: string;
    description?: string;
    size?: string;
  };
  startDate: string;
  endDate: string;
  hourlyRate: number;
  spotsAvailable: number;
  spotsRemaining: number;
  applicantCount: number;
  applicationStatus: string | null;
  status: string;
  isUrgent: boolean;
  estimatedHours: number;
  estimatedEarnings: number;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [_showApplyModal, setShowApplyModal] = useState(false);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();

      if (data.success) {
        setJob(data.data);
      } else {
        console.error("Failed to fetch job details");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  const handleQuickApply = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quickApply: true,
          requestDirectPayment: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        if (job) {
          setJob({
            ...job,
            applicationStatus: data.data.status,
            applicantCount: job.applicantCount + 1,
          });
        }

        // Show success message
        if (data.data.status === "ACCEPTED") {
          jobToast.applicationAccepted();
          setTimeout(() => router.push("/dashboard/shifts"), 2000);
        } else {
          jobToast.applicationSent();
        }
      } else {
        toast.error(data.error || "Er ging iets mis bij het solliciteren");
      }
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("Er ging iets mis. Probeer het later opnieuw.");
    } finally {
      setApplying(false);
    }
  };

  const handleWithdrawApplication = async () => {
    if (!confirm("Weet je zeker dat je je sollicitatie wilt intrekken?")) {
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        if (job) {
          setJob({
            ...job,
            applicationStatus: null,
            applicantCount: job.applicantCount - 1,
          });
        }
        alert("Sollicitatie ingetrokken");
      } else {
        alert(data.error || "Er ging iets mis");
      }
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Er ging iets mis. Probeer het later opnieuw.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Laden..." showBackButton>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout title="Opdracht niet gevonden" showBackButton>
        <div className="p-4 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Deze opdracht bestaat niet of is verwijderd.
          </p>
          <Button className="mt-4" onClick={() => router.back()}>
            Terug naar overzicht
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getApplicationButton = () => {
    if (job.applicationStatus === "ACCEPTED") {
      return (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.push("/dashboard/shifts")}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Geaccepteerd - Bekijk in Shifts
        </Button>
      );
    }

    if (
      job.applicationStatus === "PENDING" ||
      job.applicationStatus === "REVIEWING"
    ) {
      return (
        <>
          <Button className="w-full" disabled variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Sollicitatie in behandeling
          </Button>
          <Button
            variant="ghost"
            className="w-full mt-2"
            onClick={handleWithdrawApplication}
            disabled={applying}
          >
            Sollicitatie intrekken
          </Button>
        </>
      );
    }

    if (job.applicationStatus === "REJECTED") {
      return (
        <Button className="w-full" disabled variant="outline">
          <AlertCircle className="h-4 w-4 mr-2" />
          Helaas afgewezen
        </Button>
      );
    }

    // Not applied yet
    if (job.spotsRemaining === 0) {
      return (
        <Button className="w-full" disabled>
          Vol - Geen plekken meer
        </Button>
      );
    }

    return (
      <>
        <Button
          className="w-full"
          onClick={handleQuickApply}
          disabled={applying}
        >
          {applying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Bezig...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Direct Solliciteren
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => setShowApplyModal(true)}
        >
          Uitgebreid Solliciteren
        </Button>
      </>
    );
  };

  return (
    <DashboardLayout
      title={job.title}
      subtitle={job.company.name}
      showBackButton
      headerActions={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      }
    >
      <div className="p-4 space-y-4">
        {/* Status badges */}
        {(job.isUrgent || job.applicationStatus) && (
          <div className="flex gap-2 flex-wrap">
            {job.isUrgent && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Urgent - Start binnenkort
              </Badge>
            )}
            {job.applicationStatus && (
              <Badge
                variant={
                  job.applicationStatus === "ACCEPTED"
                    ? "default"
                    : job.applicationStatus === "REJECTED"
                      ? "destructive"
                      : "default"
                }
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
          </div>
        )}

        {/* Key details card */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">
                €{job.hourlyRate.toFixed(2)}
              </span>
              <span className="text-muted-foreground">per uur</span>
            </div>
            {job.estimatedEarnings && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Geschat inkomen</p>
                <p className="font-semibold">
                  €{job.estimatedEarnings.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {new Date(job.startDate).toLocaleDateString("nl-NL", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Startdatum</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {new Date(job.startDate).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(job.endDate).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.estimatedHours} uur
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{job.location}</p>
                <p className="text-xs text-muted-foreground">Locatie</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {job.spotsRemaining} / {job.spotsAvailable}
                </p>
                <p className="text-xs text-muted-foreground">
                  Plekken beschikbaar
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Omschrijving</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {job.description}
          </p>
        </Card>

        {/* Company info */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Over {job.company.name}
          </h3>
          {job.company.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {job.company.description}
            </p>
          )}
          <div className="space-y-2">
            {job.company.contactPerson && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Contactpersoon: {job.company.contactPerson}</span>
              </div>
            )}
            {job.company.size && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{job.company.size} medewerkers</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.6 / 5.0 (23 reviews)</span>
            </div>
          </div>
        </Card>

        {/* Competition indicator */}
        {job.applicantCount > 0 && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="text-sm">
                <span className="font-medium">
                  {job.applicantCount} beveiligers
                </span>{" "}
                hebben al gesolliciteerd
              </p>
            </div>
          </Card>
        )}

        {/* Finqle Direct Payment */}
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">
                Finqle Direct Payment beschikbaar
              </p>
              <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                Ontvang je salaris binnen 24 uur na goedkeuring werkuren
              </p>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="sticky bottom-20 bg-background pt-2">
          {getApplicationButton()}
        </div>
      </div>
    </DashboardLayout>
  );
}
