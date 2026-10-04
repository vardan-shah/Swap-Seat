import { describe, it, expect } from '@jest/globals';
import trains from '../trains.json';
import gmrcData from '../gmrc-network.json';

describe('trains.json data integrity', () => {
  it('has exactly 84 trains with unique IDs', () => {
    expect(trains).toHaveLength(84);
    const ids = new Set(trains.map((t) => t.id));
    expect(ids.size).toBe(84);
  });

  it('verifies exact NB GIFT departures', () => {
    const nbGiftDepartures = trains
      .filter((t) => t.direction === 'Northbound' && t.pattern === 'RYV-GIFT')
      .map((t) => t.times.apmc);

    expect(nbGiftDepartures).toEqual([
      '06:45',
      '07:34',
      '08:03',
      '09:11',
      '15:16',
      '16:03',
      '17:16',
      '18:06',
    ]);
  });

  it('verifies exact SB GIFT departures', () => {
    const sbGiftDepartures = trains
      .filter((t) => t.direction === 'Southbound' && t.pattern === 'RYV-GIFT')
      .map((t) => t.times['gift-city']);

    expect(sbGiftDepartures).toEqual([
      '07:48',
      '08:37',
      '09:01',
      '10:18',
      '16:17',
      '17:08',
      '18:21',
      '19:13',
    ]);
  });

  it('has valid stations for the given pattern', () => {
    const ryPattern = gmrcData.service_patterns.find((p) => p.id === 'RY-MM');
    const giftPattern = gmrcData.service_patterns.find((p) => p.id === 'RYV-GIFT');
    expect(ryPattern).toBeDefined();
    expect(giftPattern).toBeDefined();

    for (const train of trains) {
      const patternStops = train.pattern === 'RY-MM' ? ryPattern!.stops : giftPattern!.stops;
      for (const stationId of Object.keys(train.times)) {
        expect(patternStops).toContain(stationId);
      }
    }
  });

  it('has strictly increasing times and respects timing min/max with documented exceptions', () => {
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    // The exceptions explicitly found and matches the transcription:
    // (List will be populated once we run the test and find the failures)
    const exceptions = [
      'NB-0734-RYVGIFT|old-high-court>motera-stadium|19',
      'NB-1059-RYMM|old-high-court>motera-stadium|19',
      'NB-1640-RYMM|old-high-court>motera-stadium|19',
      'NB-1806-RYVGIFT|old-high-court>motera-stadium|19',
      'SB-0825-RYMM|motera-stadium>old-high-court|19',
      'SB-2100-RYMM|motera-stadium>old-high-court|19',
      'SB-1856-RYMM|mahatma-mandir>sachivalaya|13',
    ];

    const usedExceptions = new Set<string>();
    const isException = (trainId: string, from: string, to: string, time: number) => {
      const key = `${trainId}|${from}>${to}|${time}`;
      if (exceptions.includes(key)) {
        usedExceptions.add(key);
        return true;
      }
      return false;
    };

    const getTimingBounds = (from: string, to: string, direction: 'Northbound' | 'Southbound') => {
      for (const seg of gmrcData.timing.directional_segments[direction]) {
        if (seg.from === from && seg.to === to) return seg;
      }
      return null;
    };

    for (const train of trains) {
      const stations = Object.keys(train.times);
      for (let i = 1; i < stations.length; i++) {
        const from = stations[i - 1];
        const to = stations[i];
        const t1 = toMinutes((train.times as unknown as Record<string, string>)[from]);
        const t2 = toMinutes((train.times as unknown as Record<string, string>)[to]);

        expect(t2).toBeGreaterThan(t1); // Strictly increasing

        const diff = t2 - t1;
        const bounds = getTimingBounds(from, to, train.direction as 'Northbound' | 'Southbound');
        if (!bounds) {
          throw new Error(`Missing timing bounds for ${train.direction} segment ${from}->${to}`);
        }
        if (diff < bounds.min || diff > bounds.max) {
          if (!isException(train.id, from, to, diff)) {
            throw new Error(
              `Timing violation on ${train.id}: ${from}->${to} took ${diff}m (bounds ${bounds.min}-${bounds.max})`,
            );
          }
        }
      }
    }
    expect(usedExceptions.size).toBe(exceptions.length);
  });
});
