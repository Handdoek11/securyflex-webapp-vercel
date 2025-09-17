"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  Users,
  Settings
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}

const opdrachtgeverNavItems: NavItem[] = [
  {
    href: "/dashboard/opdrachtgever",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/dashboard/opdrachtgever/shifts",
    label: "Shifts",
    icon: Calendar,
    badge: 3, // Dynamic based on open shifts needing attention
  },
  {
    href: "/dashboard/opdrachtgever/beveiligers",
    label: "Beveiligers",
    icon: Users,
  },
  {
    href: "/dashboard/opdrachtgever/meer",
    label: "Meer",
    icon: Settings,
  },
];

export function OpdrachtgeverBottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      {/* Safe area padding for mobile devices */}
      <div className="safe-area-bottom">
        <nav className="flex items-center justify-around px-2 py-2">
          {opdrachtgeverNavItems.map((item) => {
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