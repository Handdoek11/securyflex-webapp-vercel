# GPS Accuracy Testing Command

Comprehensive GPS location verification testing for SecuryFlex shift check-ins with radius validation and photo capture verification.

## Usage

```
/test-gps-accuracy [scenario]
```

## Test Scenarios

- `checkin` - GPS check-in accuracy test (default)
- `radius` - Shift location radius validation
- `offline` - Offline GPS capability test
- `battery` - Battery optimization test
- `urban` - Dense urban area accuracy test
- `photo` - Photo capture requirement test

## GPS Testing Process

### 1. Check-in Accuracy Test
```bash
# Test GPS accuracy for shift check-ins
npm run test:gps-checkin
```

**Validates:**
- ✅ Location accuracy < 50 meters
- ✅ Check-in within configured radius (default 100m)
- ✅ Photo capture requirement enforcement
- ✅ Location services permission handling
- ✅ Error handling for GPS failure

### 2. Radius Validation Test
```bash
# Test shift location radius enforcement
npm run test:gps-radius
```

**Test Cases:**
- ✅ Inside radius: Allow check-in
- ✅ Outside radius: Prevent check-in with error
- ✅ Edge case: Exactly at radius boundary
- ✅ No GPS signal: Graceful degradation
- ✅ Low accuracy GPS: Warning but allow

### 3. Offline Capability Test
```bash
# Test offline GPS check-in functionality
npm run test:gps-offline
```

**Validates:**
- ✅ Queue check-ins when offline
- ✅ Sync queued check-ins when online
- ✅ Preserve photo data offline
- ✅ Battery optimization during offline
- ✅ User feedback for offline status

### 4. Battery Optimization Test
```bash
# Test adaptive GPS accuracy based on battery
npm run test:gps-battery
```

**Battery Levels:**
- **> 50%**: High accuracy GPS (1-5m)
- **20-50%**: Medium accuracy GPS (5-20m)
- **< 20%**: Low accuracy GPS (20-50m)
- **< 10%**: GPS disabled with warning

### 5. Urban Accuracy Test
```bash
# Test GPS in challenging urban environments
npm run test:gps-urban
```

**Test Locations:**
- Dense city centers
- Underground parking
- Multi-story buildings
- Bridge/tunnel areas
- High-rise districts

## Mock GPS Testing

### Accurate Location (Amsterdam Center)
```typescript
const mockAccurateGPS = {
  latitude: 52.3676,
  longitude: 4.9041,
  accuracy: 8, // meters
  timestamp: Date.now()
};
```

### Inaccurate Location (Outside Radius)
```typescript
const mockInaccurateGPS = {
  latitude: 52.3700, // ~300m away
  longitude: 4.9100,
  accuracy: 65, // meters
  timestamp: Date.now()
};
```

### Low Accuracy GPS
```typescript
const mockLowAccuracyGPS = {
  latitude: 52.3676,
  longitude: 4.9041,
  accuracy: 85, // High uncertainty
  timestamp: Date.now()
};
```

## Photo Capture Testing

### Required for Check-in
```typescript
describe('Photo Capture Requirement', () => {
  it('should require photo for check-in', async () => {
    const checkIn = await attemptCheckIn({
      location: mockAccurateGPS,
      photo: null // No photo provided
    });

    expect(checkIn.success).toBe(false);
    expect(checkIn.error).toBe('photo_required');
  });

  it('should accept valid photo with check-in', async () => {
    const photoBlob = new Blob(['photo data'], { type: 'image/jpeg' });

    const checkIn = await attemptCheckIn({
      location: mockAccurateGPS,
      photo: photoBlob
    });

    expect(checkIn.success).toBe(true);
    expect(checkIn.photoUrl).toBeDefined();
  });
});
```

### Photo Compression Test
```typescript
it('should compress photos to 1920x1080', async () => {
  const largePhoto = createMockPhoto(4000, 3000); // 4K photo

  const compressed = await compressPhoto(largePhoto);

  expect(compressed.width).toBeLessThanOrEqual(1920);
  expect(compressed.height).toBeLessThanOrEqual(1080);
  expect(compressed.size).toBeLessThan(largePhoto.size);
});
```

## Performance Testing

### GPS Lock Time
```typescript
it('should acquire GPS lock within 5 seconds', async () => {
  const startTime = Date.now();

  const location = await getCurrentPosition({
    timeout: 5000,
    enableHighAccuracy: true
  });

  const lockTime = Date.now() - startTime;
  expect(lockTime).toBeLessThan(5000);
  expect(location.accuracy).toBeLessThan(50);
});
```

