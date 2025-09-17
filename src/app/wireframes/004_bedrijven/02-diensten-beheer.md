# Opdrachten Beheer - Security Service Requests

## Overzicht
Het Opdrachten Beheer systeem is het centrale platform voor bedrijven en organisaties om beveiligingsdiensten aan te vragen. Hier plaatsen klanten opdrachten in de marketplace, ontvangen ze offertes van beveiligingsbedrijven en ZZP'ers, en monitoren ze de uitvoering van hun beveiligingsdiensten.

## Functionaliteit
- **Opdracht plaatsen**: Eenvoudig nieuwe beveiligingsopdrachten aanmaken
- **Offerte vergelijking**: Ontvang en vergelijk offertes van meerdere aanbieders
- **Aanbieder selectie**: Kies de beste beveiligingsbedrijf of ZZP'er
- **Live monitoring**: Real-time GPS tracking van ingezette beveiligers
- **Incident rapportage**: Ontvang en bekijk incidentrapporten
- **Service historie**: Overzicht van alle afgeronde opdrachten

## Key Features
- **Marketplace integratie**: Opdrachten worden zichtbaar voor alle beveiligingsbedrijven en ZZP'ers
- **GPS tracking**: Live locatie monitoring van beveiligers tijdens dienst
- **Offerte systeem**: Transparante prijsvergelijking tussen aanbieders
- **Incident management**: Real-time incident notificaties en rapportage
- **Service rating**: Beoordeel beveiligingsdiensten na afloop

---

## 🖥️ Desktop Versie (1024px+) - Primary Interface

