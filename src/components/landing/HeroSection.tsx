"use client";

import { Button } from "@/components/ui/button";
import { Shield, Building2, Factory, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRole, RoleDisplayNames } from "@/contexts/RoleContext";

export function HeroSection() {
  const { activeRole } = useRole();

  // Dynamic content based on role with enhanced value propositions
  const roleContent = {
    ZZP_BEVEILIGER: {
      title: "VERDIEN €3.200+ EXTRA PER MAAND",
      subtitle: "Join 2.847+ beveiligers die al flexibel werken via SecuryFlex",
      stats: {
        main: "€28",
        mainLabel: "per uur",
        secondary: "24u",
        secondaryLabel: "betaling"
      },
      benefits: [
        "Kies je eigen werktijden",
        "Werk bij top locaties",
        "GPS check-in = bewijs",
        "Automatische facturatie"
      ],
      cta: { text: "Start direct", href: "/beveiligers", secondary: "Bekijk beschikbare shifts" }
    },
    BEDRIJF: {
      title: "DIRECT TOEGANG TOT 2.847+ BEVEILIGERS",
      subtitle: "Schaal je team op en neer zonder vast personeel",
      stats: {
        main: "2.847+",
        mainLabel: "beveiligers",
        secondary: "15min",
        secondaryLabel: "responstijd"
      },
      benefits: [
        "Geen werkgeversrisico",
        "Automatische planning",
        "Real-time GPS monitoring",
        "Directe facturatie"
      ],
      cta: { text: "Vraag demo aan", href: "/beveiligingsbedrijven", secondary: "Bereken je besparing" }
    },
    OPDRACHTGEVER: {
      title: "BEVEILIGING BINNEN 5 MINUTEN GEREGELD",
      subtitle: "Gecertificeerde beveiligers wanneer je ze nodig hebt",
      stats: {
        main: "5min",
        mainLabel: "geregeld",
        secondary: "100%",
        secondaryLabel: "WPBR gecertificeerd"
      },
      benefits: [
        "Direct beschikbaar",
        "Vaste uurtarieven",
        "Live GPS tracking",
        "Betaal achteraf"
      ],
      cta: { text: "Boek beveiliging", href: "/opdrachtgevers", secondary: "Bereken kosten" }
    },
    null: {
      title: "BEVEILIGING ZONDER GEDOE",
      subtitle: "Het platform dat beveiligers, bedrijven en opdrachtgevers verbindt",
      stats: null,
      benefits: [],
      cta: null
    }
  };

  const content = roleContent[activeRole || "null"];

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            {content.title}
          </h1>

          <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            {content.subtitle}
          </p>

          {/* Show enhanced content for selected role or path cards */}
          {activeRole ? (
            <div className="max-w-3xl mx-auto mb-12">
              {/* Stats Display */}
              {content.stats && (
                <div className="flex justify-center gap-12 mb-8">
                  <div className="text-center">
                    <div className="text-4xl lg:text-5xl font-bold text-primary">{content.stats.main}</div>
                    <div className="text-sm text-muted-foreground mt-1">{content.stats.mainLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl lg:text-5xl font-bold text-primary">{content.stats.secondary}</div>
                    <div className="text-sm text-muted-foreground mt-1">{content.stats.secondaryLabel}</div>
                  </div>
                </div>
              )}

              {/* Benefits Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="grid sm:grid-cols-2 gap-4">
                  {content.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-left">{benefit}</span>
                    </div>
                  ))}
                </div>
                {content.cta && (
                  <div className="mt-8 space-y-3">
                    <Link href={content.cta.href}>
                      <Button size="lg" className="w-full">
                        {content.cta.text} <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    {content.cta.secondary && (
                      <Button variant="outline" size="lg" className="w-full">
                        {content.cta.secondary}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* User Path Cards */
            <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/beveiligers">
              <div className="group cursor-pointer bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Ik ben Beveiliger</h3>
                <p className="text-muted-foreground mb-4 flex-grow">
                  Vind shifts, werk flexibel en krijg snel betaald
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  Start als beveiliger →
                </span>
              </div>
            </Link>

            <Link href="/beveiligingsbedrijven">
              <div className="group cursor-pointer bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Wij zijn een Beveiligingsbedrijf</h3>
                <p className="text-muted-foreground mb-4 flex-grow">
                  Manage je team en win meer opdrachten
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  Vraag demo aan →
                </span>
              </div>
            </Link>

            <Link href="/opdrachtgevers">
              <div className="group cursor-pointer bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Factory className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Ik zoek Beveiliging</h3>
                <p className="text-muted-foreground mb-4 flex-grow">
                  Boek direct betrouwbare beveiligers
                </p>
                <span className="text-primary font-medium group-hover:underline">
                  Vraag offerte aan →
                </span>
              </div>
            </Link>
            </div>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">2.847+</span>
              <span>actieve beveiligers</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">127+</span>
              <span>beveiligingsbedrijven</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">500+</span>
              <span>opdrachten per week</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}