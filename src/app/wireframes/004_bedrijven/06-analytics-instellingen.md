# 06. Analytics & Instellingen - Bedrijven

## Overzicht
Analytics dashboard met bedrijfsstatistieken en systeeminstellingen voor beveiligingsbedrijven. Combineert real-time analytics met configuratieopties voor optimale bedrijfsvoering.

## Desktop Interface (1024px+)

### Side Navigation (Consistent)
```
┌─────────────────────────┐
│ 🏢 SecuryFlex          │
│                         │
│ 📊 Dashboard           │
│ 💼 Diensten Beheer     │
│ 👥 Professionals       │
│ 🏢 Klanten Beheer      │
│ 💰 Financiën          │
│ 📈 Analytics & ⚙️      │ ← Active
│                         │
│ ────────────────────    │
│ 👤 Profiel             │
│ 📞 Support             │
│ 🚪 Uitloggen           │
└─────────────────────────┘
```

### Main Content Area - Analytics Tab
```
┌─────────────────────────────────────────────────────────────────┐
│ Analytics & Instellingen                                         │
│ ┌─────────────────┐ ┌─────────────────┐                         │
│ │ 📈 Analytics    │ │ ⚙️ Instellingen │                         │ ← Tab Navigation
│ │     Active      │ │                │                         │
│ └─────────────────┘ └─────────────────┘                         │
│                                                                 │
│ ┌─── Periode Selectie ─────────────────────────────────────────┐ │
│ │ 📅 Afgelopen 30 dagen ▼  │ 📊 Exporteer Rapport             │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── KPI Dashboard ─────────────────────────────────────────────┐ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │ │
│ │ │💼 Totaal    │ │⏰ Gem. Duur │ │💰 Omzet     │ │⭐ Rating  │ │ │
│ │ │ Diensten    │ │ per Dienst  │ │ Deze Maand  │ │ Klanten   │ │ │
│ │ │    247      │ │   8.5 uur   │ │ €124.850    │ │   4.7/5   │ │ │
│ │ │ +12% ↗️     │ │ -0.3 uur ↘️  │ │ +8% ↗️      │ │ +0.2 ↗️   │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── Performance Grafieken ────────────────────────────────────┐ │
│ │ ┌─── Diensten per Dag ──────────┐ ┌─── Top Locaties ──────┐ │ │
│ │ │     📊                        │ │ 1. Schiphol    47    │ │ │
│ │ │    /\    /\                   │ │ 2. Centraal    38    │ │ │
│ │ │   /  \  /  \   /\             │ │ 3. RAI         29    │ │ │
│ │ │  /    \/    \_/  \            │ │ 4. Zuidas      24    │ │ │
│ │ │ /              \  \           │ │ 5. Arena       18    │ │ │
│ │ │/                \__\          │ │                     │ │ │
│ │ │ Ma Di Wo Do Vr Za Zo         │ │ 📍 Bekijk Alle...   │ │ │
│ │ └───────────────────────────────┘ └─────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── Professionals Performance ─────────────────────────────────┐ │
│ │ ┌── Top Performers ──────────────────────────────────────────┐ │ │
│ │ │ 👤 Jan de Vries      ⭐ 4.9   💼 32 diensten  💰 €8.450  │ │ │
│ │ │ 👤 Emma van Dijk     ⭐ 4.8   💼 28 diensten  💰 €7.680  │ │ │
│ │ │ 👤 Mark Jansen       ⭐ 4.7   💼 25 diensten  💰 €6.890  │ │ │
│ │ │ 👤 Lisa Bakker       ⭐ 4.6   💼 23 diensten  💰 €6.320  │ │ │
│ │ └────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─ Snelle Acties ─┐                                           │ │
│ │ │ 🏆 Bonus Toekennen│                                          │ │
│ │ │ 📊 Prestatie Rapportage                                     │ │
│ │ │ 💬 Team Feedback  │                                          │ │
│ │ └───────────────────┘                                           │ │
│ └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Main Content Area - Instellingen Tab
```
┌─────────────────────────────────────────────────────────────────┐
│ Analytics & Instellingen                                         │
│ ┌─────────────────┐ ┌─────────────────┐                         │
│ │ 📈 Analytics    │ │ ⚙️ Instellingen │                         │ ← Tab Navigation
│ │                │ │     Active      │                         │
│ └─────────────────┘ └─────────────────┘                         │
│                                                                 │
│ ┌─── Bedrijfsinstellingen ──────────────────────────────────────┐ │
│ │ ┌─── Algemeen ─────────┐ ┌─── GPS & Locatie ─────────────────┐ │ │
│ │ │ 🏢 Bedrijfsnaam      │ │ 📍 Standaard Check-in Radius      │ │ │
│ │ │ [Security Pro BV   ] │ │ [100] meter                       │ │ │
│ │ │                     │ │                                   │ │ │
│ │ │ 📧 Contact Email     │ │ 📷 Verplichte Foto bij Check-in  │ │ │
│ │ │ [info@secpro.nl   ] │ │ ☑️ Ja  ☐ Nee                     │ │ │
│ │ │                     │ │                                   │ │ │
│ │ │ 📞 Telefoonnummer    │ │ ⚠️ GPS Nauwkeurigheid             │ │ │
│ │ │ [+31 20 123 4567  ] │ │ ☑️ Hoog (< 10m)  ☐ Normaal (< 50m) │ │ │
│ │ │                     │ │                                   │ │ │
│ │ │ 🆔 WPBR Nummer       │ │ 🔋 Batterij Optimalisatie        │ │ │
│ │ │ [WPBR2024-1234    ] │ │ ☑️ Adaptieve GPS  ☐ Altijd Hoog   │ │ │
│ │ └─────────────────────┘ └───────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── Financiële Instellingen ───────────────────────────────────┐ │
│ │ ┌─── Finqle Integratie ────────┐ ┌─── Tarieven ─────────────┐ │ │
│ │ │ 💳 API Status: ✅ Verbonden  │ │ 💰 Standaard Uurtarief   │ │ │
│ │ │                              │ │ [€25.50]                │ │ │
│ │ │ ⏰ Uitbetaling Garantie      │ │                          │ │ │
│ │ │ ✅ 24-uur Automatisch        │ │ 🌙 Nacht Toeslag        │ │ │
│ │ │                              │ │ [€5.00] per uur         │ │ │
│ │ │ 🏦 Factoring Optie           │ │                          │ │ │
│ │ │ ☑️ Beschikbaar voor ZZP'ers  │ │ 📅 Weekend Toeslag      │ │ │
│ │ │                              │ │ [€3.50] per uur         │ │ │
│ │ │ [⚙️ Finqle Instellingen]     │ │                          │ │ │
│ │ └──────────────────────────────┘ └──────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── Gebruikersbeheer ───────────────────────────────────────────┐ │
│ │ ┌─── Team Leden (8) ─────────────────────────────────────────┐ │ │
│ │ │ 👤 admin@secpro.nl        👑 Super Admin    ✅ Actief     │ │ │
│ │ │ 👤 manager@secpro.nl      🏢 Manager        ✅ Actief     │ │ │
│ │ │ 👤 planning@secpro.nl     📅 Planner        ✅ Actief     │ │ │
│ │ │ 👤 finance@secpro.nl      💰 Financieel     ✅ Actief     │ │ │
│ │ │ 👤 hr@secpro.nl           👥 HR Manager     ❌ Inactief   │ │ │
│ │ └────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─ Acties ─────────────────────────┐                          │ │
│ │ │ [+ Nieuwe Gebruiker Uitnodigen]  │                          │ │
│ │ │ [📊 Gebruikersrechten Beheren]   │                          │ │
│ │ │ [🔐 Wachtwoord Beleid Instellen] │                          │ │
│ │ └───────────────────────────────────┘                          │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── Notificatie Instellingen ──────────────────────────────────┐ │
│ │ ┌─── Email Meldingen ──────────┐ ┌─── Push Notificaties ────┐ │ │
│ │ │ 📧 Nieuwe Dienst Aangemaakt   │ │ 📱 Check-in Meldingen    │ │ │
│ │ │ ☑️ Manager  ☑️ Planner        │ │ ☑️ Direct  ☐ Samenvatting │ │ │
│ │ │                              │ │                          │ │ │
│ │ │ ⚠️ Incident Rapportages       │ │ 🚨 Nood Meldingen        │ │ │
│ │ │ ☑️ Manager  ☑️ HR             │ │ ☑️ SMS  ☑️ Email  ☑️ App │ │ │
│ │ │                              │ │                          │ │ │
│ │ │ 💰 Betalings Updates          │ │ 📊 Dagelijkse Rapporten  │ │ │
│ │ │ ☑️ Financieel  ☐ Manager      │ │ ☑️ 08:00  ☐ 17:00        │ │ │
│ │ └──────────────────────────────┘ └──────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─── Opslaan ────────────────────────────────────────────────────┐ │
│ │                    [💾 Wijzigingen Opslaan]                    │ │
│ └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Interface (375px-768px)

