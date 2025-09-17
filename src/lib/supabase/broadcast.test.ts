import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  BroadcastEvent,
  broadcastEvent,
  broadcastOpdrachtEvent,
  broadcastSollicitatieEvent,
  broadcastTeamEvent,
  broadcastWerkuurEvent,
  broadcastPaymentEvent,
  broadcastNotificationEvent,
  broadcastMessageEvent
} from './broadcast'

// Mock Supabase admin
const mockChannel = vi.fn()
const mockSend = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    channel: mockChannel
  }
}))

describe('Broadcast System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChannel.mockReturnValue({
      send: mockSend
    })
    mockSend.mockResolvedValue({ success: true })
  })

  describe('broadcastEvent', () => {
    it('should broadcast event with correct payload', async () => {
      const testData = { id: '123', name: 'Test' }
      const metadata = { userId: 'user-1' }

      const result = await broadcastEvent(
        'test-channel',
        BroadcastEvent.OPDRACHT_CREATED,
        testData,
        metadata
      )

      expect(result.success).toBe(true)
      expect(mockChannel).toHaveBeenCalledWith('test-channel')
      expect(mockSend).toHaveBeenCalledWith({
        type: 'broadcast',
        event: BroadcastEvent.OPDRACHT_CREATED,
        payload: {
          event: BroadcastEvent.OPDRACHT_CREATED,
          data: testData,
          timestamp: expect.any(String),
          userId: 'user-1'
        }
      })
    })

    it('should handle broadcast errors', async () => {
      const error = new Error('Broadcast failed')
      mockSend.mockRejectedValue(error)

      const result = await broadcastEvent(
        'test-channel',
        BroadcastEvent.OPDRACHT_CREATED,
        {}
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe(error)
    })

    it('should include timestamp in payload', async () => {
      const beforeTime = new Date().toISOString()

      await broadcastEvent(
        'test-channel',
        BroadcastEvent.OPDRACHT_CREATED,
        {}
      )

      const afterTime = new Date().toISOString()
      const payload = mockSend.mock.calls[0][0].payload

      expect(payload.timestamp).toBeDefined()
      expect(payload.timestamp >= beforeTime).toBe(true)
      expect(payload.timestamp <= afterTime).toBe(true)
    })
  })

  describe('broadcastOpdrachtEvent', () => {
    it('should broadcast to multiple channels', async () => {
      const opdracht = {
        id: 'opdracht-1',
        opdrachtgeverId: 'opdrachtgever-1',
        creatorBedrijfId: 'bedrijf-1',
        acceptedBedrijfId: 'bedrijf-2'
      }

      const result = await broadcastOpdrachtEvent(
        BroadcastEvent.OPDRACHT_CREATED,
        opdracht
      )

      expect(result).toBe(true)
      expect(mockChannel).toHaveBeenCalledTimes(5)
      expect(mockChannel).toHaveBeenCalledWith('opdracht:opdracht-1')
      expect(mockChannel).toHaveBeenCalledWith('opdrachten:all')
      expect(mockChannel).toHaveBeenCalledWith('opdrachtgever:opdrachtgever-1')
      expect(mockChannel).toHaveBeenCalledWith('bedrijf:bedrijf-1')
      expect(mockChannel).toHaveBeenCalledWith('bedrijf:bedrijf-2')
    })

    it('should handle opdracht without optional relations', async () => {
      const opdracht = {
        id: 'opdracht-1',
        opdrachtgeverId: null,
        creatorBedrijfId: null,
        acceptedBedrijfId: null
      }

      await broadcastOpdrachtEvent(
        BroadcastEvent.OPDRACHT_CREATED,
        opdracht
      )

      expect(mockChannel).toHaveBeenCalledTimes(2)
      expect(mockChannel).toHaveBeenCalledWith('opdracht:opdracht-1')
      expect(mockChannel).toHaveBeenCalledWith('opdrachten:all')
    })

    it('should include additional data in broadcast', async () => {
      const opdracht = { id: 'opdracht-1' }
      const additionalData = { urgency: 'high' }

      await broadcastOpdrachtEvent(
        BroadcastEvent.OPDRACHT_UPDATED,
        opdracht,
        additionalData
      )

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: {
              opdracht,
              urgency: 'high'
            }
          })
        })
      )
    })

    it('should return false if any broadcast fails', async () => {
      mockSend.mockResolvedValueOnce({ success: true })
      mockSend.mockResolvedValueOnce({ success: false })

      const opdracht = { id: 'opdracht-1' }
      const result = await broadcastOpdrachtEvent(
        BroadcastEvent.OPDRACHT_CREATED,
        opdracht
      )

      expect(result).toBe(false)
    })
  })

  describe('broadcastSollicitatieEvent', () => {
    it('should broadcast to sollicitatie-specific channels', async () => {
      const sollicitatie = {
        id: 'sollicitatie-1',
        zzpId: 'zzp-1',
        bedrijfId: null
      }
      const opdracht = {
        id: 'opdracht-1',
        creatorId: 'creator-1'
      }

      const result = await broadcastSollicitatieEvent(
        BroadcastEvent.SOLLICITATIE_CREATED,
        sollicitatie,
        opdracht
      )

      expect(result).toBe(true)
      expect(mockChannel).toHaveBeenCalledWith('opdracht:opdracht-1:sollicitaties')
      expect(mockChannel).toHaveBeenCalledWith('sollicitatie:sollicitatie-1')
      expect(mockChannel).toHaveBeenCalledWith('zzp:zzp-1')
      expect(mockChannel).toHaveBeenCalledWith('user:creator-1')
    })

    it('should handle bedrijf sollicitatie', async () => {
      const sollicitatie = {
        id: 'sollicitatie-1',
        zzpId: null,
        bedrijfId: 'bedrijf-1'
      }
      const opdracht = {
        id: 'opdracht-1',
        creatorId: 'creator-1'
      }

      await broadcastSollicitatieEvent(
        BroadcastEvent.SOLLICITATIE_ACCEPTED,
        sollicitatie,
        opdracht
      )

      expect(mockChannel).toHaveBeenCalledWith('bedrijf:bedrijf-1')
      expect(mockChannel).not.toHaveBeenCalledWith(expect.stringMatching(/^zzp:/))
    })

    it('should include both sollicitatie and opdracht in data', async () => {
      const sollicitatie = { id: 'sollicitatie-1', zzpId: 'zzp-1' }
      const opdracht = { id: 'opdracht-1', creatorId: 'creator-1' }

      await broadcastSollicitatieEvent(
        BroadcastEvent.SOLLICITATIE_REJECTED,
        sollicitatie,
        opdracht
      )

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: { sollicitatie, opdracht }
          })
        })
      )
    })
  })

  describe('broadcastTeamEvent', () => {
    it('should broadcast to team-specific channels', async () => {
      const teamData = { memberId: 'member-1', action: 'invited' }
      const bedrijfId = 'bedrijf-1'

      const result = await broadcastTeamEvent(
        BroadcastEvent.TEAM_MEMBER_ASSIGNED,
        teamData,
        bedrijfId
      )

      expect(result).toBe(true)
      expect(mockChannel).toHaveBeenCalledWith('bedrijf:bedrijf-1:team')
      expect(mockChannel).toHaveBeenCalledWith('team:updates')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: teamData,
            bedrijfId
          })
        })
      )
    })
  })

  describe('broadcastWerkuurEvent', () => {
    it('should broadcast to werkuur-specific channels', async () => {
      const werkuur = {
        id: 'werkuur-1',
        zzpId: 'zzp-1',
        opdrachtId: 'opdracht-1'
      }
      const opdracht = { id: 'opdracht-1' }

      const result = await broadcastWerkuurEvent(
        BroadcastEvent.WERKUUR_CLOCKIN,
        werkuur,
        opdracht
      )

      expect(result).toBe(true)
      expect(mockChannel).toHaveBeenCalledWith('werkuur:werkuur-1')
      expect(mockChannel).toHaveBeenCalledWith('zzp:zzp-1:werkuren')
      expect(mockChannel).toHaveBeenCalledWith('opdracht:opdracht-1:werkuren')
    })

    it('should handle werkuur without opdracht', async () => {
      const werkuur = {
        id: 'werkuur-1',
        zzpId: 'zzp-1',
        opdrachtId: null
      }

      await broadcastWerkuurEvent(
        BroadcastEvent.WERKUUR_UPDATED,
        werkuur
      )

      expect(mockChannel).toHaveBeenCalledWith('werkuur:werkuur-1')
      expect(mockChannel).toHaveBeenCalledWith('zzp:zzp-1:werkuren')
      expect(mockChannel).not.toHaveBeenCalledWith(expect.stringMatching(/opdracht:.*:werkuren/))
    })
  })

  describe('broadcastPaymentEvent', () => {
    it('should broadcast to payment-specific channels', async () => {
      const payment = {
        id: 'payment-1',
        zzpId: 'zzp-1',
        bedrijfId: 'bedrijf-1',
        opdrachtgeverId: null
      }

      const result = await broadcastPaymentEvent(
        BroadcastEvent.PAYMENT_COMPLETED,
        payment
      )

      expect(result).toBe(true)
      expect(mockChannel).toHaveBeenCalledWith('payment:payment-1')
      expect(mockChannel).toHaveBeenCalledWith('payments:all')
      expect(mockChannel).toHaveBeenCalledWith('zzp:zzp-1:payments')
      expect(mockChannel).toHaveBeenCalledWith('bedrijf:bedrijf-1:payments')
    })

    it('should handle opdrachtgever payments', async () => {
      const payment = {
        id: 'payment-1',
        zzpId: null,
        bedrijfId: null,
        opdrachtgeverId: 'opdrachtgever-1'
      }

      await broadcastPaymentEvent(
        BroadcastEvent.PAYMENT_FAILED,
        payment
      )

      expect(mockChannel).toHaveBeenCalledWith('opdrachtgever:opdrachtgever-1:payments')
    })

    it('should include metadata in payment broadcast', async () => {
      const payment = { id: 'payment-1', zzpId: 'zzp-1' }
      const metadata = { amount: 100, currency: 'EUR' }

      await broadcastPaymentEvent(
        BroadcastEvent.PAYMENT_INITIATED,
        payment,
        metadata
      )

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: {
              payment,
              amount: 100,
              currency: 'EUR'
            }
          })
        })
      )
    })
  })

  describe('broadcastNotificationEvent', () => {
    it('should broadcast to user-specific notification channel', async () => {
      const userId = 'user-1'
      const notification = {
        id: 'notification-1',
        title: 'New Message',
        message: 'You have a new message'
      }

      const result = await broadcastNotificationEvent(userId, notification)

      expect(result.success).toBe(true)
      expect(mockChannel).toHaveBeenCalledWith('user:user-1:notifications')
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          event: BroadcastEvent.NOTIFICATION_NEW,
          payload: expect.objectContaining({
            data: notification,
            userId
          })
        })
      )
    })
  })

  describe('broadcastMessageEvent', () => {
    it('should broadcast to conversation and user channels', async () => {
      const message = {
        id: 'message-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Hello'
      }
      const conversationId = 'conversation-1'

      const result = await broadcastMessageEvent(
        BroadcastEvent.MESSAGE_SENT,
        message,
        conversationId
      )

      expect(result).toBe(true)
      expect(mockChannel).toHaveBeenCalledWith('conversation:conversation-1')
      expect(mockChannel).toHaveBeenCalledWith('messages:user-1')
      expect(mockChannel).toHaveBeenCalledWith('messages:user-2')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          event: BroadcastEvent.MESSAGE_SENT,
          payload: expect.objectContaining({
            data: message
          })
        })
      )
    })
  })

  describe('BroadcastEvent enum', () => {
    it('should have all required event types', () => {
      const expectedEvents = [
        'opdracht:created',
        'opdracht:updated',
        'opdracht:deleted',
        'opdracht:status_changed',
        'sollicitatie:created',
        'sollicitatie:accepted',
        'sollicitatie:rejected',
        'sollicitatie:withdrawn',
        'team:assigned',
        'team:removed',
        'team:invitation_sent',
        'werkuur:clockin',
        'werkuur:clockout',
        'werkuur:updated',
        'payment:initiated',
        'payment:completed',
        'payment:failed',
        'notification:new',
        'notification:read',
        'review:created',
        'review:updated',
        'message:sent',
        'message:read'
      ]

      expectedEvents.forEach(event => {
        expect(Object.values(BroadcastEvent)).toContain(event)
      })
    })
  })
})