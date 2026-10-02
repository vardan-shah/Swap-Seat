import { describe, it, expect } from '@jest/globals';
import { timeAt, servesLeg, isRunning, handoffExpiry, checkOffer } from '../trains';
import trains from '../../data/trains.json';
import { Train } from '../trains';

describe('trains domain', () => {
  const allTrains = trains as unknown as Train[];
  const at = (istMin: number) => (istMin - 330) * 60000;

  describe('timeAt', () => {
    it('handles Southbound reversal and interpolation', () => {
      const sb = allTrains.find((t) => t.id === 'SB-0640-RYMM')!;
      expect(timeAt(sb, 'sachivalaya')).toEqual({ min: 409, max: 413 }); // 06:51 ±2
      expect(timeAt(sb, 'sector-24')).toEqual({ min: 400, max: 405 }); // 400 + 11/5 = 402.2
    });

    it('returns null if station not in pattern', () => {
      const gift = allTrains.find((t) => t.id === 'NB-0645-RYVGIFT')!;
      expect(timeAt(gift, 'raysan')).toBeNull();
    });
  });

  describe('servesLeg', () => {
    it('returns true if train visits A then B', () => {
      const sb = allTrains.find((t) => t.id === 'SB-0640-RYMM')!;
      expect(servesLeg(sb, 'gnlu', 'apmc')).toBe(true);
      expect(servesLeg(sb, 'apmc', 'gnlu')).toBe(false);

      const gift = allTrains.find((t) => t.id === 'NB-0645-RYVGIFT')!;
      expect(servesLeg(gift, 'koba-gam', 'mahatma-mandir')).toBe(false);
    });
  });

  describe('isRunning', () => {
    it('returns true if now is within first time - 2m and last time + 2m', () => {
      const nb = allTrains.find((t) => t.id === 'NB-0620-RYMM')!; // last time 07:38 = 458
      expect(isRunning(nb, at(460))).toBe(true);
      expect(isRunning(nb, at(461))).toBe(false);
    });
  });

  describe('handoffExpiry', () => {
    it('returns expected UTC timestamp', () => {
      const nb = allTrains.find((t) => t.id === 'NB-0620-RYMM')!;
      // old-high-court 06:34 = 394 + 2 = 396 max.
      const nowMs = at(390); // arbitrary time on the day
      const expiry = handoffExpiry(nb, 'old-high-court', nowMs);
      expect(expiry).toBe(at(396));
    });
    it('returns null for unknown station', () => {
      const nb = allTrains.find((t) => t.id === 'NB-0620-RYMM')!;
      expect(handoffExpiry(nb, 'unknown-station', at(390))).toBeNull();
    });
  });

  describe('checkOffer', () => {
    const ist = (hhmm: string) => new Date(`2026-10-05T${hhmm}:00+05:30`).getTime();

    it('NB-0620-RYMM: ok at 06:48, expires 06:54', () => {
      const res = checkOffer(
        'NB-0620-RYMM',
        'Northbound',
        'sabarmati',
        'motera-stadium',
        ist('06:48'),
        allTrains,
      );
      expect(res).toEqual({ ok: true, expiresAt: ist('06:54') });
    });

    it('NB-0620-RYMM: not running at 06:30 or 06:56', () => {
      expect(
        checkOffer(
          'NB-0620-RYMM',
          'Northbound',
          'sabarmati',
          'motera-stadium',
          ist('06:30'),
          allTrains,
        ),
      ).toEqual({ ok: false, reason: 'TRAIN_NOT_RUNNING' });
      expect(
        checkOffer(
          'NB-0620-RYMM',
          'Northbound',
          'sabarmati',
          'motera-stadium',
          ist('06:56'),
          allTrains,
        ),
      ).toEqual({ ok: false, reason: 'TRAIN_NOT_RUNNING' });
    });

    it('SB-0640-RYMM: ok at 07:30, not running at 06:40', () => {
      expect(
        checkOffer(
          'SB-0640-RYMM',
          'Southbound',
          'motera-stadium',
          'sabarmati',
          ist('07:30'),
          allTrains,
        ),
      ).toEqual({ ok: true, expiresAt: ist('07:33') });
      expect(
        checkOffer(
          'SB-0640-RYMM',
          'Southbound',
          'motera-stadium',
          'sabarmati',
          ist('06:40'),
          allTrains,
        ),
      ).toEqual({ ok: false, reason: 'TRAIN_NOT_RUNNING' });
    });

    it('GIFT train with handoff raysan -> TRAIN_NOT_ON_LEG', () => {
      expect(
        checkOffer('NB-0645-RYVGIFT', 'Northbound', 'gnlu', 'raysan', ist('07:30'), allTrains),
      ).toEqual({ ok: false, reason: 'TRAIN_NOT_ON_LEG' });
    });

    it('Wrong direction -> TRAIN_NOT_ON_LEG, not UNKNOWN_TRAIN', () => {
      expect(
        checkOffer(
          'NB-0620-RYMM',
          'Southbound',
          'motera-stadium',
          'sabarmati',
          ist('07:00'),
          allTrains,
        ),
      ).toEqual({ ok: false, reason: 'TRAIN_NOT_ON_LEG' });
    });

    it('Unknown id -> UNKNOWN_TRAIN', () => {
      expect(checkOffer('UNKNOWN', 'Northbound', 'apmc', 'vadaj', ist('06:20'), allTrains)).toEqual(
        { ok: false, reason: 'UNKNOWN_TRAIN' },
      );
    });
  });
});