### Diensten Overzicht
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  SecuryFlex Klanten Portal                                                                      🔔 3  👤 Klant Portal    [Support] [Uitloggen]              │
├─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                 │                                                                                                                             │
│  📊 DASHBOARD                   │                                    📋 OPDRACHTEN BEHEER                                                                    │
│  📋 OPDRACHTEN            ●     │                                                                                                                             │
│    ├── Actieve Opdrachten       │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    ├── Offertes Ontvangen       │  │ [🔍 Zoeken...] [📅 Datum Filter] [📍 Locatie Filter] [💰 Budget Filter] [+ Nieuwe Opdracht] [📊 Export]        │   │
│    ├── In Uitvoering            │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│    └── Historie                 │                                                                                                                             │
│  💬 BERICHTEN                   │  📋 MIJN OPDRACHTEN (12)                 [Alle] [Actief] [Offertes] [Afgerond]                                          │
│    ├── Inbox                    │                                                                                                                             │
│    ├── Conversaties             │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    └── Notificaties             │  │ 🔴 URGENT │ Kantoor Beveiliging Zuidas                   │ 06:00-18:00 │ 3 Offertes           │ ⏰ Start morgen  │   │
│  💰 FINANCIËN                   │  │            │ 2 beveiligers nodig                          │ Ma-Vr       │ €22-28/uur           │ [Bekijk] [Kies]  │   │
│    ├── Facturen                 │  │            │ 📍 Zuidas, Amsterdam                          │             │ 5 dagen              │ [Contact]        │   │
│    ├── Betalingen               │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│    └── Overzicht                │                                                                                                                             │
│  🏢 LOCATIES                    │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│    ├── Hoofdkantoor             │  │ 🟢 ACTIEF │ Event Beveiliging - Product Launch            │ 14:00-22:00 │ SecuPro B.V.         │ ✅ Bevestigd     │   │
│    ├── Filialen                 │  │            │ 4 beveiligers ingezet                        │ Vandaag     │ €25/uur × 32h        │ [GPS Tracking]   │   │
│    └── Evenementen              │  │            │ 📍 RAI Amsterdam                              │             │ Totaal: €800         │ [Contact]        │   │
│  📊 RAPPORTEN                   │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│  ⚙️ INSTELLINGEN                │                                                                                                                             │
│                                 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  ────────────────────────       │  │ 🟡 OFFERTES│ Station Surveillance                          │ 10:00-18:00 │ 5 Offertes           │ 📝 Selecteren    │   │
│                                 │  │            │ 3 beveiligers gezocht                        │ Weekend     │ €18-24/uur           │ [Vergelijk]      │   │
│  📈 OPDRACHT STATS              │  │            │ 📍 Centraal Station, Utrecht                 │             │ Beste: SafeGuard     │ [Details]        │   │
│                                 │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│  ────────────────────────       │                                                                                                                             │
│                                 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  📈 OPDRACHT STATS              │  │ 🟠 WACHTEND│ Beurs Beveiliging                            │ 08:00-20:00 │ Wacht op offertes   │ 📝 Nieuw         │   │
│  • 12 actieve opdrachten       │  │            │ 8 beveiligers nodig voor 3 dagen             │ 3-5 Dec     │ Budget: €5,000       │ [Edit]           │   │
│  • 28 offertes ontvangen       │  │            │ 📍 Jaarbeurs Utrecht                         │             │ 0 reacties           │ [Promoot]        │   │
│  • 95% tevredenheid            │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│  • €18.5k deze maand           │                                                                                                                             │
│                                 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  🎯 DEZE MAAND                  │  │ ✅ AFGEROND│ Winkelcentrum Beveiliging                    │ Afgelopen   │ ZZP Jan de Vries     │ ⭐⭐⭐⭐⭐        │   │
│  Opdrachten geplaatst: 15      │  │            │ Uitstekende service, zeer tevreden           │ 18-20 Nov   │ €960 totaal          │ [Factuur]        │   │
│  Gemiddelde respons: 4.2       │  │            │ 📍 Stadshart Amstelveen                      │             │ Betaald via Finqle   │ [Herhaal]        │   │
│  Besparing: €2,340 (12%)       │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                 │                                                                                                                             │
│                                 │  [⬅️ Vorige] [1] [2] [3] [4] [5] [➡️ Volgende]    Toon 5 van 47 diensten                                              │
│                                 │                                                                                                                             │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Nieuwe Dienst Aanmaken - Step 1: Basis Informatie
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [← Terug naar Diensten]                           💼 NIEUWE DIENST AANMAKEN                                   Stap 1 van 5: Basis Informatie              │
├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                               📋 DIENST INFORMATIE                                                                                     │ │
│  │                                                                                                                                                         │ │
│  │  🏢 KLANT SELECTIE                                          📍 LOCATIE DETAILS                                                                        │ │
│  │                                                                                                                                                         │ │
│  │  Bestaande Klant: [Ajax Entertainment          ▼]           Locatie Naam: [Ajax Arena Champions League Event     ]                                    │ │
│  │                                                               Adres: [Arena Boulevard 1                          ]                                    │ │
│  │  ☐ Nieuwe klant toevoegen                                   Postcode: [1101 AX    ] Plaats: [Amsterdam          ]                                    │ │
│  │                                                                                                                                                         │ │
│  │  Contact Persoon: [Jan Vermeulen               ]            GPS Coördinaten: [Auto-detecteren] [Handmatig invoeren]                                  │ │
│  │  Telefoon: [+31 20 311 1333                   ]            Radius Check-in: [100] meter                                                              │ │
│  │  Email: [j.vermeulen@ajax.nl                   ]                                                                                                       │ │
│  │                                                               🗺️ [Toon op Kaart]                                                                      │ │
│  │  ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── │ │
│  │                                                                                                                                                         │ │
│  │  📅 DIENST PLANNING                                          💰 FINANCIËLE DETAILS                                                                   │ │
│  │                                                                                                                                                         │ │
│  │  Dienst Type: [Event Beveiliging              ▼]           Klant Tarief: [€25,00] per uur                                                            │ │
│  │  Start Datum: [28-11-2024                     ]             Professional Tarief: [€18,00] per uur                                                    │ │
│  │  Start Tijd: [14:00]    Eind Tijd: [22:00    ]             Marge: €7,00 per uur (28%)                                                                │ │
│  │                                                                                                                                                         │ │
│  │  ☑️ Herhalende dienst                                       Geschatte Kosten: €144 (8h × 1 professional)                                            │ │
│  │    └── Elke [Week ▼] op [Woensdag ▼]                      Klant Totaal: €200                                                                         │ │
│  │                                                               Verwachte Marge: €56                                                                     │ │
│  │  Eind Datum Herhaling: [31-12-2024           ]                                                                                                         │ │
│  │                                                               💳 Facturatie: [Per dienst ▼] [Credit Check: ✅]                                      │ │
│  │  ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── │ │
│  │                                                                                                                                                         │ │
│  │  📝 DIENST BESCHRIJVING                                                                                                                                │ │
│  │                                                                                                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ Champions League wedstrijd Ajax vs Barcelona. Verwacht publiek: 50.000 personen.                                                             │ │ │
│  │  │ Toegangscontrole hoofdingang, crowd control bij vak 410-412.                                                                                  │ │ │
│  │  │ Briefing om 13:30 bij hoofdingang. Dresscode: zwart uniform + safety vest.                                                                   │ │ │
│  │  │                                                                                                                                                 │ │ │
│  │  │ Speciale aandachtspunten:                                                                                                                      │ │ │
│  │  │ - Ervaring met crowd control vereist                                                                                                           │ │ │
│  │  │ - EHBO certificaat gewenst                                                                                                                     │ │ │
│  │  │ - Kennis van Ajax Arena layout voordeel                                                                                                       │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                                                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                                                                               │
│                                              [💾 Concept Opslaan]    [❌ Annuleren]    [➡️ Volgende: Professional Vereisten]                           │
│                                                                                                                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Professional Assignment Interface
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [← Terug naar Diensten]                    👥 PROFESSIONAL TOEWIJZING - Ajax Arena Event                                                              │
├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                                                               │
│ ┌─────────────────────────────────────────┐  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │        🎯 DIENST DETAILS                │  │                                    👥 BESCHIKBARE PROFESSIONALS                                        │ │
│ │                                         │  │                                                                                                           │ │
│ │ 📅 28-11-2024, 14:00-22:00             │  │ [🔍 Zoeken...] [📍 Afstand] [⭐ Rating] [🎓 Certificaten] [📅 Beschikbaarheid]                        │ │
│ │ 📍 Ajax Arena, Amsterdam                │  │                                                                                                           │ │
│ │ 💰 €18/uur × 8 uur = €144              │  │ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │ │
│ │ 🎯 Event Beveiliging                    │  │ │ 🏆 96% MATCH │ 👤 Jan de Vries            │ ⭐ 4.9 │ 📍 12km │ ✅ Beschikbaar │ [➕ Toewijzen] │   │ │
│ │                                         │  │ │              │ 5 jaar ervaring           │        │        │                │                │   │ │
│ │ Professionals Nodig: 4                  │  │ │              │ 🎓 Beveiliger 2 + EHBO    │        │        │                │                │   │ │
│ │ Toegewezen: 2                          │  │ │              │ 📅 Laatste dienst: 2 dgn  │        │        │                │                │   │ │
│ │ Nog Nodig: 2                           │  │ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ │                                         │  │                                                                                                           │ │
│ │ 🎓 VEREISTEN:                           │  │ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │ │
│ │ ✅ Beveiliger 2 certificaat             │  │ │ 🔥 89% MATCH │ 👤 Sarah Jansen           │ ⭐ 4.7 │ 📍 8km  │ ✅ Beschikbaar │ [➕ Toewijzen] │   │ │
│ │ ✅ Event beveiliging ervaring           │  │ │              │ 3 jaar ervaring           │        │        │                │                │   │ │
│ │ ☐ EHBO certificaat (gewenst)            │  │ │              │ 🎓 Beveiliger 2 + VCA     │        │        │                │                │   │ │
│ │ ✅ Crowd control ervaring               │  │ │              │ 📅 Laatste dienst: 5 dgn  │        │        │                │                │   │ │
│ │                                         │  │ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ │ 📊 MATCHING SCORE: 94%                  │  │                                                                                                           │ │
│ │                                         │  │ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │ │
│ │ [🤖 Auto-Assign] [📧 Broadcast]        │  │ │ ⚡ 84% MATCH │ 👤 Ahmed Hassan           │ ⭐ 4.5 │ 📍 15km │ 🟡 Mogelijk    │ [➕ Toewijzen] │   │ │
│ └─────────────────────────────────────────┘  │ │              │ 4 jaar ervaring           │        │        │ beschikbaar     │                │   │ │
│                                               │ │              │ 🎓 Beveiliger 2 + Portier │        │        │                │                │   │ │
│ ┌─────────────────────────────────────────┐  │ │              │ 📅 Laatste dienst: 1 wk   │        │        │                │                │   │ │
│ │     ✅ TOEGEWEZEN TEAM (2/4)            │  │ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ │                                         │  │                                                                                                           │ │
│ │ 👤 Tom Peters     ⭐ 4.8  📍 5km       │  │ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │ │
│ │    Event specialist - Team Leader       │  │ │ 🎯 76% MATCH │ 👤 Lisa van der Berg     │ ⭐ 4.3 │ 📍 22km │ ❌ Niet        │ [💬 Contact]   │   │ │
│ │    [📞 Contact] [📧 Message] [❌ Remove]│  │ │              │ 2 jaar ervaring           │        │        │ beschikbaar     │                │   │ │
│ │                                         │  │ │              │ 🎓 Beveiliger 2           │        │        │                │                │   │ │
│ │ 👤 Mike de Jong   ⭐ 4.6  📍 18km      │  │ │              │ 📅 Andere dienst conflict │        │        │                │                │   │ │
│ │    Crowd control expert                 │  │ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ │    [📞 Contact] [📧 Message] [❌ Remove]│  │                                                                                                           │ │
│ │                                         │  │ [⬅️ Vorige] [1] [2] [3] [4] [➡️ Volgende]    12 van 47 professionals                                    │ │
│ └─────────────────────────────────────────┘  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                                                                               │
│                              [💾 Toewijzingen Opslaan]    [📧 Team Briefing Versturen]    [✅ Dienst Activeren]                                        │
│                                                                                                                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Versie (375px - 768px) - Responsive Design

