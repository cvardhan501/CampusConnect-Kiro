# Requirements Document

## Introduction

CampusConnect is a full-stack web platform built with Next.js, TypeScript, and MongoDB that serves as the central hub for campus issue reporting and Lost & Found item management. Students, staff, and administrators can submit, track, and resolve maintenance or safety issues across campus facilities, and post or claim lost and found items. Role-based access control enforces appropriate permissions at every level. AI-assisted category suggestion, priority suggestion, and duplicate detection reduce manual workload and improve resolution times. This document describes the MVP requirements for a student-built platform demonstrating real functionality and AI-assisted development capabilities.

---

## Glossary

- **Student**: A registered campus user with standard submission and viewing privileges.
- **Staff**: A campus employee (non-admin) who submits issues, manages Lost & Found items in their area, and updates the status of issues assigned to their department.
- **Administrator**: A privileged user who manages all issues, Lost & Found items, user accounts, and system configuration.
- **Issue**: A campus problem report (e.g., broken equipment, safety hazard, facility defect) submitted by any authenticated user.
- **Lost_Item**: A record posted by a user indicating a personal possession that has been lost on campus.
- **Found_Item**: A record posted by a user indicating a personal possession that has been found on campus.
- **Claim**: A request by an authenticated user asserting ownership of a Found_Item.
- **Comment**: A flat (non-threaded) text entry attached to an Issue, Lost_Item, or Found_Item by an authenticated user.
- **Notification**: An in-app or email alert sent to a user in response to a platform event.
- **RBAC**: Role-Based Access Control — the mechanism that grants or restricts actions based on the authenticated user's role.
- **AI_Suggestion_Service**: The AI-powered component (backed by a free-tier provider such as Google Gemini or OpenAI) that analyses incoming Issues and Lost & Found records to suggest Category, Priority, and Potential_Duplicate matches. All suggestions are advisory only.
- **Attachment**: An image or document file uploaded alongside an Issue or Lost & Found record.
- **Category**: A predefined classification label applied to Issues or Lost & Found items (e.g., "Electrical", "Plumbing", "Electronics").
- **Priority**: The urgency level assigned to an Issue, expressed as one of four values: Low, Medium, High, or Critical.
- **Status**: The lifecycle state of an Issue (Reported, Under_Review, Assigned, In_Progress, Resolved, Verified) or a Lost & Found record (Active, Claimed, Archived).
- **Resolution_Note**: A mandatory text entry (20–1000 characters) provided by a Staff member or Administrator when transitioning an Issue to Resolved status, summarising the action taken.
- **Resolution_Photo**: An optional JPEG or PNG image (max 5 MB) attached to an Issue by a Staff member or Administrator at the time of resolution, providing visual evidence of the completed work.
- **Verification_Window**: The 7-day period following an Issue's transition to Resolved status, during which the original submitting Student may verify or reopen the Issue. If no action is taken within this window, the system automatically transitions the Issue to Verified.
- **Potential_Duplicate**: A system-generated advisory link between two Issues, or between a Lost_Item and a Found_Item, identified as potentially related by the AI_Suggestion_Service. Potential_Duplicate links are suggestions only and do not trigger automatic merges or ownership decisions.
- **Dashboard**: The role-specific landing view displaying summary statistics, recent activity, and action items relevant to the authenticated user's role.
- **Audit_Log**: A record of key create, update, and delete actions performed on platform entities, used for accountability and debugging.
- **JWT**: JSON Web Token — the mechanism used for stateless authentication sessions.
- **Rate_Limiter**: The server-side component that enforces per-user and per-IP request quotas to prevent abuse.
- **Search_Service**: The component responsible for full-text and filtered searching of Issues and Lost & Found items.
- **Media_Service**: The component responsible for uploading, storing, and serving Attachments, Resolution_Photos, and thumbnails.
- **Email_Service**: The component responsible for delivering outbound email Notifications via a transactional email provider (e.g., Resend free tier).
- **Validator**: The component responsible for validating all user-submitted input before persistence.
- **Verification_Window**: See definition above.

---

## Requirements

---

### Requirement 1: User Registration and Authentication

**User Story:** As a campus user, I want to register and log in securely, so that I can access CampusConnect features appropriate to my role.

