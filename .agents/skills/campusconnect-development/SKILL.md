---
name: campusconnect-development
description: Safely develop and extend CampusConnect features while following its specifications, architecture, security rules, lifecycle rules, RBAC requirements, testing standards, and existing project conventions.
---

# CampusConnect Development Skill

## Purpose
Guide AI coding agents through normal feature development, bug fixes, and extensions in the CampusConnect application while maintaining strict alignment with canonical requirements, architectural boundaries, security policies, and state machine rules.

---

## Primary Sources of Truth
Always consult the authoritative specifications and steering rules before changing code:
- [Requirements Specification](file:///.kiro/specs/campus-connect/requirements.md)
- [Design Architecture Specification](file:///.kiro/specs/campus-connect/design.md)
- [Product Steering](file:///.kiro/steering/product.md)
- [Technology Stack Steering](file:///.kiro/steering/tech.md)
- [Repository Structure Steering](file:///.kiro/steering/structure.md)
- [Coding Conventions Steering](file:///.kiro/steering/conventions.md)
- [Security Steering](file:///.kiro/steering/security.md)
- Operational References: [Development Workflow](./references/development-workflow.md), [Security Checklist](./references/security-checklist.md), [Feature Implementation Patterns](./references/feature-patterns.md)

---

## Disciplined Development Workflow (20-Step Checklist)

When developing or modifying features in CampusConnect, follow this exact sequence:

1. **Inspect Specifications**: Review relevant requirement items in `.kiro/specs/campus-connect/requirements.md`.
2. **Inspect Steering Files**: Check `.kiro/steering/` guidelines for domain constraints and security rules.
3. **Inspect Existing Code**: Search existing models, services, routes, and UI components before creating new files.
4. **Reuse Abstractions**: Reuse existing Mongoose models ([`server/models/`](file:///server/models/)), services ([`server/services/`](file:///server/services/)), and UI components ([`components/ui/`](file:///components/ui/)).
5. **Preserve Next.js Architecture**: Maintain Next.js 14 App Router conventions. Do **NOT** create a separate Express backend.
6. **Keep Logic Server-Side**: Business logic belongs in `server/services/*`, not inline in client components or route handlers.
7. **Server-Side Authentication & RBAC**: Authenticate via [`server/utils/auth.ts`](file:///server/utils/auth.ts) and authorize via [`server/utils/rbac.ts`](file:///server/utils/rbac.ts) on the server side.
8. **Validate User Input**: Validate incoming request bodies using Zod schemas (`server/validators/`).
9. **Preserve Canonical Issue Lifecycle**: Backend statuses must strictly use: `Reported`, `Under_Review`, `Assigned`, `In_Progress`, `Resolved`, `Verified`.
10. **Preserve Lost & Found Lifecycles**: Item statuses (`Searching`, `Possible Match`, `Under Review`, `Claimed`, `Returned`, `Archived`) and Claim statuses (`Pending`, `Approved`, `Rejected`).
11. **Prohibit Legacy Statuses**: Never introduce `Open`, `Closed`, or `Closed_Duplicate` into backend database models or state transitions.
12. **Enforce Resolution Window**: Require a 20–1000 char Resolution Note for `Resolved`. Support 7-day student reopen/verify window and automated 7-day cron auto-verification.
13. **Preserve Audit Logging**: Record `AuditLog` entries for all state mutations, staff assignments, claim updates, and duplicate merges.
14. **Preserve Notifications**: Dispatch in-app alerts and email notifications via [`NotificationService`](file:///server/services/notification.service.ts) and [`EmailService`](file:///server/services/email.service.ts).
15. **Enforce Media Validation**: Verify file types (`JPEG`, `PNG`, `PDF`, `MP4`), magic-byte signatures, and 5MB size limits in [`MediaService`](file:///server/services/media.service.ts).
16. **Preserve AI Fallback Behavior**: Maintain advisory non-blocking Gemini AI triage behavior with fallback defaults on failure or timeout.
17. **Update Test Coverage**: Add or update unit/integration tests in `tests/` for meaningful business logic changes.
18. **Run Verification Commands**: Execute `npm run type-check` and `npm test` to verify clean compilation and passing tests.
19. **Run Build Verification**: Run `npm run build` when appropriate to verify Next.js static generation and SSR bundle compilation.
20. **Report Changes**: Summarize modified files, specification compliance, and test results cleanly.

---

## Security & Database Safeguards

### Security Rules
- **No Hardcoded Secrets**: Secrets and API keys must be loaded from `process.env`. Never expose secrets in client components or Git.
- **Session Revocation**: Respect `tokenVersion` on user records to invalidate sessions instantly upon password reset or lockout.
- **Sanitization**: Encode user comments to prevent XSS. Enforce rate limiting via [`server/utils/rateLimiter.ts`](file:///server/utils/rateLimiter.ts).
- **Data Scrubbing**: Exclude `passwordHash`, `refreshTokenHash`, and tokens from API responses using explicit projection selectors (`.select('-passwordHash -refreshTokenHash')`).

### Database Rules
- **Database Connection Singleton**: Always use [`server/db/connection.ts`](file:///server/db/connection.ts) (`connectToDatabase()`).
- **Indexing**: Add appropriate Mongoose schema indexes for new query-heavy fields.
- **Server Boundaries**: Perform database operations exclusively on the server side.

---

## Canonical State Machine Transitions

$$\text{Reported} \xrightarrow{\text{Staff/Admin}} \text{Under\_Review} \xrightarrow{\text{Admin}} \text{Assigned} \xrightarrow{\text{Staff/Admin}} \text{In\_Progress} \xrightarrow{\text{Staff/Admin}} \text{Resolved} \xrightarrow[\text{Cron (7d)}]{\text{Student /}} \text{Verified}$$

### Allowed State Transitions
- `Reported` → `Under_Review`
- `Under_Review` → `Assigned`
- `Under_Review` → `In_Progress`
- `Assigned` → `In_Progress`
- `In_Progress` → `Resolved`
- `Resolved` → `Verified` *(by Student or automated 7-day Cron)*
- `Resolved` → `Reported` *(reopened by submitting Student during 7-day Verification Window)*
- **Duplicate Merging**: Merging a duplicate issue transitions the secondary issue to `Verified` status (Requirement 13.5).
- **Rejection**: Reject every transition not listed above with HTTP 422.

---

## Role-Based Access Control (RBAC)
- **Roles**: `Student`, `Staff`, `Administrator`.
- **Enforcement**: Verify authorization server-side in API handlers via `hasRole(user, allowedRoles)`. Never rely solely on client-side UI visibility.

---

## Gemini AI Integration
- **Advisory Role**: Gemini suggestions (`suggestTriage`) provide advisory category, priority, and duplicate recommendations only.
- **Non-Blocking Fallback**: AI timeouts (5s) or API key misconfigurations must fall back gracefully to default values without blocking issue creation.
- **Admin Override**: Admin or Staff manual edits override AI recommendations (`aiTriageStatus = 'Overridden'`).

---

## MCP Operational Diagnostics Integration
- The project includes the read-only `campusconnect-ops` MCP server configured in [`.agents/mcp_config.json`](file:///.agents/mcp_config.json).
- Use MCP diagnostic tools (`get_system_health`, `get_issue_metrics`, `get_stale_issues`, `get_staff_workload`, `inspect_audit_logs`, `get_pending_claims`) for operational queries.
- Do **NOT** use MCP tools for data mutations or to bypass API authorization rules.

---

## Post-Development Quality Assurance
- After completing feature development, invoke the [`campusconnect-qa`](file:///.agents/skills/campusconnect-qa/SKILL.md) skill to perform an automated specification and security compliance audit.
