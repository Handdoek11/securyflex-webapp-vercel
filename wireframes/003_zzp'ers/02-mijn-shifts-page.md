# Securyflex - Mijn Shifts Page

## Kleurenpalet (consistent met Vind Jobs)
- **Primary Blue**: oklch(0.45 0.22 240) - Professional blue
- **Electric Blue (Accent)**: oklch(0.65 0.25 265) - Voor accenten
- **Success Green**: oklch(0.62 0.18 145) - Voor bevestigde shifts
- **Warning Amber**: oklch(0.75 0.15 70) - Voor waarschuwingen
- **Destructive Red**: oklch(0.577 0.245 27.325) - Voor annuleringen
- **Text Dark**: oklch(0.15 0.01 240) - Hoofdtekst
- **Text Muted**: oklch(0.45 0.01 240) - Secundaire tekst
- **Border**: oklch(0.92 0.005 240) - Lichte borders

## Complete Wireframe Specificaties

```
┌─────────────────────────────────────────────┐
│  📍 13:21  📶 📶 📶  🔋 92%                 │  <- Status bar (systeem)
├─────────────────────────────────────────────┤
│                                             │
│  MIJN SHIFTS                                │  <- Header (Montserrat Black)
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┬───────────┬──────────┐       │
│  │ Aankomend│  Actief   │ Historie │       │  <- Tab navigation
│  │    (3)   │    (1)    │   (12)   │       │     Active: Primary blue
│  └──────────┴───────────┴──────────┘       │     met aantal in ()
│  ━━━━━━━━━━                                │  <- Active indicator
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  DEZE WEEK                                  │  <- Section header
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ┌───────────────────────────────┐   │   │  <- Shift Card 1
│  │ │                               │   │   │
│  │ │     [Bedrijfsfoto/gebouw]     │   │   │
│  │ │                               │   │   │
│  │ │      ✅ BEVESTIGD             │   │   │  <- Status overlay
│  │ └───────────────────────────────┘   │   │     op foto
│  │                                     │   │
│  │  G4S Security                       │   │  <- Electric blue
│  │  👥 Evenementbeveiliging           │   │
│  │  Amsterdam Arena                    │   │
│  │                                     │   │
│  │  📅 Morgen - Vr 20 sep             │   │  <- Prominente datum
│  │  ⏰ 18:00 - 02:00 (8 uur)          │   │
│  │  📍 Amsterdam                      │   │
│  │                                     │   │
│  │  ┌─────────────────────────────┐   │   │
│  │  │     📋 Shift details         │   │   │  <- Primary blue button
│  │  └─────────────────────────────┘   │   │
│  │                                     │   │
│  │  Contact opdrachtgever | Annuleren  │   │  <- Quick actions
│  │                                     │   │     (text links)
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ┌───────────────────────────────┐   │   │  <- Shift Card 2
│  │ │                               │   │   │
│  │ │     [Bedrijfsfoto/gebouw]     │   │   │
│  │ │                               │   │   │
│  │ │      ⚠️ START OVER 2 UUR      │   │   │  <- Warning overlay
│  │ └───────────────────────────────┘   │   │
│  │                                     │   │
│  │  Securitas                         │   │  <- Electric blue
│  │  🔒 Objectbeveiliging              │   │
│  │  Business Park Kronenburg          │   │
│  │                                     │   │
│  │  📅 Vandaag - Do 19 sep            │   │
│  │  ⏰ 14:00 - 22:00 (8 uur)          │   │
│  │  📍 Arnhem                         │   │
│  │                                     │   │
│  │  ┌─────────────────────────────┐   │   │
│  │  │     🚗 Navigatie starten     │   │   │  <- Action button
│  │  └─────────────────────────────┘   │   │
│  │                                     │   │
│  │  Contact opdrachtgever | Check-in   │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  VOLGENDE WEEK                             │  <- Section header
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ┌───────────────────────────────┐   │   │  <- Shift Card 3
│  │ │                               │   │   │
│  │ │     [Bedrijfsfoto/gebouw]     │   │   │
│  │ │                               │   │   │
│  │ │      ✅ BEVESTIGD             │   │   │
│  │ └───────────────────────────────┘   │   │
│  │                                     │   │
│  │  TSS Security                      │   │
│  │  🚔 Mobiele surveillance           │   │
│  │  Regio Utrecht                     │   │
│  │                                     │   │
│  │  📅 Ma 23 sep - Vr 27 sep         │   │  <- Meerdaagse shift
│  │  ⏰ Variabele tijden               │   │
│  │  📍 Utrecht e.o.                  │   │
│  │                                     │   │
│  │  💰 Geschat: € 850,00             │   │  <- Earnings preview
│  │                                     │   │
│  │  ┌─────────────────────────────┐   │   │
│  │  │     📋 Shift details         │   │   │
│  │  └─────────────────────────────┘   │   │
│  │                                     │   │
│  │  Contact opdrachtgever | Annuleren  │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [🔍]     [💼]     [⏰]     [👤]            │  <- Bottom navigation
│  Vind     Mijn    Uren    Profiel          │
│  Jobs    Shifts                            │
│           ━━━━━                            │  <- Active: Mijn Shifts
└─────────────────────────────────────────────┘
```

