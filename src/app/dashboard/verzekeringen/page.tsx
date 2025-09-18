"use client";

import {
  AlertCircle,
  Building2,
  Check,
  ChevronRight,
  Filter,
  Gift,
  Heart,
  Lock,
  Percent,
  Shield,
  Star,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";

// Mock data voor development
const mockCategories = [
  {
    id: "1",
    naam: "Zakelijke verzekeringen",
    beschrijving: "Bescherm je onderneming",
    aantalProducten: 4,
    icon: Building2,
  },
  {
    id: "2",
    naam: "Particuliere verzekeringen",
    beschrijving: "Voor jou en je gezin",
    aantalProducten: 9,
    icon: User,
  },
  {
    id: "3",
    naam: "Pensioen & Inkomen",
    beschrijving: "Voor je toekomst",
    aantalProducten: 2,
    icon: Heart,
  },
];

const mockProducts = {
  "1": [
    // Zakelijke verzekeringen
    {
      id: "p1",
      naam: "Beroepsaansprakelijkheid (AVB)",
      korteBeschrijving: "Verplichte verzekering voor beveiligers",
      beschrijving:
        "Dekt schade die je veroorzaakt tijdens je werk als beveiliger",
      verzekeraar: "Schouten Zekerheid",
      basispremie: 42.5,
      platformKorting: 15,
      features: [
        "Dekking tot €2.500.000 per aanspraak",
        "Inclusief rechtsbijstand",
        "Werelddekking (excl. USA/Canada)",
        "Geen eigen risico",
      ],
      isFeatured: true,
      aantalAanvragen: 156,
    },
    {
      id: "p2",
      naam: "Bedrijfsauto verzekering",
      korteBeschrijving: "Voor je bedrijfsvoertuig",
      beschrijving: "All-risk dekking voor je bedrijfsauto",
      verzekeraar: "Veko Adviesgroep",
      basispremie: 89.0,
      platformKorting: 10,
      features: [
        "All-risk dekking",
        "Gratis vervangend vervoer",
        "No-claim beschermer",
        "Pechhulp Europa",
      ],
      isFeatured: false,
      aantalAanvragen: 89,
    },
    {
      id: "p3",
      naam: "Rechtsbijstand Zakelijk",
      korteBeschrijving: "Juridische hulp voor je bedrijf",
      beschrijving: "Juridische ondersteuning bij geschillen",
      verzekeraar: "DAS Rechtsbijstand",
      basispremie: 28.5,
      platformKorting: 12,
      features: [
        "Onbeperkt juridisch advies",
        "Geschillen met opdrachtgevers",
        "Arbeidsrecht advies",
        "Incasso bijstand",
      ],
      isFeatured: false,
      aantalAanvragen: 67,
    },
    {
      id: "p4",
      naam: "Arbeidsongeschiktheid (AOV)",
      korteBeschrijving: "Inkomen bij ziekte of ongeval",
      beschrijving: "Verzekerd inkomen bij arbeidsongeschiktheid",
      verzekeraar: "Schouten Zekerheid",
      basispremie: 125.0,
      platformKorting: 20,
      features: [
        "80% inkomensdekking",
        "Kortere wachttijd (30 dagen)",
        "Premievrijstelling bij AO",
        "Re-integratie ondersteuning",
      ],
      isFeatured: true,
      aantalAanvragen: 234,
    },
  ],
  "2": [
    // Particuliere verzekeringen
    {
      id: "p5",
      naam: "Autoverzekering",
      korteBeschrijving: "Voor je privé auto",
      beschrijving: "Scherpe premie voor je persoonlijke auto",
      verzekeraar: "Veko Adviesgroep",
      basispremie: 45.0,
      platformKorting: 8,
      features: [
        "WA + Casco dekking",
        "No-claim korting behoud",
        "Gratis pechhulp",
        "Ruitschade zonder eigen risico",
      ],
      isFeatured: false,
      aantalAanvragen: 312,
    },
    {
      id: "p6",
      naam: "Inboedelverzekering",
      korteBeschrijving: "Bescherm je spullen",
      beschrijving: "Dekking voor al je persoonlijke bezittingen",
      verzekeraar: "Schouten Zekerheid",
      basispremie: 12.5,
      platformKorting: 10,
      features: [
        "All-risk dekking",
        "Buitenshuis dekking",
        "Nieuwwaarde vergoeding",
        "Cybercrime dekking",
      ],
      isFeatured: false,
      aantalAanvragen: 145,
    },
    {
      id: "p7",
      naam: "Aansprakelijkheid Particulier",
      korteBeschrijving: "Bij schade aan anderen",
      beschrijving: "Dekt schade die je per ongeluk aan anderen toebrengt",
      verzekeraar: "Veko Adviesgroep",
      basispremie: 5.95,
      platformKorting: 15,
      features: [
        "Gezinsdekking",
        "Werelddekking",
        "Oppas dekking",
        "Sport & hobby dekking",
      ],
      isFeatured: true,
      aantalAanvragen: 423,
    },
  ],
  "3": [
    // Pensioen & Inkomen
    {
      id: "p8",
      naam: "Pensioenregeling ZZP",
      korteBeschrijving: "Bouw pensioen op met belastingvoordeel",
      beschrijving: "Flexibele pensioenopbouw met fiscale voordelen",
      verzekeraar: "Brand New Day",
      basispremie: 150.0,
      platformKorting: 0,
      features: [
        "Fiscaal aftrekbaar",
        "Flexibele inleg",
        "Lage kosten (0.59%)",
        "Online beheer",
        "Eerste maand gratis",
      ],
      isFeatured: true,
      aantalAanvragen: 89,
      extraKorting: { naam: "Eerste maand gratis", type: "PROMO" },
    },
    {
      id: "p9",
      naam: "Overlijdensrisicoverzekering",
      korteBeschrijving: "Financiële zekerheid voor nabestaanden",
      beschrijving: "Keer uit bij overlijden voor je partner/kinderen",
      verzekeraar: "Schouten Zekerheid",
      basispremie: 18.5,
      platformKorting: 12,
      features: [
        "Vast verzekerd bedrag",
        "Dalende premie mogelijk",
        "Partner meeverzekerd",
        "Werelddekking",
      ],
      isFeatured: false,
      aantalAanvragen: 56,
    },
  ],
};

export default function VerzekeringenPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [kortingCode, setKortingCode] = useState("");
  const [showKortingBanner, _setShowKortingBanner] = useState(true);

  const loadProducts = useCallback(async (categoryId: string) => {
    try {
      const res = await fetch(
        `/api/verzekeringen/producten?categorieId=${categoryId}`,
      );
      const data = await res.json();

      if (data.success) {
        setProducts(data.data?.products || mockProducts[categoryId] || []);
      } else {
        setProducts(mockProducts[categoryId] || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts(mockProducts[categoryId] || []);
    }
  }, []);

  const checkSubscriptionAndLoadData = useCallback(async () => {
    setLoading(true);

    try {
      // Check subscription status
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();

      if (!profileData.success) {
        toast.error("Kon profiel niet laden");
        router.push("/dashboard");
        return;
      }

      const isSubscribed = profileData.data?.subscription?.status === "active";
      setHasSubscription(isSubscribed);

      if (!isSubscribed) {
        setLoading(false);
        return;
      }

      // Load categories
      const catRes = await fetch("/api/verzekeringen/categorieen");
      const catData = await catRes.json();

      if (catData.success) {
        setCategories(catData.data?.categories || mockCategories);
      } else {
        // Use mock data as fallback
        setCategories(mockCategories);
      }

      // Load products for selected category
      loadProducts(selectedCategory);
    } catch (error) {
      console.error("Error loading insurance data:", error);
      // Use mock data as fallback
      setCategories(mockCategories);
      setProducts(mockProducts[selectedCategory] || []);
      toast.error("Kon verzekeringen niet laden");
    } finally {
      setLoading(false);
    }
  }, [router, selectedCategory, loadProducts]);

  useEffect(() => {
    checkSubscriptionAndLoadData();
  }, [checkSubscriptionAndLoadData]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    loadProducts(categoryId);
  };

  const handleProductClick = (productId: string) => {
    router.push(`/dashboard/verzekeringen/${productId}`);
  };

  const handleApplyDiscount = () => {
    if (!kortingCode) {
      toast.error("Vul een kortingscode in");
      return;
    }
    toast.success(
      `Kortingscode ${kortingCode} wordt toegepast bij je aanvraag`,
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Verzekeringen" subtitle="Laden...">
        <div className="p-4 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasSubscription) {
    return (
      <DashboardLayout title="Verzekeringen" subtitle="Exclusief voor leden">
        <div className="p-4">
          <Alert className="mb-6">
            <Lock className="h-4 w-4" />
            <AlertTitle>Abonnement vereist</AlertTitle>
            <AlertDescription>
              De verzekeringen module is exclusief beschikbaar voor SecuryFlex
              leden met een actief abonnement. Upgrade vandaag nog en krijg
              toegang tot exclusieve kortingen!
            </AlertDescription>
          </Alert>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Word SecuryFlex Lid</CardTitle>
              <CardDescription>
                Krijg toegang tot exclusieve verzekeringskortingen en meer
                voordelen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Tot 25% korting</p>
                    <p className="text-sm text-muted-foreground">
                      Op verzekeringen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Speciale codes</p>
                    <p className="text-sm text-muted-foreground">
                      Exclusieve kortingscodes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Pensioenregelingen</p>
                    <p className="text-sm text-muted-foreground">
                      Met belastingvoordeel
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Persoonlijk advies</p>
                    <p className="text-sm text-muted-foreground">Van experts</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push("/dashboard/settings#subscription")}
              >
                Bekijk abonnementen vanaf €4,99/maand
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Verzekeringen"
      subtitle="Exclusieve kortingen voor SecuryFlex leden"
    >
      <div className="p-4 space-y-6">
        {/* Discount banner */}
        {showKortingBanner && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <Gift className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">
              Speciale aanbieding voor nieuwe klanten!
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Gebruik code{" "}
              <span className="font-mono font-bold">SECURYFLEX25</span> voor 25%
              extra korting op je eerste verzekering. Deze code is geldig tot 31
              december 2025.
            </AlertDescription>
          </Alert>
        )}

        {/* Category tabs */}
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
          <TabsList className="grid w-full grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon || Shield;
              return (
                <TabsTrigger key={category.id} value={category.id}>
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{category.naam}</span>
                  <span className="sm:hidden">
                    {category.naam.split(" ")[0]}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className="space-y-4"
            >
              {/* Category header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{category.naam}</h2>
                  <p className="text-muted-foreground">
                    {category.beschrijving}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Zoek verzekering..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter(
                    (product) =>
                      product.naam
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      product.beschrijving
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  )
                  .map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        product.isFeatured
                          ? "border-primary ring-2 ring-primary/20"
                          : ""
                      }`}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {product.naam}
                            </CardTitle>
                            {product.isFeatured && (
                              <Badge className="mt-1" variant="default">
                                Populair
                              </Badge>
                            )}
                          </div>
                          {product.platformKorting > 0 && (
                            <Badge variant="success" className="ml-2">
                              {product.platformKorting}% korting
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          {product.korteBeschrijving}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">
                            €
                            {(
                              product.basispremie *
                              (1 - product.platformKorting / 100)
                            ).toFixed(2)}
                          </span>
                          {product.platformKorting > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              €{product.basispremie.toFixed(2)}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            /maand
                          </span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2">
                          {product.features.slice(0, 3).map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Extra promo */}
                        {product.extraKorting && (
                          <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                              {product.extraKorting.naam}
                            </p>
                          </div>
                        )}

                        {/* Social proof */}
                        <div className="flex items-center gap-4 pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">4.8</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {product.aantalAanvragen} aanvragen
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button className="w-full">
                          Bekijk details
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>

              {products.length === 0 && (
                <Card className="p-8">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">
                      Geen verzekeringen gevonden
                    </p>
                    <p className="text-muted-foreground">
                      Probeer een andere zoekterm of categorie
                    </p>
                  </div>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Discount code input */}
        <Card className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Heb je een kortingscode?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Voer je kortingscode in..."
                value={kortingCode}
                onChange={(e) => setKortingCode(e.target.value.toUpperCase())}
                className="max-w-xs"
              />
              <Button onClick={handleApplyDiscount}>Toepassen</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              De korting wordt toegepast bij het aanvragen van een verzekering
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
