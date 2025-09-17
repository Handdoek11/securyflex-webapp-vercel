import { test, expect, Page } from '@playwright/test';

// Test utilities
async function loginAsZZP(page: Page) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', 'zzp-test@example.com');
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

async function loginAsBedrijf(page: Page) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', 'bedrijf-test@example.com');
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

async function loginAsAdmin(page: Page) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', 'admin-test@example.com');
  await page.fill('input[name="password"]', 'AdminPassword123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe('ND-nummer Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('**/api/compliance/nd-nummer/**', async (route, request) => {
      const url = new URL(request.url());
      const method = request.method();

      // Mock registration endpoint
      if (url.pathname.includes('/register') && method === 'POST') {
        const body = request.postDataJSON();
        if (body.ndNummer === 'ND123456') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'ND-nummer succesvol geregistreerd',
              registration: {
                ndNummer: 'ND123456',
                status: 'AANGEVRAAGD',
                vervalDatum: '2027-12-31T23:59:59Z',
                profileType: 'ZZP'
              },
              nextActions: {
                verifyUrl: '/api/compliance/nd-nummer/validate',
                statusUrl: '/api/compliance/nd-nummer/validate?profileType=ZZP'
              }
            })
          });
        } else {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Validatiefout',
              details: { ndNummer: ['Ongeldig ND-nummer format'] }
            })
          });
        }
      }

      // Mock validation endpoint
      else if (url.pathname.includes('/validate') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            validation: {
              ndNummer: 'ND123456',
              status: 'ACTIEF',
              valid: true,
              expiryDate: '2027-12-31T23:59:59Z',
              lastVerified: new Date().toISOString()
            },
            profile: {
              id: 'zzp123',
              ndNummerStatus: 'ACTIEF',
              ndNummerVervalDatum: '2027-12-31T23:59:59Z',
              ndNummerLaatsteControle: new Date().toISOString()
            },
            complianceInfo: {
              isCompliant: true,
              requiresAction: false,
              daysUntilExpiry: 1095,
              canAcceptJobs: true
            }
          })
        });
      }

      // Mock status retrieval
      else if (url.pathname.includes('/validate') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'zzp123',
              ndNummer: 'ND123456',
              ndNummerStatus: 'ACTIEF',
              ndNummerVervalDatum: '2027-12-31T23:59:59Z',
              ndNummerLaatsteControle: new Date().toISOString(),
              ndNummerOpmerking: 'Geverifieerd via Justis API'
            },
            compliance: {
              isCompliant: true,
              isExpiringSoon: false,
              isExpired: false,
              daysUntilExpiry: 1095,
              requiresRenewal: false,
              canAcceptJobs: true
            },
            auditHistory: [
              {
                id: 'audit1',
                action: 'REGISTRATIE',
                newStatus: 'AANGEVRAAGD',
                verificationSource: 'Manual',
                createdAt: new Date().toISOString(),
                complianceNotes: 'ND-nummer geregistreerd door gebruiker'
              },
              {
                id: 'audit2',
                action: 'VERIFICATIE',
                newStatus: 'ACTIEF',
                verificationSource: 'Justis API',
                createdAt: new Date().toISOString(),
                complianceNotes: 'Geverifieerd via Justis API'
              }
            ]
          })
        });
      }

      // Mock monitoring endpoint
      else if (url.pathname.includes('/monitor') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            summary: {
              totalProfiles: 150,
              compliantProfiles: 140,
              complianceRate: 93,
              expiredProfiles: 5,
              expiringSoonProfiles: 15,
              criticalRiskProfiles: 8,
              highRiskProfiles: 12,
              lastUpdated: new Date().toISOString()
            },
            profiles: [
              {
                id: 'zzp1',
                profileType: 'ZZP',
                userName: 'Jan Jansen',
                ndNummer: 'ND123456',
                status: 'ACTIEF',
                isCompliant: true,
                daysUntilExpiry: 1095,
                riskLevel: 'LOW'
              },
              {
                id: 'bedrijf1',
                profileType: 'BEDRIJF',
                userName: 'Security BV',
                bedrijfsnaam: 'Professional Security BV',
                ndNummer: 'ND789012',
                status: 'VERLOPEN',
                isCompliant: false,
                daysUntilExpiry: -30,
                riskLevel: 'CRITICAL'
              }
            ],
            alerts: [
              {
                profileId: 'bedrijf1',
                profileType: 'BEDRIJF',
                userName: 'Security BV',
                bedrijfsnaam: 'Professional Security BV',
                ndNummer: 'ND789012',
                riskLevel: 'CRITICAL',
                issue: 'ND-nummer verlopen',
                daysUntilExpiry: -30
              }
            ],
            recentActivity: [
              {
                id: 'activity1',
                profileType: 'ZZP',
                profileName: 'Jan Jansen',
                ndNummer: 'ND123456',
                action: 'VERIFICATIE',
                newStatus: 'ACTIEF',
                verificationSource: 'Justis API',
                createdAt: new Date().toISOString()
              }
            ]
          })
        });
      }

      // Default fallback
      else {
        await route.continue();
      }
    });

    // Mock file upload endpoint
    await page.route('**/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          url: 'https://example.com/uploaded-nd-document.pdf',
          fileId: 'file123'
        })
      });
    });

    // Mock job applications to test compliance blocking
    await page.route('**/api/opdrachten/*/solliciteer', async (route, request) => {
      if (request.method() === 'POST') {
        // Simulate ND-nummer compliance check failure
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Een geldig ND-nummer is verplicht voor beveiligingsopdrachten. Registreer uw ND-nummer in uw dashboard.',
            complianceError: true,
            ndNummerStatus: 'NIET_GEREGISTREERD',
            actionUrl: '/dashboard/compliance'
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('Complete ZZP ND-nummer registration and verification flow', async ({ page }) => {
    await loginAsZZP(page);

    // Navigate to compliance dashboard
    await page.click('nav a[href*="compliance"]');
    await expect(page).toHaveURL(/compliance/);

    // Should see registration form since no ND-nummer exists
    await expect(page.locator('h1')).toContainText('ND-nummer');
    await expect(page.locator('text=Registreren')).toBeVisible();

    // Fill out registration form
    await page.fill('input[name="ndNummer"]', 'ND123456');

    // Set expiry date (3 years from now)
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 3);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);

    // Upload document (mock file upload)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'nd-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content')
    });

    // Wait for upload to complete
    await expect(page.locator('text=Document geüpload')).toBeVisible();

    // Check confirmation checkbox
    await page.check('input[type="checkbox"]');

    // Submit registration
    await page.click('button:has-text("ND-nummer Registreren")');

    // Should see success message
    await expect(page.locator('text=succesvol geregistreerd')).toBeVisible();

    // Should now show status card instead of registration form
    await expect(page.locator('text=ND-nummer Status')).toBeVisible();
    await expect(page.locator('text=ND123456')).toBeVisible();
    await expect(page.locator('text=Aangevraagd')).toBeVisible();

    // Click verification button
    await page.click('button:has-text("Verificatie Uitvoeren")');

    // Should see verification in progress
    await expect(page.locator('text=Verifiëren')).toBeVisible();

    // After verification completes
    await expect(page.locator('text=geverifieerd')).toBeVisible();

    // Status should update to "Actief"
    await page.reload();
    await expect(page.locator('text=Actief')).toBeVisible();
    await expect(page.locator('text=Conform')).toBeVisible();

    // Should see compliance summary showing user can accept jobs
    await expect(page.locator('text=Opdrachten accepteren')).toBeVisible();
    await expect(page.locator('text=✓')).toBeVisible();
  });

  test('ND-nummer compliance blocking job applications', async ({ page }) => {
    await loginAsZZP(page);

    // Navigate to available jobs
    await page.goto('/dashboard/opdrachten');

    // Try to apply for a job without ND-nummer
    await page.click('button:has-text("Solliciteren")');

    // Should see compliance error
    await expect(page.locator('text=ND-nummer is verplicht')).toBeVisible();
    await expect(page.locator('text=Registreer uw ND-nummer')).toBeVisible();

    // Click link to compliance page
    await page.click('a[href*="compliance"]');
    await expect(page).toHaveURL(/compliance/);
  });

  test('Bedrijf ND-nummer registration with company details', async ({ page }) => {
    await loginAsBedrijf(page);

    await page.goto('/dashboard/compliance');

    // Should see bedrijf-specific messaging
    await expect(page.locator('text=beveiligingsbedrijf')).toBeVisible();

    // Fill registration form for bedrijf
    await page.fill('input[name="ndNummer"]', 'ND789012');

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 5);
    await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);

    // Upload company ND-nummer document
    await page.locator('input[type="file"]').setInputFiles({
      name: 'bedrijf-nd-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('company nd certificate content')
    });

    await expect(page.locator('text=Document geüpload')).toBeVisible();

    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("ND-nummer Registreren")');

    await expect(page.locator('text=succesvol geregistreerd')).toBeVisible();

    // Should show bedrijf-specific status information
    await expect(page.locator('text=Beveiligingsbedrijf')).toBeVisible();
    await expect(page.locator('text=ND789012')).toBeVisible();
  });

  test('Admin platform monitoring dashboard', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/dashboard/compliance');

    // Should see platform-wide statistics
    await expect(page.locator('text=Platform')).toBeVisible();
    await expect(page.locator('text=150')).toBeVisible(); // Total profiles
    await expect(page.locator('text=93%')).toBeVisible(); // Compliance rate

    // Should see alerts section
    await expect(page.locator('text=Urgente Aandacht Vereist')).toBeVisible();
    await expect(page.locator('text=ND-nummer verlopen')).toBeVisible();

    // Click on "Alle Profielen" tab
    await page.click('text=Alle Profielen');

    // Should see list of all profiles
    await expect(page.locator('text=Jan Jansen')).toBeVisible();
    await expect(page.locator('text=Professional Security BV')).toBeVisible();
    await expect(page.locator('text=Kritiek Risico')).toBeVisible();

    // Should be able to view recent activity
    await page.click('text=Recente Activiteit');
    await expect(page.locator('text=VERIFICATIE')).toBeVisible();
    await expect(page.locator('text=Justis API')).toBeVisible();
  });

  test('ND-nummer expiry warnings and renewal flow', async ({ page }) => {
    // Mock expiring ND-nummer
    await page.route('**/api/compliance/nd-nummer/validate', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'zzp123',
              ndNummer: 'ND123456',
              ndNummerStatus: 'ACTIEF',
              ndNummerVervalDatum: '2024-02-15T23:59:59Z', // Expires soon
              ndNummerLaatsteControle: new Date().toISOString()
            },
            compliance: {
              isCompliant: true,
              isExpiringSoon: true,
              isExpired: false,
              daysUntilExpiry: 25,
              requiresRenewal: true,
              canAcceptJobs: true
            },
            auditHistory: []
          })
        });
      } else {
        await route.continue();
      }
    });

    await loginAsZZP(page);
    await page.goto('/dashboard/compliance');

    // Should see expiry warning
    await expect(page.locator('text=Verloopt Binnenkort')).toBeVisible();
    await expect(page.locator('text=25 dagen')).toBeVisible();

    // Should see renewal button
    await expect(page.locator('button:has-text("Plan Vernieuwing")')).toBeVisible();

    // Should see progress bar indicating time remaining
    await expect(page.locator('div[role="progressbar"]')).toBeVisible();

    // Should see recommendations
    await expect(page.locator('text=Plan vernieuwing binnen 30 dagen')).toBeVisible();
  });

  test('Invalid ND-nummer format validation', async ({ page }) => {
    await loginAsZZP(page);
    await page.goto('/dashboard/compliance');

    // Try invalid ND-nummer formats
    const invalidFormats = [
      'ND12345',      // Too short
      'ND123456789',  // Too long
      'XX123456',     // Wrong prefix
      '123456',       // No prefix
      'ND12345A'      // Contains letter
    ];

    for (const invalidNummer of invalidFormats) {
      await page.fill('input[name="ndNummer"]', invalidNummer);
      await page.fill('input[type="date"]', '2027-12-31');

      // Try to submit - should show validation error
      await page.click('button:has-text("ND-nummer Registreren")');

      // Should see format error
      await expect(page.locator('text=Ongeldig ND-nummer')).toBeVisible();

      // Clear the field for next iteration
      await page.fill('input[name="ndNummer"]', '');
    }
  });

  test('Mobile responsive compliance dashboard', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginAsZZP(page);
    await page.goto('/dashboard/compliance');

    // Should be responsive on mobile
    await expect(page.locator('h1')).toBeVisible();

    // Form should be properly laid out
    await expect(page.locator('input[name="ndNummer"]')).toBeVisible();

    // Cards should stack vertically
    const cards = page.locator('[data-testid="compliance-card"]');
    const firstCardBox = await cards.first().boundingBox();
    const lastCardBox = await cards.last().boundingBox();

    if (firstCardBox && lastCardBox) {
      // Cards should be stacked vertically on mobile
      expect(lastCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height);
    }
  });

  test('Accessibility compliance for ND-nummer forms', async ({ page }) => {
    await loginAsZZP(page);
    await page.goto('/dashboard/compliance');

    // Check form labels
    await expect(page.locator('label[for*="ndNummer"]')).toBeVisible();

    // Check ARIA attributes
    const ndNummerInput = page.locator('input[name="ndNummer"]');
    await expect(ndNummerInput).toHaveAttribute('aria-invalid', 'false');

    // Check form descriptions
    await expect(page.locator('text=Voer uw Nederlandse Dienstnummer in')).toBeVisible();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(ndNummerInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="date"]')).toBeFocused();

    // Check color contrast for status badges
    const statusBadge = page.locator('[data-testid="nd-nummer-status"]');
    if (await statusBadge.isVisible()) {
      const badgeStyles = await statusBadge.evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color
        };
      });

      // Basic check that colors are set (full contrast testing would need additional tools)
      expect(badgeStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(badgeStyles.color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('ND-nummer audit trail and history tracking', async ({ page }) => {
    await loginAsZZP(page);
    await page.goto('/dashboard/compliance');

    // Mock profile with audit history
    await page.route('**/api/compliance/nd-nummer/validate', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              id: 'zzp123',
              ndNummer: 'ND123456',
              ndNummerStatus: 'ACTIEF',
              ndNummerVervalDatum: '2027-12-31T23:59:59Z',
              ndNummerLaatsteControle: new Date().toISOString()
            },
            compliance: {
              isCompliant: true,
              canAcceptJobs: true
            },
            auditHistory: [
              {
                id: 'audit1',
                action: 'REGISTRATIE',
                newStatus: 'AANGEVRAAGD',
                verificationSource: 'Manual',
                createdAt: '2024-01-01T10:00:00Z',
                complianceNotes: 'ND-nummer geregistreerd door gebruiker'
              },
              {
                id: 'audit2',
                action: 'VERIFICATIE',
                previousStatus: 'AANGEVRAAGD',
                newStatus: 'ACTIEF',
                verificationSource: 'Justis API',
                createdAt: '2024-01-02T14:30:00Z',
                complianceNotes: 'Geverifieerd via Justis API'
              },
              {
                id: 'audit3',
                action: 'HERINNERING_VERSTUURD',
                newStatus: 'ACTIEF',
                verificationSource: 'Automated',
                createdAt: '2024-01-15T09:00:00Z',
                complianceNotes: 'Notificatie verstuurd: EXPIRY_WARNING_90_DAYS'
              }
            ]
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.reload();

    // Should see audit history section
    await expect(page.locator('text=Recente Activiteit')).toBeVisible();

    // Should see audit entries
    await expect(page.locator('text=REGISTRATIE')).toBeVisible();
    await expect(page.locator('text=VERIFICATIE')).toBeVisible();
    await expect(page.locator('text=HERINNERING_VERSTUURD')).toBeVisible();

    // Should see dates
    await expect(page.locator('text=1-1-2024')).toBeVisible();
    await expect(page.locator('text=2-1-2024')).toBeVisible();

    // Should see verification sources
    await expect(page.locator('text=Manual')).toBeVisible();
    await expect(page.locator('text=Justis API')).toBeVisible();
    await expect(page.locator('text=Automated')).toBeVisible();
  });
});