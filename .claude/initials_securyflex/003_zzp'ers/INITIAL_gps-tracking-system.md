# INITIAL: GPS Tracking & Location Verification System

## FEATURE:
Build a comprehensive GPS tracking and location verification system enabling security professionals to check in/out of shifts with photo evidence, real-time location monitoring for clients/companies, and offline capability with sync. The system must validate location accuracy within 50-100m radius using PostGIS, provide geofencing alerts, and optimize battery usage with adaptive GPS accuracy.

**Specific Requirements:**
- GPS check-in/check-out with photo capture (photo required only for check-in)
- Location validation within 50-100m radius using PostGIS spatial queries
- Real-time location tracking during active shifts
- Offline capability with background sync when connectivity restored
- Photo compression to 1920x1080 with quality optimization
- Battery optimization with adaptive GPS accuracy based on power level
- Dutch privacy law (AVG/GDPR) compliance for location data

## EXAMPLES:
Reference these existing patterns and implementations:

**Core GPS Implementation:**
- `src/models/Schema.ts` lines 199-222: GPS check-ins schema with PostGIS integration
- `src/types/GPS.ts`: Complete location services interfaces (GPSCheckIn, LocationVerification, GeofenceAlert)
- `src/hooks/useRealtimeGPS.ts`: Live location tracking during shifts

**PostGIS Spatial Integration:**
- Distance calculation using ST_DWithin for radius validation
- Geofencing implementation with ST_Contains
- Spatial indexing for query performance optimization

**Mobile GPS Patterns:**
- Large touch targets for GPS check-in buttons (44px minimum)
- Loading states for GPS acquisition and photo processing
- Error handling for location permission denied or GPS unavailable

**Photo Evidence System:**
- Camera API integration with automatic compression
- Secure upload to Supabase Storage with progress indication
- EXIF data extraction for location and timestamp verification

## DOCUMENTATION:
**Implementation Reference:**
- `.claude/PRPs/gps-verification.md`: Complete GPS tracking implementation patterns
- `CLAUDE.md` GPS requirements: <50m accuracy, <5s location acquisition, <2s check-in completion
- `frontend-app/scripts/validate-gps.ts`: GPS accuracy and functionality testing

**Technical Architecture:**
- PostGIS spatial database setup for location validation
- Google Maps API for location services
- Supabase Storage for photo evidence handling
- Real-time subscriptions for live location updates

**Performance Targets:**
- GPS check-in completion: <2 seconds (including photo)
- Location acquisition: <5 seconds in good conditions
- Photo compression/upload: <5 seconds
- 95% GPS check-in success rate requirement

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **PostGIS Spatial Queries**: ST_DWithin for radius validation, ST_Distance for accuracy assessment, spatial indexing for performance
2. **Offline Capabilities**: Local storage of check-in attempts, background sync queue, failed upload management
3. **Photo Management**: Camera integration, compression algorithms, secure upload with metadata extraction
4. **Battery Optimization**: Adaptive GPS accuracy (high for check-in, lower for tracking), intelligent polling intervals
5. **Real-time Monitoring**: Live location streams, geofence violation alerts, location accuracy monitoring

**Common Pitfalls to Avoid:**
- Don't implement without offline capability - critical for field workers
- Don't skip photo compression - raw images too large for mobile upload
- Don't forget PostGIS spatial indexing for query performance
- Don't overlook battery optimization - continuous GPS drains battery
- Don't skip location permission request flows and fallbacks

**File Structure Requirements:**
```
src/lib/gps/
├── location.ts               # GPS acquisition and management
├── geofencing.ts            # Radius validation and alerts
├── photo.ts                 # Camera integration and compression
├── offline.ts               # Offline storage and sync
└── privacy.ts               # Privacy compliance utilities

src/components/gps/
├── GPSCheckInButton.tsx     # Main check-in interface
├── LocationPermission.tsx   # Permission request handling
├── PhotoCapture.tsx         # Camera integration
└── GPSStatus.tsx           # Connection and accuracy display

src/app/api/gps/
├── checkin/route.ts        # Check-in processing
├── tracking/route.ts       # Real-time location updates
└── validation/route.ts     # Location accuracy validation
```

**Privacy & Security Requirements:**
- Location data encryption in transit and at rest
- User consent management with clear opt-in/opt-out
- Data minimization and automatic purging policies
- Audit trail for location data access

**Mobile-Specific Considerations:**
- iOS/Android location permission differences
- Background location tracking limitations
- Camera access and photo quality optimization
- Network connectivity detection and handling

**Integration Dependencies:**
- Shift management for check-in validation
- Company dashboard for team location monitoring
- Client portal for service verification
- Payment system for shift completion validation

**Testing Requirements:**
```typescript
// Unit Tests (location.test.ts)
describe('GPS Location Service', () => {
  it('should validate location within 50m radius', async () => {
    const result = await validateLocation(mockLocation, shiftLocation);
    expect(result.isValid).toBe(true);
    expect(result.distance).toBeLessThan(50);
  });

  it('should reject location outside 100m radius', async () => {
    const farLocation = { lat: 52.0, lng: 4.0 };
    const result = await validateLocation(farLocation, shiftLocation);
    expect(result.isValid).toBe(false);
  });

  it('should handle GPS timeout gracefully', async () => {
    jest.useFakeTimers();
    const promise = getCurrentLocation();
    jest.advanceTimersByTime(5000);
    await expect(promise).rejects.toThrow('GPS_TIMEOUT');
  });
});

// Integration Tests (GPSCheckIn.test.tsx)
describe('GPS Check-in Component', () => {
  it('moet foto vereisen voor check-in', async () => {
    render(<GPSCheckInButton type="checkin" />);
    fireEvent.click(screen.getByText('GPS Check-in'));
    expect(screen.getByText('Foto maken')).toBeInTheDocument();
  });

  it('moet geen foto vereisen voor check-out', async () => {
    render(<GPSCheckInButton type="checkout" />);
    fireEvent.click(screen.getByText('Check-out'));
    expect(screen.queryByText('Foto maken')).not.toBeInTheDocument();
  });
});

// E2E Tests (gps-checkin.spec.ts)
test('Complete GPS check-in flow', async ({ page }) => {
  // Navigate to shift
  await page.goto('/shift/123');

  // Click check-in button
  await page.click('[data-testid="gps-checkin-button"]');

  // Grant GPS permission (mocked)
  await page.context().grantPermissions(['geolocation']);

  // Wait for location acquisition
  await expect(page.locator('[data-testid="location-status"]'))
    .toContainText('Locatie gevonden');

  // Take photo
  await page.click('[data-testid="camera-button"]');

  // Submit check-in
  await page.click('[data-testid="submit-checkin"]');

  // Verify success
  await expect(page.locator('[data-testid="checkin-success"]'))
    .toBeVisible({ timeout: 5000 });
});
```

**Performance Test Targets:**
- GPS acquisition: <5 seconds in good conditions
- Photo compression: <2 seconds for 1920x1080
- Check-in completion: <2 seconds total
- Offline sync: <10 seconds when reconnected

**Test Coverage Requirements:**
- Location validation logic: 100%
- Photo compression: 90%
- Offline queue management: 95%
- Error handling paths: 100%
- Component interactions: 80%

**Recommended Agent:** @gps-engineer for location verification, @mobile-optimizer for battery optimization, @test-engineer for test coverage