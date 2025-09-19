"use client";

import type {
  BedrijfProfile,
  BedrijfTeamAssignment,
  Opdracht,
  Opdrachtgever,
  OpdrachtSollicitatie,
  Werkuur,
} from "@prisma/client";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  FileCheck,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeOpdrachten } from "@/hooks/useRealtimeOpdrachten";
import { cn } from "@/lib/utils";

interface FlowStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "completed" | "active" | "pending" | "failed";
  timestamp?: Date;
  details?: string;
}

interface OpdrachtFlowStatusProps {
  opdrachtId: string;
  userRole: "OPDRACHTGEVER" | "BEDRIJF" | "ZZP_BEVEILIGER";
  onActionRequired?: (action: string) => void;
}

interface OpdrachtWithRelations extends Opdracht {
  bedrijf?: BedrijfProfile | null;
  opdrachtgever?: Opdrachtgever | null;
  sollicitaties?: OpdrachtSollicitatie[];
  assignments?: BedrijfTeamAssignment[];
  werkuren?: Werkuur[];
  beveiligers?: unknown[];
}

interface FinqleStatusData {
  paymentStatus?: string;
  totalAmount?: number;
  paidAmount?: number;
  lastUpdate?: Date;
  stats?: {
    paid?: number;
    totalTransactions?: number;
    totalAmount?: number;
    directPayments?: number;
  };
}

