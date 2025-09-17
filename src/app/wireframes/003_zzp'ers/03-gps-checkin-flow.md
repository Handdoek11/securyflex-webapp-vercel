# ZZP GPS Check-in Flow

## Overzicht
Het GPS Check-in proces is essentieel voor SecuryFlex - ZZP'ers moeten hun locatie verifiëren bij aanvang (check-in met foto) en einde (check-out zonder foto) van shifts. Het systeem gebruikt PostGIS voor nauwkeurige locatieverificatie binnen een configureerbare radius (standaard 100m).

## Functionaliteit
- **Locatie verificatie**: GPS coördinaten valideren tegen shift locatie
- **Foto verificatie**: VERPLICHT bij check-in, optioneel bij check-out
- **Offline capability**: Check-ins kunnen offline worden opgeslagen en later gesynchroniseerd
- **Real-time tracking**: Live locatie updates tijdens actieve shifts
- **Battery optimization**: Adaptieve GPS precisie op basis van batterijniveau

## Critical Business Rules
- **Nauwkeurigheid**: < 50 meter vereist voor succesvolle check-in
- **Foto bij check-in**: VERPLICHT, automatisch gecomprimeerd naar 1920x1080
- **Geen foto bij check-out**: Alleen GPS locatie verificatie
- **Radius configureerbaar**: Per locatie instelbaar (standaard 100m)
- **Performance**: Check-in flow < 2 seconden (exclusief foto upload)

---

## 🔲 Mobile Versie (375px - 768px)

### Check-in Initiation Screen
```
┌─────────────────────────────────────┐
│  [←] Check-in     Ajax Arena        │
├─────────────────────────────────────┤
│                                     │
│         📍 GPS Check-in             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     🎯 ZOEKT LOCATIE...     │   │
│  │                             │   │
│  │     ••• ••• •••             │   │
│  │                             │   │
│  │  📍 Ajax Arena              │   │
│  │     Amsterdam               │   │
│  └─────────────────────────────┘   │
│                                     │
│  📷 Foto maken verplicht            │
│  🔒 Locatie beveiligd opgeslagen    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      GPS ZOEKENDE...        │   │
│  │    [🔄 Vernieuwen]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  🎯 Vereist binnen 50m              │
│                                     │
└─────────────────────────────────────┘
```

