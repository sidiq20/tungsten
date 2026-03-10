# Tungsten - Academic Knowledge-Sharing Platform

Tungsten is a modern, enterprise-grade academic knowledge-sharing platform designed for students to share notes, ask questions, and collaborate in real-time.

## 🚀 Technology Stack

The project follows a high-performance, type-safe architecture:

### Frontend
- **Framework:** [Next.js 14+](file:///c:/Users/dell/Desktop/projects/fastapi/tungsten/tungsten-frontend) (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **State Management:** Zustand + Apollo Client (GraphQL)

### Backend (Hybrid Architecture)
- **FastAPI (Python):** Handles core RESTful API services, authentication, and heavy data management. Located in [backend/fastapi](file:///c:/Users/dell/Desktop/projects/fastapi/tungsten/backend/fastapi).
- **NestJS (Node.js/TypeScript):** Powers real-time features, GraphQL subscriptions, and background workers. Located in [backend/tungsten](file:///c:/Users/dell/Desktop/projects/fastapi/tungsten/backend/tungsten).

### Data & Infrastructure
- **Database:** PostgreSQL (Neon)
- **Cache & Message Queue:** Redis
- **Storage:** Cloudflare R2 (S3-compatible)
- **ORM:** SQLAlchemy 2.0 (Python) & Prisma (Node.js)

## 📁 Project Structure

```text
tungsten/
├── backend/
│   ├── fastapi/          # Python Core API (REST)
│   └── tungsten/         # NestJS Real-time/GraphQL (Node.js)
├── tungsten-frontend/    # Next.js Web Frontend
└── project_overview/     # Architecture documentation & PDFs
```

## 🛠️ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (Neon recommended)
- Redis

### Global Installation
1. Clone the repository.
2. Follow the setup guides in each sub-directory:
   - [FastAPI Setup](file:///c:/Users/dell/Desktop/projects/fastapi/tungsten/backend/fastapi/README.md)
   - [NestJS Setup](file:///c:/Users/dell/Desktop/projects/fastapi/tungsten/backend/tungsten/README.md)
   - [Frontend Setup](file:///c:/Users/dell/Desktop/projects/fastapi/tungsten/tungsten-frontend/README.md)

## 📦 Infrastructure Configuration

For detailed information on configuring Cloudflare R2 storage, refer to the [Cloudflare R2 Guide](file:///c:/Users/dell/Desktop/projects/fastapi/tungsten/CLOUDFLARE_R2_GUIDE.md).
