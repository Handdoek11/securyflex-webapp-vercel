import { z } from "zod";

// Base validation patterns
const phoneRegex = /^(\+31|0031|0)[6-9]\d{8}$/;
const kvkRegex = /^\d{8}$/;
const btwRegex = /^NL\d{9}B\d{2}$/;
const postcodeRegex = /^\d{4}\s?[A-Z]{2}$/i;
const ndNummerRegex = /^ND\d{6,8}$/; // ND-nummer format: ND followed by 6-8 digits

// Common field validations
export const baseValidations = {
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().regex(phoneRegex, "Ongeldig Nederlands telefoonnummer"),
  kvkNumber: z.string().regex(kvkRegex, "KvK nummer moet 8 cijfers bevatten"),
  btwNumber: z
    .string()
    .regex(btwRegex, "Ongeldig BTW nummer (bijv. NL123456789B01)"),
  postcode: z.string().regex(postcodeRegex, "Ongeldige postcode"),
  ndNummer: z
    .string()
    .regex(ndNummerRegex, "Ongeldig ND-nummer (bijv. ND123456)"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters bevatten"),
  name: z.string().min(2, "Naam moet minimaal 2 karakters bevatten"),
  hourlyRate: z
    .number()
    .min(15, "Uurtarief moet minimaal €15 zijn")
    .max(100, "Uurtarief kan niet hoger zijn dan €100"),
};

// User registration schema
export const registerSchema = z
  .object({
    name: baseValidations.name,
    email: baseValidations.email,
    password: baseValidations.password,
    confirmPassword: z.string(),
    role: z.enum(["ZZP_BEVEILIGER", "BEDRIJF", "OPDRACHTGEVER"]),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "Je moet de voorwaarden accepteren"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

// ZZP Profile schema - aligned with Prisma schema
export const zzpProfileSchema = z.object({
  // Personal info (new required fields from Prisma)
  voornaam: z.string().min(2, "Voornaam moet minimaal 2 karakters bevatten"),
  achternaam: z
    .string()
    .min(2, "Achternaam moet minimaal 2 karakters bevatten"),
  geboortedatum: z.string().min(10, "Geboortedatum is verplicht").optional(),

  // Business info
  kvkNummer: baseValidations.kvkNumber,
  btwNummer: baseValidations.btwNumber.optional(),

  // Address (optional in Prisma)
  adres: z
    .string()
    .min(5, "Adres moet minimaal 5 karakters bevatten")
    .optional(),
  postcode: baseValidations.postcode.optional(),
  plaats: z
    .string()
    .min(2, "Plaats moet minimaal 2 karakters bevatten")
    .optional(),

  // Professional info
  uurtarief: baseValidations.hourlyRate,
  specialisaties: z
    .array(z.string())
    .min(1, "Selecteer minimaal 1 specialisatie"),
  certificatenLegacy: z.array(z.string()).optional(), // Legacy field, will be migrated
  werkgebied: z.array(z.string()).min(1, "Selecteer minimaal 1 werkgebied"),

  // Experience and capabilities
  ervaring: z
    .number()
    .min(0, "Ervaring kan niet negatief zijn")
    .max(50, "Maximaal 50 jaar ervaring")
    .optional(),
  rijbewijs: z.boolean().default(false),
  autoDescikbaar: z.boolean().default(false),

  // ND-nummer compliance (optional)
  ndNummer: baseValidations.ndNummer.optional(),
  ndNummerVervalDatum: z.string().optional(),

  // Availability as JSON
  beschikbaarheid: z.object({
    maandag: z.object({
      beschikbaar: z.boolean(),
      van: z.string().optional(),
      tot: z.string().optional(),
    }),
    dinsdag: z.object({
      beschikbaar: z.boolean(),
      van: z.string().optional(),
      tot: z.string().optional(),
    }),
    woensdag: z.object({
      beschikbaar: z.boolean(),
      van: z.string().optional(),
      tot: z.string().optional(),
    }),
    donderdag: z.object({
      beschikbaar: z.boolean(),
      van: z.string().optional(),
      tot: z.string().optional(),
    }),
    vrijdag: z.object({
      beschikbaar: z.boolean(),
      van: z.string().optional(),
      tot: z.string().optional(),
    }),
    zaterdag: z.object({
      beschikbaar: z.boolean(),
      van: z.string().optional(),
      tot: z.string().optional(),
    }),
    zondag: z.object({
      beschikbaar: z.boolean(),
      van: z.string().optional(),
      tot: z.string().optional(),
    }),
  }),
});

// Settings schema
export const settingsSchema = z.object({
  // Account settings
  name: baseValidations.name,
  email: baseValidations.email,
  phone: baseValidations.phone,

  // Notification preferences
  emailNotifications: z.object({
    jobOffers: z.boolean(),
    shiftReminders: z.boolean(),
    payments: z.boolean(),
    marketing: z.boolean(),
  }),
  smsNotifications: z.object({
    urgentJobs: z.boolean(),
    shiftReminders: z.boolean(),
    emergencyAlerts: z.boolean(),
  }),
  pushNotifications: z.object({
    jobOffers: z.boolean(),
    shiftReminders: z.boolean(),
    messages: z.boolean(),
    emergencyAlerts: z.boolean(),
  }),

  // Privacy settings
  profileVisibility: z.enum(["PUBLIC", "PRIVATE", "VERIFIED_ONLY"]),
  showOnlineStatus: z.boolean(),
  shareLocationData: z.boolean(),

  // Work preferences
  maxTravelDistance: z.number().min(0).max(200),
  autoAcceptUrgent: z.boolean(),
  preferredJobTypes: z.array(z.string()),
  minimumNoticeHours: z.number().min(0).max(168),

  // GPS & Security settings
  gpsAccuracy: z.enum(["HIGH", "MEDIUM", "LOW"]),
  autoClockIn: z.boolean(),
  requirePhotoVerification: z.boolean(),
  biometricAuth: z.boolean(),
});

// GPS Clock-in schema
export const clockInSchema = z.object({
  opdrachtId: z.string().min(1, "Opdracht ID is verplicht"),
  locatie: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
  }),
  foto: z.string().optional(), // Base64 encoded photo
  opmerkingen: z
    .string()
    .max(500, "Opmerkingen kunnen maximaal 500 karakters bevatten")
    .optional(),
});

// Clock-out schema
export const clockOutSchema = z.object({
  locatie: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
  }),
  foto: z.string().optional(),
  pauzetijd: z.number().min(0).max(480).optional(), // In minutes, max 8 hours
  opmerkingen: z.string().max(500).optional(),
  incidenten: z
    .array(
      z.object({
        type: z.enum(["ALARM", "INCIDENT", "NOODGEVAL", "OVERIG"]),
        beschrijving: z
          .string()
          .min(10, "Beschrijving moet minimaal 10 karakters bevatten"),
        tijdstip: z.string(),
        locatie: z.string().optional(),
      }),
    )
    .optional(),
});

