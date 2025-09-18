"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CalendarIcon,
  FileTextIcon,
  InfoIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type NDNummerRegistrationData,
  ndNummerRegistrationSchema,
} from "@/lib/validation/schemas";

interface NDNummerRegistrationFormProps {
  profileType: "ZZP" | "BEDRIJF";
  onSuccess?: (data: any) => void;
  className?: string;
}

export function NDNummerRegistrationForm({
  profileType,
  onSuccess,
  className,
}: NDNummerRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);

  const form = useForm<NDNummerRegistrationData>({
    resolver: zodResolver(ndNummerRegistrationSchema),
    defaultValues: {
      ndNummer: "",
      vervalDatum: "",
      documentUpload: "",
      confirmatie: false,
    },
  });

  const onSubmit = async (data: NDNummerRegistrationData) => {
    try {
      setIsSubmitting(true);

      if (!uploadedDocument) {
        toast.error("Document upload is verplicht");
        return;
      }

      const response = await fetch("/api/compliance/nd-nummer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          documentUpload: uploadedDocument,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registratie mislukt");
      }

      toast.success("ND-nummer succesvol geregistreerd!");

      if (onSuccess) {
        onSuccess(result);
      }

      // Reset form
      form.reset();
      setUploadedDocument(null);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Er is een fout opgetreden",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "ND_NUMMER");
      formData.append("beschrijving", "ND-nummer document voor registratie");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload mislukt");
      }

      const result = await response.json();
      setUploadedDocument(result.url);
      form.setValue("documentUpload", result.url);

      toast.success("Document succesvol geüpload");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Document upload mislukt");
    }
  };

  // Calculate minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  // Calculate maximum date (5 years from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 5);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
          <CardTitle>ND-nummer Registratie</CardTitle>
        </div>
        <CardDescription>
          Registreer uw Nederlandse Dienstnummer voor{" "}
          {profileType === "ZZP" ? "ZZP beveiliger" : "beveiligingsbedrijf"}{" "}
          activiteiten
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Information Alert */}
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Belangrijk</AlertTitle>
          <AlertDescription>
            Een geldig ND-nummer is verplicht voor alle beveiligingsactiviteiten
            in Nederland onder de WPBR wetgeving.
            {profileType === "ZZP"
              ? " Als ZZP beveiliger moet u een persoonlijk ND-nummer hebben."
              : " Als beveiligingsbedrijf heeft u een bedrijfs-ND-nummer nodig."}
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ND-nummer Input */}
            <FormField
              control={form.control}
              name="ndNummer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ND-nummer *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ND123456"
                      {...field}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Voer uw Nederlandse Dienstnummer in (bijv. ND123456)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="vervalDatum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vervaldatum *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        min={today}
                        max={maxDateString}
                        {...field}
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Datum waarop uw ND-nummer verloopt (maximaal 5 jaar geldig)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                ND-nummer Document *
              </label>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10 * 1024 * 1024} // 10MB
                onUpload={handleDocumentUpload}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Upload een kopie van uw ND-nummer document (PDF, JPG, PNG - max
                10MB)
              </p>
              {uploadedDocument && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                  <FileTextIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Document geüpload
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    ✓
                  </Badge>
                </div>
              )}
            </div>

            {/* Legal Requirements Info */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircleIcon className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">
                Wettelijke Vereisten
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>
                    ND-nummer is verplicht voor alle beveiligingswerkzaamheden
                  </li>
                  <li>
                    Geldig voor maximaal 5 jaar, hernieuwing 3 maanden van
                    tevoren
                  </li>
                  <li>Kostenbetaling van €600 + €92 per manager via Justis</li>
                  <li>
                    Reguliere inspecties door Inspectie Justis en Veiligheid
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Confirmation Checkbox */}
            <FormField
              control={form.control}
              name="confirmatie"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      Bevestiging *
                    </FormLabel>
                    <FormDescription>
                      Ik bevestig dat de opgegeven informatie correct is en dat
                      ik begrijp dat het verstrekken van onjuiste informatie
                      gevolgen kan hebben volgens de WPBR wetgeving.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex flex-col space-y-2">
              <Button
                type="submit"
                disabled={isSubmitting || !uploadedDocument}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    Registreren...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="mr-2 h-4 w-4" />
                    ND-nummer Registreren
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Na registratie wordt uw ND-nummer automatisch geverifieerd via
                de Justis API
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
