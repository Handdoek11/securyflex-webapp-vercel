"use client";

import {
  AlertTriangle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Plus,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Shift {
  id: string;
  title: string;
  type: "internal" | "external";
  client: string;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  assignedBeveiligers: TeamMember[];
  requiredBeveiligers: number;
  status: "planned" | "confirmed" | "in_progress" | "completed";
  caoCompliant: boolean;
  finqleStatus?: "hours_submitted" | "payment_pending" | "paid";
}

interface TeamMember {
  id: string;
  name: string;
  available: boolean;
  currentShift?: string;
  weeklyHours: number;
  maxWeeklyHours: number;
}

interface CAOViolation {
  type: "overtime" | "rest_period" | "consecutive_nights";
  description: string;
  severity: "warning" | "violation";
}

export default function BedrijfPlanningPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [filterTeam, setFilterTeam] = useState("all");
  const [_selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [_showAssignModal, setShowAssignModal] = useState(false);
  const [draggedMember, setDraggedMember] = useState<TeamMember | null>(null);
  const [caoViolations, setCaoViolations] = useState<CAOViolation[]>([]);

  // Mock data
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Jan de Vries",
      available: true,
      weeklyHours: 36,
      maxWeeklyHours: 48,
    },
    {
      id: "2",
      name: "Maria Jansen",
      available: true,
      weeklyHours: 32,
      maxWeeklyHours: 48,
    },
    {
      id: "3",
      name: "Ahmed Hassan",
      available: false,
      currentShift: "shift-1",
      weeklyHours: 40,
      maxWeeklyHours: 48,
    },
    {
      id: "4",
      name: "Lisa van Berg",
      available: true,
      weeklyHours: 24,
      maxWeeklyHours: 48,
    },
    {
      id: "5",
      name: "Mohammed Al-Rashid",
      available: true,
      weeklyHours: 38,
      maxWeeklyHours: 48,
    },
    {
      id: "6",
      name: "Sophie de Wit",
      available: false,
      currentShift: "shift-2",
      weeklyHours: 42,
      maxWeeklyHours: 48,
    },
  ];

  const shifts: Shift[] = [
    {
      id: "shift-1",
      title: "Schiphol Terminal 2",
      type: "external",
      client: "Schiphol Security",
      location: "Schiphol",
      date: new Date(),
      startTime: "14:00",
      endTime: "22:00",
      assignedBeveiligers: [teamMembers[2]],
      requiredBeveiligers: 2,
      status: "in_progress",
      caoCompliant: true,
      finqleStatus: "payment_pending",
    },
    {
      id: "shift-2",
      title: "RAI Evenement",
      type: "internal",
      client: "RAI Amsterdam",
      location: "Amsterdam RAI",
      date: new Date(),
      startTime: "18:00",
      endTime: "02:00",
      assignedBeveiligers: [teamMembers[5]],
      requiredBeveiligers: 3,
      status: "confirmed",
      caoCompliant: false, // CAO violation: too many hours
    },
    {
      id: "shift-3",
      title: "Ajax Training Complex",
      type: "external",
      client: "Ajax Events",
      location: "Amsterdam",
      date: new Date(Date.now() + 86400000),
      startTime: "08:00",
      endTime: "16:00",
      assignedBeveiligers: [],
      requiredBeveiligers: 2,
      status: "planned",
      caoCompliant: true,
    },
  ];

  // Days of week
  const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const _timeSlots = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`,
  );

  const checkCAOCompliance = (
    member: TeamMember,
    shift: Shift,
  ): CAOViolation[] => {
    const violations: CAOViolation[] = [];

    // Check weekly hours
    const shiftHours =
      parseInt(shift.endTime, 10) - parseInt(shift.startTime, 10);
    if (member.weeklyHours + shiftHours > 48) {
      violations.push({
        type: "overtime",
        description: `${member.name} zou ${member.weeklyHours + shiftHours} uur werken (max 48)`,
        severity: "violation",
      });
    } else if (member.weeklyHours + shiftHours > 40) {
      violations.push({
        type: "overtime",
        description: `${member.name} gaat over de 40 uur`,
        severity: "warning",
      });
    }

    return violations;
  };

  const handleDragStart = (member: TeamMember) => {
    setDraggedMember(member);
  };

  const handleDrop = (shift: Shift) => {
    if (draggedMember?.available) {
      const violations = checkCAOCompliance(draggedMember, shift);
      if (violations.length > 0) {
        setCaoViolations(violations);
      }
      // Assign member to shift
      console.log(`Assigning ${draggedMember.name} to ${shift.title}`);
    }
    setDraggedMember(null);
  };

  const exportToFinqle = () => {
    // Export hours to Finqle for processing
    console.log("Exporting hours to Finqle...");
  };

  return (
    <BedrijfDashboardLayout
      title="Planning & Roostering"
      subtitle="Beheer team planning zonder payroll complexiteit"
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importeer
          </Button>
          <Button variant="outline" size="sm" onClick={exportToFinqle}>
            <Download className="h-4 w-4 mr-2" />
            Export naar Finqle
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe shift
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* CAO Violations Alert */}
        {caoViolations.length > 0 && (
          <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  CAO Waarschuwingen
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-200 mt-1 space-y-1">
                  {caoViolations.map((violation, idx) => (
                    <li key={idx}>• {violation.description}</li>
                  ))}
                </ul>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCaoViolations([])}
              >
                Begrepen
              </Button>
            </div>
          </Card>
        )}

        {/* Week Navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newWeek = new Date(currentWeek);
                  newWeek.setDate(newWeek.getDate() - 7);
                  setCurrentWeek(newWeek);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold">
                Week{" "}
                {Math.ceil(
                  (currentWeek.getDate() - currentWeek.getDay() + 1) / 7,
                )}{" "}
                - {currentWeek.getFullYear()}
              </h3>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newWeek = new Date(currentWeek);
                  newWeek.setDate(newWeek.getDate() + 7);
                  setCurrentWeek(newWeek);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Vandaag
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={viewMode}
                onValueChange={(value) => setViewMode(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week view</SelectItem>
                  <SelectItem value="day">Dag view</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle teams</SelectItem>
                  <SelectItem value="team-a">Team A</SelectItem>
                  <SelectItem value="team-b">Team B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Main Planning Grid */}
        <div className="grid grid-cols-[200px_1fr] gap-4">
          {/* Team Members List */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team ({teamMembers.filter((m) => m.available).length}/
              {teamMembers.length})
            </h3>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  draggable={member.available}
                  onDragStart={() => handleDragStart(member)}
                  className={`p-2 rounded-lg border ${
                    member.available
                      ? "bg-white dark:bg-gray-900 cursor-move hover:shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.weeklyHours}/{member.maxWeeklyHours}u
                      </p>
                    </div>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        member.available ? "bg-green-500" : "bg-amber-500"
                      }`}
                    />
                  </div>
                  {member.weeklyHours > 40 && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      Overuren
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Finqle Hours Status */}
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs font-medium mb-2">Finqle Status</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Ingediend:</span>
                  <span className="font-medium">156 uur</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Goedgekeurd:</span>
                  <span className="font-medium text-green-600">148 uur</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>In behandeling:</span>
                  <span className="font-medium text-amber-600">8 uur</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Planning Grid */}
          <Card className="p-4 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {getWeekDates().map((date, idx) => (
                  <div key={idx} className="text-center">
                    <p className="font-medium">{weekDays[idx]}</p>
                    <p className="text-sm text-muted-foreground">
                      {date.getDate()}/{date.getMonth() + 1}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shifts Grid */}
              <div className="grid grid-cols-7 gap-2">
                {getWeekDates().map((date, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="border rounded-lg p-2 min-h-[400px] bg-gray-50 dark:bg-gray-900/50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      const dayShifts = shifts.filter(
                        (s) => s.date.toDateString() === date.toDateString(),
                      );
                      if (dayShifts.length > 0 && draggedMember) {
                        handleDrop(dayShifts[0]);
                      }
                    }}
                  >
                    {shifts
                      .filter(
                        (shift) =>
                          shift.date.toDateString() === date.toDateString(),
                      )
                      .map((shift) => (
                        <div
                          key={shift.id}
                          className={`mb-2 p-2 rounded-lg border ${
                            shift.type === "internal"
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200"
                              : "bg-green-50 dark:bg-green-900/20 border-green-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-medium">
                                {shift.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {shift.startTime}-{shift.endTime}
                              </p>
                            </div>
                            {shift.type === "internal" ? (
                              <Briefcase className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Shield className="h-3 w-3 text-green-500" />
                            )}
                          </div>

                          <div className="flex items-center gap-1 mt-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">
                              {shift.assignedBeveiligers.length}/
                              {shift.requiredBeveiligers}
                            </span>
                            {!shift.caoCompliant && (
                              <AlertTriangle className="h-3 w-3 text-amber-500 ml-auto" />
                            )}
                          </div>

                          {shift.assignedBeveiligers.map((member) => (
                            <Badge
                              key={member.id}
                              variant="secondary"
                              className="text-xs mt-1 mr-1"
                            >
                              {member.name.split(" ")[0]}
                            </Badge>
                          ))}

                          {shift.finqleStatus && (
                            <Badge
                              variant={
                                shift.finqleStatus === "paid"
                                  ? "success"
                                  : "secondary"
                              }
                              className="text-xs mt-1"
                            >
                              {shift.finqleStatus === "hours_submitted" &&
                                "Uren ingediend"}
                              {shift.finqleStatus === "payment_pending" &&
                                "Betaling pending"}
                              {shift.finqleStatus === "paid" && "Betaald"}
                            </Badge>
                          )}

                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => setSelectedShift(shift)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => {
                                setSelectedShift(shift);
                                setShowAssignModal(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Totale uren deze week
              </p>
              <p className="text-2xl font-bold">268</p>
              <p className="text-xs text-green-600">Alle CAO compliant</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bezettingsgraad</p>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-muted-foreground">
                15 van 18 shifts gevuld
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Finqle status</p>
              <p className="text-2xl font-bold">€12.4k</p>
              <p className="text-xs text-green-600">In behandeling</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Openstaande shifts
              </p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-amber-600">Actie vereist</p>
            </div>
          </div>
        </Card>
      </div>
    </BedrijfDashboardLayout>
  );
}
