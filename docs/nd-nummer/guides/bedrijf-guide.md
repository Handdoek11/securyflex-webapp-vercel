# ND-nummer Gids voor Beveiligingsbedrijven

## Overzicht voor Beveiligingsbedrijven

Als beveiligingsbedrijf heeft u een dubbele verantwoordelijkheid: zowel uw eigen compliance als die van uw teamleden beheren. SecuryFlex biedt uitgebreide tools voor bedrijfsbrede ND-nummer compliance.

## 🏢 Bedrijf ND-nummer Compliance

### Uw Eigen ND-nummer

Als beveiligingsbedrijf heeft u mogelijk ook een eigen ND-nummer nodig voor:

- **Directe opdrachten**: Wanneer u zelf beveiligers levert
- **Subcontracting**: Voor doorplaatsing van werk
- **Toezicht**: Bij supervisie van beveiligingsactiviteiten

### Registratie Proces

1. **Dashboard** → **Compliance** → **ND-nummer Beheren**
2. Voer bedrijfs ND-nummer in (formaat: ND + 6-8 cijfers)
3. Upload bedrijfscertificaat en relevante documenten
4. Automatische verificatie binnen 24 uur

## 👥 Team Management

### Team Overzicht Dashboard

Access via **Dashboard** → **Team** → **ND-nummer Overzicht**

```
┌─────────────────────────────────────────────┐
│ Team ND-nummer Status Overzicht             │
├─────────────────────────────────────────────┤
│ 🟢 Actief: 45 teamleden                    │
│ 🟡 Verloopt Binnenkort: 3 teamleden        │
│ 🔴 Verlopen: 1 teamlid                     │
│ ⚪ Niet Geregistreerd: 2 teamleden         │
└─────────────────────────────────────────────┘
```

### Individuele Status Monitoring

Voor elk teamlid ziet u:

- **Naam en ND-nummer**
- **Status indicator** (🟢🟡🔴⚪)
- **Vervaldatum**
- **Dagen tot vervaldatum**
- **Laatste verificatie**
- **Acties** (Herindering versturen, Details bekijken)

## 📋 Compliance Verantwoordelijkheden

### Wettelijke Verplichtingen

Als beveiligingsbedrijf bent u verantwoordelijk voor:

- ✅ **Verificatie**: Alle teamleden hebben geldig ND-nummer
- ✅ **Monitoring**: Actieve controle op vervaldatums
- ✅ **Documentatie**: Bijhouden van compliance records
- ✅ **Rapportage**: Regelmatige status updates
- ✅ **Training**: Teamleden informeren over vereisten

### Automatische Compliance Checks

SecuryFlex helpt met:

- **Dagelijkse scans** van alle teamleden
- **Automatische waarschuwingen** voor managers
- **Compliance rapporten** per week/maand
- **Risk assessment** van het hele team

## 🎯 Opdracht Toewijzing

### ND-nummer Verificatie bij Toewijzing

Wanneer u opdrachten toewijst aan teamleden:

```typescript
// Automatische check vóór toewijzing
✅ Teamlid heeft geldig ND-nummer
✅ ND-nummer niet verlopen
✅ Status is ACTIEF
✅ Geen openstaande compliance issues
```

### Blokkering van Non-Compliant Assignments

- **Waarschuwing** bij toewijzing aan teamlid zonder geldig ND-nummer
- **Blokkering** van kritieke beveiligingsopdrachten
- **Alternatieve suggesties** van beschikbare, compliance teamleden

## 🔔 Notification Management

### Manager Notificaties

U ontvangt waarschuwingen voor:

- **Team expiry warnings**: 90, 60, 30, 7 dagen
- **Nieuwe non-compliance**: Teamlid status veranderd
- **Urgente acties**: Kritieke vervaldatums
- **Compliance reports**: Wekelijkse team status

### Notification Settings

Configureer via **Instellingen** → **Notificaties**:

```
📧 Email Notificaties
├── Team expiry warnings: ✅ Enabled
├── Daily compliance digest: ✅ Enabled
├── Critical alerts: ✅ Enabled
└── Weekly reports: ✅ Enabled

📱 SMS Notificaties
├── Critical alerts only: ✅ Enabled
└── Emergency non-compliance: ✅ Enabled
```

## 📊 Rapportage & Analytics

### Team Compliance Dashboard

Toegang via **Dashboard** → **Analytics** → **ND-nummer Compliance**

#### Overzichtsmetrieken

- **Compliance Percentage**: % teamleden met geldig ND-nummer
- **Risk Score**: Berekend op basis van vervaldatums
- **Trend Analysis**: Maandelijkse compliance ontwikkeling
- **Predicted Issues**: Voorspelling van toekomstige problemen

