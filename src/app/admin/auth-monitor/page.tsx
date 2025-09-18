"use client";

import {
  AlertTriangle,
  CheckCircle,
  Lock,
  LogOut,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SecurityLog {
  id: string;
  userId: string | null;
  email: string | null;
  eventType: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AuthStats {
  logs: SecurityLog[];
  stats: {
    last24Hours: Array<{ eventType: string; _count: number }>;
    recentFailedLogins: number;
    currentlyLockedAccounts: number;
  };
}

export default function AuthMonitorPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<AuthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (status === "loading") return;

    const checkAdminStatus = async () => {
      if (status === "unauthenticated") {
        window.location.href = "/admin/login";
        return;
      }

      try {
        const response = await fetch("/api/admin/auth");
        const data = await response.json();

        if (!data.isAdmin) {
          setAccessDenied(true);
          window.location.href = "/admin/login";
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to verify admin status:", error);
        setAccessDenied(true);
      }
    };

    checkAdminStatus();
  }, [status]);

  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/auth-logs?limit=100", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setAccessDenied(true);
          return;
        }
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();

      // Ensure the data has the expected structure with proper defaults
      const normalizedData = {
        logs: Array.isArray(result.logs) ? result.logs : [],
        stats: {
          last24Hours: Array.isArray(result.stats?.last24Hours)
            ? result.stats.last24Hours
            : [],
          recentFailedLogins:
            typeof result.stats?.recentFailedLogins === "number"
              ? result.stats.recentFailedLogins
              : 0,
          currentlyLockedAccounts:
            typeof result.stats?.currentlyLockedAccounts === "number"
              ? result.stats.currentlyLockedAccounts
              : 0,
        },
      };

      setData(normalizedData);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError("Failed to load authentication logs. Please try again.");
      // Set default empty data to prevent undefined errors
      setData({
        logs: [],
        stats: {
          last24Hours: [],
          recentFailedLogins: 0,
          currentlyLockedAccounts: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch logs if user is admin
    if (isAdmin && status === "authenticated") {
      fetchLogs();

      if (autoRefresh) {
        const interval = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
      }
    }
  }, [autoRefresh, isAdmin, status, fetchLogs]);

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "LOGIN_SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "LOGIN_FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "ACCOUNT_LOCKED":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "LOGIN_SUCCESS":
        return "text-green-700 bg-green-50";
      case "LOGIN_FAILED":
        return "text-red-700 bg-red-50";
      case "ACCOUNT_LOCKED":
        return "text-orange-700 bg-orange-50";
      case "PASSWORD_RESET_REQUEST":
      case "PASSWORD_RESET_COMPLETED":
        return "text-blue-700 bg-blue-50";
      case "EMAIL_VERIFICATION_REQUEST":
      case "EMAIL_VERIFICATION_COMPLETED":
        return "text-purple-700 bg-purple-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-orange-500" />
            <h1 className="text-2xl font-bold mb-2">Toegang geweigerd</h1>
            <p className="text-muted-foreground mb-4">
              Beheerderstoegang vereist. Alleen geautoriseerde beheerders kunnen
              authenticatielogs bekijken.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">
              Fout bij laden authenticatiemonitor
            </h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Opnieuw proberen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Authenticatiemonitoring</h1>
          <p className="text-muted-foreground">
            Real-time authenticatieactiviteit en beveiligingslogs
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              Admin sessie actief: {session?.user?.email}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-vernieuwen: {autoRefresh ? "AAN" : "UIT"}
          </Button>
          <Button onClick={fetchLogs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Vernieuwen
          </Button>
          <Button
            onClick={() => {
              sessionStorage.removeItem("adminAuthenticated");
              sessionStorage.removeItem("adminEmail");
              signOut({ callbackUrl: "/admin/login" });
            }}
            variant="destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Admin Uitloggen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Mislukte inlogpogingen (1u)
              </p>
              <p className="text-2xl font-bold">
                {data?.stats?.recentFailedLogins || 0}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Vergrendelde accounts
              </p>
              <p className="text-2xl font-bold">
                {data?.stats?.currentlyLockedAccounts || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Totaal gebeurtenissen (24u)
              </p>
              <p className="text-2xl font-bold">
                {data?.stats?.last24Hours?.reduce(
                  (acc, item) => acc + item._count,
                  0,
                ) || 0}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Event Type Summary */}
      {data?.stats?.last24Hours &&
        Array.isArray(data.stats.last24Hours) &&
        data.stats.last24Hours.length > 0 && (
          <Card className="p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">
              Samenvatting laatste 24 uur
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.stats.last24Hours.map((stat) => (
                <div
                  key={stat.eventType || "unknown"}
                  className={`px-3 py-2 rounded-lg ${getEventTypeColor(stat.eventType || "")}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {(stat.eventType || "UNKNOWN").replace(/_/g, " ")}
                    </span>
                    <span className="text-lg font-bold">
                      {stat._count || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Recent Logs */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Recente activiteit</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Gebeurtenis</th>
                <th className="text-left p-2">Gebruiker/Email</th>
                <th className="text-left p-2">IP-adres</th>
                <th className="text-left p-2">Tijd</th>
              </tr>
            </thead>
            <tbody>
              {data?.logs &&
                Array.isArray(data.logs) &&
                data.logs.map((log) => (
                  <tr
                    key={log.id || Math.random()}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(log.eventType || "")}
                        <span className="text-sm">
                          {(log.eventType || "UNKNOWN").replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-sm text-muted-foreground">
                        {log.email || log.userId || "Onbekend"}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-sm text-muted-foreground">
                        {log.ipAddress || "N.v.t."}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-sm text-muted-foreground">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("nl-NL")
                          : "N.v.t."}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {(!data?.logs || data.logs.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Nog geen authenticatiegebeurtenissen vastgelegd
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
