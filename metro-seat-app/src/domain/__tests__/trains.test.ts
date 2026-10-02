import { describe, it, expect } from '@jest/globals';
import { timeAt, servesLeg, isRunning, handoffExpiry, trainsRunningNow, checkOffer } from '../trains';
import trains from '../../data/trains.json';
import { Train } from '../trains';

describe('trains domain', () => {
  const allTrains = trains as unknown as Train[];
  const at = (istMin: number) => (istMin - 330) * 60000;

  describe('timeAt', () => {
    it('handles Southbound reversal and interpolation', () => {
      const sb = allTrains.find(t => t.id === 'SB-0640-RYMM')!;
      expect(timeAt(sb, 'sachivalaya')).toEqual({ min: 409, max: 413 }); // 06:51 ±2
      expect(timeAt(sb, 'sector-24')).toEqual({ min: 400, max: 405 });   // 400 + 11/5 = 402.2
    });

    it('returns null if station not in pattern', () => {
      const gift = allTrains.find(t => t.id === 'NB-0645-RYVGIFT')!;
      expect(timeAt(gift, 'raysan')).toBeNull();
    });
  });

  describe('servesLeg', () => {
    it('returns true if train visits A then B', () => {
      const sb = allTrains.find(t => t.id === 'SB-0640-RYMM')!;
      expect(servesLeg(sb, 'gnlu', 'apmc')).toBe(true);
      expect(servesLeg(sb, 'apmc', 'gnlu')).toBe(false);
      
      const gift = allTrains.find(t => t.id === 'NB-0645-RYVGIFT')!;
      expect(servesLeg(gift, 'koba-gam', 'mahatma-mandir')).toBe(false);
    });
  });

  describe('isRunning', () => {
    it('returns true if now is within first time - 2m and last time + 2m', () => {
      const nb = allTrains.find(t => t.id === 'NB-0620-RYMM')!; // last time 07:38 = 458
      expect(isRunning(nb, at(460))).toBe(true);
      expect(isRunning(nb, at(461))).toBe(false);
    });
  });

  describe('handoffExpiry', () => {
    it('returns expected UTC timestamp', () => {
      const nb = allTrains.find(t => t.id === 'NB-0620-RYMM')!;
      // old-high-court 06:34 = 394 + 2 = 396 max.
      const nowMs = at(390); // arbitrary time on the day
      const expiry = handoffExpiry(nb, 'old-high-court', nowMs);
      expect(expiry).toBe(at(396));
    });
    it('returns null for unknown station', () => {
      const nb = allTrains.find(t => t.id === 'NB-0620-RYMM')!;
      expect(handoffExpiry(nb, 'unknown-station', at(390))).toBeNull();
    });
  });

  
  describe('checkOffer', () => {
    it('returns ok and expiry for a valid train that serves the leg and is running', () => {
      // NB-0620-RYMM reaches old-high-court (handoff) at 06:34 (394)
      const nowMs = at(380); // 06:20 IST
      const res = checkOffer('NB-0620-RYMM', 'Northbound', 'apmc', 'old-high-court', nowMs, allTrains);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.expiresAt).toBe(at(396)); // 394 + 2 grace
      }
    });

    it('returns UNKNOWN_TRAIN for a train that does not exist', () => {
      const res = checkOffer('NB-UNKNOWN', 'Northbound', 'apmc', 'old-high-court', at(380), allTrains);
      expect(res).toEqual({ ok: false, reason: 'UNKNOWN_TRAIN' });
    });

    it('returns TRAIN_NOT_ON_LEG if a GIFT train is offered for a mahatma-mandir leg', () => {
      const res = checkOffer('NB-0645-RYVGIFT', 'Northbound', 'apmc', 'mahatma-mandir', at(380), allTrains);
      expect(res).toEqual({ ok: false, reason: 'TRAIN_NOT_ON_LEG' });
    });

    it('returns TRAIN_NOT_RUNNING if the train has already passed the handoff station hours ago', () => {
      const nowMs = at(500); // 08:20 IST, long after 06:34
      const res = checkOffer('NB-0620-RYMM', 'Northbound', 'apmc', 'old-high-court', nowMs, allTrains);
      expect(res).toEqual({ ok: false, reason: 'TRAIN_NOT_RUNNING' });
    });
  });

  describe('trainsRunningNow', () => {
    it('returns correctly filtered list of trains', () => {
      const active = trainsRunningNow('Northbound', 'apmc', 'motera-stadium', at(380), allTrains); // 06:20
      expect(active.length).toBeGreaterThan(0);
      expect(active.some(t => t.id === 'NB-0620-RYMM')).toBe(true);
      
      const missed = trainsRunningNow('Northbound', 'apmc', 'motera-stadium', at(383), allTrains); // 06:23, already passed APMC (max 382)
      expect(missed.some(t => t.id === 'NB-0620-RYMM')).toBe(false);
    });
  });
});
