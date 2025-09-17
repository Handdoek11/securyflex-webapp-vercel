# Dutch Compliance Check Command

Comprehensive compliance validation for Dutch regulations including GDPR/AVG, WPBR security requirements, and complete Dutch localization coverage.

## Usage

```
/dutch-compliance-check [area]
```

## Compliance Areas

- `all` - Complete compliance audit (default)
- `gdpr` - GDPR/AVG data protection compliance
- `wpbr` - WPBR security industry regulations
- `language` - Dutch language coverage and accuracy
- `legal` - Legal documents and terms compliance
- `currency` - EUR formatting and financial compliance

## Compliance Validation Process

### 1. GDPR/AVG Data Protection
```bash
# Test GDPR compliance implementation
npm run test:gdpr-compliance
```

**GDPR Requirements Validated:**
- ✅ Explicit consent for data processing
- ✅ Right to data portability (export)
- ✅ Right to erasure (delete account)
- ✅ Data minimization principles
- ✅ Privacy by design implementation
- ✅ Data breach notification procedures

### 2. WPBR Security Industry Compliance
```bash
# Validate WPBR security requirements
npm run test:wpbr-compliance
```

**WPBR Requirements:**
- ✅ Security company registration validation
- ✅ VCA certification verification
- ✅ EHBO (first aid) certification tracking
- ✅ Background check status validation
- ✅ Professional liability insurance
- ✅ Industry-specific data handling

### 3. Dutch Language Coverage
```bash
# Test complete Dutch localization
npm run test:dutch-language
```

**Language Validation:**
- ✅ 100% UI translation coverage
- ✅ Dutch legal terminology accuracy
- ✅ Error messages in Dutch
- ✅ Email templates in Dutch
- ✅ Security industry terminology

## GDPR/AVG Compliance Testing

### Consent Management
```typescript
describe('GDPR Consent Management', () => {
  it('should require explicit consent for data processing', async () => {
    const user = await registerUser({
      email: 'test@example.com',
      gdprConsent: false
    });

    expect(user).toBeNull();
    expect(getLastError()).toBe('gdpr_consent_required');
  });

  it('should provide granular consent options', () => {
    const consentOptions = getConsentOptions();

    expect(consentOptions).toHaveProperty('essential'); // Required
    expect(consentOptions).toHaveProperty('analytics'); // Optional
    expect(consentOptions).toHaveProperty('marketing'); // Optional
    expect(consentOptions).toHaveProperty('gps_tracking'); // Optional
  });
});
```

### Data Export (Right to Portability)
```typescript
it('should export all user data in machine-readable format', async () => {
  const userId = 'user_123';

  const exportData = await exportUserData(userId);

  expect(exportData).toHaveProperty('personal_data');
  expect(exportData).toHaveProperty('shifts');
  expect(exportData).toHaveProperty('payments');
  expect(exportData).toHaveProperty('gps_checkins');
  expect(exportData.format).toBe('JSON');
});
```

### Data Deletion (Right to Erasure)
```typescript
it('should completely delete user data on request', async () => {
  const userId = 'user_123';

  await requestDataDeletion(userId);

  // Verify all personal data removed
  const personalData = await getUserPersonalData(userId);
  expect(personalData).toBeNull();

  // Verify only anonymous statistical data remains
  const anonymousData = await getAnonymousStatistics(userId);
  expect(anonymousData.user_id).toBeNull();
  expect(anonymousData.aggregated_only).toBe(true);
});
```

## WPBR Security Industry Compliance

### Security Company Registration
```typescript
describe('WPBR Compliance', () => {
  it('should validate WPBR registration number', async () => {
    const company = {
      name: 'Test Security BV',
      wpbr_number: 'invalid_number'
    };

    const validation = await validateWPBRRegistration(company);

    expect(validation.valid).toBe(false);
    expect(validation.error).toBe('invalid_wpbr_number');
  });

  it('should check WPBR registration expiry', async () => {
    const expiredWPBR = {
      wpbr_number: 'valid_number',
      expiry_date: '2023-01-01' // Expired
    };

    const validation = await validateWPBRRegistration(expiredWPBR);

    expect(validation.valid).toBe(false);
    expect(validation.error).toBe('wpbr_expired');
  });
});
```

### Professional Certifications
```typescript
it('should validate required security certifications', async () => {
  const professional = {
    id: 'zzp_001',
    certifications: {
      vca: { valid_until: '2025-01-01', status: 'active' },
      ehbo: { valid_until: '2024-06-01', status: 'expired' }
    }
  };

  const validation = await validateCertifications(professional);

  expect(validation.vca.valid).toBe(true);
  expect(validation.ehbo.valid).toBe(false);
  expect(validation.overall_status).toBe('incomplete');
});
```

