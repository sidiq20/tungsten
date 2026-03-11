# Tungsten Development Roadmap: Phase 1 (MVP)

This document outlines the remaining tasks and the established division of labor between the **FastAPI** and **NestJS** backend services.

## Core Infrastructure (Status: COMPLETED ✅)
The foundation for cross-service communication is fully operational.
- **Shared Redis Cloud**: A unified Redis instance for Pub/Sub and Bull queues.
- **Service Bridge**: FastAPI successfully publishes events (e.g., `note_created`) that NestJS consumes.
- **Unified DB Schema**: PostgreSQL schema synced via Alembic, enabling both services to read/write shared data.

---

## Phase 1 Status: Backend Development

### FastAPI Developer: The Data & Logic Source (Status: NEARLY COMPLETE ✅)
The FastAPI service is the core "Source of Truth," managing the primary data models and broadcasting state changes.

#### Completed Works:
- [x] **Search Engine**: PostgreSQL Full-Text Search (FTS) implemented.
- [x] **Courses & Tags**: Discovery API and tag categorization system established.
- [x] **User Profiles**: Privacy settings and profile metadata with schema-safe JSONB storage.
- [x] **Voting & Reputation**: Reputation engine with Redis Pub/Sub integration for real-time bridge.
- [x] **Security Hardening**: Rate limiting and security headers (CSP, HSTS) applied.
- [x] **Moderation**: Admin report management and content flagging logic.

#### Remaining for Phase 1:
- [ ] **Activity Tracking**: Finalize the event-log audit system for user actions.

---

### NestJS Developer: The Experience & Automation Layer (Status: IN PROGRESS 🚧)
The NestJS service handles the real-time interaction, GraphQL federation, and background processing.

#### Completed Works:
- [x] **Infrastructure**: GraphQL, Bull Queue, and Redis bridge setup.
- [x] **Comments**: Core GraphQL threaded/nested commenting system.
- [x] **Notifications**: WebSocket Gateway (`/notifications`) and basic inbox logic.
- [x] **Leaderboard Module**: Scaffolded with Redis connection.

#### Remaining for Phase 1:
- [ ] **GraphQL Subscriptions**: Enable real-time updates for comments, votes, and notifications.
- [ ] **Media processing (Bull Workers)**:
    - [ ] Implement ClamAV virus scanning for PDF/Image uploads.
    - [ ] Implement Sharp thumbnail generation for uploaded materials.
- [ ] **Advanced Notifications**: Follower alerts and customizable user notification preferences.
- [ ] **Leaderboard Logic**: Global and course-based ranking aggregation from reputation scores.

---

## Developer Collaboration Flow (Pub/Sub)
When building new features, follow this pattern:
1. **FastAPI** performs the database action and calls `redis.publish("event_name", data)`.
2. **NestJS** `RedisSubscriberService` listens for `"event_name"`.
3. **NestJS** triggers a background job (Bull) or pushes to the client via WebSockets.

**Example**: 
FastAPI saves a new Vote -> Publishes `vote_updated` -> NestJS broadcasts new count to the UI via GraphQL Subscription.