### Header & Navigation
```
┌─────────────────────────────────┐
│ ☰ Analytics & Instellingen   🔔 │ ← Hamburger menu + notifications
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │📈 Analytics │ │⚙️ Settings │ │ ← Tab switcher
│ │   Active    │ │             │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────┘
```

### Mobile Analytics View
```
┌─────────────────────────────────┐
│ 📅 Afgelopen 30 dagen ▼         │
├─────────────────────────────────┤
│ ┌─── KPI Cards ─────────────────┐│
│ │💼 Totaal Diensten             ││
│ │    247     +12% ↗️            ││
│ └───────────────────────────────┘│
│ ┌───────────────────────────────┐│
│ │⏰ Gem. Duur per Dienst        ││
│ │   8.5 uur   -0.3 uur ↘️       ││
│ └───────────────────────────────┘│
│ ┌───────────────────────────────┐│
│ │💰 Omzet Deze Maand            ││
│ │  €124.850    +8% ↗️           ││
│ └───────────────────────────────┘│
│ ┌───────────────────────────────┐│
│ │⭐ Rating Klanten               ││
│ │   4.7/5     +0.2 ↗️           ││
│ └───────────────────────────────┘│
├─────────────────────────────────┤
│ ┌─── Performance Graf ──────────┐│
│ │     📊                        ││
│ │    /\    /\                   ││
│ │   /  \  /  \   /\             ││
│ │  /    \/    \_/  \            ││
│ │ /              \  \           ││
│ │/                \__\          ││
│ │ Ma Di Wo Do Vr Za Zo         ││
│ └───────────────────────────────┘│
├─────────────────────────────────┤
│ ┌─── Top Locaties ──────────────┐│
│ │ 1. 📍 Schiphol       47       ││
│ │ 2. 📍 Centraal       38       ││
│ │ 3. 📍 RAI            29       ││
│ │ 4. 📍 Zuidas         24       ││
│ │ 5. 📍 Arena          18       ││
│ └───────────────────────────────┘│
├─────────────────────────────────┤
│ ┌─── Top Performers ────────────┐│
│ │ 👤 Jan de Vries               ││
│ │    ⭐ 4.9  💼 32  💰 €8.450   ││
│ │                               ││
│ │ 👤 Emma van Dijk              ││
│ │    ⭐ 4.8  💼 28  💰 €7.680   ││
│ │                               ││
│ │ 👤 Mark Jansen                ││
│ │    ⭐ 4.7  💼 25  💰 €6.890   ││
│ └───────────────────────────────┘│
├─────────────────────────────────┤
│ [📊 Exporteer Volledig Rapport] │
└─────────────────────────────────┘
```

