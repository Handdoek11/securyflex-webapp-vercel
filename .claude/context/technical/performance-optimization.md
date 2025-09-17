# Performance Optimization Context Bundle

## Overview
Performance optimization strategies for SecuryFlex focusing on mobile-first experience for ZZP users.

## Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

### Mobile Performance
- Initial load: < 3s on 3G
- GPS check-in: < 2s response
- Photo upload: < 5s complete
- Offline capability: 100%

## Next.js Optimization

### App Router Configuration
```typescript
// app/layout.tsx
export const metadata = {
  metadataBase: new URL('https://securyflex.nl'),
  openGraph: {
    images: ['/og-image.jpg'],
  },
};

// Preload critical fonts
export const fontOptimization = {
  preload: true,
  display: 'swap',
  adjustFontFallback: true,
};
```

### Dynamic Imports
```typescript
// Lazy load heavy components
const MapComponent = dynamic(
  () => import('@/components/MapView'),
  {
    loading: () => <MapSkeleton />,
    ssr: false
  }
);

// Lazy load modals
const PhotoModal = dynamic(
  () => import('@/components/PhotoModal'),
  { ssr: false }
);
```

## Image Optimization

### Next/Image Configuration
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['supabase.co'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

// Usage
<Image
  src={photoUrl}
  alt="Check-in photo"
  width={400}
  height={300}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurUrl}
/>
```

### Photo Upload Optimization
```typescript
// Compress before upload
async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');

  // Max 1920x1080 for photos
  const maxWidth = 1920;
  const maxHeight = 1080;

  let { width, height } = bitmap;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width *= ratio;
    height *= ratio;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      0.85 // 85% quality
    );
  });
}
```

## Database Query Optimization

### Efficient Queries
```typescript
// Use select to limit fields
const shifts = await db
  .select({
    id: shiftsSchema.id,
    startDatetime: shiftsSchema.startDatetime,
    location: locationsSchema.name,
    hourlyRate: shiftsSchema.hourlyRate
  })
  .from(shiftsSchema)
  .leftJoin(locationsSchema, eq(shiftsSchema.locationId, locationsSchema.id))
  .where(eq(shiftsSchema.status, 'published'))
  .limit(20);

// Use indexes for common queries
// CREATE INDEX idx_shifts_status_date ON shifts(status, start_datetime);
```

### Connection Pooling
```typescript
// Optimize connection pool
const pool = postgres(DATABASE_URL, {
  max: 20,              // Max connections
  idle_timeout: 20,     // Close idle connections
  connect_timeout: 10,  // Connection timeout
  statement_timeout: 30000, // 30s query timeout
});
```

## Caching Strategy

### Edge Caching
```typescript
// Cache static data at edge
export const revalidate = 3600; // 1 hour

// Cache dynamic data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59',
    },
  });
}
```

### React Query Configuration
```typescript
// Optimistic updates
const mutation = useMutation({
  mutationFn: updateShift,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['shifts']);
    const previous = queryClient.getQueryData(['shifts']);
    queryClient.setQueryData(['shifts'], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['shifts'], context.previous);
  },
});

// Stale-while-revalidate
const { data } = useQuery({
  queryKey: ['shifts'],
  queryFn: fetchShifts,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## Bundle Optimization

### Code Splitting
```typescript
// Route-based splitting (automatic with App Router)
// Component-based splitting
const HeavyComponent = lazy(() =>
  import(/* webpackChunkName: "heavy" */ './HeavyComponent')
);

// Conditional loading
if (userRole === 'admin') {
  const AdminModule = await import('./admin');
  AdminModule.initialize();
}
```

### Tree Shaking
```typescript
// Import only what's needed
import { format } from 'date-fns/format';
// Not: import * as dateFns from 'date-fns';

// Use barrel exports carefully
export { validateGPS } from './gps';
export { calculatePayment } from './payment';
```

## PWA Configuration

### Service Worker
```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
        '/icons/icon-192.png',
      ]);
    })
  );
});

// Offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('/offline');
    })
  );
});
```

### Offline GPS Queue
```typescript
// Store GPS data offline
class OfflineGPSQueue {
  async add(checkIn: GPSCheckIn) {
    const queue = await this.getQueue();
    queue.push(checkIn);
    localStorage.setItem('gps_queue', JSON.stringify(queue));
  }

  async sync() {
    if (!navigator.onLine) return;

    const queue = await this.getQueue();
    for (const checkIn of queue) {
      try {
        await api.submitCheckIn(checkIn);
        await this.remove(checkIn.id);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
}
```

## Mobile Optimization

### Touch Optimization
```css
/* Increase touch targets */
.btn-touch {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Prevent double-tap zoom */
button {
  touch-action: manipulation;
}

/* Smooth scrolling */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
```

### GPS Battery Optimization
```typescript
// Adaptive GPS accuracy
const getGPSOptions = (battery: number): PositionOptions => {
  if (battery < 20) {
    return {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000 // Use cached position
    };
  }

  return {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
};
```

## Monitoring

### Performance Tracking
```typescript
// Web Vitals reporting
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

### Error Tracking
```typescript
// Sentry configuration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    delete event.user?.email;
    return event;
  },
});
```

## Performance Commands

```bash
# Analyze bundle
npm run analyze

# Lighthouse CI
npm run lighthouse

# Performance profiling
npm run profile

# Build optimization report
npm run build:report
```