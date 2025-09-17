# Securyflex - Beheer & Compliance

## Kleurenpalet (consistent met andere apps)
- **Primary Blue**: oklch(0.45 0.22 240)
- **Electric Blue (Accent)**: oklch(0.65 0.25 265)
- **Success Green**: oklch(0.62 0.18 145)
- **Warning Amber**: oklch(0.75 0.15 70)
- **Destructive Red**: oklch(0.577 0.245 27.325)
- **Text Dark**: oklch(0.15 0.01 240)
- **Text Muted**: oklch(0.45 0.01 240)

## Complete Wireframe Specificaties

```
┌─────────────────────────────────────────────┐
│  BEHEER & INSTELLINGEN                     │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  COMPLIANCE CENTER                         │
│  ┌─────────────────────────────────────┐   │
│  │ 📋 CAO CONTROLE STATUS              │   │
│  │                                     │   │
│  │ Laatste controle: 6 mnd geleden     │   │
│  │ Resultaat: VOLDOENDE                │   │
│  │                                     │   │
│  │ Aandachtspunten:                    │   │
│  │ ✅ Loonschalen correct              │   │
│  │ ✅ ORT berekening juist             │   │
│  │ ⚠️ Verschuivingslog bijwerken       │   │
│  │ ✅ Verlof registratie op orde       │   │
│  │                                     │   │
│  │ [Download CAO rapport]              │   │
│  │ [Exporteer urenlog]                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  GEBRUIKERS & ROLLEN                       │
│  ┌─────────────────────────────────────┐   │
│  │ Account: 8/10 gebruikers actief     │   │
│  │                                     │   │
│  │ Admin (2/2):                        │   │
│  │ • John Doe - Eigenaar              │   │
│  │ • Lisa Admin - Office manager      │   │
│  │                                     │   │
│  │ Planners (3/3):                     │   │
│  │ • Mark Planner                      │   │
│  │ • Sarah Scheduler                   │   │
│  │ • Tom Rooster                       │   │
│  │                                     │   │
│  │ Beveiligers (3/∞):                  │   │
│  │ • 24 accounts (beperkte toegang)   │   │
│  │                                     │   │
│  │ [+ Gebruiker toevoegen]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  FINANCIEEL                                │
│  ┌─────────────────────────────────────┐   │
│  │ 💳 Facturatie instellingen          │   │
│  │ • Standaard betaaltermijn: 30 dagen │   │
│  │ • Service fee: €3,50/uur            │   │
│  │ • Facturatie: Per 4 weken           │   │
│  │                              [Wijzig]│   │
│  │                                     │   │
│  │ 🏦 Bankgegevens                     │   │
│  │ IBAN: NL**********4892              │   │
│  │                              [Wijzig]│   │
│  │                                     │   │
│  │ 📊 Administratie koppeling          │   │
│  │ • Exact Online ✅ Gekoppeld         │   │
│  │ • Laatste sync: 2 uur geleden       │   │
│  │                         [Instellingen]│  │
│  └─────────────────────────────────────┘   │
│                                             │
│  INTEGRATIES                               │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Exact Online (Boekhouding)       │   │
│  │ ✅ AFAS (Salaris)                   │   │
│  │ ⭕ Secusoft (Planning) - Beschikbaar│   │
│  │ ⭕ TriOpSys (Reiskosten) - Setup    │   │
│  │                                     │   │
│  │ [Nieuwe integratie toevoegen]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  RAPPORTAGES & EXPORT                      │
│  ┌─────────────────────────────────────┐   │
│  │ [📊 Management dashboard]           │   │
│  │ [📤 Uren export (Excel)]           │   │
│  │ [📋 CAO compliance rapport]        │   │
│  │ [💰 Marge analyse]                 │   │
│  │ [👥 Verzuim rapport]               │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [📊]     [📅]     [👥]     [🏢]    [⚙️]   │
│Dashboard Planning  Team   Klanten  Beheer  │
│                                    ━━━━━   │  <- Active: Beheer
└─────────────────────────────────────────────┘
```

## CAO Compliance Dashboard

