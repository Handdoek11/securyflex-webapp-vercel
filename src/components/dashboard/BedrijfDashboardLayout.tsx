"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  Settings,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  CreditCard,
  ArrowRightLeft,
  FileText,
  Shield,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

type BedrijfRole = "opdrachtgever" | "leverancier";

interface BedrijfDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

export function BedrijfDashboardLayout({
  children,
  title,
  subtitle,
  headerActions,
}: BedrijfDashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<BedrijfRole>("leverancier");

  const companyName = session?.user?.name || "Beveiligingsbedrijf";

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard/bedrijf",
      icon: LayoutDashboard,
      active: pathname === "/dashboard/bedrijf",
    },
    {
      name: "Planning",
      href: "/dashboard/bedrijf/planning",
      icon: Calendar,
      active: pathname?.startsWith("/dashboard/bedrijf/planning"),
    },
    {
      name: "Team",
      href: "/dashboard/bedrijf/team",
      icon: Users,
      active: pathname?.startsWith("/dashboard/bedrijf/team"),
      badge: "3", // Documenten die verlopen
    },
    {
      name: "Opdrachten",
      href: currentRole === "opdrachtgever"
        ? "/dashboard/bedrijf/opdrachten/plaatsen"
        : "/dashboard/bedrijf/opdrachten/solliciteren",
      icon: FileText,
      active: pathname?.startsWith("/dashboard/bedrijf/opdrachten"),
    },
    {
      name: "Klanten",
      href: "/dashboard/bedrijf/klanten",
      icon: Building2,
      active: pathname?.startsWith("/dashboard/bedrijf/klanten"),
    },
    {
      name: "Finqle",
      href: "/dashboard/bedrijf/finqle",
      icon: CreditCard,
      active: pathname?.startsWith("/dashboard/bedrijf/finqle"),
      badge: "Live", // Finqle integratie status
      badgeVariant: "success" as const,
    },
    {
      name: "Beheer",
      href: "/dashboard/bedrijf/beheer",
      icon: Settings,
      active: pathname?.startsWith("/dashboard/bedrijf/beheer"),
    },
  ];

  const handleRoleSwitch = (role: BedrijfRole) => {
    setCurrentRole(role);
    // Navigate to appropriate opdrachten page based on role
    if (pathname?.includes("/opdrachten")) {
      if (role === "opdrachtgever") {
        router.push("/dashboard/bedrijf/opdrachten/plaatsen");
      } else {
        router.push("/dashboard/bedrijf/opdrachten/solliciteren");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left: Logo and Role Toggle */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/bedrijf" className="flex items-center gap-2">
              <Image
                src="/logo-website-securyflex.svg"
                alt="SecuryFlex"
                width={140}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Role Toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={currentRole === "leverancier" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleRoleSwitch("leverancier")}
                className="gap-1"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Leverancier</span>
              </Button>
              <Button
                variant={currentRole === "opdrachtgever" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleRoleSwitch("opdrachtgever")}
                className="gap-1"
              >
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Opdrachtgever</span>
              </Button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                5
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex flex-col items-end text-sm">
                    <span className="font-medium">{companyName}</span>
                    <span className="text-xs text-muted-foreground">
                      {currentRole === "opdrachtgever" ? "Opdrachtgever" : "Leverancier"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mijn Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Bedrijfsprofiel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Finqle Instellingen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Instellingen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <nav className="grid gap-1 p-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || "secondary"}
                      className="ml-auto"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Sidebar + Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-card">
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="grid gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || "secondary"}
                      className="ml-auto"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Finqle Integration Status */}
          <div className="p-4 border-t">
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Finqle Connected</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Kredietlimiet: €125.000
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Page Header */}
          {(title || subtitle || headerActions) && (
            <div className="border-b bg-card">
              <div className="flex items-center justify-between p-6">
                <div>
                  {title && <h1 className="text-2xl font-semibold">{title}</h1>}
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                  )}
                </div>
                {headerActions && <div>{headerActions}</div>}
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}