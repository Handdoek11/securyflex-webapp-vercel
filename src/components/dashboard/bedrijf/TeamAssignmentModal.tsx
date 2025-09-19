"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Euro,
  MapPin,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

interface TeamMember {
  id: string;
  zzpId: string;
  name: string;
  email: string;
  image?: string;
  specialisaties: string[];
  certificaten: string[];
  uurtarief: number;
  rating?: number;
  status: string;
  finqleOnboarded: boolean;
  activeAssignments: number;
}

interface Opdracht {
  id: string;
  titel: string;
  locatie: string;
  startDatum: Date;
  eindDatum: Date;
  aantalBeveiligers: number;
  uurtarief: number;
  status: string;
}

interface TeamAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  opdracht: Opdracht;
  onAssignmentComplete?: () => void;
}

export function TeamAssignmentModal({
  isOpen,
  onClose,
  opdracht,
  onAssignmentComplete,
}: TeamAssignmentModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [currentAssignments, setCurrentAssignments] = useState(0);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bedrijf/team");
      const data = await response.json();

      if (data.success) {
        // Filter only active members who are Finqle onboarded
        const activeMembers = data.data.teamMembers.filter(
          (member: TeamMember) => member.status === "ACTIVE",
        );
        setTeamMembers(activeMembers);
      } else {
        toast.error("Kon teamleden niet laden");
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Er ging iets mis bij het laden van teamleden");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentAssignments = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/bedrijf/team/assign?opdrachtId=${opdracht.id}`,
      );
      const data = await response.json();

      if (data.success) {
        setCurrentAssignments(
          data.data.stats.assigned + data.data.stats.confirmed,
        );
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }, [opdracht.id]);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
      fetchCurrentAssignments();
    }
  }, [isOpen, fetchTeamMembers, fetchCurrentAssignments]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      }

      // Check if we're not exceeding the limit
      const remainingSpots = opdracht.aantalBeveiligers - currentAssignments;
      if (prev.length >= remainingSpots) {
        toast.error(
          `Maximum ${opdracht.aantalBeveiligers} beveiligers voor deze opdracht`,
        );
        return prev;
      }

      return [...prev, memberId];
    });
  };

  const handleAssign = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Selecteer minimaal één teamlid");
      return;
    }

    try {
      setAssigning(true);

      const response = await fetch("/api/bedrijf/team/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opdrachtId: opdracht.id,
          teamMemberIds: selectedMembers,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        onAssignmentComplete?.();
        onClose();
      } else {
        toast.error(data.error || "Kon team niet toewijzen");
      }
    } catch (error) {
      console.error("Error assigning team:", error);
      toast.error("Er ging iets mis bij het toewijzen");
    } finally {
      setAssigning(false);
    }
  };

  const remainingSpots = opdracht.aantalBeveiligers - currentAssignments;
  const estimatedHours = Math.floor(
    (new Date(opdracht.eindDatum).getTime() -
      new Date(opdracht.startDatum).getTime()) /
      (1000 * 60 * 60),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Team Toewijzen</DialogTitle>
          <DialogDescription>
            Selecteer teamleden voor deze opdracht
          </DialogDescription>
        </DialogHeader>

        {/* Opdracht Details */}
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2">
            <h3 className="font-semibold">{opdracht.titel}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {opdracht.locatie}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {currentAssignments}/{opdracht.aantalBeveiligers} toegewezen
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(opdracht.startDatum).toLocaleDateString("nl-NL")}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {estimatedHours} uur
              </div>
            </div>
            {remainingSpots > 0 ? (
              <Badge variant="secondary" className="w-fit">
                Nog {remainingSpots} {remainingSpots === 1 ? "plek" : "plekken"}{" "}
                beschikbaar
              </Badge>
            ) : (
              <Badge variant="destructive" className="w-fit">
                Volledig bezet
              </Badge>
            )}
          </div>
        </Card>

        {/* Team Members List */}
        <ScrollArea className="h-[350px] pr-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Geen actieve teamleden gevonden</p>
              <p className="text-sm mt-1">
                Nodig eerst ZZP'ers uit voor je team
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <Card
                  key={member.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedMembers.includes(member.id)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleMemberToggle(member.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                      disabled={
                        !selectedMembers.includes(member.id) &&
                        remainingSpots === 0
                      }
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{member.name}</span>
                          {member.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{member.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            €{member.uurtarief}/uur
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {member.certificaten.slice(0, 3).map((cert) => (
                          <Badge
                            key={cert}
                            variant="outline"
                            className="text-xs"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                        {member.certificaten.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.certificaten.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {member.activeAssignments} actieve opdrachten
                        </span>
                        {member.finqleOnboarded ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Finqle ready
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-600">
                            <AlertCircle className="h-3 w-3" />
                            Finqle onboarding vereist
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedMembers.length > 0 && (
                <span>{selectedMembers.length} geselecteerd</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={assigning}>
                Annuleren
              </Button>
              <Button
                onClick={handleAssign}
                disabled={
                  selectedMembers.length === 0 ||
                  remainingSpots === 0 ||
                  assigning
                }
              >
                {assigning ? "Toewijzen..." : "Team Toewijzen"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
