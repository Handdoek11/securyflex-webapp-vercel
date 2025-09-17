# Securyflex - Klanten Beheer

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
│  KLANTEN BEHEER                            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┬──────────┬──────────┐        │
│  │ Actief   │Prospects │Contracten│        │
│  │  (12)    │   (3)    │          │        │
│  └──────────┴──────────┴──────────┘        │
│  ━━━━━━                                    │
│                                             │
│  ACTIEVE KLANTEN                           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ SCHIPHOL SECURITY                   │   │  <- Client card
│  │ Premium klant • Since 2019          │   │
│  │                                     │   │
│  │ Contract: 24/7 coverage             │   │
│  │ Locaties: 4 (T1, T2, T3, Cargo)     │   │
│  │ Tarief: €28-32/uur + toeslagen      │   │
│  │                                     │   │
│  │ Deze maand:                         │   │
│  │ • 487 uur geleverd                  │   │
│  │ • €15.892 gefactureerd              │   │
│  │ • Bezetting: 94%                    │   │
│  │ • Incidenten: 0                     │   │
│  │                                     │   │
│  │ Openstaande shifts: 3               │   │
│  │ [Bekijk] [Planning] [Facturen]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ AJAX EVENTS                         │   │
│  │ Standaard klant • Since 2022        │   │
│  │                                     │   │
│  │ Contract: Event-based               │   │
│  │ Locatie: Amsterdam Arena            │   │
│  │ Tarief: €25/uur + event toeslag     │   │
│  │                                     │   │
│  │ Deze maand:                         │   │
│  │ • 156 uur geleverd                  │   │
│  │ • €4.290 gefactureerd               │   │
│  │ • Bezetting: 100%                   │   │
│  │                                     │   │
│  │ Volgende event: Za 21 sep           │   │
│  │ [Bekijk] [Planning] [Facturen]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  SLA MONITORING                            │
│  ┌─────────────────────────────────────┐   │
│  │ Response time: ⚫⚫⚫⚫⚫ 98%         │   │
│  │ Fill rate:     ⚫⚫⚫⚫⚫ 96%         │   │
│  │ No-shows:      ⚫⚫⚫⚫⚪ 0.8%        │   │
│  │ Incidents:     ⚫⚫⚫⚫⚫ 0           │   │
│  │ Satisfaction:  ⚫⚫⚫⚫⚪ 4.6/5       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [+ Nieuwe klant]                    │   │
│  │ [📄 Contract templates]             │   │
│  │ [📊 Klanten analyse]                │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [📊]     [📅]     [👥]     [🏢]    [⚙️]   │
│Dashboard Planning  Team   Klanten  Beheer  │
│                           ━━━━━━           │  <- Active: Klanten
└─────────────────────────────────────────────┘
```

## Tab: Prospects

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐        │
│  │ Actief   │Prospects │Contracten│        │
│  │  (12)    │   (3)    │          │        │
│  └──────────┴──────────┴──────────┘        │
│           ━━━━━━━━━                        │  <- Prospects tab
│                                             │
│  SALES PIPELINE                            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔥 HOT LEAD - RAI AMSTERDAM         │   │
│  │    Evenementlocatie                  │   │
│  │                                     │   │
│  │ Status: 💰 Offerte verstuurd        │   │
│  │ Waarde: ~€8.500/maand              │   │
│  │ Kans: 85%                          │   │
│  │                                     │   │
│  │ Contact: Lisa van der Berg          │   │
│  │ Laatste contact: 2 dagen geleden    │   │
│  │                                     │   │
│  │ Behoefte:                           │   │
│  │ • 24/7 evenementbeveiliging        │   │
│  │ • 4-8 beveiligers per event        │   │
│  │ • Start: November 2024             │   │
│  │                                     │   │
│  │ [📞 Bel nu] [📧 Follow-up] [📋 Notes]│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔶 WARM LEAD - ZUIDAS OFFICE        │   │
│  │    Kantoorcomplex                    │   │
│  │                                     │   │
│  │ Status: ☕ Demo ingepland           │   │
│  │ Waarde: ~€12.000/maand             │   │
│  │ Kans: 60%                          │   │
│  │                                     │   │
│  │ Demo datum: Vrijdag 20 sep 14:00   │   │
│  │ Locatie: Zuidas, Amsterdam         │   │
│  │                                     │   │
│  │ [📅 Voorbereiding] [🗺️ Route] [📋 Notes]│ │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ❄️ COLD LEAD - RETAIL CHAIN         │   │
│  │    Winkelketen (5 locaties)         │   │
│  │                                     │   │
│  │ Status: 📧 Eerste contact gemaakt   │   │
│  │ Waarde: ~€15.000/maand             │   │
│  │ Kans: 25%                          │   │
│  │                                     │   │
│  │ Sinds: 3 weken                     │   │
│  │ Volgende actie: Offerte aanvraag   │   │
│  │                                     │   │
│  │ [📄 Offerte maken] [📞 Bel] [❌ Afwijzen]│ │
│  └─────────────────────────────────────┘   │
│                                             │
│  PIPELINE METRICS                          │
│  ┌─────────────────────────────────────┐   │
│  │ Totale pipeline waarde: €35.500/mnd │   │
│  │ Gewogen waarde: €19.850/mnd        │   │
│  │ Conversion rate: 67% (laatste 6 mnd)│   │
│  │ Gem. sales cycle: 6 weken           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Tab: Contracten

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐        │
│  │ Actief   │Prospects │Contracten│        │
│  │  (12)    │   (3)    │          │        │
│  └──────────┴──────────┴──────────┘        │
│                          ━━━━━━━━━         │  <- Contracten tab
│                                             │
│  CONTRACT OVERZICHT                        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📄 SCHIPHOL SECURITY MASTER AGREEMENT│   │
│  │                                     │   │
│  │ Type: Raamcontract                  │   │
│  │ Looptijd: 3 jaar (2022-2025)        │   │
│  │ Status: ✅ Actief                   │   │
│  │                                     │   │
│  │ Basis tarief: €28-32/uur           │   │
│  │ Volume discount: 5% (>200u/mnd)     │   │
│  │ Exclusivity: 4 locaties            │   │
│  │                                     │   │
│  │ Verlenging: Auto-renewal (90d notice)│   │
│  │ Review datum: 1 maart 2025          │   │
│  │                                     │   │
│  │ [📖 Bekijk contract] [📝 Wijzig]    │   │
│  │ [📊 Performance] [💰 Facturatie]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📄 AJAX EVENTS SERVICE AGREEMENT    │   │
│  │                                     │   │
│  │ Type: Event-based contract          │   │
│  │ Looptijd: 2 jaar (2023-2025)        │   │
│  │ Status: ✅ Actief                   │   │
│  │                                     │   │
│  │ Event tarief: €25/uur base          │   │
│  │ Weekend bonus: +15%                 │   │
│  │ Rush surcharge: +25% (<48u notice)  │   │
│  │                                     │   │
│  │ Min guarantee: 120u/maand           │   │
│  │ Max capacity: 20 guards/event       │   │
│  │                                     │   │
│  │ [📖 Bekijk contract] [🎫 Events]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  VERLENGINGEN & REVIEWS                    │
│  ┌─────────────────────────────────────┐   │
│  │ 📅 Aankomende contract reviews:     │   │
│  │                                     │   │
│  │ • Schiphol Security - 4 maanden     │   │
│  │   Prep meeting: 1 dec 2024         │   │
│  │                                     │   │
│  │ • Office Park Zuid - 8 maanden     │   │
│  │   Performance review benodigd       │   │
│  │                                     │   │
│  │ [📋 Review planning]                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  LEGAL & COMPLIANCE                        │
│  ┌─────────────────────────────────────┐   │
│  │ ⚖️ Contract compliance status:      │   │
│  │                                     │   │
│  │ ✅ Liability insurance current      │   │
│  │ ✅ Data processing agreements       │   │
│  │ ✅ Quality certificates (ISO)       │   │
│  │ ⚠️ Privacy impact assessment (2/3)  │   │
│  │                                     │   │
│  │ [📋 Compliance checklist]           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Client Detail Modal

```
┌─────────────────────────────────────────────┐
│  CLIENT DETAILS                      [✕]   │
│  Schiphol Security B.V.                    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Logo] SCHIPHOL SECURITY B.V.       │   │
│  │                                     │   │
│  │ Premium klant sinds maart 2019      │   │
│  │ ⭐ 4.8 partnership rating           │   │
│  │ 📍 Schiphol-Rijk, Nederland         │   │
│  │ 🏆 Largest client (32% revenue)     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  CONTACT INFORMATIE                        │
│  ┌─────────────────────────────────────┐   │
│  │ Primary contact:                    │   │
│  │ John Smith - Security Manager       │   │
│  │ 📞 020-1234567                      │   │
│  │ 📧 j.smith@schipholsec.nl          │   │
│  │                                     │   │
│  │ Procurement contact:                │   │
│  │ Lisa Johnson - Procurement Lead     │   │
│  │ 📞 020-1234568                      │   │
│  │                                     │   │
│  │ Emergency contact: 24/7 hotline     │   │
│  │ 📞 0800-SECURITY                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  BUSINESS METRICS                          │
│  ┌─────────────────────────────────────┐   │
│  │ LTM Revenue: €189.456 (+12%)        │   │
│  │ Average monthly: €15.788            │   │
│  │ Profit margin: 28%                  │   │
│  │                                     │   │
│  │ Total shifts delivered: 1.847       │   │
│  │ Success rate: 99.2%                │   │
│  │ Client satisfaction: 4.8/5.0        │   │
│  │                                     │   │
│  │ Payment terms: NET30                │   │
│  │ Overdue invoices: €0 (excellent)    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  LOCATIES & SERVICES                       │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 Terminal 1 - 24/7 coverage       │   │
│  │    Weekly hours: 168 (4 guards)     │   │
│  │    Service: Access control & patrol │   │
│  │                                     │   │
│  │ 📍 Terminal 2 - Business hours      │   │
│  │    Weekly hours: 70 (2 guards)      │   │
│  │    Service: Baggage area security   │   │
│  │                                     │   │
│  │ 📍 Terminal 3 - Peak support        │   │
│  │    Weekly hours: Variable           │   │
│  │    Service: Crowd control           │   │
│  │                                     │   │
│  │ 📍 Cargo Area - Night shift         │   │
│  │    Weekly hours: 84 (3 guards)      │   │
│  │    Service: Asset protection        │   │
│  │                                     │   │
│  │ [📍 Locatie details] [📊 Analytics] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  RELATIONSHIP MANAGEMENT                   │
│  ┌─────────────────────────────────────┐   │
│  │ Account manager: Tom Peterson        │   │
│  │ Last meeting: 2 weken geleden        │   │
│  │ Next review: Q1 2025                │   │
│  │                                     │   │
│  │ Recent interactions:                 │   │
│  │ • Contract renewal prep (3d ago)    │   │
│  │ • Performance review (1w ago)       │   │
│  │ • New location request (2w ago)     │   │
│  │                                     │   │
│  │ [📝 Nieuwe interactie] [📞 Plan call]│  │
│  └─────────────────────────────────────┘   │
│                                             │
│  [📧 Verstuur bericht] [📄 Generate rapport]│
│  [📅 Plan meeting] [⚙️ Client instellingen] │
│                                             │
└─────────────────────────────────────────────┘
```

## SLA Dashboard Modal

```
┌─────────────────────────────────────────────┐
│  SLA PERFORMANCE DASHBOARD           [✕]   │
│  Alle klanten - Laatste 3 maanden          │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  OVERALL PERFORMANCE                       │
│  ┌─────────────────────────────────────┐   │
│  │ 🎯 SLA Compliance Score: 96.4%      │   │
│  │                                     │   │
│  │ ████████████████████▓▓▓▓  96.4%    │   │
│  │                                     │   │
│  │ Benchmark: Industry avg 91%        │   │
│  │ Target: >95% (✅ ACHIEVED)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  KEY METRICS BREAKDOWN                     │
│  ┌─────────────────────────────────────┐   │
│  │ ⏱️ Response Time (shift requests)    │   │
│  │ Target: <2 hours | Actual: 1.2h    │   │
│  │ ████████████████████████▓ 98%      │   │
│  │                                     │   │
│  │ 📋 Fill Rate (shift coverage)       │   │
│  │ Target: >95% | Actual: 96.2%       │   │
│  │ ████████████████████████▓ 96%      │   │
│  │                                     │   │
│  │ ❌ No-Show Rate                     │   │
│  │ Target: <2% | Actual: 0.8%         │   │
│  │ ████████████████████████▓ 99%      │   │
│  │                                     │   │
│  │ 🚨 Incident Response                │   │
│  │ Target: <15 min | Actual: 8 min    │   │
│  │ ████████████████████████▓ 97%      │   │
│  │                                     │   │
│  │ 😊 Client Satisfaction              │   │
│  │ Target: >4.0/5 | Actual: 4.6/5     │   │
│  │ ████████████████████████▓ 92%      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  CLIENT-SPECIFIC PERFORMANCE               │
│  ┌─────────────────────────────────────┐   │
│  │ 🏆 TOP PERFORMERS                   │   │
│  │ 1. Office Park Zuid     99.2%      │   │
│  │ 2. Ajax Events          98.8%      │   │
│  │ 3. Schiphol Security    97.1%      │   │
│  │                                     │   │
│  │ ⚠️ NEEDS ATTENTION                  │   │
│  │ 1. Retail Chain XYZ     89.4%      │   │
│  │    Issues: High no-show rate       │   │
│  │ 2. Downtown Hotel       91.2%      │   │
│  │    Issues: Response time           │   │
│  │                                     │   │
│  │ [📊 Detailed analytics]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  TREND ANALYSIS                            │
│  ┌─────────────────────────────────────┐   │
│  │ 📈 3-Month Trend: ↗️ +2.1%          │   │
│  │ 📊 Best month: September (97.8%)    │   │
│  │ 📉 Challenge area: Weekend coverage │   │
│  │                                     │   │
│  │ [📄 Generate SLA report]            │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Client Cards
- **Background**: White
- **Border**: 1px solid light border
- **Border radius**: 12px
- **Padding**: 16px
- **Shadow**: 0 2px 4px rgba(0,0,0,0.05)
- **Status indicators**:
  - Premium: Gold crown icon
  - Standard: Regular styling
  - Trial: Blue badge

