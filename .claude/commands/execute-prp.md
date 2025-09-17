# Execute PRP for SecuryFlex

Execute a Product Requirements Prompt (PRP) to implement a SecuryFlex feature following the defined blueprint.

## Process

1. **Pre-flight Check**
   - Verify all dependencies are installed
   - Check database connection
   - Ensure Clerk authentication is configured
   - Validate Finqle API keys (if needed)

2. **Implementation Phases**
   - Create/update database schemas
   - Implement backend services and API routes
   - Build frontend components
   - Add localization strings
   - Configure role-based permissions

3. **Quality Assurance**
   - Run type checking
   - Execute unit tests
   - Perform integration tests
   - Validate GPS accuracy (if applicable)
   - Test payment flows (if applicable)

4. **Deployment Preparation**
   - Generate database migrations
   - Update documentation
   - Add monitoring hooks
   - Configure error tracking

## Usage

```
/execute-prp [prp_file_path]
```

## Example

```
/execute-prp PRPs/gps_checkin_prp.md
```

## Execution Strategy

### 1. Database Layer
```typescript
// Check for required tables and columns
// Generate migrations if needed
npm run db:generate
npm run db:migrate
```

### 2. Backend Implementation
- API routes in `app/api/`
- Server actions for mutations
- Validation with Zod schemas
- Integration with external services

### 3. Frontend Components
- Use shadcn/ui components
- Implement responsive design
- Add loading and error states
- Include role-based UI variations

### 4. Localization
- Add Dutch translations to `nl.json`
- Update English translations in `en.json`
- Use proper date/time formatting for locale

### 5. Testing
```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run type-check    # TypeScript validation
```

## SecuryFlex Implementation Guidelines

### Code Organization
```
frontend-app/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── [locale]/
│   │   │   ├── (auth)/    # Protected routes
│   │   │   └── (unauth)/  # Public routes
│   ├── components/        # Reusable components
│   ├── features/          # Feature-specific components
│   │   ├── security/      # Security professional features
│   │   ├── shifts/        # Shift management
│   │   ├── gps/          # GPS tracking
│   │   └── payments/      # Finqle integration
│   ├── hooks/            # Custom React hooks
│   ├── libs/             # External library configs
│   ├── models/           # Database schemas
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
```

### Security Patterns
```typescript
// Always validate in Server Actions
export async function createShift(data: FormData) {
  const validated = shiftSchema.parse(data);

  // Check permissions
  const { userId, orgId } = auth();
  if (!hasPermission(userId, 'shift.create')) {
    throw new Error('Unauthorized');
  }

  // Execute with proper error handling
  try {
    const shift = await db.insert(shiftsSchema).values(validated);
    revalidatePath('/shifts');
    return { success: true, shift };
  } catch (error) {
    logger.error('Shift creation failed', error);
    return { success: false, error: 'Failed to create shift' };
  }
}
```

### GPS Implementation Pattern
```typescript
// GPS check-in with verification
export async function checkIn(position: GPSPosition, shiftId: number) {
  // Verify position accuracy
  if (position.accuracy > 50) {
    return { error: 'GPS accuracy too low' };
  }

  // Check geofence
  const location = await getShiftLocation(shiftId);
  const distance = calculateDistance(position, location);

  if (distance > location.radiusMeters) {
    // Send alert but allow check-in
    await createGeofenceAlert(shiftId, position);
  }

  // Record check-in
  return await recordCheckIn(shiftId, position);
}
```

### Finqle Payment Pattern
```typescript
// Automatic payment after shift completion
export async function processShiftPayment(shiftId: number) {
  const shift = await getShiftWithRelations(shiftId);

  // Calculate payment
  const hours = calculateHours(shift.start, shift.end);
  const amount = hours * shift.hourlyRate;

  // Create Finqle transaction
  const transaction = await finqle.createTransaction({
    merchantId: shift.professional.finqleMerchantId,
    amount,
    reference: `SHIFT-${shiftId}`,
    description: `Security shift ${formatDate(shift.date)}`
  });

  // Record transaction
  await recordPayment(shiftId, transaction);

  return transaction;
}
```

## Error Handling

Always implement comprehensive error handling:

```typescript
try {
  // Implementation
} catch (error) {
  // Log to monitoring
  logger.error('Feature execution failed', {
    feature: $ARGUMENTS,
    error,
    userId: auth().userId,
    timestamp: new Date()
  });

  // User-friendly error
  throw new Error('Er is een fout opgetreden. Probeer het later opnieuw.');
}
```

## Success Criteria

The PRP execution is considered successful when:
1. All database migrations applied successfully
2. Type checking passes without errors
3. All tests pass
4. Localization is complete for Dutch and English
5. Role-based permissions are properly configured
6. GPS features have accuracy validation
7. Payment integrations are tested (if applicable)
8. Documentation is updated

## Post-Execution

After successful execution:
1. Update CHANGELOG.md
2. Document any new environment variables
3. Add feature to user documentation
4. Configure monitoring alerts
5. Schedule security review if needed