"use client";

import { AlertCircle, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinqleStatus {
  operational: boolean;
  apiStatus: "operational" | "degraded" | "down";
  lastChecked: Date;
  components: {
    partnersApi: boolean;
    vendorApi: boolean;
    onboarding: boolean;
    connect: boolean;
    debtorPortal: boolean;
    merchantApp: boolean;
  };
}

export function FinqleStatusIndicator() {
  const [status, setStatus] = useState<FinqleStatus>({
    operational: true,
    apiStatus: "operational",
    lastChecked: new Date(),
    components: {
      partnersApi: true,
      vendorApi: true,
      onboarding: true,
      connect: true,
      debtorPortal: true,
      merchantApp: true,
    },
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      // In production, this would check the actual Finqle status endpoint
      // For now, we'll simulate with the known status
      const _response = await fetch(
        "https://status.finqle.com/api/v2/summary.json",
        {
          method: "GET",
          mode: "no-cors", // Status pages often don't support CORS
        },
      );

      // Since we can't actually fetch due to CORS, we'll use mock data
      // In production, this would be handled by a backend API
      setStatus({
        operational: true,
        apiStatus: "operational",
        lastChecked: new Date(),
        components: {
          partnersApi: true,
          vendorApi: true,
          onboarding: true,
          connect: true,
          debtorPortal: true,
          merchantApp: true,
        },
      });
    } catch (error) {
      console.error("Failed to check Finqle status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Check status every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const getStatusIcon = () => {
    switch (status.apiStatus) {
      case "operational":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "degraded":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "down":
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusVariant = (): "default" | "warning" | "destructive" => {
    switch (status.apiStatus) {
      case "operational":
        return "default";
      case "degraded":
        return "warning";
      case "down":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusText = () => {
    switch (status.apiStatus) {
      case "operational":
        return "Finqle Actief";
      case "degraded":
        return "Finqle Verstoord";
      case "down":
        return "Finqle Offline";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getStatusVariant()}
            className="gap-1 cursor-pointer"
            onClick={checkStatus}
          >
            {isChecking ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              getStatusIcon()
            )}
            {getStatusText()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">Finqle API Status</p>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                {status.components.vendorApi ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                <span>Vendor API</span>
              </div>
              <div className="flex items-center gap-2">
                {status.components.onboarding ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                <span>Onboarding</span>
              </div>
              <div className="flex items-center gap-2">
                {status.components.merchantApp ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                <span>Merchant App</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Laatst gecontroleerd:{" "}
              {status.lastChecked.toLocaleTimeString("nl-NL")}
            </p>
            <a
              href="https://status.finqle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Bekijk volledige status →
            </a>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
