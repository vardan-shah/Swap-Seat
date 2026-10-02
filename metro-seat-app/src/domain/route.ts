import { Direction } from '../types';
import { STATIONS } from '../data/stations';

export function createRoute(stopIds: readonly string[]) {
  const idx = (id: string) => {
    const i = stopIds.indexOf(id);
    return i < 0 ? null : i;
  };
  return {
    has: (id: string) => idx(id) !== null,
    isLegValid(from: string, to: string, dir: Direction) {
      const f = idx(from),
        t = idx(to);
      if (f === null || t === null || f === t) return false;
      return (dir === 'Northbound') === f < t;
    },
    inferDirection(from: string, to: string): Direction | null {
      const f = idx(from),
        t = idx(to);
      if (f === null || t === null || f === t) return null;
      return f < t ? 'Northbound' : 'Southbound';
    },
    stationIndex(id: string): number | null {
      return idx(id);
    },
  };
}

export const RY_MM = createRoute(STATIONS.map((s) => s.id));

export const isLegValid = RY_MM.isLegValid;
export const inferDirection = RY_MM.inferDirection;
export const stationIndex = (id: string) => {
  const i = RY_MM.stationIndex(id);
  if (i === null) throw new Error(`Unknown station: ${id}`);
  return i;
};
