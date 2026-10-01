import { describe, it, expect } from '@jest/globals';
import { createRoute, RY_MM } from '../route';

describe('route domain', () => {
  describe('createRoute', () => {
    const route = createRoute(['a', 'b', 'd']); // gap: 'c' is missing

    it('has() checks membership', () => {
      expect(route.has('a')).toBe(true);
      expect(route.has('c')).toBe(false);
    });

    it('stationIndex() returns index', () => {
      expect(route.stationIndex('a')).toBe(0);
      expect(route.stationIndex('d')).toBe(2);
      expect(route.stationIndex('c')).toBeNull();
    });

    it('handles gap correctly', () => {
      expect(route.stationIndex('d')! - route.stationIndex('b')!).toBe(1);
    });

    it('inferDirection', () => {
      expect(route.inferDirection('a', 'd')).toBe('Northbound');
      expect(route.inferDirection('d', 'b')).toBe('Southbound');
      expect(route.inferDirection('a', 'a')).toBeNull();
      expect(route.inferDirection('a', 'x')).toBeNull();
    });

    it('isLegValid', () => {
      expect(route.isLegValid('a', 'd', 'Northbound')).toBe(true);
      expect(route.isLegValid('d', 'a', 'Southbound')).toBe(true);
      expect(route.isLegValid('a', 'd', 'Southbound')).toBe(false);
      expect(route.isLegValid('a', 'a', 'Northbound')).toBe(false);
      expect(route.isLegValid('a', 'x', 'Northbound')).toBe(false);
    });
  });

  describe('RY_MM export', () => {
    it('works for apmc to motera', () => {
      expect(RY_MM.isLegValid('apmc', 'motera-stadium', 'Northbound')).toBe(true);
      expect(RY_MM.inferDirection('motera-stadium', 'apmc')).toBe('Southbound');
    });
  });
});
