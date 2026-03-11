# Tungsten - Frontend Integration Guide

This document provides a detailed breakdown of the backend functionalities and explicit instructions on how the Next.js frontend should integrate with the hybrid backend architecture (FastAPI for REST + NestJS for GraphQL/WebSockets).

## 🏗️ Architecture Overview for Frontend

The backend is split into two specialized services, but they share the same PostgreSQL database, Redis instance, and **JWT Secret**. 

1. **FastAPI (`http://localhost:8000/api/v1`)**: Handles standard CRUD operations, authentication, and file storage. This is a **REST API**.
2. **NestJS (`http://localhost:3000/graphql`)**: Handles highly relational, nested data (Comments) and real-time updates (Notifications). This is a **GraphQL + WebSocket API**.

**Authentication Flow:**
- The frontend logs a user in via FastAPI and receives a JWT `access_token`.
- The frontend stores this token (e.g., in a secure HTTP-only cookie or local storage).
- **Crucial:** The frontend sends this *exact same token* in the `Authorization: Bearer <token>` header to **both** FastAPI and NestJS. NestJS validates it securely because it shares the same secret.

---

## 🔌 1. Authentication & Users (FastAPI)

### Functionality
Handles user registration, login, and profile management.

### Frontend Implementation
- **Login/Register:** 
  - `POST /api/v1/auth/login` (Expects `application/x-www-form-urlencoded` with `username` and `password`). Returns `access_token`.
  - `POST /api/v1/auth/register` (Expects JSON).
- **Profile Data:** 
  - Fetch the current user session on app load via `GET /api/v1/users/me`.
  - Store the user ID globally (Zustand) to determine if UI elements (like "Edit Post" or "Delete Comment") should be rendered.

---

## 🔌 2. Managing Courses & Tags (FastAPI)

### Functionality
Courses are the main organizational bucket for content. Tags provide granular categorization.

### Frontend Implementation
- **Course Selection:** On the home page or sidebar, fetch courses via `GET /api/v1/courses/`.
- **Course Page:** When navigating to `/courses/[id]`, fetch course details via `GET /api/v1/courses/[id]`.
- **Subscriptions:**
  - Provide a "Subscribe" button. Toggle state via `POST /api/v1/courses/[id]/subscribe`.
  - Fetch user's subscriptions via `GET /api/v1/users/me/subscriptions` to highlight subscribed courses in the UI.
- **Search:** Implement a debounced search bar querying `GET /api/v1/tags/search?q=[query]`.

---

## 🔌 3. Notes & Posts (FastAPI & Cloudflare R2)

### Functionality
Users can upload PDFs or images, attach titles/descriptions, and publish them to a specific course.

### Frontend Implementation (The Upload Flow)
This is a 3-step process to avoid passing large files through the backend.
1. **Request Upload URL:** Before uploading, call `POST /api/v1/storage/presigned-url` with `filename` and `content_type`. The backend returns an `upload_url` (direct link to Cloudflare R2) and a `file_key`.
2. **Direct Upload:** The frontend performs a standard `PUT` request directly to the `upload_url` with the raw file data.
3. **Database Creation:** Once the `PUT` succeeds, call `POST /api/v1/posts/` passing the `file_url`, `file_type`, `course_id`, `title`, and `tags`.

### Frontend Implementation (Viewing)
- **Feeds:** Fetch content via `GET /api/v1/posts/?course_id=[id]&sort_by=popular`. Pagination is required.
- **Interactions:**
  - **Voting:** Call `POST /api/v1/posts/[id]/vote` with `{ "value": 1 }` (upvote) or `-1` (downvote). Toggle locally in UI before the request finishes for snappy UX.
  - **Bookmarks:** Call `POST /api/v1/posts/[id]/bookmark`. Fetch saved posts for a user profile page.

---

## 🔌 4. Comments Engine (NestJS - GraphQL)

### Functionality
Deeply nested, threaded discussions attached to Notes/Posts.

### Frontend Implementation
- **Apollo Client:** Configure Apollo Client pointing to `http://localhost:3000/graphql`. Ensure the `Authorization` header is attached to every request.
- **Fetching Comments:** 
  - When rendering a Post page, execute a GraphQL `query` for comments where `postId` equals the current post.
  - The GraphQL schema allows fetching `replies` heavily nested within a single query.
- **Creating Comments:**
  - Execute a `mutation createComment(postId: "...", content: "...")`.
  - For replies, include the `parentId`.
- **Optimistic UI:** Use Apollo's `optimisticResponse` to immediately render the newly typed comment in the UI before the server responds.

---

## 🔌 5. Real-Time Notifications (NestJS - WebSockets)

### Functionality
Alerts users instantly when someone replies to their comment or upvotes their post.

### Frontend Implementation
- **Socket.io Connection:** Connect a persistent Socket.io client to `http://localhost:3000`.
- **Authentication:** Pass the JWT token in the connection handshake: `io('http://localhost:3000', { auth: { token: '...' } })`.
- **Listening:** Listen for the `new_notification` event.
- **UI State:** Maintain an unread notification counter in Zustand. When an event arrives, increment the counter and show a brief toast notification.
- **Fetching History:** On load, use GraphQL to query historical notifications and mark them as read when the user opens the dropdown.

---

## 🔌 6. Admin & Moderation (FastAPI)

### Functionality
Tools to keep the community safe.

### Frontend Implementation
- **User Reporting:** Add a "Report" flag icon to Posts and Comments. Triggers `POST /api/v1/reports/` with a reason.
- **Admin Dashboard (Protected Route):**
  - Create a Next.js layout that requires `user.role === 'admin'`.
  - Fetch reports (`GET /api/v1/admins/reports`).
  - Render action buttons to ban users (`POST /api/v1/admins/users/[id]/ban`) or delete content (`DELETE /api/v1/admins/content/...`).

## Key Takeaways for UI/UX
1. **Hybrid Fetching:** A single page (like a Post view) will require a REST call to FastAPI for the Post details and a GraphQL query to NestJS for the Comments.
2. **Token Management:** If the JWT expires (401 Unauthorized), the frontend must seamlessly redirect to the login page and clear the local storage.
3. **Speed:** Use Zustand for immediate UI updates (like toggling an upvote) while the exact API call processes in the background.
