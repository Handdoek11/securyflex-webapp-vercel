import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePasswordResetToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email/service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Ongeldig emailadres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Voer een geldig emailadres in" },
        { status: 400 },
      );
    }

    const { email } = validationResult.data;

    // Generate reset token (this handles if user doesn't exist)
    const result = await generatePasswordResetToken(email);

    if (result.success && result.token && result.email && result.name) {
      // Send reset email
      await sendPasswordResetEmail(result.email, result.name, result.token);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message:
          "Als dit emailadres bestaat, hebben we een reset link gestuurd.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 },
    );
  }
}