### GPS Located - Ready to Check-in
```
┌─────────────────────────────────────┐
│  [←] Check-in     Ajax Arena        │
├─────────────────────────────────────┤
│                                     │
│        ✅ LOCATIE GEVONDEN          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🎯 BINNEN BEREIK (35m)     │   │
│  │                             │   │
│  │  📍 Ajax Arena              │   │
│  │     Amsterdam               │   │
│  │                             │   │
│  │  📡 Signaal: Sterk          │   │
│  │  🎯 Nauwkeurig: 12m         │   │
│  └─────────────────────────────┘   │
│                                     │
│         📷 Foto verplicht           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │       📷 CAMERA             │   │
│  │                             │   │
│  │  [Live camera preview]      │   │
│  │                             │   │
│  │   Richt op je gezicht       │   │
│  │                             │   │
│  │  ┌─────────────────────┐    │   │
│  │  │   📸 FOTO MAKEN     │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    WACHT OP FOTO...         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Photo Captured - Final Check-in
```
┌─────────────────────────────────────┐
│  [←] Terug    Ajax Arena Shift      │
├─────────────────────────────────────┤
│                                     │
│    📷 Foto Genomen ✅              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     [👤 FOTO PREVIEW]       │   │
│  │                             │   │
│  │    [Captured photo thumb]   │   │
│  │      180x240 preview        │   │
│  │                             │   │
│  │   ✅ Foto kwaliteit: Goed   │   │
│  │   📁 Gecomprimeerd: 1.2MB   │   │
│  │                             │   │
│  │  [📷 Opnieuw] [✅ Oké]     │   │
│  └─────────────────────────────┘   │
│                                     │
│  📍 Locatie Details:                │
│  • GPS: 52.3108° N, 4.9423° E      │
│  • Afstand: 35m van vereist punt   │
│  • Tijd: 14:32                     │
│  • Nauwkeurigheid: 12m             │
│                                     │
│  ☑️ Ik bevestig dat ik op locatie ben│
│  ☑️ Foto toont mij duidelijk       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     🎯 INCHECKEN            │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Check-in Success
```
┌─────────────────────────────────────┐
│  [←] Dashboard   Shift Actief       │
├─────────────────────────────────────┤
│                                     │
│       ✅ CHECK-IN SUCCESVOL!        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        🎉 GELUKT!          │   │
│  │                             │   │
│  │  Je bent succesvol          │   │
│  │  ingecheckt voor:           │   │
│  │                             │   │
│  │  📋 Ajax Arena Shift        │   │
│  │  🕐 14:32 - 30 Nov 2024     │   │
│  │  📍 Amsterdam Arena         │   │
│  └─────────────────────────────┘   │
│                                     │
│  🎯 Shift Status: ACTIEF            │
│  ⏱️ Gestart: 14:32                  │
│  📅 Gepland: 14:00-22:00            │
│  💰 Tarief: €18/uur                 │
│                                     │
│  📲 Real-time tracking gestart      │
│  🔋 Battery optimalisatie actief   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     📋 SHIFT DETAILS        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     📍 NAVIGATIE            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     🏠 TERUG DASHBOARD      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Check-out Flow (Simplified)
```
┌─────────────────────────────────────┐
│  [←] Terug    Shift Beëindigen      │
├─────────────────────────────────────┤
│                                     │
│    🏁 GPS Check-out                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     [🎯 GPS VERIFICATIE]    │   │
│  │                             │   │
│  │ ✅ Binnen bereik: 28m       │   │
│  │ 🎯 Nauwkeurigheid: 15m      │   │
│  │ 📡 Signaal: Goed            │   │
│  │                             │   │
│  │ 📍 Ajax Arena               │   │
│  │    Arena Boulevard 1        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⏱️ Shift Overzicht:                │
│  • Ingecheckt: 14:32               │
│  • Uitchecken: 22:15 (nu)          │
│  • Gewerkte uren: 7u 43m           │
│  • Tarief: €18/uur                 │
│  • Verdienst: €139,00              │
│                                     │
│  📝 Notities (optioneel):           │
│  ┌─────────────────────────────┐   │
│  │ Alles rustig verlopen...    │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       🏁 UITCHECKEN         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🖥️ Desktop Versie (1024px+)

