# INITIAL: Complete Bedrijf/Klant Service Portal Application

## FEATURE:
Build a comprehensive portal application for bedrijven en organisaties die beveiligingsdiensten inhuren (klanten). The application provides opdracht placement, offerte comparison, live monitoring, and communication with beveiligingsbedrijven. The application must match wireframe specifications from `wireframes/004_bedrijven/` and enable clients to efficiently manage their security needs in the 3-party marketplace.

**Specific Requirements:**
- Desktop-first design optimized for business users (1024px+ primary)
- Navigation: 📊Dashboard, 📋Opdrachten, 💰Financiën, 👤Profiel
- Opdracht placement flow: describe needs → receive offertes → select beveiligingsbedrijf
- Real-time GPS tracking of assigned beveiligers during active diensten
- Incident reporting and communication with beveiligingsbedrijven
- Invoice management and payment via Finqle
- Multi-location support for organizations with multiple vestigingen

## EXAMPLES:
Reference these existing patterns and implementations:

**Core Client Schema:**
- `wireframes/004_bedrijven/01-dashboard-bedrijfsoverzicht.md`: Client dashboard overview wireframe
- `wireframes/004_bedrijven/02-diensten-beheer.md`: Service booking and management wireframe
- `wireframes/004_bedrijven/04-klanten-beheer.md`: Client portal interactions wireframe
- `src/models/Schema.ts` lines 168-197: Shifts schema adapted for client service requests
- `src/models/Schema.ts` lines 140-167: Organizations schema for client companies

**Service Booking Foundation:**
- Multi-step booking wizard with service type selection
- Date/time scheduling with recurring booking options
- Personnel requirements specification (number, specializations, certifications)

**Real-time Service Monitoring:**
- `src/hooks/useRealtimeShifts.ts`: Adapted for client service monitoring
- `src/hooks/useRealtimeGPS.ts`: Live location tracking of security personnel
- Real-time incident notifications and status updates

**UI Components for Professional Interface:**
- `src/components/ui/`: shadcn/ui components for professional client interface
- Booking wizard components with clear progress indication
- Map integration for live tracking and location services

## DOCUMENTATION:
**Architecture Reference:**
- `wireframes/004_bedrijven/`: Complete client portal wireframe collection
- `CLAUDE.md` Design system with professional client-focused styling
- Multi-organization support for client companies with multiple locations

**Service Categories:**
- Event Security (conferences, festivals, corporate events)
- Object Security (building protection, asset monitoring)
- VIP Protection (executive protection, escort services)
- Access Control (entry management, credential verification)

**Technical Specifications:**
- Next.js 15 App Router with client organization context
- Google Maps integration for live tracking visualization
- Supabase real-time subscriptions for service monitoring
- File upload system for incident evidence

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Service Booking System**: Multi-step wizard for service requests, personnel specifications, scheduling, approval workflow
2. **Real-time Monitoring**: Live GPS tracking of assigned personnel, service status updates, incident alerts
3. **Communication Hub**: Direct messaging with security companies, on-site team communication, emergency contact
4. **Incident Management**: Photo/video evidence upload, incident categorization, resolution tracking
5. **Payment Integration**: Finqle invoice processing, service history, payment tracking

**Common Pitfalls to Avoid:**
- Don't skip real-time tracking - clients need visibility into active services
- Don't forget multi-location support - enterprise clients have multiple premises
- Don't implement without proper incident reporting - critical for liability
- Don't overlook mobile responsiveness - clients check status on mobile
- Don't skip communication features - direct contact is essential

**File Structure Requirements:**
```
src/app/[locale]/(auth)/client/
├── dashboard/page.tsx          # Service overview + active tracking
├── booking/                    # Service request wizard
├── tracking/                   # Live GPS and service monitoring
├── chat/                       # Communication with providers
├── profile/                    # Organization settings + locations
└── layout.tsx                  # Client navigation layout

src/components/client/
├── ServiceBooking/             # Booking wizard components
├── LiveTracking/               # Real-time monitoring interface
├── IncidentReporting/          # Evidence upload and categorization
├── ServiceHistory/             # Past services and invoices
└── LocationManagement/         # Multi-premise support
```

**Service Booking Flow:**
1. Service type selection (Event, Object, VIP, Access Control)
2. Location and timing specification
3. Personnel requirements (count, certifications, specializations)
4. Special instructions and requirements
5. Budget approval and confirmation

**Real-time Monitoring Features:**
- Live GPS tracking of assigned security personnel
- Service status indicators (en route, on-site, active, completed)
- Incident alerts with immediate notification
- Check-in/check-out confirmations with photos

**Performance Requirements:**
- Service booking completion: <60 seconds
- Real-time tracking updates: <10 seconds latency
- Incident report submission: <30 seconds
- Dashboard load time: <3 seconds

**Integration Dependencies:**
- Company application system for service fulfillment
- ZZP personnel tracking for real-time monitoring
- Finqle payment system for invoice processing
- GPS tracking system for live location updates

**Security & Privacy:**
- Client data isolation with organization context
- Secure evidence upload and storage
- GDPR compliance for client communications
- Audit trails for all service interactions

**Recommended Agent:** @client-experience for booking optimization, @real-time for live tracking features