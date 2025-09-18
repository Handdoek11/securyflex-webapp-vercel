"use client";

import {
  Award,
  Building,
  CheckCircle,
  Clock,
  Euro,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

export function TrustBar() {
  const { activeRole } = useRole();

  // Role-specific trust signals
  const trustSignals = {
    ZZP_BEVEILIGER: [
      { icon: Euro, text: "€3.200+ gemiddeld per maand" },
      { icon: Clock, text: "Betaald binnen 24 uur" },
      { icon: CheckCircle, text: "2.847+ actieve beveiligers" },
      { icon: Shield, text: "WPBR Gecertificeerd platform" },
    ],
    BEDRIJF: [
      { icon: Building, text: "127+ beveiligingsbedrijven" },
      { icon: Users, text: "10.000+ opdrachten gematcht" },
      { icon: Shield, text: "ISO 27001 Compliant" },
      { icon: Award, text: "FD Gazellen 2024" },
    ],
    OPDRACHTGEVER: [
      { icon: Clock, text: "Beveiliging binnen 5 minuten" },
      { icon: Shield, text: "100% WPBR gecertificeerd" },
      { icon: Star, text: "4.8 uit 2.847 reviews" },
      { icon: CheckCircle, text: "Betaal achteraf op factuur" },
    ],
    null: [
      { icon: CheckCircle, text: "WPBR Gecertificeerd" },
      { icon: Shield, text: "ISO 27001 Compliant" },
      { icon: Star, text: "4.8 uit 2.847 reviews", hasStars: true },
      { icon: Award, text: "FD Gazellen 2024" },
    ],
  };

  const signals = trustSignals[activeRole || "null"];

  return (
    <section className="bg-primary/5 border-y">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
          {signals.map((signal, index) => (
            <div
              key={`trust-signal-${signal.text.substring(0, 10)}-${index}`}
              className="flex items-center space-x-2"
            >
              {signal.hasStars ? (
                <>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={`star-${i}`}
                        className={`h-4 w-4 ${
                          i < 4
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{signal.text}</span>
                </>
              ) : (
                <>
                  <signal.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{signal.text}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
