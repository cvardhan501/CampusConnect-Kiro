# Product Steering: CampusConnect

CampusConnect is a unified campus operations and issue lifecycle management platform for educational institutions.

## Core Capabilities
1. **Campus Issue Reporting**: Enables students, staff, and admins to report, track, assign, and resolve physical infrastructure, facility, IT, and safety issues across campus buildings.
2. **Lost & Found Directory**: Public campus bulletin for reporting lost items, posting found items, and filing claim requests with proof descriptions.
3. **Claim Verification System**: Staff and Administrators review item claims, approving or rejecting submissions based on proof verification.
4. **In-App & Email Notifications**: Automated notification engine sending real-time in-app alerts and email updates for status changes, assignments, comment activity, and system reminders.
5. **AI-Assisted Triage (Gemini)**: Automated advisory AI service suggesting category, priority, and potential duplicate issues upon submission without overriding human authority.
6. **Multi-Role Access Control**: Role-Based Access Control (RBAC) supporting **Student**, **Staff**, and **Administrator** roles.

---

## Canonical Issue Lifecycle
Backend issue statuses are strictly defined by 6 canonical states:

$$\text{Reported} \longrightarrow \text{Under\_Review} \longrightarrow \text{Assigned} \longrightarrow \text{In\_Progress} \longrightarrow \text{Resolved} \longrightarrow \text{Verified}$$

### Status Rules
- **`Reported`**: Initial state upon valid issue submission.
- **`Under_Review`**: Staff or Administrator inspecting issue details.
- **`Assigned`**: Issue assigned to specific Staff member or Administrator.
- **`In_Progress`**: Assigned staff actively working on resolution.
- **`Resolved`**: Work completed with mandatory resolution note (20–1000 chars) and optional photos.
- **`Verified`**: Terminal state reached when submitter confirms resolution, or automatically after 7 days via background cron.

### State Transition Constraints
- **Submitter Reopen Rule**: The original submitting Student may transition a `Resolved` issue back to `Reported` within the 7-day Verification Window.
- **Auto-Verification Rule**: A `Resolved` issue past the 7-day window without student action automatically transitions to `Verified`.
- **Duplicate Merge Rule**: Merging a duplicate issue transfers comments/attachments to the primary issue and transitions the secondary issue status to `Verified` (per Requirement 13.5).
- **Prohibited Statuses**: `Open`, `Closed`, and `Closed_Duplicate` are **not** backend issue statuses. Presentation components may display `"Open"` for `Reported` issues only where specified by the UI design rules.

---

## Lost & Found Lifecycle
- **Item Statuses**: `Searching` (Lost), `Possible Match`, `Under Review` (Found), `Claimed`, `Returned`, `Archived`.
- **Claim Statuses**: `Pending`, `Approved`, `Rejected`.

---

## Key Constraints & SLAs
- **Stale Issue Alert**: Issues remaining in `Reported` status >72 hours trigger reminder notifications to Administrators.
- **Comment Restrictions**: Comments cannot be added to issues in `Verified` status. Comment edits are constrained to a 15-minute window post-creation.
- **Auditability**: All critical actions (status updates, assignments, duplicate merges, claim resolutions, role changes) must create immutable `AuditLog` records.

---

## References
For detailed functional specifications, consult:
- [Requirements Spec](file:///.kiro/specs/campus-connect/requirements.md)
- [Design Architecture Spec](file:///.kiro/specs/campus-connect/design.md)
