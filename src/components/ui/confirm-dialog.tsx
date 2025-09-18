"use client";

import {
  AlertTriangle,
  Clock,
  Loader2,
  LogOut,
  RefreshCw,
  Shield,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Confirm dialog variant types
type ConfirmVariant =
  | "default"
  | "destructive"
  | "warning"
  | "security"
  | "logout";

interface ConfirmDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

const variantConfig = {
  default: {
    icon: AlertTriangle,
    confirmClass: "bg-primary hover:bg-primary/90",
    iconClass: "text-blue-600",
  },
  destructive: {
    icon: Trash2,
    confirmClass: "bg-red-600 hover:bg-red-700",
    iconClass: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    confirmClass: "bg-orange-600 hover:bg-orange-700",
    iconClass: "text-orange-600",
  },
  security: {
    icon: Shield,
    confirmClass: "bg-purple-600 hover:bg-purple-700",
    iconClass: "text-purple-600",
  },
  logout: {
    icon: LogOut,
    confirmClass: "bg-red-600 hover:bg-red-700",
    iconClass: "text-red-600",
  },
};

export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Bevestigen",
  cancelText = "Annuleren",
  variant = "default",
  icon,
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
  children,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const config = variantConfig[variant];
  const IconComponent = icon || config.icon;

  const handleConfirm = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onConfirm();
      setDialogOpen?.(false);
    } catch (error) {
      console.error("Confirm action failed:", error);
      // Keep dialog open on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return;

    onCancel?.();
    setDialogOpen?.(false);
  };

  const dialogContent = (
    <AlertDialogContent className="sm:max-w-[425px]">
      <AlertDialogHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-full bg-muted",
              variant === "destructive" && "bg-red-100 dark:bg-red-900/20",
              variant === "warning" && "bg-orange-100 dark:bg-orange-900/20",
              variant === "security" && "bg-purple-100 dark:bg-purple-900/20",
            )}
          >
            <IconComponent className={cn("h-5 w-5", config.iconClass)} />
          </div>
          <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
        </div>
        <AlertDialogDescription className="text-left pt-2">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>

      {children && <div className="py-4">{children}</div>}

      <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <AlertDialogCancel asChild>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button
            className={config.confirmClass}
            onClick={handleConfirm}
            disabled={disabled || isLoading}
          >
            {(loading || isLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {confirmText}
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (trigger) {
    return (
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        {dialogContent}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {dialogContent}
    </AlertDialog>
  );
}

// Pre-built confirm dialogs for common use cases

interface DeleteConfirmProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  itemName: string;
  itemType?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function DeleteConfirm({
  trigger,
  open,
  onOpenChange,
  itemName,
  itemType = "item",
  onConfirm,
  loading,
}: DeleteConfirmProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={`${itemType} verwijderen`}
      description={`Weet je zeker dat je "${itemName}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
      confirmText="Verwijderen"
      cancelText="Annuleren"
      variant="destructive"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

interface LogoutConfirmProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function LogoutConfirm({
  trigger,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: LogoutConfirmProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title="Uitloggen"
      description="Weet je zeker dat je wilt uitloggen? Je moet opnieuw inloggen om toegang te krijgen tot je account."
      confirmText="Uitloggen"
      cancelText="Annuleren"
      variant="logout"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

interface WithdrawApplicationConfirmProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  jobTitle: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function WithdrawApplicationConfirm({
  trigger,
  open,
  onOpenChange,
  jobTitle,
  onConfirm,
  loading,
}: WithdrawApplicationConfirmProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title="Sollicitatie intrekken"
      description={`Weet je zeker dat je je sollicitatie voor "${jobTitle}" wilt intrekken? Je kunt later opnieuw solliciteren als de opdracht nog beschikbaar is.`}
      confirmText="Intrekken"
      cancelText="Behouden"
      variant="warning"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

interface ClockOutConfirmProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hoursWorked: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ClockOutConfirm({
  trigger,
  open,
  onOpenChange,
  hoursWorked,
  onConfirm,
  loading,
}: ClockOutConfirmProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title="Uitchecken bevestigen"
      description={`Je gaat uitchecken na ${hoursWorked} gewerkte uren. Controleer of dit klopt voordat je bevestigt.`}
      confirmText="Uitchecken"
      cancelText="Annuleren"
      variant="security"
      icon={<Clock className="h-5 w-5" />}
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

interface ResetFormConfirmProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ResetFormConfirm({
  trigger,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: ResetFormConfirmProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title="Formulier resetten"
      description="Weet je zeker dat je alle wijzigingen wilt verwijderen? Alle niet-opgeslagen gegevens gaan verloren."
      confirmText="Resetten"
      cancelText="Behouden"
      variant="warning"
      icon={<RefreshCw className="h-5 w-5" />}
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

// Hook for programmatic confirm dialogs
interface UseConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
}

export function useConfirm() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    options: UseConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: null,
    resolve: null,
  });

  const confirm = (options: UseConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        options,
        resolve,
      });
    });
  };

  const handleConfirm = () => {
    dialogState.resolve?.(true);
    setDialogState({ open: false, options: null, resolve: null });
  };

  const handleCancel = () => {
    dialogState.resolve?.(false);
    setDialogState({ open: false, options: null, resolve: null });
  };

  const ConfirmDialogComponent = dialogState.options && (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}
      title={dialogState.options.title}
      description={dialogState.options.description}
      confirmText={dialogState.options.confirmText}
      cancelText={dialogState.options.cancelText}
      variant={dialogState.options.variant}
      icon={dialogState.options.icon}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialogComponent };
}

// Utility function for quick confirms
export async function quickConfirm(
  title: string,
  description: string,
  _options?: Partial<UseConfirmOptions>,
): Promise<boolean> {
  return new Promise((resolve) => {
    // This would need to be implemented with a global dialog context
    // For now, we'll use the browser's native confirm as fallback
    const result = window.confirm(`${title}\n\n${description}`);
    resolve(result);
  });
}
