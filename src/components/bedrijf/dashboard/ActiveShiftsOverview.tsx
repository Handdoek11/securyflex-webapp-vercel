"use client";

import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ShiftType = "internal" | "external" | "all";
type ShiftStatus = "full" | "partial" | "urgent" | "all";

interface Shift {
  id: string;
  title: string;
  type: "internal" | "external"; // internal = wij plaatsen, external = wij leveren
  client: string;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  requiredBeveiligers: number;
  assignedBeveiligers: number;
  status: "full" | "partial" | "urgent";
  hourlyRate?: number;
  totalValue?: number;
  finqleStatus?: "direct_payment_available" | "regular_payment";
}

interface ActiveShiftsOverviewProps {
  bedrijfId?: string;
  showFilters?: boolean;
}

export function ActiveShiftsOverview({
  bedrijfId,
  showFilters = true,
}: ActiveShiftsOverviewProps) {
  const [filterType, setFilterType] = useState<ShiftType>("all");
  const [filterStatus, setFilterStatus] = useState<ShiftStatus>("all");

  // Mock data - will be replaced with real API
  const [shifts] = useState<Shift[]>([
    {
      id: "1",
      title: "Schiphol Terminal 2",
      type: "external",
      client: "Schiphol Security B.V.",
      location: "Schiphol, Terminal 2",
      date: new Date(),
      startTime: "14:00",
      endTime: "22:00",
      requiredBeveiligers: 4,
      assignedBeveiligers: 3,
      status: "partial",
      hourlyRate: 28,
      totalValue: 896,
      finqleStatus: "direct_payment_available",
    },
    {
      id: "2",
      title: "Evenement Beveiliging RAI",
      type: "internal",
      client: "RAI Amsterdam",
      location: "Amsterdam RAI",
      date: new Date(),
      startTime: "18:00",
      endTime: "02:00",
      requiredBeveiligers: 6,
      assignedBeveiligers: 6,
      status: "full",
      hourlyRate: 25,
      totalValue: 1200,
      finqleStatus: "regular_payment",
    },
    {
      id: "3",
      title: "Ajax Training Complex",
      type: "external",
      client: "Ajax Events",
      location: "Amsterdam Zuidoost",
      date: new Date(),
      startTime: "08:00",
      endTime: "16:00",
      requiredBeveiligers: 2,
      assignedBeveiligers: 0,
      status: "urgent",
      hourlyRate: 30,
      totalValue: 480,
      finqleStatus: "direct_payment_available",
    },
    {
      id: "4",
      title: "Zuidas Office Security",
      type: "internal",
      client: "Office Park Zuid",
      location: "Amsterdam Zuidas",
      date: new Date(Date.now() + 86400000), // Tomorrow
      startTime: "07:00",
      endTime: "19:00",
      requiredBeveiligers: 3,
      assignedBeveiligers: 2,
      status: "partial",
      hourlyRate: 26,
      totalValue: 936,
      finqleStatus: "regular_payment",
    },
  ]);

  const filteredShifts = shifts.filter((shift) => {
    if (filterType !== "all" && shift.type !== filterType) return false;
    if (filterStatus !== "all" && shift.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (
    status: Shift["status"],
    assigned: number,
    required: number,
  ) => {
    switch (status) {
      case "full":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Gevuld
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <Clock className="h-3 w-3 mr-1" />
            {required - assigned} open
          </Badge>
        );
      case "urgent":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Urgent
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: Shift["type"]) => {
    return type === "internal" ? (
      <Briefcase className="h-4 w-4 text-blue-500" />
    ) : (
      <Shield className="h-4 w-4 text-green-500" />
    );
  };

  const stats = {
    total: shifts.length,
    internal: shifts.filter((s) => s.type === "internal").length,
    external: shifts.filter((s) => s.type === "external").length,
    urgent: shifts.filter((s) => s.status === "urgent").length,
    totalValue: shifts.reduce((sum, s) => sum + (s.totalValue || 0), 0),
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Actieve Shifts
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} shifts • {stats.internal} intern • {stats.external}{" "}
              extern
            </p>
          </div>

          {showFilters && (
            <div className="flex items-center gap-2">
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as ShiftType)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle types</SelectItem>
                  <SelectItem value="internal">Wij plaatsen</SelectItem>
                  <SelectItem value="external">Wij leveren</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as ShiftStatus)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="partial">Deels gevuld</SelectItem>
                  <SelectItem value="full">Volledig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {stats.urgent > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  {stats.urgent} urgente shift{stats.urgent > 1 ? "s" : ""}{" "}
                  vereisen directe actie
                </span>
              </div>
              <Button size="sm" variant="destructive">
                Direct invullen
              </Button>
            </div>
          </div>
        )}

        {/* Shifts List */}
        <div className="space-y-3">
          {filteredShifts.map((shift) => (
            <div
              key={shift.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and Type */}
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(shift.type)}
                    <div>
                      <h4 className="font-medium">{shift.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {shift.client}
                      </p>
                    </div>
                    {shift.type === "internal" ? (
                      <Badge variant="outline" className="ml-auto">
                        Wij plaatsen
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-auto">
                        Wij leveren
                      </Badge>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {shift.startTime} - {shift.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {shift.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {shift.assignedBeveiligers}/{shift.requiredBeveiligers}{" "}
                      beveiligers
                    </span>
                    {shift.hourlyRate && (
                      <span className="font-medium text-foreground">
                        €{shift.hourlyRate}/uur
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <Progress
                      value={
                        (shift.assignedBeveiligers /
                          shift.requiredBeveiligers) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  {/* Finqle Status */}
                  {shift.finqleStatus === "direct_payment_available" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Direct payment beschikbaar
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        via Finqle
                      </span>
                    </div>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="ml-4 text-right space-y-2">
                  {getStatusBadge(
                    shift.status,
                    shift.assignedBeveiligers,
                    shift.requiredBeveiligers,
                  )}

                  {shift.totalValue && (
                    <p className="text-sm font-semibold">
                      €{shift.totalValue.toLocaleString("nl-NL")}
                    </p>
                  )}

                  {shift.status !== "full" && (
                    <div className="flex flex-col gap-1 mt-2">
                      {shift.type === "external" ? (
                        <Button size="sm" variant="default">
                          Toewijzen
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          ZZP zoeken
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Totale waarde:{" "}
            <span className="font-semibold text-foreground">
              €{stats.totalValue.toLocaleString("nl-NL")}
            </span>
          </p>
          <Button variant="outline">
            Alle shifts bekijken
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
