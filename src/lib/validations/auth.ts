import { UserRole } from "@prisma/client";
import { z } from "zod";

// Base login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is verplicht")
    .email("Voer een geldig email adres in"),
  password: z
    .string()
    .min(1, "Wachtwoord is verplicht")
    .min(8, "Wachtwoord moet minimaal 8 karakters bevatten"),
});

// Base fields without refinements
const baseRegistrationFields = {
  email: z
    .string()
    .min(1, "Email is verplicht")
    .email("Voer een geldig email adres in"),
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 karakters bevatten")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Wachtwoord moet minimaal 1 kleine letter, 1 hoofdletter en 1 cijfer bevatten",
    ),
  confirmPassword: z.string(),
  name: z
    .string()
    .min(2, "Naam moet minimaal 2 karakters bevatten")
    .max(50, "Naam mag maximaal 50 karakters bevatten"),
  phone: z
    .string()
    .min(1, "Telefoonnummer is verplicht")
    .regex(
      /^(\+31|0)[0-9]{9}$/,
      "Voer een geldig Nederlands telefoonnummer in",
    ),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "Je moet akkoord gaan met de voorwaarden"),
  agreeToPrivacy: z
    .boolean()
    .refine(
      (val) => val === true,
      "Je moet akkoord gaan met het privacybeleid",
    ),
};

