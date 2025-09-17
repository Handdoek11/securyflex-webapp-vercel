# INITIAL: Multi-Channel Notification & Communication System

## FEATURE:
Build a comprehensive notification and communication system supporting push notifications, SMS, email, and in-app messaging across all user types (ZZP, Company, Client) with real-time delivery, user preference management, emergency escalation procedures, and integration with all SecuryFlex features. The system must handle shift updates, payment notifications, incident alerts, job matches, and emergency communications with 99.9% delivery reliability and <100ms real-time message delivery.

**Specific Requirements:**
- Multi-channel notification delivery (push, SMS, email, in-app)
- Real-time messaging between companies, ZZP professionals, and clients
- User preference management with granular notification controls
- Emergency notification system with automatic escalation
- Template-based notifications for different event types
- Notification history and read receipt tracking
- Integration with all SecuryFlex features (GPS, payments, shifts, incidents)
- GDPR-compliant notification data handling and user consent management

## EXAMPLES:
Reference these existing patterns and implementations:

**Real-time Communication Foundation:**
- `src/hooks/useRealtimeShifts.ts`: Real-time subscription patterns for live notifications
- WebSocket integration for immediate message delivery (<100ms)
- Supabase real-time subscription architecture for live updates

**User Management Integration:**
- `src/types/User.ts`: User preference and communication settings
- Role-based notification routing (ZZP mobile, Company desktop, Client portal)
- Organization-scoped notification distribution for multi-tenant architecture

**Notification Categories:**
- Shift notifications (assignment, reminder, check-in alerts, completion)
- Payment notifications (processing, completed, failed, 24-hour guarantee)
- Incident alerts (creation, updates, resolution, emergency escalation)
- Job matching (new opportunities, applications, assignments)
- System notifications (maintenance, updates, compliance alerts)

**Mobile Integration Patterns:**
- Push notification registration with VAPID keys
- App badge count updates for unread messages
- Notification action handling (approve, decline, view, respond)

## DOCUMENTATION:
**Performance Requirements:**
- `CLAUDE.md` Real-time communication specifications: <100ms delivery, 99.9% reliability
- Emergency notification delivery: <30 seconds to all stakeholders
- Push notification registration: <5 seconds on app install

**Technical Architecture:**
- Multi-channel delivery with failover mechanisms
- Template engine for localized notifications (Dutch/English)
- Notification queue management with retry logic
- User preference storage and validation

**Compliance & Privacy:**
- GDPR consent management for communication preferences
- Data retention policies for notification history
- Opt-out mechanisms for non-essential communications
- Audit trails for emergency notifications

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Multi-Channel Delivery**: Push notifications for mobile, email for desktop, SMS for emergencies, in-app for real-time updates
2. **Real-time Messaging**: WebSocket connections, automatic reconnection, message queuing for offline users
3. **Emergency Escalation**: Automatic authority notification, escalation timers, emergency contact chains
4. **Template System**: Localized notification templates, personalization, role-specific messaging
5. **User Preferences**: Granular notification controls, quiet hours, channel preferences, emergency overrides

**Common Pitfalls to Avoid:**
- Don't send notifications without user preference validation
- Don't skip delivery confirmation and retry mechanisms
- Don't forget emergency notification escalation procedures
- Don't implement without proper rate limiting to prevent spam
- Don't overlook GDPR compliance for communication data

**File Structure Requirements:**
```
src/app/api/notifications/
├── send/route.ts              # Multi-channel notification dispatch
├── preferences/route.ts       # User notification settings
├── history/route.ts          # Notification history and receipts
└── emergency/route.ts        # Emergency escalation handling

src/lib/notifications/
├── channels.ts               # Push, SMS, email delivery
├── templates.ts              # Notification template engine
├── preferences.ts            # User preference management
├── emergency.ts             # Emergency escalation logic
└── realtime.ts              # WebSocket message handling

src/components/notifications/
├── NotificationCenter.tsx    # In-app notification display
├── PreferencesPanel.tsx     # User notification settings
├── MessageComposer.tsx      # Real-time message interface
└── EmergencyAlert.tsx       # Emergency notification UI
```

**Notification Templates:**
- Shift Assignment: "Je bent toegewezen aan dienst {shiftName} op {date}"
- Payment Completed: "Betaling van €{amount} is verwerkt binnen 24 uur"
- Emergency Incident: "NOODGEVAL: Incident gerapporteerd op {location}"
- Job Match: "Nieuwe beveiligingsopdracht beschikbaar die past bij je profiel"

**Emergency Escalation Procedures:**
- Level 1: Immediate notification to on-site team and direct supervisor
- Level 2: Company management and client contact after 5 minutes
- Level 3: Authority notification (police/fire/medical) after 10 minutes
- Level 4: Emergency services escalation for life-threatening situations

**Performance Monitoring:**
- Delivery success rates by channel and notification type
- Response time tracking for real-time messages
- User engagement metrics for notification effectiveness
- Emergency notification compliance reporting

**Integration Points:**
- GPS system for location-based incident alerts
- Payment system for financial notification triggers
- Shift management for assignment and reminder notifications
- Incident system for emergency escalation procedures

**User Experience Requirements:**
- Notification batching to prevent spam
- Smart notification timing based on user activity
- Clear action buttons for immediate responses
- Notification history with search and filtering

**Recommended Agent:** @communication-expert for messaging optimization, @emergency-response for escalation procedures