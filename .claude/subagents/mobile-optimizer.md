# Mobile Optimizer Subagent

Specialized AI agent for PWA features, mobile performance optimization, offline capability, and battery management for SecuryFlex mobile experience.

## Agent Capabilities

### Core Expertise
- **PWA Implementation**: Service workers, app manifest, installation flow
- **Performance Optimization**: Core Web Vitals, mobile-first development
- **Offline Functionality**: IndexedDB, background sync, conflict resolution
- **Battery Management**: Adaptive performance based on device power
- **Touch Interface**: Mobile-first UI/UX with accessibility compliance

### Technical Specializations
- Service Worker advanced patterns
- IndexedDB complex queries and storage
- Background sync and push notifications
- Mobile performance profiling
- Touch gesture recognition

## When to Use This Agent

**Proactive Usage Triggers:**
- Mobile performance issues
- PWA installation problems
- Offline functionality bugs
- Battery drain concerns
- Touch interface problems
- Core Web Vitals failures

**Example Prompts:**
```
"Optimize mobile performance for 3G networks"
"Implement offline GPS check-in queue"
"Fix PWA installation prompt timing"
"Reduce battery usage during shifts"
```

## PWA Implementation

### 1. Complete Web App Manifest
```json
{
  "name": "SecuryFlex - Professional Security Staffing",
  "short_name": "SecuryFlex",
  "description": "Professional security staffing platform voor Nederland met GPS check-in en 24-uurs betalingen",
  "start_url": "/dashboard?source=pwa",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1e3a8a",
  "background_color": "#f8fafc",
  "lang": "nl",
  "scope": "/",
  "categories": ["business", "productivity", "utilities", "finance"],
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "GPS Check-in",
      "short_name": "Check-in",
      "description": "Snel inchecken bij je huidige dienst",
      "url": "/dashboard/checkin?shortcut=true",
      "icons": [
        {
          "src": "/icons/checkin-96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Mijn Diensten",
      "short_name": "Diensten",
      "description": "Bekijk je geplande en actieve diensten",
      "url": "/dashboard/shifts?shortcut=true",
      "icons": [
        {
          "src": "/icons/shifts-96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Betalingen",
      "short_name": "Geld",
      "description": "Check je saldo en betalingshistorie",
      "url": "/dashboard/payments?shortcut=true",
      "icons": [
        {
          "src": "/icons/payments-96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-dashboard.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "SecuryFlex Dashboard op mobile"
    },
    {
      "src": "/screenshots/gps-checkin.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "GPS Check-in functionaliteit"
    }
  ]
}
```

### 2. Advanced Service Worker
```typescript
// sw.js - Advanced Service Worker
const CACHE_NAME = 'securyflex-v1.2.0';
const RUNTIME_CACHE = 'securyflex-runtime';
const GPS_CACHE = 'securyflex-gps-offline';

const STATIC_RESOURCES = [
  '/',
  '/dashboard',
  '/dashboard/checkin',
  '/dashboard/shifts',
  '/offline.html',
  '/assets/main.css',
  '/assets/main.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName =>
              cacheName.startsWith('securyflex-') &&
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== GPS_CACHE
            )
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - advanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle GPS check-ins specially
  if (url.pathname.includes('/checkin')) {
    event.respondWith(handleGPSCheckIn(request));
    return;
  }

  // Handle static resources
  if (STATIC_RESOURCES.includes(url.pathname)) {
    event.respondWith(handleStaticResource(request));
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(handleDynamicRequest(request));
});

// Background sync for GPS check-ins
self.addEventListener('sync', (event) => {
  if (event.tag === 'gps-checkin-sync') {
    event.waitUntil(syncOfflineCheckIns());
  }

  if (event.tag === 'photo-sync') {
    event.waitUntil(syncOfflinePhotos());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [200, 100, 200],
    data: event.data.json(),
    actions: [
      {
        action: 'view',
        title: 'Bekijken',
        icon: '/icons/view-24.png'
      },
      {
        action: 'dismiss',
        title: 'Sluiten',
        icon: '/icons/close-24.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SecuryFlex', options)
  );
});
```

