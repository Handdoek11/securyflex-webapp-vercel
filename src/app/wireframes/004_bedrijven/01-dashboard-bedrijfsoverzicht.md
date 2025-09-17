# Klant/Bedrijf Dashboard - Hoofdscherm

## Overzicht
Het Dashboard is het centrale controlecentrum voor bedrijven en organisaties die beveiligingsdiensten inhuren. Hier krijgen klanten een real-time overzicht van hun beveiligingsopdrachten, actieve diensten, ingezette beveiligers en kosten. Het dashboard is geoptimaliseerd voor desktop gebruik met responsive mobile ondersteuning.

## Functionaliteit
- **Opdrachten overzicht**: Status van alle geplaatste beveiligingsopdrachten
- **Live monitoring**: Real-time GPS tracking van ingezette beveiligers
- **Kosten overzicht**: Facturen, betalingen via Finqle
- **Incident rapportage**: Ontvang en bekijk incident rapporten
- **Quick actions**: Plaats nieuwe opdracht, bekijk offertes
- **Service historie**: Overzicht van afgeronde beveiligingsdiensten

## Key Performance Indicators
- Aantal actieve beveiligingsopdrachten
- Totale kosten deze maand
- Aantal ingezette beveiligers
- Incident rapporten deze week
- Service level compliance

---

## 🖥️ Desktop Versie (1024px+) - Primary Interface

