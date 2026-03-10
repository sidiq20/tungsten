# Tungsten - FastAPI Backend

The FastAPI backend is responsible for the core RESTful services, including user management, authentication, content storage, moderation, and academic discovery.

## 🏗️ Architecture Overview
- **Framework:** FastAPI for high-performance, async REST APIs.
- **Database & ORM:** PostgreSQL (Neon) with SQLAlchemy (AsyncEngine/AsyncSession).
- **Schema Management:** Alembic for database migrations.
- **Validation:** Pydantic for request/response schemas and environment settings.
- **Storage:** Cloudflare R2 (S3-Compatible) for scalable object storage.
- **Security & Auth:** JWT tokens via `python-jose` and Argon2 password hashing via `passlib`.

## 📁 Key Features & Modules

### 1. 🛡️ User & Security (`api/v1/auth.py`, `api/v1/endpoints/users.py`)
- **Authentication:** JWT-based login and registration.
- **Banned Users:** A global blockade in `dependencies.py` prevents banned users from accessing any protected resource.
- **Roles & Reputation:** Support for `user` and `admin` roles. Users with 500+ reputation points automatically gain "Course Moderator" privileges, allowing decentralized community governance.
- **Bookmarks & Subscriptions:** Users can bookmark posts for later reading and subscribe to courses to curate their academic feed (`GET /api/v1/users/me/bookmarks`, `GET /api/v1/users/me/subscriptions`).

### 2. 🎓 Academic Content (`api/v1/endpoints/courses.py`, `api/v1/endpoints/tags.py`)
- **Courses:** CRUD operations for university courses. Moderated by admins and high-reputation users. Users can also subscribe to them.
- **Tags:** Dynamic tagging system. Tags are created on-the-fly when posting notes and support auto-suggest searching.

### 3. 📝 Notes/Posts (`api/v1/endpoints/posts.py`)
- **Note Lifecycle:** Users can create, update, and soft-delete/archive notes.
- **Bookmarking:** Users can save specific posts to their personal reading list.
- **Discovery:** 
    - Full search by title/content.
    - Sorting by `recent` or `popular` (upvotes).
    - Pagination for high-performance listing.
- **Enrichment:** Detailed view increments `view_count` and returns nested Course/Tag data.
- **File Uploads:** Integrated with R2 for PDF and Image storage with strict server-side validation.

### 4. 🗳️ Voting & Reputation (`api/v1/endpoints/posts.py`, `core/reputation.py`)
- **Polymorphic Voting:** Users can upvote/downvote notes.
- **Reputation System:** 
    - +10 reputation for publishing a note.
    - +2 reputation for each upvote received.
    - Automatic deduction if a vote is retracted or turned into a downvote.

### 5. 🔍 Global Search (`api/v1/endpoints/search.py`)
- Provides a unified search experience across all academic objects (Notes, Courses).

### 6. 👮 Moderation (`api/v1/endpoints/admins.py`, `api/v1/endpoints/reports.py`)
- **Reporting:** Users can flag inappropriate content.
- **Admin Tools:** 
    - Resolve/Dismiss reports.
    - Ban/Unban users with instant effect.
    - Force-delete any content.
- **Audit Logs:** All administrative actions are recorded for transparency.

## 🚀 API Route Map

| Prefix | Tags | Usage |
|--------|------|-------|
| `/api/v1/auth` | auth | Login, Registration |
| `/api/v1/users` | users | Profile management |
| `/api/v1/posts` | posts | Notes, Voting, Filtering |
| `/api/v1/courses`| courses | Academic course CRUD |
| `/api/v1/tags` | tags | Tag browsing & search |
| `/api/v1/search` | search | Global platform search |
| `/api/v1/reports`| reports | User content reporting |
| `/api/v1/admins` | admins | Moderation tools & logs |
| `/api/v1/storage`| storage | R2 Presigned URL generation |

## 🧪 Documentation
- **Swagger UI:** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **ReDoc:** [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
