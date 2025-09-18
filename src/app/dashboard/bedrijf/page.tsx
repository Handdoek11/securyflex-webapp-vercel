"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  FileText,
  MapPin,
  Plus,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type BedrijfRole = "opdrachtgever" | "leverancier";

export default function BedrijfDashboardPage() {
  const { data: session } = useSession();
  const [currentRole, _setCurrentRole] = useState<BedrijfRole>("leverancier");

  const companyName = session?.user?.name || "Guardian Security B.V.";

  // Mock data - will be replaced with real API calls
  const stats = {
    activeBeveiligers: 24,
    beschikbaarVandaag: 18,
    activeOpdrachten: 12,
    openstaandeShifts: 8,
    maandOmzet: 189456,
    maandMarge: 28.5,
    finqleKrediet: 125000,
    finqleGebruikt: 45000,
    teamBezetting: 87,
    klanttevredenheid: 4.6,
  };

  // Mock active shifts - combined view
  const activeShifts = [
    {
      id: 1,
      title: "Schiphol Terminal 2",
      type: "external", // external = wij leveren aan externe opdrachtgever
      client: "Schiphol Security",
      beveiligers: 4,
      assigned: 3,
      startTime: "14:00",
      endTime: "22:00",
      status: "partial",
      location: "Schiphol",
    },
    {
      id: 2,
      title: "Evenement Beveiliging RAI",
      type: "internal", // internal = wij hebben ZZP'ers ingehuurd
      client: "RAI Amsterdam",
      beveiligers: 6,
      assigned: 6,
      startTime: "18:00",
      endTime: "02:00",
      status: "full",
      location: "Amsterdam RAI",
    },
    {
      id: 3,
      title: "Ajax Training Complex",
      type: "external",
      client: "Ajax Events",
      beveiligers: 2,
      assigned: 1,
      startTime: "08:00",
      endTime: "16:00",
      status: "urgent",
      location: "Amsterdam",
    },
  ];

  // Mock team availability
  const teamAvailability = [
    {
      id: 1,
      name: "Jan de Vries",
      status: "available",
      rating: 4.8,
      location: "Amsterdam",
      skills: ["Evenement", "VIP"],
    },
    {
      id: 2,
      name: "Maria Jansen",
      status: "available",
      rating: 4.9,
      location: "Schiphol",
      skills: ["Airport", "Engels"],
    },
    {
      id: 3,
      name: "Ahmed Hassan",
      status: "busy",
      until: "16:00",
      rating: 4.7,
      location: "Utrecht",
      skills: ["Crowd Control"],
    },
    {
      id: 4,
      name: "Lisa van Berg",
      status: "available",
      rating: 4.6,
      location: "Amsterdam",
      skills: ["Receptie", "VIP"],
    },
  ];

  // Mock Finqle transactions
  const recentTransactions = [
    {
      id: 1,
      type: "payment",
      description: "Uitbetaling Jan de Vries - Week 37",
      amount: 1250,
      status: "completed",
      time: "2 uur geleden",
    },
    {
      id: 2,
      type: "invoice",
      description: "Factuur Schiphol Security",
      amount: 15892,
      status: "pending",
      time: "5 uur geleden",
    },
    {
      id: 3,
      type: "margin",
      description: "Platform marge Week 37",
      amount: 487,
      status: "completed",
      time: "1 dag geleden",
    },
  ];

  return (
    <BedrijfDashboardLayout
      title="Bedrijf Dashboard"
      subtitle={`Welkom terug, ${companyName}`}
      headerActions={
        <div className="flex items-center gap-2">
          {currentRole === "opdrachtgever" ? (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Plaats Opdracht
            </Button>
          ) : (
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Bekijk Opdrachten
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alert Banner for urgent matters */}
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                3 shifts voor morgen nog niet volledig gevuld
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                Ajax Training Complex heeft nog 1 beveiliger nodig voor de
                ochtendshift.
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-amber-700">
              Actie ondernemen
            </Button>
          </div>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Bezetting</p>
                <p className="text-2xl font-bold">{stats.teamBezetting}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.beschikbaarVandaag}/{stats.activeBeveiligers}{" "}
                  beschikbaar
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={stats.teamBezetting} className="mt-3 h-2" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Opdrachten
                </p>
                <p className="text-2xl font-bold">{stats.activeOpdrachten}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.openstaandeShifts} shifts open
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Badge variant="outline" className="text-xs">
                8 extern
              </Badge>
              <Badge variant="outline" className="text-xs">
                4 intern
              </Badge>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finqle Krediet</p>
                <p className="text-2xl font-bold">
                  €
                  {(
                    (stats.finqleKrediet - stats.finqleGebruikt) /
                    1000
                  ).toFixed(0)}
                  k
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Van €{(stats.finqleKrediet / 1000).toFixed(0)}k beschikbaar
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress
              value={(stats.finqleGebruikt / stats.finqleKrediet) * 100}
              className="mt-3 h-2"
            />
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maand Omzet</p>
                <p className="text-2xl font-bold">
                  €{(stats.maandOmzet / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stats.maandMarge}% marge
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Shifts - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Vandaag's Shifts
                </h3>
                <Badge variant="outline">{activeShifts.length} actief</Badge>
              </div>

              <div className="space-y-3">
                {activeShifts.map((shift) => (
                  <div key={shift.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{shift.title}</h4>
                          {shift.type === "internal" ? (
                            <Badge variant="secondary" className="text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              Wij plaatsen
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              Wij leveren
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {shift.client}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                            {shift.assigned}/{shift.beveiligers}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {shift.status === "full" && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Gevuld
                          </Badge>
                        )}
                        {shift.status === "partial" && (
                          <Badge className="bg-amber-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {shift.beveiligers - shift.assigned} open
                          </Badge>
                        )}
                        {shift.status === "urgent" && (
                          <Badge className="bg-red-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                    {shift.status !== "full" && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          Toewijzen
                        </Button>
                        {shift.type === "external" && (
                          <Button size="sm" className="flex-1">
                            Direct invullen
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                Alle shifts bekijken
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>

            {/* Team Availability */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Beschikbaarheid
                </h3>
                <Link href="/dashboard/bedrijf/team">
                  <Button variant="ghost" size="sm">
                    Zie alle
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                {teamAvailability.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          member.status === "available"
                            ? "bg-green-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {member.rating}
                          </span>
                          <span>•</span>
                          <span>{member.location}</span>
                          {member.status === "busy" && (
                            <>
                              <span>•</span>
                              <span>Vrij om {member.until}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
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
            </Card>
          </div>

          {/* Right Column - Finqle Status */}
          <div className="space-y-4">
            {/* Finqle Integration Card */}
            <Card className="p-4 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  Finqle Status
                </h3>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Kredietlimiet</span>
                    <span className="font-semibold">€125.000</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">Gebruikt</span>
                    <span className="font-semibold text-purple-600">
                      €45.000
                    </span>
                  </div>
                  <Progress
                    value={(45000 / 125000) * 100}
                    className="mt-2 h-2"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Recente Transacties</p>
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          €{transaction.amount.toLocaleString("nl-NL")}
                        </p>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "success"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {transaction.status === "completed"
                            ? "Voltooid"
                            : "In behandeling"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/bedrijf/finqle">
                    Finqle Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Snelle Acties</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/dashboard/bedrijf/opdrachten/plaatsen">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe opdracht plaatsen
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/dashboard/bedrijf/opdrachten/solliciteren">
                    <Eye className="h-4 w-4 mr-2" />
                    Beschikbare opdrachten
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/dashboard/bedrijf/team">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Team beheren
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/dashboard/bedrijf/planning">
                    <Calendar className="h-4 w-4 mr-2" />
                    Planning bekijken
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Performance Stats */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Fill Rate
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">96.2%</span>
                    <Badge variant="default" className="text-xs">
                      <TrendingUp className="h-3 w-3" />
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Klanttevredenheid
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">4.6/5</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    No-show Rate
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">0.8%</span>
                    <Badge variant="default" className="text-xs">
                      Laag
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Gem. Response
                  </span>
                  <span className="font-semibold">1.2 uur</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </BedrijfDashboardLayout>
  );
}