### Mobile Diensten Overzicht
```
┌─────────────────────────────────────┐
│  [≡] Diensten Beheer      [🔍] [+] │
├─────────────────────────────────────┤
│                                     │
│  📊 SNELLE STATS                    │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │Actief   │ │Planning │ │Urgent  │ │
│  │  23     │ │   8     │ │   2    │ │
│  └─────────┘ └─────────┘ └────────┘ │
│                                     │
│  🔔 URGENTE AANDACHT                │
│  ┌─────────────────────────────┐   │
│  │ 🔴 Schiphol T3              │   │
│  │    ⚠️ Incident - 45 min     │   │
│  │    6 professionals          │   │
│  │ [Details] [GPS] [Contact]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  💼 ACTIEVE DIENSTEN                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🟢 Ajax Arena Event         │   │
│  │    14:00-22:00 vandaag      │   │
│  │    4 professionals toegewezen│   │
│  │    💰 €640 | ✅ Operationeel│   │
│  │                             │   │
│  │ [📍 GPS Tracking]           │   │
│  │ [👥 Team Contact]           │   │
│  │ [📋 Details]                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🟡 Utrecht Centraal         │   │
│  │    10:00-18:00 morgen       │   │
│  │    2/3 professionals        │   │
│  │    💰 €384 | 🔄 Toewijzing  │   │
│  │                             │   │
│  │ [👥 Zoek Professionals]     │   │
│  │ [📋 Details] [📧 Notify]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🟠 Club Maassilo            │   │
│  │    22:00-06:00 weekend      │   │
│  │    📝 5 sollicitaties       │   │
│  │    💰 €352 | 📄 Review      │   │
│  │                             │   │
│  │ [👀 Bekijk Sollicitaties]   │   │
│  │ [📞 Interview Plannen]      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     [+ NIEUWE DIENST]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Meer Laden... (4 van 23)]        │
│                                     │
├─────────────────────────────────────┤
│ [📊][💼][👥][🏢][⚙️]              │
│ Dash Dienst Team Klant Prof       │
└─────────────────────────────────────┘
```

