# Securyflex - Opdrachtgever Dashboard

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
│  📍 13:21  📶 📶 📶  🔋 92%                 │  <- Status bar
├─────────────────────────────────────────────┤
│                                             │
│  SECURYFLEX                                │  <- Header
│  Welkom terug, Schiphol Security           │  <- Bedrijfsnaam
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ ACTIE VEREIST                          │  <- Alert banner
│  2 shifts morgen nog niet gevuld           │     (Amber bg)
│  [Bekijk openstaande shifts →]             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  VANDAAG - DINSDAG 16 SEPTEMBER            │  <- Section header
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🟢 ACTIEVE SHIFTS                   │   │  <- Live status card
│  │                                     │   │
│  │ Terminal 3 - Objectbeveiliging     │   │
│  │ 4 beveiligers • 06:00-14:00        │   │
│  │ ✅ Iedereen ingecheckt             │   │
│  │                                     │   │
│  │ Gates B - Toegangscontrole         │   │
│  │ 2 beveiligers • 14:00-22:00        │   │
│  │ ⏳ Start over 45 minuten           │   │
│  │                                     │   │
│  │ [Alle actieve shifts →]            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────┬─────┬─────┬─────┐                │
│  │ 12  │ 28  │ 156 │ 4.7 │                │  <- Quick stats
│  │Actief│Week│Maand│Score│                │     (Electric blue)
│  └─────┴─────┴─────┴─────┘                │
│                                             │
│  QUICK ACTIONS                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     🚨 SPOED BEVEILIGER NODIG       │   │  <- Emergency button
│  │     Direct een beveiliger           │   │     (Red accent)
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌───────────────┬───────────────┐         │
│  │ 📋 Plan Shift │ 📊 Rapportage │         │  <- Action buttons
│  └───────────────┴───────────────┘         │     (Primary blue)
│                                             │
│  DEZE WEEK OVERZICHT                       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Ma 16/09  ████████████  12 shifts  │   │  <- Week timeline
│  │ Di 17/09  ██████░░░░░   8 shifts   │   │
│  │ Wo 18/09  ░░░░░░░░░░   0 geplanned │   │
│  │ Do 19/09  ████░░░░░░    4 shifts   │   │
│  │ Vr 20/09  ████████░░    10 shifts  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  RECENTE MELDINGEN                         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 12:45 - Incident Terminal 2      │   │  <- Activity feed
│  │    Jan de Vries heeft een incident │   │
│  │    gerapporteerd                    │   │
│  │                                     │   │
│  │ ✅ 11:30 - Shift gevuld             │   │
│  │    Zaterdagavond shift is volledig  │   │
│  │    bemand (4/4 beveiligers)        │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [🏠]     [📋]     [👥]     [⚙️]           │  <- Bottom navigation
│ Dashboard Shifts Beveiligers Meer          │
│  ━━━━━                                     │  <- Active: Dashboard
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Header
- **Bedrijfsnaam**: Montserrat Black, 18px
- **Welcome message**: Regular, 14px, muted color
- **Positie**: Links uitgelijnd met 16px padding

### Alert Banner
- **Achtergrond**: Light amber (#FFF3E0)
- **Border**: 1px solid warning amber
- **Border radius**: 8px
- **Padding**: 12px 16px
- **Margin**: 16px
- **Icon**: ⚠️ warning
- **Text**: Primary color voor link

### Live Status Card
- **Achtergrond**: White
- **Border**: 1px solid success green
- **Border radius**: 12px
- **Padding**: 16px
- **Status indicator**: 🟢 groene cirkel voor actief
- **Real-time updates**: WebSocket verbinding

### Quick Stats Grid
- **Layout**: 4 columns, equal width
- **Background**: Light electric blue tint
- **Padding**: 12px
- **Numbers**: Bold, 20px, electric blue
- **Labels**: 12px, muted

### Emergency Button
- **Background**: Destructive red
- **Color**: White text
- **Height**: 56px
- **Border radius**: 12px
- **Font**: Bold, 16px
- **Icon**: 🚨 emergency

### Action Buttons
- **Background**: Primary blue
- **Color**: White
- **Height**: 48px
- **Border radius**: 8px
- **Grid**: 2 columns with gap

### Week Timeline
- **Progress bars**: Filled primary blue, empty light grey
- **Height**: 6px per bar
- **Labels**: 12px, right aligned
- **Days**: Left aligned, bold

### Activity Feed
- **Background**: Light background
- **Items**: White cards with 1px border
- **Icons**: Contextual colors (red for incidents, green for success)
- **Timestamps**: Muted, 12px
- **Padding**: 12px per item

### Bottom Navigation
- **Height**: 56px
- **Background**: White
- **Border top**: 1px solid light border
- **Items**: 4 tabs, equal width
- **Active**: Primary blue with bottom indicator
- **Icons**: 24px, labels 10px

## Interactie States

### Real-time Updates
- **Status indicators**: Pulserende animatie voor actieve shifts
- **Badge counts**: Update zonder page refresh
- **Alert banners**: Auto-dismiss na 5 seconden
- **Timeline**: Real-time progress updates

### Tap States
- **Cards**: Light overlay (primary blue 5% opacity)
- **Buttons**: Scale 0.98 + darker tint
- **Navigation**: Instant feedback met animatie

### Loading States
- **Initial load**: Skeleton voor cards en stats
- **Real-time data**: Subtle loading indicators
- **Pull to refresh**: Standard pattern

## Lege States

### Geen actieve shifts:
```
┌─────────────────────────────────────────────┐
│              😴                             │
│                                             │
│      Geen actieve shifts vandaag           │
│                                             │
│   Alle shifts zijn voltooid of nog         │
│   niet gestart.                            │
│                                             │
│         [Bekijk planning →]                │
│                                             │
└─────────────────────────────────────────────┘
```

### Geen meldingen:
```
┌─────────────────────────────────────────────┐
│              ✅                             │
│                                             │
│      Alles loopt soepel                    │
│                                             │
│   Geen nieuwe meldingen of incidenten      │
│                                             │
└─────────────────────────────────────────────┘
```