// Job application schema
export const jobApplicationSchema = z.object({
  motivatie: z
    .string()
    .min(20, "Motivatie moet minimaal 20 karakters bevatten")
    .optional(),
  beschikbaarheidOpmerking: z.string().max(200).optional(),
  uurtariefVoorstel: z.number().min(15).max(100).optional(),
  extraVelingen: z.array(z.string()).optional(),
  vervoer: z.enum(["AUTO", "OV", "FIETS", "ANDERS"]).optional(),
  quickApply: z.boolean().default(false),
});

// File upload schema
export const fileUploadSchema = z
  .object({
    file: z.instanceof(File),
    type: z.enum(["CERTIFICATE", "ID", "KVK", "BANK", "PROFILE_PHOTO"]),
    beschrijving: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      const allowedTypes = {
        CERTIFICATE: ["application/pdf", "image/jpeg", "image/png"],
        ID: ["image/jpeg", "image/png"],
        KVK: ["application/pdf"],
        BANK: ["application/pdf"],
        PROFILE_PHOTO: ["image/jpeg", "image/png"],
      };

      return allowedTypes[data.type].includes(data.file.type);
    },
    {
      message: "Ongeldig bestandstype voor dit document",
      path: ["file"],
    },
  )
  .refine(
    (data) => {
      const maxSizes = {
        CERTIFICATE: 10 * 1024 * 1024, // 10MB
        ID: 5 * 1024 * 1024, // 5MB
        KVK: 10 * 1024 * 1024, // 10MB
        BANK: 10 * 1024 * 1024, // 10MB
        PROFILE_PHOTO: 2 * 1024 * 1024, // 2MB
      };

      return data.file.size <= maxSizes[data.type];
    },
    {
      message: "Bestand is te groot",
      path: ["file"],
    },
  );

