import { test, expect, type APIRequestContext } from '@playwright/test'

/**
 * E2E API Integration Tests
 *
 * Tests API endpoints in realistic scenarios with actual data flow
 * Validates authentication, permissions, and data consistency
 */

test.describe('API Integration Tests', () => {
  let apiContext: APIRequestContext
  let authToken: string
  let testUserId: string

  // Test data
  const testUser = {
    email: `api-test-${Date.now()}@example.com`,
    password: 'ApiTest123!',
    role: 'ZZP_BEVEILIGER'
  }

  test.beforeAll(async ({ playwright }) => {
    // Create API context
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:3000'
    })
  })

  test.afterAll(async () => {
    await apiContext.dispose()
  })

  test.describe('Authentication Flow', () => {
    test('should register new ZZP user via API', async () => {
      const response = await apiContext.post('/api/auth/register', {
        data: {
          email: testUser.email,
          password: testUser.password,
          confirmPassword: testUser.password
        }
      })

      expect(response.status()).toBe(201)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(testUser.email)

      testUserId = data.user.id
    })

    test('should login and receive auth token', async () => {
      const response = await apiContext.post('/api/auth/login', {
        data: {
          email: testUser.email,
          password: testUser.password
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.token).toBeDefined()

      authToken = data.token
    })

    test('should create ZZP profile', async () => {
      const response = await apiContext.post('/api/profile/zzp', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          firstName: 'Test',
          lastName: 'User',
          phone: '0612345678',
          kvkNumber: '87654321',
          city: 'Amsterdam',
          experience: 'ERVAREN',
          availability: ['MAANDAG', 'DINSDAG', 'WOENSDAG']
        }
      })

      expect(response.status()).toBe(201)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.profile).toBeDefined()
      expect(data.profile.firstName).toBe('Test')
    })

    test('should reject invalid credentials', async () => {
      const response = await apiContext.post('/api/auth/login', {
        data: {
          email: testUser.email,
          password: 'WrongPassword123!'
        }
      })

      expect(response.status()).toBe(401)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid credentials')
    })
  })

  test.describe('Job Management API', () => {
    let testJobId: string

    test('should fetch available jobs for ZZP', async () => {
      const response = await apiContext.get('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.jobs)).toBe(true)

      // Store first job ID for application test
      if (data.jobs.length > 0) {
        testJobId = data.jobs[0].id
      }
    })

    test('should filter jobs by location', async () => {
      const response = await apiContext.get('/api/jobs?location=Amsterdam', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)

      // All jobs should be in Amsterdam
      data.jobs.forEach((job: any) => {
        expect(job.location.toLowerCase()).toContain('amsterdam')
      })
    })

    test('should get job details', async () => {
      if (!testJobId) {
        test.skip()
        return
      }

      const response = await apiContext.get(`/api/jobs/${testJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.job).toBeDefined()
      expect(data.job.id).toBe(testJobId)
      expect(data.job.title).toBeDefined()
      expect(data.job.description).toBeDefined()
    })

    test('should apply for job', async () => {
      if (!testJobId) {
        test.skip()
        return
      }

      const response = await apiContext.post(`/api/jobs/${testJobId}/apply`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          motivation: 'Ik ben zeer geïnteresseerd in deze beveiligingsopdracht en heb ruime ervaring.',
          availability: 'Direct beschikbaar'
        }
      })

      expect(response.status()).toBe(201)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.application).toBeDefined()
      expect(data.application.jobId).toBe(testJobId)
      expect(data.application.status).toBe('PENDING')
    })

    test('should prevent duplicate applications', async () => {
      if (!testJobId) {
        test.skip()
        return
      }

      // Try to apply again
      const response = await apiContext.post(`/api/jobs/${testJobId}/apply`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          motivation: 'Another application attempt'
        }
      })

      expect(response.status()).toBe(409)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('already applied')
    })
  })

  test.describe('Application Management API', () => {
    test('should fetch user applications', async () => {
      const response = await apiContext.get('/api/applications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.applications)).toBe(true)
      expect(data.applications.length).toBeGreaterThan(0)

      // Check application structure
      const application = data.applications[0]
      expect(application.id).toBeDefined()
      expect(application.jobId).toBeDefined()
      expect(application.status).toBeDefined()
      expect(application.motivation).toBeDefined()
      expect(application.createdAt).toBeDefined()
    })

    test('should get application details', async () => {
      // First get applications list
      const listResponse = await apiContext.get('/api/applications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const listData = await listResponse.json()
      const applicationId = listData.applications[0].id

      // Get specific application
      const response = await apiContext.get(`/api/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.application).toBeDefined()
      expect(data.application.id).toBe(applicationId)
    })
  })

  test.describe('Work Hours API', () => {
    let shiftId: string

    test('should start work shift', async () => {
      const response = await apiContext.post('/api/shifts/start', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          jobId: testJobId || 'mock-job-id',
          location: {
            latitude: 52.3676,
            longitude: 4.9041
          },
          notes: 'Starting evening shift'
        }
      })

      expect(response.status()).toBe(201)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.shift).toBeDefined()
      expect(data.shift.status).toBe('ACTIVE')
      expect(data.shift.startTime).toBeDefined()

      shiftId = data.shift.id
    })

    test('should get active shift', async () => {
      const response = await apiContext.get('/api/shifts/active', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.shift).toBeDefined()
      expect(data.shift.id).toBe(shiftId)
      expect(data.shift.status).toBe('ACTIVE')
    })

    test('should end work shift', async () => {
      const response = await apiContext.post(`/api/shifts/${shiftId}/end`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          location: {
            latitude: 52.3676,
            longitude: 4.9041
          },
          notes: 'Shift completed successfully'
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.shift.status).toBe('COMPLETED')
      expect(data.shift.endTime).toBeDefined()
      expect(data.shift.totalHours).toBeGreaterThan(0)
    })

    test('should get work hours history', async () => {
      const response = await apiContext.get('/api/shifts', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.shifts)).toBe(true)
      expect(data.shifts.length).toBeGreaterThan(0)

      // Check shift structure
      const shift = data.shifts[0]
      expect(shift.startTime).toBeDefined()
      expect(shift.endTime).toBeDefined()
      expect(shift.totalHours).toBeDefined()
      expect(shift.status).toBe('COMPLETED')
    })
  })

  test.describe('Payment API', () => {
    test('should fetch payment overview', async () => {
      const response = await apiContext.get('/api/payments', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.payments).toBeDefined()
      expect(data.summary).toBeDefined()
      expect(data.summary.totalEarnings).toBeDefined()
      expect(data.summary.pendingAmount).toBeDefined()
    })

    test('should request payment for completed hours', async () => {
      const response = await apiContext.post('/api/payments/request', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          shiftIds: [shiftId],
          description: 'Payment request for completed security work',
          amount: 150.00
        }
      })

      expect(response.status()).toBe(201)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.paymentRequest).toBeDefined()
      expect(data.paymentRequest.status).toBe('PENDING')
      expect(data.paymentRequest.amount).toBe(150.00)
    })
  })

  test.describe('Profile API', () => {
    test('should fetch ZZP profile', async () => {
      const response = await apiContext.get('/api/profile/zzp', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.profile).toBeDefined()
      expect(data.profile.firstName).toBe('Test')
      expect(data.profile.lastName).toBe('User')
    })

    test('should update ZZP profile', async () => {
      const response = await apiContext.patch('/api/profile/zzp', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          phone: '0687654321',
          city: 'Utrecht',
          bio: 'Experienced security professional with 5+ years in the field.'
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.profile.phone).toBe('0687654321')
      expect(data.profile.city).toBe('Utrecht')
      expect(data.profile.bio).toContain('Experienced security professional')
    })

    test('should validate profile data', async () => {
      const response = await apiContext.patch('/api/profile/zzp', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          phone: 'invalid-phone',
          kvkNumber: '123' // Too short
        }
      })

      expect(response.status()).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.errors).toBeDefined()
      expect(data.errors.phone).toBeDefined()
      expect(data.errors.kvkNumber).toBeDefined()
    })
  })

  test.describe('Real-time API', () => {
    test('should connect to real-time updates', async () => {
      // This would test WebSocket/Server-Sent Events
      // For now, we'll test the REST endpoint that triggers real-time updates

      const response = await apiContext.post('/api/realtime/subscribe', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          channels: ['user_notifications', 'job_updates']
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.subscribed).toBe(true)
    })

    test('should receive broadcast events', async () => {
      // Simulate a broadcast event
      const response = await apiContext.post('/api/realtime/broadcast', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          channel: 'user_notifications',
          event: 'application_status_changed',
          payload: {
            applicationId: 'test-app-123',
            status: 'ACCEPTED',
            message: 'Your application has been accepted!'
          }
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.broadcasted).toBe(true)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle missing authorization', async () => {
      const response = await apiContext.get('/api/jobs')

      expect(response.status()).toBe(401)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Unauthorized')
    })

    test('should handle invalid job ID', async () => {
      const response = await apiContext.get('/api/jobs/invalid-job-id', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(404)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Job not found')
    })

    test('should handle malformed request data', async () => {
      const response = await apiContext.post('/api/jobs/test-job/apply', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          // Missing required fields
          invalidField: 'invalid'
        }
      })

      expect(response.status()).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.errors).toBeDefined()
    })

    test('should handle rate limiting', async () => {
      // Make many requests quickly to trigger rate limit
      const requests = Array.from({ length: 20 }, () =>
        apiContext.get('/api/jobs', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
      )

      const responses = await Promise.all(requests)

      // At least some should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)

      // Check rate limit headers
      const rateLimitedResponse = rateLimitedResponses[0]
      const headers = rateLimitedResponse.headers()
      expect(headers['x-ratelimit-remaining']).toBeDefined()
      expect(headers['x-ratelimit-reset']).toBeDefined()
    })
  })

  test.describe('Data Consistency', () => {
    test('should maintain data consistency across operations', async () => {
      // Create application
      const jobResponse = await apiContext.get('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const jobs = await jobResponse.json()
      const jobId = jobs.jobs[0]?.id

      if (jobId) {
        const applyResponse = await apiContext.post(`/api/jobs/${jobId}/apply`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          data: {
            motivation: 'Test application for consistency check'
          }
        })

        const applyData = await applyResponse.json()
        const applicationId = applyData.application.id

        // Fetch application from different endpoint
        const fetchResponse = await apiContext.get(`/api/applications/${applicationId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const fetchData = await fetchResponse.json()

        // Data should be consistent
        expect(fetchData.application.id).toBe(applicationId)
        expect(fetchData.application.jobId).toBe(jobId)
        expect(fetchData.application.motivation).toBe('Test application for consistency check')
      }
    })

    test('should handle concurrent operations safely', async () => {
      // Start multiple shifts simultaneously (should only allow one)
      const shiftRequests = Array.from({ length: 3 }, () =>
        apiContext.post('/api/shifts/start', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          data: {
            jobId: 'concurrent-test-job',
            location: {
              latitude: 52.3676,
              longitude: 4.9041
            }
          }
        })
      )

      const responses = await Promise.all(shiftRequests)

      // Only one should succeed
      const successfulResponses = responses.filter(r => r.status() === 201)
      const failedResponses = responses.filter(r => r.status() !== 201)

      expect(successfulResponses.length).toBe(1)
      expect(failedResponses.length).toBe(2)
    })
  })

  test.describe('Performance', () => {
    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now()

      const response = await apiContext.get('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const responseTime = Date.now() - startTime

      expect(response.status()).toBe(200)
      expect(responseTime).toBeLessThan(2000) // 2 seconds max
    })

    test('should handle paginated results correctly', async () => {
      const response = await apiContext.get('/api/jobs?page=1&limit=5', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.jobs.length).toBeLessThanOrEqual(5)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(5)
      expect(data.pagination.total).toBeDefined()
    })
  })
})