```
┌─────────────────────────────────────────────┐
│  CAO COMPLIANCE CENTER               [✕]   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────┐                       │
│  │ Rapport periode: Q3 2024 ▼              │  <- Periode selector
│  └─────────────────┘                       │
│                                             │
│  OVERALL COMPLIANCE SCORE                  │
│  ┌─────────────────────────────────────┐   │
│  │ 🎯 CAO COMPLIANCE: 94.2%            │   │
│  │                                     │   │
│  │ ████████████████████████▓▓▓ 94.2%  │   │
│  │                                     │   │
│  │ Target: >90% | Status: ✅ VOLDOENDE │   │
│  │ Benchmark: Branche gemiddelde 87%  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  WERKUREN & RUSTTIJDEN                     │
│  ┌─────────────────────────────────────┐   │
│  │ 📊 Werkweek limiet (48 uur):        │   │
│  │ • Compliant: 22/24 medewerkers     │   │
│  │ • Overschrijdingen: 2               │   │
│  │ ████████████████████████▓▓ 92%     │   │
│  │                                     │   │
│  │ ⏰ Rusttijd tussen diensten (11u):  │   │
│  │ • Compliant: 23/24 medewerkers     │   │
│  │ • Schendingen: 1                    │   │
│  │ ████████████████████████▓▓ 96%     │   │
│  │                                     │   │
│  │ 🌙 Nachtdienst limiet (5 achtereen):│   │
│  │ • Compliant: 24/24 medewerkers     │   │
│  │ • Overschrijdingen: 0               │   │
│  │ ███████████████████████████ 100%   │   │
│  │                                     │   │
│  │ [📋 Gedetailleerd overzicht]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  VERLOF & COMPENSATIE                      │
│  ┌─────────────────────────────────────┐   │
│  │ 🏖️ Verlof registratie:              │   │
│  │ • Opgebouwd: 847 dagen totaal       │   │
│  │ • Opgenomen: 423 dagen               │   │
│  │ • Uitstaand: 424 dagen              │   │
│  │ Status: ✅ Correct geadministreerd  │   │
│  │                                     │   │
│  │ 💰 Verschuivingstoeslagen:          │   │
│  │ • Totaal uitbetaald: €4.892         │   │
│  │ • Gem. per medewerker: €204         │   │
│  │ • % van brutoloon: 7.2%            │   │
│  │ Status: ✅ Conform CAO tarieven     │   │
│  │                                     │   │
│  │ [💾 Export verlofoverzicht]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ACTIEPUNTEN                               │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ AANDACHT VEREIST                 │   │
│  │                                     │   │
│  │ 1. Maria Jansen - Werkweek 52 uur  │   │
│  │    Actie: Compensatie verlof boeken │   │
│  │    Deadline: Binnen 2 weken         │   │
│  │                                     │   │
│  │ 2. Verschuivingslog incompletete     │   │
│  │    Actie: 3 ontbrekende entries     │   │
│  │    Deadline: Voor volgende controle │   │
│  │                                     │   │
│  │ [✅ Markeer als opgelost]           │   │
│  │ [📧 Stuur herinneringen]            │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Gebruikers & Rollen Management

```
┌─────────────────────────────────────────────┐
│  GEBRUIKERSBEHEER                    [✕]   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ACCOUNT OVERZICHT                         │
│  ┌─────────────────────────────────────┐   │
│  │ Plan: MEDIUM (6-15 medewerkers)     │   │
│  │ Gebruik: 8/10 beschikbare accounts  │   │
│  │                                     │   │
│  │ ████████████████████░░░░  80%      │   │
│  │                                     │   │
│  │ Verlengt automatisch: 15 nov 2024  │   │
│  │ Maandelijkse kosten: €29,99         │   │
│  │                                     │   │
│  │ [Account upgraden] [Billing]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ACTIEVE GEBRUIKERS (8)                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 👑 John Doe (Eigenaar)              │   │  <- Admin user
│  │     john.doe@guardian-sec.nl         │   │
│  │     Rol: Admin • Actief: 2u geleden │   │
│  │                                     │   │
│  │ Rechten:                            │   │
│  │ ✅ Alle modules ✅ Gebruikersbeheer │   │
│  │ ✅ Facturatie ✅ Instellingen      │   │
│  │                                     │   │
│  │ [Bewerk] [Deactiveer] [2FA status] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 👤 Lisa Admin (Office Manager)      │   │
│  │     lisa.admin@guardian-sec.nl       │   │
│  │     Rol: Admin • Actief: 5u geleden │   │
│  │                                     │   │
│  │ Rechten:                            │   │
│  │ ✅ Team beheer ✅ Planning          │   │
│  │ ⭕ Beperkte facturatie ❌ Gebruikers │   │
│  │                                     │   │
│  │ [Bewerk] [Rechten wijzigen]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📅 Mark Planner (Planner)           │   │
│  │     mark.p@guardian-sec.nl           │   │
│  │     Rol: Planner • Actief: Online   │   │
│  │                                     │   │
│  │ Rechten:                            │   │
│  │ ✅ Planning & roostering            │   │
│  │ ⭕ Team (read-only) ❌ Facturatie   │   │
│  │                                     │   │
│  │ [Bewerk] [Activiteitslog]          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [+ Nieuwe gebruiker uitnodigen]           │
│                                             │
│  BEVEILIGINGSGROEP (24 beveiligers)        │
│  ┌─────────────────────────────────────┐   │
│  │ 🛡️ Beveiligers hebben beperkte      │   │
│  │    toegang tot hun eigen:           │   │
│  │    • Rooster & shifts               │   │
│  │    • Urenregistratie                │   │
│  │    • Persoonlijke gegevens          │   │
│  │                                     │   │
│  │ Bulk acties:                        │   │
│  │ [📧 Wachtwoord reset] [📱 App link] │   │
│  │ [📋 Toegangsrapport]                │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Nieuwe Gebruiker Modal

