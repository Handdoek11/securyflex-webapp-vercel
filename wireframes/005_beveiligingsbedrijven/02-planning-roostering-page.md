# Securyflex - Planning & Roostering

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
│  PLANNING & ROOSTERING                     │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Week 38 • 16-22 september 2024      │   │  <- Week selector
│  │ [◀ Vorige]         [Volgende ▶]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌────────┬────────┬────────┐             │
│  │Rooster │Openstaand│Klanten│             │  <- View tabs
│  └────────┴────────┴────────┘             │
│  ━━━━━━━                                   │
│                                             │
│  ROOSTER VIEW                              │  <- Planbord style
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     │ Ma 16 │ Di 17 │ Wo 18 │ Do 19 │   │  <- Timeline header
│  ├─────┼───────┼───────┼───────┼───────┤   │
│  │Jan  │[Schiphol T3  ]│[Arena ]│ VRIJ │   │
│  │de   │06:00-14:00    │14:00-22│      │   │
│  │Vries│€164 + ORT     │€152    │      │   │
│  │     │               │        │      │   │
│  │Maria│[Cargo Area   ]│[Cargo ]│[T3  ]│   │
│  │Janse│22:00-06:00    │22:00-06│06:00-│   │
│  │     │€180 + nacht   │€180    │14:00 │   │
│  │     │               │        │      │   │
│  │Peter│ VRIJ │[Office Park    ]│ ZIEK │   │
│  │Smit │      │08:00-16:00     │      │   │
│  │     │      │€144             │      │   │
│  │     │               │        │      │   │
│  │[+]  │[OPEN]│[OPEN]│[OPEN]│[OPEN]│       │  <- Unmatched shifts
│  │     │Arena │T2    │Cargo │Office│       │
│  │     │18:00-│14:00-│06:00-│08:00-│       │
│  │     │02:00 │22:00 │14:00 │16:00 │       │
│  └─────┴───────┴───────┴───────┴───────┘   │
│                                             │
│  DRAG & DROP ZONE                          │
│  ┌─────────────────────────────────────┐   │
│  │ 📌 Sleep shifts hier om te matchen   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  BESCHIKBARE BEVEILIGERS                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Ahmed K. - Beschikbaar Ma-Wo-Vr     │   │
│  │ VCA ✓ Engels B2 ✓ Nachten ✓        │   │
│  │ [Match automatisch]                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  CAO WAARSCHUWINGEN                        │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ Maria: 5e nachtdienst op rij     │   │
│  │ ⚠️ Jan: Verschuiving < 24u (20%)    │   │
│  │ ℹ️ Feestdag ma: 50% toeslag actief  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [📤 Publiceer rooster]               │   │  <- Publish button
│  │ Laatste publicatie: Do 12 sep 14:00 │   │     (CAO compliant)
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [📊]     [📅]     [👥]     [🏢]    [⚙️]   │
│Dashboard Planning  Team   Klanten  Beheer  │
│           ━━━━━                            │  <- Active: Planning
└─────────────────────────────────────────────┘
```

## Tab: Openstaand

```
┌─────────────────────────────────────────────┐
│  ┌────────┬────────┬────────┐             │
│  │Rooster │Openstaand│Klanten│             │
│  └────────┴────────┴────────┘             │
│          ━━━━━━━━━━                        │  <- Openstaand tab
│                                             │
│  URGENT - DEZE WEEK                        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🚨 MORGEN - KRITIEK                 │   │
│  │                                     │   │
│  │ Amsterdam Arena                     │   │
│  │ Evenementbeveiliging                │   │
│  │ Do 18 sep • 18:00-02:00 (8u)       │   │
│  │                                     │   │
│  │ Gevuld: 0/3 beveiligers             │   │
│  │ ░░░░░░░░░░░░░░░░░░  0%             │   │
│  │                                     │   │
│  │ Client: Ajax Events                 │   │
│  │ Tarief: €21,50/uur + toeslagen     │   │
│  │ Vereisten: VCA, EHBO                │   │
│  │                                     │   │
│  │ [🚀 Auto-match] [📢 Broadcast]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Schiphol Terminal 2                 │   │
│  │ Objectbeveiliging                   │   │
│  │ Vr 19 sep • 06:00-14:00 (8u)       │   │
│  │                                     │   │
│  │ Gevuld: 2/4 beveiligers             │   │
│  │ ▓▓▓▓▓▓▓▓▓░░░░░░░░  50%            │   │
│  │                                     │   │
│  │ Client: Schiphol Security           │   │
│  │ Matches: 12 beschikbaar            │   │
│  │                                     │   │
│  │ [Bekijk matches] [Quick assign]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  VOLGENDE WEEK VOORUITBLIK                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📊 Overzicht Week 39 (23-29 sep)   │   │
│  │                                     │   │
│  │ Totaal shifts:        47            │   │
│  │ Bemand:              31 (66%)       │   │
│  │ Openstaand:          16 (34%)       │   │
│  │                                     │   │
│  │ Kritieke gaps:                      │   │
│  │ • Maandag: 5 shifts                │   │
│  │ • Dinsdag: 3 shifts                │   │
│  │ • Weekend: 8 shifts                │   │
│  │                                     │   │
│  │ [Start vroege planning]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Tab: Klanten Planning

