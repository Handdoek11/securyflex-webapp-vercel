# Securyflex - Team Management

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
│  TEAM MANAGEMENT                           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┬──────────┬──────────┐        │
│  │ Actief   │Documenten│ Payroll  │        │  <- Tabs
│  │  (24)    │    ⚠️3   │          │        │
│  └──────────┴──────────┴──────────┘        │
│  ━━━━━━                                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔍 Zoek medewerker...               │   │
│  │ [Filter: Locatie ▼] [Skills ▼]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  TEAM OVERZICHT                            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Jan de Vries                 │   │  <- Employee card
│  │        Beveiliger • Vast contract   │   │
│  │        36 uur/week • €2.847/mnd     │   │
│  │                                     │   │
│  │ Status: ✅ Actief dienst (Schiphol) │   │
│  │ Deze week: 32/36 uur gepland       │   │
│  │ Deze maand: 147 uur gewerkt        │   │
│  │                                     │   │
│  │ Documenten:                         │   │
│  │ Pas ✅  VOG ⚠️  VCA ✅  Contract ✅  │   │
│  │ VOG verloopt over 14 dagen         │   │
│  │                                     │   │
│  │ Competenties:                       │   │
│  │ [Objectbeveiliging] [Engels B2]    │   │
│  │ [Nachtdiensten] [Teamleider]       │   │
│  │                                     │   │
│  │ Performance: ⭐ 4.7 (laatste 3 mnd) │   │
│  │ Verzuim: 2 dagen (1.4%)            │   │
│  │                                     │   │
│  │ [Rooster] [Uren] [Dossier] [Contact]│  │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Maria Jansen                 │   │
│  │        Beveiliger • Parttime 24u    │   │
│  │        Groeimodel • €1.898/mnd      │   │
│  │                                     │   │
│  │ Status: 🟡 Wakkermelding pending    │   │
│  │ Deze week: 24/24 uur gepland       │   │
│  │                                     │   │
│  │ Documenten:                         │   │
│  │ Pas ✅  VOG ✅  VCA ✅  Contract ✅   │   │
│  │                                     │   │
│  │ [Rooster] [Uren] [Dossier] [Contact]│  │
│  └─────────────────────────────────────┘   │
│                                             │
│  QUICK ACTIONS                             │
│  ┌─────────────────────────────────────┐   │
│  │ [+ Nieuwe medewerker]                │   │
│  │ [📤 Bulk VOG aanvraag]              │   │
│  │ [📊 Team rapport]                   │   │
│  │ [💰 Loonrun preview]                │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [📊]     [📅]     [👥]     [🏢]    [⚙️]   │
│Dashboard Planning  Team   Klanten  Beheer  │
│                    ━━━━                    │  <- Active: Team
└─────────────────────────────────────────────┘
```

## Tab: Documenten

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐        │
│  │ Actief   │Documenten│ Payroll  │        │
│  │  (24)    │    ⚠️3   │          │        │
│  └──────────┴──────────┴──────────┘        │
│           ━━━━━━━━━                        │  <- Documenten tab
│                                             │
│  URGENTE ACTIES (3)                        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 VERVALLEN DOCUMENTEN              │   │
│  │                                     │   │
│  │ Peter Smit - VOG vervallen          │   │
│  │ Vervallen: 3 dagen geleden          │   │
│  │ Status: 🚫 Shift-block actief       │   │
│  │                                     │   │
│  │ [Nieuwe VOG aanvragen] [Contact]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ VERVALLEN BINNENKORT (< 30 dagen)│   │
│  │                                     │   │
│  │ Jan de Vries - VOG                  │   │
│  │ Verloopt: 14 dagen                  │   │
│  │ Status: ⚠️ Hernieuwing nodig        │   │
│  │                                     │   │
│  │ Ahmed Khan - VCA Certificaat        │   │
│  │ Verloopt: 23 dagen                  │   │
│  │ Status: 📧 Reminder verzonden       │   │
│  │                                     │   │
│  │ [Bulk herinneringen] [Planning]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  DOCUMENT OVERZICHT                        │
│  ┌─────────────────────────────────────┐   │
│  │ Beveiligingspassen:     22/24 ✅    │   │
│  │ VOG documenten:         21/24 ✅    │   │
│  │ VCA certificaten:       20/24 ⚠️    │   │
│  │ EHBO certificaten:      18/24       │   │
│  │ Arbeidscontracten:      24/24 ✅    │   │
│  │                                     │   │
│  │ Compliance rate: 87%                │   │
│  │ [Gedetailleerd rapport]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  BULK ACTIES                               │
│  ┌─────────────────────────────────────┐   │
│  │ [📤 VOG aanvragen (batch)]          │   │
│  │ [📧 Herinneringen versturen]        │   │
│  │ [📋 Compliance rapport]             │   │
│  │ [🔄 Document status sync]           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Tab: Payroll

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐        │
│  │ Actief   │Documenten│ Payroll  │        │
│  │  (24)    │    ⚠️3   │          │        │
│  └──────────┴──────────┴──────────┘        │
│                          ━━━━━━━━          │  <- Payroll tab
│                                             │
│  ┌─────────────────┐                       │
│  │ Periode: September 2024 ▼               │  <- Periode selector
│  └─────────────────┘                       │
│                                             │
│  LOONRUN OVERZICHT                         │
│  ┌─────────────────────────────────────┐   │
│  │ Status: 🟡 Concept (niet goedgekeurd)│   │
│  │                                     │   │
│  │ Totaal bruto loon:     €67.892      │   │
│  │ Werkgeverslasten:      €13.578      │   │
│  │ Platform fees:         €8.945       │   │
│  │ ──────────────────────────────      │   │
│  │ Totale kosten:         €90.415      │   │
│  │                                     │   │
│  │ Verwachte uitbetaling: 25 september │   │
│  │                                     │   │
│  │ [📋 Preview loonstroken]            │   │
│  │ [✅ Goedkeuren & versturen]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  DETAIL PER MEDEWERKER                     │
│  ┌─────────────────────────────────────┐   │
│  │ Jan de Vries                        │   │
│  │ Basis uren:     147u × €18,50 = €2.720│  │
│  │ Overuren:        12u × €23,13 = €278  │  │
│  │ Nacht toeslag:   32u × €3,70 = €118   │  │
│  │ ──────────────────────────────────  │   │
│  │ Bruto totaal:               €3.116  │   │
│  │ Netto (geschat):            €2.847  │   │
│  │                                     │   │
│  │ [Details] [Loonstrook] [Wijzig]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Maria Jansen                        │   │
│  │ Basis uren:     96u × €17,25 = €1.656 │  │
│  │ Weekend bonus:  16u × €2,50 = €40     │  │
│  │ ──────────────────────────────────  │   │
│  │ Bruto totaal:               €1.696  │   │
│  │ Netto (geschat):            €1.498  │   │
│  │                                     │   │
│  │ [Details] [Loonstrook] [Wijzig]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  AFWIJKINGEN & CORRECTIES                  │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ Ahmed Khan - Uren niet compleet  │   │
│  │    Werkdag 15/09 heeft geen check-out│  │
│  │    Tijd: 08:00-?? (8u aangenomen)    │   │
│  │                                     │   │
│  │ 🔄 Auto-correcties toegepast (3x)   │   │
│  │    • Pauzeaftrek toegevoegd         │   │
│  │    • CAO toeslagen berekend         │   │
│  │                                     │   │
│  │ [Afwijkingen beheren]               │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Employee Detail Modal

```
┌─────────────────────────────────────────────┐
│  MEDEWERKER DOSSIER                  [✕]   │
│  Jan de Vries                              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Profielfoto 80x80]                 │   │
│  │                                     │   │
│  │ Jan de Vries                        │   │
│  │ ⭐ 4.7 performance rating           │   │
│  │ 📍 Amsterdam • In dienst sinds 2021│   │
│  │ 💼 Objectbeveiliging specialist    │   │
│  │                                     │   │
│  │ Status: ✅ Actief                   │   │
│  │ Contract: Vast, 36 uur/week        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  PRESTATIE METRICS                         │
│  ┌─────────────────────────────────────┐   │
│  │ Laatste 3 maanden:                 │   │
│  │                                     │   │
│  │ Shifts voltooid:      47/47 (100%)  │   │
│  │ Punctualiteit:        98% on-time   │   │
│  │ Client ratings:       ⭐ 4.8 gem.   │   │
│  │ No-shows:            0              │   │
│  │                                     │   │
│  │ Verzuim dit jaar:     2 dagen (0.6%)│   │
│  │ Overuren:            12% van totaal │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  COMPETENTIES & CERTIFICATEN               │
│  ┌─────────────────────────────────────┐   │
│  │ Specialisaties:                     │   │
│  │ [Objectbeveiliging] [Nachtdiensten] │   │
│  │ [Teamleider] [Engels B2]           │   │
│  │                                     │   │
│  │ Certificaten:                       │   │
│  │ ✅ Beveiligingspas (geldig t/m 2027)│   │
│  │ ⚠️ VOG (verloopt 14 dagen)          │   │
│  │ ✅ VCA Basis (geldig t/m 2025)      │   │
│  │ ✅ EHBO (geldig t/m 2024)           │   │
│  │                                     │   │
│  │ [Document beheer]                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  FINANCIAL DETAILS                         │
│  ┌─────────────────────────────────────┐   │
│  │ Huidig salaris: €18,50/uur         │   │
│  │ Contract uren:  36 uur/week         │   │
│  │ Gemiddeld/mnd:  €2.847 bruto       │   │
│  │                                     │   │
│  │ Deze maand:     147u gewerkt        │   │
│  │ Overuren:       12u (125% tarief)   │   │
│  │ Toeslagen:      €234 (nachten)      │   │
│  │                                     │   │
│  │ [Salarishistorie] [Verhogingen]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [📧 Verstuur bericht] [📞 Bel direct]     │
│  [📝 Performance review] [⚙️ Instellingen] │
│                                             │
└─────────────────────────────────────────────┘
```

## Nieuwe Medewerker Modal

```
┌─────────────────────────────────────────────┐
│  NIEUWE MEDEWERKER TOEVOEGEN         [✕]   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  PERSOONLIJKE GEGEVENS                     │
│  ┌─────────────────────────────────────┐   │
│  │ Voornaam: *                         │   │
│  │ [Jan                              ] │   │
│  │                                     │   │
│  │ Achternaam: *                       │   │
│  │ [de Vries                         ] │   │
│  │                                     │   │
│  │ Geboortedatum: *                    │   │
│  │ [15-03-1990                       ] │   │
│  │                                     │   │
│  │ BSN: *                              │   │
│  │ [123456789                        ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  CONTACTGEGEVENS                           │
│  ┌─────────────────────────────────────┐   │
│  │ Telefoon: *                         │   │
│  │ [06-12345678                      ] │   │
│  │                                     │   │
│  │ Email: *                            │   │
│  │ [jan.devries@email.nl             ] │   │
│  │                                     │   │
│  │ Adres:                              │   │
│  │ [Damrak 123, 1012 AB Amsterdam   ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  CONTRACT DETAILS                          │
│  ┌─────────────────────────────────────┐   │
│  │ Functie:                            │   │
│  │ [Beveiliger                    ▼]   │   │
│  │                                     │   │
│  │ Contract type:                      │   │
│  │ [Vast contract                 ▼]   │   │
│  │                                     │   │
│  │ Uren per week:                      │   │
│  │ [36                               ] │   │
│  │                                     │   │
│  │ Uurtarief:                          │   │
│  │ [€18,50                           ] │   │
│  │                                     │   │
│  │ Startdatum:                         │   │
│  │ [01-10-2024                       ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  COMPETENTIES                              │
│  ┌─────────────────────────────────────┐   │
│  │ Specialisaties:                     │   │
│  │ ☐ Objectbeveiliging                │   │
│  │ ☐ Evenementbeveiliging             │   │
│  │ ☐ Mobiele surveillance             │   │
│  │ ☐ Horecaportier                    │   │
│  │                                     │   │
│  │ Taalvaardigheden:                   │   │
│  │ Nederlands: [Native ▼]             │   │
│  │ Engels: [B1 ▼]                     │   │
│  │                                     │   │
│  │ Beschikbaarheid:                    │   │
│  │ ☐ Dagdiensten ☐ Nachtdiensten     │   │
│  │ ☐ Weekenden  ☐ Feestdagen         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Annuleren]         [Volgende: Documenten]│
│                                             │
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Employee Cards
- **Background**: White
- **Border**: 1px solid light border
- **Border radius**: 12px
- **Padding**: 16px
- **Shadow**: 0 2px 4px rgba(0,0,0,0.05)

#### Card Elements:
1. **Profile Photo**
   - Size: 60x60px, circular
   - Default: Initials if no photo
   - Status indicator: Dot overlay for online/offline

2. **Name & Job Title**
   - Name: Bold, 16px
   - Title: Regular, 14px, muted

3. **Contract Information**
   - Hours/week + salary/month
   - Contract type indicator

4. **Status Indicators**
   - ✅ Active/Available - Success green
   - 🟡 Warning/Issue - Warning amber
   - 🔴 Problem/Unavailable - Destructive red
   - 🟢 Online - Real-time status

5. **Document Status Row**
   - Mini badges: Pas ✅ VOG ⚠️ VCA ✅
   - Color coding per document type
   - Warning text for expiring docs

6. **Skills Tags**
   - Background: Light electric blue
   - Text: Electric blue
   - Removable: X icon

7. **Performance Metrics**
   - Stars for rating
   - Percentage for various KPIs

8. **Action Buttons**
   - Primary actions: Rooster, Uren
   - Secondary actions: Dossier, Contact
   - Height: 36px, border radius: 6px

### Tab System
- **Background**: White
- **Active tab**: Primary blue bottom border (3px)
- **Badge notifications**: Red dot with count
- **Swipe navigation**: Mobile gesture support

### Document Management
- **Status colors**:
  - ✅ Valid: Success green
  - ⚠️ Expiring: Warning amber (<30 days)
  - 🔴 Expired: Destructive red
  - 📧 Pending: Info blue (reminders sent)
  - 🚫 Blocked: Dark red (shift restrictions)

### Performance Indicators
- **Rating stars**: Gold fill, grey outline
- **Percentage bars**: Green for good (>90%), amber for ok (70-89%), red for poor (<70%)
- **Trend arrows**: ↑ Green, → Amber, ↓ Red

### Payroll Elements
- **Currency formatting**: Euro symbol, thousand separators
- **Calculation breakdown**: Itemized with subtotals
- **Status indicators**:
  - 🟡 Concept/Draft
  - ✅ Approved
  - 📤 Sent
  - 💰 Paid

## Business Logic

### Document Lifecycle
1. **Upload**: OCR scanning for data extraction
2. **Verification**: Admin approval required
3. **Expiry tracking**: Automated 30/14/7 day reminders
4. **Renewal process**: Streamlined resubmission
5. **Compliance blocking**: Automatic shift restrictions

### Performance Tracking
- **Client ratings**: Aggregated from shift feedback
- **Punctuality**: GPS check-in time tracking
- **Reliability**: No-show and cancellation rates
- **Quality metrics**: Issue reports and resolutions

### Payroll Automation
- **Hours import**: From shift completion data
- **CAO calculations**: Automatic allowances
- **Overtime rules**: Hours > 40/week at 125%
- **Night shifts**: Additional hourly rate
- **Export formats**: Excel, XML for payroll systems

## Integration Features

### HR Systems
- **AFAS integration**: Employee master data sync
- **Personio**: HR workflow automation
- **BambooHR**: Performance review cycles

### Document Management
- **Digital signatures**: For contracts and forms
- **Secure storage**: Encrypted document vault
- **Compliance export**: Ready for SFPB inspections

### Communication
- **Bulk messaging**: SMS and email campaigns
- **Shift notifications**: Automatic roster updates
- **Performance feedback**: Structured review forms

## Compliance & Audit

### CAO Monitoring
- **Working time limits**: Automatic enforcement
- **Rest period tracking**: Between shifts
- **Vacation entitlement**: Accrual and usage
- **Sick leave management**: Reporting and tracking

### Data Protection
- **GDPR compliance**: Consent management
- **Data retention**: Automatic cleanup
- **Access logging**: Who viewed what when
- **Employee rights**: Data portability, deletion

### Audit Trail
- **Change tracking**: All modifications logged
- **User attribution**: Who made changes
- **Approval workflows**: Multi-level authorization
- **Report generation**: Compliance documentation