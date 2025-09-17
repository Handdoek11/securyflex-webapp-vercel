# 01. Dashboard Marketplace Overzicht - Beveiligingsbedrijven

## Overzicht
Het Dashboard is het centrale controlecentrum voor beveiligingsbedrijven die opereren binnen het SecuryFlex marketplace model. Hier krijgen beveiligingsbedrijven een real-time overzicht van beschikbare client opdrachten, hun team status, actieve biedingen en financiële performance. Het dashboard faciliteert de matching tussen client behoeften en beschikbare ZZP'ers binnen het bedrijf.

## Functionaliteit
- **Marketplace opdrachten**: Real-time overzicht van beschikbare client aanvragen
- **Team beschikbaarheid**: Live status van eigen ZZP'ers en hun beschikbaarheid
- **Bidding dashboard**: Overzicht van ingediende offertes en hun status
- **Performance KPI's**: Winstkansen, marge analyse en Finqle payment tracking
- **Quick actions**: Snelle toegang tot veelgebruikte marketplace functies
- **Client matching**: AI-gestuurde aanbevelingen voor optimale team-opdracht combinaties

## Key Performance Indicators
- Beschikbare marketplace opdrachten en match percentage
- Team utilization rate en beschikbare capaciteit
- Gemiddelde win-rate van biedingen
- Marge per opdracht en maandelijkse revenue via Finqle
- Client satisfaction scores en repeat business rate

---

## 🖥️ Desktop Versie (1024px+) - Primary Interface

