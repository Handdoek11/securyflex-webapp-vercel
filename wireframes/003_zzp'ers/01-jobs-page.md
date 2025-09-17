# Securyflex - Vind Jobs Page

## Kleurenpalet (uit globals.css)
- **Primary Blue**: oklch(0.45 0.22 240) - Professional blue (#0066FF style)
- **Electric Blue (Accent)**: oklch(0.65 0.25 265) - Voor accenten en highlights
- **Success Green**: oklch(0.62 0.18 145) - Voor positieve acties
- **Warning Amber**: oklch(0.75 0.15 70) - Voor waarschuwingen
- **Destructive Red**: oklch(0.577 0.245 27.325) - Voor errors
- **Info Blue**: oklch(0.65 0.15 220) - Voor informatieve badges
- **Text Dark**: oklch(0.15 0.01 240) - Hoofdtekst
- **Text Muted**: oklch(0.45 0.01 240) - Secundaire tekst
- **Border**: oklch(0.92 0.005 240) - Lichte borders
- **Background**: oklch(0.992 0.003 240) - Achtergrond met subtiele blauwe tint

## Complete Wireframe Specificaties

```
┌─────────────────────────────────────────────┐
│  📍 13:21  📶 📶 📶  🔋 92%                 │  <- Status bar (systeem)
├─────────────────────────────────────────────┤
│                                             │
│  VIND JOUW JOB                        [🔍]  │  <- Header (bold, 20px)
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │  <- Profiel melding
│  │  ⚠️  Geld verdienen?                │   │     (alleen tonen als 
│  │                                     │   │     profiel < 100%)
│  │  Om op jobs te reageren moet je    │   │     Amber warning bg
│  │  eerst je profiel compleet maken.   │   │
│  │                                     │   │
│  │  ┌─────────────────────────────┐   │   │
│  │  │   Maak profiel compleet      │   │   │  <- Primary blue button
│  │  └─────────────────────────────┘   │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ┌───────────────────────────────┐   │   │  <- Job Card 1
│  │ │                               │   │   │
│  │ │     [Bedrijfsfoto/gebouw]     │   │   │  <- Grote header foto
│  │ │                               │   │   │
│  │ │                          [♥]  │   │   │  <- Hartje op foto
│  │ └───────────────────────────────┘   │   │
│  │                                     │   │
│  │  EG Services                       │   │  <- Electric blue text
│  │  🚗 Verkoopwerkzaamheden bij       │   │
│  │     Esso Kriekampen                │   │
│  │                                     │   │
│  │  ┌──────────────────────┐          │   │
│  │  │  Speciaal voor jou   │          │   │  <- Electric blue badge
│  │  └──────────────────────┘          │   │
│  │                                     │   │
│  │  Di 16 sep        + 85 dagen       │   │
│  │  13:30 - 21:00    Oirschot         │   │
│  │                                     │   │
│  │                    ┌──────────┐    │   │
│  │                    │ € 16,00  │    │   │  <- Primary blue bg
│  │                    └──────────┘    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ┌───────────────────────────────┐   │   │  <- Job Card 2
│  │ │                               │   │   │
│  │ │     [Bedrijfsfoto/gebouw]     │   │   │
│  │ │                               │   │   │
│  │ │                          [♡]  │   │   │  <- Niet favoriet
│  │ └───────────────────────────────┘   │   │
│  │                                     │   │
│  │  Securitas                         │   │  <- Electric blue text
│  │  🔒 Objectbeveiliging              │   │
│  │                                     │   │
│  │  ┌──────────────┐                  │   │
│  │  │   Urgent     │                  │   │  <- Warning amber badge
│  │  └──────────────┘                  │   │
│  │                                     │   │
│  │  Wo 17 sep        1 dag            │   │
│  │  22:00 - 06:00    Amsterdam        │   │
│  │                                     │   │
│  │                    ┌──────────┐    │   │
│  │                    │ € 21,50  │    │   │  <- Primary blue bg
│  │                    └──────────┘    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ┌───────────────────────────────┐   │   │  <- Job Card 3
│  │ │                               │   │   │
│  │ │     [Bedrijfsfoto/gebouw]     │   │   │
│  │ │                               │   │   │
│  │ │                          [♥]  │   │   │  <- Favoriet
│  │ └───────────────────────────────┘   │   │
│  │                                     │   │
│  │  G4S                               │   │  <- Electric blue text
│  │  👥 Evenementbeveiliging           │   │
│  │                                     │   │
│  │  ┌────────────────┐                │   │
│  │  │  Weekend bonus  │                │   │  <- Success green badge
│  │  └────────────────┘                │   │
│  │                                     │   │
│  │  Za 20 sep        2 dagen          │   │
│  │  14:00 - 23:00    Utrecht          │   │
│  │                                     │   │
│  │                    ┌──────────┐    │   │
│  │                    │ € 19,00  │    │   │  <- Primary blue bg
│  │                    └──────────┘    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│              [Scroll voor meer ↓]           │  <- Scroll indicator
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│            ┌────────────────┐               │
│            │   🎚️ Filter    │               │  <- Electric blue button
│            └────────────────┘               │  <- (floating, boven navbar)
│                                             │
├─────────────────────────────────────────────┤
│  [🔍]     [💼]     [⏰]     [👤]            │  <- Bottom navigation
│  Vind    Mijn     Uren    Profiel          │
│  Jobs    Shifts                            │
│  ━━━━                                      │  <- Primary blue indicator
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Header
- **Font**: System font, bold, 20px
- **Positie**: Links uitgelijnd met 16px padding
- **Zoek icoon**: Rechts, 44x44px tap target

### Profiel Waarschuwing Container
- **Achtergrond**: Light warning (#FFF3E0 / oklch(0.97 0.05 70))
- **Border**: 1px solid oklch(0.75 0.15 70) - Amber warning
- **Border radius**: 8px
- **Padding**: 16px
- **Margin**: 0 16px 16px 16px
- **Icon**: ⚠️ warning emoji of custom icon
- **Button**: 
  - Full width binnen container
  - Primary kleur: oklch(0.45 0.22 240) - Professional blue
  - Height: 48px
  - Border radius: 24px

### Job Cards
- **Achtergrond**: Wit
- **Border**: 1px solid #E0E0E0
- **Border radius**: 12px
- **Margin**: 0 16px 12px 16px
- **Padding**: 0 (foto full width bovenaan)
- **Shadow**: 0 2px 4px rgba(0,0,0,0.05)

#### Card Elementen:
1. **Header foto**
   - Full width van card
   - Height: 140px
   - Border radius: 12px 12px 0 0 (alleen boven)
   - Object-fit: cover

2. **Hartje (favoriet)**
   - Positie: Absolute op foto, rechts boven
   - 24x24px tap target
   - ♥ (filled wit) of ♡ (outline wit)
   - Margin: 12px van rand
   - Schaduw voor zichtbaarheid op foto

3. **Content area**
   - Padding: 16px
   
4. **Bedrijfsnaam**
   - Font: Bold, 16px
   - Color: oklch(0.65 0.25 265) - Electric blue (accent color)

5. **Functietitel**
   - Font: Regular, 14px
   - Color: oklch(0.25 0.01 240) - Dark text
   - Met emoji indicator (🚗/🔒/👥/🚔)

6. **Badge**
   - Padding: 4px 12px
   - Border radius: 12px
   - Font: 12px, medium
   - Margin: 8px 0
   - Varianten:
     - "Speciaal voor jou" - Electric blue: oklch(0.65 0.25 265)
     - "Urgent" - Warning: oklch(0.75 0.15 70)
     - "Weekend bonus" - Success: oklch(0.62 0.18 145)
     - "Nieuw" - Info: oklch(0.65 0.15 220)

7. **Details regel 1**
   - Datum | Duur/dagen
   - Font: 13px
   - Color: oklch(0.45 0.01 240) - Muted text

8. **Details regel 2**
   - Tijden | Locatie
   - Font: 13px
   - Color: oklch(0.45 0.01 240) - Muted text

9. **Tarief pill**
   - Position: Rechts onder in content area
   - Padding: 6px 16px
   - Border radius: 20px
   - Background: oklch(0.45 0.22 240) - Primary blue
   - Border: none
   - Font: Bold, 16px
   - Color: #FFFFFF - White text

### Filter Button
- **Positie**: Fixed bottom, boven navbar
- **Width**: Auto (padding 24px horizontaal)
- **Height**: 48px
- **Border radius**: 24px
- **Achtergrond**: oklch(0.65 0.25 265) - Electric blue accent
- **Text color**: White
- **Shadow**: 0 4px 12px rgba(0,0,0,0.15)
- **Margin bottom**: 70px (ruimte voor navbar)

### Bottom Navigation
- **Height**: 56px
- **Achtergrond**: oklch(1 0 0) - White
- **Border top**: 1px solid oklch(0.92 0.005 240) - Light border
- **Items**: 4 tabs, gelijk verdeeld
- **Active color**: oklch(0.45 0.22 240) - Primary blue
- **Inactive color**: oklch(0.45 0.01 240) - Muted text
- **Active indicator**: 2px lijn onder actieve tab in primary blue
- **Icons**: 24px
- **Labels**: 10px, onder icons

## Interactie States

### Tap/Press States
- **Job card**: Lichte overlay (oklch(0.45 0.22 240) bij 5% opacity)
- **Filter button**: Schaal 0.95
- **Hartje**: Animatie van leeg naar gevuld
- **CTA button**: Donkerdere tint (oklch(0.40 0.20 240))

### Scroll Behavior
- **Header**: Blijft sticky bovenaan
- **Profiel waarschuwing**: Scrollt mee
- **Job cards**: Infinite scroll of pagination
- **Filter button**: Blijft floating

### Loading States
- **Initial load**: Skeleton screens voor cards
- **Load more**: Spinner onder laatste card
- **Pull to refresh**: Standard iOS/Android pattern

## Lege State (geen jobs)
```
┌─────────────────────────────────────────────┐
│                                             │
│              😕                             │
│                                             │
│      Geen jobs gevonden                    │
│                                             │
│   Probeer je filters aan te passen         │
│   of kom later terug voor nieuwe           │
│   mogelijkheden.                           │
│                                             │
│         [Filters aanpassen]                │
│                                             │
└─────────────────────────────────────────────┘
```