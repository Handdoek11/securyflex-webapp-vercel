"use client";

import { LogOut, Menu, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { RoleSwitcher } from "@/components/landing/RoleSwitcher";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { activeRole, setActiveRole } = useRole();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle role change with URL update
  const handleRoleChange = (
    roleId: "ZZP_BEVEILIGER" | "BEDRIJF" | "OPDRACHTGEVER",
  ) => {
    setActiveRole(roleId);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const _toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <>
      {/* Spacer for fixed headers on mobile */}
      <div className="lg:hidden h-32" />

      {/* Mobile Role Selector Bar - Above Navigation */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ease-in-out",
          isScrolled ? "h-12 shadow-md" : "h-16 border-b",
        )}
      >
        <div className="grid grid-cols-3 h-full">
          {[
            { id: "ZZP_BEVEILIGER" as const, label: "Beveiliger", icon: "👷" },
            { id: "BEDRIJF" as const, label: "Bedrijf", icon: "🏢" },
            { id: "OPDRACHTGEVER" as const, label: "Klant", icon: "📋" },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleChange(role.id)}
              className={cn(
                "text-center transition-all duration-300 ease-in-out relative",
                "flex flex-col items-center justify-center",
                activeRole === role.id
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50",
              )}
            >
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  isScrolled
                    ? "h-0 opacity-0 scale-0"
                    : "h-6 opacity-100 scale-100",
                )}
              >
                <span className="text-lg">{role.icon}</span>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold transition-all duration-300 ease-in-out",
                  isScrolled ? "mt-0" : "mt-1",
                )}
              >
                {role.label}
              </span>
              {activeRole === role.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white opacity-50"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <nav
        className={cn(
          "fixed lg:sticky lg:top-0 left-0 right-0 z-40 bg-white transition-all duration-300 ease-in-out",
          isScrolled ? "top-12 shadow-sm" : "top-16 border-b",
          className,
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center"
              onClick={() => {
                setActiveRole(null);
                router.push("/");
              }}
            >
              <Image
                src="/logo-website-securyflex.svg"
                alt="SecuryFlex - Nederland's #1 beveiligingsplatform voor ZZP beveiligers en bedrijven"
                width={150}
                height={40}
                className="h-12 w-auto lg:h-14"
                priority
              />
            </Link>

            {/* Desktop Role Switcher - hidden on mobile, desktop variant on large screens */}
            <div className="hidden lg:flex items-center">
              <RoleSwitcher variant="default" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center space-x-4">
              {status === "loading" ? (
                <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-md"></div>
              ) : session ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">
                    Hallo, {session.user.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Uitloggen</span>
                  </Button>
                  <Link href="/dashboard">
                    <Button size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost">Inloggen</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="lg">Start direct →</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {session ? (
                <>
                  <div className="text-center py-2">
                    <p className="text-sm font-medium">
                      Hallo, {session.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.role === "ZZP_BEVEILIGER" && "Beveiliger"}
                      {session.user.role === "BEDRIJF" && "Bedrijf"}
                      {session.user.role === "OPDRACHTGEVER" && "Opdrachtgever"}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Uitloggen
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      Inloggen
                    </Button>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Start direct →</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
