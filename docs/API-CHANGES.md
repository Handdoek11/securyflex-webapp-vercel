# 📋 API Changes Documentation - SecuryFlex Schema Update

## Overview
This document outlines all API changes resulting from the comprehensive Prisma schema update completed on 2025-09-17.

## 🔄 Breaking Changes

### 1. Field Name Changes

All API responses and request bodies have been updated with the following field name changes:

| Old Field Name | New Field Name | Affected Endpoints |
|----------------|----------------|-------------------|
| `uurloon` | `uurtarief` | All `/api/opdrachten/*`, `/api/bedrijf/dashboard/*` |
| `aantalPersonen` | `aantalBeveiligers` | All `/api/opdrachten/*`, `/api/bedrijf/planning/*` |
| `beveiligerId` | `zzpId` | `/api/werkuren/*`, `/api/hours/*`, `/api/applications/*` |
| `organisatienaam` | `bedrijfsnaam` | `/api/opdrachtgever/*`, `/api/profile/*` |

### 2. Location Data Structure

**Old Format:**
```json
{
  "locatie": "Hoofdstraat 123, 1234AB Amsterdam"
}
```

**New Format:**
```json
{
  "locatie": {
    "adres": "Hoofdstraat 123",
    "postcode": "1234AB",
    "plaats": "Amsterdam",
    "lat": 52.370216,     // optional
    "lng": 4.895168      // optional
  }
}
```

**Affected Endpoints:**
- `POST /api/opdrachten` - Create opdracht
- `GET /api/opdrachten/*` - All opdracht queries
- `PATCH /api/opdrachten/[id]` - Update opdracht

### 3. Profile Structure Changes

#### ZZP Profile
**New Required Fields:**
```json
{
  "voornaam": "string",        // NEW - Required
  "achternaam": "string",       // NEW - Required
  // ... existing fields
}
```

**New Optional Fields:**
```json
{
  "geboortedatum": "2000-01-01",  // NEW
  "adres": "string",               // NEW
  "postcode": "string",            // NEW
  "plaats": "string",              // NEW
  "rijbewijs": boolean,            // NEW
  "autoDescikbaar": boolean,       // NEW
  "ervaring": number,              // NEW
  "ndNummer": "string",            // NEW
  "ndNummerVervalDatum": "date",   // NEW
  "finqleAccountId": "string",     // NEW
  "finqleVerified": boolean        // NEW
}
```

#### Bedrijf Profile
**New Optional Fields:**
```json
{
  "adres": "string",
  "postcode": "string",
  "plaats": "string",
  "website": "string",
  "beschrijving": "string",
  "werkgebied": ["string"],
  "specialisaties": ["string"],
  "aantalMedewerkers": number,
  "oprichtingsjaar": number,
  "certificeringen": ["string"],
  "bedrijfsstructuur": "BV|NV|VOF|EENMANSZAAK|STICHTING|ANDERS"
}
```

## 📦 New API Resources

### 1. Certificates API
**Endpoints:**
- `GET /api/profile/certificates` - List user certificates
- `POST /api/profile/certificates` - Upload certificate
- `GET /api/profile/certificates/[id]` - Get certificate details
- `DELETE /api/profile/certificates/[id]` - Delete certificate

**Response Structure:**
```json
{
  "id": "cert-123",
  "naam": "BOA Certificaat",
  "uitgever": "Nederlandse Politie",
  "certificaatNummer": "BOA-2024-001",
  "uitgifteDatum": "2024-01-01",
  "verloopdatum": "2029-01-01",
  "status": "PENDING|APPROVED|REJECTED|EXPIRED|SUSPENDED",
  "isVerified": boolean,
  "verifiedAt": "2024-01-05"
}
```

### 2. Documents API
**Endpoints:**
- `GET /api/profile/documents` - List user documents
- `POST /api/profile/documents` - Upload document
- `GET /api/profile/documents/[id]` - Get document details
- `DELETE /api/profile/documents/[id]` - Delete document

**Response Structure:**
```json
{
  "id": "doc-123",
  "titel": "VOG Verklaring",
  "documentType": "VOG_P_CERTIFICAAT|IDENTITEITSBEWIJS|etc",
  "fileName": "vog-2024.pdf",
  "fileSize": 524288,
  "status": "PENDING|IN_REVIEW|APPROVED|REJECTED|EXPIRED|NEEDS_UPDATE",
  "uploadedAt": "2024-01-10"
}
```

## 🔧 Updated Validation Rules

