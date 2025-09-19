"use client";

import { AlertCircle, CheckCircle, Info, Shield, XCircle } from "lucide-react";
import {
  toast as hotToast,
  Toaster,
  type ToastPosition,
} from "react-hot-toast";

// SecuryFlex branded toast notification system
export const toast = {
  success: (message: string, options?: { duration?: number }) => {
    return hotToast.success(message, {
      duration: options?.duration || 4000,
      icon: <CheckCircle className="h-5 w-5" />,
      style: {
        background: "#10b981",
        color: "white",
        border: "1px solid #059669",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
      },
      ...options,
    });
  },

  error: (message: string, options?: { duration?: number }) => {
    return hotToast.error(message, {
      duration: options?.duration || 5000,
      icon: <XCircle className="h-5 w-5" />,
      style: {
        background: "#ef4444",
        color: "white",
        border: "1px solid #dc2626",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
      },
      ...options,
    });
  },

  warning: (message: string, options?: { duration?: number }) => {
    return hotToast(message, {
      duration: options?.duration || 4000,
      icon: <AlertCircle className="h-5 w-5" />,
      style: {
        background: "#f59e0b",
        color: "white",
        border: "1px solid #d97706",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
      },
      ...options,
    });
  },

  info: (message: string, options?: { duration?: number }) => {
    return hotToast(message, {
      duration: options?.duration || 4000,
      icon: <Info className="h-5 w-5" />,
      style: {
        background: "#3b82f6",
        color: "white",
        border: "1px solid #2563eb",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
      },
      ...options,
    });
  },

  security: (message: string, options?: { duration?: number }) => {
    return hotToast(message, {
      duration: options?.duration || 6000,
      icon: <Shield className="h-5 w-5" />,
      style: {
        background: "#8b5cf6",
        color: "white",
        border: "1px solid #7c3aed",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
      },
      ...options,
    });
  },

  loading: (message: string) => {
    return hotToast.loading(message, {
      style: {
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
  ) => {
    return hotToast.promise(promise, messages, {
      success: {
        icon: <CheckCircle className="h-5 w-5" />,
        style: {
          background: "#10b981",
          color: "white",
          border: "1px solid #059669",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
      error: {
        icon: <XCircle className="h-5 w-5" />,
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
      loading: {
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
    });
  },

  dismiss: (toastId?: string) => {
    return hotToast.dismiss(toastId);
  },

  remove: (toastId: string) => {
    return hotToast.remove(toastId);
  },
};

interface ToastProviderProps {
  position?: ToastPosition;
  reverseOrder?: boolean;
  gutter?: number;
  containerClassName?: string;
  toastOptions?: {
    duration?: number;
    style?: React.CSSProperties;
  };
}

export function ToastProvider({
  position = "top-right",
  reverseOrder = false,
  gutter = 8,
  containerClassName,
  toastOptions,
}: ToastProviderProps = {}) {
  return (
    <Toaster
      position={position}
      reverseOrder={reverseOrder}
      gutter={gutter}
      containerClassName={containerClassName}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "500px",
        },
        ...toastOptions,
      }}
    />
  );
}

// Utility function for API error handling
export function handleApiError(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "Er is een onverwachte fout opgetreden";
}

// Utility function for consistent loading toasts
export function createLoadingToast(operation: string): string {
  return toast.loading(`${operation}...`);
}

// Utility function for GPS-related notifications
export const gpsToast = {
  locationRequired: () =>
    toast.warning("Locatie toegang is vereist voor deze functie"),
  locationError: () =>
    toast.error("Kan locatie niet bepalen. Controleer je GPS instellingen."),
  outsideGeofence: () => toast.warning("Je bevindt je buiten het werkgebied"),
  clockInSuccess: () => toast.success("Succesvol ingecheckt!"),
  clockOutSuccess: () => toast.success("Succesvol uitgecheckt!"),
};

// Utility function for job-related notifications
export const jobToast = {
  applicationSent: () => toast.success("Sollicitatie verstuurd!"),
  applicationAccepted: () =>
    toast.success("Sollicitatie geaccepteerd! Check je shifts."),
  applicationRejected: () => toast.error("Sollicitatie helaas afgewezen"),
  applicationWithdrawn: () => toast.info("Sollicitatie ingetrokken"),
  jobFull: () => toast.warning("Deze opdracht is vol"),
  jobExpired: () => toast.warning("Deze opdracht is niet meer beschikbaar"),
};

// Utility function for profile-related notifications
export const profileToast = {
  updateSuccess: () => toast.success("Profiel bijgewerkt"),
  updateError: () => toast.error("Kan profiel niet bijwerken"),
  uploadSuccess: () => toast.success("Bestand geüpload"),
  uploadError: () => toast.error("Upload mislukt"),
  certificateExpiring: (days: number) =>
    toast.warning(`Je certificaat verloopt over ${days} dagen`),
  profileIncomplete: () =>
    toast.warning("Vervolledig je profiel voor meer opdrachten"),
};

// Utility function for role switching notifications
export const roleToast = {
  switchToBeveiliger: () =>
    toast.info("Je bekijkt nu de pagina voor beveiligers", { duration: 3000 }),
  switchToBedrijf: () =>
    toast.info("Je bekijkt nu de pagina voor beveiligingsbedrijven", {
      duration: 3000,
    }),
  switchToOpdrachtgever: () =>
    toast.info("Je bekijkt nu de pagina voor opdrachtgevers", {
      duration: 3000,
    }),
  resetToHome: () =>
    toast.info("Terug naar overzichtspagina", { duration: 2000 }),
};

// Utility function for dashboard operations
export const dashboardToast = {
  // Data loading
  dataLoaded: () => toast.success("Gegevens geladen"),
  dataLoadError: () => toast.error("Kon gegevens niet laden"),
  dataRefreshed: () => toast.success("Gegevens vernieuwd"),
  dataRefreshError: () => toast.error("Kon gegevens niet vernieuwen"),

  // Forms and updates
  settingsSaved: () => toast.success("Instellingen opgeslagen"),
  settingsSaveError: () => toast.error("Kon instellingen niet opslaan"),
  changesSaved: () => toast.success("Wijzigingen opgeslagen"),
  changesSaveError: () => toast.error("Kon wijzigingen niet opslaan"),

  // Filters and search
  filtersApplied: () => toast.info("Filters toegepast"),
  filtersCleared: () => toast.info("Filters gewist"),
  searchCompleted: (count: number) =>
    toast.info(`${count} resultaten gevonden`),
  noResultsFound: () => toast.warning("Geen resultaten gevonden"),

  // Navigation and actions
  redirecting: () => toast.info("Doorverwijzen..."),
  actionCompleted: () => toast.success("Actie voltooid"),
  actionFailed: () => toast.error("Actie mislukt"),

  // Notifications
  notificationMarkRead: () =>
    toast.success("Notificaties gemarkeerd als gelezen"),
  notificationMarkReadError: () =>
    toast.error("Kon notificaties niet markeren als gelezen"),
  notificationDeleted: () => toast.success("Notificaties verwijderd"),
  notificationDeleteError: () =>
    toast.error("Kon notificaties niet verwijderen"),

  // Team management
  teamMemberAdded: () => toast.success("Teamlid toegevoegd"),
  teamMemberAddError: () => toast.error("Kon teamlid niet toevoegen"),
  teamMemberUpdated: () => toast.success("Teamlid bijgewerkt"),
  teamMemberUpdateError: () => toast.error("Kon teamlid niet bijwerken"),
  teamMemberRemoved: () => toast.success("Teamlid verwijderd"),
  teamMemberRemoveError: () => toast.error("Kon teamlid niet verwijderen"),

  // Hours and time tracking
  hoursSubmitted: () => toast.success("Uren ingediend voor goedkeuring"),
  hoursSubmitError: () => toast.error("Kon uren niet indienen"),
  timeEntryAdded: () => toast.success("Uren toegevoegd"),
  timeEntryAddError: () => toast.error("Kon uren niet toevoegen"),

  // Insurance and verzekeringen
  insuranceApplicationSubmitted: () =>
    toast.success("Verzekeringaanvraag ingediend"),
  insuranceApplicationError: () =>
    toast.error("Kon verzekeringaanvraag niet indienen"),
  insuranceQuoteReceived: () => toast.success("Offerte ontvangen"),

  // Finqle operations
  finqlePaymentInitiated: () => toast.success("Betaling geïnitieerd"),
  finqlePaymentError: () => toast.error("Betaling mislukt"),
  finqleInvoiceGenerated: () => toast.success("Factuur gegenereerd"),
  finqleInvoiceError: () => toast.error("Kon factuur niet genereren"),
  finqleDirectPaymentApproved: () =>
    toast.success("Direct payment goedgekeurd"),
  finqleDirectPaymentRejected: () => toast.warning("Direct payment afgewezen"),

  // General dashboard
  pageLoaded: () => toast.success("Pagina geladen"),
  pageLoadError: () => toast.error("Kon pagina niet laden"),
  permissionDenied: () => toast.error("Geen toegang tot deze functie"),
  featureComingSoon: () =>
    toast.info("Deze functie komt binnenkort beschikbaar"),
};

// Utility function for validation messages
export const validationToast = {
  required: (field: string) => toast.warning(`${field} is verplicht`),
  invalid: (field: string) => toast.warning(`${field} is ongeldig`),
  tooShort: (field: string, min: number) =>
    toast.warning(`${field} moet minimaal ${min} karakters zijn`),
  tooLong: (field: string, max: number) =>
    toast.warning(`${field} mag maximaal ${max} karakters zijn`),
  emailInvalid: () => toast.warning("E-mailadres is ongeldig"),
  phoneInvalid: () => toast.warning("Telefoonnummer is ongeldig"),
  passwordWeak: () => toast.warning("Wachtwoord is te zwak"),
  passwordMismatch: () => toast.warning("Wachtwoorden komen niet overeen"),
  fileTooBig: (maxSize: string) =>
    toast.warning(`Bestand is te groot (max ${maxSize})`),
  fileTypeInvalid: () => toast.warning("Bestandstype niet ondersteund"),
};

// Utility function for network and connection messages
export const networkToast = {
  offline: () => toast.error("Geen internetverbinding"),
  online: () => toast.success("Internetverbinding hersteld"),
  connectionSlow: () => toast.warning("Langzame internetverbinding"),
  connectionTimeout: () => toast.error("Verbinding verlopen"),
  serverError: () => toast.error("Serverfout - probeer het later opnieuw"),
  maintenanceMode: () =>
    toast.warning("Systeem onderhoud - beperkte functionaliteit"),
};
