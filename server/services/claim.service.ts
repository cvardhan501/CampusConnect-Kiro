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

  static async approveClaim(claimId: string, actingUserId: string): Promise<IClaim> {
    await connectToDatabase();

    const claim = await Claim.findById(claimId).populate('foundItemId');
    if (!claim) throw new Error('Claim not found');

    const item = claim.foundItemId as any;
    if (item.reportedBy.toString() !== actingUserId) {
      throw new Error('Only the item poster can approve claims for this item');
    }

    claim.status = 'Approved';
    await claim.save();

    item.status = 'Claimed';
    await item.save();

    // Auto-archive all other pending claims for this item
    await Claim.updateMany(
      { foundItemId: item._id, _id: { $ne: claim._id }, status: 'Pending' },
      { status: 'Archived' }
    );

    const poster = await User.findById(actingUserId);

    // Notify Claimant with contact details
    void NotificationService.create({
      userId: claim.claimantId.toString(),
      type: 'ClaimDecision',
      title: 'Claim Approved! Contact Item Poster',
      message: `Your claim for "${item.title}" was approved! Contact ${poster?.displayName || 'Poster'} at ${poster?.email} / ${poster?.phoneNumber || 'Campus Center'} to coordinate pickup.`,
      link: `/lost-found/${item._id}`,
      sendEmail: true,
    });

    return claim;
  }

  static async rejectClaim(claimId: string, actingUserId: string, rejectionReason: string): Promise<IClaim> {
    await connectToDatabase();

    const claim = await Claim.findById(claimId).populate('foundItemId');
    if (!claim) throw new Error('Claim not found');

    const item = claim.foundItemId as any;
    if (item.reportedBy.toString() !== actingUserId) {
      throw new Error('Only the item poster can reject claims for this item');
    }

    claim.status = 'Rejected';
    claim.rejectionReason = rejectionReason.slice(0, 500);
    await claim.save();

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