```
┌─────────────────────────────────────────────┐
│  ┌────────┬────────┬────────┐             │
│  │Rooster │Openstaand│Klanten│             │
│  └────────┴────────┴────────┘             │
│                    ━━━━━━━                │  <- Klanten tab
│                                             │
│  CLIENT OVERZICHT DEZE WEEK                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🏢 SCHIPHOL SECURITY                │   │
│  │    Premium klant • Priority         │   │
│  │                                     │   │
│  │ Deze week: 18 shifts               │   │
│  │ Status: ✅ 16 bemand (89%)         │   │
│  │ Waarde: €7.560                     │   │
│  │                                     │   │
│  │ Openstaand:                         │   │
│  │ • Terminal 2: Vr 14:00-22:00       │   │
│  │ • Cargo: Za 22:00-06:00             │   │
│  │                                     │   │
│  │ [Bekijk details] [Contact]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🏢 AJAX EVENTS                      │   │
│  │    Event klant • Variabel           │   │
│  │                                     │   │
│  │ Deze week: 4 events                │   │
│  │ Status: ⚠️ 2 onbemand (50%)        │   │
│  │ Waarde: €2.890                     │   │
│  │                                     │   │
│  │ Kritiek: Morgen Arena event        │   │
│  │ 0/3 beveiligers toegewezen         │   │
│  │                                     │   │
│  │ [🚨 Escaleer] [Emergency crew]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🏢 OFFICE PARK ZUIDAS               │   │
│  │    Standaard klant                  │   │
│  │                                     │   │
│  │ Deze week: 8 shifts                │   │
│  │ Status: ✅ 8 bemand (100%)         │   │
│  │ Waarde: €2.240                     │   │
│  │                                     │   │
│  │ Volgende week: 12 shifts gepland   │   │
│  │                                     │   │
│  │ [Planning bekijken]                │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Drag & Drop Planning Interface

```
┌─────────────────────────────────────────────┐
│  INTELLIGENT MATCHING                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🎯 SUGGESTIE ENGINE                 │   │
│  │                                     │   │
│  │ Voor: Amsterdam Arena Do 18:00-02:00│   │
│  │                                     │   │
│  │ Top matches:                        │   │
│  │ 1. Ahmed K. - 95% match ⭐          │   │
│  │    ✓ Event ervaring ✓ Beschikbaar  │   │
│  │    ✓ Locatie (3km) ✓ VCA + EHBO    │   │
│  │                                     │   │
│  │ 2. Sarah J. - 88% match             │   │
│  │    ✓ Premium guard ✓ Engels C1     │   │
│  │    ⚠ Locatie (12km) ✓ Nachten OK   │   │
│  │                                     │   │
│  │ 3. Tom P. - 76% match               │   │
│  │    ✓ Beschikbaar ✓ Betrouwbaar     │   │
│  │    ⚠ Geen event exp. ✓ VCA         │   │
│  │                                     │   │
│  │ [Auto-assign top 3] [Handmatig]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  CONFLICT DETECTIE                         │
│  ┌─────────────────────────────────────┐   │
│  │ ⚠️ WAARSCHUWINGEN                   │   │
│  │                                     │   │
│  │ • Jan de Vries: Back-to-back shifts│   │
│  │   (< 11 uur rust tussen diensten)  │   │
│  │                                     │   │
│  │ • Maria Jansen: 6e nachtdienst     │   │
│  │   (CAO maximum: 5 opeenvolgend)    │   │
│  │                                     │   │
│  │ • Weekend overuren: 3 medewerkers  │   │
│  │   (48+ uur deze week)               │   │
│  │                                     │   │
│  │ [Conflicten oplossen]               │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## CAO Compliance Engine

