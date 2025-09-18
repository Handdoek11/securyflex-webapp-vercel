"use client";

import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Gift,
  Info,
  Loader2,
  Mail,
  Phone,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

// Mock product detail data
const mockProductDetail = {
  p1: {
    id: "p1",
    naam: "Beroepsaansprakelijkheid (AVB)",
    korteBeschrijving: "Verplichte verzekering voor beveiligers",
    volledigeBeschrijving: `De beroepsaansprakelijkheidsverzekering is essentieel voor iedere beveiliger.
    Deze verzekering dekt schade die je tijdens je werkzaamheden als beveiliger veroorzaakt aan derden.
    Dit kan zowel materiële schade als letselschade zijn. Als beveiliger werk je vaak in situaties waar het risico op schade aanwezig is,
    daarom is deze verzekering niet alleen verstandig maar vaak ook verplicht gesteld door opdrachtgevers.`,

    verzekeraar: "Schouten Zekerheid",
    verzekeraarInfo:
      "Al 40 jaar specialist in verzekeringen voor de beveiligingsbranche",

    basispremie: 42.5,
    platformKorting: 15,

    categorie: "Zakelijke verzekeringen",

    dekkingen: [
      { naam: "Maximale dekking per aanspraak", waarde: "€ 2.500.000" },
      { naam: "Maximale dekking per jaar", waarde: "€ 5.000.000" },
      { naam: "Eigen risico", waarde: "€ 0" },
      { naam: "Rechtsbijstand", waarde: "Inbegrepen" },
      { naam: "Werelddekking", waarde: "Ja (excl. USA/Canada)" },
      { naam: "Opzichtschade", waarde: "€ 25.000" },
    ],

    features: [
      "Dekking tot €2.500.000 per aanspraak",
      "Inclusief rechtsbijstand",
      "Werelddekking (excl. USA/Canada)",
      "Geen eigen risico",
      "24/7 schademeldservice",
      "Opzichtschade gedekt tot €25.000",
      "Personeelsaansprakelijkheid inbegrepen",
      "Vermogensschade gedekt",
    ],

    uitsluitingen: [
      "Opzettelijk veroorzaakte schade",
      "Schade door alcohol/drugs gebruik",
      "Boetes en dwangsommen",
      "Schade aan eigen goederen",
      "Werkzaamheden in USA/Canada",
    ],

    vereisten: [
      "Geldig KvK nummer",
      "Minimaal MBO niveau 2 beveiliging",
      "Geen strafrechtelijk verleden",
      "Minimaal 6 maanden werkervaring",
    ],

    reviews: [
      {
        naam: "Johan B.",
        rating: 5,
        comment: "Uitstekende verzekering, snel geholpen bij schademelding",
        datum: "2024-11-15",
      },
      {
        naam: "Sandra K.",
        rating: 4,
        comment: "Goede dekking voor een eerlijke prijs",
        datum: "2024-10-22",
      },
      {
        naam: "Mike T.",
        rating: 5,
        comment: "Al jaren tevreden klant, aanrader!",
        datum: "2024-09-30",
      },
    ],

    rating: 4.7,
    aantalReviews: 156,
    aantalAanvragen: 423,

    documenten: [
      { naam: "Polisvoorwaarden AVB", url: "#", size: "245 KB" },
      { naam: "Informatieblad verzekering", url: "#", size: "123 KB" },
      { naam: "Schadeformulier", url: "#", size: "89 KB" },
    ],
  },
};

