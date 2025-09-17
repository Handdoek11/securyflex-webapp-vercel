# Securyflex - Beveiligingsbedrijf Dashboard

## Kleurenpalet (consistent met andere apps)
- **Primary Blue**: oklch(0.45 0.22 240)
- **Electric Blue (Accent)**: oklch(0.65 0.25 265)
- **Success Green**: oklch(0.62 0.18 145)
- **Warning Amber**: oklch(0.75 0.15 70)
- **Destructive Red**: oklch(0.577 0.245 27.325)
- **Text Dark**: oklch(0.15 0.01 240)
- **Text Muted**: oklch(0.45 0.01 240)

## Account Structuur
**Subscription Tiers:**
- 1-5 medewerkers: €19,99/maand (incl. 2 admin accounts)
- 6-15 medewerkers: €29,99/maand (incl. 3 admin accounts)
- 15+ medewerkers: Custom pricing

**User Roles:**
- **Admin**: Volledige toegang
- **Planner**: Planning & roostering
- **HR**: Personeel management
- **Finance**: Facturatie & rapportage
- **Beveiliger**: Beperkte toegang (eigen rooster/uren)

## Complete Wireframe Specificaties

```
┌─────────────────────────────────────────────┐
│  📍 13:21  📶 📶 📶  🔋 92%                 │
├─────────────────────────────────────────────┤
│                                             │
│  SECURYFLEX PRO                            │  <- Business account
│  Guardian Security B.V.                    │  <- Bedrijfsnaam
│  [Account: 8/10 gebruikers]               │  <- Tier indicator
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ ACTIE VEREIST                          │  <- Multi-alert banner
│  • 3 shifts morgen onbemand               │
│  • 2 VOG's verlopen deze week             │
│  • CAO controle document klaar            │
│  [Bekijk alle meldingen →]                │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  VANDAAG - OPERATIONEEL OVERZICHT          │
│                                             │
│  ┌────────┬────────┬────────┬────────┐    │
│  │   28   │   6    │   4    │  98%   │    │  <- KPI cards
│  │Actief  │Klanten │No-show │Bezetting│    │
│  └────────┴────────┴────────┴────────┘    │
│                                             │
│  LIVE OPERATIONS                           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 Schiphol Terminal 3               │   │  <- Live shift card
│  │ Jan de Vries, Maria Jansen          │   │
│  │ ✅ Ingecheckt • 06:00-14:00         │   │
│  │ Klant: Schiphol Security            │   │
│  │                                     │   │
│  │ 📍 Amsterdam Arena                  │   │
│  │ Peter Smit (⚠️ 15 min te laat)      │   │
│  │ 🕐 Check-in pending • 14:00-22:00   │   │
│  │ Klant: Ajax Events                  │   │
│  │ [Vervanger zoeken]                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  PLANNING GAPS DEZE WEEK                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Ma ████████████████░░░░  90%        │   │  <- Bezetting bars
│  │ Di ████████░░░░░░░░░░░░  40% ⚠️     │   │
│  │ Wo ████████████░░░░░░░░  60%        │   │
│  │ Do ████████████████████  100% ✅    │   │
│  │ Vr ████░░░░░░░░░░░░░░░░  20% 🔴     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  FINANCIEEL SNAPSHOT                       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Deze maand                          │   │
│  │ Omzet:      €47.892 (↑12%)          │   │
│  │ Loonkosten: €31.450 (66%)           │   │
│  │ Marge:      €16.442 (34%)           │   │
│  │                                     │   │
│  │ Openstaand: €8.945                  │   │
│  │ [Bekijk facturen →]                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│  [📊]     [📅]     [👥]     [🏢]    [⚙️]   │
│Dashboard Planning  Team   Klanten  Beheer  │
│  ━━━━━                                     │  <- Active: Dashboard
└─────────────────────────────────────────────┘
```

## Component Specificaties

### Header (Pro Account)
- **Business branding**: "SECURYFLEX PRO" badge
- **Company name**: Montserrat Black, 18px
- **Account usage**: Small indicator voor gebruiker limiet
- **Tier indicator**: Shows subscription level

### Multi-Alert Banner
- **Background**: Light amber warning
- **Border**: 1px solid warning amber
- **Multiple items**: Bullet list format
- **Action button**: Electric blue link
- **Dismissible**: X close button (optional)

### KPI Cards Grid
- **Layout**: 4 equal columns
- **Background**: Light electric blue tint
- **Numbers**: Bold, 24px, electric blue
- **Labels**: 12px, muted text
- **Real-time updates**: WebSocket connection

### Live Operations Card
- **Background**: White with subtle border
- **Status icons**:
  - ✅ Green voor ingecheckt
  - ⚠️ Amber voor problemen
  - 🕐 Blue voor pending
