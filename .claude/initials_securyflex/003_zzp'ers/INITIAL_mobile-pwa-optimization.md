# INITIAL: Mobile PWA Optimization & Offline Capabilities

## FEATURE:
Transform SecuryFlex into a fully functional Progressive Web App (PWA) with native app-like capabilities including offline GPS check-ins, service worker implementation for caching and background sync, push notifications for real-time updates, and app install prompts. The PWA must achieve <3 seconds load time on 3G networks and support offline functionality for critical features.

**Specific Requirements:**
- Complete PWA implementation with service worker for caching and offline functionality
- Offline GPS check-in capability with background sync when connectivity restored
- Push notification system for shift alerts, payment updates, and emergency communications
- App install prompt with native app-like installation experience
- Performance optimization achieving <3 seconds initial load on 3G networks
- Background sync for queued actions (check-ins, messages, applications)
- Native-like UI animations and transitions for enhanced user experience

## EXAMPLES:
Reference these existing patterns and implementations:

**PWA Infrastructure Foundation:**
- `CLAUDE.md` Performance targets: <3s page load on 3G, <2s GPS check-in completion
- Web App Manifest with app installation configuration
- Service worker registration and lifecycle management patterns

**Offline GPS Integration:**
- `src/types/GPS.ts`: Offline GPS functionality interfaces
- `src/hooks/useRealtimeGPS.ts`: Location tracking with offline support
- IndexedDB for local check-in queue storage

**Real-time Features with Offline:**
- `src/hooks/useRealtimeShifts.ts`: Shift updates with offline handling
- WebSocket connection management with automatic reconnection
- Background sync for queued offline actions

**Mobile-First Optimization:**
- Touch target optimization (44px minimum) for mobile interface
- Progressive image loading and compression
- Code splitting by user type and feature

## DOCUMENTATION:
**PWA Requirements:**
- Web App Manifest specification for app installation
- Service Worker API for offline functionality and caching
- Push API and Notification API for real-time communications
- Background Sync API for queued offline actions

**Performance Optimization:**
- `CLAUDE.md` Critical performance targets for mobile users (80% of traffic)
- Core Web Vitals optimization (LCP, FID, CLS)
- Network-aware loading strategies for 3G networks
- Critical resource prioritization and preloading

**Browser Support:**
- iOS Safari PWA support and limitations handling
- Android Chrome full PWA feature support
- Feature detection and progressive enhancement

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Service Worker Strategy**: Static asset caching, API response caching with TTL, offline fallback pages, cache invalidation strategies
2. **Offline GPS System**: Local storage for check-in attempts, photo caching, location queue management, background sync when online
3. **Push Notifications**: VAPID key configuration, user subscription management, notification categorization (urgent/normal)
4. **Installation Experience**: Custom install prompt, splash screen customization, app icon optimization, onboarding flow
5. **Performance Optimization**: Code splitting, lazy loading, critical path prioritization, 3G network adaptation

**Common Pitfalls to Avoid:**
- Don't cache everything - be strategic about cache storage limits (quota management)
- Don't implement PWA without proper fallback for unsupported browsers
- Don't skip push notification permission handling and user education
- Don't forget iOS Safari PWA limitations and workarounds
- Don't overlook cache invalidation - stale data causes user confusion

**File Structure Requirements:**
```
public/
├── sw.js                    # Service worker main file
├── manifest.json           # Web app manifest
├── icons/                  # App icons (various sizes)
└── offline.html            # Offline fallback page

src/lib/pwa/
├── serviceWorker.ts        # Service worker registration
├── notifications.ts        # Push notification management
├── offline.ts              # Offline state management
├── install.ts              # App installation prompts
└── cache.ts                # Caching strategies

src/components/pwa/
├── InstallPrompt.tsx       # App installation banner
├── OfflineIndicator.tsx    # Network status display
├── NotificationSettings.tsx # Push notification preferences
└── OfflineQueue.tsx        # Pending action display
```

**Offline Functionality Priorities:**
1. **Critical**: GPS check-in/out, shift viewing, emergency contacts
2. **Important**: Job browsing, message reading, payment status
3. **Nice-to-have**: Job applications, analytics viewing
4. **Online-only**: Real-time chat, live tracking, payment processing

**Testing Requirements:**
- PWA audit using Lighthouse (score >90)
- Offline functionality testing across different scenarios
- Push notification testing on iOS/Android devices
- Installation flow testing on various browsers
- Performance testing on 3G networks and low-end devices

**Integration Dependencies:**
- Must work seamlessly with GPS tracking system
- Must maintain real-time functionality when online
- Must support multi-user type experience (ZZP, Company, Client)
- Must preserve offline data across app updates

**Recommended Agent:** @mobile-optimizer for PWA features, @performance-auditor for 3G optimization