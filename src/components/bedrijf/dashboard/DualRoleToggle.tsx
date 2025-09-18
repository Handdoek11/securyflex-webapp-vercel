"use client";

import { ArrowRightLeft, Briefcase, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BedrijfRole = "opdrachtgever" | "leverancier";

interface DualRoleToggleProps {
  currentRole: BedrijfRole;
  onRoleChange: (role: BedrijfRole) => void;
  className?: string;
  stats?: {
    activeAsOpdrachtgever?: number;
    activeAsLeverancier?: number;
  };
}

export function DualRoleToggle({
  currentRole,
  onRoleChange,
  className,
  stats,
}: DualRoleToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-muted rounded-lg p-1",
        className,
      )}
    >
      <Button
        variant={currentRole === "leverancier" ? "default" : "ghost"}
        size="sm"
        onClick={() => onRoleChange("leverancier")}
        className="gap-2 flex-1"
      >
        <Users className="h-4 w-4" />
        <span>Leverancier</span>
        {stats?.activeAsLeverancier && stats.activeAsLeverancier > 0 && (
          <Badge variant="secondary" className="ml-1">
            {stats.activeAsLeverancier}
          </Badge>
        )}
      </Button>

      <div className="text-muted-foreground">
        <ArrowRightLeft className="h-4 w-4" />
      </div>

      <Button
        variant={currentRole === "opdrachtgever" ? "default" : "ghost"}
        size="sm"
        onClick={() => onRoleChange("opdrachtgever")}
        className="gap-2 flex-1"
      >
        <Briefcase className="h-4 w-4" />
        <span>Opdrachtgever</span>
        {stats?.activeAsOpdrachtgever && stats.activeAsOpdrachtgever > 0 && (
          <Badge variant="secondary" className="ml-1">
            {stats.activeAsOpdrachtgever}
          </Badge>
        )}
      </Button>
    </div>
  );
}
