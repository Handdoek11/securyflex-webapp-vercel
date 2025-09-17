"use client";

import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { DashboardHeader } from "./DashboardHeader";
import { Sidebar } from "./Sidebar";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  headerActions?: ReactNode;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  headerActions,
}: DashboardLayoutProps) {
  const { isTabletOrDesktop } = useResponsive();

  // Mobile layout - exact zoals het was
  if (!isTabletOrDesktop) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header - Fixed at top voor mobile */}
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          showBackButton={showBackButton}
          actions={headerActions}
        />

        {/* Main content met padding voor fixed header en bottom nav */}
        <main className="pb-20 pt-16">
          {children}
        </main>

        {/* Bottom Navigation - Fixed at bottom */}
        <BottomNavigation />
      </div>
    );
  }

  // Desktop/Tablet layout met sidebar
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header voor desktop */}
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          showBackButton={showBackButton}
          actions={headerActions}
          className="sticky top-0 z-40"
        />

        {/* Main content voor desktop */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}