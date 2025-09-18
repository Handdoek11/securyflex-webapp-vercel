"use client";

import {
  Bell,
  Calendar,
  ChevronLeft,
  Clock,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiData } from "@/hooks/useApiData";
import { useIsTablet } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Search;
  badge?: number | string;
  badgeVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success";
}

const navItems: NavItem[] = [
  {
    href: "/dashboard/jobs",
    label: "Jobs",
    icon: Search,
  },
  {
    href: "/dashboard/shifts",
    label: "Shifts",
    icon: Calendar,
    badge: "2",
    badgeVariant: "destructive",
  },
  {
    href: "/dashboard/hours",
    label: "Uren",
    icon: Clock,
  },
  {
    href: "/dashboard/verzekeringen",
    label: "Verzekeringen",
    icon: Shield,
    badge: "NIEUW",
    badgeVariant: "success",
  },
  {
    href: "/dashboard/profile",
    label: "Profiel",
    icon: User,
  },
];

const bottomNavItems: NavItem[] = [
  {
    href: "/dashboard/settings",
    label: "Instellingen",
    icon: Settings,
  },
  {
    href: "/dashboard/help",
    label: "Help",
    icon: HelpCircle,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const _router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isTablet = useIsTablet();

  // Auto-collapse on tablet
  const effectiveCollapsed = isTablet || isCollapsed;

  // Fetch unread notification count
  const { data: notificationData } = useApiData({
    endpoint: "/api/notifications?unreadOnly=true&limit=0",
    fallbackData: { unreadCount: 0 },
    requireAuth: true,
    enabled: !!session?.user?.id,
  });

  const unreadCount = notificationData?.unreadCount || 0;

  const userName = session?.user?.name || "Beveiliger";
  const userEmail = session?.user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-card border-r transition-all duration-300 ease-in-out",
        effectiveCollapsed ? "w-20" : "w-64",
        className,
      )}
    >
      {/* Header with Logo/Toggle */}
      <div className="h-16 border-b flex items-center justify-between px-4">
        {!effectiveCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo-website-securyflex.svg"
              alt="SecuryFlex Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("h-8 w-8", effectiveCollapsed && "mx-auto")}
        >
          {effectiveCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  effectiveCollapsed && "justify-center px-2",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all",
                    isActive && "scale-110",
                  )}
                />
                {!effectiveCollapsed && <span>{item.label}</span>}
                {item.badge && (
                  <BadgeComponent
                    variant={item.badgeVariant || "secondary"}
                    className={cn(
                      "ml-auto",
                      effectiveCollapsed &&
                        "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center",
                    )}
                  >
                    {effectiveCollapsed && Number(item.badge) > 9
                      ? "9+"
                      : item.badge}
                  </BadgeComponent>
                )}

                {/* Tooltip for collapsed state */}
                {effectiveCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="my-4 mx-3 border-t" />

        {/* Bottom Navigation Items */}
        <nav className="space-y-1 px-3">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  effectiveCollapsed && "justify-center px-2",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!effectiveCollapsed && <span>{item.label}</span>}

                {/* Tooltip for collapsed state */}
                {effectiveCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="border-t p-3">
        {/* Notification Badge */}
        <Link href="/dashboard/notifications">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 mb-2",
              pathname === "/dashboard/notifications" &&
                "bg-accent text-accent-foreground",
              effectiveCollapsed && "justify-center px-2",
            )}
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <BadgeComponent className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </BadgeComponent>
              )}
            </div>
            {!effectiveCollapsed && <span className="text-sm">Meldingen</span>}
          </Button>
        </Link>

        {/* User Info */}
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer",
            effectiveCollapsed && "justify-center",
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          {!effectiveCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className={cn(
            "w-full justify-start gap-2 mt-2",
            effectiveCollapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!effectiveCollapsed && <span>Uitloggen</span>}
        </Button>
      </div>
    </aside>
  );
}