### Background Check Compliance
```typescript
it('should track background check status', async () => {
  const professional = {
    id: 'zzp_002',
    background_check: {
      status: 'pending',
      requested_date: '2024-11-01',
      valid_for_days: 365
    }
  };

  const status = await getBackgroundCheckStatus(professional);

  expect(status.current_status).toBe('pending');
  expect(status.action_required).toBe(true);
  expect(status.days_remaining).toBeGreaterThan(0);
});
```

## Dutch Language Validation

### Translation Coverage Test
```typescript
describe('Dutch Localization', () => {
  it('should have 100% UI translation coverage', () => {
    const allUIStrings = getAllUIStrings();
    const dutchTranslations = getDutchTranslations();

    allUIStrings.forEach(key => {
      expect(dutchTranslations).toHaveProperty(key);
      expect(dutchTranslations[key]).not.toBe('');
      expect(dutchTranslations[key]).not.toBe(key); // Not untranslated
    });
  });

  it('should use correct Dutch security terminology', () => {
    const securityTerms = {
      'security_guard': 'beveiliger',
      'shift': 'dienst',
      'check_in': 'inchecken',
      'check_out': 'uitchecken',
      'surveillance': 'bewaking',
      'incident': 'incident',
      'emergency': 'noodgeval'
    };

    Object.entries(securityTerms).forEach(([english, dutch]) => {
      const translation = getTranslation(english, 'nl');
      expect(translation.toLowerCase()).toBe(dutch);
    });
  });
});
```

### Email Template Validation
```typescript
it('should have Dutch email templates for all notifications', async () => {
  const emailTypes = [
    'shift_assigned',
    'shift_reminder',
    'payment_completed',
    'incident_reported',
    'certification_expiry'
  ];

  emailTypes.forEach(async (type) => {
    const template = await getEmailTemplate(type, 'nl');

    expect(template).toBeDefined();
    expect(template.subject).toMatch(/^[^a-z]*[A-Z]/); // Proper capitalization
    expect(template.body).toContain('SecuryFlex');
    expect(template.language).toBe('nl');
  });
});
```

### Error Messages in Dutch
```typescript
it('should display all error messages in Dutch', () => {
  const errorMessages = {
    'invalid_credentials': 'Ongeldige inloggegevens',
    'gps_not_available': 'GPS niet beschikbaar',
    'outside_shift_area': 'Buiten het toegestane gebied',
    'payment_failed': 'Betaling mislukt',
    'certification_expired': 'Certificering verlopen'
  };

  Object.entries(errorMessages).forEach(([code, dutchMessage]) => {
    const message = getErrorMessage(code, 'nl');
    expect(message).toBe(dutchMessage);
  });
});
```

## Legal Document Compliance

### Terms of Service
```typescript
describe('Legal Documents', () => {
  it('should have Dutch terms of service', async () => {
    const terms = await getLegalDocument('terms_of_service', 'nl');

    expect(terms).toContain('Algemene Voorwaarden');
    expect(terms).toContain('Nederlandse wet');
    expect(terms).toContain('WPBR');
    expect(terms).toContain('GDPR');
    expect(terms.language).toBe('nl');
  });

  it('should include WPBR-specific clauses', async () => {
    const terms = await getLegalDocument('terms_of_service', 'nl');

    expect(terms).toContain('beveiligingsbedrijf');
    expect(terms).toContain('WPBR-registratie');
    expect(terms).toContain('veiligheidsfunctionaris');
  });
});
```

### Privacy Policy
```typescript
it('should have GDPR-compliant Dutch privacy policy', async () => {
  const privacy = await getLegalDocument('privacy_policy', 'nl');

  expect(privacy).toContain('Privacyverklaring');
  expect(privacy).toContain('persoonsgegevens');
  expect(privacy).toContain('verwerkingsdoeleinden');
  expect(privacy).toContain('bewaartermijnen');
  expect(privacy).toContain('uw rechten');
});
```

## Currency and Financial Compliance

### EUR Formatting
```typescript
describe('Currency Compliance', () => {
  it('should format amounts in EUR correctly', () => {
    const testAmounts = [
      { input: 2500, expected: '€ 25,00' },
      { input: 125000, expected: '€ 1.250,00' },
      { input: 50, expected: '€ 0,50' }
    ];

    testAmounts.forEach(({ input, expected }) => {
      const formatted = formatCurrency(input, 'EUR', 'nl');
      expect(formatted).toBe(expected);
    });
  });

  it('should handle tax calculations correctly', () => {
    const grossAmount = 2500; // €25.00
    const taxRate = 0.21; // 21% BTW

    const calculations = calculateTax(grossAmount, taxRate, 'NL');

    expect(calculations.net).toBe(2066); // €20.66
    expect(calculations.tax).toBe(434); // €4.34
    expect(calculations.gross).toBe(2500); // €25.00
  });
});
```

