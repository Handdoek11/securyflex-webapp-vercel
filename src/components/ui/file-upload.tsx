"use client";

import {
  AlertCircle,
  CheckCircle,
  Eye,
  File,
  Image,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// File type configurations
const fileTypeConfig = {
  CERTIFICATE: {
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    label: "Certificaat",
    description: "PDF of afbeelding (max 10MB)",
  },
  ID: {
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    maxSize: 5 * 1024 * 1024, // 5MB
    label: "Identiteitsbewijs",
    description: "Afbeelding (max 5MB)",
  },
  KVK: {
    accept: { "application/pdf": [".pdf"] },
    maxSize: 10 * 1024 * 1024, // 10MB
    label: "KvK Uittreksel",
    description: "PDF (max 10MB)",
  },
  BANK: {
    accept: { "application/pdf": [".pdf"] },
    maxSize: 10 * 1024 * 1024, // 10MB
    label: "Bankafschrift",
    description: "PDF (max 10MB)",
  },
  PROFILE_PHOTO: {
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    maxSize: 2 * 1024 * 1024, // 2MB
    label: "Profielfoto",
    description: "Afbeelding (max 2MB)",
  },
};

type FileType = keyof typeof fileTypeConfig;

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
  url?: string;
}

interface FileUploadProps {
  type: FileType;
  multiple?: boolean;
  maxFiles?: number;
  onUpload?: (
    files: File[],
  ) => Promise<{ success: boolean; urls?: string[]; error?: string }>;
  onRemove?: (fileId: string) => void;
  existingFiles?: { id: string; name: string; url: string; size?: number }[];
  disabled?: boolean;
  className?: string;
  variant?: "default" | "compact" | "avatar";
}

