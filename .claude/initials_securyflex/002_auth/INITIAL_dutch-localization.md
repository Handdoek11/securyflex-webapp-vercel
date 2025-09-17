# INITIAL: Dutch Localization & i18n System

## FEATURE:
Implement comprehensive Dutch-first localization system for SecuryFlex using next-intl, ensuring 100% Dutch UI translation coverage with security industry terminology, WPBR compliance messaging, and proper cultural adaptation for the Netherlands security market. The system must support Dutch as primary language with English as secondary, include legal compliance translations, and maintain SEO optimization for Dutch keywords.

**Specific Requirements:**
- Dutch-first UI with complete translation coverage (100% target)
- Security industry terminology (WPBR, VCA, EHBO, beveiliging, ZZP)
- Legal compliance translations (AVG/GDPR, terms of service, privacy policy)
- SEO optimization for Dutch keywords ("beveiligingspersoneel", "ZZP beveiligers")
- Currency formatting (EUR), date/time localization (DD-MM-YYYY)
- Cultural adaptation for Dutch business practices and communication styles

## EXAMPLES:
Reference these existing patterns and implementations:

**Current Localization Structure:**
- `src/locales/nl.json` and `en.json`: Existing translation file structure
- `src/app/[locale]/layout.tsx`: next-intl integration patterns
- Multi-language routing with locale parameter handling

**Translation Patterns:**
- `CLAUDE.md` Dutch-first approach examples and terminology
- Security industry specific translations for WPBR compliance
- Business terminology for different user types (ZZP, bedrijven, klanten)

**Cultural Context:**
- Dutch business communication styles (direct, professional)
- Netherlands-specific security regulations and certifications
- Local payment preferences and business practices

**SEO Integration:**
- Dutch keyword optimization for security industry
- Meta descriptions and titles in Dutch
- Local business schema markup in Dutch

## DOCUMENTATION:
**Localization Requirements:**
- `CLAUDE.md` Dutch-first development priorities and terminology standards
- Netherlands security industry terminology reference
- WPBR compliance language requirements

**Technical Implementation:**
- next-intl documentation for React/Next.js integration
- Dutch locale configuration (nl-NL) with proper formatting
- Translation file organization and maintenance patterns

**Content Guidelines:**
- Professional, trustworthy tone appropriate for security industry
- Clear, direct communication style typical of Dutch business culture
- Technical accuracy for security and legal terminology

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Translation Coverage**: 100% Dutch UI translation with security industry terminology
2. **Legal Compliance**: AVG/GDPR, WPBR terms, privacy policy in proper Dutch legal language
3. **Cultural Adaptation**: Dutch business communication styles, date/time formats, currency display
4. **SEO Optimization**: Dutch keywords, meta tags, local business markup

**Common Pitfalls to Avoid:**
- Don't use machine translation for legal/compliance text - requires professional translation
- Don't skip cultural adaptation - direct translation isn't enough
- Don't forget number/date formatting differences (DD-MM-YYYY, EUR currency)
- Don't overlook regional differences in security terminology
- Don't skip SEO optimization for Dutch keywords

**Security Industry Terminology:**
- WPBR (Wet Particuliere Beveiligingsorganisaties en Recherchebureaus)
- VCA (Veiligheid, Gezondheid en Milieu Checklist Aannemers)
- EHBO (Eerste Hulp Bij Ongelukken)
- ZZP (Zelfstandige Zonder Personeel)
- Beveiligingsbeambte, bewaking, surveillance

**Legal Translation Requirements:**
- Privacy policy (Privacybeleid) with AVG compliance
- Terms of service (Algemene Voorwaarden) for each user type
- WPBR compliance disclaimers and certifications
- Data processing transparency (Gegevensverwerkingsovereenkomst)

**Translation Organization:**
- Feature-based translation keys (auth.*, dashboard.*, gps.*)
- Role-specific translations (zzp.*, company.*, client.*)
- Common terminology shared across features
- Error messages and validation feedback

**Performance Considerations:**
- Translation bundle optimization and code splitting
- Dynamic import for large translation files
- Caching strategy for translation data
- Fallback handling for missing translations

**Quality Assurance:**
- Professional translation review for legal content
- Native speaker validation for cultural appropriateness
- Terminology consistency across all features
- Regular translation updates and maintenance

**Recommended Agent:** @dutch-localizer for terminology validation, @security-auditor for compliance language