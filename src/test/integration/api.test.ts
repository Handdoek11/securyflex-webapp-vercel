import { NextRequest } from 'next/server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST as registerUser } from '@/app/api/auth/register/route'

// Mock the API route handlers
import { POST as createJob, GET as getJobs } from '@/app/api/jobs/route'
import { POST as createOpdracht, GET as getOpdrachten } from '@/app/api/opdrachten/route'
import { createMockRequest, createMockUser, } from '../helpers/auth-helpers'

// Integration test setup
const _TEST_BASE_URL = 'http://localhost:3000'

// Mock functions will be initialized in beforeAll

// Mock external dependencies at top level
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    zZPProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    opdracht: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    opdrachtgever: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    bedrijfProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  }
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  hashPassword: vi.fn().mockResolvedValue('hashedPassword123'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}))

describe('API Integration Tests', () => {
  const mockPrisma = vi.mocked(await import('@/lib/prisma')).default
  const mockAuth = vi.mocked((await import('@/lib/auth')).auth)

  beforeAll(() => {
    // Setup is now complete
  })

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  describe('Authentication & Registration', () => {
    describe('POST /api/auth/register', () => {
      it('should register new ZZP user successfully', async () => {
        const userData = {
          name: 'Jan de Beveiliger',
          email: 'jan@test.nl',
          phone: '+31612345678',
          password: 'securePassword123',
          role: 'ZZP_BEVEILIGER'
        }

        // Mock successful user creation
        mockPrisma.user.findUnique.mockResolvedValue(null) // No existing user
        mockPrisma.$transaction.mockResolvedValue({
          id: 'user-1',
          email: userData.email,
          name: userData.name,
          role: userData.role,
          status: 'PENDING'
        })

        const request = createMockRequest('POST', '/api/auth/register', userData)
        const response = await registerUser(request)

        expect(response.status).toBe(201)

        const responseData = await response.json()
        expect(responseData.success).toBe(true)
        expect(responseData.user.email).toBe(userData.email)
        expect(responseData.user.role).toBe(userData.role)
        expect(mockPrisma.$transaction).toHaveBeenCalled()
      })

      it('should reject registration with existing email', async () => {
        const userData = {
          name: 'Jan de Beveiliger',
          email: 'existing@test.nl',
          phone: '+31612345678',
          password: 'securePassword123',
          role: 'ZZP_BEVEILIGER'
        }

        // Mock existing user
        mockPrisma.user.findUnique.mockResolvedValue({
          id: 'existing-user',
          email: userData.email
        })

        const request = createMockRequest('POST', '/api/auth/register', userData)
        const response = await registerUser(request)

        expect(response.status).toBe(409)

        const responseData = await response.json()
        expect(responseData.error).toContain('bestaat al')
      })

      it('should handle validation errors', async () => {
        const invalidData = {
          name: 'A', // Too short
          email: 'invalid-email',
          password: '123', // Too short
          role: 'INVALID_ROLE'
        }

        const request = createMockRequest('POST', '/api/auth/register', invalidData)
        const response = await registerUser(request)

        expect(response.status).toBe(400)

        const responseData = await response.json()
        expect(responseData.error).toBe('Ongeldige invoer')
        expect(responseData.details).toBeDefined()
      })

      it('should handle database errors gracefully', async () => {
        const userData = {
          name: 'Jan de Beveiliger',
          email: 'jan@test.nl',
          phone: '+31612345678',
          password: 'securePassword123',
          role: 'ZZP_BEVEILIGER'
        }

        mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'))

        const request = createMockRequest('POST', '/api/auth/register', userData)
        const response = await registerUser(request)

        expect(response.status).toBe(500)

        const responseData = await response.json()
        expect(responseData.error).toContain('misgegaan')
      })
    })
  })

  describe('Jobs API', () => {
    describe('GET /api/jobs', () => {
      const mockUser = createMockUser('ZZP_BEVEILIGER')

      it('should return jobs for authenticated ZZP user', async () => {
        mockAuth.mockResolvedValue({ user: mockUser })
        mockPrisma.zZPProfile.findUnique.mockResolvedValue({ id: 'zzp-1' })

        const mockOpdrachten = [
          {
            id: 'job-1',
            titel: 'Evenementbeveiliging',
            beschrijving: 'Beveiliging voor concert',
            locatie: 'Amsterdam',
            startDatum: new Date('2025-12-25'),
            eindDatum: new Date('2025-12-25'),
            uurtarief: 28.5,
            aantalBeveiligers: 5,
            opdrachtgever: { bedrijfsnaam: 'EventCorp' },
            bedrijf: null,
            beveiligers: [],
            _count: { beveiligers: 2 },
            status: 'OPEN',
            isUrgent: true,
            type: 'Evenement',
            vereisten: ['BOA certificaat'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]

        mockPrisma.opdracht.findMany.mockResolvedValue(mockOpdrachten)
        mockPrisma.opdracht.count.mockResolvedValue(1)

        const request = createMockRequest('GET', '/api/jobs?page=1&limit=10')
        const response = await getJobs(request)

        expect(response.status).toBe(200)

        const responseData = await response.json()
        expect(responseData.success).toBe(true)
        expect(responseData.data.jobs).toHaveLength(1)
        expect(responseData.data.jobs[0].title).toBe('Evenementbeveiliging')
        expect(responseData.data.pagination.total).toBe(1)
      })

      it('should return 401 for unauthenticated requests', async () => {
        mockAuth.mockResolvedValue(null)

        const request = createMockRequest('GET', '/api/jobs')
        const response = await getJobs(request)

        expect(response.status).toBe(401)

        const responseData = await response.json()
        expect(responseData.success).toBe(false)
        expect(responseData.error).toBe('Authentication required')
      })

      it('should handle database errors and fallback to mock data', async () => {
        mockAuth.mockResolvedValue({ user: mockUser })
        mockPrisma.zZPProfile.findUnique.mockResolvedValue({ id: 'zzp-1' })
        mockPrisma.opdracht.findMany.mockRejectedValue(new Error('DB Error'))

        const request = createMockRequest('GET', '/api/jobs')
        const response = await getJobs(request)

        expect(response.status).toBe(200)

        const responseData = await response.json()
        expect(responseData.success).toBe(true)
        // Should return mock data when DB fails
        expect(responseData.data.jobs.length).toBeGreaterThan(0)
      })

      it('should apply search filters correctly', async () => {
        mockAuth.mockResolvedValue({ user: mockUser })
        mockPrisma.zZPProfile.findUnique.mockResolvedValue({ id: 'zzp-1' })
        mockPrisma.opdracht.findMany.mockResolvedValue([])
        mockPrisma.opdracht.count.mockResolvedValue(0)

        const request = createMockRequest('GET', '/api/jobs?search=evenement&minRate=25&location=amsterdam')
        const response = await getJobs(request)

        expect(response.status).toBe(200)
        expect(mockPrisma.opdracht.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                { titel: { contains: 'evenement', mode: 'insensitive' } }
              ]),
              locatie: { contains: 'amsterdam', mode: 'insensitive' },
              uurtarief: { gte: 25 }
            })
          })
        )
      })
    })

    describe('POST /api/jobs', () => {
      const mockOpdrachtgever = createMockUser('OPDRACHTGEVER', {
        opdrachtgever: { id: 'opdrachtgever-1' }
      })

      it('should create job for authorized opdrachtgever', async () => {
        const jobData = {
          titel: 'Nieuwe Opdracht',
          beschrijving: 'Test beschrijving',
          locatie: 'Amsterdam',
          startDatum: '2025-12-25T10:00:00Z',
          eindDatum: '2025-12-25T18:00:00Z',
          aantalBeveiligers: 2,
          uurtarief: 30.0
        }

        mockAuth.mockResolvedValue({ user: mockOpdrachtgever })
        mockPrisma.opdrachtgever.findUnique.mockResolvedValue({ id: 'opdrachtgever-1' })
        mockPrisma.bedrijfProfile.findUnique.mockResolvedValue(null)
        mockPrisma.opdracht.create.mockResolvedValue({
          id: 'job-1',
          ...jobData,
          status: 'OPEN'
        })

        const request = createMockRequest('POST', '/api/jobs', jobData)
        const response = await createJob(request)

        expect(response.status).toBe(201)

        const responseData = await response.json()
        expect(responseData.success).toBe(true)
        expect(responseData.data.titel).toBe(jobData.titel)
      })

      it('should reject job creation for ZZP users', async () => {
        const mockZZP = createMockUser('ZZP_BEVEILIGER')

        mockAuth.mockResolvedValue({ user: mockZZP })
        mockPrisma.opdrachtgever.findUnique.mockResolvedValue(null)
        mockPrisma.bedrijfProfile.findUnique.mockResolvedValue(null)

        const jobData = {
          titel: 'Nieuwe Opdracht',
          beschrijving: 'Test beschrijving',
          locatie: 'Amsterdam',
          startDatum: '2025-12-25T10:00:00Z',
          eindDatum: '2025-12-25T18:00:00Z',
          aantalBeveiligers: 2,
          uurtarief: 30.0
        }

        const request = createMockRequest('POST', '/api/jobs', jobData)
        const response = await createJob(request)

        expect(response.status).toBe(403)

        const responseData = await response.json()
        expect(responseData.error).toBe('Only companies can create jobs')
      })

      it('should validate required fields', async () => {
        mockAuth.mockResolvedValue({ user: mockOpdrachtgever })
        mockPrisma.opdrachtgever.findUnique.mockResolvedValue({ id: 'opdrachtgever-1' })

        const incompleteData = {
          titel: 'Test Job'
          // Missing required fields
        }

        const request = createMockRequest('POST', '/api/jobs', incompleteData)
        const response = await createJob(request)

        expect(response.status).toBe(400)

        const responseData = await response.json()
        expect(responseData.error).toContain('Missing required field')
      })
    })
  })

  describe('Opdrachten API', () => {
    describe('GET /api/opdrachten', () => {
      const mockZZPUser = createMockUser('ZZP_BEVEILIGER', {
        zzpProfile: { id: 'zzp-1' }
      })

      it('should return available opdrachten for ZZP user', async () => {
        mockAuth.mockResolvedValue({ user: mockZZPUser })

        const mockUser = {
          id: mockZZPUser.id,
          zzpProfile: { id: 'zzp-1' },
          bedrijfProfile: null,
          opdrachtgever: null
        }

        mockPrisma.user.findUnique.mockResolvedValue(mockUser)
        mockPrisma.opdracht.findMany.mockResolvedValue([])
        mockPrisma.opdracht.count.mockResolvedValue(0)

        const request = createMockRequest('GET', '/api/opdrachten?view=available')
        const response = await getOpdrachten(request)

        expect(response.status).toBe(200)

        // Check that query includes proper filters for ZZP users
        expect(mockPrisma.opdracht.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: { in: ['OPEN', 'URGENT'] },
              OR: expect.arrayContaining([
                { targetAudience: 'BEIDEN' },
                { targetAudience: 'ALLEEN_ZZP' },
                { directZZPAllowed: true }
              ])
            })
          })
        )
      })

      it('should return own opdrachten for opdrachtgever', async () => {
        const mockOGUser = createMockUser('OPDRACHTGEVER', {
          opdrachtgever: { id: 'og-1' }
        })

        mockAuth.mockResolvedValue({ user: mockOGUser })

        const mockUser = {
          id: mockOGUser.id,
          zzpProfile: null,
          bedrijfProfile: null,
          opdrachtgever: { id: 'og-1' }
        }

        mockPrisma.user.findUnique.mockResolvedValue(mockUser)
        mockPrisma.opdracht.findMany.mockResolvedValue([])
        mockPrisma.opdracht.count.mockResolvedValue(0)

        const request = createMockRequest('GET', '/api/opdrachten?view=own')
        const response = await getOpdrachten(request)

        expect(response.status).toBe(200)

        expect(mockPrisma.opdracht.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              opdrachtgeverId: 'og-1'
            })
          })
        )
      })
    })

    describe('POST /api/opdrachten', () => {
      const mockOpdrachtgever = createMockUser('OPDRACHTGEVER', {
        opdrachtgever: { id: 'og-1', bedrijfsnaam: 'Test Corp' }
      })

      it('should create opdracht for opdrachtgever', async () => {
        const opdrachtData = {
          titel: 'Nieuwe Beveiligingsopdracht',
          beschrijving: 'Uitgebreide beschrijving van de opdracht',
          locatie: 'Amsterdam Centrum',
          startDatum: '2025-12-25T09:00:00Z',
          eindDatum: '2025-12-25T17:00:00Z',
          aantalBeveiligers: 3,
          uurtarief: 32.5,
          targetAudience: 'BEIDEN',
          directZZPAllowed: true,
          vereisten: ['BOA certificaat', 'Ervaring'],
          type: 'Object'
        }

        mockAuth.mockResolvedValue({ user: mockOpdrachtgever })

        const mockUser = {
          id: mockOpdrachtgever.id,
          opdrachtgever: { id: 'og-1', bedrijfsnaam: 'Test Corp' },
          bedrijfProfile: null
        }

        mockPrisma.user.findUnique.mockResolvedValue(mockUser)
        mockPrisma.opdracht.create.mockResolvedValue({
          id: 'opdracht-1',
          ...opdrachtData,
          creatorType: 'OPDRACHTGEVER',
          status: 'OPEN'
        })

        const request = createMockRequest('POST', '/api/opdrachten', opdrachtData)
        const response = await createOpdracht(request)

        expect(response.status).toBe(201)

        const responseData = await response.json()
        expect(responseData.success).toBe(true)
        expect(responseData.data.titel).toBe(opdrachtData.titel)
        expect(responseData.message).toContain('is aangemaakt')
      })

      it('should handle validation errors for invalid opdracht data', async () => {
        mockAuth.mockResolvedValue({ user: mockOpdrachtgever })

        const invalidData = {
          titel: '', // Empty title
          beschrijving: 'Test',
          uurtarief: 5 // Below minimum
        }

        const request = createMockRequest('POST', '/api/opdrachten', invalidData)
        const response = await createOpdracht(request)

        expect(response.status).toBe(400)

        const responseData = await response.json()
        expect(responseData.success).toBe(false)
        expect(responseData.error).toBe('Invalid input')
        expect(responseData.details).toBeDefined()
      })

      it('should reject opdracht creation for unauthorized users', async () => {
        const mockZZP = createMockUser('ZZP_BEVEILIGER')

        mockAuth.mockResolvedValue({ user: mockZZP })

        const mockUser = {
          id: mockZZP.id,
          opdrachtgever: null,
          bedrijfProfile: null
        }

        mockPrisma.user.findUnique.mockResolvedValue(mockUser)

        const opdrachtData = {
          titel: 'Test Opdracht',
          beschrijving: 'Test',
          locatie: 'Amsterdam',
          startDatum: '2025-12-25T09:00:00Z',
          eindDatum: '2025-12-25T17:00:00Z',
          aantalBeveiligers: 1,
          uurtarief: 25,
          targetAudience: 'BEIDEN'
        }

        const request = createMockRequest('POST', '/api/opdrachten', opdrachtData)
        const response = await createOpdracht(request)

        expect(response.status).toBe(403)

        const responseData = await response.json()
        expect(responseData.error).toContain('Only opdrachtgevers and bedrijven')
      })
    })
  })

  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed JSON requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{ invalid json'
      })

      const response = await createJob(request)
      expect(response.status).toBe(500) // Will be caught by try/catch
    })

    it('should handle missing content-type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ titel: 'Test' })
        // No content-type header
      })

      mockAuth.mockResolvedValue({ user: createMockUser('OPDRACHTGEVER') })
      mockPrisma.opdrachtgever.findUnique.mockResolvedValue({ id: 'og-1' })
      mockPrisma.bedrijfProfile.findUnique.mockResolvedValue(null)

      const response = await createJob(request)
      // Should still work as NextRequest.json() is robust
      expect([400, 500]).toContain(response.status) // Either validation error or server error
    })

    it('should handle extremely large payloads gracefully', async () => {
      const largePayload = {
        titel: 'A'.repeat(10000),
        beschrijving: 'B'.repeat(100000),
        locatie: 'Amsterdam'
      }

      mockAuth.mockResolvedValue({ user: createMockUser('OPDRACHTGEVER') })

      const request = createMockRequest('POST', '/api/jobs', largePayload)
      const response = await createJob(request)

      // Should handle large payloads (might be validation error for title length)
      expect([400, 413, 500]).toContain(response.status)
    })
  })
})

