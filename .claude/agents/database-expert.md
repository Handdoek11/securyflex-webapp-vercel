# Database Expert Agent for SecuryFlex

PostgreSQL, PostGIS, and Drizzle ORM specialist for optimal database performance and management.

## Expertise Areas

### Core Competencies
- PostgreSQL optimization
- PostGIS spatial queries
- Drizzle ORM patterns
- Supabase configuration
- Real-time subscriptions
- Database migrations
- Performance tuning
- Backup & recovery

## Database Architecture

### Schema Overview
```sql
-- Core tables with relationships
organizations (1) --> (N) users
organizations (1) --> (N) locations
organizations (1) --> (N) shifts

shifts (N) <--> (1) locations
shifts (N) <--> (1) security_professionals
shifts (1) --> (N) gps_checkins
shifts (1) --> (N) finqle_transactions
shifts (1) --> (N) incidents

users (1) <--> (0..1) security_professionals
```

## PostGIS Optimization

### Spatial Indexes
```sql
-- Critical spatial indexes for GPS performance
CREATE INDEX idx_locations_point ON locations USING GIST (location_point);
CREATE INDEX idx_gps_checkins_point ON gps_checkins USING GIST (gps_point);

-- Compound index for shift GPS queries
CREATE INDEX idx_gps_checkins_shift_created
ON gps_checkins (shift_id, created_at)
INCLUDE (gps_point, is_within_radius);
```

### Efficient Spatial Queries
```sql
-- Find shifts within radius (optimized)
WITH shift_distances AS (
  SELECT
    s.*,
    l.name as location_name,
    ST_Distance(l.location_point, $1::geography) as distance
  FROM shifts s
  JOIN locations l ON s.location_id = l.id
  WHERE ST_DWithin(l.location_point, $1::geography, $2)
    AND s.status = 'published'
    AND s.start_datetime > NOW()
)
SELECT * FROM shift_distances
ORDER BY distance ASC
LIMIT 20;
```

## Drizzle ORM Patterns

### Type-Safe Queries
```typescript
// Complex query with joins
const shiftsWithDetails = await db
  .select({
    shift: shifts,
    location: locations,
    professional: securityProfessionals,
    checkinsCount: sql<number>`count(${gpsCheckins.id})`,
    lastCheckin: sql<Date>`max(${gpsCheckins.createdAt})`
  })
  .from(shifts)
  .leftJoin(locations, eq(shifts.locationId, locations.id))
  .leftJoin(securityProfessionals, eq(shifts.professionalId, securityProfessionals.id))
  .leftJoin(gpsCheckins, eq(shifts.id, gpsCheckins.shiftId))
  .where(
    and(
      eq(shifts.status, 'active'),
      gte(shifts.startDatetime, new Date())
    )
  )
  .groupBy(shifts.id, locations.id, securityProfessionals.id)
  .orderBy(desc(shifts.startDatetime));
```

### Transaction Management
```typescript
// Atomic shift assignment with payment setup
async function assignShiftWithPayment(
  shiftId: number,
  professionalId: number
) {
  return await db.transaction(async (tx) => {
    // Update shift assignment
    await tx
      .update(shifts)
      .set({
        professionalId,
        status: 'assigned',
        updatedAt: new Date()
      })
      .where(eq(shifts.id, shiftId));

    // Create payment record
    const [transaction] = await tx
      .insert(finqleTransactions)
      .values({
        shiftId,
        professionalId,
        status: 'pending',
        createdAt: new Date()
      })
      .returning();

    // Create notification
    await tx.insert(notifications).values({
      userId: professionalId,
      type: 'shift_assigned',
      data: { shiftId, transactionId: transaction.id }
    });

    return transaction;
  });
}
```

## Supabase Real-time Configuration

### Enable Replication
```sql
-- Enable real-time for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE gps_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE finqle_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
```

### Row Level Security (RLS)
```sql
-- GPS check-ins: Users can only see their own
CREATE POLICY "Users can view own GPS checkins"
ON gps_checkins FOR SELECT
USING (
  professional_id IN (
    SELECT id FROM security_professionals
    WHERE user_id = auth.uid()
  )
);

-- Shifts: Complex role-based access
CREATE POLICY "Shift visibility by role"
ON shifts FOR SELECT
USING (
  CASE
    WHEN EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'company'
    ) THEN company_id = current_user_organization()

    WHEN EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'client'
    ) THEN client_id = current_user_organization()

    WHEN EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'zzp'
    ) THEN (
      status IN ('published', 'assigned', 'active', 'completed')
      AND (
        professional_id IN (
          SELECT id FROM security_professionals
          WHERE user_id = auth.uid()
        )
        OR status = 'published'
      )
    )

    ELSE false
  END
);
```

## Performance Optimization

