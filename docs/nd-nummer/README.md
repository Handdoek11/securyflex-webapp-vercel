# ND-nummer Compliance System

## Overzicht

Het ND-nummer (Nederlandse Dienstnummer) is een verplichte vergunning voor beveiligingspersoneel in Nederland onder de WPBR (Wet Particuliere Beveiligingsorganisaties en Recherchebureaus). SecuryFlex implementeert een volledig compliance systeem voor ND-nummer verificatie en beheer.

## 🔧 Technische Documentatie

### Database Schema

Het ND-nummer systeem is geïntegreerd in de bestaande user profiles:

```prisma
model ZZPProfile {
  // ND-nummer velden
  ndNummer              String?
  ndNummerStatus        NDNummerStatus?
  ndNummerVervalDatum   DateTime?
  ndNummerLaatsteCheck  DateTime?
  ndNummerRisicoNiveau  String?
  ndNummerOpmerking     String?
}

model BedrijfProfile {
  // Dezelfde ND-nummer velden voor bedrijven
  ndNummer              String?
  ndNummerStatus        NDNummerStatus?
  ndNummerVervalDatum   DateTime?
  ndNummerLaatsteCheck  DateTime?
  ndNummerRisicoNiveau  String?
  ndNummerOpmerking     String?
}

model NDNummerAuditLog {
  id          String   @id @default(cuid())
  userId      String
  profileType NDProfileType
  action      NDNummerAction
  oldValue    String?
  newValue    String?
  timestamp   DateTime @default(now())
  ipAddress   String?
  userAgent   String?
  details     Json?
}
```

### API Endpoints

| Endpoint | Methode | Beschrijving |
|----------|---------|--------------|
| `/api/compliance/nd-nummer/register` | POST | Registreer nieuw ND-nummer |
| `/api/compliance/nd-nummer/register` | PUT | Update bestaand ND-nummer |
| `/api/compliance/nd-nummer/validate` | POST | Valideer ND-nummer bij Justis |
| `/api/compliance/nd-nummer/validate` | GET | Haal status op |
| `/api/compliance/nd-nummer/monitor` | GET | Platform monitoring |
| `/api/compliance/nd-nummer/notifications` | GET/POST | Notification beheer |

### Validatie Schema's

```typescript
// ND-nummer formaat validatie
const ndNummerRegex = /^ND\d{6,8}$/;

// Registratie schema
const ndNummerRegistrationSchema = z.object({
  ndNummer: z.string().regex(ndNummerRegex, "Ongeldig ND-nummer formaat"),
  vervalDatum: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Vervaldatum moet in de toekomst liggen"
  }),
  documenten: z.array(z.string()).min(1, "Minimaal één document vereist")
});
```

### Notification Systeem

Het systeem ondersteunt 8 verschillende notification types:

- `EXPIRY_90_DAYS` - 90 dagen voor vervaldatum
- `EXPIRY_60_DAYS` - 60 dagen voor vervaldatum
- `EXPIRY_30_DAYS` - 30 dagen voor vervaldatum
- `EXPIRY_WARNING` - 7 dagen voor vervaldatum
- `EXPIRED` - ND-nummer verlopen
- `VERIFICATION_REQUIRED` - Verificatie nodig
- `INVALID_STATUS` - Status ongeldig
- `REGISTRATION_REMINDER` - Registratie herinnering

### Compliance Workflow

1. **Registratie**: User uploadt ND-nummer + documenten
2. **Validatie**: Automatische verificatie bij Justis API
3. **Monitoring**: Dagelijkse check op vervaldatums
4. **Notificaties**: Geautomatiseerde waarschuwingen
5. **Blokkering**: Jobs verborgen voor non-compliant users

## 📚 User Guides

- [ZZP Beveiligers Guide](./guides/zzp-guide.md)
- [Beveiligingsbedrijven Guide](./guides/bedrijf-guide.md)
- [Administrator Guide](./guides/admin-guide.md)
- [API Reference](./api-reference.md)

## 🧪 Testing

Uitgebreide test coverage beschikbaar:

```bash
# Unit tests
pnpm test src/test/compliance/nd-nummer-compliance.test.ts

# Integration tests
pnpm test src/test/integration/nd-nummer-api.test.ts

# E2E tests
pnpm test:e2e src/test/e2e/nd-nummer-workflow.spec.ts
```

## 🔒 Security & Compliance

- **GDPR Compliant**: Alle persoonlijke data encrypted
- **Audit Trail**: Volledige logging van alle acties
- **Role-based Access**: Strikte permissie controle
- **Data Retention**: Automatische cleanup van oude logs
- **WPBR Compliant**: Voldoet aan Nederlandse beveiligingswetgeving

## 🚀 Deployment

### Environment Variables

```env
# Justis API (productie)
JUSTIS_API_URL=https://api.justis.nl
JUSTIS_API_KEY=your_api_key

# Notification channels
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_SMS_ENABLED=true
NOTIFICATION_PUSH_ENABLED=true
```

### Configuration

```typescript
// lib/config/nd-nummer.ts
export const ND_NUMMER_CONFIG = {
  EXPIRY_WARNING_DAYS: [90, 60, 30, 7],
  AUTO_CHECK_INTERVAL: '24h',
  DOCUMENT_MAX_SIZE: '10MB',
  ALLOWED_DOCUMENT_TYPES: ['pdf', 'jpg', 'jpeg', 'png']
};
```

## 📞 Support

Voor technische vragen over de ND-nummer implementatie:

- Documentatie: `/docs/nd-nummer/`
- Test Files: `/src/test/compliance/`
- API Reference: `/docs/nd-nummer/api-reference.md`