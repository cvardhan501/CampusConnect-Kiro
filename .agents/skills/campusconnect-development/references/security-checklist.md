# CampusConnect Security Checklist

This reference document details mandatory security rules and verification checks for developing features in CampusConnect.

---

## Security Verification Matrix

### 1. Server-Side Role-Based Access Control (RBAC)
- [ ] **Mandatory Server Verification**: All protected API endpoints (`app/api/*`) must authenticate incoming requests via [`server/utils/auth.ts`](file:///server/utils/auth.ts) (`getUserFromRequest`).
- [ ] **Role Authorization**: Verify role privileges (`Student`, `Staff`, `Administrator`) using [`server/utils/rbac.ts`](file:///server/utils/rbac.ts) on the server side. Never rely on client UI visibility alone.
- [ ] **Rejection**: Return HTTP `401 Unauthorized` for missing/invalid tokens and HTTP `403 Forbidden` for role mismatch.

### 2. Password & Token Security
- [ ] **Password Hashing**: Use `bcrypt` with cost factor $\ge 12$ ([`server/services/auth.service.ts`](file:///server/services/auth.service.ts)).
- [ ] **Account Lockout**: Enforce account lockout after 5 consecutive failed login attempts within 15 minutes.
- [ ] **Refresh Token Hashing**: Pre-digest refresh tokens with SHA-256 before `bcrypt` hashing for database storage.
- [ ] **Session Revocation**: Maintain `tokenVersion` on user records to invalidate stale sessions instantly upon password reset.

### 3. Data Privacy & Scrubbing
- [ ] **Zero Secret Leakage**: Never return `passwordHash`, `refreshTokenHash`, JWT tokens, or API keys in API response payloads or logs.
- [ ] **Projection Selectors**: Explicitly exclude sensitive attributes when querying `User` or `Session` collections (`.select('-passwordHash -refreshTokenHash')`).
- [ ] **Environment Protection**: Read secrets from `process.env`. Never hard-code credentials in code or Git files.

### 4. Input Validation & Content Sanitization
- [ ] **Schema Validation**: Validate incoming request bodies using Zod schemas (`server/validators/`).
- [ ] **HTML Sanitization**: Encode HTML entities in user comments to prevent Cross-Site Scripting (XSS).
- [ ] **NoSQL Injection Prevention**: Rely on Mongoose parameter binding rather than raw object concatenation.

### 5. Media Upload Security
- [ ] **Signed Uploads**: Issue short-lived Cloudinary upload signatures server-side via `/api/upload/sign`.
- [ ] **File Format Restrictions**: Restrict file extensions to allowed types (`JPEG`, `PNG`, `PDF`, `MP4`).
- [ ] **Magic-Byte Signature Check**: Verify initial buffer byte signatures in [`server/services/media.service.ts`](file:///server/services/media.service.ts).
- [ ] **Size Limit**: Enforce a strict 5MB maximum file size limit.

### 6. Audit Logging & SLA Rules
- [ ] **Audit Trail**: Record immutable `AuditLog` entries for all state updates, staff assignments, duplicate merges, comment deletions, and role changes.
- [ ] **Rate Limiting**: Enforce rate limiting via [`server/utils/rateLimiter.ts`](file:///server/utils/rateLimiter.ts) on auth and submission endpoints.
