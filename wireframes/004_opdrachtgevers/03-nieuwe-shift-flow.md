# Securyflex - Nieuwe Shift Flow

## Kleurenpalet (consistent met andere apps)
- **Primary Blue**: oklch(0.45 0.22 240)
- **Electric Blue (Accent)**: oklch(0.65 0.25 265)
- **Success Green**: oklch(0.62 0.18 145)
- **Warning Amber**: oklch(0.75 0.15 70)
- **Destructive Red**: oklch(0.577 0.245 27.325)
- **Text Dark**: oklch(0.15 0.01 240)
- **Text Muted**: oklch(0.45 0.01 240)

## STAP 1 VAN 5 - BASIS INFORMATIE

```
┌─────────────────────────────────────────────┐
│  NIEUWE SHIFT                        [✕]   │
│  Stap 1 van 5 - Basis informatie           │
│                                             │
│  ▓▓▓▓░░░░░░░░░░░░░░░░  20%                │  <- Progress bar
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  TYPE BEVEILIGING *                        │
│  ┌─────────────────────────────────────┐   │
│  │ [Objectbeveiliging            ▼]    │   │  <- Dropdown
│  └─────────────────────────────────────┘   │
│                                             │
│  LOCATIE DETAILS *                         │
│  ┌─────────────────────────────────────┐   │
│  │ Naam locatie                        │   │
│  │ [Terminal 2, Gate B               ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Adres                               │   │
│  │ [Schiphol Airport                 ] │   │
│  │ [1118 AA Schiphol                 ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  RISICOPROFIEL                             │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Laag risico                       │   │  <- Radio buttons
│  │ ● Gemiddeld risico                  │   │
│  │ ○ Hoog risico                       │   │
│  │ ○ Zeer hoog risico (extra vereisten)│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  INSTRUCTIES VOOR BEVEILIGERS              │
│  ┌─────────────────────────────────────┐   │
│  │ [Toegangscontrole bij Gate B.      │   │  <- Textarea
│  │  Speciale aandacht voor bagage     │   │
│  │  controle. Samenwerking met        │   │
│  │  Marechaussee vereist.          ]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  CONTACT TER PLAATSE                       │
│  ┌─────────────────────────────────────┐   │
│  │ Naam: [John Smith                 ] │   │
│  │ Tel:  [06-12345678                ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [Annuleren]            [Volgende: Planning]│  <- Navigation
│                                             │
└─────────────────────────────────────────────┘
```

## STAP 2 VAN 5 - PLANNING

```
┌─────────────────────────────────────────────┐
│  NIEUWE SHIFT                        [✕]   │
│  Stap 2 van 5 - Planning                   │
│                                             │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░  40%                 │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  SHIFT TYPE                                │
│  ┌─────────────────────────────────────┐   │
│  │ ● Eenmalige shift                   │   │
│  │ ○ Terugkerende shift                │   │
│  │ ○ Project (meerdere dagen)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  DATUM & TIJD *                            │
│  ┌─────────────────────────────────────┐   │
│  │ 📅 Datum                            │   │
│  │ [20 september 2024          ▼]     │   │
│  │                                     │   │
│  │ ⏰ Starttijd    ⏰ Eindtijd         │   │
│  │ [14:00    ▼]   [22:00    ▼]       │   │
│  │                                     │   │
│  │ Totaal: 8 uur                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  AANTAL BEVEILIGERS *                      │
│  ┌─────────────────────────────────────┐   │
│  │ [- ]  2  [+]                        │   │  <- Number stepper
│  │                                     │   │
│  │ ☐ Teamleider vereist (+€3/uur)     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  PAUZE REGELING                            │
│  ┌─────────────────────────────────────┐   │
│  │ [Standaard CAO pauze          ▼]   │   │
│  │ 30 min bij 8 uur dienst            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  SHIFT PATROON (optioneel)                 │
│  ┌─────────────────────────────────────┐   │
│  │ ☐ Ma  ☐ Di  ☐ Wo  ☐ Do            │   │  <- Weekday selector
│  │ ☐ Vr  ☐ Za  ☐ Zo                  │   │
│  │                                     │   │
│  │ Herhalen tot: [__________]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [← Vorige]           [Volgende: Vereisten] │
│                                             │
└─────────────────────────────────────────────┘
```

## STAP 3 VAN 5 - VEREISTEN