export function FileUpload({
  type,
  multiple = false,
  maxFiles = 1,
  onUpload,
  onRemove,
  existingFiles = [],
  disabled = false,
  className,
  variant = "default",
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const config = fileTypeConfig[type];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      // Validate file count
      const totalFiles =
        uploadedFiles.length + existingFiles.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(
          `Maximum ${maxFiles} bestand${maxFiles > 1 ? "en" : ""} toegestaan`,
        );
        return;
      }

      // Create file objects with preview
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        status: "uploading",
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      if (onUpload) {
        setIsUploading(true);

        try {
          // Simulate upload progress
          for (const uploadFile of newFiles) {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress: 50 } : f,
              ),
            );
          }

          const result = await onUpload(acceptedFiles);

          if (result.success) {
            setUploadedFiles((prev) =>
              prev.map((f, _index) => {
                const fileIndex = newFiles.findIndex((nf) => nf.id === f.id);
                if (fileIndex !== -1) {
                  return {
                    ...f,
                    status: "success",
                    progress: 100,
                    url: result.urls?.[fileIndex],
                  };
                }
                return f;
              }),
            );
            toast.success("Bestand(en) succesvol geüpload");
          } else {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                newFiles.some((nf) => nf.id === f.id)
                  ? {
                      ...f,
                      status: "error",
                      error: result.error || "Upload mislukt",
                    }
                  : f,
              ),
            );
            toast.error(result.error || "Upload mislukt");
          }
        } catch (_error) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              newFiles.some((nf) => nf.id === f.id)
                ? { ...f, status: "error", error: "Upload mislukt" }
                : f,
            ),
          );
          toast.error("Upload mislukt");
        } finally {
          setIsUploading(false);
        }
      }
    },
    [uploadedFiles, existingFiles, maxFiles, disabled, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: config.accept,
      maxSize: config.maxSize,
      multiple,
      disabled: disabled || isUploading,
    });

  // Handle file rejections
  React.useEffect(() => {
    fileRejections.forEach((rejection) => {
      rejection.errors.forEach((error) => {
        if (error.code === "file-too-large") {
          toast.error(
            `Bestand is te groot. Maximum: ${formatFileSize(config.maxSize)}`,
          );
        } else if (error.code === "file-invalid-type") {
          toast.error("Ongeldig bestandstype");
        } else {
          toast.error(error.message);
        }
      });
    });
  }, [fileRejections, config.maxSize]);

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
    onRemove?.(fileId);
  };

  const removeExistingFile = (fileId: string) => {
    onRemove?.(fileId);
  };

  // Avatar variant for profile photos
  if (variant === "avatar") {
    const hasFiles = uploadedFiles.length > 0 || existingFiles.length > 0;
    const currentFile = uploadedFiles[0] || existingFiles[0];

    return (
      <div className={cn("relative", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "relative w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer overflow-hidden",
            isDragActive && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />

          {hasFiles && currentFile ? (
            <div className="relative w-full h-full">
              {currentFile.url ||
              (uploadedFiles[0]?.preview &&
                uploadedFiles[0]?.status === "success") ? (
                <img
                  src={currentFile.url || uploadedFiles[0]?.preview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {uploadedFiles[0]?.status === "uploading" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <Image className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              )}

              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (uploadedFiles[0]) {
                    removeFile(uploadedFiles[0].id);
                  } else if (existingFiles[0]) {
                    removeExistingFile(existingFiles[0].id);
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-2">
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Upload</span>
            </div>
          )}
        </div>

        {uploadedFiles[0]?.status === "uploading" && (
          <div className="absolute -bottom-2 left-0 right-0">
            <Progress value={uploadedFiles[0].progress} className="h-1" />
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer",
            isDragActive && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop hier..." : `Upload ${config.label}`}
          </p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>

        {/* File list */}
        {(uploadedFiles.length > 0 || existingFiles.length > 0) && (
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <FileItem
                key={file.id}
                name={file.name}
                size={file.size}
                status="success"
                onRemove={() => removeExistingFile(file.id)}
                onPreview={() => window.open(file.url, "_blank")}
              />
            ))}
            {uploadedFiles.map((file) => (
              <FileItem
                key={file.id}
                name={file.file.name}
                size={file.file.size}
                status={file.status}
                progress={file.progress}
                error={file.error}
                preview={file.preview}
                onRemove={() => removeFile(file.id)}
                onPreview={
                  file.preview
                    ? () => window.open(file.preview!, "_blank")
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer",
          isDragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive
                ? "Drop bestanden hier..."
                : `Sleep ${config.label.toLowerCase()} hierheen of klik om te uploaden`}
            </p>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>

          <Button type="button" variant="outline" size="sm" disabled={disabled}>
            <Upload className="h-4 w-4 mr-2" />
            Bestand selecteren
          </Button>
        </div>
      </div>

      {/* File list */}
      {(uploadedFiles.length > 0 || existingFiles.length > 0) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Geüploade bestanden</h4>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <FileItem
                key={file.id}
                name={file.name}
                size={file.size}
                status="success"
                onRemove={() => removeExistingFile(file.id)}
                onPreview={() => window.open(file.url, "_blank")}
              />
            ))}
            {uploadedFiles.map((file) => (
              <FileItem
                key={file.id}
                name={file.file.name}
                size={file.file.size}
                status={file.status}
                progress={file.progress}
                error={file.error}
                preview={file.preview}
                onRemove={() => removeFile(file.id)}
                onPreview={
                  file.preview
                    ? () => window.open(file.preview!, "_blank")
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// File item component
interface FileItemProps {
  name: string;
  size?: number;
  status: "uploading" | "success" | "error";
  progress?: number;
  error?: string;
  preview?: string;
  onRemove: () => void;
  onPreview?: () => void;
}

function FileItem({
  name,
  size,
  status,
  progress = 0,
  error,
  preview,
  onRemove,
  onPreview,
}: FileItemProps) {
  const isImage = preview || name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
      <div className="flex-shrink-0">
        {isImage ? (
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt=""
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <Image className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
            <File className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <div className="flex items-center gap-2 mt-1">
          {size && (
            <span className="text-xs text-muted-foreground">
              {formatFileSize(size)}
            </span>
          )}
          <StatusBadge status={status} />
        </div>

        {status === "uploading" && (
          <Progress value={progress} className="h-1 mt-2" />
        )}

        {status === "error" && error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {onPreview && status === "success" && (
          <Button type="button" variant="ghost" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({
  status,
}: {
  status: "uploading" | "success" | "error";
}) {
  switch (status) {
    case "uploading":
      return (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Uploading
        </Badge>
      );
    case "success":
      return (
        <Badge
          variant="default"
          className="bg-green-500 hover:bg-green-600 text-xs"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Succesvol
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Fout
        </Badge>
      );
  }
}

// Utility function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