### Mobile Nieuwe Dienst - Stap 1
```
┌─────────────────────────────────────┐
│  [←] Nieuwe Dienst      Stap 1 van 5│
├─────────────────────────────────────┤
│                                     │
│  📋 BASIS INFORMATIE                │
│                                     │
│  🏢 KLANT                           │
│  ┌─────────────────────────────┐   │
│  │ Bestaande klant             │   │
│  │ [Ajax Entertainment     ▼]  │   │
│  │                             │   │
│  │ ☐ Nieuwe klant toevoegen    │   │
│  └─────────────────────────────┘   │
│                                     │
│  📞 CONTACT                         │
│  Contact: [Jan Vermeulen        ]   │
│  Telefoon: [+31 20 311 1333    ]   │
│  Email: [j.vermeulen@ajax.nl    ]   │
│                                     │
│  📍 LOCATIE                         │
│  Naam: [Ajax Arena CL Event     ]   │
│  Adres: [Arena Boulevard 1      ]   │
│  Postcode: [1101 AX] Plaats: [Adam] │
│                                     │
│  GPS: [📍 Auto-detecteren]          │
│  Check-in radius: [100] meter       │
│                                     │
│  📅 PLANNING                        │
│  Type: [Event Beveiliging      ▼]  │
│  Datum: [28-11-2024            ]   │
│  Van: [14:00] Tot: [22:00]         │
│                                     │
│  ☑️ Herhalende dienst              │
│  └── [Wekelijks ▼] op [Woensdag ▼] │
│  Tot: [31-12-2024              ]   │
│                                     │
│  💰 TARIEVEN                        │
│  Klant tarief: [€25,00] /uur       │
│  Professional: [€18,00] /uur       │
│  Marge: €7,00 (28%)                │
│                                     │
│  📝 BESCHRIJVING                    │
│  ┌─────────────────────────────┐   │
│  │ Champions League wedstrijd  │   │
│  │ Ajax vs Barcelona.          │   │
│  │ 50.000 personen verwacht.  │   │
│  │                             │   │
│  │ Toegangscontrole +          │   │
│  │ crowd control bij vak       │   │
│  │ 410-412. Briefing 13:30.    │   │
│  │                             │   │
│  │ Vereisten:                  │   │
│  │ - Event ervaring            │   │
│  │ - EHBO gewenst              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     💾 CONCEPT OPSLAAN      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     ➡️ PROFESSIONAL         │   │
│  │       VEREISTEN             │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [📊][💼][👥][🏢][⚙️]              │
│ Dash Dienst Team Klant Prof       │
└─────────────────────────────────────┘
```

