# INITIAL: SecuryFlex Marketing Landing Page

## FEATURE:
Transform the generic SaaS landing page into a professional, conversion-optimized SecuryFlex marketing website that attracts security companies, freelance security professionals (ZZP), and clients needing security services. The landing page must clearly communicate the 24-hour payment guarantee, GPS-verified shift tracking, and Dutch security industry compliance (WPBR) while driving user registrations across all three user types.

**Specific Requirements:**
- Multi-audience targeting with sections for ZZP, Companies, and Clients
- Hero section highlighting 24-hour payment guarantee and GPS verification
- Mobile-first responsive design optimized for conversion (375px baseline)
- Dutch-first content with SEO optimization for "beveiligingspersoneel", "ZZP beveiligers"
- Clear call-to-action buttons driving to authentication flow
- Social proof with testimonials and WPBR compliance badges

## EXAMPLES:
Reference these existing patterns and implementations:

**Current Landing Page Structure:**
- `src/app/[locale]/(unauth)/page.tsx`: Existing SaaS template structure to transform
- `wireframes/001_landingspage/Landingspage.md`: Complete wireframe specifications (desktop + mobile)

**Branding and Design Patterns:**
- `CLAUDE.md` Design System: VERPLICHT color palette
  - Primary: #1e3a8a (slate-900), Secondary: #3b82f6 (blue-500), Success: #10b981
- `src/components/ui/`: shadcn/ui components for consistent design

**User Type Integration:**
- `src/models/Schema.ts` lines 27-28: User roles enum (company, client, zzp)
- `wireframes/Authentication/Auth.md` Section 1.2: User type selection cards pattern
- `INITIAL.md` lines 4-8: Existing target keywords and messaging

**Localization Patterns:**
- `src/locales/nl.json` and `en.json`: Dutch-primary translation structure
- next-intl implementation for multi-language content

## DOCUMENTATION:
**Primary Implementation Reference:**
- `wireframes/001_landingspage/Landingspage.md`: Complete SEO-optimized wireframe (desktop + mobile)
- `CLAUDE.md` Performance Targets: Page load <3s, mobile-first design requirements

**Marketing Strategy:**
- Target audiences: Security companies, ZZP professionals, businesses needing security
- Unique value propositions: 24-hour payment guarantee, GPS verification, WPBR compliance
- SEO focus: "beveiligingspersoneel", "ZZP beveiligers", "beveiliging inhuren"

**Technical Requirements:**
- Next.js 15 with App Router, shadcn/ui components, next-intl localization
- Performance: <3 seconds load time, Core Web Vitals optimization
- Integration with existing authentication flow

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Multi-Audience Messaging**: Distinct value propositions for ZZP (quick payments, flexible work), Companies (team management, compliance), and Clients (verified security, real-time tracking)
2. **Trust Building**: WPBR compliance badges, security certifications, testimonials from Dutch security professionals
3. **Conversion Optimization**: Clear registration CTAs for each user type, benefit-focused messaging, minimal friction
4. **Mobile Performance**: Landing page must load <3 seconds on mobile, touch-friendly registration buttons (44px minimum)

**Common Pitfalls to Avoid:**
- Don't use generic SaaS messaging - must be security industry specific
- Don't overlook Dutch compliance messaging (WPBR) - critical for credibility
- Don't create unclear user type differentiation - each audience needs clear path
- Don't forget mobile optimization - many ZZP users browse on mobile
- Don't skip social proof - security industry requires high trust

**Security Industry Focus:**
- Emphasize WPBR compliance and proper licensing
- Highlight VCA and EHBO certification tracking
- Address common security industry pain points (payment delays, scheduling conflicts)
- Use appropriate Dutch security terminology throughout

**Integration with Auth Flow:**
- "START ALS ZZP BEVEILIGER" → `/register/select-type?source=landing_hero_zzp`
- "REGISTREER BEDRIJF" → `/register/select-type?source=landing_cta_company`
- "VRAAG OFFERTE AAN" → `/register/select-type?source=landing_footer_client`

**Performance Targets:**
- Landing page load time <3 seconds on 3G networks
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- Mobile responsiveness across all device sizes
- Conversion rate >5% from landing to registration

**Recommended Agent:** @mobile-optimizer for mobile-first implementation, @dutch-localizer for content optimization