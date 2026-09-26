# Security Steering: CampusConnect

This document details security guidelines, access control requirements, session protection mechanisms, and data privacy policies for CampusConnect.

## 1. Server-Side Role-Based Access Control (RBAC)
- All protected API routes must enforce authentication via [`server/utils/auth.ts`](file:///server/utils/auth.ts).
- Enforce role-level authorization on the server:
  - **Student**: Submit issues, view assigned department/public issues, comment on non-verified issues, claim lost items, reopen/verify own resolved issues within 7 days.
  - **Staff**: View assigned department issues, update issue status (`Reported` → `Under_Review`, `Under_Review` → `In_Progress`, `Assigned` → `In_Progress`, `In_Progress` → `Resolved`), review item claims.
  - **Administrator**: Access platform-wide analytics, assign staff, merge duplicate issues, change user roles, view audit logs, perform administrative operations.
- Client-side checks are for UI convenience only. **Never trust client-submitted role claims**.

---

## 2. Authentication & Session Security
- **Password Hashing**: Hash all user passwords with `bcrypt` using a minimum cost factor of 12.
- **Account Lockout**: Automatically lock accounts after 5 consecutive failed login attempts within a 15-minute window.
- **Token Security**: Store JWT access tokens in HttpOnly, Secure, SameSite cookies.
- **Refresh Token Protection**: Pre-digest refresh tokens with SHA-256 prior to bcrypt hashing before database storage.
- **Session Versioning**: Maintain `tokenVersion` on user records to enable instant global session revocation upon password reset or account lockout.

---

## 3. Input Validation & XSS Prevention
- Validate all incoming request bodies and parameters using Zod schemas (`server/validators/`).
- Sanitize HTML in user comments using HTML entity encoding to prevent Cross-Site Scripting (XSS).
- Prevent NoSQL injection by relying on Mongoose schema type coercion and parameter binding.

---

## 4. Media Upload Security
- Client uploads to Cloudinary must be authenticated via server-signed upload signatures (`/api/upload/sign`).
- Enforce file extension, MIME type, and magic-byte signature validation for allowed formats (`JPEG`, `PNG`, `PDF`, `MP4`).
- Enforce a strict 5MB maximum file size limit.

---

## 5. Audit Logging & Secrets Management
- Log all security events, role changes, status transitions, and data mutations to the `AuditLog` collection.
- **Never log passwords, tokens, API keys, or sensitive user PII** in system console logs or audit details.
- Environment variables must remain in `.env.local` and must never be committed to Git.
- Security-sensitive changes MUST include corresponding automated unit/integration tests in `tests/`.

---

## References
- [Requirements Spec](file:///.kiro/specs/campus-connect/requirements.md)
- [Design Spec](file:///.kiro/specs/campus-connect/design.md)
