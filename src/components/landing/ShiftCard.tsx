"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users } from "lucide-react";

interface ShiftCardProps {
  title: string;
  location: string;
  rate: string;
  time: string;
  spotsLeft: number;
  type: string;
  urgent?: boolean;
  requirements?: string;
}

export function ShiftCard({
  title,
  location,
  rate,
  time,
  spotsLeft,
  type,
  urgent = false,
  requirements,
}: ShiftCardProps) {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 ${
      urgent ? "border-accent ring-2 ring-accent/20 animate-pulse" : ""
    }`}>
      {urgent && (
        <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-2 py-1 text-xs font-semibold rounded-bl-md">
          URGENT
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{time}</CardTitle>
            <CardDescription className="text-base font-medium text-foreground">
              {title}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">{rate}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className={spotsLeft <= 2 ? "text-accent font-medium" : "text-muted-foreground"}>
              {spotsLeft} {spotsLeft === 1 ? "plek" : "plekken"}
            </span>
          </div>
          <Badge variant="secondary">{type}</Badge>
        </div>

        {requirements && (
          <div className="text-xs text-muted-foreground">
            Vereist: {requirements}
          </div>
        )}

        <Button
          className="w-full"
          variant={urgent ? "default" : "outline"}
        >
          {urgent ? "SOLLICITEER NU →" : "BEKIJK DETAILS →"}
        </Button>
      </CardContent>
    </Card>
  );
}