### Main Dashboard View
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  SecuryFlex Business Portal                                                                     🔔 3  👤 Manager Portal  [Support] [Uitloggen]              │
├─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                 │                                                                                                                             │
│  📊 DASHBOARD              ●    │                                    📊 OPERATIONEEL OVERZICHT                                                              │
│  💼 DIENSTEN                    │                                                                                                                             │
│    ├── Actieve Diensten         │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐                         │
│    ├── Dienst Planning          │  │    Actieve Diensten │  │ Beschikbare Teams  │  │   Vandaag Omzet    │  │  Bezettingsgraad   │                         │
│    ├── Vacatures                │  │        23          │  │        47          │  │     €4,567         │  │       87%          │                         │
│    └── Archief                  │  │   🟢 +3 sinds gist.│  │   👥 12 teams vrij │  │   📈 +12% t.o.v.   │  │   📊 Target: 85%   │                         │
│  👥 PROFESSIONALS               │  │                    │  │                    │  │      gisteren      │  │                    │                         │
│    ├── Team Overzicht           │  └────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────────┘                         │
│    ├── Beschikbaarheid          │                                                                                                                             │
│    ├── Performance              │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│    └── Recruitment              │  │                                        🗺️ LIVE DIENSTEN KAART                                                      │ │
│  🏢 KLANTEN                     │  │                                                                                                                     │ │
│    ├── Klant Overzicht          │  │     📍Amsterdam Arena        📍Schiphol T3         📍Utrecht CS        📍Rotterdam Haven                          │ │
│    ├── Locaties                 │  │     ✅ 4 teams actief        ⚠️ 1 incident         ✅ 2 teams actief   🟡 Wissel team                           │ │
│    ├── Contracten               │  │     🕐 14:00-22:00          🕐 06:00-14:00         🕐 10:00-18:00     🕐 00:00-08:00                            │ │
│    └── Tevredenheid             │  │                                                                                                                     │ │
│  💰 FINANCIËN                   │  │  [🔍 Zoom In] [📊 Details] [🚨 Incidenten] [👥 Team Status]                                                      │ │
│    ├── Facturatie               │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│    ├── Betalingen               │                                                                                                                             │
│    ├── Credit Monitoring        │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│    └── Rapporten                │  │                                      📋 VANDAAG'S PLANNING                                                          │ │
│  🔔 INCIDENTEN                  │  │                                                                                                                     │ │
│  📊 ANALYTICS                   │  │  🕐 06:00-14:00  │ Schiphol Security     │ 6 prof. │ ⚠️ INCIDENT ACTIEF │ [🚨 URGENT ACTIE] [📍GPS] [📞Call]    │ │
│  ⚙️ INSTELLINGEN                │  │  🕐 08:00-16:00  │ Kantoor Utrecht      │ 2 professionals │ ✅ Operationeel    │ [Details] [GPS] [Contact]        │ │
│                                 │  │  🕐 14:00-22:00  │ Ajax Arena Event     │ 4 professionals │ ✅ Operationeel    │ [Details] [GPS] [Contact]        │ │
│  ────────────────────────       │  │  🕐 18:00-02:00  │ Nachtclub Rotterdam  │ 3 professionals │ 🟡 Vertraging      │ [Details] [GPS] [Contact]        │ │
│                                 │  │  🕐 22:00-06:00  │ Industrieterrein     │ 8 professionals │ ✅ Operationeel    │ [Details] [GPS] [Contact]        │ │
│  📈 QUICK STATS                 │  │                                                                                                                     │ │
│  • 156 totaal professionals     │  │  [🎯 NIEUWE DIENST CREËREN] [📊 Planning Overzicht] [⚡ Urgente Toewijzingen] [📋 Rapporten]                    │ │
│  • 23 actieve diensten         │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│  • 94% klant tevredenheid      │                                                                                                                             │
│  • €127k maand omzet           │  ┌───────────────────────────────┐  ┌───────────────────────────────┐  ┌───────────────────────────────┐                 │
│                                 │  │        🔔 ALERTS              │  │      💰 FINQLE STATUS        │  │      👥 TEAM PERFORMANCE      │                 │
│  🎯 DOELEN DEZE MAAND          │  │                               │  │                               │  │                               │                 │
│  Omzet: €150k (85% behaald)    │  │ • Incident Schiphol T3       │  │ Betalingen Vandaag:          │  │ Top Performer:                │                 │
│  Bezetting: 90% (87% actueel)  │  │   ⏰ 45 min geleden          │  │ ✅ €12,450 (15 van 15)       │  │ 👤 Jan de Vries (4.9⭐)      │                 │
│  Klanten: 5 nieuwe (3 behaald) │  │                               │  │                               │  │                               │                 │
│                                 │  │ • Team vertraging Rotterdam   │  │ Uitstaande Betalingen:       │  │ Aandacht Nodig:               │                 │
│                                 │  │   ⏰ 15 min geleden          │  │ ⏳ €3,200 (binnen 24h)       │  │ 👤 Mike Peters (3.2⭐)       │                 │
│                                 │  │                               │  │                               │  │                               │                 │
│                                 │  │ • Certificaat verloopt       │  │ Credit Status Klanten:       │  │ Gemiddelde Rating:            │                 │
│                                 │  │   🎓 Sarah Jansen (7 dgn)    │  │ 🟢 Alle klanten binnen       │  │ ⭐ 4.6/5 (zeer goed)         │                 │
│                                 │  │                               │  │    credit limiet             │  │                               │                 │
│                                 │  │ [Alle Alerts] [Instellingen] │  │                               │  │ [Team Details] [Evaluaties]   │                 │
│                                 │  └───────────────────────────────┘  └───────────────────────────────┘  └───────────────────────────────┘                 │
│                                 │                                                                                                                             │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Desktop Navigation Features
- **Collapsible sidebar**: Kunnen inklappen voor meer schermruimte
- **Live indicators**: Real-time status updates met groene/rode indicators
- **Hover tooltips**: Gedetailleerde info bij hover over KPI cards
- **Quick action toolbar**: Snelle toegang tot meest gebruikte functies
- **Multi-tab support**: Mogelijkheid om meerdere views te openen
- **Keyboard shortcuts**: Ctrl+D voor Dashboard, Ctrl+S voor Diensten, etc.

---

## 📱 Mobile Versie (375px - 768px) - Responsive Design

