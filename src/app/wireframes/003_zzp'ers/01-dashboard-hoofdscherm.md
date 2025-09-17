# ZZP Dashboard - Hoofdscherm

## Overzicht
Het hoofdscherm van de ZZP beveiliger toont een overzicht van huidige status, verdiensten, aankomende shifts, en belangrijke meldingen. Dit is het eerste scherm dat ZZP'ers zien na inloggen.

## Functionaliteit
- **Primaire actie**: GPS check-in voor huidige shift (meest belangrijke)
- **Secundaire acties**: Bekijk nieuwe jobs, belangrijke meldingen
- **Quick overview**: Maandverdiensten en week status
- **Gefocuste notificaties**: Alleen kritieke items (vervallende documenten, aankomende shifts)

## Key Performance Indicators (Vereenvoudigd)
- Verdiensten deze maand (primair)
- Aantal nieuwe beschikbare jobs
- Huidige week prestaties
- Belangrijke deadlines/vervaldatums

---

## 🔲 Mobile Versie (375px - 768px)

```
┌─────────────────────────────────────┐
│  [≡] SecuryFlex    🔔 2  👤 Jan     │
├─────────────────────────────────────┤
│                                     │
│  Welkom, Jan! [Profiel foto]       │
│  Status: ✅ Beschikbaar            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      💰 Verdiensten         │   │
│  │       €2,450                │   │
│  │     Deze maand              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      📅 Vandaag             │   │
│  │   14:00-22:00               │   │
│  │   Ajax Arena Security       │   │
│  │                             │   │
│  │  ┌─────────────────────┐    │   │
│  │  │    🎯 CHECK-IN      │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      💼 Beschikbaar         │   │
│  │      5 nieuwe jobs          │   │
│  │                             │   │
│  │  ┌─────────────────────┐    │   │
│  │  │   BEKIJK JOBS       │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      🔔 Belangrijk          │   │
│  │   • BSN verloopt (7 dagen) │   │
│  │   • Morgen shift 08:00     │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [🏠][💼][💬][📅][👤]             │
│ Home  Jobs Chat Planning Profiel   │
└─────────────────────────────────────┘
```

### Mobile Specifieke Features
- **Single column layout**: Alle elementen onder elkaar voor optimale mobile ervaring
- **Grote touch targets**: Buttons zijn minimaal 44px hoog voor gemakkelijk tikken
- **Bottom navigation**: Vaste navigatie onderin voor duimbediening
- **Swipe gestures**: Horizontaal swipen tussen notificaties
- **Pull-to-refresh**: Trek naar beneden om gegevens te vernieuwen
- **Progressive loading**: Laad belangrijkste informatie eerst

### Mobile Interacties
- **Tap op KPI cards**: Toon gedetailleerde breakdown
- **Tap op notificatie**: Open relevante sectie (Jobs/Planning/Profile)
- **Tap op "Check-in"**: Start GPS verificatie flow
- **Long press op shift**: Toon snelle acties menu
- **Swipe op notificatie**: Markeer als gelezen/verwijder

---

## 🖥️ Desktop Versie (1024px+)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  [≡] SecuryFlex                         🔔 2    👤 Jan de Vries    [Profile]   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────┐    ┌─────────────────────────────┐   │
│  │  Welkom terug, Jan!    [Foto 80px] │    │     🔔 Belangrijke Items    │   │
│  │  Status: ✅ Beschikbaar           │    │                              │   │
│  └────────────────────────────────────┘    │  📄 BSN certificaat         │   │
│                                              │     verloopt (7 dagen)     │   │
│  ┌────────┐ ┌────────┐ ┌────────────────┐  │                              │   │
│  │💰Verdien│ │💼Shifts│ │   📅 Vandaag    │  │  📅 Morgen shift 08:00     │   │
│  │€2,450  │ │   5    │ │  14:00-22:00    │  │     Amsterdam Centrum      │   │
│  │Deze    │ │nieuwe  │ │  Ajax Arena     │  │                              │   │
│  │maand   │ │ jobs   │ │                 │  └─────────────────────────────┘   │
│  └────────┘ └────────┘ └────────────────┘                                    │
│                                                                               │
│  📅 Vandaag's Shift                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ 14:00-22:00  Ajax Arena - Champions League Security                     │ │
│  │ Event Security | €18/uur | 8 uur                                        │ │
│  │                                                                         │ │
│  │ [🎯 CHECK-IN STARTEN]    [📋 Details]    [🗺️ Navigate]                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌────────────────────────────────────┐    ┌─────────────────────────────┐   │
│  │  💼 Beschikbare Jobs               │    │     📊 Deze Week             │   │
│  │                                    │    │                              │   │
│  │  [📍 BEKIJK 5 NIEUWE JOBS]        │    │  38 uren gewerkt             │   │
│  │                                    │    │  €684 verwacht               │   │
│  │  Recent match: Schiphol (nieuw!)  │    │                              │   │
│  └────────────────────────────────────┘    │  ⭐ Rating: 4.8/5           │   │
│                                              └─────────────────────────────┘   │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│  [🏠 Dashboard] [💼 Jobs] [💬 Chat] [📅 Planning] [👤 Profiel]              │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Desktop Specifieke Features
- **Multi-column layout**: Efficiënt gebruik van schermruimte
- **Hover states**: Interactive feedback bij mouseover
- **Keyboard shortcuts**: Sneltoetsen voor frequente acties (Ctrl+J voor Jobs, etc.)
- **Expanded information**: Meer details zichtbaar zonder extra clicks
- **Sidebar notifications**: Permanent zichtbare notificatie panel
- **Quick actions toolbar**: Extra functionaliteit toegankelijk via toolbar

