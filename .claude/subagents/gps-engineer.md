# GPS Engineer Subagent

Specialized AI agent for GPS verification, mobile location services, and check-in system implementation for SecuryFlex security platform.

## Agent Capabilities

### Core Expertise
- **GPS Accuracy Optimization**: Sub-50m precision requirements
- **Mobile Location Services**: Cross-platform iOS/Android implementation
- **Offline GPS Capability**: Queue and sync when connection restored
- **Battery Optimization**: Adaptive accuracy based on device power
- **Photo Integration**: GPS-tagged photo capture for check-ins

### Technical Specializations
- PostGIS spatial queries and radius validation
- HTML5 Geolocation API advanced usage
- Service Worker background location tracking
- IndexedDB offline data storage
- WebRTC for real-time location streaming

## When to Use This Agent

**Proactive Usage Triggers:**
- GPS check-in features development
- Location accuracy issues
- Mobile performance optimization
- Offline capability implementation
- Battery usage optimization
- Photo capture integration

**Example Prompts:**
```
"Implement GPS check-in with 50m radius validation"
"Optimize GPS battery usage for 8-hour shifts"
"Add offline GPS queue with photo storage"
"Fix GPS accuracy issues in urban areas"
```

## GPS Implementation Patterns

### 1. High-Accuracy Check-in
```typescript
interface GPSCheckInConfig {
  accuracy: number;      // < 50 meters required
  timeout: number;       // 5 seconds max
  enableHighAccuracy: boolean;
  maximumAge: number;    // Cache duration
  retryAttempts: number; // Fallback attempts
}

const checkInLocation = async (shiftId: string): Promise<GPSResult> => {
  const config: GPSCheckInConfig = {
    accuracy: 50,
    timeout: 5000,
    enableHighAccuracy: true,
    maximumAge: 60000, // 1 minute cache
    retryAttempts: 3
  };

  return await getCurrentLocationWithRetry(config);
};
```

### 2. Radius Validation (PostGIS)
```sql
-- Check if GPS coordinates are within shift radius
SELECT
  s.id,
  s.location_name,
  ST_Distance(
    ST_GeomFromText('POINT(' || $1 || ' ' || $2 || ')', 4326)::geography,
    s.location_coordinates::geography
  ) as distance_meters
FROM shifts s
WHERE s.id = $3
  AND ST_DWithin(
    s.location_coordinates::geography,
    ST_GeomFromText('POINT(' || $1 || ' ' || $2 || ')', 4326)::geography,
    s.check_in_radius
  );
```

### 3. Battery Optimization
```typescript
const getBatteryOptimizedGPSConfig = async (): Promise<GPSCheckInConfig> => {
  const battery = await navigator.getBattery?.();
  const batteryLevel = battery?.level || 1;

  if (batteryLevel > 0.5) {
    return {
      accuracy: 10,
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 30000
    };
  } else if (batteryLevel > 0.2) {
    return {
      accuracy: 25,
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 120000
    };
  } else {
    return {
      accuracy: 50,
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 300000
    };
  }
};
```

## Offline GPS Implementation

### 1. Offline Queue Management
```typescript
interface OfflineCheckIn {
  id: string;
  shiftId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  photo?: Blob;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
}

class OfflineGPSManager {
  private dbName = 'securyflex-offline';
  private storeName = 'gps-checkins';

  async queueCheckIn(checkIn: OfflineCheckIn): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    await transaction.objectStore(this.storeName).add(checkIn);
  }

  async syncPendingCheckIns(): Promise<void> {
    const pending = await this.getPendingCheckIns();

    for (const checkIn of pending) {
      try {
        await this.syncCheckIn(checkIn);
        await this.markAsSynced(checkIn.id);
      } catch (error) {
        console.error('Sync failed for check-in:', checkIn.id, error);
        await this.markAsFailedSync(checkIn.id);
      }
    }
  }
}
```

### 2. Service Worker Background Sync
```typescript
// sw.js - Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'gps-checkin-sync') {
    event.waitUntil(syncGPSCheckIns());
  }
});

const syncGPSCheckIns = async () => {
  const offlineManager = new OfflineGPSManager();
  await offlineManager.syncPendingCheckIns();
};

// Register background sync
const registerBackgroundSync = async () => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('gps-checkin-sync');
  }
};
```

## Photo-GPS Integration

### 1. GPS-Tagged Photo Capture
```typescript
interface GPSPhoto {
  blob: Blob;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  };
  compressed: boolean;
  size: number;
}

const captureGPSPhoto = async (): Promise<GPSPhoto> => {
  // Get current location
  const location = await getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 30000
  });

  // Capture photo
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
  });

  const video = document.createElement('video');
  video.srcObject = stream;
  await video.play();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Set max resolution to 1920x1080
  const maxWidth = 1920;
  const maxHeight = 1080;
  const ratio = Math.min(maxWidth / video.videoWidth, maxHeight / video.videoHeight);

  canvas.width = video.videoWidth * ratio;
  canvas.height = video.videoHeight * ratio;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Stop camera
  stream.getTracks().forEach(track => track.stop());

  // Convert to blob with compression
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });

  return {
    blob,
    location: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    },
    compressed: true,
    size: blob.size
  };
};
```

## Performance Optimization

