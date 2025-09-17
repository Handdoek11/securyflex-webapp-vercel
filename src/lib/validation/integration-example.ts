// Integration example showing how to use validation schemas with API helpers
// This demonstrates production-ready API validation patterns

import { NextRequest } from 'next/server'
import { withAuthAndRateLimit, errorResponse, successResponse, parseJsonBody } from '../api-helpers'
import {
  opdrachtCreateSchema,
  zzpProfileSchema,
  reviewSchema,
  apiValidationMiddleware,
  validateApiRequest
} from './schemas'

/**
 * Example: Opdracht Creation API Route
 * Shows validation + auth + rate limiting integration
 */
export const createOpdrachtHandler = withAuthAndRateLimit(
  async (req: NextRequest, user: any) => {
    // 1. Validate request body with sanitization
    const { data: body, error: parseError } = await parseJsonBody(req)
    if (parseError) return parseError

    // 2. Validate against schema with comprehensive error handling
    const validation = validateApiRequest(opdrachtCreateSchema, body, {
      sanitize: true,
      allowPartial: false
    })

    if (!validation.success) {
      return errorResponse('Validation failed', 422)
    }

    // 3. Business logic with validated data
    const opdracht = validation.data!

    // Example: Add creator information based on user role
    const opdrachtData = {
      ...opdracht,
      creatorType: user.role === 'BEDRIJF' ? 'BEDRIJF' : 'OPDRACHTGEVER',
      creatorId: user.id,
      status: 'OPEN'
    }

    // 4. Create opdracht in database (simplified)
    // const result = await prisma.opdracht.create({ data: opdrachtData })

    return successResponse(opdrachtData, 'Opdracht successfully created')
  }
)

/**
 * Example: Profile Update API Route
 * Shows different validation patterns for different user types
 */
export const updateProfileHandler = withAuthAndRateLimit(
  async (req: NextRequest, user: any) => {
    const { data: body, error: parseError } = await parseJsonBody(req)
    if (parseError) return parseError

    // Select schema based on user role
    let schema
    switch (user.role) {
      case 'ZZP_BEVEILIGER':
        schema = zzpProfileSchema
        break
      case 'BEDRIJF':
        // schema = bedrijfProfileSchema (would be imported)
        return errorResponse('Bedrijf profile updates not implemented yet')
      default:
        return errorResponse('Invalid user role for profile update')
    }

    // Validate with partial updates allowed
    const validation = validateApiRequest(schema, body, {
      allowPartial: true,
      sanitize: true
    })

    if (!validation.success) {
      return errorResponse('Profile validation failed', 422)
    }

    return successResponse(validation.data, 'Profile updated successfully')
  }
)

/**
 * Example: Review Submission API Route
 * Shows validation with business logic integration
 */
export const submitReviewHandler = withAuthAndRateLimit(
  async (req: NextRequest, user: any) => {
    const { data: body, error: parseError } = await parseJsonBody(req)
    if (parseError) return parseError

    const validation = validateApiRequest(reviewSchema, body, { sanitize: true })

    if (!validation.success) {
      return errorResponse('Review validation failed', 422)
    }

    const review = validation.data!

    // Business logic: Check if user can review this opdracht
    // if (!await canUserReviewOpdracht(user.id, review.opdrachtId)) {
    //   return errorResponse('Not authorized to review this opdracht', 403)
    // }

    // Calculate overall rating
    const overallRating = (
      review.punctualiteit +
      review.professionaliteit +
      review.communicatie +
      review.kwaliteit
    ) / 4

    const reviewData = {
      ...review,
      reviewerId: user.id,
      overallRating,
      createdAt: new Date().toISOString()
    }

    return successResponse(reviewData, 'Review submitted successfully')
  }
)

/**
 * Example: Query Parameter Validation
 * Shows how to validate URL parameters and query strings
 */
export const getOpdrachtListHandler = withAuthAndRateLimit(
  async (req: NextRequest, user: any) => {
    // Validate query parameters
    const queryValidator = apiValidationMiddleware.validateQuery(
      // Custom schema for opdracht listing
      z.object({
        page: z.string().transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
        limit: z.string().transform(Number).refine(n => n <= 50, 'Limit too high').optional(),
        status: z.enum(['OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED']).optional(),
        location: z.string().max(100).optional(),
        skills: z.string().transform(s => s.split(',')).optional()
      })
    )

    const queryValidation = queryValidator(req)
    if (!queryValidation.success) {
      return errorResponse('Invalid query parameters', 400)
    }

    const filters = queryValidation.data!

    // Apply filters and pagination
    // const opdrachten = await getOpdrachtList(user, filters)

    return successResponse({
      opdrachten: [], // Mock data
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: 0
      }
    })
  }
)

/**
 * Example: Batch Validation
 * Shows how to validate multiple items at once
 */
export const bulkUpdateHandler = withAuthAndRateLimit(
  async (req: NextRequest, user: any) => {
    const { data: body, error: parseError } = await parseJsonBody(req)
    if (parseError) return parseError

    if (!Array.isArray(body.items)) {
      return errorResponse('Items must be an array')
    }

    // Use batch validation for multiple items
    const batchResult = validateBatch(
      z.object({
        id: z.string(),
        status: z.enum(['APPROVED', 'REJECTED']),
        comment: z.string().max(500).optional()
      }),
      body.items,
      { stopOnFirstError: false }
    )

    if (!batchResult.success) {
      return errorResponse('Validation failed for some items', 422)
    }

    // Process validated items
    const results = batchResult.validItems.map(item => ({
      ...item,
      updatedBy: user.id,
      updatedAt: new Date().toISOString()
    }))

    return successResponse({
      processed: results.length,
      errors: batchResult.errors,
      results
    })
  }
)

// Import statement that would be needed
import { z } from 'zod'
import { validateBatch } from './schemas'