"use client";

import {
  Building,
  CreditCard,
  Download,
  Eye,
  FileText,
  Search,
  Send,
  Users,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

export function ProcessSection() {
  const { activeRole } = useRole();

  // Don't show process section when no role is selected
  if (!activeRole) {
    return (
      <section className="pt-16 lg:pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              HOE HET WERKT
            </h2>
            <p className="text-lg text-muted-foreground">
              Simpel proces voor iedereen - klaar in 3 stappen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Beveiligers Process */}
            <div className="text-center">
              <h3 className="text-xl font-bold mb-6 text-primary">
                Beveiligers
              </h3>

              <div className="space-y-8">
                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">App & WPBR</h4>
                  <p className="text-sm text-muted-foreground">
                    Download de app en verificeer je WPBR nummer
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Kies Shifts</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse en accepteer shifts die bij je passen
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">GPS Check-in</h4>
                  <p className="text-sm text-muted-foreground">
                    Check in met GPS, werk, en krijg binnen 24u betaald
                  </p>
                </div>
              </div>
            </div>

            {/* Bedrijven Process */}
            <div className="text-center">
              <h3 className="text-xl font-bold mb-6 text-primary">
                Beveiligingsbedrijven
              </h3>

              <div className="space-y-8">
                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Verificatie</h4>
                  <p className="text-sm text-muted-foreground">
                    KvK en WPBR bedrijfsverificatie
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Post Opdrachten</h4>
                  <p className="text-sm text-muted-foreground">
                    Plaats opdrachten en vind de juiste beveiligers
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Manage Team</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor live, beheer team en automatische facturatie
                  </p>
                </div>
              </div>
            </div>

            {/* Opdrachtgevers Process */}
            <div className="text-center">
              <h3 className="text-xl font-bold mb-6 text-primary">
                Opdrachtgevers
              </h3>

              <div className="space-y-8">
                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Maak Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Gratis account, geen verplichtingen
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Vraag Offerte</h4>
                  <p className="text-sm text-muted-foreground">
                    Ontvang offertes van gecertificeerde bedrijven
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Monitor Live</h4>
                  <p className="text-sm text-muted-foreground">
                    Track beveiligers live en betaal achteraf
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-16 lg:pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">HOE HET WERKT</h2>
          <p className="text-lg text-muted-foreground">
            {activeRole === "ZZP_BEVEILIGER" && "In 3 stappen aan het werk"}
            {activeRole === "BEDRIJF" && "Manage je team in 3 stappen"}
            {activeRole === "OPDRACHTGEVER" &&
              "Beveiliging regelen in 3 stappen"}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Beveiligers Process */}
          {activeRole === "ZZP_BEVEILIGER" && (
            <div className="text-center">
              <div className="space-y-8">
                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">App & WPBR</h4>
                  <p className="text-sm text-muted-foreground">
                    Download de app en verificeer je WPBR nummer
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Kies Shifts</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse en accepteer shifts die bij je passen
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">GPS Check-in</h4>
                  <p className="text-sm text-muted-foreground">
                    Check in met GPS, werk, en krijg binnen 24u betaald
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bedrijven Process */}
          {activeRole === "BEDRIJF" && (
            <div className="text-center">
              <div className="space-y-8">
                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Verificatie</h4>
                  <p className="text-sm text-muted-foreground">
                    KvK en WPBR bedrijfsverificatie
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Post Opdrachten</h4>
                  <p className="text-sm text-muted-foreground">
                    Plaats opdrachten en vind de juiste beveiligers
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Manage Team</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor live, beheer team en automatische facturatie
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Opdrachtgevers Process */}
          {activeRole === "OPDRACHTGEVER" && (
            <div className="text-center">
              <div className="space-y-8">
                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Maak Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Gratis account, geen verplichtingen
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Vraag Offerte</h4>
                  <p className="text-sm text-muted-foreground">
                    Ontvang offertes van gecertificeerde bedrijven
                  </p>
                </div>

                <div>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Monitor Live</h4>
                  <p className="text-sm text-muted-foreground">
                    Track beveiligers live en betaal achteraf
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