```
┌─────────────────────────────────────────────┐
│  NIEUWE GEBRUIKER UITNODIGEN         [✕]   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  PERSOONLIJKE GEGEVENS                     │
│  ┌─────────────────────────────────────┐   │
│  │ Voornaam: *                         │   │
│  │ [Sarah                            ] │   │
│  │                                     │   │
│  │ Achternaam: *                       │   │
│  │ [Scheduler                        ] │   │
│  │                                     │   │
│  │ Email adres: *                      │   │
│  │ [sarah.scheduler@guardian-sec.nl  ] │   │
│  │                                     │   │
│  │ Telefoonnummer:                     │   │
│  │ [06-87654321                      ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  FUNCTIE & RECHTEN                         │
│  ┌─────────────────────────────────────┐   │
│  │ Rol: *                              │   │
│  │ ○ Admin (volledige toegang)         │   │
│  │ ● Planner (planning & roostering)   │   │
│  │ ○ HR (personeel management)         │   │
│  │ ○ Finance (facturatie & rapporten)  │   │
│  │ ○ Custom (aangepaste rechten)       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  TOEGANGSRECHTEN PREVIEW                   │
│  ┌─────────────────────────────────────┐   │
│  │ Met de rol 'Planner' krijgt Sarah: │   │
│  │                                     │   │
│  │ ✅ Planning & roostering            │   │
│  │ ✅ Team overzicht (lezen)           │   │
│  │ ✅ Klanten shifts                   │   │
│  │ ❌ Financiële gegevens              │   │
│  │ ❌ Gebruikersbeheer                 │   │
│  │ ⚠️ Rapporten (beperkt)              │   │
│  │                                     │   │
│  │ [Rechten aanpassen]                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  UITNODIGING INSTELLINGEN                  │
│  ┌─────────────────────────────────────┐   │
│  │ ☐ Tijdelijke toegang (30 dagen)     │   │
│  │ ☐ Verplicht 2FA bij eerste login    │   │
│  │ ✅ Welkomst email versturen          │   │
│  │ ☐ Uitnodiging plannen voor later    │   │
│  │                                     │   │
│  │ Persoonlijk bericht (optioneel):    │   │
│  │ [Welkom bij het Guardian team!     │   │
│  │  Je krijgt toegang tot planning   ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Annuleren]              [Verstuur uitnodiging]│
│                                             │
└─────────────────────────────────────────────┘
```

## Integraties Dashboard

