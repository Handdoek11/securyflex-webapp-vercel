"use client";

import { Building2, Factory, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { roleToast } from "@/components/ui/toast";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

interface RoleSwitcherProps {
  variant?: "default" | "mobile";
}

export function RoleSwitcher({ variant = "default" }: RoleSwitcherProps) {
  const { activeRole, setActiveRole } = useRole();
  const router = useRouter();

  // Handle role change with URL update
  const handleRoleChange = (
    roleId: "ZZP_BEVEILIGER" | "BEDRIJF" | "OPDRACHTGEVER",
  ) => {
    setActiveRole(roleId);

    // Show toast notification based on role
    switch (roleId) {
      case "ZZP_BEVEILIGER":
        roleToast.switchToBeveiliger();
        break;
      case "BEDRIJF":
        roleToast.switchToBedrijf();
        break;
      case "OPDRACHTGEVER":
        roleToast.switchToOpdrachtgever();
        break;
    }

    // Update URL with appropriate parameter
    const roleParam =
      roleId === "ZZP_BEVEILIGER"
        ? "beveiligers"
        : roleId === "BEDRIJF"
          ? "beveiligingsbedrijven"
          : roleId === "OPDRACHTGEVER"
            ? "opdrachtgevers"
            : "";

    if (roleParam) {
      router.push(`/?role=${roleParam}`);
    }
  };

  const roles = [
    {
      id: "ZZP_BEVEILIGER" as const,
      label: "Beveiliger",
      shortLabel: "Beveiliger",
      icon: Shield,
      description: "Vind shifts en werk flexibel",
    },
    {
      id: "BEDRIJF" as const,
      label: "Beveiligingsbedrijf",
      shortLabel: "Bedrijf",
      icon: Building2,
      description: "Manage je team",
    },
    {
      id: "OPDRACHTGEVER" as const,
      label: "Opdrachtgever",
      shortLabel: "Klant",
      icon: Factory,
      description: "Boek beveiliging",
    },
  ];

  // Mobile variant - compact without icons
  if (variant === "mobile") {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 inline-flex text-xs">
        {roles.map((role) => {
          const isActive = activeRole === role.id;

          return (
            <button
              key={role.id}
              onClick={() => handleRoleChange(role.id)}
              className={cn(
                "px-3 py-1.5 rounded-full transition-all duration-200",
                "text-xs font-medium",
                isActive
                  ? "bg-white dark:bg-gray-900 text-primary shadow-md shadow-primary/15 ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/30",
              )}
            >
              {role.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  // Default desktop variant with icons
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 inline-flex">
      {roles.map((role) => {
        const Icon = role.icon;
        const isActive = activeRole === role.id;

        return (
          <button
            key={role.id}
            onClick={() => handleRoleChange(role.id)}
            className={cn(
              "px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2",
              "text-sm font-medium",
              isActive
                ? "bg-white dark:bg-gray-900 text-primary shadow-lg shadow-primary/20 ring-2 ring-primary/10 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 hover:shadow-md hover:scale-102",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{role.label}</span>
          </button>
        );
      })}
    </div>
  );
}