// Certificate schema
export const certificateSchema = z.object({
  type: z.enum(["BOA", "BHV", "WPBR", "VCA", "EHBO", "ANDERS"]),
  naam: z.string().min(2, "Naam moet minimaal 2 karakters bevatten"),
  uitgever: z.string().min(2, "Uitgever moet minimaal 2 karakters bevatten"),
  behaaldOp: z.string().min(10, "Datum is verplicht"),
  verlooptOp: z.string().min(10).optional(),
  documentUrl: z.string().url().optional(),
  beschrijving: z.string().max(500).optional(),
});

// Help ticket schema
export const helpTicketSchema = z.object({
  onderwerp: z.string().min(5, "Onderwerp moet minimaal 5 karakters bevatten"),
  categorie: z.enum(["TECHNISCH", "ACCOUNT", "BETALING", "OPDRACHT", "ANDERS"]),
  prioriteit: z.enum(["LAAG", "NORMAAL", "HOOG", "URGENT"]),
  beschrijving: z
    .string()
    .min(20, "Beschrijving moet minimaal 20 karakters bevatten"),
  bijlagen: z.array(z.string()).optional(),
});

// Bedrijf Profile schema
export const bedrijfProfileSchema = z.object({
  bedrijfsnaam: z
    .string()
    .min(2, "Bedrijfsnaam moet minimaal 2 karakters bevatten"),
  kvkNummer: baseValidations.kvkNumber,
  btwNummer: baseValidations.btwNumber,
  email: baseValidations.email,
  telefoon: baseValidations.phone,
  website: z.string().url("Ongeldige website URL").optional(),
  adres: z.string().min(5, "Adres moet minimaal 5 karakters bevatten"),
  postcode: baseValidations.postcode,
  plaats: z.string().min(2, "Plaats moet minimaal 2 karakters bevatten"),
  beschrijving: z
    .string()
    .min(20, "Beschrijving moet minimaal 20 karakters bevatten"),
  specialisaties: z
    .array(z.string())
    .min(1, "Selecteer minimaal 1 specialisatie"),
  werkgebied: z.array(z.string()).min(1, "Selecteer minimaal 1 werkgebied"),
  aantalMedewerkers: z
    .number()
    .min(1, "Aantal medewerkers moet minimaal 1 zijn")
    .max(1000),
  oprichtingsjaar: z.number().min(1900).max(new Date().getFullYear()),
  certificeringen: z.array(z.string()).optional(),
  bedrijfsstructuur: z.enum([
    "BV",
    "NV",
    "VOF",
    "EENMANSZAAK",
    "STICHTING",
    "ANDERS",
  ]),
});

// Opdrachtgever Profile schema - aligned with Prisma schema
export const opdrachtgeverProfileSchema = z.object({
  bedrijfsnaam: z
    .string()
    .min(2, "Bedrijfsnaam moet minimaal 2 karakters bevatten"), // Changed from organisatienaam to match Prisma
  contactpersoon: z
    .string()
    .min(2, "Contactpersoon moet minimaal 2 karakters bevatten"),
  email: baseValidations.email,
  telefoon: baseValidations.phone,
  website: z.string().url("Ongeldige website URL").optional(),
  adres: z.string().min(5, "Adres moet minimaal 5 karakters bevatten"),
  postcode: baseValidations.postcode,
  plaats: z.string().min(2, "Plaats moet minimaal 2 karakters bevatten"),
  beschrijving: z
    .string()
    .min(20, "Beschrijving moet minimaal 20 karakters bevatten"),
  sector: z.string().min(2, "Sector moet minimaal 2 karakters bevatten"),
  organisatietype: z.enum([
    "BEDRIJF",
    "OVERHEID",
    "ZIEKENHUIS",
    "SCHOOL",
    "EVENEMENT",
    "PARTICULIER",
    "ANDERS",
  ]),
  kvkNummer: baseValidations.kvkNumber.optional(),
  btwNummer: baseValidations.btwNumber.optional(),
});

// Simplified Opdrachtgever Profile schema that matches database structure
export const opdrachtgeverDbProfileSchema = z.object({
  name: baseValidations.name.optional(),
  email: baseValidations.email.optional(),
  phone: baseValidations.phone.optional(),
  bedrijfsnaam: z
    .string()
    .min(2, "Bedrijfsnaam moet minimaal 2 karakters bevatten"),
  kvkNummer: baseValidations.kvkNumber.optional(),
  contactpersoon: z
    .string()
    .min(2, "Contactpersoon moet minimaal 2 karakters bevatten"),
});

