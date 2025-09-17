"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Bell,
  Shield,
  MapPin,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Globe,
  Moon,
  Sun,
  Monitor,
  AlertCircle,
  CheckCircle,
  Settings2,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FormSection,
  FormGrid,
  InputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@/components/forms/FormField";
import { FileUpload } from "@/components/ui/file-upload";
import { GPSTracker } from "@/components/ui/gps-tracker";
import { DeleteConfirm, ResetFormConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { settingsSchema, type SettingsData } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

// Mock settings data - would come from API
const mockSettingsData: SettingsData = {
  // Account settings
  name: "Jan Bakker",
  email: "jan.bakker@email.nl",
  phone: "06-12345678",

  // Notification preferences
  emailNotifications: {
    jobOffers: true,
    shiftReminders: true,
    payments: true,
    marketing: false,
  },
  smsNotifications: {
    urgentJobs: true,
    shiftReminders: true,
    emergencyAlerts: true,
  },
  pushNotifications: {
    jobOffers: true,
    shiftReminders: true,
    messages: true,
    emergencyAlerts: true,
  },

  // Privacy settings
  profileVisibility: "VERIFIED_ONLY",
  showOnlineStatus: true,
  shareLocationData: true,

  // Work preferences
  maxTravelDistance: 25,
  autoAcceptUrgent: false,
  preferredJobTypes: ["Evenement", "Object"],
  minimumNoticeHours: 4,

  // GPS & Security settings
  gpsAccuracy: "HIGH",
  autoClockIn: false,
  requirePhotoVerification: true,
  biometricAuth: false,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const methods = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: mockSettingsData,
    mode: "onChange",
  });

  const { handleSubmit, reset, watch, formState: { isDirty, isValid } } = methods;

  // Watch for changes
  React.useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const onSubmit = async (data: SettingsData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Settings to save:", data);
      toast.success("Instellingen opgeslagen");
      setHasChanges(false);
    } catch (error) {
      toast.error("Fout bij opslaan van instellingen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset(mockSettingsData);
    toast.info("Wijzigingen gereset");
  };

  const handleDeleteAccount = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Account verwijdering aangevraagd");
    } catch (error) {
      toast.error("Fout bij account verwijdering");
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const data = JSON.stringify(mockSettingsData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "securyflex-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Gegevens geëxporteerd");
  };

  return (
    <DashboardLayout
      title="Instellingen"
      subtitle="Beheer je account en voorkeuren"
      headerActions={
        <div className="flex gap-2">
          {hasChanges && (
            <ResetFormConfirm
              trigger={
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              }
              onConfirm={handleReset}
            />
          )}
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading || !hasChanges}
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Opslaan
          </Button>
        </div>
      }
    >
      <div className="p-4">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Meldingen</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="work" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Werk</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Beveiliging</span>
                </TabsTrigger>
              </TabsList>

              {/* Account Settings */}
              <TabsContent value="account" className="space-y-6">
                <Card className="p-6">
                  <FormSection
                    title="Persoonlijke Gegevens"
                    description="Beheer je account informatie"
                  >
                    <FormGrid columns={2}>
                      <InputField
                        name="name"
                        label="Volledige naam"
                        required
                        leftIcon={<User className="h-4 w-4" />}
                      />
                      <InputField
                        name="email"
                        label="E-mailadres"
                        type="email"
                        required
                        leftIcon={<Mail className="h-4 w-4" />}
                      />
                      <InputField
                        name="phone"
                        label="Telefoonnummer"
                        type="tel"
                        required
                        leftIcon={<Smartphone className="h-4 w-4" />}
                      />
                    </FormGrid>
                  </FormSection>
                </Card>

                <Card className="p-6">
                  <FormSection
                    title="Profielfoto"
                    description="Upload een professionele foto"
                  >
                    <FileUpload
                      type="PROFILE_PHOTO"
                      variant="avatar"
                      maxFiles={1}
                      onUpload={async (files) => {
                        // Simulate upload
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return { success: true, urls: ["/avatar.jpg"] };
                      }}
                    />
                  </FormSection>
                </Card>

                <Card className="p-6">
                  <FormSection
                    title="Wachtwoord"
                    description="Wijzig je wachtwoord"
                  >
                    <FormGrid columns={1}>
                      <InputField
                        name="currentPassword"
                        label="Huidig wachtwoord"
                        type="password"
                        leftIcon={<Lock className="h-4 w-4" />}
                      />
                      <InputField
                        name="newPassword"
                        label="Nieuw wachtwoord"
                        type="password"
                        leftIcon={<Lock className="h-4 w-4" />}
                      />
                      <InputField
                        name="confirmPassword"
                        label="Bevestig nieuw wachtwoord"
                        type="password"
                        leftIcon={<Lock className="h-4 w-4" />}
                      />
                    </FormGrid>
                  </FormSection>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="p-6">
                  <FormSection
                    title="E-mail Meldingen"
                    description="Kies welke e-mails je wilt ontvangen"
                  >
                    <div className="space-y-4">
                      <SwitchField
                        name="emailNotifications.jobOffers"
                        switchLabel="Nieuwe opdrachten"
                        description="Ontvang e-mails over nieuwe beschikbare opdrachten"
                      />
                      <SwitchField
                        name="emailNotifications.shiftReminders"
                        switchLabel="Shift herinneringen"
                        description="Ontvang herinneringen voor aankomende shifts"
                      />
                      <SwitchField
                        name="emailNotifications.payments"
                        switchLabel="Betalingen"
                        description="Ontvang bevestigingen van betalingen"
                      />
                      <SwitchField
                        name="emailNotifications.marketing"
                        switchLabel="Marketing berichten"
                        description="Ontvang nieuws en aanbiedingen"
                      />
                    </div>
                  </FormSection>
                </Card>

                <Card className="p-6">
                  <FormSection
                    title="SMS Meldingen"
                    description="Kies welke SMS berichten je wilt ontvangen"
                  >
                    <div className="space-y-4">
                      <SwitchField
                        name="smsNotifications.urgentJobs"
                        switchLabel="Urgente opdrachten"
                        description="Ontvang SMS voor urgente opdrachten"
                      />
                      <SwitchField
                        name="smsNotifications.shiftReminders"
                        switchLabel="Shift herinneringen"
                        description="Ontvang SMS herinneringen"
                      />
                      <SwitchField
                        name="smsNotifications.emergencyAlerts"
                        switchLabel="Noodmeldingen"
                        description="Ontvang SMS bij noodsituaties"
                      />
                    </div>
                  </FormSection>
                </Card>

                <Card className="p-6">
                  <FormSection
                    title="Push Meldingen"
                    description="Kies welke push meldingen je wilt ontvangen"
                  >
                    <div className="space-y-4">
                      <SwitchField
                        name="pushNotifications.jobOffers"
                        switchLabel="Nieuwe opdrachten"
                        description="Ontvang push meldingen voor nieuwe opdrachten"
                      />
                      <SwitchField
                        name="pushNotifications.shiftReminders"
                        switchLabel="Shift herinneringen"
                        description="Ontvang push herinneringen"
                      />
                      <SwitchField
                        name="pushNotifications.messages"
                        switchLabel="Berichten"
                        description="Ontvang meldingen voor nieuwe berichten"
                      />
                      <SwitchField
                        name="pushNotifications.emergencyAlerts"
                        switchLabel="Noodmeldingen"
                        description="Ontvang push meldingen bij noodsituaties"
                      />
                    </div>
                  </FormSection>
                </Card>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy" className="space-y-6">
                <Card className="p-6">
                  <FormSection
                    title="Profiel Zichtbaarheid"
                    description="Bepaal wie je profiel kan zien"
                  >
                    <div className="space-y-4">
                      <SelectField
                        name="profileVisibility"
                        label="Profiel zichtbaarheid"
                        options={[
                          { value: "PUBLIC", label: "Openbaar - Iedereen kan mijn profiel zien" },
                          { value: "VERIFIED_ONLY", label: "Alleen geverifieerde bedrijven" },
                          { value: "PRIVATE", label: "Privé - Alleen ik kan mijn profiel zien" },
                        ]}
                      />
                      <SwitchField
                        name="showOnlineStatus"
                        switchLabel="Online status tonen"
                        description="Laat anderen zien wanneer je online bent"
                      />
                      <SwitchField
                        name="shareLocationData"
                        switchLabel="Locatiegegevens delen"
                        description="Deel je locatie voor betere opdracht matches"
                      />
                    </div>
                  </FormSection>
                </Card>

                <Card className="p-6">
                  <FormSection
                    title="Gegevens Beheer"
                    description="Beheer je persoonlijke gegevens"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleExportData}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Gegevens exporteren
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Gegevens importeren
                        </Button>
                      </div>

                      <Separator />

                      <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <h4 className="font-medium text-red-800 dark:text-red-200">
                            Gevaarlijke Zone
                          </h4>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                          Het verwijderen van je account kan niet ongedaan worden gemaakt.
                        </p>
                        <DeleteConfirm
                          trigger={
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Account verwijderen
                            </Button>
                          }
                          itemName="je account"
                          itemType="Account"
                          onConfirm={handleDeleteAccount}
                        />
                      </div>
                    </div>
                  </FormSection>
                </Card>
              </TabsContent>

              {/* Work Preferences */}
              <TabsContent value="work" className="space-y-6">
                <Card className="p-6">
                  <FormSection
                    title="Werk Voorkeuren"
                    description="Stel je werk voorkeuren in"
                  >
                    <FormGrid columns={2}>
                      <InputField
                        name="maxTravelDistance"
                        label="Maximale reisafstand (km)"
                        type="number"
                        min={0}
                        max={200}
                        leftIcon={<MapPin className="h-4 w-4" />}
                      />
                      <InputField
                        name="minimumNoticeHours"
                        label="Minimale aanmelding (uren)"
                        type="number"
                        min={0}
                        max={168}
                        leftIcon={<AlertCircle className="h-4 w-4" />}
                      />
                    </FormGrid>

                    <div className="space-y-4 mt-6">
                      <SwitchField
                        name="autoAcceptUrgent"
                        switchLabel="Automatisch urgente opdrachten accepteren"
                        description="Accepteer automatisch opdrachten die binnen 2 uur starten"
                      />
                    </div>
                  </FormSection>
                </Card>

                <Card className="p-6">
                  <FormSection
                    title="GPS Instellingen"
                    description="Test en configureer je GPS instellingen"
                  >
                    <GPSTracker
                      variant="compact"
                      showStatus={true}
                      showAccuracy={true}
                      allowManualRefresh={true}
                    />
                  </FormSection>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card className="p-6">
                  <FormSection
                    title="GPS & Locatie Beveiliging"
                    description="Configureer je locatie en GPS instellingen"
                  >
                    <div className="space-y-4">
                      <SelectField
                        name="gpsAccuracy"
                        label="GPS nauwkeurigheid"
                        options={[
                          { value: "HIGH", label: "Hoog - Beste nauwkeurigheid (meer batterijverbruik)" },
                          { value: "MEDIUM", label: "Gemiddeld - Balans tussen nauwkeurigheid en batterij" },
                          { value: "LOW", label: "Laag - Bespaar batterij (minder nauwkeurig)" },
                        ]}
                      />
                      <SwitchField
                        name="autoClockIn"
                        switchLabel="Automatisch inchecken"
                        description="Check automatisch in wanneer je op de werklocatie aankomt"
                      />
                      <SwitchField
                        name="requirePhotoVerification"
                        switchLabel="Foto verificatie vereisen"
                        description="Vereist een foto bij in- en uitchecken"
                      />
                    </div>
                  </FormSection>
                </Card>

                <Card className="p-6">
                  <FormSection
                    title="Authenticatie"
                    description="Extra beveiligingsmaatregelen"
                  >
                    <div className="space-y-4">
                      <SwitchField
                        name="biometricAuth"
                        switchLabel="Biometrische authenticatie"
                        description="Gebruik vingerafdruk of gezichtsherkenning"
                      />

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium">Actieve sessies</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">iPhone 15 Pro</p>
                                <p className="text-xs text-muted-foreground">Huidige sessie - Amsterdam</p>
                              </div>
                            </div>
                            <Badge variant="default">Actief</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Monitor className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Chrome Browser</p>
                                <p className="text-xs text-muted-foreground">2 dagen geleden - Rotterdam</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Uitloggen
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FormSection>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </FormProvider>

        {/* Save indicator */}
        {hasChanges && (
          <div className="fixed bottom-4 right-4 z-50">
            <Card className="p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span>Je hebt niet-opgeslagen wijzigingen</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}