#### Acceptance Criteria

1. THE Validator SHALL enforce that a registration request contains a valid campus email address, a password of at least 10 characters and no more than 128 characters, and a role selection of Student, Staff, or Administrator.
2. WHEN a valid registration request is submitted, THE System SHALL hash the password using bcrypt with a minimum cost factor of 12 before persisting the user record.
3. WHEN a valid login request is received, THE System SHALL issue a signed JWT with an expiry of 1 hour and a refresh token with an expiry of 7 days.
4. WHEN a JWT expires, THE System SHALL accept a valid refresh token and issue a new JWT without requiring the user to re-enter credentials.
5. IF a login attempt provides an unrecognised email or an incorrect password, THEN THE System SHALL return a 401 response with a generic message that does not distinguish between the two failure reasons.
6. WHEN five consecutive failed login attempts occur for a single account within 10 minutes, THE Rate_Limiter SHALL lock that account for 30 minutes and send a Notification to the registered email address containing instructions to wait or initiate a password reset.
7. WHEN a user requests a password reset, THE Email_Service SHALL deliver a single-use reset token valid for 30 minutes to the user's registered email address.
8. IF a password reset token has already been used or has expired, THEN THE System SHALL reject the reset attempt and return an error message indicating the token is invalid, without updating the password.
9. WHERE an Administrator role is selected during registration, THE System SHALL require secondary approval from an existing Administrator before granting Administrator access.
10. WHEN an existing Administrator approves a new Administrator registration, THE Email_Service SHALL send a confirmation Notification to the approved user's registered email address.
11. IF an existing Administrator rejects a new Administrator registration, THEN THE System SHALL deny access to the applicant account and send a Notification to the applicant's registered email address indicating the rejection.
12. WHEN a non-Administrator account registration is submitted and validated, THE Email_Service SHALL send a confirmation Notification to the registered email address and the account SHALL be immediately active.
13. THE System SHALL store user profile data including display name, campus ID, department, and contact phone number.
14. THE System SHALL store no plaintext passwords, tokens, or API keys in the database or application logs; WHEN a password is stored, THE System SHALL store only the bcrypt hash.

---

### Requirement 2: Role-Based Access Control (RBAC)

**User Story:** As a system designer, I want all platform actions gated by role, so that users can only perform operations appropriate to their privilege level.

#### Acceptance Criteria

1. THE RBAC SHALL define three roles — Student, Staff, and Administrator — each granting a distinct set of permissions enforced server-side on every API request.
2. WHILE a user is authenticated as a Student, THE System SHALL permit that user to create Issues, view all Active Issues and Lost & Found records, add Comments, and edit or delete only their own submissions; THE System SHALL deny the Student write access to submissions authored by other users.
3. WHILE a user is authenticated as Staff, THE System SHALL permit all Student-role actions plus the ability to update the Status of Issues assigned to their department, add work update Comments on any Issue in their department, and create, update, or delete Lost & Found items scoped to their designated area; THE System SHALL deny Staff write access to Issues or Lost & Found items outside their assigned department or area.
4. WHILE a user is authenticated as an Administrator, THE System SHALL permit all Staff-role actions plus the ability to create, update, deactivate, or delete user accounts, modify system configuration, and read and filter Audit_Log records; THE System SHALL deny any user the ability to modify or delete Audit_Log entries.
5. IF an authenticated user attempts an action outside their role's permissions, THEN THE System SHALL reject the request with a 403 response, record the attempt in the Audit_Log with the user identifier, timestamp, attempted action, and target resource, and return no data from the requested resource.
6. THE System SHALL enforce RBAC checks server-side on every API endpoint; client-side UI restrictions alone SHALL NOT constitute enforcement.
7. WHEN an Administrator changes a user's role, THE System SHALL invalidate all active sessions and tokens for that user within 5 seconds of the role change, requiring the affected user to re-authenticate before any further actions are permitted.
8. IF a user's session token is presented after that token has been invalidated due to a role change, THEN THE System SHALL reject the request with a 401 response and return no data.

---

### Requirement 3: Issue Submission

**User Story:** As a campus user, I want to submit a campus issue report, so that facilities staff are alerted and can resolve the problem.