#### Detailrapporten

```
Weekly ND-nummer Compliance Report
═══════════════════════════════════

Team Grootte: 52 beveiligers
Compliance Rate: 96.2% (50/52)

Status Breakdown:
🟢 Actief: 47 (90.4%)
🟡 Verloopt Binnenkort: 3 (5.8%)
🔴 Verlopen: 1 (1.9%)
⚪ Niet Geregistreerd: 1 (1.9%)

Acties Vereist:
- Jan Jansen: ND-nummer vernieuwing voor 15-03-2024
- Peter de Vries: Eerste registratie vereist
- Lisa van der Berg: Document upload ontbreekt
```

## 🚨 Crisis Management

### Non-Compliance Incident Response

Wanneer een teamlid non-compliant wordt:

1. **Onmiddellijke notificatie** naar management
2. **Automatische blokkering** van nieuwe opdracht toewijzingen
3. **Alternatieve planning** suggesties
4. **Escalatie protocol** voor kritieke opdrachten

### Emergency Procedures

Voor spoedeisende situaties:

```
🚨 Emergency ND-nummer Protocol

1. Identificeer vervangend teamlid met geldig ND-nummer
2. Contact client voor opdracht wijziging
3. Expedite ND-nummer vernieuwing (24-uur service)
4. Document incident in audit log
5. Prevent future occurrences met early warning
```

## 💼 Client Communication

### Client Assurance

SecuryFlex helpt u clients te verzekeren van compliance:

- **Compliance certificaten** per opdracht
- **Real-time status updates** tijdens opdracht
- **Audit trails** voor alle toegewezen beveiligers
- **Compliance garanties** met backup procedures

### Transparency Reports

Automatische client rapportage:

```
Client: [Bedrijfsnaam]
Opdracht: [Opdracht ID]
Periode: [Start - Eind datum]

Toegewezen Beveiligers:
✅ Jan Jansen (ND1234567) - Geldig tot 31-12-2024
✅ Peter de Vries (ND2345678) - Geldig tot 15-06-2024
✅ Lisa van der Berg (ND3456789) - Geldig tot 20-09-2024

Compliance Rate: 100%
```

## ⚙️ Admin Configuratie

### Team Permissions

Stel rollen in voor ND-nummer beheer:

```
Admin Roles:
├── Full Admin: Alle ND-nummer functies
├── HR Manager: Team compliance monitoring
├── Operations: Opdracht toewijzing & compliance check
└── Teamleader: Read-only status voor eigen team
```

### Automated Workflows

Configureer automatische processen:

- **Auto-reminder emails** 30 dagen voor vervaldatum
- **Escalation procedures** voor overdue renewals
- **Integration met HR systemen** voor nieuwe teamleden
- **Backup assignment** algoritmes voor non-compliance

## 📈 Best Practices

### Proactief Compliance Management

1. **Monthly Reviews**: Maandelijkse team compliance check
2. **Early Renewals**: Start 60 dagen voor vervaldatum
3. **Training Programs**: Regelmatige ND-nummer awareness
4. **Documentation**: Houd alle certificaten up-to-date
5. **Backup Planning**: Altijd extra compliant beveiligers beschikbaar

### Cost Optimization

- **Bulk renewals**: Groepsgewijs verlengen voor kortingen
- **Training efficiency**: Gecombineerde ND-nummer trainingen
- **Documentation systems**: Digitaal archief voor snelle toegang
- **Preventive monitoring**: Vermijd last-minute rush fees

## 📞 Support & Escalatie

### Internal Support

- **HR Department**: Voor nieuwe teamleden
- **Operations Team**: Voor opdracht gerelateerde vragen
- **Admin Support**: Voor systeem configuratie

### External Support

- **SecuryFlex Support**: 020-1234567 (technical issues)
- **Justis Helpdesk**: 0900-1234567 (ND-nummer vragen)
- **WPBR Compliance**: Juridische compliance vragen

## ⚠️ Compliance Risico's

### Veelvoorkomende Problemen

1. **Expired ND-nummers**: Automatische detection & preventie
2. **Missing documentation**: Upload reminders & templates
3. **Team turnover**: Snelle onboarding procedures
4. **Client audits**: Ready-to-go compliance reports
5. **Legal changes**: Automatische updates van vereisten

### Risico Mitigatie

- **Real-time monitoring**: 24/7 compliance tracking
- **Redundancy planning**: Multiple certified beveiligers per rol
- **Documentation backup**: Cloud-based secure storage
- **Legal updates**: Automatische notificatie van wijzigingen

---

*Voor actuele WPBR informatie en compliance vereisten, raadpleeg altijd de officiële Justis website en wetgeving.*