### Mobile Settings View
```
┌─────────────────────────────────┐
│ ⚙️ Instellingen                  │
├─────────────────────────────────┤
│ ┌─── Bedrijf ───────────────────┐│
│ │ 🏢 Security Pro BV           ││
│ │ 📧 info@secpro.nl            ││
│ │ 📞 +31 20 123 4567           ││
│ │ 🆔 WPBR2024-1234             ││
│ │ [Bewerken >]                 ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ ┌─── GPS & Locatie ─────────────┐│
│ │ 📍 Check-in Radius            ││
│ │    100 meter                  ││
│ │                               ││
│ │ 📷 Verplichte Foto           ││
│ │    ☑️ Ja                     ││
│ │                               ││
│ │ ⚠️ GPS Nauwkeurigheid         ││
│ │    ☑️ Hoog (< 10m)           ││
│ │                               ││
│ │ 🔋 Batterij Optimalisatie    ││
│ │    ☑️ Adaptieve GPS          ││
│ │ [Bewerken >]                 ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ ┌─── Finqle Betalingen ─────────┐│
│ │ 💳 Status: ✅ Verbonden      ││
│ │ ⏰ 24-uur Garantie ✅         ││
│ │ 🏦 Factoring Beschikbaar ✅   ││
│ │ [Finqle Instellingen >]      ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ ┌─── Tarieven ──────────────────┐│
│ │ 💰 Standaard: €25.50/uur     ││
│ │ 🌙 Nacht: +€5.00/uur         ││
│ │ 📅 Weekend: +€3.50/uur       ││
│ │ [Tarieven Beheren >]         ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ ┌─── Team Beheer ───────────────┐│
│ │ 👥 8 Team Leden               ││
│ │ 👑 4 Admins, 3 Managers       ││
│ │ ❌ 1 Inactief                 ││
│ │ [Gebruikers Beheren >]       ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ ┌─── Notificaties ──────────────┐│
│ │ 📧 Email Meldingen ✅         ││
│ │ 📱 Push Notificaties ✅       ││
│ │ 🚨 Nood Meldingen ✅          ││
│ │ [Notificaties Instellen >]   ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ [💾 Wijzigingen Opslaan]        │
└─────────────────────────────────┘
```

