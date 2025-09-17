# Post-Code-Change Hook for SecuryFlex

Automatically runs after code modifications to maintain consistency and catch issues early.

## Trigger Conditions
- Any change to `.ts`, `.tsx` files
- Modifications to `Schema.ts`
- Updates to translation files
- Changes to API routes

## Actions

### 1. Immediate Checks (< 1 second)
```bash
# Quick syntax check
npx tsc --noEmit --incremental

# Check imports
npx depcheck
```

### 2. Affected Tests (< 5 seconds)
```bash
# Run only tests for changed files
npm run test:related -- {changed_files}
```

### 3. GPS Validation (if GPS code changed)
```bash
# Validate GPS precision and radius logic
npm run validate:gps
```

### 4. Payment Validation (if payment code changed)
```bash
# Check Finqle integration and calculations
npm run validate:payments
```

### 5. Real-time Hot Reload
- Automatically restart dev server if needed
- Clear module cache for changed files
- Update Supabase types if schema changed

## Smart Detection

### GPS Changes Detected When:
- Files in `src/libs/PostGIS.ts` modified
- GPS check-in components updated
- Location-related schemas changed

### Payment Changes Detected When:
- Finqle integration files modified
- Transaction schemas updated
- Payment calculation logic changed

### Auth Changes Detected When:
- Clerk configuration modified
- Role-based access updated
- Protected routes changed

## Performance Optimization
- Skip unchanged modules
- Use incremental compilation
- Cache test results
- Parallel execution where possible

## Output Format
```
✅ Type check passed
✅ Related tests passed (3/3)
⚠️  Translation key missing: shift.gps.accuracy
✅ GPS validation passed
✅ Hot reload triggered
```