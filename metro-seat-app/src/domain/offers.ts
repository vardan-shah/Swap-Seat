import { SeatOpportunity, Match } from '../types';

export type ReconcileResult = {
  opportunities: SeatOpportunity[];
  matches: Match[];
};

export function reconcile(
  opportunities: SeatOpportunity[],
  matches: Match[],
  nowMs: number,
): ReconcileResult {
  let updatedOpportunities = [...opportunities];
  let updatedMatches = [...matches];
  let changed = false;

  for (let i = 0; i < updatedOpportunities.length; i++) {
    const opp = updatedOpportunities[i];

    // ACTIVE offers past expiresAt become EXPIRED
    if (opp.status === 'ACTIVE' && nowMs > opp.expiresAt) {
      updatedOpportunities[i] = { ...opp, status: 'EXPIRED', updatedAt: nowMs };
      changed = true;

      // Their PENDING matches become CANCELLED by 'system'
      updatedMatches = updatedMatches.map((m) =>
        m.opportunityId === opp.id && m.status === 'PENDING'
          ? { ...m, status: 'CANCELLED', cancelledBy: 'system' }
          : m,
      );
    }

    // MATCHED offers unconfirmed 10 min past expiresAt become EXPIRED
    if (opp.status === 'MATCHED' && nowMs > opp.expiresAt + 10 * 60000) {
      // Is there an ACCEPTED match for this offer?
      const acceptedMatch = updatedMatches.find(
        (m) => m.opportunityId === opp.id && m.status === 'ACCEPTED',
      );
      if (acceptedMatch) {
        updatedOpportunities[i] = { ...opp, status: 'EXPIRED', updatedAt: nowMs };
        changed = true;

        updatedMatches = updatedMatches.map((m) =>
          m.id === acceptedMatch.id ? { ...m, status: 'CANCELLED', cancelledBy: 'system' } : m,
        );
      }
    }
  }

  return changed
    ? { opportunities: updatedOpportunities, matches: updatedMatches }
    : { opportunities, matches };
}