// Base user registration schema with refinements
export const baseRegistrationSchema = z
  .object({
    ...baseRegistrationFields,
    role: z.nativeEnum(UserRole),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

// ZZP Beveiliger registration schema
export const zzpRegistrationSchema = z
  .object({
    ...baseRegistrationFields,
    role: z.literal(UserRole.ZZP_BEVEILIGER),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

// Bedrijf registration schema
export const bedrijfRegistrationSchema = z
  .object({
    ...baseRegistrationFields,
    role: z.literal(UserRole.BEDRIJF),
    bedrijfsnaam: z
      .string()
      .min(2, "Bedrijfsnaam moet minimaal 2 karakters bevatten")
      .max(100, "Bedrijfsnaam mag maximaal 100 karakters bevatten"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

// Opdrachtgever registration schema
export const opdrachtgeverRegistrationSchema = z
  .object({
    ...baseRegistrationFields,
    role: z.literal(UserRole.OPDRACHTGEVER),
    type: z.enum(["BEDRIJF", "PARTICULIER"], {
      required_error: "Selecteer of je een bedrijf of particulier bent",
    }),
    bedrijfsnaam: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.type === "BEDRIJF" && !data.bedrijfsnaam) {
        return false;
      }
      return true;
    },
    {
      message: "Bedrijfsnaam is verplicht voor bedrijven",
      path: ["bedrijfsnaam"],
    },
  );

// Business info schemas for onboarding
export const kvkValidationSchema = z.object({
  kvkNummer: z
    .string()
    .min(8, "KvK nummer moet 8 cijfers bevatten")
    .max(8, "KvK nummer moet 8 cijfers bevatten")
    .regex(/^\d{8}$/, "KvK nummer mag alleen cijfers bevatten"),
});

export const zzpBusinessInfoSchema = kvkValidationSchema.extend({
  btwNummer: z
    .string()
    .regex(/^NL\d{9}B\d{2}$/, "BTW nummer moet in formaat NL123456789B01 zijn")
    .optional()
    .or(z.literal("")),
  wpbrStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).default("PENDING"),
  wpbrDocuments: z.array(z.string()).optional(), // File URLs after upload
});

export const bedrijfBusinessInfoSchema = kvkValidationSchema.extend({
  btwNummer: z
    .string()
    .min(1, "BTW nummer is verplicht voor bedrijven")
    .regex(/^NL\d{9}B\d{2}$/, "BTW nummer moet in formaat NL123456789B01 zijn"),
  wpbrVergunning: z.string().min(1, "WPBR vergunningnummer is verplicht"),
  wpbrExpiry: z
    .date()
    .min(new Date(), "WPBR vergunning mag niet verlopen zijn"),
  eHerkenningLevel: z.enum(["EH3", "EH4"]).optional(),
});

// Professional qualifications schemas
export const certificatenSchema = z.object({
  certificaten: z.array(
    z.object({
      type: z.enum(["BOA", "BHV", "ESO", "MBO_SECURITY", "ANDERE"]),
      naam: z.string().min(1, "Certificaatnaam is verplicht"),
      uitgever: z.string().min(1, "Uitgever is verplicht"),
      behaaldOp: z.date(),
      verlooptOp: z.date().optional(),
      documentUrl: z.string().url().optional(),
    }),
  ),
});

export const specialisatiesSchema = z.object({
  specialisaties: z
    .array(
      z.enum([
        "EVENEMENTEN",
        "OBJECT_BEVEILIGING",
        "MOBIEL_TOEZICHT",
        "ALARM_OPVOLGING",
        "TOEGANGSCONTROLE",
        "WINKEL_BEVEILIGING",
        "BOUW_BEVEILIGING",
        "HORECA_BEVEILIGING",
        "TRANSPORT_BEVEILIGING",
        "VIP_BEVEILIGING",
      ]),
    )
    .min(1, "Selecteer minimaal 1 specialisatie"),
  werkgebied: z.array(z.string()).min(1, "Selecteer minimaal 1 werkgebied"),
  uurtarief: z
    .number()
    .min(20, "Uurtarief moet minimaal €20 zijn")
    .max(100, "Uurtarief mag maximaal €100 zijn"),
  ervaring: z
    .number()
    .min(0, "Ervaring moet 0 of hoger zijn")
    .max(50, "Ervaring mag maximaal 50 jaar zijn"),
});

// Profile completion schema
export const profileCompletionSchema = z.object({
  profielfoto: z.string().url().optional(),
  beschrijving: z
    .string()
    .min(50, "Beschrijving moet minimaal 50 karakters bevatten")
    .max(500, "Beschrijving mag maximaal 500 karakters bevatten"),
  beschikbaarheid: z.object({
    // Weekly schedule - simple boolean per day/time slot
    maandag: z.boolean().default(false),
    dinsdag: z.boolean().default(false),
    woensdag: z.boolean().default(false),
    donderdag: z.boolean().default(false),
    vrijdag: z.boolean().default(false),
    zaterdag: z.boolean().default(false),
    zondag: z.boolean().default(false),
    // Time preferences
    dagdienst: z.boolean().default(false), // 06:00-18:00
    avonddienst: z.boolean().default(false), // 18:00-23:00
    nachtdienst: z.boolean().default(false), // 23:00-06:00
  }),
  referenties: z
    .array(
      z.object({
        naam: z.string().min(1, "Naam is verplicht"),
        bedrijf: z.string().min(1, "Bedrijf is verplicht"),
        telefoon: z
          .string()
          .regex(/^(\+31|0)[0-9]{9}$/, "Voer een geldig telefoonnummer in"),
        email: z.string().email("Voer een geldig email adres in"),
        relatie: z.string().min(1, "Beschrijf je relatie met deze referentie"),
      }),
    )
    .max(3, "Maximaal 3 referenties toegestaan")
    .optional(),
});

// Form state types
export type LoginFormData = z.infer<typeof loginSchema>;
export type BaseRegistrationFormData = z.infer<typeof baseRegistrationSchema>;
export type ZZPRegistrationFormData = z.infer<typeof zzpRegistrationSchema>;
export type BedrijfRegistrationFormData = z.infer<
  typeof bedrijfRegistrationSchema
>;
export type OpdrachtgeverRegistrationFormData = z.infer<
  typeof opdrachtgeverRegistrationSchema
>;
export type ZZPBusinessInfoFormData = z.infer<typeof zzpBusinessInfoSchema>;
export type BedrijfBusinessInfoFormData = z.infer<
  typeof bedrijfBusinessInfoSchema
>;
export type CertificatenFormData = z.infer<typeof certificatenSchema>;
export type SpecialisatiesFormData = z.infer<typeof specialisatiesSchema>;
export type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>;
