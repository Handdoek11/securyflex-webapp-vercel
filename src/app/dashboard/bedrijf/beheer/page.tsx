"use client";

import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle,
  CreditCard,
  Download,
  Euro,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Save,
  Shield,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function BedrijfBeheerPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("SecureGuard B.V.");
  const [kvkNumber, setKvkNumber] = useState("12345678");
  const [vatNumber, setVatNumber] = useState("NL123456789B01");
  const [email, setEmail] = useState("info@secureguard.nl");
  const [phone, setPhone] = useState("020-1234567");
  const [address, setAddress] = useState("Keizersgracht 123");
  const [city, setCity] = useState("Amsterdam");
  const [postalCode, setPostalCode] = useState("1015 CJ");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [documentAlerts, setDocumentAlerts] = useState(true);

  // Finqle settings
  const [finqleAutoExport, setFinqleAutoExport] = useState(true);
  const [finqleDirectPayment, setFinqleDirectPayment] = useState(true);
  const [finqleApiKey] = useState("fnql_live_xxxxxxxxxxxxxxxxxxxxxx");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  return (
    <BedrijfDashboardLayout
      title="Beheer"
      subtitle="Bedrijfsinstellingen en configuratie"
    >
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Bedrijf</TabsTrigger>
          <TabsTrigger value="notifications">Meldingen</TabsTrigger>
          <TabsTrigger value="finqle">Finqle</TabsTrigger>
          <TabsTrigger value="security">Beveiliging</TabsTrigger>
          <TabsTrigger value="billing">Facturatie</TabsTrigger>
        </TabsList>

        {/* Company Information */}
        <TabsContent value="company" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bedrijfsgegevens
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Bedrijfsnaam</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="kvk">KvK Nummer</Label>
                  <Input
                    id="kvk"
                    value={kvkNumber}
                    onChange={(e) => setKvkNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vat">BTW Nummer</Label>
                <Input
                  id="vat"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefoon</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal">Postcode</Label>
                  <Input
                    id="postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="city">Plaats</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Opslaan..." : "Wijzigingen Opslaan"}
              </Button>
            </div>
          </Card>

          {/* Logo Upload */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bedrijfslogo</h3>

            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="h-12 w-12 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG of SVG. Max 2MB.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Melding Voorkeuren
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notif">Email Meldingen</Label>
                  <p className="text-sm text-muted-foreground">
                    Ontvang meldingen via email
                  </p>
                </div>
                <Switch
                  id="email-notif"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sms-notif">SMS Meldingen</Label>
                  <p className="text-sm text-muted-foreground">
                    Ontvang urgente meldingen via SMS
                  </p>
                </div>
                <Switch
                  id="sms-notif"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Melding Types</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="assignment-alerts">Opdracht Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Nieuwe sollicitaties, wijzigingen, annuleringen
                  </p>
                </div>
                <Switch
                  id="assignment-alerts"
                  checked={assignmentAlerts}
                  onCheckedChange={setAssignmentAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="payment-alerts">Betaling Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Finqle betalingen, facturen, credit updates
                  </p>
                </div>
                <Switch
                  id="payment-alerts"
                  checked={paymentAlerts}
                  onCheckedChange={setPaymentAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="document-alerts">
                    Document Waarschuwingen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Verlopen certificaten, ontbrekende documenten
                  </p>
                </div>
                <Switch
                  id="document-alerts"
                  checked={documentAlerts}
                  onCheckedChange={setDocumentAlerts}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Finqle Integration */}
        <TabsContent value="finqle" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Finqle Integratie
              </h3>
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verbonden
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Finqle is succesvol verbonden
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                      Kredietlimiet: €125.000 • Direct Payment: Actief
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="api-key">API Sleutel</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={finqleApiKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-export">Automatische Export</Label>
                  <p className="text-sm text-muted-foreground">
                    Exporteer werkuren automatisch naar Finqle
                  </p>
                </div>
                <Switch
                  id="auto-export"
                  checked={finqleAutoExport}
                  onCheckedChange={setFinqleAutoExport}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="direct-payment">Direct Payment</Label>
                  <p className="text-sm text-muted-foreground">
                    Sta ZZP'ers toe direct payment aan te vragen
                  </p>
                </div>
                <Switch
                  id="direct-payment"
                  checked={finqleDirectPayment}
                  onCheckedChange={setFinqleDirectPayment}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Finqle Dashboard
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Rapport
              </Button>
            </div>
          </Card>

          {/* Finqle Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Deze Week</p>
              <p className="text-2xl font-semibold">€45.230</p>
              <p className="text-xs text-green-600">+12% vs vorige week</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Openstaand</p>
              <p className="text-2xl font-semibold">€18.450</p>
              <p className="text-xs text-muted-foreground">8 facturen</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Direct Payments</p>
              <p className="text-2xl font-semibold">23</p>
              <p className="text-xs text-muted-foreground">Deze maand</p>
            </Card>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Beveiliging
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Huidig Wachtwoord</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-password">Nieuw Wachtwoord</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Bevestig Wachtwoord</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button className="mt-4">Wachtwoord Wijzigen</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Twee-Factor Authenticatie
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      2FA is niet ingeschakeld
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                      Beveilig je account met twee-factor authenticatie
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                2FA Inschakelen
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Facturatie Instellingen
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="invoice-prefix">Factuur Prefix</Label>
                <Input
                  id="invoice-prefix"
                  defaultValue="SG-2025-"
                  placeholder="Bijv. INV-"
                />
              </div>

              <div>
                <Label htmlFor="payment-terms">Betalingstermijn</Label>
                <Select defaultValue="30">
                  <SelectTrigger id="payment-terms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">14 dagen</SelectItem>
                    <SelectItem value="30">30 dagen</SelectItem>
                    <SelectItem value="60">60 dagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice-footer">Factuur Footer Tekst</Label>
                <Textarea
                  id="invoice-footer"
                  placeholder="Extra informatie die op elke factuur komt..."
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Subscription Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              SecuryFlex Abonnement
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Professional Plan</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      €299/maand • Onbeperkt gebruikers • Alle features
                    </p>
                  </div>
                  <Badge>Actief</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Platform Fee</p>
                  <p className="font-medium">€2,99 per gewerkt uur</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volgende Factuur</p>
                  <p className="font-medium">1 februari 2025</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Facturen
                </Button>
                <Button variant="outline">Upgrade Plan</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </BedrijfDashboardLayout>
  );
}
