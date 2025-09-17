# Securyflex - Beveiligers Pool

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
│  BEVEILIGERS                               │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┬──────────┬──────────┐        │
│  │Favorieten│Beschikbaar│ Alle    │        │  <- Tabs
│  │   (12)   │   (47)    │  (234)  │        │
│  └──────────┴──────────┴──────────┘        │
│  ━━━━━━━━━━                                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔍 Zoek beveiliger...                │   │  <- Search
│  └─────────────────────────────────────┘   │
│                                             │
│  FAVORIETE BEVEILIGERS                     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Jan de Vries          ⭐4.9  │   │  <- Beveiliger card
│  │        Objectbeveiliging            │   │
│  │                                     │   │
│  │ ✅ Beschikbaar nu                   │   │
│  │ 📍 Amsterdam (5km)                  │   │
│  │ 💼 523 shifts voltooid              │   │
│  │                                     │   │
│  │ Certificaten:                       │   │
│  │ [VCA] [EHBO] [Engels B2]           │   │
│  │                                     │   │
│  │ 📄 Documenten:                      │   │
│  │ Pas ✅  VOG ✅  Diploma ✅          │   │
│  │                                     │   │
│  │ [Direct boeken] [Bericht] [Profiel]│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Maria Jansen          ⭐4.8  │   │
│  │        Event Security               │   │
│  │                                     │   │
│  │ ⚠️ Beschikbaar vanaf 18:00          │   │
│  │ 📍 Amstelveen (8km)                 │   │
│  │ 💼 298 shifts voltooid              │   │
│  │                                     │   │
│  │ 📄 VOG verloopt over 14 dagen       │   │  <- Warning
│  │                                     │   │
│  │ [Direct boeken] [Bericht] [Profiel]│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  FILTERS                                   │
│  ┌─────────────────────────────────────┐   │
│  │ Locatie: [Amsterdam ▼] [10km ▼]    │   │
│  │ Skills: [VCA ▼] [+ Meer]           │   │
│  │ Rating: [4+ sterren ▼]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [🏠]     [📋]     [👥]     [⚙️]           │
│ Dashboard Shifts Beveiligers Meer          │
│                    ━━━━━━━                 │  <- Active: Beveiligers
└─────────────────────────────────────────────┘
```

## Tab: Beschikbaar

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐        │
│  │Favorieten│Beschikbaar│ Alle    │        │
│  │   (12)   │   (47)    │  (234)  │        │
│  └──────────┴──────────┴──────────┘        │
│           ━━━━━━━━━                        │  <- Beschikbaar tab
│                                             │
│  NU BESCHIKBAAR                            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Ahmed Khan           ⭐4.6   │   │
│  │        Mobiele Surveillance         │   │
│  │                                     │   │
│  │ 🟢 Online nu • Direct beschikbaar   │   │
│  │ 📍 Amsterdam Centrum (2km)          │   │
│  │ 💼 187 shifts • €19,50/uur         │   │
│  │                                     │   │
│  │ Specialisaties:                     │   │
│  │ [Mobiel] [Rijbewijs] [Nederlands]  │   │
│  │                                     │   │
│  │ [🚀 Direct boeken] [Bericht]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Sarah de Jong        ⭐4.9   │   │
│  │        Evenementbeveiliging         │   │
│  │                                     │   │
│  │ 🟡 Beschikbaar vanaf 16:00         │   │
│  │ 📍 Haarlem (18km)                  │   │
│  │ 💼 412 shifts • €21,00/uur         │   │
│  │                                     │   │
│  │ 🏆 Premium beveiliger               │   │
│  │ [EHBO] [BHV] [Engels C1]           │   │
│  │                                     │   │
│  │ [Direct boeken] [Bericht] [Match]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  VANDAAG NIET BESCHIKBAAR                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Tom Peters            ⭐4.7   │   │
│  │        Objectbeveiliging            │   │
│  │                                     │   │
│  │ 🔴 Andere shift: 14:00-22:00       │   │
│  │ 📍 Amsterdam Zuid (12km)            │   │
│  │                                     │   │
│  │ Morgen beschikbaar vanaf 06:00     │   │
│  │ [Boek voor morgen] [Profiel]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Tab: Alle Beveiligers

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐        │
│  │Favorieten│Beschikbaar│ Alle    │        │
│  │   (12)   │   (47)    │  (234)  │        │
│  └──────────┴──────────┴──────────┘        │
│                          ━━━━━━           │  <- Alle tab
│                                             │
│  TEAM STATISTIEKEN                        │
│  ┌─────────────────────────────────────┐   │
│  │ Totaal beveiligers: 234             │   │
│  │ Beschikbaar nu: 47 (20%)            │   │
│  │ Gemiddelde rating: ⭐ 4.6           │   │
│  │ Actief deze maand: 89%              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ALLE BEVEILIGERS                          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Lisa Admin           ⭐4.5   │   │
│  │        Multi-functioneel            │   │
│  │                                     │   │
│  │ 🟢 Beschikbaar • Favoriete klant    │   │
│  │ 📍 Amsterdam (3km) • €18,50/uur    │   │
│  │ 💼 89 shifts • 98% betrouwbaar     │   │
│  │                                     │   │
│  │ Recent: Vorige week bij je gewerkt │   │
│  │ [♥ Toevoegen aan favorieten]        │   │
│  │ [Direct boeken] [Bericht]          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Kevin Bakker         ⭐3.8   │   │
│  │        Starter (3 maanden)          │   │
│  │                                     │   │
│  │ 🟡 Beschikbaar weekenden           │   │
│  │ 📍 Zaandam (25km) • €16,50/uur     │   │
│  │ 💼 23 shifts • Nieuw talent        │   │
│  │                                     │   │
│  │ 🎓 Recent VCA behaald               │   │
│  │ [Probeer uit] [Training schema]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Direct Boeken Modal

```
┌─────────────────────────────────────────────┐
│  DIRECT BOEKEN                       [✕]   │
│  Jan de Vries voor shift             │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Foto] Jan de Vries          ⭐4.9  │   │
│  │ Objectbeveiliging • 523 shifts     │   │
│  │ ✅ Beschikbaar nu                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  SELECTEER SHIFT                           │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Terminal 2 - Morgen 14:00-22:00  │   │
│  │   €164,00 (8 uur × €20,50)         │   │
│  │                                     │   │
│  │ ● Cargo Area - Za 20:00-04:00      │   │
│  │   €168,00 (8 uur + nachttoeslag)   │   │
│  │                                     │   │
│  │ ○ Gates B - Zo 10:00-18:00         │   │
│  │   €148,00 (8 uur × €18,50)         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  PERSOONLIJK BERICHT (optioneel)           │
│  ┌─────────────────────────────────────┐   │
│  │ [Hoi Jan, we hebben je weer nodig  │   │
│  │  voor een shift op Cargo Area.     │   │
│  │  Zelfde team als vorige keer.   ]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✅ Automatisch bevestigen (aanbevolen)    │
│  ☐ Handmatige bevestiging vereist          │
│                                             │
│  [Annuleren]              [Verstuur uitnodiging] │
│                                             │
└─────────────────────────────────────────────┘
```

## Profiel Detail Modal

```
┌─────────────────────────────────────────────┐
│  PROFIEL DETAILS                     [✕]   │
│  Jan de Vries                              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     [Grote profielfoto]             │   │
│  │                                     │   │
│  │ Jan de Vries                        │   │
│  │ ⭐ 4.9 (523 reviews)                │   │
│  │ 📍 Amsterdam • 5km afstand          │   │
│  │ 💼 Objectbeveiliging specialist    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  BESCHIKBAARHEID                           │
│  ┌─────────────────────────────────────┐   │
│  │ Deze week:                          │   │
│  │ Ma ✅  Di ✅  Wo ❌  Do ✅  Vr ✅   │   │
│  │ Za ⚠️ Na 20:00  Zo ❌              │   │
│  │                                     │   │
│  │ Voorkeur: Dagdiensten              │   │
│  │ Max reisafstand: 15km               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ERVARING & SKILLS                         │
│  ┌─────────────────────────────────────┐   │
│  │ 📊 Ervaring: 4 jaar                 │   │
│  │ 🏆 Specialisatie: Objectbeveiliging │   │
│  │ 💰 Gewenst tarief: €18-22/uur       │   │
│  │                                     │   │
│  │ Certificaten:                       │   │
│  │ [VCA Basis] [EHBO] [Engels B2]     │   │
│  │ [BHV] [Teamleider]                 │   │
│  │                                     │   │
│  │ Documenten status:                  │   │
│  │ Pas ✅  VOG ✅  Diploma ✅          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  SAMENWERKINGSGESCHIEDENIS                 │
│  ┌─────────────────────────────────────┐   │
│  │ Met jouw bedrijf: 47 shifts        │   │
│  │ Laatste shift: 2 weken geleden     │   │
│  │ Gemiddelde rating: ⭐ 4.9          │   │
│  │ Betrouwbaarheid: 100% (0 no-shows) │   │
│  │                                     │   │
│  │ Recente feedback:                   │   │
│  │ "Zeer professioneel en betrouwbaar.│   │
│  │  Goede communicatie." - 1 week     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [♥ Voeg toe aan favorieten]               │
│  [💬 Verstuur bericht] [📞 Direct bellen] │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Tab Navigation
- **Height**: 44px
- **Background**: White
- **Active tab**: Primary blue met bottom indicator
- **Badge counts**: Small numbers in parentheses

