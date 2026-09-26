# Issue Lifecycle QA Reference Checklist

This reference document outlines the canonical Issue lifecycle rules and state transitions for CampusConnect.

---

## Canonical Backend Statuses

The database and backend service layers strictly enforce exactly 6 canonical Issue statuses:
1. `Reported`
2. `Under_Review`
3. `Assigned`
4. `In_Progress`
5. `Resolved`
6. `Verified`

*Prohibited Backend Statuses*: `Open`, `Closed`, and `Closed_Duplicate` are strictly prohibited as database or backend service status values. (The UI presentation layer maps `Reported` to `"Open"` for display purposes only).

---

## Allowed State Transition Matrix

$$\text{Reported} \xrightarrow{\text{Staff/Admin}} \text{Under\_Review} \xrightarrow{\text{Admin}} \text{Assigned} \xrightarrow{\text{Staff/Admin}} \text{In\_Progress} \xrightarrow{\text{Staff/Admin}} \text{Resolved} \xrightarrow[\text{Cron (7d)}]{\text{Student /}} \text{Verified}$$

| Origin Status | Allowed Target Statuses | Authorized Roles | Notes / Trigger |
| :--- | :--- | :--- | :--- |
| `Reported` | `Under_Review` | Staff, Administrator | Triage / inspection |
| `Under_Review` | `Assigned` | Administrator | Staff assignment |
| `Under_Review` | `In_Progress` | Staff, Administrator | Work initiation |
| `Assigned` | `In_Progress` | Assigned Staff, Administrator | Work initiation |
| `In_Progress` | `Resolved` | Assigned Staff, Administrator | Requires resolution note (20–1000 chars) |
| `Resolved` | `Verified` | Submitting Student, System Cron | Student verification or 7-day auto-verification |
| `Resolved` | `Reported` | Submitting Student Only | Student reopen within 7-day Verification Window |
| `Verified` | *(None)* | *(Terminal State)* | No further transitions allowed |

---

## Special Business Rules

1. **Submitter Verification & Reopen Window**:
   - Only the original submitting Student can manually transition an issue from `Resolved` to `Verified` or back to `Reported` within 7 days of resolution.
   - Unauthorized users attempting to transition `Resolved` issues must be rejected with HTTP 403.

2. **Automated 7-Day Verification Cron**:
   - If a `Resolved` issue remains un-acted upon by the submitting student for 7 days (168 hours), the cron background job (`/api/cron`) automatically transitions the status to `Verified`.

3. **Duplicate Issue Merging**:
   - When an Administrator merges a duplicate issue, all comments and attachments transfer to the primary issue, and the secondary issue status MUST transition to `Verified` (per Requirement 13.5).

4. **Stale Issue SLA Reminders**:
   - An issue remaining in `Reported` status for >72 hours triggers an admin notification alert.

5. **Comment Lock**:
   - New comments CANNOT be added to issues in `Verified` status (Requirement 7.1).
