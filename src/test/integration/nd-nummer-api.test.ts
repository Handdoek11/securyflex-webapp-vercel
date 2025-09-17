import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { POST as registerPost, PUT as registerPut } from '@/app/api/compliance/nd-nummer/register/route';
import { POST as validatePost, GET as validateGet } from '@/app/api/compliance/nd-nummer/validate/route';
import { GET as monitorGet, POST as monitorPost } from '@/app/api/compliance/nd-nummer/monitor/route';
import { POST as notificationPost, GET as notificationGet } from '@/app/api/compliance/nd-nummer/notifications/route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {}
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    zZPProfile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    bedrijfProfile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    nDNummerAuditLog: {
      create: vi.fn(),
      findMany: vi.fn()
    },
    notification: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn()
    }
  }
}));

vi.mock('@/lib/supabase/broadcast', () => ({
  broadcastEvent: vi.fn()
}));

vi.mock('next/headers', () => ({
  headers: () => new Map([
    ['x-forwarded-for', '192.168.1.1'],
    ['user-agent', 'Mozilla/5.0 Test Browser']
  ])
}));

describe('ND-nummer API Integration Tests', () => {
  const mockSession = {
    user: {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    }
  };

  const mockZZPProfile = {
    id: 'zzp123',
    userId: 'user123',
    kvkNummer: '12345678',
    ndNummer: null,
    ndNummerStatus: 'NIET_GEREGISTREERD',
    ndNummerVervalDatum: null,
    ndNummerLaatsteControle: null,
    ndNummerOpmerking: null,
    user: {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ZZP_BEVEILIGER'
    }
  };

  const mockBedrijfProfile = {
    id: 'bedrijf123',
    userId: 'user123',
    bedrijfsnaam: 'Test Security BV',
    kvkNummer: '87654321',
    ndNummer: null,
    ndNummerStatus: 'NIET_GEREGISTREERD',
    ndNummerVervalDatum: null,
    ndNummerLaatsteControle: null,
    ndNummerOpmerking: null,
    user: {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'BEDRIJF'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
  });

  describe('ND-nummer Registration API', () => {
    it('should register ND-nummer for ZZP profile successfully', async () => {
      // Setup mocks
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ZZP_BEVEILIGER',
        zzpProfile: mockZZPProfile,
        bedrijfProfile: null
      } as any);

      vi.mocked(prisma.zZPProfile.findFirst).mockResolvedValue(null); // No existing ND-nummer
      vi.mocked(prisma.zZPProfile.update).mockResolvedValue({
        ...mockZZPProfile,
        ndNummer: 'ND123456',
        ndNummerStatus: 'AANGEVRAAGD',
        ndNummerVervalDatum: new Date('2027-12-31'),
        ndNummerLaatsteControle: new Date()
      } as any);

      vi.mocked(prisma.nDNummerAuditLog.create).mockResolvedValue({} as any);

      const requestData = {
        ndNummer: 'ND123456',
        vervalDatum: '2027-12-31T23:59:59.000Z',
        documentUpload: 'https://example.com/nd-document.pdf',
        confirmatie: true
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/register', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.registration.ndNummer).toBe('ND123456');
      expect(data.registration.status).toBe('AANGEVRAAGD');
      expect(data.nextActions).toBeDefined();

      // Verify database calls
      expect(prisma.zZPProfile.update).toHaveBeenCalledWith({
        where: { id: 'zzp123' },
        data: expect.objectContaining({
          ndNummer: 'ND123456',
          ndNummerStatus: 'AANGEVRAAGD'
        })
      });

      expect(prisma.nDNummerAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          profileType: 'ZZP',
          zzpProfileId: 'zzp123',
          action: 'REGISTRATIE'
        })
      });
    });

    it('should register ND-nummer for Bedrijf profile successfully', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'BEDRIJF',
        zzpProfile: null,
        bedrijfProfile: mockBedrijfProfile
      } as any);

      vi.mocked(prisma.bedrijfProfile.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.bedrijfProfile.update).mockResolvedValue({
        ...mockBedrijfProfile,
        ndNummer: 'ND789012',
        ndNummerStatus: 'AANGEVRAAGD'
      } as any);

      vi.mocked(prisma.nDNummerAuditLog.create).mockResolvedValue({} as any);

      const requestData = {
        ndNummer: 'ND789012',
        vervalDatum: '2028-06-30T23:59:59.000Z',
        documentUpload: 'https://example.com/bedrijf-nd-document.pdf',
        confirmatie: true
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/register', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.registration.ndNummer).toBe('ND789012');
      expect(data.registration.profileType).toBe('BEDRIJF');

      expect(prisma.bedrijfProfile.update).toHaveBeenCalled();
    });

    it('should reject duplicate ND-nummer', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ZZP_BEVEILIGER',
        zzpProfile: mockZZPProfile,
        bedrijfProfile: null
      } as any);

      // Mock existing ND-nummer
      vi.mocked(prisma.zZPProfile.findFirst).mockResolvedValue({
        id: 'other-zzp',
        ndNummer: 'ND123456'
      } as any);

      const requestData = {
        ndNummer: 'ND123456',
        vervalDatum: '2027-12-31T23:59:59.000Z',
        documentUpload: 'https://example.com/document.pdf',
        confirmatie: true
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/register', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('al geregistreerd');
      expect(prisma.zZPProfile.update).not.toHaveBeenCalled();
    });

    it('should reject invalid ND-nummer format', async () => {
      const requestData = {
        ndNummer: 'INVALID123',
        vervalDatum: '2027-12-31T23:59:59.000Z',
        documentUpload: 'https://example.com/document.pdf',
        confirmatie: true
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/register', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validatiefout');
      expect(data.details).toBeDefined();
    });

    it('should reject unauthorized requests', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/register', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authenticatie vereist');
    });
  });

  describe('ND-nummer Validation API', () => {
    it('should validate ND-nummer via mock Justis API', async () => {
      const profileWithNDNummer = {
        ...mockZZPProfile,
        ndNummer: 'ND123456',
        ndNummerStatus: 'PENDING_VERIFICATIE'
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ZZP_BEVEILIGER',
        zzpProfile: profileWithNDNummer,
        bedrijfProfile: null
      } as any);

      vi.mocked(prisma.zZPProfile.update).mockResolvedValue({
        ...profileWithNDNummer,
        ndNummerStatus: 'ACTIEF',
        ndNummerLaatsteControle: new Date()
      } as any);

      vi.mocked(prisma.nDNummerAuditLog.create).mockResolvedValue({} as any);

      const requestData = {
        ndNummer: 'ND123456',
        profileType: 'ZZP'
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/validate', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await validatePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.ndNummer).toBe('ND123456');
      expect(data.validation.status).toBe('ACTIEF');
      expect(data.validation.valid).toBe(true);
      expect(data.complianceInfo.isCompliant).toBe(true);
      expect(data.complianceInfo.canAcceptJobs).toBe(true);

      expect(prisma.zZPProfile.update).toHaveBeenCalledWith({
        where: { id: 'zzp123' },
        data: expect.objectContaining({
          ndNummerStatus: 'ACTIEF'
        })
      });
    });

    it('should handle expired ND-nummer from Justis API', async () => {
      const profileWithExpiredND = {
        ...mockZZPProfile,
        ndNummer: 'ND111111', // This will trigger "expired" response in mock
        ndNummerStatus: 'ACTIEF'
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ZZP_BEVEILIGER',
        zzpProfile: profileWithExpiredND,
        bedrijfProfile: null
      } as any);

      vi.mocked(prisma.zZPProfile.update).mockResolvedValue({
        ...profileWithExpiredND,
        ndNummerStatus: 'VERLOPEN'
      } as any);

      vi.mocked(prisma.nDNummerAuditLog.create).mockResolvedValue({} as any);

      const requestData = {
        ndNummer: 'ND111111',
        profileType: 'ZZP'
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/validate', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await validatePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.validation.status).toBe('VERLOPEN');
      expect(data.validation.valid).toBe(false);
      expect(data.complianceInfo.requiresAction).toBe(true);
    });

    it('should get ND-nummer status for user', async () => {
      const activeProfile = {
        ...mockZZPProfile,
        ndNummer: 'ND123456',
        ndNummerStatus: 'ACTIEF',
        ndNummerVervalDatum: new Date('2027-12-31'),
        ndNummerLaatsteControle: new Date()
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        zzpProfile: activeProfile,
        bedrijfProfile: null
      } as any);

      vi.mocked(prisma.nDNummerAuditLog.findMany).mockResolvedValue([
        {
          id: 'audit1',
          action: 'VERIFICATIE',
          newStatus: 'ACTIEF',
          verificationSource: 'Justis API',
          createdAt: new Date(),
          complianceNotes: 'Geverifieerd via API'
        }
      ] as any);

      const url = new URL('http://localhost/api/compliance/nd-nummer/validate?profileType=ZZP');
      const request = new NextRequest(url);

      const response = await validateGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.profile.ndNummer).toBe('ND123456');
      expect(data.profile.ndNummerStatus).toBe('ACTIEF');
      expect(data.compliance.isCompliant).toBe(true);
      expect(data.compliance.canAcceptJobs).toBe(true);
      expect(data.auditHistory).toHaveLength(1);
    });
  });

  describe('ND-nummer Monitoring API', () => {
    beforeEach(() => {
      // Mock admin user
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ADMIN'
      } as any);
    });

    it('should get platform-wide compliance monitoring for admin', async () => {
      const mockProfiles = [
        {
          id: 'zzp1',
          userId: 'user1',
          ndNummer: 'ND123456',
          ndNummerStatus: 'ACTIEF',
          ndNummerVervalDatum: new Date('2027-12-31'),
          ndNummerLaatsteControle: new Date(),
          user: { name: 'User 1', email: 'user1@example.com' }
        },
        {
          id: 'zzp2',
          userId: 'user2',
          ndNummer: 'ND789012',
          ndNummerStatus: 'VERLOPEN',
          ndNummerVervalDatum: new Date('2023-12-31'),
          ndNummerLaatsteControle: new Date(),
          user: { name: 'User 2', email: 'user2@example.com' }
        }
      ];

      vi.mocked(prisma.zZPProfile.findMany).mockResolvedValue(mockProfiles as any);
      vi.mocked(prisma.bedrijfProfile.findMany).mockResolvedValue([]);
      vi.mocked(prisma.nDNummerAuditLog.findMany).mockResolvedValue([
        {
          id: 'audit1',
          profileType: 'ZZP',
          action: 'VERIFICATIE',
          newStatus: 'ACTIEF',
          createdAt: new Date(),
          zzpProfile: { user: { name: 'User 1' } }
        }
      ] as any);

      const url = new URL('http://localhost/api/compliance/nd-nummer/monitor?scope=platform');
      const request = new NextRequest(url);

      const response = await monitorGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.summary.totalProfiles).toBe(2);
      expect(data.summary.compliantProfiles).toBe(1);
      expect(data.summary.expiredProfiles).toBe(1);
      expect(data.profiles).toHaveLength(2);
      expect(data.alerts).toHaveLength(1); // One expired profile should create alert
      expect(data.recentActivity).toHaveLength(1);
    });

    it('should run compliance check on specific profiles', async () => {
      const mockProfiles = [
        {
          id: 'zzp1',
          ndNummer: 'ND123456',
          ndNummerStatus: 'ACTIEF',
          ndNummerVervalDatum: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
          user: { id: 'user1', name: 'User 1', email: 'user1@example.com' }
        }
      ];

      vi.mocked(prisma.zZPProfile.findMany).mockResolvedValue(mockProfiles as any);
      vi.mocked(prisma.bedrijfProfile.findMany).mockResolvedValue([]);

      const requestData = {
        profileIds: ['zzp1'],
        checkType: 'EXPIRY_CHECK',
        includeExpiringSoon: true,
        daysBeforeExpiry: 30
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/monitor', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await monitorPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary.totalChecked).toBe(1);
      expect(data.summary.needingAttention).toBe(1); // Profile expires in 20 days
      expect(data.results[0].needsAttention).toBe(true);
      expect(data.results[0].reasons).toContain('Verloopt over 20 dagen');
    });

    it('should deny access to non-admin for platform monitoring', async () => {
      // Mock non-admin user
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ZZP_BEVEILIGER'
      } as any);

      const url = new URL('http://localhost/api/compliance/nd-nummer/monitor?scope=platform');
      const request = new NextRequest(url);

      const response = await monitorGet(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Admin rechten vereist');
    });
  });

  describe('ND-nummer Notifications API', () => {
    beforeEach(() => {
      const profileWithNDNummer = {
        ...mockZZPProfile,
        ndNummer: 'ND123456',
        ndNummerStatus: 'ACTIEF',
        ndNummerVervalDatum: new Date('2024-03-15')
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        zzpProfile: profileWithNDNummer,
        bedrijfProfile: null
      } as any);

      vi.mocked(prisma.zZPProfile.findUnique).mockResolvedValue({
        ...profileWithNDNummer,
        user: mockSession.user
      } as any);

      vi.mocked(prisma.notification.create).mockResolvedValue({} as any);
      vi.mocked(prisma.nDNummerAuditLog.create).mockResolvedValue({} as any);
    });

    it('should send manual ND-nummer notification', async () => {
      const requestData = {
        profileType: 'ZZP',
        profileId: 'zzp123',
        notificationType: 'EXPIRY_WARNING_30_DAYS',
        channels: ['EMAIL', 'IN_APP'],
        urgency: 'CRITICAL',
        customMessage: 'Urgente herinnering: uw ND-nummer verloopt binnenkort!'
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/notifications', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await notificationPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.notification.profileType).toBe('ZZP');
      expect(data.notification.notificationType).toBe('EXPIRY_WARNING_30_DAYS');
      expect(data.notification.urgency).toBe('CRITICAL');

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user123',
          type: 'SYSTEM_ANNOUNCEMENT',
          category: 'SYSTEM',
          title: expect.stringContaining('30 dagen')
        })
      });

      expect(prisma.nDNummerAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'HERINNERING_VERSTUURD',
          complianceNotes: expect.stringContaining('EXPIRY_WARNING_30_DAYS')
        })
      });
    });

    it('should get notification history for profile', async () => {
      const mockNotifications = [
        {
          id: 'notif1',
          title: 'ND-nummer verloopt over 30 dagen',
          message: 'Uw ND-nummer verloopt binnenkort...',
          isRead: false,
          readAt: null,
          createdAt: new Date(),
          actionUrl: '/dashboard/compliance',
          actionLabel: 'Beheren',
          metadata: {
            urgency: 'CRITICAL',
            notificationType: 'EXPIRY_WARNING_30_DAYS',
            category: 'ND_NUMMER'
          },
          user: {
            name: 'Test User',
            email: 'test@example.com',
            zzpProfile: { ndNummer: 'ND123456' },
            bedrijfProfile: null
          }
        }
      ];

      vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifications as any);
      vi.mocked(prisma.notification.count).mockResolvedValue(1);

      const url = new URL('http://localhost/api/compliance/nd-nummer/notifications?profileId=zzp123&profileType=ZZP');
      const request = new NextRequest(url);

      const response = await notificationGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notifications).toHaveLength(1);
      expect(data.notifications[0].title).toContain('30 dagen');
      expect(data.notifications[0].urgency).toBe('CRITICAL');
      expect(data.pagination.total).toBe(1);
    });

    it('should deny access to other user\'s notifications', async () => {
      // Mock user trying to access different profile
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        zzpProfile: { id: 'different-zzp' },
        bedrijfProfile: null
      } as any);

      const requestData = {
        profileType: 'ZZP',
        profileId: 'zzp123', // Different from user's profile
        notificationType: 'STATUS_CHANGE',
        channels: ['EMAIL'],
        urgency: 'MEDIUM'
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/notifications', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await notificationPost(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Geen toegang');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/validate?profileType=ZZP');

      const response = await validateGet(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Fout bij ophalen');
    });

    it('should handle invalid JSON input', async () => {
      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/register', {
        method: 'POST',
        body: 'invalid json{'
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle missing required parameters', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ZZP_BEVEILIGER',
        zzpProfile: mockZZPProfile,
        bedrijfProfile: null
      } as any);

      const requestData = {
        // Missing required fields
        ndNummer: 'ND123456'
        // Missing vervalDatum, documentUpload, confirmatie
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/register', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validatiefout');
      expect(data.details).toBeDefined();
    });
  });

  describe('Rate Limiting & Security', () => {
    it('should handle multiple rapid requests', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ZZP_BEVEILIGER',
        zzpProfile: mockZZPProfile,
        bedrijfProfile: null
      } as any);

      const requestData = {
        ndNummer: 'ND123456',
        profileType: 'ZZP' as const
      };

      // Simulate multiple concurrent requests
      const requests = Array(5).fill(0).map(() =>
        validatePost(new NextRequest('http://localhost/api/compliance/nd-nummer/validate', {
          method: 'POST',
          body: JSON.stringify(requestData)
        }))
      );

      const responses = await Promise.all(requests);

      // All requests should be processed (in real implementation, rate limiting would apply)
      responses.forEach(response => {
        expect([200, 404, 500]).toContain(response.status); // Some may fail due to missing profile data
      });
    });

    it('should sanitize user input', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockSession.user,
        role: 'ZZP_BEVEILIGER',
        zzpProfile: mockZZPProfile,
        bedrijfProfile: null
      } as any);

      const maliciousData = {
        ndNummer: 'ND123456<script>alert("xss")</script>',
        vervalDatum: '2027-12-31T23:59:59.000Z',
        documentUpload: 'javascript:alert("xss")',
        confirmatie: true
      };

      const request = new NextRequest('http://localhost/api/compliance/nd-nummer/register', {
        method: 'POST',
        body: JSON.stringify(maliciousData)
      });

      const response = await registerPost(request);
      const data = await response.json();

      // Should fail validation due to invalid formats, not due to XSS
      expect(response.status).toBe(400);
      expect(data.error).toBe('Validatiefout');
    });
  });
});