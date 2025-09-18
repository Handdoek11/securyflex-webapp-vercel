import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  PrismaClient,
  type UserRole,
  type User,
  type ZZPProfile,
  type BedrijfProfile,
  type Opdrachtgever,
} from "@prisma/client";
import bcryptjs from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  isAccountLocked,
  logSecurityEvent,
  recordFailedLogin,
  resetFailedLoginAttempts,
} from "./auth/tokens";

const prisma = new PrismaClient();

declare module "next-auth" {
  interface User {
    role: UserRole;
    status: string;
    hasCompletedProfile: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      status: string;
      hasCompletedProfile: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    status: string;
    hasCompletedProfile: boolean;
  }
}

// Type for user with all relations included
type UserWithProfiles = User & {
  zzpProfile: ZZPProfile | null;
  bedrijfProfile: BedrijfProfile | null;
  opdrachtgever: Opdrachtgever | null;
};

// Helper function to determine if user has completed their profile
function determineProfileCompleteness(user: UserWithProfiles): boolean {
  switch (user.role) {
    case "ZZP_BEVEILIGER":
      return !!(user.zzpProfile?.kvkNummer && user.zzpProfile?.uurtarief);
    case "BEDRIJF":
      return !!(
        user.bedrijfProfile?.bedrijfsnaam && user.bedrijfProfile?.kvkNummer
      );
    case "OPDRACHTGEVER":
      return !!user.opdrachtgever?.contactpersoon;
    case "ADMIN":
      return true; // Admin accounts are always considered complete
    default:
      return false;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            zzpProfile: true,
            bedrijfProfile: true,
            opdrachtgever: true,
          },
        });

        if (!user) {
          // Record failed login attempt even if user doesn't exist (for security logging)
          await recordFailedLogin(email);
          return null;
        }

        // Check if account is locked
        if (await isAccountLocked(user.id)) {
          return null;
        }

        // Check if email is verified
        if (!user.emailVerified && user.status === "PENDING") {
          return null;
        }

        const passwordValid = await bcryptjs.compare(password, user.password);

        if (!passwordValid) {
          // Record failed login attempt
          await recordFailedLogin(email);
          return null;
        }

        // Reset failed login attempts on successful login
        await resetFailedLoginAttempts(user.id);

        // Log successful login
        await logSecurityEvent({
          userId: user.id,
          email: user.email,
          eventType: "LOGIN_SUCCESS",
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          hasCompletedProfile: determineProfileCompleteness(user),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.status = user.status;
        token.hasCompletedProfile = user.hasCompletedProfile;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.hasCompletedProfile = session.hasCompletedProfile;
        token.status = session.status;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as string;
        session.user.hasCompletedProfile = token.hasCompletedProfile as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, isNewUser }) {
      console.log("User signed in:", user.email, "New user:", isNewUser);
    },
    async signOut({ token }) {
      console.log("User signed out:", token?.email);
    },
  },
  debug: process.env.NODE_ENV === "development",
});

// Helper functions for authentication
export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
};

export const requireRole = async (allowedRoles: UserRole[]) => {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }
  return user;
};

export const requireCompletedProfile = async () => {
  const user = await requireAuth();
  if (!user.hasCompletedProfile) {
    throw new Error("Profile completion required");
  }
  return user;
};

// Hash password utility
export const hashPassword = async (password: string): Promise<string> => {
  return await bcryptjs.hash(password, 12);
};

// Verify password utility
export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcryptjs.compare(password, hashedPassword);
};
