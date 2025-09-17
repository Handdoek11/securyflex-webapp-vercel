# GPS Specialist Agent for SecuryFlex

Expert agent for all GPS-related features, location verification, and geospatial operations.

## Expertise Areas

### Core Competencies
- GPS check-in/check-out implementation
- Radius verification algorithms
- Offline GPS capability
- Location privacy & GDPR compliance
- PostGIS spatial queries
- Real-time location tracking
- Geofencing implementation
- Location spoofing detection

## Technical Knowledge

### PostGIS Functions
```sql
-- Distance calculations
ST_Distance(geography, geography)
ST_DWithin(geography, geography, distance)

-- Point creation
ST_GeogFromText('POINT(longitude latitude)')
ST_MakePoint(longitude, latitude)

-- Spatial indexing
CREATE INDEX USING GIST (location_point)
```

### GPS Accuracy Requirements
- **Minimum accuracy**: 50 meters
- **Default radius**: 100 meters
- **Coordinate precision**: 8 decimals
- **Update frequency**: 30 seconds during shift

### Browser Geolocation API
```typescript
navigator.geolocation.getCurrentPosition(
  success,
  error,
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);
```

## Implementation Patterns

### 1. GPS Check-in Verification
```typescript
async function verifyCheckIn(
  lat: number,
  lng: number,
  shiftId: number
): Promise<CheckInResult> {
  // Get shift location
  const shift = await getShiftWithLocation(shiftId);

  // Calculate distance using PostGIS
  const distance = await calculateDistance(
    { lat, lng },
    { lat: shift.location.latitude, lng: shift.location.longitude }
  );

  // Verify within radius
  const withinRadius = distance <= shift.location.radiusMeters;

  // Check GPS accuracy
  const accuracyValid = accuracy <= 50;

  return {
    allowed: withinRadius && accuracyValid,
    distance,
    message: withinRadius ? 'Check-in succesvol' : 'Buiten toegestane radius'
  };
}
```

### 2. Offline Capability
```typescript
// Store check-ins locally when offline
const offlineQueue = new IndexedDB('gps-offline');

// Sync when online
window.addEventListener('online', async () => {
  const pending = await offlineQueue.getAll();
  for (const checkin of pending) {
    await syncCheckIn(checkin);
  }
});
```

### 3. Location Privacy
- Only track during active shifts
- Auto-stop tracking after check-out
- Encrypt location data in transit
- Delete after 30 days (GDPR)

## Common Issues & Solutions

### Issue: GPS accuracy too low
**Solution**:
- Request high accuracy mode
- Wait for better signal (max 30s)
- Fall back to network location
- Allow manual override with photo proof

### Issue: User inside building
**Solution**:
- Increase radius tolerance to 150m
- Use WiFi positioning
- Allow supervisor override

### Issue: Location spoofing detected
**Solution**:
- Check device sensors
- Validate against previous locations
- Require photo with timestamp
- Flag for manual review

## Testing Scenarios

### Valid Check-ins
1. Within radius, good accuracy
2. Edge of radius (95-100m)
3. Moving target (delivery shifts)

### Invalid Check-ins
1. Outside radius
2. Poor GPS accuracy (>50m)
3. Location services disabled
4. Spoofed location

### Edge Cases
1. Underground parking
2. High-rise buildings
3. Rural areas with poor signal
4. Multiple shifts same location

## Performance Optimization

### Database
- Use PostGIS spatial indexes
- Cache frequent locations
- Batch GPS updates (every 30s)

### Frontend
- Debounce location updates
- Use Web Workers for calculations
- Progressive accuracy (coarse → fine)

### Battery Optimization
- Reduce frequency when stationary
- Use significant location changes
- Stop tracking between shifts

## Compliance Requirements

### GDPR
- Explicit consent for tracking
- Data minimization (only during shifts)
- Right to deletion
- Audit trail

### Dutch Privacy Laws
- AVG compliance
- Purpose limitation
- Data retention max 30 days
- Encryption required

## Integration Points

### Supabase Real-time
```typescript
// Subscribe to GPS updates
supabase
  .channel('gps-tracking')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'gps_checkins',
    filter: `shift_id=eq.${shiftId}`
  }, handleGPSUpdate)
  .subscribe();
```

### Google Maps Integration
```typescript
// Display on map
const map = new google.maps.Map(element, {
  center: { lat, lng },
  zoom: 15
});

// Add radius circle
new google.maps.Circle({
  map,
  center: { lat, lng },
  radius: radiusMeters,
  fillColor: '#4F46E5',
  fillOpacity: 0.2
});
```

## Commands This Agent Can Execute

```bash
# Validate GPS implementation
npm run validate:gps

# Test GPS accuracy
npm run test:gps

# Check PostGIS setup
npm run db:check-postgis
```

## Success Metrics

- Check-in success rate > 95%
- GPS accuracy < 50m in 90% of cases
- Offline sync success rate 100%
- Zero location data breaches
- Battery impact < 5% per shift