```
┌─────────────────────────────────────────────┐
│  NIEUWE SHIFT                        [✕]   │
│  Stap 3 van 5 - Vereisten                  │
│                                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░  60%                  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  VERPLICHTE DOCUMENTEN                     │
│  ┌─────────────────────────────────────┐   │
│  │ ✓ Geldige beveiligingspas          │   │  <- Pre-selected
│  │ ✓ VOG (niet ouder dan 12 mnd)      │   │     (always required)
│  │ ☐ VCA Basis                        │   │
│  │ ☐ VCA VOL                          │   │
│  │ ☐ EHBO certificaat                 │   │
│  │ ☐ BHV certificaat                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  SPECIALISATIES                            │
│  ┌─────────────────────────────────────┐   │
│  │ ☐ Evenementbeveiliging             │   │
│  │ ☐ Horecaportier                    │   │
│  │ ☐ Winkelsurveillance               │   │
│  │ ☐ Persoonsbeveiliging              │   │
│  │ ☐ Mobiele surveillance (rijbewijs) │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  TAALVAARDIGHEDEN                          │
│  ┌─────────────────────────────────────┐   │
│  │ Nederlands: [Native ▼]              │   │
│  │ Engels:     [B1+    ▼]              │   │
│  │ + Andere taal toevoegen             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  MINIMUM ERVARING                          │
│  ┌─────────────────────────────────────┐   │
│  │ [Minimaal 1 jaar ervaring    ▼]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  FYSIEKE VEREISTEN                         │
│  ┌─────────────────────────────────────┐   │
│  │ ☐ Langdurig staan (8+ uur)         │   │
│  │ ☐ Tillen (25+ kg)                  │   │
│  │ ☐ Nachtdienst geschikt              │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [← Vorige]             [Volgende: Budget]  │
│                                             │
└─────────────────────────────────────────────┘
```

## STAP 4 VAN 5 - BUDGET & TARIEF

```
┌─────────────────────────────────────────────┐
│  NIEUWE SHIFT                        [✕]   │
│  Stap 4 van 5 - Budget & Tarief            │
│                                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░  80%                   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  TARIEF STRATEGIE                          │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Marktconform tarief (aanbevolen) │   │
│  │   €19-22/uur voor deze functie     │   │
│  │                                     │   │
│  │ ● Eigen tarief instellen            │   │
│  │   Minimum: €18,00  Maximum: €25,00 │   │
│  │                                     │   │
│  │ ○ Bieden (hoogste bieder wint)     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  UURTARIEF BEVEILIGER *                    │
│  ┌─────────────────────────────────────┐   │
│  │ € [20,50] per uur                   │   │  <- Input field
│  │                                     │   │
│  │ ℹ️ Gemiddeld voor deze functie:     │   │
│  │    €19,50 - €22,00                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  TOESLAGEN                                 │
│  ┌─────────────────────────────────────┐   │
│  │ ☐ ORT (Onregelmatigheidstoeslag)   │   │
│  │   Automatisch berekend volgens CAO │   │
│  │                                     │   │
│  │ ☐ Reiskostenvergoeding             │   │
│  │   [€0,21/km ▼] max: [50km ▼]      │   │
│  │                                     │   │
│  │ ☐ Maaltijdvergoeding               │   │
│  │   €[15,00] bij 8+ uur dienst       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  KOSTEN OVERZICHT                          │
│  ┌─────────────────────────────────────┐   │
│  │ Uurtarief:           €20,50        │   │  <- Summary box
│  │ Service fee:         €4,10/uur     │   │     (Light bg)
│  │ Toeslagen:           ~€2,50/uur    │   │
│  │ ─────────────────────────────      │   │
│  │ Totaal per uur:     €27,10        │   │
│  │                                     │   │
│  │ Geschatte totaal:                  │   │
│  │ 2 beveiligers × 8 uur = €433,60   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  BUDGET LIMIET (optioneel)                 │
│  ┌─────────────────────────────────────┐   │
│  │ Maximum budget: €[500,00]          │   │
│  │ ☐ Waarschuw bij 80% budget         │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [← Vorige]          [Volgende: Review]     │
│                                             │
└─────────────────────────────────────────────┘
```

## STAP 5 VAN 5 - REVIEW & BEVESTIGEN

