# INITIAL: Code Standards & Development Guidelines

## FEATURE:
Establish comprehensive code standards and development guidelines for SecuryFlex including ESLint/Prettier configuration, TypeScript strict mode, naming conventions, Git workflow, code review process, and documentation standards. The standards must enforce consistency across the three-user-type architecture, maintain high code quality, and support efficient collaboration among developers.

**Specific Requirements:**
- ESLint configuration with Next.js, TypeScript, and React best practices
- Prettier formatting with consistent style across the codebase
- TypeScript strict mode with no-any rule enforcement
- Naming conventions for files, components, functions, and variables
- Git workflow with conventional commits and branch strategies
- Code review checklist and PR templates
- JSDoc/TSDoc documentation standards

## EXAMPLES:
Reference these existing patterns and implementations:

**ESLint Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/display-name': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
};
```

**Prettier Configuration:**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**TypeScript Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  }
}
```

## DOCUMENTATION:
**Naming Conventions:**
```typescript
// Files and Folders
components/GPSCheckIn.tsx         // PascalCase for components
hooks/useRealtimeGPS.ts          // camelCase with 'use' prefix
lib/gps/location-service.ts      // kebab-case for utilities
types/User.ts                    // PascalCase for type files

// Variables and Functions
const userId: string;            // camelCase for variables
const MAX_RETRY_COUNT = 3;       // UPPER_SNAKE_CASE for constants
function calculateDistance() {}   // camelCase for functions
interface UserProfile {}         // PascalCase for interfaces/types

// React Components
export const GPSCheckInButton: React.FC<Props> = () => {}

// Database/API
shift_assignments               // snake_case for database
/api/gps-checkin               // kebab-case for API routes
```

**Git Workflow:**
```bash
# Branch naming
feature/gps-checkin-improvement
bugfix/payment-calculation-error
hotfix/security-vulnerability
release/v1.2.0

# Conventional commits
feat: add GPS check-in photo validation
fix: resolve payment webhook timeout issue
docs: update API documentation
style: format code with prettier
refactor: extract GPS logic to custom hook
test: add unit tests for payment service
chore: update dependencies
```

**Code Documentation:**
```typescript
/**
 * Validates GPS location against shift requirements
 * @param location - Current GPS coordinates
 * @param shiftLocation - Required shift location
 * @param radiusMeters - Acceptable radius (default 50m)
 * @returns Validation result with distance and accuracy
 * @throws {GPSError} When location services unavailable
 * @example
 * const result = await validateGPSLocation(
 *   { lat: 52.3676, lng: 4.9041 },
 *   shiftLocation,
 *   50
 * );
 */
export async function validateGPSLocation(
  location: GPSCoordinates,
  shiftLocation: Location,
  radiusMeters = 50
): Promise<ValidationResult> {
  // Implementation
}
```

## OTHER CONSIDERATIONS:

**Code Review Checklist:**
1. **Functionality**: Does it meet requirements? Are edge cases handled?
2. **Security**: No exposed secrets, SQL injection protection, XSS prevention
3. **Performance**: No N+1 queries, optimized images, lazy loading
4. **Testing**: Unit tests added, E2E scenarios covered, 80% coverage
5. **Documentation**: JSDoc comments, README updates, API docs
6. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
7. **Dutch Localization**: All user-facing text has translations

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.logs left
- [ ] Dutch translations added
```

**Import Organization:**
```typescript
// Order of imports
// 1. React/Next.js
import React from 'react';
import { useRouter } from 'next/router';

// 2. Third-party libraries
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// 3. Internal absolute imports
import { Button } from '@/components/ui/button';
import { validateGPSLocation } from '@/lib/gps';

// 4. Relative imports
import { GPSCheckInForm } from './GPSCheckInForm';

// 5. Types
import type { User, Shift } from '@/types';

// 6. Styles
import styles from './styles.module.css';
```

**Common Pitfalls to Avoid:**
- Don't use 'any' type - define proper interfaces
- Don't commit commented code - use version control
- Don't skip error boundaries in components
- Don't forget loading and error states
- Don't ignore ESLint warnings

**Component Structure:**
```typescript
// Consistent component organization
export const ComponentName: React.FC<Props> = ({
  prop1,
  prop2,
}) => {
  // 1. Hooks
  const router = useRouter();
  const { user } = useUser();

  // 2. State
  const [loading, setLoading] = useState(false);

  // 3. Derived state
  const isValid = useMemo(() => {}, []);

  // 4. Effects
  useEffect(() => {}, []);

  // 5. Handlers
  const handleSubmit = useCallback(() => {}, []);

  // 6. Early returns
  if (loading) return <Spinner />;
  if (!user) return <Redirect />;

  // 7. Main render
  return <div>{/* JSX */}</div>;
};
```

**Performance Guidelines:**
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Lazy load routes and heavy components
- Optimize images with next/image
- Use Web Workers for heavy calculations

**Security Standards:**
- Never expose API keys in client code
- Validate all user inputs
- Use parameterized queries
- Implement rate limiting
- Sanitize file uploads
- Use HTTPS everywhere

**Recommended Agent:** @code-reviewer for standards enforcement, @typescript-expert for type safety