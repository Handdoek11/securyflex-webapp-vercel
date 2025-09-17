# Securyflex - Uren Page

## Kleurenpalet (consistent met vorige pagina's)
- **Primary Blue**: oklch(0.45 0.22 240) - Professional blue
- **Electric Blue (Accent)**: oklch(0.65 0.25 265) - Voor accenten
- **Success Green**: oklch(0.62 0.18 145) - Voor goedgekeurde uren
- **Warning Amber**: oklch(0.75 0.15 70) - Voor ontbrekende uren
- **Info Blue**: oklch(0.65 0.15 220) - Voor informatieve meldingen
- **Text Dark**: oklch(0.15 0.01 240) - Hoofdtekst
- **Text Muted**: oklch(0.45 0.01 240) - Secundaire tekst
- **Border**: oklch(0.92 0.005 240) - Lichte borders

## Complete Wireframe Specificaties

```
┌─────────────────────────────────────────────┐
│  📍 13:21  📶 📶 📶  🔋 92%                 │  <- Status bar (systeem)
├─────────────────────────────────────────────┤
│                                             │
│  UREN REGISTRATIE                          │  <- Header (Montserrat Black)
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Week 38 • 16-22 september 2024     │   │  <- Week selector
│  │  [◀ Vorige]         [Volgende ▶]   │   │     met nav buttons
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  📊 WEEK OVERZICHT                  │   │  <- Summary card
│  │                                     │   │     (Electric blue accent)
│  │  Gewerkte uren:     32 / 40 uur    │   │
│  │  Status:            In behandeling  │   │
│  │  Te verdienen:      € 576,00       │   │
│  │                                     │   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░  80%        │   │  <- Progress bar
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  ⚠️ Let op: Uren voor dinsdag nog  │   │  <- Warning melding
│  │  niet ingevuld                      │   │     (amber background)
│  └─────────────────────────────────────┘   │
│                                             │
│  MAANDAG 16 SEPTEMBER                      │  <- Dag header
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ┌───────────────────────────────┐   │   │  <- Uren Card (met shift)
│  │ │                               │   │   │
│  │ │     [Bedrijfsfoto/gebouw]     │   │   │  <- Kleine foto
│  │ │                               │   │   │     (60px hoog)
│  │ └───────────────────────────────┘   │   │
│  │                                     │   │
│  │  G4S Security                       │   │  <- Electric blue
│  │  🔒 Objectbeveiliging              │   │
│  │                                     │   │
│  │  ┌─────────────┬─────────────┐     │   │
│  │  │   Start     │    Eind     │     │   │  <- Tijd inputs
│  │  │   08:00     │    16:00    │     │   │
│  │  └─────────────┴─────────────┘     │   │
│  │                                     │   │
│  │  ┌─────────────┬─────────────┐     │   │
│  │  │   Pauze     │    Uren     │     │   │
│  │  │   00:30     │    7.5      │     │   │  <- Auto-berekend
│  │  └─────────────┴─────────────┘     │   │
│  │                                     │   │
│  │  💰 Dagtotaal: € 135,00            │   │
│  │                                     │   │
│  │  [✓ Goedgekeurd door supervisor]   │   │  <- Status indicator
│  └─────────────────────────────────────┘   │
│                                             │
│  DINSDAG 17 SEPTEMBER                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         📅 Geen shift gepland       │   │  <- Lege dag
│  │                                     │   │
│  │    [+ Handmatig uren toevoegen]    │   │  <- Add button
│  │                                     │   │     (dashed border)
│  └─────────────────────────────────────┘   │
│                                             │
│  WOENSDAG 18 SEPTEMBER                     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ┌───────────────────────────────┐   │   │
│  │ │     [Bedrijfsfoto/gebouw]     │   │   │
│  │ └───────────────────────────────┘   │   │
│  │                                     │   │
│  │  Securitas                         │   │
│  │  👥 Evenementbeveiliging           │   │
│  │                                     │   │
│  │  ┌─────────────┬─────────────┐     │   │
│  │  │   Start     │    Eind     │     │   │
│  │  │   [18:00]   │   [02:00]   │     │   │  <- Invulbare velden
│  │  └─────────────┴─────────────┘     │   │     (nog niet ingevuld)
│  │                                     │   │
│  │  ┌─────────────┬─────────────┐     │   │
│  │  │   Pauze     │    Uren     │     │   │
│  │  │   [00:00]   │     --      │     │   │
│  │  └─────────────┴─────────────┘     │   │
│  │                                     │   │
│  │  💰 Dagtotaal: € --                │   │
│  │                                     │   │
│  │  [⏳ Wacht op invoer]               │   │  <- Status
│  └─────────────────────────────────────┘   │
│                                             │
│  [Scroll voor meer dagen ↓]                │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     📤 WEEKSTAAT VERSTUREN          │   │  <- Submit button
│  └─────────────────────────────────────┘   │  <- Primary blue, fixed
│                                             │
├─────────────────────────────────────────────┤
│  [🔍]     [💼]     [⏰]     [👤]            │  <- Bottom navigation
│  Vind     Mijn    Uren    Profiel          │
│  Jobs    Shifts                            │
│                    ━━━━                    │  <- Active: Uren
└─────────────────────────────────────────────┘
```