#### Acceptance Criteria

1. WHEN an authenticated user submits an Issue, THE Validator SHALL enforce that the submission contains a title of 5–120 characters, a description of 20–2000 characters, a Category selection, a campus location string of 3–200 characters, and a Priority selection of Low, Medium, High, or Critical.
2. IF the submitted Issue fails validation, THEN THE Validator SHALL reject the submission and return an error response identifying each field that did not meet its constraint, without persisting any part of the submission.
3. WHEN a valid Issue is submitted, THE System SHALL persist the Issue with an auto-generated ID, a Status of Reported, the submitting user's ID, and a UTC creation timestamp.
4. WHEN an Issue is submitted, THE AI_Suggestion_Service SHALL analyse the title and description and return a suggested Category, a suggested Priority (Low, Medium, High, or Critical), and a list of up to 3 Potential_Duplicate Issues within 15 seconds.
5. IF the AI_Suggestion_Service does not return a result within 15 seconds or returns an error, THEN THE System SHALL allow the Issue submission to proceed without AI suggestions and persist the Issue with the user-supplied Category and Priority and no Potential_Duplicate candidates.
6. IF the AI_Suggestion_Service returns a Potential_Duplicate candidate with a similarity score at or above 0.85, THEN THE System SHALL display the candidate to the submitting user before final submission is confirmed, and SHALL allow the user to either proceed with submission or cancel and return to editing; the system SHALL NOT automatically merge or suppress the new Issue.
7. WHEN an Issue is persisted with a Priority of Critical, THE System SHALL send an in-app Notification to all Administrators and the Staff member assigned to the relevant department within 60 seconds.
8. IF no Staff member is assigned to the relevant department at the time a Critical-Priority Issue is persisted, THEN THE System SHALL send the in-app Notification to all Administrators only.
9. WHEN an Issue is persisted, THE System SHALL record an entry in the Audit_Log containing the Issue ID, submitting user ID, and UTC creation timestamp.

---

### Requirement 4: Issue Lifecycle Management

**User Story:** As a staff member or administrator, I want to update and track the status of reported issues through a defined lifecycle, so that submitters are kept informed and work is managed efficiently.

#### Acceptance Criteria

1. THE System SHALL enforce the following Status transitions for Issues and SHALL reject any transition not listed here:
   - Reported → Under_Review
   - Under_Review → Assigned
   - Under_Review → In_Progress
   - Assigned → In_Progress
   - In_Progress → Resolved
   - Resolved → Verified (by the submitting Student or by the system after the Verification_Window)
   - Resolved → Reported (reopen, by the submitting Student only)
2. WHEN a Staff member or Administrator transitions an Issue to Resolved, THE Validator SHALL require a Resolution_Note of 20–1000 characters to be provided before the transition is accepted; the transition SHALL be rejected if no Resolution_Note is supplied.
3. WHEN a Staff member or Administrator transitions an Issue to Resolved, THE Media_Service SHALL accept up to 3 Resolution_Photos per Issue, each in JPEG or PNG format and no larger than 5 MB; Resolution_Photos are optional and the transition SHALL proceed if none are provided.
4. IF a Resolution_Photo exceeds 5 MB or is not in JPEG or PNG format, THEN THE Validator SHALL reject that file and return an error identifying the file and the violated constraint; the Resolution transition SHALL proceed with only the valid Resolution_Photos.
5. WHEN an Issue transitions to Resolved, THE System SHALL record the start of the Verification_Window and send an in-app and email Notification to the original submitting Student informing them of the resolution and their 7-day window to verify or reopen.
6. WHILE an Issue has a Status of Resolved and the Verification_Window has not expired, THE System SHALL permit the original submitting Student to transition the Issue to Verified or to reopen it by transitioning it back to Reported.
7. IF the original submitting Student has not acted on a Resolved Issue within 7 days of the resolved timestamp, THEN THE System SHALL automatically transition the Issue's Status to Verified.
8. WHEN an Issue's Status changes, THE System SHALL record the new Status, the acting user's ID (or "system" for automatic transitions), and a UTC timestamp in the Audit_Log.
9. WHEN an Issue's Status changes, THE System SHALL send an in-app Notification to the original submitting Student within 60 seconds; for transitions to Resolved and Verified, THE Email_Service SHALL also send an email Notification.
10. WHEN an Administrator or Staff member assigns an Issue to a Staff user, THE System SHALL update the Issue's assigned user field and send an in-app and email Notification to the newly assigned Staff user within 60 seconds.
11. IF a Status transition is not permitted under the defined transition rules, THEN THE System SHALL reject the request with an error indicating the invalid transition and leave the Issue's Status unchanged.
12. IF an Issue remains in Reported Status for more than 72 hours without a Status update, THEN THE System SHALL send a reminder in-app Notification to all Administrators.

