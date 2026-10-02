import { describe, it, expect } from '@jest/globals';
import gmrcData from '../gmrc-network.json';
import { STATIONS } from '../stations';

describe('GMRC Network Data Integrity', () => {
  it('has valid statuses and no duplicate IDs in stations', () => {
    const ids = new Set<string>();
    const validStatuses = ['operational', 'under_construction', 'planned'];
    for (const station of gmrcData.stations) {
      expect(ids.has(station.id)).toBe(false); // No duplicates
      ids.add(station.id);
      expect(validStatuses).toContain(station.status);
    }
  });

  it('ensures every stop in every service pattern exists in stations', () => {
    const stationIds = new Set(gmrcData.stations.map((s) => s.id));
    for (const pattern of gmrcData.service_patterns) {
      for (const stopId of pattern.stops) {
        expect(stationIds.has(stopId)).toBe(true);
      }
    }
  });

  it('STATIONS equals RY-MM stops filtered by status', () => {
    const ryPattern = gmrcData.service_patterns.find((p) => p.id === 'RY-MM')!;
    const ryStops = ryPattern.stops;

    // Find stations that are operational
    const expectedOperationalIds = ryStops.filter((id) => {
      const s = gmrcData.stations.find((st) => st.id === id);
      return s && s.status === 'operational';
    });

    const actualIds = STATIONS.map((s) => s.id);
    expect(actualIds).toEqual(expectedOperationalIds);
    expect(actualIds).not.toContain('sabarmati-railway-station');
  });
});
