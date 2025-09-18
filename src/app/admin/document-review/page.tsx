"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
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

interface DocumentVerification {
  id: string;
  documentType: string;
  documentNummer?: string;
  originalFileName: string;
  status: string;
  uploadedAt: string;
  verificatieDatum?: string;
  geldigTot?: string;
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

interface DocumentStats {
  byStatus: Record<string, number>;
  expiringCount: number;
  byDocumentType: Record<string, number>;
}

export default function DocumentReviewPage() {
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<DocumentVerification[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, _setCurrentPage] = useState(1);

  // Check if user is admin
  const adminEmails = ["stef@securyflex.com", "robert@securyflex.com"];
  const isAdmin =
    session?.user?.email && adminEmails.includes(session.user.email);

  // If not admin, show access denied
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !isAdmin) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
  }, [status, isAdmin]);

  const fetchDocuments = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("documentType", typeFilter);

      const response = await fetch(`/api/admin/documents?${params}`, {
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
      setDocuments(result.data.documents);
      setStats(result.data.stats);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter]);

  useEffect(() => {
    if (isAdmin && status === "authenticated") {
      fetchDocuments();
    }
  }, [isAdmin, status, fetchDocuments]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      PENDING: { variant: "outline", label: "Wachtend" },
      IN_REVIEW: { variant: "default", label: "In Review" },
      APPROVED: { variant: "default", label: "Goedgekeurd" },
      REJECTED: { variant: "destructive", label: "Afgewezen" },
      ADDITIONAL_INFO: { variant: "secondary", label: "Info Nodig" },
      EXPIRED: { variant: "destructive", label: "Verlopen" },
      NEEDS_RENEWAL: { variant: "secondary", label: "Hernieuwing" },
      SUSPENDED: { variant: "destructive", label: "Opgeschort" },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      label: status,
    };
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
      OVERIGE: "Overige",
    };
    return typeLabels[type] || type;
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
              documenten beoordelen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !documents.length) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">
              Fout bij laden documenten
            </h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDocuments}>
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
          <h1 className="text-3xl font-bold">Documentverificatie</h1>
          <p className="text-muted-foreground">
            Handmatige verificatie van geüploade documenten voor
            echtheidscontrole
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDocuments} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Vernieuwen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Wachtend op review
                </p>
                <p className="text-2xl font-bold">
                  {stats.byStatus.PENDING || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Goedgekeurd</p>
                <p className="text-2xl font-bold">
                  {stats.byStatus.APPROVED || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Afgewezen</p>
                <p className="text-2xl font-bold">
                  {stats.byStatus.REJECTED || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Vervallen binnenkort
                </p>
                <p className="text-2xl font-bold">{stats.expiringCount || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <Label htmlFor="search">Zoeken</Label>
            <Input
              id="search"
              placeholder="Zoek op gebruiker, bestandsnaam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="PENDING">Wachtend</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="APPROVED">Goedgekeurd</SelectItem>
                <SelectItem value="REJECTED">Afgewezen</SelectItem>
                <SelectItem value="ADDITIONAL_INFO">Info Nodig</SelectItem>
                <SelectItem value="EXPIRED">Verlopen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Document Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle types</SelectItem>
                <SelectItem value="IDENTITEITSBEWIJS">
                  Identiteitsbewijs
                </SelectItem>
                <SelectItem value="PASPOORT">Paspoort</SelectItem>
                <SelectItem value="KVK_UITTREKSEL">KvK Uittreksel</SelectItem>
                <SelectItem value="ND_NUMMER">ND-nummer</SelectItem>
                <SelectItem value="BOA_CERTIFICAAT">BOA Certificaat</SelectItem>
                <SelectItem value="SVPB_DIPLOMA_BEVEILIGER">
                  SVPB Diploma
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters toepassen
          </Button>
        </div>
      </Card>

      {/* Documents Table */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Document</th>
                <th className="text-left p-2">Gebruiker</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Upload datum</th>
                <th className="text-left p-2">Acties</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">
                          {doc.originalFileName}
                        </p>
                        {doc.documentNummer && (
                          <p className="text-xs text-muted-foreground">
                            {doc.documentNummer}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div>
                      <p className="font-medium text-sm">{doc.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.user.email}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {doc.user.role}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="text-sm">
                      {getDocumentTypeLabel(doc.documentType)}
                    </span>
                  </td>
                  <td className="p-2">{getStatusBadge(doc.status)}</td>
                  <td className="p-2">
                    <span className="text-sm">
                      {new Date(doc.uploadedAt).toLocaleString("nl-NL")}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `/admin/document-review/${doc.id}`,
                            "_blank",
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Geen documenten gevonden voor de huidige filters
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
