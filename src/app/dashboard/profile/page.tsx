"use client";

import {
  Award,
  Camera,
  ChevronRight,
  Edit,
  FileText,
  Gift,
  Mail,
  MapPin,
  Percent,
  Phone,
  Shield,
  Star,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ComponentErrorBoundary,
  PageErrorBoundary,
} from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardToast, profileToast, toast } from "@/components/ui/toast";

// Mock data - will be replaced with real API calls
const mockProfile = {
  id: "1",
  name: "Jan Bakker",
  email: "jan.bakker@email.nl",
  phone: "06-12345678",
  avatar: "/avatars/jan-bakker.jpg",
  location: "Amsterdam",
  rating: 4.8,
  totalReviews: 47,
  completedShifts: 156,
  totalEarnings: 18750.0,
  joinDate: "2024-03-15",
  profileCompletion: 85,
  specialisaties: ["Evenementen", "Objectbeveiliging", "Mobiel Toezicht"],
  werkgebied: ["Amsterdam", "Haarlem", "Zaandam"],
  uurtarief: 28.5,
  ervaring: 5,
  beschrijving:
    "Ervaren beveiliger met specialisatie in evenementen en objectbeveiliging. Flexibel inzetbaar en klantgericht.",

  certificaten: [
    {
      id: "1",
      type: "BOA",
      naam: "Buitengewoon Opsporingsambtenaar",
      uitgever: "Politie Nederland",
      behaaldOp: "2023-06-15",
      verlooptOp: "2028-06-15",
      status: "VERIFIED",
      documentUrl: "/docs/boa-certificate.pdf",
    },
    {
      id: "2",
      type: "BHV",
      naam: "Bedrijfshulpverlening",
      uitgever: "Veiligheid Nederland",
      behaaldOp: "2024-01-10",
      verlooptOp: "2027-01-10",
      status: "VERIFIED",
      documentUrl: "/docs/bhv-certificate.pdf",
    },
    {
      id: "3",
      type: "WPBR",
      naam: "Wet Particuliere Beveiligingsorganisaties",
      uitgever: "Wooning Academie",
      behaaldOp: "2023-12-20",
      verlooptOp: null,
      status: "PENDING",
      documentUrl: "/docs/wpbr-certificate.pdf",
    },
  ],

  documenten: [
    {
      id: "1",
      type: "ID",
      naam: "Nederlandse Identiteitskaart",
      status: "VERIFIED",
      uploadedAt: "2024-03-15",
    },
    {
      id: "2",
      type: "KVK",
      naam: "KvK Uittreksel",
      status: "VERIFIED",
      uploadedAt: "2024-03-16",
    },
    {
      id: "3",
      type: "BANK",
      naam: "Bankafschrift",
      status: "PENDING",
      uploadedAt: "2024-09-01",
    },
  ],

  reviews: [
    {
      id: "1",
      rating: 5,
      comment: "Zeer professionele beveiliger, punctueel en vriendelijk.",
      client: "EventCompany BV",
      date: "2024-09-10",
    },
    {
      id: "2",
      rating: 4,
      comment: "Goed werk tijdens het evenement, communicatie kan beter.",
      client: "SecureGuard Rotterdam",
      date: "2024-09-05",
    },
  ],
};

