"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type BedrijfRegistrationFormData,
  bedrijfRegistrationSchema,
} from "@/lib/validations/auth";

export default function BedrijfRegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BedrijfRegistrationFormData>({
    resolver: zodResolver(bedrijfRegistrationSchema),
    defaultValues: {
      role: "BEDRIJF",
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const watchAgreeToTerms = watch("agreeToTerms");
  const watchAgreeToPrivacy = watch("agreeToPrivacy");

  const onSubmit = async (data: BedrijfRegistrationFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (result.details && Array.isArray(result.details)) {
          // Validation errors - show first validation error
          const firstError = result.details[0];
          setError(firstError?.message || result.error || "Ongeldige invoer");
        } else {
          // General error
          setError(
            result.error || "Er is iets misgegaan tijdens de registratie",
          );
        }
        return;
      }

      // Successful registration - redirect to login with success message
      router.push("/auth/login?message=account-created");
    } catch (error) {
      console.error("Registration error:", error);
      // Network or other error
      setError("Kan geen verbinding maken met de server. Probeer het opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logo-website-securyflex.svg"
              alt="SecuryFlex"
              width={200}
              height={60}
              className="h-16 w-auto mx-auto"
              priority
            />
          </Link>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Link
              href="/auth/register"
              className="text-sm text-muted-foreground hover:text-primary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Terug naar roloverzicht
            </Link>
          </div>

          {/* Role indicator */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">
                Beveiligingsbedrijf
              </h1>
              <p className="text-sm text-muted-foreground">
                Maak je bedrijfsaccount aan
              </p>
            </div>
          </div>
        </div>

        {/* Benefits reminder */}
        <div className="bg-primary/5 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>2.847+ beveiligers beschikbaar</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Automatische planning</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Real-time GPS monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Win meer opdrachten</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bedrijfsgegevens</h3>

            <div className="space-y-4">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="bedrijfsnaam">Bedrijfsnaam *</Label>
                <Input
                  id="bedrijfsnaam"
                  placeholder="Naam van je beveiligingsbedrijf"
                  {...register("bedrijfsnaam")}
                  className={errors.bedrijfsnaam ? "border-red-500" : ""}
                />
                {errors.bedrijfsnaam && (
                  <p className="text-sm text-red-600">
                    {errors.bedrijfsnaam.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Person */}
                <div className="space-y-2">
                  <Label htmlFor="name">Contactpersoon *</Label>
                  <Input
                    id="name"
                    placeholder="Voor- en achternaam"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoonnummer *</Label>
                  <Input
                    id="phone"
                    placeholder="010-1234567 of 06-12345678"
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Bedrijfs email adres *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@jouwbedrijf.nl"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account beveiliging</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimaal 8 karakters"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Herhaal je wachtwoord"
                    {...register("confirmPassword")}
                    className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Wachtwoord moet bevatten: minimaal 8 karakters, 1 hoofdletter, 1
              kleine letter en 1 cijfer
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={watchAgreeToTerms}
                onCheckedChange={(checked) =>
                  setValue("agreeToTerms", checked as boolean)
                }
                className={errors.agreeToTerms ? "border-red-500" : ""}
              />
              <div className="space-y-1">
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm font-medium cursor-pointer"
                >
                  Ik ga akkoord met de{" "}
                  <Link
                    href="/voorwaarden"
                    className="text-primary hover:underline"
                  >
                    Algemene Voorwaarden
                  </Link>{" "}
                  *
                </label>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToPrivacy"
                checked={watchAgreeToPrivacy}
                onCheckedChange={(checked) =>
                  setValue("agreeToPrivacy", checked as boolean)
                }
                className={errors.agreeToPrivacy ? "border-red-500" : ""}
              />
              <div className="space-y-1">
                <label
                  htmlFor="agreeToPrivacy"
                  className="text-sm font-medium cursor-pointer"
                >
                  Ik ga akkoord met het{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacybeleid
                  </Link>{" "}
                  *
                </label>
                {errors.agreeToPrivacy && (
                  <p className="text-sm text-red-600">
                    {errors.agreeToPrivacy.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bedrijfsaccount aanmaken...
                </>
              ) : (
                "Bedrijfsaccount aanmaken"
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Heb je al een account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Log hier in
            </Link>
          </p>
        </div>

        {/* What happens next */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">
            🏢 Wat gebeurt er hierna?
          </h4>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Bevestig je bedrijfs email adres</li>
            <li>2. Voeg KvK nummer en BTW nummer toe</li>
            <li>3. Upload je WPBR vergunning</li>
            <li>4. Stel je bedrijfsprofiel en specialisaties in</li>
            <li>5. Begin direct met het plaatsen van opdrachten!</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