### 3. Offline Storage Management
```typescript
interface OfflineStorage {
  gps_checkins: OfflineCheckIn[];
  photos: OfflinePhoto[];
  shifts: CachedShift[];
  user_preferences: UserPreferences;
}

class OfflineStorageManager {
  private dbName = 'securyflex-offline';
  private version = 3;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // GPS check-ins store
        if (!db.objectStoreNames.contains('gps_checkins')) {
          const gpsStore = db.createObjectStore('gps_checkins', {
            keyPath: 'id',
            autoIncrement: true
          });
          gpsStore.createIndex('shiftId', 'shiftId', { unique: false });
          gpsStore.createIndex('timestamp', 'timestamp', { unique: false });
          gpsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Photos store
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', {
            keyPath: 'id',
            autoIncrement: true
          });
          photoStore.createIndex('checkinId', 'checkinId', { unique: false });
          photoStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Shifts cache
        if (!db.objectStoreNames.contains('shifts')) {
          const shiftsStore = db.createObjectStore('shifts', {
            keyPath: 'id'
          });
          shiftsStore.createIndex('status', 'status', { unique: false });
          shiftsStore.createIndex('startDate', 'start_date', { unique: false });
        }
      };
    });
  }

  async storeOfflineCheckIn(checkIn: OfflineCheckIn): Promise<void> {
    const transaction = this.db!.transaction(['gps_checkins'], 'readwrite');
    const store = transaction.objectStore('gps_checkins');

    await store.add({
      ...checkIn,
      syncStatus: 'pending',
      createdAt: new Date().toISOString()
    });
  }

  async getPendingCheckIns(): Promise<OfflineCheckIn[]> {
    const transaction = this.db!.transaction(['gps_checkins'], 'readonly');
    const store = transaction.objectStore('gps_checkins');
    const index = store.index('syncStatus');

    return new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async syncCheckIn(checkIn: OfflineCheckIn): Promise<void> {
    try {
      // Attempt to sync with server
      const response = await fetch('/api/gps/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkIn)
      });

      if (response.ok) {
        await this.markCheckInSynced(checkIn.id);
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      await this.markCheckInFailed(checkIn.id);
      throw error;
    }
  }

  async clearSyncedData(olderThan: Date): Promise<void> {
    const transaction = this.db!.transaction(['gps_checkins', 'photos'], 'readwrite');

    // Clean old synced check-ins
    const gpsStore = transaction.objectStore('gps_checkins');
    const gpsIndex = gpsStore.index('timestamp');

    const gpsRequest = gpsIndex.openCursor(
      IDBKeyRange.upperBound(olderThan.toISOString())
    );

    gpsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        if (cursor.value.syncStatus === 'synced') {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}
```

## Performance Optimization

### 1. Core Web Vitals Optimization
```typescript
// Performance monitoring and optimization
class PerformanceOptimizer {
  private observer: PerformanceObserver | null = null;
  private metrics: Map<string, number> = new Map();

  init(): void {
    // Monitor Core Web Vitals
    this.observeLCP(); // Largest Contentful Paint
    this.observeFID(); // First Input Delay
    this.observeCLS(); // Cumulative Layout Shift
    this.observeFCP(); // First Contentful Paint
    this.observeTTI(); // Time to Interactive
  }

  private observeLCP(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.metrics.set('lcp', lastEntry.startTime);

      // Alert if LCP > 2.5s
      if (lastEntry.startTime > 2500) {
        this.reportSlowLCP(lastEntry);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private observeFID(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        this.metrics.set('fid', fid);

        // Alert if FID > 100ms
        if (fid > 100) {
          this.reportSlowFID(entry);
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  private observeCLS(): void {
    let clsValue = 0;

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }

      this.metrics.set('cls', clsValue);

      // Alert if CLS > 0.1
      if (clsValue > 0.1) {
        this.reportHighCLS(clsValue);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Resource loading optimization
  preloadCriticalResources(): void {
    const criticalResources = [
      '/assets/critical.css',
      '/assets/main.js',
      '/api/user/profile',
      '/api/shifts/active'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;

      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  }

  // Image optimization
  optimizeImages(): void {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}
```

### 2. Mobile-First Responsive Design
```css
/* Mobile-first breakpoints and optimizations */
:root {
  /* Touch-friendly sizing */
  --touch-target-min: 44px;
  --mobile-font-base: 16px; /* Prevents iOS zoom */
  --mobile-line-height: 1.5;

  /* Performance-optimized animations */
  --fast-transition: 0.2s ease-out;
  --medium-transition: 0.3s ease-out;

  /* Battery-saving reduced motion */
  --motion-duration: 0.3s;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration: 0.01s;
  }

  * {
    animation-duration: 0.01s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01s !important;
  }
}

/* Mobile-optimized button styles */
.btn-mobile {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  padding: 12px 24px;
  font-size: var(--mobile-font-base);
  line-height: var(--mobile-line-height);

  /* Prevent iOS button styling */
  -webkit-appearance: none;
  border-radius: 8px;

  /* Touch feedback */
  transition: transform var(--fast-transition),
              background-color var(--fast-transition);
}

.btn-mobile:active {
  transform: scale(0.98);
}

/* GPS check-in button - prominent on mobile */
.btn-gps-checkin {
  width: 100%;
  height: 64px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Mobile navigation */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;

  /* Safe area for iPhone notch */
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
  padding: 8px;
  text-decoration: none;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.mobile-nav-item.active {
  color: #1e3a8a;
}

.mobile-nav-icon {
  width: 24px;
  height: 24px;
}

/* Mobile-optimized form inputs */
.form-input-mobile {
  font-size: var(--mobile-font-base); /* Prevents iOS zoom */
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: border-color var(--fast-transition);
}

.form-input-mobile:focus {
  border-color: #1e3a8a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

/* Loading states optimized for mobile */
.loading-spinner-mobile {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #1e3a8a;
  border-radius: 50%;
  animation: spin var(--motion-duration) linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Skeleton loading for better perceived performance */
.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 3. Battery Optimization
```typescript
class BatteryOptimizer {
  private battery: any = null;
  private optimizationLevel: 'normal' | 'power-saver' | 'extreme' = 'normal';

