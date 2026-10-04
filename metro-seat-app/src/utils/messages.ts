export function translateReason(reason?: string): string {
  switch (reason) {
    case 'EXPIRED':
      return 'This opportunity has expired.';
    case 'OWN_OFFER':
      return 'You cannot interact with your own offer.';
    case 'NOT_PARTICIPANT':
      return 'You are not part of this handoff.';
    case 'ILLEGAL_TRANSITION':
      return 'Action not permitted in current state.';
    case 'NOT_ACTIVE':
      return 'The opportunity is no longer active.';
    case 'DUPLICATE':
      return 'You have already requested this opportunity.';
    case 'ALREADY_OFFERING':
      return 'You already have an active offer.';
    case 'INVALID_STATIONS':
      return 'The selected stations are invalid.';
    case 'UNKNOWN_TRAIN':
      return 'The selected train could not be found.';
    case 'TRAIN_NOT_ON_LEG':
      return 'The train does not travel between these stations at this time.';
    default:
      return reason || 'An unknown error occurred.';
  }
}
