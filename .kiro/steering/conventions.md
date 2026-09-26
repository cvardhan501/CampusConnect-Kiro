# Coding & Implementation Conventions Steering

This document defines coding standards, naming rules, state machine conventions, and development practices for CampusConnect.

## 1. Status & Lifecycle Conventions

### Backend Issue Status Rule (CRITICAL)
The backend issue status in database schemas, types, and state transitions MUST strictly be one of the 6 canonical values:
- `'Reported'`
- `'Under_Review'`
- `'Assigned'`
- `'In_Progress'`
- `'Resolved'`
- `'Verified'`

**Prohibited Backend Statuses**:
- **Never** use `Open`, `Closed`, or `Closed_Duplicate` in backend database models, service layers, state machines, or API route logic.

### Presentation Layer Exception
- The UI presentation layer ([`components/ui/StatusBadge.tsx`](file:///components/ui/StatusBadge.tsx)) may display the user-friendly presentation label `"Open"` when the backend status is `'Reported'`, as required by the UI specification.
- This mapping is strictly presentation-only and must **never** alter the underlying database value.

---

## 2. TypeScript & Code Quality
- Use strict TypeScript mode (`"strict": true`). Do not use implicit `any`.
- Define explicit interfaces for Mongoose document types (`IIssue`, `IUser`) and DTOs.
- Name files consistently:
  - PascalCase for React Components (`StatusBadge.tsx`, `AppShell.tsx`) and Mongoose Models (`Issue.ts`, `User.ts`).
  - camelCase for services, utilities, and scripts (`issue.service.ts`, `auth.ts`, `seed.ts`).
  - kebab-case for URL route segments (`forgot-password`, `lost-found`).

---

## 3. Server Architecture Conventions

### Service Layer Pattern
- Keep business logic in `server/services/*`.
- Service methods should be static methods on domain service classes (e.g., `IssueService.createIssue()`, `AuthService.login()`).
- Keep service methods stateless and pure with respect to HTTP request context.

### Validation
- Validate all incoming request payloads using Zod schemas (`server/validators/`).
- Return HTTP 400 with structured validation errors when payload validation fails.

### Error Handling
- Throw descriptive standard `Error` instances in the service layer (e.g., `throw new Error('Issue not found')`).
- Handle errors in API route handlers and return appropriate HTTP status codes:
  - `400`: Bad Request / Validation Failure
  - `401`: Unauthorized (missing or invalid token)
  - `403`: Forbidden (insufficient RBAC permissions)
  - `404`: Resource Not Found
  - `422`: Unprocessable Entity (invalid status transition)
  - `500`: Internal Server Error

### Audit Logging
- Record audit log entries via `AuditLog.create()` for all security-sensitive or administrative operations:
  - Issue status changes & assignments
  - Duplicate issue merging
  - Comment deletion (tombstoning)
  - Lost & Found claim approval/rejection
  - User role & status modifications

---

## 4. Security & Safety Rules
- **No Hardcoded Secrets**: Access tokens, database URIs, and third-party API keys must be read from `process.env`.
- **Server-Side Authorization**: Enforce RBAC checks on the server side using [`server/utils/rbac.ts`](file:///server/utils/rbac.ts) and [`server/utils/auth.ts`](file:///server/utils/auth.ts).
- **No Production Mocks**: Never swallow errors or return fake/dummy production data in backend handlers.
- **Accessibility**: Use semantic HTML elements (`<button>`, `<main>`, `<nav>`, `<header>`) and ensure proper form labels and ARIA attributes.
