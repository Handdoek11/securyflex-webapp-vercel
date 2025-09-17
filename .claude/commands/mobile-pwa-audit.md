# Mobile PWA Audit Command

Comprehensive Progressive Web App audit for SecuryFlex mobile performance, offline capability, and installation experience.

## Usage

```
/mobile-pwa-audit [focus]
```

## Audit Focus Areas

- `performance` - Core Web Vitals and mobile performance (default)
- `pwa` - PWA installation and service worker functionality
- `offline` - Offline capability and data sync
- `install` - Installation flow and app store readiness
- `battery` - Battery optimization and resource usage
- `accessibility` - Mobile accessibility compliance

## PWA Audit Process

### 1. Core Web Vitals Assessment
```bash
# Test mobile performance metrics
npm run audit:core-web-vitals
```

**Metrics Evaluated:**
- ✅ First Contentful Paint (FCP) < 1.8s
- ✅ Time to Interactive (TTI) < 3.5s
- ✅ Largest Contentful Paint (LCP) < 2.5s
- ✅ Cumulative Layout Shift (CLS) < 0.1
- ✅ First Input Delay (FID) < 100ms

### 2. PWA Installation Testing
```bash
# Test PWA install prompt and functionality
npm run audit:pwa-install
```

**Installation Validation:**
- ✅ Web App Manifest complete and valid
- ✅ Service Worker registration
- ✅ Install prompt triggers within 10s
- ✅ Offline page functionality
- ✅ App shortcuts working

### 3. Offline Capability Audit
```bash
# Test offline functionality and sync
npm run audit:offline-capability
```

**Offline Features:**
- ✅ GPS check-ins queue when offline
- ✅ Photo storage in IndexedDB
- ✅ Shift data available offline
- ✅ Sync when connection restored
- ✅ Conflict resolution for data

### 4. Mobile Performance Testing
```bash
# Test on various mobile devices and connections
npm run audit:mobile-performance
```

**Device Testing:**
- iPhone SE (375px) - Budget device simulation
- iPhone 12 Pro (390px) - Modern iOS
- Samsung Galaxy S20 (360px) - Android flagship
- Pixel 5 (393px) - Google reference
- Slow 3G connection simulation

## Performance Benchmarks

### Critical User Journey Times
```typescript
const performanceTargets = {
  // ZZP Primary Journeys
  gpsCheckIn: {
    target: '< 2 seconds',
    includes: ['GPS lock', 'photo capture', 'upload']
  },
  shiftView: {
    target: '< 1 second',
    includes: ['shift list load', 'status display']
  },

  // Company Journeys
  shiftCreation: {
    target: '< 30 seconds',
    includes: ['form load', 'validation', 'submission']
  },

  // Client Journeys
  serviceRequest: {
    target: '< 45 seconds',
    includes: ['request form', 'submission', 'confirmation']
  }
};
```

### Mobile Device Performance
```javascript
// Test on simulated devices
const deviceProfiles = {
  lowEnd: {
    cpu: '4x slowdown',
    memory: '512MB',
    network: 'Slow 3G'
  },
  midRange: {
    cpu: '2x slowdown',
    memory: '2GB',
    network: '4G'
  },
  highEnd: {
    cpu: 'No throttling',
    memory: '8GB',
    network: '5G'
  }
};
```

## Web App Manifest Validation

### Complete Manifest Check
```json
{
  "name": "SecuryFlex - Beveiliging",
  "short_name": "SecuryFlex",
  "description": "Professional security staffing platform voor Nederland",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1e3a8a",
  "background_color": "#f8fafc",
  "lang": "nl",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "GPS Check-in",
      "short_name": "Check-in",
      "description": "Snel inchecken bij je dienst",
      "url": "/dashboard/checkin",
      "icons": [{ "src": "/icons/checkin-96.png", "sizes": "96x96" }]
    },
    {
      "name": "Mijn Diensten",
      "short_name": "Diensten",
      "description": "Bekijk je geplande diensten",
      "url": "/dashboard/shifts",
      "icons": [{ "src": "/icons/shifts-96.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["business", "productivity", "utilities"]
}
```

