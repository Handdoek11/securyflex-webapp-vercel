"use client";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileText,
  Lock,
  RefreshCw,
  Shield,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface QuickStats {
  totalUsers: { role: string; count: number; active_count: number }[];
  activeOpdrachten: { status: string; count: number }[];
  lockedAccounts: number;
  monthlyRevenue: number;
}

export default function AdminToolsPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [unlockEmail, setUnlockEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Fetch quick stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/actions/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  // Check admin status
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
          window.location.href = "/admin/login";
        } else {
          setIsAdmin(true);
          fetchStats();
        }
      } catch (error) {
        console.error("Failed to verify admin status:", error);
        window.location.href = "/admin/login";
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [status, fetchStats]);

  // Quick action: Unlock user
  const handleUnlockUser = async () => {
    if (!unlockEmail) {
      toast.error("Voer een email adres in");
      return;
    }

    try {
      const response = await fetch("/api/admin/actions/unlock-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unlockEmail }),
      });

      if (response.ok) {
        toast.success(`Account ${unlockEmail} is gedeblokkeerd`);
        setUnlockEmail("");
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || "Fout bij deblokkeren");
      }
    } catch (_error) {
      toast.error("Er is een fout opgetreden");
    }
  };

  // Quick action: Reset password
  const handleResetPassword = async () => {
    if (!resetEmail || !adminPassword) {
      toast.error("Vul alle velden in");
      return;
    }

    try {
      const response = await fetch("/api/admin/actions/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          adminPassword: adminPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Nieuw wachtwoord: ${data.newPassword}`);
        setResetEmail("");
        setAdminPassword("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Fout bij wachtwoord reset");
      }
    } catch (_error) {
      toast.error("Er is een fout opgetreden");
    }
  };

  // Export functions
  const exportUsers = async () => {
    try {
      const response = await fetch("/api/admin/actions/export-users");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("Users geëxporteerd");
    } catch (_error) {
      toast.error("Export mislukt");
    }
  };

  const exportTransactions = async () => {
    try {
      const response = await fetch("/api/admin/actions/export-transactions");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("Transacties geëxporteerd");
    } catch (_error) {
      toast.error("Export mislukt");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Tools</h1>
        </div>
        <p className="text-muted-foreground">
          Centrale hub voor administratieve taken
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totaal Gebruikers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalUsers.reduce((acc, u) => acc + Number(u.count), 0) ||
                0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalUsers.reduce(
                (acc, u) => acc + Number(u.active_count),
                0,
              ) || 0}{" "}
              actief
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actieve Opdrachten
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeOpdrachten.reduce(
                (acc, o) => acc + Number(o.count),
                0,
              ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Open, toegewezen, bezig
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Geblokkeerde Accounts
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.lockedAccounts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Accounts met teveel login pogingen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue (Maand)
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats?.monthlyRevenue?.toLocaleString("nl-NL") || "0"}
            </div>
            <p className="text-xs text-muted-foreground">Huidige maand</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Veelgebruikte administratieve taken
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unlock User */}
            <div className="space-y-2">
              <Label>Deblokkeer Gebruiker</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="user@email.com"
                  value={unlockEmail}
                  onChange={(e) => setUnlockEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUnlockUser()}
                />
                <Button onClick={handleUnlockUser} variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Deblokkeer
                </Button>
              </div>
            </div>

            <Separator />

            {/* Reset Password */}
            <div className="space-y-2">
              <Label>Reset Wachtwoord</Label>
              <Input
                placeholder="user@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Admin wachtwoord"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <Button
                onClick={handleResetPassword}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Wachtwoord
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>Download data voor rapportages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={exportUsers} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Gebruikers (CSV)
            </Button>

            <Button
              onClick={exportTransactions}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Transacties (CSV)
            </Button>

            <Button
              onClick={() => {
                window.location.href = "/admin/auth-monitor";
              }}
              variant="outline"
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security Logs
            </Button>

            <Button
              onClick={() => {
                window.location.href = "/admin/document-review";
              }}
              variant="outline"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Document Review
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* External Dashboard Links */}
      <Card>
        <CardHeader>
          <CardTitle>Externe Dashboards</CardTitle>
          <CardDescription>
            Quick links naar externe management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                window.open("https://supabase.com/dashboard", "_blank")
              }
            >
              <Database className="h-4 w-4 mr-2" />
              Supabase Dashboard
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                window.open("https://vercel.com/dashboard", "_blank")
              }
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Vercel Deployments
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open("https://sentry.io", "_blank")}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Sentry Errors
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                toast.info("Prisma Studio: Run 'npx prisma studio' locally")
              }
            >
              <Database className="h-4 w-4 mr-2" />
              Prisma Studio
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Admin Tools v1.0 • Ingelogd als: {session?.user?.email}</p>
      </div>
    </div>
  );
}