### Mobile Professional Assignment
```
┌─────────────────────────────────────┐
│  [←] Professional Toewijzing        │
├─────────────────────────────────────┤
│                                     │
│  🎯 DIENST: Ajax Arena              │
│  📅 28-11, 14:00-22:00             │
│  👥 2/4 professionals toegewezen    │
│                                     │
│  ✅ TOEGEWEZEN TEAM                 │
│  ┌─────────────────────────────┐   │
│  │ 👤 Tom Peters    ⭐ 4.8      │   │
│  │    Team Leader - 5km        │   │
│  │    [📞] [📧] [❌]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Mike de Jong  ⭐ 4.6      │   │
│  │    Crowd Control - 18km     │   │
│  │    [📞] [📧] [❌]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔍 BESCHIKBARE PROFESSIONALS       │
│                                     │
│  [🔍 Zoeken...] [⚡ Auto-Match]     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏆 96% MATCH                │   │
│  │ 👤 Jan de Vries   ⭐ 4.9    │   │
│  │    5 jaar - 12km            │   │
│  │    🎓 Beveiliger 2 + EHBO   │   │
│  │    ✅ Beschikbaar           │   │
│  │                             │   │
│  │    [➕ TOEWIJZEN]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔥 89% MATCH                │   │
│  │ 👤 Sarah Jansen  ⭐ 4.7     │   │
│  │    3 jaar - 8km             │   │
│  │    🎓 Beveiliger 2 + VCA    │   │
│  │    ✅ Beschikbaar           │   │
│  │                             │   │
│  │    [➕ TOEWIJZEN]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⚡ 84% MATCH                │   │
│  │ 👤 Ahmed Hassan  ⭐ 4.5     │   │
│  │    4 jaar - 15km            │   │
│  │    🎓 Beveiliger 2          │   │
│  │    🟡 Mogelijk beschikbaar  │   │
│  │                             │   │
│  │    [➕ TOEWIJZEN]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   💾 TOEWIJZINGEN OPSLAAN   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   📧 TEAM BRIEFING          │   │
│  │      VERSTUREN              │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [📊][💼][👥][🏢][⚙️]              │
│ Dash Dienst Team Klant Prof       │
└─────────────────────────────────────┘
```

