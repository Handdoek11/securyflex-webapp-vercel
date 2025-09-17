"use client";

import { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Shield,
  Phone,
  Filter,
  UserCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  photo?: string;
  status: "available" | "busy" | "offline" | "break";
  currentShift?: {
    location: string;
    endTime: string;
    client: string;
  };
  rating: number;
  location: string;
  distance?: number;
  skills: string[];
  completedShifts: number;
  noShowRate: number;
  finqleOnboarded: boolean;
  directPaymentOptIn: boolean;
  documentsValid: boolean;
  phoneNumber?: string;
}

interface TeamAvailabilityProps {
  bedrijfId?: string;
  onAssign?: (memberId: string) => void;
  filterLocation?: string;
}

export function TeamAvailability({ bedrijfId, onAssign, filterLocation }: TeamAvailabilityProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "busy" | "offline">("all");
  const [filterSkill, setFilterSkill] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - will be replaced with real API
  useEffect(() => {
    setTeamMembers([
      {
        id: "1",
        name: "Jan de Vries",
        photo: "/avatars/jan.jpg",
        status: "available",
        rating: 4.8,
        location: "Amsterdam",
        distance: 5.2,
        skills: ["Evenement", "VIP", "Engels"],
        completedShifts: 156,
        noShowRate: 0.5,
        finqleOnboarded: true,
        directPaymentOptIn: true,
        documentsValid: true,
        phoneNumber: "06-12345678"
      },
      {
        id: "2",
        name: "Maria Jansen",
        photo: "/avatars/maria.jpg",
        status: "available",
        rating: 4.9,
        location: "Schiphol",
        distance: 12.3,
        skills: ["Airport", "Engels", "Receptie"],
        completedShifts: 234,
        noShowRate: 0.0,
        finqleOnboarded: true,
        directPaymentOptIn: true,
        documentsValid: true,
        phoneNumber: "06-87654321"
      },
      {
        id: "3",
        name: "Ahmed Hassan",
        status: "busy",
        currentShift: {
          location: "RAI Amsterdam",
          endTime: "16:00",
          client: "RAI Events"
        },
        rating: 4.7,
        location: "Utrecht",
        distance: 25.1,
        skills: ["Crowd Control", "Evenement", "EHBO"],
        completedShifts: 89,
        noShowRate: 1.2,
        finqleOnboarded: true,
        directPaymentOptIn: false,
        documentsValid: true,
        phoneNumber: "06-11223344"
      },
      {
        id: "4",
        name: "Lisa van Berg",
        status: "available",
        rating: 4.6,
        location: "Amsterdam Noord",
        distance: 8.7,
        skills: ["Receptie", "VIP", "Duits"],
        completedShifts: 67,
        noShowRate: 0.8,
        finqleOnboarded: true,
        directPaymentOptIn: true,
        documentsValid: false, // Document expiry warning
        phoneNumber: "06-99887766"
      },
      {
        id: "5",
        name: "Mohammed Al-Rashid",
        status: "break",
        rating: 4.5,
        location: "Den Haag",
        distance: 45.3,
        skills: ["Object", "Surveillance", "Arabisch"],
        completedShifts: 203,
        noShowRate: 0.3,
        finqleOnboarded: false, // Not onboarded with Finqle
        directPaymentOptIn: false,
        documentsValid: true,
        phoneNumber: "06-55443322"
      },
      {
        id: "6",
        name: "Sophie de Wit",
        status: "offline",
        rating: 4.8,
        location: "Rotterdam",
        distance: 56.2,
        skills: ["Horeca", "Evenement", "Frans"],
        completedShifts: 145,
        noShowRate: 0.6,
        finqleOnboarded: true,
        directPaymentOptIn: true,
        documentsValid: true,
        phoneNumber: "06-77665544"
      }
    ]);
    setIsLoading(false);
  }, [bedrijfId, filterLocation]);

  const filteredMembers = teamMembers.filter(member => {
    if (filterStatus !== "all" && member.status !== filterStatus) return false;
    if (filterSkill !== "all" && !member.skills.includes(filterSkill)) return false;
    return true;
  });

  const stats = {
    total: teamMembers.length,
    available: teamMembers.filter(m => m.status === "available").length,
    busy: teamMembers.filter(m => m.status === "busy").length,
    offline: teamMembers.filter(m => m.status === "offline").length,
    finqleOnboarded: teamMembers.filter(m => m.finqleOnboarded).length,
    documentsExpiring: teamMembers.filter(m => !m.documentsValid).length
  };

  const allSkills = Array.from(new Set(teamMembers.flatMap(m => m.skills)));

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-amber-500";
      case "break":
        return "bg-blue-500";
      case "offline":
        return "bg-gray-400";
    }
  };

  const getStatusLabel = (status: TeamMember["status"]) => {
    switch (status) {
      case "available":
        return "Beschikbaar";
      case "busy":
        return "Bezet";
      case "break":
        return "Pauze";
      case "offline":
        return "Offline";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Beschikbaarheid
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.available} van {stats.total} beschikbaar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="available">Beschikbaar</SelectItem>
                <SelectItem value="busy">Bezet</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle skills</SelectItem>
                {allSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{stats.available} Beschikbaar</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-amber-500 rounded-full" />
              <span className="text-sm font-medium">{stats.busy} Bezet</span>
            </div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">{stats.finqleOnboarded} Finqle</span>
            </div>
          </div>
          {stats.documentsExpiring > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{stats.documentsExpiring} Docs</span>
              </div>
            </div>
          )}
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.photo} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {member.name}
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(member.status)}`} />
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {getStatusLabel(member.status)}
                        {member.currentShift && (
                          <span> tot {member.currentShift.endTime}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{member.rating}</span>
                    </div>
                  </div>

                  {/* Location and Distance */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {member.location}
                      {member.distance && ` (${member.distance}km)`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {member.completedShifts} shifts
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center gap-2 mt-2">
                    {member.finqleOnboarded ? (
                      <Badge variant="success" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finqle
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Finqle setup
                      </Badge>
                    )}

                    {member.directPaymentOptIn && (
                      <Badge variant="outline" className="text-xs">
                        Direct pay
                      </Badge>
                    )}

                    {!member.documentsValid && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Docs
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  {member.status === "available" && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => onAssign?.(member.id)}
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Toewijzen
                      </Button>
                      {member.phoneNumber && (
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}

                  {member.currentShift && (
                    <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                      Nu bij: {member.currentShift.client} - {member.currentShift.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Gemiddelde beschikbaarheid: <span className="font-semibold">
              {Math.round((stats.available / stats.total) * 100)}%
            </span>
          </p>
          <Button variant="outline">
            Team beheren
          </Button>
        </div>
      </div>
    </Card>
  );
}