### Mobile Dashboard Overview
```
┌─────────────────────────────────────┐
│  [≡] SecuryFlex      🔔 3  👤      │
├─────────────────────────────────────┤
│                                     │
│        📊 DASHBOARD                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     💼 Actieve Diensten     │   │
│  │           23                │   │
│  │     🟢 +3 vandaag           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────┐  ┌─────────────────┐  │
│  │👥 Teams │  │  💰 Vandaag     │  │
│  │   47    │  │   €4,567        │  │
│  │vrij     │  │ 📈 +12%         │  │
│  └─────────┘  └─────────────────┘  │
│                                     │
│  ⚠️ URGENT                          │
│  ┌─────────────────────────────┐   │
│  │ 📍 Schiphol incident        │   │
│  │ ⏰ 45 min geleden           │   │
│  │ ┌─────────────────────┐     │   │
│  │ │    BEKIJK           │     │   │
│  │ └─────────────────────┘     │   │
│  └─────────────────────────────┘   │
│                                     │
│  📋 VANDAAG'S DIENSTEN              │
│  ┌─────────────────────────────┐   │
│  │ 🕐 06:00 Schiphol (6)       │   │
│  │ ⚠️ Incident actief          │   │
│  │ ┌─────────────────────┐     │   │
│  │ │     MANAGE          │     │   │
│  │ └─────────────────────┘     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🕐 14:00 Ajax Arena (4)     │   │
│  │ ✅ Operationeel             │   │
│  │ ┌─────────────────────┐     │   │
│  │ │      BEKIJK         │     │   │
│  │ └─────────────────────┘     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     [+ NIEUWE DIENST]       │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [📊][💼][👥][🏢][⚙️]              │
│ Dash Dienst Team Klant Prof       │
└─────────────────────────────────────┘
```

### Mobile Navigation Structure
**Hamburger Menu (≡) bevat:**
```
📊 Dashboard
💼 Diensten
  ├── Actieve Diensten
  ├── Dienst Planning
  ├── Vacatures
  └── Archief
👥 Professionals
  ├── Team Overzicht
  ├── Beschikbaarheid
  ├── Performance
  └── Recruitment
🏢 Klanten
  ├── Klant Overzicht
  ├── Locaties
  ├── Contracten
  └── Tevredenheid
💰 Financiën
  ├── Facturatie
  ├── Betalingen
  ├── Credit Monitoring
  └── Rapporten
🔔 Incidenten
📊 Analytics
⚙️ Instellingen
```

**Bottom Navigation (Meest gebruikt):**
- **📊 Dash**: Dashboard overzicht
- **💼 Dienst**: Actieve diensten en planning
- **👥 Team**: Professional management
- **🏢 Klant**: Client relationship management
- **⚙️ Prof**: Company profile en instellingen

### Mobile Specifieke Features
- **Touch-friendly**: Alle buttons minimaal 44px hoog
- **Swipe gestures**: Swipe tussen verschillende dashboard views
- **Pull-to-refresh**: Vernieuw real-time data
- **Push notifications**: Instant alerts voor incidenten
- **Offline capability**: Cached data beschikbaar zonder internet
- **Quick actions**: Floating action button voor nieuwe dienst

---

## 🔄 Real-time Features

### Live Data Synchronization
```typescript
interface DashboardRealtime {
  activeShifts: ShiftStatus[];
  teamLocations: GPSLocation[];
  incidents: IncidentAlert[];
  financialStatus: PaymentStatus;
  kpiMetrics: BusinessKPIs;
  lastUpdated: Date;
}

// Real-time updates every 30 seconden voor dashboard
// GPS tracking updates every 2 minuten voor actieve diensten
// Incident alerts: Instant push notifications
```

### Live Indicators
- **Green pulse**: Alles operationeel
- **Yellow flash**: Aandacht vereist (vertraging, low battery GPS)
- **Red alert**: Incident of kritieke situatie
- **Blue info**: Informatieve updates (nieuwe sollicitatie, betaling ontvangen)

### Push Notifications
- **Kritieke incidenten**: Onmiddellijke melding met geluid
- **Team alerts**: GPS issues, no-show, vertraging
- **Financial alerts**: Betalingen ontvangen, credit limieten
- **System alerts**: App updates, onderhoudsberichten

---

## 💾 Data Requirements

