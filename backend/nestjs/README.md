# Tungsten - NestJS Backend (Real-time & GraphQL)

The NestJS backend handles high-concurrency tasks, real-time communications via WebSockets, and complex data querying through GraphQL.

## 🛠️ Tech Stack
- **Framework:** NestJS 10+
- **Language:** TypeScript
- **GraphQL:** @nestjs/graphql + Apollo
- **Real-time:** Socket.io (via @nestjs/websockets)
- **Database ORM:** Prisma
- **Message Queue:** Bull (Redis-backed)

## 🚀 Getting Started

### 1. Environment Setup
Install dependencies:
```bash
npm install
```

### 2. Configuration
Create a `.env` file in this directory:
```env
DATABASE_URL="postgresql://user:pass@host/dbname"
REDIS_URL="redis://localhost:6379"
```

### 3. Running the Server
```bash
```
The NestJS server will be available at `http://localhost:3000`.

## 📖 Documentation
- **GraphQL Playground:** `http://localhost:3000/graphql` (accessible in development)

## 📁 Directory Structure
- `src/auth/`: Cross-service authentication logic.
- `src/comments/`: GraphQL comment management.
- `src/notifications/`: Real-time WebSocket notifications.
- `src/jobs/`: Background workers for tasks like email and virus scanning.
