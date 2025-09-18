"use client";

import type { UserRole as PrismaUserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = PrismaUserRole | null;

export const RoleDisplayNames: Record<PrismaUserRole, string> = {
  ZZP_BEVEILIGER: "beveiliger",
  BEDRIJF: "beveiligingsbedrijf",
  OPDRACHTGEVER: "opdrachtgever",
  ADMIN: "admin",
};

interface RoleContextType {
  // Landing page role switching
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  // Authentication-based role detection
  userRole: UserRole;
  isZZPBeveiliger: boolean;
  isBedrijf: boolean;
  isOpdrachtgever: boolean;
  isAdmin: boolean;
  hasRole: (role: PrismaUserRole) => boolean;
  hasAnyRole: (roles: PrismaUserRole[]) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  // Landing page role switching (for marketing/demo)
  const [activeRole, setActiveRole] = useState<UserRole>(null);

  // Authentication-based role detection
  const { data: session, status } = useSession();
  const userRole = session?.user?.role as UserRole;
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  // Load saved role from localStorage on mount (for landing page)
  useEffect(() => {
    const savedRole = localStorage.getItem("selectedRole") as PrismaUserRole;
    if (
      savedRole &&
      Object.values(RoleDisplayNames).includes(
        RoleDisplayNames[savedRole as PrismaUserRole],
      )
    ) {
      setActiveRole(savedRole as PrismaUserRole);
    }
  }, []);

  // Save role to localStorage when it changes (for landing page)
  const handleSetRole = (role: UserRole) => {
    setActiveRole(role);
    if (role) {
      localStorage.setItem("selectedRole", role);
    } else {
      localStorage.removeItem("selectedRole");
    }
  };

  // Authentication-based role checking
  const hasRole = (requiredRole: PrismaUserRole): boolean => {
    return userRole === requiredRole;
  };

  const hasAnyRole = (roles: PrismaUserRole[]): boolean => {
    return userRole ? roles.includes(userRole) : false;
  };

  const contextValue: RoleContextType = {
    // Landing page role switching
    activeRole,
    setActiveRole: handleSetRole,

    // Authentication-based role detection
    userRole,
    isZZPBeveiliger: userRole === "ZZP_BEVEILIGER",
    isBedrijf: userRole === "BEDRIJF",
    isOpdrachtgever: userRole === "OPDRACHTGEVER",
    isAdmin: userRole === "ADMIN",
    hasRole,
    hasAnyRole,
    isAuthenticated,
    isLoading,
  };

  return (
    <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

// Role-based component wrapper
interface RoleGuardProps {
  role?: PrismaUserRole;
  roles?: PrismaUserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGuard({
  role,
  roles,
  fallback = null,
  children,
}: RoleGuardProps) {
  const { hasRole, hasAnyRole, isLoading } = useRole();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
  }

  // Check single role
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check multiple roles
  if (roles && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Role-based conditional rendering hook
export function useRoleBasedComponent<T>(
  components: Partial<Record<PrismaUserRole, T>>,
  defaultComponent?: T,
): T | null {
  const { userRole } = useRole();

  if (userRole && components[userRole]) {
    return components[userRole]!;
  }

  return defaultComponent || null;
}

// Hook for role-based navigation
export function useRoleDashboard(): string {
  const { userRole } = useRole();

  switch (userRole) {
    case "ZZP_BEVEILIGER":
      return "/dashboard";
    case "BEDRIJF":
      return "/dashboard/bedrijf";
    case "OPDRACHTGEVER":
      return "/dashboard/opdrachtgever";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/dashboard";
  }
}

// Hook for role-based onboarding
export function useRoleOnboarding(): string {
  const { userRole } = useRole();

  switch (userRole) {
    case "ZZP_BEVEILIGER":
      return "/onboarding/beveiliger";
    case "BEDRIJF":
      return "/onboarding/bedrijf";
    case "OPDRACHTGEVER":
      return "/onboarding/opdrachtgever";
    default:
      return "/onboarding";
  }
}