// Opdracht creation schema
export const opdrachtCreateSchema = z.object({
  titel: z
    .string()
    .min(5, "Titel moet minimaal 5 karakters bevatten")
    .max(100, "Titel mag maximaal 100 karakters bevatten"),
  beschrijving: z
    .string()
    .min(20, "Beschrijving moet minimaal 20 karakters bevatten")
    .max(2000, "Beschrijving mag maximaal 2000 karakters bevatten"),
  locatie: z.object({
    adres: z.string().min(5, "Adres moet minimaal 5 karakters bevatten"),
    postcode: baseValidations.postcode,
    plaats: z.string().min(2, "Plaats moet minimaal 2 karakters bevatten"),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
  startDatum: z.string().min(10, "Startdatum is verplicht"),
  eindDatum: z.string().min(10, "Einddatum is verplicht"),
  startTijd: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Ongeldige tijd (HH:MM)"),
  eindTijd: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Ongeldige tijd (HH:MM)"),
  uurtarief: z
    .number()
    .min(15, "Uurtarief moet minimaal €15 zijn")
    .max(100, "Uurtarief mag maximaal €100 zijn"),
  aantalBeveiligers: z
    .number()
    .min(1, "Minimaal 1 beveiliger")
    .max(50, "Maximaal 50 beveiligers"),
  urgentie: z.enum(["LAAG", "NORMAAL", "HOOG", "SPOED"]),
  vereisten: z.array(z.string()).optional(),
  specialisaties: z
    .array(z.string())
    .min(1, "Selecteer minimaal 1 specialisatie"),
  targetAudience: z.enum([
    "ALLEEN_BEDRIJVEN",
    "ALLEEN_ZZP",
    "BEIDEN",
    "EIGEN_TEAM",
  ]),
  directZZPAllowed: z.boolean(),
  automatischGoedkeuren: z.boolean().default(false),
  bijzonderheden: z
    .string()
    .max(1000, "Bijzonderheden mogen maximaal 1000 karakters bevatten")
    .optional(),
});

// Werkuren log schema
export const werkurenLogSchema = z.object({
  opdrachtId: z.string().min(1, "Opdracht ID is verplicht"),
  startTijd: z.string().datetime("Ongeldige start tijd"),
  eindTijd: z.string().datetime("Ongeldige eind tijd").optional(),
  pauzes: z
    .array(
      z.object({
        start: z.string().datetime("Ongeldige pauze start tijd"),
        eind: z.string().datetime("Ongeldige pauze eind tijd"),
        reden: z
          .string()
          .max(200, "Reden mag maximaal 200 karakters bevatten")
          .optional(),
      }),
    )
    .optional(),
  locatieChecks: z
    .array(
      z.object({
        tijdstip: z.string().datetime("Ongeldige tijdstip"),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        accuracy: z.number().min(0).optional(),
      }),
    )
    .optional(),
  incidenten: z
    .array(
      z.object({
        tijdstip: z.string().datetime("Ongeldige incident tijd"),
        type: z.enum(["ALARM", "INCIDENT", "NOODGEVAL", "OVERIG"]),
        beschrijving: z
          .string()
          .min(10, "Beschrijving moet minimaal 10 karakters bevatten"),
        afgehandeld: z.boolean().default(false),
      }),
    )
    .optional(),
  opmerkingen: z
    .string()
    .max(1000, "Opmerkingen mogen maximaal 1000 karakters bevatten")
    .optional(),
  fotoBewijzen: z.array(z.string().url("Ongeldige foto URL")).optional(),
});

// Review/Evaluation schema
export const reviewSchema = z.object({
  opdrachtId: z.string().min(1, "Opdracht ID is verplicht"),
  revieweeId: z.string().min(1, "Reviewer ID is verplicht"),
  rating: z
    .number()
    .min(1, "Rating moet minimaal 1 zijn")
    .max(5, "Rating mag maximaal 5 zijn"),
  punctualiteit: z.number().min(1).max(5),
  professionaliteit: z.number().min(1).max(5),
  communicatie: z.number().min(1).max(5),
  kwaliteit: z.number().min(1).max(5),
  aanbeveling: z.boolean(),
  opmerking: z
    .string()
    .min(10, "Opmerking moet minimaal 10 karakters bevatten")
    .max(1000, "Opmerking mag maximaal 1000 karakters bevatten"),
  anoniem: z.boolean().default(false),
});

// Message/Communication schema
export const messageSchema = z.object({
  opdrachtId: z.string().min(1, "Opdracht ID is verplicht").optional(),
  ontvangerId: z.string().min(1, "Ontvanger ID is verplicht"),
  onderwerp: z
    .string()
    .min(3, "Onderwerp moet minimaal 3 karakters bevatten")
    .max(100, "Onderwerp mag maximaal 100 karakters bevatten"),
  bericht: z
    .string()
    .min(5, "Bericht moet minimaal 5 karakters bevatten")
    .max(2000, "Bericht mag maximaal 2000 karakters bevatten"),
  prioriteit: z.enum(["LAAG", "NORMAAL", "HOOG", "URGENT"]).default("NORMAAL"),
  type: z
    .enum(["PERSOONLIJK", "OPDRACHT", "SYSTEEM", "MELDING"])
    .default("PERSOONLIJK"),
  bijlagen: z.array(z.string().url("Ongeldige bijlage URL")).optional(),
});

// Payment request schema
export const paymentRequestSchema = z.object({
  opdrachtId: z.string().min(1, "Opdracht ID is verplicht"),
  werkurenIds: z.array(z.string()).min(1, "Minimaal 1 werkuren record vereist"),
  bedrag: z
    .number()
    .min(0.01, "Bedrag moet groter dan €0 zijn")
    .max(10000, "Bedrag mag maximaal €10.000 zijn"),
  beschrijving: z
    .string()
    .min(5, "Beschrijving moet minimaal 5 karakters bevatten")
    .max(500, "Beschrijving mag maximaal 500 karakters bevatten"),
  verwachteBetaaldatum: z
    .string()
    .min(10, "Verwachte betaaldatum is verplicht"),
  bijlagen: z.array(z.string().url("Ongeldige bijlage URL")).optional(),
});

// API Query parameters schema
export const queryParamsSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Pagina moet een getal zijn")
    .transform(Number)
    .refine((n) => n > 0, "Pagina moet groter dan 0 zijn")
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limiet moet een getal zijn")
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, "Limiet tussen 1 en 100")
    .optional(),
  sort: z.string().max(50, "Sort parameter te lang").optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().max(100, "Zoekterm te lang").optional(),
  filter: z.string().max(200, "Filter te lang").optional(),
  status: z.string().max(50, "Status filter te lang").optional(),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  email: z.object({
    nieuweOpdrachten: z.boolean(),
    sollicitatieUpdates: z.boolean(),
    werkurenGoedkeuringen: z.boolean(),
    betalingUpdates: z.boolean(),
    systeemMeldingen: z.boolean(),
    marketing: z.boolean(),
  }),
  sms: z.object({
    urgenteMeldingen: z.boolean(),
    shiftHerinneringen: z.boolean(),
    noodoproepen: z.boolean(),
  }),
  push: z.object({
    nieuweOpdrachten: z.boolean(),
    berichten: z.boolean(),
    werkurenHerinneringen: z.boolean(),
    incidentAlerts: z.boolean(),
  }),
  frequency: z.enum(["REALTIME", "DAGELIJKS", "WEKELIJKS", "MAANDELIJKS"]),
});