### Search Bar
- **Height**: 44px
- **Border radius**: 22px
- **Background**: Light grey
- **Icon**: 🔍 search icon left aligned
- **Placeholder**: Muted text

### Beveiliger Cards
- **Background**: White
- **Border**: 1px solid light border
- **Border radius**: 12px
- **Padding**: 16px
- **Shadow**: 0 2px 4px rgba(0,0,0,0.05)

#### Card Elements:
1. **Profile Photo**
   - Size: 60x60px, circular
   - Position: Top left
   - Default: Initials if no photo

2. **Name & Rating**
   - Name: Bold, 16px
   - Rating: Stars + numeric, 14px, electric blue

3. **Specialization**
   - Font: Regular, 14px, muted color
   - Below name

4. **Status Indicator**
   - 🟢 Green: Available now
   - 🟡 Amber: Limited availability
   - 🔴 Red: Not available
   - ⚠️ Warning: Issues (expiring docs)

5. **Location & Distance**
   - 📍 icon + location name
   - Distance in km, muted

6. **Experience Stats**
   - 💼 icon + shift count
   - Hourly rate if relevant

7. **Skill Tags**
   - Background: Light electric blue
   - Text: Electric blue
   - Border radius: 12px
   - Padding: 4px 8px

8. **Action Buttons**
   - Primary: "Direct boeken" - filled primary blue
   - Secondary: "Bericht", "Profiel" - outline electric blue
   - Height: 36px