export default function VerzekeringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [kortingCode, setKortingCode] = useState("");
  const [kortingValid, setKortingValid] = useState(false);
  const [kortingData, setKortingData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overzicht");
  const [showAanvraagDialog, setShowAanvraagDialog] = useState(false);
  const [aanvraagForm, setAanvraagForm] = useState({
    naam: "",
    email: "",
    telefoon: "",
    kvkNummer: "",
    startDatum: "",
    opmerkingen: "",
    akkoord: false,
  });

  useEffect(() => {
    loadProductDetail();
  }, [loadProductDetail]);

  const loadProductDetail = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const res = await fetch(`/api/verzekeringen/producten/${params.id}`);
      // const data = await res.json();

      // For now, use mock data
      const productData =
        mockProductDetail[params.id as string] || mockProductDetail.p1;
      setProduct(productData);

      // Pre-fill form with user data if available
      if (session?.user) {
        setAanvraagForm((prev) => ({
          ...prev,
          naam: session.user.name || "",
          email: session.user.email || "",
        }));
      }
    } catch (error) {
      console.error("Error loading product detail:", error);
      toast.error("Kon product niet laden");
    } finally {
      setLoading(false);
    }
  };

  const validateKortingCode = async () => {
    if (!kortingCode) {
      toast.error("Voer een kortingscode in");
      return;
    }

    try {
      const res = await fetch("/api/verzekeringen/kortingen/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: kortingCode,
          productId: params.id,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.isValid) {
        setKortingValid(true);
        setKortingData(data.data);
        toast.success(data.data.message || "Kortingscode is geldig!");
      } else {
        setKortingValid(false);
        setKortingData(null);
        toast.error(data.error || "Ongeldige kortingscode");
      }
    } catch (error) {
      console.error("Error validating discount:", error);
      toast.error("Kon kortingscode niet valideren");
    }
  };

  const calculatePremie = () => {
    if (!product) return { basis: 0, korting: 0, finaal: 0 };

    const basis = product.basispremie || 0;
    const platformKorting = basis * (product.platformKorting / 100);
    const codeKorting = kortingData?.calculatedDiscount?.amount || 0;
    const finaal = Math.max(0, basis - platformKorting - codeKorting);

    return {
      basis: basis.toFixed(2),
      platformKorting: platformKorting.toFixed(2),
      codeKorting: codeKorting.toFixed(2),
      finaal: finaal.toFixed(2),
      totaalKorting: (((platformKorting + codeKorting) / basis) * 100).toFixed(
        0,
      ),
    };
  };

  const handleAanvraag = async () => {
    // Validate form
    if (!aanvraagForm.akkoord) {
      toast.error("Je moet akkoord gaan met de voorwaarden");
      return;
    }

    if (!aanvraagForm.naam || !aanvraagForm.email || !aanvraagForm.telefoon) {
      toast.error("Vul alle verplichte velden in");
      return;
    }

    try {
      const res = await fetch("/api/verzekeringen/aanvragen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: params.id,
          aanvraagData: aanvraagForm,
          kortingCode: kortingValid ? kortingCode : undefined,
          saveAsConcept: false,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Aanvraag succesvol ingediend!");
        setShowAanvraagDialog(false);
        router.push("/dashboard/verzekeringen/aanvragen");
      } else {
        toast.error(data.error || "Kon aanvraag niet indienen");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Er ging iets mis bij het indienen");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Laden..." subtitle="">
        <div className="p-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout title="Product niet gevonden" subtitle="">
        <div className="p-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Product niet gevonden</AlertTitle>
            <AlertDescription>
              Het opgevraagde verzekeringsproduct kon niet worden gevonden.
            </AlertDescription>
          </Alert>
          <Button
            className="mt-4"
            onClick={() => router.push("/dashboard/verzekeringen")}
          >
            Terug naar overzicht
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const premie = calculatePremie();

  return (
    <DashboardLayout title={product.naam} subtitle={product.korteBeschrijving}>
      <div className="p-4 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/verzekeringen")}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Terug naar overzicht
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
                <TabsTrigger value="dekking">Dekking</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overzicht" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Over deze verzekering</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {product.volledigeBeschrijving}
                    </p>

                    <div className="space-y-3">
                      <h4 className="font-semibold">
                        Belangrijkste kenmerken:
                      </h4>
                      <ul className="space-y-2">
                        {product.features.map(
                          (feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Verzekeraar</AlertTitle>
                      <AlertDescription>
                        {product.verzekeraar}: {product.verzekeraarInfo}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vereisten</CardTitle>
                    <CardDescription>
                      Om deze verzekering af te sluiten moet je aan de volgende
                      voorwaarden voldoen:
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {product.vereisten.map(
                        (vereiste: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{vereiste}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Documenten</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {product.documenten.map((doc: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{doc.naam}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.size}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dekking" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dekkingsoverzicht</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {product.dekkingen.map((dekking: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between py-2 border-b last:border-0"
                        >
                          <span className="text-sm font-medium">
                            {dekking.naam}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {dekking.waarde}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Uitsluitingen</CardTitle>
                    <CardDescription>
                      De volgende zaken zijn niet gedekt door deze verzekering:
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {product.uitsluitingen.map(
                        (uitsluiting: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{uitsluiting}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Klantbeoordelingen</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-muted-foreground">
                          ({product.aantalReviews} reviews)
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {product.reviews.map((review: any, idx: number) => (
                      <div
                        key={idx}
                        className="space-y-2 pb-4 border-b last:border-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{review.naam}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.datum).toLocaleDateString(
                                "nl-NL",
                              )}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Premie berekening</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Basispremie</span>
                    <span className="text-sm">€{premie.basis}</span>
                  </div>
                  {product.platformKorting > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">
                        Platform korting (-{product.platformKorting}%)
                      </span>
                      <span className="text-sm">
                        -€{premie.platformKorting}
                      </span>
                    </div>
                  )}
                  {kortingValid && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Kortingscode</span>
                      <span className="text-sm">-€{premie.codeKorting}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold">Totaal per maand</span>
                      <div>
                        <span className="text-2xl font-bold">
                          €{premie.finaal}
                        </span>
                        {premie.totaalKorting > 0 && (
                          <Badge variant="success" className="ml-2">
                            {premie.totaalKorting}% korting
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Discount code input */}
                <div className="space-y-2">
                  <Label>Kortingscode</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="CODE"
                      value={kortingCode}
                      onChange={(e) =>
                        setKortingCode(e.target.value.toUpperCase())
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={validateKortingCode}
                      disabled={!kortingCode || kortingValid}
                    >
                      {kortingValid ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        "Toepassen"
                      )}
                    </Button>
                  </div>
                  {kortingValid && kortingData && (
                    <p className="text-xs text-green-600">
                      {kortingData.naam} toegepast!
                    </p>
                  )}
                </div>

                <Dialog
                  open={showAanvraagDialog}
                  onOpenChange={setShowAanvraagDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Direct aanvragen
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Verzekering aanvragen</DialogTitle>
                      <DialogDescription>
                        Vul je gegevens in voor de aanvraag van {product.naam}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="naam">Naam *</Label>
                        <Input
                          id="naam"
                          value={aanvraagForm.naam}
                          onChange={(e) =>
                            setAanvraagForm({
                              ...aanvraagForm,
                              naam: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={aanvraagForm.email}
                          onChange={(e) =>
                            setAanvraagForm({
                              ...aanvraagForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="telefoon">Telefoon *</Label>
                        <Input
                          id="telefoon"
                          value={aanvraagForm.telefoon}
                          onChange={(e) =>
                            setAanvraagForm({
                              ...aanvraagForm,
                              telefoon: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="kvk">KvK nummer</Label>
                        <Input
                          id="kvk"
                          value={aanvraagForm.kvkNummer}
                          onChange={(e) =>
                            setAanvraagForm({
                              ...aanvraagForm,
                              kvkNummer: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="startdatum">
                          Gewenste ingangsdatum
                        </Label>
                        <Input
                          id="startdatum"
                          type="date"
                          value={aanvraagForm.startDatum}
                          onChange={(e) =>
                            setAanvraagForm({
                              ...aanvraagForm,
                              startDatum: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="opmerkingen">Opmerkingen</Label>
                        <Textarea
                          id="opmerkingen"
                          value={aanvraagForm.opmerkingen}
                          onChange={(e) =>
                            setAanvraagForm({
                              ...aanvraagForm,
                              opmerkingen: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="akkoord"
                          checked={aanvraagForm.akkoord}
                          onCheckedChange={(checked) =>
                            setAanvraagForm({
                              ...aanvraagForm,
                              akkoord: checked as boolean,
                            })
                          }
                        />
                        <label htmlFor="akkoord" className="text-sm">
                          Ik ga akkoord met de voorwaarden en geef toestemming
                          voor het verwerken van mijn gegevens
                        </label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAanvraagDialog(false)}
                      >
                        Annuleren
                      </Button>
                      <Button onClick={handleAanvraag}>
                        Aanvraag indienen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-muted-foreground text-center">
                  Direct online afsluiten • Geen verplichtingen
                </p>
              </CardContent>
            </Card>

            {/* Contact card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hulp nodig?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="tel:0612345678"
                  className="flex items-center gap-2 text-sm hover:text-primary"
                >
                  <Phone className="h-4 w-4" />
                  06-12345678
                </a>
                <a
                  href="mailto:verzekeringen@securyflex.nl"
                  className="flex items-center gap-2 text-sm hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  verzekeringen@securyflex.nl
                </a>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Ma-Vr 9:00-17:00
                </div>
              </CardContent>
            </Card>

            {/* Trust signals */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {product.aantalAanvragen} beveiligers hebben deze
                    verzekering
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Gecertificeerde verzekeraar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Exclusief voor SecuryFlex leden
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