### Desktop Check-in Interface
```
┌───────────────────────────────────────────────────────────────────────────────┐
│  [←] Dashboard    Ajax Arena Shift - GPS Check-in            [Help] [Settings] │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────┐ │
│  │              📍 GPS STATUS              │  │      📷 PHOTO CAPTURE       │ │
│  │                                         │  │                             │ │
│  │  Huidige Locatie:                      │  │                             │ │
│  │  📍 52.3108° N, 4.9423° E             │  │    [Camera preview area]    │ │
│  │  🎯 Nauwkeurigheid: 12m (✅ Goed)      │  │        640x480              │ │
│  │                                         │  │                             │ │
│  │  Vereiste Locatie:                     │  │  📸 Foto verplicht voor     │ │
│  │  📍 Ajax Arena, Amsterdam              │  │     check-in verificatie    │ │
│  │  📏 Afstand: 35m (✅ Binnen bereik)    │  │                             │ │
│  │  ⭕ Toegestane radius: 100m            │  │  [📷 Foto Maken]            │ │
│  │                                         │  │  [⚙️ Camera Instellingen]   │ │
│  │  🔋 Battery Status: 73% (🟢 Goed)     │  │                             │ │
│  │  📡 GPS Signaal: ████████ 98%          │  └─────────────────────────────┘ │
│  │                                         │                                 │
│  │  ⏱️ Laatste Update: 2 seconden geleden │  ┌─────────────────────────────┐ │
│  │                                         │  │       SHIFT DETAILS         │ │
│  │  [🔄 GPS Vernieuwen]                   │  │                             │ │
│  └─────────────────────────────────────────┘  │ 🏢 SecureEvents B.V.        │ │
│                                                 │ 📋 Event Beveiliger         │ │
│  ┌─────────────────────────────────────────┐  │ 🕐 14:00-22:00             │ │
│  │            📋 CHECK-IN SUMMARY          │  │ 💰 €18/uur (€144 totaal)   │ │
│  │                                         │  │                             │ │
│  │  Shift: Ajax Arena Champions League    │  │ 📍 Arena Boulevard 1        │ │
│  │  Datum: 30 November 2024               │  │    Amsterdam                │ │
│  │  Tijd: 14:00-22:00                     │  │                             │ │
│  │  Status: ⏳ Wacht op check-in          │  │ 📝 Extra Info:              │ │
│  │                                         │  │ "Champions League security" │ │
│  │  ✅ GPS Locatie geverifieerd           │  │                             │ │
│  │  ⏳ Foto nog nodig                     │  │ [📋 Volledige Details]      │ │
│  │  ☐ Bevestiging nog nodig               │  └─────────────────────────────┘ │
│  │                                         │                                 │
│  │  [📸 Foto Maken Eerst]                 │                                 │ │
│  └─────────────────────────────────────────┘                                 │ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                              ⚠️ BELANGRIJKE INFORMATIE                   │ │
│  │                                                                         │ │
│  │  • GPS locatie wordt alleen gebruikt voor shift verificatie            │ │
│  │  • Foto wordt beveiligd opgeslagen volgens GDPR richtlijnen           │ │
│  │  • Check-in is alleen mogelijk binnen 100m van shift locatie          │ │
│  │  • Bij problemen, neem contact op met je beveiligingsbedrijf          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│  [🏠 Dashboard] [💼 Jobs] [💬 Chat] [📅 Planning] [👤 Profiel]              │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Desktop Photo Captured State
```
┌───────────────────────────────────────────────────────────────────────────────┐
│  [←] Dashboard    Ajax Arena Shift - Bevestig Check-in       [Help] [Settings] │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────┐ │
│  │         ✅ FOTO GEVERIFIEERD            │  │      📊 CHECK-IN SUMMARY     │ │
│  │                                         │  │                             │ │
│  │                                         │  │ ✅ GPS: 35m (Binnen bereik) │ │
│  │     [Photo thumbnail 200x250]          │  │ ✅ Foto: Kwaliteit goed     │ │
│  │                                         │  │ ✅ Tijd: 14:32 (Op tijd)    │ │
│  │                                         │  │ ✅ Locatie: Geverifieerd    │ │
│  │  📊 Foto Details:                      │  │                             │ │
│  │  • Kwaliteit: ✅ Uitstekend            │  │ 🎯 Alles klaar voor         │ │
│  │  • Grootte: 1.2MB (Gecomprimeerd)     │  │    check-in!                │ │
│  │  • Resolutie: 1920x1080               │  │                             │ │
│  │  • Gezicht: ✅ Herkenbaar             │  │ ⏱️ Check-in duurt nog:      │ │
│  │                                         │  │    < 2 seconden             │ │
│  │  [📷 Nieuwe Foto] [✅ Gebruik Deze]   │  │                             │ │
│  └─────────────────────────────────────────┘  └─────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           📋 FINALE BEVESTIGING                          │ │
│  │                                                                         │ │
│  │  ☑️ Ik bevestig dat ik fysiek aanwezig ben op de shift locatie         │ │
│  │  ☑️ De gemaakte foto toont mij duidelijk en volledig                   │ │
│  │  ☑️ Ik ga akkoord met locatie tracking tijdens mijn shift             │ │
│  │  ☑️ Ik heb de shift instructies gelezen en begrepen                    │ │
│  │                                                                         │ │
│  │  📝 Optionele notitie voor je manager:                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Aangekomen op tijd, alles ziet er goed uit...                  │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                         │ │
│  │                    [🎯 BEVESTIG CHECK-IN]                             │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│  [🏠 Dashboard] [💼 Jobs] [💬 Chat] [📅 Planning] [👤 Profiel]              │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-time GPS Tracking

### During Active Shift
```typescript
interface ActiveShiftTracking {
  shiftId: number;
  currentLocation: GPSLocation;
  trackingInterval: number; // seconds between updates
  batteryOptimization: boolean;
  accuracyThreshold: number; // meters
  isWithinBounds: boolean;
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  timestamp: Date;
  batteryLevel?: number;
}
```

### Battery Optimization Logic
```typescript
function getTrackingInterval(batteryLevel: number): number {
  if (batteryLevel > 80) return 30; // 30 seconds
  if (batteryLevel > 50) return 60; // 1 minute
  if (batteryLevel > 20) return 120; // 2 minutes
  return 300; // 5 minutes (critical battery)
}

function getGPSAccuracy(batteryLevel: number): 'high' | 'medium' | 'low' {
  if (batteryLevel > 50) return 'high'; // <10m accuracy
  if (batteryLevel > 20) return 'medium'; // <25m accuracy
  return 'low'; // <50m accuracy
}
```

