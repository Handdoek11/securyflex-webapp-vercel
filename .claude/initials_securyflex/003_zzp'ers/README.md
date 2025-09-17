# 003 ZZP'ers - Freelance Security Professional Mobile App

Deze map bevat Context Engineering INITIAL bestanden voor de ZZP (Zelfstandige Zonder Personeel) mobile applicatie, geoptimaliseerd voor beveiligingsprofessionals.

## Bestanden:

### INITIAL_zzp-complete-app.md
Complete mobile-first Progressive Web Application voor ZZP beveiligers met 5 functiepagina's: Dashboard, Jobs, Schedule, Chat, en Profile. Inclusief GPS check-in, real-time job matching, en 24-uurs betaalgarantie.

### INITIAL_gps-tracking-system.md
Uitgebreid GPS tracking en locatie verificatie systeem met offline capability, foto bewijs voor check-ins, PostGIS spatial queries, en geofencing alerts voor veiligheidscontrole.

### INITIAL_mobile-pwa-optimization.md
Progressive Web App optimalisatie met service worker implementatie, offline GPS check-ins, push notifications, app install prompts, en performance optimalisatie voor 3G netwerken.

## Doelgroep:
Zelfstandige beveiligingsprofessionals die mobiele toegang nodig hebben tot:
- Beschikbare beveiligingsopdrachten
- GPS-geverifieerde check-in/check-out
- Real-time communicatie met bedrijven en klanten
- 24-uurs betaling tracking via Finqle
- Certificaat management (WPBR, VCA, EHBO)

## Technische Focus:
- Mobile-first design (375px iPhone SE baseline)
- PWA met offline functionaliteit
- GPS accuracy binnen 50-100m radius
- Photo compression naar 1920x1080
- Battery optimization voor GPS tracking
- Nederlandse UI met security terminologie

## Performance Targets:
- GPS check-in completion: <2 seconden
- Page transitions: <500ms
- Photo upload: <5 seconden
- Offline GPS capability: 100%
- Mobile user retention: >70% monthly

## Context Engineering Compliance:
- ✅ Alle bestanden 60-100 regels geoptimaliseerd
- ✅ Mobile-first development priorities
- ✅ Concrete wireframe referenties (Section 2)
- ✅ Performance requirements gespecificeerd
- ✅ Agent assignments (@mobile-optimizer, @gps-engineer)

## Dependencies:
- 002_auth infrastructuur moet eerst geïmplementeerd
- Integration met Company dashboard voor job applications
- Integration met Client portal voor service delivery