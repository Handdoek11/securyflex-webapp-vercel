# 002 Auth - Core Infrastructure & Foundation

Deze map bevat Context Engineering INITIAL bestanden voor de kern infrastructuur van SecuryFlex, inclusief authenticatie, database, design system, en deployment.

## Bestanden:

### INITIAL_auth-system.md
Complete authenticatie systeem met 4-stap registratie, role-based routing, en multi-tenant organisatie ondersteuning. Inclusief Google OAuth en biometric authentication voor mobile PWA.

### INITIAL_core-infrastructure.md
Kern platforminfrastructuur met Supabase database, Drizzle ORM, real-time subscriptions, API foundation, en multi-tenant organisatie ondersteuning.

### INITIAL_design-system.md
SecuryFlex design system implementatie met VERPLICHT kleurenpalet, shadcn/ui component extensies, mobile-first responsive patterns, en accessibility compliance.

### INITIAL_dutch-localization.md
Complete Nederlandse lokalisatie systeem met next-intl, security industry terminologie (WPBR, VCA, EHBO), en culturele adaptatie voor de Nederlandse markt.

### INITIAL_production-deployment.md
Production deployment infrastructuur met CI/CD pipelines, monitoring systemen, security hardening, en DevOps setup voor 99.9% uptime.

## Doel:
Deze map bevat de fundamentele bouwstenen waarop alle gebruiker-specifieke applicaties (ZZP, Company, Client) worden gebouwd. Het zorgt voor consistente data handling, beveiliging, en prestaties.

## Technische Focus:
- Next.js 15 App Router met Clerk authenticatie
- Supabase database met PostGIS voor GPS functionaliteit
- Real-time infrastructuur voor live updates
- Multi-tenant architectuur met data isolatie
- Nederlandse compliance (AVG/GDPR, WPBR)

## Context Engineering Compliance:
- ✅ Alle bestanden 60-100 regels geoptimaliseerd
- ✅ 4-sectie structuur (FEATURE, EXAMPLES, DOCUMENTATION, OTHER CONSIDERATIONS)
- ✅ Concrete code referenties met regelnummers
- ✅ Performance targets gespecificeerd
- ✅ Agent assignment aanbevelingen

## Integration Dependencies:
Deze infrastructuur moet eerst worden geïmplementeerd voordat ZZP, Company, of Client applicaties kunnen worden gebouwd.