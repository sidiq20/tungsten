# Tungsten Development Roadmap: Phase 1 (MVP)

This document outlines the remaining tasks and the established division of labor between the **FastAPI** and **NestJS** backend services.

## Core Infrastructure (Status: COMPLETED ✅)
The foundation for cross-service communication is fully operational.
- **Shared Redis Cloud**: A unified Redis instance for Pub/Sub and Bull queues.
- **Service Bridge**: FastAPI successfully publishes events (e.g., `note_created`) that NestJS consumes.
- **Unified DB Schema**: PostgreSQL schema synced via Alembic, enabling both services to read/write shared data.

---

## FastAPI Developer: The Data & Logic Source
The FastAPI service acts as the **Source of Truth**. It handles heavy data management and broadcasts state changes.

### Remaining Tasks:
- [ ] **Search Engine**: Implement high-performance search using PostgreSQL Full-Text Search (FTS).
- [ ] **Courses & Tags**: Finalize the discovery API for categorization of study materials.
- [ ] **User Profiles**: Implement privacy settings and user metadata management.
- [ ] **Content Moderation**: Build the reporting API and admin moderation endpoints.
- [ ] **Voting & Reputation**: Finalize the core weight calculation engine for user reputation.

---

## NestJS Developer: The Experience & Automation Layer
The NestJS service acts as the **Reactor**. It handles the real-time user experience and background automation.

### Remaining Tasks:
- [ ] **Commenting System**: Build the GraphQL threaded/nested comments system.
- [ ] **Advanced Notifications**: Implement follower alerts and customizable notification preferences.
- [ ] **Media Processing**:
    - Build Bull workers for automatic virus scanning of uploads.
    - Implement thumbnail generation for PDF/Image notes.
- [ ] **Leaderboards**: Build the aggregation engine that calculates global and course-based leaderboards from reputation scores.
- [ ] **Real-time Gateway**: Expand WebSockets for live chat or collaborative features.

---

## Developer Collaboration Flow (Pub/Sub)
When building new features, follow this pattern:
1. **FastAPI** performs the database action and calls `redis.publish("event_name", data)`.
2. **NestJS** `RedisSubscriberService` listens for `"event_name"`.
3. **NestJS** triggers a background job (Bull) or pushes to the client via WebSockets.

**Example**: 
FastAPI saves a new Vote -> Publishes `vote_updated` -> NestJS broadcasts new count to the UI.
