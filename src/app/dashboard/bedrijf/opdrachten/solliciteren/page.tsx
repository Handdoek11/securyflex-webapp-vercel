"use client";

import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Search,
  Send,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExternalOpdracht {
  id: string;
  title: string;
  client: string;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  requiredBeveiligers: number;
  applicants: number;
  hourlyRate: number;
  totalValue: number;
  skills: string[];
  urgency: "normal" | "urgent" | "critical";
  directPayment: boolean;
  matchScore: number;
  description?: string;
}

interface TeamMember {
  id: string;
  name: string;
  available: boolean;
  skills: string[];
  rating: number;
  location: string;
  finqleOnboarded: boolean;
}

export default function BedrijfOpdrachtSolliciterenPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showOnlyDirectPayment, setShowOnlyDirectPayment] = useState(false);
  const [selectedOpdracht, setSelectedOpdracht] =
    useState<ExternalOpdracht | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Mock data - will be replaced with API
  const opdrachten: ExternalOpdracht[] = [
    {
      id: "1",
      title: "Schiphol Terminal 3 - Nachtdienst",
      client: "Schiphol Security B.V.",
      location: "Schiphol",
      date: new Date(Date.now() + 86400000),
      startTime: "23:00",
      endTime: "07:00",
      requiredBeveiligers: 4,
      applicants: 2,
      hourlyRate: 32,
      totalValue: 1024,
      skills: ["Airport Security", "Engels", "Nachtdienst"],
      urgency: "urgent",
      directPayment: true,
      matchScore: 95,
      description:
        "Beveiliging van Terminal 3 tijdens nachtelijke uren. VOG en Schiphol pas vereist.",
    },
    {
      id: "2",
      title: "Ajax - Johan Cruijff ArenA",
      client: "Ajax Events",
      location: "Amsterdam Zuidoost",
      date: new Date(Date.now() + 3 * 86400000),
      startTime: "18:00",
      endTime: "23:30",
      requiredBeveiligers: 8,
      applicants: 5,
      hourlyRate: 28,
      totalValue: 1232,
      skills: ["Evenement", "Crowd Control", "EHBO"],
      urgency: "normal",
      directPayment: true,
      matchScore: 88,
    },
    {
      id: "3",
      title: "RAI Beurs Beveiliging",
      client: "RAI Amsterdam",
      location: "Amsterdam RAI",
      date: new Date(Date.now() + 2 * 86400000),
      startTime: "08:00",
      endTime: "18:00",
      requiredBeveiligers: 6,
      applicants: 8,
      hourlyRate: 26,
      totalValue: 1560,
      skills: ["Receptie", "Engels", "Klantvriendelijk"],
      urgency: "normal",
      directPayment: false,
      matchScore: 75,
    },
    {
      id: "4",
      title: "VIP Begeleiding - Private Event",
      client: "Elite Security Services",
      location: "Amsterdam Centrum",
      date: new Date(Date.now() + 86400000),
      startTime: "20:00",
      endTime: "02:00",
      requiredBeveiligers: 2,
      applicants: 0,
      hourlyRate: 45,
      totalValue: 540,
      skills: ["VIP", "Discrete", "Engels", "Rijbewijs"],
      urgency: "critical",
      directPayment: true,
      matchScore: 92,
    },
  ];

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Jan de Vries",
      available: true,
      skills: ["Airport Security", "Engels", "Nachtdienst"],
      rating: 4.8,
      location: "Amsterdam",
      finqleOnboarded: true,
    },
    {
      id: "2",
      name: "Maria Jansen",
      available: true,
      skills: ["Evenement", "EHBO", "Crowd Control"],
      rating: 4.9,
      location: "Amsterdam",
      finqleOnboarded: true,
    },
    {
      id: "3",
      name: "Ahmed Hassan",
      available: false,
      skills: ["VIP", "Engels", "Discrete"],
      rating: 4.7,
      location: "Utrecht",
      finqleOnboarded: true,
    },
    {
      id: "4",
      name: "Lisa van Berg",
      available: true,
      skills: ["Receptie", "Engels", "Klantvriendelijk"],
      rating: 4.6,
      location: "Amsterdam Noord",
      finqleOnboarded: false,
    },
  ];

  const getUrgencyBadge = (urgency: ExternalOpdracht["urgency"]) => {
    switch (urgency) {
      case "critical":
        return <Badge className="bg-red-500">Kritiek</Badge>;
      case "urgent":
        return <Badge className="bg-amber-500">Urgent</Badge>;
      default:
        return null;
    }
  };

  const getMatchBadge = (score: number) => {
    if (score >= 90) {
      return <Badge variant="default">Perfect match</Badge>;
    } else if (score >= 75) {
      return <Badge variant="secondary">Goede match</Badge>;
    }
    return null;
  };

  const handleApplication = () => {
    if (selectedOpdracht && selectedTeamMembers.length > 0) {
      // Handle application submission
      console.log(
        "Applying for:",
        selectedOpdracht.id,
        "with team:",
        selectedTeamMembers,
      );
      setShowApplicationModal(false);
      setSelectedTeamMembers([]);
      setSelectedOpdracht(null);
    }
  };

  const availableTeamForOpdracht = (opdracht: ExternalOpdracht) => {
    return teamMembers.filter((member) => {
      if (!member.available) return false;
      // Check if member has at least one matching skill
      return opdracht.skills.some((skill) => member.skills.includes(skill));
    });
  };

  return (
    <BedrijfDashboardLayout
      title="Beschikbare Opdrachten"
      subtitle="Solliciteer met je team op externe opdrachten"
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="outline">{opdrachten.length} opdrachten</Badge>
          <Badge variant="default">
            {teamMembers.filter((m) => m.available).length} beschikbaar
          </Badge>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Zoeken</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  className="pl-9"
                  placeholder="Zoek opdrachten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <Label htmlFor="location">Locatie</Label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger id="location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle locaties</SelectItem>
                  <SelectItem value="amsterdam">Amsterdam</SelectItem>
                  <SelectItem value="schiphol">Schiphol</SelectItem>
                  <SelectItem value="utrecht">Utrecht</SelectItem>
                  <SelectItem value="rotterdam">Rotterdam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <Label htmlFor="category">Categorie</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle categorieën</SelectItem>
                  <SelectItem value="evenement">Evenement</SelectItem>
                  <SelectItem value="airport">Airport</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="receptie">Receptie</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="direct-payment"
                checked={showOnlyDirectPayment}
                onCheckedChange={(checked) =>
                  setShowOnlyDirectPayment(checked as boolean)
                }
              />
              <Label htmlFor="direct-payment" className="cursor-pointer">
                Alleen Direct Payment
              </Label>
            </div>
          </div>
        </Card>

        {/* Alert for urgent opdrachten */}
        {opdrachten.filter((o) => o.urgency === "critical").length > 0 && (
          <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-200">
                  {opdrachten.filter((o) => o.urgency === "critical").length}{" "}
                  kritieke opdracht
                  {opdrachten.filter((o) => o.urgency === "critical").length > 1
                    ? "en"
                    : ""}{" "}
                  vereisen directe actie
                </p>
              </div>
              <Button size="sm" variant="destructive">
                Direct bekijken
              </Button>
            </div>
          </Card>
        )}

        {/* Opdrachten Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {opdrachten.map((opdracht) => {
            const availableTeam = availableTeamForOpdracht(opdracht);

            return (
              <Card
                key={opdracht.id}
                className="p-4 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {opdracht.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4" />
                        {opdracht.client}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getUrgencyBadge(opdracht.urgency)}
                      {getMatchBadge(opdracht.matchScore)}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{opdracht.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{opdracht.date.toLocaleDateString("nl-NL")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {opdracht.startTime} - {opdracht.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{opdracht.requiredBeveiligers} beveiligers</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {opdracht.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Financial & Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="text-2xl font-bold">
                        €{opdracht.hourlyRate}/uur
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Totaal: €{opdracht.totalValue.toLocaleString("nl-NL")}
                      </p>
                    </div>
                    {opdracht.directPayment && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Direct Payment
                      </Badge>
                    )}
                  </div>

                  {/* Team Match */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Jouw team: </span>
                      <span
                        className={
                          availableTeam.length >= opdracht.requiredBeveiligers
                            ? "text-green-600 font-medium"
                            : "text-amber-600 font-medium"
                        }
                      >
                        {availableTeam.length} beschikbaar
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {opdracht.requiredBeveiligers} nodig
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {opdracht.applicants} sollicitaties
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedOpdracht(opdracht)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={availableTeam.length === 0}
                      onClick={() => {
                        setSelectedOpdracht(opdracht);
                        setShowApplicationModal(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Solliciteren
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Application Modal */}
        <Dialog
          open={showApplicationModal}
          onOpenChange={setShowApplicationModal}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Team Selecteren voor Sollicitatie</DialogTitle>
              <DialogDescription>
                {selectedOpdracht && (
                  <>
                    Selecteer team leden voor:{" "}
                    <strong>{selectedOpdracht.title}</strong>
                    <br />
                    Benodigde beveiligers:{" "}
                    {selectedOpdracht.requiredBeveiligers}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4 max-h-96 overflow-y-auto">
              {selectedOpdracht &&
                availableTeamForOpdracht(selectedOpdracht).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedTeamMembers.includes(member.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTeamMembers([
                              ...selectedTeamMembers,
                              member.id,
                            ]);
                          } else {
                            setSelectedTeamMembers(
                              selectedTeamMembers.filter(
                                (id) => id !== member.id,
                              ),
                            );
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3" />
                          <span>{member.rating}</span>
                          <span>•</span>
                          <span>{member.location}</span>
                          {!member.finqleOnboarded && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600">
                                Finqle setup nodig
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {member.skills.slice(0, 2).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {selectedOpdracht && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm">
                  <strong>Geselecteerd:</strong> {selectedTeamMembers.length}{" "}
                  van {selectedOpdracht.requiredBeveiligers} beveiligers
                </p>
                {selectedOpdracht.directPayment && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Direct payment beschikbaar via Finqle
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApplicationModal(false)}
              >
                Annuleren
              </Button>
              <Button
                onClick={handleApplication}
                disabled={
                  selectedTeamMembers.length === 0 ||
                  (selectedOpdracht &&
                    selectedTeamMembers.length >
                      selectedOpdracht.requiredBeveiligers)
                }
              >
                Sollicitatie versturen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BedrijfDashboardLayout>
  );
}