// Emergency contact schema
export const emergencyContactSchema = z.object({
  naam: z.string().min(2, "Naam moet minimaal 2 karakters bevatten"),
  relatie: z.string().min(2, "Relatie moet minimaal 2 karakters bevatten"),
  telefoon: baseValidations.phone,
  email: baseValidations.email.optional(),
  adres: z.string().min(5, "Adres moet minimaal 5 karakters bevatten"),
  isPrimair: z.boolean().default(false),
});

// ============================================
// ND-NUMMER VALIDATION SCHEMAS
// ============================================

// ND-nummer registration schema
export const ndNummerRegistrationSchema = z
  .object({
    ndNummer: baseValidations.ndNummer,
    vervalDatum: z.string().datetime("Ongeldige vervaldatum"),
    documentUpload: z.string().url("Document URL is verplicht"),
    confirmatie: z
      .boolean()
      .refine((val) => val === true, "Bevestiging is verplicht"),
  })
  .refine(
    (data) => {
      // Check that expiry date is in the future
      const expiryDate = new Date(data.vervalDatum);
      const today = new Date();
      return expiryDate > today;
    },
    {
      message: "Vervaldatum moet in de toekomst liggen",
      path: ["vervalDatum"],
    },
  )
  .refine(
    (data) => {
      // Check that expiry date is not more than 5 years from now (ND-nummer valid for max 5 years)
      const expiryDate = new Date(data.vervalDatum);
      const fiveYearsFromNow = new Date();
      fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
      return expiryDate <= fiveYearsFromNow;
    },
    {
      message: "ND-nummer kan maximaal 5 jaar geldig zijn",
      path: ["vervalDatum"],
    },
  );

