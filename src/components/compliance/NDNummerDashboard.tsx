"use client";

import {
  AlertTriangleIcon,
  CalendarIcon,
  FileCheckIcon,
  ShieldIcon,
  TrendingUpIcon,
  UsersIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NDNummerRegistrationForm } from "./NDNummerRegistrationForm";
import { NDNummerStatusCard } from "./NDNummerStatusCard";

interface NDNummerDashboardProps {
  userRole: "ZZP_BEVEILIGER" | "BEDRIJF" | "ADMIN";
  className?: string;
}

interface ComplianceMonitoringData {
  summary: {
    totalProfiles: number;
    compliantProfiles: number;
    complianceRate: number;
    expiredProfiles: number;
    expiringSoonProfiles: number;
    criticalRiskProfiles: number;
    highRiskProfiles: number;
    lastUpdated: string;
  };
  profiles: Array<{
    id: string;
    profileType: "ZZP" | "BEDRIJF";
    userName: string;
    userEmail?: string;
    bedrijfsnaam?: string;
    ndNummer: string;
    status: string;
    vervalDatum: string;
    laatsteControle: string;
    isCompliant: boolean;
    isExpired: boolean;
    isExpiringSoon: boolean;
    daysUntilExpiry: number | null;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    opmerking?: string;
  }>;
  recentActivity: Array<{
    id: string;
    profileType: "ZZP" | "BEDRIJF";
    profileName: string;
    ndNummer: string;
    action: string;
    newStatus: string;
    verificationSource: string;
    createdAt: string;
  }>;
  alerts: Array<{
    profileId: string;
    profileType: "ZZP" | "BEDRIJF";
    userName: string;
    bedrijfsnaam?: string;
    ndNummer: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    issue: string;
    daysUntilExpiry: number | null;
  }>;
}

const riskLevelConfig = {
  LOW: { label: "Laag", color: "bg-green-500", variant: "default" as const },
  MEDIUM: {
    label: "Middel",
    color: "bg-yellow-500",
    variant: "secondary" as const,
  },
  HIGH: {
    label: "Hoog",
    color: "bg-orange-500",
    variant: "destructive" as const,
  },
  CRITICAL: {
    label: "Kritiek",
    color: "bg-red-500",
    variant: "destructive" as const,
  },
};

