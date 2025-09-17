# SecuryFlex Development Workflow

## Overview
This guide explains how to effectively use the context engineering setup for SecuryFlex development.

## 🚀 Starting a New Feature

### Step 1: Identify Feature Type
Determine which domain your feature belongs to:
- **GPS/Location**: Use `gps-specialist` agent
- **Payments**: Use `payment-expert` agent
- **Database**: Use `database-expert` agent
- **Security/GDPR**: Use `security-auditor` agent
- **Testing**: Use `testing-agent` agent

### Step 2: Check Existing Patterns
Before implementing, review relevant PRPs:
```bash
# For GPS features
cat .claude/prps/gps-verification.md

# For payment features
cat .claude/prps/finqle-payment.md

# For auth features
cat .claude/prps/auth-system.md

# For shift features
cat .claude/prps/shift-management.md
```

### Step 3: Use Specialized Agent
Invoke the appropriate agent for guidance:
```
@claude Use the gps-specialist agent to help me implement offline GPS tracking
```

### Step 4: Follow Implementation Pattern
1. Create feature branch
2. Implement following PRP patterns
3. Run validation scripts
4. Update PRPs if new patterns discovered

## 🤖 Agent Selection Guide

### Decision Tree
```
Is it about GPS/location?
  ├─ YES → Use `gps-specialist`
  └─ NO → Continue

Is it about payments/invoicing?
  ├─ YES → Use `payment-expert`
  └─ NO → Continue

Is it about database/queries?
  ├─ YES → Use `database-expert`
  └─ NO → Continue

Is it about security/compliance?
  ├─ YES → Use `security-auditor`
  └─ NO → Continue

Is it about testing?
  ├─ YES → Use `testing-agent`
  └─ NO → Use general Claude
```

### Agent Capabilities

#### GPS Specialist
- PostGIS spatial queries
- Geofencing implementation
- Offline GPS handling
- Location privacy compliance
- Accuracy optimization

#### Payment Expert
- Finqle API integration
- VAT calculations (21%)
- Factoring fee (2.5%)
- 24-hour payment guarantee
- Invoice generation

#### Database Expert
- Query optimization
- Migration strategies
- Index management
- Real-time subscriptions
- Backup procedures

#### Security Auditor
- GDPR/AVG compliance
- Role-based access control
- Data encryption
- Audit logging
- Incident response

#### Testing Agent
- Unit test patterns
- E2E scenarios
- Performance testing
- Security testing
- Coverage requirements

## 📝 Development Process

### 1. Pre-Development
```bash
# Check project status
cat .claude/CONTEXT_STATUS.md

# Review relevant PRPs
ls .claude/prps/

# Check existing implementations
grep -r "pattern_name" src/
```

### 2. During Development
The hooks will automatically:
- **On code change**: Run relevant tests (post-code-change.sh)
- **On commit**: Validate code quality (pre-commit.sh)
- **On push**: Full validation suite (pre-push.sh)

### 3. Validation
```bash
# Run specific validations
npm run validate:gps
npm run validate:payments
npm run validate:rbac

# Run all validations
npm run validate:all
```

### 4. Post-Development
Update PRPs with new patterns discovered:
```markdown
## New Pattern: [Pattern Name]
**Date Added**: 2024-12-15
**Status**: Experimental
**Example**: src/features/[feature]/[file].tsx:L123

[Pattern description and code example]
```

## 🔄 Updating Context

### When to Update PRPs
- New pattern discovered
- Pattern deprecated
- Better implementation found
- Bug in existing pattern

### How to Update PRPs
1. Open relevant PRP file
2. Add new section with date
3. Mark old patterns as deprecated if replaced
4. Update index (00-index.md)

### Example PRP Update
```markdown
## ✅ GPS Check-in Pattern v2
**Updated**: 2024-12-15
**Status**: Active
**Replaces**: v1 (deprecated)

New pattern using enhanced accuracy:
[code example]

**Why changed**: Better battery optimization
```

## 🧪 Testing Workflow

### Before Commit
```bash
# Type checking
npm run check-types

# Linting
npm run lint

# Unit tests
npm test
```

### Before Push
```bash
# Build verification
npm run build

# All validations
npm run validate:all

# E2E tests (if applicable)
npm run test:e2e
```

## 🚨 Troubleshooting

### Common Issues

#### GPS Validation Fails
1. Check PostGIS installation
2. Verify coordinate precision (8 decimals)
3. Check radius configuration

#### Payment Validation Fails
1. Verify VAT calculation (21%)
2. Check factoring fee (2.5%)
3. Validate webhook timeout (<2s)

#### RBAC Validation Fails
1. Check user role assignments
2. Verify organization links
3. Review permission matrix

### Getting Help
1. Check relevant agent documentation
2. Review PRP examples
3. Run validation scripts for diagnostics
4. Check error patterns in PRPs

## 📊 Monitoring Development

### Quality Metrics
- All tests passing
- Coverage > 80%
- Zero critical security issues
- Performance targets met
- Validation scripts passing

### Progress Tracking
Use todo list for complex features:
```
@claude Create a todo list for implementing shift assignment feature
```

## 🎯 Best Practices

### DO
- ✅ Check PRPs before implementing
- ✅ Use specialized agents
- ✅ Run validations frequently
- ✅ Update PRPs with learnings
- ✅ Follow existing patterns

### DON'T
- ❌ Skip validation scripts
- ❌ Ignore failing tests
- ❌ Create patterns without documenting
- ❌ Bypass security checks
- ❌ Use Stripe (we use Finqle!)

## 🔗 Quick Links

### Documentation
- [CLAUDE.md](../CLAUDE.md) - Main project context
- [PRPs Index](.claude/prps/00-index.md) - Pattern library
- [Context Status](.claude/CONTEXT_STATUS.md) - Setup status

### Validation Commands
```bash
npm run validate:gps       # GPS features
npm run validate:payments  # Payment logic
npm run validate:rbac      # Access control
npm run validate:all       # Everything
```

### Agent Commands
```
@claude Use the gps-specialist agent
@claude Use the payment-expert agent
@claude Use the database-expert agent
@claude Use the security-auditor agent
@claude Use the testing-agent agent
```

## 📅 Maintenance Schedule

### Daily
- Run validation scripts
- Check for failing tests

### Weekly
- Review and update PRPs
- Check agent effectiveness

### Monthly
- Full context audit
- Update deprecated patterns
- Performance review

---

**Remember**: The context engineering setup is here to help you develop faster and with higher quality. Use it actively!