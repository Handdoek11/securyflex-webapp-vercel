"use client";

import { toast as hotToast, Toaster, ToastPosition } from "react-hot-toast";
import { CheckCircle, AlertCircle, XCircle, Info, Shield } from "lucide-react";

// SecuryFlex branded toast notification system
export const toast = {
  success: (message: string, options?: { duration?: number }) => {
    return hotToast.success(message, {
      duration: options?.duration || 4000,
      icon: <CheckCircle className="h-5 w-5" />,
      style: {
        background: '#10b981',
        color: 'white',
        border: '1px solid #059669',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    });
  },

  error: (message: string, options?: { duration?: number }) => {
    return hotToast.error(message, {
      duration: options?.duration || 5000,
      icon: <XCircle className="h-5 w-5" />,
      style: {
        background: '#ef4444',
        color: 'white',
        border: '1px solid #dc2626',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    });
  },

  warning: (message: string, options?: { duration?: number }) => {
    return hotToast(message, {
      duration: options?.duration || 4000,
      icon: <AlertCircle className="h-5 w-5" />,
      style: {
        background: '#f59e0b',
        color: 'white',
        border: '1px solid #d97706',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    });
  },

  info: (message: string, options?: { duration?: number }) => {
    return hotToast(message, {
      duration: options?.duration || 4000,
      icon: <Info className="h-5 w-5" />,
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '1px solid #2563eb',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    });
  },

  security: (message: string, options?: { duration?: number }) => {
    return hotToast(message, {
      duration: options?.duration || 6000,
      icon: <Shield className="h-5 w-5" />,
      style: {
        background: '#8b5cf6',
        color: 'white',
        border: '1px solid #7c3aed',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    });
  },

  loading: (message: string) => {
    return hotToast.loading(message, {
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return hotToast.promise(promise, messages, {
      success: {
        icon: <CheckCircle className="h-5 w-5" />,
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      },
      error: {
        icon: <XCircle className="h-5 w-5" />,
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      },
      loading: {
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
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
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '500px',
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
  locationRequired: () => toast.warning("Locatie toegang is vereist voor deze functie"),
  locationError: () => toast.error("Kan locatie niet bepalen. Controleer je GPS instellingen."),
  outsideGeofence: () => toast.warning("Je bevindt je buiten het werkgebied"),
  clockInSuccess: () => toast.success("Succesvol ingecheckt!", { icon: <Shield className="h-5 w-5" /> }),
  clockOutSuccess: () => toast.success("Succesvol uitgecheckt!", { icon: <Shield className="h-5 w-5" /> }),
};

// Utility function for job-related notifications
export const jobToast = {
  applicationSent: () => toast.success("Sollicitatie verstuurd!"),
  applicationAccepted: () => toast.success("Sollicitatie geaccepteerd! Check je shifts."),
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