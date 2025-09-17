import { chromium, type FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

/**
 * Global setup for Playwright E2E tests
 *
 * Prepares test database and authentication state
 */

const prisma = new PrismaClient()

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...')

  // Clean test database
  await cleanTestDatabase()

  // Seed test data
  await seedTestData()

  // Setup authentication state
  await setupAuthenticationState(config)

  console.log('✅ E2E test global setup completed')
}

async function cleanTestDatabase() {
  console.log('🧹 Cleaning test database...')

  // Delete in correct order to respect foreign key constraints
  await prisma.werkuren.deleteMany()
  await prisma.betalingsAanvraag.deleteMany()
  await prisma.sollicitatie.deleteMany()
  await prisma.opdracht.deleteMany()
  await prisma.zZPProfile.deleteMany()
  await prisma.bedrijfProfile.deleteMany()
  await prisma.opdrachtgever.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Test database cleaned')
}

async function seedTestData() {
  console.log('🌱 Seeding test data...')

  // Create test opdrachtgever (client)
  const testOpdrachtgever = await prisma.user.create({
    data: {
      email: 'test-client@example.com',
      role: 'OPDRACHTGEVER',
      opdrachtgever: {
        create: {
          bedrijfsnaam: 'Test Security B.V.',
          contactpersoon: 'Jan de Tester',
          telefoonnummer: '0201234567',
          email: 'test-client@example.com',
          adres: 'Teststraat 123',
          postcode: '1012 AB',
          plaats: 'Amsterdam',
          kvkNummer: '12345678',
          btwNummer: 'NL123456789B01'
        }
      }
    }
  })

  // Create test beveiligingsbedrijf
  const testBedrijf = await prisma.user.create({
    data: {
      email: 'test-company@example.com',
      role: 'BEDRIJF',
      bedrijfProfile: {
        create: {
          bedrijfsnaam: 'Test Beveiliging B.V.',
          contactpersoon: 'Maria Manager',
          telefoonnummer: '0207654321',
          email: 'test-company@example.com',
          adres: 'Bedrijfsweg 456',
          postcode: '1013 CD',
          plaats: 'Amsterdam',
          kvkNummer: '87654321',
          btwNummer: 'NL987654321B01',
          specialisaties: ['EVENEMENT_BEVEILIGING', 'OBJECT_BEVEILIGING'],
          werknemersAantal: 25
        }
      }
    }
  })

  // Create test opdrachten (jobs)
  const testOpdrachten = await Promise.all([
    prisma.opdracht.create({
      data: {
        titel: 'Evenement Beveiliging - Amsterdam Arena',
        omschrijving: 'Beveiliging tijdens voetbalwedstrijd. Ervaring met crowd control vereist.',
        locatie: 'Amsterdam',
        postcode: '1101 AX',
        startDatum: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        eindDatum: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours later
        uurloon: 18.50,
        aantalPersonen: 10,
        vereisten: ['SIA Diploma', 'Ervaring met evenementen'],
        status: 'OPEN',
        creatorType: 'OPDRACHTGEVER',
        opdrachtgeverId: testOpdrachtgever.id,
        targetAudience: 'BEIDEN',
        directZZPAllowed: true
      }
    }),
    prisma.opdracht.create({
      data: {
        titel: 'Nacht Surveillance - Kantoorpand',
        omschrijving: 'Nachtelijke surveillance in kantoorgebouw centrum Amsterdam.',
        locatie: 'Amsterdam Centrum',
        postcode: '1012 JS',
        startDatum: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        eindDatum: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // next day
        uurloon: 16.00,
        aantalPersonen: 2,
        vereisten: ['SIA Diploma', 'Eigen vervoer'],
        status: 'OPEN',
        creatorType: 'BEDRIJF',
        creatorBedrijfId: testBedrijf.id,
        targetAudience: 'ALLEEN_ZZP',
        directZZPAllowed: true
      }
    }),
    prisma.opdracht.create({
      data: {
        titel: 'Winkel Beveiliging - Shopping Center',
        omschrijving: 'Dagdienst beveiliging in druk winkelcentrum.',
        locatie: 'Utrecht',
        postcode: '3511 LJ',
        startDatum: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        eindDatum: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 10 hours later
        uurloon: 17.25,
        aantalPersonen: 5,
        vereisten: ['SIA Diploma', 'Ervaring retail beveiliging'],
        status: 'OPEN',
        creatorType: 'OPDRACHTGEVER',
        opdrachtgeverId: testOpdrachtgever.id,
        targetAudience: 'BEIDEN',
        directZZPAllowed: true
      }
    })
  ])

  console.log(`✅ Created ${testOpdrachten.length} test opdrachten`)
  console.log('✅ Test data seeding completed')
}

async function setupAuthenticationState(config: FullConfig) {
  console.log('🔐 Setting up authentication states...')

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Create and authenticate a test ZZP user
    await page.goto('http://localhost:3000/auth/register')

    // Fill registration form
    await page.getByLabel(/e-mailadres/i).fill('e2e-test-zzp@example.com')
    await page.getByLabel(/wachtwoord/i).first().fill('TestPassword123!')
    await page.getByLabel(/bevestig wachtwoord/i).fill('TestPassword123!')

    // Submit registration
    await page.getByRole('button', { name: /account aanmaken/i }).click()

    // Select ZZP role
    await page.waitForURL('**/auth/role-selection')
    await page.getByRole('button', { name: /zzp beveiliger/i }).click()

    // Complete ZZP profile
    await page.waitForURL('**/profile/zzp')
    await page.getByLabel(/voornaam/i).fill('E2E')
    await page.getByLabel(/achternaam/i).fill('Tester')
    await page.getByLabel(/telefoonnummer/i).fill('0612345678')
    await page.getByLabel(/kvk nummer/i).fill('12345678')
    await page.getByLabel(/stad/i).fill('Amsterdam')

    await page.getByRole('button', { name: /profiel opslaan/i }).click()

    // Wait for dashboard
    await page.waitForURL('**/dashboard/zzp')

    // Save authentication state
    await page.context().storageState({ path: 'tests/e2e/auth/zzp-auth.json' })

    console.log('✅ ZZP authentication state saved')

  } catch (error) {
    console.error('❌ Failed to setup authentication state:', error)
  } finally {
    await browser.close()
  }
}

export default globalSetup