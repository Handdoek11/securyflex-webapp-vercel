"use client";

import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Star,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  status: "actief" | "inactief" | "verlof";
  finqleStatus: "onboarded" | "pending" | "not_started";
  documents: {
    type: string;
    status: "geldig" | "verloopt" | "verlopen";
    expiryDate?: string;
  }[];
  skills: string[];
  performance: {
    rating: number;
    completedShifts: number;
    hoursWorked: number;
    lastShift?: string;
  };
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export default function BedrijfTeamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Mock data
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Jan de Vries",
      email: "jan@securyflex.nl",
      phone: "06-12345678",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jan",
      role: "Senior Beveiliger",
      status: "actief",
      finqleStatus: "onboarded",
      documents: [
        { type: "VOG", status: "geldig", expiryDate: "2025-12-31" },
        { type: "Diploma Beveiliging", status: "geldig" },
        { type: "EHBO", status: "verloopt", expiryDate: "2025-02-15" },
        { type: "BHV", status: "geldig", expiryDate: "2025-08-20" },
      ],
      skills: ["Evenement", "VIP Begeleiding", "Engels", "EHBO"],
      performance: {
        rating: 4.8,
        completedShifts: 156,
        hoursWorked: 1248,
        lastShift: "2025-01-15",
      },
      availability: {
        monday: true,
        tuesday: true,
        wednesday: false,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
    },
    {
      id: "2",
      name: "Sophie Bakker",
      email: "sophie@securyflex.nl",
      phone: "06-98765432",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie",
      role: "Beveiliger",
      status: "actief",
      finqleStatus: "pending",
      documents: [
        { type: "VOG", status: "geldig", expiryDate: "2025-11-30" },
        { type: "Diploma Beveiliging", status: "geldig" },
        { type: "EHBO", status: "verlopen", expiryDate: "2024-12-01" },
      ],
      skills: ["Object Beveiliging", "Receptie", "Duits"],
      performance: {
        rating: 4.5,
        completedShifts: 89,
        hoursWorked: 712,
        lastShift: "2025-01-14",
      },
      availability: {
        monday: false,
        tuesday: false,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
    },
    {
      id: "3",
      name: "Mohammed El Idrissi",
      email: "mohammed@securyflex.nl",
      phone: "06-11223344",
      role: "Teamleider",
      status: "verlof",
      finqleStatus: "onboarded",
      documents: [
        { type: "VOG", status: "geldig", expiryDate: "2025-09-15" },
        { type: "Diploma Beveiliging", status: "geldig" },
        { type: "Leidinggevende", status: "geldig" },
      ],
      skills: ["Crowd Control", "Airport Security", "Engels", "Arabisch"],
      performance: {
        rating: 4.9,
        completedShifts: 234,
        hoursWorked: 1872,
        lastShift: "2025-01-10",
      },
      availability: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
    },
  ];

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    const matchesDocument =
      documentFilter === "all" ||
      (documentFilter === "expired" &&
        member.documents.some((d) => d.status === "verlopen")) ||
      (documentFilter === "expiring" &&
        member.documents.some((d) => d.status === "verloopt"));

    return matchesSearch && matchesStatus && matchesDocument;
  });

  const handleSelectMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for members:`, selectedMembers);
    setSelectedMembers([]);
  };

  const getFinqleStatusBadge = (status: TeamMember["finqleStatus"]) => {
    switch (status) {
      case "onboarded":
        return <Badge variant="default">Finqle Actief</Badge>;
      case "pending":
        return <Badge variant="warning">Finqle In Behandeling</Badge>;
      case "not_started":
        return <Badge variant="secondary">Finqle Uitnodigen</Badge>;
    }
  };

  const getAvailabilityCount = (availability: TeamMember["availability"]) => {
    return Object.values(availability).filter(Boolean).length;
  };

  return (
    <BedrijfDashboardLayout
      title="Team Management"
      subtitle="Beheer je team zonder administratieve complexiteit"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Teamlid Toevoegen
          </Button>
        </div>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Totaal Team</p>
              <p className="text-2xl font-semibold">{teamMembers.length}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Actief</p>
              <p className="text-2xl font-semibold">
                {teamMembers.filter((m) => m.status === "actief").length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Documenten Alert</p>
              <p className="text-2xl font-semibold">
                {
                  teamMembers.filter((m) =>
                    m.documents.some((d) => d.status !== "geldig"),
                  ).length
                }
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Finqle Ready</p>
              <p className="text-2xl font-semibold">
                {
                  teamMembers.filter((m) => m.finqleStatus === "onboarded")
                    .length
                }
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op naam of email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Statussen</SelectItem>
              <SelectItem value="actief">Actief</SelectItem>
              <SelectItem value="inactief">Inactief</SelectItem>
              <SelectItem value="verlof">Verlof</SelectItem>
            </SelectContent>
          </Select>

          <Select value={documentFilter} onValueChange={setDocumentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Document filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Documenten</SelectItem>
              <SelectItem value="expired">Verlopen</SelectItem>
              <SelectItem value="expiring">Verloopt Binnenkort</SelectItem>
            </SelectContent>
          </Select>

          {selectedMembers.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Bulk Acties ({selectedMembers.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporteer naar Finqle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("invite")}>
                  <Mail className="h-4 w-4 mr-2" />
                  Stuur Finqle Uitnodiging
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction("deactivate")}
                >
                  Deactiveer Geselecteerde
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>

      {/* Team Members List */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                    className="mt-1"
                  />
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.email} • {member.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      member.status === "actief"
                        ? "success"
                        : member.status === "verlof"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {member.status}
                  </Badge>
                  {getFinqleStatusBadge(member.finqleStatus)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        Bekijk Profiel
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Planning Bekijken
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Finqle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Deactiveer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Documents */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Documenten
                  </p>
                  <div className="space-y-1">
                    {member.documents.slice(0, 3).map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs"
                      >
                        {doc.status === "geldig" ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : doc.status === "verloopt" ? (
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span
                          className={
                            doc.status !== "geldig"
                              ? "text-muted-foreground"
                              : ""
                          }
                        >
                          {doc.type}
                        </span>
                      </div>
                    ))}
                    {member.documents.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{member.documents.length - 3} meer
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Vaardigheden
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Performance */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Prestaties
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {member.performance.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / 5.0
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.performance.completedShifts} shifts •{" "}
                      {member.performance.hoursWorked} uur
                    </p>
                    {member.performance.lastShift && (
                      <p className="text-xs text-muted-foreground">
                        Laatste:{" "}
                        {new Date(
                          member.performance.lastShift,
                        ).toLocaleDateString("nl-NL")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Beschikbaarheid
                  </p>
                  <div className="space-y-1">
                    <Progress
                      value={
                        (getAvailabilityCount(member.availability) / 7) * 100
                      }
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {getAvailabilityCount(member.availability)} dagen per week
                    </p>
                    <div className="flex gap-1">
                      {Object.entries(member.availability).map(
                        ([day, available]) => (
                          <div
                            key={day}
                            className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                              available
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                            title={day}
                          >
                            {day[0].toUpperCase()}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              {member.finqleStatus === "not_started" && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Dit teamlid moet nog worden uitgenodigd voor Finqle direct
                      payment
                    </p>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Stuur Finqle Uitnodiging
                    </Button>
                  </div>
                </div>
              )}

              {member.documents.some((d) => d.status !== "geldig") && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-orange-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {
                        member.documents.filter((d) => d.status === "verlopen")
                          .length
                      }{" "}
                      document(en) verlopen,{" "}
                      {
                        member.documents.filter((d) => d.status === "verloopt")
                          .length
                      }{" "}
                      verloopt binnenkort
                    </p>
                    <Button size="sm" variant="outline">
                      Herinner Teamlid
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Geen teamleden gevonden</h3>
            <p className="text-muted-foreground">
              Pas je filters aan of voeg nieuwe teamleden toe
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Teamlid Toevoegen
            </Button>
          </div>
        </Card>
      )}
    </BedrijfDashboardLayout>
  );
}
