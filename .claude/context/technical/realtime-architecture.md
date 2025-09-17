# Real-time Architecture Context Bundle

## Overview
SecuryFlex uses Supabase Realtime for live updates across GPS tracking, shift management, and payment status.

## Supabase Realtime Configuration

### Enable Replication
```sql
-- Critical tables for real-time
ALTER PUBLICATION supabase_realtime ADD TABLE shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE gps_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE finqle_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## Client Implementation

### Subscription Setup
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Subscribe to shift updates
const shiftSubscription = supabase
  .channel('shifts')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'shifts',
    filter: `company_id=eq.${companyId}`
  }, (payload) => {
    handleShiftUpdate(payload);
  })
  .subscribe();
```

## Real-time Features

### GPS Live Tracking
```typescript
// Track active shift GPS updates
const gpsChannel = supabase
  .channel(`gps-${shiftId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'gps_checkins',
    filter: `shift_id=eq.${shiftId}`
  }, (payload) => {
    updateMapMarker(payload.new);
  })
  .subscribe();
```

### Payment Status Updates
```typescript
// Monitor payment processing
const paymentChannel = supabase
  .channel('payments')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'finqle_transactions',
    filter: `professional_id=eq.${professionalId}`
  }, (payload) => {
    if (payload.new.status === 'paid') {
      showPaymentNotification();
    }
  })
  .subscribe();
```

## WebSocket Management

### Connection Handling
```typescript
// Monitor connection state
supabase.channel('any')
  .on('system', { event: 'connected' }, () => {
    console.log('Realtime connected');
  })
  .on('system', { event: 'disconnected' }, () => {
    console.log('Realtime disconnected');
    attemptReconnect();
  });
```

### Cleanup Pattern
```typescript
useEffect(() => {
  const subscription = supabase.channel('...');

  return () => {
    subscription.unsubscribe();
  };
}, [dependencies]);
```

## Presence Features

### Active Users Tracking
```typescript
const presenceChannel = supabase.channel('presence');

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    updateActiveUsers(state);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: userId,
        online_at: new Date().toISOString()
      });
    }
  });
```

## Broadcast Messaging

### Shift Notifications
```typescript
// Broadcast to all professionals
const broadcastChannel = supabase.channel('broadcast');

// Send notification
broadcastChannel.send({
  type: 'broadcast',
  event: 'new_shift',
  payload: {
    shiftId,
    location,
    startTime
  }
});

// Receive notifications
broadcastChannel.on('broadcast', { event: 'new_shift' }, (payload) => {
  if (isNearby(payload.location)) {
    showShiftNotification(payload);
  }
});
```

## Performance Optimization

### Subscription Management
- Limit subscriptions per page (max 10)
- Use specific filters to reduce data
- Unsubscribe when component unmounts
- Batch related subscriptions

### Channel Patterns
```typescript
// Single channel for multiple tables
const multiChannel = supabase
  .channel('multi')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'shifts'
  }, handleShifts)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'gps_checkins'
  }, handleGPS)
  .subscribe();
```

## Error Handling

### Reconnection Strategy
```typescript
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function attemptReconnect() {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    setTimeout(() => {
      reconnectAttempts++;
      supabase.realtime.connect();
    }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000));
  }
}
```

## Row Level Security (RLS)

### Real-time RLS Policies
```sql
-- GPS updates visible to shift participants
CREATE POLICY "GPS realtime access"
ON gps_checkins FOR SELECT
USING (
  shift_id IN (
    SELECT id FROM shifts
    WHERE professional_id = auth.uid()
    OR company_id = current_user_organization()
    OR client_id = current_user_organization()
  )
);
```

## Testing Real-time Features

### Mock Subscriptions
```typescript
// For testing
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockResolvedValue('SUBSCRIBED'),
  unsubscribe: jest.fn()
};
```

## Monitoring & Debugging

### Debug Mode
```typescript
// Enable verbose logging
const supabase = createClient(url, key, {
  realtime: {
    log_level: 'debug'
  }
});
```

### Performance Metrics
- Connection latency < 100ms
- Message delivery < 50ms
- Reconnection time < 5s
- Maximum concurrent connections: 100