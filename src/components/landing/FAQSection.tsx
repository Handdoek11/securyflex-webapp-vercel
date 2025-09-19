"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  answer: string;
}

const faqContent = {
  ZZP_BEVEILIGER: [
    {
      question: "Hoeveel kan ik verdienen als beveiliger?",
      answer:
        "Gemiddeld verdien je €28 per uur, met specialisaties tot €35 per uur. Fulltime beveiligers verdienen €3.200+ per maand. Je wordt binnen 24 uur uitbetaald.",
    },
    {
      question: "Welke documenten heb ik nodig?",
      answer:
        "Je hebt een geldig WPBR-nummer nodig en een Nederlandse ID. Wij verifiëren je documenten binnen 2 uur tijdens kantooruren.",
    },
    {
      question: "Hoe werkt GPS check-in?",
      answer:
        "Open de app op locatie, druk op 'Check In' en je GPS-locatie wordt automatisch geverifieerd. Dit dient als bewijs voor gewerkte uren.",
    },
    {
      question: "Kan ik mijn eigen uren kiezen?",
      answer:
        "Ja, volledig flexibel! Kies shifts die bij je passen. Geen minimum uren vereist. Je bent volledig vrij om te werken wanneer je wilt.",
    },
    {
      question: "Hoe snel word ik betaald?",
      answer:
        "Binnen 24 uur na goedkeuring van je uren staat het geld op je rekening. Automatische facturatie wordt voor je geregeld.",
    },
  ],
  BEDRIJF: [
    {
      question: "Hoeveel kost SecuryFlex voor bedrijven?",
      answer:
        "Geen abonnementskosten, je betaalt alleen €2,99 per gewerkt uur. Transparante prijzen zonder verborgen kosten.",
    },
    {
      question: "Hoe snel kan ik beveiligers vinden?",
      answer:
        "Gemiddeld binnen 15 minuten respons. Voor urgente opdrachten vaak binnen 5 minuten. Toegang tot 2.847+ actieve beveiligers.",
    },
    {
      question: "Wie is verantwoordelijk voor de beveiligers?",
      answer:
        "Beveiligers werken als ZZP'er, geen werkgeversrisico voor jou. Alle beveiligers zijn WPBR gecertificeerd en verzekerd.",
    },
    {
      question: "Hoe werkt de facturatie?",
      answer:
        "Automatische facturatie na elke opdracht. Één verzamelfactuur per maand mogelijk. Betaaltermijn naar keuze (14, 30 of 60 dagen).",
    },
    {
      question: "Kan ik mijn eigen team ook inzetten?",
      answer:
        "Ja, gebruik SecuryFlex als aanvulling op je vaste team. Perfect voor piekuren, ziekte of grote opdrachten.",
    },
  ],
  OPDRACHTGEVER: [
    {
      question: "Hoe snel kan ik beveiliging regelen?",
      answer:
        "Binnen 5 minuten voor standaard opdrachten. Voor complexe opdrachten binnen 30 minuten. Direct beschikbaar 24/7.",
    },
    {
      question: "Wat kost beveiliging per uur?",
      answer:
        "Vanaf €32 per uur all-in. Geen extra kosten. Transparante prijzen vooraf bekend. Volume kortingen mogelijk.",
    },
    {
      question: "Zijn alle beveiligers gecertificeerd?",
      answer:
        "100% WPBR gecertificeerd. Alle documenten geverifieerd. Continue kwaliteitscontrole. Verzekerd via SecuryFlex.",
    },
    {
      question: "Hoe werkt live GPS tracking?",
      answer:
        "Real-time locatie van beveiligers op je dashboard. Automatische check-in/out registratie. Digitale rapportages direct beschikbaar.",
    },
    {
      question: "Kan ik op rekening betalen?",
      answer:
        "Ja, betaal achteraf op factuur. Betaaltermijn 14 dagen standaard. Maandelijkse verzamelfactuur mogelijk.",
    },
  ],
  null: [
    {
      question: "Wat is SecuryFlex?",
      answer:
        "SecuryFlex is het platform dat beveiligers, beveiligingsbedrijven en opdrachtgevers direct met elkaar verbindt. Simpel, transparant en betrouwbaar.",
    },
    {
      question: "Voor wie is SecuryFlex?",
      answer:
        "Voor ZZP beveiligers die flexibel willen werken, beveiligingsbedrijven die willen opschalen, en opdrachtgevers die snel beveiliging nodig hebben.",
    },
    {
      question: "Hoe werkt het platform?",
      answer:
        "Meld je aan voor jouw rol, doorloop de verificatie, en start direct. Alles via één gebruiksvriendelijke app en dashboard.",
    },
  ],
};

export function FAQSection() {
  const { activeRole } = useRole();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = faqContent[activeRole || ("null" as keyof typeof faqContent)];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              VEELGESTELDE VRAGEN
            </h2>
            <p className="text-lg text-muted-foreground">
              {activeRole === "ZZP_BEVEILIGER" &&
                "Alles wat je moet weten om te starten"}
              {activeRole === "BEDRIJF" && "Voor beveiligingsbedrijven"}
              {activeRole === "OPDRACHTGEVER" && "Voor opdrachtgevers"}
              {!activeRole && "Antwoorden op jouw vragen"}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq: FAQ, index: number) => (
              <div
                key={`faq-${faq.question.substring(0, 20)}-${index}`}
                className="bg-white rounded-lg border overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      openIndex === index && "rotate-180",
                    )}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Nog vragen? We helpen je graag!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline">Chat met ons</Button>
              <Button variant="outline">Bel 020-123-4567</Button>
              <Button variant="outline">support@securyflex.nl</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