#### Card Elements:
1. **Company Name**
   - Font: Bold, 18px
   - Color: Primary blue

2. **Client Status**
   - Premium/Standard/Trial badge
   - Since date in muted text

3. **Contract Information**
   - Service type and coverage
   - Location count
   - Rate information

4. **Performance Metrics**
   - Monthly statistics
   - Hours delivered
   - Revenue generated
   - Fill rate percentage

5. **Action Buttons**
   - Primary: "Bekijk" (view details)
   - Secondary: "Planning", "Facturen"
   - Height: 36px

### SLA Indicators
- **Progress bars**:
  - Green: >95% performance
  - Amber: 85-95% performance
  - Red: <85% performance
- **Dot indicators**: ⚫ for achieved, ⚪ for missed targets

### Pipeline Cards (Prospects)
- **Status colors**:
  - 🔥 Hot (Red): High probability, immediate action
  - 🔶 Warm (Orange): Moderate probability, follow-up needed
  - ❄️ Cold (Blue): Low probability, nurturing required
- **Progress indicators**: Visual pipeline stages

### Contract Management
- **Document status**:
  - ✅ Active/Valid: Success green
  - ⚠️ Expiring: Warning amber (<90 days)
  - 🔄 Under review: Info blue
  - ❌ Expired: Destructive red

