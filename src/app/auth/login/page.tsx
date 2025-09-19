"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ComponentErrorBoundary,
  PageErrorBoundary,
} from "@/components/ui/error-boundary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/ui/page-transition";
import { type LoginFormData, loginSchema } from "@/lib/validations/auth";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const successMessage = searchParams.get("message");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Check for specific error types based on the error message
        if (result.error.toLowerCase().includes("locked")) {
          const errorMsg =
            "Je account is tijdelijk vergrendeld vanwege te veel mislukte inlogpogingen. Probeer het later opnieuw of reset je wachtwoord.";
          setError(errorMsg);
          toast.error("Account vergrendeld");
        } else if (result.error.toLowerCase().includes("verified")) {
          const errorMsg =
            "Je email adres is nog niet geverifieerd. Check je inbox voor de verificatie email.";
          setError(errorMsg);
          toast.error("Email niet geverifieerd");
        } else {
          setError("Email of wachtwoord is onjuist");
          toast.error("Inloggen mislukt");
        }
        return;
      }

      // Successful login - get user session to determine redirect
      const session = await getSession();

      // Determine redirect URL based on user role
      let redirectUrl = callbackUrl;
      if (session?.user?.role === "ADMIN") {
        redirectUrl = "/admin/auth-monitor";
      } else if (callbackUrl === "/dashboard") {
        // Only use default dashboard for non-admin users
        switch (session?.user?.role) {
          case "BEDRIJF":
            redirectUrl = "/dashboard/bedrijf";
            break;
          case "OPDRACHTGEVER":
            redirectUrl = "/dashboard/opdrachtgever";
            break;
          default:
            redirectUrl = "/dashboard";
        }
      }

      toast.success("Succesvol ingelogd!");
      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("Er is iets misgegaan. Probeer het opnieuw.");
      toast.error("Login fout");
    }
  };

  return (
    <PageTransition transitionKey="login">
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          {/* Logo */}
          <ComponentErrorBoundary>
            <div className="text-center mb-8">
              <Link href="/">
                <Image
                  src="/logo-website-securyflex.svg"
                  alt="SecuryFlex"
                  width={200}
                  height={60}
                  className="h-16 w-auto mx-auto mb-4"
                  loading="lazy"
                />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Inloggen</h1>
              <p className="text-muted-foreground mt-2">
                Log in om toegang te krijgen tot je account
              </p>
            </div>
          </ComponentErrorBoundary>

          {/* Success Messages */}
          {successMessage === "account-created" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Account succesvol aangemaakt!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Check je email voor de verificatie link.
                </p>
              </div>
            </div>
          )}

          {searchParams.get("verified") === "true" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Email succesvol geverifieerd!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Je kunt nu inloggen met je email en wachtwoord.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <ComponentErrorBoundary>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email adres</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Voer je wachtwoord in"
                    {...register("password")}
                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Wachtwoord vergeten?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inloggen...
                  </>
                ) : (
                  "Inloggen"
                )}
              </Button>
            </form>
          </ComponentErrorBoundary>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nog geen account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Registreer hier
              </Link>
            </p>
          </div>

          {/* Role-specific Registration Links */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center mb-4">
              Nieuw op SecuryFlex? Start direct:
            </p>
            <div className="space-y-2">
              <Link href="/auth/register/beveiliger" className="block">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  👷 Ik ben beveiliger
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/register/bedrijf">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    🏢 Bedrijf
                  </Button>
                </Link>
                <Link href="/auth/register/opdrachtgever">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    📋 Klant
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function LoginPage() {
  return (
    <PageErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-lg">
              <div className="text-center">
                <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                <h1 className="text-2xl font-bold mb-2">Laden...</h1>
                <p className="text-muted-foreground">
                  Even geduld alstublieft...
                </p>
              </div>
            </Card>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </PageErrorBoundary>
  );
}