---

### Requirement 5: Lost & Found — Item Posting

**User Story:** As a campus user, I want to post a lost or found item, so that owners and finders can be connected.

#### Acceptance Criteria

1. WHEN an authenticated user submits a Lost_Item or Found_Item, THE Validator SHALL enforce that the submission contains a title of 5–100 characters, a description of 10–1000 characters, an item Category, a date that is not later than the current UTC date, and a campus location string of 1–200 characters.
2. WHEN a valid Lost_Item or Found_Item is persisted, THE System SHALL assign it a unique ID, a Status of Active, the posting user's ID, and a UTC creation timestamp.
3. WHEN a Lost_Item is posted, THE AI_Suggestion_Service SHALL search Active Found_Item records for matches based on Category, description keywords, and campus location, and SHALL return up to 5 candidate Potential_Duplicate matches ranked by confidence score within 15 seconds; these candidates are advisory only and SHALL NOT automatically link items or transfer ownership.
4. WHEN a Found_Item is posted, THE AI_Suggestion_Service SHALL search Active Lost_Item records for matches based on Category, description keywords, and campus location, and SHALL return up to 5 candidate Potential_Duplicate matches ranked by confidence score within 15 seconds; these candidates are advisory only and SHALL NOT automatically link items or transfer ownership.
5. IF the AI_Suggestion_Service does not return a response within 15 seconds or is unavailable, THEN THE System SHALL proceed with persisting the item without match suggestions and SHALL indicate to the user that match suggestions are temporarily unavailable.
6. IF the AI_Suggestion_Service returns a candidate with a confidence score at or above 0.80, THEN THE System SHALL display that candidate to the posting user before final submission; the user SHALL be able to dismiss the suggestion and proceed with submission without any automatic action being taken.
7. IF no Claim has been submitted against a Found_Item within 90 days of its UTC creation timestamp, THEN THE System SHALL automatically transition that record's Status from Active to Archived.
8. IF a Lost_Item has remained Active for 90 days without being matched to an Archived or Claimed Found_Item, THEN THE System SHALL automatically transition the Lost_Item's Status to Archived.

---

### Requirement 6: Lost & Found — Claim Workflow

**User Story:** As a student, I want to claim a found item, so that I can recover my lost possession through a verified process.

#### Acceptance Criteria

1. WHEN an authenticated user submits a Claim on a Found_Item, THE Validator SHALL require a description of between 30 and 1000 characters explaining the claimant's ownership evidence.
2. WHEN a Claim is submitted, THE System SHALL persist the Claim with the claimant's user ID, the target Found_Item ID, a Status of Pending, and a UTC timestamp.
3. WHEN a Claim is submitted, THE System SHALL send an in-app Notification to the Found_Item poster within 60 seconds.
4. THE System SHALL permit only one active Claim per user per Found_Item at any given time, where an active Claim is one with a Status of Pending or Approved.
5. IF an authenticated user submits a Claim on a Found_Item for which they already have an active Claim, THEN THE System SHALL reject the submission and return an error message indicating a duplicate active Claim exists.
6. WHEN a Found_Item poster approves a Claim, THE System SHALL transition the Claim Status to Approved, transition the Found_Item Status to Claimed, and send an in-app and email Notification to the claimant containing the poster's contact information for item pickup coordination.
7. IF a Found_Item poster rejects a Claim, THEN THE System SHALL transition the Claim Status to Rejected and send an in-app Notification to the claimant containing the rejection reason provided by the poster, up to 500 characters.
8. WHEN a Found_Item transitions to Claimed Status, THE System SHALL transition all remaining Pending Claims for that Found_Item to Archived Status and send an in-app Notification to each corresponding claimant indicating the item has been claimed by another user.
9. WHILE a Found_Item has a Status of Claimed, THE System SHALL reject any new Claim submission against it and return an error message indicating the item is no longer available.
10. Claims SHALL only be submitted against Found_Items; no Claim SHALL be submitted directly against a Lost_Item.