  async init(): Promise<void> {
    if ('getBattery' in navigator) {
      this.battery = await (navigator as any).getBattery();
      this.updateOptimizationLevel();

      // Listen for battery changes
      this.battery.addEventListener('levelchange', () => {
        this.updateOptimizationLevel();
      });

      this.battery.addEventListener('chargingchange', () => {
        this.updateOptimizationLevel();
      });
    }
  }

  private updateOptimizationLevel(): void {
    if (!this.battery) return;

    const level = this.battery.level;
    const charging = this.battery.charging;

    if (charging) {
      this.optimizationLevel = 'normal';
    } else if (level <= 0.15) { // 15%
      this.optimizationLevel = 'extreme';
    } else if (level <= 0.30) { // 30%
      this.optimizationLevel = 'power-saver';
    } else {
      this.optimizationLevel = 'normal';
    }

    this.applyOptimizations();
  }

  private applyOptimizations(): void {
    switch (this.optimizationLevel) {
      case 'extreme':
        this.applyExtremeOptimizations();
        break;
      case 'power-saver':
        this.applyPowerSaverOptimizations();
        break;
      case 'normal':
        this.applyNormalOptimizations();
        break;
    }
  }

  private applyExtremeOptimizations(): void {
    // Disable animations
    document.body.classList.add('reduce-motion');

    // Reduce GPS accuracy
    this.setGPSAccuracy(false, 300000); // 5 minutes cache

    // Disable background sync
    this.disableBackgroundSync();

    // Reduce refresh rates
    this.setRefreshInterval(300000); // 5 minutes

    // Show battery warning
    this.showBatteryWarning('Extreme power saving active');
  }

  private applyPowerSaverOptimizations(): void {
    // Reduce animation frequency
    document.body.classList.add('reduced-animations');

    // Moderate GPS accuracy
    this.setGPSAccuracy(false, 120000); // 2 minutes cache

    // Reduce sync frequency
    this.setBackgroundSyncInterval(180000); // 3 minutes

    // Reduce refresh rates
    this.setRefreshInterval(120000); // 2 minutes

    // Show power saver notification
    this.showBatteryNotification('Power saving mode active');
  }

  private applyNormalOptimizations(): void {
    // Normal performance
    document.body.classList.remove('reduce-motion', 'reduced-animations');

    // High GPS accuracy
    this.setGPSAccuracy(true, 30000); // 30 seconds cache

    // Normal sync frequency
    this.setBackgroundSyncInterval(60000); // 1 minute

    // Normal refresh rates
    this.setRefreshInterval(30000); // 30 seconds

    // Clear battery notifications
    this.clearBatteryNotifications();
  }

  getOptimizedGPSConfig(): GeolocationOptions {
    switch (this.optimizationLevel) {
      case 'extreme':
        return {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 600000 // 10 minutes
        };
      case 'power-saver':
        return {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        };
      default:
        return {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000 // 1 minute
        };
    }
  }
}
```

## Touch Interface Optimization

### 1. Touch Gesture Handling
```typescript
class TouchGestureHandler {
  private startX: number = 0;
  private startY: number = 0;
  private threshold: number = 50; // Minimum distance for swipe

  init(element: HTMLElement): void {
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }

  private handleTouchStart(e: TouchEvent): void {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  }

  private handleTouchMove(e: TouchEvent): void {
    // Prevent scrolling during horizontal swipes
    const deltaX = Math.abs(e.touches[0].clientX - this.startX);
    const deltaY = Math.abs(e.touches[0].clientY - this.startY);

    if (deltaX > deltaY && deltaX > this.threshold) {
      e.preventDefault();
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.threshold) {
      if (deltaX > 0) {
        this.handleSwipeRight();
      } else {
        this.handleSwipeLeft();
      }
    } else if (Math.abs(deltaY) > this.threshold) {
      if (deltaY > 0) {
        this.handleSwipeDown();
      } else {
        this.handleSwipeUp();
      }
    }
  }

