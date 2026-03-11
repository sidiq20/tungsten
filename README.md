# Tungsten - Academic Knowledge-Sharing Platform

Tungsten is a modern, enterprise-grade academic knowledge-sharing platform designed for students to share notes, ask questions, and collaborate in real-time.

## 🚀 Core Platform Functions

The Tungsten platform provides the following core functionalities:

### 1. User Management & Authentication (FastAPI)
- **Registration & Login**: Secure user authentication using JWT tokens.
- **Profile Management**: Users can update their profiles, manage privacy settings, and track their reputation score.
- **Role-Based Access**: Separation of standard users and administrators with elevated privileges.

### 2. Course & Content Organization (FastAPI)
- **Course Catalog**: Administrators can create and manage academic courses (e.g., "Intro to Computer Science").
- **Course Subscriptions**: Users can subscribe to specific courses to tailor their content feed.
- **Tags & Categorization**: Content can be tagged for precise categorization and easy discovery.

### 3. Study Materials (Notes) Sharing (FastAPI & Cloudflare R2)
- **File Uploads**: Users can upload study materials (PDFs, Images) securely via short-lived presigned URLs.
- **Note Publishing**: Uploaded files can be published as "Notes" linked to specific courses and tags.
- **Bookmarking**: Users can save valuable notes to their personal bookmarks for quick access later.

### 4. Interactive Q&A and Discussions (FastAPI & NestJS)
- **Questions & Answers**: Users can post academic questions and provide answers (Note: handled conceptually as 'Posts' in the core architecture).
- **Nested Comments (NestJS)**: Real-time, deeply nested comment threads on notes and questions powered by GraphQL.
- **Voting System (FastAPI)**: A reputation-driven upvote/downvote system for notes and comments to surface the best quality answers.

### 5. Real-Time Engagement (NestJS)
- **Live Notifications**: Users receive instant WebSocket notifications for replies, mentions, and votes on their content.
- **Leaderboards**: Dynamic tracking of the most helpful students based on their earned reputation scores.

### 6. Moderation & Administration (FastAPI)
- **Content Reporting**: Users can report inappropriate content or spam.
- **Admin Dashboard Actions**: Administrators can review reports, delete violating content, and ban/unban malicious users.
- **Audit Logging**: A comprehensive internal tracking system recording significant events (logins, deletions, reputation changes) for system security and integrity.

---

> **Note for Frontend Developers:** A comprehensive, detailed breakdown of how to integrate with each of these backend functions is available in [`project_overview/frontend_setup.md`](./project_overview/frontend_setup.md).
