# Generate PRP (Product Requirements Prompt) for SecuryFlex

Generate a comprehensive Product Requirements Prompt (PRP) for a SecuryFlex feature based on the provided description.

## Process

1. **Research Phase**
   - Analyze existing codebase for similar patterns
   - Identify relevant SecuryFlex components
   - Check security and compliance requirements
   - Review Finqle/GPS integration needs

2. **Documentation Phase**
   - Create detailed feature specification
   - Define acceptance criteria
   - Specify role-based permissions
   - Include UI/UX requirements for each user role

3. **Blueprint Creation**
   - Step-by-step implementation plan
   - Database schema changes
   - API endpoints needed
   - Frontend components required
   - Integration points (Clerk, Finqle, GPS)

4. **Quality Gates**
   - Security checklist
   - GDPR compliance verification
   - Testing requirements
   - Performance considerations
   - Dutch/English localization needs

## Usage

```
/generate-prp [feature description]
```

## Example

```
/generate-prp "GPS check-in system for security professionals with photo verification and geofencing alerts"
```

## SecuryFlex Context

When generating PRPs, always consider:

### User Roles
- **Admin**: Full system access and monitoring
- **Company**: Security company managing shifts and professionals
- **Client**: Organizations requesting security services
- **ZZP**: Freelance security professionals

### Core Features
- 24-hour automatic payments via Finqle
- GPS verification for all shifts
- Multi-language support (Dutch primary, English secondary)
- Real-time tracking and incident reporting

### Technical Stack
- Next.js 15 with App Router
- React 19 with Server Components
- TypeScript for type safety
- Tailwind CSS + shadcn/ui
- Drizzle ORM with PostgreSQL
- Clerk for authentication

### Security Requirements
- GDPR compliant data handling
- Location privacy protection
- Secure payment processing
- Role-based access control
- Audit logging for compliance

## Output Format

The generated PRP should include:

```markdown
# PRP: [Feature Name]

## Executive Summary
[Brief description of the feature and its business value]

## User Stories
### As an Admin...
### As a Company...
### As a Client...
### As a ZZP...

## Functional Requirements
[Detailed feature specifications]

## Technical Requirements
### Database Changes
### API Endpoints
### Frontend Components
### Integrations

## Security & Compliance
### GDPR Considerations
### Security Measures
### Audit Requirements

## Implementation Plan
### Phase 1: [Foundation]
### Phase 2: [Core Features]
### Phase 3: [Polish & Testing]

## Acceptance Criteria
[Measurable success criteria]

## Risks & Mitigations
[Potential issues and solutions]
```

## Arguments

The feature description provided as $ARGUMENTS will be analyzed to generate a comprehensive PRP tailored to SecuryFlex's specific needs and architecture.