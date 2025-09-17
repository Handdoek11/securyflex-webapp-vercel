# Maps & GPS Integration Context

## Overview
Location services integration for GPS tracking, map visualization, and geofencing in SecuryFlex.

## GPS Web API

### Get Current Position
```typescript
interface GPSOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

async function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}
```

### Watch Position
```typescript
// Continuous tracking during shift
function startGPSTracking(shiftId: number): number {
  return navigator.geolocation.watchPosition(
    (position) => {
      sendGPSUpdate(shiftId, position);
    },
    (error) => {
      handleGPSError(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }
  );
}

// Stop tracking
function stopGPSTracking(watchId: number) {
  navigator.geolocation.clearWatch(watchId);
}
```

## Map Integration

### Google Maps Setup
```typescript
// Load Google Maps
export function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places,geometry`;
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}
```

### Map Component
```typescript
interface MapProps {
  center: { lat: number; lng: number };
  markers: Array<{
    position: { lat: number; lng: number };
    title: string;
    icon?: string;
  }>;
  radius?: number;
}

export function ShiftMap({ center, markers, radius }: MapProps) {
  const mapRef = useRef<google.maps.Map>();

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(
        document.getElementById('map')!,
        {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false
        }
      );
    }

    // Add markers
    markers.forEach((marker) => {
      new google.maps.Marker({
        position: marker.position,
        map: mapRef.current,
        title: marker.title,
        icon: marker.icon
      });
    });

    // Add radius circle
    if (radius) {
      new google.maps.Circle({
        center,
        radius,
        map: mapRef.current,
        fillColor: '#4F46E5',
        fillOpacity: 0.1,
        strokeColor: '#4F46E5',
        strokeOpacity: 0.8,
        strokeWeight: 2
      });
    }
  }, [center, markers, radius]);

  return <div id="map" className="h-full w-full" />;
}
```

## Geofencing

### Radius Validation
```typescript
interface GeofenceValidation {
  isWithinRadius: boolean;
  distance: number;
  radius: number;
}

function validateGeofence(
  userLat: number,
  userLng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): GeofenceValidation {
  const distance = calculateHaversineDistance(
    userLat,
    userLng,
    centerLat,
    centerLng
  );

  return {
    isWithinRadius: distance <= radiusMeters,
    distance,
    radius: radiusMeters
  };
}

function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

## PostGIS Integration

### Spatial Queries
```typescript
// Database-side validation
async function validateCheckInLocation(
  shiftId: number,
  lat: number,
  lng: number
): Promise<boolean> {
  const result = await db.execute`
    SELECT ST_DWithin(
      l.location_point,
      ST_MakePoint(${lng}, ${lat})::geography,
      l.radius_meters
    ) as is_within
    FROM shifts s
    JOIN locations l ON s.location_id = l.id
    WHERE s.id = ${shiftId}
  `;

  return result.rows[0]?.is_within || false;
}
```

### Find Nearby Shifts
```typescript
async function findNearbyShifts(
  lat: number,
  lng: number,
  maxDistance: number = 5000
) {
  return await db.execute`
    SELECT
      s.*,
      l.name as location_name,
      ST_Distance(
        l.location_point,
        ST_MakePoint(${lng}, ${lat})::geography
      ) as distance
    FROM shifts s
    JOIN locations l ON s.location_id = l.id
    WHERE ST_DWithin(
      l.location_point,
      ST_MakePoint(${lng}, ${lat})::geography,
      ${maxDistance}
    )
    AND s.status = 'published'
    ORDER BY distance ASC
    LIMIT 20
  `;
}
```

## Geocoding

### Address to Coordinates
```typescript
async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
}> {
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng()
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}
```

### Reverse Geocoding
```typescript
async function getAddressFromCoords(
  lat: number,
  lng: number
): Promise<string> {
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      }
    );
  });
}
```

## Offline GPS Support

### Cache GPS Data
```typescript
class OfflineGPSManager {
  private queue: GPSCheckIn[] = [];

  async storeOfflineCheckIn(checkIn: GPSCheckIn) {
    // Store in IndexedDB for reliability
    const db = await this.openDB();
    const tx = db.transaction('gps_queue', 'readwrite');
    await tx.objectStore('gps_queue').add(checkIn);

    // Also store in localStorage as backup
    this.queue.push(checkIn);
    localStorage.setItem('gps_queue', JSON.stringify(this.queue));
  }

  async syncOfflineData() {
    if (!navigator.onLine) return;

    const db = await this.openDB();
    const tx = db.transaction('gps_queue', 'readonly');
    const queue = await tx.objectStore('gps_queue').getAll();

    for (const checkIn of queue) {
      try {
        await this.uploadCheckIn(checkIn);
        await this.removeFromQueue(checkIn.id);
      } catch (error) {
        console.error('Sync failed for:', checkIn.id);
      }
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SecuryFlexGPS', 1);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('gps_queue')) {
          db.createObjectStore('gps_queue', { keyPath: 'id' });
        }
      };
    });
  }
}
```

## GPS Accuracy Management

### Accuracy Requirements
```typescript
enum GPSAccuracyLevel {
  HIGH = 10,    // 10 meters - Check-in/out
  MEDIUM = 25,  // 25 meters - Regular tracking
  LOW = 50      // 50 meters - Background tracking
}

function getRequiredAccuracy(action: string): GPSAccuracyLevel {
  switch (action) {
    case 'check-in':
    case 'check-out':
      return GPSAccuracyLevel.HIGH;
    case 'tracking':
      return GPSAccuracyLevel.MEDIUM;
    default:
      return GPSAccuracyLevel.LOW;
  }
}
```

### Accuracy Validation
```typescript
function validateGPSAccuracy(
  accuracy: number,
  required: GPSAccuracyLevel
): boolean {
  return accuracy <= required;
}

// Retry if accuracy is poor
async function getAccuratePosition(
  requiredAccuracy: GPSAccuracyLevel,
  maxRetries: number = 3
): Promise<GeolocationPosition> {
  for (let i = 0; i < maxRetries; i++) {
    const position = await getCurrentPosition();

    if (position.coords.accuracy <= requiredAccuracy) {
      return position;
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Unable to get accurate GPS position');
}
```

## Location Permissions

### Request Permission
```typescript
async function requestLocationPermission(): Promise<PermissionState> {
  const result = await navigator.permissions.query({
    name: 'geolocation'
  });

  if (result.state === 'prompt') {
    // Trigger permission request
    await getCurrentPosition();
  }

  return result.state;
}
```

### Handle Permission Denial
```typescript
function handleLocationPermissionDenied() {
  // Show instructions for enabling location
  return (
    <Alert>
      <AlertTitle>Locatie vereist</AlertTitle>
      <AlertDescription>
        GPS locatie is vereist voor check-in.
        Ga naar instellingen om locatie in te schakelen.
      </AlertDescription>
    </Alert>
  );
}
```

## Testing

### Mock GPS
```typescript
// Mock for testing
export const mockGeolocation = {
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: 52.3676,
        longitude: 4.9041,
        accuracy: 15
      },
      timestamp: Date.now()
    });
  }),
  watchPosition: jest.fn(() => 123)
};

// Apply mock
global.navigator.geolocation = mockGeolocation;
```