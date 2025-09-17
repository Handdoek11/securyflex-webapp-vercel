"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Save,
  Eye,
  ExternalLink,
  Shield,
  Download,
  History
} from "lucide-react";

interface DocumentDetails {
  id: string;
  documentType: string;
  documentNummer?: string;
  originalFileName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: string;
  adminNotes?: string;
  rejectionReason?: string;
  verificatieDatum?: string;
  verifiedBy?: string;
  geldigTot?: string;
  uploadedAt: string;
  externalVerified: boolean;
  externalSource?: string;
  externalRef?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  verificationHistory: Array<{
    action: string;
    oldStatus?: string;
    newStatus: string;
    performedByName: string;
    createdAt: string;
    adminNotes?: string;
  }>;
}

export default function DocumentReviewDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Form state
  const [reviewStatus, setReviewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [externalVerified, setExternalVerified] = useState(false);
  const [externalSource, setExternalSource] = useState("");
  const [externalRef, setExternalRef] = useState("");
  const [saving, setSaving] = useState(false);

  // Check if user is admin
  const adminEmails = ['stef@securyflex.com', 'robert@securyflex.com'];
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !isAdmin) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    fetchDocument();
  }, [status, isAdmin, params.id]);

  const fetchDocument = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/documents/${params.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          setAccessDenied(true);
          return;
        }
        if (response.status === 404) {
          setError("Document niet gevonden");
          return;
        }
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      setDocument(result);

      // Set form values
      setReviewStatus(result.status);
      setAdminNotes(result.adminNotes || "");
      setRejectionReason(result.rejectionReason || "");
      setExternalVerified(result.externalVerified);
      setExternalSource(result.externalSource || "");
      setExternalRef(result.externalRef || "");

    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to load document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveReview = async () => {
    if (!document) return;

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        status: reviewStatus,
        adminNotes: adminNotes || null,
        rejectionReason: rejectionReason || null,
        externalVerified,
        externalSource: externalSource || null,
        externalRef: externalRef || null
      };

      const response = await fetch(`/api/documents/${params.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status}`);
      }

      const result = await response.json();
      setDocument(result.document);

      // Show success message or redirect
      router.refresh();

    } catch (error) {
      console.error("Error saving review:", error);
      setError("Failed to save review. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      PENDING: { variant: "outline", label: "Wachtend" },
      IN_REVIEW: { variant: "default", label: "In Review" },
      APPROVED: { variant: "default", label: "Goedgekeurd" },
      REJECTED: { variant: "destructive", label: "Afgewezen" },
      ADDITIONAL_INFO: { variant: "secondary", label: "Info Nodig" },
      EXPIRED: { variant: "destructive", label: "Verlopen" },
      NEEDS_RENEWAL: { variant: "secondary", label: "Hernieuwing" },
      SUSPENDED: { variant: "destructive", label: "Opgeschort" }
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      IDENTITEITSBEWIJS: "Identiteitsbewijs",
      PASPOORT: "Paspoort",
      RIJBEWIJS: "Rijbewijs",
      KVK_UITTREKSEL: "KvK Uittreksel",
      ND_NUMMER: "ND-nummer",
      LEGITIMATIEBEWIJS: "Legitimatiebewijs",
      BOA_CERTIFICAAT: "BOA Certificaat",
      BHV_CERTIFICAAT: "BHV Certificaat",
      SVPB_DIPLOMA_BEVEILIGER: "SVPB Diploma Beveiliger",
      SVPB_CERTIFICAAT_PERSOONSBEVEILIGING: "SVPB Persoonsbeveiliging",
      SVPB_CERTIFICAAT_WINKELSURVEILLANCE: "SVPB Winkelsurveillance",
      SVPB_CERTIFICAAT_EVENT_SECURITY: "SVPB Event Security",
      KNVB_STEWARD: "KNVB Steward",
      HORECA_PORTIER: "Horeca Portier",
      VERZEKERINGSBEWIJS: "Verzekeringsbewijs",
      CONTRACT: "Contract",
      OVERIGE: "Overige"
    };
    return typeLabels[type] || type;
  };

  const getVerificationGuidelines = (type: string) => {
    const guidelines: Record<string, { steps: string[], checks: string[], externalUrls?: { name: string, url: string }[] }> = {
      ND_NUMMER: {
        steps: [
          "Controleer ND-nummer format (8 cijfers)",
          "Verificeer via Justis WPBR register",
          "Controleer geldigheid (5 jaar)",
          "Verifieer bedrijfsnaam matching met KvK"
        ],
        checks: [
          "ND-nummer is 8 cijfers",
          "Status is 'ACTIEF' in register",
          "Geen schorsing of intrekking",
          "Geldig tot datum niet verstreken"
        ],
        externalUrls: [
          { name: "Justis WPBR Register", url: "https://www.justis.nl/registers/wpbr-register" }
        ]
      },
      KVK_UITTREKSEL: {
        steps: [
          "Controleer datum uittreksel (max 6 maanden oud)",
          "Verificeer via KvK online register",
          "Controleer bedrijfsstatus (actief)",
          "Verifieer NAW gegevens"
        ],
        checks: [
          "Uittreksel is origineel of gecertificeerd",
          "Datum niet ouder dan 6 maanden",
          "Status is 'Actief'",
          "KvK nummer is geldig"
        ],
        externalUrls: [
          { name: "KvK Register", url: "https://www.kvk.nl/zoeken/" }
        ]
      },
      SVPB_DIPLOMA_BEVEILIGER: {
        steps: [
          "Controleer diploma nummer",
          "Verificeer via V:base database",
          "Controleer geldigheid en echtheid",
          "Verifieer naam en geboortedatum"
        ],
        checks: [
          "Diploma nummer is correct format",
          "Gevonden in V:base register",
          "Naam komt overeen",
          "Geen vervalsing zichtbaar"
        ],
        externalUrls: [
          { name: "SVPB V:base", url: "https://www.svpb.nl/vbase" }
        ]
      },
      IDENTITEITSBEWIJS: {
        steps: [
          "Controleer beveiligingskenmerken",
          "Verificeer model 2024 kenmerken indien van toepassing",
          "Controleer geldigheid",
          "Bij twijfel: contact Marechaussee ID-desk"
        ],
        checks: [
          "Schaduwwatermerk zichtbaar",
          "Tactiele reliëf voelbaar",
          "Geen kleurverschillen beschermfolie",
          "Geen luchtbellen of beschadigingen",
          "Geldigheid niet verstreken"
        ]
      }
    };

    return guidelines[type] || {
      steps: ["Controleer echtheid en geldigheid", "Verificeer met externe bronnen indien mogelijk"],
      checks: ["Document lijkt authentiek", "Informatie is leesbaar en correct"]
    };
  };

  if (status === 'loading' || loading) {
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
              Beheerderstoegang vereist.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Document niet gevonden</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar overzicht
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const guidelines = getVerificationGuidelines(document.documentType);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Document Review</h1>
          <p className="text-muted-foreground">
            {getDocumentTypeLabel(document.documentType)} - {document.originalFileName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Viewer */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Document</h2>
              <Button
                variant="outline"
                onClick={() => window.open(`/api/documents/${document.id}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Openen in nieuw venster
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50 min-h-96 flex items-center justify-center">
              {document.mimeType.startsWith('image/') ? (
                <img
                  src={`/api/documents/${document.id}`}
                  alt={document.originalFileName}
                  className="max-w-full max-h-96 object-contain"
                />
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    PDF preview niet beschikbaar
                  </p>
                  <Button
                    onClick={() => window.open(`/api/documents/${document.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Bekijk PDF
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Verification Guidelines */}
          <Card className="p-4 mt-6">
            <h3 className="text-lg font-semibold mb-4">Verificatie Richtlijnen</h3>

            <Tabs defaultValue="steps" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="steps">Stappen</TabsTrigger>
                <TabsTrigger value="checks">Controles</TabsTrigger>
                <TabsTrigger value="external">Externe Links</TabsTrigger>
              </TabsList>

              <TabsContent value="steps" className="space-y-2">
                {guidelines.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="checks" className="space-y-2">
                {guidelines.checks.map((check, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{check}</span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="external" className="space-y-2">
                {guidelines.externalUrls?.map((link, index) => (
                  <div key={index}>
                    <Button
                      variant="outline"
                      onClick={() => window.open(link.url, '_blank')}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {link.name}
                    </Button>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    Geen externe verificatie links beschikbaar
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Review Panel */}
        <div className="space-y-6">
          {/* Document Info */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Document Informatie</h3>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(document.status)}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm mt-1">{getDocumentTypeLabel(document.documentType)}</p>
              </div>

              {document.documentNummer && (
                <div>
                  <Label className="text-sm font-medium">Document Nummer</Label>
                  <p className="text-sm mt-1">{document.documentNummer}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Bestandsnaam</Label>
                <p className="text-sm mt-1">{document.originalFileName}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Bestandsgrootte</Label>
                <p className="text-sm mt-1">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Upload datum</Label>
                <p className="text-sm mt-1">
                  {new Date(document.uploadedAt).toLocaleString("nl-NL")}
                </p>
              </div>

              {document.geldigTot && (
                <div>
                  <Label className="text-sm font-medium">Geldig tot</Label>
                  <p className="text-sm mt-1">
                    {new Date(document.geldigTot).toLocaleDateString("nl-NL")}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* User Info */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Gebruiker</h3>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Naam</Label>
                <p className="text-sm mt-1">{document.user.name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm mt-1">{document.user.email}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Rol</Label>
                <div className="mt-1">
                  <Badge variant="outline">{document.user.role}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Review Form */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Beoordeling</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Wachtend</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="APPROVED">Goedgekeurd</SelectItem>
                    <SelectItem value="REJECTED">Afgewezen</SelectItem>
                    <SelectItem value="ADDITIONAL_INFO">Info Nodig</SelectItem>
                    <SelectItem value="SUSPENDED">Opgeschort</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reviewStatus === "REJECTED" && (
                <div>
                  <Label htmlFor="rejectionReason">Reden afwijzing</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Geef aan waarom het document is afgewezen..."
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="adminNotes">Admin notities</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Interne notities voor administratie..."
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Externe Verificatie</h4>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="externalVerified"
                    checked={externalVerified}
                    onChange={(e) => setExternalVerified(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="externalVerified" className="text-sm">
                    Extern geverifieerd
                  </Label>
                </div>

                {externalVerified && (
                  <>
                    <div>
                      <Label htmlFor="externalSource">Bron</Label>
                      <Input
                        id="externalSource"
                        value={externalSource}
                        onChange={(e) => setExternalSource(e.target.value)}
                        placeholder="V:base, Justis, KvK, etc."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="externalRef">Referentie</Label>
                      <Input
                        id="externalRef"
                        value={externalRef}
                        onChange={(e) => setExternalRef(e.target.value)}
                        placeholder="Referentie nummer of ID"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={saveReview}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Beoordeling opslaan
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* History */}
          {document.verificationHistory.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Geschiedenis</h3>

              <div className="space-y-3">
                {document.verificationHistory.map((entry, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center gap-2 text-sm">
                      <History className="h-3 w-3" />
                      <span className="font-medium">{entry.action}</span>
                      <span className="text-muted-foreground">
                        door {entry.performedByName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString("nl-NL")}
                    </p>
                    {entry.adminNotes && (
                      <p className="text-sm mt-1">{entry.adminNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}