### Desktop Interacties
- **Click op KPI**: Toon trend grafiek overlay
- **Hover op shift**: Preview van shift details
- **Right-click menu**: Context menu met extra opties
- **Drag & drop**: Sleep shifts naar andere dagen (toekomstige feature)
- **Keyboard navigation**: Tab door elementen, Enter voor primaire actie

---

## 🔄 Real-time Features

### Live Updates
- **Shift status**: Real-time updates van shift wijzigingen
- **Nieuwe berichten**: Instant notificaties van nieuwe berichten
- **Payment status**: Live updates van betalingsstatus (24-uurs garantie)
- **GPS tracking**: Live locatie updates tijdens actieve shifts

### Push Notificaties
- **Nieuwe shifts**: Notificatie bij shift match
- **Shift wijzigingen**: Bij tijd/locatie wijzigingen
- **Betalingen**: Bevestiging van ontvangen betalingen
- **Urgente berichten**: Directe communicatie van beveiligingsbedrijven

---

## 💾 Data Requirements

### API Endpoints Nodig
```typescript
// Dashboard data
GET /api/zzp/dashboard
{
  user: UserProfile,
  kpis: MonthlyKPIs,
  todayShifts: Shift[],
  notifications: Notification[],
  weekOverview: WeeklyStats
}

// Real-time subscriptions
WebSocket: /realtime/zzp/{userId}/dashboard
- shift_updated
- message_received
- payment_status_changed
- notification_new
```

### Database Schema Gebruikt
- **users** (id, firstName, lastName, role='zzp')
- **securityProfessionals** (userId, available, hourlyRate)
- **shifts** (professionalId, status, startDatetime, endDatetime)
- **finqleTransactions** (professionalId, amount, status)
- **gpsCheckins** (shiftId, professionalId, type, createdAt)

---

## 🎨 Design System Compliance

### Kleuren (VERPLICHT)
- **Primary**: `#1e3a8a` (Hoofdacties, belangrijke informatie)
- **Success**: `#10b981` (GPS check-in, actieve status, verdiensten)
- **Secondary**: `#3b82f6` (Technologie accenten, links)
- **Warning**: `#f59e0b` (Shift aandacht, documentatie verloop)
- **Background**: `#f8fafc` (Achtergrond)
- **Text**: `#1e293b` (Primaire tekst)

### Typografie
- **H1**: `text-3xl font-bold text-[#1e3a8a]` (Hoofdtitels)
- **H2**: `text-2xl font-semibold text-[#1e293b]` (Sectie headers)
- **Body**: `text-base text-[#475569]` (Normale tekst)
- **Small**: `text-sm text-[#64748b]` (Meta informatie)

### Component Patterns
- **KPI Cards**: Altijd `Card` + `Badge` combinatie
- **Status Badges**:
  - Active: `bg-green-100 text-green-800 animate-pulse`
  - Bevestigd: `bg-blue-100 text-blue-800`
  - Wachtend: `bg-yellow-100 text-yellow-800`
- **Touch Targets**: Minimaal 44px hoog op mobile

---

## 📱 PWA Features

### Offline Capability
- **Dashboard cache**: Laatste bekende status beschikbaar offline
- **Shift data**: Huidige shifts beschikbaar voor GPS check-in
- **Background sync**: Synchroniseer zodra connectie terug is

### Native Features
- **Push notifications**: Browser notificaties voor nieuwe shifts
- **GPS access**: Locatie voor check-in functionaliteit
- **Camera access**: Foto's maken tijdens check-in
- **Add to homescreen**: Native app-achtige ervaring

---

## 🔒 Security & Privacy

### Data Protection
- **Minimale data**: Toon alleen relevante informatie
- **Auto-logout**: Sessie timeout na inactiviteit
- **Secure storage**: Gevoelige data encrypted in localStorage
- **GDPR compliance**: Gebruiker controle over persoonlijke data

### Access Control
- **Role-based**: Alleen ZZP-specifieke data zichtbaar
- **Organization scope**: Data beperkt tot eigen organisatie context
- **RLS Policies**: Database-niveau security via Supabase RLS