"use client";

import { AlertCircle, Loader2, Lock, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Ongeldige inloggegevens");
      } else {
        // Store admin session flag
        sessionStorage.setItem("adminAuthenticated", "true");
        sessionStorage.setItem("adminEmail", email.toLowerCase());

        // Redirect to auth monitor
        router.push("/admin/auth-monitor");
      }
    } catch (_err) {
      setError("Er is een fout opgetreden bij het inloggen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <Card className="w-full max-w-md relative bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <Shield className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Toegang alleen voor geautoriseerde administrators
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Admin E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@securyflex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Wachtwoord
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white"
                autoComplete="current-password"
              />
            </div>

            {/* Admin whitelist info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-semibold mb-1">Beveiligde Toegang</p>
                  <p>
                    Dit portaal is alleen toegankelijk voor geregistreerde admin
                    accounts.
                  </p>
                  <p className="mt-1">
                    Alle login pogingen worden gelogd voor security doeleinden.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inloggen...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Veilig Inloggen
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => router.push("/")}
            >
              Terug naar hoofdsite
            </Button>
          </CardFooter>
        </form>

        {/* Security footer */}
        <div className="px-6 pb-4">
          <div className="border-t pt-4">
            <p className="text-xs text-center text-gray-500">
              🔒 Beveiligde verbinding • IP wordt gelogd • 2FA vereist voor
              kritieke acties
            </p>
          </div>
        </div>
      </Card>

      {/* Security badges */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 text-xs text-gray-400">
        <span>SSL Encrypted</span>
        <span>•</span>
        <span>SOC2 Compliant</span>
        <span>•</span>
        <span>ISO 27001</span>
      </div>
    </div>
  );
}