// ND-nummer verification schema (for API calls to Justis)
export const ndNummerVerificationSchema = z.object({
  ndNummer: baseValidations.ndNummer,
  bedrijfsnaam: z.string().min(2, "Bedrijfsnaam is verplicht").optional(),
  kvkNummer: baseValidations.kvkNumber.optional(),
  profileType: z.enum(["ZZP", "BEDRIJF"]),
});

// ND-nummer status update schema
export const ndNummerStatusUpdateSchema = z.object({
  ndNummer: baseValidations.ndNummer,
  nieuweStatus: z.enum([
    "NIET_GEREGISTREERD",
    "AANGEVRAAGD",
    "PENDING_VERIFICATIE",
    "ACTIEF",
    "VERLOPEN",
    "INGETROKKEN",
    "GESCHORST",
    "GEWEIGERD",
  ]),
  reden: z
    .string()
    .min(5, "Reden voor statuswijziging is verplicht")
    .max(500, "Reden mag maximaal 500 karakters bevatten"),
  verificationSource: z
    .enum(["Justis API", "Manual", "Automated"])
    .default("Manual"),
  apiResponse: z.any().optional(), // For storing full API response
});

// ND-nummer renewal schema
export const ndNummerRenewalSchema = z
  .object({
    ndNummer: baseValidations.ndNummer,
    nieuweVervalDatum: z.string().datetime("Ongeldige nieuwe vervaldatum"),
    renewalDocuments: z
      .array(z.string().url("Ongeldige document URL"))
      .min(1, "Minimaal 1 document vereist"),
    kostenbetaling: z.object({
      bedrag: z
        .number()
        .min(500, "Minimaal €500 voor vernieuwing")
        .max(1000, "Maximaal €1000 voor vernieuwing"),
      methode: z.enum(["IDEAL", "CREDITCARD", "BANKTRANSFER"]),
      referentie: z.string().optional(),
    }),
    opmerkingen: z
      .string()
      .max(1000, "Opmerkingen mogen maximaal 1000 karakters bevatten")
      .optional(),
  })
  .refine(
    (data) => {
      // New expiry date should be approximately 5 years from current date
      const newExpiryDate = new Date(data.nieuweVervalDatum);
      const _currentDate = new Date();
      const fiveYearsFromNow = new Date();
      fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);

      // Allow some flexibility (4.5 - 5.5 years)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() + 4);
      minDate.setMonth(minDate.getMonth() + 6);

      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 5);
      maxDate.setMonth(maxDate.getMonth() + 6);

      return newExpiryDate >= minDate && newExpiryDate <= maxDate;
    },
    {
      message: "Nieuwe vervaldatum moet ongeveer 5 jaar vanaf nu zijn",
      path: ["nieuweVervalDatum"],
    },
  );

// ND-nummer manager registration schema (for security companies)
export const ndNummerManagerSchema = z.object({
  naam: z.string().min(2, "Naam van manager is verplicht"),
  email: baseValidations.email,
  telefoon: baseValidations.phone,
  functie: z.string().min(2, "Functie is verplicht"),
  bevoegdheden: z.array(z.string()).min(1, "Minimaal 1 bevoegdheid vereist"),
  startDatum: z.string().datetime("Ongeldige startdatum"),
  bijlagen: z.array(z.string().url()).optional(),
});