## Kernfunctionaliteiten

### Analytics Dashboard
1. **Real-time KPI Monitoring**
   - Totaal aantal diensten met groei trend
   - Gemiddelde dienstduur analyse
   - Maandelijkse omzet tracking met Finqle integratie
   - Klantentevredenheid scores

2. **Performance Visualisatie**
   - Diensten per dag grafiek met trend analyse
   - Top locaties ranking met automatische GPS data
   - Professional performance leaderboard
   - ROI calculaties en winstgevendheid

3. **Exportfunctionaliteit**
   - PDF rapporten voor managementpresentaties
   - Excel exports voor financiële analyse
   - Aangepaste periode selectie
   - Automatische email scheduling

### Instellingen Beheer
1. **Bedrijfsconfiguratie**
   - WPBR nummer validatie voor compliance
   - Contact gegevens centrale opslag
   - Branding en logo configuratie
   - Tijdzone en regionale instellingen

2. **GPS & Locatie Instellingen**
   - Configureerbare check-in radius per locatie
   - Verplichte foto instelling voor compliance
   - GPS nauwkeurigheid optimalisatie
   - Batterij-bewuste location tracking

3. **Finqle Financiële Integratie**
   - 24-uurs uitbetaling garantie monitoring
   - Factoring opties voor ZZP'ers
   - Automatische tarief berekeningen
   - Real-time payment status tracking

4. **Gebruikersbeheer & Rechten**
   - Role-based access control (Admin, Manager, Planner, Financieel)
   - Team uitnodigingen met email verificatie
   - Wachtwoord beleid configuratie
   - Audit trail voor gebruikersacties

