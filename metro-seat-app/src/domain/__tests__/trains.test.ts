import { describe, it, expect } from '@jest/globals';
import { timeAt, servesLeg, isRunning } from '../trains';

const DUMMY_TRAIN = {
  id: 'NB-0620-RYMM',
  direction: 'Northbound',
  pattern: 'RY-MM',
  times: {
    'apmc': '06:20',
    'old-high-court': '06:34',
    'mahatma-mandir': '07:38'
  }
};

describe('trains domain', () => {
  describe('timeAt', () => {
    it('returns exact time for a timing point, with ±2m grace', () => {
      // apmc is exactly 06:20 (380m). So min=378, max=382
      expect(timeAt(DUMMY_TRAIN, 'apmc')).toEqual({ min: 378, max: 382 });
    });

    it('returns null if station not in pattern', () => {
      expect(timeAt(DUMMY_TRAIN, 'unknown-station')).toBeNull();
    });

    it('interpolates linearly between timing points', () => {
      // 06:20 -> 06:34 is 14 minutes.
      // apmc index: 0
      // old-high-court index: 6
      // 14 mins / 6 stops = 2.33 mins per stop.
      // min: 380 - 2 = 378, max: 383 + 2 = 385.
      
      const res = timeAt(DUMMY_TRAIN, 'jivraj-park');
      expect(res).toEqual({ min: 380, max: 385 });
    });
  });

  describe('servesLeg', () => {
    it('returns true if train visits A then B', () => {
      expect(servesLeg(DUMMY_TRAIN, 'apmc', 'old-high-court')).toBe(true);
      expect(servesLeg(DUMMY_TRAIN, 'apmc', 'paldi')).toBe(true); // interpolated
    });
    it('returns false if B before A', () => {
      expect(servesLeg(DUMMY_TRAIN, 'old-high-court', 'apmc')).toBe(false);
    });
  });

  describe('isRunning', () => {
    it('returns true if now is within first time - 2m and last time + 2m', () => {
      // 06:20 (380) to 06:34 (394)
      expect(isRunning(DUMMY_TRAIN, (380 - 1) * 60000 - 330 * 60000)).toBe(true);
      expect(isRunning(DUMMY_TRAIN, (394 + 1) * 60000 - 330 * 60000)).toBe(true);
      expect(isRunning(DUMMY_TRAIN, (380 - 5) * 60000 - 330 * 60000)).toBe(false);
    });
  });
});
