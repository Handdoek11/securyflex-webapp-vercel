# INITIAL: Real-time Messaging & Communication System

## FEATURE:
Build comprehensive real-time messaging and communication platform connecting ZZP security professionals, companies, and clients with instant messaging, group chats, file sharing, and automated shift notifications. The system must provide end-to-end encryption, offline message queuing, rich media support, read receipts, and seamless integration with shift management, ensuring efficient coordination and rapid response times across all security operations.

**Specific Requirements:**
- Real-time 1-on-1 and group messaging with instant delivery
- End-to-end encryption for sensitive security communications
- File sharing for documents, photos, and shift instructions
- Automated shift-related notifications and updates
- Quick response templates for common security scenarios
- Read receipts and typing indicators for engagement tracking
- Offline message queuing with sync-on-connect
- Multi-language support for international teams

## EXAMPLES:
Reference these existing patterns and implementations:

**Wireframe Foundation:**
- `wireframes/003_zzp'ers/05-chat-berichten.md`: Complete chat interface with conversation list, message threads, quick responses, file sharing capabilities
- Mobile-first design with touch-optimized message input and media handling
- Group chat support for shift teams and project coordination
- Archive functionality for compliance and reference

**Real-time Infrastructure:**
- Supabase real-time subscriptions for instant message delivery
- WebSocket connections with automatic reconnection handling
- Presence detection showing online/offline status
- Push notifications for messages when app is backgrounded

**Security & Encryption:**
- `INITIAL_dutch-legal-compliance.md`: GDPR-compliant message storage and retention
- End-to-end encryption for sensitive operational communications
- Message retention policies with automatic deletion options
- Audit trails for compliance and incident investigation

**Database Schema Integration:**
- Message storage with sender, recipient, timestamp, and read status
- Conversation threads with participant management
- File attachments with secure URL generation
- Notification preferences and mute settings

## DOCUMENTATION:
**Communication Requirements:**
- Instant message delivery with <100ms latency for online users
- Reliable offline queuing with guaranteed delivery on reconnection
- Rich media support for photos, documents, and location sharing
- Group chat scalability supporting 50+ participants
- Message search and filtering for quick information retrieval

**Security Standards:**
- End-to-end encryption for all message content
- Secure file storage with expiring access URLs
- Authentication verification for all participants
- Data residency compliance for Dutch/EU regulations
- Regular security audits and penetration testing

**User Experience:**
- Intuitive conversation management with recent/archived sections
- Smart notifications with priority and mute controls
- Quick responses for rapid operational communication
- Voice message support for hands-free communication
- Translation integration for multilingual teams

## OTHER CONSIDERATIONS:

**Critical Implementation Details:**
1. **Real-time Messaging Engine**: WebSocket connections, instant delivery, typing indicators, presence detection, automatic reconnection, message queuing
2. **Encryption System**: End-to-end encryption, key management, secure file transfer, message signing, forward secrecy, compliance documentation
3. **Group Chat Management**: Team creation, participant roles, message threading, mention notifications, group info management, leave/join flows
4. **File Sharing Platform**: Document upload, image compression, preview generation, virus scanning, expiring URLs, storage optimization
5. **Notification System**: Push notifications, in-app alerts, email fallback, priority levels, quiet hours, batch processing

**Common Pitfalls to Avoid:**
- Don't skip encryption - security industry requires confidential communication
- Don't ignore offline mode - field workers often have poor connectivity
- Don't forget message limits - prevent spam and abuse with rate limiting
- Don't overlook moderation - group chats need admin controls and reporting
- Don't neglect performance - large file uploads shouldn't block messaging

**Communication Architecture:**
```
Messaging Flow:
├── 💬 Message Creation (text input, media attach, encryption)
├── 📡 Delivery Pipeline (WebSocket, queue, retry logic)
├── 🔔 Notification Dispatch (push, in-app, email fallback)
├── ✓ Receipt Tracking (delivered, read, typing status)
└── 📁 Archive Management (search, export, retention)
```

**Message Types & Templates:**
```
Quick Response Categories:
├── Shift Responses: "Accepting shift", "On my way", "Arrived on location"
├── Emergency: "Need backup", "Incident occurred", "Calling 112"
├── Availability: "Available now", "Can work tomorrow", "Not available"
├── Status Updates: "Shift completed", "Taking break", "Issue resolved"
└── Confirmations: "Understood", "Will do", "Confirmed"
```

**Group Chat Features:**
- Shift team coordination with automatic participant assignment
- Broadcast channels for company-wide announcements
- Location-based groups for regional coordination
- Temporary groups auto-dissolving after shift completion
- Admin controls for message deletion and user management

**File Sharing Capabilities:**
- Photo sharing with automatic compression (max 1920x1080)
- Document support (PDF, DOC, XLS) with preview generation
- Shift instructions and briefing materials distribution
- Incident evidence collection with timestamp verification
- Voice messages for hands-free communication

**Automated Shift Notifications:**
- New shift assignment alerts with accept/decline buttons
- Schedule changes with impact highlighting
- GPS check-in reminders with location links
- Payment confirmations from Finqle integration
- Performance feedback and ratings

**Offline Functionality:**
- Message composition and queuing while offline
- Cached conversation history for reference
- Automatic sync when connection restored
- Conflict resolution for simultaneous edits
- Local encryption for offline security

**Search & Discovery:**
- Full-text search across all messages
- Filter by sender, date, or conversation type
- Media gallery view for shared photos/files
- Starred messages for important information
- Export functionality for compliance reports

**Integration Points:**
- Shift management for automatic team group creation
- GPS system for location sharing and check-in
- Payment system for transaction notifications
- Incident reporting for evidence collection
- Calendar for availability and scheduling

**Moderation & Safety:**
- Report functionality for inappropriate content
- Automatic profanity filtering with override option
- Block/unblock user capabilities
- Admin tools for content moderation
- Compliance exports for legal requests

**Performance Optimization:**
- Message pagination for large conversations
- Lazy loading for media attachments
- CDN distribution for file downloads
- Database indexing for search performance
- Connection pooling for concurrent users

**Notification Strategy:**
- Smart grouping to prevent notification spam
- Priority levels (urgent/normal/low)
- Quiet hours respecting CAO rest periods
- Customizable sound and vibration patterns
- Badge count management for unread messages

**Business Value:**
- Response time improvement: 65% faster coordination
- Incident resolution: 40% quicker through instant communication
- Shift fill rate: 25% increase through rapid notifications
- Compliance: 100% message audit trail for investigations
- Team efficiency: 30% improvement in coordination

**Performance Requirements:**
- Message delivery: <100ms for online recipients
- File upload: <5 seconds for 10MB files
- Search results: <500ms for full-text queries
- Notification delivery: <2 seconds push notification
- Sync operation: <3 seconds for 100 messages

**Recommended Agent:** @realtime-engineer for WebSocket implementation, @security-expert for encryption