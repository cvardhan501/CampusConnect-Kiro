import { connectToDatabase } from '../db/connection';
import { Claim, IClaim } from '../models/Claim';
import { LostFoundItem } from '../models/LostFound';
import { NotificationService } from './notification.service';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';

export class ClaimService {
  static async submitClaim(foundItemId: string, claimantId: string, ownershipEvidence: string): Promise<IClaim> {
    await connectToDatabase();

    const item = await LostFoundItem.findById(foundItemId);
    if (!item || item.type !== 'Found') {
      throw new Error('Claims can only be submitted against valid Found items');
    }

    if (item.status === 'Claimed' || item.status === 'Archived') {
      throw new Error('This item is no longer available for claims');
    }

    // Single active claim per user per item
    const existingActiveClaim = await Claim.findOne({
      foundItemId,
      claimantId,
      status: { $in: ['Pending', 'Approved'] },
    });

    if (existingActiveClaim) {
      throw new Error('You already have an active claim on this item');
    }

    const claim = await Claim.create({
      foundItemId,
      claimantId,
      ownershipEvidence: ownershipEvidence.trim(),
      status: 'Pending',
    });

    // Audit Log
    await AuditLog.create({
      actingUserId: claimantId,
      actionType: 'CLAIM_SUBMITTED',
      entityType: 'Claim',
      entityId: claim._id,
      details: { foundItemId },
      timestamp: new Date(),
    });

    // Notify Poster
    void NotificationService.create({
      userId: item.reportedBy.toString(),
      type: 'General',
      title: 'New Ownership Claim Submitted',
      message: `Someone has submitted a claim for your found item "${item.title}".`,
      link: `/lost-found/${item._id}`,
    });

    return claim;
  }

  static async approveClaim(claimId: string, actingUserId: string, actingUserRole?: string): Promise<IClaim> {
    await connectToDatabase();

    const claim = await Claim.findById(claimId).populate('foundItemId');
    if (!claim) throw new Error('Claim not found');

    const item = claim.foundItemId as any;
    const posterId = item.reportedBy.toString();
    const isPoster = posterId === actingUserId;
    const isStaffOrAdmin = actingUserRole === 'Staff' || actingUserRole === 'Administrator';

    if (!isPoster && !isStaffOrAdmin) {
      const err = new Error('Only the item poster, Staff, or Administrator can approve claims');
      (err as any).statusCode = 403;
      throw err;
    }

    claim.status = 'Approved';
    await claim.save();

    item.status = 'Claimed';
    await item.save();

    // Audit Log (previously missing — Req 15.1)
    await AuditLog.create({
      actingUserId,
      actionType: 'CLAIM_APPROVED',
      entityType: 'Claim',
      entityId: claim._id,
      details: { foundItemId: item._id, claimantId: claim.claimantId },
      timestamp: new Date(),
    });

    // Find and archive other pending claims — notify each one (Req 6.8)
    const otherPendingClaims = await Claim.find({
      foundItemId: item._id,
      _id: { $ne: claim._id },
      status: 'Pending',
    });

    await Claim.updateMany(
      { foundItemId: item._id, _id: { $ne: claim._id }, status: 'Pending' },
      { status: 'Archived' }
    );

    for (const other of otherPendingClaims) {
      void NotificationService.create({
        userId: other.claimantId.toString(),
        type: 'ClaimDecision',
        title: 'Item Claimed by Another',
        message: `The item "${item.title}" has been claimed by another person. Your claim has been closed.`,
        link: `/lost-found/${item._id}`,
        sendEmail: true,
      });
    }

    const poster = await User.findById(actingUserId);

    // Notify winning claimant with contact details
    void NotificationService.create({
      userId: claim.claimantId.toString(),
      type: 'ClaimDecision',
      title: 'Claim Approved! Contact Item Poster',
      message: `Your claim for "${item.title}" was approved! Contact ${poster?.displayName || 'the poster'} at ${poster?.email || ''} to coordinate pickup.`,
      link: `/lost-found/${item._id}`,
      sendEmail: true,
    });

    return claim;
  }

  static async rejectClaim(
    claimId: string,
    actingUserId: string,
    rejectionReason: string,
    actingUserRole?: string
  ): Promise<IClaim> {
    await connectToDatabase();

    const claim = await Claim.findById(claimId).populate('foundItemId');
    if (!claim) throw new Error('Claim not found');

    const item = claim.foundItemId as any;
    const posterId = item.reportedBy.toString();
    const isPoster = posterId === actingUserId;
    const isStaffOrAdmin = actingUserRole === 'Staff' || actingUserRole === 'Administrator';

    if (!isPoster && !isStaffOrAdmin) {
      const err = new Error('Only the item poster, Staff, or Administrator can reject claims');
      (err as any).statusCode = 403;
      throw err;
    }

    claim.status = 'Rejected';
    claim.rejectionReason = rejectionReason.slice(0, 500);
    await claim.save();

    // Audit Log (previously missing — Req 15.1)
    await AuditLog.create({
      actingUserId,
      actionType: 'CLAIM_REJECTED',
      entityType: 'Claim',
      entityId: claim._id,
      details: {
        foundItemId: item._id,
        claimantId: claim.claimantId,
        rejectionReason: claim.rejectionReason,
      },
      timestamp: new Date(),
    });

    // Notify Claimant
    void NotificationService.create({
      userId: claim.claimantId.toString(),
      type: 'ClaimDecision',
      title: 'Claim Update: Rejected',
      message: `Your claim for "${item.title}" was not approved. Reason: ${rejectionReason}`,
      link: `/lost-found/${item._id}`,
      sendEmail: true,
    });

    return claim;
  }
}