---

### Requirement 7: Comments

**User Story:** As a campus user, I want to add flat comments to Issues and Lost & Found items, so that I can provide updates, ask questions, or share additional context.

#### Acceptance Criteria

1. THE Validator SHALL enforce that a Comment body is between 1 and 1000 characters and that the Comment is attached to an existing parent record whose Status is not Archived and not Verified.
2. WHEN an authenticated user posts a Comment, THE System SHALL persist the Comment with the author's user ID, the parent record's ID and type, the body text, and a UTC creation timestamp; Comments are flat and SHALL NOT support nested replies.
3. WHEN a Comment is posted on an Issue, THE System SHALL send an in-app Notification to the Issue submitter and all users who have previously commented on that Issue, excluding the comment author, within 60 seconds.
4. WHEN a Comment is posted on a Lost_Item or Found_Item, THE System SHALL send an in-app Notification to the item poster, excluding the comment author, within 60 seconds.
5. WHEN an authenticated Comment author submits an edit to their Comment within 15 minutes of its original UTC creation timestamp, THE System SHALL update the Comment body and persist an edited UTC timestamp alongside the original creation timestamp.
6. IF an authenticated Comment author submits an edit to their Comment more than 15 minutes after its original UTC creation timestamp, THEN THE System SHALL reject the edit and return an error indicating the edit window has expired, leaving the Comment body unchanged.
7. WHEN a Comment author or an Administrator deletes a Comment, THE System SHALL replace the Comment body with a tombstone marker and preserve the author ID, parent record ID, and original UTC creation timestamp.

---

### Requirement 8: Media Attachments

**User Story:** As a campus user, I want to attach photos or documents to my submissions, so that responders have the visual context needed to understand and resolve the issue.

#### Acceptance Criteria

1. WHEN an authenticated user submits an Issue, THE Media_Service SHALL accept up to 5 Attachment files per Issue, each no larger than 10 MB, restricted to JPEG, PNG, PDF, and MP4 formats.
2. WHEN an authenticated user submits a Lost_Item or Found_Item, THE Media_Service SHALL accept up to 5 Attachment files per item, each no larger than 10 MB, restricted to JPEG and PNG formats.
3. WHEN a Staff member or Administrator transitions an Issue to Resolved, THE Media_Service SHALL accept up to 3 Resolution_Photos per Issue, each no larger than 5 MB, restricted to JPEG and PNG formats; Resolution_Photos are stored separately from submission Attachments.
4. WHEN a file upload is received, THE Validator SHALL verify the file's MIME type by inspecting file headers and SHALL NOT rely solely on the client-supplied Content-Type header.
5. IF an uploaded file exceeds the applicable size limit or is not in a permitted format, THEN THE Media_Service SHALL reject that file and return an error identifying the file and the violated constraint; the submission SHALL proceed with any remaining valid files.
6. WHEN a valid file is uploaded, THE Media_Service SHALL store the file using an object storage or file hosting service (e.g., Cloudinary or Vercel Blob) and persist the file URL and metadata with the parent record.
7. WHEN a JPEG or PNG file is successfully uploaded, THE Media_Service SHALL generate and store a thumbnail of dimensions 256×256 pixels within 10 seconds of the upload completing.
8. IF a submission already has the maximum permitted number of Attachments and a further file upload is attempted, THEN THE Media_Service SHALL reject the upload and return an error indicating the per-submission attachment limit has been reached.
9. WHEN an Attachment or Resolution_Photo is deleted by its uploader or an Administrator, THE Media_Service SHALL remove the file from storage and mark the Attachment record as deleted within 30 seconds.

---

### Requirement 9: Search and Filtering

**User Story:** As a campus user, I want to search and filter Issues and Lost & Found items, so that I can quickly find relevant records without scrolling through all entries.

