import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useApiData, useApiMutation, useTeamMembers, useOpdrachten, useJobs, useDashboardStats, useNotifications } from './useApiData'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock next-auth
const mockUseSession = vi.fn()
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}))

describe('useApiData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', role: 'ZZP_BEVEILIGER' } },
      status: 'authenticated'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch data successfully', async () => {
    const mockData = { users: [{ id: '1', name: 'Test User' }] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData })
    })

    const { result } = renderHook(() =>
      useApiData({ endpoint: '/api/users' })
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
    )
  })

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    })

    const { result } = renderHook(() =>
      useApiData({ endpoint: '/api/nonexistent' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('API error: Not Found')
  })

  it('should use fallback data on error', async () => {
    const fallbackData = { message: 'Fallback data' }
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() =>
      useApiData({
        endpoint: '/api/users',
        fallbackData
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(fallbackData)
    expect(result.current.error).toBe('Network error')
  })

  it('should handle unsuccessful API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, error: 'Validation failed' })
    })

    const { result } = renderHook(() =>
      useApiData({ endpoint: '/api/users' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('Validation failed')
  })

  it('should not fetch when auth required but user not authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    const { result } = renderHook(() =>
      useApiData({
        endpoint: '/api/users',
        requireAuth: true
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('Authentication required')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should wait for auth to load before fetching', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading'
    })

    const { result } = renderHook(() =>
      useApiData({
        endpoint: '/api/users',
        requireAuth: true
      })
    )

    expect(result.current.loading).toBe(true)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch when disabled', async () => {
    const { result } = renderHook(() =>
      useApiData({
        endpoint: '/api/users',
        enabled: false
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should include query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    })

    const { result } = renderHook(() =>
      useApiData({
        endpoint: '/api/users',
        params: { page: '1', limit: '10' }
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users?page=1&limit=10',
      expect.any(Object)
    )
  })

  it('should refetch data when refetch is called', async () => {
    const mockData = { users: [{ id: '1', name: 'Test User' }] }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData })
    })

    const { result } = renderHook(() =>
      useApiData({ endpoint: '/api/users' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    await result.current.refetch()

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should mutate data locally', async () => {
    const mockData = { users: [{ id: '1', name: 'Test User' }] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData })
    })

    const { result } = renderHook(() =>
      useApiData({ endpoint: '/api/users' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)

    const newData = { users: [{ id: '2', name: 'New User' }] }

    await waitFor(() => {
      result.current.mutate(newData)
    })

    expect(result.current.data).toEqual(newData)
  })

  it('should handle refresh interval', async () => {
    vi.useFakeTimers()

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    })

    const { result, unmount } = renderHook(() =>
      useApiData({
        endpoint: '/api/users',
        refreshInterval: 1000
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Fast forward 1 second
    vi.advanceTimersByTime(1000)

    // Wait for the async fetch to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockFetch).toHaveBeenCalledTimes(2)

    unmount()
    vi.useRealTimers()
  })
})

describe('useApiMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should post data successfully', async () => {
    const mockData = { id: '1', name: 'Created User' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData })
    })

    const { result } = renderHook(() =>
      useApiMutation('/api/users')
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)

    const postData = { name: 'New User' }
    const response = await result.current.mutate(postData)

    expect(response.success).toBe(true)
    expect(response.data).toEqual(mockData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
        credentials: 'include'
      })
    )
  })

  it('should handle API mutation errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, error: 'Validation failed' })
    })

    const { result } = renderHook(() =>
      useApiMutation('/api/users')
    )

    const response = await result.current.mutate({ name: 'Invalid User' })

    expect(response.success).toBe(false)
    expect(response.error).toBe('Validation failed')

    await waitFor(() => {
      expect(result.current.error).toBe('Validation failed')
    })
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() =>
      useApiMutation('/api/users')
    )

    const response = await result.current.mutate({ name: 'Test User' })

    expect(response.success).toBe(false)
    expect(response.error).toBe('Network error')

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    })
  })
})

describe('Specialized hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', role: 'ZZP_BEVEILIGER' } },
      status: 'authenticated'
    })
  })

  describe('useTeamMembers', () => {
    it('should fetch team members with fallback data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API error'))

      const { result } = renderHook(() => useTeamMembers())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(result.current.data).toEqual({
        teamMembers: [
          { id: "1", name: "Jan de Vries", available: true, rating: 4.8, skills: ["Evenement", "Objectbeveiliging"] },
          { id: "2", name: "Piet Bakker", available: true, rating: 4.6, skills: ["Horeca", "Crowd Control"] }
        ],
        stats: {
          total: 2,
          active: 2,
          invited: 0,
          finqleReady: 0
        }
      })
    })
  })

  describe('useOpdrachten', () => {
    it('should fetch opdrachten with view parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { opdrachten: [] } })
      })

      const { result } = renderHook(() => useOpdrachten('team'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/opdrachten?view=team',
        expect.any(Object)
      )
    })
  })

  describe('useJobs', () => {
    it('should fetch jobs without auth requirement', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { jobs: [] } })
      })

      const { result } = renderHook(() => useJobs())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(mockFetch).toHaveBeenCalled()
    })

    it('should include filter parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { jobs: [] } })
      })

      const filters = {
        search: 'beveiliging',
        location: 'Amsterdam',
        type: 'evenement',
        minRate: '20',
        page: 2
      }

      const { result } = renderHook(() => useJobs(filters))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/jobs?search=beveiliging&location=Amsterdam&type=evenement&minRate=20&page=2',
        expect.any(Object)
      )
    })
  })

  describe('useDashboardStats', () => {
    it('should set up refresh interval', () => {
      vi.useFakeTimers()

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      })

      const { unmount } = renderHook(() => useDashboardStats())

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dashboard/stats',
        expect.any(Object)
      )

      // Fast forward 1 minute
      vi.advanceTimersByTime(60000)

      expect(mockFetch).toHaveBeenCalledTimes(2)

      unmount()
      vi.useRealTimers()
    })
  })

  describe('useNotifications', () => {
    it('should fetch notifications with unreadOnly parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { notifications: [] } })
      })

      const { result } = renderHook(() => useNotifications(true))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/notifications?unreadOnly=true',
        expect.any(Object)
      )
    })

    it('should set up refresh interval', () => {
      vi.useFakeTimers()

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      })

      const { unmount } = renderHook(() => useNotifications())

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Fast forward 30 seconds
      vi.advanceTimersByTime(30000)

      expect(mockFetch).toHaveBeenCalledTimes(2)

      unmount()
      vi.useRealTimers()
    })
  })
})