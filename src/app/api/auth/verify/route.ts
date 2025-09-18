import { type NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is verplicht" },
        { status: 400 },
      );
    }

    const result = await verifyEmailToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Verificatie mislukt" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email succesvol geverifieerd! Je kunt nu inloggen.",
        user: {
          email: result.user?.email,
          name: result.user?.name,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij de verificatie" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is verplicht" }, { status: 400 });
  }

  const result = await verifyEmailToken(token);

  if (!result.success) {
    // Redirect to error page
    return NextResponse.redirect(
      new URL(
        `/auth/verify-error?error=${encodeURIComponent(result.error || "Verificatie mislukt")}`,
        request.url,
      ),
    );
  }

  // Redirect to success page
  return NextResponse.redirect(
    new URL("/auth/login?verified=true", request.url),
  );
}
