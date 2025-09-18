"use client";

import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { NotificationBell } from "@/components/dashboard/communication/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  showBackButton = false,
  actions,
  className,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <header
      className={cn(
        "bg-background/80 backdrop-blur-sm border-b border-border",
        className || "fixed top-0 left-0 right-0 z-40", // Default to fixed if no className provided
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
            {!title && !subtitle && (
              <div className="flex items-center space-x-2">
                {/* Logo or default header content */}
                <h1 className="text-lg font-semibold text-foreground">
                  SecuryFlex
                </h1>
                {/* Online status indicator */}
                <OnlineStatusBadge />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Custom actions */}
          {actions}

          {/* Default header actions */}
          {!actions && (
            <>
              {/* Notifications */}
              {session?.user?.id && (
                <NotificationBell userId={session.user.id} />
              )}

              {/* Settings */}
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function OnlineStatusBadge() {
  // This would be connected to real-time presence later
  const isOnline = true;

  return (
    <Badge
      variant={isOnline ? "default" : "secondary"}
      className={`text-xs ${
        isOnline
          ? "bg-green-500 hover:bg-green-600"
          : "bg-gray-500 hover:bg-gray-600"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full mr-1 ${
          isOnline ? "bg-white animate-pulse" : "bg-gray-300"
        }`}
      />
      {isOnline ? "Online" : "Offline"}
    </Badge>
  );
}