### ZZP Profile Validation
```typescript
{
  voornaam: min 2 characters (REQUIRED)
  achternaam: min 2 characters (REQUIRED)
  kvkNummer: exactly 8 digits
  btwNummer: format "NL123456789B01" (optional)
  uurtarief: €15-100
  postcode: format "1234AB" (optional)
  ervaring: 0-50 years (optional)
  ndNummer: format "ND123456" (optional)
}
```

### Opdracht Creation Validation
```typescript
{
  titel: 5-100 characters
  beschrijving: 20-2000 characters
  locatie: {
    adres: min 5 characters
    postcode: Dutch format
    plaats: min 2 characters
    lat: -90 to 90 (optional)
    lng: -180 to 180 (optional)
  }
  uurtarief: €15-100 (renamed from uurloon)
  aantalBeveiligers: 1-50 (renamed from aantalPersonen)
}
```

## 💰 Payment Integration Updates

### New User Fields
```json
{
  "finqleId": "string",
  "finqleKYCStatus": "string",
  "finqleVerified": boolean,
  "finqleVerifiedAt": "date"
}
```

### New Payment Fields
```json
{
  "externalId": "string",
  "payoutDate": "date",
  "payoutBatch": "string",
  "finqleMetadata": {}
}
```

## 🔄 Migration Guide

### For Frontend Developers

1. **Update API Client Field Names:**
```javascript
// Old
const opdracht = {
  uurloon: 25.00,
  aantalPersonen: 5
};

// New
const opdracht = {
  uurtarief: 25.00,
  aantalBeveiligers: 5
};
```

2. **Update Location Handling:**
```javascript
// Old
const location = "Hoofdstraat 123, 1234AB Amsterdam";

// New
const location = {
  adres: "Hoofdstraat 123",
  postcode: "1234AB",
  plaats: "Amsterdam"
};
```

3. **Handle New Profile Fields:**
```javascript
// Check for new required fields
if (!profile.voornaam || !profile.achternaam) {
  // Prompt user to complete profile
}
```

4. **Update TypeScript Interfaces:**
```typescript
interface ZZPProfile {
  // Add new fields
  voornaam: string;
  achternaam: string;
  geboortedatum?: Date;
  // ... etc
}
```

## 📝 Response Examples

### GET /api/profile (ZZP)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "jan.jansen@example.com",
      "name": "Jan Jansen",
      "role": "ZZP_BEVEILIGER",
      "finqleId": "finqle-123",
      "finqleVerified": true
    },
    "profile": {
      "id": "zzp-123",
      "voornaam": "Jan",
      "achternaam": "Jansen",
      "kvkNummer": "12345678",
      "uurtarief": 27.50,
      "certificaten": [
        {
          "id": "cert-1",
          "naam": "BOA",
          "status": "APPROVED"
        }
      ],
      "documenten": [
        {
          "id": "doc-1",
          "titel": "VOG",
          "status": "APPROVED"
        }
      ]
    }
  }
}
```

### GET /api/opdrachten
```json
{
  "success": true,
  "data": {
    "opdrachten": [
      {
        "id": "opdracht-123",
        "titel": "Festival Beveiliging",
        "uurtarief": 32.50,
        "aantalBeveiligers": 10,
        "locatie": {
          "adres": "Festivalterrein 1",
          "postcode": "1234AB",
          "plaats": "Amsterdam",
          "lat": 52.370216,
          "lng": 4.895168
        },
        "status": "OPEN"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

## ⚠️ Deprecation Notices

The following will be removed in future versions:
- `certificatenLegacy` field (use `certificaten` relation instead)
- String-based `locatie` field (use `locatie` object)
- `/api/jobs/*` endpoints (use `/api/opdrachten/*`)

## 🚀 Testing

Use the following test credentials for development:
- **ZZP**: jan.jansen@example.com / Password123!
- **Bedrijf**: info@secureguard.nl / Password123!
- **Opdrachtgever**: events@festival.nl / Password123!

## 📅 Timeline

- **Phase 1** (Completed): Schema updates, field renames
- **Phase 2** (In Progress): Data migration, testing
- **Phase 3** (Planned): Deprecate legacy endpoints
- **Phase 4** (Q2 2025): Remove deprecated fields

## 🆘 Support

For questions or issues:
- Create an issue in the repository
- Contact the backend team
- Check the migration scripts in `/prisma/migrations/`

---
*Last updated: 2025-09-17*
*Version: 2.0.0*