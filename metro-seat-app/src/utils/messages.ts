import { Reason } from '../types';

export const REASON_MESSAGES: Record<Reason, string> = {
  EXPIRED: 'This opportunity has expired.',
  OWN_OFFER: 'You cannot interact with your own offer.',
  ILLEGAL_TRANSITION: 'Action not permitted in current state.',
  NOT_ACTIVE: 'The opportunity is no longer active.',
  DUPLICATE: 'You have already requested this opportunity.',
  ALREADY_OFFERING: 'You already have an active offer.',
  INVALID_STATIONS:
    'Handoff station must be strictly between your boarding and destination stations.',
  UNKNOWN_TRAIN: 'The selected train could not be found.',
  TRAIN_NOT_ON_LEG: 'The train does not travel between these stations at this time.',
  TRAIN_NOT_RUNNING: 'The selected train has already passed or is not running.',
  NOT_FOUND: 'The match or opportunity could not be found.',
  NOT_ALLOWED: 'Only the seat holder can perform this action.',
};

export function translateReason(reason?: string): string {
  if (!reason) return 'An unknown error occurred.';
  return REASON_MESSAGES[reason as Reason] || reason;
}