---

## 🔄 Real-time Features & Live Monitoring

### Live Shift Tracking
```typescript
interface LiveShiftData {
  shiftId: number;
  status: 'active' | 'delayed' | 'incident' | 'completed';
  assignedProfessionals: ProfessionalLocation[];
  currentIncidents: Incident[];
  gpsCompliance: boolean;
  lastUpdate: Date;
}

interface ProfessionalLocation {
  professionalId: number;
  name: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  batteryLevel?: number;
  lastSeen: Date;
  status: 'on_location' | 'traveling' | 'off_location' | 'emergency';
}
```

### Real-time Status Updates
- **Green indicators**: All professionals on location, operational
- **Yellow warnings**: Minor delays, low battery alerts, boundary warnings
- **Red alerts**: Incidents, emergency situations, no-shows
- **Blue info**: Check-ins completed, shift changes, communications

### Live Dashboard Elements
- **Pulsing location dots**: Real-time GPS updates every 2 minutes
- **Status banner updates**: Automatic refresh of shift statuses
- **Incident alerts**: Immediate notifications with sound alerts
- **Team communication**: Live chat messages and status updates

---

## 💾 Data Requirements & API Integration

### Shift Management API Endpoints
```typescript
// Get shifts overview
GET /api/company/shifts?status={active|planning|archived}&page=1&limit=10
{
  shifts: ShiftOverview[],
  totalCount: number,
  filters: AppliedFilters,
  pagination: PaginationInfo
}

// Create new shift
POST /api/company/shifts
{
  clientInfo: ClientDetails,
  shiftDetails: ShiftConfiguration,
  requirements: ProfessionalRequirements,
  pricing: PricingStructure
}

// Professional assignment
PUT /api/company/shifts/{shiftId}/assign
{
  professionalIds: number[],
  autoAssign: boolean,
  notifyTeam: boolean
}

// Live tracking data
GET /api/company/shifts/{shiftId}/live
{
  liveData: LiveShiftData,
  gpsLocations: GPSLocation[],
  incidents: Incident[],
  communications: Message[]
}

// Bulk operations
POST /api/company/shifts/bulk-action
{
  shiftIds: number[],
  action: 'activate' | 'cancel' | 'reassign' | 'notify',
  parameters: BulkActionParams
}
```

### Real-time WebSocket Subscriptions
```typescript
WebSocket: /realtime/company/{companyId}/shifts
- shift_status_changed: ShiftStatusUpdate
- professional_assigned: AssignmentUpdate
- gps_alert: LocationAlert
- incident_reported: IncidentAlert
- application_received: NewApplication
- shift_completed: CompletionNotification
```

### Database Schema Integration
- **shifts** (companyId, clientId, status, startDateTime, endDateTime, requirements)
- **shiftAssignments** (shiftId, professionalId, assignedAt, confirmedAt)
- **shiftRequirements** (shiftId, certificateType, required, preferred)
- **applications** (shiftId, professionalId, status, appliedAt, reviewedAt)
- **incidents** (shiftId, reportedBy, type, severity, description, resolvedAt)

---

## 🎯 Business Logic & Workflows

### Smart Matching Algorithm
```typescript
interface MatchingCriteria {
  locationProximity: number;      // 40% weight - distance to shift location
  experienceMatch: number;        // 30% weight - relevant experience level
  availabilityScore: number;      // 20% weight - confirmed availability
  performanceRating: number;      // 10% weight - historical performance
}

const calculateMatchScore = (professional: Professional, shift: Shift): number => {
  const proximity = calculateDistance(professional.location, shift.location);
  const experience = evaluateExperience(professional.skills, shift.requirements);
  const availability = checkAvailability(professional.schedule, shift.datetime);
  const performance = professional.averageRating;

  return (proximity * 0.4 + experience * 0.3 + availability * 0.2 + performance * 0.1);
};
```