## Business Intelligence Features

### Revenue Analytics
- **Client contribution**: Percentage of total revenue
- **Profitability analysis**: Margin per client
- **Growth tracking**: YoY and MoM comparisons
- **Forecasting**: Predictive revenue modeling

### Performance Monitoring
- **Real-time SLA tracking**: Live dashboard updates
- **Automated alerts**: When SLA thresholds breached
- **Trend analysis**: Historical performance patterns
- **Benchmark comparison**: Industry standards

### Relationship Management
- **Interaction history**: All touchpoints logged
- **Communication tracking**: Emails, calls, meetings
- **Renewal planning**: Automated reminders and prep
- **Satisfaction surveys**: Automated feedback collection

## Sales Pipeline Management

### Lead Qualification
- **Scoring system**: Automated lead scoring
- **Stage progression**: Defined sales stages
- **Activity tracking**: All sales activities logged
- **Conversion metrics**: Stage-to-stage conversion rates

### Opportunity Management
- **Probability weighting**: Realistic pipeline values
- **Close date tracking**: Expected closure dates
- **Competitor analysis**: Competitive landscape
- **Win/loss analysis**: Deal outcome tracking

### Proposal Generation
- **Template library**: Standardized proposals
- **Dynamic pricing**: Client-specific rates
- **Approval workflows**: Multi-level authorization
- **Document tracking**: Proposal status monitoring

