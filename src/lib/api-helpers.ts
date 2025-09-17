import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimiter, checkUserActionLimit } from './rate-limiting'
import { auth } from './auth'

/**
 * Wrapper for API routes with rate limiting and error handling
 */
export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      const limiter = getRateLimiter(req.nextUrl.pathname)
      const rateLimitResponse = await checkRateLimit(req, limiter)

      if (rateLimitResponse) {
        return rateLimitResponse
      }

      // Execute the actual handler
      return await handler(req)
    } catch (error) {
      console.error('API Route Error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Wrapper for API routes with authentication and rate limiting
 */
export function withAuthAndRateLimit(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Apply rate limiting first
      const limiter = getRateLimiter(req.nextUrl.pathname)
      const rateLimitResponse = await checkRateLimit(req, limiter)

      if (rateLimitResponse) {
        return rateLimitResponse
      }

      // Check authentication
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required'
          },
          { status: 401 }
        )
      }

      // Execute the actual handler with user context
      return await handler(req, session.user)
    } catch (error) {
      console.error('API Route Error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Wrapper for API routes with user-specific action rate limiting
 */
export function withUserActionLimit(
  action: string,
  options: { points: number; duration: number; blockDuration?: number },
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Check authentication first
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required'
          },
          { status: 401 }
        )
      }

      // Apply general rate limiting
      const limiter = getRateLimiter(req.nextUrl.pathname)
      const rateLimitResponse = await checkRateLimit(req, limiter)

      if (rateLimitResponse) {
        return rateLimitResponse
      }

      // Apply user-specific action rate limiting
      const userActionResponse = await checkUserActionLimit(
        req,
        session.user.id,
        action,
        options
      )

      if (userActionResponse) {
        return userActionResponse
      }

      // Execute the actual handler
      return await handler(req, session.user)
    } catch (error) {
      console.error('API Route Error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Standard error response
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    { status }
  )
}

/**
 * Standard success response
 */
export function successResponse(data: any = null, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message })
  })
}

/**
 * Validation error response
 */
export function validationError(errors: string[]): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errors
    },
    { status: 422 }
  )
}

/**
 * Helper to parse JSON body safely
 */
export async function parseJsonBody(req: NextRequest): Promise<{ data: any; error?: NextResponse }> {
  try {
    const body = await req.json()
    return { data: body }
  } catch (error) {
    return {
      data: null,
      error: errorResponse('Invalid JSON in request body', 400)
    }
  }
}

/**
 * Helper to get query parameters
 */
export function getQueryParams(req: NextRequest): Record<string, string> {
  const params: Record<string, string> = {}
  const url = new URL(req.url)

  url.searchParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}

/**
 * Helper to check if method is allowed
 */
export function checkMethod(req: NextRequest, allowedMethods: string[]): NextResponse | null {
  if (!allowedMethods.includes(req.method)) {
    return NextResponse.json(
      {
        success: false,
        error: `Method ${req.method} not allowed`
      },
      {
        status: 405,
        headers: {
          Allow: allowedMethods.join(', ')
        }
      }
    )
  }
  return null
}

/**
 * Example usage in API route:
 *
 * export const POST = withUserActionLimit(
 *   'submit_application',
 *   { points: 5, duration: 60 * 60 }, // 5 applications per hour
 *   async (req: NextRequest, user: any) => {
 *     const methodCheck = checkMethod(req, ['POST'])
 *     if (methodCheck) return methodCheck
 *
 *     const { data: body, error } = await parseJsonBody(req)
 *     if (error) return error
 *
 *     // Handle application submission
 *     return successResponse({ applicationId: '123' })
 *   }
 * )
 */