```
┌─────────────────────────────────────────────┐
│  NIEUWE SHIFT                        [✕]   │
│  Stap 5 van 5 - Review & Bevestigen        │
│                                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100%                │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  SHIFT OVERZICHT                           │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 Terminal 2, Gate B               │   │
│  │     Schiphol Airport                │   │
│  │                                     │   │
│  │ 📅 Vrijdag 20 september 2024       │   │
│  │ ⏰ 14:00 - 22:00 (8 uur)           │   │
│  │                                     │   │
│  │ 👥 2 beveiligers nodig             │   │
│  │ 🎯 Objectbeveiliging               │   │
│  │ ⚠️ Gemiddeld risico                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  VEREISTEN                                 │
│  ┌─────────────────────────────────────┐   │
│  │ Documenten:                         │   │
│  │ • Beveiligingspas ✓                │   │
│  │ • VOG ✓                            │   │
│  │ • VCA Basis ✓                      │   │
│  │                                     │   │
│  │ Talen:                              │   │
│  │ • Nederlands: Native               │   │
│  │ • Engels: B1+                      │   │
│  │                                     │   │
│  │ Ervaring: Minimaal 1 jaar          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  KOSTEN                                    │
│  ┌─────────────────────────────────────┐   │
│  │ Uurtarief:        €20,50/uur       │   │
│  │ Service fee:      €4,10/uur        │   │
│  │ ORT toeslag:      €2,50/uur        │   │
│  │ ─────────────────────────────      │   │
│  │ Totaal per uur:   €27,10          │   │
│  │                                     │   │
│  │ 2 beveiligers × 8 uur = €433,60   │   │
│  │                                     │   │
│  │ Geschatte matches: 23 beveiligers  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  INSTRUCTIES                               │
│  ┌─────────────────────────────────────┐   │
│  │ "Toegangscontrole bij Gate B.      │   │
│  │ Speciale aandacht voor bagage      │   │
│  │ controle. Samenwerking met         │   │
│  │ Marechaussee vereist."             │   │
│  │                                     │   │
│  │ Contact: John Smith (06-12345678)  │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [← Vorige]    [💾 Bewaar als concept]     │
│                [🚀 Publiceer shift]        │  <- Primary action
│                                             │
└─────────────────────────────────────────────┘
```

## Success Modal (na publiceren)

```
┌─────────────────────────────────────────────┐
│  SHIFT GEPUBLICEERD! ✅                     │
│                                             │
│  Je shift is succesvol gepubliceerd en     │
│  wordt nu getoond aan geschikte           │
│  beveiligers.                              │
│                                             │
│  📊 23 beveiligers komen in aanmerking     │
│  🔔 15 notificaties verzonden             │
│  ⏱️ Eerste reacties verwacht binnen 30 min │
│                                             │
│  [Bekijk matches] [Naar dashboard]         │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Progress Bar
- **Height**: 8px
- **Background**: Light grey
- **Filled**: Primary blue
- **Border radius**: 4px
- **Animation**: Smooth transitions tussen stappen

### Step Navigation
- **Previous button**: Outline style, electric blue
- **Next button**: Filled style, primary blue
- **Height**: 48px
- **Border radius**: 8px

### Form Elements

#### Text Inputs
- **Height**: 48px
- **Border**: 1px solid light border
- **Border radius**: 8px
- **Focus**: Electric blue border, subtle glow
- **Font**: 16px voor input, 14px voor labels

#### Dropdowns
- **Native mobile**, custom desktop styling
- **Arrow icon**: Chevron down
- **Selected**: Primary blue accent

#### Radio Buttons
- **Size**: 20px
- **Color**: Primary blue when selected
- **Labels**: 16px, tappable

#### Checkboxes
- **Size**: 20px
- **Color**: Primary blue when checked
- **Touch target**: 44px minimum

#### Number Steppers
- **Buttons**: 44x44px touch targets
- **Center number**: Bold, 18px
- **Disabled state**: 50% opacity

### Cost Summary Box
- **Background**: Light electric blue tint
- **Border**: 1px solid electric blue
- **Border radius**: 8px
- **Padding**: 16px
- **Separator line**: Dashed border

### Validation
- **Required fields**: Red border + message
- **Valid fields**: Green checkmark
- **Real-time validation**: Op blur/input

### Auto-calculations
- **Total hours**: Start/end time difference
- **Cost breakdown**: Real-time updates
- **Match estimation**: Live count van beschikbare beveiligers

## Interactie States

### Step Transitions
- **Slide animation**: Links/rechts bij vorige/volgende
- **Form validation**: Voorkomt doorgaan bij incomplete stap
- **Auto-save**: Concept wordt automatisch bewaard

### Dynamic Elements
- **Match counter**: Updates bij wijziging vereisten
- **Cost calculator**: Real-time herberekening
- **Availability check**: Live beschikbaarheid beveiligers

### Error Handling
- **Network errors**: Retry met progress indicator
- **Validation errors**: Inline feedback
- **Session timeout**: Auto-save + login prompt