- **Employee names**: Links naar profiel
- **Client name**: Muted text
- **Action buttons**: Context-aware

### Planning Gaps Visualization
- **Progress bars**:
  - Filled: Primary blue
  - Empty: Light grey
  - Colors: Green (90%+), amber (60-89%), red (<60%)
- **Percentages**: Right aligned
- **Warning indicators**: Status icons

### Financial Snapshot
- **Background**: Light success green tint
- **Trend indicators**: ↑ ↓ arrows with colors
- **Percentages**: In parentheses
- **Margin calculation**: Real-time from shifts
- **Action link**: Electric blue

### Bottom Navigation (5-tab)
- **Width**: 5 equal columns
- **Icons**: 20px (smaller due to space)
- **Labels**: 9px
- **Active**: Primary blue with indicator
- **Professional styling**: More corporate look

## Business Logic Features

### Multi-Tenant Management
- **Employee counting**: Against subscription tier
- **Role-based access**: Different permission levels
- **Usage monitoring**: Real-time user activity
- **Upgrade prompts**: When approaching limits

### Real-time Operations
- **Live check-ins**: GPS verification
- **No-show detection**: Automated alerts
- **Replacement workflow**: Emergency staffing
- **Client notifications**: Automated updates

### Financial Tracking
- **Revenue tracking**: Per client/location
- **Cost calculation**: Including platform fees
- **Margin analysis**: Real-time profitability
- **Cash flow monitoring**: Outstanding invoices

### CAO Compliance
- **Working time rules**: Automated monitoring
- **Shift change tracking**: With justifications
- **Overtime calculations**: According to CAO
- **Audit trail**: All changes logged

## Interactie States

### Real-time Updates
- **KPI refresh**: Every 30 seconds
- **Status changes**: Instant via WebSocket
- **Financial data**: Hourly updates
- **Planning gaps**: Live recalculation

### Alert Management
- **Priority levels**: Critical, warning, info
- **Dismiss options**: Individual or bulk
- **Action routing**: Direct to relevant screen
- **Notification history**: Audit trail

### Multi-user Awareness
- **Concurrent editing**: Conflict resolution
- **User presence**: Who's online indicators
- **Change attribution**: Track who made changes
- **Session management**: Role-based timeouts

## Subscription Tier Indicators

### Account Usage Display
```
┌─────────────────────────────────────────────┐
│  Account: 8/10 gebruikers                   │
│  Plan: MEDIUM (6-15 medewerkers)            │
│  Verlengt: 15 november 2024                 │
│                                             │
│  ✅ 3 admin accounts                        │
│  ✅ Priority support                        │
│  ✅ API toegang                             │
└─────────────────────────────────────────────┘
```

### Upgrade Prompt (when approaching limits)
```
┌─────────────────────────────────────────────┐
│  ⚠️ ACCOUNT LIMIET BIJNA BEREIKT            │
│                                             │
│  Je gebruikt 9/10 beschikbare accounts.    │
│  Upgrade naar LARGE voor onbeperkte        │
│  medewerkers.                               │
│                                             │
│  [Upgrade nu] [Meer info]                  │
└─────────────────────────────────────────────┘
```

## Role-Based Dashboard Variations

### Planner View
- **Focus**: Planning gaps en bezettingsratio's
- **Limited access**: Geen financiële data
- **Quick actions**: Shift creation, matching
- **Notifications**: Planning-gerelateerde alerts

### HR View
- **Focus**: Employee performance, documents
- **Limited access**: Geen client details
- **Quick actions**: Document reminders, evaluations
- **Notifications**: Expiring certificates, performance issues

### Finance View
- **Focus**: Revenue, margins, outstanding payments
- **Full access**: All financial data
- **Quick actions**: Invoice generation, payment tracking
- **Notifications**: Overdue payments, budget alerts

## Emergency Workflows

### No-Show Response
1. **Automatic detection**: GPS + time-based
2. **Alert cascade**: Planner → Admin → Client
3. **Replacement search**: Available staff matching
4. **Client notification**: ETA of replacement

### Document Expiry Management
1. **30-day warning**: Email + in-app notification
2. **7-day escalation**: Manager notification
3. **Expiry**: Automatic shift restriction
4. **Renewal tracking**: Document update workflow

## Integration Hooks

### External Systems
- **Payroll systems**: AFAS, Loket.nl integration
- **Accounting**: Exact Online, Twinfield
- **Planning tools**: Secusoft, Shiftbase
- **Compliance**: SFPB portal connectivity

### API Endpoints
- **Shift data**: For external planning tools
- **Employee data**: For payroll systems
- **Financial data**: For accounting software
- **Compliance reports**: For regulatory bodies