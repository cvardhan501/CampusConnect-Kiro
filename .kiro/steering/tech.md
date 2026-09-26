# Technology Stack & Implementation Steering

This document details the actual technology stack, libraries, server architecture, and implementation conventions for CampusConnect.

## Technology Stack

| Domain | Technology / Library | Usage & Scope |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 14 (App Router) | Server-side rendering, React client components, App Router layout |
| **Language** | TypeScript 5.x | Strict type safety (`tsc --noEmit`), interfaces for models and DTOs |
| **Database** | MongoDB & Mongoose 8.x | Object Data Modeling (ODM), schemas, indexes, aggregation pipelines |
| **Authentication** | Jose / jsonwebtoken / bcrypt | JWT access & refresh tokens in HttpOnly cookies, bcrypt hashing (cost factor 12) |
| **Media Storage** | Cloudinary SDK | Signed client uploads for issue resolution photos and attachments |
| **Email Service** | Resend SDK | Transactional notifications for critical issues, status changes, and resets |
| **AI Triage** | `@google/generative-ai` | Advisory category/priority suggestions and duplicate vector search |
| **Styling** | Tailwind CSS / PostCSS | Responsive design system (`clsx`, `tailwind-merge`) |
| **Validation** | Zod 3.x | API request payload schema validation (`server/validators/*`) |
| **Testing** | Vitest & `mongodb-memory-server` | Unit testing and isolated database integration testing |

---

## Architectural Rules & Conventions

### 1. Single Consolidated Next.js Architecture
- CampusConnect is built as a single Next.js web application.
- **Do NOT create a separate Express server** or external backend service.
- API endpoints belong in `app/api/*` using Next.js App Router Route Handlers (`GET`, `POST`, `PATCH`, `DELETE`).

### 2. Server-Side Security & Authentication
- All API routes must authenticate incoming requests via [`server/utils/auth.ts`](file:///server/utils/auth.ts).
- Access tokens are stored in HttpOnly, Secure, SameSite cookies.
- Refresh tokens are pre-digested using SHA-256 before bcrypt hashing for database storage.
- Session versioning (`tokenVersion`) enforces instant session invalidation upon password reset or account lockout.

### 3. Environment Variables & Secrets
- Configuration is loaded from `.env.local`.
- **Never expose secrets**, API keys (`RESEND_API_KEY`, `GEMINI_API_KEY`, `CLOUDINARY_SECRET`), or tokens in client code or Git.
- Client-accessible variables must use the `NEXT_PUBLIC_` prefix sparingly.

### 4. Database Connection Singleton
- Database access must use the singleton connection wrapper [`server/db/connection.ts`](file:///server/db/connection.ts) to prevent connection leaks during hot module reloading and serverless execution.

### 5. Media Upload Verification
- Media uploads are signed server-side via `/api/upload/sign`.
- Strict file type validation enforces allowed formats (`JPEG`, `PNG`, `PDF`, `MP4`) and 5MB max file size limits.

### 6. Background Jobs & Cron
- Scheduled operations (72h stale issue reminders, 7-day auto-verification of resolved issues) are executed via `/api/cron` route handler secured by a bearer secret header.

---

## References
- [Requirements Spec](file:///.kiro/specs/campus-connect/requirements.md)
- [Design Spec](file:///.kiro/specs/campus-connect/design.md)
