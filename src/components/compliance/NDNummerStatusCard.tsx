"use client";

import {
  AlertTriangleIcon,
  CalendarIcon,
  ExternalLinkIcon,
  FileTextIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface NDNummerStatusCardProps {
  profileType: "ZZP" | "BEDRIJF";
  onVerify?: () => void;
  onRenew?: () => void;
  className?: string;
}

interface NDNummerStatus {
  profile: {
    id: string;
    ndNummer: string | null;
    ndNummerStatus: string | null;
    ndNummerVervalDatum: string | null;
    ndNummerLaatsteControle: string | null;
    ndNummerOpmerking: string | null;
  };
  compliance: {
    isCompliant: boolean;
    isExpiringSoon: boolean;
    isExpired: boolean;
    daysUntilExpiry: number | null;
    requiresRenewal: boolean;
    canAcceptJobs: boolean;
  };
  auditHistory: Array<{
    id: string;
    action: string;
    previousStatus: string | null;
    newStatus: string;
    verificationSource: string | null;
    createdAt: string;
    complianceNotes: string | null;
  }>;
}

const statusConfig = {
  NIET_GEREGISTREERD: {
    label: "Niet geregistreerd",
    color: "bg-gray-500",
    icon: XCircleIcon,
    variant: "secondary" as const,
  },
  AANGEVRAAGD: {
    label: "Aangevraagd",
    color: "bg-blue-500",
    icon: RefreshCwIcon,
    variant: "default" as const,
  },
  PENDING_VERIFICATIE: {
    label: "Wacht op verificatie",
    color: "bg-yellow-500",
    icon: RefreshCwIcon,
    variant: "secondary" as const,
  },
  ACTIEF: {
    label: "Actief",
    color: "bg-green-500",
    icon: ShieldCheckIcon,
    variant: "default" as const,
  },
  VERLOPEN: {
    label: "Verlopen",
    color: "bg-red-500",
    icon: XCircleIcon,
    variant: "destructive" as const,
  },
  INGETROKKEN: {
    label: "Ingetrokken",
    color: "bg-red-600",
    icon: XCircleIcon,
    variant: "destructive" as const,
  },
  GESCHORST: {
    label: "Geschorst",
    color: "bg-orange-500",
    icon: AlertTriangleIcon,
    variant: "destructive" as const,
  },
  GEWEIGERD: {
    label: "Geweigerd",
    color: "bg-red-600",
    icon: XCircleIcon,
    variant: "destructive" as const,
  },
};

export function NDNummerStatusCard({
  profileType,
  onVerify,
  onRenew,
  className,
}: NDNummerStatusCardProps) {
  const [status, setStatus] = useState<NDNummerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/compliance/nd-nummer/validate?profileType=${profileType}`,
      );

      if (!response.ok) {
        throw new Error("Status ophalen mislukt");
      }

      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Status fetch error:", error);
      toast.error("Kon ND-nummer status niet ophalen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!status?.profile.ndNummer) {
      toast.error("Geen ND-nummer geregistreerd");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch("/api/compliance/nd-nummer/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ndNummer: status.profile.ndNummer,
          profileType,
        }),
      });

      if (!response.ok) {
        throw new Error("Verificatie mislukt");
      }

      const _result = await response.json();
      toast.success("ND-nummer geverifieerd!");

      // Refresh status
      await fetchStatus();

      if (onVerify) {
        onVerify();
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verificatie mislukt");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">Fout bij laden</CardTitle>
          <CardDescription>
            ND-nummer status kon niet worden geladen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchStatus} variant="outline">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { profile, compliance } = status;
  const statusInfo = profile.ndNummerStatus
    ? statusConfig[profile.ndNummerStatus]
    : statusConfig.NIET_GEREGISTREERD;
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
            <CardTitle>ND-nummer Status</CardTitle>
          </div>
          <Badge
            variant={statusInfo.variant}
            className="flex items-center gap-1"
          >
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
        <CardDescription>
          {profileType === "ZZP" ? "ZZP beveiliger" : "Beveiligingsbedrijf"}{" "}
          compliance status
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">ND-nummer</div>
            <div className="font-mono text-lg">
              {profile.ndNummer || "Niet geregistreerd"}
            </div>
          </div>

          {profile.ndNummerVervalDatum && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Vervaldatum</div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(profile.ndNummerVervalDatum).toLocaleDateString(
                    "nl-NL",
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Compliance Alert */}
        {!compliance.isCompliant && (
          <Alert variant={compliance.isExpired ? "destructive" : "default"}>
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>
              {compliance.isExpired
                ? "ND-nummer Verlopen"
                : compliance.isExpiringSoon
                  ? "ND-nummer Verloopt Binnenkort"
                  : "Actie Vereist"}
            </AlertTitle>
            <AlertDescription>
              {compliance.isExpired &&
                "Uw ND-nummer is verlopen. U kunt geen opdrachten accepteren."}
              {compliance.isExpiringSoon &&
                compliance.daysUntilExpiry &&
                `Uw ND-nummer verloopt over ${compliance.daysUntilExpiry} dagen. Plan vernieuwing.`}
              {!compliance.canAcceptJobs &&
                "Zonder geldig ND-nummer kunt u geen beveiligingsopdrachten uitvoeren."}
            </AlertDescription>
          </Alert>
        )}

        {/* Expiry Progress (if applicable) */}
        {profile.ndNummerVervalDatum &&
          compliance.daysUntilExpiry !== null &&
          compliance.daysUntilExpiry > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Geldigheid</span>
                <span>{compliance.daysUntilExpiry} dagen resterend</span>
              </div>
              <Progress
                value={Math.max(
                  0,
                  Math.min(100, (compliance.daysUntilExpiry / 365) * 100),
                )}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground text-center">
                Hernieuwing aangeraden vanaf 90 dagen voor vervaldatum
              </div>
            </div>
          )}

        {/* Last Verification */}
        {profile.ndNummerLaatsteControle && (
          <div className="text-sm text-muted-foreground">
            Laatst geverifieerd:{" "}
            {new Date(profile.ndNummerLaatsteControle).toLocaleString("nl-NL")}
          </div>
        )}

        {/* Comments/Notes */}
        {profile.ndNummerOpmerking && (
          <Alert>
            <FileTextIcon className="h-4 w-4" />
            <AlertTitle>Opmerkingen</AlertTitle>
            <AlertDescription>{profile.ndNummerOpmerking}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {profile.ndNummer && (
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              variant="outline"
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  Verifiëren...
                </>
              ) : (
                <>
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  Verificatie Uitvoeren
                </>
              )}
            </Button>
          )}

          {(compliance.requiresRenewal || compliance.isExpiringSoon) && (
            <Button
              onClick={onRenew}
              variant={compliance.isExpired ? "destructive" : "default"}
              className="flex-1"
            >
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              {compliance.isExpired
                ? "Onmiddellijk Vernieuwen"
                : "Plan Vernieuwing"}
            </Button>
          )}
        </div>

        {/* Recent Activity */}
        {status.auditHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recente Activiteit</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {status.auditHistory.slice(0, 3).map((entry) => (
                <div key={entry.id} className="text-xs p-2 bg-muted rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{entry.action}</span>
                    <span className="text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString("nl-NL")}
                    </span>
                  </div>
                  {entry.complianceNotes && (
                    <div className="mt-1 text-muted-foreground">
                      {entry.complianceNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {compliance.isCompliant ? "✓" : "⚠️"}
            </div>
            <div className="text-sm text-muted-foreground">
              {compliance.isCompliant ? "Conform" : "Niet conform"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {compliance.canAcceptJobs ? "✓" : "✗"}
            </div>
            <div className="text-sm text-muted-foreground">
              Opdrachten accepteren
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