export function NDNummerDashboard({
  userRole,
  className,
}: NDNummerDashboardProps) {
  const [monitoringData, setMonitoringData] =
    useState<ComplianceMonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const isAdmin = userRole === "ADMIN";
  const profileType = userRole === "ZZP_BEVEILIGER" ? "ZZP" : "BEDRIJF";

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);
      const scope = isAdmin ? "platform" : "user";
      const response = await fetch(
        `/api/compliance/nd-nummer/monitor?scope=${scope}`,
      );

      if (!response.ok) {
        throw new Error("Monitoring data ophalen mislukt");
      }

      const data = await response.json();
      setMonitoringData(data);
    } catch (error) {
      console.error("Monitoring fetch error:", error);
      toast.error("Kon compliance data niet ophalen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    fetchMonitoringData();
    toast.success("ND-nummer succesvol geregistreerd!");
  };

  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const hasValidNDNummer =
    monitoringData?.profiles.some(
      (p) => p.status === "ACTIEF" && p.isCompliant,
    ) || false;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            ND-nummer {isAdmin ? "Platform" : "Compliance"} Dashboard
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Platform-wijde ND-nummer compliance monitoring en beheer"
              : "Beheer uw Nederlandse Dienstnummer voor WPBR compliance"}
          </p>
        </div>
        {!isAdmin && !hasValidNDNummer && (
          <Button onClick={() => setShowRegistrationForm(true)}>
            ND-nummer Registreren
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {monitoringData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isAdmin ? "Totaal Profielen" : "Compliance Status"}
                  </p>
                  <p className="text-2xl font-bold">
                    {isAdmin
                      ? monitoringData.summary.totalProfiles
                      : hasValidNDNummer
                        ? "Conform"
                        : "Actie vereist"}
                  </p>
                </div>
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Compliance Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {monitoringData.summary.complianceRate}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Progress
                      value={monitoringData.summary.complianceRate}
                      className="h-1 w-16"
                    />
                  </div>
                </div>
                <TrendingUpIcon className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verlopen
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {monitoringData.summary.expiredProfiles}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Onmiddellijke actie
                  </p>
                </div>
                <AlertTriangleIcon className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verloopt Binnenkort
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {monitoringData.summary.expiringSoonProfiles}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Binnen 90 dagen
                  </p>
                </div>
                <CalendarIcon className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {monitoringData && monitoringData.alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Urgente Aandacht Vereist</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {monitoringData.alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.profileId}
                  className="flex items-center justify-between"
                >
                  <span>
                    {alert.bedrijfsnaam || alert.userName} - {alert.ndNummer}
                  </span>
                  <Badge variant="destructive">{alert.issue}</Badge>
                </div>
              ))}
              {monitoringData.alerts.length > 3 && (
                <p className="text-sm">
                  En {monitoringData.alerts.length - 3} meer...
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          {!isAdmin && <TabsTrigger value="status">Mijn Status</TabsTrigger>}
          {isAdmin && (
            <TabsTrigger value="profiles">Alle Profielen</TabsTrigger>
          )}
          <TabsTrigger value="activity">Recente Activiteit</TabsTrigger>
          {!isAdmin && <TabsTrigger value="register">Registreren</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overzicht</CardTitle>
                <CardDescription>
                  Huidige status van ND-nummer compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monitoringData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {monitoringData.summary.compliantProfiles}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Conform
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {monitoringData.summary.criticalRiskProfiles}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Kritiek Risico
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Platform Compliance</span>
                        <span>{monitoringData.summary.complianceRate}%</span>
                      </div>
                      <Progress value={monitoringData.summary.complianceRate} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risico Distributie</CardTitle>
                <CardDescription>Verdeling van risico niveaus</CardDescription>
              </CardHeader>
              <CardContent>
                {monitoringData && (
                  <div className="space-y-3">
                    {Object.entries(
                      monitoringData.profiles.reduce(
                        (acc, profile) => {
                          acc[profile.riskLevel] =
                            (acc[profile.riskLevel] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([level, count]) => {
                      const config =
                        riskLevelConfig[level as keyof typeof riskLevelConfig];
                      const percentage =
                        monitoringData.summary.totalProfiles > 0
                          ? (count / monitoringData.summary.totalProfiles) * 100
                          : 0;

                      return (
                        <div key={level} className="flex items-center gap-3">
                          <Badge
                            variant={config.variant}
                            className="w-20 justify-center"
                          >
                            {config.label}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{count} profielen</span>
                              <span>{percentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {!isAdmin && (
          <TabsContent value="status">
            <NDNummerStatusCard
              profileType={profileType}
              onVerify={fetchMonitoringData}
              onRenew={() => setActiveTab("register")}
            />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="profiles" className="space-y-4">
            <div className="grid gap-4">
              {monitoringData?.profiles.map((profile) => (
                <Card key={profile.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {profile.bedrijfsnaam || profile.userName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {profile.ndNummer} • {profile.profileType}
                        </div>
                        {profile.daysUntilExpiry !== null && (
                          <div className="text-xs text-muted-foreground">
                            {profile.daysUntilExpiry > 0
                              ? `Verloopt over ${profile.daysUntilExpiry} dagen`
                              : `Verlopen sinds ${Math.abs(profile.daysUntilExpiry)} dagen`}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={riskLevelConfig[profile.riskLevel].variant}
                        >
                          {riskLevelConfig[profile.riskLevel].label} Risico
                        </Badge>
                        <Badge
                          variant={
                            profile.isCompliant ? "default" : "destructive"
                          }
                        >
                          {profile.isCompliant ? "Conform" : "Niet conform"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recente Activiteit</CardTitle>
              <CardDescription>
                Laatste ND-nummer gerelateerde acties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monitoringData?.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <FileCheckIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {activity.profileName} - {activity.action}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.ndNummer} • Status: {activity.newStatus}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString("nl-NL")}
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground py-8">
                    Geen recente activiteit
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {!isAdmin && (
          <TabsContent value="register">
            {showRegistrationForm || !hasValidNDNummer ? (
              <NDNummerRegistrationForm
                profileType={profileType}
                onSuccess={handleRegistrationSuccess}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <ShieldIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    ND-nummer Geregistreerd
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    U heeft al een geldig ND-nummer geregistreerd.
                  </p>
                  <Button onClick={() => setActiveTab("status")}>
                    Status Bekijken
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