### Assignment Workflow States
1. **Draft**: Shift created, not yet published
2. **Published**: Available for applications/assignment
3. **Partially Assigned**: Some professionals assigned, others needed
4. **Fully Assigned**: All positions filled
5. **Active**: Shift in progress, GPS tracking enabled
6. **Completed**: Shift finished, pending approval
7. **Archived**: Completed and invoiced

### Approval Workflows
- **Auto-assignment**: For trusted professionals with 95%+ match score
- **Manager review**: For new professionals or <90% match scores
- **Client approval**: For VIP clients or specific requirements
- **Emergency assignment**: For urgent last-minute replacements

---

## 📱 Mobile Optimizations & Touch Interactions

### Mobile-Specific Features
- **Swipe actions**: Swipe left on shift card voor quick actions menu
- **Pull-to-refresh**: Update real-time data met pull gesture
- **Touch & hold**: Context menu voor advanced actions
- **Progressive disclosure**: Complex forms broken into mobile-friendly steps
- **Offline capability**: Critical shift data cached locally

### Touch-Friendly Design Elements
- **Minimum 44px touch targets**: All buttons and interactive elements
- **Gesture navigation**: Swipe between steps in shift creation wizard
- **Quick action buttons**: Large, thumb-friendly primary actions
- **Status indicators**: Visual feedback voor alle touch interactions

### Mobile Performance Optimizations
- **Lazy loading**: Load shift details only when requested
- **Image compression**: Professional photos and location images optimized
- **Background sync**: Update data while app is in background
- **Battery optimization**: GPS tracking frequency based on battery level

---

## 🎨 Design System Integration

### Component Reuse from ZZP Wireframes
```css
/* Reused Components from ZZP Design */
.kpi-card {
  /* Same structure as ZZP cards, different content */
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.status-badge {
  /* Same color system as ZZP */
  --active: #10b981;      /* Green for operational shifts */
  --warning: #f59e0b;     /* Yellow for attention needed */
  --critical: #ef4444;    /* Red for incidents */
  --info: #3b82f6;        /* Blue for planning status */
}

/* Company-specific adaptations */
.shift-card {
  /* Higher information density than ZZP cards */
  min-height: 120px;      /* vs 80px for ZZP */
  grid-template-columns: 1fr auto 100px; /* 3-column layout */
}

.professional-assignment {
  /* Drag & drop capability for desktop */
  cursor: grab;
  transition: transform 0.2s ease;
}

.professional-assignment:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

### Mobile Responsiveness Strategy
```css
/* Desktop-first approach with mobile adaptations */
@media (max-width: 768px) {
  .shift-grid {
    grid-template-columns: 1fr; /* Single column on mobile */
  }

  .assignment-interface {
    flex-direction: column; /* Stack assignment panels */
  }

  .sidebar-navigation {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar-navigation.open {
    transform: translateX(0);
  }
}
```

---

## 📊 Performance Metrics & Success Indicators

### Critical Performance Targets
- **Shift creation wizard**: < 60 seconds complete flow
- **Professional assignment**: < 30 seconds for 4 professionals
- **Live tracking updates**: < 2 seconds refresh rate
- **Mobile app responsiveness**: 60fps smooth scrolling
- **Bulk operations**: Handle 50+ shifts simultaneously

### Business Success Metrics
- **Shift fill rate**: % of shifts successfully staffed
- **Time to assignment**: Average time from shift creation to full staffing
- **Professional utilization**: % of available professionals assigned
- **Client satisfaction**: Rating scores per completed shift
- **Incident response time**: Speed of incident resolution

### User Experience Analytics
- **Wizard completion rate**: % users who complete shift creation
- **Assignment accuracy**: % of assignments that don't require changes
- **Mobile usage patterns**: Desktop vs mobile usage for different tasks
- **Feature adoption**: Usage of smart matching vs manual assignment
- **Error rates**: Failed assignments, system errors, user complaints