export function OpdrachtFlowStatus({
  opdrachtId,
  userRole,
  onActionRequired,
}: OpdrachtFlowStatusProps) {
  const [_opdracht, setOpdracht] = useState<OpdrachtWithRelations | null>(null);
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [finqleStatus, setFinqleStatus] = useState<FinqleStatusData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const { opdrachten, lastUpdate } = useRealtimeOpdrachten({
    status: opdrachtId,
  });

  const fetchOpdrachtDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/opdrachten/${opdrachtId}`);
      const data = await response.json();

      if (data.success) {
        setOpdracht(data.data);
        updateFlowSteps(data.data);
      }
    } catch (error) {
      console.error("Error fetching opdracht:", error);
    } finally {
      setLoading(false);
    }
  }, [opdrachtId, updateFlowSteps]);

  const fetchFinqleStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/opdrachten/${opdrachtId}/finqle`);
      const data = await response.json();

      if (data.success) {
        setFinqleStatus(data.data);
      }
    } catch (error) {
      console.error("Error fetching Finqle status:", error);
    }
  }, [opdrachtId]);

  const getMatchingStatus = (
    data: OpdrachtWithRelations,
  ): FlowStep["status"] => {
    if (data.bedrijf) return "completed";
    if (data.beveiligers?.length > 0) return "active";
    return "pending";
  };

  const getAssignmentStatus = (
    data: OpdrachtWithRelations,
  ): FlowStep["status"] => {
    if (!data.bedrijf) return "pending";
    const confirmedCount =
      data.assignments?.filter((a) => a.status === "CONFIRMED").length || 0;
    if (confirmedCount === data.aantalBeveiligers) return "completed";
    if (confirmedCount > 0) return "active";
    return "pending";
  };

  const getExecutionStatus = (
    data: OpdrachtWithRelations,
  ): FlowStep["status"] => {
    if (data.status === "AFGEROND") return "completed";
    if (data.status === "BEZIG") return "active";
    return "pending";
  };

  const getVerificationStatus = (
    data: OpdrachtWithRelations,
  ): FlowStep["status"] => {
    const approvedCount =
      data.werkuren?.filter((w) => w.status === "APPROVED").length || 0;
    const totalHours = data.werkuren?.length || 0;
    if (totalHours === 0) return "pending";
    if (approvedCount === totalHours) return "completed";
    return "active";
  };

  const getPaymentStatus = (
    _data: OpdrachtWithRelations,
    finqle: FinqleStatusData | null,
  ): FlowStep["status"] => {
    if (!finqle) return "pending";
    if (finqle.stats?.paid === finqle.stats?.totalTransactions)
      return "completed";
    if ((finqle.stats?.paid ?? 0) > 0) return "active";
    return "pending";
  };

  const formatExecutionTime = (data: OpdrachtWithRelations) => {
    if (data.status !== "BEZIG") return undefined;
    const start = new Date(data.startDatum);
    const end = new Date(data.eindDatum);
    const now = new Date();
    if (now < start) return "Start binnenkort";
    if (now > end) return "Wacht op afronden";
    const progress =
      ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) *
      100;
    return `${Math.round(progress)}% voltooid`;
  };

  const formatPaymentDetails = (finqle: FinqleStatusData) => {
    const stats = finqle.stats;
    if (!stats) return undefined;
    const total = stats.totalAmount ?? 0;
    const _paid = stats.paid ?? 0;
    const directPayments = stats.directPayments ?? 0;
    return `€${total.toFixed(2)} (${directPayments} direct)`;
  };

  const updateFlowSteps = useCallback(
    (opdrachtData: OpdrachtWithRelations) => {
      const steps: FlowStep[] = [
        {
          id: "created",
          label: "Opdracht Aangemaakt",
          description: "Opdrachtgever heeft de opdracht geplaatst",
          icon: FileCheck,
          status: "completed",
          timestamp: new Date(opdrachtData.createdAt),
          details: `${opdrachtData.aantalBeveiligers} beveiligers nodig`,
        },
        {
          id: "matching",
          label: "Matching & Sollicitaties",
          description: "Bedrijven en ZZP'ers kunnen solliciteren",
          icon: Users,
          status: getMatchingStatus(opdrachtData),
          details: `${opdrachtData.beveiligers?.length || 0} sollicitaties`,
        },
        {
          id: "acceptance",
          label: "Bedrijf Accepteert",
          description: "Een bedrijf accepteert de opdracht",
          icon: Building2,
          status: opdrachtData.bedrijf
            ? "completed"
            : opdrachtData.status === "OPEN"
              ? "active"
              : "pending",
          timestamp: opdrachtData.bedrijf
            ? new Date(opdrachtData.updatedAt)
            : undefined,
          details: opdrachtData.bedrijf?.bedrijfsnaam,
        },
        {
          id: "assignment",
          label: "Team Toewijzing",
          description: "Bedrijf wijst teamleden toe",
          icon: UserCheck,
          status: getAssignmentStatus(opdrachtData),
          details: `${opdrachtData.assignments?.filter((a) => a.status === "CONFIRMED").length || 0}/${opdrachtData.aantalBeveiligers} bevestigd`,
        },
        {
          id: "execution",
          label: "Uitvoering",
          description: "Beveiligers voeren opdracht uit",
          icon: Shield,
          status: getExecutionStatus(opdrachtData),
          timestamp:
            opdrachtData.status === "BEZIG"
              ? new Date(opdrachtData.startDatum)
              : undefined,
          details: formatExecutionTime(opdrachtData),
        },
        {
          id: "verification",
          label: "Werkuren Verificatie",
          description: "GPS clock-in/out en goedkeuring",
          icon: Clock,
          status: getVerificationStatus(opdrachtData),
          details: `${opdrachtData.werkuren?.filter((w) => w.status === "APPROVED").length || 0} uren goedgekeurd`,
        },
        {
          id: "payment",
          label: "Finqle Betaling",
          description: "Automatische facturatie en betaling",
          icon: CreditCard,
          status: getPaymentStatus(opdrachtData, finqleStatus),
          details: finqleStatus
            ? formatPaymentDetails(finqleStatus)
            : undefined,
        },
        {
          id: "completed",
          label: "Afgerond",
          description: "Opdracht volledig afgerond",
          icon: CheckCircle,
          status: opdrachtData.status === "AFGEROND" ? "completed" : "pending",
          timestamp:
            opdrachtData.status === "AFGEROND"
              ? new Date(opdrachtData.updatedAt)
              : undefined,
        },
      ];

      setFlowSteps(steps);
    },
    [
      finqleStatus,
      formatExecutionTime,
      formatPaymentDetails,
      getAssignmentStatus,
      getExecutionStatus,
      getMatchingStatus,
      getPaymentStatus,
      getVerificationStatus,
    ],
  );

  useEffect(() => {
    fetchOpdrachtDetails();
    fetchFinqleStatus();
  }, [fetchOpdrachtDetails, fetchFinqleStatus]);

  const _getActiveStepIndex = () => {
    return flowSteps.findIndex((step) => step.status === "active");
  };

  const getCompletedPercentage = () => {
    const completed = flowSteps.filter(
      (step) => step.status === "completed",
    ).length;
    return (completed / flowSteps.length) * 100;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-2 w-full mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Opdracht Status Flow</h3>
          <Progress value={getCompletedPercentage()} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {flowSteps.filter((s) => s.status === "completed").length} van{" "}
            {flowSteps.length} stappen voltooid
          </p>
        </div>

        {/* Flow Steps */}
        <div className="space-y-4">
          {flowSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.status === "active";
            const isCompleted = step.status === "completed";
            const isFailed = step.status === "failed";

            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < flowSteps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-6 top-12 w-0.5 h-16",
                      isCompleted ? "bg-green-500" : "bg-muted",
                    )}
                  />
                )}

                {/* Step Card */}
                <div
                  className={cn(
                    "flex gap-4 p-4 rounded-lg transition-colors",
                    isActive && "bg-primary/5 border border-primary",
                    isCompleted && "bg-green-50 dark:bg-green-950/20",
                    isFailed && "bg-red-50 dark:bg-red-950/20",
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                      isCompleted && "bg-green-500 text-white",
                      isActive &&
                        "bg-primary text-primary-foreground animate-pulse",
                      isFailed && "bg-red-500 text-white",
                      !isCompleted && !isActive && !isFailed && "bg-muted",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.label}</h4>
                      {isActive && (
                        <Badge variant="default" className="animate-pulse">
                          Actief
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Voltooid
                        </Badge>
                      )}
                      {isFailed && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Mislukt
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>

                    {step.details && (
                      <p className="text-sm font-medium mt-2">{step.details}</p>
                    )}

                    {step.timestamp && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.timestamp.toLocaleString("nl-NL")}
                      </p>
                    )}

                    {/* Action Buttons for Active Steps */}
                    {isActive &&
                      userRole === "BEDRIJF" &&
                      step.id === "assignment" && (
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => onActionRequired?.("assign-team")}
                        >
                          Team Toewijzen
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}

                    {isActive &&
                      userRole === "OPDRACHTGEVER" &&
                      step.id === "verification" && (
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => onActionRequired?.("approve-hours")}
                        >
                          Uren Goedkeuren
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Finqle Status Card */}
        {finqleStatus?.stats && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Finqle Payment Status</h4>
              </div>
              <Badge variant="outline">
                {finqleStatus.stats.directPayments} direct payments
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Totaal</p>
                <p className="font-semibold">
                  €{finqleStatus.stats.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Betaald</p>
                <p className="font-semibold text-green-600">
                  {finqleStatus.stats.paid} /{" "}
                  {finqleStatus.stats.totalTransactions}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">In behandeling</p>
                <p className="font-semibold text-orange-600">
                  {finqleStatus.stats.pending}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}