function getStatusBadge(status: string) {
  switch (status) {
    case "VERIFIED":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-xs">
          Geverifieerd
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className="text-xs">
          Wachten
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="text-xs">
          Afgewezen
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [_editingField, _setEditingField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overzicht");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const fetchProfile = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        // Check subscription status for insurance access
        setHasActiveSubscription(data.data?.subscription?.status === "active");
      } else {
        setError(data.error || "Failed to load profile");
        dashboardToast.dataLoadError();
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError("Network error");
      dashboardToast.dataLoadError();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  // Use real profile data or fallback to mock data
  const displayProfile = profile || mockProfile;

  if (loading) {
    return (
      <DashboardLayout title="Mijn Profiel" subtitle="Laden...">
        <div className="p-4 space-y-6">
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </Card>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <PageErrorBoundary>
      <DashboardLayout
        title="Mijn Profiel"
        subtitle={`${displayProfile.profileCompletion}% compleet`}
      >
        <div className="p-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overzicht" className="text-sm">
                Overzicht
              </TabsTrigger>
              <TabsTrigger value="certificaten" className="text-sm">
                Certificaten
              </TabsTrigger>
              <TabsTrigger value="documenten" className="text-sm">
                Documenten
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overzicht" className="space-y-6 pb-20 md:pb-4">
              <ComponentErrorBoundary>
                {/* Profile completion */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Profiel voltooiing</h3>
                    <span className="text-sm text-muted-foreground">
                      {displayProfile.profileCompletion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${displayProfile.profileCompletion}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Verhoog je kans op opdrachten door je profiel compleet te
                    maken.
                  </p>
                </Card>

                {/* Basic info */}
                <Card className="p-4">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={displayProfile.avatar} />
                        <AvatarFallback className="text-lg">
                          {displayProfile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0"
                        variant="secondary"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">
                        {displayProfile.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{displayProfile.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{displayProfile.rating}</span>
                          <span>({displayProfile.totalReviews} reviews)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-green-600">
                            {displayProfile.completedShifts}
                          </p>
                          <p className="text-muted-foreground">
                            Shifts voltooid
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-blue-600">
                            €{displayProfile.totalEarnings.toLocaleString()}
                          </p>
                          <p className="text-muted-foreground">
                            Totaal verdient
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">
                            €{displayProfile.uurtarief}/uur
                          </p>
                          <p className="text-muted-foreground">Uurtarief</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{displayProfile.email}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{displayProfile.phone}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Specialisaties */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Specialisaties</h3>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayProfile.specialisaties.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Werkgebied */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Werkgebied</h3>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayProfile.werkgebied.map((gebied, index) => (
                      <Badge key={index} variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {gebied}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Beschrijving */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Persoonlijke beschrijving</h3>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {displayProfile.beschrijving}
                  </p>
                </Card>

                {/* Verzekeringen & Benefits sectie */}
                <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          Verzekeringen & Kortingen
                          {hasActiveSubscription && (
                            <Badge
                              variant="default"
                              className="bg-green-500 hover:bg-green-600"
                            >
                              EXCLUSIEF
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {hasActiveSubscription
                            ? "Als SecuryFlex lid krijg je tot 25% korting op verzekeringen"
                            : "Upgrade naar een abonnement voor exclusieve kortingen"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {hasActiveSubscription ? (
                    <div className="space-y-3">
                      {/* Quick benefits */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                          <Percent className="h-4 w-4 text-green-600" />
                          <div className="text-xs">
                            <p className="font-semibold">15% korting</p>
                            <p className="text-muted-foreground">
                              Beroepsaansprakelijkheid
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                          <Gift className="h-4 w-4 text-blue-600" />
                          <div className="text-xs">
                            <p className="font-semibold">Eerste maand gratis</p>
                            <p className="text-muted-foreground">
                              Pensioenregeling
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link href="/dashboard/verzekeringen" className="block">
                        <Button className="w-full" variant="default">
                          Bekijk alle verzekeringen
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>

                      {/* Discount code teaser */}
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                        <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                          💡 Speciale aanbieding
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          Gebruik code{" "}
                          <span className="font-mono font-bold">
                            SECURYFLEX25
                          </span>{" "}
                          voor extra 25% korting op je eerste verzekering!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-center text-muted-foreground">
                          Upgrade naar een SecuryFlex abonnement voor exclusieve
                          verzekeringskortingen
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() =>
                          router.push("/dashboard/settings#subscription")
                        }
                      >
                        Bekijk abonnementen
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </Card>
              </ComponentErrorBoundary>
            </TabsContent>

            <TabsContent
              value="certificaten"
              className="space-y-4 pb-20 md:pb-4"
            >
              <ComponentErrorBoundary>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Mijn Certificaten</h3>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Uploaden</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </div>

                {displayProfile.certificaten.map((cert) => (
                  <Card key={cert.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <h4 className="font-semibold break-words">
                            {cert.naam}
                          </h4>
                          {getStatusBadge(cert.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {cert.uitgever}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Behaald op</p>
                            <p>
                              {new Date(cert.behaaldOp).toLocaleDateString(
                                "nl-NL",
                              )}
                            </p>
                          </div>
                          {cert.verlooptOp && (
                            <div>
                              <p className="text-muted-foreground">
                                Verloopt op
                              </p>
                              <p>
                                {new Date(cert.verlooptOp).toLocaleDateString(
                                  "nl-NL",
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 self-start"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Bekijk
                      </Button>
                    </div>
                  </Card>
                ))}

                <Card className="p-4 border-dashed border-2 border-muted-foreground/25">
                  <div className="text-center py-6">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">
                      Nieuw certificaat toevoegen
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sleep je certificaat hier naartoe of klik om te uploaden
                    </p>
                    <Button variant="outline">Bestand selecteren</Button>
                  </div>
                </Card>
              </ComponentErrorBoundary>
            </TabsContent>

            <TabsContent value="documenten" className="space-y-4 pb-20 md:pb-4">
              <ComponentErrorBoundary>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Mijn Documenten</h3>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Uploaden</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </div>

                {displayProfile.documenten.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold break-words">
                            {doc.naam}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Geüpload op{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString(
                              "nl-NL",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(doc.status)}
                        <Button variant="outline" size="sm">
                          Bekijk
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </ComponentErrorBoundary>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 pb-20 md:pb-4">
              <ComponentErrorBoundary>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Klantbeoordelingen</h3>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">
                      {displayProfile.rating}
                    </span>
                    <span className="text-muted-foreground">
                      ({displayProfile.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                {displayProfile.reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{review.client}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString("nl-NL")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </Card>
                ))}
              </ComponentErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </PageErrorBoundary>
  );
}