### Main Dashboard View
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  SecuryFlex Beveiligingsbedrijven Portal                                               🔔 7  👤 Security Pro B.V.  [Support] [Uitloggen]                │
├─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                 │                                                                                                                             │
│  📊 DASHBOARD              ●    │                                    🏪 MARKETPLACE OVERZICHT                                                              │
│  🛒 MARKETPLACE                 │                                                                                                                             │
│  👥 TEAM BEHEER                 │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐                         │
│  💰 FINANCIËN                   │  │ Nieuwe Opdrachten  │  │  Mijn Team Status  │  │   Deze Week Bid    │  │  Win Rate Ratio   │                         │
│                                 │  │        12          │  │    47 ZZP'ers      │  │      8 offertes    │  │       73%          │                         │
│                                 │  │   🟢 3 matching    │  │   👥 34 beschikb.  │  │   📈 €23,450 vol.  │  │   📊 Boven target  │                         │
│                                 │  │   radius < 25km    │  │   13 op dienst     │  │   2 toegewezen     │  │                    │                         │
│  ────────────────────────       │  └────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────────┘                         │
│                                 │                                                                                                                             │
│  📈 QUICK STATS                 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  • 47 ZZP'ers in team          │  │                                      🏪 BESCHIKBARE OPDRACHTEN (12 nieuwe)                                        │ │
│  • 12 nieuwe opdrachten        │  │                                                                                                                     │ │
│  • €23.4k week potential       │  │     📍Schiphol T2 (€450)        📍Zuidas Office (€280)       📍Utrecht CS (€320)      📍Arena Event (€680)      │ │
│  • 8 actieve biedingen         │  │     ⚡ Urgent - 2 ZZP'ers       🏢 Kantoor beveiliging        🚂 Station surveillance   🎫 Champions League      │ │
│                                 │  │     🕐 Morgen 06:00-14:00       🕐 Ma-Vr 08:00-17:00          🕐 Wo-Do 10:00-22:00     🕐 Di 18:00-24:00         │ │
│  🎯 DEZE WEEK DOELEN            │  │     💰 €18/uur (€2 marge)       💰 €14/uur (€3 marge)        💰 €16/uur (€2.5 marge)  💰 €22/uur (€4 marge)    │ │
│  Nieuwe biedingen: 15 (8/15)    │  │                                                                                                                     │ │
│  Team utilization: 80% (73%)   │  │  [🔍 Filter Opdrachten] [📊 Winstgevendheid] [⚡ Urgente Alleen] [🎯 Smart Match]                                │ │
│  Winstkans: 75% (73% actueel)  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                 │                                                                                                                             │
│                                 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│                                 │  │                                      🎯 SMART MATCH AANBEVELINGEN                                                   │ │
│                                 │  │                                                                                                                     │ │
│                                 │  │  🔥 TOP MATCH │ Ajax Arena Champions League     │ Di 18:00-24:00 │ Perfecte fit: Jan, Emma, Mike  │ 🎯 95% chance │ │
│                                 │  │               │ €22/uur × 3 ZZP'ers = €396 vol. │ €4/uur marge   │ Skills: Event, VCA, English     │ [💼 Bid Nu]    │ │
│                                 │  │               │ 📍 1.2km van team locatie        │ Client rating ⭐ 4.8                                              │ │
│                                 │  │                                                                                                                     │ │
│                                 │  │  🟢 GOED     │ Schiphol Terminal Security       │ Morgen 06:00   │ Beschikbaar: Sarah, Tom         │ 🎯 78% chance │ │
│                                 │  │               │ €18/uur × 2 ZZP'ers = €144 vol. │ €2/uur marge   │ Skills: Airport, VCA            │ [💼 Bid Nu]    │ │
│                                 │  │               │ ⚠️ Vroege start - check beschikb. │ Urgente aanvraag                                                   │ │
│                                 │  │                                                                                                                     │ │
│                                 │  │  🟡 MOGELIJK │ Utrecht Centraal Surveillance    │ Wo-Do lang     │ Skills match: 60%               │ 🎯 45% chance │ │
│                                 │  │               │ €16/uur × 2 ZZP'ers = €256 vol. │ €2.5/uur marge │ Reistijd: 45 min                │ [💼 Bekijk]    │ │
│                                 │  │                                                                                                                     │ │
│                                 │  │  [🔍 Alle Matches Bekijken] [⚙️ Match Instellingen] [📊 Success Rate Analyse]                                   │ │
│                                 │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                 │                                                                                                                             │
│                                 │  ┌───────────────────────────────┐  ┌───────────────────────────────┐  ┌───────────────────────────────┐                 │
│                                 │  │        🔔 MARKETPLACE ALERTS   │  │      💰 FINQLE STATUS        │  │      📊 TEAM PERFORMANCE      │                 │
│                                 │  │                               │  │                               │  │                               │                 │
│                                 │  │ • Nieuwe opdracht Amstelveen  │  │ Uitbetalingen Vandaag:       │  │ Top Performer:                │                 │
│                                 │  │   ⏰ 15 min geleden €18/uur   │  │ ✅ €8,450 (12 ZZP'ers)       │  │ 👤 Jan de Vries (⭐ 4.9)     │                 │
│                                 │  │                               │  │                               │  │                               │                 │
│                                 │  │ • Bid geaccepteerd - Arena!   │  │ Uitstaande Betalingen:       │  │ Deze Week Stats:              │                 │
│                                 │  │   🎉 €680 opdracht binnen     │  │ ⏳ €2,340 (binnen 24h)       │  │ 📈 €24,340 totaal omzet      │                 │
│                                 │  │                               │  │                               │  │ 💰 €4,280 totale marge       │                 │
│                                 │  │ • Urgente vraag Schiphol      │  │ Client Credit Status:        │  │                               │                 │
│                                 │  │   ⚡ < 12 uur voor start      │  │ 🟢 Alle clients binnen       │  │ Team Utilization:             │                 │
│                                 │  │                               │  │    kredietlimiet             │  │ ⭐ 73% (target: 80%)          │                 │
│                                 │  │ [Alle Alerts] [Instellingen] │  │                               │  │ [Team Details] [Prestaties]   │                 │
│                                 │  └───────────────────────────────┘  └───────────────────────────────┘  └───────────────────────────────┘                 │
│                                 │                                                                                                                             │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Desktop Navigation Features
- **Collapsible sidebar**: Meer schermruimte voor marketplace overzicht
- **Live indicators**: Real-time updates van nieuwe opdrachten en team status
- **Smart notifications**: Prioriteit alerts voor high-value opdrachten
- **Quick bid buttons**: Directe toegang tot bidding proces
- **Performance dashboard**: Live tracking van win rates en marge
- **Team availability**: Real-time zicht op beschikbare ZZP'ers

---

## 📱 Mobile Versie (375px - 768px) - Responsive Design

### Mobile Dashboard Overview
```
┌─────────────────────────────────────┐
│  [≡] SecuryFlex       🔔 7  👤     │
├─────────────────────────────────────┤
│                                     │
│    🏪 MARKETPLACE DASHBOARD         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    Nieuwe Opdrachten        │   │
│  │         12                  │   │
│  │   🟢 3 matching radius      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────┐  ┌─────────────────┐  │
│  │ Team    │  │   Week Bid      │  │
│  │  47     │  │   Volume        │  │
│  │34 beschik│  │  €23,450       │  │
│  └─────────┘  └─────────────────┘  │
│                                     │
│  🗺️ NABIJE OPDRACHTEN               │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │ 📍 Schiphol T2 (€450)      │   │
│  │ ⚡ Urgent - 2 ZZP'ers       │   │
│  │ 🕐 Morgen 06:00-14:00       │   │
│  │ [💼 Bid Nu] [📍 Locatie]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📍 Arena Event (€680)       │   │
│  │ 🎫 Champions League         │   │
│  │ 🕐 Di 18:00-24:00           │   │
│  │ [💼 Bid Nu] [📍 Locatie]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  🎯 SMART MATCHES                   │
│  ┌─────────────────────────────┐   │
│  │ 🔥 TOP MATCH                │   │
│  │ Ajax Arena - 95% win chance │   │
│  │ Perfect fit: Jan, Emma, Mike│   │
│  │ €4/uur marge × 6 uur = €72 │   │
│  │ [💼 Bid Nu] [👥 Team]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔔 URGENTE MELDINGEN               │
│  ┌─────────────────────────────┐   │
│  │ • Bid geaccepteerd Arena!   │   │
│  │ • Urgente vraag Schiphol    │   │
│  │ • Nieuwe hoge-waarde match  │   │
│  │   [Alle Meldingen]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    [🛒 ALLE OPDRACHTEN]     │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [📊][🛒][👥][⚡][💰]              │
│ Dash Mark Team Actv Fin           │
└─────────────────────────────────────┘
```

### Mobile Navigation Structure
**Hamburger Menu (≡) bevat:**
```
📊 Dashboard
🛒 Opdrachten Marketplace
  ├── Beschikbare Opdrachten
  ├── Mijn Biedingen
  ├── Smart Matches
  └── Bidding Historie
👥 Mijn Team
  ├── ZZP'ers Overzicht
  ├── Beschikbaarheid
  ├── Performance
  └── Team Planning
⚡ Actieve Diensten
  ├── Lopende Opdrachten
  ├── GPS Tracking
  ├── Incident Management
  └── Service Reports
💼 Biedingen & Contracten
  ├── Pending Bids
  ├── Gewonnen Opdrachten
  ├── Contract Management
  └── Client Feedback
💰 Financiën
  ├── Finqle Dashboard
  ├── Marge Analyse
  ├── Uitbetalingen
  └── Factuur Overzicht
```

**Bottom Navigation (Meest gebruikt):**
- **📊 Dash**: Marketplace dashboard
- **🛒 Mark**: Opdrachten marketplace
- **👥 Team**: Team management en beschikbaarheid
- **⚡ Actv**: Actieve diensten monitoring
- **💰 Fin**: Financiële dashboard en Finqle status

### Mobile Specifieke Features
- **Touch-friendly**: Alle bid buttons minimaal 44px hoog
- **Swipe gestures**: Swipe tussen verschillende opdrachten
- **Pull-to-refresh**: Vernieuw marketplace data
- **Push notifications**: Instant alerts voor nieuwe high-value matches
- **Offline capability**: Cached team data en opdracht details
- **Quick bid**: Floating action button voor snelle biedingen

---

## 🔄 Real-time Features

### Live Data Synchronization
```typescript
interface MarketplaceDashboard {
  availableJobs: MarketplaceJob[];
  teamAvailability: TeamMemberStatus[];
  activeBids: BidStatus[];
  smartMatches: MatchRecommendation[];
  financialStatus: FinqlePaymentStatus;
  performanceKPIs: CompanyKPIs;
  lastUpdated: Date;
}

// Real-time updates every 30 seconden voor marketplace
// Team status updates every 2 minuten
// Bid status: Instant push notifications
// Finqle payments: Real-time webhook updates
```

### Live Indicators
- **Green pulse**: Nieuwe opdrachten beschikbaar, perfecte matches
- **Yellow flash**: Urgente opdrachten, deadline approaching
- **Red alert**: Bid rejected, team emergency, payment issues
- **Blue info**: Bid accepted, nieuwe team member, Finqle payments received

### Push Notifications
- **High-value opdrachten**: Onmiddellijke melding voor premium clients
- **Smart matches**: AI-aanbevelingen voor optimale team-opdracht fit
- **Bid updates**: Status changes van ingediende offertes
- **Team alerts**: ZZP'er beschikbaarheid changes, GPS issues
- **Finqle alerts**: Payment confirmations, credit limit warnings

---

## 💾 Data Requirements

### Dashboard API Endpoints
```typescript
// Main marketplace dashboard data
GET /api/security-company/marketplace-dashboard
{
  availableJobs: MarketplaceJob[],
  teamStatus: TeamAvailability,
  activeBids: BidOverview[],
  smartMatches: MatchRecommendation[],
  performanceKPIs: CompanyPerformance,
  finqleStatus: PaymentStatus
}

// Real-time updates
WebSocket: /realtime/security-company/{companyId}/marketplace
- new_job_posted
- bid_status_change
- team_availability_change
- smart_match_found
- finqle_payment_received
- urgent_job_alert

// Quick actions
POST /api/security-company/bids/create
PUT /api/security-company/team/{zzzpId}/availability
GET /api/marketplace/jobs/nearby/{radius}
```

### Database Schema Used
- **securityCompanies** (companyId, name, wpbrNumber, settings, teamSize)
- **marketplaceJobs** (clientId, jobDetails, location, requirements, budget)
- **companyBids** (companyId, jobId, bidAmount, teamProposal, status)
- **companyZZPers** (companyId, zzpId, availability, skills, performance)
- **finqleTransactions** (companyId, jobId, amount, margin, status)
- **smartMatches** (companyId, jobId, matchScore, reasons)

---

## 🎨 Design System Compliance

### Beveiligingsbedrijf-Specific Kleuren
```css
/* Marketplace kleuren */
.marketplace-available { background: #10b981; } /* Nieuwe opdrachten, perfecte matches */
.marketplace-bidding { background: #3b82f6; } /* Actieve biedingen, in proces */
.marketplace-urgent { background: #f59e0b; } /* Urgente opdrachten, deadline critical */
.marketplace-rejected { background: #ef4444; } /* Afgewezen biedingen, problemen */

/* Smart match indicators */
.match-perfect { border-left: 4px solid #10b981; animation: pulse 2s infinite; }
.match-good { border-left: 4px solid #3b82f6; }
.match-possible { border-left: 4px solid #f59e0b; }
.match-poor { border-left: 4px solid #6b7280; }
```

### Component Reuse van Bestaande Wireframes
- **KPI Cards**: Hergebruikt design voor marketplace metrics
- **Status Badges**: Zelfde kleurencoding voor job/bid status
- **Real-time Indicators**: Pulse animaties voor live marketplace data
- **Card Layouts**: Responsive grid system voor opdrachten
- **Button Hierarchy**: Primary bid buttons, secondary action buttons

### Responsive Breakpoints
```css
/* Desktop First approach voor beveiligingsbedrijven */
.marketplace-desktop { min-width: 1024px; } /* Multi-panel dashboard */
.marketplace-tablet { max-width: 1023px; min-width: 768px; } /* 2 kolommen */
.marketplace-mobile { max-width: 767px; } /* Stacked cards */

/* Touch targets voor mobile bidding */
.mobile-bid-button { min-height: 44px; min-width: 120px; }
```

---

## 📊 Performance Targets

### Critical Response Times
- **Marketplace load**: < 2 seconden (inclusief alle beschikbare opdrachten)
- **Smart match berekening**: < 500ms voor AI recommendations
- **Bid submission**: < 1 seconde van klik tot bevestiging
- **Team availability check**: < 300ms real-time status

### Data Loading Strategy
- **Priority loading**: Urgente opdrachten en perfect matches eerst
- **Lazy loading**: Lagere prioriteit matches en historical data
- **Background refresh**: Continue sync van marketplace changes
- **Caching**: 2 minuten cache voor team data, real-time voor marketplace

---

## 🎯 Success Metrics

### Business KPIs te Monitoren
- **Bid win rate**: % gewonnen biedingen vs totaal ingediend
- **Average margin**: Gemiddelde marge per gewonnen opdracht
- **Team utilization**: % tijd dat ZZP'ers actief zijn op opdrachten
- **Response time**: Snelheid van reactie op nieuwe opdrachten
- **Client satisfaction**: Scores van afgeronde opdrachten

### User Experience Metrics
- **Time to bid**: Snelheid van marketplace opdracht tot ingediende bieding
- **Smart match accuracy**: % aanbevelingen die tot succesvolle biedingen leiden
- **Mobile vs Desktop usage**: Platform voorkeur voor marketplace activiteiten
- **Feature adoption**: Gebruik van smart matching vs handmatige opdracht zoek
- **Notification effectiveness**: Response rate op push notifications voor nieuwe opdrachten

### Finqle Integration Metrics
- **Payment processing speed**: Tijd van opdracht completion tot uitbetaling
- **Margin accuracy**: Correctheid van marge berekeningen en uitbetalingen
- **Credit utilization**: Gebruik van Finqle factoring opties door ZZP'ers
- **Financial transparency**: Zichtbaarheid van payment status en cash flow

Dit dashboard vormt het hart van de beveiligingsbedrijf operatie binnen het SecuryFlex marketplace model, met focus op efficiënte opdracht matching, team optimalisatie en maximale winstgevendheid via Finqle's geautomatiseerde payment systeem.