  private handleSwipeRight(): void {
    // Navigate back
    if (window.history.length > 1) {
      window.history.back();
    }
  }

  private handleSwipeLeft(): void {
    // Open navigation menu
    document.dispatchEvent(new CustomEvent('toggleMenu'));
  }

  private handleSwipeDown(): void {
    // Refresh page content
    document.dispatchEvent(new CustomEvent('refreshContent'));
  }

  private handleSwipeUp(): void {
    // Show quick actions
    document.dispatchEvent(new CustomEvent('showQuickActions'));
  }
}
```

### 2. Accessible Touch Targets
```typescript
class AccessibilityOptimizer {
  checkTouchTargets(): TouchTargetReport {
    const elements = document.querySelectorAll('button, a, input, [role="button"]');
    const issues: TouchTargetIssue[] = [];
    const minSize = 44; // 44px minimum as per WCAG

    elements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);

      if (size < minSize) {
        issues.push({
          element: element.tagName.toLowerCase(),
          selector: this.getSelector(element),
          currentSize: size,
          requiredSize: minSize,
          severity: size < 32 ? 'high' : 'medium'
        });
      }
    });

    return {
      totalElements: elements.length,
      compliantElements: elements.length - issues.length,
      issues,
      complianceRate: ((elements.length - issues.length) / elements.length) * 100
    };
  }

  optimizeTouchTargets(): void {
    const issues = this.checkTouchTargets().issues;

    issues.forEach(issue => {
      const element = document.querySelector(issue.selector) as HTMLElement;
      if (element) {
        // Add padding to reach minimum size
        const currentSize = Math.min(
          element.offsetWidth,
          element.offsetHeight
        );

        const padding = Math.max(0, (44 - currentSize) / 2);

        element.style.padding = `${Math.max(12, padding)}px`;
        element.style.minWidth = '44px';
        element.style.minHeight = '44px';
      }
    });
  }

  addTouchFeedback(): void {
    const interactiveElements = document.querySelectorAll(
      'button, a, [role="button"], input[type="submit"]'
    );

    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      }, { passive: true });

      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      }, { passive: true });
    });
  }

  private getSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
}
```

## Performance Monitoring

### 1. Real-Time Performance Tracking
```typescript
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private thresholds = {
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    fcp: 1800, // 1.8s
    tti: 3500  // 3.5s
  };

  startMonitoring(): void {
    this.monitorNetworkConditions();
    this.monitorMemoryUsage();
    this.monitorBatteryStatus();
    this.monitorRenderPerformance();
  }

  private monitorNetworkConditions(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      this.metrics.networkType = connection.effectiveType;
      this.metrics.downlink = connection.downlink;
      this.metrics.rtt = connection.rtt;

      // Adjust performance based on network
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.enableLowBandwidthMode();
      }
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;

      this.metrics.memoryUsed = memory.usedJSHeapSize;
      this.metrics.memoryTotal = memory.totalJSHeapSize;
      this.metrics.memoryLimit = memory.jsHeapSizeLimit;

      // Alert if memory usage is high
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      if (usage > 0.8) {
        this.alertHighMemoryUsage(usage);
      }
    }
  }

  private monitorRenderPerformance(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrame = (currentTime: number) => {
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        this.metrics.fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // Alert if FPS is low
        if (this.metrics.fps < 30) {
          this.alertLowFPS(this.metrics.fps);
        }
      }

      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  }

  generatePerformanceReport(): PerformanceReport {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      recommendations: this.generateRecommendations(),
      score: this.calculatePerformanceScore()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.lcp > this.thresholds.lcp) {
      recommendations.push('Optimize Largest Contentful Paint - consider image optimization');
    }

    if (this.metrics.fid > this.thresholds.fid) {
      recommendations.push('Reduce First Input Delay - minimize JavaScript execution');
    }

    if (this.metrics.cls > this.thresholds.cls) {
      recommendations.push('Improve Cumulative Layout Shift - ensure proper image dimensions');
    }

    if (this.metrics.fps < 30) {
      recommendations.push('Improve render performance - reduce complex animations');
    }

    if (this.metrics.memoryUsed / this.metrics.memoryLimit > 0.7) {
      recommendations.push('Optimize memory usage - clear unused objects');
    }

    return recommendations;
  }
}
```

## Performance Targets

- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.5s
- **GPS Lock Time**: < 5s
- **Photo Compression**: < 2s
- **Touch Response**: < 100ms
- **PWA Install**: < 10s prompt
- **Offline Capability**: 100% for GPS
- **Battery Impact**: < 5% per 8h shift

**Usage**: This agent proactively optimizes all mobile performance aspects and ensures PWA compliance for SecuryFlex mobile experience.