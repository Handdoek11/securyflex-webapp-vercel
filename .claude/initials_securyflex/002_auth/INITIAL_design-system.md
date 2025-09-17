# INITIAL: SecuryFlex Design System Implementation

## FEATURE:
Implement a comprehensive, production-ready design system for SecuryFlex that enforces consistent visual identity, component patterns, and user experience across all user types (ZZP, Company, Client). The design system must be built on top of shadcn/ui components with SecuryFlex-specific customizations, VERPLICHT color palette enforcement, mobile-first responsive patterns, and accessibility compliance for the Dutch security industry.

**Specific Requirements:**
- Complete implementation of VERPLICHT color palette with CSS custom properties
- SecuryFlex-specific component library extending shadcn/ui base components
- Mobile-first responsive design system with 375px iPhone SE baseline
- Status badge system for shift lifecycle (draft, published, assigned, active, completed, cancelled)
- Touch-friendly interaction patterns with 44px minimum touch targets
- Accessibility compliance with 7:1 contrast ratio for critical information

## EXAMPLES:
Reference these existing patterns and implementations:

**Design System Foundation:**
- `CLAUDE.md` lines 129-147: VERPLICHT color palette with exact hex values
  - Primary: #1e3a8a (slate-900), Secondary: #3b82f6 (blue-500), Success: #10b981
- `CLAUDE.md` lines 149-176: Component patterns for Shift Cards, GPS buttons, Real-time indicators

**Existing UI Foundation:**
- `src/components/ui/`: shadcn/ui base components to extend and customize
- Current Button, Card, Badge implementations to standardize

**Mobile-First Design Rules:**
- `CLAUDE.md` lines 178-189: Mobile interface requirements with 375px baseline
- Touch targets 44px minimum, 16px body font size (prevents iOS zoom)
- Responsive breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px

**Dashboard Layout Patterns:**
- `CLAUDE.md` lines 191-219: Role-specific dashboard grid systems
- Company (desktop 3-column), Client (GPS prominent), ZZP (mobile-first bottom navigation)

## DOCUMENTATION:
**Design System Specifications:**
- `CLAUDE.md` Complete Design System & UI Guidelines section (lines 129-250)
- Component usage patterns and implementation requirements
- Wireframe integration requirements for consistent UI implementation

**Color System Documentation:**
- Hex color codes for all primary, secondary, and status colors with exact usage guidelines
- Accessibility compliance requirements with 7:1 contrast ratio specifications

**Component Library Standards:**
- shadcn/ui integration patterns and customization guidelines
- Mobile-first development priorities and responsive design requirements

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Color Palette Enforcement**: Implement CSS custom properties with exact hex values, never deviate from defined colors
2. **Component Consistency**: All components must extend shadcn/ui patterns, maintain consistent sizing and spacing
3. **Mobile-First Design**: 375px baseline, 44px touch targets, progressive enhancement to desktop
4. **Status Badge System**: Consistent color mapping for shift statuses with accessibility compliance

**Common Pitfalls to Avoid:**
- Don't create new colors outside defined palette - use exact hex values only
- Don't skip mobile-first development - start with 375px and enhance
- Don't create touch targets smaller than 44px
- Don't forget accessibility compliance for critical information
- Don't duplicate shadcn/ui components - extend existing patterns

**Security Industry Focus:**
- Professional, trustworthy visual language appropriate for security industry
- WPBR compliance badges and certification display patterns
- Dutch-first design language with security terminology integration

**Component Priority Order:**
1. Base UI components (Button, Card, Badge, Form elements)
2. Navigation components (Mobile bottom nav, Desktop sidebar)
3. Data display components (Status badges, User cards, Metric displays)
4. Interactive components (GPS buttons, Real-time indicators)

**Performance Requirements:**
- Component load time: <100ms
- CSS bundle size optimization
- Tree-shaking for unused components
- Critical CSS inlining for above-fold content

**Integration Requirements:**
- Must work across all user types (ZZP mobile, Company desktop, Client portal)
- Must integrate with existing authentication and routing systems
- Must support Dutch/English localization
- Must maintain consistency across wireframe implementations

**Recommended Agent:** @mobile-optimizer for responsive patterns, @dutch-localizer for terminology