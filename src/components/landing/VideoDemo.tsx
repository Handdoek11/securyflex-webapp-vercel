"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VideoDemoProps {
  title?: string;
  duration?: string;
  thumbnail?: string;
  description?: string;
  className?: string;
}

export function VideoDemo({
  title = "Zo werkt GPS check-in",
  duration = "2:17",
  thumbnail,
  description = "98.5% beveiligers krijgen betaald binnen 23.2 uur",
  className = "",
}: VideoDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    // In a real app, this would trigger the video to play
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  if (isPlaying) {
    return (
      <Card className={`relative ${className}`}>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {/* Video placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <div className="text-center text-white">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
                <p className="text-lg font-semibold">Demo Video Playing</p>
                <p className="text-sm opacity-75">{title}</p>
              </div>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white hover:bg-black/20"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Progress bar (mock) */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <div className="w-full bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full w-1/3"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${className}`}
      onClick={handlePlay}
    >
      <CardContent className="p-4">
        <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden mb-4">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Beveiliger met app
                </p>
              </div>
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <Play className="h-6 w-6 text-primary ml-1" />
            </div>
          </div>

          {/* Duration badge */}
          <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
            ▶️ {duration}
          </Badge>
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