## Handmatig Uren Toevoegen Modal

```
┌─────────────────────────────────────────────┐
│  UREN TOEVOEGEN                      [✕]   │  <- Modal header
├─────────────────────────────────────────────┤
│                                             │
│  Datum: Dinsdag 17 september               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Selecteer bedrijf                   │   │
│  │ [G4S Security              ▼]       │   │  <- Dropdown
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Type werk                          │   │
│  │ [Objectbeveiliging        ▼]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────┬─────────┐                    │
│  │  Start  │  Eind   │                    │
│  │ [08:00] │ [16:00] │                    │
│  └─────────┴─────────┘                    │
│                                             │
│  ┌─────────┬─────────┐                    │
│  │  Pauze  │ Tarief  │                    │
│  │ [00:30] │ [€18,00]│                    │
│  └─────────┴─────────┘                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Notities (optioneel)                │   │
│  │ [                                   │   │
│  │                                     │   │
│  │                                   ] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Annuleren]           [Uren toevoegen]    │  <- Action buttons
│                                             │
└─────────────────────────────────────────────┘
```

## Weekstaat Overzicht (voor versturen)

```
┌─────────────────────────────────────────────┐
│  WEEKSTAAT CONTROLE                  [✕]   │
├─────────────────────────────────────────────┤
│                                             │
│  Week 38 • 16-22 september 2024            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Ma 16/09  G4S          7.5u  ✓     │   │  <- Compact lijst
│  │ Di 17/09  ---           ---  ⚠     │   │     met status
│  │ Wo 18/09  Securitas    8.0u  ✓     │   │
│  │ Do 19/09  TSS          7.5u  ✓     │   │
│  │ Vr 20/09  G4S          9.0u  ✓     │   │
│  │ Za 21/09  ---           ---  -     │   │
│  │ Zo 22/09  ---           ---  -     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ TOTAAL                              │   │
│  │ Gewerkte uren:        32.0 uur      │   │
│  │ Bruto loon:           € 576,00      │   │
│  │ Aantal shifts:        4             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ⚠️ Let op: Dinsdag heeft geen uren.       │
│  Weet je zeker dat je wilt versturen?      │
│                                             │
│  [Terug]              [Bevestig & Verstuur] │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Week Selector
- **Background**: White
- **Border**: 1px solid border color
- **Border radius**: 8px
- **Padding**: 12px
- **Navigation buttons**: 
  - Electric blue text
  - Tap area: 44x44px

### Week Overzicht Card
- **Background**: Lichte electric blue tint
- **Border**: 1px solid electric blue
- **Progress bar**: 
  - Filled: Primary blue
  - Empty: Light grey
  - Height: 8px
  - Border radius: 4px

### Uren Cards
- **Zelfde basis als shift cards** maar:
- **Kleinere foto**: 60px hoog ipv 140px
- **Tijd input velden**:
  - Width: 50% - 8px gap
  - Height: 44px
  - Border: 1px solid border color
  - Border radius: 8px
  - Font: 16px voor goede leesbaarheid
  - Filled: White background
  - Empty: Dashed border

### Status Indicators
- ✓ Goedgekeurd - Success green
- ⏳ Wacht op invoer - Warning amber
- ❌ Afgekeurd - Destructive red
- 📝 Concept - Muted grey

### Lege Dag Card
- **Background**: Light grey (oklch(0.96 0.005 240))
- **Border**: 2px dashed border color
- **Min height**: 80px
- **Add button**: Electric blue text

### Submit Button (Weekstaat versturen)
- **Position**: Fixed bottom (boven navbar)
- **Width**: Calc(100% - 32px)
- **Height**: 48px
- **Background**: Primary blue
- **Text**: White, bold
- **Border radius**: 24px
- **Disabled state**: 50% opacity wanneer niet alle dagen ingevuld

## Interactie States

### Input Focus
- **Border**: 2px solid electric blue
- **Shadow**: Subtle glow

### Validation
- **Rood border**: Bij foute invoer
- **Groene checkmark**: Bij correcte invoer

### Auto-calculate
- Uren worden automatisch berekend op basis van start/eind/pauze
- Dagtotaal wordt real-time geupdate

### Swipe Actions (optioneel)
- **Swipe left**: Verwijder uren entry
- **Swipe right**: Kopieer naar volgende dag

## Tabs Variant (alternatief)

```
┌─────────────────────────────────────────────┐
│  ┌────────┬────────┬────────┬────────┐     │
│  │ Week   │ Maand  │ Periode│ Export │     │  <- Tab opties
│  └────────┴────────┴────────┴────────┘     │
│  ━━━━━                                      │
```

Voor overzichten per maand of custom periodes.