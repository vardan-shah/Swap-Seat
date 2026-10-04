import { describe, it, expect } from '@jest/globals';
import { REASON_MESSAGES, translateReason } from '../messages';
import { Reason } from '../../types';

describe('messages', () => {
  it('has a message for every Reason', () => {
    const reasons: Reason[] = [
      'EXPIRED',
      'OWN_OFFER',
      'ILLEGAL_TRANSITION',
      'NOT_ACTIVE',
      'DUPLICATE',
      'ALREADY_OFFERING',
      'INVALID_STATIONS',
      'UNKNOWN_TRAIN',
      'TRAIN_NOT_ON_LEG',
      'TRAIN_NOT_RUNNING',
      'NOT_FOUND',
      'NOT_ALLOWED',
    ];

    reasons.forEach((reason) => {
      expect(REASON_MESSAGES[reason]).toBeDefined();
      expect(typeof REASON_MESSAGES[reason]).toBe('string');
      expect(translateReason(reason)).toBe(REASON_MESSAGES[reason]);
    });
  });
});
