# Beveiligers Monitoring - Live Tracking

## Overzicht
Het Beveiligers Monitoring systeem geeft bedrijven en organisaties real-time inzicht in de beveiligers die voor hun opdrachten werken. Live GPS tracking, incident rapportage, direct contact mogelijkheden en prestatie monitoring - alles om te verzekeren dat beveiligingsdiensten naar wens verlopen.

## Functionaliteit
- **Live tracking**: Real-time GPS locatie van actieve beveiligers
- **Dienst overzicht**: Zie welke beveiligers wanneer aanwezig zijn
- **Incident rapportage**: Ontvang en bekijk incident meldingen
- **Direct contact**: Communiceer direct met beveiligers of hun bedrijf
- **Prestatie monitoring**: Bekijk ratings en feedback van beveiligers
- **Check-in verificatie**: Zie foto's en tijden van GPS check-ins

## Key Features
- **GPS tracking**: Live locatie monitoring tijdens diensten
- **Geofencing alerts**: Melding bij verlaten beveiligingsgebied
- **Incident timeline**: Chronologisch overzicht van gebeurtenissen
- **Photo verification**: Visuele bevestiging van aanwezigheid
- **Emergency contact**: Direct alarm knop voor noodgevallen

---

## 🖥️ Desktop Versie (1024px+) - Primary Interface