### Dashboard API Endpoints
```typescript
// Main dashboard data
GET /api/company/dashboard
{
  kpis: BusinessKPIs,
  activeShifts: ShiftOverview[],
  teamStatus: TeamMetrics,
  todaySchedule: TodayShifts[],
  alerts: Alert[],
  financialStatus: CompanyFinancials
}

// Real-time updates
WebSocket: /realtime/company/{companyId}/dashboard
- shift_status_change
- incident_reported
- gps_update
- payment_received
- team_status_change

// Quick actions
POST /api/company/shifts/create
PUT /api/company/alerts/{id}/acknowledge
GET /api/company/map/live-locations
```

### Database Schema Used
- **companies** (companyId, name, wpbrNumber, settings)
- **shifts** (companyId, clientId, status, startDatetime, endDatetime)
- **companyProfessionals** (companyId, professionalId, role, status)
- **incidents** (shiftId, type, severity, reportedAt, resolvedAt)
- **finqleTransactions** (companyId, amount, status, processedAt)
- **gpsCheckins** (real-time location tracking)

---

## 🎨 Design System Compliance

### Company-Specific Kleuren
```css
/* Bedrijfs KPI kleuren */
.business-success { background: #10b981; } /* Financiële targets, actieve diensten */
.business-warning { background: #f59e0b; } /* Vertraagde teams, credit alerts */
.business-info { background: #3b82f6; } /* Nieuwe sollicitaties, updates */
.business-critical { background: #ef4444; } /* Incidenten, kritieke alerts */

/* Status indicators */
.shift-active { border-left: 4px solid #10b981; }
.shift-incident { border-left: 4px solid #ef4444; animation: pulse 2s infinite; }
.shift-delayed { border-left: 4px solid #f59e0b; }
.shift-scheduled { border-left: 4px solid #6b7280; }
```

### Component Reuse van ZZP Wireframes
- **KPI Cards**: Hergebruikt design, aangepaste metrics
- **Status Badges**: Zelfde kleurencoding, bedrijfs-specifieke labels
- **Real-time Indicators**: Pulse animaties voor live data
- **Card Layouts**: Responsive grid system hergebruikt
- **Button Hierarchy**: Primary/Secondary button styling consistent

### Responsive Breakpoints
```css
/* Desktop First approach voor bedrijven */
.dashboard-desktop { min-width: 1024px; } /* 3-4 kolommen */
.dashboard-tablet { max-width: 1023px; min-width: 768px; } /* 2 kolommen */
.dashboard-mobile { max-width: 767px; } /* 1 kolom, stacked layout */

/* Touch targets voor mobile */
.mobile-touch-target { min-height: 44px; min-width: 44px; }
```

---

## 📊 Performance Targets

### Critical Response Times
- **Dashboard load**: < 2 seconden (inclusief alle KPI's)
- **Real-time updates**: < 100ms latency
- **Map rendering**: < 3 seconden voor alle actieve locaties
- **Mobile scroll performance**: 60fps smooth scrolling

### Data Loading Strategy
- **Priority loading**: KPI's eerst, dan kaart, dan details
- **Lazy loading**: Niet-kritieke widgets laden na hoofdcontent
- **Caching**: 5 minuten cache voor KPI data, real-time voor alerts
- **Background sync**: Update data terwijl gebruiker actief is

---

## 🎯 Success Metrics

### Business KPIs te Monitoren
- **Shift fill rate**: % diensten succesvol bezet
- **Response time**: Snelheid van incident response
- **Client satisfaction**: Gemiddelde klant tevredenheid score
- **Team utilization**: % actieve professionals
- **Revenue per hour**: Financiële efficiency metrics

### User Experience Metrics
- **Dashboard engagement**: Tijd besteed op hoofdscherm
- **Action completion rate**: % voltooide acties (nieuwe dienst, etc.)
- **Mobile vs Desktop usage**: Platform voorkeur tracking
- **Alert response time**: Snelheid van reactie op meldingen
- **Feature adoption**: Gebruik van nieuwe functionaliteiten