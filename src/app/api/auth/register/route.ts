import { PrismaClient, UserRole } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import type { ZodIssue, z } from "zod";
import { hashPassword } from "@/lib/auth";
import { generateVerificationToken, logSecurityEvent } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/service";
import {
  bedrijfRegistrationSchema,
  opdrachtgeverRegistrationSchema,
  zzpRegistrationSchema,
} from "@/lib/validations/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    // Validate input based on role
    let validatedData:
      | z.infer<typeof zzpRegistrationSchema>
      | z.infer<typeof bedrijfRegistrationSchema>
      | z.infer<typeof opdrachtgeverRegistrationSchema>;
    switch (role) {
      case UserRole.ZZP_BEVEILIGER:
        validatedData = zzpRegistrationSchema.parse(body);
        break;
      case UserRole.BEDRIJF:
        validatedData = bedrijfRegistrationSchema.parse(body);
        break;
      case UserRole.OPDRACHTGEVER:
        validatedData = opdrachtgeverRegistrationSchema.parse(body);
        break;
      default:
        return NextResponse.json(
          { error: "Ongeldige rol geselecteerd" },
          { status: 400 },
        );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Er bestaat al een account met dit email adres" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the base user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          phone: validatedData.phone,
          role: validatedData.role,
          status: "PENDING", // Email verification required
        },
      });

      // Create role-specific profile
      switch (validatedData.role) {
        case UserRole.ZZP_BEVEILIGER:
          await tx.zZPProfile.create({
            data: {
              userId: user.id,
              // Initialize with minimal data - rest will be filled during onboarding
              voornaam: validatedData.name.split(" ")[0] || "Onbekend",
              achternaam:
                validatedData.name.split(" ").slice(1).join(" ") || "Onbekend",
              kvkNummer: `TEMP_${user.id}`, // Temporary unique value - will be filled during onboarding
              specialisaties: [],
              certificaten: [],
              werkgebied: [],
              beschikbaarheid: {},
              uurtarief: 25.0, // Default rate
              rating: null,
              totalReviews: 0,
            },
          });
          break;

        case UserRole.BEDRIJF: {
          const bedrijfData = validatedData as typeof validatedData & {
            bedrijfsnaam: string;
          };
          await tx.bedrijfProfile.create({
            data: {
              userId: user.id,
              bedrijfsnaam: bedrijfData.bedrijfsnaam,
              kvkNummer: "", // Will be filled during onboarding
              btwNummer: "", // Will be filled during onboarding
              teamSize: 1,
              extraAccounts: 0,
              subscriptionTier: "SMALL",
            },
          });
          break;
        }

        case UserRole.OPDRACHTGEVER: {
          const opdrachtgeverData = validatedData as typeof validatedData & {
            type?: string;
            bedrijfsnaam?: string;
          };
          await tx.opdrachtgever.create({
            data: {
              userId: user.id,
              bedrijfsnaam: opdrachtgeverData.bedrijfsnaam || "",
              contactpersoon: validatedData.name,
              totalHoursBooked: 0,
              totalSpent: 0,
            },
          });
          break;
        }
      }

      return user;
    });

    // Generate verification token
    const verificationToken = await generateVerificationToken(result.id);

    // Send verification email
    await sendVerificationEmail(
      result.email,
      result.name,
      verificationToken.token,
    );

    // Log the registration event
    await logSecurityEvent({
      userId: result.id,
      email: result.email,
      eventType: "EMAIL_VERIFICATION_REQUEST",
      metadata: { role: result.role },
    });

    // Return success (without sensitive data)
    return NextResponse.json(
      {
        success: true,
        message:
          "Account succesvol aangemaakt. Check je email voor verificatie.",
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as z.ZodError;
      return NextResponse.json(
        {
          error: "Ongeldige invoer",
          details: zodError.issues.map((err: ZodIssue) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    // Handle database errors
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      // Unique constraint violation
      return NextResponse.json(
        { error: "Er bestaat al een account met dit email adres" },
        { status: 409 },
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error:
          "Er is iets misgegaan tijdens de registratie. Probeer het opnieuw.",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