### Live Monitoring Dashboard
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  SecuryFlex Klanten Portal                                                                      🔔 3  👤 Klant Portal    [Support] [Uitloggen]              │
├─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                 │                                                                                                                             │
│  📊 DASHBOARD                   │                                    👮 BEVEILIGERS MONITORING                                                               │
│  📋 OPDRACHTEN                  │                                                                                                                             │
│  👮 MONITORING            ●     │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│    ├── Live Tracking            │  │ [🔍 Filter...] [📅 Vandaag] [📍 Alle Locaties] [🔴 Alleen Actief] [🗺️ Kaart Weergave] [📊 Export]             │ │
│    ├── Check-ins                │  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│    ├── Incidenten               │                                                                                                                             │
│    └── Rapporten                │  📊 ACTIEVE BEVEILIGERS (8 van 12)                                                                                        │
│  💬 BERICHTEN                   │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐                                     │
│    ├── Inbox                    │  │  Actief Nu       │ │ Check-ins Vandaag│ │ Incidenten      │ │ Gemiddeld Rating │                                     │
│    └── Conversaties             │  │      8           │ │       15         │ │       0         │ │     ⭐ 4.7        │                                     │
│  💰 FINANCIËN                   │  │  beveiligers     │ │   succesvol      │ │   gerapporteerd │ │    Uitstekend     │                                     │
│    ├── Facturen                 │  └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘                                     │
│    ├── Betalingen               │                                                                                                                             │
│    └── Overzicht                │  🗺️ LIVE LOCATIE TRACKING                    [🗺️ Kaart] [📋 Lijst] [📊 Timeline]                                          │
│  📊 RAPPORTEN                   │                                                                                                                             │
│  ⚙️ INSTELLINGEN                │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│                                 │  │                                                                                                                     │   │
│  ──────────────────────        │  │                           🗺️ [Interactieve Google Maps Kaart]                                                  │   │
│                                 │  │                                                                                                                     │   │
│  📈 MONITORING STATS            │  │   🟢 Jan de Vries - Product Launch Event RAI                                                                      │   │
│  • 8 actief                    │  │      Check-in: 13:45 ✅ | Locatie: Hoofdingang | Battery: 78%                                                    │   │
│  • 4 pauze                     │  │                                                                                                                     │   │
│  • 0 incidenten                │  │   🟢 Sarah Jansen - Product Launch Event RAI                                                                      │   │
│  • 100% compliance             │  │      Check-in: 13:50 ✅ | Locatie: VIP Area | Battery: 92%                                                        │   │
│                                 │  │                                                                                                                     │   │
│  🎯 VANDAAG                     │  │   🟢 Mike Peters - Kantoor Zuidas                                                                                  │   │
│  Product Launch: 4 beveiligers │  │      Check-in: 06:00 ✅ | Locatie: Receptie | Battery: 65%                                                        │   │
│  Kantoor Zuidas: 2 beveiligers │  │                                                                                                                     │   │
│  Station Utrecht: 2 beveiligers│  │   [🔄 Refresh] [⚠️ Alert Grenzen] [📱 Contact Alle]                                                                │   │
│                                 │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                 │                                                                                                                             │
│                                 │  📋 BEVEILIGER DETAILS                        [Grid View] [Timeline] [Check-ins]                                           │
│                                 │                                                                                                                             │
│                                 │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│                                 │  │ Foto │ Naam & Bedrijf           │ Locatie & Status        │ Check-in Historie    │ Rating    │ Contact        │   │
│                                 │  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│                                 │  │ 👤  │ Jan de Vries              │ 📍 RAI Amsterdam        │ ✅ 13:45 Check-in   │ ⭐ 4.9    │ [📞][💬]       │   │
│                                 │  │     │ SecuPro B.V.              │ 🟢 Actief - Hoofdingang │ 📸 Foto verified    │ (45 rev)  │ [📧][🚨]       │   │
│                                 │  │     │ Beveiliger 2 + EHBO       │ GPS: ±12m nauwkeurig    │ Volgende: 21:45     │           │                │   │
│                                 │  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│                                 │  │ 👤  │ Sarah Jansen              │ 📍 RAI Amsterdam        │ ✅ 13:50 Check-in   │ ⭐ 4.7    │ [📞][💬]       │   │
│                                 │  │     │ SecuPro B.V.              │ 🟢 Actief - VIP Area    │ 📸 Foto verified    │ (38 rev)  │ [📧][🚨]       │   │
│                                 │  │     │ Beveiliger 2 + VCA        │ GPS: ±8m nauwkeurig     │ Volgende: 21:50     │           │                │   │
│                                 │  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│                                 │  │ 👤  │ Mike Peters               │ 📍 Zuidas Amsterdam     │ ✅ 06:00 Check-in   │ ⭐ 4.8    │ [📞][💬]       │   │
│                                 │  │     │ ZZP Beveiliger            │ 🟢 Actief - Receptie    │ 📸 Foto verified    │ (142 rev) │ [📧][🚨]       │   │
│                                 │  │     │ Beveiliger 2 + Portier    │ GPS: ±15m nauwkeurig    │ Volgende: 14:00     │           │                │   │
│                                 │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                 │                                                                                                                             │
│                                 │  [⬅️ Vorige] [1] [2] [➡️ Volgende]    Toon 3 van 8 beveiligers                                                          │
│                                 │                                                                                                                             │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Check-in Details View
```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [← Terug naar Monitoring]                        GPS CHECK-IN DETAILS - Jan de Vries                                                                     │
├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                                                               │
│ ┌──────────────────────────────────────┐  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │        👤 BEVEILIGER INFO            │  │                                    📍 CHECK-IN VERIFICATIE                                                │ │
│ │                                      │  │                                                                                                            │ │
│ │ Naam: Jan de Vries                   │  │  Check-in Tijd: 13:45:23                                                                                  │ │
│ │ Bedrijf: SecuPro B.V.                │  │  Check-in Type: Start Dienst                                                                              │ │
│ │ Certificaten: Beveiliger 2, EHBO     │  │  GPS Locatie: 52.3547° N, 4.9085° E                                                                       │ │
│ │ Rating: ⭐ 4.9 (45 beoordelingen)     │  │  Nauwkeurigheid: ±12 meter                                                                                │ │
│ │ Telefoon: +31 6 12345678             │  │  Verwachte Locatie: RAI Amsterdam Hoofdingang                                                             │ │
│ │ Status: 🟢 Actief                     │  │  Afstand tot Locatie: 8 meter ✅                                                                          │ │
│ │                                      │  │                                                                                                            │ │
│ │ Opdracht: Product Launch Event       │  │  ┌────────────────────────────────────────────────────────┐                                              │ │
│ │ Locatie: RAI Amsterdam               │  │  │                                                          │                                              │ │
│ │ Dienst: 14:00 - 22:00                │  │  │           [Check-in Foto van Beveiliger]                │                                              │ │
│ │ Functie: Toegangscontrole            │  │  │                                                          │                                              │ │
│ │                                      │  │  │           Timestamp: 28-11-2024 13:45:23                │                                              │ │
│ │ [📞 Bel] [💬 Chat] [📧 Email]        │  │  │           Locatie: Hoofdingang RAI                      │                                              │ │
│ │ [🚨 NOODGEVAL CONTACT]                │  │  │                                                          │                                              │ │
│ │                                      │  │  └────────────────────────────────────────────────────────┘                                              │ │
│ └──────────────────────────────────────┘  │                                                                                                            │ │
│                                            │  📊 CHECK-IN HISTORIE VANDAAG                                                                              │ │
│ ┌──────────────────────────────────────┐  │                                                                                                            │ │
│ │       📅 DIENST TIMELINE             │  │  13:45 - Check-in Start Dienst ✅ (Hoofdingang)                                                          │ │
│ │                                      │  │  14:00 - Dienst Gestart                                                                                   │ │
│ │ 13:30 │ Aankomst gemeld              │  │  15:30 - Positie Update (VIP Area)                                                                        │ │
│ │ 13:45 │ ✅ GPS Check-in              │  │  17:00 - Pauze Check-out (Kantine)                                                                        │ │
│ │ 14:00 │ Dienst gestart               │  │  17:30 - Pauze Check-in (Kantine)                                                                         │ │
│ │ 15:30 │ Locatie update               │  │  19:00 - Positie Update (Hoofdingang)                                                                     │ │
│ │ 17:00 │ Pauze start                  │  │  21:45 - Verwacht: Check-out Einde Dienst                                                                 │ │
│ │ 17:30 │ Pauze einde                  │  │                                                                                                            │ │
│ │ 19:00 │ Locatie update               │  │  [📊 Exporteer Historie] [🗺️ Toon Route] [📱 Apparaat Info]                                               │ │
│ │ 21:45 │ Verwacht check-out           │  └────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ │                                      │                                                                                                               │
│ │ [📊 Volledig Rapport]                │                                                                                                               │
│ └──────────────────────────────────────┘                                                                                                               │
│                                                                                                                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Versie (375px - 768px) - Responsive Design

### Mobile Live Monitoring
```
┌─────────────────────────────────────┐
│  [≡] Monitoring          [🔍] [🗺️] │
├─────────────────────────────────────┤
│                                     │
│  📊 ACTIEVE BEVEILIGERS             │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │ Actief  │ │Check-ins│ │Incident│ │
│  │    8    │ │   15    │ │   0    │ │
│  └─────────┘ └─────────┘ └────────┘ │
│                                     │
│  🗺️ LIVE TRACKING                   │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   [Mini Google Maps View]   │   │
│  │                             │   │
│  │  🟢 8 actieve locaties      │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  [Volledig Scherm Kaart]           │
│                                     │
│  👮 BEVEILIGERS STATUS              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🟢 Jan de Vries             │   │
│  │    RAI - Hoofdingang        │   │
│  │    ✅ 13:45 | ⭐ 4.9        │   │
│  │    [📞] [💬] [📍]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🟢 Sarah Jansen            │   │
│  │    RAI - VIP Area          │   │
│  │    ✅ 13:50 | ⭐ 4.7        │   │
│  │    [📞] [💬] [📍]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🟢 Mike Peters             │   │
│  │    Zuidas - Receptie       │   │
│  │    ✅ 06:00 | ⭐ 4.8        │   │
│  │    [📞] [💬] [📍]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Meer Laden... (3 van 8)]         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    🚨 NOODGEVAL KNOP        │   │
│  │      ALLE BEVEILIGERS       │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [📊][📋][👮][💬][💰]              │
│ Dash Opdracht Monitor Chat Fin    │
└─────────────────────────────────────┘
```

### Mobile Check-in Detail
```
┌─────────────────────────────────────┐
│  [←] Jan de Vries         [📞][💬] │
├─────────────────────────────────────┤
│                                     │
│  📸 CHECK-IN FOTO                   │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    [Beveiliger Foto]        │   │
│  │                             │   │
│  │  28-11-2024 13:45:23        │   │
│  │  Hoofdingang RAI            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✅ VERIFICATIE GESLAAGD            │
│  • GPS: 8m van locatie             │
│  • Tijd: Op tijd                   │
│  • Foto: Geverifieerd              │
│                                     │
│  👤 BEVEILIGER INFO                 │
│  ┌─────────────────────────────┐   │
│  │ SecuPro B.V.                │   │
│  │ Beveiliger 2 + EHBO         │   │
│  │ ⭐ 4.9 (45 reviews)         │   │
│  │                             │   │
│  │ Product Launch Event        │   │
│  │ 14:00 - 22:00              │   │
│  │ Toegangscontrole            │   │
│  └─────────────────────────────┘   │
│                                     │
│  📅 VANDAAG'S TIMELINE              │
│  ┌─────────────────────────────┐   │
│  │ 13:45 ✅ Check-in           │   │
│  │ 14:00 ⏰ Dienst start       │   │
│  │ 17:00 ☕ Pauze              │   │
│  │ 17:30 ⏰ Hervat             │   │
│  │ 21:45 ⏰ Check-out verwacht │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     🚨 NOODGEVAL            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     📊 VOLLEDIG RAPPORT     │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [📊][📋][👮][💬][💰]              │
│ Dash Opdracht Monitor Chat Fin    │
└─────────────────────────────────────┘
```

---

## 🔄 Real-time Features & Monitoring

### Live Data Updates
```typescript
interface LiveMonitoringData {
  securityGuardId: number;
  name: string;
  company: string;
  location: GPSCoordinates;
  status: 'active' | 'break' | 'offline' | 'emergency';
  lastUpdate: Date;
  batteryLevel: number;
  checkIns: CheckInRecord[];
}

