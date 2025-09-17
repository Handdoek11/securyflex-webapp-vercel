# Supabase Backend Integration Context

## Overview
Supabase provides PostgreSQL database, real-time subscriptions, storage, and edge functions for SecuryFlex.

## Configuration

### Environment Variables
```bash
# Public (client-side)
NEXT_PUBLIC_SUPABASE_URL=https://krnpypknojkosmsaxhtl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Server-side only
SUPABASE_SERVICE_KEY=your_service_key
DATABASE_URL=postgresql://postgres:[password]@db.krnpypknojkosmsaxhtl.supabase.co:5432/postgres
DIRECT_DATABASE_URL=postgresql://postgres:[password]@db.krnpypknojkosmsaxhtl.supabase.co:5432/postgres
```

## Client Setup

### Supabase Client
```typescript
// libs/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);
```

### Server Client
```typescript
// libs/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

## Database Access

### Direct Database Connection
```typescript
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const connection = postgres(process.env.DATABASE_URL!);
export const db = drizzle(connection);
```

### Using Supabase Client
```typescript
// Query data
const { data, error } = await supabase
  .from('shifts')
  .select('*, locations(*)')
  .eq('status', 'published')
  .order('start_datetime', { ascending: true })
  .limit(20);

// Insert data
const { data, error } = await supabase
  .from('gps_checkins')
  .insert({
    shift_id: shiftId,
    professional_id: professionalId,
    latitude: lat,
    longitude: lng,
    accuracy_meters: accuracy
  })
  .select()
  .single();
```

## Storage Configuration

### Bucket Setup
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('gps-photos', 'gps-photos', false),
  ('documents', 'documents', false),
  ('profiles', 'profiles', true);

-- Set bucket policies
CREATE POLICY "GPS photos viewable by shift participants"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gps-photos' AND
  auth.uid() IN (
    SELECT professional_id FROM shifts
    WHERE id = (storage.foldername(name))[1]::int
  )
);
```

### File Upload
```typescript
// Upload GPS check-in photo
async function uploadCheckInPhoto(
  file: File,
  shiftId: number
): Promise<string> {
  const fileName = `${shiftId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('gps-photos')
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('gps-photos')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

### File Download
```typescript
// Download document
async function downloadDocument(path: string): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(path);

  if (error) throw error;
  return data;
}
```

## Real-time Subscriptions

### Table Changes
```typescript
// Subscribe to shift updates
const shiftChannel = supabase
  .channel('shifts-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'shifts',
      filter: `company_id=eq.${companyId}`
    },
    (payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          handleNewShift(payload.new);
          break;
        case 'UPDATE':
          handleShiftUpdate(payload.new, payload.old);
          break;
        case 'DELETE':
          handleShiftDelete(payload.old);
          break;
      }
    }
  )
  .subscribe();

// Cleanup
return () => {
  shiftChannel.unsubscribe();
};
```

### Presence
```typescript
// Track online users
const presenceChannel = supabase.channel('online-users');

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    updateOnlineUsers(Object.keys(state).length);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        role: userRole
      });
    }
  });
```

## Edge Functions

### Deploy Function
```typescript
// supabase/functions/process-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { shiftId, amount } = await req.json();

  // Process payment logic
  const result = await processPayment(shiftId, amount);

  return new Response(
    JSON.stringify(result),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Invoke Function
```typescript
// Call edge function
const { data, error } = await supabase.functions.invoke('process-payment', {
  body: {
    shiftId: 123,
    amount: 24200
  }
});
```

## Row Level Security (RLS)

### Enable RLS
```sql
-- Enable RLS on all tables
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE finqle_transactions ENABLE ROW LEVEL SECURITY;
```

### Policy Examples
```sql
-- ZZP can only see their own data
CREATE POLICY "ZZP view own shifts"
ON shifts FOR SELECT
USING (
  professional_id IN (
    SELECT id FROM security_professionals
    WHERE user_id = auth.uid()
  )
);

-- Companies see their shifts
CREATE POLICY "Company view own shifts"
ON shifts FOR ALL
USING (
  company_id = (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);
```

## Database Functions

### PostGIS Functions
```sql
-- Calculate distance between points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 float8, lng1 float8,
  lat2 float8, lng2 float8
) RETURNS float8 AS $$
BEGIN
  RETURN ST_Distance(
    ST_MakePoint(lng1, lat1)::geography,
    ST_MakePoint(lng2, lat2)::geography
  );
END;
$$ LANGUAGE plpgsql;
```

### Business Logic Functions
```sql
-- Validate GPS check-in
CREATE OR REPLACE FUNCTION validate_gps_checkin(
  p_shift_id int,
  p_lat float8,
  p_lng float8
) RETURNS json AS $$
DECLARE
  v_location_point geography;
  v_radius_meters int;
  v_distance float8;
BEGIN
  SELECT l.location_point, l.radius_meters
  INTO v_location_point, v_radius_meters
  FROM shifts s
  JOIN locations l ON s.location_id = l.id
  WHERE s.id = p_shift_id;

  v_distance := ST_Distance(
    v_location_point,
    ST_MakePoint(p_lng, p_lat)::geography
  );

  RETURN json_build_object(
    'is_valid', v_distance <= v_radius_meters,
    'distance', v_distance,
    'radius', v_radius_meters
  );
END;
$$ LANGUAGE plpgsql;
```

## Migrations

### Migration Files
```sql
-- migrations/001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create tables...
```

### Apply Migrations
```bash
# Using Supabase CLI
supabase db push

# Using Drizzle
npm run db:migrate
```

## Backup & Recovery

### Automatic Backups
- Daily backups at 2:00 UTC
- 30-day retention
- Point-in-time recovery

### Manual Backup
```bash
# Create backup
supabase db dump -f backup.sql

# Restore backup
supabase db reset
psql $DATABASE_URL < backup.sql
```

## Monitoring

### Database Metrics
```typescript
// Get database stats
const { data } = await supabaseAdmin
  .from('pg_stat_database')
  .select('*')
  .single();

console.log({
  connections: data.numbackends,
  transactions: data.xact_commit,
  cache_hit_ratio: data.blks_hit / (data.blks_hit + data.blks_read)
});
```

### Query Performance
```sql
-- Monitor slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;
```

## Local Development

### Start Supabase
```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset local database
supabase db reset
```

### Environment
```bash
# Local URLs
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```