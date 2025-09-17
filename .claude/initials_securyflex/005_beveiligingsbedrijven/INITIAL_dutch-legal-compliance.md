# INITIAL: Dutch Legal Compliance & AVG/GDPR Management System

## FEATURE:
Build comprehensive Dutch legal compliance management system ensuring full adherence to AVG/GDPR, arbeidsrecht (labor law), anti-schijnzelfstandigheid regulations, and security industry specific legal requirements. The system must automate compliance tracking, generate legal documentation, monitor working time directives, ensure minimum wage compliance, and provide automated audit trails for inspections by Dutch authorities (Inspectie SZW, Autoriteit Persoonsgegevens).

**Specific Requirements:**
- AVG/GDPR compliance automation with data mapping and consent management
- Anti-schijnzelfstandigheid (fake freelancer) detection and prevention
- Working time directive compliance monitoring (max 48 hours/week)
- Minimum wage tracking and automated enforcement
- Legal documentation generation for inspections and audits
- Cross-border data transfer compliance within EU
- Data retention policy automation (7-year requirement)
- Employee vs ZZP classification validation and protection

## EXAMPLES:
Reference these existing patterns and implementations:

**Legal Framework Foundation:**
- Netherlands GDPR implementation (AVG) with €820,000 maximum fines
- Arbeidsrecht compliance preventing €87,000 penalties for misclassification
- WNT (Wet normering topinkomens) transparency requirements
- Working Time Directive (max 48 hours/week) enforcement

**Database Schema Integration:**
- `src/models/Schema.ts` SecurityProfessional with legal status tracking
- User consent management with granular permissions
- Audit log tables with immutable compliance trails
- Data retention policies with automated deletion

**Authentication & Privacy:**
- `wireframes/002_auth/Auth.md`: AVG consent flows during registration
- GDPR-compliant user data export and deletion requests
- Cookie consent management with granular preferences
- Data processing basis documentation (legitimate interest, consent, contract)

**ZZP Protection Patterns:**
- Automated schijnzelfstandigheid risk assessment using government criteria
- Working relationship documentation to prove genuine independence
- Invoice and payment tracking demonstrating commercial relationship
- Multiple client requirements verification for true freelancer status

## DOCUMENTATION:
**Critical Legal Requirements:**
- AVG/GDPR: €820,000 maximum fines for privacy violations
- Arbeidsrecht: €87,000 penalties for employee misclassification
- Minimum wage compliance: Currently €11.05/hour (2024)
- Working time limits: Maximum 48 hours/week average
- Data retention: 7 years for financial/employment records

**Compliance Automation:**
- Real-time working time monitoring with overtime alerts
- Automated minimum wage calculation and enforcement
- ZZP independence criteria validation using government checklist
- GDPR consent management with explicit, granular permissions
- Legal document generation for inspections and audits

**Risk Mitigation:**
- Schijnzelfstandigheid prevention through relationship documentation
- Privacy impact assessments for new features
- Data breach notification within 72 hours to Autoriteit Persoonsgegevens
- Employee classification protection with legal documentation

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **AVG/GDPR Compliance Engine**: Data mapping automation, consent management with granular permissions, automated data subject requests (export, deletion, rectification)
2. **Anti-Schijnzelfstandigheid Protection**: Government checklist automation, working relationship documentation, multiple client verification, commercial independence proof
3. **Working Time Compliance**: Real-time hour tracking, 48-hour weekly limit enforcement, overtime alerts, rest period monitoring, emergency exemption procedures
4. **Wage Protection System**: Minimum wage calculation (€11.05/hour), automatic rate adjustments, penalty prevention, fair payment guarantees
5. **Legal Documentation Automation**: Inspection-ready reports, audit trail generation, compliance certificates, regulatory filing automation

**Common Pitfalls to Avoid:**
- Don't skip explicit consent collection - implied consent is insufficient under AVG
- Don't ignore working time aggregation - 48-hour limit is average over reference period
- Don't assume ZZP status - schijnzelfstandigheid criteria must be actively verified
- Don't delay breach notifications - 72-hour deadline is strictly enforced
- Don't retain data beyond legal requirements - automated deletion prevents violations

**Legal Compliance Framework:**
```
Compliance Monitoring:
├── 🔒 AVG/GDPR Privacy Protection (consent, data mapping, breach response)
├── ⚖️ Arbeidsrecht Compliance (classification, minimum wage, working time)
├── 🛡️ ZZP Protection (independence criteria, commercial relationship)
├── 📋 Documentation Generation (inspection reports, audit trails)
└── 🚨 Violation Prevention (automated alerts, penalty avoidance)
```

**AVG/GDPR Automation Features:**
- Data subject request automation (export, deletion, rectification within 30 days)
- Consent management with granular permissions and easy withdrawal
- Privacy impact assessments for new features and data processing
- Data breach detection and 72-hour notification automation
- Cross-border data transfer compliance documentation

**Anti-Schijnzelfstandigheid Protection:**
```
Government Criteria Validation:
├── Multiple clients requirement (minimum 3 active contracts)
├── Commercial relationship proof (invoicing, payment terms)
├── Independence demonstration (own equipment, workspace)
├── Risk assessment using official DBA criteria
└── Legal documentation package for inspection readiness
```

**Working Time Directive Compliance:**
- Real-time hour tracking with 48-hour weekly average monitoring
- Overtime alert system with automatic client notifications
- Rest period enforcement (minimum 11 hours between shifts)
- Emergency exemption procedures with proper documentation
- Monthly/quarterly compliance reporting for labor inspections

**Minimum Wage Protection:**
- Automatic rate calculation based on current minimum wage (€11.05/hour)
- Hourly rate validation for all shift assignments
- Client notification for non-compliant booking attempts
- Payment guarantee enforcement with penalty protection
- Age-based minimum wage adjustments (youth rates 15-22 years)

**Legal Documentation Automation:**
- Inspection-ready compliance reports with real-time data
- Audit trail preservation with 7-year retention policies
- Employee classification documentation packages
- Privacy policy updates with automatic notification
- Regulatory filing automation for required submissions

**Data Protection Implementation:**
- Data mapping with automated inventory updates
- Retention policy automation with secure deletion schedules
- Cookie consent management with granular user control
- Data processing register with legal basis documentation
- Privacy dashboard for users with transparency reporting

**Risk Assessment & Monitoring:**
- Schijnzelfstandigheid risk scoring using government criteria
- Working time violation prediction with preventive alerts
- Privacy compliance scoring with improvement recommendations
- Legal change monitoring with automatic policy updates
- Penalty prevention through proactive compliance management

**Integration Dependencies:**
- Government APIs for real-time legal requirement updates
- Payroll system integration for wage compliance verification
- Time tracking system for working directive compliance
- Document management for legal filing and storage
- Notification system for compliance alerts and deadlines

**Business Protection Benefits:**
- €820,000 GDPR fine prevention through automated compliance
- €87,000 arbeidsrecht penalty avoidance via classification protection
- Legal certainty for ZZP relationships reducing audit risk
- Competitive advantage through proven compliance systems
- Client trust through transparent legal adherence

**Performance Requirements:**
- Compliance check processing: <2 seconds for real-time validation
- Legal document generation: <10 seconds for inspection reports
- Data subject request fulfillment: <24 hours for automated requests
- Breach notification: <1 hour detection, <72 hours authority notification
- Working time calculations: Real-time with <5 second response

**Recommended Agent:** @legal-compliance for regulatory requirements, @privacy-engineer for AVG/GDPR implementation