// Updates every 30 seconds for active guards
// Emergency status triggers immediate update
```

### Geofencing & Alerts
- **Boundary alerts**: Notification when guard leaves designated area
- **Check-in reminders**: Alert if check-in is missed
- **Battery warnings**: Low battery notifications
- **Emergency signals**: Immediate alert on panic button

---

## 💾 Data Requirements

### API Endpoints
```typescript
// Get active security guards for client
GET /api/client/monitoring/active
{
  guards: SecurityGuard[],
  locations: GPSLocation[],
  checkIns: CheckInRecord[],
  incidents: Incident[]
}

// Get specific guard details
GET /api/client/monitoring/guard/{guardId}

// Emergency contact
POST /api/client/monitoring/emergency
{
  guardIds: number[],
  message: string,
  priority: 'high' | 'urgent'
}

// Export monitoring data
GET /api/client/monitoring/export?date={date}&format={pdf|excel}
```

### Real-time Subscriptions
```typescript
WebSocket: /realtime/client/{clientId}/monitoring
- guard_location_update
- check_in_completed
- incident_reported
- emergency_alert
- guard_status_change
```

---

## 🎨 Design System Compliance

### Klant-Specific Styling
```css
/* Monitoring status colors */
.guard-active { background: #10b981; }
.guard-break { background: #f59e0b; }
.guard-offline { background: #6b7280; }
.guard-emergency { background: #ef4444; animation: pulse 1s infinite; }

/* Check-in verification */
.checkin-success { border-left: 4px solid #10b981; }
.checkin-pending { border-left: 4px solid #f59e0b; }
.checkin-failed { border-left: 4px solid #ef4444; }
```

### Mobile Touch Targets
- Emergency button: 60px height (larger for critical action)
- Contact buttons: 44px minimum
- Map controls: 50px for easy interaction

---

## 📊 Performance & Success Metrics

### Monitoring KPIs
- **GPS update frequency**: Every 30 seconds
- **Check-in verification**: <2 seconds
- **Emergency response**: <5 seconds to all parties
- **Map rendering**: 60fps smooth scrolling
- **Data export**: <10 seconds for daily report

### Business Value Metrics
- **Compliance rate**: % of successful check-ins
- **Response time**: Average emergency response time
- **Coverage accuracy**: GPS accuracy statistics
- **Incident prevention**: Reduced incidents through monitoring
- **Client satisfaction**: Rating of monitoring features