5. **Notificatie Management**
   - Email meldingen per rol
   - Push notificaties voor kritieke events
   - SMS escalatie voor nood situaties
   - Aangepaste melding schema's

## Component Hergebruik

### Shared Components (uit ZZP wireframes)
- **StatusBadge**: Voor dienst statussen (`active`, `completed`, `cancelled`)
- **LocationCard**: GPS locatie weergave met accuracy
- **PerformanceCard**: KPI displays met trend indicators
- **NotificationItem**: Unified notification styling
- **UserAvatar**: Professional profile displays
- **DateTimePicker**: Consistent date/time selection

### Company-Specific Components
- **AnalyticsChart**: Performance visualization met export
- **SettingsSection**: Collapsible configuration panels
- **TeamMemberRow**: User management met role indicators
- **FinqleStatus**: Payment integration status display
- **GPSConfigPanel**: Location settings interface

## Technische Specificaties

### Real-time Data Integration
```typescript
// Analytics real-time hooks
useRealtimeAnalytics(organizationId) // Live KPI updates
useRealtimePerformance(teamId)      // Professional performance
useFinqleTransactions(organizationId) // Payment status updates
```

### GPS Configuration Schema
```typescript
gpsSettings: {
  defaultRadius: number;        // Default 100m
  requirePhoto: boolean;        // Check-in photo mandatory
  accuracy: 'high' | 'normal'; // GPS precision level
  batteryOptimized: boolean;    // Adaptive GPS based on battery
}
```

### Analytics Data Model
```typescript
analyticsData: {
  period: DateRange;
  kpis: {
    totalShifts: number;
    avgDuration: number;
    monthlyRevenue: number;
    customerRating: number;
  };
  trends: {
    shiftsPerDay: DataPoint[];
    topLocations: LocationStats[];
    topPerformers: ProfessionalStats[];
  }
}
```

### Notification Configuration
```typescript
notificationSettings: {
  email: {
    newShift: UserRole[];
    incidents: UserRole[];
    payments: UserRole[];
  };
  push: {
    checkIns: 'immediate' | 'summary';
    emergencies: ('sms' | 'email' | 'app')[];
    dailyReports: TimeSlot;
  }
}
```

## State Management
- **Analytics State**: Zustand store voor real-time KPI data
- **Settings State**: Persistent configuration in Supabase
- **User Management**: Clerk integration met custom roles
- **GPS Settings**: Cached in localStorage voor offline access

## Performance Optimizations
- **Lazy Loading**: Analytics charts laden on-demand
- **Data Caching**: KPI data cache voor 5 minuten
- **Image Optimization**: Professional avatars geoptimaliseerd
- **Export Generation**: Background processing voor grote rapporten

## Accessibility Features
- **Screen Reader**: Volledige ARIA labels voor analytics
- **Keyboard Navigation**: Tab order geoptimaliseerd
- **High Contrast**: Support voor accessibility modes
- **Text Scaling**: Responsive text sizes voor readability

## Integraties

### Finqle API Integration
- Real-time payment status monitoring
- Automated 24-hour payment guarantee
- Factoring options voor ZZP'ers
- Transaction history en reporting

### GPS & Location Services
- PostGIS database voor location queries
- Real-time GPS tracking voor actieve diensten
- Geo-fencing voor automatic check-ins
- Location-based analytics en insights

### Email & SMS Services
- Automated notification system
- Multi-channel communication preferences
- Emergency escalation protocols
- Digest email scheduling

## Security & Compliance
- **GDPR/AVG Compliance**: Data processing agreement
- **WPBR Verification**: Security industry compliance
- **Role-Based Security**: Granular permission system
- **Audit Logging**: Complete user action tracking
- **Data Encryption**: At-rest en in-transit security

Deze wireframe completeert de volledige bedrijven-suite van SecuryFlex, met focus op data-driven besluitvorming en operationele excellentie door geavanceerde analytics en flexibele configuratieopties.