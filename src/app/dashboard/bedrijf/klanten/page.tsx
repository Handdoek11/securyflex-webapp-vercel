"use client";

import { useState } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Euro,
  FileText,
  TrendingUp,
  Clock,
  Shield,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Star,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";

interface Client {
  id: string;
  name: string;
  type: "corporate" | "event" | "retail" | "government";
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "inactive" | "prospect";
  contractValue: number;
  activeAssignments: number;
  completedAssignments: number;
  rating: number;
  paymentTerms: number;
  finqleEnabled: boolean;
  lastAssignment?: string;
  upcomingAssignments: {
    date: string;
    location: string;
    guards: number;
  }[];
}

export default function BedrijfKlantenPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Mock data
  const clients: Client[] = [
    {
      id: "1",
      name: "Amsterdam RAI",
      type: "event",
      contactPerson: "Peter van Dijk",
      email: "p.vandijk@rai.nl",
      phone: "020-5491212",
      location: "Amsterdam",
      status: "active",
      contractValue: 450000,
      activeAssignments: 3,
      completedAssignments: 47,
      rating: 4.8,
      paymentTerms: 30,
      finqleEnabled: true,
      lastAssignment: "2025-01-14",
      upcomingAssignments: [
        { date: "2025-01-20", location: "Hal 5", guards: 12 },
        { date: "2025-01-25", location: "Europa Complex", guards: 8 },
        { date: "2025-02-01", location: "Hal 1-3", guards: 20 }
      ]
    },
    {
      id: "2",
      name: "Gemeente Rotterdam",
      type: "government",
      contactPerson: "Linda Bakker",
      email: "l.bakker@rotterdam.nl",
      phone: "010-2671000",
      location: "Rotterdam",
      status: "active",
      contractValue: 780000,
      activeAssignments: 5,
      completedAssignments: 123,
      rating: 4.6,
      paymentTerms: 60,
      finqleEnabled: false,
      lastAssignment: "2025-01-15",
      upcomingAssignments: [
        { date: "2025-01-18", location: "Stadskantoor", guards: 4 },
        { date: "2025-01-22", location: "Haven", guards: 6 }
      ]
    },
    {
      id: "3",
      name: "Media Markt BV",
      type: "retail",
      contactPerson: "Mark de Vries",
      email: "mark.devries@mediamarkt.nl",
      phone: "088-1234567",
      location: "Utrecht",
      status: "active",
      contractValue: 220000,
      activeAssignments: 8,
      completedAssignments: 89,
      rating: 4.3,
      paymentTerms: 45,
      finqleEnabled: true,
      lastAssignment: "2025-01-13",
      upcomingAssignments: [
        { date: "2025-01-17", location: "Utrecht Centrum", guards: 2 },
        { date: "2025-01-19", location: "Amsterdam Noord", guards: 2 }
      ]
    },
    {
      id: "4",
      name: "ING Bank",
      type: "corporate",
      contactPerson: "Sophie Jansen",
      email: "s.jansen@ing.nl",
      phone: "020-5639111",
      location: "Amsterdam",
      status: "prospect",
      contractValue: 0,
      activeAssignments: 0,
      completedAssignments: 0,
      rating: 0,
      paymentTerms: 30,
      finqleEnabled: false,
      upcomingAssignments: []
    }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesType = typeFilter === "all" || client.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalContractValue = clients
    .filter(c => c.status === "active")
    .reduce((sum, c) => sum + c.contractValue, 0);

  const getTypeIcon = (type: Client["type"]) => {
    switch (type) {
      case "corporate": return "🏢";
      case "event": return "🎪";
      case "retail": return "🏪";
      case "government": return "🏛️";
    }
  };

  const getTypeName = (type: Client["type"]) => {
    switch (type) {
      case "corporate": return "Zakelijk";
      case "event": return "Evenement";
      case "retail": return "Retail";
      case "government": return "Overheid";
    }
  };

  return (
    <BedrijfDashboardLayout
      title="Klanten"
      subtitle="Beheer je klantrelaties en contracten"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Klant
          </Button>
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Totaal Klanten</p>
              <p className="text-2xl font-semibold">{clients.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Actieve Klanten</p>
              <p className="text-2xl font-semibold">
                {clients.filter(c => c.status === "active").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contract Waarde</p>
              <p className="text-2xl font-semibold">
                €{(totalContractValue / 1000).toFixed(0)}K
              </p>
            </div>
            <Euro className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gem. Rating</p>
              <p className="text-2xl font-semibold flex items-center gap-1">
                4.6 <Star className="h-5 w-5 text-yellow-500" />
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek klant of contactpersoon..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Statussen</SelectItem>
              <SelectItem value="active">Actief</SelectItem>
              <SelectItem value="inactive">Inactief</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Types</SelectItem>
              <SelectItem value="corporate">Zakelijk</SelectItem>
              <SelectItem value="event">Evenement</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="government">Overheid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                  {getTypeIcon(client.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    <Badge variant={
                      client.status === "active" ? "success" :
                      client.status === "prospect" ? "warning" : "secondary"
                    }>
                      {client.status === "active" ? "Actief" :
                       client.status === "prospect" ? "Prospect" : "Inactief"}
                    </Badge>
                    {client.finqleEnabled && (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Finqle
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getTypeName(client.type)} • {client.location}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Betaaltermijn: {client.paymentTerms} dagen
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Bekijk Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="h-4 w-4 mr-2" />
                    Nieuwe Opdracht
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Finqle
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Contract Bewerken
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="font-medium">{client.contactPerson}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contract Waarde</p>
                <p className="font-medium">€{client.contractValue.toLocaleString("nl-NL")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actieve Opdrachten</p>
                <p className="font-medium">{client.activeAssignments}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Voltooid</p>
                <p className="font-medium">{client.completedAssignments}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="font-medium flex items-center gap-1">
                  {client.rating > 0 ? (
                    <>
                      {client.rating}
                      <Star className="h-3 w-3 text-yellow-500" />
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </p>
              </div>
            </div>

            {/* Upcoming Assignments */}
            {client.upcomingAssignments.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Komende Opdrachten</p>
                <div className="space-y-2">
                  {client.upcomingAssignments.slice(0, 2).map((assignment, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(assignment.date).toLocaleDateString("nl-NL")}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{assignment.location}</span>
                      </div>
                      <Badge variant="outline">
                        {assignment.guards} beveiligers
                      </Badge>
                    </div>
                  ))}
                  {client.upcomingAssignments.length > 2 && (
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      +{client.upcomingAssignments.length - 2} meer opdrachten
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Prospect CTA */}
            {client.status === "prospect" && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Deze prospect heeft nog geen opdrachten geplaatst
                  </p>
                  <Button size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Opnemen
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Geen klanten gevonden</h3>
            <p className="text-muted-foreground">
              Pas je filters aan of voeg een nieuwe klant toe
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Klant
            </Button>
          </div>
        </Card>
      )}
    </BedrijfDashboardLayout>
  );
}