# PRP: GPS Verification System

**Status**: Active  
**Version**: 1.0.0
**Last Updated**: 2024-12-15
**Confidence**: 9/10

## Overview
GPS-based check-in/out system with photo verification for shift validation. Core feature ensuring beveiligers are physically present at assigned locations.

## Context

### Business Requirements
- GPS accuracy within 50 meters required
- Photo required for check-in (not check-out)
- Check-in/out times determine payment
- Support offline check-ins with sync
- Fraud prevention through location verification
- Real-time tracking for active shifts

### Technical Requirements
- HTML5 Geolocation API
- WebRTC for camera access
- PostGIS for spatial queries
- IndexedDB for offline storage
- Background sync for offline data
- Photo compression to <500KB

## Implementation Steps

### Step 1: Setup PostGIS Database
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column to shifts table
ALTER TABLE "Opdracht" 
ADD COLUMN location GEOGRAPHY(POINT, 4326);

-- Add spatial index
CREATE INDEX idx_opdracht_location 
ON "Opdracht" USING GIST(location);

-- Function to check distance
CREATE OR REPLACE FUNCTION check_distance(
  user_lat FLOAT,
  user_lng FLOAT,
  shift_lat FLOAT,
  shift_lng FLOAT,
  max_distance FLOAT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN ST_DWithin(
    ST_MakePoint(user_lng, user_lat)::geography,
    ST_MakePoint(shift_lng, shift_lat)::geography,
    max_distance
  );
END;
$$ LANGUAGE plpgsql;
```

**Validation**:
- [ ] PostGIS extension installed
- [ ] Spatial queries work
- [ ] Distance calculation accurate
- [ ] Index improves query speed

### Step 2: Implement GPS Service
```typescript
// src/services/gps.service.ts
export class GPSService {
  private readonly REQUIRED_ACCURACY = 50; // meters
  private readonly TIMEOUT = 10000; // 10 seconds
  
  async getCurrentLocation(): Promise<GPSLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS not available'))
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position.coords.accuracy > this.REQUIRED_ACCURACY) {
            reject(new Error(`Accuracy ${position.coords.accuracy}m, need ${this.REQUIRED_ACCURACY}m`))
          }
          
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => this.handleError(error),
        {
          enableHighAccuracy: true,
          timeout: this.TIMEOUT,
          maximumAge: 0
        }
      )
    })
  }
  
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
}
```

**Validation**:
- [ ] GPS permission requested
- [ ] Accuracy check works
- [ ] Timeout after 10 seconds
- [ ] Distance calculation correct
- [ ] Error messages in Dutch

### Step 3: Photo Capture Component
```typescript
// src/components/gps/photo-capture.tsx
'use client'

export function PhotoCapture({ onCapture }: { onCapture: (photo: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (error) {
      throw new Error('Camera toegang geweigerd')
    }
  }
  
  const capturePhoto = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(videoRef.current, 0, 0)
    
    // Compress to <500KB
    let quality = 0.9
    let dataUrl = canvas.toDataURL('image/jpeg', quality)
    
    while (dataUrl.length > 500000 && quality > 0.1) {
      quality -= 0.1
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }
    
    onCapture(dataUrl)
    
    // Stop camera
    stream?.getTracks().forEach(track => track.stop())
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [stream])
}
```

**Validation**:
- [ ] Camera permission requested
- [ ] Front camera used
- [ ] Photo compressed <500KB
- [ ] Camera stops after capture
- [ ] Works on iOS/Android

### Step 4: Check-in API Endpoint
```typescript
// src/app/api/shifts/checkin/route.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CheckInSchema = z.object({
  shiftId: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().max(50)
  }),
  photo: z.string(), // Base64
  deviceInfo: z.object({
    platform: z.string(),
    userAgent: z.string()
  })
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const body = await req.json()
  const data = CheckInSchema.parse(body)
  
  // Get shift location
  const shift = await prisma.opdracht.findUnique({
    where: { id: data.shiftId }
  })
  
  if (!shift) {
    return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
  }
  
  // Verify location within radius (100m default)
  const shiftLoc = JSON.parse(shift.locatie)
  const distance = calculateDistance(
    data.location.latitude,
    data.location.longitude,
    shiftLoc.lat,
    shiftLoc.lng
  )
  
  if (distance > 100) {
    return NextResponse.json(
      { error: `Te ver van locatie: ${Math.round(distance)}m` },
      { status: 400 }
    )
  }
  
  // Store photo in cloud storage
  const photoUrl = await uploadPhoto(data.photo, `checkins/${data.shiftId}/${Date.now()}.jpg`)
  
  // Create work hour record
  const werkuur = await prisma.werkuur.create({
    data: {
      opdrachtId: data.shiftId,
      startTijd: new Date(),
      startLocatie: {
        lat: data.location.latitude,
        lng: data.location.longitude,
        accuracy: data.location.accuracy
      },
      photoUrl,
      deviceInfo: data.deviceInfo,
      status: 'ACTIVE'
    }
  })
  
  return NextResponse.json({
    success: true,
    checkInId: werkuur.id,
    time: werkuur.startTijd
  })
}
```

**Validation**:
- [ ] Only ZZP_BEVEILIGER can check in
- [ ] Location verified within radius
- [ ] Photo uploaded successfully
- [ ] Database record created
- [ ] Response <2 seconds

### Step 5: Check-out Implementation
```typescript
// src/app/api/shifts/checkout/route.ts
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  const { checkInId, location } = await req.json()
  
  // Find active check-in
  const werkuur = await prisma.werkuur.findUnique({
    where: { 
      id: checkInId,
      eindTijd: null // Still active
    }
  })
  
  if (!werkuur) {
    return NextResponse.json({ error: 'No active check-in' }, { status: 404 })
  }
  
  // Update with check-out
  const updated = await prisma.werkuur.update({
    where: { id: checkInId },
    data: {
      eindTijd: new Date(),
      eindLocatie: location,
      urenGewerkt: calculateHours(werkuur.startTijd, new Date()),
      status: 'COMPLETED'
    }
  })
  
  // Trigger payment process
  await createPaymentRequest(updated)
  
  return NextResponse.json({
    success: true,
    hoursWorked: updated.urenGewerkt,
    earnings: updated.urenGewerkt * updated.uurtarief
  })
}
```

**Validation**:
- [ ] Check-out without photo works
- [ ] Hours calculated correctly
- [ ] Payment process triggered
- [ ] Can't check out twice

### Step 6: Offline Support
```typescript
// src/services/offline-gps.service.ts
import { openDB } from 'idb'

