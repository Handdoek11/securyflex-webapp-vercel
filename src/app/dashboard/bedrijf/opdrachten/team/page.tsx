"use client";

import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  Plus,
  Save,
  Search,
  Send,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

interface TeamOpdracht {
  id: string;
  titel: string;
  klant: string;
  locatie: string;
  startDatum: Date;
  eindDatum: Date;
  aantalBeveiligers: number;
  assignedTeam: number;
  openSpots: number;
  status: "draft" | "open" | "assigned" | "in_progress" | "completed";
  uurtarief: number;
  totalValue: number;
}

export default function BedrijfTeamOpdrachtenPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("nieuwe");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state voor nieuwe team opdracht
  const [titel, setTitel] = useState("");
  const [klant, setKlant] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [locatie, setLocatie] = useState("");
  const [startDatum, setStartDatum] = useState("");
  const [startTijd, setStartTijd] = useState("");
  const [eindDatum, setEindDatum] = useState("");
  const [eindTijd, setEindTijd] = useState("");
  const [aantalBeveiligers, setAantalBeveiligers] = useState("2");
  const [uurtarief, setUurtarief] = useState("28");
  const [vereisten, setVereisten] = useState("");
  const [openVoorZZP, setOpenVoorZZP] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // Mock team members
  const teamMembers = [
    {
      id: "1",
      name: "Jan de Vries",
      available: true,
      rating: 4.8,
      skills: ["Evenement", "Objectbeveiliging"],
    },
    {
      id: "2",
      name: "Piet Bakker",
      available: true,
      rating: 4.6,
      skills: ["Horeca", "Crowd Control"],
    },
    {
      id: "3",
      name: "Klaas Jansen",
      available: false,
      rating: 4.9,
      skills: ["VIP", "Persoonsbeveiliging"],
    },
    {
      id: "4",
      name: "Emma Smit",
      available: true,
      rating: 4.7,
      skills: ["Receptie", "Objectbeveiliging"],
    },
  ];

  // Mock team opdrachten
  const teamOpdrachten: TeamOpdracht[] = [
    {
      id: "1",
      titel: "Beveiliging Hoofdkantoor ABN",
      klant: "ABN AMRO",
      locatie: "Amsterdam Zuid",
      startDatum: new Date("2025-09-20"),
      eindDatum: new Date("2025-09-20"),
      aantalBeveiligers: 4,
      assignedTeam: 3,
      openSpots: 1,
      status: "open",
      uurtarief: 32,
      totalValue: 1024,
    },
    {
      id: "2",
      titel: "Evenement Security Ajax Arena",
      klant: "Ajax Amsterdam",
      locatie: "Amsterdam Arena",
      startDatum: new Date("2025-09-22"),
      eindDatum: new Date("2025-09-22"),
      aantalBeveiligers: 8,
      assignedTeam: 8,
      openSpots: 0,
      status: "assigned",
      uurtarief: 35,
      totalValue: 2240,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTeamMembers.length === 0 && !openVoorZZP) {
      toast.error("Selecteer team leden of sta externe ZZP'ers toe");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create team opdracht
      const opdrachtData = {
        titel,
        beschrijving,
        klant,
        locatie,
        startDatum: `${startDatum}T${startTijd}`,
        eindDatum: `${eindDatum}T${eindTijd}`,
        aantalBeveiligers: parseInt(aantalBeveiligers, 10),
        uurtarief: parseFloat(uurtarief),
        vereisten: vereisten
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v),
        creatorType: "BEDRIJF",
        targetAudience: openVoorZZP ? "BEIDEN" : "EIGEN_TEAM",
        directZZPAllowed: openVoorZZP,
        autoAccept: autoAssign,
        assignedTeamMembers: selectedTeamMembers,
      };

      console.log("Creating team opdracht:", opdrachtData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Team opdracht aangemaakt!");
      router.push("/dashboard/bedrijf/planning");
    } catch (error) {
      console.error("Error creating team opdracht:", error);
      toast.error("Kon opdracht niet aanmaken");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  return (
    <BedrijfDashboardLayout
      title="Team Opdrachten"
      subtitle="Beheer opdrachten voor je eigen team"
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="h-3 w-3" />
            Werkgever Mode
          </Badge>
        </div>
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nieuwe">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Opdracht
          </TabsTrigger>
          <TabsTrigger value="actief">
            <Clock className="h-4 w-4 mr-2" />
            Actieve Opdrachten (
            {teamOpdrachten.filter((o) => o.status !== "completed").length})
          </TabsTrigger>
          <TabsTrigger value="inhuur">
            <UserPlus className="h-4 w-4 mr-2" />
            ZZP Inhuur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nieuwe" className="space-y-6">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Klant Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Klant Informatie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="klant">Klant/Project Naam *</Label>
                    <Input
                      id="klant"
                      value={klant}
                      onChange={(e) => setKlant(e.target.value)}
                      placeholder="Bijv. ABN AMRO Hoofdkantoor"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="titel">Opdracht Titel *</Label>
                    <Input
                      id="titel"
                      value={titel}
                      onChange={(e) => setTitel(e.target.value)}
                      placeholder="Bijv. Objectbeveiliging Nachtdienst"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="beschrijving">Beschrijving</Label>
                  <Textarea
                    id="beschrijving"
                    value={beschrijving}
                    onChange={(e) => setBeschrijving(e.target.value)}
                    placeholder="Beschrijf de werkzaamheden..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Locatie & Tijd */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Locatie & Planning
                </h3>
                <div>
                  <Label htmlFor="locatie">Locatie *</Label>
                  <Input
                    id="locatie"
                    value={locatie}
                    onChange={(e) => setLocatie(e.target.value)}
                    placeholder="Volledig adres"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={startDatum}
                        onChange={(e) => setStartDatum(e.target.value)}
                        required
                      />
                      <Input
                        type="time"
                        value={startTijd}
                        onChange={(e) => setStartTijd(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Eind *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={eindDatum}
                        onChange={(e) => setEindDatum(e.target.value)}
                        required
                      />
                      <Input
                        type="time"
                        value={eindTijd}
                        onChange={(e) => setEindTijd(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Toewijzing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Toewijzing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aantalBeveiligers">
                      Aantal Beveiligers Nodig *
                    </Label>
                    <Input
                      id="aantalBeveiligers"
                      type="number"
                      min="1"
                      value={aantalBeveiligers}
                      onChange={(e) => setAantalBeveiligers(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="uurtarief">Uurtarief (€) *</Label>
                    <Input
                      id="uurtarief"
                      type="number"
                      step="0.50"
                      min="20"
                      value={uurtarief}
                      onChange={(e) => setUurtarief(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>
                    Selecteer Team Leden ({selectedTeamMembers.length}{" "}
                    geselecteerd)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {teamMembers.map((member) => (
                      <Card
                        key={member.id}
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedTeamMembers.includes(member.id)
                            ? "border-primary bg-primary/5"
                            : member.available
                              ? "hover:bg-muted"
                              : "opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          member.available && toggleTeamMember(member.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                ⭐ {member.rating}
                              </Badge>
                              {!member.available && (
                                <Badge variant="secondary" className="text-xs">
                                  Niet beschikbaar
                                </Badge>
                              )}
                            </div>
                          </div>
                          {selectedTeamMembers.includes(member.id) && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="openVoorZZP" className="font-medium">
                        Open voor externe ZZP'ers
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Sta externe ZZP'ers toe om te solliciteren
                      </p>
                    </div>
                    <Switch
                      id="openVoorZZP"
                      checked={openVoorZZP}
                      onCheckedChange={setOpenVoorZZP}
                    />
                  </div>

                  {openVoorZZP && (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <Label htmlFor="autoAssign" className="font-medium">
                          Auto-accepteer sollicitaties
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Accepteer automatisch de eerste {aantalBeveiligers}{" "}
                          gekwalificeerde ZZP'ers
                        </p>
                      </div>
                      <Switch
                        id="autoAssign"
                        checked={autoAssign}
                        onCheckedChange={setAutoAssign}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Vereisten
                </h3>
                <div>
                  <Label htmlFor="vereisten">
                    Benodigde Certificaten/Skills
                  </Label>
                  <Textarea
                    id="vereisten"
                    value={vereisten}
                    onChange={(e) => setVereisten(e.target.value)}
                    placeholder="Bijv. WPBR, BOA, EHBO (gescheiden door komma's)"
                    rows={2}
                  />
                </div>
              </div>

              {/* Summary */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Opdracht Samenvatting</span>
                  <Badge variant="outline">
                    {openVoorZZP ? "Open voor ZZP" : "Alleen eigen team"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Team leden:</span>
                    <span className="ml-2 font-medium">
                      {selectedTeamMembers.length} / {aantalBeveiligers}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Open plekken:</span>
                    <span className="ml-2 font-medium">
                      {Math.max(
                        0,
                        parseInt(aantalBeveiligers, 10) -
                          selectedTeamMembers.length,
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uurtarief:</span>
                    <span className="ml-2 font-medium">€{uurtarief}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Geschatte waarde:
                    </span>
                    <span className="ml-2 font-medium">
                      €
                      {(
                        parseFloat(uurtarief) *
                        parseInt(aantalBeveiligers, 10) *
                        8
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Annuleren
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Opslaan als concept
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Bezig..." : "Opdracht Aanmaken"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="actief" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Actieve Team Opdrachten</h3>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Zoek opdracht..."
                  className="w-64"
                  prefix={<Search className="h-4 w-4" />}
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {teamOpdrachten.map((opdracht) => (
                <Card
                  key={opdracht.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{opdracht.titel}</h4>
                        <Badge
                          variant={
                            opdracht.status === "assigned"
                              ? "default"
                              : "outline"
                          }
                        >
                          {opdracht.status === "assigned"
                            ? "Volledig bezet"
                            : "Open plekken"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {opdracht.klant}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {opdracht.locatie}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {opdracht.startDatum.toLocaleDateString("nl-NL")}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm">
                            {opdracht.assignedTeam}/{opdracht.aantalBeveiligers}{" "}
                            toegewezen
                          </span>
                        </div>
                        {opdracht.openSpots > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {opdracht.openSpots}{" "}
                            {opdracht.openSpots === 1 ? "plek" : "plekken"} open
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-lg font-semibold">
                        €{opdracht.totalValue}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        €{opdracht.uurtarief}/uur
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="inhuur" className="space-y-4">
          <Card className="p-6">
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                ZZP Inhuur Marktplaats
              </h3>
              <p className="text-muted-foreground mb-4">
                Vind gekwalificeerde ZZP beveiligers voor je team opdrachten
              </p>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Zoek Beschikbare ZZP'ers
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </BedrijfDashboardLayout>
  );
}