### Invoice Compliance
```typescript
it('should generate Dutch-compliant invoices', async () => {
  const invoice = await generateInvoice({
    company_id: 'company_123',
    amount: 2500,
    description: 'Beveiligingsdienst 12 uur',
    date: '2024-12-15'
  });

  expect(invoice.language).toBe('nl');
  expect(invoice.currency).toBe('EUR');
  expect(invoice).toContain('Factuur');
  expect(invoice).toContain('BTW-nummer');
  expect(invoice).toContain('Betalingstermijn');
});
```

## Data Localization Requirements

### Dutch Data Storage
```typescript
describe('Data Localization', () => {
  it('should store personal data within EU', async () => {
    const dataLocation = await getDataStorageLocation();

    expect(dataLocation.region).toBe('EU');
    expect(['NL', 'DE', 'FR', 'IE']).toContain(dataLocation.country);
    expect(dataLocation.gdpr_compliant).toBe(true);
  });

  it('should use EU-based service providers', () => {
    const services = getServiceProviders();

    services.forEach(service => {
      expect(service.gdpr_compliant).toBe(true);
      expect(service.data_processing_agreement).toBeDefined();
    });
  });
});
```

## Compliance Report

### Success Report
```json
{
  "compliance_id": "comp_20241215_001",
  "timestamp": "2024-12-15T10:30:00Z",
  "area": "all",
  "status": "compliant",
  "score": 98,
  "results": {
    "gdpr_avg": {
      "score": 100,
      "consent_management": "✅ COMPLIANT",
      "data_portability": "✅ COMPLIANT",
      "right_to_erasure": "✅ COMPLIANT",
      "privacy_by_design": "✅ COMPLIANT",
      "breach_procedures": "✅ COMPLIANT"
    },
    "wpbr": {
      "score": 98,
      "registration_validation": "✅ COMPLIANT",
      "certification_tracking": "✅ COMPLIANT",
      "background_checks": "⚠️ 2 pending",
      "industry_requirements": "✅ COMPLIANT"
    },
    "dutch_language": {
      "score": 100,
      "ui_coverage": "100% (485/485 strings)",
      "terminology_accuracy": "✅ VERIFIED",
      "email_templates": "✅ COMPLETE",
      "error_messages": "✅ COMPLETE",
      "legal_documents": "✅ COMPLETE"
    },
    "currency_financial": {
      "score": 96,
      "eur_formatting": "✅ CORRECT",
      "tax_calculations": "✅ VERIFIED",
      "invoice_compliance": "✅ COMPLIANT",
      "payment_terms": "⚠️ Review needed"
    }
  },
  "warnings": [
    "2 background checks pending completion",
    "Payment terms wording could be clearer"
  ],
  "recommendations": [
    "Follow up on pending background checks",
    "Review payment terms for clarity"
  ]
}
```

## Audit Trail

### Compliance Documentation
```typescript
it('should maintain audit trail for compliance', async () => {
  const auditTrail = await getComplianceAuditTrail('2024-12-01', '2024-12-15');

  expect(auditTrail).toHaveProperty('gdpr_consents');
  expect(auditTrail).toHaveProperty('data_requests');
  expect(auditTrail).toHaveProperty('wpbr_validations');
  expect(auditTrail).toHaveProperty('certification_checks');

  auditTrail.entries.forEach(entry => {
    expect(entry.timestamp).toBeDefined();
    expect(entry.action).toBeDefined();
    expect(entry.user_id).toBeDefined();
    expect(entry.compliance_area).toBeDefined();
  });
});
```

## CI/CD Integration

### Compliance Pipeline
```yaml
# .github/workflows/dutch-compliance.yml
- name: Dutch Compliance Check
  run: |
    npm run test:gdpr-compliance
    npm run test:wpbr-compliance
    npm run test:dutch-language
    npm run test:currency-compliance
```

### Automated Monitoring
```bash
# Daily compliance check
npm run compliance:daily-check

# Weekly full audit
npm run compliance:weekly-audit

# Before production deployment
npm run compliance:pre-deploy
```

## Success Criteria

Dutch compliance check passes when:
1. ✅ GDPR/AVG compliance at 100%
2. ✅ WPBR requirements fully met
3. ✅ Dutch language coverage complete
4. ✅ Legal documents compliant
5. ✅ Currency formatting correct
6. ✅ Audit trail comprehensive

**Usage**: Run before all production deployments and during compliance reviews.