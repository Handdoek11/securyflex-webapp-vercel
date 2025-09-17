# 005 Beveiligingsbedrijven - Marketplace Platform voor Security Companies

Deze map bevat Context Engineering INITIAL bestanden voor beveiligingsbedrijven die opereren in de marketplace. Zij zoeken opdrachten van bedrijven/klanten EN werven ZZP beveiligers voor hun team.

## Bestanden:

### INITIAL_marketplace-dashboard.md (NIEUW - verplaatst van 004_bedrijven)
Complete marketplace platform voor beveiligingsbedrijven met opdracht bidding, team werving, monitoring, en analytics.

### INITIAL_incident-management.md
Uitgebreid incident management systeem voor beveiligingsprofessionals met real-time rapportage, foto/video bewijs, automatische stakeholder notificaties, escalatie procedures, en compliance met WPBR regelgeving.

### INITIAL_notification-system.md
Multi-channel communicatie systeem met push notifications, SMS, email, en in-app messaging voor alle gebruikerstypes, inclusief emergency escalatie procedures en 99.9% delivery reliability.

## Doelgroep:
Beveiligingsbedrijven die in de marketplace opereren:
- **Opdrachten zoeken**: Browse beschikbare opdrachten van bedrijven/klanten
- **Bieden op jobs**: Concurreer met andere beveiligingsbedrijven
- **Team werven**: Zoek en recruit ZZP beveiligers
- **Diensten monitoren**: Real-time GPS tracking van actieve shifts
- **Business groei**: Analytics, financiën, en schaalvergroting

## Technische Focus:
- Real-time incident creation met GPS verificatie
- Secure foto/video upload met compressie
- Multi-channel delivery (push, SMS, email, in-app)
- Emergency escalation binnen 30 seconden
- WPBR compliance audit trails
- Evidence chain of custody tracking

## Critical Performance Requirements:
- Incident creation: <5 seconden inclusief evidence upload
- Notification delivery: <100ms real-time, 99.9% reliability
- Emergency escalation: <30 seconden tot alle stakeholders
- Photo upload: <10 seconden met compressie
- Export generation: <60 seconden voor legal documents

## Security & Compliance:
- WPBR incident rapportage standaarden
- AVG/GDPR data protection compliance
- Evidence preservation voor juridische procedures
- Tamper-proof storage met checksums
- Automatic virus scanning op uploads

## Context Engineering Compliance:
- ✅ Alle bestanden 60-100 regels geoptimaliseerd
- ✅ Security industry focus (WPBR, VCA, EHBO)
- ✅ Emergency procedures en escalation workflows
- ✅ Performance en reliability requirements
- ✅ Agent assignments (@security-auditor, @emergency-response)

## Dependencies:
- 002_auth infrastructuur voor user authentication
- 003_zzp'ers GPS systeem voor incident locatie
- Multi-tenant architectuur voor organisatie context
- Real-time communication infrastructuur