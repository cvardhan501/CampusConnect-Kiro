# CampusConnect Feature Development Workflow

This reference document defines the standard 9-phase workflow for developing, modifying, and testing features in CampusConnect.

---

## 9-Phase Development Sequence

```
1. Spec Review ──► 2. Steering Check ──► 3. Code Inspection ──► 4. Implementation
                                                                      │
8. Report Diff ◄── 7. Build Verification ◄── 6. Typecheck & Tests ◄───┘
                                                    │
                                                    ▼
                                            9. QA Agent Audit
```

### Phase 1: Specification Review
- **Action**: Inspect relevant requirements in [`.kiro/specs/campus-connect/requirements.md`](file:///.kiro/specs/campus-connect/requirements.md) and design rules in [`design.md`](file:///.kiro/specs/campus-connect/design.md).
- **Goal**: Align exact feature scope, authorization constraints, and data attributes with the canonical specification.

### Phase 2: Steering Rules Check
- **Action**: Consult operational guidelines in [`.kiro/steering/`](file:///.kiro/steering/):
  - [`product.md`](file:///.kiro/steering/product.md) for domain rules and SLA constraints.
  - [`tech.md`](file:///.kiro/steering/tech.md) for tech stack and environment conventions.
  - [`structure.md`](file:///.kiro/steering/structure.md) for code placement.
  - [`conventions.md`](file:///.kiro/steering/conventions.md) for naming and coding rules.
  - [`security.md`](file:///.kiro/steering/security.md) for RBAC and credential safeguards.

### Phase 3: Existing Code Inspection
- **Action**: Use `view_file` or `grep_search` to inspect pre-existing Mongoose models ([`server/models/`](file:///server/models/)), business services ([`server/services/`](file:///server/services/)), and UI components ([`components/`](file:///components/)).
- **Goal**: Reuse existing abstractions rather than re-inventing redundant helpers.

### Phase 4: Implementation
- **Action**: Implement changes adhering to strict TypeScript typing, server-side RBAC, and clean layer separation.
- **Rule**: Keep backend logic server-side. Never expose raw database operations or sensitive credential fields in client components.

### Phase 5: Test Coverage Update
- **Action**: Add or update automated unit/integration tests in [`tests/unit/`](file:///tests/unit/) or [`tests/integration/`](file:///tests/integration/) for any non-trivial business logic or state transition changes.

### Phase 6: Type-Check & Unit Tests Execution
- **Action**: Run verification commands:
  ```bash
  npm run type-check
  npm test
  ```
- **Rule**: All typecheck errors and test failures must be resolved prior to concluding.

### Phase 7: Build Verification
- **Action**: Run Next.js production build verification:
  ```bash
  npm run build
  ```
- **Goal**: Confirm static page generation, SSR route compilation, and client bundle optimization pass without errors.

### Phase 8: Git Diff & Cleanliness Review
- **Action**: Run `git status` and `git diff` to inspect all modifications.
- **Rule**: Verify no temporary secrets, `.env.local` changes, or extraneous files are staged.

### Phase 9: Optional QA Agent Verification
- **Action**: Invoke the [`campusconnect-qa`](file:///.agents/skills/campusconnect-qa/SKILL.md) skill to perform an automated read-only audit against canonical specifications.
