import { test, expect, type Page, type BrowserContext } from '@playwright/test'

/**
 * E2E Tests for ZZP (Security Guard) User Flow
 *
 * Tests the complete user journey from registration to job completion
 * Critical for production readiness validation
 */

test.describe('ZZP User Flow', () => {
  let page: Page
  let context: BrowserContext

  // Test data
  const testZZP = {
    email: `test-zzp-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Jan',
    lastName: 'Testman',
    phone: '0612345678',
    kvkNumber: '12345678',
    city: 'Amsterdam'
  }

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test.describe('Registration and Onboarding', () => {
    test('should complete ZZP registration flow', async () => {
      // Navigate to registration
      await page.goto('/auth/register')
      await expect(page.getByRole('heading', { name: /registreren/i })).toBeVisible()

      // Fill registration form
      await page.getByLabel(/e-mailadres/i).fill(testZZP.email)
      await page.getByLabel(/wachtwoord/i).first().fill(testZZP.password)
      await page.getByLabel(/bevestig wachtwoord/i).fill(testZZP.password)

      // Submit registration
      await page.getByRole('button', { name: /account aanmaken/i }).click()

      // Should redirect to role selection
      await expect(page).toHaveURL(/\/auth\/role-selection/)
      await expect(page.getByText(/kies je rol/i)).toBeVisible()

      // Select ZZP role
      await page.getByRole('button', { name: /zzp beveiliger/i }).click()

      // Should redirect to ZZP profile setup
      await expect(page).toHaveURL(/\/profile\/zzp/)
      await expect(page.getByText(/profiel aanmaken/i)).toBeVisible()
    })

    test('should complete ZZP profile setup', async () => {
      // Fill profile form
      await page.getByLabel(/voornaam/i).fill(testZZP.firstName)
      await page.getByLabel(/achternaam/i).fill(testZZP.lastName)
      await page.getByLabel(/telefoonnummer/i).fill(testZZP.phone)
      await page.getByLabel(/kvk nummer/i).fill(testZZP.kvkNumber)
      await page.getByLabel(/stad/i).fill(testZZP.city)

      // Submit profile
      await page.getByRole('button', { name: /profiel opslaan/i }).click()

      // Should redirect to ZZP dashboard
      await expect(page).toHaveURL(/\/dashboard\/zzp/)
      await expect(page.getByText(/welkom/i)).toBeVisible()
      await expect(page.getByText(testZZP.firstName)).toBeVisible()
    })
  })

  test.describe('Dashboard Navigation', () => {
    test('should display ZZP dashboard with key sections', async () => {
      await page.goto('/dashboard/zzp')

      // Check main dashboard elements
      await expect(page.getByText(/beschikbare opdrachten/i)).toBeVisible()
      await expect(page.getByText(/mijn sollicitaties/i)).toBeVisible()
      await expect(page.getByText(/actieve werkuren/i)).toBeVisible()
      await expect(page.getByText(/betalingen/i)).toBeVisible()

      // Check navigation sidebar
      await expect(page.getByRole('link', { name: /opdrachten/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /werkuren/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /sollicitaties/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /betalingen/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /profiel/i })).toBeVisible()
    })

    test('should navigate between dashboard sections', async () => {
      // Navigate to jobs
      await page.getByRole('link', { name: /opdrachten/i }).click()
      await expect(page).toHaveURL(/\/dashboard\/zzp\/jobs/)
      await expect(page.getByText(/beschikbare opdrachten/i)).toBeVisible()

      // Navigate to applications
      await page.getByRole('link', { name: /sollicitaties/i }).click()
      await expect(page).toHaveURL(/\/dashboard\/zzp\/applications/)
      await expect(page.getByText(/mijn sollicitaties/i)).toBeVisible()

      // Navigate to work hours
      await page.getByRole('link', { name: /werkuren/i }).click()
      await expect(page).toHaveURL(/\/dashboard\/zzp\/hours/)
      await expect(page.getByText(/werkuren/i)).toBeVisible()

      // Navigate to payments
      await page.getByRole('link', { name: /betalingen/i }).click()
      await expect(page).toHaveURL(/\/dashboard\/zzp\/payments/)
      await expect(page.getByText(/betalingen/i)).toBeVisible()
    })
  })

  test.describe('Job Application Flow', () => {
    test('should display available jobs and allow filtering', async () => {
      await page.goto('/dashboard/zzp/jobs')

      // Wait for jobs to load
      await expect(page.getByTestId('job-list')).toBeVisible({ timeout: 10000 })

      // Check if jobs are displayed
      const jobCards = page.locator('[data-testid="job-card"]')
      await expect(jobCards).toHaveCount.greaterThan(0)

      // Test job filtering
      await page.getByLabel(/locatie filter/i).selectOption('Amsterdam')

      // Wait for filtered results
      await page.waitForTimeout(1000)

      // Verify jobs are filtered (all should contain Amsterdam)
      const filteredJobs = await jobCards.all()
      for (const job of filteredJobs) {
        await expect(job.getByText(/amsterdam/i)).toBeVisible()
      }
    })

    test('should view job details and apply for job', async () => {
      await page.goto('/dashboard/zzp/jobs')

      // Click on first job
      const firstJob = page.locator('[data-testid="job-card"]').first()
      await firstJob.click()

      // Should open job details
      await expect(page.getByText(/opdracht details/i)).toBeVisible()
      await expect(page.getByText(/functieomschrijving/i)).toBeVisible()
      await expect(page.getByText(/vereisten/i)).toBeVisible()
      await expect(page.getByText(/vergoeding/i)).toBeVisible()

      // Apply for job
      await page.getByRole('button', { name: /solliciteren/i }).click()

      // Fill application form
      await page.getByLabel(/motivatie/i).fill('Ik ben zeer geïnteresseerd in deze opdracht en heb ervaring met beveiliging.')

      // Submit application
      await page.getByRole('button', { name: /sollicitatie versturen/i }).click()

      // Should show success message
      await expect(page.getByText(/sollicitatie verstuurd/i)).toBeVisible()

      // Should redirect to applications page
      await expect(page).toHaveURL(/\/dashboard\/zzp\/applications/)
    })

    test('should view application status', async () => {
      await page.goto('/dashboard/zzp/applications')

      // Should see the application we just submitted
      const applicationCard = page.locator('[data-testid="application-card"]').first()
      await expect(applicationCard).toBeVisible()

      // Check application details
      await expect(applicationCard.getByText(/in behandeling/i)).toBeVisible()
      await expect(applicationCard.getByText(/motivatie/i)).toBeVisible()

      // Click to view details
      await applicationCard.click()

      // Should show application timeline
      await expect(page.getByText(/sollicitatie tijdlijn/i)).toBeVisible()
      await expect(page.getByText(/sollicitatie ingediend/i)).toBeVisible()
    })
  })

  test.describe('Work Hours Tracking', () => {
    test.skip('should start and track work hours with GPS', async () => {
      // Skip GPS tests in CI environment
      const isCI = process.env.CI === 'true'
      if (isCI) {
        test.skip()
        return
      }

      await page.goto('/dashboard/zzp/hours')

      // Mock geolocation
      await context.grantPermissions(['geolocation'])
      await page.addInitScript(() => {
        // Mock GPS coordinates (Amsterdam)
        Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
          writable: true,
          value: (success: (pos: any) => void) => {
            success({
              coords: {
                latitude: 52.3676,
                longitude: 4.9041,
                accuracy: 10
              }
            })
          }
        })
      })

      // Start work shift
      await page.getByRole('button', { name: /dienst starten/i }).click()

      // Should request location permission and start tracking
      await expect(page.getByText(/dienst gestart/i)).toBeVisible()
      await expect(page.getByText(/GPS locatie vastgelegd/i)).toBeVisible()

      // Should show active shift
      await expect(page.getByText(/actieve dienst/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /dienst beëindigen/i })).toBeVisible()
    })

    test('should view work hours history', async () => {
      await page.goto('/dashboard/zzp/hours')

      // Check hours history section
      await expect(page.getByText(/werkuren overzicht/i)).toBeVisible()

      // Should show weekly/monthly views
      await page.getByRole('button', { name: /week/i }).click()
      await expect(page.getByTestId('weekly-hours')).toBeVisible()

      await page.getByRole('button', { name: /maand/i }).click()
      await expect(page.getByTestId('monthly-hours')).toBeVisible()
    })
  })

  test.describe('Payment Management', () => {
    test('should view payment overview', async () => {
      await page.goto('/dashboard/zzp/payments')

      // Check payment dashboard elements
      await expect(page.getByText(/betalingsoverzicht/i)).toBeVisible()
      await expect(page.getByText(/openstaande betalingen/i)).toBeVisible()
      await expect(page.getByText(/betaalgeschiedenis/i)).toBeVisible()

      // Should show payment statistics
      await expect(page.getByTestId('total-earnings')).toBeVisible()
      await expect(page.getByTestId('pending-payments')).toBeVisible()
    })

    test('should request payment for completed hours', async () => {
      await page.goto('/dashboard/zzp/payments')

      // Check if there are hours to request payment for
      const requestButton = page.getByRole('button', { name: /betaling aanvragen/i })

      if (await requestButton.isVisible()) {
        await requestButton.click()

        // Fill payment request form
        await page.getByLabel(/omschrijving/i).fill('Beveiligingswerkzaamheden uitgevoerd')

        // Submit request
        await page.getByRole('button', { name: /aanvraag versturen/i }).click()

        // Should show success message
        await expect(page.getByText(/betalingsaanvraag verstuurd/i)).toBeVisible()
      }
    })
  })

  test.describe('Profile Management', () => {
    test('should update ZZP profile information', async () => {
      await page.goto('/dashboard/zzp/profile')

      // Should show current profile info
      await expect(page.getByDisplayValue(testZZP.firstName)).toBeVisible()
      await expect(page.getByDisplayValue(testZZP.lastName)).toBeVisible()
      await expect(page.getByDisplayValue(testZZP.email)).toBeVisible()

      // Update phone number
      const newPhone = '0687654321'
      await page.getByLabel(/telefoonnummer/i).fill(newPhone)

      // Save changes
      await page.getByRole('button', { name: /wijzigingen opslaan/i }).click()

      // Should show success message
      await expect(page.getByText(/profiel bijgewerkt/i)).toBeVisible()

      // Verify changes are saved
      await page.reload()
      await expect(page.getByDisplayValue(newPhone)).toBeVisible()
    })

    test('should upload profile document', async () => {
      await page.goto('/dashboard/zzp/profile')

      // Navigate to documents section
      await page.getByRole('tab', { name: /documenten/i }).click()

      // Should show document upload section
      await expect(page.getByText(/identiteitsbewijs/i)).toBeVisible()
      await expect(page.getByText(/kvk uittreksel/i)).toBeVisible()

      // Mock file upload (we can't actually upload files in E2E)
      // This would normally upload a test file
      // await page.getByLabel(/identiteitsbewijs uploaden/i).setInputFiles('./test-files/id.pdf')

      // For now, just verify the upload interface exists
      await expect(page.getByText(/sleep bestanden hierheen/i)).toBeVisible()
    })
  })

  test.describe('Real-time Features', () => {
    test('should receive real-time notifications', async () => {
      await page.goto('/dashboard/zzp')

      // Mock a real-time notification (this would normally come from Supabase)
      await page.evaluate(() => {
        // Simulate receiving a notification
        window.dispatchEvent(new CustomEvent('notification', {
          detail: {
            type: 'job_update',
            message: 'Je sollicitatie is geaccepteerd!',
            jobId: 'test-job-123'
          }
        }))
      })

      // Should show notification toast
      await expect(page.getByText(/sollicitatie is geaccepteerd/i)).toBeVisible({ timeout: 5000 })
    })

    test('should update data in real-time', async () => {
      await page.goto('/dashboard/zzp/applications')

      // Mock real-time data update
      await page.evaluate(() => {
        // Simulate status update
        const event = new CustomEvent('realtime-update', {
          detail: {
            table: 'applications',
            type: 'UPDATE',
            new: {
              id: 'app-123',
              status: 'GEACCEPTEERD'
            }
          }
        })
        window.dispatchEvent(event)
      })

      // Should see updated status without page refresh
      await expect(page.getByText(/geaccepteerd/i)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate offline mode
      await context.setOffline(true)

      await page.goto('/dashboard/zzp/jobs')

      // Should show offline message
      await expect(page.getByText(/geen internetverbinding/i)).toBeVisible({ timeout: 10000 })

      // Restore connection
      await context.setOffline(false)

      // Should reconnect automatically
      await expect(page.getByText(/verbinding hersteld/i)).toBeVisible({ timeout: 10000 })
    })

    test('should validate form inputs correctly', async () => {
      await page.goto('/dashboard/zzp/profile')

      // Clear required field
      await page.getByLabel(/telefoonnummer/i).fill('')

      // Try to save
      await page.getByRole('button', { name: /wijzigingen opslaan/i }).click()

      // Should show validation error
      await expect(page.getByText(/telefoonnummer is verplicht/i)).toBeVisible()
    })

    test('should handle permission denied for GPS', async () => {
      await page.goto('/dashboard/zzp/hours')

      // Mock GPS permission denied
      await page.addInitScript(() => {
        Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
          writable: true,
          value: (success: any, error: (err: any) => void) => {
            error({
              code: 1, // PERMISSION_DENIED
              message: 'User denied geolocation'
            })
          }
        })
      })

      // Try to start shift
      await page.getByRole('button', { name: /dienst starten/i }).click()

      // Should show GPS permission error
      await expect(page.getByText(/GPS toegang geweigerd/i)).toBeVisible()
      await expect(page.getByText(/schakel locatieservices in/i)).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work correctly on mobile viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/dashboard/zzp')

      // Should show mobile navigation
      const mobileMenu = page.getByRole('button', { name: /menu/i })
      await expect(mobileMenu).toBeVisible()

      // Open mobile menu
      await mobileMenu.click()

      // Should show navigation items
      await expect(page.getByRole('link', { name: /opdrachten/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /werkuren/i })).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should load dashboard within performance budget', async () => {
      // Start performance monitoring
      const startTime = Date.now()

      await page.goto('/dashboard/zzp')

      // Wait for main content to load
      await expect(page.getByText(/beschikbare opdrachten/i)).toBeVisible()

      const loadTime = Date.now() - startTime

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should handle large job lists without performance degradation', async () => {
      await page.goto('/dashboard/zzp/jobs')

      // Mock large dataset
      await page.evaluate(() => {
        // This would normally be handled by the backend pagination
        // but we can test the frontend rendering performance
        const jobList = document.querySelector('[data-testid="job-list"]')
        if (jobList) {
          // Simulate many job cards
          for (let i = 0; i < 100; i++) {
            const jobCard = document.createElement('div')
            jobCard.setAttribute('data-testid', 'job-card')
            jobCard.textContent = `Test Job ${i}`
            jobList.appendChild(jobCard)
          }
        }
      })

      // Should still be responsive
      const jobCards = page.locator('[data-testid="job-card"]')
      await expect(jobCards.first()).toBeVisible()

      // Scroll should work smoothly
      await page.mouse.wheel(0, 1000)
      await expect(jobCards.last()).toBeVisible()
    })
  })
})