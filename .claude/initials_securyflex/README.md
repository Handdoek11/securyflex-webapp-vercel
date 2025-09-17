# SecuryFlex INITIAL Files Structure

## Overview
This directory contains all INITIAL files for SecuryFlex features, following Context Engineering best practices with SecuryFlex-specific adaptations.

## Structure Philosophy

### Two-Tier Approach
1. **INITIAL.md** - Simple, focused feature description (60-100 lines)
2. **{Feature}_PRP.md** - Detailed implementation plan (in .claude/PRPs/)

### SecuryFlex-Specific Adaptations
- Business rules integration (GPS accuracy, payment SLA, WPBR compliance)
- Performance targets enforcement (2s GPS, 24h payment, 3s mobile load)
- Dutch-first approach with security industry terminology
- Multi-role considerations (company, client, zzp)

## Directory Structure

```
.claude/INITS_securyflex/
├── README.md                           # This file
├── TEMPLATE_INITIAL.md                 # Base template
├──
├── CORE_FEATURES/
│   ├── 01_INITIAL_Authentication.md    # Clerk auth + role-based access
│   ├── 02_INITIAL_GPS_Checkin.md      # GPS verification system
│   ├── 03_INITIAL_Shift_Management.md # Shift lifecycle
│   ├── 04_INITIAL_Payment_Processing.md # Finqle integration
│   └── 05_INITIAL_Real_Time.md        # Live updates system
│
├── USER_INTERFACES/
│   ├── 10_INITIAL_Company_Dashboard.md # Business user interface
│   ├── 11_INITIAL_Client_Dashboard.md  # Client portal
│   ├── 12_INITIAL_ZZP_Dashboard.md     # Freelancer interface
│   └── 13_INITIAL_Admin_Panel.md       # Platform administration
│
├── MOBILE_PWA/
│   ├── 20_INITIAL_PWA_Core.md          # Progressive Web App base
│   ├── 21_INITIAL_Offline_Mode.md      # Offline functionality
│   ├── 22_INITIAL_GPS_Mobile.md        # Mobile GPS optimization
│   └── 23_INITIAL_Push_Notifications.md # Real-time alerts
│
├── BUSINESS_FEATURES/
│   ├── 30_INITIAL_Incident_Reporting.md # Security incident system
│   ├── 31_INITIAL_Compliance_Tracking.md # WPBR/VCA management
│   ├── 32_INITIAL_Analytics.md          # Business intelligence
│   └── 33_INITIAL_Communication.md      # In-app messaging
│
└── INTEGRATIONS/
    ├── 40_INITIAL_Finqle_API.md        # Payment gateway
    ├── 41_INITIAL_Maps_GPS.md          # Google Maps integration
    ├── 42_INITIAL_Email_System.md      # Notification emails
    └── 43_INITIAL_External_APIs.md     # Third-party integrations
```

## Naming Convention

### File Naming Pattern
`{Priority}_{TYPE}_{Feature_Name}.md`

- **Priority**: 01-99 (implementation order)
- **TYPE**: INITIAL (always)
- **Feature_Name**: PascalCase, descriptive

### Categories
- **01-09**: CORE_FEATURES (essential platform functions)
- **10-19**: USER_INTERFACES (role-specific dashboards)
- **20-29**: MOBILE_PWA (mobile optimization)
- **30-39**: BUSINESS_FEATURES (industry-specific tools)
- **40-49**: INTEGRATIONS (external services)

## Implementation Workflow

### 1. Create INITIAL.md
```markdown
## FEATURE: [Simple description]
## EXAMPLES: [Reference existing patterns]
## DOCUMENTATION: [Links to specs/standards]
## OTHER CONSIDERATIONS: [Constraints/warnings]
```

### 2. Create corresponding PRP
- Move to `.claude/PRPs/{Feature}_PRP.md`
- Use PRP template for detailed implementation
- Link back to INITIAL for context

### 3. Use Specialized Agents
- `@gps-engineer` for GPS features
- `@finqle-integrator` for payment features
- `@mobile-optimizer` for PWA features

### 4. Follow Validation Gates
- Performance targets met
- Security compliance validated
- Dutch translations complete
- Multi-role testing passed

## Business Rules Integration

Every INITIAL must consider:
- **GPS Accuracy**: <50m radius requirement
- **Payment SLA**: 24-hour guarantee
- **WPBR Compliance**: Dutch security regulations
- **Mobile Performance**: <3s load time on 3G
- **User Roles**: company, client, zzp access patterns

## Quality Standards

### INITIAL File Requirements
- 60-100 lines (focused scope)
- References to existing code patterns
- Clear business value statement
- Performance targets defined
- Security considerations included

### Progression to PRP
- Complex features need detailed PRP
- Simple features can stay as INITIAL only
- Always link INITIAL → PRP for traceability

## Usage Examples

### Creating New Feature
1. Copy `TEMPLATE_INITIAL.md`
2. Fill in 4 sections
3. Choose appropriate category/number
4. Reference existing patterns from codebase
5. Consider specialized agent assignment

### Feature Dependencies
- GPS features depend on Maps integration
- Payment features require Finqle setup
- Mobile features need PWA core
- Real-time features require Supabase config

## Success Metrics

### INITIAL Quality Gates
- ✅ Business value clearly defined
- ✅ Existing patterns referenced
- ✅ Performance targets specified
- ✅ Security considerations included
- ✅ Agent assignment appropriate

### Implementation Success
- All validation gates pass
- Performance targets met
- Security compliance verified
- Multi-role functionality confirmed
- Dutch translations complete

---

**Note**: This structure balances Reference Repository best practices with SecuryFlex's complex business requirements. Each INITIAL stays focused while PRPs handle implementation complexity.