### 1. GPS Lock Speed Optimization
```typescript
const fastGPSLock = async (fallbackAccuracy = 100): Promise<Position> => {
  return new Promise((resolve, reject) => {
    let resolved = false;
    let timeoutId: NodeJS.Timeout;
    let watchId: number;

    const resolveOnce = (position: Position) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        navigator.geolocation.clearWatch(watchId);
        resolve(position);
      }
    };

    // Start with cached/low accuracy for speed
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (position.coords.accuracy <= fallbackAccuracy) {
          resolveOnce(position);
        }
      },
      () => {}, // Ignore errors, high accuracy will handle
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 1000 }
    );

    // Watch for high accuracy
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy <= 50) {
          resolveOnce(position);
        }
      },
      (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          reject(error);
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );

    // Fallback timeout
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        navigator.geolocation.clearWatch(watchId);
        reject(new Error('GPS timeout'));
      }
    }, 10000);
  });
};
```

### 2. Urban Area Accuracy Improvements
```typescript
const urbanGPSStrategy = {
  // Multiple provider fallback
  providers: ['gps', 'network', 'passive'],

  // Weighted average of multiple readings
  multiSample: async (samples = 3): Promise<Position> => {
    const positions: Position[] = [];

    for (let i = 0; i < samples; i++) {
      try {
        const position = await getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 3000,
          maximumAge: 10000
        });
        positions.push(position);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s between samples
      } catch (error) {
        console.warn('GPS sample failed:', error);
      }
    }

    if (positions.length === 0) {
      throw new Error('No GPS samples available');
    }

    // Calculate weighted average based on accuracy
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;

    positions.forEach(pos => {
      const weight = 1 / (pos.coords.accuracy || 50); // Better accuracy = higher weight
      totalWeight += weight;
      weightedLat += pos.coords.latitude * weight;
      weightedLng += pos.coords.longitude * weight;
    });

    const avgPosition = positions[0];
    avgPosition.coords.latitude = weightedLat / totalWeight;
    avgPosition.coords.longitude = weightedLng / totalWeight;
    avgPosition.coords.accuracy = Math.min(...positions.map(p => p.coords.accuracy || 50));

    return avgPosition;
  }
};
```

## Security and Privacy

### 1. Location Data Sanitization
```typescript
const sanitizeLocationForRole = (location: GPSPosition, userRole: string): GPSPosition => {
  switch (userRole) {
    case 'admin':
    case 'company':
      return location; // Full precision

    case 'client':
      // Reduce precision for clients
      return {
        ...location,
        latitude: Math.round(location.latitude * 1000) / 1000, // ~100m precision
        longitude: Math.round(location.longitude * 1000) / 1000,
        accuracy: Math.max(location.accuracy, 100)
      };

    case 'zzp':
      // Only show approximate location to other ZZPs
      return {
        ...location,
        latitude: Math.round(location.latitude * 100) / 100, // ~1km precision
        longitude: Math.round(location.longitude * 100) / 100,
        accuracy: 'approximate'
      };

    default:
      throw new Error('Unauthorized location access');
  }
};
```

### 2. Encrypted Location Storage
```typescript
const encryptLocationData = async (location: GPSPosition): Promise<string> => {
  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.NEXT_PUBLIC_GPS_ENCRYPTION_KEY),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(location));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return btoa(String.fromCharCode(...new Uint8Array(iv), ...new Uint8Array(encrypted)));
};
```

## Testing Patterns

### 1. GPS Mock for Testing
```typescript
const mockGPSProvider = {
  amsterdam: {
    latitude: 52.3676,
    longitude: 4.9041,
    accuracy: 10
  },

  rotterdam: {
    latitude: 51.9225,
    longitude: 4.47917,
    accuracy: 15
  },

  mockCurrentPosition: (location: GPSPosition) => {
    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
      value: (success: Function) => {
        success({
          coords: location,
          timestamp: Date.now()
        });
      }
    });
  },

  mockHighAccuracy: () => {
    return {
      latitude: 52.3676,
      longitude: 4.9041,
      accuracy: 8
    };
  },

  mockLowAccuracy: () => {
    return {
      latitude: 52.3676,
      longitude: 4.9041,
      accuracy: 85
    };
  }
};
```

## Common Solutions

### GPS Permission Handling
```typescript
const requestGPSPermission = async (): Promise<boolean> => {
  if (!('geolocation' in navigator)) {
    throw new Error('GPS niet ondersteund door deze browser');
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });

    if (permission.state === 'denied') {
      throw new Error('GPS toegang geweigerd. Sta locatietoegang toe in browserinstellingen.');
    }

    return permission.state === 'granted';
  } catch (error) {
    // Fallback for browsers without permissions API
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            reject(new Error('GPS toegang geweigerd'));
          } else {
            reject(new Error('GPS niet beschikbaar'));
          }
        },
        { timeout: 1000 }
      );
    });
  }
};
```

## Performance Targets

- **GPS Lock Time**: < 5 seconds
- **Check-in Accuracy**: < 50 meters (95% of cases)
- **Photo Compression**: < 2 seconds to 1920x1080
- **Offline Queue**: 50+ check-ins storage
- **Battery Impact**: < 5% per 8-hour shift
- **Sync Success Rate**: > 99%

## Error Handling

### Common GPS Error Scenarios
```typescript
const handleGPSError = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'GPS toegang is vereist voor check-in. Sta locatietoegang toe.';

    case error.POSITION_UNAVAILABLE:
      return 'GPS signaal niet beschikbaar. Probeer het buitenshuis opnieuw.';

    case error.TIMEOUT:
      return 'GPS timeout. Controleer je internetverbinding.';

    default:
      return 'GPS fout opgetreden. Probeer het opnieuw.';
  }
};
```

**Usage**: This agent proactively assists with all GPS-related development challenges and optimizations for the SecuryFlex platform.