#### Acceptance Criteria

1. THE Search_Service SHALL support full-text search across Issue and Lost & Found record titles and descriptions, returning results within 3 seconds for typical dataset sizes.
2. THE Search_Service SHALL support filtering by Category, Status, date range, and campus location independently and in combination, where date range accepts a start date and end date each in YYYY-MM-DD format, and where an unspecified range bound defaults to no constraint on that side.
3. WHEN a search query is submitted, THE Search_Service SHALL return results ranked by relevance descending, with date descending as the tiebreaker.
4. THE Search_Service SHALL support pagination, returning a maximum of 25 records per page, where each response includes a next-page cursor token when additional records exist and a null cursor when no further pages are available.
5. THE Search_Service SHALL treat search queries as case-insensitive.
6. IF a search query exceeds 500 characters, THEN THE Search_Service SHALL reject the request and return an error message indicating the maximum query length, without performing a search.
7. IF no records match the submitted search query and active filters, THEN THE Search_Service SHALL return an empty result set with a message indicating no matching records were found, rather than an error response.

---

### Requirement 10: Notifications

**User Story:** As a campus user, I want to receive timely notifications about activity relevant to me, so that I can stay informed without manually checking the platform.

#### Acceptance Criteria

1. THE System SHALL support two Notification channels: in-app (persisted and displayed in the user's Notification inbox) and email (delivered via the Email_Service); in-app Notifications SHALL be sent for all notifiable events, and email Notifications SHALL be sent only for the following events: Issue status change, Claim approved or rejected, Staff assignment to an Issue, and Critical-Priority Issue creation.
2. THE System SHALL allow each user to independently disable the email Notification channel for each supported email event type; in-app delivery SHALL always be enabled and SHALL NOT be disableable.
3. WHEN a Notification is triggered, THE System SHALL persist the in-platform Notification within 5 seconds of the triggering event.
4. WHEN a user views an in-app Notification, THE System SHALL mark that Notification as read.
5. WHEN a user invokes bulk mark-all-as-read, THE System SHALL mark all unread in-app Notifications for that user as read within 5 seconds.
6. THE System SHALL retain in-app Notifications for a maximum of 90 days before automatic deletion.
7. IF the Email_Service fails to deliver an email Notification after 3 consecutive delivery attempts, THEN THE System SHALL log the failure with the user identifier, event type, and timestamp, and SHALL display the Notification only in the user's in-app inbox.

---

### Requirement 11: Student Dashboard

**User Story:** As a student, I want a personal dashboard, so that I can see the status of my submitted issues and Lost & Found posts at a glance.

#### Acceptance Criteria

1. WHILE a user is authenticated as a Student, THE Dashboard SHALL display a summary of all Issues submitted by that user, grouped by Status, with the most recently updated Issues listed first.
2. WHILE a user is authenticated as a Student, THE Dashboard SHALL display all Lost_Items and Found_Items posted by that user, grouped by Status.
3. WHILE a user is authenticated as a Student, THE Dashboard SHALL display the user's unread in-app Notifications, with the most recent listed first.
4. WHEN a Student's Issue transitions to Resolved, THE Dashboard SHALL prominently indicate the Verification_Window expiry date alongside that Issue entry.
5. WHEN a Student accesses the Dashboard, THE System SHALL load and render all summary sections within 3 seconds.

---

### Requirement 12: Staff Dashboard

**User Story:** As a staff member, I want a role-specific dashboard, so that I can manage the issues assigned to me and monitor open issues in my department efficiently.

#### Acceptance Criteria

1. WHILE a user is authenticated as Staff, THE Dashboard SHALL display all Issues currently assigned to that Staff user, ordered by Priority descending and then by creation date ascending.
2. WHILE a user is authenticated as Staff, THE Dashboard SHALL display all Issues in the Staff user's assigned department with a Status of Reported, Under_Review, Assigned, or In_Progress, ordered by Priority descending.
3. WHILE a user is authenticated as Staff, THE Dashboard SHALL display a recent activity feed showing the 20 most recent status changes and comments on Issues in the Staff user's department.
4. WHEN a Staff user accesses the Dashboard, THE System SHALL load and render all summary sections within 3 seconds.

---

### Requirement 13: Administrator Dashboard and Analytics

**User Story:** As an administrator, I want a centralised dashboard with platform-wide statistics, so that I can monitor platform health, staff workload, and resolution performance.

#### Acceptance Criteria

1. WHILE a user is authenticated as an Administrator, THE Dashboard SHALL display the following platform-wide summary statistics, refreshed at most every 60 seconds: total Issues by Status, total Issues by Category, total Issues by campus location, average resolution time in hours across all Issues that have reached Verified Status, total Active Lost & Found records, count of Pending Claims, and a staff workload table showing the count of open Issues assigned to each Staff user.
2. WHEN an Administrator accesses the Dashboard, THE System SHALL load and render all summary statistics within 3 seconds.
3. WHILE a user is authenticated as an Administrator, THE Dashboard SHALL display a list of Issues flagged as Potential_Duplicates by the AI_Suggestion_Service, showing the similarity score and links to both Issues, so that the Administrator can review and resolve duplicates manually.
4. WHEN an Administrator dismisses a Potential_Duplicate link, THE System SHALL remove that link from the flagged list and record the dismissal in the Audit_Log.
5. WHEN an Administrator merges a Potential_Duplicate by selecting a primary Issue, THE System SHALL transfer all Comments and Attachments from the secondary Issue to the primary Issue, transition the secondary Issue's Status to Verified, record the merge in the Audit_Log, and preserve the original creation timestamp on each transferred Comment and Attachment.
6. WHILE a user is authenticated as an Administrator, THE Dashboard SHALL provide access to the full user management list, allowing the Administrator to view, deactivate, reactivate, or change the role of any user account.

---

### Requirement 14: AI-Assisted Triage

**User Story:** As a staff member or administrator, I want AI-powered suggestions on incoming submissions, so that issues are categorised consistently and potential duplicates are surfaced for review.

#### Acceptance Criteria

1. WHEN an Issue is submitted, THE AI_Suggestion_Service SHALL return a suggested Category, a suggested Priority (Low, Medium, High, or Critical), and up to 3 Potential_Duplicate Issue candidates within 15 seconds.
2. IF the AI_Suggestion_Service does not respond within 15 seconds, THEN THE System SHALL persist the Issue with the user-supplied Category and Priority, with no Potential_Duplicate candidates, and SHALL mark the AI triage status as Pending.
3. WHEN a Lost_Item or Found_Item is submitted, THE AI_Suggestion_Service SHALL return up to 5 candidate matches from Active items of the opposing type (Found_Items for a Lost_Item, Lost_Items for a Found_Item) within 15 seconds.
4. IF the AI_Suggestion_Service does not respond within 15 seconds for a Lost & Found submission, THEN THE System SHALL persist the item without match candidates and indicate to the user that suggestions are temporarily unavailable.
5. THE AI_Suggestion_Service SHALL treat all suggestions as advisory; THE System SHALL allow the user to accept, modify, or dismiss any suggestion before final submission.
6. THE System SHALL allow an Administrator to override the AI_Suggestion_Service-suggested Category or Priority on any Issue; WHEN an Administrator submits an override, THE System SHALL update the Issue with the new value and record an entry in the Audit_Log containing the Issue ID, the original AI-suggested value, the Administrator's replacement value, and the UTC timestamp of the override.
7. THE System SHALL record each AI_Suggestion_Service invocation as an entry in the Audit_Log containing the submission ID, the service response (suggested Category, suggested Priority, candidate count), and the UTC timestamp; this log is accessible only to Administrators.

---

### Requirement 15: Audit Logging

**User Story:** As an administrator, I want a record of key actions taken on the platform, so that I can trace significant events for accountability and debugging.

#### Acceptance Criteria

1. THE Audit_Log SHALL record the following actions: user account creation, deactivation, role change; Issue creation, status transition, assignment change, AI suggestion override, duplicate merge or dismissal; Lost & Found item creation and status transition; Claim creation, approval, and rejection; Comment deletion; and RBAC violation attempts.
2. WHEN an auditable action occurs, THE System SHALL persist an Audit_Log entry containing the acting user's ID, the action type, the entity type and ID, relevant changed values, and a UTC timestamp.
3. THE System SHALL prevent any user, including Administrators, from modifying or deleting Audit_Log entries; IF a modification or deletion of an Audit_Log entry is attempted, THEN THE System SHALL reject the operation with a 403 response.
4. WHEN an Administrator queries the Audit_Log, THE System SHALL support filtering by user, action type, entity type, and date range, and SHALL return results paginated at 50 records per page.
5. IF the applied Audit_Log filters match no entries, THEN THE System SHALL return an empty result set with a message indicating no matching records were found.
6. THE System SHALL retain Audit_Log entries for a minimum of 90 days; entries older than 90 days are eligible for archival or deletion at the operator's discretion.

---

### Requirement 16: Security

**User Story:** As a platform operator, I want robust security controls, so that user data is protected and the platform is resilient to common attack vectors.

#### Acceptance Criteria

1. THE System SHALL enforce HTTPS for all client-server communication; IF a request is received over HTTP, THEN THE System SHALL redirect to the HTTPS equivalent URL with a 301 status code.
2. THE Validator SHALL sanitise all user-supplied text inputs by escaping or stripping HTML special characters and JavaScript event attributes before any input is persisted or rendered, such that no injected script executes in a browser.
3. THE System SHALL use parameterised queries or a MongoDB driver with safe query construction for all database interactions; no string-concatenated query containing user-supplied input SHALL be executed.
4. THE Rate_Limiter SHALL enforce a maximum of 100 API requests per authenticated user per 60-second rolling window; IF a request exceeds this limit, THEN THE Rate_Limiter SHALL reject it with a 429 response and include a Retry-After header indicating the number of seconds until the window resets.
5. THE Rate_Limiter SHALL enforce a maximum of 10 authentication attempts per IP address per 10-minute rolling window; IF the limit is reached, THEN THE Rate_Limiter SHALL block further authentication attempts from that IP for the remainder of the window and respond with a 429 status code.
6. THE System SHALL include a Content-Security-Policy header on every HTTP response for served pages, specifying a default-src directive restricting resource loading to explicitly trusted origins.
7. WHEN a user's account is deleted, THE System SHALL pseudonymise the user's personal data in all associated records within 24 hours, replacing direct identifiers (name, email address, profile details) with a non-reversible pseudonym while retaining non-identifying information required for Audit_Log integrity.

---

### Requirement 17: Non-Functional Requirements

**User Story:** As a platform operator, I want the platform to meet basic performance and reliability standards, so that it remains usable under typical campus load.

#### Acceptance Criteria

1. THE System SHALL return a response to standard API requests (excluding file uploads and report generation) within 2 seconds at typical load, where typical load is defined as up to 50 concurrent authenticated users.
2. THE System SHALL expose a health check endpoint at a documented path that returns an HTTP 200 response and a JSON status payload indicating availability of the database connection and file storage service, with the response delivered within 500 milliseconds.
3. WHEN a database query execution time exceeds 500 milliseconds, THE System SHALL log the query type, collection name, and execution duration in the application performance log.
4. THE System SHALL cache frequently accessed read-only data (Categories, campus location lists) using an in-memory or application-level cache with a TTL of 5 minutes, such that a cache hit returns the cached response without issuing a database query.
5. THE System SHALL render all user-facing pages in conformance with WCAG 2.1 Level AA success criteria, as validated by automated static analysis reporting zero violations of WCAG 2.1 Level AA rules.
6. THE System SHALL ensure all interactive controls are operable via keyboard navigation, where all controls are reachable in a logical tab order, are activatable via the Enter or Space key, and where focus is never permanently trapped outside of an intentional modal context.
7. THE System SHALL ensure all form inputs have programmatically associated labels and that validation error messages are announced to screen reader users via ARIA live regions, where each error message appears within an element carrying aria-live="assertive".
8. THE System SHALL maintain a minimum colour contrast ratio of 4.5:1 between foreground and background colours for normal text and a minimum ratio of 3:1 for large text and graphical UI components.
9. THE System SHALL provide text alternatives (alt attributes) for all non-decorative images, including Attachment thumbnails, where each alt attribute value is non-empty and describes the image content; decorative images SHALL have an empty alt attribute (alt="") and no title attribute.