### Filter Section
- **Background**: Light grey
- **Padding**: 12px
- **Border radius**: 8px
- **Dropdowns**: Native mobile styling

### Status Colors
- **Available**: Success green (#22C55E)
- **Limited**: Warning amber (#F59E0B)
- **Unavailable**: Destructive red (#EF4444)
- **Offline**: Muted grey (#6B7280)

### Premium Indicators
- **Premium beveiliger**: 🏆 gold crown icon
- **Favorite client**: ♥ heart icon
- **High performer**: ⭐ star badge
- **New talent**: 🎓 graduation cap

## Filter Options

### Locatie Filters
- Alle locaties
- Binnen 5km
- Binnen 10km
- Binnen 25km
- Custom radius

### Beschikbaarheid
- Nu beschikbaar
- Vandaag beschikbaar
- Deze week beschikbaar
- Flexibel

### Specialisaties
- Objectbeveiliging
- Evenementbeveiliging
- Mobiele surveillance
- Horecaportier
- Persoonsbeveiliging

### Certificaten
- VCA Basis/VOL
- EHBO/BHV
- Teamleider
- Rijbewijs

### Rating & Ervaring
- 5 sterren
- 4+ sterren
- 3+ sterren
- < 1 jaar ervaring
- 1-3 jaar ervaring
- 3+ jaar ervaring

## Interactie States

### Real-time Updates
- **Availability status**: Live updates via WebSocket
- **Badge counts**: Auto-refresh bij status changes
- **New messages**: Instant notification badges

### Search & Filter
- **Live search**: Results update tijdens typen
- **Filter badges**: Actieve filters tonen als tags
- **Clear filters**: Eén klik om alle filters te resetten

### Booking Flow
- **Direct booking**: Snelle 2-stap flow
- **Custom message**: Personalisatie optie
- **Auto-confirm**: Intelligente standaard voor bekende beveiligers

### Communication
- **In-app messaging**: Real-time chat functionaliteit
- **Call integration**: Direct bellen via platform
- **Push notifications**: Voor responses en updates

## Lege States

### Geen favorieten:
```
┌─────────────────────────────────────────────┐
│              ⭐                             │
│                                             │
│      Nog geen favoriete beveiligers       │
│                                             │
│   Voeg beveiligers toe aan je favorieten  │
│   voor snelle toegang.                    │
│                                             │
│         [Ontdek beveiligers]               │
│                                             │
└─────────────────────────────────────────────┘
```

### Geen zoekresultaten:
```
┌─────────────────────────────────────────────┐
│              🔍                             │
│                                             │
│      Geen beveiligers gevonden            │
│                                             │
│   Probeer andere zoektermen of pas je     │
│   filters aan.                            │
│                                             │
│         [Reset filters]                    │
│                                             │
└─────────────────────────────────────────────┘
```