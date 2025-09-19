"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImageProps, "loading"> {
  loading?: "lazy" | "eager";
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  loading = "lazy",
  fallback,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        loading={loading}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className,
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </div>
  );
}

interface LazyImageWithPlaceholderProps extends LazyImageProps {
  placeholderSize?: "sm" | "md" | "lg";
}

export function LazyImageWithPlaceholder({
  placeholderSize = "md",
  className,
  ...props
}: LazyImageWithPlaceholderProps) {
  const sizeClasses = {
    sm: "h-24 w-24",
    md: "h-48 w-48",
    lg: "h-64 w-64",
  };

  return (
    <LazyImage
      className={cn(sizeClasses[placeholderSize], className)}
      fallback={
        <div
          className={cn(
            "bg-gray-100 rounded flex items-center justify-center",
            sizeClasses[placeholderSize],
          )}
        >
          <span className="text-gray-400 text-sm">Image not available</span>
        </div>
      }
      {...props}
    />
  );
}