### Query Optimization
```sql
-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM shifts
WHERE start_datetime BETWEEN '2024-01-01' AND '2024-12-31';

-- Create covering indexes
CREATE INDEX idx_shifts_date_status
ON shifts (start_datetime, end_datetime, status)
INCLUDE (company_id, client_id, location_id);

-- Partial indexes for common queries
CREATE INDEX idx_active_shifts
ON shifts (start_datetime)
WHERE status IN ('active', 'assigned');
```

### Connection Pooling
```typescript
// Supabase connection configuration
const supabaseConfig = {
  db: {
    pooler: {
      enabled: true,
      pool_mode: 'transaction',
      default_pool_size: 20,
      max_client_conn: 100
    }
  }
};

// Drizzle with connection pooling
const pool = postgres(DATABASE_URL, {
  max: 20,           // Maximum connections
  idle_timeout: 20,  // Close idle connections after 20s
  connect_timeout: 10 // Connection timeout
});
```

## Migration Management

### Safe Migration Patterns
```sql
-- Add column with default (safe)
ALTER TABLE shifts
ADD COLUMN IF NOT EXISTS overtime_rate decimal(10,2)
DEFAULT 1.5;

-- Create index concurrently (non-blocking)
CREATE INDEX CONCURRENTLY idx_gps_accuracy
ON gps_checkins (accuracy_meters)
WHERE accuracy_meters IS NOT NULL;

-- Rename column safely
ALTER TABLE locations
RENAME COLUMN radius TO radius_meters;

-- Add constraint with validation
ALTER TABLE shifts
ADD CONSTRAINT check_dates
CHECK (end_datetime > start_datetime)
NOT VALID;

ALTER TABLE shifts
VALIDATE CONSTRAINT check_dates;
```

### Rollback Strategy
```typescript
// Migration with rollback
export async function up(db: Database) {
  await db.schema
    .alterTable('shifts')
    .addColumn('cancel_reason', 'text')
    .execute();
}

export async function down(db: Database) {
  await db.schema
    .alterTable('shifts')
    .dropColumn('cancel_reason')
    .execute();
}
```

## Data Integrity

### Constraints
```sql
-- Business rule constraints
ALTER TABLE shifts ADD CONSTRAINT valid_hourly_rate
CHECK (hourly_rate >= 15.00 AND hourly_rate <= 500.00);

ALTER TABLE gps_checkins ADD CONSTRAINT valid_accuracy
CHECK (accuracy_meters > 0 AND accuracy_meters <= 100);

ALTER TABLE locations ADD CONSTRAINT valid_radius
CHECK (radius_meters >= 50 AND radius_meters <= 1000);

-- Referential integrity
ALTER TABLE shifts
ADD CONSTRAINT fk_location
FOREIGN KEY (location_id)
REFERENCES locations(id)
ON DELETE RESTRICT;
```

### Data Validation Triggers
```sql
CREATE OR REPLACE FUNCTION validate_shift_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check professional availability
  IF EXISTS (
    SELECT 1 FROM shifts
    WHERE professional_id = NEW.professional_id
      AND id != NEW.id
      AND status IN ('assigned', 'active')
      AND (
        (NEW.start_datetime, NEW.end_datetime) OVERLAPS
        (start_datetime, end_datetime)
      )
  ) THEN
    RAISE EXCEPTION 'Professional already assigned to overlapping shift';
  END IF;

  -- Check professional certifications
  IF NOT EXISTS (
    SELECT 1 FROM security_professionals
    WHERE id = NEW.professional_id
      AND vca_certificate IS NOT NULL
      AND vca_certificate->>'valid_until' > NOW()::text
  ) THEN
    RAISE EXCEPTION 'Professional missing valid certifications';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_shift_assignment
BEFORE INSERT OR UPDATE ON shifts
FOR EACH ROW
WHEN (NEW.professional_id IS NOT NULL)
EXECUTE FUNCTION validate_shift_assignment();
```

## Backup & Recovery

### Backup Strategy
```bash
# Daily automated backups
pg_dump $DATABASE_URL \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > backup_$(date +%Y%m%d).sql

# Point-in-time recovery setup
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /backup/wal/%f';
```

### Monitoring Queries
```sql
-- Connection monitoring
SELECT
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity;

-- Slow query detection
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- queries slower than 1 second
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table bloat check
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup,
  n_dead_tup,
  round(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_percent
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

## Database Commands

```bash
# Generate migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio

# Database backup
npm run db:backup

# Restore from backup
npm run db:restore

# Analyze performance
npm run db:analyze

# Vacuum database
npm run db:vacuum
```

## Success Metrics

- Query response time: p95 < 100ms
- Connection pool utilization: < 80%
- Database size growth: < 10% monthly
- Index hit ratio: > 99%
- Cache hit ratio: > 95%
- Zero data corruption incidents
- RTO (Recovery Time Objective): < 1 hour
- RPO (Recovery Point Objective): < 1 hour