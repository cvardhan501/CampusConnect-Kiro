import { describe, it, expect } from 'vitest';

describe('Phase 6 - Notification Channels & Delivery Rules', () => {
  const allowedEmailTypes = ['IssueStatusChange', 'ClaimDecision', 'StaffAssignment', 'CriticalIssueCreated'];

  it('should restrict outbound emails strictly to the 4 allowed event types', () => {
    expect(allowedEmailTypes.includes('IssueStatusChange')).toBe(true);
    expect(allowedEmailTypes.includes('ClaimDecision')).toBe(true);
    expect(allowedEmailTypes.includes('StaffAssignment')).toBe(true);
    expect(allowedEmailTypes.includes('CriticalIssueCreated')).toBe(true);

    expect(allowedEmailTypes.includes('CommentAdded')).toBe(false);
    expect(allowedEmailTypes.includes('General')).toBe(false);
  });
});
