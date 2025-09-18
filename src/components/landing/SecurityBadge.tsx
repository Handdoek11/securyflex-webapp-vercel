"use client";

import { Globe, Lock, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SecurityBadgeProps {
  type: "iso" | "gdpr" | "encryption" | "2fa";
  title: string;
  subtitle: string;
  description: string;
}

const badgeConfig = {
  iso: {
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  gdpr: {
    icon: Globe,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  encryption: {
    icon: Lock,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  "2fa": {
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
};

export function SecurityBadge({
  type,
  title,
  subtitle,
  description,
}: SecurityBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <Card
      className={`${config.bgColor} ${config.borderColor} border-2 transition-all hover:shadow-md`}
    >
      <CardContent className="p-4 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div
            className={`p-3 rounded-full ${config.bgColor} ${config.borderColor} border`}
          >
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>

          <div>
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="text-sm font-medium text-muted-foreground">
              {subtitle}
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface SecurityBadgesProps {
  className?: string;
}

export function SecurityBadges({ className = "" }: SecurityBadgesProps) {
  const badges = [
    {
      type: "iso" as const,
      title: "ISO 27001",
      subtitle: "Certified",
      description: "Jaarlijkse audit door KPMG",
    },
    {
      type: "gdpr" as const,
      title: "GDPR/AVG",
      subtitle: "Compliant",
      description: "BSN versleuteld Auto-delete 30d",
    },
    {
      type: "encryption" as const,
      title: "End-to-End",
      subtitle: "Encryptie",
      description: "Bank-level security",
    },
    {
      type: "2fa" as const,
      title: "2FA",
      subtitle: "Standaard",
      description: "Extra beveiliging voor je account",
    },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {badges.map((badge) => (
        <SecurityBadge key={badge.type} {...badge} />
      ))}
    </div>
  );
}
