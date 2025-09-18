import prisma from "@/lib/prisma";

/**
 * Generate a secure random token
 */
export function generateSecureToken(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js environment
    const crypto = require("node:crypto");
    return crypto.randomBytes(32).toString("hex");
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Generate and store email verification token
 */
export async function generateVerificationToken(userId: string) {
  // Delete any existing tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { userId },
  });

  const token = generateSecureToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const verificationToken = await prisma.verificationToken.create({
    data: {
      token,
      userId,
      expires,
    },
  });

  return verificationToken;
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) {
    return { success: false, error: "Token niet gevonden" };
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return { success: false, error: "Token is verlopen" };
  }

  // Update user's email verification status
  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: {
      emailVerified: new Date(),
      status: "ACTIVE",
    },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  // Log the security event
  await logSecurityEvent({
    userId: verificationToken.userId,
    email: verificationToken.user.email,
    eventType: "EMAIL_VERIFICATION_COMPLETED",
  });

  return { success: true, user: verificationToken.user };
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists or not for security
    return { success: true };
  }

  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  const token = generateSecureToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expires,
    },
  });

  // Log the security event
  await logSecurityEvent({
    userId: user.id,
    email: user.email,
    eventType: "PASSWORD_RESET_REQUEST",
  });

  return {
    success: true,
    token: resetToken.token,
    email: user.email,
    name: user.name,
  };
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.used) {
    return { success: false, error: "Token ongeldig of al gebruikt" };
  }

  if (resetToken.expires < new Date()) {
    return { success: false, error: "Token is verlopen" };
  }

  return { success: true, userId: resetToken.userId, tokenId: resetToken.id };
}

/**
 * Mark password reset token as used
 */
export async function markPasswordResetTokenUsed(
  tokenId: string,
  userId: string,
) {
  await prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { used: true },
  });

  // Log the security event
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (user) {
    await logSecurityEvent({
      userId,
      email: user.email,
      eventType: "PASSWORD_RESET_COMPLETED",
    });
  }
}

/**
 * Log security events
 */
export async function logSecurityEvent({
  userId,
  email,
  eventType,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId?: string | null;
  email?: string | null;
  eventType: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}) {
  try {
    await prisma.securityLog.create({
      data: {
        userId,
        email,
        eventType: eventType as any,
        ipAddress,
        userAgent,
        metadata,
      },
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true },
  });

  if (!user?.lockedUntil) return false;

  return user.lockedUntil > new Date();
}

/**
 * Lock account after too many failed attempts
 */
export async function lockAccount(userId: string, minutes: number = 30) {
  const lockedUntil = new Date(Date.now() + minutes * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil,
      failedLoginAttempts: 0, // Reset counter
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (user) {
    await logSecurityEvent({
      userId,
      email: user.email,
      eventType: "ACCOUNT_LOCKED",
      metadata: { lockedUntil, lockDurationMinutes: minutes },
    });
  }
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(
  email: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    const newFailedAttempts = user.failedLoginAttempts + 1;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newFailedAttempts,
        lastFailedLogin: new Date(),
      },
    });

    // Lock account after 5 failed attempts
    if (newFailedAttempts >= 5) {
      await lockAccount(user.id);
    }
  }

  // Always log failed login attempts
  await logSecurityEvent({
    userId: user?.id,
    email,
    eventType: "LOGIN_FAILED",
    ipAddress,
    userAgent,
  });
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedLoginAttempts(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
    },
  });
}
