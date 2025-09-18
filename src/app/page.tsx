"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AppDownloadSection } from "@/components/landing/AppDownloadSection";
import { EarningsCalculator } from "@/components/landing/EarningsCalculator";
import { FAQSection } from "@/components/landing/FAQSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LiveShiftTicker } from "@/components/landing/LiveShiftTicker";
import { Navigation } from "@/components/landing/Navigation";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { TrustBar } from "@/components/landing/TrustBar";
import { DynamicMetadata } from "@/components/seo/DynamicMetadata";
import { RoleSpecificSchema } from "@/components/seo/SchemaMarkup";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";

function HomeContent() {
  const { activeRole, setActiveRole } = useRole();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  // Auto-set role based on URL parameter for SEO
  useEffect(() => {
    if (roleParam === "beveiligers") {
      setActiveRole("ZZP_BEVEILIGER");
    } else if (roleParam === "beveiligingsbedrijven") {
      setActiveRole("BEDRIJF");
    } else if (roleParam === "opdrachtgevers") {
      setActiveRole("OPDRACHTGEVER");
    }
    // If no role parameter, keep current role or default (null)
  }, [roleParam, setActiveRole]);

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic SEO Metadata */}
      <DynamicMetadata />

      {/* Role-Specific SEO Schema Markup */}
      <RoleSpecificSchema role={roleParam} />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section with User Paths */}
      <HeroSection />

      {/* Live Shift Ticker - Only for Beveiligers */}
      {activeRole === "ZZP_BEVEILIGER" && <LiveShiftTicker />}

      {/* Trust Bar */}
      <TrustBar />

      {/* How It Works - 3 Column Process */}
      <ProcessSection />

      {/* Earnings Calculator - Only for Beveiligers */}
      {activeRole === "ZZP_BEVEILIGER" && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <EarningsCalculator />
          </div>
        </section>
      )}

      {/* Benefits Section - Only show when no role is selected */}
      {!activeRole && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                WAAROM SECURYFLEX?
              </h2>
              <p className="text-lg text-muted-foreground">
                Het platform dat de beveiligingsbranche transformeert
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Voor Beveiligers */}
              <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col h-full">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    Voor Beveiligers
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Gemiddeld €28/uur verdienen
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Flexibel werken wanneer je wilt
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Betaald binnen 24 uur</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">GPS check-in voor bewijs</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Automatische facturatie</span>
                    </li>
                  </ul>
                </div>
                <Link href="/?role=beveiligers" className="mt-auto">
                  <Button className="w-full">
                    Start als beveiliger <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Voor Beveiligingsbedrijven */}
              <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col h-full">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    Voor Beveiligingsbedrijven
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Complete team management</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Automatische planning tools
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Real-time monitoring</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Directe facturatie</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Win meer opdrachten</span>
                    </li>
                  </ul>
                </div>
                <Link href="/?role=beveiligingsbedrijven" className="mt-auto">
                  <Button className="w-full">
                    Vraag demo aan <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Voor Opdrachtgevers */}
              <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col h-full">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    Voor Opdrachtgevers
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Beveiliging binnen 5 minuten
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Transparante prijzen</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Live GPS tracking</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Digitale rapportages</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Betaal achteraf</span>
                    </li>
                  </ul>
                </div>
                <Link href="/?role=opdrachtgevers" className="mt-auto">
                  <Button className="w-full">
                    Vraag offerte aan <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* App Download Section */}
      <AppDownloadSection />

      {/* Testimonials - Show relevant testimonials per role */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {activeRole === "ZZP_BEVEILIGER" && "WAT BEVEILIGERS ZEGGEN"}
              {activeRole === "BEDRIJF" && "WAT BEDRIJVEN ZEGGEN"}
              {activeRole === "OPDRACHTGEVER" && "WAT KLANTEN ZEGGEN"}
              {!activeRole && "WAT GEBRUIKERS ZEGGEN"}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Show testimonials based on role or all if no role selected */}
            {(activeRole === "ZZP_BEVEILIGER" || !activeRole) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center space-x-2 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm mb-4">
                  "Van €1.800 naar €3.200 per maand. GPS check-in werkt perfect,
                  betaling altijd op tijd."
                </p>
                <div>
                  <p className="font-semibold">Mark van den Berg</p>
                  <p className="text-sm text-muted-foreground">
                    ZZP Beveiliger, Amsterdam
                  </p>
                </div>
              </div>
            )}

            {(activeRole === "BEDRIJF" || !activeRole) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center space-x-2 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm mb-4">
                  "Platform geeft toegang tot gekwalificeerde ZZP'ers. We winnen
                  nu 3x meer opdrachten."
                </p>
                <div>
                  <p className="font-semibold">SecureForce B.V.</p>
                  <p className="text-sm text-muted-foreground">
                    45 medewerkers, Rotterdam
                  </p>
                </div>
              </div>
            )}

            {(activeRole === "OPDRACHTGEVER" || !activeRole) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center space-x-2 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm mb-4">
                  "Binnen 2 uur hadden we beveiliging geregeld voor ons
                  evenement. Top service!"
                </p>
                <div>
                  <p className="font-semibold">EventPlaza Utrecht</p>
                  <p className="text-sm text-muted-foreground">Opdrachtgever</p>
                </div>
              </div>
            )}

            {/* Add more role-specific testimonials when a role is selected */}
            {activeRole === "ZZP_BEVEILIGER" && (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-2 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "Flexibiliteit is top! Ik werk wanneer ik wil en verdien
                    €28-35 per uur. Perfecte bijbaan naast mijn studie."
                  </p>
                  <div>
                    <p className="font-semibold">Sarah de Vries</p>
                    <p className="text-sm text-muted-foreground">
                      Parttime Beveiliger, Utrecht
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-2 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "Automatische facturatie scheelt me uren werk per week. Kan
                    me nu focussen op het echte werk."
                  </p>
                  <div>
                    <p className="font-semibold">Ahmed Hassan</p>
                    <p className="text-sm text-muted-foreground">
                      Fulltime Beveiliger, Den Haag
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeRole === "BEDRIJF" && (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-2 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "Perfecte aanvulling op ons vaste team. Bij piekuren
                    schakelen we direct extra ZZP'ers in."
                  </p>
                  <div>
                    <p className="font-semibold">Elite Security</p>
                    <p className="text-sm text-muted-foreground">
                      25 medewerkers, Eindhoven
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-2 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "Real-time GPS monitoring geeft rust. We weten exact waar
                    onze mensen zijn en klanten waarderen de transparantie."
                  </p>
                  <div>
                    <p className="font-semibold">ProGuard Solutions</p>
                    <p className="text-sm text-muted-foreground">
                      60+ medewerkers, Amsterdam
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeRole === "OPDRACHTGEVER" && (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-2 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "Voor ons bouwproject hadden we direct 5 beveiligers nodig.
                    Binnen een uur geregeld!"
                  </p>
                  <div>
                    <p className="font-semibold">BAM Bouw</p>
                    <p className="text-sm text-muted-foreground">
                      Projectmanager
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-2 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "Transparante prijzen en geen verrassingen achteraf. Exact
                    wat we zochten voor onze winkelketen."
                  </p>
                  <div>
                    <p className="font-semibold">Retail Group Nederland</p>
                    <p className="text-sm text-muted-foreground">
                      Facility Manager
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          {activeRole === "ZZP_BEVEILIGER" ? (
            <>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                START VANDAAG MET VERDIENEN
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                Join 2.847+ beveiligers die gemiddeld €3.200 extra per maand
                verdienen
              </p>
              <Link href="/?role=beveiligers#registreren">
                <Button size="lg" variant="secondary" className="text-primary">
                  Start direct →
                </Button>
              </Link>
            </>
          ) : activeRole === "BEDRIJF" ? (
            <>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                SCHAAL UW BEDRIJF OP
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                Join 127+ beveiligingsbedrijven die flexibel opschalen met
                SecuryFlex
              </p>
              <Link href="/?role=beveiligingsbedrijven#demo">
                <Button size="lg" variant="secondary" className="text-primary">
                  Vraag demo aan →
                </Button>
              </Link>
            </>
          ) : activeRole === "OPDRACHTGEVER" ? (
            <>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                REGEL DIRECT BEVEILIGING
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                500+ opdrachtgevers regelen hun beveiliging binnen 5 minuten
              </p>
              <Link href="/?role=opdrachtgevers#offerte">
                <Button size="lg" variant="secondary" className="text-primary">
                  Vraag offerte aan →
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                KLAAR OM TE STARTEN?
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                Join 2.847+ beveiligers en 127+ bedrijven die al gebruik maken
                van SecuryFlex
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/?role=beveiligers">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary"
                  >
                    Ik ben beveiliger
                  </Button>
                </Link>
                <Link href="/?role=beveiligingsbedrijven">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary"
                  >
                    Wij zijn een beveiligingsbedrijf
                  </Button>
                </Link>
                <Link href="/?role=opdrachtgevers">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary"
                  >
                    Ik zoek beveiliging
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Voor Beveiligers - altijd tonen met conditional styling */}
            <div
              className={
                activeRole && activeRole !== "ZZP_BEVEILIGER"
                  ? "opacity-40 transition-opacity"
                  : "transition-opacity"
              }
            >
              <h3
                className={`font-bold mb-4 ${activeRole === "ZZP_BEVEILIGER" ? "text-primary" : ""}`}
              >
                Voor Beveiligers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/?role=beveiligers"
                    className={`hover:text-primary ${activeRole === "ZZP_BEVEILIGER" ? "font-medium" : ""}`}
                  >
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=beveiligers#app"
                    className="hover:text-primary"
                  >
                    Download app
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=beveiligers#verdiensten"
                    className="hover:text-primary"
                  >
                    Verdiensten
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=beveiligers#faq"
                    className="hover:text-primary"
                  >
                    Veelgestelde vragen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=beveiligers#registreren"
                    className="hover:text-primary"
                  >
                    Start direct
                  </Link>
                </li>
              </ul>
            </div>

            {/* Voor Beveiligingsbedrijven - altijd tonen met conditional styling */}
            <div
              className={
                activeRole && activeRole !== "BEDRIJF"
                  ? "opacity-40 transition-opacity"
                  : "transition-opacity"
              }
            >
              <h3
                className={`font-bold mb-4 ${activeRole === "BEDRIJF" ? "text-primary" : ""}`}
              >
                Voor Bedrijven
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/?role=beveiligingsbedrijven"
                    className={`hover:text-primary ${activeRole === "BEDRIJF" ? "font-medium" : ""}`}
                  >
                    Platform
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=beveiligingsbedrijven#demo"
                    className="hover:text-primary"
                  >
                    Demo aanvragen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=beveiligingsbedrijven#pricing"
                    className="hover:text-primary"
                  >
                    Prijzen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=beveiligingsbedrijven#features"
                    className="hover:text-primary"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=beveiligingsbedrijven#cases"
                    className="hover:text-primary"
                  >
                    Succesverhalen
                  </Link>
                </li>
              </ul>
            </div>

            {/* Voor Opdrachtgevers - altijd tonen met conditional styling */}
            <div
              className={
                activeRole && activeRole !== "OPDRACHTGEVER"
                  ? "opacity-40 transition-opacity"
                  : "transition-opacity"
              }
            >
              <h3
                className={`font-bold mb-4 ${activeRole === "OPDRACHTGEVER" ? "text-primary" : ""}`}
              >
                Voor Opdrachtgevers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/?role=opdrachtgevers"
                    className={`hover:text-primary ${activeRole === "OPDRACHTGEVER" ? "font-medium" : ""}`}
                  >
                    Beveiliging inhuren
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=opdrachtgevers#branches"
                    className="hover:text-primary"
                  >
                    Branches
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=opdrachtgevers#tarieven"
                    className="hover:text-primary"
                  >
                    Tarieven
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=opdrachtgevers#offerte"
                    className="hover:text-primary"
                  >
                    Offerte aanvragen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?role=opdrachtgevers#tracking"
                    className="hover:text-primary"
                  >
                    Live Tracking
                  </Link>
                </li>
              </ul>
            </div>

            {/* SecuryFlex algemeen - altijd volledig zichtbaar */}
            <div>
              <h3 className="font-bold mb-4">SecuryFlex</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/over-ons" className="hover:text-primary">
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/voorwaarden" className="hover:text-primary">
                    Voorwaarden
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-primary">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 SecuryFlex B.V. • KvK: 87654321 • WPBR: 12345</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}