## Service Worker Testing

### Caching Strategy Validation
```typescript
describe('Service Worker Caching', () => {
  it('should cache critical resources', async () => {
    const cache = await caches.open('securyflex-v1');
    const cachedRequests = await cache.keys();

    const criticalResources = [
      '/dashboard',
      '/dashboard/checkin',
      '/assets/main.css',
      '/assets/main.js',
      '/offline.html'
    ];

    criticalResources.forEach(resource => {
      expect(cachedRequests.some(req => req.url.includes(resource))).toBe(true);
    });
  });

  it('should serve offline fallback', async () => {
    // Simulate offline
    self.registration.serviceWorker.postMessage('GO_OFFLINE');

    const response = await fetch('/dashboard/shifts');
    const text = await response.text();

    expect(text).toContain('offline');
    expect(response.status).toBe(200);
  });
});
```

### Background Sync Testing
```typescript
it('should queue GPS check-ins for background sync', async () => {
  // Simulate offline check-in
  await performOfflineCheckIn({
    shiftId: 'test-shift-1',
    location: { lat: 52.3676, lng: 4.9041 },
    photo: mockPhotoBlob
  });

  // Verify queued in IndexedDB
  const queuedCheckIns = await getQueuedCheckIns();
  expect(queuedCheckIns.length).toBe(1);

  // Simulate coming back online
  self.registration.serviceWorker.postMessage('GO_ONLINE');

  // Wait for background sync
  await waitFor(() => expect(getQueuedCheckIns()).resolves.toHaveLength(0));
});
```

## Offline Functionality Testing

### GPS Check-in Offline
```typescript
describe('Offline GPS Check-in', () => {
  beforeEach(() => {
    // Simulate offline mode
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
  });

  it('should store check-in data locally', async () => {
    const checkInData = {
      shiftId: 'shift_123',
      timestamp: new Date().toISOString(),
      location: { latitude: 52.3676, longitude: 4.9041 },
      photo: mockPhotoBlob
    };

    await performCheckIn(checkInData);

    const storedData = await getOfflineCheckIns();
    expect(storedData).toHaveLength(1);
    expect(storedData[0].shiftId).toBe('shift_123');
  });

  it('should sync when coming back online', async () => {
    // Store offline check-in
    await storeOfflineCheckIn(mockCheckInData);

    // Simulate coming online
    Object.defineProperty(navigator, 'onLine', { value: true });
    window.dispatchEvent(new Event('online'));

    // Wait for sync
    await waitFor(() => {
      expect(getOfflineCheckIns()).resolves.toHaveLength(0);
    });
  });
});
```

### Photo Storage Testing
```typescript
it('should store photos in IndexedDB when offline', async () => {
  const photoBlob = new Blob(['photo data'], { type: 'image/jpeg' });

  await storeOfflinePhoto('check-in-123', photoBlob);

  const retrievedPhoto = await getOfflinePhoto('check-in-123');
  expect(retrievedPhoto.size).toBe(photoBlob.size);
  expect(retrievedPhoto.type).toBe('image/jpeg');
});
```

## Installation Flow Testing

### Install Prompt Testing
```typescript
describe('PWA Installation', () => {
  it('should show install prompt after 10 seconds', async () => {
    // Mock beforeinstallprompt event
    const installPromptEvent = new Event('beforeinstallprompt');
    window.dispatchEvent(installPromptEvent);

    // Wait for install prompt to appear
    await waitFor(() => {
      expect(screen.getByText('App installeren')).toBeVisible();
    }, { timeout: 11000 });
  });

  it('should handle install acceptance', async () => {
    const mockPrompt = {
      prompt: jest.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    };

    window.deferredPrompt = mockPrompt;

    const installButton = screen.getByText('Installeer App');
    fireEvent.click(installButton);

    expect(mockPrompt.prompt).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText('Installeer App')).not.toBeInTheDocument();
    });
  });
});
```