// ND-nummer audit log creation schema
export const ndNummerAuditLogSchema = z.object({
  profileType: z.enum(["ZZP", "BEDRIJF"]),
  profileId: z.string().min(1, "Profile ID is verplicht"),
  ndNummer: baseValidations.ndNummer.optional(),
  previousStatus: z
    .enum([
      "NIET_GEREGISTREERD",
      "AANGEVRAAGD",
      "PENDING_VERIFICATIE",
      "ACTIEF",
      "VERLOPEN",
      "INGETROKKEN",
      "GESCHORST",
      "GEWEIGERD",
    ])
    .optional(),
  newStatus: z.enum([
    "NIET_GEREGISTREERD",
    "AANGEVRAAGD",
    "PENDING_VERIFICATIE",
    "ACTIEF",
    "VERLOPEN",
    "INGETROKKEN",
    "GESCHORST",
    "GEWEIGERD",
  ]),
  action: z.enum([
    "REGISTRATIE",
    "VERIFICATIE",
    "HERNIEUWING",
    "STATUS_WIJZIGING",
    "DOCUMENTEN_UPLOAD",
    "HERINNERING_VERSTUURD",
    "AUTOMATISCHE_CHECK",
    "HANDMATIGE_UPDATE",
    "GESCHORST",
    "HERSTELD",
    "INGETROKKEN",
  ]),
  performedBy: z.string().optional(),
  verificationSource: z.string().max(100).optional(),
  expiryDate: z.string().datetime().optional(),
  nextCheckDue: z.string().datetime().optional(),
  complianceNotes: z.string().max(2000).optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  apiResponse: z.any().optional(),
});

// ND-nummer compliance check schema
export const ndNummerComplianceCheckSchema = z.object({
  profileIds: z
    .array(z.string())
    .min(1, "Minimaal 1 profiel ID vereist")
    .max(100, "Maximaal 100 profielen per check"),
  checkType: z.enum(["EXPIRY_CHECK", "STATUS_VERIFICATION", "FULL_AUDIT"]),
  includeExpiringSoon: z.boolean().default(true),
  daysBeforeExpiry: z
    .number()
    .min(1, "Minimaal 1 dag")
    .max(365, "Maximaal 365 dagen")
    .default(90),
  includeInactiveProfiles: z.boolean().default(false),
});

// ND-nummer notification schema
export const ndNummerNotificationSchema = z.object({
  profileType: z.enum(["ZZP", "BEDRIJF"]),
  profileId: z.string().min(1, "Profile ID is verplicht"),
  notificationType: z.enum([
    "EXPIRY_WARNING_90_DAYS",
    "EXPIRY_WARNING_60_DAYS",
    "EXPIRY_WARNING_30_DAYS",
    "EXPIRED_NOTIFICATION",
    "RENEWAL_REMINDER",
    "STATUS_CHANGE",
    "VERIFICATION_REQUIRED",
    "DOCUMENT_UPLOAD_REQUIRED",
  ]),
  channels: z
    .array(z.enum(["EMAIL", "SMS", "PUSH", "IN_APP"]))
    .min(1, "Minimaal 1 notificatie kanaal"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  customMessage: z.string().max(500).optional(),
  scheduledFor: z.string().datetime().optional(), // For scheduled notifications
});

// Export types for TypeScript inference
export type RegisterData = z.infer<typeof registerSchema>;
export type ZZPProfileData = z.infer<typeof zzpProfileSchema>;
export type BedrijfProfileData = z.infer<typeof bedrijfProfileSchema>;
export type OpdrachtgeverProfileData = z.infer<
  typeof opdrachtgeverProfileSchema
>;
export type OpdrachtgeverDbProfileData = z.infer<
  typeof opdrachtgeverDbProfileSchema
>;
export type SettingsData = z.infer<typeof settingsSchema>;
export type ClockInData = z.infer<typeof clockInSchema>;
export type ClockOutData = z.infer<typeof clockOutSchema>;
export type JobApplicationData = z.infer<typeof jobApplicationSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type CertificateData = z.infer<typeof certificateSchema>;
export type HelpTicketData = z.infer<typeof helpTicketSchema>;
export type OpdrachtCreateData = z.infer<typeof opdrachtCreateSchema>;
export type WerkurenLogData = z.infer<typeof werkurenLogSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type PaymentRequestData = z.infer<typeof paymentRequestSchema>;
export type QueryParamsData = z.infer<typeof queryParamsSchema>;
export type NotificationPreferencesData = z.infer<
  typeof notificationPreferencesSchema
>;
export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;

// ND-nummer types
export type NDNummerRegistrationData = z.infer<
  typeof ndNummerRegistrationSchema
>;
export type NDNummerVerificationData = z.infer<
  typeof ndNummerVerificationSchema
>;
export type NDNummerStatusUpdateData = z.infer<
  typeof ndNummerStatusUpdateSchema
>;
export type NDNummerRenewalData = z.infer<typeof ndNummerRenewalSchema>;
export type NDNummerManagerData = z.infer<typeof ndNummerManagerSchema>;
export type NDNummerAuditLogData = z.infer<typeof ndNummerAuditLogSchema>;
export type NDNummerComplianceCheckData = z.infer<
  typeof ndNummerComplianceCheckSchema
>;
export type NDNummerNotificationData = z.infer<
  typeof ndNummerNotificationSchema
>;

// Validation helper functions
export function validateField<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Find the most specific error, prioritizing custom refine errors
      const customError = error.errors?.find((err) => err.code === "custom");
      const firstError = customError || error.errors?.[0];
      return { success: false, error: firstError?.message || "Validatiefout" };
    }
    return { success: false, error: "Onbekende validatiefout" };
  }
}

