import { describe, it, expect } from 'vitest'
import {
  baseValidations,
  registerSchema,
  zzpProfileSchema,
  bedrijfProfileSchema,
  opdrachtgeverProfileSchema,
  opdrachtCreateSchema,
  werkurenLogSchema,
  reviewSchema,
  messageSchema,
  paymentRequestSchema,
  queryParamsSchema,
  settingsSchema,
  clockInSchema,
  clockOutSchema,
  jobApplicationSchema,
  fileUploadSchema,
  certificateSchema,
  helpTicketSchema,
  notificationPreferencesSchema,
  emergencyContactSchema,
  validateField,
  validatePartial,
  validateApiRequest,
  validateBatch,
  commonApiSchemas,
  apiValidationMiddleware
} from './schemas'

describe('Base Validations', () => {
  describe('phone validation', () => {
    it('should accept valid Dutch phone numbers', () => {
      const validNumbers = [
        '+31612345678',
        '0612345678',
        '0031612345678',
        '+31687654321'
      ]

      validNumbers.forEach(number => {
        const result = validateField(baseValidations.phone, number)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123456789',
        '+31512345678', // landline
        '06123456', // too short
        '+1234567890', // wrong country
        'not-a-number'
      ]

      invalidNumbers.forEach(number => {
        const result = validateField(baseValidations.phone, number)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('KvK number validation', () => {
    it('should accept valid KvK numbers', () => {
      const result = validateField(baseValidations.kvkNumber, '12345678')
      expect(result.success).toBe(true)
    })

    it('should reject invalid KvK numbers', () => {
      const invalidNumbers = ['1234567', '123456789', 'abcdefgh', '']

      invalidNumbers.forEach(number => {
        const result = validateField(baseValidations.kvkNumber, number)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('BTW number validation', () => {
    it('should accept valid BTW numbers', () => {
      const result = validateField(baseValidations.btwNumber, 'NL123456789B01')
      expect(result.success).toBe(true)
    })

    it('should reject invalid BTW numbers', () => {
      const invalidNumbers = ['NL12345678B01', 'BE123456789B01', '123456789B01', '']

      invalidNumbers.forEach(number => {
        const result = validateField(baseValidations.btwNumber, number)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('postcode validation', () => {
    it('should accept valid Dutch postcodes', () => {
      const validPostcodes = ['1234AB', '1234 AB', '9999ZZ', '1000 AA']

      validPostcodes.forEach(postcode => {
        const result = validateField(baseValidations.postcode, postcode)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid postcodes', () => {
      const invalidPostcodes = ['123AB', '12345AB', 'ABCD12', '1234abc', '']

      invalidPostcodes.forEach(postcode => {
        const result = validateField(baseValidations.postcode, postcode)
        expect(result.success).toBe(false)
      })
    })
  })
})

describe('User Registration Schema', () => {
  it('should validate correct registration data', () => {
    const validData = {
      name: 'Jan de Vries',
      email: 'jan@example.com',
      password: 'securepassword123',
      confirmPassword: 'securepassword123',
      role: 'ZZP_BEVEILIGER',
      acceptTerms: true
    }

    const result = validateField(registerSchema, validData)
    expect(result.success).toBe(true)
  })

  it('should reject mismatched passwords', () => {
    const invalidData = {
      name: 'Jan de Vries',
      email: 'jan@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword',
      role: 'ZZP_BEVEILIGER',
      acceptTerms: true
    }

    const result = validateField(registerSchema, invalidData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('komen niet overeen')
  })

  it('should require terms acceptance', () => {
    const invalidData = {
      name: 'Jan de Vries',
      email: 'jan@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'ZZP_BEVEILIGER',
      acceptTerms: false
    }

    const result = validateField(registerSchema, invalidData)
    expect(result.success).toBe(false)
  })
})

describe('ZZP Profile Schema', () => {
  it('should validate complete ZZP profile', () => {
    const validProfile = {
      name: 'Jan de Beveiliger',
      email: 'jan@beveiliger.nl',
      phone: '+31612345678',
      kvkNummer: '12345678',
      btwNummer: 'NL123456789B01',
      adres: 'Teststraat 123',
      postcode: '1234AB',
      plaats: 'Amsterdam',
      geboortedatum: '1990-01-01',
      uurtarief: 25,
      beschrijving: 'Ervaren beveiliger met 5 jaar ervaring',
      specialisaties: ['Evenement beveiliging', 'Object beveiliging'],
      werkgebied: ['Amsterdam', 'Utrecht'],
      ervaring: 5,
      rijbewijs: true,
      autoDescikbaar: true,
      beschikbaarheid: {
        maandag: { beschikbaar: true, van: '09:00', tot: '17:00' },
        dinsdag: { beschikbaar: true, van: '09:00', tot: '17:00' },
        woensdag: { beschikbaar: true, van: '09:00', tot: '17:00' },
        donderdag: { beschikbaar: true, van: '09:00', tot: '17:00' },
        vrijdag: { beschikbaar: true, van: '09:00', tot: '17:00' },
        zaterdag: { beschikbaar: false },
        zondag: { beschikbaar: false }
      }
    }

    const result = validateField(zzpProfileSchema, validProfile)
    expect(result.success).toBe(true)
  })

  it('should require minimum hourly rate', () => {
    const invalidProfile = {
      name: 'Jan de Beveiliger',
      email: 'jan@beveiliger.nl',
      phone: '+31612345678',
      kvkNummer: '12345678',
      adres: 'Teststraat 123',
      postcode: '1234AB',
      plaats: 'Amsterdam',
      geboortedatum: '1990-01-01',
      uurtarief: 10, // Below minimum
      specialisaties: ['Evenement beveiliging'],
      werkgebied: ['Amsterdam'],
      ervaring: 5,
      rijbewijs: true,
      autoDescikbaar: true,
      beschikbaarheid: {
        maandag: { beschikbaar: true, van: '09:00', tot: '17:00' },
        dinsdag: { beschikbaar: false },
        woensdag: { beschikbaar: false },
        donderdag: { beschikbaar: false },
        vrijdag: { beschikbaar: false },
        zaterdag: { beschikbaar: false },
        zondag: { beschikbaar: false }
      }
    }

    const result = validateField(zzpProfileSchema, invalidProfile)
    expect(result.success).toBe(false)
  })
})

describe('Opdracht Creation Schema', () => {
  it('should validate complete opdracht data', () => {
    const validOpdracht = {
      titel: 'Evenement Beveiliging Concertgebouw',
      beschrijving: 'Beveiliging van een klassiek concert met ongeveer 500 bezoekers. Ervaring met evenement beveiliging vereist.',
      locatie: {
        adres: 'Concertgebouwplein 10',
        postcode: '1071LN',
        plaats: 'Amsterdam',
        lat: 52.3676,
        lng: 4.9041
      },
      startDatum: '2024-12-25',
      eindDatum: '2024-12-25',
      startTijd: '19:00',
      eindTijd: '23:30',
      uurtarief: 30,
      aantalBeveiligers: 3,
      urgentie: 'NORMAAL',
      vereisten: ['BOA certificaat', 'Evenement ervaring'],
      specialisaties: ['Evenement beveiliging'],
      targetAudience: 'BEIDEN',
      directZZPAllowed: true,
      automatischGoedkeuren: false,
      bijzonderheden: 'Dresscode: zwart pak. Briefing om 18:30.'
    }

    const result = validateField(opdrachtCreateSchema, validOpdracht)
    expect(result.success).toBe(true)
  })

  it('should reject invalid time format', () => {
    const invalidOpdracht = {
      titel: 'Test Opdracht',
      beschrijving: 'Test beschrijving voor de opdracht',
      locatie: {
        adres: 'Teststraat 123',
        postcode: '1234AB',
        plaats: 'Amsterdam'
      },
      startDatum: '2024-12-25',
      eindDatum: '2024-12-25',
      startTijd: '25:00', // Invalid time
      eindTijd: '23:30',
      uurtarief: 25,
      aantalBeveiligers: 1,
      urgentie: 'NORMAAL',
      specialisaties: ['Object beveiliging'],
      targetAudience: 'BEIDEN',
      directZZPAllowed: true
    }

    const result = validateField(opdrachtCreateSchema, invalidOpdracht)
    expect(result.success).toBe(false)
  })
})

describe('Werkuren Log Schema', () => {
  it('should validate complete werkuren log', () => {
    const validWerkuren = {
      opdrachtId: 'opdracht-123',
      startTijd: '2024-01-15T09:00:00Z',
      eindTijd: '2024-01-15T17:00:00Z',
      pauzes: [
        {
          start: '2024-01-15T12:00:00Z',
          eind: '2024-01-15T12:30:00Z',
          reden: 'Lunchpauze'
        }
      ],
      locatieChecks: [
        {
          tijdstip: '2024-01-15T09:00:00Z',
          lat: 52.3676,
          lng: 4.9041,
          accuracy: 10
        }
      ],
      opmerkingen: 'Rustige dag, geen bijzonderheden.',
      fotoBewijzen: ['https://example.com/photo1.jpg']
    }

    const result = validateField(werkurenLogSchema, validWerkuren)
    expect(result.success).toBe(true)
  })
})

describe('Validation Helper Functions', () => {
  describe('validateApiRequest', () => {
    it('should sanitize string inputs when sanitize option is true', () => {
      const schema = registerSchema
      const maliciousData = {
        name: 'Jan<script>alert("xss")</script>',
        email: 'jan@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'ZZP_BEVEILIGER',
        acceptTerms: true
      }

      const result = validateApiRequest(schema, maliciousData, { sanitize: true })

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Jan')
      expect(result.data?.name).not.toContain('<script>')
    })

    it('should allow partial validation', () => {
      const schema = zzpProfileSchema
      const partialData = {
        name: 'Jan de Beveiliger',
        email: 'jan@beveiliger.nl'
      }

      const result = validateApiRequest(schema, partialData, { allowPartial: true })
      expect(result.success).toBe(true)
    })

    it('should throw error when throwOnError is true', () => {
      const schema = registerSchema
      const invalidData = {
        name: 'A', // Too short
        email: 'invalid-email'
      }

      expect(() => {
        validateApiRequest(schema, invalidData, { throwOnError: true })
      }).toThrow()
    })
  })

  describe('validateBatch', () => {
    it('should validate multiple items', () => {
      const schema = baseValidations.email
      const emails = ['valid@example.com', 'also-valid@test.nl', 'invalid-email', 'another@valid.com']

      const result = validateBatch(schema, emails)

      expect(result.validItems).toHaveLength(3)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].index).toBe(2)
    })

    it('should stop on first error when option is set', () => {
      const schema = baseValidations.email
      const emails = ['valid@example.com', 'invalid-email', 'another@valid.com']

      const result = validateBatch(schema, emails, { stopOnFirstError: true })

      expect(result.validItems).toHaveLength(1)
      expect(result.errors).toHaveLength(1)
    })
  })
})

describe('Common API Schemas', () => {
  describe('pagination schema', () => {
    it('should apply defaults correctly', () => {
      const result = validateField(commonApiSchemas.pagination, {})

      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(1)
      expect(result.data?.limit).toBe(20)
      expect(result.data?.order).toBe('desc')
    })

    it('should enforce limits', () => {
      const invalidData = {
        page: 0,
        limit: 200
      }

      const result = validateField(commonApiSchemas.pagination, invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('dateRange schema', () => {
    it('should validate correct date range', () => {
      const validRange = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z'
      }

      const result = validateField(commonApiSchemas.dateRange, validRange)
      expect(result.success).toBe(true)
    })

    it('should reject invalid date range', () => {
      const invalidRange = {
        startDate: '2024-01-31T00:00:00Z',
        endDate: '2024-01-01T23:59:59Z' // End before start
      }

      const result = validateField(commonApiSchemas.dateRange, invalidRange)
      expect(result.success).toBe(false)
    })
  })
})

describe('API Validation Middleware', () => {
  it('should validate request body', () => {
    const mockRequest = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'ZZP_BEVEILIGER',
        acceptTerms: true
      }
    }

    const validator = apiValidationMiddleware.validateBody(registerSchema)
    const result = validator(mockRequest)

    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Test User')
  })

  it('should validate query parameters', () => {
    const mockRequest = {
      query: {
        page: '2',
        limit: '10',
        search: 'test'
      }
    }

    const validator = apiValidationMiddleware.validateQuery(queryParamsSchema)
    const result = validator(mockRequest)

    expect(result.success).toBe(true)
    expect(result.data?.page).toBe(2)
    expect(result.data?.limit).toBe(10)
  })
})

describe('File Upload Schema', () => {
  it('should validate file upload with correct type and size', () => {
    // Create a mock File object
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }) // 1MB

    const validUpload = {
      file: mockFile,
      type: 'CERTIFICATE',
      beschrijving: 'Test certificate upload'
    }

    const result = validateField(fileUploadSchema, validUpload)
    expect(result.success).toBe(true)
  })
})

describe('Emergency Contact Schema', () => {
  it('should validate emergency contact', () => {
    const validContact = {
      naam: 'Maria de Vries',
      relatie: 'Echtgenote',
      telefoon: '+31612345678',
      email: 'maria@example.com',
      adres: 'Hulpstraat 456, 1234AB Amsterdam',
      isPrimair: true
    }

    const result = validateField(emergencyContactSchema, validContact)
    expect(result.success).toBe(true)
  })
})