### App Store Readiness
```typescript
it('should meet PWA criteria for app stores', () => {
  const criteria = {
    manifest: isManifestValid(),
    serviceWorker: isServiceWorkerRegistered(),
    https: isServedOverHTTPS(),
    responsive: isResponsiveDesign(),
    offline: hasOfflineCapability(),
    performance: meetsPerformanceThresholds()
  };

  Object.values(criteria).forEach(criterion => {
    expect(criterion).toBe(true);
  });
});
```

## Battery Optimization Testing

### GPS Battery Usage
```typescript
describe('Battery Optimization', () => {
  it('should reduce GPS accuracy on low battery', () => {
    mockBatteryLevel(15); // 15% battery

    const gpsOptions = getGPSOptions();

    expect(gpsOptions.enableHighAccuracy).toBe(false);
    expect(gpsOptions.timeout).toBeGreaterThan(10000);
    expect(gpsOptions.maximumAge).toBeGreaterThan(300000);
  });

  it('should disable background location on very low battery', () => {
    mockBatteryLevel(5); // 5% battery

    const locationService = getLocationService();

    expect(locationService.backgroundTracking).toBe(false);
    expect(locationService.updateInterval).toBeGreaterThan(600000); // 10+ minutes
  });
});
```

### Resource Usage Monitoring
```typescript
it('should monitor and limit resource usage', async () => {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;

  // Perform intensive operations
  await performHeavyOperations();

  const finalMemory = performance.memory?.usedJSHeapSize || 0;
  const memoryIncrease = finalMemory - initialMemory;

  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
});
```

## Accessibility Testing

### Mobile Touch Targets
```typescript
describe('Mobile Accessibility', () => {
  it('should have touch targets of at least 44px', () => {
    const buttons = document.querySelectorAll('button, a[role="button"]');

    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
    });
  });

  it('should be navigable with screen reader', async () => {
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"]');
    expect(landmarks.length).toBeGreaterThan(0);

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
  });
});
```

## Performance Report

### Lighthouse Audit Results
```json
{
  "audit_id": "pwa_20241215_001",
  "timestamp": "2024-12-15T10:30:00Z",
  "focus": "performance",
  "device": "mobile",
  "results": {
    "performance": {
      "score": 95,
      "fcp": "1.6s",
      "lcp": "2.1s",
      "tti": "3.2s",
      "cls": "0.05",
      "fid": "45ms"
    },
    "pwa": {
      "score": 100,
      "installable": true,
      "offline_ready": true,
      "manifest_valid": true,
      "service_worker": true
    },
    "accessibility": {
      "score": 98,
      "color_contrast": "pass",
      "touch_targets": "pass",
      "screen_reader": "pass"
    },
    "best_practices": {
      "score": 92,
      "https": true,
      "no_vulnerabilities": true,
      "browser_errors": 0
    }
  },
  "user_journeys": {
    "gps_checkin": "1.8s ✅",
    "shift_creation": "28s ✅",
    "service_request": "42s ✅"
  },
  "offline_capabilities": {
    "gps_queue": "50 check-ins ✅",
    "photo_storage": "100MB capacity ✅",
    "sync_reliability": "100% ✅"
  }
}
```

## CI/CD Integration

### Mobile Performance Pipeline
```yaml
# .github/workflows/mobile-audit.yml
- name: Mobile PWA Audit
  run: |
    npm run audit:mobile-performance
    npm run audit:pwa-install
    npm run audit:offline-capability
    npm run audit:battery-optimization
```

### Lighthouse CI
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        'http://localhost:3000/dashboard',
        'http://localhost:3000/dashboard/checkin',
        'http://localhost:3000/dashboard/shifts'
      ]
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }]
      }
    }
  }
};
```

## Success Criteria

Mobile PWA audit passes when:
1. ✅ Core Web Vitals meet thresholds
2. ✅ PWA installation works flawlessly
3. ✅ Offline functionality 100% operational
4. ✅ Battery optimization effective
5. ✅ Accessibility compliance achieved
6. ✅ User journey times under targets

**Usage**: Run before mobile releases and during performance optimization cycles.