```
┌─────────────────────────────────────────────┐
│  INTEGRATIES & KOPPELINGEN           [✕]   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ACTIEVE INTEGRATIES                       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ EXACT ONLINE                     │   │  <- Active integration
│  │    Boekhouding & Facturatie          │   │
│  │                                     │   │
│  │ Status: 🟢 Actief                   │   │
│  │ Laatste sync: 2 uur geleden         │   │
│  │ Data: Facturen, betalingen, kosten │   │
│  │                                     │   │
│  │ Sync frequentie: Dagelijks 06:00   │   │
│  │ Fouten afgelopen maand: 0          │   │
│  │                                     │   │
│  │ [⚙️ Instellingen] [📊 Sync log]    │   │
│  │ [🔄 Nu synchroniseren] [❌ Koppel los]│  │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ AFAS                             │   │
│  │    Salarisadministratie & HR        │   │
│  │                                     │   │
│  │ Status: 🟢 Actief                   │   │
│  │ Laatste sync: 6 uur geleden         │   │
│  │ Data: Uren, salarissen, contracten │   │
│  │                                     │   │
│  │ Sync frequentie: 2x per dag        │   │
│  │ Fouten afgelopen maand: 2          │   │
│  │                                     │   │
│  │ [⚙️ Instellingen] [⚠️ Fouten bekijken]│  │
│  └─────────────────────────────────────┘   │
│                                             │
│  BESCHIKBARE INTEGRATIES                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⭕ SECUSOFT                          │   │
│  │    Planning & Roostersoftware        │   │
│  │                                     │   │
│  │ Status: 🟡 Setup vereist            │   │
│  │ Voordelen:                          │   │
│  │ • Geïntegreerde planning            │   │
│  │ • Automatische rooster sync         │   │
│  │ • Bi-directionele updates           │   │
│  │                                     │   │
│  │ Kosten: €15/maand extra             │   │
│  │                                     │   │
│  │ [🚀 Setup starten] [ℹ️ Meer info]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⭕ TRIOPSYS                          │   │
│  │    Reiskosten & Onkosten             │   │
│  │                                     │   │
│  │ Status: 🟡 Beschikbaar              │   │
│  │ Voordelen:                          │   │
│  │ • Automatische km registratie       │   │
│  │ • GPS-based reiskosten              │   │
│  │ • Directe declaratie verwerking     │   │
│  │                                     │   │
│  │ Kosten: €8/gebruiker/maand          │   │
│  │                                     │   │
│  │ [🚀 Setup starten] [📋 Demo aanvragen]│  │
│  └─────────────────────────────────────┘   │
│                                             │
│  API & CUSTOM INTEGRATIES                  │
│  ┌─────────────────────────────────────┐   │
│  │ 🔧 EIGEN INTEGRATIE BOUWEN          │   │
│  │                                     │   │
│  │ API documentatie beschikbaar        │   │
│  │ REST endpoints voor alle data       │   │
│  │ Webhooks voor real-time updates     │   │
│  │                                     │   │
│  │ [📖 API docs] [🔑 API keys]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Management Rapportage Dashboard

```
┌─────────────────────────────────────────────┐
│  MANAGEMENT DASHBOARD                [✕]   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────┐                       │
│  │ Periode: Q3 2024 ▼                      │  <- Periode selector
│  └─────────────────┘                       │
│                                             │
│  FINANCIEEL OVERZICHT                      │
│  ┌─────────────────────────────────────┐   │
│  │ 💰 OMZET & WINSTGEVENDHEID          │   │
│  │                                     │   │
│  │ Totale omzet:       €189.456 (↗12%)│   │
│  │ Bruto marge:        €58.847 (31%)  │   │
│  │ Operationele kosten: €42.150       │   │
│  │ Netto winst:        €16.697 (8.8%) │   │
│  │                                     │   │
│  │ ████████████████████▓▓▓▓▓ 31% marge│   │
│  │                                     │   │
│  │ [📊 Gedetailleerde P&L]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  OPERATIONELE KPI'S                        │
│  ┌─────────────────────────────────────┐   │
│  │ 👥 WERKNEMERS                       │   │
│  │ • Actieve beveiligers: 24          │   │
│  │ • Gemiddelde bezetting: 87%         │   │
│  │ • Verzuimpercentage: 2.1%           │   │
│  │ • Tevredenheidscore: 4.2/5.0       │   │
│  │                                     │   │
│  │ 🏢 KLANTEN                          │   │
│  │ • Actieve klanten: 12               │   │
│  │ • Client retention: 94%             │   │
│  │ • Gem. satisfaction: 4.6/5.0        │   │
│  │ • Contract renewals: 11/12          │   │
│  │                                     │   │
│  │ ⚡ OPERATIES                         │   │
│  │ • Shifts voltooid: 847              │   │
│  │ • Fill rate: 96.2%                 │   │
│  │ • No-show rate: 0.8%               │   │
│  │ • Response time: 1.2u gemiddeld    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  TRENDS & VOORSPELLINGEN                   │
│  ┌─────────────────────────────────────┐   │
│  │ 📈 GROEI PROJECTIES                 │   │
│  │                                     │   │
│  │ Q4 2024 verwachting:               │   │
│  │ • Omzet: €205.000 (+8%)            │   │
│  │ • Nieuwe klanten: 3                │   │
│  │ • Extra personeel: 4-6 FTE         │   │
│  │                                     │   │
│  │ Risico's:                           │   │
│  │ • Seizoenseffect december (-15%)    │   │
│  │ • Contract expiry Schiphol (€60k)  │   │
│  │                                     │   │
│  │ [📋 Volledige forecast]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  QUICK ACTIONS                             │
│  ┌─────────────────────────────────────┐   │
│  │ [📤 Export naar Excel]              │   │
│  │ [📧 Email board rapport]            │   │
│  │ [📊 Custom dashboard]               │   │
│  │ [⚙️ Rapportage instellingen]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Compliance Status Indicators
- **Score display**: Large percentage with color coding
  - Green (>90%): Success
  - Amber (80-90%): Warning
  - Red (<80%): Danger