export class OfflineGPSService {
  async storeOfflineCheckIn(data: CheckInData) {
    const db = await openDB('SecuryFlex', 1)
    
    await db.add('checkins', {
      ...data,
      synced: false,
      createdAt: new Date()
    })
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('sync-checkins')
    }
  }
  
  async syncOfflineCheckIns() {
    const db = await openDB('SecuryFlex', 1)
    const unsyncedCheckIns = await db.getAllFromIndex('checkins', 'synced', false)
    
    for (const checkIn of unsyncedCheckIns) {
      try {
        const response = await fetch('/api/shifts/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkIn)
        })
        
        if (response.ok) {
          // Mark as synced
          checkIn.synced = true
          await db.put('checkins', checkIn)
        }
      } catch (error) {
        console.error('Sync failed, will retry:', error)
      }
    }
  }
}
```

**Validation**:
- [ ] Offline check-ins stored locally
- [ ] Background sync registered
- [ ] Syncs when online
- [ ] No data lost
- [ ] User notified of offline mode

### Step 7: Real-time Tracking
```typescript
// src/components/gps/live-tracking.tsx
'use client'

export function LiveTracking({ shiftId }: { shiftId: string }) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  
  useEffect(() => {
    if (!navigator.geolocation) return
    
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos)
        
        // Send update to server every 5 minutes
        throttledUpdate(pos)
      },
      (error) => console.error('GPS error:', error),
      {
        enableHighAccuracy: true,
        maximumAge: 30000, // 30 seconds
        timeout: 27000 // 27 seconds
      }
    )
    
    setWatchId(id)
    
    return () => {
      if (id) navigator.geolocation.clearWatch(id)
    }
  }, [shiftId])
  
  const throttledUpdate = throttle(async (pos: GeolocationPosition) => {
    await fetch('/api/shifts/location-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shiftId,
        location: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }
      })
    })
  }, 5 * 60 * 1000) // 5 minutes
}
```

**Validation**:
- [ ] Continuous tracking works
- [ ] Updates every 5 minutes
- [ ] Battery optimization considered
- [ ] Stops on component unmount

## Testing Checklist

### Unit Tests
```typescript
describe('GPS Service', () => {
  test('requests high accuracy GPS')
  test('rejects if accuracy > 50m')
  test('calculates distance correctly')
  test('handles GPS errors gracefully')
})

describe('Check-in API', () => {
  test('validates location within radius')
  test('stores photo successfully')
  test('creates database record')
  test('rejects if too far from location')
})
```

### Integration Tests
- [ ] Complete check-in flow works
- [ ] Photo uploads to cloud storage
- [ ] Offline sync works when online
- [ ] Real-time tracking sends updates

### Manual Testing
- [ ] Test in Amsterdam city center
- [ ] Test in rural area
- [ ] Test with poor GPS signal
- [ ] Test offline mode
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome

## Error Handling

### GPS Errors
- **PERMISSION_DENIED**: "Sta locatie toe in browser"
- **POSITION_UNAVAILABLE**: "Ga naar buiten voor beter signaal"
- **TIMEOUT**: "GPS timeout, probeer opnieuw"
- **Low accuracy**: "GPS niet nauwkeurig genoeg (max 50m)"

### Photo Errors
- **Camera denied**: "Camera toegang geweigerd"
- **Photo too large**: Auto-compress to <500KB
- **Upload failed**: Store locally, retry later

## Performance Targets
- GPS lock: <5 seconds
- Photo capture: <2 seconds
- Check-in API: <2 seconds
- Photo upload: <5 seconds
- Distance calculation: <10ms

## Success Criteria
- [ ] GPS accuracy always <50m
- [ ] Photo compression works
- [ ] Check-in/out flow smooth
- [ ] Offline mode functional
- [ ] No location spoofing
- [ ] Works on all devices
- [ ] Battery usage acceptable

## Dependencies
- PostGIS extension
- HTML5 Geolocation API
- WebRTC for camera
- IndexedDB
- Cloud storage (S3/Cloudinary)

## Security Considerations
- Validate GPS coordinates server-side
- Check photo EXIF data for tampering
- Rate limit check-ins (max 2 per shift)
- Store GPS history for audit
- Encrypt location data at rest

## References
- [Example: gps-checkin.tsx](../../examples/gps/gps-checkin.tsx)
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [PostGIS Documentation](https://postgis.net/docs/)

## Future Enhancements
- Geofencing for automatic check-in
- GPS track visualization on map
- ML-based fraud detection
- Bluetooth beacon support
- Background GPS tracking permission