```
┌─────────────────────────────────────────────┐
│  CAO CONTROLE DASHBOARD                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📋 AUTOMATISCHE CONTROLES           │   │
│  │                                     │   │
│  │ Rusttijd tussen diensten:           │   │
│  │ ✅ 23 medewerkers compliant        │   │
│  │ ⚠️ 2 waarschuwingen                │   │
│  │                                     │   │
│  │ Maximale nachtdiensten (5):         │   │
│  │ ✅ 19 medewerkers binnen limiet     │   │
│  │ ⚠️ 1 overschrijding                 │   │
│  │                                     │   │
│  │ Weekmaximum (48 uur):               │   │
│  │ ✅ 21 medewerkers                   │   │
│  │ ⚠️ 3 approaching (45+ uur)          │   │
│  │                                     │   │
│  │ Verschuivingstoeslagen (< 24u):     │   │
│  │ 💰 €892 toeslagen deze week        │   │
│  │ 📊 8% van totale loonkosten        │   │
│  │                                     │   │
│  │ [Gedetailleerd rapport]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  INTERVENTIE SUGGESTIES                    │
│  ┌─────────────────────────────────────┐   │
│  │ 🛠️ OPLOSSINGEN                     │   │
│  │                                     │   │
│  │ Maria Jansen (nachtdienst limiet):  │   │
│  │ • Vervang do/vr nacht met dagdienst│   │
│  │ • Beschikbare vervangers: 3        │   │
│  │                                     │   │
│  │ Weekend overuren voorkomen:         │   │
│  │ • Verdeel 8u weekend shift         │   │
│  │ • 2x 4u slots beschikbaar          │   │
│  │                                     │   │
│  │ [Automatisch corrigeren]            │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Week Selector
- **Background**: Light electric blue
- **Border**: 1px solid electric blue
- **Navigation arrows**: Touch-friendly 44px targets
- **Date format**: Week number + date range
- **Quick jump**: Tap week to open calendar picker

### Planning Grid (Rooster View)
- **Cell dimensions**:
  - Height: 60px minimum per employee
  - Width: Auto-adjusted based on day count
- **Shift blocks**:
  - Background: Success green voor confirmed
  - Border: 2px solid darker green
  - Text: White voor contrast
  - Corner radius: 4px
- **Empty cells**: Dashed border, light grey
- **Drag targets**: Blue dashed border when active

### Tab Navigation
- **Background**: White
- **Active tab**: Primary blue bottom border
- **Badge counts**: Small amber circles for issues
- **Swipe navigation**: Horizontal scroll on mobile

### CAO Warning System
- **Priority levels**:
  - 🚨 Critical: Red background, immediate action
  - ⚠️ Warning: Amber background, attention needed
  - ℹ️ Info: Blue background, informational
- **Auto-dismiss**: After resolution
- **Expand/collapse**: Detailed view on tap

### Drag & Drop Mechanics
- **Drag feedback**: Semi-transparent ghost
- **Drop zones**: Highlighted borders
- **Conflict detection**: Real-time validation
- **Undo capability**: Swipe gesture or button

### Auto-Match Algorithm
- **Scoring factors**:
  - Distance: 0-30 points
  - Availability: 0-25 points
  - Skills match: 0-25 points
  - Experience: 0-20 points
- **Visual feedback**: Progress bars per factor
- **Confidence level**: Color-coded percentages

## Business Rules Engine

### CAO Compliance Rules
1. **Minimum rust**: 11 uur tussen diensten
2. **Maximum nachtdiensten**: 5 opeenvolgend
3. **Maximum werkweek**: 48 uur
4. **Verschuivingstoeslag**: 20% bij <24u wijziging
5. **Feestdagen**: 50% extra tarief
6. **Overwerk**: 125% na 40 uur

### Matching Criteria
- **Hard requirements**: Documenten, certificaten
- **Soft preferences**: Locatie, ervaring
- **Client preferences**: Vaste teams, performance
- **Employee preferences**: Shifts, locaties

### Cost Calculations
- **Base tarief**: Per employee/shift
- **CAO toeslagen**: Automatisch berekend
- **Platform fee**: €2.99 per gewerkt uur
- **Client markup**: Variabel per contract

## Interactie States

### Real-time Collaboration
- **Multi-user editing**: Conflict resolution
- **Change tracking**: Who changed what when
- **Live cursors**: See other planners' actions
- **Optimistic updates**: Instant feedback

### Mobile Adaptations
- **Touch targets**: 44px minimum
- **Gesture navigation**: Swipe between days/weeks
- **Simplified grid**: Stacked view for smaller screens
- **Quick actions**: Long press context menus

### Performance Optimization
- **Lazy loading**: Load visible week only
- **Virtual scrolling**: For large employee lists
- **Debounced updates**: Batch API calls
- **Offline capability**: Queue changes

### Notification System
- **Planning alerts**: Unassigned shifts
- **CAO violations**: Immediate warnings
- **Employee updates**: Availability changes
- **Client requests**: New/modified shifts

## Integration Points

### External Systems
- **Payroll export**: Validated hours/toeslagen
- **Client portals**: Shift confirmations
- **Employee apps**: Rooster notifications
- **Compliance reporting**: SFPB exports

### API Endpoints
- **Shift CRUD**: Create, read, update, delete
- **Employee availability**: Real-time sync
- **CAO validation**: Rule engine checks
- **Cost calculation**: Dynamic pricing