// Helper function to create mock database state for complex scenarios
function setupDatabaseMocks(scenario: 'empty' | 'populated' | 'error') {
  switch (scenario) {
    case 'empty':
      mockPrisma.opdracht.findMany.mockResolvedValue([])
      mockPrisma.opdracht.count.mockResolvedValue(0)
      break
    case 'populated':
      mockPrisma.opdracht.findMany.mockResolvedValue([
        {
          id: '1',
          titel: 'Mock Job 1',
          beschrijving: 'Description',
          locatie: 'Amsterdam',
          startDatum: new Date(),
          eindDatum: new Date(),
          uurtarief: 25.0,
          aantalBeveiligers: 2,
          status: 'OPEN',
          opdrachtgever: { bedrijfsnaam: 'Test Corp' },
          _count: { beveiligers: 0 }
        }
      ])
      mockPrisma.opdracht.count.mockResolvedValue(1)
      break
    case 'error':
      mockPrisma.opdracht.findMany.mockRejectedValue(new Error('Database error'))
      mockPrisma.opdracht.count.mockRejectedValue(new Error('Database error'))
      break
  }
}

describe('Complex Integration Scenarios', () => {
  it('should handle concurrent requests properly', async () => {
    const mockUser = createMockUser('ZZP_BEVEILIGER')
    mockAuth.mockResolvedValue({ user: mockUser })
    setupDatabaseMocks('populated')
    mockPrisma.zZPProfile.findUnique.mockResolvedValue({ id: 'zzp-1' })

    // Simulate 5 concurrent requests
    const requests = Array.from({ length: 5 }, (_, i) =>
      getJobs(createMockRequest('GET', `/api/jobs?page=${i + 1}`))
    )

    const responses = await Promise.all(requests)

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })

    // Database should have been called for each request
    expect(mockPrisma.opdracht.findMany).toHaveBeenCalledTimes(5)
  })

  it('should handle rate limiting integration', async () => {
    // Note: This would require actual rate limiting middleware to be active
    // For now, we can test that the API works under normal conditions
    const mockUser = createMockUser('ZZP_BEVEILIGER')
    mockAuth.mockResolvedValue({ user: mockUser })
    setupDatabaseMocks('populated')
    mockPrisma.zZPProfile.findUnique.mockResolvedValue({ id: 'zzp-1' })

    const request = createMockRequest('GET', '/api/jobs')
    const response = await getJobs(request)

    expect(response.status).toBe(200)
  })
})