### Check-in Response Time
```typescript
it('should complete check-in within 2 seconds', async () => {
  const startTime = Date.now();

  const result = await performCheckIn({
    shiftId: 'test-shift-1',
    location: mockAccurateGPS,
    photo: mockPhotoBlob
  });

  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(2000);
  expect(result.success).toBe(true);
});
```

## Error Scenario Testing

### GPS Permission Denied
```typescript
it('should handle GPS permission denied', async () => {
  mockGeolocation.mockImplementation(() => {
    throw new Error('PERMISSION_DENIED');
  });

  const result = await attemptCheckIn();

  expect(result.error).toBe('gps_permission_denied');
  expect(result.message).toBe('GPS toestemming is vereist');
});
```

### GPS Signal Lost
```typescript
it('should handle GPS signal loss gracefully', async () => {
  mockGeolocation.mockImplementation(() => {
    throw new Error('POSITION_UNAVAILABLE');
  });

  const result = await attemptCheckIn();

  expect(result.error).toBe('gps_unavailable');
  expect(result.fallback).toBeDefined();
});
```

### Low Battery Scenario
```typescript
it('should optimize GPS usage on low battery', async () => {
  mockBatteryLevel(15); // 15% battery

  const gpsConfig = getGPSConfiguration();

  expect(gpsConfig.enableHighAccuracy).toBe(false);
  expect(gpsConfig.timeout).toBeGreaterThan(10000);
  expect(gpsConfig.maximumAge).toBeGreaterThan(300000);
});
```

## Real Device Testing

### iOS Testing
```bash
# Test on iOS devices
npx playwright test --grep "GPS" --project=webkit
```

### Android Testing
```bash
# Test on Android devices
npx playwright test --grep "GPS" --project=chromium
```

### Progressive Web App
```bash
# Test PWA GPS functionality
npx playwright test --grep "GPS PWA"
```

## Security Testing

### Location Data Privacy
```typescript
it('should sanitize GPS data for different roles', () => {
  const preciseLocation = {
    latitude: 52.367678945,
    longitude: 4.904123456,
    accuracy: 3
  };

  // Admin sees full precision
  const adminView = sanitizeLocation(preciseLocation, 'admin');
  expect(adminView.latitude).toBe(52.367678945);

  // ZZP sees reduced precision
  const zzpView = sanitizeLocation(preciseLocation, 'zzp');
  expect(zzpView.latitude).toBe(52.37); // Rounded
});
```

### Data Encryption
```typescript
it('should encrypt GPS data before storage', async () => {
  const gpsData = mockAccurateGPS;

  const encrypted = await encryptGPSData(gpsData);
  const decrypted = await decryptGPSData(encrypted);

  expect(encrypted).not.toContain(gpsData.latitude.toString());
  expect(decrypted).toEqual(gpsData);
});
```

## Test Reports

### Success Report
```json
{
  "test_id": "gps_20241215_001",
  "timestamp": "2024-12-15T10:30:00Z",
  "scenario": "checkin",
  "status": "passed",
  "results": {
    "accuracy": {
      "average": "12m",
      "max": "48m",
      "within_threshold": "98%"
    },
    "response_time": {
      "average": "1.8s",
      "max": "2.1s",
      "within_target": "95%"
    },
    "photo_capture": {
      "compression_time": "1.2s",
      "success_rate": "100%",
      "size_reduction": "75%"
    },
    "offline_sync": {
      "queue_capacity": "50 check-ins",
      "sync_success": "100%",
      "data_integrity": "verified"
    }
  },
  "passed_tests": 24,
  "failed_tests": 0,
  "warnings": 1
}
```

## CI/CD Integration

### Pre-commit Hook
```bash
#!/bin/bash
# Run essential GPS tests before commit
npm run test:gps-essential
if [ $? -ne 0 ]; then
  echo "GPS tests failed. Commit blocked."
  exit 1
fi
```

### Deployment Pipeline
```yaml
# .github/workflows/gps-tests.yml
- name: GPS Accuracy Tests
  run: |
    npm run test:gps-accuracy
    npm run test:gps-performance
    npm run test:gps-security
```

## Success Criteria

GPS testing passes when:
1. ✅ Check-in accuracy < 50m in 95% of cases
2. ✅ Response time < 2 seconds
3. ✅ Photo compression < 2 seconds
4. ✅ Offline capability 100% functional
5. ✅ Battery optimization working
6. ✅ Security requirements met

**Usage**: Run before GPS feature releases and during regular CI/CD validation.