- **Progress bars**: Visual representation with same color scheme
- **Status badges**: Icons with text labels

### User Management Cards
- **Role indicators**: Crown for admin, different icons per role
- **Status dots**: Online (green), recent (amber), offline (grey)
- **Permission matrix**: Checkmarks, crosses, and partial access icons
- **Action buttons**: Contextual based on permissions

### Integration Status
- **Connection indicators**:
  - ✅ Active (green)
  - ⚠️ Warning (amber)
  - ❌ Error (red)
  - ⭕ Available (blue)
- **Sync status**: Last sync time with relative timestamps
- **Error reporting**: Count with drill-down capability

### Financial Metrics
- **Currency formatting**: Euro symbol, thousands separators
- **Trend indicators**: Arrows with percentage changes
- **Progress bars**: For margins and targets
- **Chart integration**: Inline sparklines where relevant

## Security & Audit Features

### Role-Based Access Control (RBAC)
- **Granular permissions**: Module-level access control
- **Inheritance**: Role templates with customization
- **Time-based access**: Temporary permissions
- **Multi-factor authentication**: Mandatory for admin roles

### Audit Trail
```
┌─────────────────────────────────────────────┐
│  AUDIT LOG                           [🔍]   │
│                                             │
│  16 sep 14:23 - John Doe (Admin)           │
│  Gebruiker toegevoegd: Sarah Scheduler     │
│  Rol: Planner | IP: 192.168.1.45           │
│                                             │
│  16 sep 09:15 - Mark Planner (Planner)     │
│  Rooster gewijzigd: Week 38                │
│  Wijziging: Jan de Vries shift verplaatst  │
│                                             │
│  [📤 Export audit log] [🔍 Geavanceerd zoeken]│
└─────────────────────────────────────────────┘
```

### Data Protection
- **Encryption**: At rest and in transit
- **Retention policies**: Automatic data cleanup
- **GDPR compliance**: Right to be forgotten
- **Consent management**: Tracked permissions

## Compliance Automation

### CAO Monitoring Engine
- **Rule validation**: Real-time compliance checking
- **Alert system**: Automatic notifications
- **Corrective actions**: Suggested resolutions
- **Reporting**: Automated compliance reports

### Document Lifecycle
- **Expiry tracking**: Automated reminders
- **Renewal workflows**: Streamlined processes
- **Version control**: Document history
- **Digital signatures**: Legal compliance

## Business Intelligence

### Predictive Analytics
- **Revenue forecasting**: Machine learning models
- **Demand prediction**: Seasonal adjustments
- **Risk assessment**: Client and operational risks
- **Optimization suggestions**: Process improvements

### Custom Dashboards
- **Widget library**: Pre-built components
- **Drag-and-drop**: User-customizable layouts
- **Real-time data**: Live updates
- **Export options**: PDF, Excel, email scheduling

## System Administration

### Performance Monitoring
- **System health**: Server and database metrics
- **Usage analytics**: User activity patterns
- **Performance optimization**: Automated tuning
- **Capacity planning**: Growth projections

### Backup & Recovery
- **Automated backups**: Daily full, hourly incremental
- **Disaster recovery**: Multi-region failover
- **Data integrity**: Checksums and validation
- **Recovery testing**: Regular drills

### Update Management
- **Release notes**: Feature and fix summaries
- **Staged rollouts**: Gradual deployment
- **Rollback capability**: Quick recovery
- **User notifications**: Change communications