## Contract Lifecycle

### Contract Creation
- **Template system**: Standardized terms
- **Custom clauses**: Client-specific requirements
- **Legal review**: Built-in approval workflow
- **Digital signatures**: Electronic signing capability

### Performance Tracking
- **SLA monitoring**: Automated compliance tracking
- **KPI dashboards**: Real-time performance metrics
- **Escalation procedures**: Automated alert system
- **Corrective actions**: Issue resolution tracking

### Renewal Management
- **Auto-renewal logic**: Default renewal settings
- **Performance reviews**: Pre-renewal evaluations
- **Negotiation support**: Historical data analysis
- **Amendment tracking**: Contract modification history

## Integration Capabilities

### CRM Systems
- **Salesforce**: Bidirectional sync
- **HubSpot**: Contact and deal sync
- **Microsoft Dynamics**: Full integration
- **Custom APIs**: Flexible integration options

### Financial Systems
- **Invoice generation**: Automated billing
- **Payment tracking**: Revenue recognition
- **Profitability analysis**: Cost allocation
- **Financial reporting**: Standard reports

### Communication Tools
- **Email integration**: Outlook/Gmail sync
- **Calendar sync**: Meeting scheduling
- **Document sharing**: Secure file exchange
- **Video conferencing**: Meeting integration

## Compliance & Risk Management

### Contract Compliance
- **Term monitoring**: Automated alerts
- **Performance validation**: SLA verification
- **Documentation**: Audit trail maintenance
- **Reporting**: Compliance dashboards

### Risk Assessment
- **Client risk scoring**: Financial stability
- **Operational risk**: Service delivery risks
- **Mitigation strategies**: Risk response plans
- **Insurance coverage**: Liability protection

### Data Security
- **Access controls**: Role-based permissions
- **Audit logging**: All actions tracked
- **Data encryption**: At rest and in transit
- **Backup procedures**: Data protection protocols