# INITIAL: Comprehensive Incident Management System

## FEATURE:
Build a complete incident management system for security professionals to report, track, and resolve security incidents with photo/video evidence, automatic stakeholder notifications, incident timeline tracking, and integration with insurance and legal compliance requirements. The system must support real-time incident reporting, evidence management, escalation procedures, and comprehensive audit trails for WPBR compliance and legal documentation.

**Specific Requirements:**
- Real-time incident creation with GPS location and timestamp verification
- Photo and video evidence upload with secure storage and compression
- Automatic notification system for all relevant stakeholders (company, client, authorities)
- Incident classification system (theft, vandalism, medical emergency, security breach)
- Escalation workflows with automatic authority notification for serious incidents
- Timeline tracking with detailed audit trail for legal compliance
- Integration with shift management for incident context
- Export functionality for insurance claims and legal proceedings

## EXAMPLES:
Reference these existing patterns and implementations:

**Core Incident Schema:**
- `src/models/Schema.ts` lines 274-295: Incidents schema with relationships to shifts and users
- Incident classification enum (security breach, safety, property damage, operational, legal)
- Evidence file relationships with secure storage references

**GPS Location Integration:**
- `src/types/GPS.ts`: Location verification for incident reporting
- GPS timestamp validation for incident authenticity
- Incident location mapping and visualization

**Evidence Management Patterns:**
- Photo compression and secure upload to Supabase Storage
- Video processing and storage optimization with size limits
- Document attachment handling (reports, statements, witness accounts)
- Evidence chain of custody tracking for legal compliance

**Notification Automation:**
- Real-time alerts to company management
- Client notification workflows based on incident severity
- Authority contact integration (police, fire, medical emergency services)
- Insurance company notification automation for claims

## DOCUMENTATION:
**Compliance Requirements:**
- WPBR (security industry regulations) incident reporting standards
- Dutch legal requirements for security incident documentation
- Insurance industry standards for evidence and claims processing
- Data protection (AVG/GDPR) for sensitive incident information

**Technical Architecture:**
- Real-time incident alerts using Supabase subscriptions
- Secure file upload with automatic virus scanning
- Audit trail implementation with immutable logging
- Export system for legal and insurance documentation

**Incident Classification System:**
- Severity levels (Critical, High, Medium, Low) with automatic escalation
- Category types (Security, Safety, Property, Operational, Legal)
- Resolution status tracking (Open, In Progress, Resolved, Closed)

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Real-time Reporting**: GPS-verified incident creation, automatic timestamp validation, immediate stakeholder notification
2. **Evidence Management**: Secure photo/video upload, compression optimization, chain of custody tracking, tamper-proof storage
3. **Escalation Procedures**: Severity-based automatic notifications, authority contact integration, management alerts
4. **Legal Compliance**: WPBR audit trails, export functionality, data retention policies, evidence preservation
5. **Integration Points**: Shift context for incidents, GPS location verification, user authentication validation

**Common Pitfalls to Avoid:**
- Don't skip GPS verification - critical for incident authenticity
- Don't forget evidence chain of custody - required for legal proceedings
- Don't implement without proper escalation workflows
- Don't overlook data retention policies - legal requirements vary
- Don't skip audit trail logging - essential for compliance

**File Structure Requirements:**
```
src/app/api/incidents/
├── create/route.ts             # Incident creation endpoint
├── evidence/route.ts           # File upload handling
├── notifications/route.ts      # Stakeholder alerts
└── export/route.ts            # Legal/insurance exports

src/components/incidents/
├── IncidentReporter.tsx        # Real-time incident creation
├── EvidenceUpload.tsx          # Photo/video capture and upload
├── IncidentTimeline.tsx        # Audit trail visualization
├── NotificationCenter.tsx      # Alert management
└── IncidentExport.tsx         # Legal documentation export

src/lib/incidents/
├── classification.ts          # Incident categorization logic
├── escalation.ts             # Automatic escalation rules
├── evidence.ts               # File processing and validation
└── compliance.ts             # Legal and regulatory utilities
```

**Evidence Security Requirements:**
- Automatic virus scanning on upload
- Encryption in transit and at rest
- Tamper-proof storage with checksums
- Access logging for audit trails
- Automatic backup and disaster recovery

**Notification System Requirements:**
- Immediate alerts for critical incidents
- Escalation timers for unacknowledged alerts
- Multiple notification channels (email, SMS, push)
- Authority contact database with emergency numbers

**Performance Requirements:**
- Incident creation: <5 seconds including evidence upload
- Photo upload: <10 seconds with compression
- Notification delivery: <30 seconds to all stakeholders
- Export generation: <60 seconds for legal documents

**Integration Dependencies:**
- GPS tracking system for location verification
- Shift management for incident context
- User authentication for reporter validation
- File storage system for evidence management

**Legal & Compliance:**
- WPBR incident reporting standards
- AVG/GDPR data protection compliance
- Evidence preservation requirements
- Audit trail immutability for legal proceedings

**Recommended Agent:** @security-auditor for compliance, @incident-manager for workflow optimization