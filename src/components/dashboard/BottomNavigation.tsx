"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Calendar,
  Clock,
  User,
  Badge
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useApiData } from "@/hooks/useApiData";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Search;
  badge?: number;
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Fetch notification count and other dynamic data
  const { data: notificationData } = useApiData({
    endpoint: "/api/notifications?unreadOnly=true&limit=0",
    fallbackData: { unreadCount: 0 },
    requireAuth: true,
    enabled: !!session?.user?.id
  });

  const { data: shiftsData } = useApiData({
    endpoint: "/api/shifts?status=aankomend&limit=0",
    fallbackData: { count: 0 },
    requireAuth: true,
    enabled: !!session?.user?.id
  });

  const unreadCount = notificationData?.unreadCount || 0;
  const upcomingShifts = shiftsData?.count || 0;

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
      badge: upcomingShifts > 0 ? upcomingShifts : undefined,
    },
    {
      href: "/dashboard/hours",
      label: "Uren",
      icon: Clock,
    },
    {
      href: "/dashboard/profile",
      label: "Profiel",
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      {/* Safe area padding for mobile devices */}
      <div className="safe-area-bottom">
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-colors duration-200 rounded-lg",
                  "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive ? "scale-110" : ""
                    )}
                  />

                  {/* Badge for notifications */}
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-2 -right-2 min-w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
                      {item.badge > 99 ? "99+" : item.badge}
                    </div>
                  )}
                </div>

                <span
                  className={cn(
                    "text-xs font-medium mt-1 transition-all duration-200 leading-none",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}