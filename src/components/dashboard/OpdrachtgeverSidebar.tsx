"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  MoreVertical,
  ChevronLeft,
  Menu,
  LogOut,
  Settings,
  HelpCircle,
  Bell,
  Shield,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useIsTablet } from "@/hooks/useResponsive";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number | string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

const navItems: NavItem[] = [
  {
    href: "/dashboard/opdrachtgever",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/opdrachtgever/shifts",
    label: "Opdrachten",
    icon: CalendarPlus,
    badge: "3",
    badgeVariant: "default",
  },
  {
    href: "/dashboard/opdrachtgever/beveiligers",
    label: "Beveiligers",
    icon: Users,
  },
  {
    href: "/dashboard/opdrachtgever/facturatie",
    label: "Facturatie",
    icon: FileText,
  },
  {
    href: "/dashboard/opdrachtgever/analytics",
    label: "Analytics",
    icon: TrendingUp,
  },
  {
    href: "/dashboard/opdrachtgever/meer",
    label: "Meer",
    icon: MoreVertical,
  },
];

const bottomNavItems: NavItem[] = [
  {
    href: "/dashboard/opdrachtgever/settings",
    label: "Instellingen",
    icon: Settings,
  },
  {
    href: "/dashboard/opdrachtgever/help",
    label: "Help",
    icon: HelpCircle,
  },
];

interface OpdrachtgeverSidebarProps {
  className?: string;
}

export function OpdrachtgeverSidebar({ className }: OpdrachtgeverSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isTablet = useIsTablet();

  // Auto-collapse on tablet
  const effectiveCollapsed = isTablet || isCollapsed;

  const userName = session?.user?.name || "Opdrachtgever";
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
        className
      )}
    >
      {/* Header with Logo/Toggle */}
      <div className="h-16 border-b flex items-center justify-between px-4">
        {!effectiveCollapsed && (
          <Link href="/dashboard/opdrachtgever" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-semibold text-lg">SecuryFlex</span>
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  effectiveCollapsed && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all",
                    isActive && "scale-110"
                  )}
                />
                {!effectiveCollapsed && <span>{item.label}</span>}
                {item.badge && (
                  <BadgeComponent
                    variant={item.badgeVariant || "secondary"}
                    className={cn(
                      "ml-auto",
                      effectiveCollapsed && "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                    )}
                  >
                    {effectiveCollapsed && Number(item.badge) > 9 ? "9+" : item.badge}
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  effectiveCollapsed && "justify-center px-2"
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
        {/* Active Assignments Badge */}
        <div
          className={cn(
            "mb-2 p-2 rounded-lg bg-primary/10 text-primary",
            effectiveCollapsed && "text-center"
          )}
        >
          {effectiveCollapsed ? (
            <Clock className="h-5 w-5 mx-auto" />
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">5 Actieve Opdrachten</span>
            </div>
          )}
        </div>

        {/* Notification Badge */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 mb-2",
            effectiveCollapsed && "justify-center px-2"
          )}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            <BadgeComponent className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center">
              7
            </BadgeComponent>
          </div>
          {!effectiveCollapsed && <span className="text-sm">Meldingen</span>}
        </Button>

        {/* User Info */}
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer",
            effectiveCollapsed && "justify-center"
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
            effectiveCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!effectiveCollapsed && <span>Uitloggen</span>}
        </Button>
      </div>
    </aside>
  );
}