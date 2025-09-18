"use client";

import { CheckCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialProps {
  name: string;
  location: string;
  role: string;
  rating: number;
  quote: string;
  testimonial: string;
  avatar?: string;
  stats?: {
    shiftsCompleted?: number;
    onTimePayment?: string;
    totalEarned?: string;
    employees?: number;
    monthsActive?: number;
  };
  isCompany?: boolean;
}

export function TestimonialCard({
  name,
  location,
  role,
  rating,
  quote,
  testimonial,
  avatar,
  stats,
  isCompany = false,
}: TestimonialProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">
            {isCompany ? (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="font-bold text-primary">LOGO</span>
              </div>
            ) : (
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {avatar || name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">
                  {location} • {role}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{quote}</span>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <blockquote className="text-foreground mb-4">
          "{testimonial}"
        </blockquote>

        {/* Stats */}
        {stats && (
          <div className="flex flex-wrap gap-3 text-xs">
            {stats.shiftsCompleted && (
              <Badge variant="secondary" className="space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{stats.shiftsCompleted} shifts afgerond</span>
              </Badge>
            )}
            {stats.onTimePayment && (
              <Badge variant="secondary" className="space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{stats.onTimePayment} op tijd betaald</span>
              </Badge>
            )}
            {stats.totalEarned && (
              <Badge variant="secondary" className="space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{stats.totalEarned} verdiend</span>
              </Badge>
            )}
            {stats.employees && (
              <Badge variant="secondary" className="space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{stats.employees} medewerkers</span>
              </Badge>
            )}
            {stats.monthsActive && (
              <Badge variant="secondary" className="space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{stats.monthsActive} maanden actief</span>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
