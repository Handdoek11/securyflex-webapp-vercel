"use client";

import {
  Apple,
  Building,
  Calendar,
  Clock,
  Euro,
  Eye,
  FileText,
  MapPin,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function AppDownloadSection() {
  const { activeRole } = useRole();

  // Role-specific content
  const roleContent = {
    ZZP_BEVEILIGER: {
      title: "JOUW WERKPLEK IN JE BROEKZAK",
      description:
        "Download de SecuryFlex app en start direct met werken. Vind shifts die bij je passen, check in met GPS en krijg binnen 24 uur betaald.",
      features: [
        {
          icon: MapPin,
          title: "GPS Check-in",
          description: "Automatische locatieverificatie voor je uren",
        },
        {
          icon: Euro,
          title: "Direct inzicht",
          description: "Real-time overzicht van je verdiensten",
        },
        {
          icon: Clock,
          title: "Flexibele shifts",
          description: "Kies zelf wanneer en waar je werkt",
        },
      ],
      stats: "2.847+ beveiligers werken al via de app",
    },
    BEDRIJF: {
      title: "COMPLETE TEAM MANAGEMENT",
      description:
        "Beheer je team, plan shifts en monitor alles real-time. Eén platform voor al je beveiligingsoperaties.",
      features: [
        {
          icon: Users,
          title: "Team Dashboard",
          description: "Overzicht van alle actieve beveiligers",
        },
        {
          icon: Calendar,
          title: "Smart Planning",
          description: "Automatische shift matching en planning",
        },
        {
          icon: FileText,
          title: "Digitale Facturatie",
          description: "Automatische urenregistratie en facturatie",
        },
      ],
      stats: "127+ bedrijven managen hun team via de app",
    },
    OPDRACHTGEVER: {
      title: "BEVEILIGING BINNEN HANDBEREIK",
      description:
        "Regel beveiliging binnen 5 minuten. Live tracking, digitale rapportages en transparante prijzen.",
      features: [
        {
          icon: Shield,
          title: "Instant Booking",
          description: "Beveiliging regelen binnen 5 minuten",
        },
        {
          icon: Eye,
          title: "Live Tracking",
          description: "Volg beveiligers real-time op de kaart",
        },
        {
          icon: FileText,
          title: "Digitale Rapportage",
          description: "Direct inzicht in alle beveiligingsactiviteiten",
        },
      ],
      stats: "500+ opdrachtgevers gebruiken onze app dagelijks",
    },
    null: {
      title: "ALLES IN ÉÉN APP",
      description:
        "Download de SecuryFlex app en ervaar hoe eenvoudig beveiliging kan zijn. Voor beveiligers, bedrijven én opdrachtgevers.",
      features: [
        {
          icon: Shield,
          title: "Voor Beveiligers",
          description: "Vind shifts, GPS check-in, digitale urenbriefjes",
        },
        {
          icon: Building,
          title: "Voor Beveiligingsbedrijven",
          description: "Team dashboard, planning tools, real-time monitoring",
        },
        {
          icon: Users,
          title: "Voor Opdrachtgevers",
          description: "Quick booking, live tracking, digitale rapportages",
        },
      ],
      stats: "10.000+ downloads met 4.8 ⭐ rating",
    },
  };

  const content =
    roleContent[activeRole || ("null" as keyof typeof roleContent)];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              {content.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {content.description}
            </p>

            <div className="space-y-4 mb-8">
              {content.features.map((feature: Feature, index: number) => (
                <div
                  key={index}
                  className="flex items-start justify-center lg:justify-start space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button size="lg" className="h-14 px-6">
                <Apple className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs opacity-80">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>

              <Button size="lg" className="h-14 px-6">
                <Smartphone className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs opacity-80">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              {content.stats}
            </p>
          </div>

          {/* App Screenshot Mockup */}
          <div className="relative">
            <div className="relative mx-auto max-w-sm">
              {/* Phone Frame */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-black rounded-[2.5rem] p-8 relative">
                  {/* Screen Content */}
                  <div className="bg-white rounded-[2rem] h-[600px] flex flex-col items-center justify-center">
                    <Image
                      src="/logo-website-securyflex.svg"
                      alt="SecuryFlex"
                      width={180}
                      height={60}
                      className="mb-4"
                      loading="lazy"
                    />
                    <p className="text-gray-600 mt-2">Security Platform</p>

                    {/* Mock UI Elements */}
                    <div className="mt-8 space-y-3 w-full px-8">
                      <div className="h-12 bg-primary/10 rounded-lg"></div>
                      <div className="h-12 bg-primary/10 rounded-lg"></div>
                      <div className="h-12 bg-primary rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-bounce">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium">GPS Active</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium">€28/uur</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
