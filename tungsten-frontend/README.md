# Tungsten - Next.js Frontend

The Tungsten frontend is a modern web application built for students, providing a seamless and highly responsive experience.

## 🛠️ Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **API Clients:** Apollo Client (GraphQL) + Fetch/Axios (REST)
- **Global State:** Zustand
- **Forms:** React Hook Form + Zod validation

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configuration
Create a `.env.local` file:
```env
NEXT_PUBLIC_REST_API="http://localhost:8000/api/v1"
NEXT_PUBLIC_GRAPHQL_API="http://localhost:3000/graphql"
```

### 3. Running Development
```bash
npm run dev
```
Open [http://localhost:4000](http://localhost:4000) (or specified port) in your browser.

## 🎨 UI & Styling
We use **shadcn/ui** for consistent components and **Lucide React** for iconography. All components are theme-aware and mobile-responsive.

## 📁 Directory Structure
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI elements.
- `lib/`: Utility functions and API client configurations.
- `hooks/`: Custom React hooks.
- `store/`: Zustand global state definitions.
