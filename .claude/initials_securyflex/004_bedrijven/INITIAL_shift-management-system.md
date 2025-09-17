# INITIAL: Comprehensive Shift Management System for Security Companies

## FEATURE:
Build enterprise-grade shift management system enabling security companies to create, plan, assign, monitor, and complete the full lifecycle of security services. The system must support wizard-based shift creation, AI-powered professional matching, real-time GPS monitoring, client approval workflows, bulk operations, and seamless integration with invoicing, providing complete operational control from service request to payment completion.

**Specific Requirements:**
- Wizard-guided shift creation with template support and bulk generation
- AI-powered professional matching based on skills, location, and availability
- Real-time shift monitoring with GPS tracking and status updates
- Client approval workflows with customizable authorization levels
- ATS integration for managing shift applications and assignments
- Bulk operations for efficient multi-shift management
- Performance tracking with KPIs and service quality metrics
- Automated invoicing upon shift completion with Finqle integration

## EXAMPLES:
Reference these existing patterns and implementations:

**Wireframe Foundation:**
- `wireframes/004_bedrijven/02-diensten-beheer.md`: Complete shift management interface with creation wizard, planning calendar, professional assignment, monitoring dashboard
- Desktop-optimized with responsive mobile fallback for field management
- Sidebar navigation for efficient workflow management
- Real-time status cards with GPS integration and incident alerts

**AI Matching Integration:**
- `INITIAL_personnel-shortage-solutions.md`: Smart matching algorithms for optimal professional-shift pairing
- Skills-based filtering (WPBR, VCA, EHBO certifications)
- Location optimization with travel time calculations
- Availability verification with CAO compliance checking
- Performance history weighting for quality assurance

**Database Schema Foundation:**
- `src/models/Schema.ts` shifts table (lines 168-197) with comprehensive status tracking
- Shift assignments with professional relationships and approval states
- GPS check-ins for location verification and time tracking
- Incident reports linked to specific shifts for documentation

**Real-time Monitoring:**
- `src/hooks/useRealtimeShifts.ts`: Live status updates and GPS tracking
- WebSocket subscriptions for instant status changes
- Push notifications for critical events and escalations
- Dashboard refresh with minimal latency

## DOCUMENTATION:
**Shift Lifecycle Management:**
- Draft → Published → Assigned → Active → Completed → Invoiced
- Each stage with specific validation rules and requirements
- Automated transitions based on time and GPS verification
- Rollback capabilities for error correction
- Complete audit trail for compliance

**Professional Assignment:**
- Smart matching with 95%+ accuracy for suitable candidates
- Manual override with reason documentation
- Bulk assignment for similar shifts
- Waitlist management for popular assignments
- Performance-based priority ranking

**Client Integration:**
- Customizable approval workflows per client requirements
- Automated notifications for status changes
- Service level agreement monitoring
- Quality feedback collection post-completion
- Transparent reporting and analytics access

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Shift Creation Wizard**: Multi-step form with validation, template library, bulk generation, client requirements capture, pricing calculation, skill requirements mapping
2. **AI Matching Engine**: Skills scoring algorithm, location-based optimization, availability checking, performance weighting, CAO compliance validation, cost optimization
3. **Real-time Monitoring Dashboard**: Live GPS tracking, status indicators, incident alerts, performance metrics, client notifications, escalation triggers
4. **Assignment Management**: Application tracking (ATS), approval workflows, waitlist handling, replacement procedures, communication automation, documentation
5. **Bulk Operations Interface**: Multi-select actions, batch status updates, mass communications, template applications, export capabilities, scheduled operations

**Common Pitfalls to Avoid:**
- Don't skip client approval steps - unauthorized assignments cause contract violations
- Don't ignore CAO compliance - illegal scheduling results in hefty fines
- Don't allow unverified assignments - GPS check-in validation is mandatory
- Don't forget mobile access - managers need field management capabilities
- Don't overlook performance tracking - quality metrics drive client retention

**Shift Management Architecture:**
```
Complete Lifecycle:
├── 📝 Creation (wizard, templates, requirements, pricing)
├── 🎯 Matching (AI algorithm, skills, location, availability)
├── ✅ Assignment (approval, notification, documentation)
├── 📍 Monitoring (GPS tracking, status, incidents, quality)
├── 💰 Completion (verification, invoicing, feedback, payment)
└── 📊 Analytics (performance, profitability, optimization)
```

**Shift Creation Wizard Steps:**
```
Creation Flow:
1. Basic Information (client, location, date/time, duration)
2. Requirements (skills, certifications, equipment, languages)
3. Pricing (hourly rate, client rate, margin calculation)
4. Special Instructions (access codes, contacts, procedures)
5. Review & Publish (validation, approval, notification)
```

**AI Matching Algorithm:**
- Skill match weight: 40% (required certifications and experience)
- Location score: 25% (distance and travel time optimization)
- Availability: 20% (schedule conflicts and preferences)
- Performance: 10% (historical ratings and reliability)
- Cost efficiency: 5% (rate optimization and margin protection)

**Client Approval Workflows:**
- Auto-approval for trusted professionals and routine shifts
- Manager approval for high-value or sensitive assignments
- Client approval for specific professional requirements
- Escalation procedures for urgent staffing needs
- Documentation of all approval decisions

**Monitoring Dashboard Components:**
- Active shifts map with real-time GPS positions
- Status grid showing all shift states and progress
- Alert panel for incidents and escalations
- Performance metrics with SLA compliance
- Communication hub for team coordination

**Bulk Operations Capabilities:**
- Create recurring shifts with pattern recognition
- Assign multiple professionals to similar shifts
- Update status for grouped selections
- Send mass communications to shift teams
- Export data for reporting and analysis

**ATS Integration Features:**
- Application inbox with sorting and filtering
- Candidate profiles with skills and history
- Quick review with accept/reject workflows
- Waitlist management with automatic offers
- Communication templates for applicants

**Performance Tracking Metrics:**
- On-time arrival rate (GPS-verified check-ins)
- Shift completion rate without incidents
- Client satisfaction scores and feedback
- Professional reliability and quality ratings
- Cost efficiency and margin analysis

**Incident Management Integration:**
- Real-time incident reporting from field
- Automatic client notification workflows
- Escalation procedures based on severity
- Documentation with photos and statements
- Resolution tracking and follow-up

**Quality Assurance Framework:**
- Random spot checks with GPS verification
- Client feedback collection and analysis
- Professional performance reviews
- Service improvement recommendations
- Training need identification

**Integration Dependencies:**
- GPS tracking system for location verification
- Messaging platform for team communication
- Finqle payment system for invoicing
- Client portal for approvals and feedback
- Calendar systems for scheduling

**Business Value:**
- Operational efficiency: 40% reduction in manual coordination
- Fill rate improvement: 95%+ through smart matching
- Client satisfaction: 25% increase through transparency
- Cost optimization: 15% margin improvement via AI
- Compliance: 100% CAO adherence preventing fines

**Performance Requirements:**
- Shift creation: <30 seconds complete wizard flow
- AI matching: <2 seconds for 100 candidates
- Status updates: <100ms real-time propagation
- Bulk operations: <5 seconds for 50 shifts
- Dashboard refresh: <1 second full update

**Recommended Agent:** @operations-manager for workflow design, @ai-engineer for matching algorithms