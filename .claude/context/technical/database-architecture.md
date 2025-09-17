# Database Architecture Context Bundle

## Overview
SecuryFlex uses PostgreSQL with PostGIS extensions for geographical operations and Drizzle ORM for type-safe database access.

## Connection Configuration
```typescript
// Database URL format
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
```

## Core Tables Structure

### User Management
- **users**: Auth users linked to Clerk
- **security_professionals**: ZZP profile with certifications
- **organizations**: Companies and clients

### Operational Tables
- **shifts**: Core business entity
- **locations**: Client sites with GPS coordinates
- **gps_checkins**: Real-time location tracking
- **incidents**: Security event reporting

### Financial Tables
- **finqle_transactions**: Payment processing
- **invoices**: Financial records
- **credit_limits**: Company credit management

## PostGIS Configuration

### Required Extensions
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Spatial Indexes
```sql
-- Critical for GPS performance
CREATE INDEX idx_locations_point ON locations USING GIST (location_point);
CREATE INDEX idx_gps_checkins_point ON gps_checkins USING GIST (gps_point);
```

## Drizzle ORM Patterns

### Connection Pool
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connection = postgres(process.env.DATABASE_URL!, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10
});

export const db = drizzle(connection);
```

### Transaction Pattern
```typescript
await db.transaction(async (tx) => {
  // Multiple operations in single transaction
  await tx.update(shifts).set({...});
  await tx.insert(notifications).values({...});
});
```

## Migration Strategy

### Commands
```bash
npm run db:generate    # Generate migration from schema
npm run db:migrate     # Apply migrations
npm run db:studio      # Open Drizzle Studio
```

### Safe Migration Patterns
- Always use IF NOT EXISTS for new objects
- Create indexes CONCURRENTLY in production
- Add constraints as NOT VALID first, then VALIDATE

## Performance Optimization

### Query Optimization
- Use covering indexes for common queries
- Implement partial indexes for filtered queries
- Regular VACUUM and ANALYZE operations

### Connection Pooling
- PgBouncer in transaction mode
- 20 connections default pool size
- 10 second connection timeout

## Backup & Recovery

### Backup Strategy
- Daily automated backups via Supabase
- Point-in-time recovery enabled
- 30-day retention policy

### Monitoring Queries
```sql
-- Connection monitoring
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Slow query detection
SELECT * FROM pg_stat_statements WHERE mean_exec_time > 1000;
```

## Data Retention Policies

### GDPR Compliance
- GPS data: 30 days
- Shift data: 1 year
- Financial data: 7 years
- Personal data: 3 years after last activity

## Critical Constraints

### Business Rules
- Shift dates must not overlap for same professional
- GPS accuracy must be < 100 meters
- Payment amount must be > 0
- Location radius between 50-1000 meters

## Common Queries

### Find Nearby Shifts
```sql
SELECT * FROM shifts s
JOIN locations l ON s.location_id = l.id
WHERE ST_DWithin(l.location_point, $1::geography, $2)
AND s.status = 'published';
```

### GPS Check-in Validation
```sql
SELECT ST_Distance(location_point, $1::geography) as distance
FROM locations WHERE id = $2;
```