---

## 💾 Data Requirements

### GPS Check-in API
```typescript
// Start check-in flow
POST /api/zzp/shifts/{id}/checkin/start
{
  deviceInfo: DeviceInfo,
  currentLocation: GPSLocation
}

// Upload photo
POST /api/zzp/shifts/{id}/checkin/photo
FormData: photo (compressed to 1920x1080)

// Complete check-in
POST /api/zzp/shifts/{id}/checkin/complete
{
  location: GPSLocation,
  photoId: string,
  confirmed: boolean,
  notes?: string
}

// Check-out (no photo required)
POST /api/zzp/shifts/{id}/checkout
{
  location: GPSLocation,
  notes?: string
}
```

### Real-time Location Updates
```typescript
WebSocket: /realtime/gps/{shiftId}
- location_update: GPSLocation
- boundary_violation: AlertInfo
- shift_ended: CompletionInfo
```

### Database Schema Used
- **gpsCheckins** (shiftId, professionalId, type, latitude, longitude, gpsPoint, photoUrl)
- **shifts** (status, startDatetime, endDatetime)
- **locations** (locationPoint, radiusMeters)
- **fileUploads** (GPS check-in photos)

---

## 📱 Offline Capability

### Offline Check-in Process
1. **Store locally**: GPS coordinates en foto opslaan in IndexedDB
2. **Background sync**: Automatische upload zodra connectie terug is
3. **Visual feedback**: Duidelijke indicatie van offline status
4. **Data integrity**: Verificatie dat alle data correct is geüpload

### Offline Data Structure
```typescript
interface OfflineCheckIn {
  tempId: string;
  shiftId: number;
  type: 'check_in' | 'check_out';
  location: GPSLocation;
  photo?: Blob; // base64 encoded
  notes?: string;
  timestamp: Date;
  synced: boolean;
}
```

---

## 🔒 Security & Privacy

### Data Protection
- **GPS encryption**: Coördinaten encrypted in database
- **Photo security**: Automatische compressie en secure storage
- **Temporary storage**: Lokale data automatisch verwijderd na sync
- **Access logging**: Alle GPS access wordt gelogd voor audit

### GDPR Compliance
- **Minimale data**: Alleen noodzakelijke locatie data opslaan
- **Retention policy**: GPS data automatisch verwijderd na 2 jaar
- **Consent management**: Expliciete toestemming voor locatie tracking
- **Right to deletion**: Gebruikers kunnen GPS data laten verwijderen

---

## ⚡ Performance Optimizations

### Critical Performance Targets
- **GPS Lock Time**: < 5 seconden
- **Photo Compression**: < 2 seconden (to 1920x1080)
- **Check-in Process**: < 2 seconden total (excluding photo upload)
- **Offline Capability**: 100% for GPS check-ins
- **Battery Usage**: < 5% per 8-uur shift bij optimale instellingen

### Technical Optimizations
```typescript
// Progressive GPS accuracy
const getLocationOptions = (batteryLevel: number) => ({
  enableHighAccuracy: batteryLevel > 30,
  timeout: batteryLevel > 50 ? 10000 : 20000,
  maximumAge: batteryLevel > 70 ? 30000 : 60000
});

// Image compression
const compressPhoto = (file: File): Promise<Blob> => {
  const maxWidth = 1920;
  const maxHeight = 1080;
  const quality = 0.8; // 80% quality
  // ... compression logic
};
```

---

## 📊 Success Metrics

### KPIs to Track
- **GPS Check-in Success Rate**: > 95%
- **Average Check-in Time**: < 2 seconds
- **Photo Quality Success Rate**: > 98% (acceptable quality)
- **Offline Sync Success**: > 99.5%
- **Battery Impact**: < 5% drain per 8-hour shift
- **User Satisfaction**: > 4.5/5 stars for check-in experience

### Error Scenarios & Recovery
1. **GPS not available**: Fallback naar network-based location
2. **Camera not accessible**: Alternative photo upload methode
3. **Network issues**: Offline storage met background sync
4. **Battery critical**: Reduced tracking interval, basic accuracy
5. **Outside radius**: Clear instructions voor correcte locatie