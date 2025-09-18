import { type NextRequest, NextResponse } from "next/server";
import { type ZodIssue, z } from "zod";
import { hashPassword } from "@/lib/auth";
import {
  markPasswordResetTokenUsed,
  verifyPasswordResetToken,
} from "@/lib/auth/tokens";
import prisma from "@/lib/prisma";

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens bevatten")
    .regex(/[A-Z]/, "Wachtwoord moet minimaal één hoofdletter bevatten")
    .regex(/[a-z]/, "Wachtwoord moet minimaal één kleine letter bevatten")
    .regex(/[0-9]/, "Wachtwoord moet minimaal één cijfer bevatten"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Ongeldige invoer",
          details: validationResult.error.issues
            .map((err: ZodIssue) => err.message)
            .join(", "),
        },
        { status: 400 },
      );
    }

    const { token, password } = validationResult.data;

    // Verify token
    const tokenResult = await verifyPasswordResetToken(token);
    if (!tokenResult.success) {
      return NextResponse.json(
        { error: tokenResult.error || "Ongeldige of verlopen token" },
        { status: 400 },
      );
    }

    // Type guard ensures tokenId and userId exist when success is true
    if (!tokenResult.tokenId || !tokenResult.userId) {
      return NextResponse.json(
        { error: "Token verification failed" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: tokenResult.userId },
      data: {
        password: hashedPassword,
        // Reset failed login attempts on successful password reset
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null,
      },
    });

    // Mark token as used
    await markPasswordResetTokenUsed(tokenResult.tokenId, tokenResult.userId);

    return NextResponse.json(
      {
        success: true,
        message:
          "Wachtwoord succesvol gereset. Je kunt nu inloggen met je nieuwe wachtwoord.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het resetten van je wachtwoord" },
      { status: 500 },
    );
  }
}

// GET endpoint to validate token before showing reset form
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is verplicht" }, { status: 400 });
  }

  const result = await verifyPasswordResetToken(token);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Ongeldige of verlopen token" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Token is geldig",
    },
    { status: 200 },
  );
}
