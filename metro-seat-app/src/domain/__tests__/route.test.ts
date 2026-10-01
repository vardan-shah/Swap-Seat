import { describe, it, expect } from '@jest/globals';
import { stationIndex, inferDirection, isLegValid } from '../route';

describe('route domain', () => {
  describe('stationIndex', () => {
    it('returns the index for a known operational station', () => {
      expect(stationIndex('apmc')).toBe(0);
      expect(stationIndex('mahatma-mandir')).toBeGreaterThan(0);
    });

    it('throws on unknown station id', () => {
      expect(() => stationIndex('unknown-station')).toThrow('Unknown station: unknown-station');
    });

    it('handles the gap where an under-construction station was removed', () => {
      // 'sabarmati' and 'motera-stadium' should be sequential despite 'sabarmati-river' being skipped
      const sIdx = stationIndex('sabarmati');
      const mIdx = stationIndex('motera-stadium');
      expect(mIdx - sIdx).toBe(1);
    });
  });

  describe('inferDirection', () => {
    it('infers Northbound when going from lower to higher index', () => {
      expect(inferDirection('apmc', 'motera-stadium')).toBe('Northbound');
    });

    it('infers Southbound when going from higher to lower index', () => {
      expect(inferDirection('motera-stadium', 'apmc')).toBe('Southbound');
    });

    it('returns null when from and to are the same', () => {
      expect(inferDirection('apmc', 'apmc')).toBeNull();
    });
    
    it('throws on unknown stations', () => {
      expect(() => inferDirection('apmc', 'unknown')).toThrow();
    });
  });

  describe('isLegValid', () => {
    it('returns true for strictly forward legs', () => {
      expect(isLegValid('apmc', 'motera-stadium', 'Northbound')).toBe(true);
      expect(isLegValid('motera-stadium', 'apmc', 'Southbound')).toBe(true);
    });

    it('returns false for backwards legs', () => {
      expect(isLegValid('motera-stadium', 'apmc', 'Northbound')).toBe(false);
      expect(isLegValid('apmc', 'motera-stadium', 'Southbound')).toBe(false);
    });

    it('returns false for same station', () => {
      expect(isLegValid('apmc', 'apmc', 'Northbound')).toBe(false);
      expect(isLegValid('apmc', 'apmc', 'Southbound')).toBe(false);
    });
  });
});