export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: boolean; errors?: Record<string, string> } {
  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path.join(".")] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: "Onbekende validatiefout" } };
  }
}

// API Request validation helper
export function validateApiRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options: {
    allowPartial?: boolean;
    throwOnError?: boolean;
    sanitize?: boolean;
  } = {},
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
} {
  try {
    const parseMethod = options.allowPartial
      ? schema.partial().parse
      : schema.parse;
    let result = parseMethod(data);

    // Basic sanitization if requested
    if (options.sanitize && typeof result === "object" && result !== null) {
      result = sanitizeObject(result);
    }

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path.join(".")] = err.message;
        }
      });

      if (options.throwOnError) {
        throw new Error(
          `Validation failed: ${Object.values(errors).join(", ")}`,
        );
      }

      return {
        success: false,
        errors,
        error: error.errors?.[0]?.message || "Validatiefout",
      };
    }

    const errorMessage = "Onbekende validatiefout";
    if (options.throwOnError) {
      throw new Error(errorMessage);
    }

    return { success: false, error: errorMessage };
  }
}

// Sanitization helper for XSS prevention
function sanitizeObject<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // Basic HTML tag stripping - for production use a proper sanitizer like DOMPurify
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>/g, "")
        .trim();
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Batch validation for multiple items
export function validateBatch<T>(
  schema: z.ZodSchema<T>,
  items: unknown[],
  options: { stopOnFirstError?: boolean } = {},
): {
  success: boolean;
  validItems: T[];
  errors: Array<{ index: number; errors: Record<string, string> }>;
} {
  const validItems: T[] = [];
  const errors: Array<{ index: number; errors: Record<string, string> }> = [];

  for (let i = 0; i < items.length; i++) {
    const result = validateField(schema, items[i]);

    if (result.success && result.data) {
      validItems.push(result.data);
    } else {
      const itemErrors: Record<string, string> = {};
      if (result.error) {
        itemErrors.general = result.error;
      }
      errors.push({ index: i, errors: itemErrors });

      if (options.stopOnFirstError) {
        break;
      }
    }
  }

  return {
    success: errors.length === 0,
    validItems,
    errors,
  };
}

// Schema composition helpers for complex validations
export const commonApiSchemas = {
  // Pagination schema
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),

  // Date range schema
  dateRange: z
    .object({
      startDate: z.string().datetime("Ongeldige startdatum"),
      endDate: z.string().datetime("Ongeldige einddatum"),
    })
    .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
      message: "Startdatum moet voor einddatum liggen",
      path: ["endDate"],
    }),

  // Search filters
  searchFilters: z.object({
    search: z.string().max(100).optional(),
    status: z.string().max(50).optional(),
    location: z.string().max(100).optional(),
    skills: z.array(z.string()).optional(),
  }),
};

// Production-ready validation middleware schema
export const apiValidationMiddleware = {
  // For Next.js API routes
  validateBody:
    <T>(schema: z.ZodSchema<T>) =>
    (
      req: any,
    ): { success: boolean; data?: T; errors?: Record<string, string> } => {
      return validateApiRequest(schema, req.body, { sanitize: true });
    },

  validateQuery:
    <T>(schema: z.ZodSchema<T>) =>
    (
      req: any,
    ): { success: boolean; data?: T; errors?: Record<string, string> } => {
      return validateApiRequest(schema, req.query, { allowPartial: true });
    },

  validateParams:
    <T>(schema: z.ZodSchema<T>) =>
    (
      req: any,
    ): { success: boolean; data?: T; errors?: Record<string, string> } => {
      return validateApiRequest(schema, req.params);
    },
};
