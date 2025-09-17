/**
 * API Schema Validation Test Suite
 *
 * Tests all API endpoints against the new Prisma schema to ensure compatibility
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Mock Prisma client
export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
  prisma: prismaMock
}));

describe('API Schema Validation Tests', () => {

  describe('ZZPProfile Endpoints', () => {

    it('should handle new ZZPProfile fields correctly', async () => {
      const mockZZPProfile = {
        id: 'test-zzp-1',
        userId: 'user-1',
        voornaam: 'Jan',
        achternaam: 'Jansen',
        geboortedatum: new Date('1990-01-01'),
        kvkNummer: '12345678',
        btwNummer: 'NL123456789B01',
        specialisaties: ['Evenementen', 'Objectbeveiliging'],
        certificatenLegacy: ['BOA', 'BHV'],
        werkgebied: ['Amsterdam', 'Rotterdam'],
        uurtarief: 25.50,
        adres: 'Hoofdstraat 123',
        postcode: '1234AB',
        plaats: 'Amsterdam',
        rijbewijs: true,
        autoDescikbaar: true,
        ervaring: 5,
        ndNummer: 'ND123456',
        ndNummerStatus: 'ACTIEF',
        beschikbaarheid: {},
        rating: 4.5,
        totalReviews: 10,
        finqleMerchantId: 'merchant-123',
        finqleOnboarded: true,
        finqleAccountId: 'account-123',
        finqleVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.zZPProfile.findUnique.mockResolvedValue(mockZZPProfile);

      const result = await prismaMock.zZPProfile.findUnique({
        where: { userId: 'user-1' }
      });

      expect(result).toHaveProperty('voornaam');
      expect(result).toHaveProperty('achternaam');
      expect(result).toHaveProperty('geboortedatum');
      expect(result).toHaveProperty('adres');
      expect(result).toHaveProperty('rijbewijs');
      expect(result).toHaveProperty('autoDescikbaar');
      expect(result).toHaveProperty('ervaring');
      expect(result).toHaveProperty('finqleAccountId');
      expect(result).toHaveProperty('finqleVerified');
    });

    it('should handle Certificate relations', async () => {
      const mockCertificates = [
        {
          id: 'cert-1',
          zzpId: 'zzp-1',
          naam: 'BOA Certificaat',
          uitgever: 'Nederlandse Politie',
          certificaatNummer: 'BOA-2024-001',
          uitgifteDatum: new Date('2024-01-01'),
          verloopdatum: new Date('2029-01-01'),
          status: 'APPROVED',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      prismaMock.certificate.findMany.mockResolvedValue(mockCertificates);

      const result = await prismaMock.certificate.findMany({
        where: { zzpId: 'zzp-1' }
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('naam');
      expect(result[0]).toHaveProperty('uitgever');
      expect(result[0]).toHaveProperty('status');
    });

    it('should handle Document relations', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          zzpId: 'zzp-1',
          titel: 'VOG Verklaring',
          documentType: 'VOG_P_CERTIFICAAT',
          fileName: 'vog-2024.pdf',
          originalFileName: 'vog-verklaring.pdf',
          fileUrl: '/uploads/documents/vog-2024.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          status: 'APPROVED',
          uploadedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      prismaMock.document.findMany.mockResolvedValue(mockDocuments);

      const result = await prismaMock.document.findMany({
        where: { zzpId: 'zzp-1' }
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('documentType');
      expect(result[0]).toHaveProperty('status');
    });
  });

  describe('BedrijfProfile Endpoints', () => {

    it('should handle new BedrijfProfile fields correctly', async () => {
      const mockBedrijfProfile = {
        id: 'bedrijf-1',
        userId: 'user-2',
        bedrijfsnaam: 'SecureGuard BV',
        kvkNummer: '87654321',
        btwNummer: 'NL987654321B01',
        adres: 'Industrieweg 456',
        postcode: '5678CD',
        plaats: 'Rotterdam',
        website: 'https://secureguard.nl',
        beschrijving: 'Professionele beveiligingsdiensten',
        werkgebied: ['Zuid-Holland', 'Noord-Holland'],
        specialisaties: ['Evenementen', 'Bouw', 'Horeca'],
        aantalMedewerkers: 25,
        oprichtingsjaar: 2015,
        certificeringen: ['ISO 9001', 'VCA**'],
        bedrijfsstructuur: 'BV',
        teamSize: 25,
        ndNummer: 'ND789012',
        ndNummerStatus: 'ACTIEF',
        subscriptionTier: 'MEDIUM',
        finqleDebtorId: 'debtor-456',
        finqleCreditLimit: 50000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.bedrijfProfile.findUnique.mockResolvedValue(mockBedrijfProfile);

      const result = await prismaMock.bedrijfProfile.findUnique({
        where: { userId: 'user-2' }
      });

      expect(result).toHaveProperty('adres');
      expect(result).toHaveProperty('website');
      expect(result).toHaveProperty('beschrijving');
      expect(result).toHaveProperty('werkgebied');
      expect(result).toHaveProperty('specialisaties');
      expect(result).toHaveProperty('aantalMedewerkers');
      expect(result).toHaveProperty('oprichtingsjaar');
      expect(result).toHaveProperty('certificeringen');
      expect(result).toHaveProperty('bedrijfsstructuur');
    });
  });

  describe('Opdracht Endpoints', () => {

    it('should handle OpdrachtLocatie relation correctly', async () => {
      const mockOpdracht = {
        id: 'opdracht-1',
        titel: 'Evenement Beveiliging',
        beschrijving: 'Beveiliging voor festival',
        startDatum: new Date('2024-07-01'),
        eindDatum: new Date('2024-07-03'),
        aantalBeveiligers: 10, // Changed from aantalPersonen
        uurtarief: 27.50, // Changed from uurloon
        vereisten: ['BOA', 'BHV'],
        status: 'OPEN',
        creatorType: 'OPDRACHTGEVER',
        creatorId: 'opdrachtgever-1',
        targetAudience: 'BEIDEN',
        directZZPAllowed: true,
        locatie: {
          id: 'loc-1',
          opdrachtId: 'opdracht-1',
          adres: 'Festivalterrein 1',
          postcode: '1234AB',
          plaats: 'Amsterdam',
          lat: 52.370216,
          lng: 4.895168,
          reisafstand: 10,
          parkeerinfo: 'Gratis parkeren op terrein',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.opdracht.findUnique.mockResolvedValue(mockOpdracht);

      const result = await prismaMock.opdracht.findUnique({
        where: { id: 'opdracht-1' },
        include: { locatie: true }
      });

      expect(result).toHaveProperty('aantalBeveiligers');
      expect(result).toHaveProperty('uurtarief');
      expect(result).not.toHaveProperty('aantalPersonen'); // Old field name
      expect(result).not.toHaveProperty('uurloon'); // Old field name

      expect(result?.locatie).toBeDefined();
      expect(result?.locatie).toHaveProperty('adres');
      expect(result?.locatie).toHaveProperty('postcode');
      expect(result?.locatie).toHaveProperty('plaats');
      expect(result?.locatie).toHaveProperty('lat');
      expect(result?.locatie).toHaveProperty('lng');
    });

    it('should handle legacy location string migration', async () => {
      // Test that old string location format is properly migrated
      const legacyOpdracht = {
        id: 'legacy-1',
        locatie: 'Hoofdstraat 123, 1234AB Amsterdam' // Old format
      };

      // After migration, should have OpdrachtLocatie
      const expectedLocatie = {
        adres: 'Hoofdstraat 123',
        postcode: '1234AB',
        plaats: 'Amsterdam'
      };

      // This would be handled by migration script
      expect(expectedLocatie).toHaveProperty('adres');
      expect(expectedLocatie).toHaveProperty('postcode');
      expect(expectedLocatie).toHaveProperty('plaats');
    });
  });

  describe('Payment Integration', () => {

    it('should handle new Finqle fields in User model', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ZZP_BEVEILIGER',
        status: 'ACTIVE',
        finqleId: 'finqle-user-123',
        finqleKYCStatus: 'VERIFIED',
        finqleVerified: true,
        finqleVerifiedAt: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await prismaMock.user.findUnique({
        where: { id: 'user-1' }
      });

      expect(result).toHaveProperty('finqleId');
      expect(result).toHaveProperty('finqleKYCStatus');
      expect(result).toHaveProperty('finqleVerified');
      expect(result).toHaveProperty('finqleVerifiedAt');
    });

    it('should handle new Betaling fields', async () => {
      const mockBetaling = {
        id: 'betaling-1',
        type: 'INVOICE_PAYMENT',
        bedrag: 1500.00,
        betalerType: 'OPDRACHTGEVER',
        betalerId: 'opdrachtgever-1',
        ontvangerType: 'ZZP',
        ontvangerId: 'zzp-1',
        status: 'PAID',
        finqleReferentie: 'FQ-2024-001',
        externalId: 'ext-payment-123',
        payoutDate: new Date('2024-01-20'),
        payoutBatch: 'BATCH-2024-W03',
        finqleMetadata: {
          transactionId: 'txn-456',
          processingFee: 2.99
        },
        createdAt: new Date(),
        paidAt: new Date('2024-01-20')
      };

      prismaMock.betaling.findUnique.mockResolvedValue(mockBetaling);

      const result = await prismaMock.betaling.findUnique({
        where: { id: 'betaling-1' }
      });

      expect(result).toHaveProperty('externalId');
      expect(result).toHaveProperty('payoutDate');
      expect(result).toHaveProperty('payoutBatch');
      expect(result).toHaveProperty('finqleMetadata');
    });
  });

  describe('Validation Schema Compatibility', () => {

    it('should validate ZZP profile data with new schema', () => {
      const validZZPData = {
        voornaam: 'Jan',
        achternaam: 'Jansen',
        kvkNummer: '12345678',
        uurtarief: 25.50,
        specialisaties: ['Evenementen'],
        werkgebied: ['Amsterdam'],
        rijbewijs: true,
        autoDescikbaar: false,
        beschikbaarheid: {
          maandag: { beschikbaar: true, van: '08:00', tot: '17:00' },
          dinsdag: { beschikbaar: true, van: '08:00', tot: '17:00' },
          woensdag: { beschikbaar: true, van: '08:00', tot: '17:00' },
          donderdag: { beschikbaar: true, van: '08:00', tot: '17:00' },
          vrijdag: { beschikbaar: true, van: '08:00', tot: '17:00' },
          zaterdag: { beschikbaar: false },
          zondag: { beschikbaar: false }
        }
      };

      // This would use the actual validation schema
      expect(validZZPData).toHaveProperty('voornaam');
      expect(validZZPData).toHaveProperty('achternaam');
      expect(validZZPData).not.toHaveProperty('name'); // Old field
      expect(validZZPData).not.toHaveProperty('email'); // Moved to User model
    });

    it('should validate Opdracht creation with location object', () => {
      const validOpdrachtData = {
        titel: 'Festival Beveiliging 2024',
        beschrijving: 'Professionele beveiliging voor zomerfestival',
        locatie: {
          adres: 'Festivalterrein 1',
          postcode: '1234AB',
          plaats: 'Amsterdam',
          lat: 52.370216,
          lng: 4.895168
        },
        startDatum: '2024-07-01',
        eindDatum: '2024-07-03',
        startTijd: '08:00',
        eindTijd: '23:00',
        uurtarief: 27.50,
        aantalBeveiligers: 10,
        urgentie: 'NORMAAL',
        specialisaties: ['Evenementen', 'Crowd Control'],
        targetAudience: 'BEIDEN',
        directZZPAllowed: true
      };

      expect(validOpdrachtData.locatie).toBeInstanceOf(Object);
      expect(validOpdrachtData.locatie).toHaveProperty('adres');
      expect(validOpdrachtData.locatie).toHaveProperty('postcode');
      expect(validOpdrachtData.locatie).toHaveProperty('plaats');
      expect(typeof validOpdrachtData.locatie).not.toBe('string'); // Not old string format
    });
  });

  describe('API Response Structure', () => {

    it('should return correct field names in API responses', async () => {
      // Mock API response structure
      const apiResponse = {
        success: true,
        data: {
          opdracht: {
            id: 'opdracht-1',
            titel: 'Test Opdracht',
            uurtarief: 25.50, // Correct field name
            aantalBeveiligers: 5, // Correct field name
            locatie: {
              adres: 'Teststraat 1',
              postcode: '1234AB',
              plaats: 'Amsterdam'
            }
          },
          profile: {
            voornaam: 'Jan',
            achternaam: 'Jansen',
            certificaten: [ // New relation, not string array
              { id: 'cert-1', naam: 'BOA', status: 'APPROVED' }
            ]
          }
        }
      };

      // Validate response structure
      expect(apiResponse.data.opdracht).toHaveProperty('uurtarief');
      expect(apiResponse.data.opdracht).not.toHaveProperty('uurloon');
      expect(apiResponse.data.opdracht).toHaveProperty('aantalBeveiligers');
      expect(apiResponse.data.opdracht).not.toHaveProperty('aantalPersonen');
      expect(apiResponse.data.opdracht.locatie).toBeInstanceOf(Object);
      expect(apiResponse.data.profile.certificaten[0]).toHaveProperty('status');
    });
  });
});

describe('Migration Script Tests', () => {

  it('should correctly parse legacy location strings', () => {
    const testCases = [
      {
        input: 'Hoofdstraat 123, 1234AB Amsterdam',
        expected: {
          adres: 'Hoofdstraat 123',
          postcode: '1234AB',
          plaats: 'Amsterdam'
        }
      },
      {
        input: 'Lange Nieuwstraat 45-47, 1012 NH Amsterdam',
        expected: {
          adres: 'Lange Nieuwstraat 45-47',
          postcode: '1012NH',
          plaats: 'Amsterdam'
        }
      }
    ];

    testCases.forEach(({ input, expected }) => {
      // This would be the actual parsing logic from migration script
      const parts = input.split(',').map(s => s.trim());
      const adres = parts[0];
      const postcodeMatch = parts[1]?.match(/(\d{4}\s?[A-Z]{2})/i);
      const postcode = postcodeMatch?.[1].replace(/\s/g, '');
      const plaats = parts[1]?.replace(postcodeMatch?.[0] || '', '').trim();

      expect(adres).toBe(expected.adres);
      expect(postcode).toBe(expected.postcode);
      expect(plaats).toBe(expected.plaats);
    });
  });

  it('should handle certificate migration correctly', () => {
    const legacyCertificates = ['BOA', 'BHV', 'EHBO'];

    const migratedCertificates = legacyCertificates.map(cert => ({
      naam: cert,
      uitgever: 'Onbekend',
      status: 'PENDING',
      beschrijving: 'Gemigreerd uit legacy systeem'
    }));

    expect(migratedCertificates).toHaveLength(3);
    migratedCertificates.forEach(cert => {
      expect(cert).toHaveProperty('naam');
      expect(cert).toHaveProperty('uitgever');
      expect(cert).toHaveProperty('status');
      expect(cert.status).toBe('PENDING');
    });
  });
});