import { describe, it, expect } from '@jest/globals';
import {
  timeAt,
  servesLeg,
  handoffExpiry,
  checkOffer,
  trainsForOffer,
  boardingStillAhead,
} from '../trains';
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

  const ist = (hhmm: string) => new Date(`2026-10-05T${hhmm}:00+05:30`).getTime();

  describe('trainsForOffer', () => {
    it('returns NB-0620-RYMM between sabarmati and motera-stadium at 06:48, but not 06:30 or 06:56', () => {
      const active48 = trainsForOffer(
        'Northbound',
        'sabarmati',
        'motera-stadium',
        ist('06:48'),
        allTrains,
      );
      expect(active48.map((t) => t.id)).toContain('NB-0620-RYMM');

      const active30 = trainsForOffer(
        'Northbound',
        'sabarmati',
        'motera-stadium',
        ist('06:30'),
        allTrains,
      );
      expect(active30.map((t) => t.id)).not.toContain('NB-0620-RYMM');

      const active56 = trainsForOffer(
        'Northbound',
        'sabarmati',
        'motera-stadium',
        ist('06:56'),
        allTrains,
      );
      expect(active56.map((t) => t.id)).not.toContain('NB-0620-RYMM');
    });

    it('returns [] for Northbound gnlu to raysan at 07:36 (only GIFT train is there)', () => {
      const active = trainsForOffer('Northbound', 'gnlu', 'raysan', ist('07:36'), allTrains);
      expect(active).toHaveLength(0);
    });
  });

  describe('boardingStillAhead', () => {
    it('returns true if train has not yet passed the boarding station', () => {
      const train = allTrains.find((t) => t.id === 'NB-0620-RYMM') as unknown as Train;
      expect(boardingStillAhead(train, 'vadaj', ist('06:40'))).toBe(true);
      expect(boardingStillAhead(train, 'vadaj', ist('06:43'))).toBe(true);
      expect(boardingStillAhead(train, 'vadaj', ist('07:00'))).toBe(false);
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

describe('getTrainLabel', () => {
  it('builds label from first stop station name', () => {
    const { getTrainLabel } = require('../trains');
    const dummyTrains = [
      { id: 't1', direction: 'Southbound', pattern: 'RYV-GIFT', times: { 'gift-city': '07:48' } },
    ];
    // gift-city name is GIFT City
    expect(getTrainLabel('t1', dummyTrains)).toBe('Train starting from GIFT City at 07:48');
  });
});
