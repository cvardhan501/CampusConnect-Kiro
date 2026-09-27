import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { hasRolePermission } from '../../server/utils/rbac';
import { UserRole } from '../../server/models/User';

// ---------------------------------------------------------------------------
// Canonical State Machine Helper for Property-Based Testing
// ---------------------------------------------------------------------------
const CANONICAL_STATUSES = [
  'Reported',
  'Under_Review',
  'Assigned',
  'In_Progress',
  'Resolved',
  'Verified',
] as const;

type CanonicalStatus = typeof CANONICAL_STATUSES[number];

const ALLOWED_TRANSITIONS: Record<CanonicalStatus, CanonicalStatus[]> = {
  Reported: ['Under_Review'],
  Under_Review: ['Assigned', 'In_Progress'],
  Assigned: ['In_Progress'],
  In_Progress: ['Resolved'],
  Resolved: ['Verified', 'Reported'],
  Verified: [],
};

export function isValidTransition(fromStatus: string, toStatus: string): boolean {
  if (!CANONICAL_STATUSES.includes(fromStatus as CanonicalStatus)) return false;
  if (!CANONICAL_STATUSES.includes(toStatus as CanonicalStatus)) return false;
  const allowed = ALLOWED_TRANSITIONS[fromStatus as CanonicalStatus];
  return allowed ? allowed.includes(toStatus as CanonicalStatus) : false;
}

export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function calculateVerificationWindowExpiry(resolutionDate: Date): Date {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  return new Date(resolutionDate.getTime() + SEVEN_DAYS_MS);
}

// ---------------------------------------------------------------------------
// Property-Based Tests (Lesson 4)
// ---------------------------------------------------------------------------
describe('Lesson 4 — Property-Based Testing (CampusConnect Correctness Invariants)', () => {
  it('Property 1: Issue State Machine — Only canonical allowed transitions succeed', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (fromStatus, toStatus) => {
        const result = isValidTransition(fromStatus, toStatus);
        const isCanonicalFrom = CANONICAL_STATUSES.includes(fromStatus as CanonicalStatus);
        const isCanonicalTo = CANONICAL_STATUSES.includes(toStatus as CanonicalStatus);

        if (!isCanonicalFrom || !isCanonicalTo) {
          expect(result).toBe(false);
        } else {
          const allowedList = ALLOWED_TRANSITIONS[fromStatus as CanonicalStatus] || [];
          const isAllowed = allowedList.includes(toStatus as CanonicalStatus);
          expect(result).toBe(isAllowed);
        }
      }),
      { numRuns: 500 }
    );
  });

  it('Property 2: Terminal Lifecycle Invariant — Verified status permits no outward transitions', () => {
    fc.assert(
      fc.property(fc.string(), (targetStatus) => {
        const canTransition = isValidTransition('Verified', targetStatus);
        expect(canTransition).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it('Property 3: Prohibited Status Invariant — Legacy statuses (Closed, Closed_Duplicate, Open) are rejected', () => {
    const prohibitedStatuses = ['Closed', 'Closed_Duplicate', 'Open', 'ARCHIVED_OLD'];

    fc.assert(
      fc.property(
        fc.constantFrom(...prohibitedStatuses),
        fc.string(),
        (prohibitedStatus, arbitraryTarget) => {
          expect(isValidTransition(prohibitedStatus, arbitraryTarget)).toBe(false);
          expect(isValidTransition(arbitraryTarget, prohibitedStatus)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property 4: RBAC Role Hierarchy — Transitivity & Anti-Symmetry of Role Access', () => {
    const roles: UserRole[] = ['Student', 'Staff', 'Administrator'];

    fc.assert(
      fc.property(
        fc.constantFrom(...roles),
        fc.constantFrom(...roles),
        fc.constantFrom(...roles),
        (roleA, roleB, roleC) => {
          // Transitivity: if A >= B and B >= C, then A >= C
          if (hasRolePermission(roleA, roleB) && hasRolePermission(roleB, roleC)) {
            expect(hasRolePermission(roleA, roleC)).toBe(true);
          }
          // Self-reflexivity: A >= A
          expect(hasRolePermission(roleA, roleA)).toBe(true);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property 5: Verification Window Duration Invariant — Expiry is always exactly 7 days (604,800,000 ms) in the future', () => {
    fc.assert(
      fc.property(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), (resolutionDate) => {
        // Exclude invalid dates if generated
        if (isNaN(resolutionDate.getTime())) return;

        const expiry = calculateVerificationWindowExpiry(resolutionDate);
        const diffMs = expiry.getTime() - resolutionDate.getTime();
        expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
      }),
      { numRuns: 500 }
    );
  });

  it('Property 6: XSS Input Sanitization Invariant — Sanitized string contains no unescaped HTML characters', () => {
    fc.assert(
      fc.property(fc.string(), (rawInput) => {
        const sanitized = sanitizeText(rawInput);
        // Sanitized text must not contain raw '<' or '>' or '"' or "'" or standalone '&' that is not part of entity
        expect(sanitized).not.toMatch(/<|>/);
        if (rawInput.includes('<')) {
          expect(sanitized).toContain('&lt;');
        }
        if (rawInput.includes('>')) {
          expect(sanitized).toContain('&gt;');
        }
      }),
      { numRuns: 500 }
    );
  });
});
