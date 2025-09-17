"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2
} from "lucide-react";

interface DocumentUploadProps {
  onUploadComplete?: (document: any) => void;
  className?: string;
}

export default function DocumentUpload({ onUploadComplete, className }: DocumentUploadProps) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [documentNummer, setDocumentNummer] = useState("");
  const [geldigTot, setGeldigTot] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message?: string;
    document?: any;
  } | null>(null);

  const documentTypes = [
    { value: "IDENTITEITSBEWIJS", label: "Identiteitsbewijs" },
    { value: "PASPOORT", label: "Paspoort" },
    { value: "RIJBEWIJS", label: "Rijbewijs" },
    { value: "KVK_UITTREKSEL", label: "KvK Uittreksel" },
    { value: "BTW_NUMMER", label: "BTW Nummer" },
    { value: "ND_NUMMER", label: "ND-nummer" },
    { value: "LEGITIMATIEBEWIJS", label: "Legitimatiebewijs" },
    { value: "TOESTEMMINGSBEWIJS", label: "Toestemmingsbewijs" },
    { value: "VOG_P_CERTIFICAAT", label: "VOG P Certificaat" },
    { value: "SVPB_DIPLOMA_BEVEILIGER", label: "SVPB Diploma Beveiliger" },
    { value: "SVPB_CERTIFICAAT_PERSOONSBEVEILIGING", label: "SVPB Persoonsbeveiliging" },
    { value: "SVPB_CERTIFICAAT_WINKELSURVEILLANCE", label: "SVPB Winkelsurveillance" },
    { value: "SVPB_CERTIFICAAT_EVENT_SECURITY", label: "SVPB Event Security" },
    { value: "SVPB_CERTIFICAAT_CENTRALIST", label: "SVPB Centralist" },
    { value: "BOA_CERTIFICAAT", label: "BOA Certificaat" },
    { value: "BHV_CERTIFICAAT", label: "BHV Certificaat" },
    { value: "KNVB_STEWARD", label: "KNVB Steward" },
    { value: "HORECA_PORTIER", label: "Horeca Portier" },
    { value: "MBV_CERTIFICAAT", label: "MBV Certificaat" },
    { value: "TBV_CERTIFICAAT", label: "TBV Certificaat" },
    { value: "VERZEKERINGSBEWIJS", label: "Verzekeringsbewijs" },
    { value: "BANKGEGEVENS", label: "Bankgegevens" },
    { value: "IBAN_BEWIJS", label: "IBAN Bewijs" },
    { value: "CONTRACT", label: "Contract" },
    { value: "ARBEIDSOVEREENKOMST", label: "Arbeidsovereenkomst" },
    { value: "FREELANCER_OVEREENKOMST", label: "Freelancer Overeenkomst" },
    { value: "DIPLOMA_OVERIG", label: "Diploma (Overig)" },
    { value: "CERTIFICAAT_OVERIG", label: "Certificaat (Overig)" },
    { value: "OVERIGE", label: "Overige" }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadResult({
          success: false,
          message: "Bestand is te groot. Maximum bestandsgrootte is 10MB."
        });
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadResult({
          success: false,
          message: "Bestandstype niet toegestaan. Alleen PDF, JPG, PNG en WebP bestanden zijn toegestaan."
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileSelect({ target: { files: dt.files } } as any);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setUploadResult({
        success: false,
        message: "Selecteer een bestand en document type."
      });
      return;
    }

    if (!session?.user) {
      setUploadResult({
        success: false,
        message: "Je moet ingelogd zijn om documenten te uploaden."
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadResult(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      if (documentNummer) formData.append('documentNummer', documentNummer);
      if (geldigTot) formData.append('geldigTot', geldigTot);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setUploadResult({
        success: true,
        message: "Document succesvol geüpload! Het wordt nu beoordeeld door onze beheerders.",
        document: result.document
      });

      // Reset form
      setSelectedFile(null);
      setDocumentType("");
      setDocumentNummer("");
      setGeldigTot("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete(result.document);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : "Er is een fout opgetreden bij het uploaden."
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Document Uploaden</h3>
          <p className="text-sm text-muted-foreground">
            Upload uw documenten voor verificatie. Toegestane formaten: PDF, JPG, PNG (max 10MB)
          </p>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            disabled={uploading}
          />

          {selectedFile ? (
            <div className="space-y-2">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {!uploading && (
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  Ander bestand kiezen
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="font-medium">Klik om een bestand te selecteren</p>
              <p className="text-sm text-muted-foreground">
                of sleep een bestand hierheen
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploaden...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Document Details Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="documentType">Document Type *</Label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
              disabled={uploading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecteer document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="documentNummer">Document/Certificaat Nummer (optioneel)</Label>
            <Input
              id="documentNummer"
              value={documentNummer}
              onChange={(e) => setDocumentNummer(e.target.value)}
              placeholder="Bijv. ND-nummer, certificaatnummer..."
              className="mt-1"
              disabled={uploading}
            />
          </div>

          <div>
            <Label htmlFor="geldigTot">Geldig tot (optioneel)</Label>
            <Input
              id="geldigTot"
              type="date"
              value={geldigTot}
              onChange={(e) => setGeldigTot(e.target.value)}
              className="mt-1"
              disabled={uploading}
            />
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-start gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <AlertDescription className="text-sm">
                {uploadResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploaden...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Document Uploaden
            </>
          )}
        </Button>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Toegestane bestandsformaten: PDF, JPG, PNG, WebP</p>
          <p>• Maximale bestandsgrootte: 10MB</p>
          <p>• Documenten worden handmatig geverifieerd door onze beheerders</p>
          <p>• U ontvangt een notificatie zodra uw document is beoordeeld</p>
        </div>
      </div>
    </Card>
  );
}