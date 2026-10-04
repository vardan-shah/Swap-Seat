import { Reason } from '../types';

export const REASON_MESSAGES: Record<Reason, string> = {
  EXPIRED: 'This opportunity has expired.',
  OWN_OFFER: 'You cannot interact with your own offer.',
  ILLEGAL_TRANSITION: 'Action not permitted in current state.',
  NOT_ACTIVE: 'The opportunity is no longer active.',
  DUPLICATE: 'You have already requested this opportunity.',
  ALREADY_OFFERING: 'You already have an active offer.',
  INVALID_STATIONS: 'Your handoff station must come after your current station in your direction of travel.',
  UNKNOWN_TRAIN: 'The selected train could not be found.',
  TRAIN_NOT_ON_LEG: 'The train does not travel between these stations at this time.',
  TRAIN_NOT_RUNNING: 'The selected train has already passed or is not running.',
  NOT_FOUND: 'The match or opportunity could not be found.',
  NOT_ALLOWED: 'You can\'t do that for this handoff.',
  PRIORITY_SEAT: 'You cannot offer priority seats.',
  INVALID_COACH: 'Invalid coach number.',
};

export function translateReason(reason: Reason): string {
  
  return REASON_MESSAGES[reason];
}