## Tab: Actief (tijdens een shift)

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬───────────┬──────────┐       │
│  │ Aankomend│  Actief   │ Historie │       │
│  │    (2)   │    (1)    │   (12)   │       │
│  └──────────┴───────────┴──────────┘       │
│              ━━━━━━━━                      │  <- Actief tab
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚡ ACTIEVE SHIFT                    │   │  <- Live indicator
│  │                                     │   │     (pulserend groen)
│  │ G4S Security                       │   │
│  │ 👥 Evenementbeveiliging           │   │
│  │ Amsterdam Arena                    │   │
│  │                                     │   │
│  │ ⏱️ Gestart om: 18:03              │   │
│  │ ⏰ Eindtijd: 02:00                │   │
│  │ 📍 Amsterdam Arena                 │   │
│  │                                     │   │
│  │ ┌─────────────────────────────┐   │   │
│  │ │    🛑 Check uit (01:45)     │   │   │  <- Rode button
│  │ └─────────────────────────────┘   │   │     met tijd indicatie
│  │                                     │   │
│  │ Noodcontact | Shift info           │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Tab: Historie

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬───────────┬──────────┐       │
│  │ Aankomend│  Actief   │ Historie │       │
│  │    (2)   │    (0)    │   (12)   │       │
│  └──────────┴───────────┴──────────┘       │
│                          ━━━━━━━━━         │  <- Historie tab
│                                             │
│  ┌─────────────────┐                       │
│  │  Maand  ▼  2024 ▼│                      │  <- Filter dropdowns
│  └─────────────────┘                       │
│                                             │
│  SEPTEMBER 2024                            │
│  Totaal verdiend: € 1.847,50               │  <- Maand overzicht
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Securitas                        │   │  <- Compact card
│  │ Objectbeveiliging                   │   │
│  │ 15 sep | 22:00-06:00 | Amsterdam    │   │
│  │                                     │   │
│  │ Status: Goedgekeurd    € 168,00 ✓   │   │  <- Betaalstatus
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ G4S Security                     │   │
│  │ Evenementbeveiliging                │   │
│  │ 12 sep | 18:00-02:00 | Utrecht      │   │
│  │                                     │   │
│  │ Status: In verwerking  € 152,00 ⏳  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ❌ TSS Security                     │   │  <- Geannuleerd
│  │ Mobiele surveillance                │   │
│  │ 8 sep | Geannuleerd                 │   │
│  │                                     │   │
│  │ Status: Geannuleerd    € 0,00       │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Tab Navigation
- **Height**: 44px
- **Background**: White
- **Border bottom**: 1px solid border color
- **Active tab**: 
  - Text color: oklch(0.45 0.22 240) - Primary blue
  - Indicator: 2px line onder tab
  - Font weight: Bold
- **Inactive tabs**: 
  - Text color: oklch(0.45 0.01 240) - Muted
  - Font weight: Regular
- **Counter badges**: 
  - In parentheses na tab naam
  - Zelfde kleur als tab text

### Shift Cards (uitgebreider dan job cards)
- **Zelfde basis als job cards** maar met:
- **Status overlay op foto**:
  - ✅ BEVESTIGD - Success green bg met wit
  - ⚠️ WARNING - Warning amber bg
  - ⚡ ACTIEF - Pulserend groen
  - ❌ GEANNULEERD - Destructive red
- **Meer details**:
  - Locatie naam toegevoegd
  - Prominente datum/tijd info
  - Earnings preview waar relevant
- **Action buttons**:
  - Primary action als filled button
  - Secondary actions als text links

### Section Headers
- **Font**: 12px, uppercase, bold
- **Color**: oklch(0.45 0.01 240) - Muted
- **Margin**: 16px horizontal, 12px vertical

### Historie Cards (compact)
- **Padding**: 12px
- **No photo** - compactere weergave
- **Status indicators**:
  - ✅ Voltooid/Goedgekeurd
  - ⏳ In verwerking  
  - ❌ Geannuleerd
- **Betaalstatus**: Rechts uitgelijnd met bedrag

### Lege States

#### Geen aankomende shifts:
```
┌─────────────────────────────────────────────┐
│              😴                             │
│                                             │
│      Geen aankomende shifts                │
│                                             │
│   Je hebt momenteel geen geplande          │
│   shifts. Bekijk beschikbare jobs!         │
│                                             │
│         [Vind nieuwe jobs]                 │  <- Primary blue button
│                                             │
└─────────────────────────────────────────────┘
```

## Interactie States

### Swipe Actions (optioneel)
- **Swipe left**: Quick cancel (met bevestiging)
- **Swipe right**: Quick check-in (wanneer relevant)

### Pull to Refresh
- Standaard iOS/Android pattern
- Laadt nieuwe shift updates

### Status Updates
- Real-time updates voor shift status
- Push notificaties voor belangrijke wijzigingen