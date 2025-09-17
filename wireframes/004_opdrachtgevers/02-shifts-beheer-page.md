# Securyflex - Shifts Beheer

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
│  SHIFTS BEHEER                              │  <- Header
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┬──────────┬──────────┐        │
│  │  Open    │  Actief  │ Historie │        │  <- Tab navigation
│  │   (3)    │   (12)   │  (148)   │        │
│  └──────────┴──────────┴──────────┘        │
│  ━━━━━                                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔍 Zoek of filter shifts...         │   │  <- Search bar
│  │ [Datum ▼] [Locatie ▼] [Status ▼]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  OPENSTAANDE SHIFTS                        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ URGENT - MORGEN                  │   │  <- Shift card urgent
│  │                                     │   │
│  │ Terminal 1 - Nachtdienst            │   │
│  │ 📍 Schiphol Airport                 │   │
│  │ 📅 Wo 17 sep • 22:00-06:00          │   │
│  │                                     │   │
│  │ Gevuld: 2/3 beveiligers             │   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░  66%           │   │
│  │                                     │   │
│  │ Vereisten:                          │   │
│  │ • VCA Basis                         │   │
│  │ • Engels B1+                        │   │
│  │                                     │   │
│  │ 💰 €22,50/uur + nachttoeslag        │   │
│  │                                     │   │
│  │ [Bekijk matches (8)] [Broadcast]    │   │  <- Action buttons
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Cargo Area - Mobiele surveillance   │   │  <- Regular shift card
│  │ 📍 Schiphol Cargo                   │   │
│  │ 📅 Vr 20 sep • 14:00-22:00          │   │
│  │                                     │   │
│  │ Gevuld: 0/2 beveiligers             │   │
│  │ ░░░░░░░░░░░░░░░░░░  0%             │   │
│  │                                     │   │
│  │ 💰 €19,50/uur                       │   │
│  │                                     │   │
│  │ [Start matching] [Bewerk]           │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │      ➕ NIEUWE SHIFT AANMAKEN       │   │  <- FAB button
│  └─────────────────────────────────────┘   │     (Primary blue)
│                                             │
├─────────────────────────────────────────────┤
│  [🏠]     [📋]     [👥]     [⚙️]           │
│ Dashboard Shifts Beveiligers Meer          │
│           ━━━━━                            │  <- Active: Shifts
└─────────────────────────────────────────────┘
```

## Tab: Actief

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐        │
│  │  Open    │  Actief  │ Historie │        │
│  │   (3)    │   (12)   │  (148)   │        │
│  └──────────┴──────────┴──────────┘        │
│           ━━━━━━                           │  <- Actief tab
│                                             │
│  VANDAAG ACTIEF                            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚡ LIVE - Terminal 3                 │   │  <- Live indicator
│  │                                     │   │     (pulserend groen)
│  │ Objectbeveiliging                   │   │
│  │ 4/4 beveiligers • 06:00-14:00      │   │
│  │                                     │   │
│  │ ✅ Iedereen ingecheckt             │   │
│  │ ⏰ Eindtijd: over 2 uur 15 min     │   │
│  │                                     │   │
│  │ Team:                               │   │
│  │ • Jan de Vries (06:03 ingecheckt)  │   │
│  │ • Maria Jansen (06:01 ingecheckt)  │   │
│  │ • Peter Smit (06:00 ingecheckt)    │   │
│  │ • Ahmed K. (06:02 ingecheckt)      │   │
│  │                                     │   │
│  │ [Live tracking] [Contact team]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ ISSUE - Gates B                  │   │  <- Problem shift
│  │                                     │   │
│  │ Toegangscontrole                    │   │
│  │ 1/2 beveiligers • 14:00-22:00      │   │
│  │                                     │   │
│  │ 🔴 Lisa Admin 15 min te laat       │   │
│  │ ⏰ Start: 15 minuten geleden        │   │
│  │                                     │   │
│  │ [Vervanger zoeken] [Contact Lisa]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Tab: Historie

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐        │
│  │  Open    │  Actief  │ Historie │        │
│  │   (3)    │   (12)   │  (148)   │        │
│  └──────────┴──────────┴──────────┘        │
│                          ━━━━━━━━           │  <- Historie tab
│                                             │
│  ┌─────────────────┐                       │
│  │  Periode  ▼  2024 ▼│                    │  <- Filter dropdowns
│  └─────────────────┘                       │
│                                             │
│  SEPTEMBER 2024                            │
│  Totaal kosten: € 47.892                   │  <- Maand overzicht
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Terminal 3 - Objectbeveiliging   │   │  <- Compact card
│  │ 15 sep • 06:00-14:00 • 4 beveiligers│  │
│  │ Status: Voltooid    € 896,00 ✓      │   │
│  │ Rating: ⭐⭐⭐⭐⭐ Uitstekend      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ Cargo Area - Surveillance        │   │
│  │ 14 sep • 22:00-06:00 • 2 beveiligers│  │
│  │ Status: Voltooid    € 456,00 ✓      │   │
│  │ Rating: ⭐⭐⭐⭐⚪ Goed            │   │
│  │ Opmerking: 1 beveiliger 10 min laat │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ❌ Gates B - Toegangscontrole       │   │  <- Geannuleerd
│  │ 12 sep • Geannuleerd door klant     │   │
│  │ Status: Geannuleerd € 0,00          │   │
│  │ Reden: Technische storing           │   │
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
  - Text color: Primary blue
  - Indicator: 2px line onder tab
  - Font weight: Bold
- **Counter badges**: In parentheses na tab naam

### Search & Filter Bar
- **Background**: Light grey
- **Border radius**: 8px
- **Padding**: 12px
- **Search icon**: 20px, muted color
- **Filter dropdowns**: Electric blue when active

### Shift Cards
- **Background**: White
- **Border**: 1px solid light border
- **Border radius**: 12px
- **Padding**: 16px
- **Shadow**: 0 2px 4px rgba(0,0,0,0.05)

#### Urgent Shift Cards
- **Border**: 2px solid warning amber
- **Header**: Warning amber background
- **Icon**: ⚠️ warning

#### Live Shift Cards (Actief tab)
- **Border**: 2px solid success green
- **Live indicator**: Pulserende groene dot
- **Real-time updates**: WebSocket verbinding

### Progress Bars (Bemanning)
- **Height**: 8px
- **Border radius**: 4px
- **Filled**: Success green voor vol, warning amber voor gedeeltelijk
- **Empty**: Light grey
- **Percentage**: Bold text rechts uitgelijnd

### Action Buttons
- **Primary**: Filled button, primary blue
- **Secondary**: Outline button, electric blue
- **Height**: 40px
- **Border radius**: 8px
- **Font**: Medium weight, 14px

### FAB Button (Nieuwe Shift)
- **Position**: Fixed bottom, centered
- **Width**: Calc(100% - 32px)
- **Height**: 56px
- **Background**: Primary blue
- **Border radius**: 28px
- **Icon**: ➕ plus
- **Shadow**: 0 4px 12px rgba(0,0,0,0.15)

### Status Indicators
- ✅ Voltooid - Success green
- ⚡ Live/Actief - Pulserende green
- ⚠️ Urgent/Probleem - Warning amber
- ❌ Geannuleerd - Destructive red
- ⏳ Pending - Muted grey

## Interactie States

### Real-time Updates
- **Live status**: Auto-refresh elke 30 seconden
- **Check-in notifications**: Instant update bij status change
- **Problem alerts**: Push notification + sound

### Swipe Actions (optioneel)
- **Swipe left**: Quick cancel (met bevestiging)
- **Swipe right**: Quick edit

### Pull to Refresh
- Standard iOS/Android pattern
- Laadt nieuwe shift updates
- Loading indicator in tab headers

### Matching Flow
- **Start matching**: Navigeert naar matching interface
- **Auto-match**: Toont suggested matches modal
- **Broadcast**: Stuurt notificatie naar alle geschikte beveiligers

## Filter & Zoek Opties

### Datum Filters
- Vandaag
- Deze week
- Volgende week
- Custom range

### Locatie Filters
- Alle locaties
- Per building/terminal
- Radius van huidige locatie

### Status Filters
- Open (nog te vullen)
- Gevuld
- Overboekt
- Geannuleerd

## Lege States

### Geen openstaande shifts:
```
┌─────────────────────────────────────────────┐
│              ✅                             │
│                                             │
│      Alle shifts zijn gevuld               │
│                                             │
│   Je hebt momenteel geen openstaande       │
│   shifts. Goed bezig!                      │
│                                             │
│         [Plan nieuwe shift]                │
│                                             │
└─────────────────────────────────────────────┘
```