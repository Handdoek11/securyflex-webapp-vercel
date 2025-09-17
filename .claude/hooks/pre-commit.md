# Pre-Commit Hook for SecuryFlex

This hook runs automatically before each commit to ensure code quality and security.

## Actions

1. **Type Checking**
   ```bash
   npm run check-types
   ```

2. **Linting**
   ```bash
   npm run lint
   ```

3. **Security Checks**
   - No hardcoded API keys
   - No exposed credentials
   - No console.log statements in production code

4. **Translation Completeness**
   - Check that both `nl.json` and `en.json` have matching keys
   - Verify no MISSING_MESSAGE errors

5. **Database Schema Validation**
   - Ensure migrations are generated for schema changes
   - Check that Schema.ts matches migration files

## Validation Script
```bash
# Run all pre-commit checks
npm run check-types && npm run lint && npm run validate:security
```

## IMPORTANT
- If any check fails, the commit will be blocked
- Fix all issues before attempting to commit again
- Use `--no-verify` only in emergencies (not recommended)

## SecuryFlex Specific Checks
- GPS coordinates must have 8 decimal precision
- Payment amounts must be in cents (integer)
- User roles must match enum values
- Shift status transitions must be valid