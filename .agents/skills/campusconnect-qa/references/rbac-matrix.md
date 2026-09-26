# Role-Based Access Control (RBAC) QA Reference Matrix

This reference document details the role permissions and authorization rules across CampusConnect.

---

## Role Permissions Overview

CampusConnect supports 3 explicit user roles:
1. `Student`
2. `Staff`
3. `Administrator`

| Feature / Action | Student | Staff | Administrator | Endpoint / Verification Site |
| :--- | :---: | :---: | :---: | :--- |
| **Report New Issue** | ✅ | ✅ | ✅ | `POST /api/issues` |
| **View Own Issues** | ✅ | ✅ | ✅ | `GET /api/issues` |
| **View Dept / All Issues** | ❌ | ✅ (Dept) | ✅ (All) | `GET /api/issues`, `GET /api/staff` |
| **Triage (`Reported` → `Under_Review`)** | ❌ | ✅ | ✅ | `PATCH /api/issues/[id]/status` |
| **Assign Staff (`→ Assigned`)** | ❌ | ❌ | ✅ | `POST /api/issues/[id]/assign` |
| **Start Work (`→ In_Progress`)** | ❌ | ✅ (Assigned) | ✅ | `PATCH /api/issues/[id]/status` |
| **Resolve Issue (`→ Resolved`)** | ❌ | ✅ (Assigned) | ✅ | `PATCH /api/issues/[id]/status` |
| **Verify Issue (`→ Verified`)** | ✅ (Submitter) | ❌ | ✅ (Admin) | `PATCH /api/issues/[id]/status` |
| **Reopen Issue (`Resolved → Reported`)** | ✅ (Submitter) | ❌ | ❌ | `PATCH /api/issues/[id]/status` |
| **Post Comment** | ✅ | ✅ | ✅ | `POST /api/issues/[id]/comments` |
| **Edit Comment (< 15 mins)** | ✅ (Author) | ✅ (Author) | ✅ (Author) | `PATCH /api/comments/[id]` |
| **Delete Comment (Tombstone)** | ✅ (Author) | ✅ (Author) | ✅ (Any) | `DELETE /api/comments/[id]` |
| **Post Lost/Found Item** | ✅ | ✅ | ✅ | `POST /api/lost-found` |
| **Submit Item Claim** | ✅ | ✅ | ✅ | `POST /api/lost-found/[id]/claims` |
| **Approve / Reject Claim** | ❌ | ✅ | ✅ | `POST /api/claims/[id]/approve` |
| **Merge Duplicate Issues** | ❌ | ❌ | ✅ | `POST /api/admin/issues/merge` |
| **Modify User Roles** | ❌ | ❌ | ✅ | `PATCH /api/users/[id]/role` |
| **View Audit Logs** | ❌ | ❌ | ✅ | `GET /api/admin/audit-logs` |

---

## Authorization Safeguards Checklist

1. **Server-Side Verification**:
   - RBAC checks must occur on the server side via [`server/utils/auth.ts`](file:///server/utils/auth.ts) and [`server/utils/rbac.ts`](file:///server/utils/rbac.ts).
   - Reject unauthorized requests with HTTP `401 Unauthorized` or `403 Forbidden`.

2. **Session Security & Versioning**:
   - Verify JWT `tokenVersion` against `user.tokenVersion` to invalidate stale tokens instantly upon password reset.

3. **Data Scrubbing**:
   - Ensure user profiles and list endpoints never leak `passwordHash`, `refreshTokenHash`, or secret tokens.
